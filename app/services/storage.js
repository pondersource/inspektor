import EmberObject from '@ember/object';
import Service from '@ember/service';
import { computed, observer } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { later } from '@ember/runloop';
import { Promise } from 'rsvp';
import RemoteStorage from 'remotestoragejs';
import Widget from 'remotestorage-widget';
import simpleContentType from 'inspektor/utils/simple-content-type';

export default Service.extend({

  rs: null,
  widget: null,
  connecting: true,
  connected: false,
  unauthorized: false,
  userAddress: null,
  disconnected: computed.not('connected'),
  client: null,
  rootListing: null,

  setup: function() {
    const rs = new RemoteStorage({
      cache: false
    });

    rs.access.claim('*', 'rw');

    // rs.setApiKeys({
    //   dropbox: config.dropboxAppKey,
    //   googledrive: config.gdriveClientId
    // });

    const widget = new Widget(rs, {
      skipInitial: true
    });

    // Attach widget to DOM
    widget.attach();

    rs.on('ready', () => {
      console.debug('rs.on ready');
      // this.set('connecting', false);
    });

    rs.on('connected', () => {
      console.debug('rs.on connected');
      this.set('connecting', false);
      this.set('connected', true);
      this.set('userAddress', this.get('rs').remote.userAddress);
    });

    rs.on('not-connected', () => {
      console.debug('rs.on not-connected');
      this.set('connecting', false);
      this.set('connected', false);
    });

    rs.on('disconnected', () => {
      console.debug('rs.on disconnected');
      this.set('connecting', false);
      this.set('connected', false);
    });

    rs.on('connecting', () => {
      console.debug('rs.on connecting');
      this.set('connecting', true);
      this.set('connected', false);
    });

    rs.on('authing', () => {
      console.debug('rs.on authing');
      this.set('connecting', true);
      this.set('connected', false);
    });

    this.set('rs', rs);
    this.set('widget', widget);
    this.set('client', rs.scope('/'));
  }.on('init'),

  connectedChange: observer('connected', function() {
    if (this.get('connected')) {
      this.fetchRootListing();
    } else {
      this.clearLocalData();
    }
  }),

  clearLocalData() {
    this.setProperties({
      userAddress: null,
      rootListing: null
    });
  },

  fetchRootListing() {
    this.fetchListing('').then(items => {
      this.set('rootListing', items.sortBy('name'));
    });
  },

  waitForConnectionState() {
    return new Promise(resolve => {
      const check = () => {
        if (this.get('connecting')) {
          later(check, 20);
        } else {
          resolve();
        }
      };
      check();
    });
  },

  async fetchMedia(path, type) {
    // remoteStorage.js can decode binary responses as text when the provider
    // omits the legacy charset=binary marker. Read the original bytes instead.
    const client = this.get('client');
    const remote = this.get('rs.remote');
    const url = await client.getItemURL(path);
    if (!url || !remote.token || new URL(url).origin !== new URL(remote.href).origin) {
      throw new Error('No authenticated media URL');
    }

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${remote.token}` }
    });
    if (!response.ok) {
      throw new Error(`File request failed (${response.status})`);
    }
    return new Blob([await response.arrayBuffer()], { type });
  },

  fetchListing(path) {
    let items = [];

    return this.get('client').getListing(path).then(listing => {
      if (isEmpty(listing)) { return []; }

      Object.keys(listing).forEach(name => {
        const item = listing[name] || {};
        const isFolder = name.endsWith('/');
        const contentType = item['Content-Type'];
        const type = isFolder ? 'folder' : simpleContentType(contentType);
        const isBinary = !isFolder && (
          /charset\s*=\s*binary/i.test(contentType) ||
          /^(image|audio|video)\//i.test(type) ||
          type === 'application/octet-stream'
        );

        items.push(EmberObject.create({
          name: name,
          type: type,
          isBinary: isBinary,
          isFolder: isFolder,
          size: item['Content-Length'] ?? null,
          path: path + name,
          etag: item['ETag']
        }));
      });

      return items;
    });
  }

});

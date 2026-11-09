import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed, observer } from '@ember/object';
import { alias, not, or } from '@ember/object/computed';
import { scheduleOnce } from '@ember/runloop';
import JSONTreeView from 'json-tree-view';

export default Component.extend({

  storage: service(),

  classNames: ['file-preview'],

  fileLoaded: false,
  uploadingChanges: false,

  showEditor: null,
  hideEditor: not('showEditor'),

  fileContent: null,
  objectURL: null,
  metaData: null,
  isJSON: null,
  type: alias('metaData.type'),
  isBinary: alias('metaData.isBinary'),

  isMedia: or('isImage', 'isAudio', 'isVideo'),
  isUnknownBinary: computed('isBinary', 'isMedia', function() {
    return this.get('isBinary') && !this.get('isMedia');
  }),

  isImage: function() {
    return this.get('type').match(/^image\/.+$/);
  }.property('type'),

  isAudio: function() {
    return this.get('type').match(/^audio\/.+$/);
  }.property('type'),

  isVideo: function() {
    return this.get('type').match(/^video\/.+$/);
  }.property('type'),

  isText: function() {
    return !this.get('isBinary');
  }.property('isBinary'),

  didReceiveAttrs() {
    this._super(...arguments);
    const path = this.get('metaData.path');
    if (!path || this.previewPath === path) { return; }

    this.previewPath = path;
    this.revokeObjectURL();
    this.setProperties({ fileLoaded: false, fileContent: null, loadFailed: false });
    if (this.get('isUnknownBinary')) {
      this.set('fileLoaded', true);
      return;
    }

    this.get('storage.client').getFile(path).then(file => {
      if (this.isDestroying || this.previewPath !== path) { return; }
      if (this.get('isMedia')) {
        const blob = new window.Blob([file.data], { type: this.get('type') });
        this.set('objectURL', window.URL.createObjectURL(blob));
      } else {
        this.set('fileContent', file.data);
      }

      this.set('fileLoaded', true);
    }).catch(error => {
      if (this.isDestroying || this.previewPath !== path) { return; }
      this.set('loadFailed', true);
      console.error(error);
    });
  },

  revokeObjectURL() {
    const url = this.get('objectURL');
    if (url) {
      window.URL.revokeObjectURL(url);
      this.set('objectURL', null);
    }
  },

  willDestroyElement() {
    this.revokeObjectURL();
    this._super(...arguments);
  },

  onFileLoaded: observer('fileLoaded', function(){
    if (this.get('fileLoaded') && this.get('isJSON') && this.get('jsonShowTree')) {
      scheduleOnce('afterRender', this, 'renderJsonTree');
    }
  }),

  onJsonViewChanged: observer('jsonShowTree', function(){
    if (this.get('fileLoaded') && this.get('isJSON') && this.get('jsonShowTree')) {
      scheduleOnce('afterRender', this, 'renderJsonTree');
    }
  }),

  renderJsonTree () {
    let value = JSON.parse(this.get('fileContent'));

    let view = new JSONTreeView('content', value);
    // this.attachJsonTreeEventHandlers(view);

    const containerElement = document.getElementById('json-tree-view');
    containerElement.innerHTML = ''; // Throw away any existing treeviews
    containerElement.appendChild(view.dom);

    window.jsonview = view;

    view.expand(true);

    view.withRootName = false;
    view.readonly = this.get('hideEditor');

    this.set('jsonTreeView', view);
  },

  attachJsonTreeEventHandlers (view) {
    view.on('change', function(self, key, oldValue, newValue){
      console.log('change', key, oldValue, '=>', newValue);
    });
    view.on('rename', function(self, key, oldName, newName) {
      console.log('rename', key, oldName, '=>', newName);
    });
    view.on('delete', function(self, key) {
      console.log('delete', key);
    });
    view.on('append', function(self, key, nameOrValue, newValue) {
      console.log('append', key, nameOrValue, '=>', newValue);
    });
    view.on('click', function(self, key, value) {
      console.log('click', key, '=', value);
    });
    view.on('expand', function(self, key, value) {
      console.log('expand', key, '=', value);
    });
    view.on('collapse', function(self, key, value) {
      console.log('collapse', key, '=', value);
    });
    view.on('refresh', function(self, key, value) {
      console.log('refresh', key, '=', value);
    });
  },

  onShowEditor: observer('showEditor', function(){
    if (this.get('fileLoaded') && this.get('isJSON') && this.get('jsonShowTree')) {
      const showEditor = this.get('showEditor');

      if (showEditor) {
        this.set('jsonTreeView.readonly', false);
      } else {
        this.set('jsonTreeView.readonly', true);
        this.renderJsonTree();
      }
    }
  }),

  actions: {

    saveChanges () {
      const path = this.get('metaData.path');

      if (this.get('isJSON') && this.get('jsonShowTree')) {
        const content = JSON.stringify(this.get('jsonTreeView.value'));
        this.set('uploadingChanges', true);

        this.get('storage.client')
            .storeFile('application/json', path, content)
            .then(etag => {
              this.setProperties({
                'metaData.etag': etag,
                fileContent: content,
                showEditor: false
              });
            }).catch(err => {
              alert('Failed to update the file. Check the console for more info.');
              console.error(err);
            }).finally(() => {
              this.set('uploadingChanges', false);
            });
      } else {
        console.warn('not implemented');
      }
    },

    cancelEditor () {
      this.set('showEditor', false);
    }

  }

});

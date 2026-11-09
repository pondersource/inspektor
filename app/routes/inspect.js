import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { isEmpty, isPresent } from '@ember/utils';

export default Route.extend({

  storage: service(),

  queryParams: {
    path: {
      refreshModel: true
    }
  },

  async beforeModel(transition) {
    await this.get('storage').waitForConnectionState();
    if (!this.get('storage.connected')) {
      return this.transitionTo('index', { queryParams: { path: null } });
    }
    const path = transition.to.queryParams.path;
    if (!path || path.endsWith('/')) {
      return this.transitionTo('index', { queryParams: { path: path || null } });
    }
  },

  async model({ path }) {
    const split = path.lastIndexOf('/') + 1;
    const parentDirPath = path.slice(0, split);
    const listing = await this.get('storage').fetchListing(parentDirPath);
    const documentMetaData = listing.find(item => item.name === path.slice(split));
    const publicItemURL = documentMetaData && path.startsWith('public/')
      ? await this.get('storage.client').getItemURL(path)
      : null;

    return { documentMetaData, publicItemURL, currentDirPath: parentDirPath };
  },

  redirect(model) {
    if (!model.documentMetaData) {
      return this.transitionTo('index', {
        queryParams: { path: model.currentDirPath || null }
      });
    }
  },

  setupController(controller, model) {
    this._super(controller, model);

    if (isEmpty(this.get('storage.categories')) && this.get('storage.connected')) {
      this.get('storage').fetchRootListing();
    }

    if (isPresent(model)) {
      controller.set('currentDirPath', model.currentDirPath);
    }

    controller.set('documentShowEditor', false);
  }

});

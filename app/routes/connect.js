import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({

  storage: service(),

  beforeModel() {
    return this.get('storage').waitForConnectionState().then(() => {
      if (this.get('storage.connected')) {
        this.transitionTo('index');
      }
    });
  }

});

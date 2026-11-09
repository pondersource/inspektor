import Controller from '@ember/controller';
import { inject as controller } from '@ember/controller';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import { isEmpty } from '@ember/utils';

export default Controller.extend({

  application: controller(),
  storage: service(),

  currentDirPath: alias('application.currentDirPath'),

  queryParams: ['path'],

  // documentIsEditable: computed.not('model.documentMetaData.isBinary'),
  documentIsEditable: alias('documentIsJSON'),

  documentShowEditor: false,
  documentHideEditor: computed.not('documentShowEditor'),

  documentIsJSON: computed('model.documentMetaData.type', function(){
    if (isEmpty(this.get('model.documentMetaData'))) { return false; }

    return !!this.get('model.documentMetaData.type').match(/application\/json/i);
  }),

  jsonView: 'tree',
  jsonShowTree: computed.equal('jsonView', 'tree'),
  jsonShowSource: computed.equal('jsonView', 'source'),

  publicItemURL: alias('model.publicItemURL'),

  metadataHidden: false,

  actions: {

    showJsonTree () {
      this.set('jsonView', 'tree');
    },

    showJsonSource () {
      this.set('documentShowEditor', false);
      this.set('jsonView', 'source');
    },

    showEditor () {
      this.set('documentShowEditor', true);
    },

    cancelEditor () {
      this.set('documentShowEditor', false);
      // TODO remove changes from tree/source
    },

    toggleMetadata () {
      this.toggleProperty('metadataHidden');
    },

    deleteItem () {
      if (window.confirm('Delete?')) {
        this.get('storage.client')
            .remove(this.get('path')).then(() => {
              this.transitionToRoute('index', {
                queryParams: {
                  path: this.get('currentDirPath') || null
                }
              });
            });
      }
    }

  }

});

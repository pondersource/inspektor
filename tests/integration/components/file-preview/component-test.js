import Service from '@ember/service';
import { render } from '@ember/test-helpers';
import { setupRenderingTest } from 'ember-qunit';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

module('Integration | Component | file preview', function(hooks) {
  setupRenderingTest(hooks);

  test('it loads and renders text', async function(assert) {
    this.owner.register('service:storage', Service.extend({
      client: { getFile: async () => ({ data: 'preview fixture' }) }
    }));
    this.set('metaData', { path: 'example.txt', type: 'text/plain', isBinary: false });

    await render(hbs`{{file-preview metaData=this.metaData}}`);

    assert.equal(this.element.querySelector('code').textContent, 'preview fixture');
  });
});

import Service from '@ember/service';
import { render, click, settled } from '@ember/test-helpers';
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
  test('pre-parsed Dropbox JSON can be previewed and saved', async function(assert) {
    assert.expect(3);
    const value = { title: 'Dropbox fixture' };
    this.owner.register('service:storage', Service.extend({
      client: {
        getFile: async () => ({ data: value, contentType: 'application/json' }),
        storeFile: async (type, path, content) => {
          assert.equal(type, 'application/json');
          assert.deepEqual(JSON.parse(content), value);
          return 'new-revision';
        }
      }
    }));
    this.set('metaData', { path: 'bookmarks/archive/id', type: 'application/json', isBinary: false });
    this.set('editing', false);
    await render(hbs`{{file-preview metaData=this.metaData isJSON=true jsonShowTree=true showEditor=this.editing}}`);
    assert.ok(this.element.querySelector('#json-tree-view').textContent.includes('Dropbox fixture'), this.element.innerHTML);
    this.set('editing', true);
    await settled();
    await click('button.primary');
  });
});

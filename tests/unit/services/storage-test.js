import { moduleFor, test } from 'ember-qunit';

moduleFor('service:storage', 'Unit | Service | storage', {
  // Specify the other units that are required for this test.
  // needs: ['service:foo']
});

test('missing content type does not turn a file into a folder', async function(assert) {
  const service = this.subject();
  service.set('client', {
    getListing: async () => ({ 'subfolder/': true, 'empty-file': { 'Content-Length': 0 } })
  });

  const [folder, file] = await service.fetchListing('category/');

  assert.true(folder.isFolder);
  assert.false(file.isFolder);
  assert.equal(file.type, 'application/octet-stream');
  assert.equal(file.size, 0);
});

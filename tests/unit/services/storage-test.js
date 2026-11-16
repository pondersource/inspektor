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


test('provider media reads use the storage client instead of public links', async function(assert) {
  const service = this.subject();
  service.set('rs', { backend: 'googledrive', remote: {} });
  service.set('client', {
    getFile: async (path) => {
      assert.equal(path, 'pictures/image.png');
      return { data: new Uint8Array([0, 128, 255]).buffer };
    },
    getItemURL: () => { throw new Error('Must not request a public sharing URL'); }
  });
  const blob = await service.fetchMedia('pictures/image.png', 'image/png');
  assert.equal(blob.type, 'image/png');
  assert.equal(blob.size, 3);
});

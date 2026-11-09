import { moduleForComponent, test } from 'ember-qunit';
import { hbs } from 'ember-cli-htmlbars';

moduleForComponent('item-icon', 'Integration | Component | item icon', {
  integration: true
});

test('it renders', function(assert) {
  this.render(hbs`{{item-icon type='folder'}}`);

  assert.equal(this.$('img').attr('src'), '/img/file-icons/folder.svg');
});

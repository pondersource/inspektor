const assert = require('node:assert/strict');
const {readFileSync} = require('node:fs');
const {test} = require('node:test');

function node(tag) {
    return {
        tag, children: [], handlers: {},
        append(...children) { this.children.push(...children); },
        replaceChildren(...children) { this.children = children; },
        setAttribute() {},
        addEventListener(type, handler) { this.handlers[type] = handler; },
    };
}

function find(root, predicate) {
    if (predicate(root)) return root;
    for (const child of root.children) {
        const result = find(child, predicate);
        if (result) return result;
    }
}

test('browse only children of the picked resource and open one in Atomic', async () => {
    const module = readFileSync('atomic/inspektor-0.1.0.js', 'utf8');
    const {view} = await import('data:text/javascript;base64,' + Buffer.from(module).toString('base64'));
    global.document = {createElement: node};
    const parent = 'https://atomicdata.dev/properties/parent';
    const name = 'https://atomicdata.dev/properties/name';
    const resource = (subject, title, container) => {
        const props = {[name]: title, [parent]: container};
        return {subject, title, props, get: key => props[key]};
    };
    const folder = resource('folder', 'Picked folder');
    const child = resource('child', 'Child item', 'folder');
    const unrelated = resource('other', 'Unrelated', 'another folder');
    let opened;
    const root = node('div');
    const store = {
        ui: {
            pickResource: async () => 'folder',
            openResource: async subject => { opened = subject; }
        },
        query: async args => {
            assert.equal(args.property, parent);
            assert.equal(args.pageSize, 40);
            return args.value === 'folder' ? ['child', 'other'] : [];
        },
        getMany: async subjects => subjects.map(subject => subject === 'child' ? child : unrelated),
        getResource: async () => folder
    };
    await view({root, store});
    const button = text => find(root, n => n.tag === 'button' && n.textContent === text);
    await button('Choose a resource').handlers.click();
    assert.ok(button('Child item'));
    assert.equal(button('Unrelated'), undefined);
    await button('Child item').handlers.click();
    assert.match(find(root, n => n.tag === 'pre').textContent, /"@id": "child"/);
    await button('Open resource in Atomic').handlers.click();
    assert.equal(opened, 'child');
});

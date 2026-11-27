const parent = 'https://atomicdata.dev/properties/parent';
const name = 'https://atomicdata.dev/properties/name';
const pageSize = 40;

function element(tag, text) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  return node;
}

export async function view({root, store}) {
  const main = element('main');
  const style = element('style', `
    main { max-width: 62rem; margin: auto; padding: 1.25rem; font: 1rem system-ui; }
    button { font: inherit; padding: .35rem; margin: .2rem .5rem .2rem 0; }
    ul { list-style: none; padding: 0; }
    li, pre { border: 1px solid #8886; padding: .5rem; overflow-wrap: anywhere; }
    pre { white-space: pre-wrap; }
    nav { display: flex; flex-wrap: wrap; gap: .35rem; }
  `);
  main.append(element('h1', 'Inspektor'));
  root.replaceChildren(style, main);

  if (!store.ui?.pickResource || !store.ui?.openResource) {
    main.append(element('p', 'Update Atomic to use the resource picker.'));
    return;
  }

  const pick = element('button', 'Choose a resource');
  const open = element('button', 'Open resource in Atomic');
  open.hidden = true;
  const trail = element('nav');
  trail.setAttribute('aria-label', 'Resource path');
  const metadata = element('pre');
  metadata.hidden = true;
  const list = element('ul');
  const more = element('button', 'More children');
  more.hidden = true;
  const status = element('p');
  status.setAttribute('role', 'status');
  main.append(pick, open, trail, status, metadata, list, more);

  let path = [];
  let page = 0;
  let busy = false;

  function title(resource) {
    return resource.title || resource.get(name) || resource.subject;
  }

  async function children(resource, index) {
    const subjects = await store.query({property: parent, value: resource.subject, page: index, pageSize});
    const rows = await store.getMany(subjects);
    return {
      rows: rows.filter(row => !row.error && row.get(parent) === resource.subject),
      more: subjects.length === pageSize
    };
  }

  function drawChildren(result) {
    for (const child of result.rows) {
      if (path.some(resource => resource.subject === child.subject)) continue;
      const entry = element('li');
      const enter = element('button', title(child));
      enter.addEventListener('click', () => run(async () => show([...path, child])));
      entry.append(enter);
      list.append(entry);
    }
    more.hidden = !result.more;
  }

  async function show(nextPath) {
    const resource = nextPath.at(-1);
    const firstPage = await children(resource, 0);
    path = nextPath;
    page = 0;
    metadata.hidden = false;
    metadata.textContent = JSON.stringify({'@id': resource.subject, ...resource.props}, null, 2);
    open.hidden = false;
    trail.replaceChildren();
    path.forEach((ancestor, index) => {
      const up = element('button', title(ancestor));
      up.disabled = index === path.length - 1;
      up.addEventListener('click', () => run(async () => show(path.slice(0, index + 1))));
      trail.append(up);
    });
    list.replaceChildren();
    drawChildren(firstPage);
  }

  async function run(operation) {
    if (busy) return;
    busy = pick.disabled = more.disabled = open.disabled = true;
    status.textContent = '';
    try {
      await operation();
    } catch (error) {
      status.textContent = error.message;
    } finally {
      busy = pick.disabled = more.disabled = open.disabled = false;
    }
  }

  pick.addEventListener('click', () => run(async () => {
    const subject = await store.ui.pickResource({title: 'Choose a resource to inspect'});
    if (subject) await show([await store.getResource(subject)]);
  }));
  open.addEventListener('click', () => run(() => store.ui.openResource(path.at(-1).subject)));
  more.addEventListener('click', () => run(async () => {
    const result = await children(path.at(-1), page + 1);
    drawChildren(result);
    page += 1;
  }));
}

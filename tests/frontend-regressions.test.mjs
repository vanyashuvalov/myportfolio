import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const source = path => readFileSync(new URL(path, root), 'utf8');

function classes() {
  const values = new Set();
  return {
    add(...names) { names.forEach(name => values.add(name)); },
    remove(...names) { names.forEach(name => values.delete(name)); },
    contains(name) { return values.has(name); },
    toggle(name, force) {
      const on = force ?? !values.has(name);
      on ? values.add(name) : values.delete(name);
      return on;
    }
  };
}

function domFixture() {
  const listeners = new Map();
  const makeElement = () => ({
    style: { setProperty() {} }, classList: classes(), children: [],
    textContent: '', _html: '', parentNode: null,
    set innerHTML(value) { this._html = value; },
    get innerHTML() {
      return this._html || this.textContent.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
    },
    appendChild(child) { this.children.push(child); child.parentNode = this; },
    removeChild(child) { this.children = this.children.filter(item => item !== child); child.parentNode = null; },
    remove() { this.parentNode?.removeChild(this); },
    querySelector() { return { classList: classes(), addEventListener() {}, focus() {} }; },
    setAttribute() {}, removeAttribute() {}, addEventListener() {}, focus() {}, blur() {}
  });
  const document = {
    body: makeElement(), documentElement: makeElement(),
    createElement: makeElement, querySelector: () => null,
    addEventListener(type, listener) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(listener);
    },
    removeEventListener(type, listener) { listeners.get(type)?.delete(listener); }
  };
  return { document, listeners, makeElement };
}

function loadClass(path, name, globals = {}) {
  let code = source(path).replace(/^import .*;\s*$/gm, '');
  if (name === 'Application') code = code.slice(0, code.indexOf('// ANCHOR: application_startup'));
  code = code.replace(`export class ${name}`, `class ${name}`);
  code += `\nglobalThis.TestClass = ${name};`;
  const context = vm.createContext({ console, ...globals });
  vm.runInContext(code, context, { filename: path });
  return context.TestClass;
}

function applicationFixture() {
  const dom = domFixture();
  const location = { pathname: '/', hostname: 'example.test' };
  const Application = loadClass('js/main.js', 'Application', {
    document: dom.document, window: { location }, location
  });
  const app = new Application();
  return { ...dom, app, location };
}

function decodeAttribute(value) {
  return value.replace(/&(?:quot|apos|#39|#x27|lt|gt|amp);/gi, entity => ({
    '&quot;': '"', '&apos;': "'", '&#39;': "'", '&#x27;': "'", '&lt;': '<', '&gt;': '>', '&amp;': '&'
  })[entity.toLowerCase()]);
}

test('contact message survives quotes, markup-like text and ampersands in form HTML', () => {
  const { app } = applicationFixture();
  const message = `Let's discuss "mobile app" & <layout> with 'quotes'`;
  const html = app.renderContactModal(message);
  const attribute = html.match(/data-message="([^"]*)"/);
  assert.ok(attribute, 'contact form keeps the pending message');
  assert.equal(decodeAttribute(attribute[1]), message);
  assert.ok(!html.includes('<layout>'), 'message cannot become markup');
});

function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

function pageFixture() {
  const dom = domFixture();
  class Router { constructor() { this.routes = new Map(); } register(path, handler) { this.routes.set(path, handler); } }
  const PageManager = loadClass('js/features/page-manager/page-manager.js', 'PageManager', {
    document: dom.document, window: {}, Router
  });
  class TestPageManager extends PageManager { initialize() {} }
  const manager = new TestPageManager();
  manager.pageContainer = dom.makeElement();
  manager.desktopCanvasEl = dom.makeElement();
  manager.waitForTransitionPaint = async () => {};
  manager.forceViewportReflow = () => {};
  manager.toggleOverlay = () => {};
  const errors = [];
  manager.showErrorPage = message => { errors.push(message); manager.pageContainer.innerHTML = 'ERROR'; };
  return { manager, errors };
}

for (const failure of [false, true]) {
  test(`late project ${failure ? 'failure' : 'response'} cannot replace a newer gallery`, async () => {
    const { manager, errors } = pageFixture();
    const old = deferred();
    const first = manager.showPage({ type: 'project', load: () => old.promise, render: () => 'OLD PROJECT' });
    await manager.showPage({ type: 'fun-gallery', load: async () => ({}), render: () => 'CURRENT GALLERY' });
    failure ? old.reject(new Error('old request failed')) : old.resolve({});
    await first;
    assert.equal(manager.pageContainer.innerHTML, 'CURRENT GALLERY');
    assert.deepEqual(errors, []);
  });
}

test('returning home invalidates pending project loading', async () => {
  const { manager, errors } = pageFixture();
  const old = deferred();
  const first = manager.showPage({ type: 'project', load: () => old.promise, render: () => 'OLD PROJECT' });
  await manager.showDesktopCanvas();
  old.resolve({});
  await first;
  assert.equal(manager.isPageMode, false);
  assert.equal(manager.pageContainer.innerHTML, '');
  assert.equal(manager.desktopCanvasEl.style.display, 'flex');
  assert.deepEqual(errors, []);
});

test('work project route awaits rendering before reporting navigation complete', async () => {
  const { manager } = pageFixture();
  const pending = deferred();
  manager.showProjectPage = () => pending.promise;
  manager.registerRoutes();
  let finished = false;
  const navigation = Promise.resolve(manager.router.routes.get('/projects/:id')({ params: { id: 'example' } }))
    .then(() => { finished = true; });
  await Promise.resolve();
  assert.equal(finished, false);
  pending.resolve();
  await navigation;
  assert.equal(finished, true);
});

for (const [name, path] of [
  ['ImageViewer', 'js/shared/ui/image-viewer/image-viewer.js'],
  ['PDFViewer', 'js/shared/ui/pdf-viewer/pdf-viewer.js']
]) {
  test(`${name}: closing then reopening cannot let old cleanup remove new content`, () => {
    const dom = domFixture();
    const timers = new Map();
    let nextTimer = 0;
    const Viewer = loadClass(path, name, {
      document: dom.document, requestAnimationFrame: callback => callback(),
      setTimeout(callback) { timers.set(++nextTimer, callback); return nextTimer; },
      clearTimeout(id) { timers.delete(id); }
    });
    const viewer = new Viewer();
    viewer.open('first.file', 'First');
    viewer.close();
    viewer.open('second.file', 'Second');
    const reopened = viewer.viewerElement;
    for (const [id, callback] of [...timers]) { timers.delete(id); callback(); }
    assert.equal(viewer.viewerElement, reopened);
    assert.equal(viewer.isOpen, true);
    assert.equal(reopened.parentNode, dom.document.body);
    assert.equal(dom.document.body.children.length, 1);
    assert.match(reopened.innerHTML, /second\.file/);
    viewer.close();
    for (const [id, callback] of [...timers]) { timers.delete(id); callback(); }
    assert.equal(viewer.isOpen, false);
    assert.equal(dom.document.body.children.length, 0);
  });
}

function keyboardTarget(tagName, { interactiveAncestor = false, editable = false } = {}) {
  const interactive = /^(BUTTON|INPUT|TEXTAREA|SELECT|A)$/.test(tagName) || interactiveAncestor || editable;
  return {
    tagName, isContentEditable: editable,
    matches(selector) {
      return selector.split(',').some(part => part.trim().toLowerCase() === tagName.toLowerCase()) || (editable && selector.includes('contenteditable'));
    },
    closest(selector) { return interactive && /button|input|textarea|select|a\b|contenteditable|role/.test(selector) ? this : null; }
  };
}

test('Space shortcut preserves buttons, links, editable targets, case-study scrolling and dialogs', () => {
  const { app, location } = applicationFixture();
  const events = [];
  app.eventBus = { emit(name) { events.push(name); } };
  app.pageManager = { isInPageMode: () => location.pathname !== '/', isPageMode: false };
  app.contactModalManager = { isOpen: false, isModalOpen: () => false };
  app.pdfViewer = { isOpen: false };
  function press(target, extra = {}) {
    let prevented = false;
    app.handleKeydown({ key: ' ', target, preventDefault() { prevented = true; }, ...extra });
    return prevented;
  }
  for (const tag of ['BUTTON', 'A', 'INPUT', 'TEXTAREA', 'SELECT']) {
    assert.equal(press(keyboardTarget(tag)), false, tag);
  }
  assert.equal(press(keyboardTarget('SPAN', { interactiveAncestor: true })), false);
  assert.equal(press(keyboardTarget('DIV', { editable: true })), false);
  location.pathname = '/projects/example';
  app.pageManager.isPageMode = true;
  assert.equal(press(keyboardTarget('BODY')), false);
  assert.deepEqual(events, []);
  location.pathname = '/';
  app.pageManager.isPageMode = false;
  assert.equal(press(keyboardTarget('BODY')), true);
  assert.deepEqual(events, ['cat:feed']);
  events.length = 0;
  app.contactModalManager.isOpen = true;
  assert.equal(press(keyboardTarget('BODY')), false);
  app.contactModalManager.isOpen = false;
  app.pdfViewer.isOpen = true;
  assert.equal(press(keyboardTarget('BODY')), false);
  app.pdfViewer.isOpen = false;
  for (const extra of [{ repeat: true }, { defaultPrevented: true }, { ctrlKey: true }, { metaKey: true }, { altKey: true }]) {
    assert.equal(press(keyboardTarget('BODY'), extra), false);
  }
  assert.deepEqual(events, []);
});

test('all navigation icons are immediately available without synchronous XHR', async () => {
  const { NAVIGATION_ICONS } = await import('data:text/javascript;base64,' + Buffer.from(source('js/shared/ui/navigation/components/navigation-icons.js')).toString('base64'));
  const requests = [];
  const IconProvider = loadClass('js/shared/ui/navigation/components/icon-provider.js', 'IconProvider', {
    NAVIGATION_ICONS,
    XMLHttpRequest: class {
      open(method, url, async) { requests.push({ method, url, async }); }
      send() { this.status = 500; }
    },
    fetch() { throw new Error('Icons should already be available'); }
  });
  const provider = new IconProvider();
  for (const name of ['arrow', 'flag', 'telegram', 'linkedin', 'email', 'github', 'download', 'copy', 'heart', 'eye', 'clock', 'close']) {
    assert.match(provider.getIcon(name), /<svg\b/, name);
  }
  assert.deepEqual(requests.filter(request => request.async === false), []);
});

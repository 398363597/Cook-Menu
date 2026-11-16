const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const html = fs.readFileSync('index.html', 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const startup = script.slice(0, script.lastIndexOf('    navButtons.forEach'));
const key = 'cook_menu:v1:snapshot';

function setup(initial, options = {}) {
  let stored = initial;
  let writes = 0;
  const alerts = [];
  const nodes = new Map();
  const rows = {};
  const node = (selector) => {
    if (!nodes.has(selector)) nodes.set(selector, { innerHTML: '', value: '', classList: { toggle() {} }, addEventListener(type, fn) { this[type] = fn; } });
    return nodes.get(selector);
  };
  const context = {
    console: { warn() {} }, structuredClone, crypto: { randomUUID: () => 'test-id' },
    document: { querySelector: node, querySelectorAll: (selector) => rows[selector] || [] },
    localStorage: {
      getItem() { if (options.readError) throw Error('denied'); return stored; },
      setItem(k, value) { assert.equal(k, key); if (options.writeError) throw Error('quota'); stored = value; writes++; }
    },
    alert: (message) => alerts.push(message), confirm: () => options.confirm !== false,
    FileReader: class { readAsText(file) { if (file.error) this.onerror(); else { this.result = file.text; this.onload(); } this.onloadend(); } },
    Blob, URL: { createObjectURL: () => 'blob:test', revokeObjectURL() {} }, location: { reload() {} }
  };
  vm.createContext(context);
  vm.runInContext(startup + '\nthis.api = { migrateDatabase, saveDatabase, render, renderForm, importData, getDB: () => db, getProblem: () => storageProblem };', context);
  return { ...context.api, nodes, node, rows, alerts, getStored: () => stored, getWrites: () => writes };
}

const original = JSON.stringify({ schemaVersion: 1, recipes: [{ id: 'r1', name: '面', ingredients: [{ name: '面条' }], steps: [{ text: '煮' }], failureNotes: '太咸', custom: 'keep' }], extra: 'keep' });
for (const raw of ['{broken', JSON.stringify({ schemaVersion: 2, recipes: [] }), '{}', '']) {
  const t = setup(raw);
  assert.ok(t.getProblem());
  t.render();
  assert.match(t.nodes.get('#app').innerHTML, /数据需要恢复/);
  assert.equal(t.saveDatabase(), false);
  assert.equal(t.getStored(), raw);
  assert.equal(t.getWrites(), 0);
}
const denied = setup(original, { readError: true });
assert.ok(denied.getProblem());
assert.equal(denied.saveDatabase(), false);
assert.equal(denied.getStored(), original);

const valid = setup(original);
assert.equal(valid.getWrites(), 0);
assert.equal(valid.getDB().recipes[0].lessons.failureNotes, '太咸');
assert.equal(valid.getDB().recipes[0].custom, 'keep');
assert.equal(valid.getDB().extra, 'keep');
for (const text of ['{}', '{bad', '{"schemaVersion":2,"recipes":[]}', '{"schemaVersion":1,"recipes":[null]}']) {
  valid.importData({ target: { files: [{ text }], value: 'file' } });
  assert.equal(valid.getStored(), original);
  assert.equal(valid.getDB().recipes[0].id, 'r1');
}
const cancelled = setup(original, { confirm: false });
cancelled.importData({ target: { files: [{ text: '{"schemaVersion":1,"recipes":[]}' }] } });
assert.equal(cancelled.getStored(), original);
const quota = setup(original, { writeError: true });
quota.importData({ target: { files: [{ text: '{"schemaVersion":1,"recipes":[]}' }] } });
assert.equal(quota.getStored(), original);
assert.equal(quota.getDB().recipes[0].id, 'r1');
assert.match(quota.alerts.at(-1), /保存失败/);
const imported = setup(original);
imported.importData({ target: { files: [{ text: '{"schemaVersion":1,"recipes":[]}' }] } });
assert.equal(JSON.parse(imported.getStored()).recipes.length, 0);

// Exercise the real submit handler with rows containing only auxiliary fields.
const form = setup(original);
form.renderForm(null);
form.node('#name').value = '测试';
const row = (values) => ({ querySelector: (selector) => ({ value: values[selector.match(/"(.*?)"/)[1]] || '' }) });
form.rows['[data-ingredient-editor]'] = [row({ amount: '1' })];
form.rows['[data-step-editor]'] = [row({ note: '备注', timerMinutes: '5' })];
form.nodes.get('#recipeForm').submit({ preventDefault() {} });
assert.match(form.alerts.at(-1), /食材名称/);
form.rows['[data-ingredient-editor]'] = [row({ name: '面' })];
form.nodes.get('#recipeForm').submit({ preventDefault() {} });
assert.match(form.alerts.at(-1), /步骤内容/);
assert.equal(form.getStored(), original);

const handlers = {};
const deleted = [];
const sw = { self: { addEventListener: (name, fn) => { handlers[name] = fn; }, clients: { claim() {} } }, caches: { keys: async () => ['cook-menu-pwa-v2', 'cook-menu-pwa-v3', 'cook-menu-pwa-v4', 'other-app'], delete: async (name) => deleted.push(name) }, Promise };
vm.runInNewContext(fs.readFileSync('service-worker.js', 'utf8'), sw);
let activation;
handlers.activate({ waitUntil: (promise) => { activation = promise; } });
activation.then(() => {
  assert.deepEqual(deleted.sort(), ['cook-menu-pwa-v2', 'cook-menu-pwa-v3']);
  console.log('data safety and cache tests passed');
}).catch((error) => { console.error(error); process.exitCode = 1; });

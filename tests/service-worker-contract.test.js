import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), 'utf8');

test('service worker shell does not pre-cache concept-bank chunks', () => {
  const sw = read('../sw.js');
  assert.doesNotMatch(sw, /\.\/data\/concepts\//);
  assert.doesNotMatch(sw, /sdaia-ai-pages-v8/);
});

test('app imports synchronous service-worker registration helper', () => {
  const app = read('../src/app.js');
  assert.match(app, /registerServiceWorker/);
  assert.match(app, /registerServiceWorker\(\)/);
});

test('non-navigation cache misses do not fall back to index html', () => {
  const sw = read('../sw.js');
  assert.match(sw, /event\.request\.mode\s*===\s*['"]navigate['"]/);
  assert.match(sw, /Response\.error\(\)/);
});

test('release verification does not pin the retired v8 cache name', () => {
  const pages = read('../.github/workflows/pages.yml');
  assert.doesNotMatch(pages, /sdaia-ai-pages-v8/);
});

test('pages artifact copies canonical track configuration without publishing legacy data', () => {
  const pages = read('../.github/workflows/pages.yml');
  assert.match(pages, /cp -R src tracks _site\//);
  assert.match(pages, /cp -R data\/concepts data\/migrations _site\/data\//);
  assert.match(pages, /test ! -e _site\/data\/legacy/);
  assert.doesNotMatch(pages, /cp -R src data tracks _site\//);
});

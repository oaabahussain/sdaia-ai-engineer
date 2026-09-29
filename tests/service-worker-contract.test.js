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
  const builder = read('../scripts/build_pages_artifact.js');
  assert.match(pages, /node scripts\/build_pages_artifact\.js _site/);
  assert.ok(builder.includes("'tracks'"));
  assert.ok(builder.includes("'data/concepts'"));
  assert.ok(builder.includes("'data/migrations'"));
  assert.match(builder, /data\/legacy/);
  assert.match(builder, /Forbidden Pages artifact path/);
});


test('presentation and feedback runtime assets are part of the offline shell', () => {
  const sw = read('../sw.js');
  for (const asset of [
    './src/presentation/coreI18n.js',
    './src/presentation/trackPresentation.js',
    './src/feedback.js',
    './tracks/sdaia-ai-engineer/presentation.json'
  ]) assert.equal(sw.includes(`'${asset}'`), true, asset);
  const verifier = read('../scripts/verify_sw_assets.js');
  assert.match(verifier, /presentation\.json/);
});

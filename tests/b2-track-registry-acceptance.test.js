import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const root = new URL('..', import.meta.url);
const read = path => fs.readFileSync(new URL(path, root), 'utf8');
const exists = path => fs.existsSync(new URL(path, root));

test('B2 registry contract files exist', () => {
  for (const path of [
    'data/schema/track-registry.schema.json',
    'tracks/registry.json',
    'src/tracks/registry.js',
  ]) assert.equal(exists(path), true, path);
});

test('runtime bootstrap no longer exports a compiled active track id', () => {
  assert.doesNotMatch(read('src/config.js'), /ACTIVE_TRACK_ID/);
});

test('storage adapters require an explicit track id for bank loading', () => {
  for (const path of ['src/storage/browser.js', 'src/storage/api.js']) {
    assert.match(read(path), /loadBank\(trackId\)/, path);
  }
});

test('release and offline verification are registry driven', () => {
  const live = read('scripts/verify_live_release.js');
  const sw = read('scripts/verify_sw_assets.js');
  assert.match(live, /tracks\/registry\.json/);
  assert.match(sw, /tracks\/registry\.json/);
  assert.doesNotMatch(live, /tracks\/sdaia-ai-engineer\/manifest\.json/);
});

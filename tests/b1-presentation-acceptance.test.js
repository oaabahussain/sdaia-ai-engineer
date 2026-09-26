import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = p => fs.readFileSync(new URL(p, import.meta.url), 'utf8');
const exists = p => fs.existsSync(new URL(p, import.meta.url));

test('B1 contract files exist', () => {
  for (const p of [
    '../data/schema/track-presentation.schema.json',
    '../tracks/sdaia-ai-engineer/presentation.json',
    '../src/presentation/coreI18n.js',
    '../src/presentation/trackPresentation.js'
  ]) assert.equal(exists(p), true, p);
});

test('core app no longer owns SDAIA presentation literals', () => {
  const app = read('../src/app.js');
  assert.doesNotMatch(app, /const DOMAIN_AR\s*=/);
  assert.doesNotMatch(app, /SDAIA AI Engineer/);
});

test('HTML shells are neutral while bootstrap track selection remains explicit', () => {
  assert.doesNotMatch(read('../index.html'), /SDAIA AI Engineer/);
  assert.doesNotMatch(read('../feedback.html'), /SDAIA AI Engineer/);
  assert.match(read('../src/config.js'), /ACTIVE_TRACK_ID\s*=\s*['"]sdaia-ai-engineer['"]/);
});

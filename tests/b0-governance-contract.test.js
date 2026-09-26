import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const exists = path => fs.existsSync(new URL(path, import.meta.url));

test('canonical governance files are present on the current branch', () => {
  for (const path of [
    '../docs/superpowers/specs/2026-09-23-learning-platform-vnext-design.md',
    '../docs/superpowers/specs/2026-09-23-learning-platform-vnext-evidence.md',
    '../docs/superpowers/specs/2026-09-26-learning-platform-research-amendment.md'
  ]) {
    assert.equal(exists(path), true, path);
  }
});

test('learning outcomes outrank engagement mechanics without making retrieval dogma', () => {
  const doc = read('../docs/superpowers/specs/2026-09-26-learning-platform-research-amendment.md');
  assert.match(doc, /learning, retention, transfer, readiness/i);
  assert.match(doc, /gamification.*secondary|secondary.*gamification/i);
  assert.match(doc, /MUST NOT.*retrieval/i);
  assert.match(doc, /universally optimal/i);
});

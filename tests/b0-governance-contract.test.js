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

test('AI tutor rules require grounded, optional, scaffolded help', () => {
  const doc = read('../docs/superpowers/specs/2026-09-26-learning-platform-research-amendment.md');
  assert.match(doc, /canonical content|canonical track/i);
  assert.match(doc, /deterministic.*manual|manual.*deterministic/i);
  assert.match(doc, /abstain|abstention/i);
  assert.match(doc, /scaffold|hint/i);
});

test('AI content activation requires the staged quality pipeline', () => {
  const doc = read('../docs/superpowers/specs/2026-09-26-learning-platform-research-amendment.md');
  assert.ok(doc.includes('Generate → Critique → Validate → Deduplicate → Evidence → Bilingual check → Review → Activate → Measure → Recalibrate/Retire'));
  assert.match(doc, /never.*single generation step|must not.*single generation step/i);
});

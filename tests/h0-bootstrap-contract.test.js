import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const read = (p) => readFileSync(p, 'utf8');
const staticFiles = ['PROJECT-INDEX.md', 'RECOVERY-PROTOCOL.md', 'DURABLE-FILE-MAP.md'];

test('static bootstrap files exist and point to CURRENT-STATE without live SHA duplication', () => {
  for (const p of staticFiles) {
    assert.equal(existsSync(p), true, p + ' must exist');
    const src = read(p);
    assert.match(src, /docs\/superpowers\/state\/CURRENT-STATE\.json/);
    assert.doesNotMatch(src, /\b[0-9a-f]{40}\b/);
  }
});

test('recovery protocol fails closed on drift and low-model gate failures', () => {
  const src = read('RECOVERY-PROTOCOL.md');
  assert.match(src, /MAIN_DRIFT/);
  assert.match(src, /PLAN_SPEC_HASH_MISMATCH/);
  assert.match(src, /low_model_ready/i);
  assert.match(src, /STOP/i);
  assert.match(src, /execution_branch/);
});

test('HANDOFF top is a static state pointer rather than stale K3 status truth', () => {
  const top = read('HANDOFF.md').split('\n').slice(0, 45).join('\n');
  assert.match(top, /CURRENT-STATE\.json/);
  assert.match(top, /static|pointer|bootstrap/i);
  assert.doesNotMatch(top, /design:\s*NOT STARTED/i);
  assert.doesNotMatch(top, /implementation:\s*NOT STARTED/i);
});

test('programme tracker is historical/index-only for live execution state', () => {
  const top = read('docs/superpowers/reviews/2026-09-27-platform-programme-tracker.md').split('\n').slice(0, 35).join('\n');
  assert.match(top, /historical|index-only|non-authoritative/i);
  assert.match(top, /CURRENT-STATE\.json/);
  assert.doesNotMatch(top, /authoritative current programme index/i);
});

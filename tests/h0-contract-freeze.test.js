import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const spec = readFileSync('docs/superpowers/specs/2026-09-29-k3-learner-evidence-engine-design.md', 'utf8');
const plan = readFileSync('docs/superpowers/plans/2026-09-29-k3-learner-evidence-engine.md', 'utf8');

test('K3 execution contracts are normalized and frozen for ledger/state progress', () => {
  assert.doesNotMatch(spec, /DRAFT FOR EXPLICIT WRITTEN-SPEC APPROVAL/);
  assert.doesNotMatch(spec, /does not authorize implementation/i);
  assert.doesNotMatch(spec, /current authoritative programme tracker/i);
  assert.match(spec, /Execution authority:.*CURRENT-STATE/i);
  assert.match(spec, /Historical design base:/i);
  assert.match(spec, /Tasks 1-4/i);
  assert.match(spec, /Task 5/i);
  assert.match(plan, /Execution progress source: SDD \+ durable ledger \+ CURRENT-STATE/);
  assert.match(plan, /semantic content is frozen for execution/i);
  const task5 = plan.match(/### Task 5:[\s\S]*?(?=### Task 6:)/)?.[0] ?? '';
  assert.ok(task5.length > 0);
  assert.doesNotMatch(task5, /- \[x\]/i);
});

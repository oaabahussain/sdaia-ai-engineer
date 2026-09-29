import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const plan = readFileSync('docs/superpowers/plans/2026-09-29-k3-learner-evidence-engine.md', 'utf8');

function taskSection(n) {
  const start = plan.indexOf('### Task ' + n + ':');
  assert.notEqual(start, -1, 'Task ' + n + ' section exists');
  const next = n < 41 ? plan.indexOf('### Task ' + (n + 1) + ':', start + 1) : -1;
  return plan.slice(start, next === -1 ? plan.length : next);
}

for (let n = 5; n <= 41; n += 1) {
  test('Task ' + n + ' brief is self-contained for low-reasoning execution', () => {
    const section = taskSection(n);
    assert.ok(section.includes('Run: '), 'exact run command');
    assert.ok(section.includes('Expected RED:'), 'expected red');
    assert.ok(section.includes('Expected GREEN:'), 'expected green');
    assert.ok(section.includes('Affected regression:'), 'affected regression');
    assert.ok(section.includes('**Stop conditions:**'), 'stop conditions');
    assert.ok(section.includes('systematic-debugging'), 'debugging rule');
    assert.ok(section.includes('Ruling:'), 'ruling rule');
    assert.match(section, /must not merge|do not merge|no main integration/i);
  });
}

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { extractTask, taskSourceDigest } from '../scripts/process/k3_task_extract.js';

const PLAN = readFileSync(
  new URL('../docs/superpowers/plans/2026-09-29-k3-learner-evidence-engine.md', import.meta.url),
  'utf8'
);

test('extracts Task 5 exactly without Task 6 and preserves phase checkpoint text', () => {
  const task = extractTask(PLAN, 5);
  assert.match(task, /^### Task 5:/);
  assert.doesNotMatch(task, /^### Task 6:/m);
  assert.match(task, /Phase A checkpoint/);
  assert.equal((task.match(/^### Task 5:/gm) ?? []).length, 1);
});

test('extracts a middle task and final Task 41 without neighboring task bytes', () => {
  const middle = extractTask(PLAN, 23);
  assert.match(middle, /^### Task 23:/);
  assert.doesNotMatch(middle, /^### Task 22:/m);
  assert.doesNotMatch(middle, /^### Task 24:/m);

  const finalTask = extractTask(PLAN, 41);
  assert.match(finalTask, /^### Task 41:/);
  assert.equal((finalTask.match(/^### Task 41:/gm) ?? []).length, 1);
});

test('all remaining K3 Tasks 5-41 extract exactly once with stable digests', () => {
  for (let taskId = 5; taskId <= 41; taskId += 1) {
    const first = extractTask(PLAN, taskId);
    const second = extractTask(PLAN, taskId);
    assert.equal(first, second, `Task ${taskId} extraction changed`);
    assert.match(taskSourceDigest(first), /^[0-9a-f]{64}$/);
    assert.equal(taskSourceDigest(first), taskSourceDigest(second));
    assert.equal((first.match(new RegExp(`^### Task ${taskId}:`, 'gm')) ?? []).length, 1);
  }
});

test('missing or duplicate task headings fail closed', () => {
  assert.throws(() => extractTask(PLAN, 99), /TASK_PACKET_COMPILE_BLOCKED.*not found/);
  const duplicate = `${PLAN}\n### Task 5: Duplicate\n`;
  assert.throws(() => extractTask(duplicate, 5), /TASK_PACKET_COMPILE_BLOCKED.*duplicate/);
});

test('task-like headings inside fenced code are ignored', () => {
  const synthetic = [
    '### Task 5: Real',
    'before',
    '\`\`\`text',
    '### Task 6: Not a real task boundary',
    '\`\`\`',
    'after',
    '### Task 6: Real next task',
    'next',
    ''
  ].join('\n');
  const task = extractTask(synthetic, 5);
  assert.match(task, /Not a real task boundary/);
  assert.match(task, /after/);
  assert.doesNotMatch(task, /Real next task/);
});

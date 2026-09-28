import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const moduleUrl = new URL('../src/platform-kernel/providers/evalCases.js', import.meta.url);
const moduleExists = () => fs.existsSync(moduleUrl);

const finding = {
  finding_id: 'finding:provider:1',
  type: 'PROVIDER_FAILURE',
  input: { prompt: 'case input' },
  expected: { answer: 'expected answer' },
  evidence_refs: ['review:1'],
  created_at: '2026-09-28T00:00:00Z'
};

test('provider eval-case module exists', () => {
  assert.equal(moduleExists(), true);
});

test('createEvalCaseFromFinding creates a pending immutable candidate case', async () => {
  if (!moduleExists()) return;
  const { createEvalCaseFromFinding } = await import(moduleUrl);

  const result = createEvalCaseFromFinding(finding);

  assert.equal(result.source_finding_id, finding.finding_id);
  assert.equal(result.review_status, 'PENDING_REVIEW');
  assert.equal(result.gold_status, 'CANDIDATE');
  assert.deepEqual(result.input, finding.input);
  assert.deepEqual(result.expected, finding.expected);
  assert.deepEqual(result.evidence_refs, finding.evidence_refs);
  assert.equal(Object.isFrozen(result), true);

  finding.input.prompt = 'mutated after creation';
  assert.equal(result.input.prompt, 'case input');
});

test('createEvalCaseFromFinding rejects unsupported finding types', async () => {
  if (!moduleExists()) return;
  const { createEvalCaseFromFinding } = await import(moduleUrl);

  assert.throws(
    () => createEvalCaseFromFinding({
      ...finding,
      type: 'PRODUCT_USAGE_SIGNAL'
    }),
    /unsupported|finding type/i
  );
});

test('createEvalCaseFromFinding never accepts a caller supplied gold status', async () => {
  if (!moduleExists()) return;
  const { createEvalCaseFromFinding } = await import(moduleUrl);

  assert.throws(
    () => createEvalCaseFromFinding({
      ...finding,
      gold_status: 'GOLD'
    }),
    /gold|review/i
  );
});

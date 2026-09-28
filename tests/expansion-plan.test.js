import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const moduleUrl = new URL('../src/platform-kernel/coverage/expansionPlan.js', import.meta.url);
const moduleExists = () => fs.existsSync(moduleUrl);

const gap = (gap_id, requested_count) => ({
  schema_version: 1,
  gap_id,
  track_id: 'sdaia-ai-engineer',
  domain_id: 'mlops-llmops',
  objective_id: 'obj:1',
  concept_ids: ['concept:1'],
  misconception_ids: [],
  cognitive_level: 'apply',
  intended_difficulty: 'hard',
  languages: ['ar', 'en'],
  status: 'open',
  requested_count
});

const policyVersions = {
  source_policy_version: 'k1.source.grounded.v1',
  quality_policy_version: 'k1.quality.default.v1',
  review_policy_version: 'k1.review.default.v1',
  tranche_calibration_policy_version: 'k2.tranche.calibration.v1'
};

test('expansion plan builder module exists', () => {
  assert.equal(moduleExists(), true);
});

test('buildExpansionPlan creates stable coverage-derived plans', async () => {
  if (!moduleExists()) return;
  const { buildExpansionPlan } = await import(moduleUrl);
  const input = {
    trackId: 'sdaia-ai-engineer',
    gaps: [gap('gap:b', 2), gap('gap:a', 5)],
    context: {
      createdAt: '2026-09-28T00:00:00Z',
      sourceReadiness: { 'gap:a': true, 'gap:b': true }
    },
    policyVersions
  };

  const first = buildExpansionPlan(input);
  const second = buildExpansionPlan(input);

  assert.deepEqual(first, second);
  assert.equal(first.schema_version, 1);
  assert.equal(first.track_id, 'sdaia-ai-engineer');
  assert.deepEqual(first.coverage_gap_ids, ['gap:a', 'gap:b']);
  assert.deepEqual(first.priorities.map(x => x.rank), [1, 2]);
  assert.deepEqual(first.priorities.map(x => x.requested_count), [5, 2]);
  assert.deepEqual(first.tranche_refs, []);
  assert.deepEqual(first.policy_versions, policyVersions);
  assert.equal(first.status, 'PLANNED');
  assert.equal(first.created_at, '2026-09-28T00:00:00Z');
});

test('buildExpansionPlan rejects count-only expansion input', async () => {
  if (!moduleExists()) return;
  const { buildExpansionPlan } = await import(moduleUrl);
  assert.throws(
    () => buildExpansionPlan({
      trackId: 'sdaia-ai-engineer',
      gaps: [{ requested_count: 14000 }],
      context: { createdAt: '2026-09-28T00:00:00Z' },
      policyVersions
    }),
    /CoverageGapV1|gap_id/i
  );
});

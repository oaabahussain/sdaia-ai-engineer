import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const moduleUrl = new URL('../src/platform-kernel/orchestration/tranchePlan.js', import.meta.url);
const moduleExists = () => fs.existsSync(moduleUrl);

const expansionPlan = {
  schema_version: 1,
  plan_id: 'expansion:sdaia:k2:1',
  track_id: 'sdaia-ai-engineer',
  coverage_gap_ids: ['gap:a', 'gap:b'],
  priorities: [
    { gap_id: 'gap:a', rank: 1, reason: 'coverage_deficit', requested_count: 5 },
    { gap_id: 'gap:b', rank: 2, reason: 'coverage_deficit', requested_count: 2 }
  ],
  tranche_refs: [],
  policy_versions: {
    source_policy_version: 'k1.source.grounded.v1',
    quality_policy_version: 'k1.quality.default.v1',
    review_policy_version: 'k1.review.default.v1',
    tranche_calibration_policy_version: 'k2.tranche.calibration.v1'
  },
  status: 'PLANNED',
  created_at: '2026-09-28T00:00:00Z'
};

const trancheDecision = {
  decision: 'CONTINUE',
  requestedCount: 6,
  reason: 'within_guardrails',
  createdAt: '2026-09-28T01:00:00Z',
  riskDistribution: { low: 4, medium: 2, high: 0 },
  capacityInputs: { review_capacity: 20, recent_yield_rate: 0.75 }
};

const policyRefs = {
  source_policy_version: 'k1.source.grounded.v1',
  quality_policy_version: 'k1.quality.default.v1',
  review_policy_version: 'k1.review.default.v1',
  tranche_calibration_policy_version: 'k2.tranche.calibration.v1'
};

test('tranche plan builder module exists', () => {
  assert.equal(moduleExists(), true);
});

test('buildTranchePlan allocates only approved expansion gaps in priority order', async () => {
  if (!moduleExists()) return;
  const { buildTranchePlan } = await import(moduleUrl);

  const first = buildTranchePlan(expansionPlan, trancheDecision, policyRefs);
  const second = buildTranchePlan(expansionPlan, trancheDecision, policyRefs);

  assert.deepEqual(first, second);
  assert.equal(first.expansion_plan_id, expansionPlan.plan_id);
  assert.deepEqual(first.requests, [
    { coverage_gap_id: 'gap:a', requested_families: 5 },
    { coverage_gap_id: 'gap:b', requested_families: 1 }
  ]);
  assert.deepEqual(first.risk_distribution, trancheDecision.riskDistribution);
  assert.deepEqual(first.capacity_inputs, trancheDecision.capacityInputs);
  assert.equal(first.status, 'PLANNED');
  assert.equal(first.created_at, trancheDecision.createdAt);
});

test('buildTranchePlan rejects priorities outside the expansion plan lineage', async () => {
  if (!moduleExists()) return;
  const { buildTranchePlan } = await import(moduleUrl);
  const invalid = structuredClone(expansionPlan);
  invalid.priorities[1].gap_id = 'gap:not-approved';

  assert.throws(
    () => buildTranchePlan(invalid, trancheDecision, policyRefs),
    /coverage gap|lineage/i
  );
});

test('buildTranchePlan refuses HOLD decisions', async () => {
  if (!moduleExists()) return;
  const { buildTranchePlan } = await import(moduleUrl);
  assert.throws(
    () => buildTranchePlan(
      expansionPlan,
      { ...trancheDecision, decision: 'HOLD', requestedCount: null },
      policyRefs
    ),
    /HOLD|runnable/i
  );
});

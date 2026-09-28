import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const moduleUrl = new URL('../src/platform-kernel/policies/reviewCalibration.js', import.meta.url);
const moduleExists = () => fs.existsSync(moduleUrl);

const policy = {
  risk_rules: [
    { risk_class: 'high', decision: 'HUMAN_REQUIRED' },
    { risk_class: 'low', decision: 'SAMPLED', sampling_rate: 0.25 }
  ],
  mandatory_human_conditions: [
    'new_provider',
    'evidence_ambiguity',
    'bilingual_disagreement',
    'quarantined'
  ],
  escalation_triggers: [
    {
      metric: 'rejection_rate',
      operator: 'gte',
      threshold: 0.1,
      action: 'HUMAN_REQUIRED'
    }
  ]
};

test('review calibration module exists', () => {
  assert.equal(moduleExists(), true);
});

test('high-risk and mandatory conditions require human review', async () => {
  if (!moduleExists()) return;
  const { decideReviewRequirement } = await import(moduleUrl);

  const highRisk = decideReviewRequirement({
    policy,
    risk: 'high',
    observedMetrics: { rejection_rate: 0.01 },
    candidate: { id: 'item:1' }
  });
  assert.equal(highRisk.decision, 'HUMAN_REQUIRED');
  assert.equal(highRisk.selectedForReview, true);

  const newProvider = decideReviewRequirement({
    policy,
    risk: 'low',
    observedMetrics: { rejection_rate: 0.01 },
    candidate: { id: 'item:2', new_provider: true }
  });
  assert.equal(newProvider.decision, 'HUMAN_REQUIRED');
  assert.match(newProvider.reason, /new_provider/);
});

test('observed drift escalates low-risk sampling to human review', async () => {
  if (!moduleExists()) return;
  const { decideReviewRequirement } = await import(moduleUrl);

  const result = decideReviewRequirement({
    policy,
    risk: 'low',
    observedMetrics: { rejection_rate: 0.15 },
    candidate: { id: 'item:3' }
  });

  assert.equal(result.decision, 'HUMAN_REQUIRED');
  assert.equal(result.selectedForReview, true);
  assert.match(result.reason, /rejection_rate/);
});

test('sampled review selection is deterministic for the same candidate id', async () => {
  if (!moduleExists()) return;
  const { decideReviewRequirement } = await import(moduleUrl);

  const input = {
    policy,
    risk: 'low',
    observedMetrics: { rejection_rate: 0.01 },
    candidate: { id: 'item:stable' }
  };

  const first = decideReviewRequirement(input);
  const second = decideReviewRequirement(input);

  assert.equal(first.decision, 'SAMPLED');
  assert.equal(first.samplingRate, 0.25);
  assert.equal(first.selectedForReview, second.selectedForReview);
});

test('unknown risk class holds instead of silently auto-approving', async () => {
  if (!moduleExists()) return;
  const { decideReviewRequirement } = await import(moduleUrl);

  const result = decideReviewRequirement({
    policy,
    risk: 'unknown',
    observedMetrics: { rejection_rate: 0.01 },
    candidate: { id: 'item:4' }
  });

  assert.equal(result.decision, 'HOLD');
});

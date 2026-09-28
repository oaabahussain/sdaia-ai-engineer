import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const moduleUrl = new URL('../src/platform-kernel/orchestration/trancheMetrics.js', import.meta.url);
const moduleExists = () => fs.existsSync(moduleUrl);

test('tranche metrics module exists', () => {
  assert.equal(moduleExists(), true);
});

test('empty tranche evidence produces explicit unknown rates instead of false zeros', async () => {
  if (!moduleExists()) return;
  const { summarizeTrancheMetrics } = await import(moduleUrl);

  const out = summarizeTrancheMetrics({
    tranche_id: 't-empty',
    request_count: 0,
    completed: [],
    failed: []
  });

  assert.equal(out.yieldRate, null);
  assert.equal(out.failureRate, null);
  assert.equal(out.duplicateRate, null);
  assert.equal(out.evidenceFailureRate, null);
  assert.equal(out.bilingualFailureRate, null);
  assert.equal(out.reviewEscalationRate, null);
  assert.equal(out.reviewBacklog, null);
  assert.equal(out.reviewQueueLatencyMs, null);
  assert.equal(out.stageOutcomes.known, false);
});

test('tranche metrics deterministically summarize quality signals and queue inputs', async () => {
  if (!moduleExists()) return;
  const { summarizeTrancheMetrics } = await import(moduleUrl);

  const out = summarizeTrancheMetrics({
    tranche_id: 't-1',
    request_count: 4,
    completed: [
      {
        run_id: 'a',
        quality_signals: {
          duplicate: false,
          evidence_status: 'PASS',
          bilingual_status: 'PASS',
          review_status: 'AUTO_ELIGIBLE'
        },
        stage_outcomes: {
          generate: 'PASS',
          evidence: 'PASS',
          bilingual: 'PASS',
          review: 'PASS'
        }
      },
      {
        run_id: 'b',
        quality_signals: {
          duplicate: true,
          evidence_status: 'FAIL',
          bilingual_status: 'REVIEW_REQUIRED',
          review_status: 'HUMAN_REQUIRED'
        },
        stage_outcomes: {
          generate: 'PASS',
          evidence: 'FAIL',
          bilingual: 'ABSTAIN',
          review: 'ABSTAIN'
        }
      },
      {
        run_id: 'c',
        quality_signals: {
          duplicate: false,
          evidence_status: 'PASS',
          bilingual_status: 'PASS',
          review_status: 'AUTO_ELIGIBLE'
        },
        stage_outcomes: {
          generate: 'PASS',
          evidence: 'PASS',
          bilingual: 'PASS',
          review: 'PASS'
        }
      }
    ],
    failed: [
      { run_id: 'd', stage: 'generate', error: 'boom', retryable: true }
    ]
  }, {
    reviewBacklog: 7,
    reviewQueueLatencyMs: 1250
  });

  assert.equal(out.yieldRate, 0.75);
  assert.equal(out.failureRate, 0.25);
  assert.equal(out.duplicateRate, 1 / 3);
  assert.equal(out.evidenceFailureRate, 1 / 3);
  assert.equal(out.bilingualFailureRate, 1 / 3);
  assert.equal(out.reviewEscalationRate, 1 / 3);
  assert.equal(out.reviewBacklog, 7);
  assert.equal(out.reviewQueueLatencyMs, 1250);
  assert.deepEqual(out.stageOutcomes.counts.generate, {
    PASS: 3,
    FAIL: 1,
    ABSTAIN: 0
  });
  assert.deepEqual(out.stageOutcomes.counts.evidence, {
    PASS: 2,
    FAIL: 1,
    ABSTAIN: 0
  });
  assert.deepEqual(out.stageOutcomes.counts.bilingual, {
    PASS: 2,
    FAIL: 0,
    ABSTAIN: 1
  });
});

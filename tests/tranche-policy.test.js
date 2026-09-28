import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const moduleUrl = new URL('../src/platform-kernel/orchestration/tranchePolicy.js', import.meta.url);
const moduleExists = () => fs.existsSync(moduleUrl);

const policy = {
  min_count: 4,
  max_count: 40,
  expand_yield_rate: 0.85,
  contract_yield_rate: 0.6,
  max_failure_rate: 0.2,
  max_review_backlog: 20,
  expansion_factor: 1.5,
  contraction_factor: 0.5
};

test('tranche policy module exists', () => {
  assert.equal(moduleExists(), true);
});

test('adaptive tranche policy holds instead of guessing when evidence is insufficient', async () => {
  if (!moduleExists()) return;
  const { decideNextTranche } = await import(moduleUrl);
  assert.deepEqual(
    decideNextTranche(policy, {}, { requestedCount: 20 }),
    {
      decision: 'HOLD',
      requestedCount: null,
      reason: 'insufficient_metrics'
    }
  );
});

test('adaptive tranche policy contracts or holds when quality capacity worsens', async () => {
  if (!moduleExists()) return;
  const { decideNextTranche } = await import(moduleUrl);

  assert.deepEqual(
    decideNextTranche(
      policy,
      { yieldRate: 0.5, failureRate: 0.1, reviewBacklog: 5 },
      { requestedCount: 20 }
    ),
    {
      decision: 'CONTRACT',
      requestedCount: 10,
      reason: 'yield_below_contract_guardrail'
    }
  );

  assert.deepEqual(
    decideNextTranche(
      policy,
      { yieldRate: 0.9, failureRate: 0.3, reviewBacklog: 5 },
      { requestedCount: 20 }
    ),
    {
      decision: 'HOLD',
      requestedCount: 20,
      reason: 'failure_rate_guardrail'
    }
  );

  assert.deepEqual(
    decideNextTranche(
      policy,
      { yieldRate: 0.9, failureRate: 0.1, reviewBacklog: 25 },
      { requestedCount: 20 }
    ),
    {
      decision: 'HOLD',
      requestedCount: 20,
      reason: 'review_backlog_guardrail'
    }
  );
});

test('adaptive tranche policy expands only within calibrated policy bounds', async () => {
  if (!moduleExists()) return;
  const { decideNextTranche } = await import(moduleUrl);

  assert.deepEqual(
    decideNextTranche(
      policy,
      { yieldRate: 0.9, failureRate: 0.05, reviewBacklog: 3 },
      { requestedCount: 20 }
    ),
    {
      decision: 'EXPAND',
      requestedCount: 30,
      reason: 'yield_supports_expansion'
    }
  );

  assert.deepEqual(
    decideNextTranche(
      policy,
      { yieldRate: 0.9, failureRate: 0.05, reviewBacklog: 3 },
      { requestedCount: 35 }
    ),
    {
      decision: 'EXPAND',
      requestedCount: 40,
      reason: 'yield_supports_expansion'
    }
  );
});


test('adaptive follow-up decision consumes tranche evidence summary directly', async () => {
  const { decideNextTrancheFromEvidence } = await import(
    '../src/platform-kernel/orchestration/tranchePolicy.js'
  );

  const degraded = {
    tranche_id: 't-degraded',
    request_count: 10,
    completed: [
      { run_id: 'a' },
      { run_id: 'b' },
      { run_id: 'c' },
      { run_id: 'd' },
      { run_id: 'e' }
    ],
    failed: [
      { run_id: 'f', stage: 'generate' },
      { run_id: 'g', stage: 'generate' },
      { run_id: 'h', stage: 'generate' },
      { run_id: 'i', stage: 'generate' },
      { run_id: 'j', stage: 'generate' }
    ]
  };

  assert.deepEqual(
    decideNextTrancheFromEvidence(
      policy,
      degraded,
      { reviewBacklog: 5 },
      { requestedCount: 20 }
    ),
    {
      decision: 'HOLD',
      requestedCount: 20,
      reason: 'failure_rate_guardrail'
    }
  );

  const recoverable = {
    tranche_id: 't-recoverable',
    request_count: 10,
    completed: [
      { run_id: 'a' },
      { run_id: 'b' },
      { run_id: 'c' },
      { run_id: 'd' },
      { run_id: 'e' }
    ],
    failed: []
  };

  assert.deepEqual(
    decideNextTrancheFromEvidence(
      policy,
      recoverable,
      { reviewBacklog: 5 },
      { requestedCount: 20 }
    ),
    {
      decision: 'CONTRACT',
      requestedCount: 10,
      reason: 'yield_below_contract_guardrail'
    }
  );
});

test('adaptive follow-up decision holds on unknown tranche evidence', async () => {
  const { decideNextTrancheFromEvidence } = await import(
    '../src/platform-kernel/orchestration/tranchePolicy.js'
  );

  assert.deepEqual(
    decideNextTrancheFromEvidence(
      policy,
      {
        tranche_id: 't-empty',
        request_count: 0,
        completed: [],
        failed: []
      },
      { reviewBacklog: 0 },
      { requestedCount: 20 }
    ),
    {
      decision: 'HOLD',
      requestedCount: null,
      reason: 'insufficient_metrics'
    }
  );
});

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const moduleUrl = new URL('../src/platform-kernel/orchestration/trancheRunner.js', import.meta.url);
const moduleExists = () => fs.existsSync(moduleUrl);

const tranchePlan = {
  schema_version: 1,
  tranche_id: 'tranche:k2:001',
  expansion_plan_id: 'expansion:k2:001',
  track_id: 'sdaia-ai-engineer',
  requests: [
    { coverage_gap_id: 'gap:a', requested_families: 2 },
    { coverage_gap_id: 'gap:b', requested_families: 1 }
  ],
  policy_refs: {
    source_policy_version: 'source:v1',
    quality_policy_version: 'quality:v1',
    review_policy_version: 'review:v1',
    tranche_calibration_policy_version: 'tranche:v1'
  },
  risk_distribution: { low: 2, medium: 1, high: 0 },
  capacity_inputs: { review_capacity: 10, recent_yield_rate: 0.8 },
  status: 'PLANNED',
  created_at: '2026-09-28T00:00:00Z'
};

const buildRequest = ({ request, indexWithinGap, globalIndex }) => ({
  run_id: `run:${request.coverage_gap_id}:${indexWithinGap}`,
  target_id: `family:${globalIndex}`,
  input: {
    coverage_gap_id: request.coverage_gap_id
  }
});

test('tranche runner module exists', () => {
  assert.equal(moduleExists(), true);
});

test('runTranche executes concrete requests sequentially through the runner', async () => {
  if (!moduleExists()) return;
  const { runTranche } = await import(moduleUrl);

  const calls = [];
  const runner = {
    async runCandidate(request) {
      calls.push(request.run_id);
      return { run_id: request.run_id, status: 'completed' };
    }
  };

  const result = await runTranche(tranchePlan, runner, {
    approved: true,
    buildRequest
  });

  assert.equal(result.status, 'COMPLETED');
  assert.equal(result.tranche_id, tranchePlan.tranche_id);
  assert.equal(result.request_count, 3);
  assert.deepEqual(calls, ['run:gap:a:0', 'run:gap:a:1', 'run:gap:b:0']);
  assert.deepEqual(result.completed.map(x => x.run_id), calls);
  assert.deepEqual(result.failed, []);
});

test('runTranche refuses unapproved or non-planned tranches', async () => {
  if (!moduleExists()) return;
  const { runTranche } = await import(moduleUrl);
  const runner = { async runCandidate() { return {}; } };

  await assert.rejects(
    () => runTranche(tranchePlan, runner, {
      approved: false,
      buildRequest
    }),
    /approved|authorization/i
  );

  await assert.rejects(
    () => runTranche({ ...tranchePlan, status: 'PAUSED' }, runner, {
      approved: true,
      buildRequest
    }),
    /PLANNED|runnable/i
  );
});

test('runTranche reports mixed candidate outcomes as PARTIAL without losing successes', async () => {
  if (!moduleExists()) return;
  const { runTranche } = await import(moduleUrl);

  const runner = {
    async runCandidate(request) {
      if (request.run_id === 'run:gap:a:1') throw new Error('candidate failed');
      return { run_id: request.run_id, status: 'completed' };
    }
  };

  const result = await runTranche(tranchePlan, runner, {
    approved: true,
    buildRequest
  });

  assert.equal(result.status, 'PARTIAL');
  assert.deepEqual(
    result.completed.map(x => x.run_id),
    ['run:gap:a:0', 'run:gap:b:0']
  );
  assert.equal(result.failed.length, 1);
  assert.equal(result.failed[0].run_id, 'run:gap:a:1');
  assert.match(result.failed[0].error, /candidate failed/);
});


test('resumeTranche skips durable successes and resumes failed runs', async () => {
  if (!moduleExists()) return;
  const { resumeTranche } = await import(moduleUrl);

  const calls = [];
  const runner = {
    async runCandidate(request) {
      calls.push(['runCandidate', request.run_id]);
      return { run_id: request.run_id, status: 'completed' };
    },
    async resumeRun(runId) {
      calls.push(['resumeRun', runId]);
      return { run_id: runId, status: 'completed' };
    }
  };

  const previous = {
    tranche_id: tranchePlan.tranche_id,
    status: 'PARTIAL',
    request_count: 3,
    completed: [
      { run_id: 'run:gap:a:0', status: 'completed' }
    ],
    failed: [
      {
        run_id: 'run:gap:a:1',
        target_id: 'family:1',
        coverage_gap_id: 'gap:a',
        error: 'transient',
        retryable: true
      }
    ]
  };

  const result = await resumeTranche(tranchePlan, runner, previous, {
    approved: true,
    buildRequest
  });

  assert.equal(result.status, 'COMPLETED');
  assert.deepEqual(calls, [
    ['resumeRun', 'run:gap:a:1'],
    ['runCandidate', 'run:gap:b:0']
  ]);
  assert.deepEqual(
    result.completed.map(x => x.run_id).sort(),
    ['run:gap:a:0', 'run:gap:a:1', 'run:gap:b:0'].sort()
  );
});

test('retryFailedTrancheItems retries only failed items and preserves durable successes', async () => {
  if (!moduleExists()) return;
  const { retryFailedTrancheItems } = await import(moduleUrl);

  const calls = [];
  const runner = {
    async retryStage(runId, stage) {
      calls.push([runId, stage]);
      return { run_id: runId, status: 'completed' };
    }
  };

  const previous = {
    tranche_id: tranchePlan.tranche_id,
    status: 'PARTIAL',
    request_count: 3,
    completed: [
      { run_id: 'run:gap:a:0', status: 'completed' },
      { run_id: 'run:gap:b:0', status: 'completed' }
    ],
    failed: [
      {
        run_id: 'run:gap:a:1',
        target_id: 'family:1',
        coverage_gap_id: 'gap:a',
        stage: 'evidence',
        error: 'transient',
        retryable: true
      }
    ]
  };

  const result = await retryFailedTrancheItems(
    tranchePlan,
    runner,
    previous,
    {
      approved: true,
      buildRequest
    }
  );

  assert.equal(result.status, 'COMPLETED');
  assert.deepEqual(calls, [['run:gap:a:1', 'evidence']]);
  assert.deepEqual(
    result.completed.map(x => x.run_id).sort(),
    ['run:gap:a:0', 'run:gap:a:1', 'run:gap:b:0'].sort()
  );
  assert.deepEqual(result.failed, []);
});


test('partial tranche failure records the exact failed stage while preserving successful siblings', async () => {
  if (!moduleExists()) return;
  const { runTranche } = await import(moduleUrl);

  const runner = {
    async runCandidate(request) {
      if (request.run_id === 'run:gap:a:1') {
        const error = new Error('evidence mismatch');
        error.factory_stage = 'evidence';
        throw error;
      }
      return { run_id: request.run_id, status: 'completed' };
    }
  };

  const result = await runTranche(tranchePlan, runner, {
    approved: true,
    buildRequest
  });

  assert.equal(result.status, 'PARTIAL');
  assert.deepEqual(
    result.completed.map(x => x.run_id),
    ['run:gap:a:0', 'run:gap:b:0']
  );
  assert.equal(result.failed[0].run_id, 'run:gap:a:1');
  assert.equal(result.failed[0].stage, 'evidence');
  assert.match(result.failed[0].error, /evidence mismatch/);
});


test('tranche failure preserves explicit non-retryable classification', async () => {
  const { runTranche } = await import(moduleUrl);
  const runner = {
    async runCandidate(request) {
      if (request.run_id === 'run:gap:a:0') {
        const error = new Error('permanent validation failure');
        error.factory_stage = 'validate';
        error.retryable = false;
        throw error;
      }
      return { run_id: request.run_id, status: 'completed' };
    }
  };
  const result = await runTranche(tranchePlan, runner, { approved:true, buildRequest });
  const failed = result.failed.find(item => item.run_id === 'run:gap:a:0');
  assert.equal(failed.retryable, false);
});

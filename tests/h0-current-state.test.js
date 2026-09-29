import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { validateCurrentState } from '../scripts/validate_current_state.js';

const SHA_A = 'a'.repeat(40);
const SHA_B = 'b'.repeat(40);
const SPEC_SHA = 'c'.repeat(40);
const PLAN_SHA = 'd'.repeat(40);

const allPassGates = {
  REPO_CONTEXT_READY: 'PASS',
  STATE_MANIFEST_VALID: 'PASS',
  PLAN_SPEC_HASH_MATCH: 'PASS',
  TASKS_1_4_DURABLY_VERIFIED: 'PASS',
  PROCESS_GUARDS_READY: 'PASS',
  ISOLATED_WORKSPACE_READY: 'PASS',
  BASELINE_GREEN: 'PASS',
  ACTIVE_REF_RESOLUTION_VALID: 'PASS',
  K3_TASK_BRIEFS_SELF_CONTAINED: 'PASS',
  PROJECT_BOOTSTRAP_CURRENT: 'PASS'
};

function state(overrides = {}) {
  return {
    schema_version: 1,
    state_revision: 1,
    programme: 'K3',
    phase: 'A',
    status: 'EXECUTING',
    execution_branch: 'impl/k3-learner-evidence-engine',
    base_main_sha: null,
    completed_through_task: 4,
    next_task: 5,
    spec_path: 'docs/superpowers/specs/2026-09-29-k3-learner-evidence-engine-design.md',
    spec_blob_sha: SPEC_SHA,
    plan_path: 'docs/superpowers/plans/2026-09-29-k3-learner-evidence-engine.md',
    plan_blob_sha: PLAN_SHA,
    ledger_path: 'docs/superpowers/reviews/2026-09-29-k3-execution-ledger.md',
    checkpoint_path: 'docs/superpowers/reviews/2026-09-29-k3-h0-checkpoint.md',
    open_critical_findings: 0,
    open_important_findings: 0,
    last_verified_scope: 'K3_TASKS_1_4',
    gates: { ...allPassGates, PROJECT_BOOTSTRAP_CURRENT: 'FAIL' },
    low_model_ready: false,
    merge_guard_mode: 'HIGH_REASONING_MERGE_GATE',
    project_bootstrap_revision: null,
    updated_at: '2026-09-29T18:00:00Z',
    ...overrides
  };
}

function context(overrides = {}) {
  return {
    liveMainSha: SHA_A,
    sourceRef: 'main',
    specBlobSha: SPEC_SHA,
    planBlobSha: PLAN_SHA,
    ledgerText: 'Task 1 — RETROSPECTIVE VERIFIED\nTask 2 — RETROSPECTIVE VERIFIED\nTask 3 — RETROSPECTIVE VERIFIED\nTask 4 — RETROSPECTIVE VERIFIED\n',
    minimumStateRevision: 1,
    existingPaths: [
      'docs/superpowers/specs/2026-09-29-k3-learner-evidence-engine-design.md',
      'docs/superpowers/plans/2026-09-29-k3-learner-evidence-engine.md',
      'docs/superpowers/reviews/2026-09-29-k3-execution-ledger.md',
      'docs/superpowers/reviews/2026-09-29-k3-h0-checkpoint.md'
    ],
    ...overrides
  };
}

test('accepts revision-1 main state with low-model readiness false', () => {
  const result = validateCurrentState(state(), context());
  assert.equal(result.ok, true);
  assert.equal(result.code, 'STATE_VALID');
});

test('accepts revision-2 execution state when base main matches and all readiness gates pass', () => {
  const s = state({
    state_revision: 2,
    base_main_sha: SHA_A,
    gates: { ...allPassGates },
    low_model_ready: true,
    project_bootstrap_revision: 'k3-h0-v1'
  });
  const result = validateCurrentState(s, context({ sourceRef: 'impl/k3-learner-evidence-engine', minimumStateRevision: 1 }));
  assert.equal(result.ok, true);
});

test('rejects non-sequential task state', () => {
  const result = validateCurrentState(state({ next_task: 7 }), context());
  assert.equal(result.ok, false);
  assert.equal(result.code, 'TASK_SEQUENCE_INVALID');
});

test('rejects state revision regression', () => {
  const result = validateCurrentState(state({ state_revision: 1 }), context({ minimumStateRevision: 2 }));
  assert.equal(result.ok, false);
  assert.equal(result.code, 'STATE_REVISION_REGRESSION');
});

test('rejects main drift for an execution branch', () => {
  const result = validateCurrentState(state({ state_revision: 2, base_main_sha: SHA_B }), context({ sourceRef: 'impl/k3-learner-evidence-engine' }));
  assert.equal(result.ok, false);
  assert.equal(result.code, 'MAIN_DRIFT');
});

test('rejects spec or plan blob drift', () => {
  const result = validateCurrentState(state(), context({ specBlobSha: SHA_B }));
  assert.equal(result.ok, false);
  assert.equal(result.code, 'PLAN_SPEC_HASH_MISMATCH');
});

test('rejects missing durable ledger completion', () => {
  const result = validateCurrentState(state(), context({ ledgerText: 'Task 1 — RETROSPECTIVE VERIFIED\nTask 2 — RETROSPECTIVE VERIFIED\n' }));
  assert.equal(result.ok, false);
  assert.equal(result.code, 'LEDGER_INCOMPLETE');
});

test('rejects readiness when any gate is not PASS', () => {
  const result = validateCurrentState(state({
    state_revision: 2, base_main_sha: SHA_A, low_model_ready: true, project_bootstrap_revision: 'k3-h0-v1'
  }), context({ sourceRef: 'impl/k3-learner-evidence-engine' }));
  assert.equal(result.ok, false);
  assert.equal(result.code, 'LOW_MODEL_GATE_INVALID');
});

test('rejects readiness with open Critical or Important findings', () => {
  const s = state({
    state_revision: 2, base_main_sha: SHA_A, gates: { ...allPassGates }, low_model_ready: true,
    project_bootstrap_revision: 'k3-h0-v1', open_important_findings: 1
  });
  const result = validateCurrentState(s, context({ sourceRef: 'impl/k3-learner-evidence-engine' }));
  assert.equal(result.ok, false);
  assert.equal(result.code, 'LOW_MODEL_GATE_INVALID');
});

test('rejects readiness when Project bootstrap gate is stale', () => {
  const s = state({ state_revision: 2, base_main_sha: SHA_A, low_model_ready: true, project_bootstrap_revision: 'k3-h0-v1' });
  const result = validateCurrentState(s, context({ sourceRef: 'impl/k3-learner-evidence-engine' }));
  assert.equal(result.ok, false);
  assert.equal(result.code, 'LOW_MODEL_GATE_INVALID');
});

test('rejects unapproved execution branch name', () => {
  const result = validateCurrentState(state({ execution_branch: 'impl/other' }), context());
  assert.equal(result.ok, false);
  assert.equal(result.code, 'EXECUTION_BRANCH_INVALID');
});

test('rejects a missing referenced execution artifact', () => {
  const result = validateCurrentState(state(), context({ existingPaths: [
    'docs/superpowers/specs/2026-09-29-k3-learner-evidence-engine-design.md',
    'docs/superpowers/plans/2026-09-29-k3-learner-evidence-engine.md',
    'docs/superpowers/reviews/2026-09-29-k3-execution-ledger.md'
  ] }));
  assert.equal(result.ok, false);
  assert.equal(result.code, 'STATE_REFERENCE_MISSING');
});


test('repository revision-1 state is real, frozen, and intentionally not low-model ready', () => {
  const statePath = 'docs/superpowers/state/CURRENT-STATE.json';
  const ledgerPath = 'docs/superpowers/reviews/2026-09-29-k3-execution-ledger.md';
  assert.equal(existsSync(statePath), true, 'CURRENT-STATE.json must exist');
  assert.equal(existsSync(ledgerPath), true, 'durable K3 ledger must exist');
  const actual = JSON.parse(readFileSync(statePath, 'utf8'));
  const ledger = readFileSync(ledgerPath, 'utf8');
  const existingPaths = [actual.spec_path, actual.plan_path, actual.ledger_path, actual.checkpoint_path]
    .filter((p) => existsSync(p));
  const blob = (p) => execFileSync('git', ['rev-parse', 'HEAD:' + p], { encoding: 'utf8' }).trim();
  const checked = validateCurrentState(actual, {
    liveMainSha: SHA_A,
    sourceRef: 'main',
    specBlobSha: blob(actual.spec_path),
    planBlobSha: blob(actual.plan_path),
    ledgerText: ledger,
    existingPaths,
    minimumStateRevision: 1
  });
  assert.equal(checked.ok, true, JSON.stringify(checked));
  assert.equal(actual.state_revision, 1);
  assert.equal(actual.completed_through_task, 4);
  assert.equal(actual.next_task, 5);
  assert.equal(actual.low_model_ready, false);
  assert.equal(actual.gates.K3_TASK_BRIEFS_SELF_CONTAINED, 'PASS');
  assert.equal(actual.gates.TASKS_1_4_DURABLY_VERIFIED, 'PASS');
});

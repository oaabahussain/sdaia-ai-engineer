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
  PROJECT_BOOTSTRAP_CURRENT: 'PASS',
  PROCESS_FAILURE_RULES_VALID: 'PASS',
  TASK_PACKET_SCHEMA_VALID: 'PASS',
  TASK_PACKET_COMPILER_VALID: 'PASS',
  TASK_EXECUTION_BINDER_VALID: 'PASS',
  ALL_REMAINING_TASK_PACKETS_VALID: 'PASS',
  TASK_PACKET_DETERMINISM_VALID: 'PASS',
  TASK_SCOPE_GUARD_VALID: 'PASS',
  BEHAVIORAL_RED_GUARD_VALID: 'PASS',
  ACCEPTED_RED_FREEZE_VALID: 'PASS',
  DYNAMIC_REF_GUARD_VALID: 'PASS',
  TEST_CONTRACT_GUARD_VALID: 'PASS',
  RUNTIME_CAPABILITY_PROFILE_VALID: 'PASS',
  RESULT_VALIDATOR_VALID: 'PASS',
  CI_EXECUTION_MODEL_VALID: 'PASS',
  TASK5_DRY_RUN_PASS: 'PASS',
  ADVERSARIAL_READINESS_PASS: 'PASS',
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

test('accepts a fresh K3 execution branch when state and source ref agree', () => {
  const branch = 'impl/k3-task26-statev2-transition';
  const s = state({
    state_revision: 49,
    execution_branch: branch,
    base_main_sha: SHA_A,
    gates: { ...allPassGates },
    low_model_ready: true,
    project_bootstrap_revision: 'k3-h0-r2-v1'
  });
  const result = validateCurrentState(s, context({ sourceRef: branch }));
  assert.equal(result.ok, true, JSON.stringify(result));
});

test('rejects an execution state when checkout ref differs from the bound execution branch', () => {
  const branch = 'impl/k3-task26-statev2-transition';
  const result = validateCurrentState(
    state({ state_revision: 49, execution_branch: branch, base_main_sha: SHA_A }),
    context({ sourceRef: 'impl/k3-other' })
  );
  assert.equal(result.ok, false);
  assert.equal(result.code, 'EXECUTION_BRANCH_INVALID');
});

test('rejects an execution state when checkout ref is unavailable', () => {
  const branch = 'impl/k3-task26-statev2-transition';
  const result = validateCurrentState(
    state({ state_revision: 49, execution_branch: branch, base_main_sha: SHA_A }),
    context({ sourceRef: '' })
  );
  assert.equal(result.ok, false);
  assert.equal(result.code, 'EXECUTION_BRANCH_INVALID');
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


test('repository current state is real and validates against its recorded live-main base', () => {
  const statePath = 'docs/superpowers/state/CURRENT-STATE.json';
  const ledgerPath = 'docs/superpowers/reviews/2026-09-29-k3-execution-ledger.md';
  assert.equal(existsSync(statePath), true, 'CURRENT-STATE.json must exist');
  assert.equal(existsSync(ledgerPath), true, 'durable K3 ledger must exist');
  const actual = JSON.parse(readFileSync(statePath, 'utf8'));
  const ledger = readFileSync(ledgerPath, 'utf8');
  const existingPaths = [actual.spec_path, actual.plan_path, actual.ledger_path, actual.checkpoint_path]
    .filter((p) => existsSync(p));
  const blob = (p) => execFileSync('git', ['rev-parse', 'HEAD:' + p], { encoding: 'utf8' }).trim();
  const liveMainSha = actual.base_main_sha ?? SHA_A;
  const sourceRef = actual.base_main_sha ? actual.execution_branch : 'main';
  const checked = validateCurrentState(actual, {
    liveMainSha,
    sourceRef,
    specBlobSha: blob(actual.spec_path),
    planBlobSha: blob(actual.plan_path),
    ledgerText: ledger,
    existingPaths,
    minimumStateRevision: 1
  });
  assert.equal(checked.ok, true, JSON.stringify(checked));
  assert.ok(actual.state_revision >= 1);
  assert.ok(actual.completed_through_task >= 4);
  assert.equal(actual.next_task, actual.completed_through_task + 1);
  assert.equal(actual.gates.K3_TASK_BRIEFS_SELF_CONTAINED, 'PASS');
  assert.equal(actual.gates.TASKS_1_4_DURABLY_VERIFIED, 'PASS');
});

test('CURRENT-STATE CLI validates the real repository state', () => {
  const actual = JSON.parse(readFileSync('docs/superpowers/state/CURRENT-STATE.json', 'utf8'));
  const liveMainSha = actual.base_main_sha ?? 'a'.repeat(40);
  const sourceRef = actual.base_main_sha ? actual.execution_branch : 'main';
  const output = execFileSync(
    process.execPath,
    ['scripts/validate_current_state.js','--live-main-sha',liveMainSha,'--json'],
    { encoding:'utf8', env:{...process.env, GITHUB_REF_NAME:sourceRef} }
  );
  const checked = JSON.parse(output.trim());
  assert.equal(checked.ok, true, JSON.stringify(checked));
  assert.equal(checked.code, 'STATE_VALID');
  assert.equal(checked.details.next_task, actual.next_task);
  assert.equal(checked.details.low_model_ready, actual.low_model_ready);
});

test('process guard record agrees with current state and keeps integration high-reasoning', () => {
  const guardPath = new URL('../docs/superpowers/reviews/2026-09-29-k3-h0-process-guard.md', import.meta.url);
  assert.equal(existsSync(guardPath), true, 'process guard record must exist');
  const guard = readFileSync(guardPath, 'utf8');
  const current = JSON.parse(readFileSync(new URL('../docs/superpowers/state/CURRENT-STATE.json', import.meta.url), 'utf8'));
  assert.equal(current.merge_guard_mode, 'HIGH_REASONING_MERGE_GATE');
  assert.match(guard, /HIGH_REASONING_MERGE_GATE/);
  assert.match(guard, /must not.*(?:merge|push).*main/i);
  assert.match(guard, /whole-branch review/i);
  assert.match(guard, /exact-head/i);
  assert.equal(current.gates.PROCESS_GUARDS_READY, 'PASS');
  if (current.low_model_ready) {
    assert.equal(current.merge_guard_mode, 'HIGH_REASONING_MERGE_GATE');
    assert.match(guard, /must not.*(?:merge|push).*main/i);
  }
});

test('CURRENT-STATE CLI regression is not pinned to a historical main SHA', () => {
  const source = readFileSync(new URL('./h0-current-state.test.js', import.meta.url), 'utf8');
  assert.doesNotMatch(
    source,
    /\['scripts\/validate_current_state\.js','--live-main-sha','[0-9a-f]{40}','--json'\]/
  );
});

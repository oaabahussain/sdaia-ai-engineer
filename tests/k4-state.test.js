import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { validateK4State } from '../scripts/process/validate_k4_state.js';

const MAIN = '9e55881e9480b4a02d8ef5d92a0b21a9313492f1';
const SPEC = 'd732ac22161d4b007a8f869cbc928ec6737a40a8';
const PLAN = 'edda6ef11fb353d7403098d79400fc783e2f21f1';
const BRANCH = 'impl/k4-native-tdd-2026-10-09';
const context = {
  liveMainSha: MAIN, specBlobSha: SPEC, planBlobSha: PLAN, executionRef: BRANCH
};
function fixture(overrides = {}) {
  return {
    schema_version: 1,
    state_revision: 1,
    programme: 'K4',
    phase: 'A',
    status: 'EXECUTING',
    execution_branch: BRANCH,
    base_main_sha: MAIN,
    spec_path: 'docs/superpowers/specs/2026-10-08-k4-next-best-action-spaced-practice-design.md',
    spec_blob_sha: SPEC,
    plan_path: 'docs/superpowers/plans/2026-10-09-k4-next-best-action-spaced-practice.md',
    plan_blob_sha: PLAN,
    spec_approval: { status: 'APPROVED', git_blob_sha: SPEC },
    plan_approval: { status: 'APPROVED', git_blob_sha: PLAN },
    completed_through_task: 0,
    next_task: 1,
    open_critical_findings: 0,
    open_important_findings: 0,
    gates: {
      SPEC_APPROVED: 'PASS',
      PLAN_APPROVED: 'PASS',
      ISOLATED_SOURCE_READY: 'PASS',
      BASELINE_CI_GREEN: 'PASS'
    },
    merge_guard_mode: 'HIGH_REASONING_MERGE_GATE',
    updated_at: '2026-10-09T00:00:00Z',
    ...overrides
  };
}
function denial(state, ctx = context) {
  const result = validateK4State({ state, ...ctx });
  assert.equal(result.ok, false, JSON.stringify(result));
  assert.notEqual(result.code, 'STATE_VALID');
}

test('K4 state accepts exact independently approved spec/plan and current isolated ref', () => {
  const result = validateK4State({ state: fixture(), ...context });
  assert.equal(result.ok, true, JSON.stringify(result));
  assert.equal(result.code, 'STATE_VALID');
});

test('K4 state fails closed when either source Git blob changes', () => {
  denial(fixture(), { ...context, specBlobSha: 'a'.repeat(40) });
  denial(fixture(), { ...context, planBlobSha: 'b'.repeat(40) });
  denial(fixture({ plan_approval: { status:'PENDING', git_blob_sha:PLAN } }));
  denial(fixture({ spec_approval: { status:'PENDING', git_blob_sha:SPEC } }));
});

test('K4 state denies changed main or execution branch', () => {
  denial(fixture(), { ...context, liveMainSha:'b'.repeat(40) });
  denial(fixture(), { ...context, executionRef:'main' });
  denial(fixture({ base_main_sha:null }));
  denial(fixture({ execution_branch:'main' }));
});

test('K4 state denies open Critical/Important or incomplete gates', () => {
  denial(fixture({open_important_findings:1}));
  denial(fixture({open_critical_findings:1}));
  denial(fixture({gates:{...fixture().gates,BASELINE_CI_GREEN:'PENDING'}}));
  denial(fixture({merge_guard_mode:'RULESET'}));
});

test('K4 state has unambiguous sequence and forbids K3 schema reuse', () => {
  denial(fixture({programme:'K3'}));
  denial(fixture({next_task:4}));
  denial(fixture({state_revision:0}));
  denial(fixture({bogus:'unexpected'}));
});

test('closed K3 state remains untouched by K4 and is not an execution grant', () => {
  const old = JSON.parse(readFileSync(new URL('../docs/superpowers/state/CURRENT-STATE.json', import.meta.url), 'utf8'));
  assert.equal(old.programme, 'K3');
  assert.equal(old.status, 'COMPLETE');
  assert.equal(old.state_revision, 76);
  assert.equal(old.low_model_ready, false);
  assert.equal(old.gates.ACTIVE_REF_RESOLUTION_VALID, 'PENDING');
});

test('actual K4 manifest validates through K4 preflight CLI with Git blob pins', () => {
  const state = JSON.parse(readFileSync(new URL('../docs/superpowers/state/K4-CURRENT-STATE.json', import.meta.url), 'utf8'));
  const main = state.status === 'COMPLETE' ? state.merged_main_sha : state.base_main_sha;
  const executionRef = state.status === 'COMPLETE' ? 'main' : state.execution_branch;
  const result = execFileSync(process.execPath, [
    'scripts/process/validate_k4_state.js',
    '--live-main-sha',main,'--source-ref',executionRef,'--json'
  ], { encoding:'utf8' }).trim();
  assert.equal(JSON.parse(result).code, 'STATE_VALID', result);
});

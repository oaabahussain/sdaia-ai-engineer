import test from 'node:test';
import assert from 'node:assert/strict';
import {
  bindTaskExecution,
  validateTaskExecutionEnvelope
} from '../scripts/process/bind_task_execution.js';
import { createRuntimeCapabilityProfile } from '../scripts/process/runtime_capabilities.js';
import { stableJson, sha256Text } from '../scripts/process/stable_json.js';

const H40 = 'a'.repeat(40);
const H40B = 'b'.repeat(40);
const H64 = 'c'.repeat(64);

function packet(overrides = {}) {
  return {
    schema_version: 1,
    packet_version: 1,
    programme: 'K3',
    task_id: 5,
    task_title: 'Task 5',
    authority: {
      spec_path: 'spec.md',
      spec_blob_sha: H40,
      plan_path: 'plan.md',
      plan_blob_sha: H40B,
      task_source_digest: H64,
      process_failure_rules_revision: 'h0-r2-v1',
      process_failure_rules_digest: H64
    },
    scope: { allowed_create: [], allowed_modify: [], allowed_delete: [], forbidden_paths: [], product_scope: 'K3_TASK_5' },
    interfaces: { consumes: [], produces: [] },
    red: { command: 'node --test x', expected_failure_class: 'ASSERTION_FAILURE', expected_failure_description: 'missing behavior', invalid_failure_classes: [] },
    implementation: { intent: 'implement approved behavior', prohibited_inventions: [] },
    green: { command: 'node --test x', expected_result: 'PASS' },
    regression: { command: 'npm test', expected_result: 'PASS' },
    commit: { message: 'feat: x' },
    purpose: 'Task 5',
    phase: 'A',
    dependencies: [4],
    stop_conditions: ['PLAN_DECISION_REQUIRED'],
    required_skills: [],
    runtime_requirements: [],
    merge_authority: false,
    source_contract_digest: H64,
    ...overrides
  };
}

function state(overrides = {}) {
  return {
    state_revision: 2,
    next_task: 5,
    base_main_sha: H40,
    execution_branch: 'impl/k3-learner-evidence-engine',
    spec_blob_sha: H40,
    plan_blob_sha: H40B,
    project_bootstrap_revision: 'k3-h0-r2-v1',
    gates: { PROJECT_BOOTSTRAP_CURRENT: 'PASS' },
    ...overrides
  };
}

const runtime = createRuntimeCapabilityProfile({ github_write: 'AVAILABLE' });

test('binds current task to live state, task BASE, packet digest and runtime digest', () => {
  const p = packet();
  const result = bindTaskExecution({
    packet: p,
    state: state(),
    runtimeProfile: runtime,
    taskBaseSha: H40B,
    liveMainSha: H40,
    sourceRef: 'impl/k3-learner-evidence-engine'
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.code, 'TASK_EXECUTION_ENVELOPE_VALID');
  assert.equal(result.envelope.task_id, 5);
  assert.equal(result.envelope.task_base_sha, H40B);
  assert.equal(result.envelope.base_main_sha, H40);
  assert.equal(result.envelope.task_packet_digest, sha256Text(stableJson(p)));
  assert.equal(result.envelope.runtime_capability_profile_digest, sha256Text(stableJson(runtime)));
  assert.equal(validateTaskExecutionEnvelope(result.envelope).ok, true);
});

test('fails closed on task, main, source, workspace, bootstrap, runtime or merge-authority mismatch', () => {
  const cases = [
    [packet({ task_id: 6 }), state(), runtime, H40B, H40, 'TASK_ID_MISMATCH'],
    [packet(), state({ base_main_sha: null }), runtime, H40B, H40, 'MAIN_DRIFT'],
    [packet(), state(), runtime, null, H40, 'TASK_EXECUTION_ENVELOPE_INVALID'],
    [packet(), state({ spec_blob_sha: 'd'.repeat(40) }), runtime, H40B, H40, 'PLAN_SPEC_HASH_MISMATCH'],
    [packet(), state({ gates: { PROJECT_BOOTSTRAP_CURRENT: 'FAIL' } }), runtime, H40B, H40, 'PROJECT_BOOTSTRAP_STALE'],
    [packet({ runtime_requirements: ['git_worktree'] }), state(), runtime, H40B, H40, 'RUNTIME_CAPABILITY_BLOCKED'],
    [packet({ merge_authority: true }), state(), runtime, H40B, H40, 'MERGE_AUTHORITY_BLOCKED']
  ];
  for (const [p, s, r, taskBaseSha, liveMainSha, code] of cases) {
    const result = bindTaskExecution({ packet: p, state: s, runtimeProfile: r, taskBaseSha, liveMainSha, sourceRef: 'test' });
    assert.equal(result.ok, false, code);
    assert.equal(result.code, code);
    assert.equal(result.envelope, undefined);
  }
});

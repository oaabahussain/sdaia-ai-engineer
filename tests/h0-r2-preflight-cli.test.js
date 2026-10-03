import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync, execFileSync } from 'node:child_process';
import { extractTask } from '../scripts/process/k3_task_extract.js';
import { bindTaskExecution } from '../scripts/process/bind_task_execution.js';
import { createRuntimeCapabilityProfile } from '../scripts/process/runtime_capabilities.js';
import { preflightTask } from '../scripts/process/preflight_task.js';
import { stableJson, sha256Text } from '../scripts/process/stable_json.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MAIN = 'a'.repeat(40); // Synthetic test ref, never a live main pin.
const CLI = join(ROOT, 'scripts/process/preflight_task.js');
const RULES = 'docs/superpowers/process/process-failure-rules-v1.json';
function fixture(t) {
  const cwd = mkdtempSync(join(tmpdir(), 'k3-preflight-cli-'));
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  const state = JSON.parse(readFileSync(join(ROOT, 'docs/superpowers/state/CURRENT-STATE.json')));
  Object.assign(state, { state_revision: 100, base_main_sha: MAIN, completed_through_task: 24, next_task: 25, low_model_ready: false });
  state.gates.ACTIVE_REF_RESOLUTION_VALID = 'PASS';
  const packet = JSON.parse(readFileSync(join(ROOT, 'docs/superpowers/task-packets/k3/task-025.json')));
  const runtime = createRuntimeCapabilityProfile({ shell_execution: 'AVAILABLE', git_worktree: 'AVAILABLE' });
  // Real checkout facts are distinct from the synthetic external main reference.
  const git = (...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  git('init', '-q', '-b', state.execution_branch);
  git('-c', 'user.name=K3 Test', '-c', 'user.email=k3-test@example.invalid', 'commit', '-q', '--allow-empty', '-m', 'fixture baseline');
  const currentHeadSha = git('rev-parse', 'HEAD');
  const bound = bindTaskExecution({ packet, state, runtimeProfile: runtime, taskBaseSha: currentHeadSha, liveMainSha: MAIN, sourceRef: state.execution_branch });
  assert.equal(bound.ok, true);
  const brief = extractTask(readFileSync(join(ROOT, state.plan_path), 'utf8'), 25);
  const files = [state.plan_path, state.spec_path, state.ledger_path, state.checkpoint_path, RULES,
    'docs/superpowers/specs/2026-09-30-k3-low-model-execution-h0-r2-design.md', 'PROJECT-INDEX.md', 'RECOVERY-PROTOCOL.md'];
  for (const path of new Set(files)) {
    mkdirSync(dirname(join(cwd, path)), { recursive: true });
    writeFileSync(join(cwd, path), readFileSync(join(ROOT, path)));
  }
  const x = { packet, state, runtime, envelope: bound.envelope, brief, liveMainSha: MAIN,
    currentHeadSha, sourceRef: state.execution_branch, deterministicPacket: true, failureRulesDigest: packet.authority.process_failure_rules_digest, executionLintOk: true };
  return { cwd, x, git };
}
function run(f) {
  for (const name of ['state', 'packet', 'runtime', 'envelope']) writeFileSync(join(f.cwd, `${name}.json`), JSON.stringify(f.x[name]));
  writeFileSync(join(f.cwd, 'brief.md'), f.x.brief);
  return spawnSync(process.execPath, [CLI, '--state', 'state.json', '--packet', 'packet.json', '--envelope', 'envelope.json', '--runtime', 'runtime.json', '--brief', 'brief.md', '--live-main-sha', MAIN], { cwd: f.cwd, encoding: 'utf8', timeout: 10000 });
}
function failure(result, gate) {
  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.match(result.stdout, new RegExp(gate), result.stdout + result.stderr);
}
test('preflight CLI accepts actual verified authority instead of omitting lint evidence', t => {
  const result = run(fixture(t));
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /TASK_EXECUTION_READY = PASS/);
});
test('preflight CLI derives lint from actual execution inputs', t => {
  const f = fixture(t);
  writeFileSync(join(f.cwd, 'RECOVERY-PROTOCOL.md'), '- Run RED\n');
  failure(run(f), 'NO_DYNAMIC_STALE_PINS');
});
test('preflight CLI rejects a schema-valid but unapproved task packet', t => {
  const f = fixture(t);
  f.x.packet.green.command = 'node --version';
  f.x.envelope.task_packet_digest = sha256Text(stableJson(f.x.packet));
  failure(run(f), 'TASK_PACKET_DETERMINISTIC');
});
test('preflight CLI hashes the actual rule registry instead of echoing packet claims', t => {
  const f = fixture(t);
  const rules = JSON.parse(readFileSync(join(f.cwd, RULES)));
  rules.revision += '-changed';
  writeFileSync(join(f.cwd, RULES), JSON.stringify(rules));
  failure(run(f), 'PROCESS_FAILURE_RULES_MATCH');
});
test('preflight CLI checks actual authority file hashes', t => {
  const f = fixture(t);
  writeFileSync(join(f.cwd, f.x.state.spec_path), readFileSync(join(f.cwd, f.x.state.spec_path), 'utf8') + '\n');
  failure(run(f), 'PLAN_SPEC_HASH_MATCH');
});
test('preflight rejects a runtime profile changed after envelope binding', t => {
  const f = fixture(t);
  f.x.runtime.capabilities.shell_execution = 'UNAVAILABLE';
  assert.equal(preflightTask(f.x).ok, false);
});
test('preflight rejects envelope task, main base and execution ref drift', t => {
  for (const [key, value] of [['task_id', 26], ['base_main_sha', 'b'.repeat(40)], ['created_from_ref', 'main']]) {
    const f = fixture(t);
    f.x.envelope[key] = value;
    assert.equal(preflightTask(f.x).ok, false, key);
  }
});

test('preflight CLI rejects a syntactically valid but stale task base', t => {
  const f = fixture(t);
  f.x.envelope.task_base_sha = 'b'.repeat(40);
  failure(run(f), 'TASK_EXECUTION_ENVELOPE_FRESH');
});
test('preflight CLI requires rebind after checkout HEAD advances', t => {
  const f = fixture(t);
  f.git('-c', 'user.name=K3 Test', '-c', 'user.email=k3-test@example.invalid', 'commit', '-q', '--allow-empty', '-m', 'new checkpoint');
  failure(run(f), 'TASK_EXECUTION_ENVELOPE_FRESH');
});
test('preflight CLI rejects checkout branch drift despite matching envelope claims', t => {
  const f = fixture(t);
  f.git('checkout', '-q', '-b', 'wrong-execution-branch');
  failure(run(f), 'EXECUTION_BRANCH_VALID');
});
test('preflight CLI fails closed without a Git checkout', t => {
  const f = fixture(t);
  rmSync(join(f.cwd, '.git'), { recursive: true, force: true });
  const result = run(f);
  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.match(result.stdout + result.stderr, /TASK_EXECUTION_READY = FAIL/);
});
for (const [name, invalidRuntime] of [['empty', {}], ['null', null], ['partial', { schema_version: 1, profile_version: 1, capabilities: {} }]]) {
  test(`preflight CLI rejects ${name} runtime even with no required capabilities`, t => {
    const f = fixture(t);
    assert.deepEqual(f.x.packet.runtime_requirements, []);
    f.x.runtime = invalidRuntime;
    f.x.envelope.runtime_capability_profile_digest = sha256Text(stableJson(f.x.runtime));
    failure(run(f), 'RUNTIME_CAPABILITIES_SATISFY_PACKET');
  });
}
test('preflight CLI rejects unknown runtime capability status', t => {
  const f = fixture(t);
  f.x.runtime.capabilities.shell_execution = 'ASSUMED';
  f.x.envelope.runtime_capability_profile_digest = sha256Text(stableJson(f.x.runtime));
  failure(run(f), 'RUNTIME_CAPABILITIES_SATISFY_PACKET');
});
test('callable preflight rejects missing verified checkout facts', t => {
  for (const key of ['currentHeadSha', 'sourceRef']) {
    const f = fixture(t);
    delete f.x[key];
    assert.equal(preflightTask(f.x).ok, false, key);
  }
});

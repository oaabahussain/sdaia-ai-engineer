import Ajv from 'ajv';
import { readFileSync } from 'node:fs';
import { stableJson, sha256Text } from './stable_json.js';
import { requireCapabilities } from './runtime_capabilities.js';

const SCHEMA_URL = new URL('../../docs/superpowers/process/task-execution-envelope-v1.schema.json', import.meta.url);
const schema = JSON.parse(readFileSync(SCHEMA_URL, 'utf8'));
const ajv = new Ajv({ allErrors: true, strict: false });
const validateSchema = ajv.compile(schema);

function fail(code, errors = []) {
  return { ok: false, code, errors };
}

export function validateTaskExecutionEnvelope(envelope) {
  const ok = validateSchema(envelope);
  return {
    ok: Boolean(ok),
    code: ok ? 'TASK_EXECUTION_ENVELOPE_VALID' : 'TASK_EXECUTION_ENVELOPE_INVALID',
    errors: ok
      ? []
      : (validateSchema.errors ?? []).map((error) => `${error.instancePath || '/'} ${error.message}`)
  };
}

export function bindTaskExecution({
  packet,
  state,
  runtimeProfile,
  taskBaseSha,
  liveMainSha,
  sourceRef
}) {
  if (!packet || !state || !runtimeProfile) return fail('TASK_EXECUTION_ENVELOPE_INVALID', ['missing bind input']);
  if (packet.task_id !== state.next_task) return fail('TASK_ID_MISMATCH', ['packet task_id must equal state next_task']);
  if (!state.base_main_sha || state.base_main_sha !== liveMainSha) {
    return fail('MAIN_DRIFT', ['state base_main_sha must equal live main']);
  }
  if (!taskBaseSha || !/^[0-9a-f]{40}$/.test(taskBaseSha)) {
    return fail('TASK_EXECUTION_ENVELOPE_INVALID', ['task_base_sha must be an exact 40-hex commit']);
  }
  if (
    packet.authority?.spec_blob_sha !== state.spec_blob_sha ||
    packet.authority?.plan_blob_sha !== state.plan_blob_sha
  ) {
    return fail('PLAN_SPEC_HASH_MISMATCH', ['packet source hashes do not match validated state']);
  }
  if (
    state.gates?.PROJECT_BOOTSTRAP_CURRENT !== 'PASS' ||
    !state.project_bootstrap_revision
  ) {
    return fail('PROJECT_BOOTSTRAP_STALE', ['verified Project bootstrap revision is required']);
  }
  const capability = requireCapabilities(runtimeProfile, packet.runtime_requirements ?? []);
  if (!capability.ok) return fail('RUNTIME_CAPABILITY_BLOCKED', capability.blocked);
  if (packet.merge_authority !== false) {
    return fail('MERGE_AUTHORITY_BLOCKED', ['task packet must not grant merge authority']);
  }

  const envelope = {
    schema_version: 1,
    envelope_version: 1,
    task_id: packet.task_id,
    task_packet_digest: sha256Text(stableJson(packet)),
    state_revision: state.state_revision,
    base_main_sha: state.base_main_sha,
    task_base_sha: taskBaseSha,
    execution_branch: state.execution_branch,
    project_bootstrap_revision: state.project_bootstrap_revision,
    runtime_capability_profile_digest: sha256Text(stableJson(runtimeProfile)),
    created_from_ref: sourceRef || state.execution_branch,
    preflight_gate_set: []
  };
  const validation = validateTaskExecutionEnvelope(envelope);
  return validation.ok
    ? { ok: true, code: 'TASK_EXECUTION_ENVELOPE_VALID', envelope, errors: [] }
    : validation;
}

import Ajv from 'ajv';
import { readFileSync } from 'node:fs';

export const CAPABILITY_KEYS = Object.freeze([
  'skill_discovery',
  'file_access',
  'shell_execution',
  'git_worktree',
  'github_write',
  'web_search',
  'durable_workspace',
  'subagent_review',
  'fresh_context_review',
  'project_file_mutation'
]);

const STATUS = new Set(['AVAILABLE', 'UNAVAILABLE', 'UNKNOWN']);
const SCHEMA_URL = new URL('../../docs/superpowers/process/runtime-capability-profile-v1.schema.json', import.meta.url);
const schema = JSON.parse(readFileSync(SCHEMA_URL, 'utf8'));
const ajv = new Ajv({ allErrors: true, strict: false });
const validateSchema = ajv.compile(schema);

export function createRuntimeCapabilityProfile(observations = {}) {
  const capabilities = {};
  for (const key of CAPABILITY_KEYS) {
    const observed = observations[key];
    capabilities[key] = STATUS.has(observed) ? observed : 'UNKNOWN';
  }
  return {
    schema_version: 1,
    profile_version: 1,
    capabilities
  };
}

export function validateRuntimeCapabilityProfile(profile) {
  const ok = validateSchema(profile);
  return {
    ok: Boolean(ok),
    code: ok ? 'RUNTIME_CAPABILITY_PROFILE_VALID' : 'RUNTIME_CAPABILITY_PROFILE_INVALID',
    errors: ok ? [] : (validateSchema.errors ?? []).map((error) => {
      const path = error.instancePath || '/';
      return `${path} ${error.message}`;
    })
  };
}

export function requireCapabilities(profile, required = []) {
  const blocked = [];
  for (const capability of required) {
    const status = CAPABILITY_KEYS.includes(capability)
      ? profile?.capabilities?.[capability] ?? 'UNKNOWN'
      : 'UNKNOWN';
    if (status !== 'AVAILABLE') blocked.push({ capability, status });
  }
  return blocked.length
    ? { ok: false, code: 'RUNTIME_CAPABILITY_BLOCKED', blocked }
    : { ok: true, code: 'RUNTIME_CAPABILITIES_SATISFIED', blocked: [] };
}

export function validateReviewModeClaim(profile, reviewMode, evidence = {}) {
  if (reviewMode === 'SELF_REVIEW') {
    return { ok: true, code: 'REVIEW_MODE_VALID' };
  }
  if (reviewMode === 'INDEPENDENT_SUBAGENT') {
    const capability = profile?.capabilities?.subagent_review;
    const observed = evidence.independent_reviewer_observed === true;
    return capability === 'AVAILABLE' && observed
      ? { ok: true, code: 'REVIEW_MODE_VALID' }
      : { ok: false, code: 'REVIEW_MODE_UNVERIFIED' };
  }
  if (reviewMode === 'FRESH_EXTERNAL_CONTEXT') {
    const capability = profile?.capabilities?.fresh_context_review;
    const observed = evidence.fresh_external_context_observed === true;
    return capability === 'AVAILABLE' && observed
      ? { ok: true, code: 'REVIEW_MODE_VALID' }
      : { ok: false, code: 'REVIEW_MODE_UNVERIFIED' };
  }
  return { ok: false, code: 'REVIEW_MODE_INVALID' };
}

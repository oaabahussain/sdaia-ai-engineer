import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CAPABILITY_KEYS,
  createRuntimeCapabilityProfile,
  requireCapabilities,
  validateReviewModeClaim,
  validateRuntimeCapabilityProfile
} from '../scripts/process/runtime_capabilities.js';

test('missing capability observations stay UNKNOWN and are never inferred from model name', () => {
  const profile = createRuntimeCapabilityProfile({
    model_name: 'high-reasoning-model',
    github_write: 'AVAILABLE',
    shell_execution: 'UNAVAILABLE'
  });
  assert.equal(profile.capabilities.github_write, 'AVAILABLE');
  assert.equal(profile.capabilities.shell_execution, 'UNAVAILABLE');
  for (const key of CAPABILITY_KEYS) {
    if (!['github_write', 'shell_execution'].includes(key)) {
      assert.equal(profile.capabilities[key], 'UNKNOWN', key);
    }
  }
  assert.equal('model_name' in profile, false);
  assert.equal(validateRuntimeCapabilityProfile(profile).ok, true);
});

test('required capabilities fail closed unless explicitly AVAILABLE', () => {
  const profile = createRuntimeCapabilityProfile({ github_write: 'AVAILABLE' });
  assert.deepEqual(requireCapabilities(profile, ['github_write']), {
    ok: true,
    code: 'RUNTIME_CAPABILITIES_SATISFIED',
    blocked: []
  });
  const blocked = requireCapabilities(profile, ['github_write', 'git_worktree']);
  assert.equal(blocked.ok, false);
  assert.equal(blocked.code, 'RUNTIME_CAPABILITY_BLOCKED');
  assert.deepEqual(blocked.blocked, [{ capability: 'git_worktree', status: 'UNKNOWN' }]);
});

test('independent review claim requires both capability and observed reviewer execution', () => {
  const profile = createRuntimeCapabilityProfile({
    subagent_review: 'AVAILABLE',
    fresh_context_review: 'AVAILABLE'
  });
  assert.equal(
    validateReviewModeClaim(profile, 'INDEPENDENT_SUBAGENT', { independent_reviewer_observed: false }).ok,
    false
  );
  assert.equal(
    validateReviewModeClaim(profile, 'INDEPENDENT_SUBAGENT', { independent_reviewer_observed: true }).ok,
    true
  );
  assert.equal(
    validateReviewModeClaim(profile, 'FRESH_EXTERNAL_CONTEXT', { fresh_external_context_observed: false }).ok,
    false
  );
  assert.equal(validateReviewModeClaim(profile, 'SELF_REVIEW', {}).ok, true);
});

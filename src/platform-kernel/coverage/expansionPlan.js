import crypto from 'node:crypto';
import { prioritizeCoverageGaps } from './prioritize.js';

const REQUIRED_POLICY_KEYS = Object.freeze([
  'source_policy_version',
  'quality_policy_version',
  'review_policy_version',
  'tranche_calibration_policy_version'
]);

function canonical(value) {
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  if (value && typeof value === 'object') {
    return '{' + Object.keys(value).sort()
      .map(key => JSON.stringify(key) + ':' + canonical(value[key]))
      .join(',') + '}';
  }
  return JSON.stringify(value);
}

function validatePolicyVersions(policyVersions) {
  for (const key of REQUIRED_POLICY_KEYS) {
    if (typeof policyVersions?.[key] !== 'string' || !policyVersions[key]) {
      throw new Error(`Missing policy version: ${key}`);
    }
  }
}

export function buildExpansionPlan({
  trackId,
  gaps,
  context = {},
  policyVersions
}) {
  if (typeof trackId !== 'string' || !trackId) {
    throw new Error('trackId is required');
  }
  if (!Array.isArray(gaps) || gaps.length === 0) {
    throw new Error('CoverageGapV1 records are required');
  }
  if (typeof context.createdAt !== 'string' || !context.createdAt) {
    throw new Error('context.createdAt is required');
  }
  validatePolicyVersions(policyVersions);

  for (const gap of gaps) {
    if (
      typeof gap?.gap_id !== 'string' ||
      !gap.gap_id ||
      gap.track_id !== trackId
    ) {
      throw new Error('CoverageGapV1 with matching track_id and gap_id is required');
    }
  }

  const prioritized = prioritizeCoverageGaps(gaps, context);
  const coverageGapIds = prioritized.map(item => item.gap_id);
  const priorities = prioritized.map((item, index) => ({
    gap_id: item.gap_id,
    rank: index + 1,
    reason: item.priority_reasons.join(','),
    requested_count: item.requested_count,
    blocked: item.priority.blocked
  }));
  const identityPayload = {
    track_id: trackId,
    coverage_gap_ids: coverageGapIds,
    priorities,
    policy_versions: policyVersions,
    status: 'PLANNED',
    created_at: context.createdAt
  };
  const identityHash = crypto
    .createHash('sha256')
    .update(canonical(identityPayload))
    .digest('hex')
    .slice(0, 16);

  return {
    schema_version: 1,
    plan_id: `expansion:${trackId}:${identityHash}`,
    track_id: trackId,
    coverage_gap_ids: coverageGapIds,
    priorities,
    tranche_refs: [],
    policy_versions: { ...policyVersions },
    status: 'PLANNED',
    created_at: context.createdAt
  };
}

function compare(value, operator, threshold) {
  if (!Number.isFinite(value) || !Number.isFinite(threshold)) return false;
  if (operator === 'gt') return value > threshold;
  if (operator === 'gte') return value >= threshold;
  if (operator === 'lt') return value < threshold;
  if (operator === 'lte') return value <= threshold;
  throw new Error(`Unsupported escalation operator: ${operator}`);
}

function stableUnitInterval(value) {
  let hash = 2166136261;
  for (const char of String(value)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967296;
}

function decisionResult(decision, reason, samplingRate = null, candidateId = null) {
  if (decision === 'HUMAN_REQUIRED') {
    return {
      decision,
      reason,
      samplingRate: 1,
      selectedForReview: true
    };
  }

  if (decision === 'HOLD') {
    return {
      decision,
      reason,
      samplingRate: null,
      selectedForReview: false
    };
  }

  if (decision === 'AUTO_ELIGIBLE') {
    return {
      decision,
      reason,
      samplingRate: 0,
      selectedForReview: false
    };
  }

  if (decision === 'SAMPLED') {
    if (
      !Number.isFinite(samplingRate) ||
      samplingRate < 0 ||
      samplingRate > 1
    ) {
      throw new Error('Sampled review requires sampling_rate in [0,1]');
    }
    if (typeof candidateId !== 'string' || !candidateId) {
      return {
        decision: 'HOLD',
        reason: 'sampling_requires_stable_candidate_id',
        samplingRate: null,
        selectedForReview: false
      };
    }
    return {
      decision,
      reason,
      samplingRate,
      selectedForReview: stableUnitInterval(candidateId) < samplingRate
    };
  }

  throw new Error(`Unsupported review decision: ${decision}`);
}

export function decideReviewRequirement({
  policy,
  risk,
  observedMetrics = {},
  candidate = {}
}) {
  if (!policy || !Array.isArray(policy.risk_rules)) {
    throw new Error('Review calibration policy is required');
  }

  for (const condition of policy.mandatory_human_conditions || []) {
    if (candidate[condition] === true) {
      return decisionResult(
        'HUMAN_REQUIRED',
        `mandatory_condition:${condition}`
      );
    }
  }

  for (const trigger of policy.escalation_triggers || []) {
    if (
      compare(
        observedMetrics[trigger.metric],
        trigger.operator,
        trigger.threshold
      )
    ) {
      if (trigger.action === 'HUMAN_REQUIRED') {
        return decisionResult(
          'HUMAN_REQUIRED',
          `escalation:${trigger.metric}`
        );
      }
      if (trigger.action === 'HOLD') {
        return decisionResult('HOLD', `escalation:${trigger.metric}`);
      }
      if (trigger.action === 'INCREASE_SAMPLING') {
        return decisionResult(
          'HUMAN_REQUIRED',
          `escalation:${trigger.metric}:conservative_sampling_escalation`
        );
      }
      throw new Error(`Unsupported escalation action: ${trigger.action}`);
    }
  }

  const rule = policy.risk_rules.find(item => item.risk_class === risk);
  if (!rule) {
    return decisionResult('HOLD', 'unclassified_risk');
  }

  return decisionResult(
    rule.decision,
    `risk_rule:${risk}`,
    rule.sampling_rate,
    candidate.id ?? candidate.item_version_id ?? candidate.family_id ?? null
  );
}

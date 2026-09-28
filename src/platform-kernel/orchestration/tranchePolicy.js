function finite(value) {
  return Number.isFinite(value);
}

function validatePolicy(policy) {
  const required = [
    'min_count',
    'max_count',
    'expand_yield_rate',
    'contract_yield_rate',
    'max_failure_rate',
    'max_review_backlog',
    'expansion_factor',
    'contraction_factor'
  ];
  for (const key of required) {
    if (!finite(policy?.[key])) {
      throw new Error(`Tranche policy requires ${key}`);
    }
  }
  if (
    policy.min_count < 1 ||
    policy.max_count < policy.min_count ||
    policy.expansion_factor <= 0 ||
    policy.contraction_factor <= 0
  ) {
    throw new Error('Invalid tranche policy bounds');
  }
}

function clampCount(value, policy) {
  return Math.max(
    policy.min_count,
    Math.min(policy.max_count, Math.round(value))
  );
}

export function decideNextTranche(policy, metrics = {}, demand = {}) {
  validatePolicy(policy);

  const requested = demand.requestedCount;
  if (!Number.isFinite(requested) || requested <= 0) {
    return {
      decision: 'STOP',
      requestedCount: 0,
      reason: 'no_remaining_demand'
    };
  }

  const hasMetrics = [
    metrics.yieldRate,
    metrics.failureRate,
    metrics.reviewBacklog
  ].every(finite);

  if (!hasMetrics) {
    return {
      decision: 'HOLD',
      requestedCount: null,
      reason: 'insufficient_metrics'
    };
  }

  const current = clampCount(requested, policy);

  if (metrics.failureRate > policy.max_failure_rate) {
    return {
      decision: 'HOLD',
      requestedCount: current,
      reason: 'failure_rate_guardrail'
    };
  }

  if (metrics.reviewBacklog > policy.max_review_backlog) {
    return {
      decision: 'HOLD',
      requestedCount: current,
      reason: 'review_backlog_guardrail'
    };
  }

  if (metrics.yieldRate < policy.contract_yield_rate) {
    return {
      decision: 'CONTRACT',
      requestedCount: clampCount(
        current * policy.contraction_factor,
        policy
      ),
      reason: 'yield_below_contract_guardrail'
    };
  }

  if (metrics.yieldRate >= policy.expand_yield_rate) {
    return {
      decision: 'EXPAND',
      requestedCount: clampCount(
        current * policy.expansion_factor,
        policy
      ),
      reason: 'yield_supports_expansion'
    };
  }

  return {
    decision: 'CONTINUE',
    requestedCount: current,
    reason: 'within_guardrails'
  };
}

function routeMatches(route, capability, language, riskClass) {
  return (
    route.capability === capability &&
    (route.language === language || route.language === 'any') &&
    Array.isArray(route.risk_classes) &&
    route.risk_classes.includes(riskClass)
  );
}

function statusEligible(candidateStatus, requiredStatus) {
  if (requiredStatus === 'APPROVED') return candidateStatus === 'APPROVED';
  if (requiredStatus === 'RESTRICTED') {
    return candidateStatus === 'APPROVED' || candidateStatus === 'RESTRICTED';
  }
  return false;
}

function withinRouteBounds(candidate, route) {
  if (Number.isFinite(route.max_latency_ms)) {
    if (
      !Number.isFinite(candidate?.metrics?.latency_ms) ||
      candidate.metrics.latency_ms > route.max_latency_ms
    ) return false;
  }
  if (Number.isFinite(route.max_cost)) {
    if (
      !Number.isFinite(candidate?.metrics?.cost) ||
      candidate.metrics.cost > route.max_cost
    ) return false;
  }
  return true;
}

function fallbackDecision(fallback) {
  if (!fallback || typeof fallback.mode !== 'string') {
    throw new Error('Provider routing policy requires fallback');
  }

  if (fallback.mode === 'DETERMINISTIC') {
    if (typeof fallback.provider_ref !== 'string' || !fallback.provider_ref) {
      throw new Error('Deterministic fallback requires provider_ref');
    }
    return {
      mode: 'DETERMINISTIC',
      providerRef: fallback.provider_ref,
      reason: 'no_eligible_provider'
    };
  }

  if (fallback.mode === 'MANUAL') {
    return {
      mode: 'MANUAL',
      providerRef: null,
      reason: 'no_eligible_provider'
    };
  }

  if (fallback.mode === 'ABSTAIN') {
    return {
      mode: 'ABSTAIN',
      providerRef: null,
      reason: 'no_eligible_provider'
    };
  }

  throw new Error('Unsupported provider fallback mode');
}

export function routeProvider({
  capability,
  language,
  riskClass,
  candidates = [],
  policy
}) {
  if (!policy || !Array.isArray(policy.routes)) {
    throw new Error('Provider routing policy is required');
  }

  const route = policy.routes.find(item =>
    routeMatches(item, capability, language, riskClass)
  );

  if (route) {
    const candidatesByRef = new Map(
      candidates.map(candidate => [candidate.provider_ref, candidate])
    );

    for (const providerRef of route.provider_refs) {
      const candidate = candidatesByRef.get(providerRef);
      if (
        candidate &&
        statusEligible(
          candidate.evaluation_status,
          route.required_evaluation_status
        ) &&
        withinRouteBounds(candidate, route)
      ) {
        return {
          mode: 'PROVIDER',
          providerRef,
          reason: 'eligible_policy_route'
        };
      }
    }
  }

  return fallbackDecision(policy.fallback);
}

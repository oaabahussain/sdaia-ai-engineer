const RISK_ORDER = Object.freeze({
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  unknown: 4
});

function numberFrom(map, key, fallback = 0) {
  const value = map?.[key];
  return Number.isFinite(value) ? value : fallback;
}

function riskFrom(map, key) {
  const value = map?.[key];
  return Object.hasOwn(RISK_ORDER, value) ? value : 'unknown';
}

function comparePriority(a, b) {
  if (a.priority.blocked !== b.priority.blocked) {
    return a.priority.blocked ? 1 : -1;
  }
  if (a.priority.coverage_deficit !== b.priority.coverage_deficit) {
    return b.priority.coverage_deficit - a.priority.coverage_deficit;
  }
  const riskDelta =
    RISK_ORDER[a.priority.risk_class] - RISK_ORDER[b.priority.risk_class];
  if (riskDelta !== 0) return riskDelta;
  if (a.priority.duplicate_pressure !== b.priority.duplicate_pressure) {
    return a.priority.duplicate_pressure - b.priority.duplicate_pressure;
  }
  if (a.priority.review_capacity !== b.priority.review_capacity) {
    return b.priority.review_capacity - a.priority.review_capacity;
  }
  if (a.priority.bilingual_complexity !== b.priority.bilingual_complexity) {
    return a.priority.bilingual_complexity - b.priority.bilingual_complexity;
  }
  if (
    a.priority.accessibility_complexity !==
    b.priority.accessibility_complexity
  ) {
    return (
      a.priority.accessibility_complexity -
      b.priority.accessibility_complexity
    );
  }
  return a.gap_id.localeCompare(b.gap_id);
}

export function prioritizeCoverageGaps(gaps, context = {}) {
  if (!Array.isArray(gaps)) {
    throw new Error('Coverage gaps are required');
  }

  return gaps
    .map(gap => {
      if (
        typeof gap?.gap_id !== 'string' ||
        !gap.gap_id ||
        !Number.isInteger(gap.requested_count) ||
        gap.requested_count < 1
      ) {
        throw new Error('CoverageGapV1 with requested_count is required');
      }

      const sourceReady = context.sourceReadiness?.[gap.gap_id] !== false;
      const riskClass = riskFrom(context.riskClass, gap.gap_id);
      const duplicatePressure = numberFrom(
        context.duplicatePressure,
        gap.gap_id
      );
      const reviewCapacity = numberFrom(
        context.reviewCapacity,
        gap.domain_id
      );
      const bilingualComplexity = numberFrom(
        context.bilingualComplexity,
        gap.gap_id
      );
      const accessibilityComplexity = numberFrom(
        context.accessibilityComplexity,
        gap.gap_id
      );

      const priorityReasons = ['coverage_deficit'];
      if (!sourceReady) priorityReasons.push('source_not_ready');
      if (riskClass !== 'unknown') priorityReasons.push('risk_class');
      if (duplicatePressure > 0) priorityReasons.push('duplicate_pressure');
      if (reviewCapacity > 0) priorityReasons.push('review_capacity');
      if (bilingualComplexity > 0) {
        priorityReasons.push('bilingual_complexity');
      }
      if (accessibilityComplexity > 0) {
        priorityReasons.push('accessibility_complexity');
      }

      return {
        ...gap,
        priority: {
          blocked: !sourceReady,
          coverage_deficit: gap.requested_count,
          risk_class: riskClass,
          duplicate_pressure: duplicatePressure,
          review_capacity: reviewCapacity,
          bilingual_complexity: bilingualComplexity,
          accessibility_complexity: accessibilityComplexity
        },
        priority_reasons: priorityReasons
      };
    })
    .sort(comparePriority);
}

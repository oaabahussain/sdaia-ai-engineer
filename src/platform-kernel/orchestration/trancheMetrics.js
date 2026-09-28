function safeRate(numerator, denominator) {
  return denominator > 0 ? numerator / denominator : null;
}

function finiteOrNull(value) {
  return Number.isFinite(value) ? value : null;
}

function stageBucket() {
  return { PASS: 0, FAIL: 0, ABSTAIN: 0 };
}

function normalizeStageOutcome(value) {
  return ['PASS', 'FAIL', 'ABSTAIN'].includes(value) ? value : null;
}

export function summarizeTrancheMetrics(result = {}, inputs = {}) {
  const completed = Array.isArray(result.completed) ? result.completed : [];
  const failed = Array.isArray(result.failed) ? result.failed : [];
  const requestCount = Number.isInteger(result.request_count)
    ? result.request_count
    : completed.length + failed.length;

  const qualityRows = completed.filter(item => item?.quality_signals);
  const duplicateKnown = qualityRows.filter(item =>
    typeof item.quality_signals?.duplicate === 'boolean'
  );
  const evidenceKnown = qualityRows.filter(item =>
    ['PASS', 'FAIL', 'ABSTAIN', 'REVIEW_REQUIRED'].includes(
      item.quality_signals?.evidence_status
    )
  );
  const bilingualKnown = qualityRows.filter(item =>
    ['PASS', 'FAIL', 'ABSTAIN', 'REVIEW_REQUIRED'].includes(
      item.quality_signals?.bilingual_status
    )
  );
  const reviewKnown = qualityRows.filter(item =>
    typeof item.quality_signals?.review_status === 'string'
  );

  const stageNames = new Set();
  for (const item of completed) {
    for (const name of Object.keys(item?.stage_outcomes || {})) stageNames.add(name);
  }
  for (const item of failed) {
    if (typeof item?.stage === 'string' && item.stage) stageNames.add(item.stage);
  }

  const counts = {};
  for (const name of [...stageNames].sort()) counts[name] = stageBucket();

  for (const item of completed) {
    for (const [name, raw] of Object.entries(item?.stage_outcomes || {})) {
      const outcome = normalizeStageOutcome(raw);
      if (!outcome) continue;
      counts[name] ??= stageBucket();
      counts[name][outcome]++;
    }
  }
  for (const item of failed) {
    if (typeof item?.stage === 'string' && item.stage) {
      counts[item.stage] ??= stageBucket();
      counts[item.stage].FAIL++;
    }
  }

  const stageKnown = Object.keys(counts).length > 0;

  return {
    trancheId: result.tranche_id ?? null,
    requestCount,
    yieldRate: safeRate(completed.length, requestCount),
    failureRate: safeRate(failed.length, requestCount),
    duplicateRate: safeRate(
      duplicateKnown.filter(item => item.quality_signals.duplicate === true).length,
      duplicateKnown.length
    ),
    evidenceFailureRate: safeRate(
      evidenceKnown.filter(item =>
        ['FAIL', 'ABSTAIN', 'REVIEW_REQUIRED'].includes(
          item.quality_signals.evidence_status
        )
      ).length,
      evidenceKnown.length
    ),
    bilingualFailureRate: safeRate(
      bilingualKnown.filter(item =>
        ['FAIL', 'ABSTAIN', 'REVIEW_REQUIRED'].includes(
          item.quality_signals.bilingual_status
        )
      ).length,
      bilingualKnown.length
    ),
    reviewEscalationRate: safeRate(
      reviewKnown.filter(item =>
        ['HUMAN_REQUIRED', 'HOLD', 'SAMPLED'].includes(
          item.quality_signals.review_status
        )
      ).length,
      reviewKnown.length
    ),
    reviewBacklog: finiteOrNull(inputs.reviewBacklog),
    reviewQueueLatencyMs: finiteOrNull(inputs.reviewQueueLatencyMs),
    stageOutcomes: {
      known: stageKnown,
      counts
    }
  };
}

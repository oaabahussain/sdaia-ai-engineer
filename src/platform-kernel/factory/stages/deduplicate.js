import { assertEmbeddingProvider } from '../../providers/ports.js';

function normalize(value) {
  return String(value ?? '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function text(candidate) {
  return normalize(
    candidate?.question_en ??
    candidate?.question ??
    candidate?.question_ar ??
    ''
  );
}

function structuralFingerprint(candidate) {
  const objectiveId = normalize(candidate?.objective_id);
  const reasoning = normalize(candidate?.correct_reasoning);
  if (!objectiveId || !reasoning) return null;

  const misconceptions = Array.isArray(candidate?.misconception_ids)
    ? candidate.misconception_ids.map(normalize).filter(Boolean).sort()
    : [];

  return JSON.stringify({
    objective_id: objectiveId,
    correct_reasoning: reasoning,
    misconception_ids: misconceptions
  });
}

function cosine(a, b) {
  if (
    !Array.isArray(a) ||
    !Array.isArray(b) ||
    a.length !== b.length ||
    !a.length
  ) return null;

  let dot = 0;
  let aa = 0;
  let bb = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    aa += a[i] * a[i];
    bb += b[i] * b[i];
  }

  return aa && bb ? dot / (Math.sqrt(aa) * Math.sqrt(bb)) : null;
}

function languageOf(item) {
  if (item?.language === 'ar' || item?.language === 'en') return item.language;

  const hasAr = typeof item?.question_ar === 'string' && item.question_ar.trim();
  const hasEn = typeof item?.question_en === 'string' && item.question_en.trim();

  if (hasAr && !hasEn) return 'ar';
  if (hasEn && !hasAr) return 'en';
  return null;
}

function semanticScope(candidate, item) {
  const candidateLanguage = languageOf(candidate);
  const itemLanguage = languageOf(item);

  if (
    candidateLanguage &&
    itemLanguage &&
    candidateLanguage !== itemLanguage
  ) {
    return 'cross_language';
  }

  return 'same_language';
}

function validateThresholds(thresholds, label) {
  if (
    !thresholds ||
    !Number.isFinite(thresholds.review_lower_bound) ||
    !Number.isFinite(thresholds.duplicate_threshold) ||
    thresholds.review_lower_bound < 0 ||
    thresholds.duplicate_threshold > 1 ||
    thresholds.review_lower_bound > thresholds.duplicate_threshold
  ) {
    throw new Error(`Invalid ${label} dedup calibration thresholds`);
  }
}

function validateCalibrationPolicy(policy) {
  if (!policy) return;
  validateThresholds(policy.same_language, 'same-language');
  validateThresholds(policy.cross_language, 'cross-language');
}

export function createDeduplicateStage({
  inventory = [],
  embeddingProvider = null,
  threshold = null,
  structuralPolicy = { on_match: 'DUPLICATE' },
  calibrationPolicy = null
} = {}) {
  if (embeddingProvider) assertEmbeddingProvider(embeddingProvider);
  if (!['DUPLICATE', 'REVIEW_REQUIRED'].includes(structuralPolicy?.on_match)) {
    throw new Error('Unsupported structural duplicate policy');
  }
  validateCalibrationPolicy(calibrationPolicy);
  if (
    threshold !== null &&
    (!Number.isFinite(threshold) || threshold < 0 || threshold > 1)
  ) {
    throw new Error('Explicit semantic threshold must be in [0,1]');
  }

  return {
    name: 'deduplicate',

    async run(ctx) {
      const prev = ctx.previous_output || {};
      const candidate = prev.candidate;
      const fp = text(candidate);

      if (inventory.some(item => text(item) === fp && fp)) {
        throw new Error('Duplicate candidate detected');
      }

      let result = 'PASS';
      let structuralMatch = false;
      let semanticEvidenceScope = null;
      const structural = structuralFingerprint(candidate);

      if (
        structural &&
        inventory.some(item => structuralFingerprint(item) === structural)
      ) {
        structuralMatch = true;
        if (structuralPolicy.on_match === 'DUPLICATE') {
          throw new Error('Structural duplicate candidate detected');
        }
        result = 'REVIEW_REQUIRED';
      }

      if (embeddingProvider && inventory.length) {
        const vector = await embeddingProvider.embed(candidate);

        if (!Array.isArray(vector)) {
          result = 'REVIEW_REQUIRED';
        } else {
          for (const item of inventory) {
            const other = await embeddingProvider.embed(item);
            const similarity = cosine(vector, other);

            if (similarity === null) {
              result = 'REVIEW_REQUIRED';
              continue;
            }

            if (calibrationPolicy) {
              const scope = semanticScope(candidate, item);
              const thresholds = calibrationPolicy[scope];

              if (similarity >= thresholds.duplicate_threshold) {
                throw new Error('Semantic near-duplicate candidate detected');
              }

              if (similarity >= thresholds.review_lower_bound) {
                result = 'REVIEW_REQUIRED';
                semanticEvidenceScope = scope;
              }
              continue;
            }

            if (Number.isFinite(threshold)) {
              if (similarity >= threshold) {
                throw new Error('Near-duplicate candidate detected');
              }
            } else {
              result = 'REVIEW_REQUIRED';
            }
          }
        }
      }

      return {
        ...prev,
        state: 'DEDUPED',
        quality: {
          ...(prev.quality || {}),
          duplication: {
            result,
            structural_match: structuralMatch,
            semantic_scope: semanticEvidenceScope
          }
        }
      };
    }
  };
}

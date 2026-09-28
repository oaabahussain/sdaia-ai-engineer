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

export function createDeduplicateStage({
  inventory = [],
  embeddingProvider = null,
  threshold = 0.95,
  structuralPolicy = { on_match: 'DUPLICATE' }
} = {}) {
  if (embeddingProvider) assertEmbeddingProvider(embeddingProvider);
  if (!['DUPLICATE', 'REVIEW_REQUIRED'].includes(structuralPolicy?.on_match)) {
    throw new Error('Unsupported structural duplicate policy');
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

            if (similarity >= threshold) {
              throw new Error('Near-duplicate candidate detected');
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
            structural_match: structuralMatch
          }
        }
      };
    }
  };
}

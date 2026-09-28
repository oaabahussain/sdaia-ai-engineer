import test from 'node:test';
import assert from 'node:assert/strict';

const policy = {
  same_language: {
    review_lower_bound: 0.86,
    duplicate_threshold: 0.95
  },
  cross_language: {
    review_lower_bound: 0.80,
    duplicate_threshold: 0.93
  }
};

function vectorFor(id) {
  if (id === 'candidate-review') return [1, 0];
  if (id === 'inventory-review') return [0.85, Math.sqrt(1 - 0.85 ** 2)];
  if (id === 'candidate-duplicate') return [1, 0];
  if (id === 'inventory-duplicate') return [0.97, Math.sqrt(1 - 0.97 ** 2)];
  return null;
}

const embeddingProvider = {
  embed: async item => vectorFor(item.id)
};

test('cross-language semantic gray zone becomes REVIEW_REQUIRED', async () => {
  const { createDeduplicateStage } = await import(
    '../src/platform-kernel/factory/stages/deduplicate.js'
  );

  const stage = createDeduplicateStage({
    inventory: [{
      id: 'inventory-review',
      language: 'en',
      question_en: 'Different English wording'
    }],
    embeddingProvider,
    calibrationPolicy: policy
  });

  const out = await stage.run({
    previous_output: {
      candidate: {
        id: 'candidate-review',
        language: 'ar',
        question_ar: 'صياغة عربية مختلفة'
      }
    }
  });

  assert.equal(out.quality.duplication.result, 'REVIEW_REQUIRED');
  assert.equal(out.quality.duplication.semantic_scope, 'cross_language');
});

test('cross-language semantic score above calibrated duplicate threshold rejects', async () => {
  const { createDeduplicateStage } = await import(
    '../src/platform-kernel/factory/stages/deduplicate.js'
  );

  const stage = createDeduplicateStage({
    inventory: [{
      id: 'inventory-duplicate',
      language: 'en',
      question_en: 'English form'
    }],
    embeddingProvider,
    calibrationPolicy: policy
  });

  await assert.rejects(
    () => stage.run({
      previous_output: {
        candidate: {
          id: 'candidate-duplicate',
          language: 'ar',
          question_ar: 'النموذج العربي'
        }
      }
    }),
    /near-duplicate|semantic duplicate/i
  );
});

test('missing semantic evidence remains REVIEW_REQUIRED when calibrated comparison is requested', async () => {
  const { createDeduplicateStage } = await import(
    '../src/platform-kernel/factory/stages/deduplicate.js'
  );

  const stage = createDeduplicateStage({
    inventory: [{
      id: 'unknown-inventory',
      language: 'en',
      question_en: 'English form'
    }],
    embeddingProvider: { embed: async () => null },
    calibrationPolicy: policy
  });

  const out = await stage.run({
    previous_output: {
      candidate: {
        id: 'unknown-candidate',
        language: 'ar',
        question_ar: 'النموذج العربي'
      }
    }
  });

  assert.equal(out.quality.duplication.result, 'REVIEW_REQUIRED');
});

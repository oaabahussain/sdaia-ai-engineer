import test from 'node:test';
import assert from 'node:assert/strict';

const candidate = {
  question: 'سؤال',
  options: ['أ', 'ب', 'ج'],
  question_en: 'Question',
  options_en: ['A', 'B', 'C']
};

const allPass = {
  "learning_intent": {
    "result": "PASS"
  },
  "correct_answer": {
    "result": "PASS"
  },
  "reasoning": {
    "result": "PASS"
  },
  "distractor_logic": {
    "result": "PASS"
  },
  "terminology": {
    "result": "PASS"
  },
  "accuracy": {
    "result": "PASS"
  },
  "locale": {
    "result": "PASS"
  },
  "audience": {
    "result": "PASS"
  },
  "layout_markup": {
    "result": "PASS"
  }
};

test('bilingual stage blocks failed correct-answer equivalence despite strong supporting metric', async () => {
  const { createBilingualStage } = await import(
    '../src/platform-kernel/factory/stages/bilingual.js'
  );

  const report = {
    report_id: 'bilingual:1',
    dimensions: structuredClone(allPass),
    supporting_metrics: { semantic_similarity: 0.99 },
    overall_result: 'FAIL'
  };
  report.dimensions.correct_answer.result = 'FAIL';

  const stage = createBilingualStage({
    translationProvider: {
      checkEquivalence: async () => ({ report })
    }
  });

  await assert.rejects(
    () => stage.run({ previous_output: { candidate } }),
    /correct_answer|bilingual equivalence failed/i
  );
});

test('bilingual stage routes a missing critical report dimension to review', async () => {
  const { createBilingualStage } = await import(
    '../src/platform-kernel/factory/stages/bilingual.js'
  );

  const dimensions = structuredClone(allPass);
  delete dimensions.reasoning;

  const stage = createBilingualStage({
    translationProvider: {
      checkEquivalence: async () => ({
        report: {
          report_id: 'bilingual:missing',
          dimensions,
          supporting_metrics: { semantic_similarity: 0.99 },
          overall_result: 'PASS'
        }
      })
    }
  });

  const out = await stage.run({ previous_output: { candidate } });
  assert.equal(out.quality.bilingual_equivalence.result, 'REVIEW_REQUIRED');
});

test('bilingual stage passes only when every critical report dimension passes', async () => {
  const { createBilingualStage } = await import(
    '../src/platform-kernel/factory/stages/bilingual.js'
  );

  const stage = createBilingualStage({
    translationProvider: {
      checkEquivalence: async () => ({
        report: {
          report_id: 'bilingual:pass',
          dimensions: structuredClone(allPass),
          supporting_metrics: { semantic_similarity: 0.93 },
          overall_result: 'PASS'
        }
      })
    }
  });

  const out = await stage.run({ previous_output: { candidate } });
  assert.equal(out.quality.bilingual_equivalence.result, 'PASS');
  assert.equal(out.quality.bilingual_equivalence.report_id, 'bilingual:pass');
});

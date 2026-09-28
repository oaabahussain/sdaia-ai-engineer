import test from 'node:test';
import assert from 'node:assert/strict';

const inventory = [{
  question_en: 'A completely different wording',
  objective_id: 'obj:1',
  correct_reasoning: 'Use calibrated evidence before promotion',
  misconception_ids: ['m2', 'm1']
}];

const candidate = {
  question_en: 'New wording that is not an exact text duplicate',
  objective_id: 'obj:1',
  correct_reasoning: '  use   calibrated evidence before promotion ',
  misconception_ids: ['m1', 'm2']
};

test('dedup stage rejects a structural duplicate despite different wording', async () => {
  const { createDeduplicateStage } = await import(
    '../src/platform-kernel/factory/stages/deduplicate.js'
  );

  const stage = createDeduplicateStage({ inventory });

  await assert.rejects(
    () => stage.run({ previous_output: { candidate } }),
    /structural duplicate/i
  );
});

test('dedup stage can route structural matches to review by policy', async () => {
  const { createDeduplicateStage } = await import(
    '../src/platform-kernel/factory/stages/deduplicate.js'
  );

  const stage = createDeduplicateStage({
    inventory,
    structuralPolicy: { on_match: 'REVIEW_REQUIRED' }
  });

  const out = await stage.run({ previous_output: { candidate } });

  assert.equal(out.quality.duplication.result, 'REVIEW_REQUIRED');
  assert.equal(out.quality.duplication.structural_match, true);
});

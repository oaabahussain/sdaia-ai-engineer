import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import Ajv from 'ajv';

const load = name => JSON.parse(
  fs.readFileSync(new URL('../data/schema/' + name, import.meta.url), 'utf8')
);

const compile = name => new Ajv({
  strict: false,
  allErrors: true,
  formats: { 'date-time': true }
}).compile(load(name));

const pass = result => ({ result });

const valid = {
  schema_version: 1,
  report_id: 'bilingual:family:1:v1',
  family_id: 'family:1',
  dimensions: {
    learning_intent: pass('PASS'),
    correct_answer: pass('PASS'),
    reasoning: pass('PASS'),
    distractor_logic: pass('PASS'),
    terminology: pass('PASS'),
    accuracy: pass('PASS'),
    locale: pass('PASS'),
    audience: pass('PASS'),
    layout_markup: pass('PASS')
  },
  supporting_metrics: {
    semantic_similarity: 0.97
  },
  overall_result: 'PASS',
  created_at: '2026-09-28T00:00:00Z'
};

test('BilingualEquivalenceReportV1 requires every critical dimension', () => {
  const validate = compile('bilingual-equivalence-report-v1.schema.json');
  assert.equal(validate(valid), true, JSON.stringify(validate.errors));

  const missingAnswer = structuredClone(valid);
  delete missingAnswer.dimensions.correct_answer;
  assert.equal(validate(missingAnswer), false);
});

test('BilingualEquivalenceReportV1 does not allow an aggregate score to replace dimensions', () => {
  const validate = compile('bilingual-equivalence-report-v1.schema.json');

  assert.equal(validate({
    schema_version: 1,
    report_id: 'bilingual:aggregate-only',
    family_id: 'family:1',
    aggregate_score: 0.99,
    overall_result: 'PASS',
    created_at: '2026-09-28T00:00:00Z'
  }), false);
});

test('BilingualEquivalenceReportV1 permits ABSTAIN on a dimension for review escalation', () => {
  const validate = compile('bilingual-equivalence-report-v1.schema.json');
  const reviewable = structuredClone(valid);
  reviewable.dimensions.terminology.result = 'ABSTAIN';
  reviewable.overall_result = 'REVIEW_REQUIRED';

  assert.equal(validate(reviewable), true, JSON.stringify(validate.errors));
});

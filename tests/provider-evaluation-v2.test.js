import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const fixture = JSON.parse(
  fs.readFileSync(
    new URL('./fixtures/factory/provider-gold-set-v2.json', import.meta.url),
    'utf8'
  )
);

test('evaluateProviderV2 adds K2 quality dimensions without changing V1 output', async () => {
  const { evaluateProvider, evaluateProviderV2 } = await import(
    '../src/platform-kernel/providers/evaluateProvider.js'
  );

  const provider = {
    name: 'deterministic',
    model: null,
    generate: async input => ({
      answer: input.x,
      source_refs: ['s1'],
      evidence_refs: ['s1'],
      ar: 'سؤال',
      en: 'Question',
      distractors: ['a', 'b', 'c'],
      format_ok: true,
      unsupported_claims: [],
      ambiguity_flags: [],
      bilingual_equivalent: true,
      cognitive_level: input.x === 1 ? 'apply' : 'analyze'
    })
  };

  const v1 = await evaluateProvider(provider, fixture.cases, {
    policy_version: 'k1.provider-eval.v1',
    created_at: '2026-09-28T00:00:00Z'
  });

  assert.deepEqual(Object.keys(v1.metrics).sort(), [
    'arabic_quality',
    'correctness',
    'cost',
    'distractor_quality',
    'english_quality',
    'format_compliance',
    'latency_ms',
    'source_fidelity'
  ].sort());

  const v2 = await evaluateProviderV2(provider, fixture.cases, {
    policy_version: 'k2.provider-eval.v2',
    created_at: '2026-09-28T00:00:00Z'
  });

  assert.equal(v2.evaluation_profile, 'k2');
  assert.equal(v2.metrics.correctness, 1);
  assert.equal(v2.metrics.evidence_fidelity, 1);
  assert.equal(v2.metrics.hallucination_free, 1);
  assert.equal(v2.metrics.ambiguity_control, 1);
  assert.equal(v2.metrics.bilingual_equivalence, 1);
  assert.equal(v2.metrics.cognitive_alignment, 1);
  assert.equal(v2.metrics.distractor_quality, 1);
});

test('evaluateProviderV2 fails a configured mandatory K2 dimension', async () => {
  const { evaluateProviderV2 } = await import(
    '../src/platform-kernel/providers/evaluateProvider.js'
  );

  const provider = {
    name: 'weak-provider',
    model: 'weak-v1',
    generate: async () => ({
      answer: 9,
      source_refs: [],
      evidence_refs: [],
      ar: '',
      en: '',
      distractors: [],
      format_ok: false,
      unsupported_claims: ['unsupported fact'],
      ambiguity_flags: ['multiple plausible answers'],
      bilingual_equivalent: false,
      cognitive_level: 'remember'
    })
  };

  const result = await evaluateProviderV2(provider, fixture.cases, {
    policy_version: 'k2.provider-eval.v2',
    created_at: '2026-09-28T00:00:00Z',
    thresholds: {
      correctness: 1,
      evidence_fidelity: 1,
      hallucination_free: 1,
      ambiguity_control: 1,
      bilingual_equivalence: 1,
      cognitive_alignment: 1
    }
  });

  assert.equal(result.decision, 'FAIL');
});

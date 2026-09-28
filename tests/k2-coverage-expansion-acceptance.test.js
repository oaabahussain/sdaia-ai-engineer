import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { expandConceptBank } from '../src/logic/questionBank.js';
import { loadTrack, loadTrackRegistry } from '../scripts/load_track.js';

const exists = path => fs.existsSync(new URL('../' + path, import.meta.url));

const requiredContractsAndModules = [
  'data/schema/calibration-policy-meta-v1.schema.json',
  'data/schema/expansion-plan-v1.schema.json',
  'data/schema/tranche-plan-v1.schema.json',
  'data/schema/provider-routing-policy-v1.schema.json',
  'data/schema/review-calibration-policy-v1.schema.json',
  'data/schema/dedup-calibration-policy-v1.schema.json',
  'data/schema/bilingual-equivalence-report-v1.schema.json',
  'data/schema/activation-evidence-v1.schema.json',
  'data/schema/canary-policy-v1.schema.json',
  'data/schema/event-definition-v1.schema.json',
  'data/schema/improvement-finding-v1.schema.json',
  'data/schema/experiment-record-v1.schema.json',
  'src/platform-kernel/coverage/expansionPlan.js',
  'src/platform-kernel/orchestration/tranchePlan.js',
  'src/platform-kernel/orchestration/tranchePolicy.js',
  'src/platform-kernel/orchestration/trancheRunner.js',
  'src/platform-kernel/orchestration/trancheMetrics.js',
  'src/platform-kernel/providers/routeProvider.js',
  'src/platform-kernel/factory/stages/deduplicate.js',
  'src/platform-kernel/factory/stages/bilingual.js',
  'src/platform-kernel/policies/reviewCalibration.js',
  'src/platform-kernel/release/activationEvidence.js',
  'src/platform-kernel/release/quarantine.js',
  'src/platform-kernel/observability/eventRegistry.js',
  'src/platform-kernel/observability/privacyPolicy.js',
  'src/platform-kernel/observability/ports.js',
  'src/platform-kernel/observability/factorySignals.js',
  'src/platform-kernel/observability/improvementFinding.js',
  'scripts/platform-kernel/adapters/k2GovernanceFileStore.js'
];

function activationEvidenceFixture(overrides = {}) {
  return {
    schema_version: 1,
    activation_evidence_id: 'activation:release:acceptance:1',
    release_id: 'release:acceptance',
    tranche_id: 'tranche:acceptance',
    content_hash: 'a'.repeat(64),
    policy_versions: {
      quality_policy_version: 'quality:v1',
      review_policy_version: 'review:v1',
      calibration_policy_versions: ['canary:v1']
    },
    provider_evaluation_refs: ['provider-eval:1'],
    coverage_delta: { closed_gap_ids: ['gap:1'], added_family_count: 1 },
    duplicate_findings: { status: 'PASS', finding_count: 0 },
    correctness_summary: { status: 'PASS' },
    bilingual_summary: { status: 'PASS' },
    accessibility_summary: { status: 'PASS' },
    review_summary: { status: 'PASS', unresolved_count: 0 },
    runtime_verification: { status: 'PASS' },
    canary_observation: {
      evidence_classes: ['runtime_compatibility','quality','review'],
      observation_ref: 'canary:obs:acceptance'
    },
    blockers: [],
    evidence_sufficiency: 'SUFFICIENT',
    decision: 'PROMOTE',
    actor: 'release-controller',
    approver: 'release-policy',
    created_at: '2026-09-28T00:00:00Z',
    ...overrides
  };
}

test('K2 required contracts and modules exist', () => {
  assert.deepEqual(requiredContractsAndModules.filter(path => !exists(path)), []);
  assert.equal(new Set(requiredContractsAndModules).size, requiredContractsAndModules.length);
});

test('K2 expansion plans are coverage driven rather than count only', async () => {
  const { buildExpansionPlan } = await import('../src/platform-kernel/coverage/expansionPlan.js');
  const policyVersions = {
    source_policy_version: 'source:v1',
    quality_policy_version: 'quality:v1',
    review_policy_version: 'review:v1',
    tranche_calibration_policy_version: 'tranche:v1'
  };
  const gap = {
    schema_version: 1,
    gap_id: 'gap:acceptance',
    track_id: 'sdaia-ai-engineer',
    domain_id: 'mlops-llmops',
    objective_id: 'obj:1',
    concept_ids: ['concept:1'],
    misconception_ids: [],
    cognitive_level: 'apply',
    intended_difficulty: 'hard',
    languages: ['ar', 'en'],
    status: 'open',
    requested_count: 4
  };
  const plan = buildExpansionPlan({
    trackId: 'sdaia-ai-engineer',
    gaps: [gap],
    context: { createdAt: '2026-09-28T00:00:00Z', sourceReadiness: { 'gap:acceptance': true } },
    policyVersions
  });
  assert.deepEqual(plan.coverage_gap_ids, ['gap:acceptance']);
  assert.throws(() => buildExpansionPlan({
    trackId: 'sdaia-ai-engineer',
    gaps: [{ requested_count: 14000 }],
    context: { createdAt: '2026-09-28T00:00:00Z' },
    policyVersions
  }), /CoverageGapV1|gap_id/i);
});

test('K2 adaptive tranche decisions hold when evidence is insufficient', async () => {
  const { decideNextTranche } = await import('../src/platform-kernel/orchestration/tranchePolicy.js');
  const policy = {
    min_count: 4, max_count: 40, expand_yield_rate: 0.85,
    contract_yield_rate: 0.6, max_failure_rate: 0.2,
    max_review_backlog: 20, expansion_factor: 1.5, contraction_factor: 0.5
  };
  assert.deepEqual(decideNextTranche(policy, {}, { requestedCount: 20 }), {
    decision: 'HOLD', requestedCount: null, reason: 'insufficient_metrics'
  });
});

test('K2 provider routing rejects unapproved providers and preserves fallback', async () => {
  const { routeProvider } = await import('../src/platform-kernel/providers/routeProvider.js');
  const policy = {
    schema_version: 1, policy_id: 'routing', version: '1',
    routes: [{ capability: 'generate', language: 'ar', risk_classes: ['low'], required_evaluation_status: 'APPROVED', provider_refs: ['p1'] }],
    fallback: { mode: 'DETERMINISTIC', provider_ref: 'deterministic' },
    created_at: '2026-09-28T00:00:00Z'
  };
  assert.deepEqual(routeProvider({
    capability: 'generate', language: 'ar', riskClass: 'low',
    candidates: [{ provider_ref: 'p1', evaluation_status: 'FAILED' }], policy
  }), { mode: 'DETERMINISTIC', providerRef: 'deterministic', reason: 'no_eligible_provider' });
});

test('K2 deduplication exposes calibrated duplicate review gray zones', async () => {
  const { createDeduplicateStage } = await import('../src/platform-kernel/factory/stages/deduplicate.js');
  const stage = createDeduplicateStage({
    inventory: [{ id: 'inventory', language: 'en', question_en: 'English form' }],
    embeddingProvider: { embed: async item => item.id === 'candidate' ? [1, 0] : [0.85, Math.sqrt(1 - 0.85 ** 2)] },
    calibrationPolicy: {
      same_language: { review_lower_bound: 0.86, duplicate_threshold: 0.95 },
      cross_language: { review_lower_bound: 0.80, duplicate_threshold: 0.93 }
    }
  });
  const out = await stage.run({ previous_output: { candidate: { id: 'candidate', language: 'ar', question_ar: 'صياغة عربية' } } });
  assert.equal(out.quality.duplication.result, 'REVIEW_REQUIRED');
  assert.equal(out.quality.duplication.semantic_scope, 'cross_language');
});

test('K2 bilingual equivalence blocks critical semantic disagreement', async () => {
  const { createBilingualStage } = await import('../src/platform-kernel/factory/stages/bilingual.js');
  const dimensions = Object.fromEntries([
    'learning_intent','correct_answer','reasoning','distractor_logic','terminology','accuracy','locale','audience','layout_markup'
  ].map(name => [name, { result: 'PASS' }]));
  dimensions.correct_answer.result = 'FAIL';
  const stage = createBilingualStage({
    translationProvider: { checkEquivalence: async () => ({
      report: { report_id: 'bilingual:acceptance', dimensions, supporting_metrics: { semantic_similarity: 0.99 }, overall_result: 'FAIL' }
    }) }
  });
  await assert.rejects(() => stage.run({ previous_output: { candidate: {
    question: 'سؤال', options: ['أ','ب','ج'], question_en: 'Question', options_en: ['A','B','C']
  } } }), /correct_answer|bilingual equivalence failed/i);
});

test('K2 risk based review escalates on high risk or observed drift', async () => {
  const { decideReviewRequirement } = await import('../src/platform-kernel/policies/reviewCalibration.js');
  const policy = {
    risk_rules: [{ risk_class: 'low', decision: 'SAMPLED', sampling_rate: 0.25 }],
    mandatory_human_conditions: ['new_provider'],
    escalation_triggers: [{ metric: 'rejection_rate', operator: 'gte', threshold: 0.1, action: 'HUMAN_REQUIRED' }]
  };
  const out = decideReviewRequirement({
    policy, risk: 'low', observedMetrics: { rejection_rate: 0.2 }, candidate: { id: 'item:1' }
  });
  assert.equal(out.decision, 'HUMAN_REQUIRED');
  assert.equal(out.selectedForReview, true);
});

test('K2 activation evidence is required before CANARY promotion to ACTIVE', async () => {
  const { transitionContentRelease } = await import('../src/platform-kernel/release/releases.js');
  const { evaluateActivationEvidence } = await import('../src/platform-kernel/release/activationEvidence.js');
  const canary = { release_id: 'release:acceptance', status: 'CANARY' };
  const policy = {
    required_evidence_classes: ['runtime_compatibility','quality','review'],
    blocker_policy: { critical_alert: 'QUARANTINE', missing_required_metric: 'HOLD' }
  };
  const evidence = activationEvidenceFixture();

  assert.throws(
    () => transitionContentRelease(canary, 'activate', { activation_evidence: evidence }),
    /evaluat|trusted/i
  );

  const evaluation = evaluateActivationEvidence(evidence, policy);
  const active = transitionContentRelease(canary, 'activate', {
    activation_evidence: evidence,
    activation_evaluation: evaluation
  });
  assert.equal(active.status, 'ACTIVE');
});

test('K2 insufficient CANARY evidence yields HOLD', async () => {
  const { evaluateActivationEvidence } = await import('../src/platform-kernel/release/activationEvidence.js');
  const policy = {
    required_evidence_classes: ['runtime_compatibility','quality','review'],
    blocker_policy: { critical_alert: 'QUARANTINE', missing_required_metric: 'HOLD' }
  };
  const evidence = activationEvidenceFixture({
    canary_observation: {
      evidence_classes: ['runtime_compatibility','quality'],
      observation_ref: 'canary:obs:missing-review'
    },
    decision: 'HOLD'
  });
  const out = evaluateActivationEvidence(evidence, policy);
  assert.equal(out.decision, 'HOLD');
  assert.deepEqual(out.missingEvidenceClasses, ['review']);
});

test('K2 rollback and quarantine preserve immutable release history', async () => {
  const { rollbackRelease } = await import('../src/platform-kernel/release/releases.js');
  const { createQuarantineEvent, selectAfterQuarantine } = await import('../src/platform-kernel/release/quarantine.js');
  const previous = Object.freeze({ release_id: 'r1', status: 'ACTIVE', content_hash: 'a' });
  const current = Object.freeze({ release_id: 'r2', status: 'ACTIVE', content_hash: 'b' });
  const rollback = rollbackRelease(current, previous, 'regression', { actor: 'system', at: '2026-09-28T00:00:00Z' });
  assert.equal(rollback.active_release, previous);
  const selection = Object.freeze({
    release_ids: Object.freeze(['r1','r2']), tranche_ids: Object.freeze([]),
    family_ids: Object.freeze(['f1','f2']), item_version_ids: Object.freeze([])
  });
  const event = createQuarantineEvent({
    scope: 'family', from_target_id: 'f1', reason: 'quality defect', actor: 'system',
    at: '2026-09-28T00:00:00Z', triggering_evidence_refs: ['e1'], follow_up_required: true
  });
  const next = selectAfterQuarantine(selection, event);
  assert.deepEqual(next.family_ids, ['f2']);
  assert.deepEqual(selection.family_ids, ['f1','f2']);
  assert.equal(current.status, 'ACTIVE');
});

test('K2 event definitions require versioned privacy classified contracts', async () => {
  const { registerEventDefinition } = await import('../src/platform-kernel/observability/eventRegistry.js');
  assert.throws(() => registerEventDefinition({
    schema_version: 1, event_name: 'product.invalid', event_version: 1,
    purpose: 'invalid', owner: 'test', trigger_semantics: 'test',
    properties: { track_id: { type: 'string', required: true } },
    privacy_class: 'ANONYMOUS', retention_class: 'STANDARD', producer: 'test',
    compatibility: { strategy: 'NEW_EVENT', previous_versions: [] },
    created_at: '2026-09-28T00:00:00Z'
  }), /Invalid EventDefinitionV1/);
});

test('K2 improvement findings separate observations from causal hypotheses', async () => {
  const { registerEventDefinition, validateEvent } = await import('../src/platform-kernel/observability/eventRegistry.js');
  const { createImprovementFinding } = await import('../src/platform-kernel/observability/improvementFinding.js');
  const definitionId = registerEventDefinition({
    schema_version: 1, event_name: 'factory.acceptance.signal', event_version: 1,
    purpose: 'acceptance signal', owner: 'test', trigger_semantics: 'acceptance',
    properties: { tranche_id: { type: 'string', required: true, privacy_class: 'ANONYMOUS', export: 'ALLOW' } },
    privacy_class: 'ANONYMOUS', retention_class: 'STANDARD', producer: 'test',
    compatibility: { strategy: 'NEW_EVENT', previous_versions: [] },
    created_at: '2026-09-28T00:00:00Z'
  });
  const signal = validateEvent(definitionId, {
    occurred_at: '2026-09-28T00:00:01Z', properties: { tranche_id: 't1' }
  });
  assert.throws(() => createImprovementFinding({
    findingId: 'finding:causal', signal, signalType: 'quality_drift', summary: 'drift',
    evidenceRefs: ['event:1'], scope: { kind: 'tranche', ref: 't1' },
    uncertainty: { confidence: 'LOW', limitations: ['observational'] },
    hypothesis: { statement: 'provider caused drift', evidence_class: 'CORRELATION', causal: true },
    counterEvidence: [], recommendedInvestigation: 'inspect', expectedImpact: 'unknown',
    owner: 'test', createdAt: '2026-09-28T00:00:02Z'
  }), /causal/i);
});

test('K2 current learner visible runtime remains unchanged before promotion', () => {
  const root = new URL('..', import.meta.url).pathname;
  const trackId = loadTrackRegistry(root).default_track_id;
  const bundle = loadTrack(root, trackId);
  const questions = expandConceptBank(bundle.concepts, { trackId, domainCatalog: bundle.domains });
  const legacy = item => ({
    domain: bundle.domains.domains.find(d => d.id === item.domain_id)?.legacy_keys?.[0] || item.domain_id,
    topic: item.topic, question: item.question, question_en: item.question_en,
    options: item.options, options_en: item.options_en, answer: item.answer,
    explanation: item.explanation, explanation_en: item.explanation_en, difficulty: item.difficulty
  });
  const digest = crypto.createHash('sha256').update(JSON.stringify(questions.map(legacy))).digest('hex');
  assert.equal(questions.length, 1120);
  assert.equal(bundle.examProfile.question_count, 200);
  assert.equal(digest, '5e48b1e47450f1150c9c8f21386f3a4e31070a3d444f968d10f45ccb9ff418a9');
});

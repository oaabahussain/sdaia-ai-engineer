# K2 Coverage Expansion & Controlled Release Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the K2 governed coverage-expansion and controlled-release layer on top of K1 without changing current learner-visible behavior until an explicitly approved content release is promoted.

**Architecture:** Extend the existing modular-monolith platform kernel with versioned expansion, calibration, bilingual-equivalence, activation-evidence, event-governance and improvement contracts. Keep K1 lifecycle/persistence/provider boundaries intact; use adapters for commodity analytics/flags/telemetry; defer operating thresholds to versioned calibration policies learned from pilot/runtime evidence.

**Tech Stack:** Node.js ES modules, JSON Schema + Ajv, existing file/JSONL/SQLite adapters, Python/FastAPI SQLite reference adapter, GitHub Actions, optional adapter seams for OpenFeature/OpenTelemetry/product analytics without adding a mandatory vendor dependency.

**Spec:** `docs/superpowers/specs/2026-09-28-k2-coverage-expansion-controlled-release-design.md`

## Global Constraints

- Current learner-visible baseline stays unchanged until a governed K2 release is intentionally promoted.
- K2 consumes K1 contracts and may not silently reinterpret K1 history.
- QuestionFamilyV2 remains the canonical expansion unit.
- Raw count alone is never an acceptance criterion.
- AI/provider output remains untrusted candidate data.
- CANARY is mandatory before ACTIVE.
- Released ItemVersion and ContentRelease history remain immutable.
- No psychometric, mastery, readiness or calibrated-difficulty claims are introduced.
- Arabic and English remain first-class.
- No dedicated vector database, workflow engine, warehouse, queue or microservice is added without measured need.
- Commodity analytics/replay/flags/experimentation/tracing remain adapter capabilities.
- Calibration values are versioned policy/configuration, not hidden constants.
- Privacy/data-minimization and public/private artifact boundaries remain enforced.
- TDD is mandatory: RED → intended failure → minimal GREEN → affected regression suite → commit → ledger update.
- Every unexpected failure invokes systematic-debugging before product behavior is changed.

## Review Focus

1. **Insufficient CANARY evidence:** promotion must HOLD, never implicitly PASS. Pin in Task 31.
2. **Low-risk review drift:** sampled review must automatically escalate when observed rejection/anomaly rates worsen. Pin in Task 21.
3. **Cross-language near duplicate:** Arabic/English semantic similarity alone must not auto-reject without calibrated policy; gray zones become REVIEW_REQUIRED. Pin in Task 18.
4. **Partial tranche failure:** successful siblings remain durable while the tranche reports PARTIAL and retains exact failed-stage evidence. Pin in Task 27.
5. **Untrusted analytics event:** unknown/unversioned/private-overcapture event definitions must be rejected before export. Pin in Task 36.

---

# Checkpoint A — Baseline, execution governance and acceptance contract

### Task 1: Create K2 execution baseline

**Files:**
- Create: `docs/superpowers/reviews/2026-09-28-k2-baseline.md`
- Create: `docs/superpowers/reviews/2026-09-28-k2-execution-ledger.md`
- Create: `docs/superpowers/reviews/2026-09-28-k2-checkpoint.md`

**Interfaces:**
- Consumes: current `main` SHA, K1 post-merge verification, approved K2 spec and plan.
- Produces: durable execution authority and first exact task pointer.

- [ ] Record current base SHA, runtime count/digest/profile, K1 contract inventory, current CI evidence, known debt and compatibility boundaries.
- [ ] Initialize chronological ledger with plan/spec authority and “nothing merged” state.
- [ ] Initialize checkpoint at A with branch/base/next exact task.
- [ ] Verify all three documents are tracked and contain no stale “K2 not designed” statements.
- [ ] Commit: `docs: initialize K2 execution baseline`.

### Task 2: Add K2 acceptance test shell

**Files:**
- Create: `tests/k2-coverage-expansion-acceptance.test.js`

**Interfaces:**
- Consumes: future K2 public module paths.
- Produces: final K2 integration contract; initially expected RED for missing K2 modules.

- [ ] Write acceptance test names for expansion plan, tranche plan, calibration policies, bilingual report, activation evidence, event definition and improvement finding.
- [ ] Run: `node --test tests/k2-coverage-expansion-acceptance.test.js`.
- [ ] Confirm intended RED is missing K2 contract/module behavior, not test setup.
- [ ] Gate only assertions that require later checkpoints; keep import/contract existence RED evidence recorded.
- [ ] Commit: `test: define K2 acceptance contract`.

# Checkpoint B — Core K2 schemas and calibration metadata

### Task 3: ExpansionPlanV1 schema

**Files:**
- Create: `data/schema/expansion-plan-v1.schema.json`
- Create: `tests/expansion-plan-v1.test.js`

**Interfaces:**
- Produces: ExpansionPlanV1 with `plan_id, track_id, coverage_gap_ids, priorities, tranche_refs, policy_versions, status, created_at`.

- [ ] Write RED schema tests for required IDs, non-empty coverage gaps and versioned policies.
- [ ] Run targeted test and confirm schema missing RED.
- [ ] Add minimal schema; reject raw `requested_count`-only plans.
- [ ] Run targeted + `npm test`.
- [ ] Commit: `feat: add ExpansionPlanV1 contract`.

### Task 4: TranchePlanV1 schema

**Files:**
- Create: `data/schema/tranche-plan-v1.schema.json`
- Create: `tests/tranche-plan-v1.test.js`

**Interfaces:**
- Produces: TranchePlanV1 with bounded request set, policy refs, risk mix, capacity inputs and status.

- [ ] RED: invalid without coverage-derived requests and calibration-policy version.
- [ ] Run targeted RED.
- [ ] Implement schema with `PLANNED/RUNNING/PARTIAL/COMPLETED/PAUSED/FAILED`.
- [ ] Run targeted + schema regression suite.
- [ ] Commit: `feat: add TranchePlanV1 contract`.

### Task 5: Shared CalibrationPolicy metadata schema

**Files:**
- Create: `data/schema/calibration-policy-meta-v1.schema.json`
- Create: `tests/calibration-policy-meta-v1.test.js`

**Interfaces:**
- Produces: reusable metadata `policy_id, version, scope, evidence_basis, effective_from, observed_data_refs, owner, approver, reconsideration_trigger`.

- [ ] RED required metadata and immutable version identity.
- [ ] Run RED.
- [ ] Implement minimal shared metadata schema.
- [ ] Run targeted + `npm test`.
- [ ] Commit: `feat: add calibration policy metadata contract`.

### Task 6: ProviderRoutingPolicyV1 schema

**Files:**
- Create: `data/schema/provider-routing-policy-v1.schema.json`
- Create: `tests/provider-routing-policy-v1.test.js`

**Interfaces:**
- Produces: routing policy by capability/language/risk/evaluation status/cost-latency bounds/fallback.

- [ ] RED: policy cannot route to unapproved provider state by default.
- [ ] Run RED.
- [ ] Implement schema with explicit deterministic/no-AI fallback field.
- [ ] Run targeted + `npm test`.
- [ ] Commit: `feat: add provider routing policy contract`.

### Task 7: ReviewCalibrationPolicyV1 schema

**Files:**
- Create: `data/schema/review-calibration-policy-v1.schema.json`
- Create: `tests/review-calibration-policy-v1.test.js`

**Interfaces:**
- Produces: risk classes, mandatory-human conditions, sampling ranges and escalation triggers.

- [ ] RED: fixed bare percentage without evidence/scope is invalid.
- [ ] Run RED.
- [ ] Implement schema; require escalation triggers and policy metadata.
- [ ] Run targeted + `npm test`.
- [ ] Commit: `feat: add review calibration policy contract`.

### Task 8: DedupCalibrationPolicyV1 schema

**Files:**
- Create: `data/schema/dedup-calibration-policy-v1.schema.json`
- Create: `tests/dedup-calibration-policy-v1.test.js`

**Interfaces:**
- Produces: lexical/semantic thresholds, gray-zone bounds, embedding profile, labeled-set reference.

- [ ] RED: semantic threshold without labeled calibration set reference is invalid.
- [ ] Run RED.
- [ ] Implement schema with same-language/cross-language threshold scopes.
- [ ] Run targeted + `npm test`.
- [ ] Commit: `feat: add dedup calibration policy contract`.

### Task 9: CanaryPolicyV1 schema

**Files:**
- Create: `data/schema/canary-policy-v1.schema.json`
- Create: `tests/canary-policy-v1.test.js`

**Interfaces:**
- Produces: minimum evidence classes, hold conditions, blocker policy and exposure calibration refs.

- [ ] RED: fixed duration alone cannot constitute promotion policy.
- [ ] Run RED.
- [ ] Implement schema with evidence sufficiency and HOLD semantics.
- [ ] Run targeted + `npm test`.
- [ ] Commit: `feat: add CanaryPolicyV1 contract`.

# Checkpoint C — Coverage prioritization and adaptive tranche planning

### Task 10: Coverage priority model

**Files:**
- Create: `src/platform-kernel/coverage/prioritize.js`
- Create: `tests/coverage-priority.test.js`

**Interfaces:**
- Consumes: `prioritizeCoverageGaps(gaps, context) -> prioritized[]`.
- Produces: stable ordering with reason fields; no aggregate quality override.

- [ ] RED deterministic ordering for equal inputs and explicit tie-break by stable gap ID.
- [ ] Run RED.
- [ ] Implement priority factors: deficit, source readiness, risk, duplicate pressure, review capacity, bilingual/accessibility complexity.
- [ ] Run targeted + coverage suite.
- [ ] Commit: `feat: prioritize coverage gaps for K2`.

### Task 11: Expansion plan builder

**Files:**
- Create: `src/platform-kernel/coverage/expansionPlan.js`
- Create: `tests/expansion-plan.test.js`

**Interfaces:**
- Consumes: `buildExpansionPlan({trackId,gaps,context,policyVersions}) -> ExpansionPlanV1`.
- Produces: coverage-derived plan only.

- [ ] RED count-only input throws.
- [ ] Run RED.
- [ ] Implement stable plan generation from prioritized gaps.
- [ ] Run targeted + coverage suite.
- [ ] Commit: `feat: build governed expansion plans`.

### Task 12: Adaptive tranche policy engine

**Files:**
- Create: `src/platform-kernel/orchestration/tranchePolicy.js`
- Create: `tests/tranche-policy.test.js`

**Interfaces:**
- Consumes: `decideNextTranche(policy, metrics, demand) -> {decision,requestedCount,reason}`.
- Produces: `EXPAND/CONTRACT/HOLD/CONTINUE/STOP`.

- [ ] RED insufficient metrics returns HOLD, not guessed count.
- [ ] RED worsening failure/review backlog contracts or holds.
- [ ] Implement bounded policy decision using policy min/max and observed inputs.
- [ ] Run targeted + orchestration suite.
- [ ] Commit: `feat: add adaptive tranche policy`.

### Task 13: Tranche plan builder

**Files:**
- Create: `src/platform-kernel/orchestration/tranchePlan.js`
- Create: `tests/tranche-plan.test.js`

**Interfaces:**
- Consumes: `buildTranchePlan(expansionPlan, trancheDecision, policyRefs) -> TranchePlanV1`.
- Produces: bounded provider-neutral factory requests.

- [ ] RED tranche cannot include gaps absent from expansion plan.
- [ ] Run RED.
- [ ] Implement deterministic grouping and lineage refs.
- [ ] Run targeted + `npm test`.
- [ ] Commit: `feat: build governed tranche plans`.

# Checkpoint D — Provider routing and evaluation upgrade

### Task 14: Provider routing policy runtime

**Files:**
- Create: `src/platform-kernel/providers/routeProvider.js`
- Create: `tests/provider-routing.test.js`

**Interfaces:**
- Consumes: `routeProvider({capability,language,riskClass,candidates,policy}) -> routeDecision`.
- Produces: selected provider or deterministic/manual fallback with reason.

- [ ] RED unapproved candidate is never selected.
- [ ] RED no eligible provider returns configured fallback/ABSTAIN.
- [ ] Implement stable routing.
- [ ] Run provider suite.
- [ ] Commit: `feat: route providers by governed policy`.

### Task 15: Provider evaluation v2 metrics

**Files:**
- Modify: `src/platform-kernel/providers/evaluateProvider.js`
- Create: `tests/provider-evaluation-v2.test.js`
- Create: `tests/fixtures/factory/provider-gold-set-v2.json`

**Interfaces:**
- Consumes existing evaluation entrypoint.
- Produces extended metrics: hallucination/evidence fidelity, ambiguity, bilingual equivalence, cognitive alignment, distractor quality plus existing dimensions.

- [ ] RED new gold-set dimensions absent.
- [ ] Run RED.
- [ ] Extend evaluator without breaking V1 schema consumers.
- [ ] Run provider V1 + V2 suites.
- [ ] Commit: `feat: extend provider evaluation dimensions`.

### Task 16: Production-failure eval ingestion seam

**Files:**
- Create: `src/platform-kernel/providers/evalCases.js`
- Create: `tests/provider-eval-cases.test.js`

**Interfaces:**
- Produces: `createEvalCaseFromFinding(finding) -> immutable eval case`.

- [ ] RED unsupported finding types cannot silently become gold truth.
- [ ] Implement candidate eval-case creation with review status.
- [ ] Run targeted + provider suite.
- [ ] Commit: `feat: capture reviewed production failures as eval cases`.

# Checkpoint E — Deduplication v2 and bilingual equivalence

### Task 17: Structural duplicate evidence

**Files:**
- Modify: `src/platform-kernel/factory/stages/deduplicate.js`
- Create: `tests/factory-dedup-structural.test.js`

**Interfaces:**
- Adds structural family/objective/reasoning signals before embedding comparison.

- [ ] RED same normalized reasoning/objective structure flags duplicate/review according to policy.
- [ ] Run RED.
- [ ] Implement structural fingerprint evidence.
- [ ] Run all dedup tests.
- [ ] Commit: `feat: add structural duplicate evidence`.

### Task 18: Cross-lingual semantic gray-zone behavior

**Files:**
- Modify: `src/platform-kernel/factory/stages/deduplicate.js`
- Create: `tests/factory-dedup-crosslingual.test.js`

**Interfaces:**
- Consumes DedupCalibrationPolicyV1 and embedding provider.
- Produces PASS / DUPLICATE / REVIEW_REQUIRED with evidence record.

- [ ] RED AR↔EN score inside gray zone returns REVIEW_REQUIRED.
- [ ] RED unavailable embedding remains REVIEW_REQUIRED when semantic evidence is required.
- [ ] Implement policy-scoped same/cross-language comparison.
- [ ] Run all dedup/provider tests.
- [ ] Commit: `feat: add calibrated cross-lingual dedup`.

### Task 19: BilingualEquivalenceReportV1 schema

**Files:**
- Create: `data/schema/bilingual-equivalence-report-v1.schema.json`
- Create: `tests/bilingual-equivalence-report-v1.test.js`

**Interfaces:**
- Produces critical dimensions: intent, answer, reasoning, distractor logic, terminology, accuracy, locale, audience, layout/markup plus supporting metrics.

- [ ] RED aggregate score cannot replace critical dimension results.
- [ ] Run RED.
- [ ] Implement schema with PASS/FAIL/ABSTAIN per dimension.
- [ ] Run targeted + `npm test`.
- [ ] Commit: `feat: add bilingual equivalence report contract`.

### Task 20: Bilingual stage v2

**Files:**
- Modify: `src/platform-kernel/factory/stages/bilingual.js`
- Create: `tests/factory-bilingual-v2.test.js`

**Interfaces:**
- Consumes report + optional translation/semantic provider outputs.
- Produces PASS or REVIEW_REQUIRED/FAIL; no single metric override.

- [ ] RED failed correct-answer equivalence blocks PASS despite high aggregate metric.
- [ ] RED missing critical dimension becomes REVIEW_REQUIRED.
- [ ] Implement report-driven stage.
- [ ] Run bilingual + pipeline tests.
- [ ] Commit: `feat: enforce bilingual equivalence reports`.

# Checkpoint F — Risk-based review calibration

### Task 21: Review calibration runtime

**Files:**
- Create: `src/platform-kernel/policies/reviewCalibration.js`
- Create: `tests/review-calibration.test.js`

**Interfaces:**
- Consumes: `decideReviewRequirement({policy,risk,observedMetrics,candidate})`.
- Produces: HUMAN_REQUIRED / SAMPLED / AUTO_ELIGIBLE / HOLD with reason.

- [ ] RED new/high-risk/ambiguous candidate requires human.
- [ ] RED drift/rejection above policy escalation trigger increases strictness.
- [ ] Implement deterministic sampling decision from stable candidate ID when SAMPLED.
- [ ] Run review suite.
- [ ] Commit: `feat: calibrate review requirements by risk and evidence`.

### Task 22: Review stage integration

**Files:**
- Modify: `src/platform-kernel/factory/stages/review.js`
- Modify: `tests/factory-review-stage.test.js`

**Interfaces:**
- Consumes existing ReviewPolicy + ReviewCalibrationPolicy.
- Produces explicit review requirement/evidence.

- [ ] RED calibrated HUMAN_REQUIRED cannot be bypassed by automated approval.
- [ ] Implement calibration decision before activation eligibility.
- [ ] Run review + activation + pipeline tests.
- [ ] Verify K1 default behavior unchanged when no K2 calibration policy supplied.
- [ ] Commit: `feat: integrate calibrated review policy`.

# Checkpoint G — Tranche execution and durable partial results

### Task 23: Tranche run envelope

**Files:**
- Create: `src/platform-kernel/orchestration/trancheRunner.js`
- Create: `tests/tranche-runner.test.js`

**Interfaces:**
- Consumes: `runTranche(tranchePlan, runner, options) -> trancheResult`.
- Produces: status + per-request results + metrics.

- [ ] RED invalid/unapproved tranche state cannot run.
- [ ] Implement sequential reference path using existing LocalRunner.
- [ ] Run targeted + LocalRunner tests.
- [ ] Commit: `feat: run governed K2 tranches`.

### Task 24: Tranche resume/retry

**Files:**
- Modify: `src/platform-kernel/orchestration/trancheRunner.js`
- Modify: `tests/tranche-runner.test.js`

**Interfaces:**
- Adds `resumeTranche` and `retryFailedTrancheItems`.

- [ ] RED resume skips already durable successful siblings.
- [ ] Implement resume from existing FactoryRun stage outputs.
- [ ] Run targeted + batch runner/local runner suites.
- [ ] Commit: `feat: resume and retry tranche execution`.

### Task 25: Tranche metrics summarizer

**Files:**
- Create: `src/platform-kernel/orchestration/trancheMetrics.js`
- Create: `tests/tranche-metrics.test.js`

**Interfaces:**
- Produces stage pass/fail/abstain, yield, duplicate/evidence/bilingual/review rates and queue latency inputs.

- [ ] RED division-by-zero/empty tranche yields explicit unknowns, not false zero-quality inference.
- [ ] Implement deterministic summary.
- [ ] Run targeted tests.
- [ ] Commit: `feat: summarize tranche evidence`.

### Task 26: Adaptive follow-up decision integration

**Files:**
- Modify: `src/platform-kernel/orchestration/tranchePolicy.js`
- Modify: `tests/tranche-policy.test.js`

**Interfaces:**
- Consumes Task 25 metrics.

- [ ] RED degraded yield triggers CONTRACT/HOLD per policy.
- [ ] Implement metrics mapping.
- [ ] Run tranche policy/runner tests.
- [ ] Commit: `feat: adapt tranche sizing from observed yield`.

### Task 27: Partial tranche failure semantics

**Files:**
- Modify: `src/platform-kernel/orchestration/trancheRunner.js`
- Modify: `tests/tranche-runner.test.js`

**Interfaces:**
- Preserves successful sibling results; tranche status PARTIAL when mixed outcomes.

- [ ] RED one failed child + one successful child returns PARTIAL and durable success.
- [ ] Implement exact failure-stage evidence capture.
- [ ] Run tranche + K1 batch regression tests.
- [ ] Commit: `fix: preserve partial tranche results`.

# Checkpoint H — Activation evidence, CANARY and rollback

### Task 28: ActivationEvidenceV1 schema

**Files:**
- Create: `data/schema/activation-evidence-v1.schema.json`
- Create: `tests/activation-evidence-v1.test.js`

**Interfaces:**
- Produces versioned release/tranche/policy/provider/coverage/quality/review/runtime/canary evidence and decision.

- [ ] RED bare string evidence fails.
- [ ] Implement schema with PROMOTE/HOLD/REVISE/QUARANTINE/ROLLBACK.
- [ ] Run targeted + release schema suite.
- [ ] Commit: `feat: add ActivationEvidenceV1 contract`.

### Task 29: Activation evidence evaluator

**Files:**
- Create: `src/platform-kernel/release/activationEvidence.js`
- Create: `tests/activation-evidence.test.js`

**Interfaces:**
- Consumes: `evaluateActivationEvidence(evidence, canaryPolicy) -> decision`.

- [ ] RED blocker => QUARANTINE/ROLLBACK-compatible decision; missing evidence => HOLD.
- [ ] Implement required-evidence and sufficiency evaluation.
- [ ] Run targeted tests.
- [ ] Commit: `feat: evaluate canary activation evidence`.

### Task 30: Release lifecycle integration

**Files:**
- Modify: `src/platform-kernel/release/releases.js`
- Modify: `tests/content-releases.test.js`
- Modify: `tests/content-release-rollback.test.js`

**Interfaces:**
- CANARY→ACTIVE requires ActivationEvidenceV1 PROMOTE.

- [ ] RED existing truthy string activation evidence no longer qualifies for K2 release promotion path.
- [ ] Implement backwards-compatible K1 behavior only for grandfathered/bootstrap artifacts if explicitly identified.
- [ ] Run release/rollback/K1 acceptance tests.
- [ ] Commit: `feat: require governed activation evidence for K2 promotion`.

### Task 31: Insufficient evidence HOLD

**Files:**
- Modify: `src/platform-kernel/release/activationEvidence.js`
- Modify: `tests/activation-evidence.test.js`

**Interfaces:**
- Explicit HOLD when sample/metrics are insufficient.

- [ ] RED insufficient observation volume cannot PROMOTE.
- [ ] Implement HOLD reason/evidence sufficiency code.
- [ ] Run activation/release tests.
- [ ] Commit: `feat: hold canary promotion on insufficient evidence`.

### Task 32: Family/item quarantine helpers

**Files:**
- Create: `src/platform-kernel/release/quarantine.js`
- Create: `tests/content-quarantine.test.js`

**Interfaces:**
- Produces immutable quarantine event records; never mutates historical item/release.

- [ ] RED quarantine mutation of original object is detected.
- [ ] Implement event/selection helper.
- [ ] Run release + immutability tests.
- [ ] Commit: `feat: add immutable quarantine operations`.

# Checkpoint I — Measurement/event governance and improvement contracts

### Task 33: EventDefinitionV1 schema

**Files:**
- Create: `data/schema/event-definition-v1.schema.json`
- Create: `tests/event-definition-v1.test.js`

**Interfaces:**
- Produces stable event name/version, purpose, owner, trigger semantics, properties, privacy class, retention class, producer, compatibility.

- [ ] RED unknown privacy/retention class and missing purpose fail.
- [ ] Implement schema.
- [ ] Run targeted + `npm test`.
- [ ] Commit: `feat: add governed event definition contract`.

### Task 34: Event registry runtime

**Files:**
- Create: `src/platform-kernel/observability/eventRegistry.js`
- Create: `tests/event-registry.test.js`

**Interfaces:**
- Consumes: `registerEventDefinition(def)`, `validateEvent(definitionId,event)`.
- Produces: validated canonical event envelope.

- [ ] RED unknown/unversioned event rejected.
- [ ] Implement schema-backed registry and exact version lookup.
- [ ] Run targeted tests.
- [ ] Commit: `feat: validate governed analytics events`.

### Task 35: Privacy classification enforcement

**Files:**
- Create: `src/platform-kernel/observability/privacyPolicy.js`
- Create: `tests/event-privacy-policy.test.js`

**Interfaces:**
- Consumes event definition + payload.
- Produces ALLOW/REDACT/REJECT decision.

- [ ] RED property absent from allowed schema or marked disallowed-sensitive is rejected/redacted per policy.
- [ ] Implement minimal deterministic privacy gate.
- [ ] Run targeted tests.
- [ ] Commit: `feat: enforce telemetry data minimization`.

### Task 36: Export adapter port

**Files:**
- Create: `src/platform-kernel/observability/ports.js`
- Create: `tests/observability-ports.test.js`

**Interfaces:**
- Produces `AnalyticsSink.publish(event)`, `TelemetrySink.emit(signal)`, `FeatureFlagPort.evaluate(flag,context)`.

- [ ] RED malformed sink/port implementation rejected.
- [ ] Ensure unknown/unvalidated event cannot reach AnalyticsSink.
- [ ] Implement shape assertions only; no vendor dependency.
- [ ] Run targeted + interoperability tests.
- [ ] Commit: `feat: add observability adapter ports`.

### Task 37: Factory metric events

**Files:**
- Create: `src/platform-kernel/observability/factorySignals.js`
- Create: `tests/factory-signals.test.js`

**Interfaces:**
- Maps tranche/factory results to validated aggregate events without leaking private content.

- [ ] RED prompt/source/private reviewer text is not exported.
- [ ] Implement counts/rates/IDs only as allowed by event definitions.
- [ ] Run privacy/event tests.
- [ ] Commit: `feat: emit governed factory signals`.

### Task 38: ImprovementFindingV1 schema

**Files:**
- Create: `data/schema/improvement-finding-v1.schema.json`
- Create: `tests/improvement-finding-v1.test.js`

**Interfaces:**
- Produces observed signal, evidence refs, scope, uncertainty, hypothesis, counter-evidence, investigation/experiment recommendation, status.

- [ ] RED “cause” without hypothesis/evidence classification fails.
- [ ] Implement schema separating observation from hypothesis.
- [ ] Run targeted + `npm test`.
- [ ] Commit: `feat: add improvement finding contract`.

### Task 39: Improvement finding builder

**Files:**
- Create: `src/platform-kernel/observability/improvementFinding.js`
- Create: `tests/improvement-finding.test.js`

**Interfaces:**
- Consumes validated signals; produces finding candidates only.

- [ ] RED correlation input cannot produce `causal=true`.
- [ ] Implement evidence/hypothesis separation.
- [ ] Run targeted tests.
- [ ] Commit: `feat: create evidence-backed improvement findings`.

### Task 40: ExperimentRecordV1 schema

**Files:**
- Create: `data/schema/experiment-record-v1.schema.json`
- Create: `tests/experiment-record-v1.test.js`

**Interfaces:**
- Produces hypothesis, cohorts/assignment adapter refs, primary/guardrail metrics, start/end/status, result/decision.

- [ ] RED experiment without hypothesis/primary metric/guardrails invalid.
- [ ] Implement schema with DRAFT/RUNNING/COMPLETED/STOPPED status.
- [ ] Run targeted tests.
- [ ] Commit: `feat: add experiment evidence contract`.

# Checkpoint J — Persistence, CLI and server parity

### Task 41: File-store support for K2 artifacts

**Files:**
- Modify/Create focused adapters under `scripts/platform-kernel/adapters/`
- Create: `tests/k2-file-store.test.js`

**Interfaces:**
- Persist immutable expansion/tranche/activation/improvement records using existing store conventions.

- [ ] RED duplicate immutable ID with different body rejected.
- [ ] Implement minimal file/JSONL adapters.
- [ ] Run store parity + K2 tests.
- [ ] Commit: `feat: persist K2 governance artifacts`.

### Task 42: SQLite reference support

**Files:**
- Modify: `server/app/factory_store.py`
- Modify: `server/tests/test_factory_store.py`

**Interfaces:**
- Adds tables/records needed for K2 governance artifacts; preserves existing K1 APIs.

- [ ] RED missing K2 table/insert/query behavior.
- [ ] Implement migrations/table creation in current reference adapter style.
- [ ] Run: `python -m pytest server/tests/test_factory_store.py -q`.
- [ ] Run server suite.
- [ ] Commit: `feat: persist K2 governance records in SQLite`.

### Task 43: File/SQLite parity fixture

**Files:**
- Create: `tests/fixtures/k2/store-parity.json`
- Create: `tests/k2-store-parity.test.js`
- Modify: `server/tests/test_factory_store.py` if shared fixture verification is needed.

**Interfaces:**
- Same logical artifact survives both reference adapters.

- [ ] RED parity fixture unsupported.
- [ ] Implement adapter mapping.
- [ ] Run Node + Python parity tests.
- [ ] Commit: `test: prove K2 store parity`.

### Task 44: CLI K2 commands

**Files:**
- Modify: `scripts/platform-kernel/cli.js`
- Create: `tests/k2-factory-cli.test.js`

**Interfaces:**
- Adds read/plan/run/status/resume commands for K2 tranches without vendor coupling.

- [ ] RED new K2 subcommand unavailable.
- [ ] Implement minimal CLI wiring to existing/new orchestration modules.
- [ ] Run CLI + runner tests.
- [ ] Commit: `feat: expose K2 tranche workflow in factory CLI`.

# Checkpoint K — Integration, regression and private/public boundaries

### Task 45: K2 validator integration

**Files:**
- Modify: `scripts/validate.js`
- Create: `tests/k2-validation.test.js`

**Interfaces:**
- Validates new K2 schemas/policies/artifacts when present.

- [ ] RED malformed K2 fixture passes existing validator.
- [ ] Add K2 schema validation.
- [ ] Run `npm run validate` + targeted test.
- [ ] Commit: `feat: validate K2 governance artifacts`.

### Task 46: Public artifact privacy guard

**Files:**
- Modify: `tests/k1-content-factory-acceptance.test.js` or create `tests/k2-private-artifact-guard.test.js`
- Modify release/build verifier only if the test proves a current leak.

**Interfaces:**
- K2 private factory/telemetry/review/calibration artifacts excluded from public Pages output.

- [ ] RED by fixture/probe if any K2 private path is exposed.
- [ ] Add explicit regression guard.
- [ ] Run SW/Pages/public artifact verification.
- [ ] Commit: `test: keep K2 governance artifacts private`.

### Task 47: Current runtime regression gate

**Files:**
- Modify: `tests/k2-coverage-expansion-acceptance.test.js`
- Reuse: `tests/k1-current-runtime-regression.test.js`

**Interfaces:**
- Proves 1,120 current bank, payload digest, 200 profile, bilingual/offline/browser/API compatibility remain unchanged before intentional release promotion.

- [ ] Enable runtime compatibility assertions.
- [ ] Run: `node --test tests/k1-current-runtime-regression.test.js tests/k2-coverage-expansion-acceptance.test.js`.
- [ ] Fix only K2 regressions; do not alter baseline to make tests pass.
- [ ] Run full `npm test`.
- [ ] Commit: `test: lock K2 runtime compatibility`.

### Task 48: Documentation contract and changelog repair

**Files:**
- Modify: `CHANGELOG.md`
- Modify: `README.md` only if K2 implementation changes documented operator behavior.
- Modify: `tests/documentation-contract.test.js`

**Interfaces:**
- Removes stale Programme A “not merged” status and records K2 accurately without claiming unpromoted content is live.

- [ ] RED stale changelog statement detected by documentation test.
- [ ] Update changelog historical/current wording.
- [ ] Run documentation contract tests.
- [ ] Commit: `docs: align changelog with current programme state`.

# Checkpoint L — Final acceptance, review and integration

### Task 49: Enable full K2 acceptance contract

**Files:**
- Modify: `tests/k2-coverage-expansion-acceptance.test.js`

**Interfaces:**
- Final acceptance test imports all K2 modules/contracts and validates core invariants.

- [ ] Remove temporary gates/skips.
- [ ] Run K2 acceptance test and confirm all assertions pass.
- [ ] Run full `npm test`, `npm run validate`, `npm run verify:factory-import`, `npm run verify:sw`.
- [ ] Run Python server tests.
- [ ] Commit: `test: enable final K2 acceptance contract`.

### Task 50: Whole-plan requirement audit

**Files:**
- Create: `docs/superpowers/reviews/2026-09-28-k2-final-review.md`
- Update: `docs/superpowers/reviews/2026-09-28-k2-execution-ledger.md`
- Update: `docs/superpowers/reviews/2026-09-28-k2-checkpoint.md`

**Interfaces:**
- Maps every approved spec section and plan task to code/tests/evidence; lists deferred calibration parameters explicitly.

- [ ] Review branch diff against spec/plan.
- [ ] Verify every contract, failure mode and Review Focus item has a test.
- [ ] Record Critical/Important/Minor findings.
- [ ] Fix Critical/Important only through RED→GREEN TDD before proceeding.
- [ ] Commit review evidence.

### Task 51: Exact-head CI gate

**Files:**
- No product changes unless CI reveals a proven defect.
- Update ledger/checkpoint with exact run IDs and HEAD.

**Interfaces:**
- Requires both existing quality and server/adapter workflows green on exact final HEAD.

- [ ] Push final review/checkpoint HEAD.
- [ ] Wait for exact-head workflows.
- [ ] Verify run HEAD SHA matches branch HEAD.
- [ ] If failure: invoke systematic-debugging; fix through TDD and repeat.
- [ ] Record exact green run IDs and commit only documentation if required.

### Task 52: Finish branch and merge

**Files:**
- Use `superpowers:finishing-a-development-branch`.
- Update tracker/HANDOFF only according to integration state.

**Interfaces:**
- Merge only expected reviewed head into current main.

- [ ] Re-read exact branch/main diff.
- [ ] Verify no unexpected files/secrets/public factory artifacts.
- [ ] Make PR ready only after all gates pass.
- [ ] Merge exact expected head according to finishing skill.
- [ ] Record merge SHA.

### Task 53: Post-merge verification

**Files:**
- Create: `docs/superpowers/reviews/2026-09-28-k2-post-merge-verification.md`
- Update: `docs/superpowers/reviews/2026-09-27-platform-programme-tracker.md`
- Update: `HANDOFF.md`

**Interfaces:**
- Establishes new authoritative `main` and unlocks K3 DESIGN only after verification.

- [ ] Verify main contains exact merge.
- [ ] Verify main CI/server/Pages/live release behavior.
- [ ] Re-run current-bank/import/runtime compatibility checks on main.
- [ ] Record K2 contracts/capabilities and deferred calibration values.
- [ ] Advance tracker/HANDOFF to K3 DESIGN only after all post-merge checks are green.

---

## Checkpoint cadence

After each checkpoint A–L:
- update `docs/superpowers/reviews/2026-09-28-k2-execution-ledger.md`;
- update `docs/superpowers/reviews/2026-09-28-k2-checkpoint.md`;
- record exact branch HEAD and latest verification;
- record all Rulings in `Ruling: <decision> — <why> — <cost if wrong>` form;
- stop and invoke systematic-debugging on unexpected failures;
- keep HANDOFF focused on gate/major-stage changes, not every microstep.

## Execution order

`A baseline → B contracts → C coverage/tranches → D providers → E dedup/bilingual → F review → G tranche execution → H release evidence → I observability/improvement → J persistence/CLI → K integration/privacy/regression → L review/CI/merge/post-merge`

No K3 implementation may begin from this plan.

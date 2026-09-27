# K1 Content Factory & Governance Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a headless, production-grade content lifecycle kernel that governs authoring, versioning, provenance, quality, review, release, rollback, coverage, resumable execution, provider independence and raw learner-evidence foundations without changing current learner-visible behavior.

**Architecture:** Implement K1 as a modular monolith under `src/platform-kernel/` with strict ports/adapters. Canonical contracts live in `data/schema/`; pure lifecycle/quality/release logic stays provider- and persistence-independent; Node file adapters and a SQLite server adapter prove C-ready seams without microservices.

**Tech Stack:** Vanilla ES modules, JSON Schema draft-07/AJV, Node.js `node:test`, Python/FastAPI/sqlite3, filesystem/NDJSON local adapters, GitHub Actions/Pages.

**Spec:** `docs/superpowers/specs/2026-09-27-content-factory-governance-core-design.md`

## Global Constraints

- Product baseline before K1 product code: `main@7f4500e9e19733334ea69b1cba0cf5ef99e1ea72` or the latest documentation-only descendant of it.
- Preserve TrackRegistryV1, TrackManifestV1, TrackPresentationV1, DomainCatalogV2, ExamProfileV2, RenderedQuestionV2, RuntimeBundleV3 and StateV2.
- Preserve current 1,120 question IDs, family IDs, text, options, answers, difficulty and current 200-question exam behavior.
- Do not auto-activate generated content from a single generation step.
- Required ordered minimum pipeline remains Generate → Critique → Validate → Deduplicate → Evidence → Bilingual → Review → Activate → Measure → Recalibrate/Retire; stricter gates may be inserted but required stages may not be removed or reversed.
- Use modular monolith + ports/adapters; do not introduce microservices, Kubernetes, mandatory vector DB, distributed workers, CMS/RBAC/auth or remote queues in K1.
- Raw learner evidence is durable; mastery/readiness/retention/psychometrics remain derived future projections.
- Keep deterministic/manual/no-AI execution available.
- Source/user-authored inputs are immutable; transformations create derived artifacts.
- QTI/CASE/event interoperability remain adapters, not canonical internal schemas.
- Content expansion to 14,000+ is K2, not K1.
- Every implementation task: RED → verify RED → smallest GREEN → verify GREEN → commit → checkpoint.
- Use systematic-debugging for every unexpected failure.
- After each checkpoint update `docs/superpowers/reviews/2026-09-27-k1-checkpoint.md` and `docs/superpowers/reviews/2026-09-27-k1-execution-ledger.md`.

## Review Focus

1. **Interrupted run after a successful stage:** resume must start at the next valid stage without re-running immutable successful outputs — pinned in Tasks 31–34.
2. **Provider returns valid-looking but untrusted output:** provider output must remain a candidate and cannot bypass quality/review lifecycle — pinned in Tasks 23–27 and 43.
3. **Partial batch failure:** successful siblings stay durable while failed items are explicitly failed/retryable; batch must never report full success — pinned in Task 35.
4. **Content release changes while learner is mid-exam:** AssessmentFormSnapshot pins exact item versions/options/scoring and remains unchanged — pinned in Task 53.
5. **Current 1,120 migration:** imported lineage must preserve current payload/IDs but must not falsely claim historical checks were performed — pinned in Tasks 59–61.

---

# File Structure Locked by This Plan

## Canonical schemas
Create under `data/schema/`:

- `question-family-v2.schema.json`
- `item-version-v1.schema.json`
- `quality-report-v1.schema.json`
- `provenance-record-v1.schema.json`
- `factory-run-v1.schema.json`
- `provider-result-v1.schema.json`
- `provider-evaluation-v1.schema.json`
- `coverage-gap-v1.schema.json`
- `content-release-manifest-v1.schema.json`
- `assessment-form-snapshot-v1.schema.json`
- `learner-event-v1.schema.json`

## Pure kernel modules
Create under `src/platform-kernel/`:

- `factory/stateMachine.js`
- `factory/pipeline.js`
- `factory/stages/*.js`
- `policies/sourcePolicy.js`
- `policies/qualityPolicy.js`
- `policies/reviewPolicy.js`
- `providers/ports.js`
- `providers/deterministicGenerator.js`
- `providers/evaluateProvider.js`
- `provenance/records.js`
- `orchestration/localRunner.js`
- `orchestration/batchRunner.js`
- `coverage/matrix.js`
- `coverage/gaps.js`
- `release/releases.js`
- `release/assessmentSnapshot.js`
- `release/migrationDelta.js`
- `evidence/learnerEvent.js`
- `interoperability/ports.js`

## Node/local adapters
Create under `scripts/platform-kernel/`:

- `adapters/fileContentStore.js`
- `adapters/jsonlAuditStore.js`
- `adapters/fileJobStore.js`
- `cli.js`
- `import_current_bank.js`
- `verify_current_import.js`

## Server/SQLite adapter
Modify/create:

- `db/schema.sql`
- `server/app/factory_store.py`
- `server/tests/test_factory_store.py`

## Canonical internal artifacts
Create under `data/factory/` only after contracts are green:

- `policies/default-source-policy.json`
- `policies/default-quality-policy.json`
- `policies/default-review-policy.json`
- `migrations/sdaia-current-bank-v1.json`
- `releases/sdaia-bootstrap-v1.manifest.json`
- `releases/sdaia-bootstrap-v1.items.ndjson`

These factory artifacts remain repository-internal during K1 and must not be added to the public Pages artifact.

---

# Checkpoint A0 — Baseline and RED Architecture Boundary

### Task 1: Freeze K1 baseline

**Files:**
- Create: `docs/superpowers/reviews/2026-09-27-k1-baseline.md`

**Interfaces:**
- Consumes current main/B3 verification.
- Produces immutable K1 starting facts.

- [ ] Record current main SHA and latest successful Pages/server runs.
- [ ] Record current 1,120 bank digest/counts and 200-question allocation.
- [ ] Record active contract versions and current public artifact boundary.
- [ ] Record that `data/factory/` does not exist yet.
- [ ] Commit `docs: freeze K1 baseline`.

### Task 2: Create K1 execution ledger/checkpoint skeleton

**Files:**
- Create: `docs/superpowers/reviews/2026-09-27-k1-execution-ledger.md`
- Create: `docs/superpowers/reviews/2026-09-27-k1-checkpoint.md`

**Interfaces:**
- Produces durable recovery entrypoint.

- [ ] Record execution mode/isolation ruling.
- [ ] Record authority precedence.
- [ ] Record exact next task and merge status.
- [ ] Add checkpoint fields: HEAD, completed tasks, tests, rulings, failures, next task, files, resume safety.
- [ ] Commit `docs: start K1 execution ledger`.

### Task 3: Add K1 acceptance contract — RED

**Files:**
- Create: `tests/k1-content-factory-acceptance.test.js`

**Interfaces:**
- Produces branch-level architecture boundary.

- [ ] Assert required K1 schema/module paths exist.
- [ ] Assert invalid `GENERATED → ACTIVE` transition is impossible.
- [ ] Assert current bank migration/release artifacts eventually exist.
- [ ] Assert public workflows never copy `data/factory/`.
- [ ] Run Node tests and verify RED for missing K1 artifacts only.
- [ ] Commit `test: capture K1 factory boundary`.

### Task 4: Pin current public/runtime regression boundary

**Files:**
- Create: `tests/k1-current-runtime-regression.test.js`

**Interfaces:**
- Consumes existing bank/profile fixtures.
- Produces explicit K1 no-drift contract.

- [ ] Assert bank count = 1,120.
- [ ] Assert legacy payload SHA remains current fixture value.
- [ ] Assert full exam count = 200 and allocation = 36/35/33/29/28/25/14.
- [ ] Assert RuntimeBundleV3 + StateV2 unchanged.
- [ ] Verify GREEN before any K1 implementation.
- [ ] Commit `test: pin pre-K1 learner behavior`.

### Task 5: Add private-factory artifact leakage guard — RED

**Files:**
- Modify: `tests/release-contract.test.js`

**Interfaces:**
- Produces release exclusion contract for `data/factory/`.

- [ ] Add assertion that CI/Pages artifact assembly excludes `data/factory/`.
- [ ] Run targeted release test; verify expected RED only if current generic copy would leak it, otherwise record already-GREEN evidence and why.
- [ ] If RED, minimally adjust only artifact copy boundary.
- [ ] Re-run release test GREEN.
- [ ] Commit `test: keep factory governance artifacts private`.

---

# Checkpoint A1 — Core Contracts

### Task 6: QuestionFamilyV2 schema

**Files:**
- Create: `data/schema/question-family-v2.schema.json`
- Create: `tests/question-family-v2.test.js`

**Interfaces:**
- Produces `QuestionFamilyV2`.

- [ ] RED valid canonical family cannot validate because schema is absent.
- [ ] Assert required stable identity/pedagogy/evidence/policy fields.
- [ ] Assert arbitrary fields and presentation-label domain identity fail.
- [ ] Implement strict schema.
- [ ] Run targeted tests GREEN.
- [ ] Commit `feat: add QuestionFamilyV2 contract`.

### Task 7: ItemVersionV1 schema

**Files:**
- Create: `data/schema/item-version-v1.schema.json`
- Create: `tests/item-version-v1.test.js`

**Interfaces:**
- Produces immutable item version record linked to family.

- [ ] RED requires item_version_id/family_id/version/content/provenance/release state.
- [ ] Assert released version cannot omit content hash.
- [ ] Assert predecessor/supersession references are optional but typed.
- [ ] Implement schema.
- [ ] Verify GREEN.
- [ ] Commit `feat: add ItemVersionV1 contract`.

### Task 8: QualityReportV1 schema

**Files:**
- Create: `data/schema/quality-report-v1.schema.json`
- Create: `tests/quality-report-v1.test.js`

**Interfaces:**
- Produces multidimensional gate report.

- [ ] RED requires all critical dimensions from spec.
- [ ] Assert result enum = PASS/FAIL/ABSTAIN/REVIEW_REQUIRED.
- [ ] Assert one aggregate score cannot substitute missing dimensions.
- [ ] Implement schema.
- [ ] Verify GREEN.
- [ ] Commit `feat: add QualityReportV1 contract`.

### Task 9: ProvenanceRecordV1 schema

**Files:**
- Create: `data/schema/provenance-record-v1.schema.json`
- Create: `tests/provenance-record-v1.test.js`

**Interfaces:**
- Produces structured stage/provider/audit lineage.

- [ ] RED requires record_type/run_id/target/stage/timestamp/input/output hashes/policy references.
- [ ] Assert provider metadata can be null for deterministic/human paths.
- [ ] Assert arbitrary free-form replacement for required fields fails.
- [ ] Implement schema.
- [ ] Verify GREEN.
- [ ] Commit `feat: add provenance record contract`.

### Task 10: FactoryRunV1 schema

**Files:**
- Create: `data/schema/factory-run-v1.schema.json`
- Create: `tests/factory-run-v1.test.js`

**Interfaces:**
- Produces resumable run metadata.

- [ ] RED requires run_id/target/stage/status/attempt/input_hash/output_ref/timestamps/retry metadata.
- [ ] Assert status enum distinguishes partial/failed/completed/cancelled.
- [ ] Implement schema.
- [ ] Verify GREEN.
- [ ] Commit `feat: add FactoryRunV1 contract`.

### Task 11: ProviderResultV1 schema

**Files:**
- Create: `data/schema/provider-result-v1.schema.json`
- Create: `tests/provider-result-v1.test.js`

**Interfaces:**
- Produces untrusted provider result envelope.

- [ ] RED requires provider/model/policy/run/latency/output/provenance fields.
- [ ] Assert `trusted`/automatic activation field is forbidden.
- [ ] Implement schema.
- [ ] Verify GREEN.
- [ ] Commit `feat: add provider result contract`.

### Task 12: ProviderEvaluationV1 schema

**Files:**
- Create: `data/schema/provider-evaluation-v1.schema.json`
- Create: `tests/provider-evaluation-v1.test.js`

**Interfaces:**
- Produces frozen-set evaluation result.

- [ ] RED requires correctness/source fidelity/AR/EN/distractors/format/latency/cost dimensions.
- [ ] Assert promotion decision includes policy version.
- [ ] Implement schema.
- [ ] Verify GREEN.
- [ ] Commit `feat: add provider evaluation contract`.

### Task 13: CoverageGapV1 schema

**Files:**
- Create: `data/schema/coverage-gap-v1.schema.json`
- Create: `tests/coverage-gap-v1.test.js`

**Interfaces:**
- Produces structured gap request instead of raw count request.

- [ ] RED requires track/domain/objective/concept/cognitive/difficulty/language/status dimensions.
- [ ] Assert `requested_count` alone is insufficient.
- [ ] Implement schema.
- [ ] Verify GREEN.
- [ ] Commit `feat: add CoverageGapV1 contract`.

### Task 14: ContentReleaseManifestV1 schema

**Files:**
- Create: `data/schema/content-release-manifest-v1.schema.json`
- Create: `tests/content-release-manifest-v1.test.js`

**Interfaces:**
- Produces immutable content release binding.

- [ ] RED requires release_id/track_id/status/item_version_ids/policy versions/profile version/timestamps.
- [ ] Assert ACTIVE release cannot omit content hash.
- [ ] Implement schema.
- [ ] Verify GREEN.
- [ ] Commit `feat: add content release manifest contract`.

### Task 15: AssessmentFormSnapshotV1 schema

**Files:**
- Create: `data/schema/assessment-form-snapshot-v1.schema.json`
- Create: `tests/assessment-form-snapshot-v1.test.js`

**Interfaces:**
- Produces frozen delivery form.

- [ ] RED requires form_id/release/profile/scoring/item order/option order/locale/start time.
- [ ] Assert duplicate item_version_ids fail.
- [ ] Implement schema.
- [ ] Verify GREEN.
- [ ] Commit `feat: add assessment form snapshot contract`.

### Task 16: LearnerEventV1 schema

**Files:**
- Create: `data/schema/learner-event-v1.schema.json`
- Create: `tests/learner-event-v1.test.js`

**Interfaces:**
- Produces append-oriented raw evidence event.

- [ ] RED requires learner/track/release/form/family/item/objective/domain/mode/locale/timing/response fields.
- [ ] Assert mastery/readiness/calibrated difficulty are forbidden as raw truth fields.
- [ ] Implement schema.
- [ ] Verify GREEN.
- [ ] Commit `feat: add LearnerEventV1 contract`.

---

# Checkpoint B — Lifecycle and Policy Enforcement

### Task 17: Factory lifecycle constants

**Files:**
- Create: `src/platform-kernel/factory/stateMachine.js`
- Create: `tests/factory-state-machine.test.js`

**Interfaces:**
- Produces `FACTORY_STATES`, `FACTORY_EVENTS`.

- [ ] RED expected state/event constants are absent.
- [ ] Define DRAFT/GENERATED/CRITIQUED/VALIDATED/DEDUPED/EVIDENCE_CHECKED/DISTRACTOR_CHECKED/BILINGUAL_CHECKED/ACCESSIBILITY_CHECKED/REVIEW_PENDING/APPROVED/CANARY/ACTIVE/DEPRECATED/RETIRED/QUARANTINED.
- [ ] Verify constants test GREEN.
- [ ] Commit `feat: define factory lifecycle states`.

### Task 18: Valid lifecycle transitions

**Files:**
- Modify: `src/platform-kernel/factory/stateMachine.js`
- Test: `tests/factory-state-machine.test.js`

**Interfaces:**
- Produces `transitionFactoryState(currentState,event) -> nextState`.

- [ ] RED valid canonical ordered transition fails.
- [ ] Implement explicit transition table.
- [ ] Verify required amendment ordering is preserved.
- [ ] Run targeted tests GREEN.
- [ ] Commit `feat: enforce factory lifecycle transitions`.

### Task 19: Invalid lifecycle transitions

**Files:**
- Modify/Test same as Task 18.

**Interfaces:**
- Produces `canTransitionFactoryState(current,event) -> boolean`.

- [ ] RED `GENERATED → ACTIVE` must throw/reject.
- [ ] RED RETIRED cannot reactivate without explicit revision path.
- [ ] RED QUARANTINED requires review path.
- [ ] Implement bounded invalid-transition error.
- [ ] Verify GREEN.
- [ ] Commit `test: prevent lifecycle shortcuts`.

### Task 20: SourcePolicy

**Files:**
- Create: `src/platform-kernel/policies/sourcePolicy.js`
- Create: `tests/source-policy.test.js`
- Create: `data/factory/policies/default-source-policy.json`

**Interfaces:**
- Produces `SOURCE_POLICIES`, `evaluateSourceUse(policy,input) -> decision`.

- [ ] RED STRICT rejects unsupported external facts.
- [ ] RED GROUNDED requires evidence ref for added claims.
- [ ] RED EXPANSIVE marks model-added content as derived/provenanced.
- [ ] Implement pure evaluator.
- [ ] Verify GREEN.
- [ ] Commit `feat: enforce source policies`.

### Task 21: QualityPolicy

**Files:**
- Create: `src/platform-kernel/policies/qualityPolicy.js`
- Create: `tests/quality-policy.test.js`
- Create: `data/factory/policies/default-quality-policy.json`

**Interfaces:**
- Produces `evaluateQualityPolicy(report,policy) -> {eligible,reasons}`.

- [ ] RED missing correctness/evidence/bilingual/accessibility result rejects activation.
- [ ] RED ABSTAIN on critical dimension requires review.
- [ ] RED aggregate score alone cannot pass.
- [ ] Implement evaluator.
- [ ] Verify GREEN.
- [ ] Commit `feat: enforce quality policy`.

### Task 22: ReviewPolicy

**Files:**
- Create: `src/platform-kernel/policies/reviewPolicy.js`
- Create: `tests/review-policy.test.js`
- Create: `data/factory/policies/default-review-policy.json`

**Interfaces:**
- Produces `evaluateReviewRequirement(context,policy)`.

- [ ] RED high-risk/new-provider requires human review.
- [ ] RED quarantined item requires human review.
- [ ] RED established low-risk deterministic candidate may use sampled review.
- [ ] Implement evaluator.
- [ ] Verify GREEN.
- [ ] Commit `feat: add risk-based review policy`.

### Task 23: Immutable content hash helper

**Files:**
- Create: `src/platform-kernel/release/releases.js`
- Create: `tests/content-immutability.test.js`

**Interfaces:**
- Produces `contentHash(value) -> sha256`, `assertImmutableVersion(old,new)`.

- [ ] RED mutation of released content with same item_version_id fails.
- [ ] Implement deterministic canonical JSON hashing.
- [ ] Verify equal semantic content yields stable hash.
- [ ] Verify mutation requires new version ID.
- [ ] Commit `feat: enforce immutable item versions`.

---

# Checkpoint C — Provenance and Provider Independence

### Task 24: Provenance record factory

**Files:**
- Create: `src/platform-kernel/provenance/records.js`
- Create: `tests/provenance-records.test.js`

**Interfaces:**
- Produces `createProvenanceRecord(input)`.

- [ ] RED deterministic provider path still records stage/policy/input/output hashes.
- [ ] RED provider path records provider/model/version/latency.
- [ ] Implement normalized record creation.
- [ ] Verify schema validation GREEN.
- [ ] Commit `feat: create structured provenance records`.

### Task 25: Provider port assertions

**Files:**
- Create: `src/platform-kernel/providers/ports.js`
- Create: `tests/provider-ports.test.js`

**Interfaces:**
- Produces `assertGeneratorProvider`, `assertCriticProvider`, `assertEvidenceProvider`, `assertEmbeddingProvider`, `assertTranslationProvider`.

- [ ] RED missing required provider method fails clearly.
- [ ] Implement shape assertions only; no vendor dependencies.
- [ ] Verify deterministic plain-object provider passes.
- [ ] Commit `feat: define provider ports`.

### Task 26: Deterministic generator provider

**Files:**
- Create: `src/platform-kernel/providers/deterministicGenerator.js`
- Create: `tests/deterministic-generator.test.js`

**Interfaces:**
- Produces `createDeterministicGenerator({generate})`.

- [ ] RED same input must produce byte-equivalent provider result.
- [ ] Implement provider wrapper with provider=`deterministic`.
- [ ] Verify no network/model dependency.
- [ ] Verify result remains candidate/untrusted.
- [ ] Commit `feat: add deterministic generator provider`.

### Task 27: Provider output cannot activate content

**Files:**
- Modify: provider/state tests.

**Interfaces:**
- Cross-checks provider result with lifecycle.

- [ ] RED provider result containing activation-like metadata cannot move state.
- [ ] Ensure lifecycle transition requires policy/review path separately.
- [ ] Verify GREEN.
- [ ] Commit `test: keep provider output untrusted`.

### Task 28: Provider evaluation harness

**Files:**
- Create: `src/platform-kernel/providers/evaluateProvider.js`
- Create: `tests/provider-evaluation.test.js`
- Create: `tests/fixtures/factory/provider-gold-set.json`

**Interfaces:**
- Produces `evaluateProvider(provider,goldSet,policy) -> ProviderEvaluationV1`.

- [ ] RED evaluation computes every required dimension or explicit ABSTAIN.
- [ ] Implement deterministic fixture evaluator.
- [ ] Verify provider cannot be promoted when mandatory dimension fails.
- [ ] Commit `feat: add provider evaluation gate`.

### Task 29: No-AI execution path

**Files:**
- Modify: `tests/provider-evaluation.test.js`, deterministic provider tests.

**Interfaces:**
- Proves AI providers are optional.

- [ ] Run candidate creation/validation with deterministic provider only.
- [ ] Assert no API key/environment/provider package required.
- [ ] Assert provenance identifies deterministic path.
- [ ] Commit `test: preserve no-AI factory path`.

---

# Checkpoint D — Persistence and Resumable Orchestration

### Task 30: Persistence port contracts

**Files:**
- Create: `src/platform-kernel/orchestration/ports.js`
- Create: `tests/factory-store-ports.test.js`

**Interfaces:**
- Produces assertions for `ContentStorePort`, `JobStorePort`, `EventStorePort`, `ReviewPort`.

- [ ] RED incomplete store object fails.
- [ ] Define minimal methods and return semantics.
- [ ] Verify in-memory test double passes.
- [ ] Commit `feat: define factory persistence ports`.

### Task 31: FileContentStore

**Files:**
- Create: `scripts/platform-kernel/adapters/fileContentStore.js`
- Create: `tests/file-content-store.test.js`

**Interfaces:**
- Produces `createFileContentStore(root)` with get/put/list immutable artifacts.

- [ ] RED put/get round trip.
- [ ] RED overwrite of immutable version fails.
- [ ] Implement atomic temp-write + rename.
- [ ] Verify traversal outside root rejected.
- [ ] Commit `feat: add local file content store`.

### Task 32: JSONL audit/event store

**Files:**
- Create: `scripts/platform-kernel/adapters/jsonlAuditStore.js`
- Create: `tests/jsonl-audit-store.test.js`

**Interfaces:**
- Produces append/read by run/target.

- [ ] RED append preserves ordering.
- [ ] RED existing records cannot be edited through API.
- [ ] Implement append-only JSONL store.
- [ ] Verify malformed line detection is bounded.
- [ ] Commit `feat: add append-only audit store`.

### Task 33: FileJobStore

**Files:**
- Create: `scripts/platform-kernel/adapters/fileJobStore.js`
- Create: `tests/file-job-store.test.js`

**Interfaces:**
- Produces get/create/updateStatus/recordStageOutput.

- [ ] RED run creation and status transitions persist.
- [ ] RED attempt increments on retry.
- [ ] Implement atomic job document updates.
- [ ] Verify completed stage output hash is retained.
- [ ] Commit `feat: add local job store`.

### Task 34: LocalRunner basic execution

**Files:**
- Create: `src/platform-kernel/orchestration/localRunner.js`
- Create: `tests/local-runner.test.js`

**Interfaces:**
- Produces `createLocalRunner({pipeline,jobStore,auditStore})`; methods `runCandidate`, `resumeRun`, `retryStage`, `cancelRun`.

- [ ] RED one-stage run persists run + audit.
- [ ] Implement sequential stage dispatch.
- [ ] Verify successful stage output hash stored.
- [ ] Commit `feat: add local factory runner`.

### Task 35: Resume after interruption

**Files:**
- Modify: LocalRunner tests/implementation.

**Interfaces:**
- Uses stored completed stage hashes.

- [ ] RED simulate interruption after EVIDENCE stage.
- [ ] Resume and assert earlier completed stages are not called again.
- [ ] Implement next-stage resolution.
- [ ] Verify immutable successful outputs reused.
- [ ] Commit `feat: resume factory runs by stage`.

### Task 36: Retry failed stage

**Files:**
- Modify LocalRunner tests/implementation.

- [ ] RED retry increments attempt and runs only failed stage.
- [ ] RED non-retryable error rejects retry.
- [ ] Implement retry eligibility.
- [ ] Verify audit records both attempts.
- [ ] Commit `feat: retry bounded factory stages`.

### Task 37: Batch runner with partial failure

**Files:**
- Create: `src/platform-kernel/orchestration/batchRunner.js`
- Create: `tests/batch-runner.test.js`

**Interfaces:**
- Produces `runBatch(requests,runner) -> {status,completed,failed}`.

- [ ] RED one failed item + two successes returns PARTIAL.
- [ ] Assert successful sibling outputs remain durable.
- [ ] Assert failed item includes retry metadata.
- [ ] Implement bounded sequential baseline.
- [ ] Commit `feat: preserve partial factory batch results`.

### Task 38: SQLite factory store schema

**Files:**
- Modify: `db/schema.sql`
- Create: `server/app/factory_store.py`
- Create: `server/tests/test_factory_store.py`

**Interfaces:**
- Produces SQLite run/audit persistence with same logical semantics as JobStore/EventStore ports.

- [ ] RED DB initialization lacks factory tables.
- [ ] Add `factory_runs`, `factory_stage_outputs`, `factory_audit` tables with uniqueness/foreign-key checks.
- [ ] Implement create/get/update/append helpers.
- [ ] Verify existing DB smoke remains green.
- [ ] Commit `feat: add SQLite factory persistence adapter`.

### Task 39: File/SQLite semantic parity

**Files:**
- Create: `tests/factory-store-parity.test.js` or Python parity fixture + Node fixture as appropriate.

- [ ] Define shared fixture for run/status/attempt/audit sequence.
- [ ] Assert file adapter and SQLite adapter produce equivalent logical record.
- [ ] Fix only semantic mismatches.
- [ ] Commit `test: align factory persistence adapters`.

### Task 40: CLI status/run/resume shell

**Files:**
- Create: `scripts/platform-kernel/cli.js`
- Create: `tests/factory-cli.test.js`
- Modify: `package.json`

**Interfaces:**
- Commands: `status`, `run`, `resume`, `retry`; no AI vendor coupling.

- [ ] RED `status` on fixture run prints deterministic JSON summary.
- [ ] Implement argument parser using built-in Node only.
- [ ] Add `factory` npm script.
- [ ] Verify invalid command exits nonzero without mutation.
- [ ] Commit `feat: add local factory CLI`.

---

# Checkpoint E — Governed Quality Pipeline

### Task 41: Pipeline stage interface

**Files:**
- Create: `src/platform-kernel/factory/pipeline.js`
- Create: `tests/factory-pipeline.test.js`

**Interfaces:**
- Produces `createPipeline(stages)`, stage signature `run(context) -> result`.

- [ ] RED canonical stage order must match spec.
- [ ] Implement immutable stage registry.
- [ ] Reject duplicate/missing required stage names.
- [ ] Commit `feat: define governed factory pipeline`.

### Task 42: Generate stage

**Files:**
- Create: `src/platform-kernel/factory/stages/generate.js`
- Test: pipeline tests.

- [ ] RED Generate requires valid source policy + GeneratorProvider.
- [ ] Implement provider invocation + provenance.
- [ ] Assert output state = GENERATED only.
- [ ] Commit `feat: add generate stage`.

### Task 43: Critique stage

**Files:**
- Create: `src/platform-kernel/factory/stages/critique.js`
- Create/modify tests.

- [ ] RED Critique cannot run before GENERATED.
- [ ] Implement critic port call or deterministic critic.
- [ ] Record structured critique provenance.
- [ ] Commit `feat: add critique stage`.

### Task 44: Deterministic validation stage

**Files:**
- Create: `src/platform-kernel/factory/stages/validate.js`
- Create: `tests/factory-validate-stage.test.js`

- [ ] RED schema/identity/answer-shape error yields FAIL without next transition.
- [ ] Implement deterministic validation only.
- [ ] Verify success moves to VALIDATED.
- [ ] Commit `feat: add deterministic factory validation`.

### Task 45: Deduplication stage

**Files:**
- Create: `src/platform-kernel/factory/stages/deduplicate.js`
- Create: `tests/factory-dedup-stage.test.js`

**Interfaces:**
- Exact/fingerprint baseline + optional EmbeddingProvider port; no vector DB dependency.

- [ ] RED exact duplicate fails.
- [ ] RED near-duplicate provider ABSTAIN produces REVIEW_REQUIRED, not guessed pass.
- [ ] Implement normalized fingerprint baseline.
- [ ] Verify embedding path remains injectable.
- [ ] Commit `feat: add deduplication quality gate`.

### Task 46: Evidence/correctness stage

**Files:**
- Create: `src/platform-kernel/factory/stages/evidence.js`
- Create: `tests/factory-evidence-stage.test.js`

- [ ] RED STRICT candidate with unsupported claim fails.
- [ ] RED GROUNDED candidate lacking evidence cannot pass.
- [ ] Implement evidence provider/deterministic source verification boundary.
- [ ] Verify ABSTAIN → review required.
- [ ] Commit `feat: add evidence correctness gate`.

### Task 47: Distractor quality stage

**Files:**
- Create: `src/platform-kernel/factory/stages/distractor.js`
- Create: `tests/factory-distractor-stage.test.js`

- [ ] RED duplicate/obviously invalid distractor fails.
- [ ] Assert reasoning metadata exists for wrong options where policy requires.
- [ ] Implement deterministic baseline checks.
- [ ] Commit `feat: add distractor quality gate`.

### Task 48: Bilingual equivalence stage

**Files:**
- Create: `src/platform-kernel/factory/stages/bilingual.js`
- Create: `tests/factory-bilingual-stage.test.js`

- [ ] RED missing Arabic/English pair fails for bilingual track policy.
- [ ] RED provider uncertainty produces REVIEW_REQUIRED.
- [ ] Implement structural equivalence baseline + injectable TranslationProvider.
- [ ] Commit `feat: add bilingual equivalence gate`.

### Task 49: Accessibility/fairness stage

**Files:**
- Create: `src/platform-kernel/factory/stages/accessibility.js`
- Create: `tests/factory-accessibility-stage.test.js`

- [ ] RED required alt/media/accessibility metadata missing when applicable.
- [ ] RED automated uncertainty yields ABSTAIN/REVIEW_REQUIRED.
- [ ] Implement baseline structural checker.
- [ ] Commit `feat: add accessibility and fairness gate`.

### Task 50: Review stage

**Files:**
- Create: `src/platform-kernel/factory/stages/review.js`
- Create: `tests/factory-review-stage.test.js`

- [ ] RED high-risk candidate without human review cannot become APPROVED.
- [ ] Implement ReviewPort decision ingestion.
- [ ] Assert policy-driven sampled deterministic path works when permitted.
- [ ] Commit `feat: add governed review stage`.

### Task 51: Activation gate

**Files:**
- Create: `src/platform-kernel/factory/stages/activate.js`
- Create: `tests/factory-activation.test.js`

- [ ] RED failed quality dimension blocks CANARY/ACTIVE.
- [ ] RED APPROVED may move to CANARY only through release policy.
- [ ] Implement activation eligibility evaluation.
- [ ] Verify provider output alone cannot activate.
- [ ] Commit `feat: gate content activation`.

---

# Checkpoint F — Coverage Engine

### Task 52: Coverage matrix normalization

**Files:**
- Create: `src/platform-kernel/coverage/matrix.js`
- Create: `tests/coverage-matrix.test.js`

**Interfaces:**
- Produces `normalizeCoverageRecord(record)` and dimension keys from spec.

- [ ] RED missing identity dimensions rejected.
- [ ] Implement stable normalized multidimensional key.
- [ ] Verify raw question count is just one metric, not coverage status.
- [ ] Commit `feat: normalize coverage matrix`.

### Task 53: Coverage gap detection

**Files:**
- Create: `src/platform-kernel/coverage/gaps.js`
- Create: `tests/coverage-gaps.test.js`

**Interfaces:**
- Produces `findCoverageGaps(targets,inventory) -> CoverageGapV1[]`.

- [ ] RED fixture with missing hard Arabic scenario returns structured gap.
- [ ] Implement deterministic target-minus-inventory logic.
- [ ] Verify gap retains objective/concept/misconception dimensions.
- [ ] Commit `feat: detect structured coverage gaps`.

### Task 54: No raw-count expansion policy

**Files:**
- Modify coverage tests/policy.

- [ ] RED request `{requested_count:14000}` without dimensions is invalid.
- [ ] Assert structured gap request can include desired count as secondary capacity.
- [ ] Commit `test: reject count-only content expansion`.

### Task 55: Coverage-to-factory request adapter

**Files:**
- Create: `src/platform-kernel/coverage/toFactoryRequest.js`
- Create: `tests/coverage-to-factory.test.js`

**Interfaces:**
- Produces `coverageGapToFactoryRequest(gap,policies)`.

- [ ] RED output must carry source/quality/review policies.
- [ ] Implement pure adapter.
- [ ] Verify no provider/model is hard-coded.
- [ ] Commit `feat: turn coverage gaps into governed requests`.

---

# Checkpoint G — Releases, Canary, Rollback, Frozen Assessments

### Task 56: Content release constructor

**Files:**
- Modify: `src/platform-kernel/release/releases.js`
- Create: `tests/content-releases.test.js`

**Interfaces:**
- Produces `createContentRelease(input)`.

- [ ] RED manifest hash changes if item version list changes.
- [ ] Implement immutable sorted item list/hash.
- [ ] Verify policy/profile versions included.
- [ ] Commit `feat: create immutable content releases`.

### Task 57: Canary → Active transition

**Files:**
- Modify release/state modules/tests.

- [ ] RED DRAFT/APPROVED release cannot jump directly to ACTIVE.
- [ ] Require CANARY state + activation policy evidence.
- [ ] Verify transition/audit records.
- [ ] Commit `feat: require canary before active release`.

### Task 58: Release rollback

**Files:**
- Modify: `src/platform-kernel/release/releases.js`
- Create: `tests/content-release-rollback.test.js`

**Interfaces:**
- Produces `rollbackRelease(current,previous,reason)`.

- [ ] RED rollback does not mutate either manifest.
- [ ] Assert newer audit/evidence remains.
- [ ] Assert rollback event records reason/actor/time.
- [ ] Commit `feat: support immutable release rollback`.

### Task 59: AssessmentFormSnapshot constructor

**Files:**
- Create: `src/platform-kernel/release/assessmentSnapshot.js`
- Create: `tests/assessment-snapshot.test.js`

**Interfaces:**
- Produces `createAssessmentFormSnapshot(input)`.

- [ ] RED release/profile/item/option orders are copied/frozen.
- [ ] Implement immutable snapshot.
- [ ] Verify later bank mutation does not change snapshot.
- [ ] Commit `feat: freeze assessment forms`.

### Task 60: Mid-exam release-change regression

**Files:**
- Modify: assessment snapshot tests.

- [ ] Start snapshot from release A.
- [ ] Create release B with changed bank after snapshot.
- [ ] Assert form still references only release-A item versions/options/scoring.
- [ ] Commit `test: isolate running exams from content releases`.

### Task 61: Content migration/catch-up delta contract

**Files:**
- Create: `src/platform-kernel/release/migrationDelta.js`
- Create: `tests/content-migration-delta.test.js`

**Interfaces:**
- Produces `diffContentReleases(from,to)`.

- [ ] RED added items/objectives are identified as unseen/catch-up candidates.
- [ ] Assert removed items are not marked learned.
- [ ] Implement deterministic delta.
- [ ] Commit `feat: model safe content release migration`.

---

# Checkpoint H — Raw Learner Evidence and Interoperability Seams

### Task 62: LearnerEventV1 runtime validator

**Files:**
- Create: `src/platform-kernel/evidence/learnerEvent.js`
- Create: `tests/learner-event-runtime.test.js`

**Interfaces:**
- Produces `createLearnerEvent(input)`, `validateLearnerEvent(event)`.

- [ ] RED invalid timestamps/IDs/mode fail.
- [ ] Implement pure normalizer/validator.
- [ ] Verify no derived mastery/readiness fields accepted.
- [ ] Commit `feat: create raw learner events`.

### Task 63: Append-only learner event storage boundary

**Files:**
- Modify: EventStore port + JSONL/SQLite adapters/tests.

- [ ] RED event append succeeds and update/delete is absent.
- [ ] Verify learner events can be read by time/track/item without rewriting records.
- [ ] Commit `feat: persist append-only learner evidence`.

### Task 64: QTI/CASE/event adapter ports

**Files:**
- Create: `src/platform-kernel/interoperability/ports.js`
- Create: `tests/interoperability-ports.test.js`

**Interfaces:**
- Produces assertions for AssessmentExchangePort, CompetencyExchangePort, LearningEventExchangePort.

- [ ] RED incomplete adapter fails shape assertion.
- [ ] Assert internal canonical records remain plain internal JSON, not QTI/CASE payloads.
- [ ] Implement seam only; no XML/standard library.
- [ ] Commit `feat: define interoperability adapter seams`.

### Task 65: Interoperability round-trip fixtures

**Files:**
- Create: `tests/fixtures/factory/interoperability-boundary.json`
- Modify tests.

- [ ] Define minimal canonical family/objective fixture.
- [ ] Assert mock QTI/CASE adapter round-trip preserves internal IDs through mapping boundary.
- [ ] Commit `test: protect interoperability boundaries`.

---

# Checkpoint I — Migrate Current 1,120 Into Governed Lineage

### Task 66: Current-bank importer — RED

**Files:**
- Create: `scripts/platform-kernel/import_current_bank.js`
- Create: `tests/current-bank-import.test.js`

**Interfaces:**
- Produces deterministic QuestionFamilyV2 + ItemVersionV1 records from current RenderedQuestionV2 bank.

- [ ] RED importer output count must equal 1,120 item versions and current family count.
- [ ] Assert current IDs/text/options/answers/difficulty/domain IDs preserved.
- [ ] Implement pure import mapping before persistence.
- [ ] Commit `feat: import current bank into governed lineage`.

### Task 67: Grandfathered provenance policy

**Files:**
- Modify importer/tests.

- [ ] RED imported historical items must not claim critique/evidence/bilingual gates were historically run.
- [ ] Add provenance status `migrated-grandfathered` with migration source/hash.
- [ ] Assert future edits require new ItemVersion and normal gates.
- [ ] Commit `feat: record honest migrated provenance`.

### Task 68: Write deterministic migration artifacts

**Files:**
- Create generated:
  - `data/factory/migrations/sdaia-current-bank-v1.json`
  - `data/factory/releases/sdaia-bootstrap-v1.items.ndjson`
- Test: importer tests.

- [ ] Write artifacts deterministically sorted.
- [ ] Run generation twice and assert byte-identical output.
- [ ] Assert IDs/family IDs unique.
- [ ] Commit `data: persist K1 current-bank lineage`.

### Task 69: Bootstrap content release manifest

**Files:**
- Create: `data/factory/releases/sdaia-bootstrap-v1.manifest.json`
- Test: release/import tests.

- [ ] Bind all imported item_version_ids to one migrated release.
- [ ] Mark release origin explicitly as migration baseline, not fresh factory certification.
- [ ] Validate manifest hash.
- [ ] Commit `data: add bootstrap governed content release`.

### Task 70: Verify current bank import compatibility

**Files:**
- Create: `scripts/platform-kernel/verify_current_import.js`
- Modify: `package.json`
- Test: current-bank import tests.

- [ ] Reconstruct visible item payload from NDJSON and compare existing legacy payload SHA.
- [ ] Assert 1,120 IDs/family IDs match runtime bank exactly.
- [ ] Assert 200-question exam allocation unchanged.
- [ ] Add `npm run verify:factory-import`.
- [ ] Commit `test: verify governed current-bank migration`.

### Task 71: Ensure factory artifacts remain private

**Files:**
- Modify release tests/workflows only if needed.

- [ ] Build Pages artifact.
- [ ] Assert `_site/data/factory` absent.
- [ ] Assert live RuntimeBundleV3 still comes from current public track content.
- [ ] Commit `test: keep governance lineage out of public bundle`.

---

# Checkpoint J — Acceptance, Review, Integration

### Task 72: Full K1 validator integration

**Files:**
- Modify: `scripts/validate.js`
- Modify: `package.json`

**Interfaces:**
- Canonical validator checks K1 schemas/policies/bootstrap release/import artifacts without changing current runtime bundle validation.

- [ ] RED intentionally corrupt copied fixture and prove K1 validator detects it.
- [ ] Add K1 contract/artifact checks.
- [ ] Run `npm run validate` GREEN.
- [ ] Commit `feat: validate K1 governance artifacts`.

### Task 73: K1 CLI acceptance

**Files:**
- Modify CLI/tests.

- [ ] Run status on bootstrap release.
- [ ] Run deterministic candidate through local pipeline fixture.
- [ ] Interrupt/resume fixture.
- [ ] Retry failed-stage fixture.
- [ ] Assert audit/provenance files validate.
- [ ] Commit `test: accept local K1 control plane`.

### Task 74: Whole-suite acceptance

**Files:**
- Update checkpoint/ledger only after fresh evidence.

- [ ] Run `npm run validate`.
- [ ] Run `npm test`.
- [ ] Run `node --check` on new kernel/CLI modules.
- [ ] Run `npm run verify:sw`.
- [ ] Run `npm run verify:factory-import`.
- [ ] Build Pages artifact + local live verifier.
- [ ] Run browser smoke.
- [ ] Run `PYTHONPATH=server pytest -q server/tests`.
- [ ] Run SQLite smoke.
- [ ] Run browser adapter contract.
- [ ] Run API adapter contract.
- [ ] Record exact Node/Python counts and all PASS lines.
- [ ] Verify existing 1,120/200/StateV2/RuntimeBundleV3 regression evidence unchanged.

### Task 75: Whole-branch review

**Files:**
- Create: `docs/superpowers/reviews/2026-09-27-k1-final-review.md`
- Update: `HANDOFF.md`, tracker/checkpoint.

- [ ] Invoke Superpowers requesting-code-review.
- [ ] If independent reviewer/subagent unavailable, record exactly `Final review: self-review (no subagent tool)`.
- [ ] Review lifecycle bypass, immutability, provider trust boundary, resume/retry, partial batch, provenance honesty, release rollback, learner-event raw/derived separation, current-bank migration and public artifact leakage.
- [ ] Fix every Critical/Important finding via TDD.
- [ ] Record Minor findings explicitly.
- [ ] Commit review/handoff update.

### Task 76: Exact-head CI gate

**Files:** none unless CI exposes a defect.

- [ ] Verify PR exact head SHA.
- [ ] Require Pull request quality gate SUCCESS.
- [ ] Require Server/adapter contract tests SUCCESS.
- [ ] If either fails, use systematic-debugging; do not merge.
- [ ] Update checkpoint with exact run IDs.

### Task 77: Merge K1

**Interfaces:**
- Uses Superpowers `finishing-a-development-branch`.

- [ ] Invoke finishing-a-development-branch.
- [ ] Preserve user's already-selected Native execution and authorized merge-after-green choice subject to current skill gate.
- [ ] Merge only expected exact head SHA.
- [ ] Record merge SHA.
- [ ] Do not start K2 before post-merge verification.

### Task 78: Post-merge verification

**Files:**
- Create: `docs/superpowers/reviews/2026-09-27-k1-post-merge-verification.md`
- Update tracker/HANDOFF.

- [ ] Verify main Server/adapter workflow SUCCESS.
- [ ] Verify main Pages validate/deploy/live SUCCESS.
- [ ] Re-read K1 spec/plan/review from main.
- [ ] Verify bootstrap factory artifacts and private-artifact exclusion on main.
- [ ] Set K1 = MERGED + VERIFIED.
- [ ] Set K2 = DESIGN_NEXT.
- [ ] Commit documentation only if needed and verify that docs-only commit.

### Task 79: K2 handoff boundary

**Files:**
- Update: `HANDOFF.md`
- Update: programme tracker.

- [ ] State K2 exact name: Coverage Expansion & Controlled Release.
- [ ] State K2 must read real post-K1 main baseline.
- [ ] State no K2 product implementation has started.
- [ ] State required next Superpowers step = brainstorming/design.
- [ ] Stop K1 execution.

---

# Checkpoint Schedule

- **A0:** Tasks 1–5 — baseline + RED architecture boundary
- **A1:** Tasks 6–16 — core contracts
- **B:** Tasks 17–23 — lifecycle/policies/immutability
- **C:** Tasks 24–29 — provenance/providers/evaluation
- **D:** Tasks 30–40 — persistence/local orchestration/resume/batch/SQLite/CLI
- **E:** Tasks 41–51 — quality pipeline
- **F:** Tasks 52–55 — coverage engine
- **G:** Tasks 56–61 — release/canary/rollback/form snapshots/migration delta
- **H:** Tasks 62–65 — learner events/interoperability seams
- **I:** Tasks 66–71 — migrate current 1,120 into governed lineage
- **J:** Tasks 72–79 — validator/acceptance/review/CI/merge/post-merge/K2 boundary

After each checkpoint, the checkpoint file must include:
- current branch HEAD;
- completed parent tasks;
- completed microsteps;
- RED→GREEN evidence;
- exact tests/results;
- rulings;
- current failures;
- next exact task;
- files changed;
- resume safety;
- merge status.

## Execution Method

The user already selected **Native / continuous execution** for this programme: execute tasks in this session/harness using `superpowers:executing-plans`, with systematic-debugging on unexpected failures and verification-before-completion before any completion/merge claim.

No implementation starts until the user reviews and explicitly approves this written plan.

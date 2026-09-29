# K3 Learner Evidence Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement K3 as a vendor-neutral, offline-first, immutable learner-evidence layer with idempotent synchronization, explicit assessment concurrency, replayable projections, privacy governance, and standards adapters without changing current learner-visible content or importing K4/K5/K6/K8 derived truth.

**Architecture:** New learner interactions become governed `LearnerEvidenceEventV2` records written locally first, synchronized at least once to an authoritative EvidenceStore when an authorized sync identity exists, and queried through versioned projections. Product analytics and telemetry stay separate. Browser, JSONL, SQLite, and API adapters share one conformance corpus; xAPI/Caliper remain adapters.

**Tech Stack:** Node.js 22 ESM, browser IndexedDB/Web Crypto, FastAPI/Python 3.12, SQLite, JSON Schema/Ajv, Python `jsonschema`, RFC 8785 JCS + SHA-256, existing static Pages/service-worker runtime.

**Spec:** `docs/superpowers/specs/2026-09-29-k3-learner-evidence-engine-design.md`

## Global Constraints

- Execute in an isolated worktree/branch created with `superpowers:using-git-worktrees`; suggested branch `impl/k3-learner-evidence-engine`.
- TDD RED -> GREEN for every behavior-changing task; invoke `systematic-debugging` on unexpected failures.
- Preserve current 1,120-question bank, 7 domains, exam allocation, AR/EN/RTL/LTR, StateV2 compatibility, and K1/K2 contracts.
- K3 raw evidence must never contain mastery/readiness/NBA/IRT/CAT conclusions.
- Exact retry is idempotent; same event ID/different body is a conflict; client wall-clock time never resolves cross-device conflicts.
- Learner Evidence, Product Analytics, and System Telemetry remain separate planes.
- No custom LRS, Kafka, KurrentDB/EventStoreDB, CRDT framework, or generic sync engine.
- No guessed session/retention/skew/batch/retry/quota/anomaly/rate thresholds in core logic.
- Add `fake-indexeddb@6.2.5` dev-only for Node IndexedDB tests.
- Add `rfc8785==0.1.4` to server requirements for authoritative Python JCS.
- Reuse the reviewed `canonicalize@5.1.0` RFC 8785 implementation for browser/Node through a checked-in compatibility module with required attribution; do not hand-roll JCS.
- Keep static Pages bundle-free; do not add a browser runtime package/bundler only for JCS.
- Each phase ends with a durable checkpoint, exact HEAD, focused verification, and cleanup.
- Whole-plan review, exact-head verification, finishing-development-branch, and post-merge verification are mandatory.
- Command convention: when a task says "Run RED" or "Run GREEN" without repeating a command, run `node --test <that task's listed JS test files>` for Node tests, `PYTHONPATH=server python3 -m pytest <that task's listed Python test files> -q` for Python tests, and both commands for mixed tasks. RED means at least one intended new assertion fails for the expected missing behavior; GREEN means zero failures.

## Review Focus

1. Crash/storage pressure before acknowledgement -> Tasks 10-13 test IndexedDB recovery, durable local capture, outbox state, and observable durability risk.
2. Retry versus collision -> Tasks 6-13 enforce identical fingerprints/dispositions across stores.
3. Two devices mutate one strict mock -> Tasks 18, 21, and 29 preserve raw actions, resolve authority by revision, and prove timestamps never implement LWW.
4. Privacy erasure after export/projection -> Tasks 20-25 cover correction-aware projections, identity links, receipts/fingerprints, export lifecycle, and projection invalidation.
5. Legacy/import missing K3 context -> Tasks 24, 26, 32, and 33 preserve legacy granularity and reject/stage standards imports instead of fabricating K3 context.

## File Structure Map

Public/browser:
- `src/evidence/jcs.js`, `ids.js`, `contract.js`, `storePort.js`, `indexedDbStore.js`, `outbox.js`, `sync.js`, `apiTransport.js`, `recorder.js`, `assessmentRevision.js`.
- `src/evidence/projections/activityProjection.js`, `attemptProjection.js`.
- `src/evidence/legacy.js`.

Kernel/tooling:
- modify `src/platform-kernel/observability/eventRegistry.js`.
- create `src/platform-kernel/evidence/integrity.js`, `identityLinks.js`, `privacyLifecycle.js`, `exportLedger.js`.
- modify `src/platform-kernel/interoperability/ports.js`; create `xapi.js`, `caliper.js`.

Contracts/public context:
- create schemas for EventDefinitionV2, LearnerEvidenceEventV2, receipt, batch result, outbox, activity/attempt projections, identity links, export records, scoring policy, runtime evidence context.
- create `data/evidence/event-definitions-v1.json`, payload schemas, `sdaia-ai-engineer.runtime-v1.json`, `sdaia-ai-engineer.scoring-v1.json`.
- modify track manifest/runtime-bundle schemas/loaders.

Reference/server:
- create `scripts/platform-kernel/adapters/jsonlEvidenceStore.js`.
- create `server/app/evidence_store.py`, `server/app/evidence_auth.py`; modify `server/app/main.py`, `db/schema.sql`, `api/openapi.yaml`.

Tests:
- create `tests/fixtures/k3/`, focused `tests/k3-*.test.js`, `server/tests/test_k3_evidence_store.py`, `server/tests/test_k3_evidence_api.py`.
- extend contract/browser smoke/CI only after components are green.

---

# Phase A — Contracts and public evidence context

### Task 1: EventDefinitionV2 governance
**Files:** create `data/schema/event-definition-v2.schema.json`; modify `src/platform-kernel/observability/eventRegistry.js`; test `tests/k3-event-definition-v2.test.js`, `tests/event-registry-v2.test.js`.

**Interfaces:** existing `registerEventDefinition(definition)` supports V1/V2; V1 `validateEvent` stays analytics-only; V2 adds `plane`, `actor_kind`, `required_context_fields`, `payload_schema_ref`.

- [x] Write failing tests: V1 compatibility, V2 registration, immutability, analytics validator refusal for learner-evidence definitions.
- [x] Run RED: `node --test tests/k3-event-definition-v2.test.js tests/event-registry-v2.test.js`.
- [x] Implement minimal V2 schema/registry support.
- [x] Run GREEN plus `node --test tests/observability-ports.test.js`.
- [x] Commit `feat: add K3 event definition governance`.

### Task 2: LearnerEvidenceEventV2 and support schemas
**Files:** create `data/schema/learner-evidence-event-v2.schema.json`, `data/schema/evidence-storage-receipt-v1.schema.json`, `data/schema/evidence-batch-result-v1.schema.json`, `data/schema/evidence-outbox-record-v1.schema.json`, `data/schema/activity-projection-v1.schema.json`, `data/schema/attempt-projection-v1.schema.json`, `data/schema/learner-identity-link-record-v1.schema.json`, `data/schema/evidence-export-record-v1.schema.json`; test `tests/k3-contract-schemas.test.js`.

**Interfaces:** exact contracts `LearnerEvidenceEventV2`, `EvidenceStorageReceiptV1`, `EvidenceBatchResultV1`, `EvidenceOutboxRecordV1`, `ActivityProjectionV1`, `AttemptProjectionV1`, `LearnerIdentityLinkRecordV1`, and `EvidenceExportRecordV1`.

- [x] Write failing Ajv fixtures for UUIDs, origin_seq, modes, optional context, dispositions, outbox states, LINK/UNLINK, export lifecycle, forbidden derived fields.
- [x] Run RED: `node --test tests/k3-contract-schemas.test.js`.
- [x] Add minimal schemas with closed fields where normative.
- [x] Run GREEN.
- [x] Commit `feat: add K3 evidence contract schemas`.

### Task 3: Governed event vocabulary
**Files:** create `data/evidence/event-definitions-v1.json`, `data/evidence/payload-schemas/*.schema.json`; test `tests/k3-event-vocabulary.test.js`.

**Interfaces:** definitions for the 12 required spec events; no generic pause/resume in v1.

- [x] Write failing tests for all event names, LEARNER_EVIDENCE plane, actor/authority rules, privacy/export metadata, payload/property agreement.
- [x] Run RED.
- [x] Add definitions + payload schemas.
- [x] Run GREEN.
- [x] Commit `feat: define K3 learner evidence vocabulary`.

### Task 4: Scoring policy and RuntimeBundleV4 evidence context
**Files:** create `data/schema/scoring-policy-v1.schema.json`, `data/schema/runtime-evidence-context-v1.schema.json`, `data/schema/runtime-bundle-v4.schema.json`, `data/evidence/sdaia-ai-engineer.scoring-v1.json`, `data/evidence/sdaia-ai-engineer.runtime-v1.json`; modify `data/schema/track-manifest.schema.json`, `tracks/sdaia-ai-engineer/manifest.json`, `src/content/runtimeBundle.js`, `server/app/main.py`, `api/openapi.yaml`; test `tests/k3-runtime-evidence-context.test.js` and server bank tests.

**Interfaces:** introduce versioned `RuntimeBundleV4` with additive `evidence` context for tracks declaring `learner-evidence-v2`; reuse `content_release_id="sdaia-ai-engineer.bootstrap.v1"` as the immutable grandfathered baseline reference without relabeling its K2 lifecycle state; scoring policy documents current `scoreExam` semantics without behavior change.

- [x] Write failing tests for release/hash/scoring/definitions and unchanged bank/profile.
- [x] Run RED: Node focused test + `PYTHONPATH=server pytest -q server/tests/test_api.py::test_bank`.
- [x] Implement RuntimeBundleV4 evidence context while keeping V2/V3 readers compatible for tracks that do not declare the new capability.
- [x] Run GREEN plus `node --test tests/track-contract.test.js`.
- [x] Commit `feat: expose stable K3 evidence context`.

### Task 5: Schema-derived browser validators and event constructor
**Files:** create `scripts/generate_k3_validators.js`, `src/evidence/generatedValidators.js`, `src/evidence/ids.js`, `src/evidence/contract.js`; modify `package.json`; test `tests/k3-generated-validators.test.js`, `tests/k3-evidence-contract-runtime.test.js`.

**Interfaces:** `npm run generate:k3-validators` compiles the approved K3 JSON Schemas with Ajv standalone into a browser-safe ES module; `newUuid()`; `createLearnerEvidenceEvent(input,runtimeContext)`; `validateLearnerEvidenceEvent(event,runtimeContext)`.

- [ ] Write failing tests for generator determinism/freshness plus UUIDv4, track locale validation, required context, authority, forbidden PII/derived fields, and UTC normalization.
- [ ] Run RED: `node --test tests/k3-generated-validators.test.js tests/k3-evidence-contract-runtime.test.js`.
- [ ] Generate browser validators from the canonical schemas, route payload validation by `payload_schema_ref`, and implement the event constructor around generated validators; do not duplicate payload rules manually.
- [ ] Run GREEN, regenerate once more and assert zero diff, then run Tasks 1/3 tests.
- [ ] Commit `feat: add schema-derived K3 browser validation`.

**Phase A checkpoint:** write a review artifact with exact HEAD and focused test output.

---

# Phase B — Fingerprint and durable reference stores

### Task 6: RFC 8785 canonicalization and fingerprints
**Files:** create `src/vendor/rfc8785.js`, `src/vendor/LICENSE-canonicalize.txt`, `src/evidence/jcs.js`, `tests/fixtures/k3/jcs-vectors.json`, `tests/k3-jcs.test.js`; create or modify `THIRD_PARTY_NOTICES.md`; modify `server/requirements.txt`, `server/tests/test_k3_evidence_store.py`.

**Interfaces:** `canonicalizeJson(value)->string`; async `fingerprintEvent(event)->hex SHA-256`; Python uses `rfc8785.dumps` + SHA-256.

- [ ] Write failing RFC vectors + JS/Python hash parity fixture; pin `rfc8785==0.1.4` and assert attribution files exist.
- [ ] Run RED Node/Python fingerprint tests.
- [ ] Reuse `canonicalize@5.1.0` in the checked-in compatibility module and wrap it with Web Crypto SHA-256; do not rewrite the canonicalization algorithm.
- [ ] Run GREEN and cross-language parity against shared vectors.
- [ ] Commit `feat: add canonical K3 event fingerprints`.

### Task 7: EvidenceStore port/conformance harness
**Files:** create `src/evidence/storePort.js`, `tests/fixtures/k3/store-conformance.json`, `tests/helpers/k3StoreConformance.js`, `tests/k3-store-port.test.js`.

**Interfaces:** `EvidenceStore` requires `accept`, `acceptBatch`, `getById`, `read`; every accept path returns `EvidenceStorageReceiptV1`, and every batch path returns `EvidenceBatchResultV1`.

- [ ] Write failing port/receipt-shape tests.
- [ ] Run RED.
- [ ] Implement assertion + reusable conformance harness.
- [ ] Run GREEN.
- [ ] Commit `test: define K3 evidence store conformance contract`.

### Task 8: JSONL EvidenceStoreV2
**Files:** create `scripts/platform-kernel/adapters/jsonlEvidenceStore.js`; test `tests/k3-jsonl-evidence-store.test.js`.

**Interfaces:** `createJsonlEvidenceStore(eventFile,indexFile,{storeId})`.

- [ ] Write failing tests for ACCEPTED/DUPLICATE/CONFLICT, origin-seq conflict, store_seq, filtering, malformed file.
- [ ] Run RED.
- [ ] Implement append-only events + sidecar index; no update/delete.
- [ ] Run GREEN + shared harness.
- [ ] Commit `feat: add JSONL K3 evidence store`.

### Task 9: SQLite EvidenceStoreV2

**Files:** modify `db/schema.sql`; create `server/app/evidence_store.py`; test `server/tests/test_k3_evidence_store.py`.

**Interfaces:** `accept_evidence(db_url,event)->receipt`; `accept_evidence_batch(db_url,events)->batch result`; `get_evidence(db_url,event_id)`; `read_evidence(db_url,learner_id,after_store_seq=None,filters=None)`.

- [ ] Write failing tests for schema/indexes, exact retry, same-ID conflict, origin-seq conflict, monotonically increasing store_seq, direct lookup, learner/activity/attempt/item/release/type queries.
- [ ] Run RED: `PYTHONPATH=server python3 -m pytest server/tests/test_k3_evidence_store.py -q`.
- [ ] Add K3 tables/indexes without deleting or redefining legacy `learner_events`.
- [ ] Run GREEN plus repeated `init_db` to prove idempotent schema application.
- [ ] Commit `feat: add SQLite K3 evidence store`.

### Task 10: IndexedDB EvidenceStoreV2

**Files:** create `src/evidence/indexedDbStore.js`; add `fake-indexeddb@6.2.5` dev dependency; test `tests/k3-indexeddb-evidence-store.test.js`.

**Interfaces:** `createIndexedDbEvidenceStore({dbName,storeId,indexedDB}) -> EvidenceStore`.

- [ ] Write failing tests using `fake-indexeddb/auto` for exact retry, conflicts, indexes, store_seq, close/reopen recovery.
- [ ] Run RED.
- [ ] Implement IndexedDB event/receipt/index stores with atomic acceptance.
- [ ] Run GREEN + shared conformance harness.
- [ ] Commit `feat: add IndexedDB K3 evidence store`.

### Task 11: Origin identity, local sequence allocation, and durable capture

**Files:** create `src/evidence/origin.js`, `src/evidence/localCapture.js`; modify `src/storage/identity.js`; test `tests/k3-local-capture.test.js`.

**Interfaces:** `getOrCreateEvidenceOriginId(storage)->UUIDv4`; `captureLocalEvidence({store,outbox,eventInput,definition,runtimeContext})->{event,receipt}`; `requestEvidenceStoragePersistence(navigatorLike)->{supported,granted}`.

- [ ] Write failing tests for stable random origin ID, atomic origin_seq allocation, blocked localStorage, local-store failure, persistence grant/denial.
- [ ] Run RED.
- [ ] Implement local-first capture; no network call may occur before local ACCEPTED/DUPLICATE receipt.
- [ ] Run GREEN and prove a durability failure is surfaced instead of reported as recorded.
- [ ] Commit `feat: add durable local K3 capture`.

### Task 12: EvidenceOutboxRecordV1 state machine

**Files:** create `src/evidence/outbox.js`; test `tests/k3-evidence-outbox.test.js`.

**Interfaces:** `enqueue(eventId)`; `markInFlight(eventIds,at)`; `applyReceipt(receipt)`; `listPending(options)`. ACCEPTED/DUPLICATE -> ACKNOWLEDGED; CONFLICT/REJECTED -> BLOCKED.

- [ ] Write failing transition, retry, restart, and no-body-mutation tests.
- [ ] Run RED.
- [ ] Implement mutable transport metadata separately from immutable event bytes.
- [ ] Run GREEN.
- [ ] Commit `feat: add K3 evidence outbox`.

### Task 13: Cross-adapter store conformance

**Files:** expand `tests/fixtures/k3/store-conformance.json`; modify `tests/helpers/k3StoreConformance.js`; create `tests/k3-store-conformance.test.js`; create `server/tests/test_k3_store_conformance.py`.

**Interfaces:** one logical fixture drives JSONL, IndexedDB, and SQLite disposition/order expectations.

- [ ] Add failing cases for normal append, exact retry, ID/body conflict, origin-seq conflict, late arrival, out-of-order arrival, multi-device distinct events, and filtered reads.
- [ ] Run all three adapters and record RED mismatches.
- [ ] Fix adapter implementations only; do not weaken shared expected semantics.
- [ ] Run GREEN across Node and Python.
- [ ] Commit `test: enforce K3 store conformance parity`.

**Phase B checkpoint:** persist exact HEAD, dependency versions, adapter parity result, and remaining gaps.

---

# Phase C — Authorized synchronization and API

### Task 14: Fail-closed learner authorization port

**Files:** create `server/app/evidence_auth.py`; test `server/tests/test_k3_evidence_auth.py`.

**Interfaces:** `LearnerAuthorizationPort.resolve(request)->AuthorizedLearner`; default implementation denies server sync; tests inject `StaticLearnerAuthorization`; `create_app(db_url=None, learner_auth=None)` uses the fail-closed resolver when `learner_auth` is omitted.

- [ ] Write failing tests proving `learner_id` and current `X-Anon-Id` alone never grant learner-evidence read/write.
- [ ] Run RED.
- [ ] Implement the port, default fail-closed resolver, and deterministic test resolver.
- [ ] Run GREEN.
- [ ] Commit `feat: add fail-closed K3 learner authorization`.

### Task 15: Authorized batch-push API

**Files:** modify `api/openapi.yaml`, `server/app/main.py`; test `server/tests/test_k3_evidence_api.py`.

**Interfaces:** `POST /v1/learner-evidence/batch`; request `{events:[...]}`; response `EvidenceBatchResultV1`; authorized principal must match event learner scope.

- [ ] Write failing tests for ACCEPTED, DUPLICATE, CONFLICT, REJECTED, partial batch, and cross-user rejection.
- [ ] Run RED.
- [ ] Implement endpoint over `evidence_store.py` + auth port.
- [ ] Run GREEN.
- [ ] Commit `feat: add K3 evidence batch API`.

### Task 16: Authorized cursor-based pull API

**Files:** modify `api/openapi.yaml`, `server/app/main.py`; test `server/tests/test_k3_evidence_api.py`.

**Interfaces:** `GET /v1/learner-evidence?after_store_seq=<n>&limit=<n>`; auth scope selects learner; response includes ordered events and `next_store_seq`.

- [ ] Write failing cursor/replay/cross-user/bounded-limit tests.
- [ ] Run RED.
- [ ] Implement repeatable store_seq-ordered pull; limit comes from injected/configured policy, not hidden architecture constant.
- [ ] Run GREEN.
- [ ] Commit `feat: add K3 evidence pull API`.

### Task 17: EvidenceSync port and coordinator

**Files:** create `src/evidence/syncPort.js`, `src/evidence/apiTransport.js`, `src/evidence/sync.js`; test `tests/k3-evidence-sync.test.js`.

**Interfaces:** `assertEvidenceSyncPort(port)` requires `push(events)`, `pull(afterStoreSeq)`; `syncEvidence({store,outbox,syncPort,watermark,policy})`.

- [ ] Write failing lost-ACK, duplicate retry, partial batch, network failure, restart, and resumable-pull tests.
- [ ] Run RED.
- [ ] Implement at-least-once coordinator preserving original event IDs/bodies.
- [ ] Run GREEN.
- [ ] Commit `feat: add K3 evidence synchronization`.

**Phase C checkpoint:** record exact HEAD and prove local-only mode remains functional when authorization/sync is unavailable.

---

# Phase D — Strict assessment authority, corrections, and projections

### Task 18: Strict-assessment optimistic revision resolver

**Files:** create `src/evidence/assessmentRevision.js`; test `tests/k3-assessment-revision.test.js`.

**Interfaces:** `resolveAssessmentMutation({candidateEvent,currentRevision,storeSeq,authorityRef})->mutationResolvedEvent`. APPLIED only when `base_attempt_revision===currentRevision`; stale branch remains raw evidence.

- [ ] Write failing single-origin chain and two-device same-base branch tests.
- [ ] Run RED.
- [ ] Implement revision resolver; client `occurred_at` must never choose a winner.
- [ ] Run GREEN, then swap client timestamps and prove decision is unchanged.
- [ ] Commit `feat: add K3 strict assessment revision authority`.

### Task 19: Correction/supersession graph resolver

**Files:** create `src/evidence/corrections.js`; test `tests/k3-evidence-corrections.test.js`.

**Interfaces:** `resolveCurrentEvidence(events)->{activeEvents,unresolved,conflicts}`.

- [ ] Write failing tests for VOID, SUPERSEDE, correction-before-target, competing supersession, cycles, unauthorized authority.
- [ ] Run RED.
- [ ] Implement deterministic correction resolution without mutating target bytes.
- [ ] Run GREEN.
- [ ] Commit `feat: add K3 correction resolution`.

### Task 20: ActivityProjectionV1

**Files:** create `src/evidence/projections/activityProjection.js`; test `tests/k3-activity-projection.test.js`.

**Interfaces:** `projectActivity(events,{throughStoreSeq,policyVersion,identityResolutionVersion})->ActivityProjectionV1`.

- [ ] Write failing start/completion/item/response/hint/explanation/late/correction tests.
- [ ] Run RED.
- [ ] Implement correction-aware deterministic projection; incomplete references remain explicit.
- [ ] Run GREEN and verify no mastery/readiness/abandonment field is emitted.
- [ ] Commit `feat: add K3 activity projection`.

### Task 21: AttemptProjectionV1

**Files:** create `src/evidence/projections/attemptProjection.js`; test `tests/k3-attempt-projection.test.js`.

**Interfaces:** `projectAttempt(events,{formSnapshot,throughStoreSeq,policyVersion})->AttemptProjectionV1`.

- [ ] Write failing tests for A->B->C answer changes, APPLIED/STALE device branches, unanswered-at-submit derivation, evaluation/regrade references, VOID/SUPERSEDE.
- [ ] Run RED.
- [ ] Implement current authoritative response selection only from accepted revision history.
- [ ] Run GREEN; verify underlying response history references remain.
- [ ] Commit `feat: add K3 attempt projection`.

### Task 22: Replay and deterministic integrity findings

**Files:** create `src/evidence/replay.js`, `src/platform-kernel/evidence/integrity.js`; test `tests/k3-evidence-replay.test.js`, `tests/k3-evidence-integrity.test.js`.

**Interfaces:** `replayEvidence(store,{fromSeq,toSeq,projectors})`; `inspectEvidenceIntegrity(events,context)->findings[]`.

- [ ] Write failing watermark, late-event rebuild, orphan-target, sequence reuse, and clock-divergence-warning tests.
- [ ] Run RED.
- [ ] Implement deterministic failures separately from warnings; do not invent numeric anomaly thresholds.
- [ ] Run GREEN.
- [ ] Commit `feat: add K3 replay and integrity kernel`.

**Phase D checkpoint:** record exact HEAD and the strict multi-device falsification scenarios from the spec.

---

# Phase E — Identity, privacy lifecycle, legacy compatibility

### Task 23: Append-only LearnerIdentityLinkRecordV1

**Files:** create `src/platform-kernel/evidence/identityLinks.js`, `scripts/platform-kernel/adapters/jsonlIdentityLinkStore.js`; modify `db/schema.sql`, `server/app/evidence_store.py`; test `tests/k3-identity-links.test.js`, `server/tests/test_k3_identity_links.py`.

**Interfaces:** `resolveLearnerPrincipal(learnerId,records)->{principal,chain,status}`; LINK/UNLINK are append-only.

- [ ] Write failing LINK, UNLINK, chain, cycle, and conflicting-link tests.
- [ ] Run RED.
- [ ] Implement JS/file/SQLite parity without rewriting raw event learner IDs.
- [ ] Run GREEN.
- [ ] Commit `feat: add K3 learner identity links`.

### Task 24: Honest LearnerEventV1 compatibility reader

**Files:** create `src/evidence/legacy.js`; preserve `src/platform-kernel/evidence/learnerEvent.js`; test `tests/k3-legacy-learner-event.test.js`.

**Interfaces:** `classifyLegacyLearnerEvent(record)->VALID_V1|KNOWN_V1_VARIANT|INVALID_LEGACY_RECORD`; `readLegacyLearnerEvidence(record)->coarse view`.

- [ ] Write failing fixtures reproducing JSON Schema/JS/Python V1 drift.
- [ ] Run RED.
- [ ] Implement read-only compatibility preserving missing `answer`/`confidence` as missing.
- [ ] Run GREEN plus all existing V1 tests.
- [ ] Commit `feat: add honest K3 legacy evidence reader`.

### Task 25: Privacy lifecycle and append-only EvidenceExportRecordV1 ledger

**Files:** create `src/platform-kernel/evidence/privacyLifecycle.js`, `src/platform-kernel/evidence/exportLedger.js`; modify `db/schema.sql`, `server/app/evidence_store.py`; test `tests/k3-privacy-lifecycle.test.js`, `server/tests/test_k3_privacy.py`.

**Interfaces:** privileged lifecycle API is separate from ordinary EvidenceStore; export actions are EXPORTED/DELETE_REQUESTED/DELETED/DELETION_UNSUPPORTED/DELETION_FAILED.

- [ ] Write failing tests proving ordinary store has no update/delete API and privacy actions invalidate learner-linkable receipts/fingerprints/projection caches according to policy.
- [ ] Run RED.
- [ ] Implement privileged lifecycle + append-only export actions.
- [ ] Run GREEN.
- [ ] Commit `feat: add K3 privacy lifecycle governance`.

### Task 26: StateV2 transition compatibility

**Files:** modify `src/state/migrate.js` only if necessary; create `tests/k3-state-transition.test.js`; preserve `tests/state-migration.test.js`.

**Interfaces:** pre-K3 active StateV2 attempt remains resumable without invented K3 history; only activities started after K3 activation enter the new evidence stream.

- [ ] Write failing fixtures for pre-K3 active exam and legacy exam_history.
- [ ] Run RED.
- [ ] Implement only the minimal marker/transition needed; do not synthesize item-presented/response timestamps.
- [ ] Run GREEN plus existing state migration tests.
- [ ] Commit `feat: preserve StateV2 through K3 transition`.

**Phase E checkpoint:** document exact legacy classifications, privacy-lifecycle tests, and zero fabricated history.

---

# Phase F — Browser runtime integration without learner-visible behavior change

### Task 27: Make AssessmentFormSnapshot browser-safe and release-bound

**Files:** create `src/assessment/assessmentSnapshot.js`; modify `src/platform-kernel/release/assessmentSnapshot.js` to re-export shared logic; modify `src/app.js`; test `tests/assessment-snapshot.test.js`, `tests/k3-runtime-assessment-context.test.js`.

**Interfaces:** `createAssessmentFormSnapshot(input)` remains compatible. Browser strict assessments bind exact runtime content release, item IDs, option order, profile, scoring policy, locale.

- [ ] Write failing browser-context tests; current UI `full` maps to evidence mode `mock` without changing labels.
- [ ] Run RED.
- [ ] Move/re-export shared snapshot implementation and attach it to newly created exams.
- [ ] Run GREEN + current exam tests.
- [ ] Commit `refactor: expose frozen assessment context to browser`.

### Task 28: Browser EvidenceRuntime manager

**Files:** create `src/evidence/recorder.js`; modify `src/storage/interface.js`, `src/storage/browser.js`; test `tests/k3-evidence-recorder.test.js`.

**Interfaces:** `createEvidenceRecorder({store,outbox,runtimeContext,clock,crypto})`; methods `startActivity`, `presentItem`, `recordResponse`, `recordConfidence`, `requestHint`, `openExplanation`, `submitAssessment`, `recordEvaluation`.

- [ ] Write failing ordered-event tests.
- [ ] Run RED.
- [ ] Implement recorder entirely over already-tested local capture/store primitives.
- [ ] Run GREEN.
- [ ] Commit `feat: add K3 browser evidence recorder`.

### Task 29: Instrument current full/section assessment interactions

**Files:** create `src/evidence/appBridge.js`; modify `src/app.js`; test `tests/k3-app-evidence-integration.test.js`, `tests/k1-current-runtime-regression.test.js`.

**Interfaces:** pure bridge functions `beginExamEvidence(recorder,exam,context)`, `presentExamItemEvidence(recorder,exam,question,context)`, `recordExamAnswerEvidence(recorder,exam,question,answer,context)`, `recordExamConfidenceEvidence(recorder,exam,question,confidence,context)`, and `submitExamEvidence(recorder,exam,result,questions,context)` keep evidence orchestration testable outside the DOM. New exam emits activity.started; first view of each interaction emits item.presented; each committed answer change emits response.recorded; confidence changes emit confidence.recorded; submit emits assessment.submitted and evaluation events using existing scorer/scoring-policy reference.

- [ ] Write failing app sequence tests around existing `createExam/selectAnswer/setConfidence/move/jump/submitExam`.
- [ ] Run RED.
- [ ] Add instrumentation without changing scoring, selection, rendering, keyboard controls, or StateV2 UI behavior.
- [ ] Run GREEN + full Node suite + browser smoke.
- [ ] Commit `feat: record assessment learner evidence`.

### Task 30: Optional authorized sync integration

**Files:** modify `src/storage/api.js`, `src/storage/interface.js`, `src/config.js`; test `tests/k3-storage-sync-capability.test.js`, `tests/storage.api.test.js`.

**Interfaces:** local evidence always works; sync is enabled only when an explicit EvidenceSync authorization provider/config is present. Existing X-Anon-Id progress API remains unchanged.

- [ ] Write failing fail-closed and injected-authorized-sync tests.
- [ ] Run RED.
- [ ] Wire optional sync capability; no silent fallback from authorized learner sync to X-Anon-Id.
- [ ] Run GREEN.
- [ ] Commit `feat: wire optional K3 evidence sync`.

**Phase F checkpoint:** verify learner-visible bank digest, scoring results, AR/EN/RTL/LTR, and offline shell behavior are unchanged.

---

# Phase G — Interoperability and governed bridges

### Task 31: Harden LearningEventExchangePort

**Files:** modify `src/platform-kernel/interoperability/ports.js`; test `tests/interoperability-ports.test.js`, `tests/k3-learning-event-exchange.test.js`.

**Interfaces:** preserve `exportEvents`/`importEvents`; result contract reports mapping version, mapped IDs, omissions/rejections, and provenance.

- [ ] Write failing result-contract tests while preserving existing port adapters.
- [ ] Run RED.
- [ ] Extend assertion/helper contract compatibly.
- [ ] Run GREEN.
- [ ] Commit `feat: harden learning event exchange port`.

### Task 32: xAPI 2.0 adapter

**Files:** create `src/platform-kernel/interoperability/xapi.js`, `data/evidence/mappings/xapi-v1.json`; test `tests/k3-xapi-adapter.test.js`.

**Interfaces:** export returns xAPI statements + mapping report; import either maps with exact required K3 context, stages, or rejects. Never implement an LRS.

- [ ] Write failing response/evaluation/attempt/timestamp/lossiness/PII/import-abstention tests.
- [ ] Run RED.
- [ ] Implement only supported deterministic mappings; actor identity remains pseudonymous.
- [ ] Run GREEN.
- [ ] Commit `feat: add xAPI K3 adapter`.

### Task 33: Caliper 1.2 adapter

**Files:** create `src/platform-kernel/interoperability/caliper.js`, `data/evidence/mappings/caliper-v1.json`; test `tests/k3-caliper-adapter.test.js`.

**Interfaces:** preserve AssessmentEvent/AssessmentItemEvent/Attempt/Response and Started/Skipped/Completed/Submitted distinctions.

- [ ] Write failing skip-not-attempt and response/attempt mapping tests.
- [ ] Run RED.
- [ ] Implement supported deterministic mapping; unsupported semantics return declared omissions/rejections.
- [ ] Run GREEN.
- [ ] Commit `feat: add Caliper K3 adapter`.

### Task 34: Sanitized Product Analytics bridge and telemetry boundary

**Files:** create `src/platform-kernel/observability/learnerEvidenceBridge.js`; modify `src/platform-kernel/observability/ports.js` only if needed; test `tests/k3-analytics-bridge.test.js`.

**Interfaces:** `toAnalyticsEvent(evidenceEvent,definition,mapping)->validated analytics event|null`; apply ALLOW/REDACT/REJECT; analytics event gets a separate identity.

- [ ] Write failing tests proving learner payload is not passed directly to AnalyticsSink/TelemetrySink.
- [ ] Run RED.
- [ ] Implement governed bridge over existing EventRegistry and analytics privacy policy.
- [ ] Run GREEN + existing observability tests.
- [ ] Commit `feat: bridge K3 evidence to governed analytics`.

**Phase G checkpoint:** record supported mappings, declared lossiness, and evidence that no LRS/vendor became canonical.

---

# Phase H — Repository gates, acceptance, review, and integration

### Task 35: Integrate K3 validation and public/private release boundaries

**Files:** modify `scripts/validate.js`, `.github/workflows/ci.yml`, `.github/workflows/pages.yml`, `scripts/verify_sw_assets.js`, `scripts/verify_live_release.js`, `sw.js`; test `tests/k3-release-boundary.test.js`, `tests/release-contract.test.js`, `tests/service-worker-contract.test.js`.

**Interfaces:** validate K3 schemas/definitions/mappings; CI runs Node + Python + browser smoke; Pages includes only browser-required evidence modules/context and excludes private evidence/factory/admin data.

- [ ] Write failing artifact-boundary and CI-contract tests.
- [ ] Run RED.
- [ ] Update validation/workflows/service-worker asset list.
- [ ] Run GREEN and assemble/verify the Pages artifact locally.
- [ ] Commit `ci: add K3 evidence release gates`.

### Task 36: K3 acceptance suite

**Files:** create `tests/k3-learner-evidence-acceptance.test.js`; update `scripts/browser_smoke.py` only if a new observable browser evidence check is required.

**Interfaces:** spec §47 is covered one-for-one; protected question payload digest remains exact.

- [ ] Add failing acceptance assertions for any criterion not already pinned by focused tests.
- [ ] Run targeted RED and close gaps in the owning component, not by weakening acceptance.
- [ ] Run `npm run validate && npm test && npm run verify:sw`.
- [ ] Run `PYTHONPATH=server python3 -m pytest server/tests -q && python3 scripts/browser_smoke.py`.
- [ ] Commit `test: add K3 learner evidence acceptance gate`.

### Task 37: Durable documentation and execution checkpoint

**Files:** modify `DATA-MODEL.md`, `ARCHITECTURE.md`, `api/openapi.yaml`, `HANDOFF.md`, `docs/superpowers/reviews/2026-09-27-platform-programme-tracker.md`; create `docs/superpowers/reviews/2026-09-29-k3-implementation-checkpoint.md`; test `tests/documentation-contract.test.js`.

**Interfaces:** document contracts, store semantics, fail-closed sync, privacy lifecycle, legacy handling, replay, and K4+ boundary with exact implementation HEAD/test evidence.

- [ ] Add/adjust documentation-contract tests and run RED.
- [ ] Update durable docs; remove stale K3 "not started" statements only when implementation evidence supports the change.
- [ ] Run GREEN.
- [ ] Verify no tribal-knowledge-only operational step remains.
- [ ] Commit `docs: record K3 learner evidence implementation`.

### Task 38: Whole-plan review and fix pass

**Files:** create `docs/superpowers/reviews/2026-09-29-k3-whole-plan-review.md`; modify any K3 files required by findings.

**Interfaces:** classify Critical/Important/Minor; zero open Critical/Important before integration.

- [ ] Invoke `superpowers:requesting-code-review` when an independent reviewer is available; otherwise perform a fresh-context whole-branch review and record the limitation.
- [ ] Compare every changed file against the exact approved base/spec/plan.
- [ ] Fix every Critical/Important finding using TDD and `systematic-debugging` where applicable.
- [ ] Re-run every affected focused test.
- [ ] Commit `review: close K3 whole-plan findings`.

### Task 39: Exact-head verification

**Files:** create `docs/superpowers/reviews/2026-09-29-k3-final-verification.md`.

**Interfaces:** the record names the exact tested product-code HEAD and the later documentation-only verification commit. No product/code change is allowed after the tested product HEAD without restarting this task.

- [ ] Record exact product-code HEAD SHA and clean working-tree status.
- [ ] Run `npm ci --ignore-scripts && npm run validate && npm test && npm run verify:sw`; expected exit 0 with zero test failures.
- [ ] Run `PYTHONPATH=server python3 -m pytest server/tests -q && python3 scripts/browser_smoke.py`; expected exit 0.
- [ ] Assemble the public Pages artifact exactly as CI does, serve it locally, run `verify_live_release.js`, verify learner payload SHA-256 remains `5e48b1e47450f1150c9c8f21386f3a4e31070a3d444f968d10f45ccb9ff418a9`, write the verification record naming that tested product HEAD, and commit it as `docs: record K3 exact-head verification`.
- [ ] Push the resulting final branch HEAD and require all configured CI/status checks to succeed on that exact HEAD; make no further branch changes before Task 40.

### Task 40: Finish and integrate the development branch

**Files:** no planned product files; integration metadata/PR only.

**Interfaces:** use `superpowers:finishing-a-development-branch`; merge only the exact reviewed implementation head (allowing explicitly identified documentation-only verification commit if review covers it).

- [ ] Verify branch is based on the intended main and has no unrelated changes.
- [ ] Present the finishing-development-branch integration options required by the skill.
- [ ] Execute only the user-approved integration action.
- [ ] Record PR/merge SHAs and CI status.
- [ ] Do not begin K4.

### Task 41: Post-merge verification and programme closure

**Files:** create `docs/superpowers/reviews/2026-09-29-k3-post-merge-verification.md`; update `HANDOFF.md` and programme tracker only after successful verification.

**Interfaces:** K3 becomes COMPLETE only after merged `main` passes runtime/server/release verification.

- [ ] Resolve exact merged `main` SHA.
- [ ] Verify GitHub Actions exact merge SHA: Node/validate, server tests, Pages deployment.
- [ ] Verify live Pages release, current bank count/allocation/digest, AR/EN/RTL/LTR, offline cached reload, and evidence-runtime asset availability.
- [ ] Verify server evidence API/store contract against the merged SHA in the supported environment; if production auth/backend is not deployed, record that boundary rather than claiming live server sync.
- [ ] Write post-merge verification and recovery handoff; only then mark K3 COMPLETE + MERGED + POST-MERGE VERIFIED.

---

## Phase checkpoint discipline

After each Phase A–H:

1. run the phase-focused tests;
2. record exact branch HEAD;
3. update a durable K3 execution ledger/checkpoint;
4. verify no unexpected files or unrelated behavior changed;
5. continue approved plan tasks without requesting approval after ordinary microsteps.

If implementation exposes an architectural contradiction with the approved K3 spec, stop the affected implementation path, record an explicit Ruling candidate, and return for architectural approval rather than silently changing the design.

## Commit discipline

Target one reviewable commit per task plus explicit review/fix/checkpoint commits. Do not squash during execution. Integration history policy is chosen only in `finishing-a-development-branch`.

## Execution ordering

Tasks are dependency ordered and should normally run sequentially. Independent test-fixture work inside a task may be parallelized, but no later task may assume an interface before the producing task is GREEN and committed.

## Plan self-review

The plan is not ready for execution until all of these checks pass:

- every normative K3 spec section has an owning task or Global Constraint;
- every task has a checkable RED/GREEN cycle and an independently reviewable deliverable;
- every later interface is introduced before it is consumed;
- all five Review Focus risks have explicit owning tests;
- current public content/runtime compatibility is protected;
- authorized server sync remains fail-closed by default;
- no K4/K5/K6/K8 semantics enter raw evidence;
- no vendor/event-bus/LRS becomes canonical infrastructure;
- whole-plan review, exact-head verification, branch finishing, and post-merge verification remain explicit gates.

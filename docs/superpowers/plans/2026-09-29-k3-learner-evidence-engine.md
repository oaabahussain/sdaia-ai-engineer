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
- Keep static Pages bundle-free; do not add a browser runtime package/bundler only for JCS.
- Each phase ends with a durable checkpoint, exact HEAD, focused verification, and cleanup.
- Whole-plan review, exact-head verification, finishing-development-branch, and post-merge verification are mandatory.

## Review Focus

1. Crash/storage pressure before acknowledgement -> Tasks 11-13 test recovery and observable durability risk.
2. Retry versus collision -> Tasks 6-10 enforce identical dispositions across stores.
3. Two devices mutate one strict mock -> Tasks 20 and 29 preserve raw actions and use revision authority, never timestamp LWW.
4. Privacy erasure after export/projection -> Tasks 21-23 cover links, receipts/fingerprints, exports, and projection invalidation.
5. Legacy/import missing K3 context -> Tasks 24-26 reject/abstain rather than fabricate history/IDs.

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

- [ ] Write failing tests: V1 compatibility, V2 registration, immutability, analytics validator refusal for learner-evidence definitions.
- [ ] Run RED: `node --test tests/k3-event-definition-v2.test.js tests/event-registry-v2.test.js`.
- [ ] Implement minimal V2 schema/registry support.
- [ ] Run GREEN plus `node --test tests/observability-ports.test.js`.
- [ ] Commit `feat: add K3 event definition governance`.

### Task 2: LearnerEvidenceEventV2 and support schemas
**Files:** create `learner-evidence-event-v2.schema.json`, receipt/batch/outbox/activity/attempt/identity/export schemas; test `tests/k3-contract-schemas.test.js`.

- [ ] Write failing Ajv fixtures for UUIDs, origin_seq, modes, optional context, dispositions, outbox states, LINK/UNLINK, export lifecycle, forbidden derived fields.
- [ ] Run RED: `node --test tests/k3-contract-schemas.test.js`.
- [ ] Add minimal schemas with closed fields where normative.
- [ ] Run GREEN.
- [ ] Commit `feat: add K3 evidence contract schemas`.

### Task 3: Governed event vocabulary
**Files:** create `data/evidence/event-definitions-v1.json`, `data/evidence/payload-schemas/*.schema.json`; test `tests/k3-event-vocabulary.test.js`.

**Interfaces:** definitions for the 12 required spec events; no generic pause/resume in v1.

- [ ] Write failing tests for all event names, LEARNER_EVIDENCE plane, actor/authority rules, privacy/export metadata, payload/property agreement.
- [ ] Run RED.
- [ ] Add definitions + payload schemas.
- [ ] Run GREEN.
- [ ] Commit `feat: define K3 learner evidence vocabulary`.

### Task 4: Scoring policy and runtime evidence context
**Files:** create scoring/runtime-context schemas and `data/evidence/sdaia-ai-engineer.scoring-v1.json`, `sdaia-ai-engineer.runtime-v1.json`; modify track manifest, runtime-bundle schema/loader, server bundle loader; test `tests/k3-runtime-evidence-context.test.js` and server bank tests.

**Interfaces:** additive `RuntimeBundleV3.evidence`; reuse `content_release_id="sdaia-ai-engineer.bootstrap.v1"`; scoring policy documents current `scoreExam` semantics without behavior change.

- [ ] Write failing tests for release/hash/scoring/definitions and unchanged bank/profile.
- [ ] Run RED: Node focused test + `PYTHONPATH=server pytest -q server/tests/test_api.py::test_bank`.
- [ ] Implement additive evidence context.
- [ ] Run GREEN plus `node --test tests/track-contract.test.js`.
- [ ] Commit `feat: expose stable K3 evidence context`.

### Task 5: Browser event constructor
**Files:** create `src/evidence/ids.js`, `src/evidence/contract.js`; test `tests/k3-evidence-contract-runtime.test.js`.

**Interfaces:** `newUuid()`; `createLearnerEvidenceEvent(input,runtimeContext)`; `validateLearnerEvidenceEvent(event,runtimeContext)`.

- [ ] Write failing tests for UUIDv4, track locale validation, required context, authority, forbidden PII/derived fields, UTC normalization.
- [ ] Run RED.
- [ ] Implement constructor/validator over governed definitions.
- [ ] Run GREEN plus Tasks 1/3 tests.
- [ ] Commit `feat: construct governed learner evidence events`.

**Phase A checkpoint:** write a review artifact with exact HEAD and focused test output.

---

# Phase B — Fingerprint and durable reference stores

### Task 6: RFC 8785 canonicalization and fingerprints
**Files:** create `src/evidence/jcs.js`, `tests/fixtures/k3/jcs-vectors.json`, `tests/k3-jcs.test.js`; modify `server/requirements.txt`, `server/tests/test_k3_evidence_store.py`.

**Interfaces:** `canonicalizeJson(value)->string`; async `fingerprintEvent(event)->hex SHA-256`; Python uses `rfc8785.dumps` + SHA-256.

- [ ] Write failing RFC vectors + JS/Python hash parity fixture; pin `rfc8785==0.1.4`.
- [ ] Run RED Node/Python fingerprint tests.
- [ ] Implement browser-safe JCS + crypto helper.
- [ ] Run GREEN and cross-language parity.
- [ ] Commit `feat: add canonical K3 event fingerprints`.

### Task 7: EvidenceStore port/conformance harness
**Files:** create `src/evidence/storePort.js`, `tests/fixtures/k3/store-conformance.json`, `tests/helpers/k3StoreConformance.js`, `tests/k3-store-port.test.js`.

**Interfaces:** store requires `accept`, `acceptBatch`, `getById`, `read`.

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

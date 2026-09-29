# K3 Learner Evidence Engine — Implementation Plan Self-Review

**Date:** 2026-09-29  
**Programme:** K3 — Learner Evidence Engine  
**Plan:** `docs/superpowers/plans/2026-09-29-k3-learner-evidence-engine.md`  
**Spec:** `docs/superpowers/specs/2026-09-29-k3-learner-evidence-engine-design.md`  
**Design branch:** `design/k3-learner-evidence-engine`  
**Base main:** `3c296632a54f68f0ecc7ad122298d9661706cb2b`

## 1. Structural review

Result: **PASS**

Verified:
- 41 sequential tasks, numbered 1–41;
- 205 task checkboxes = exactly 5 steps per task;
- every task has an explicit **Files** block;
- every task has an explicit **Interfaces** block;
- no TBD/TODO/FIXME/PLACEHOLDER markers;
- plan length remains below the normative spec length and does not transcribe implementation bodies;
- branch diff remains documentation-only at the planning gate.

## 2. Spec coverage

Result: **PASS**

The plan explicitly covers all named K3 logical contracts:
- EventDefinitionV2;
- LearnerEvidenceEventV2;
- EvidenceStorageReceiptV1;
- EvidenceBatchResultV1;
- EvidenceOutboxRecordV1;
- ActivityProjectionV1;
- AttemptProjectionV1;
- LearnerIdentityLinkRecordV1;
- EvidenceExportRecordV1;
- EvidenceStore;
- EvidenceSync;
- authorization/identity resolver;
- legacy LearnerEventV1 reader;
- RuntimeBundleV4 evidence context;
- AssessmentFormSnapshot linkage;
- xAPI/Caliper mappings.

It also covers:
- origin_seq and store_seq ordering;
- optimistic strict-assessment revision;
- correction/supersession;
- local-first IndexedDB;
- outbox/retry;
- privacy lifecycle;
- replay/integrity;
- Product Analytics/System Telemetry separation;
- migration honesty;
- full acceptance/whole-plan review/exact-head/post-merge gates.

## 3. Self-review findings and fixes

### P1 — RuntimeBundle versioning

**Finding:** the first plan draft described adding evidence context to RuntimeBundleV3, which would silently change an inherited public contract.

**Fix:** Task 4 now introduces **RuntimeBundleV4** for tracks declaring the K3 capability while preserving older bundle readers.

Status: **RESOLVED**

### P2 — Browser JSON-schema drift risk

**Finding:** the browser has no runtime Ajv bundle. Handwritten validators would reproduce the existing LearnerEventV1 JSON-Schema/JS/Python drift.

**Fix:** Task 5 now generates browser-safe ES-module validators from canonical JSON Schemas using Ajv standalone and verifies generated output freshness/determinism.

Status: **RESOLVED**

### P3 — RFC 8785 reinvention risk

**Finding:** a handwritten browser JCS implementation would violate reuse-before-build and create cross-language hash risk.

**Fix:** Task 6 reuses the reviewed `canonicalize@5.1.0` implementation in a checked-in compatibility module with attribution and compares it against Python `rfc8785==0.1.4` through shared vectors.

Status: **RESOLVED**

### P4 — Review Focus task ownership drift

**Finding:** early review-focus references pointed at stale task numbers after plan expansion.

**Fix:** the five Review Focus lines now point to the actual owning tasks.

Status: **RESOLVED**

### P5 — Server authorization signature was implicit

**Finding:** fail-closed sync policy existed, but the app construction seam was not explicit enough for an implementer.

**Fix:** Task 14 pins `create_app(db_url=None, learner_auth=None)` with a deny-by-default resolver and injectable test resolver.

Status: **RESOLVED**

### P6 — DOM-heavy app integration testing

**Finding:** directly testing private functions in `src/app.js` would either require brittle DOM harnessing or weak source-text tests.

**Fix:** Task 29 introduces pure `appBridge.js` orchestration functions and keeps `src/app.js` as the thin caller.

Status: **RESOLVED**

### P7 — Exact-head verification self-invalidating commit

**Finding:** committing the verification record after tests changes HEAD.

**Fix:** Task 39 distinguishes the tested product-code HEAD from the documentation-only verification commit and requires configured CI/status checks to pass on the final branch HEAD with no further changes before integration.

Status: **RESOLVED**

### P8 — Contract names were implied rather than explicit in several tasks

**Fix:** Task 2, Task 7, Task 23, and Task 25 now name the exact versioned contracts they produce/use.

Status: **RESOLVED**

## 4. Five Review Focus failure modes

Result: **PASS**

1. Browser crash/storage pressure before acknowledgement — Tasks 10–13.
2. Exact retry versus event-ID/body collision — Tasks 6–13.
3. Competing devices in one strict mock — Tasks 18, 21, 29.
4. Privacy erasure after projection/export — Tasks 20–25.
5. Legacy/import records lacking K3 context — Tasks 24, 26, 32, 33.

Each has explicit tests in its owning task.

## 5. Type/interface consistency

Result: **PASS**

Dependency order is coherent:
- schemas/definitions before constructors;
- constructors/fingerprint before stores;
- stores/outbox before sync;
- sync store before API transport;
- authority/corrections before projections;
- projections before runtime app integration;
- canonical evidence before standards adapters;
- all components before acceptance/review/merge gates.

No later task references an interface that is not introduced by an earlier task.

## 6. Scope/YAGNI review

Result: **PASS**

The plan deliberately does **not** add:
- Kafka;
- KurrentDB/EventStoreDB;
- CRDT framework;
- custom LRS;
- microservices;
- vector database;
- warehouse;
- browser bundler;
- K4/K5/K6/K8 intelligence.

New infrastructure is limited to the commodity pieces required by the approved K3 spec:
- IndexedDB reference adapter;
- SQLite/JSONL parity;
- authenticated sync ports;
- generated browser validators;
- standards adapters.

## 7. Public/private boundary review

Result: **PASS**

Task 35 requires an allowlisted public K3 asset set and continues to exclude:
- `data/factory`;
- server-side identity links;
- privacy/export ledgers;
- administrative correction metadata not required by the browser;
- `src/platform-kernel`;
- private source/review/calibration artifacts.

Runtime evidence context is additive, minimal, and release-linked.

## 8. Verification gate design

Result: **PASS**

The plan preserves:
- TDD per task;
- systematic debugging on unexpected failure;
- phase checkpoints;
- whole-plan review;
- zero open Critical/Important findings before integration;
- exact product-code HEAD verification;
- CI on final branch HEAD;
- finishing-development-branch gate;
- post-merge verification before K4.

## 9. Plan status

**READY FOR EXPLICIT USER APPROVAL AND EXECUTION-METHOD SELECTION.**

No production source, schema, dependency, or test implementation has been changed on the design branch.

Recommended execution mode for this plan: **Native / superpowers:executing-plans**, because the 41 tasks are strongly dependency-ordered and share evolving contracts; keeping one implementation context reduces interface drift while the plan/checkpoints provide durable recovery. Whole-branch independent review remains mandatory before merge.

Subagent-driven execution remains valid if the user prefers maximum per-task independent review at higher context/tool cost.

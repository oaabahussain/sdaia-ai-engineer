# K3 Learner Evidence Engine — Written Spec Self-Review

**Date:** 2026-09-29  
**Programme:** K3 — Learner Evidence Engine  
**Spec:** `docs/superpowers/specs/2026-09-29-k3-learner-evidence-engine-design.md`  
**Design branch:** `design/k3-learner-evidence-engine`  
**Base main:** `3c296632a54f68f0ecc7ad122298d9661706cb2b`

## 1. Review scope

This is the required architectural written-spec self-review before user approval.

It reviews:

1. placeholder/incomplete text;
2. internal consistency;
3. K3 scope boundary;
4. ambiguous requirements;
5. research-matrix coverage;
6. compatibility with inherited K1/K2 contracts;
7. migration honesty;
8. repository-change scope.

No implementation/code review is claimed because K3 production implementation has not started.

## 2. Placeholder scan

Result: **PASS**

The spec contains no:
- TBD;
- TODO;
- FIXME;
- PLACEHOLDER;
- "to be determined";
- "to be decided".

Deliberately deferred calibration/deployment values are listed explicitly in Section 48 and are not placeholders in architecture.

## 3. Internal consistency findings and fixes

### Finding S1 — payload schema versus property governance could diverge

Initial wording did not specify which contract owns nested payload validation versus privacy/export metadata.

**Fix:** Section 7.3 now makes:
- `payload_schema_ref` authoritative for nested structure;
- EventDefinition properties authoritative for governance/privacy/export;
- registration invalid when names/top-level types disagree.

Status: **RESOLVED**

### Finding S2 — assessment submission versus generic activity completion was ambiguous

Initial wording could be read as requiring both `learner.assessment.submitted` and `learner.activity.completed` for every mock/section.

**Fix:** Section 10.2 now states that assessment submission is authoritative for submitted attempt state and generic activity completion is optional unless the product has a distinct post-submission completion state.

Status: **RESOLVED**

### Finding S3 — authority identity was duplicated

Initial event descriptions repeated `authority_ref` inside payload while the envelope already provided an authority field.

**Fix:** authority-sensitive events now require envelope `authority_ref`; payloads do not carry a second independently mutable authority value.

Status: **RESOLVED**

### Finding S4 — import adapters could have been interpreted as fabricating local context

The conceptual design allowed an importer origin for records without native K3 origin fields, but did not explicitly prohibit invented local content/activity mappings.

**Fix:** Section 35 now permits canonical import only when required learner/activity/track/release/content context can be mapped without invention. Otherwise import must reject/abstain or stage external evidence separately.

Status: **RESOLVED**

### Finding S5 — browser persistence request was advisory rather than deterministic

The first spec draft used "should request" language for persistent browser storage.

**Fix:** Section 17 now requires the adapter to attempt persistent storage when retaining unsynchronized learner evidence and the API is available, unless an explicit deployment/privacy policy disables it. Browser denial remains non-fatal but observable.

Status: **RESOLVED**

### Finding S6 — export deletion history could be overwritten

The first export-ledger wording contained a mutable deletion status.

**Fix:** Section 36 now defines append-only export lifecycle records with EXPORTED / DELETE_REQUESTED / DELETED / DELETION_UNSUPPORTED / DELETION_FAILED actions.

Status: **RESOLVED**

### Finding S7 — exact retry receipt time was ambiguous

The first receipt wording did not state whether a DUPLICATE retry returned the original acceptance metadata or retry time.

**Fix:** Section 14 now requires DUPLICATE to return the original fingerprint, accepted_at, and store_seq. Retry observation remains transport/telemetry metadata.

Status: **RESOLVED**

### Finding S8 — current AR/EN locale could accidentally become a platform constant

**Fix:** Section 8.7 now requires locale validation against the active TrackManifest/content contract rather than hard-coding the reusable core permanently to AR/EN.

Status: **RESOLVED**

### Finding S9 — correction application in projections needed an explicit rule

**Fix:** Section 29 now requires current-valid projections to resolve VOID/SUPERSEDE chains and to remain incomplete/conflicted when correction chains are unresolved, cyclic, or unauthorized.

Status: **RESOLVED**

### Finding S10 — privacy erasure could leave learner-linkable hashes/receipts undeclared

**Fix:** Section 23 now explicitly brings fingerprints, receipts, export records, and projection caches under privacy lifecycle policy where they remain learner-linkable.

Status: **RESOLVED**

## 4. Scope check

Result: **PASS**

The spec remains one K3 subsystem:

- raw learner evidence;
- integrity;
- synchronization;
- persistence;
- replayable projections;
- identity/privacy governance;
- interoperability.

It does not implement:

- K4 scheduling/NBA;
- K5 mastery/readiness;
- K6 psychometrics;
- K7 tutor behavior;
- K8 CAT.

The written spec is large but cohesive enough for one K3 implementation programme with many staged tasks. It does not require splitting into a different product programme.

## 5. Conceptual-gate coverage

| Required design-gate question | Spec coverage | Result |
|---|---|---|
| Canonical raw evidence unit | §§5, 8, 10 | PASS |
| Event stream vs attempt record | §§5, 29 | PASS — event stream canonical, projections derived |
| What is immutable | §§6, 13, 21 | PASS |
| Correction representation | §§10.12, 21 | PASS |
| Event identification/idempotency | §§8, 13–15 | PASS |
| Offline synchronization | §§17–20 | PASS |
| Multi-device conflicts | §16 | PASS |
| Ordering representation | §§8.6–8.7, 15, 20 | PASS |
| Learner/origin/activity identities | §§8–9, 22, 34 | PASS |
| Exact content snapshot linkage | §12 | PASS |
| Local versus server | §§17–19, 34 | PASS |
| Privacy model | §§22–23, 36, 38 | PASS |
| Persistence/query model | §§27–29, 41 | PASS |
| Browser/file/SQLite/API equivalence | §40 | PASS |
| Raw versus K4/K5/K6 derived models | §§2–3, 29–30, 49 | PASS |
| Standards/interoperability | §§35–36 | PASS |
| Reuse instead of rebuilding | §§7, 24–28, 35, 42 | PASS |

## 6. Research-matrix coverage

The spec covers all foundational research groups from the expanded K3 matrix:

- exposure / response / skip semantics;
- answer changes;
- multiple attempts;
- timing/latency;
- confidence;
- hints;
- explanations;
- mode semantics;
- sessions/abandonment boundary;
- offline capture/sync;
- idempotency;
- duplicate prevention;
- out-of-order/late evidence;
- clock skew;
- correction/supersession;
- identity and multi-device;
- privacy/minimization/retention boundary;
- release/form/family/item/objective/domain linkage;
- cross-language evidence;
- provenance/authority;
- persistence/query;
- data quality;
- schema migration;
- replay;
- auditability;
- interoperability/xAPI/Caliper/QTI;
- event-sourcing scope;
- telemetry/analytics separation;
- experiment linkage;
- future K4/K5/K6/K8 compatibility;
- response versus evaluation;
- strict-assessment authority;
- transport state versus evidence;
- privacy erasure versus immutability;
- legacy migration honesty.

Exact deployment calibration values intentionally remain deferred and versioned.

## 7. Resolved research choices

The written spec converts the remaining conceptual choices into explicit decisions:

| Research choice | Written-spec decision |
|---|---|
| Strict assessment concurrency | Optimistic attempt revision preconditions + explicit APPLIED/STALE/REJECTED resolution event |
| Activity pause/resume | Deferred from required K3 v1 |
| Canonical envelope | Fixed in Section 8 |
| Correction model | VOID/SUPERSEDE reference event |
| Identity linking | Append-only LearnerIdentityLinkRecordV1 outside raw evidence store |
| SQL indexes | Minimum logical index/constraint set in Section 28.2 |
| Event ID | Opaque UUIDv4 for new K3 runtime identities |
| Exact xAPI Profile URIs | Deferred deployment/interoperability mapping input; adapter contract remains normative |
| Retention duration | Deferred legal/deployment policy; retention class remains mandatory |

## 8. Migration honesty check

Result: **PASS**

The spec explicitly forbids:

- exploding LearnerEventV1 into invented fine-grained history;
- filling missing legacy answer/confidence values;
- generating fake presentation/hint/answer-change history;
- synthesizing StateV2 fine-grained historical events;
- fabricating local activity/release/item/objective context during standards import.

Legacy V1 validator drift is handled as migration compatibility without redefining the V1 JSON Schema.

## 9. Compatibility check

Result: **PASS**

The spec preserves:

- K1/K2 content/release identities;
- AssessmentFormSnapshotV1;
- StateV2 active-attempt compatibility;
- current learner-visible bank;
- AR/EN behavior for the current track while keeping the core locale-generic;
- browser/API/offline guarantees;
- K2 Product Analytics and Telemetry ports as separate planes;
- existing LearningEventExchangePort as the interoperability seam.

## 10. Repository scope verification target

The design branch must remain documentation-only until this spec is explicitly approved.

Expected branch-only artifacts at this gate:

- research artifacts;
- research checkpoint;
- this written spec;
- this self-review.

There must be no:
- K3 production source change;
- K3 schema implementation;
- K3 test implementation;
- implementation plan;
- dependency installation;
- learner-visible runtime change.

## 11. Remaining non-blocking uncertainties

These are deliberately policy/deployment concerns and do not change K3 topology:

- legal/deployment retention durations;
- retry/backoff numeric values;
- batch-size numeric values;
- clock/anomaly thresholds;
- production authentication provider;
- production database beyond approved reference adapters;
- xAPI LRS vendor/profile URI;
- analytics vendor;
- cross-border deployment configuration.

They must not be silently converted into hard-coded implementation constants.

## 12. Self-review outcome

**Written spec status: READY FOR EXPLICIT USER REVIEW/APPROVAL.**

No unresolved Critical or Important specification contradiction was found after the fix pass above.

This outcome authorizes no implementation.

Next gate after explicit approval:
- invoke `writing-plans`;
- write the K3 implementation plan;
- return for plan approval and execution-method selection.

# K3 Learner Evidence Engine — Conceptual Architecture Proposal

Date: 2026-09-29  
Status: **PROPOSED FOR CONCEPTUAL APPROVAL**  
Programme: K3 — Learner Evidence Engine  
Base: `main@3c296632a54f68f0ecc7ad122298d9661706cb2b`  
Research branch: `research/k3-learner-evidence-landscape`

> This document is architecture discussion, not the normative K3 written spec and not an implementation plan. Production code is not authorized by this proposal.

## 1. Decision statement

K3 should use a **hybrid learner-evidence architecture**:

```
Learner interaction
      |
      v
Bounded governed LearnerEvidenceEvent stream
      |
      +--> local durable EvidenceStore + outbox
      |          |
      |          v
      |      at-least-once sync
      |          |
      |          v
      +--> authoritative EvidenceStore
                 |
                 +--> immutable evidence history
                 +--> storage receipts / replay cursor
                 +--> correction & evaluation evidence
                 |
                 +--> rebuildable projections
                 |      - AttemptProjection
                 |      - ActivityProjection
                 |      - later K4/K5/K6/K8 inputs
                 |
                 +--> governed export adapters
                        - xAPI / LRS
                        - Caliper
                        - sanitized Product Analytics bridge

Product Analytics and System Telemetry remain separate planes.
```

Canonical K3 truth is the immutable governed event history, **not** an attempt row, analytics warehouse, LRS, mastery score, or browser state object.

## 2. Scope boundary

### K3 owns

- raw/versioned learner evidence;
- event definitions and semantic integrity;
- local durable capture;
- offline/outbox synchronization;
- idempotent ingestion;
- per-origin and store ordering metadata;
- late/out-of-order evidence;
- explicit correction/supersession;
- response evaluation evidence;
- learner/origin/activity/attempt correlation;
- exact content/release/form/item linkage;
- persistence/query ports and parity;
- replayable projections;
- privacy/minimization/lifecycle hooks;
- data-quality/integrity monitoring;
- standards/export adapters.

### K3 does not own

- mastery;
- readiness;
- spaced-repetition schedule;
- next-best-action;
- calibrated item difficulty;
- IRT/psychometric parameters;
- CAT selection;
- causal learning conclusions;
- product funnels/session replay;
- system traces/metrics/logs.

## 3. Architecture invariants

1. **Raw evidence != derived truth.**
2. Accepted evidence is application-immutable.
3. Corrections append; they do not silently rewrite.
4. Privacy erasure/de-linking is a separately authorized lifecycle, not an ordinary correction.
5. The same event ID can be retried safely.
6. Same ID + different canonical body is an integrity conflict.
7. Different event IDs are not heuristically deleted as duplicates.
8. Offline-created evidence is first-class.
9. Client time is evidence, not global order.
10. Global ordering is never inferred from wall-clock timestamps.
11. Stable existing content/release/form/item IDs are reused.
12. Product analytics, learner evidence, and system telemetry are separate planes.
13. External standards/vendors are adapters, never the canonical internal model.
14. Historical evidence migration never invents facts that were not observed.
15. Derived projections are rebuildable and versioned.

## 4. Governed event-definition layer

Reuse K2's `EventDefinitionV1` governance concept rather than creating a parallel registry.

Conceptual evolution:
- a versioned event definition declares its plane/purpose;
- learner-evidence definitions retain:
  - stable event name/version;
  - purpose;
  - owner;
  - trigger semantics;
  - required/optional properties;
  - property privacy class;
  - retention class;
  - producer;
  - compatibility/migration semantics.

Existing K2 product events remain valid.

The learner-evidence validator and store are distinct from the current analytics-export path. The current AnalyticsSink remains an export destination only.

## 5. Canonical source event

Working logical shape:

```text
LearnerEvidenceEvent
  schema_version
  event_id                 # opaque UUIDv4 in K3 v1
  definition_id            # governed event definition + version
  learner_id               # pseudonymous principal
  origin_id                # random application/browser-profile origin
  origin_seq               # monotonic within origin

  activity_id              # explicit learning/practice/check/section/mock workflow
  assessment_attempt_id?   # only when an actual assessment attempt exists
  item_interaction_id?     # one item presentation/interaction lifecycle

  track_id
  content_release_id
  form_id? / snapshot_ref?
  question_family_id?
  item_version_id?
  objective_id?
  domain_id?
  mode
  locale

  occurred_at              # source wall-clock evidence
  elapsed_ms?              # monotonic elapsed measurement where relevant

  producer
  actor_kind / authority_ref?
  experiment_assignment_ref?

  payload                  # event-type-specific governed properties
```

Important:
- direct account PII is not part of this envelope;
- `attempt_number` is not event identity;
- `correct` is not required on learner response events;
- event IDs do not imply order.

Exact field names remain subject to written-spec approval after this conceptual gate.

## 6. Bounded event vocabulary

### Learner-originated / interaction evidence

- activity started;
- activity paused/resumed when explicitly observable and semantically useful;
- activity completed;
- assessment submitted;
- item presented;
- item explicitly skipped;
- response recorded/changed;
- confidence recorded when elicited;
- hint requested;
- explanation opened/presented.

### System/evaluator/governance evidence

- response evaluated under an exact scoring/item policy;
- correction/supersession/void of prior evidence.

### Not raw K3 events

- inferred abandonment;
- inferred unanswered;
- page view/menu click;
- generic navigation;
- product session replay;
- system logs/traces;
- mastery/readiness/weakness;
- rapid-guess labels;
- psychometric outputs.

## 7. Attempt and item semantics

### Stable identity hierarchy

```
learner_id
  -> origin_id
  -> activity_id
       -> assessment_attempt_id? 
       -> item_interaction_id?
            -> event_id
```

- one learner may have many origins;
- one activity may contain many item interactions;
- a strict assessment has an explicit attempt ID;
- multiple response events may occur inside one item interaction;
- attempt number is a projection/policy attribute;
- sessionization is a projection, not foundational identity.

## 8. Response and evaluation separation

```
learner.response.recorded
      |
      | references exact item/render/form
      v
learner.response.evaluated
      |
      | scoring_policy_version
      | evaluator authority
      | outcome / score / correctness where applicable
      v
AttemptProjection
```

Benefits:
- regrade without rewriting learner behavior;
- scoring-policy changes are auditable;
- ungraded/partially graded item types remain possible;
- K6 can consume response evidence without trusting an obsolete derived boolean.

## 9. Source time, origin order, and trusted storage order

Do not use one timestamp for all meanings.

### Source event carries

- `occurred_at`;
- `origin_id`;
- `origin_seq`;
- monotonic elapsed duration where applicable.

### Store produces a separate receipt

```text
EvidenceStorageReceipt
  store_id
  event_id
  event_fingerprint
  accepted_at
  store_cursor
  disposition
```

The source event is not mutated to add server metadata.

`store_cursor` is opaque and monotonic only inside that store. Cross-store/global causal order is not claimed.

## 10. Canonical fingerprint and idempotency

The accepting store computes:

```
canonical = JCS(event)          # RFC 8785
event_fingerprint = SHA-256(canonical)
```

Acceptance:
- unknown ID -> ACCEPTED;
- known ID + same fingerprint -> DUPLICATE/ack;
- known ID + different fingerprint -> CONFLICT;
- invalid schema/privacy/reference -> REJECTED.

Fingerprint is not authentication and does not cause heuristic dedup across different event IDs.

## 11. Offline-first capture and synchronization

### Local-first write path

```
user action
  -> construct governed event
  -> atomically allocate origin_seq + persist event locally
  -> enqueue transport metadata
  -> UI may continue
```

### Sync path

```
local outbox
  -> send batch
  -> server validates each event
  -> server returns per-event disposition/receipt
  -> client marks ACCEPTED/DUPLICATE complete
  -> CONFLICT/REJECTED remain recoverable
```

### Browser

- IndexedDB is the primary browser adapter.
- Request persistent storage where appropriate.
- Monitor storage quota/risk.
- Background Sync/Workbox may accelerate retries but is never required for correctness.
- Do not intentionally expire unsynchronized evidence with a hidden TTL.

## 12. Multi-device rules

### Ordinary learn/practice

Different valid event IDs from different devices are separate facts, even when they concern the same item.

### Same strict frozen assessment attempt

Separate:
1. **evidence preservation** — preserve all valid actions;
2. **authoritative attempt state** — assessment policy selects/accepts/rejects writes through explicit concurrency control.

No latest-timestamp-wins.

The exact concurrency mechanism may be:
- attempt revision precondition;
- question-level sequence/revision;
- writer epoch/lease/handoff;

but must be explicit, versioned, and auditable.

K3 records the evidence and resolution; the assessment engine owns assessment-authority policy.

## 13. Corrections and supersession

Ordinary corrections append a new governed event referencing:
- target event ID;
- correction kind;
- reason;
- authority;
- created/occurred time;
- replacement/superseding fact if applicable.

Current-valid views resolve correction chains in projections.

The original remains in ordinary audit history.

Privacy deletion/de-linking is handled through the privacy lifecycle and may physically remove or irreversibly de-identify data according to policy/law.

## 14. Identity and privacy

### IDs

- `learner_id`: pseudonymous learner principal;
- `origin_id`: random app/profile origin, not fingerprint;
- authentication/account ID: separate identity service/table;
- optional identity-link records map prior anonymous principals/origins after explicit account linking.

### Do not collect in canonical evidence by default

- name;
- email;
- phone;
- raw IP;
- access/session token;
- raw browser fingerprint;
- arbitrary free text;
- unnecessary User-Agent/device details.

### Governance

Reuse property-level privacy classification and retention classes.

Retention duration is deployment/versioned policy, not a K3 constant.

## 15. Content and assessment binding

Reuse exact existing identifiers.

Every applicable event binds to:
- track;
- content release;
- QuestionFamily;
- ItemVersion;
- objective/domain;
- locale;
- mode.

Assessment evidence additionally binds to:
- AssessmentFormSnapshot;
- exact option order/render context;
- exam/scoring policy versions;
- stable assessment attempt ID.

Learning/practice events do not fabricate a form ID when no form exists.

## 16. Persistence ports

Conceptual port:

```text
EvidenceStore
  accept(event) -> EvidenceStorageReceipt
  acceptBatch(events) -> per-event receipts
  getById(event_id)
  read(cursor/filter) -> events + next_cursor
```

Exact method names remain spec work.

### Adapters

- browser: IndexedDB;
- reference/file: JSONL + side indexing where required;
- local/server: SQLite;
- future production server: PostgreSQL adapter if measured requirements justify it.

No Kafka, KurrentDB, remote event bus, warehouse, or CRDT engine is required for K3 v1.

## 17. Query and projection layer

Raw store is optimized for integrity/replay; learner features consume projections.

Initial rebuildable views:
- AttemptProjection;
- ActivityProjection;
- item exposure/response history;
- evidence indexes required by K4/K5/K6/K8.

Every projection records:
- projection type/version;
- source store ID;
- input watermark/cursor;
- algorithm/policy version;
- content/scoring references needed for interpretation.

Late-arriving events advance/rebuild projections deterministically.

## 18. Session and abandonment semantics

- explicit activity scopes are durable;
- browser visibility/pause/resume signals may be recorded only when truly observed;
- session grouping is a projection;
- inactivity timeout is versioned configuration;
- abandonment is derived from absence/incomplete lifecycle under a named policy.

K3 never invents a raw "abandoned" fact from silence.

## 19. Cross-language semantics

- actual locale is preserved;
- exact item version is preserved;
- shared family ID allows later cross-language aggregation;
- Arabic/English attempts remain separate evidence facts;
- later models decide whether/how to combine sibling-language evidence.

## 20. Data-quality and integrity

Deterministic failures:
- invalid schema/version;
- duplicate ID with different body;
- broken required reference;
- invalid origin sequence;
- orphan/unauthorized correction;
- stale strict-assessment mutation when policy requires a revision;
- privacy-governance violation;
- projection watermark regression.

Observed flags, not automatic invalidation:
- late arrival;
- clock divergence;
- unusually short/long elapsed time;
- duplicate-looking separate events;
- incomplete activity lifecycle.

Thresholds remain policy/calibration data.

## 21. Three-plane architecture

```
              +-----------------------+
              | Learner Evidence      |
              | durable / replayable  |
              +-----------+-----------+
                          |
                 governed export/refs
                          |
          +---------------+---------------+
          |                               |
          v                               v
+---------------------+        +----------------------+
| Product Analytics   |        | System Telemetry     |
| funnels/UX/flags    |        | logs/metrics/traces  |
+---------------------+        +----------------------+
```

An analytics event may be derived/exported from learner evidence only through an explicit governed bridge that applies minimization/redaction.

Analytics never feeds back as raw learner truth merely because it shares an ID.

## 22. Interoperability

### xAPI 2.0

Adapter/export target:
- Actor, Verb, Object, context/registration, Result, timestamp.
- external LRS handles its own `stored` semantics.
- use ADL/IEEE conformance tests for the adapter/LRS path.

### Caliper 1.2

Adapter/export target for assessment:
- AssessmentEvent;
- AssessmentItemEvent;
- Attempt;
- Response;
- explicit Started/Skipped/Completed semantics.

### QTI 3

Assessment content/result/scoring exchange, not K3 raw-event persistence.

### External LRS

Optional deployment adapter through `LearningEventExchangePort`.
Do not build a custom LRS.

## 23. Legacy migration

### LearnerEventV1

Do not explode a historical aggregate into fake fine-grained events.

Options allowed in the written spec:
- preserve/read V1 alongside V2;
- or import into one explicitly labeled legacy aggregate evidence type.

In either case:
- retain original event ID/payload or immutable source reference;
- retain migration provenance;
- declare granularity limitations.

### StateV2 history

Migrate only recorded facts from active/history exam state.
No invented timestamps, exposure events, answer-change history, or hint events.

## 24. Conformance strategy

One golden cross-adapter corpus must be authoritative for:
- JSON/schema validation;
- browser IndexedDB;
- JSONL/file;
- SQLite;
- API/server;
- future PostgreSQL.

Corpus scenarios include:
- normal event;
- offline event;
- exact retry;
- ID/body conflict;
- partial batch;
- late arrival;
- out-of-order event;
- answer change;
- correction;
- strict-attempt stale write;
- privacy rejection;
- legacy migration.

This directly prevents recurrence of the current LearnerEventV1 JS/Python/JSON-Schema parity drift.

## 25. Reuse versus build

### Reuse

- existing K2 EventDefinition/privacy/retention governance;
- existing content/release/form IDs;
- existing interoperability port;
- browser IndexedDB and Storage API;
- SQLite/JSONL adapters;
- JCS + SHA-256;
- xAPI/Caliper/QTI standards through adapters;
- external conformant LRS when needed;
- OTel for system telemetry;
- product analytics/feature-flag adapters for their own plane.

### Build as K3-specific core

- bounded learner-evidence semantics;
- source event envelope;
- storage receipt/idempotency contract;
- local evidence/outbox behavior;
- assessment/evidence reference model;
- response/evaluation separation;
- correction semantics;
- identity-link governance;
- projection/replay contract;
- cross-adapter conformance corpus.

## 26. What remains configurable/deferred

Do not hard-code:
- session timeout;
- clock-skew alert threshold;
- anomaly thresholds;
- batch size;
- retry backoff;
- offline retention duration;
- privacy retention duration;
- strict-assessment lease/revision timeout;
- index/partition thresholds;
- xAPI Profile identifiers not yet approved;
- analytics export retention;
- storage quota warning threshold.

## 27. Decision-ready open choices

These do **not** change the topology and can be resolved in the written spec after conceptual approval:

1. whether activity pause/resume are K3 v1 events or deferred;
2. exact field names in the canonical envelope;
3. exact strict-assessment concurrency token mechanism;
4. whether correction is one generalized event or a small typed family;
5. exact IdentityLink contract;
6. exact xAPI verb/profile and Caliper mapping tables;
7. minimum initial SQL indexes based on expected queries;
8. exact retention-policy identifiers.

## 28. Acceptance of this conceptual architecture means

Approval authorizes the next gate only:

1. write the normative K3 design/spec;
2. self-review the spec against the complete research matrix;
3. return for **explicit written-spec approval**.

It does **not** authorize:
- production implementation;
- implementation plan;
- TDD execution;
- merge;
- changing learner-visible behavior.


# K3 Learner Evidence Engine — Landscape Research

Date: 2026-09-29  
Programme: K3 — Learner Evidence Engine  
Stage: RESEARCH / ARCHITECTURAL DESIGN  
Branch: `research/k3-learner-evidence-landscape`  
Base: `main@3c296632a54f68f0ecc7ad122298d9661706cb2b`

> This is a research artifact, not an approved K3 spec. No production implementation is authorized by this document.

## 1. Research framing

K3 owns durable learner evidence, integrity, synchronization, persistence, replayability, and standards/export seams.

K3 does **not** own mastery, readiness, next-best-action, spaced-repetition scheduling, psychometric calibration, IRT ability, CAT selection, or causal learning claims.

Core inherited invariant:

```
raw evidence != derived truth
```

## 2. Current repository baseline

### Existing strengths

- `LearnerEventV1` already rejects mastery/readiness-style derived fields.
- JSONL learner-event persistence is append-only and rejects duplicate `event_id`.
- SQLite persists `learner_events` with `event_id` as a primary key.
- Evidence binds to track, content release, form, QuestionFamily, ItemVersion, objective, and domain.
- K2 already provides product-event governance, privacy/data-minimization boundaries, and vendor-neutral analytics/telemetry ports.
- The architecture constitution already rejects blind last-write-wins for learner history and requires stable IDs, idempotency, ordering, duplicate handling, and offline replay.

### Current gaps confirmed from live main

1. `LearnerEventV1` is a completed-question aggregate; it cannot faithfully represent:
   - exposure without answer;
   - explicit skip;
   - interruption/abandonment;
   - answer changes and their order;
   - hint/explanation ordering;
   - late-arriving partial evidence;
   - correction/supersession history.

2. There is validator parity drift:
   - JSON Schema requires `answer` and `confidence`.
   - JS runtime validator does not require either.
   - Python runtime validator requires `answer` but not `confidence`.
   This is inherited contract duplication risk, not yet classified as a K2 regression.

3. Current deduplication is only `event_id` collision rejection. It does not distinguish:
   - exact retry of the same immutable event;
   - same ID with a different body;
   - legitimate repeated interactions with the same question.

4. Current evidence has client occurrence timestamps but no distinct ingestion/observation time, origin sequence, or synchronization provenance.

5. Current JSONL query path scans the full file; current SQLite indexes are only track/time and item/time.

6. Existing generic `/v1/events` is product analytics, not learner evidence. It must not become the K3 canonical record by accident.

## 3. Source-map coverage

Independent source classes used so far:

1. Standards: IEEE xAPI 2.0 / xAPI Profiles / 1EdTech Caliper / QTI.
2. Mature education implementations: Open edX / Canvas / Moodle / Anki.
3. Event/telemetry implementations: OpenTelemetry / Snowplow / PostHog.
4. Offline-first/sync implementations: IndexedDB / RxDB / PowerSync.
5. Event-store/database patterns: Microsoft Event Sourcing / KurrentDB / PostgreSQL.
6. Privacy/legal guidance: Saudi PDPL / W3C / OWASP.
7. Peer-reviewed research: learning analytics privacy, confidence/metacognition, response-time validity, feedback, answer changing.
8. Community/support failure signals: Anki sync loss; PostHog duplicate/session issues.

Research is sufficiently triangulated for the foundational K3 decisions below, but the complete 50-point matrix still has open items.

## 4. Foundational cluster A — canonical raw evidence unit

### Current state

`LearnerEventV1` is one aggregate completed-question record.

### Mature/standard patterns

- xAPI treats Statements as immutable evidence of experiences and provides voiding rather than mutation.
- Caliper separates Assessment/AssessmentItem `Started`, `Skipped`, `Completed`, `Submitted`, etc.
- Canvas stores captured quiz-submission events such as `question_answered` as an event sequence scoped to a submission attempt.
- Open edX has versioned learning-domain exam-attempt events and separate tracking/analytics events.

### Known failure of aggregate-only

Aggregate-only cannot preserve partial or abandoned interactions and cannot distinguish a learner who never saw an item from one who saw it, skipped it, answered it, changed it, or requested help.

### Options

A. One aggregate record per attempt.  
B. Fine-grained event stream only.  
C. Fine-grained immutable raw events + rebuildable attempt projection.

### Research recommendation

**Option C — hybrid.**

Canonical source of truth:
`LearnerEvidenceEventV1` fine-grained immutable evidence.

Derived/query convenience:
`AttemptProjectionV1` (working name), rebuildable from raw evidence and explicitly non-authoritative.

Do not make the projection a second truth.

Confidence: **High**.

## 5. Foundational cluster B — event vs attempt semantics

### Proposed minimum evidence vocabulary for further design

The exact names are not approved, but evidence classes should distinguish at least:

- item/question exposed;
- response recorded/submitted;
- explicit skip;
- confidence recorded;
- hint requested;
- explanation opened;
- attempt started/completed/submitted where a real attempt boundary exists;
- explicit learner/system interruption where observable;
- correction/void/supersession event.

Do **not** create learner-evidence events for every UI click. Generic page views and feature opens belong to Product Analytics.

### Important semantic rulings from evidence

- A skip is not the same as an attempt. Caliper explicitly does not increment attempt count for `Skipped`.
- An unanswered item must remain distinguishable from a missing event.
- Answer changes must remain observable; assessment literature does not support assuming the first answer is inherently more valid.
- Confidence is self-report/metacognitive evidence, not correctness or mastery.
- Hint/explanation exposure can be useful evidence, but its presence must not be interpreted as deficiency/mastery by K3.

Confidence: **High** on separation; **Medium** on final vocabulary names.

## 6. Foundational cluster C — correctness/evaluation

### Problem

Current `LearnerEventV1` stores learner response and `correct` in the same record.

### Evidence

QTI separates response representation from response processing/scoring. Open edX also emits server-side checked/graded events and records grading/content versions.

### Research recommendation

Separate:

1. learner behavior evidence: response submitted/changed;
2. evaluation evidence: response evaluated under an exact scoring/item policy version.

A boolean `correct` should not be treated as a primitive learner action. It may be stored as immutable evaluator evidence for reproducibility, while remaining recomputable when scoring rules permit.

This supports future rescoring without rewriting the historical response.

Confidence: **High**.

## 7. Foundational cluster D — immutability and correction

### Evidence

- xAPI Statements are immutable; invalid history is voided by another statement.
- Microsoft event-sourcing guidance recommends compensating events rather than rewriting historical events.
- Event sourcing also creates a privacy tension if PII is embedded in immutable events.

### Research recommendation

Accepted raw evidence is immutable.

Correction path:
- correction/supersession/void event references the target event;
- carries reason code, provenance/authority, and correction time;
- original evidence remains auditable;
- current-valid view is a projection.

Privacy/account deletion is a separate lifecycle concern; do not model legal erasure as an educational correction.

Confidence: **High**.

## 8. Foundational cluster E — idempotency and duplicates

### Evidence

- xAPI: receiving an existing Statement ID must not modify existing state; differing body should produce conflict.
- KurrentDB: stable event ID + expected stream revision enables strong idempotent retries.
- Snowplow/PostHog document real duplicate-event behavior under at-least-once delivery.
- Product analytics systems may deduplicate eventually; that is not strong enough for learner evidence.

### Research recommendation

1. Client generates an immutable `event_id` once when the event is created.
2. Event is persisted locally **before** first network send.
3. Server has a unique constraint on `event_id`.
4. Same ID + canonically identical body = idempotent success/ack, not an error.
5. Same ID + different body = integrity conflict; never overwrite.
6. Same content/item/time but different IDs are not automatically duplicates; two interactions may both be valid.
7. Batch ingestion must return per-event dispositions so a partially successful batch can be retried safely.

Confidence: **High**.

## 9. Foundational cluster F — offline and multi-device synchronization

### Evidence

- IndexedDB is mature persistent browser storage for offline use.
- Background Sync / Periodic Background Sync are not universally available, so they cannot be correctness dependencies.
- Moodle's offline quiz flow uses local storage, question-level synchronization, sequence checks, last-action time, and explicit conflict rules.
- PowerSync/RxDB show mature checkpoint/conflict machinery for mutable replicated documents.
- Anki user reports demonstrate that whole-state one-way overwrite can destroy legitimate progress.

### Research recommendation

K3 does **not** need a generic mutable-document sync engine for canonical evidence.

Use evidence-specific append synchronization:

```
interaction
-> local immutable evidence
-> local outbox transport metadata
-> at-least-once upload
-> idempotent server acceptance
-> explicit acknowledgement
-> retain/retry until durable ack
```

Background Sync may accelerate delivery where available but must not be required.

Two devices producing different event IDs generally produce two valid pieces of evidence. Never deduplicate simply because item/time/answer look similar.

For the **same frozen assessment attempt** used on multiple devices, a stronger attempt-coordination policy is still an open design question; do not solve it with latest-timestamp-wins.

Confidence: **High** for append sync; **Medium** for shared active-assessment coordination.

## 10. Foundational cluster G — ordering, clock skew, late arrival

### Evidence

- OpenTelemetry separates occurrence `Timestamp` from collection `ObservedTimestamp`.
- Snowplow retains several pipeline timestamps because device clocks can be wrong and network delivery delayed.
- xAPI separates `timestamp` from LRS-assigned `stored`, and explicitly warns against rejecting simply because a client timestamp appears in the future due to clock error.
- `performance.now()` is monotonic and is safer than wall clock for local latency/duration measurement.

### Research recommendation

Canonical event envelope should preserve distinct concepts:

- `occurred_at`: source/client wall time; useful but not authoritative ordering.
- `origin_id`: random installation/origin identifier, not device fingerprint.
- `origin_seq`: monotonic local sequence for events from the same origin.
- `ingested_at`: trusted persistence/acceptance time.
- `ingest_seq`: server-side deterministic acceptance order.
- monotonic elapsed duration captured separately for latency.

Do not invent one globally-correct occurrence order across disconnected devices.

Late-arriving evidence remains valid and is marked/observable; it is not rewritten to look on-time.

No hard-coded clock-skew tolerance is justified yet. Thresholds belong to versioned quality configuration/calibration.

Confidence: **High**.

## 11. Foundational cluster H — snapshot/release/item linkage

Every learner-evidence event must be interpretable against the exact content context that existed when it happened.

Reuse existing IDs, not parallel identities:

- `track_id`;
- `content_release_id`;
- `question_family_id`;
- `item_version_id`;
- `objective_id`;
- `domain_id`;
- `mode`;
- `locale`.

Assessment-scoped evidence additionally needs the exact frozen form/snapshot and attempt identity. Where render variables or option ordering matter, bind evidence to the exact render instance/seed/presentation state rather than current bank state.

Open edX's use of course/content/grading hashes provides production evidence for snapshot/policy linkage.

Do not require a form ID for learning interactions that are not actually part of a frozen form.

Confidence: **High**.

## 12. Foundational cluster I — learner/session/device identity and privacy

### Evidence

- Saudi PDPL implementing regulation requires purpose definition, collection limited to the minimum necessary, and minimum necessary retention.
- W3C privacy principles emphasize purpose limitation and minimization.
- OWASP cautions against logging raw session IDs and sensitive personal data.
- PostHog documents cross-device identity duplication when identify/alias is incomplete.

### Research recommendation

Separate identities by purpose:

- `learner_id`: platform pseudonymous learner principal;
- `origin_id`: random installation/browser-profile origin, not fingerprint;
- `session_id` / learning-session ID: scoped correlation ID, not authentication;
- authenticated account/PII mapping: outside the immutable evidence store.

Do not put IP address, raw User-Agent fingerprints, email, name, access tokens, or arbitrary free text into the core learner-evidence envelope.

Property-level privacy classification should reuse K2 governance ideas rather than invent an unrelated privacy system.

Retention must be versioned policy/configuration. Do not guess a legal duration.

Confidence: **High**.

## 13. Foundational cluster J — storage and query architecture

### Research recommendation

Canonical semantics remain persistence-neutral.

### Browser

- IndexedDB for immutable evidence + indexes.
- Separate mutable outbox/sync-status metadata from immutable event payload.
- Do not rely on service-worker background sync for correctness.

### File adapter

- JSONL append-only remains useful for deterministic tests/export/reference implementation.
- Current read-all duplicate scan is not a scalable production index; add side index/checkpoint only when implementation begins.

### SQLite/server

Store selected envelope columns in indexed relational columns plus immutable canonical event JSON.

Minimum likely indexes to evaluate:
- learner + ingest sequence;
- attempt + origin/order;
- item/version + occurrence/ingestion time;
- release/form/snapshot;
- target event for corrections.

Do not choose index thresholds or partitioning without measured workload.

### Projections

Attempt/session/query projections are derived and rebuildable. Each projection should carry projection/version metadata.

### Parity

Browser/file/SQLite/API must be checked with the same golden evidence streams and conformance fixtures. This directly addresses the validator drift already found in `LearnerEventV1`.

Confidence: **High**.

## 14. Standards/interoperability direction

### xAPI 2.0

Useful for:
- immutable statement semantics;
- stable statement IDs;
- source vs stored time;
- correction/voiding;
- export/LRS adapters.

Do not adopt it as the internal K3 canonical schema.

### xAPI Profiles

Useful later for controlled semantic mappings/templates. Current public profile spec is 1.0 and is under IEEE upgrade work after xAPI 2.0, so K3 should avoid making its canonical model depend on that moving layer.

### Caliper 1.2

Useful for education-specific mappings, especially:
- assessment/item lifecycle;
- skipped vs started/completed;
- Attempt and Response relationships;
- session references.

Do not adopt it as the canonical K3 data model.

### QTI 3

Use for assessment content/result/scoring interoperability, not as the learner-evidence event store.

### OpenTelemetry

System Telemetry plane only. Reuse concepts such as occurrence vs observed time; do not make OTel logs the learner record.

### Product analytics systems

Product Analytics plane only. They are useful export/sanitized bridge targets, not learner truth.

## 15. Three-plane boundary — evidence-supported hypothesis

```
Learner Evidence Plane
  durable, learner-linked, auditable, replayable
       |
       | governed references / explicit derived bridges
       v
Product Analytics Plane
  product usage, funnels, UX, experiments
       |
       | correlation only where allowed
       v
System Telemetry Plane
  logs, metrics, traces, reliability
```

The three planes may share IDs deliberately, but must not silently share semantics or privacy policy.

Open edX explicitly separates Learning and Analytics architecture subdomains, providing direct production precedent.

Confidence: **High**.

## 16. Event-sourcing scope decision

K3 should use **event-sourcing principles**, not turn the whole platform into a generic event-sourced architecture.

Reuse:
- append-only history;
- immutable events;
- correction events;
- replayable projections;
- idempotent append;
- schema/version evolution.

Avoid for now:
- Kafka;
- KurrentDB/EventStoreDB;
- general distributed log infrastructure;
- CRDT/vector-clock machinery;
- microservice event buses;
unless measured scale/coordination requirements later justify them.

Microsoft's own guidance warns that event sourcing adds complexity and is not automatically appropriate for every system.

Confidence: **High**.

## 17. Initial schema/version evolution direction

Raw historical bytes/semantic records should never be destructively rewritten just to match a new reader.

Each event needs explicit schema/type versioning.

Readers may use deterministic upcasters/adapters to project old events into a newer in-memory model.

Compatibility tests should cover all supported historical event versions, not only the immediately previous schema.

Breaking semantic changes require a new event type/version, not a silent interpretation change.

Confidence: **High**.

## 18. Data-quality monitor candidates

No thresholds are approved yet.

Deterministic checks can include:

- schema/type-version validity;
- same event ID with differing body;
- broken content/snapshot references;
- impossible/duplicate local sequence;
- response/evaluation after closed immutable assessment attempt;
- orphan correction target;
- unsupported schema version;
- late arrival;
- abnormal client/server clock divergence as a flag, not automatic deletion;
- privacy-class violations;
- missing provenance/authority on system-generated correction/evaluation evidence.

Probabilistic/anomaly thresholds remain deferred configuration.

## 19. Evidence ledger — key sources

### Standards / primary documentation

- E001 — IEEE 9274.1.1-2023 xAPI Base Standard, active standard: https://standards.ieee.org/ieee/9274.1.1/7321/
- E002 — xAPI data model / statement lifecycle: https://github.com/adlnet/xAPI-Spec/blob/master/xAPI-Data.md
- E003 — xAPI communication / idempotent duplicate statement behavior: https://github.com/adlnet/xAPI-Spec/blob/master/xAPI-Communication.md
- E004 — xAPI Profiles repository, current 1.0 + upgrade in progress: https://github.com/adlnet/xapi-profiles
- E005 — 1EdTech Caliper 1.2 specification: https://www.imsglobal.org/spec/caliper/v1p2
- E006 — 1EdTech Caliper implementation guide / envelope batching: https://www.imsglobal.org/spec/caliper/v1p2/impl
- E007 — 1EdTech QTI specification index: https://www.1edtech.org/standards/qti/index
- E008 — QTI 3 response processing guide: https://developers.imsglobal.org/spec/qti/v3p0/guide
- E009 — OpenTelemetry Logs Data Model: https://opentelemetry.io/docs/specs/otel/logs/data-model/
- E010 — MDN IndexedDB: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB
- E011 — MDN Background Sync: https://developer.mozilla.org/en-US/docs/Web/API/Background_Synchronization_API
- E012 — MDN Performance.now: https://developer.mozilla.org/en-US/docs/Web/API/Performance/now

### Mature implementations / infrastructure patterns

- E013 — Open edX architecture subdomains: https://docs.openedx.org/projects/openedx-events/en/latest/reference/architecture-subdomains.html
- E014 — Open edX events: https://docs.openedx.org/projects/openedx-events/en/latest/reference/events.html
- E015 — Open edX student problem interaction events: https://docs.openedx.org/en/latest/developers/references/internal_data_formats/tracking_logs/student_event_types.html
- E016 — Open edX grading/content-version event fields: https://docs.openedx.org/en/latest/developers/references/internal_data_formats/tracking_logs/course_team_event_types.html
- E017 — Canvas quiz submission events: https://developerdocs.instructure.com/services/canvas/resources/quiz_submission_events
- E018 — Moodle mobile offline quiz synchronization: https://docs.moodle.org/dev/Quiz_support_in_the_Mobile_app
- E019 — Anki sync manual: https://docs.ankiweb.net/syncing.html
- E020 — Snowplow timestamps: https://docs.snowplow.io/docs/events/timestamps/
- E021 — Snowplow deduplication: https://docs.snowplow.io/docs/modeling-your-data/modeling-your-data-with-dbt/package-mechanics/deduplication/
- E022 — PostHog person/identity model: https://posthog.com/docs/data/persons
- E023 — RxDB replication: https://rxdb.info/replication.html
- E024 — PowerSync checkpoint requests (2026-09): https://powersync.com/blog/checkpoint-requests-client-synced-now
- E025 — Microsoft Event Sourcing pattern: https://learn.microsoft.com/en-us/azure/architecture/patterns/event-sourcing
- E026 — KurrentDB idempotent appends: https://docs.kurrent.io/http-api/v25.0/introduction
- E027 — PostgreSQL 18 INSERT / ON CONFLICT: https://www.postgresql.org/docs/18/sql-insert.html

### Privacy / governance

- E028 — Saudi PDPL Implementing Regulation, Article 19 data minimization: https://dgp.sdaia.gov.sa/wps/portal/pdp/knowledgecenter/details/PDPL2/
- E029 — Saudi Minimum Personal Data Determination Guideline: https://dgp.sdaia.gov.sa/
- E030 — W3C Privacy Principles: https://www.w3.org/TR/privacy-principles/
- E031 — OWASP Logging Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html

### Peer-reviewed research

- E032 — Liu & Khalil (2023), privacy/data protection in learning analytics, systematic review of 47 papers: https://doi.org/10.1111/bjet.13388
- E033 — García-García et al. (2026), learning analytics meta-review, 19 systematic reviews: https://doi.org/10.1007/s10734-026-01709-y
- E034 — Fleming (2024), metacognition and confidence review: https://doi.org/10.1146/annurev-psych-022423-032425
- E035 — Rios & Deng (2021), rapid-guessing response-time threshold meta-analysis: https://doi.org/10.1186/s40536-021-00110-8
- E036 — Coffey et al. (2024), answer-changing scoping review: https://doi.org/10.1016/j.nedt.2023.106052
- E037 — Cai et al. (2023), feedback in technology-rich environments meta-analysis: https://doi.org/10.1016/j.edurev.2023.100521

### Failure / complaint signals

- F001 — Anki forum 2026: legitimate review history lost after one-way sync overwrite: https://forums.ankiweb.net/t/lost-all-my-progress-after-a-sync/68313
- F002 — PostHog issue: idempotency request due duplicate events on retry: https://github.com/PostHog/posthog/issues/17211
- F003 — PostHog issue 2026: multiple clients can rotate session ID twice and orphan replay: https://github.com/PostHog/posthog-js/issues/3359
- F004 — PostHog docs: duplicate person profiles when cross-device identify is incomplete: https://posthog.com/docs/data/persons

Community/user reports are failure signals only; no prevalence claim is made from them.

## 20. Decision-gate status for foundational cluster

### Decision-ready with high confidence

- raw canonical evidence should be fine-grained immutable events;
- attempt/query aggregate should be a rebuildable projection;
- exact retry must be idempotent;
- same-ID/different-body is an integrity conflict;
- correction uses explicit supersession/void/compensation, not rewrite;
- offline uses local durable outbox + at-least-once upload + server idempotency;
- background sync is optional acceleration, not correctness;
- separate source occurrence time from trusted ingestion time;
- preserve per-origin sequence instead of trusting wall-clock ordering;
- assessment evidence binds to exact frozen content/form/item/scoring context;
- PII/account mapping stays outside immutable evidence where possible;
- learner evidence, product analytics, and system telemetry remain separate planes;
- xAPI/Caliper are interoperability adapters, not K3 canonical schema;
- no need yet for Kafka/KurrentDB/CRDT/general sync-engine dependency.

### Not yet final

- exact event vocabulary and names;
- exact active-assessment multi-device writer/lease semantics;
- final session boundary model;
- exact `LearnerEventV1` migration strategy;
- exact retention/deletion policy classes;
- exact event ID format (UUIDv4 vs UUIDv7 or equivalent);
- exact query indexes/partition strategy;
- exact privacy class taxonomy;
- whether response evaluation is one event type or a typed evaluator subrecord;
- exact export contracts and xAPI/Caliper profile mapping.

## 21. Next research cluster

Continue the K3 matrix on:

1. sessions, interruptions, abandonment;
2. cross-language interactions;
3. anonymous → authenticated identity transitions;
4. retention/deletion/account lifecycle;
5. schema migrations/upcasters;
6. replay/rebuild semantics for K4/K5/K6;
7. export adapters and xAPI/Caliper mapping;
8. experiment/cohort linkage;
9. data-quality monitoring;
10. conformance/parity contract across browser/file/SQLite/API;
11. full 50-point coverage audit and falsification pass.

No production code, implementation plan, or final K3 spec should be created before conceptual approval.

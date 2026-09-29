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


## 22. Sessions, interruptions, and abandonment

### Evidence

Browser lifecycle does not provide a reliable universal "session ended" signal. MDN documents `visibilitychange` to hidden as the last reliably observable transition in many cases, while unload/beforeunload are unreliable, especially on mobile. Analytics systems commonly apply configurable inactivity sessionization rules rather than discovering one objective natural session boundary.

### Research recommendation

K3 should distinguish:

- **explicit activity/attempt scope** — a durable application-minted ID when the product actually starts a learning or assessment workflow;
- **observed lifecycle evidence** — start, pause/resume, submit/complete where the application genuinely observes them;
- **sessionization projection** — an algorithm/version that groups evidence for analysis;
- **abandonment projection** — a derived interpretation when expected terminal evidence is absent.

Do not store "abandoned" as raw truth merely because no later event arrived.

Do not hard-code a universal inactivity timeout. If a derived sessionization policy uses a timeout, its policy/version must be recorded with the projection.

Sources:
- MDN Page Visibility API: https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilitychange_event
- MDN beforeunload: https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event
- Snowplow session tracking: https://docs.snowplow.io/docs/sources/trackers/web-trackers/tracking-events/session-tracking/

Confidence: **High**.

## 23. Strict assessment multi-device concurrency

### Production evidence

Moodle's offline quiz design:
- creates an attempt before offline work;
- prevents starting another offline attempt while a prior offline attempt is unsynchronized;
- marks offline-finished work distinctly from server-submitted work;
- synchronizes question-by-question;
- uses sequence checks and last-action metadata for conflicts;
- warns when the same attempt may have unsaved work on another device.

Canvas also models a quiz submission with a stable submission/attempt identity and explicit attempt count rather than reducing the assessment to independent page events.

General concurrency systems use conditional writes/version checks to reject stale mutable updates rather than silently overwriting current state.

Sources:
- Moodle mobile quiz offline design: https://docs.moodle.org/dev/Quiz_support_in_the_Mobile_app
- Moodle offline attempt behavior: https://docs.moodle.org/35/en/Moodle_Mobile_quiz_offline_attempts
- Canvas Quiz Submissions API: https://developerdocs.instructure.com/services/canvas/resources/quiz_submissions
- AWS optimistic locking: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/BestPractices_OptimisticLocking.html
- xAPI 2.0 mutable State/Profile concurrency uses ETag/If-Match: https://lms.technology/for/xapi/2.0/standards/interactive/9274.1.1%20xAPI%20Base%20Standard%20for%20Content.html

### K3 design direction

Do not conflate two responsibilities:

1. **Evidence preservation:** preserve every valid immutable event from every origin.
2. **Assessment-state authority:** decide which writes count toward the authoritative frozen attempt using explicit assessment concurrency rules.

For practice/learning, two devices may legitimately create two distinct exposures/responses.

For a strict frozen assessment attempt:
- mint a stable `attempt_id`;
- mutations of the authoritative attempt projection use an explicit revision/sequence precondition;
- stale/conflicting client work is never silently applied by last timestamp;
- if a conflict arrives later, preserve the raw learner action plus an authoritative resolution/rejection/supersession record rather than deleting evidence;
- device handoff should become explicit when strict assessment integrity requires it.

Whether the final K3/K8 contract uses `attempt_revision`, a writer epoch/lease, or question-level sequence tokens remains **open**. The evidence supports explicit concurrency control but does not establish one universally best mechanism for every mode.

Confidence: **High** on the boundary; **Medium** on the final mechanism.

## 24. Attempt identity versus attempt number

Current `LearnerEventV1.attempt_number` is a count, not a robust identity.

Late-arriving and multi-device evidence can change the ordering from which a count would be derived.

### Research recommendation

Canonical raw evidence should reference a stable `attempt_id` (and, where useful, an item-level interaction/attempt ID). Human-readable `attempt_number` should be a projection or assessment-engine attribute under a specific policy.

Caliper's Attempt entity and Canvas submission IDs provide production/standard precedent for identity separate from count.

Sources:
- Caliper Assessment Profile: https://www.imsglobal.org/spec/caliper/v1p2
- Canvas Quiz Submissions: https://developerdocs.instructure.com/services/canvas/resources/quiz_submissions

Confidence: **High**.

## 25. Learn / practice / check / section / mock semantics

The mode is **context**, not an event type.

The same learner action (for example, response submitted) may happen under different mode policies.

K3 should preserve the mode/policy context needed to interpret the event later but must not duplicate a separate event taxonomy for each mode.

Inherited product semantics matter:
- learn/practice may provide immediate feedback;
- check may delay feedback according to policy;
- mock/strict assessment hides coaching until submission;
- section/mock may be bound to a frozen AssessmentFormSnapshot.

### Research recommendation

A raw event should carry or resolve through references to:
- `mode`;
- applicable activity/assessment policy version;
- exact form/snapshot when one exists.

Do not require `form_id` for an ad-hoc learn/practice interaction that was never part of a frozen form.

Confidence: **High**.

## 26. Answer changes and response identity

The current runtime stores a canonical option index, while `AssessmentFormSnapshotV1` freezes option ordering.

This is reconstructable for today's multiple-choice contract but `LearnerEventV1` collapses changes into one final answer.

Research on answer changing does not justify assuming either the first or final answer is inherently the only meaningful evidence.

### Research recommendation

- preserve each committed response change as ordered evidence;
- bind each response to the exact item version and presentation/form snapshot;
- preserve the final accepted response as a projection/assessment state, not by destroying earlier responses;
- avoid copying localized answer text into evidence when a stable response identifier/index plus immutable snapshot is enough;
- future item types may require a versioned structured response shape.

Source:
- Coffey et al. answer-changing scoping review: https://doi.org/10.1016/j.nedt.2023.106052

Confidence: **High** on preserving changes; **Medium** on future generalized response encoding.

## 27. Confidence, hints, and explanation exposure

### Confidence

Confidence is metacognitive/self-report evidence. It is not correctness, mastery, or calibrated ability.

If confidence can be changed independently after a response, record it as its own event; if product semantics guarantee it is captured atomically with a response, it may be an optional field on that response evidence. The architecture should not force one UI interaction shape.

### Hints

A boolean `hint_used` loses which hint, when it was requested, and whether multiple hints were used.

Prefer explicit hint-requested / hint-presented evidence only when the learning mode actually exposes hints.

### Explanations

`explanation_opened: true` loses ordering and repetition. Explanation exposure is useful context for later analyses but does not itself prove learning.

Evidence:
- Fleming 2024 confidence/metacognition review: https://doi.org/10.1146/annurev-psych-022423-032425
- Cai et al. 2023 feedback meta-analysis: https://doi.org/10.1016/j.edurev.2023.100521
- Current hint-generation review/search evidence indicates benefits are context-dependent and evaluation remains nontrivial.

Confidence: **High** on evidence semantics; **Medium** on final event granularity.

## 28. Timing and latency semantics

Current `latency_ms` is ambiguous if derived only from wall-clock `shown_at` and `answered_at`.

### Research recommendation

Separate:
- source wall-clock occurrence time;
- trusted ingestion time;
- per-origin sequence;
- monotonic elapsed duration measured locally for response timing.

`performance.now()` provides a monotonic clock appropriate for elapsed measurement and is not affected by system-clock changes.

Do not classify fast responses as rapid guessing inside K3. Response-time thresholds are model/calibration choices and can materially affect conclusions.

Sources:
- MDN performance.now: https://developer.mozilla.org/en-US/docs/Web/API/Performance/now
- OpenTelemetry Logs Data Model: https://opentelemetry.io/docs/specs/otel/logs/data-model/
- Snowplow event timestamps: https://docs.snowplow.io/docs/events/timestamps/
- Rios & Deng rapid-guessing threshold meta-analysis: https://doi.org/10.1186/s40536-021-00110-8

Confidence: **High**.

## 29. Anonymous, pseudonymous, authenticated, and multi-device identity

### Separation of concerns

- `learner_id`: pseudonymous platform learner principal used by the evidence domain;
- `origin_id`: random application installation/browser-profile origin, not a hardware/browser fingerprint;
- `activity_id` / `attempt_id`: scoped workflow identity;
- authentication/account identifiers and direct PII: separate identity/account layer.

### Anonymous → authenticated transition

Do not rewrite old raw events to replace the old identity value.

Use an explicit, governed identity-link record outside the raw event body so projections can resolve multiple historical pseudonymous/origin identities into an authenticated learner when the product has a lawful and intentional linking action.

This preserves auditability and enables unlinking/deletion without mutating event semantics.

### Multi-device

A learner principal may have many origins. `origin_id` exists for synchronization/order/provenance, not personalization or device fingerprinting.

PostHog's documented cross-device identity duplication is useful failure evidence for why implicit identity merging is unsafe.

Source:
- PostHog persons/identity: https://posthog.com/docs/data/persons

Confidence: **High** on separation; **Medium** on exact identity-link contract.

## 30. Privacy lifecycle versus logical immutability

Logical append-only/audit immutability must not be misread as "retain personal data forever."

Saudi PDPL and its Implementing Regulation establish purpose limitation/minimization and destruction obligations/rights subject to applicable exceptions.

### Research recommendation

Separate:
- **evidence integrity policy** — ordinary application code cannot rewrite accepted evidence;
- **privacy lifecycle policy** — authorized deletion/anonymization/de-linking under legal/account lifecycle rules;
- **backup lifecycle** — documented separately;
- **derived projection invalidation/rebuild** after privacy actions where required.

Keep direct personal identifiers out of immutable evidence wherever practical so deletion can often be achieved by removing identity links rather than rewriting pedagogical events.

Retention is versioned policy/configuration. Do not embed guessed numbers.

Primary sources:
- Saudi PDPL / Implementing Regulation: https://dgp.sdaia.gov.sa/wps/portal/pdp/knowledgecenter/details/PDPL2/
- Saudi data minimization/privacy guidance: https://dgp.sdaia.gov.sa/

Confidence: **High** on architecture principle; legal deployment details remain external policy/legal review.

## 31. Cross-language evidence

Arabic and English are sibling presentations of a pedagogical family, not interchangeable event identities.

### Research recommendation

Every exposure/response preserves:
- actual locale/presentation language;
- exact `item_version_id`;
- exact rendered/form snapshot;
- shared `question_family_id`.

Two responses to AR and EN variants remain separate evidence even if they share a family.

Later models may use family-level cross-language evidence under a versioned policy; K3 must not merge it automatically.

QTI language support and the existing bilingual item/family model support this separation.

Sources:
- QTI 3 specification index: https://www.1edtech.org/standards/qti/index
- Existing K1/K2 bilingual family/item contracts in this repository.

Confidence: **High**.

## 32. Event provenance and asserting authority

Not every event is a learner action.

Examples:
- learner submitted response;
- client observed exposure;
- server evaluated response;
- moderator/system corrected an erroneous record;
- migration imported a legacy aggregate.

### Research recommendation

Canonical envelope/type semantics should distinguish:
- **actor/subject** — whose learning the evidence concerns;
- **producer/origin** — software component that emitted it;
- **authority** — trusted service/role asserting evaluation/correction where applicable;
- provenance references for migration/system-generated events.

xAPI's actor/authority distinction and CloudEvents' source/type/id concepts are useful patterns. W3C PROV is richer than needed for every event; reuse the repository's existing provenance conventions instead of embedding a general provenance graph.

Sources:
- xAPI 2.0 interactive standard: https://lms.technology/for/xapi/2.0/standards/interactive/9274.1.1%20xAPI%20Base%20Standard%20for%20Content.html
- CloudEvents specification: https://github.com/cloudevents/spec
- W3C PROV overview: https://www.w3.org/TR/prov-overview/

Confidence: **High** on semantic separation; **Medium** on exact envelope fields.

## 33. Experiment and cohort linkage

K2 already owns `ExperimentRecordV1`; K3 must not invent a second experiment system.

### Research recommendation

- feature-flag evaluation and product exposure remain in Product Analytics/Telemetry;
- when an experiment assignment is necessary to interpret a learner interaction, raw evidence may reference a stable internal experiment assignment/record ID;
- do not copy vendor-specific flag payloads into canonical learner evidence;
- dynamic cohorts are derived/mutable definitions and should not be stored as immutable learner truth;
- causal conclusions remain outside K3.

Modern experimentation platforms distinguish assignment/exposure from downstream events; K3 should retain that conceptual boundary while using internal vendor-neutral IDs.

Sources:
- PostHog experiments: https://posthog.com/docs/experiments
- Statsig exposure concepts: https://docs.statsig.com/experiments
- OpenFeature evaluation context: https://openfeature.dev/specification/sections/evaluation-context/

Confidence: **High**.

## 34. Schema evolution and replay

### Research recommendation

Each raw event must have explicit type/schema versioning.

Reader behavior:
- additive compatible fields may be tolerated according to contract;
- semantic breaking change requires a new event type/version;
- old durable event bodies are not destructively rewritten during normal migrations;
- deterministic upcasters/read adapters may expose a current in-memory representation.

Derived projections should record:
- projection type;
- projection/algorithm version;
- input watermark (for example trusted `ingest_seq` through which it was built);
- relevant policy/content/scoring references.

This enables K4/K5/K6/K8 to explain and rebuild derived state from the same evidence under newer algorithms.

If privacy lifecycle lawfully removes or de-links evidence, recomputability is bounded by the remaining lawful dataset; do not claim perfect replay after erasure.

Sources:
- Microsoft Event Sourcing pattern: https://learn.microsoft.com/en-us/azure/architecture/patterns/event-sourcing
- Open edX event versioning/architecture: https://docs.openedx.org/projects/openedx-events/en/latest/
- Axon event upcasting pattern: https://docs.axoniq.io/axon-framework-reference/4.12/events/event-versioning/

Confidence: **High**.

## 35. Migration honesty for LearnerEventV1 and StateV2

K3 must not fabricate fine-grained history that was never observed.

### Research recommendation

For historical `LearnerEventV1`:
- preserve original aggregate payload and original ID;
- either keep it readable as a supported legacy evidence type or import it into an explicitly labeled coarse aggregate/migration event;
- record migration provenance and source schema;
- never synthesize fake `hint_requested`, `question_exposed`, answer-change order, or server ingestion times.

For historical StateV2 exam history:
- migrate only facts that are actually present;
- preserve the original attempt/result snapshot or hash/reference;
- mark migrated granularity/limitations explicitly.

This follows the repository's existing migration-honesty rule used for K1 content lineage.

Confidence: **High**.

## 36. Export adapters — xAPI and Caliper

K3 canonical records remain internal. Export is a deterministic adapter/projection.

### xAPI adapter

Possible mapping:
- K3 learner principal -> xAPI Actor using deployment-specific pseudonymous account mapping;
- K3 event type -> governed xAPI Verb;
- item/activity -> xAPI Object Activity;
- `attempt_id` / activity scope -> xAPI registration/context;
- response/evaluation -> xAPI Result where semantically appropriate;
- K3 `occurred_at` -> xAPI timestamp;
- LRS-assigned stored remains the LRS's responsibility.

Do not leak internal direct PII into xAPI actor IFIs.

### Caliper adapter

Assessment-scoped mapping:
- activity/assessment start/pause/resume/submit -> AssessmentEvent;
- item started/skipped/completed -> AssessmentItemEvent;
- attempt -> Caliper Attempt;
- completed response -> Caliper Response;
- session reference only when the K3 activity/session semantics actually match.

Caliper explicitly distinguishes Skipped from Started/Completed and does not increment Attempt count on Skip.

### Rule

Adapters may be lossy where a standard has no exact construct. They must declare mapping version and omitted/extension fields.

Sources:
- IEEE/xAPI current standard status: https://standards.ieee.org/ieee/9274.1.1/7321/
- xAPI 2.0 interactive standard: https://lms.technology/for/xapi/2.0/standards/interactive/9274.1.1%20xAPI%20Base%20Standard%20for%20Content.html
- Caliper 1.2 Assessment Profile: https://www.imsglobal.org/spec/caliper/v1p2

Confidence: **High** on adapter role; **Medium** on final verb/profile mapping until an explicit K3 export profile is written.

## 37. Data-quality monitoring

### Deterministic integrity checks

K3 can validate without guessed thresholds:
- unknown event type/schema;
- malformed required IDs;
- same `event_id` with non-identical canonical body;
- duplicate/impossible `origin_seq` for one origin;
- broken content/release/form/attempt references;
- orphan correction/supersession target;
- illegal correction authority;
- invalid mode/policy relation;
- accepted assessment mutation against a stale revision;
- privacy classification/export violation;
- projection watermark regression.

### Observational quality flags

May be recorded without declaring invalidity:
- late arrival;
- client clock substantially divergent from ingestion time;
- unusually long/short elapsed duration;
- duplicate-looking but distinct events;
- incomplete terminal lifecycle.

Thresholds for "substantially" or "unusual" remain versioned policy/calibration inputs.

Confidence: **High**.

## 38. Browser / file / SQLite / API conformance

The inherited LearnerEventV1 validator drift proves that schema parity cannot rely on duplicated handwritten validation logic.

### Research recommendation

K3 should define one canonical contract and a portable conformance corpus containing:
- valid event sequences;
- invalid events;
- exact idempotent retries;
- same-ID/different-body conflicts;
- out-of-order arrival;
- late events;
- corrections;
- offline replay;
- multi-device distinct events;
- strict-assessment stale-write conflicts;
- legacy migration examples.

Every adapter — browser IndexedDB, JSONL/file, SQLite, API, future Postgres — runs the same corpus and must produce equivalent logical dispositions/projections.

This is stronger than testing each adapter independently.

Confidence: **High**.

## 39. Response evaluation is separate evidence

The current `correct` boolean combines learner action and system judgment.

### Research recommendation

Separate:
- learner response evidence;
- evaluator/scoring evidence tied to exact `item_version_id`, scoring policy/version, and response event.

This permits:
- scoring correction without rewriting learner behavior;
- future rescoring;
- preserving ungraded or partially graded responses;
- explaining why an historical result differed after policy/model changes.

QTI's separation of response variables and response processing, plus Canvas/Open edX regrade/version concepts, supports this direction.

Sources:
- QTI 3 specification: https://www.1edtech.org/standards/qti/index
- Canvas Quiz Submission fields include score before regrade: https://developerdocs.instructure.com/services/canvas/resources/quiz_submissions

Confidence: **High**.

## 40. Event identifier choice

UUIDv4 is sufficient for uniqueness.

UUIDv7 provides sortable, time-embedded IDs and can improve database locality, but the timestamp component is derived from wall-clock time.

### Research position

**Do not choose yet.**

Regardless of format:
- `event_id` is identity/idempotency, not causal ordering;
- ordering semantics remain explicit through origin/server sequence fields;
- UUIDv7 must never become a hidden substitute for trusted occurrence order.

Source:
- RFC 9562: https://www.rfc-editor.org/rfc/rfc9562.html

Confidence: **High** on the rule; ID format remains **Open**.

## 41. Expanded K3 research matrix status

Status meanings:
- **READY** — evidence is strong enough to carry into conceptual architecture.
- **PROVISIONAL** — direction is supported but exact contract remains open.
- **OPEN** — additional bounded research/design is still required.

| # | Question | Status | Current research conclusion |
|---:|---|---|---|
| 1 | event/evidence model | READY | Fine-grained immutable raw event stream + rebuildable projections. |
| 2 | attempt vs exposure | READY | Stable attempt IDs; exposure is distinct; counts are not identity. |
| 3 | unanswered/skipped | READY | Explicit skip/observed exposure; absence remains absence; skip != attempt. |
| 4 | answer changes | READY | Preserve ordered response changes. |
| 5 | multiple attempts | READY | Stable attempt IDs; attempt number derived/policy-scoped. |
| 6 | timing/latency | READY | Multi-clock model + monotonic elapsed duration. |
| 7 | confidence | READY | Optional metacognitive evidence, never mastery truth. |
| 8 | hints | PROVISIONAL | Prefer explicit events; final UI/event vocabulary open. |
| 9 | explanation exposure | PROVISIONAL | Explicit exposure event where material; no learning inference. |
| 10 | mode semantics | READY | Mode/policy is context, not parallel event taxonomy. |
| 11 | session boundaries | READY | Explicit activity scope + derived sessionization policy. |
| 12 | interruption/abandonment | READY | Observable transitions raw; abandonment derived. |
| 13 | offline events | READY | Local durable write first. |
| 14 | offline→online sync | READY | Durable outbox + at-least-once upload + idempotent ack. |
| 15 | idempotency | READY | Same ID/same body ack; same ID/different body conflict. |
| 16 | duplicate prevention | READY | Identity-based exact dedup; no heuristic event deletion. |
| 17 | out-of-order events | READY | Accept/preserve; use explicit origin/ingest ordering. |
| 18 | clock skew | READY | Client clock untrusted; no fixed threshold yet. |
| 19 | late-arriving evidence | READY | Valid and observable; do not rewrite time. |
| 20 | event correction | READY | Explicit correction/supersession/void evidence. |
| 21 | tombstones/supersession | READY | Logical correction separate from privacy erasure. |
| 22 | immutable raw history | READY | Application-level immutable; authorized privacy lifecycle separate. |
| 23 | learner identity | PROVISIONAL | Pseudonymous principal + separate identity mapping. |
| 24 | anonymous/pseudonymous | READY | Direct PII kept outside raw evidence when practical. |
| 25 | multi-device identity | READY | Many origins per learner; origin is not fingerprint. |
| 26 | privacy/minimization | READY | Purpose/classification/minimization first. |
| 27 | retention | PROVISIONAL | Policy/versioned, deployment/legal inputs remain open. |
| 28 | form/snapshot linkage | READY | Exact frozen assessment/render context. |
| 29 | release linkage | READY | Existing immutable release IDs reused. |
| 30 | QuestionFamily linkage | READY | Reuse existing family ID; never parallel family identity. |
| 31 | ItemVersion linkage | READY | Exact immutable item version required. |
| 32 | objective/domain linkage | READY | Reuse existing stable IDs. |
| 33 | cross-language | READY | Actual locale/item variant preserved; family-level merge deferred to models. |
| 34 | event provenance | PROVISIONAL | actor/producer/authority separation; exact envelope open. |
| 35 | browser/API parity | READY | Shared conformance corpus required. |
| 36 | local/file/SQLite persistence | READY | Same logical store contract, adapter-specific implementation. |
| 37 | query/index architecture | PROVISIONAL | Envelope indexes known; final indexes need workload evidence. |
| 38 | data-quality monitoring | READY | Deterministic integrity + configured anomaly flags. |
| 39 | schema/version migration | READY | Versioned events + read-time upcasting; no destructive rewrite. |
| 40 | replay/rebuild derived models | READY | Versioned projections + input watermark. |
| 41 | auditability | READY | Raw + corrections + authority + deterministic projection. |
| 42 | export adapters | PROVISIONAL | xAPI/Caliper mappings supported; exact profile/verbs open. |
| 43 | interoperability standards | READY | Adapters only; canonical model stays internal/vendor-neutral. |
| 44 | xAPI relevance | READY | Strong semantic/export reference; not canonical K3 schema. |
| 45 | Caliper relevance | READY | Strong assessment/event mapping; not canonical K3 schema. |
| 46 | event-store/event sourcing | READY | Use principles only; no dedicated event-store infrastructure yet. |
| 47 | OpenTelemetry relationship | READY | System telemetry plane; timestamp concepts reusable only. |
| 48 | product analytics vs evidence | READY | Separate planes with governed bridges/correlation IDs. |
| 49 | experiment/cohort linkage | READY | Explicit experiment assignment ref; cohort remains derived. |
| 50 | K4/K5/K6/K8 compatibility | READY | Later models consume replayable raw evidence; no derived truth in K3. |
| 51 | response vs evaluation | READY | Separate learner action from scoring/evaluator evidence. |
| 52 | strict assessment multi-device authority | PROVISIONAL | Explicit revision/sequence resolution; exact mechanism open. |
| 53 | transport state vs evidence | READY | Mutable outbox/ack state separate from immutable event payload. |
| 54 | event ID format | OPEN | v4/v7/equivalent; never encode ordering semantics implicitly. |
| 55 | privacy erasure vs immutability | READY | Separate authorized privacy lifecycle from application corrections. |
| 56 | legacy migration granularity | READY | Preserve/coarsely import known facts; never fabricate event sequences. |

## 42. Strongest counter-evidence / architecture falsifiers so far

1. **Fine-grained events are not free.** They increase storage, schema surface, query complexity, and privacy risk. This is why K3 should use a bounded education-specific vocabulary, not record every UI gesture.
2. **Event sourcing is not universally appropriate.** Microsoft explicitly warns about complexity. K3 should use event-sourcing principles for learner evidence only, not re-platform the application.
3. **Caliper/xAPI do not solve offline synchronization.** They help semantics/interchange; K3 still needs local durability/idempotency/replay rules.
4. **Offline-first document sync products are mature but solve a broader mutable-state problem.** Adopting one as canonical infrastructure today would add coupling without proving a need.
5. **Client timestamps are sometimes the best representation of when an offline action occurred.** Therefore K3 should retain them; the rule is not "ignore client time" but "do not treat it as trusted global order."
6. **Privacy erasure can intentionally break complete replay.** Auditability must not override lawful privacy lifecycle.
7. **Sessionization is useful even though it is derived.** The correct response is versioned projections, not banning sessions.
8. **Strict assessment may need stronger coordination than practice.** One global multi-device policy would overconstrain ordinary learning or underprotect assessment.

## 43. Decision-gate update

The foundational landscape is now close to conceptual-design readiness.

### Strongly supported

- hybrid raw-event + projection architecture;
- immutable/idempotent raw evidence;
- explicit correction;
- local-first durable event creation;
- at-least-once sync;
- client occurrence + per-origin sequence + server ingestion order;
- exact snapshot/release/item linkage;
- separate response vs scoring evidence;
- explicit pseudonymous identity/origin separation;
- privacy lifecycle separate from correction semantics;
- three distinct planes: learner evidence / product analytics / system telemetry;
- vendor-neutral canonical model with xAPI/Caliper export adapters;
- shared cross-adapter conformance corpus;
- no dedicated event database, Kafka, CRDT stack, or generic sync engine without measured need.

### Remaining design decisions before conceptual approval

1. exact bounded K3 event vocabulary and event envelope fields;
2. exact `attempt_id` / activity / item-interaction hierarchy;
3. strict assessment concurrency mechanism (revision tokens vs writer epoch/lease vs question sequence);
4. event identifier format;
5. exact legacy `LearnerEventV1` compatibility/migration representation;
6. exact privacy identity-link/deletion mechanism;
7. exact xAPI/Caliper export profile mappings;
8. exact projection/store interface and minimum query indexes;
9. final falsification pass against the complete proposed architecture.

The research is **not yet declared complete**.

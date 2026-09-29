# K3 — Learner Evidence Engine — Normative Design Specification

**Date:** 2026-09-29  
**Status:** DRAFT FOR EXPLICIT WRITTEN-SPEC APPROVAL  
**Repository:** `oaabahussain/sdaia-ai-engineer`  
**Design branch:** `design/k3-learner-evidence-engine`  
**Authoritative base:** `main@3c296632a54f68f0ecc7ad122298d9661706cb2b`  
**Programme:** K3 — Learner Evidence Engine

> This document is the normative K3 design/specification. It does not authorize implementation. An implementation plan may be written only after this spec is explicitly approved.

---

## 1. Authority and precedence

K3 must follow this precedence when sources conflict:

1. live repository `main`;
2. the accepted Learning Platform architecture constitution;
3. the 2026-09-26 Research Amendment;
4. the current authoritative programme tracker;
5. merged K1/K2 contracts and K2 post-merge verification;
6. this K3 specification after explicit approval;
7. later approved K3 implementation plan;
8. historical plans/checkpoints/chat context.

Any material conflict discovered during implementation must be recorded as an explicit Ruling. It must not be resolved silently.

Research basis:

- `docs/superpowers/research/2026-09-29-k3-learner-evidence-landscape.md`
- `docs/superpowers/research/2026-09-29-k3-conceptual-architecture-proposal.md`
- `docs/superpowers/research/2026-09-29-k3-research-state.json`
- `docs/superpowers/reviews/2026-09-29-k3-research-conceptual-checkpoint.md`

---

## 2. Intent

K3 creates the durable evidence foundation describing what actually happened during learner interactions and assessment activity.

K3 must make later programmes able to answer:

- what evidence was observed;
- which exact content/version/presentation produced it;
- when and from which origin it was produced;
- whether it arrived late or out of order;
- whether it was retried or conflicted;
- whether it was corrected or superseded;
- which evaluation/scoring decision was later applied;
- which evidence a derived model consumed;
- whether a result can be replayed or audited.

K3 does not decide what the evidence *means* about mastery, readiness, psychometric ability, or the next action.

Governing rule:

> **Raw evidence is durable observation. Derived learner truth belongs to later versioned models.**

---

## 3. Explicit non-goals

K3 must not implement or claim:

- mastery;
- readiness;
- weak-topic ranking;
- next-best-action;
- spaced-repetition scheduling;
- calibrated item difficulty;
- discrimination;
- distractor efficiency;
- IRT ability;
- CAT selection;
- psychometric validity;
- causal learning effects;
- a general recommendation engine;
- a general event bus;
- a generic CRDT/document-sync platform;
- a mandatory Learning Record Store;
- Kafka/KurrentDB/EventStoreDB infrastructure;
- product analytics as learner truth;
- OpenTelemetry logs as learner truth.

K3 also must not reopen K2 or alter the learner-visible question bank merely to introduce evidence infrastructure.

---

## 4. Compatibility baseline

K3 must preserve, unless an explicit approved migration says otherwise:

- current learner-visible 1,120-question bank;
- current 7-domain structure;
- current 200-question full exam profile;
- AR/EN and RTL/LTR behavior;
- browser/API parity;
- offline/service-worker behavior;
- stable content IDs;
- current K1/K2 release/factory contracts;
- existing started assessment snapshots;
- existing StateV2 compatibility;
- current content-release digest semantics.

K3 must not reinterpret historical learner evidence under a new content version.

---

## 5. Core architecture

K3 adopts a hybrid evidence architecture:

```text
Learner interaction
      |
      v
Governed LearnerEvidenceEventV2
      |
      +--> local EvidenceStore
      |      +--> immutable event
      |      +--> mutable outbox metadata
      |
      +--> at-least-once synchronization
      |
      v
Authoritative EvidenceStore
      |
      +--> immutable raw event history
      +--> EvidenceStorageReceiptV1
      +--> integrity/reference findings
      |
      +--> versioned rebuildable projections
      |      +--> ActivityProjectionV1
      |      +--> AttemptProjectionV1
      |      +--> later K4/K5/K6/K8 models
      |
      +--> governed interoperability/export adapters
             +--> xAPI / external LRS
             +--> Caliper
             +--> sanitized Product Analytics bridge

Product Analytics Plane != Learner Evidence Plane != System Telemetry Plane
```

The raw event history is canonical learner evidence.

Attempt/activity projections are query conveniences and derived state. They are never a second source of truth.

---

## 6. Architectural invariants

K3 implementation must preserve all of these invariants:

1. accepted evidence is immutable under normal application operations;
2. correction appends new evidence; it does not rewrite old evidence;
3. privacy erasure/de-linking is an authorized privacy lifecycle, not a normal correction;
4. raw evidence never contains mastery/readiness/psychometric claims;
5. an event ID is identity/idempotency, not ordering;
6. exact event retry is safe;
7. same event ID with a different canonical body is an integrity conflict;
8. distinct event IDs are not heuristically deleted because they look similar;
9. offline evidence is first-class;
10. client wall-clock time is not trusted as global order;
11. ordering within an origin is explicit;
12. trusted storage order is store-local only;
13. event-to-content linkage uses exact immutable IDs already owned by K1/K2;
14. product analytics, learner evidence, and technical telemetry remain distinct;
15. external standards/vendors are adapters, not the canonical internal model;
16. legacy migration does not fabricate facts that were never recorded;
17. derived projections record their version and input watermark;
18. the same conformance corpus governs browser/file/SQLite/API behavior;
19. no hidden numeric calibration thresholds are embedded in core logic;
20. local evidence capture must not depend on network availability.

---

## 7. Event governance

### 7.1 Reuse of EventDefinition

K3 must reuse the K2 EventDefinition governance lineage rather than introduce a parallel event-definition registry.

K3 introduces a versioned successor equivalent to **EventDefinitionV2**.

EventDefinitionV1 remains valid for existing K2 product-analytics definitions.

### 7.2 EventDefinitionV2 logical fields

EventDefinitionV2 must include at least:

- `schema_version = 2`;
- `event_name`;
- `event_version`;
- `plane`;
- `purpose`;
- `owner`;
- `trigger_semantics`;
- `actor_kind`;
- `producer`;
- `required_context_fields`;
- `payload_schema_ref`;
- `properties`;
- event-level `privacy_class`;
- `retention_class`;
- `compatibility`;
- `created_at`.

Allowed `plane` values for EventDefinitionV2:

- `PRODUCT_ANALYTICS`;
- `LEARNER_EVIDENCE`.

System telemetry remains governed by TelemetrySink and does not become a third EventDefinition plane.

Allowed `actor_kind` values must include at least:

- `LEARNER`;
- `SYSTEM`;
- `MIGRATION`;
- `ADMINISTRATIVE`.

### 7.3 Property governance

Each payload property must retain K2-style governance:

- data type;
- required/optional status;
- privacy classification;
- export behavior.

For `LEARNER_EVIDENCE`, the export decision controls external/analytics export. It must not cause the canonical evidence store to redact a field that the learner-evidence definition itself requires.

`payload_schema_ref` is authoritative for nested payload structure and constraints. The EventDefinition `properties` map is authoritative for required/optional governance, privacy classification, and export disposition. The two definitions must agree on property names and top-level types; a registration-time mismatch is invalid.

Unknown payload properties are rejected unless the referenced payload schema explicitly permits them and the EventDefinition also contains governance metadata for them.

The learner-evidence validation path therefore must not reuse the current AnalyticsSink sanitization path as its canonical constructor.

### 7.4 Definition immutability

Once an event definition name/version is registered, its semantics are immutable.

A breaking semantic change requires a new `event_version` or a new event name.

---

## 8. LearnerEvidenceEventV2

K3 replaces new writes of aggregate LearnerEventV1 with **LearnerEvidenceEventV2**.

### 8.1 Required common envelope

Every LearnerEvidenceEventV2 must contain:

- `schema_version = 2`;
- `event_id`;
- `definition_id`;
- `learner_id`;
- `origin_id`;
- `origin_seq`;
- `activity_id`;
- `track_id`;
- `content_release_id`;
- `mode`;
- `locale`;
- `occurred_at`;
- `payload`.

### 8.2 Optional common context

The envelope may contain when applicable:

- `assessment_attempt_id`;
- `form_id`;
- `item_interaction_id`;
- `question_family_id`;
- `item_version_id`;
- `objective_id`;
- `domain_id`;
- `elapsed_ms`;
- `authority_ref`;
- `experiment_assignment_refs`.

EventDefinitionV2 `required_context_fields` determines which optional context fields become mandatory for that event type.

### 8.3 Identifier rules

For new K3-generated runtime identities:

- `event_id` must be an opaque UUIDv4;
- `origin_id` must be an opaque UUIDv4;
- `activity_id` must be an opaque UUIDv4;
- `assessment_attempt_id`, when created by K3-compatible runtime, must be an opaque UUIDv4;
- `item_interaction_id`, when present, must be an opaque UUIDv4.

Existing K1/K2 domain/content/release/form IDs retain their existing contracts and must not be replaced with UUIDs merely for K3.

Event IDs must never be parsed to infer event time, device, learner, content, or order.

### 8.4 Learner identity

`learner_id` is an opaque pseudonymous learner principal.

It must not directly contain:

- name;
- email address;
- phone number;
- national identifier;
- account token;
- raw IP address.

### 8.5 Origin identity

`origin_id` identifies the event-producing application/profile origin for synchronization and provenance.

It must be randomly generated and persisted.

It must not be constructed from browser/device fingerprint attributes.

### 8.6 Origin sequence

`origin_seq` must be a positive integer monotonically allocated within one `origin_id`.

Allocation of `origin_seq` and first persistence of the associated event must be atomic in the local store.

The authoritative store:

- may receive origin sequences out of order;
- may receive gaps;
- must not infer missing evidence merely from a gap;
- must detect reuse of the same `origin_id + origin_seq` for a different event ID as an integrity conflict.

### 8.7 Locale and timestamp

`locale` must be one of the locales declared by the applicable TrackManifest/content contract. K3 core must not hard-code the platform permanently to Arabic/English merely because the current track supports `ar` and `en`.

`occurred_at` is source occurrence time.

The event constructor must normalize it to UTC ISO-8601 before first durable persistence.

It is retained as evidence but must not be used as sole cross-device order.

### 8.8 Elapsed time

`elapsed_ms`, when present, represents monotonic elapsed duration measured by the producer.

It must not be reconstructed by subtracting untrusted wall-clock timestamps when a monotonic source was available.

K3 must not classify rapid guessing from elapsed time. Such interpretation belongs to later calibrated models.

---

## 9. Activity, assessment attempt, and item interaction identity

### 9.1 Activity

An `activity_id` represents one explicit learning workflow instance in one of the existing modes:

- learn;
- practice;
- check;
- section;
- mock.

Mode is context. It is not a separate event taxonomy.

### 9.2 Assessment attempt

`assessment_attempt_id` exists only when the workflow has a real assessment-attempt concept.

It is required for strict section/mock evidence bound to an AssessmentFormSnapshot.

Attempt identity is not attempt count.

`attempt_number` is derived or assessment-policy metadata and must not be used as the durable attempt identifier.

### 9.3 Item interaction

`item_interaction_id` represents one contiguous item-presentation/interaction episode.

A learner revisiting the same item after leaving it creates a new item-interaction identity when the product treats that revisit as a new exposure episode.

This allows multiple exposures to the same ItemVersion without inventing duplicate content identities.

---

## 10. K3 v1 event vocabulary

K3 v1 must support the following governed learner-evidence definitions.

Exact JSON payload schemas are implementation artifacts derived from this specification.

### 10.1 learner.activity.started

Trigger:
- once when a new learning/practice/check/section/mock workflow becomes active.

Required context:
- activity;
- learner;
- track;
- content release;
- mode;
- locale.

Assessment modes additionally require assessment attempt and form/snapshot context.

### 10.2 learner.activity.completed

Trigger:
- only when the application explicitly observes successful completion of the activity.

It must not be emitted merely because the browser page is hidden or closed.

For strict section/mock flows, `learner.assessment.submitted` is the authoritative learner submission event. `learner.activity.completed` is optional unless the product has a distinct post-submission completion state. AttemptProjection must not require both events to consider a submitted attempt submitted.

### 10.3 learner.assessment.submitted

Trigger:
- when a frozen assessment attempt is explicitly submitted under the assessment policy.

Required context:
- `assessment_attempt_id`;
- `form_id`;
- exact content release;
- mode;
- applicable exam/scoring policy references in payload.

An item with no accepted response at submission may later appear as unanswered in AttemptProjection. K3 must not synthesize raw `unanswered` events.

### 10.4 learner.item.presented

Trigger:
- once when an item-interaction episode first becomes learner-visible.

Required context:
- item interaction;
- family;
- ItemVersion;
- objective;
- domain;
- exact release;
- locale.

This event must not fire on every DOM rerender.

### 10.5 learner.item.skipped

Trigger:
- only when the product explicitly marks an item as skipped.

Navigating away from an unanswered item does not automatically mean skipped.

Skip is not an attempt count.

### 10.6 learner.response.recorded

Trigger:
- on each committed learner response or committed answer change.

Payload must include a versioned response representation.

For current multiple-choice content, the response must prefer stable canonical option identity/index rather than localized answer text.

Every answer change is a new event. Earlier responses are not overwritten.

For strict assessment attempts, this event also carries the assessment concurrency fields defined in Section 16.

### 10.7 learner.confidence.recorded

Trigger:
- when confidence is explicitly elicited and committed.

Confidence is self-report evidence only.

It must not be stored or interpreted as mastery/readiness.

### 10.8 learner.hint.requested

Trigger:
- when a hint is explicitly requested in a mode where hints are permitted.

A boolean `hint_used` is not sufficient for new K3 evidence.

### 10.9 learner.explanation.opened

Trigger:
- when an explanation is intentionally exposed/opened in a mode where explanation access is permitted.

Explanation exposure is context. It is not proof of learning.

### 10.10 learner.response.evaluated

Producer:
- trusted assessment/scoring component.

Trigger:
- when a recorded learner response is evaluated under an exact scoring rule/version.

Payload must include:

- `response_event_id`;
- scoring policy ID/version or equivalent stable reference;
- evaluation status;
- score/correctness only when the item/scoring contract defines them.

`authority_ref` is required in the event envelope for this authority-sensitive event and must not be duplicated as a second independently mutable payload value.

Allowed evaluation status must include at least:

- `GRADED`;
- `UNGRADABLE`;
- `INVALIDATED`.

The evaluation event must not rewrite the response event.

### 10.11 learner.assessment.mutation.resolved

Producer:
- trusted assessment-authority component.

Purpose:
- record whether a strict-assessment candidate mutation became authoritative.

Payload must include:

- `candidate_event_id`;
- `assessment_attempt_id`;
- client `base_attempt_revision`;
- authoritative revision before resolution;
- decision;
- authoritative revision after resolution when applied;
- reason code.

`authority_ref` is required in the event envelope.

Allowed decisions:

- `APPLIED`;
- `STALE`;
- `REJECTED`.

This event preserves the distinction between observed learner action and authoritative frozen-attempt state.

### 10.12 learner.evidence.correction.recorded

Producer:
- trusted correction/admin/system component.

Payload must include:

- `target_event_id`;
- `action`;
- `reason_code`.

`authority_ref` is required in the event envelope.

Allowed actions:

- `VOID`;
- `SUPERSEDE`.

For `SUPERSEDE`, payload must also contain `superseding_event_id`.

The superseding event is an independently valid learner-evidence event. The correction event does not embed a replacement event body.

Correction references may arrive before their target due to out-of-order synchronization. The raw correction may be stored, but it remains unresolved in projections until referenced events are available.

### 10.13 Deferred event types

Generic `activity.paused` and `activity.resumed` are not required K3 v1 events.

They may be introduced later through normal EventDefinition versioning when a concrete product flow can emit them reliably.

Browser visibility transitions alone must not be promoted into semantic pause/resume evidence.

---

## 11. Response representation

K3 response payloads must use a versioned structured representation.

Minimum response kinds:

- `OPTION`;
- `MULTI_OPTION`;
- `BOOLEAN`;
- `NUMBER`;
- `TEXT`;
- `STRUCTURED`.

Current multiple-choice questions use `OPTION`.

Free-text response storage is permitted only when the active item type actually requires text and the applicable privacy policy allows collection.

K3 must not store localized option text when stable option identity/index plus immutable form/item context is sufficient.

---

## 12. Exact content and snapshot linkage

K3 must reuse, not replace, existing stable contracts.

Applicable evidence must bind to the exact:

- `track_id`;
- `content_release_id`;
- `question_family_id`;
- `item_version_id`;
- `objective_id`;
- `domain_id`;
- `mode`;
- `locale`.

Strict assessment evidence additionally binds to:

- `form_id` from AssessmentFormSnapshotV1;
- `assessment_attempt_id`;
- exact option order/render context preserved by the form/snapshot;
- exam profile ID/version;
- scoring policy ID/version.

Learning/practice interactions must not fabricate `form_id` when no frozen form exists.

Published ItemVersion and release identities remain immutable.

---

## 13. Event immutability and fingerprinting

### 13.1 Canonicalization

The accepting store must calculate a trusted event fingerprint from the complete immutable event body using:

1. RFC 8785 JSON Canonicalization Scheme;
2. SHA-256.

Conceptually:

```
fingerprint = SHA256(JCS(event))
```

The accepting store must calculate the fingerprint itself.

A client-provided hash is not authoritative.

### 13.2 Fingerprint purpose

Fingerprint is used only to:

- verify exact retry;
- detect event-ID/body conflict;
- support audit/integrity checks.

It must not be used to heuristically deduplicate different event IDs.

---

## 14. EvidenceStorageReceiptV1

Every EvidenceStore acceptance operation returns **EvidenceStorageReceiptV1**.

Logical fields:

- `schema_version = 1`;
- `store_id`;
- `event_id`;
- `event_fingerprint`;
- `disposition`;
- `accepted_at`;
- `store_seq`, when the event exists in the store;
- `reason_code`, when not accepted cleanly;
- `warnings`.

Allowed dispositions:

- `ACCEPTED`;
- `DUPLICATE`;
- `CONFLICT`;
- `REJECTED`.

Rules:

- ACCEPTED means a new immutable event was stored;
- DUPLICATE means the same event ID and same trusted fingerprint already exist;
- CONFLICT means the same event ID or origin sequence identity conflicts with a different event/body;
- REJECTED means the event failed structural/schema/policy/authorization acceptance.

The source event is never mutated to add receipt metadata.

For a DUPLICATE exact retry, the receipt must return the original stored event's `event_fingerprint`, `accepted_at`, and `store_seq`. The retry observation time is transport/telemetry metadata and must not replace the original acceptance time.

`accepted_at` is store-reported wall-clock time. Ordering authority comes from `store_seq`, not from comparing `accepted_at` across stores.

---

## 15. Store-local ordering

Every durable EvidenceStore has a stable `store_id`.

Every newly accepted event receives a monotonically increasing positive `store_seq` within that store.

`store_seq`:

- is trusted for replay within one store;
- is not a global causal clock;
- may have gaps after authorized privacy deletion or administrative maintenance;
- must not be compared across different `store_id` values.

A projection watermark is therefore at least:

```
(store_id, through_store_seq)
```

---

## 16. Strict assessment concurrency

K3 adopts optimistic revision preconditions for strict frozen assessments.

### 16.1 Candidate response

Any learner response event that can change authoritative state for a strict section/mock attempt must carry:

- `base_attempt_revision`;
- `proposed_attempt_revision`.

Rules:

- first mutable attempt event starts from the assessment engine's known base revision;
- `proposed_attempt_revision = base_attempt_revision + 1`;
- an offline client may advance its local provisional revision after every locally committed candidate mutation;
- events from the same origin must preserve their local revision chain.

### 16.2 Resolution

The assessment-authority component processes candidate mutations deterministically.

For candidate branches with a matching authoritative base revision:

- one mutation may be APPLIED;
- authoritative revision advances to its proposed revision.

For a candidate whose base revision no longer matches:

- raw learner action remains stored;
- the authority emits `learner.assessment.mutation.resolved` with `STALE`;
- the stale candidate does not overwrite authoritative attempt state.

### 16.3 Ordering rule

The authority must not use client `occurred_at` to choose between conflicting device branches.

For same-origin offline chains, the authority must respect `origin_seq` and revision-chain order.

For conflicting origins at the same base revision, the authoritative store acceptance/resolution order is the deterministic tie-break unless a later approved assessment policy defines a stronger handoff/lease rule.

### 16.4 Device handoff

An online device taking over a strict attempt should first fetch the current authoritative revision.

An offline second device may create a competing branch, but the conflict must be surfaced and resolved explicitly on synchronization.

No silent latest-write-wins behavior is allowed.

---

## 17. Local-first browser evidence

### 17.1 IndexedDB

The browser reference implementation must use IndexedDB for:

- immutable learner events;
- store sequence metadata;
- mutable outbox records;
- receipts/acknowledgements required for recovery;
- projection checkpoints where appropriate.

### 17.2 Atomicity

Creating a local event must atomically:

1. allocate the next origin sequence;
2. persist the immutable event;
3. create/update the outbox reference when sync is enabled.

The UI must not claim an interaction is durably recorded before local persistence succeeds.

### 17.3 Storage durability

When the browser is retaining unsynchronized learner evidence and the Storage API is available, the adapter must attempt to request persistent storage unless an explicit deployment/privacy policy disables that request. A browser denial is not fatal, but the reduced durability capability must be observable.

It must monitor storage/quota risk when practical.

It must not intentionally purge unsynchronized evidence because of a hidden age threshold.

If durable local storage cannot be maintained, the application must surface a recoverable storage-risk state rather than silently losing evidence.

### 17.4 Background Sync

Background Sync, Workbox, service-worker retry, or equivalent may improve delivery.

They are optional transport accelerators.

Evidence correctness must not depend on their availability.

---

## 18. EvidenceOutboxRecordV1

Transport state is mutable and separate from immutable evidence.

Logical fields:

- `schema_version = 1`;
- `event_id`;
- `state`;
- `attempt_count`;
- `last_attempt_at`;
- `next_attempt_at`, if applicable;
- `last_disposition`;
- `last_reason_code`;
- `authoritative_store_id`;
- `authoritative_store_seq`.

Allowed state must include:

- `PENDING`;
- `IN_FLIGHT`;
- `ACKNOWLEDGED`;
- `BLOCKED`.

Rules:

- ACCEPTED and DUPLICATE may transition transport state to ACKNOWLEDGED;
- CONFLICT and REJECTED transition to BLOCKED until explicitly resolved/retried under policy;
- retry preserves the original event ID and event body;
- retry scheduling is configurable policy, not a hidden constant.

---

## 19. Synchronization contract

### 19.1 Push

The synchronization port must support batch push.

A batch response returns one EvidenceStorageReceiptV1 per input event.

A failed event must not erase or roll back safe accepted siblings.

### 19.2 Pull

Cross-device synchronization requires a pull/read capability from the authoritative store.

The logical pull contract is:

- scoped to the authorized learner principal;
- ordered by authoritative `store_seq`;
- cursor/watermark based;
- resumable after interruption;
- deterministic under repeated reads.

### 19.3 Authorization boundary

`learner_id` is not authentication.

The existing `X-Anon-Id` model must not be treated as sufficient proof of cross-device account ownership.

Any production server-backed cross-device sync must call an authorization/identity layer that proves the requester may read/write the relevant learner principal.

If no such identity/authorization mechanism is configured, K3 must remain local-only rather than exposing learner history by guessable/portable identifier.

### 19.4 Sync enablement

The same canonical evidence event may remain local-only or become sync-eligible according to the active privacy/account/deployment policy.

Sync policy is transport policy. It does not change the event's pedagogical semantics.

---

## 20. Late and out-of-order evidence

The authoritative store must accept structurally valid late evidence even when:

- its `occurred_at` is older than already processed events;
- a higher origin sequence arrived first;
- related events arrive later.

Late arrival must not cause timestamp rewriting.

Projections must be able to incorporate late evidence deterministically.

Material unresolved references become integrity warnings and must not silently produce derived learner claims.

No hard-coded clock-skew tolerance is part of K3 core.

---

## 21. Correction and supersession

Accepted raw events are immutable under normal application operations.

Correction is represented only by `learner.evidence.correction.recorded`.

Projection logic must resolve correction chains deterministically.

Rules:

- VOID excludes the target from current-valid projections while retaining audit history;
- SUPERSEDE makes the referenced superseding event current when all references are valid;
- a correction must not change the target event bytes;
- conflicting or cyclic correction graphs are integrity failures;
- correction authority must be explicit and validated.

Privacy deletion is not implemented by emitting VOID.

---

## 22. Learner identity linking

K3 must not rewrite raw event `learner_id` when identities are later linked.

K3 introduces a dedicated governed identity-link record equivalent to **LearnerIdentityLinkRecordV1** outside the learner-evidence event store.

Logical fields:

- `schema_version = 1`;
- `identity_link_record_id`;
- `link_id`;
- `action`;
- `source_learner_id`;
- `target_learner_id`;
- `effective_at`;
- `authority_ref`;
- `reason_code`;
- `predecessor_record_id`, when applicable;
- `created_at`.

Allowed actions:

- `LINK`;
- `UNLINK`.

Identity links operate only on pseudonymous learner principals.

Direct account PII remains in the separate identity/account layer.

Projection readers use an IdentityResolverPort or equivalent governed resolver.

Raw historical events remain attached to the original learner principal that emitted them.

---

## 23. Privacy and data minimization

### 23.1 Default exclusions

K3 canonical evidence must not collect by default:

- name;
- email;
- phone;
- national identifiers;
- raw IP address;
- access tokens;
- raw session/authentication tokens;
- browser/device fingerprint;
- arbitrary free-text notes;
- unnecessary User-Agent/device strings.

### 23.2 Necessary free text

A learner response may contain text only when the active item type requires a textual response.

Such fields require explicit privacy classification and export rules.

### 23.3 Retention

Every learner-evidence event definition must have a retention class.

Exact retention duration is deployment/legal policy and must not be hard-coded in K3 core.

### 23.4 Privacy lifecycle

K3 must support authorized:

- local deletion;
- server deletion;
- identity de-linking;
- export deletion/propagation where supported;
- projection invalidation/rebuild.

Ordinary application users/components must not gain a generic update/delete API over raw evidence merely because the privacy subsystem has privileged lifecycle operations.

### 23.5 Replay after erasure

After lawful deletion/de-linking, the system must not claim complete historical replay if required evidence no longer exists.

Derived models must be invalidated or rebuilt from the lawful remaining evidence set.

Privacy lifecycle handling must also cover associated learner-linkable fingerprints, receipts, export-ledger records, and projection caches according to the active policy; retaining a hash or receipt must not become an undocumented substitute for retaining deleted learner data.

---

## 24. Product analytics boundary

The existing generic `/v1/events`, EventRegistry validation, and AnalyticsSink belong to Product Analytics.

K3 learner evidence must not be written through AnalyticsSink.

A learner-evidence event may be transformed into a product-analytics event only through an explicit bridge that:

1. reads a governed learner-evidence definition;
2. applies property-level export policy;
3. removes/redacts non-exportable learner data;
4. produces a separate analytics event identity;
5. records enough mapping metadata for audit when required.

Analytics deletion/dedup behavior does not alter canonical learner evidence.

---

## 25. System telemetry boundary

Technical reliability signals use TelemetrySink/OpenTelemetry-compatible adapters.

Examples:

- evidence-store latency;
- sync failures;
- outbox depth;
- storage-quota warnings;
- batch retry counts;
- projection rebuild duration.

Telemetry may reference opaque correlation IDs where needed, but it must not become the learner record.

Logs/traces must not include full learner evidence payloads by default.

---

## 26. Experiment linkage

K3 reuses K2 ExperimentRecordV1 and feature-flag/assignment adapters.

LearnerEvidenceEventV2 may carry `experiment_assignment_refs`.

These are stable internal assignment references, not vendor payloads.

Rules:

- assignment reference is context only;
- cohort membership remains derived;
- K3 does not infer causal impact;
- product exposure/flag telemetry remains in Product Analytics unless a stable assignment reference is necessary to interpret learner evidence.

---

## 27. EvidenceStore port

K3 introduces one logical persistence contract equivalent to:

```text
EvidenceStore
  accept(event) -> EvidenceStorageReceiptV1
  acceptBatch(events) -> EvidenceBatchResultV1
  getById(event_id) -> event | null
  read(after_store_seq?, filters?) -> ordered events + next watermark
```

Every adapter must implement equivalent semantics.

### 27.1 Acceptance checks

At minimum:

- supported event schema version;
- known/valid event definition;
- required context;
- payload schema;
- event UUID format;
- origin UUID/sequence validity;
- event ID idempotency;
- origin-sequence uniqueness;
- privacy/collection policy;
- producer/authority constraints.

Content/event references that are syntactically valid but temporarily unresolved must not be silently rewritten.

They may be accepted with an integrity warning and excluded from affected projections until resolved.

### 27.2 Batch result

EvidenceBatchResultV1 must preserve input-event identity and per-event receipt/disposition.

Batch order must not become a hidden global order.

---

## 28. Reference persistence adapters

### 28.1 JSONL/file

JSONL remains a deterministic reference/export adapter.

It must:

- append immutable events;
- maintain or derive a monotonic store sequence;
- reject event-ID conflicts;
- support idempotent exact retry;
- provide indexed/sidecar support if needed to avoid full-file duplicate scans at meaningful scale.

A full-file O(n) scan is not an acceptable long-term production path.

### 28.2 SQLite

SQLite is the reference server/local relational adapter.

The logical event table must persist at least indexed columns for:

- `store_seq`;
- `event_id`;
- `event_fingerprint`;
- `learner_id`;
- `origin_id`;
- `origin_seq`;
- `definition_id`;
- `activity_id`;
- `assessment_attempt_id`;
- `item_interaction_id`;
- `track_id`;
- `content_release_id`;
- `form_id`;
- `question_family_id`;
- `item_version_id`;
- `objective_id`;
- `domain_id`;
- `mode`;
- `locale`;
- `occurred_at`;
- `accepted_at`;
- immutable canonical event JSON.

Required logical constraints/indexes:

- primary/unique `event_id`;
- unique `origin_id + origin_seq`;
- learner + store sequence;
- activity + store sequence;
- assessment attempt + store sequence;
- item version + store sequence;
- content release + store sequence;
- definition + store sequence.

Additional indexes require measured query evidence.

### 28.3 Browser IndexedDB

IndexedDB must expose the same logical semantics and conformance outcomes as SQLite/JSONL.

Adapter-specific storage layout may differ.

### 28.4 Future PostgreSQL

A PostgreSQL adapter is allowed later without changing canonical K3 contracts.

It is not required unless deployment/scale evidence justifies it.

---

## 29. Projection model

K3 projections are deterministic derived views over raw evidence.

### 29.1 Projection metadata

Every durable projection must record at least:

- projection type;
- projection schema/version;
- source `store_id`;
- `through_store_seq`;
- algorithm/policy version;
- generated_at.

Where applicable it must also retain:

- release/form/scoring references;
- unresolved-reference count/status;
- identity-resolution version.

### 29.2 ActivityProjectionV1

ActivityProjectionV1 may summarize:

- activity identity;
- mode;
- learner principal;
- content release;
- activity start;
- explicit completion/submission;
- item interactions;
- observed responses;
- explicit hint/explanation/confidence evidence;
- integrity/unresolved status.

It must not contain mastery/readiness.

### 29.3 AttemptProjectionV1

AttemptProjectionV1 may summarize:

- assessment attempt;
- form snapshot;
- authoritative revision;
- current accepted response per item;
- response history references;
- evaluation references;
- explicit submitted/completed state;
- unanswered items derived at submission;
- conflict/stale mutation records;
- scoring result only as a versioned evaluation projection.

It must never destroy the underlying response history.

### 29.4 Correction-aware projection

All current-valid projections must resolve applicable VOID/SUPERSEDE chains before selecting current evidence.

Unresolved, cyclic, or unauthorized correction chains must make the affected projection incomplete/conflicted rather than silently choosing a value.

### 29.5 Session/abandonment

K3 does not define a raw session-end or abandonment event.

Any sessionization or abandonment indicator is a derived projection under an explicit versioned policy.

No universal inactivity timeout is part of K3 core.

---

## 30. Replay and future K4/K5/K6/K8 consumption

Later learner models must consume K3 evidence through a read/projection interface.

They must record at least:

- their own model/algorithm version;
- source evidence store;
- input watermark;
- applicable content/scoring/model policy references.

Changing a later algorithm must not rewrite K3 evidence.

Late-arriving or corrected evidence must permit deterministic recomputation.

K3 does not mandate that every future model be replayed synchronously on each write.

---

## 31. Schema and event evolution

### 31.1 Envelope version

Breaking changes to LearnerEvidenceEvent require a new schema version.

### 31.2 Event-type version

Breaking changes to a specific event's semantics/payload require a new EventDefinition event version or new event name.

### 31.3 Historical bodies

Normal migrations must not destructively rewrite persisted historical event bodies.

Readers may apply deterministic upcasters/read adapters in memory.

### 31.4 Compatibility tests

The test corpus must retain fixtures for every supported historical event version, not only the latest version.

---

## 32. LearnerEventV1 legacy handling

LearnerEventV1 remains a supported read-only legacy evidence contract.

After K3 activation:

- no new canonical learner-evidence writes use LearnerEventV1;
- historical V1 records are not exploded into fake fine-grained events;
- a LegacyLearnerEventReader or equivalent exposes V1 as coarse aggregate evidence to compatible projections.

### 32.1 Validator drift

The repository currently has known LearnerEventV1 validator drift:

- JSON Schema requires `answer` and `confidence`;
- JS runtime validator does not require either;
- Python/SQLite validator requires `answer` but not `confidence`.

The K3 legacy reader must explicitly classify historical records:

- `VALID_V1`;
- `KNOWN_V1_VARIANT`;
- `INVALID_LEGACY_RECORD`.

Known variants must preserve missing fields as missing.

They must not invent `answer`, `confidence`, exposure sequence, hint order, or other missing facts.

The JSON Schema remains the normative V1 schema; known variants are migration compatibility, not a redefinition of V1.

---

## 33. StateV2 transition

K3 must not synthesize historical fine-grained events from StateV2.

For an assessment already active when K3 is introduced:

- keep the existing StateV2 compatibility path until that attempt is submitted/discarded;
- do not backfill item presentation or answer-change events that were never recorded;
- do not silently assign historical timestamps;
- new activities started after K3 activation use the K3 evidence path.

Legacy exam history remains readable and attributable to its historical StateV2 contract.

A future separate migration may normalize legacy history only if it preserves provenance and granularity limitations.

---

## 34. Identity transition and anonymous mode

The platform must remain usable in anonymous/local-first mode where practical.

### 34.1 Local anonymous mode

When no authenticated/sync identity is available:

- learner evidence remains local;
- the local pseudonymous learner ID is valid only within its configured scope;
- no cross-device ownership claim is made.

### 34.2 Linked/server mode

When a trusted identity mechanism exists:

- it may establish a server-backed pseudonymous learner principal;
- multiple origins may emit under that learner principal;
- prior anonymous principals may be linked through LearnerIdentityLinkRecordV1 under explicit authority.

K3 itself does not implement login/password/OAuth.

---

## 35. Interoperability

### 35.1 Existing port

K3 must extend/reuse the existing `LearningEventExchangePort`.

It must not create a vendor-specific core interface.

### 35.2 xAPI 2.0

xAPI is an interoperability/export target.

The adapter must:

- use a versioned mapping artifact;
- map only supported K3 semantics;
- use pseudonymous actor identity;
- preserve K3 occurrence timestamp semantics;
- let the LRS assign its own stored/receipt time;
- preserve registration/attempt context where meaningful;
- report omitted/unmapped fields explicitly.

An external conformant LRS may be used.

K3 must not implement a custom LRS.

### 35.3 Caliper 1.2

Caliper is an education/assessment interoperability target.

The adapter must preserve where applicable:

- assessment lifecycle;
- assessment-item lifecycle;
- Attempt;
- Response;
- Started/Skipped/Completed/Submitted semantics.

A skipped item must not be silently converted into an attempt.

### 35.4 QTI 3

QTI remains an assessment content/result/scoring exchange standard.

It is not K3 raw-event persistence.

### 35.5 Imports

Imported xAPI/Caliper evidence must:

- pass a governed import mapping;
- retain source/provenance and mapping version;
- identify the producer as an interoperability import;
- never fabricate unavailable K3 fields;
- reject or abstain on unsupported semantics.

Imported external records are not automatically equivalent to first-party learner evidence merely because they conform to a standard.

Canonical import is allowed only when the external record can be mapped without invention to the required K3 learner/activity/track/release/content context. If exact required K3 context is unavailable, the adapter must reject/abstain from canonical import or retain the record in a separate external-evidence staging area; it must not fabricate a local activity, release, item, or objective identity.

When a canonically importable standard record does not contain native K3 `origin_id/origin_seq`, the import adapter may assign a dedicated importer origin and importer sequence representing **import processing order only**. It must retain the external statement/event identifier and original occurrence timestamp in provenance. The importer sequence must never be presented as the source system's original causal order.

---

## 36. Export ledger

K3 introduces a governed append-only record equivalent to **EvidenceExportRecordV1** for learner-evidence exports that leave the canonical store.

Logical fields:

- `schema_version = 1`;
- `export_record_id`;
- `event_id`;
- `adapter_id`;
- `adapter_version`;
- `destination_class`;
- `mapping_version`;
- `action`;
- `external_ref`, when available;
- `occurred_at`;
- `privacy_disposition`;
- `reason_code`, when applicable;
- `predecessor_record_id`, when applicable.

Allowed lifecycle actions must include:

- `EXPORTED`;
- `DELETE_REQUESTED`;
- `DELETED`;
- `DELETION_UNSUPPORTED`;
- `DELETION_FAILED`.

A deletion request or outcome is a new lifecycle record; it does not overwrite the original export record.

Purpose:

- audit which learner evidence left the canonical plane;
- support privacy deletion propagation;
- separate canonical evidence identity from external vendor IDs.

Before learner-linked export is enabled for a destination, the deployment must know whether the destination supports deletion/de-identification. If it does not, that limitation must be recorded and surfaced in deployment/privacy policy rather than silently assumed away.

This record is governance metadata, not learner mastery evidence.

---

## 37. Data-quality and integrity monitoring

K3 must provide deterministic integrity checks for at least:

- unsupported event schema;
- unknown event definition;
- invalid required context;
- duplicate event ID with different fingerprint;
- duplicate origin sequence with different event;
- invalid UUID/runtime identity;
- cyclic/conflicting corrections;
- unresolved correction/evaluation target;
- unauthorized evaluator/correction authority;
- stale strict-assessment mutation resolution;
- unsupported migration variant;
- privacy/export violation;
- projection watermark regression.

The following are warnings/signals, not automatic invalidation:

- late arrival;
- out-of-order origin arrival;
- clock divergence;
- unusual latency;
- duplicate-looking distinct events;
- incomplete activity lifecycle.

Numeric anomaly thresholds remain versioned policy/calibration.

Persistent material issues may create existing ImprovementFindingV1 records rather than inventing a separate general finding system.

Technical metrics go to TelemetrySink.

---

## 38. Security boundary

K3 learner evidence is learner-linked data.

Server implementation must defend against:

- broken object-level authorization;
- cross-user evidence reads;
- forged learner IDs;
- replay abuse;
- bulk export abuse;
- unrestricted event injection;
- excessive payload size;
- malicious free-text payloads;
- privilege escalation for evaluation/correction events.

Rules:

- producer/authority-sensitive event types must not be accepted from ordinary learner clients;
- server must derive or verify learner scope from the authorized identity context;
- `learner_id` in an event cannot by itself authorize a write;
- administrative correction/evaluation authorities must be explicitly controlled;
- payload and batch sizes require configurable limits;
- no access token/session secret may be written into learner evidence.

Exact rate/batch limits are deployment configuration.

---

## 39. Failure handling

### Local persistence failure

If local event persistence fails:

- do not pretend the evidence is durable;
- surface a recoverable error/state;
- do not silently continue as though the interaction was recorded.

### Network failure

- keep the event locally;
- leave the outbox retryable;
- do not create a new event ID on retry.

### Partial batch

- preserve accepted siblings;
- retain blocked/retryable events separately;
- return per-event dispositions.

### Duplicate retry

- acknowledge as DUPLICATE;
- do not create a second raw fact.

### Integrity conflict

- block automatic overwrite;
- preserve local conflicting event for recovery/diagnostics;
- surface a governed conflict reason.

### Projection failure

- raw evidence remains authoritative;
- projection may be marked stale/failed;
- rebuild can resume from a prior valid watermark.

---

## 40. Browser/file/SQLite/API parity

K3 must have one authoritative cross-adapter conformance corpus.

Every supported adapter must run the same logical cases:

1. valid base event;
2. invalid schema;
3. unknown definition;
4. exact idempotent retry;
5. event-ID different-body conflict;
6. origin-sequence conflict;
7. late event;
8. out-of-order origin event;
9. multiple devices with distinct valid events;
10. answer change chain;
11. explicit skip;
12. unanswered-at-submit projection;
13. confidence/hint/explanation evidence;
14. response/evaluation separation;
15. correction VOID;
16. correction SUPERSEDE;
17. correction-before-target;
18. strict-assessment applied mutation;
19. strict-assessment stale mutation;
20. partial batch;
21. offline queue retry;
22. privacy/export rejection;
23. legacy V1 valid record;
24. legacy V1 known validator variant;
25. legacy invalid record;
26. projection replay/watermark;
27. late evidence projection rebuild;
28. cross-language sibling-item evidence;
29. export mapping with declared loss;
30. privacy lifecycle projection invalidation.

Equivalent logical input must produce equivalent logical disposition/projection across:

- browser IndexedDB;
- JSONL/file;
- SQLite;
- server/API adapter.

---

## 41. Query requirements

K3 must support efficient queries for at least:

- events for one learner after a watermark;
- events for one activity;
- events for one assessment attempt;
- events for one ItemVersion;
- events for one content release;
- events by definition/type;
- direct event ID lookup;
- response/evaluation/correction relationship resolution.

Query design must not require scanning the entire event store for these core paths.

More specialized analytics queries may use projections/export systems rather than inflating the raw store interface.

---

## 42. Performance and scale rules

K3 remains modular-monolith architecture.

Do not introduce distributed infrastructure without measured need.

The implementation must measure at least:

- local event-write latency;
- sync batch latency;
- duplicate lookup latency;
- projection replay throughput;
- raw event count/storage growth;
- IndexedDB quota pressure;
- SQLite query/index behavior.

No global event-count threshold is hard-coded into architecture.

Scaling decisions are evidence-driven.

---

## 43. Configurable policy boundary

The following must remain policy/configuration, not hidden constants:

- sessionization timeout;
- inferred abandonment cutoff;
- clock-skew alert threshold;
- unusual latency threshold;
- sync batch size;
- sync retry/backoff;
- offline retention after authoritative acknowledgement;
- privacy retention duration;
- storage quota warning threshold;
- API rate/payload limits;
- strict-assessment handoff/lease enhancement if later introduced;
- PostgreSQL/partition adoption thresholds;
- external export destinations;
- xAPI Profile identifiers;
- analytics retention.

Policy versions must be auditable where they affect interpretation or lifecycle.

---

## 44. Current runtime transition

K3 implementation must preserve current learner behavior until each evidence path is introduced under tests.

Current exam answer state must not be deleted simply because a new event store exists.

The event system may initially shadow/dual-observe a supported path during migration, but:

- the shadow path must not change scoring;
- duplicate writes must be detected;
- one source of truth for each responsibility must be documented;
- shadow telemetry must not be mistaken for learner evidence.

A cutover must be explicit and tested.

---

## 45. Required logical contracts

The implementation plan may refine filenames but must implement contracts equivalent to:

- EventDefinitionV2;
- LearnerEvidenceEventV2;
- EvidenceStorageReceiptV1;
- EvidenceBatchResultV1;
- EvidenceOutboxRecordV1;
- ActivityProjectionV1;
- AttemptProjectionV1;
- LearnerIdentityLinkRecordV1;
- EvidenceExportRecordV1;
- EvidenceStore port;
- EvidenceSync port;
- IdentityResolver port or equivalent;
- learner-evidence validation/registry path;
- legacy LearnerEventV1 reader/adapter;
- versioned xAPI/Caliper mapping artifacts.

Do not create a new contract when an existing K1/K2 contract can be reused without ambiguity.

---

## 46. Testing requirements

K3 implementation must include RED→GREEN tests for at least:

### Contract/schema
- every new schema valid/invalid fixture;
- EventDefinitionV1 compatibility;
- EventDefinitionV2 immutability;
- forbidden derived fields.

### Idempotency/integrity
- exact retry;
- same ID/different body;
- same origin sequence/different ID;
- canonical JCS/SHA-256 equality.

### Offline/sync
- local-first persistence before network;
- network failure/retry;
- browser restart recovery;
- partial batch;
- pull resume from watermark;
- late/out-of-order sync;
- multi-device distinct evidence.

### Strict assessment
- local revision chain;
- competing device branch;
- APPLIED/STALE resolution;
- no timestamp LWW;
- exact form/item/scoring linkage.

### Corrections
- VOID;
- SUPERSEDE;
- correction-before-target;
- cyclic/conflicting correction rejection.

### Projection
- deterministic rebuild;
- watermark;
- answer changes;
- unanswered at submission;
- response/evaluation separation;
- late-event rebuild.

### Privacy/security
- forbidden PII fields;
- export redaction/rejection;
- unauthorized evaluation/correction;
- cross-user sync authorization failure;
- deletion/de-link projection invalidation.

### Migration
- LearnerEventV1 valid;
- known validator variants;
- invalid legacy record;
- StateV2 active-attempt compatibility;
- no invented historical fine-grained evidence.

### Interoperability
- supported xAPI mapping;
- supported Caliper mapping;
- declared lossy mapping;
- import provenance;
- external LRS remains optional.

### Regression
- current learner-visible bank unchanged unless a separately governed release changes it;
- AR/EN/RTL/LTR;
- browser/API parity;
- offline/service-worker;
- existing K1/K2 tests;
- active assessment compatibility.

---

## 47. Acceptance criteria

K3 is complete only when all of the following are true:

1. approved K3 contracts are implemented and validated;
2. new learner evidence is fine-grained and immutable;
3. exact retries are idempotent;
4. event-ID/body conflicts cannot overwrite history;
5. origin ordering is explicit;
6. client wall-clock time is not used as global order;
7. local-first offline evidence survives ordinary network interruption;
8. browser sync does not depend on Background Sync availability;
9. multi-device ordinary practice preserves distinct valid evidence;
10. strict assessment conflicts use revision-based explicit resolution;
11. raw responses are separate from scoring/evaluation evidence;
12. corrections are append-only and auditable;
13. exact content/release/form/item linkage is preserved;
14. privacy lifecycle is separate from correction semantics;
15. learner/product/telemetry planes remain separate;
16. browser/JSONL/SQLite/API pass the same conformance corpus;
17. legacy LearnerEventV1/StateV2 are handled without invented history;
18. projections are rebuildable/versioned/watermarked;
19. xAPI/Caliper remain adapter mappings, not canonical storage;
20. no custom LRS/event bus/CRDT infrastructure is introduced without evidence;
21. repository documentation is updated with zero tribal knowledge;
22. whole-plan review has no open Critical/Important findings;
23. exact-head tests pass;
24. merge is reviewed;
25. post-merge runtime/deployment verification passes before K4 design begins.

No aggregate engagement metric or derived learner score can satisfy K3 acceptance.

---

## 48. Deferred calibration/deployment decisions

The following are intentionally not fixed by this spec:

- retention durations;
- session/abandonment timeout;
- clock-skew tolerance;
- anomaly thresholds;
- event batching size;
- retry intervals/backoff;
- local acknowledged-event cleanup schedule;
- storage quota warning level;
- production database choice beyond approved adapters;
- production identity/auth provider;
- xAPI LRS vendor;
- final xAPI Profile URIs;
- final analytics vendor;
- final cross-border/export deployment configuration.

These are governed policy/deployment inputs, not missing architecture.

---

## 49. Future-programme boundary

K3 must stop at trusted evidence and replayable projections.

The dependency order remains:

```
K3 — Learner Evidence Engine
  ↓
K4 — Next-Best-Action / Spaced Practice
  ↓
K5 — Mastery & Readiness Projections
  ↓
K6 — Psychometric Calibration
  ↓
K7 — Grounded Pedagogical AI Tutor
K8 — Advanced Adaptive Assessment / CAT
  ↓
K9 — Multimodal & Ecosystem Integrations
```

K4/K5/K6/K8 may consume K3 evidence.

They must not cause K3 to embed their derived truth into raw events.

---

## 50. Governance ruling

K3 adopts this durable ruling:

> **Own the education-specific evidence semantics and integrity rules; reuse mature storage, browser, interoperability, analytics, and telemetry mechanisms behind vendor-neutral ports. Preserve raw learner actions before interpreting them.**

Consequences:

- K3 uses event-sourcing principles only for the learner-evidence domain;
- K3 does not convert the whole platform into an event-sourced distributed system;
- K3 does not use analytics clickstream as the learner record;
- K3 does not let convenience projections overwrite raw evidence;
- K3 does not invent historical facts during migration.

---

## 51. Approval gate

Explicit approval of this written specification authorizes the next step only:

1. invoke the Superpowers `writing-plans` skill;
2. create the detailed K3 implementation plan;
3. present that plan for explicit approval and execution-method selection.

Until that approval occurs:

- no K3 production code;
- no TDD implementation tasks;
- no implementation branch;
- no dependency installation;
- no merge;
- no learner-visible behavior change.

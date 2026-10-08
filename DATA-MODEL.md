# Data Model

This document preserves the implemented Programme A contracts and records the separately implemented K2 and K3 contracts. Read `docs/superpowers/state/CURRENT-STATE.json` for live K3 task position; the approved specification governs semantics. Full competency authoring, calibrated mastery/readiness, protected assessment delivery, and advanced question-family generation remain distinct programmes.

## TrackManifestV1

Path: `tracks/<track-id>/manifest.json`

Implemented responsibilities:

- track ID/version/status;
- unofficial/official status metadata;
- locales and core compatibility;
- content references;
- exam-profile references;
- default exam profile.

The current track ID is `sdaia-ai-engineer`.

## ExamProfileV1

Implemented responsibilities:

- stable profile ID and track ID;
- version;
- evidence status;
- full-exam question count;
- allowed section sizes;
- domain weights.

The current default profile is project-reference/unverified. Code must consume profile values rather than duplicate them.

## RuntimeBundleV2

Public logical bundle shared by browser/API:

```text
contract_version
track
exam_profile
concepts
learn
cases
```

`contract_version` is currently 2.

## Stable rendered-question identity

Generated questions use stable namespaced IDs plus `family_id` and `track_id`. Identity is based on stable content semantics rather than array position.

Legacy generated IDs are mapped in:

`data/migrations/sdaia-generated-v2-question-ids.json`

The mapping is migration data, not a second active identity scheme.

## StateV2

Canonical schema: `data/schema/state-v2.schema.json`.

Top-level fields:

- `version = 2`;
- `anon_id`;
- `created_at`, `updated_at`;
- `preferences`;
- `tracks`;
- `legacy`.

Per-track state carries `track_version`, optional active exam, and exam history. Active exam payloads preserve question IDs plus keyed answers/confidence/flags/option orders.

## Legacy migration input

`data/legacy/static-bank-v1/` retains the former 121-question bank and sessions. It is not an active RuntimeBundleV2 source and is not part of the public Pages artifact.

## Not yet implemented

Programme A does **not** claim implementation of:

- the full future competency/objective/question-family authoring model;
- the 14,000+ content expansion;
- production learner mastery/readiness engine;
- protected assessment delivery;
- authentication/authorization;
- multi-tenant/SaaS data contracts.


## K3 Learner Evidence Engine (implemented through Task 36)

Canonical schema: `data/schema/learner-evidence-event-v2.schema.json` (`LearnerEvidenceEventV2`). Event definitions, their governed payload contracts and runtime context are validated in `src/evidence/acceptance.js`, generated validators in `src/evidence/generatedValidators.js`, and the `RuntimeEvidenceContextV1` runtime bundle context. **Raw evidence is immutable observation**, never a mastery/readiness estimate. Existing `LearnerEventV1` and `StateV2` remain valid for their historical use; legacy imports are explicitly marked coarse/partial and must **not invent legacy events, order or answers**.

- `LearnerEvidenceEventV2`: pseudonymous `learner_id`, `event_id` (UUIDv4), `definition_id`, `actor_kind`/producer context, `origin_id` and monotonic `origin_seq`, activity/attempt linkage, exact track, release/form/item version and the governed definition payload. Client occurrence timestamps are evidence, **not** global ordering. Ordinary browser capture may only create LEARNER events; trusted SYSTEM evaluation needs distinct producer authority.
- `EvidenceStorageReceiptV1` / `EvidenceBatchResultV1`: `event_id`, canonical RFC 8785/JCS SHA-256 `event_fingerprint`, immutable `store_id`, accepted timestamp, optional authoritative `store_seq`, and explicit `ACCEPTED`, `DUPLICATE`, `CONFLICT`, `REJECTED` disposition. Same event ID+same bytes is idempotent; same event ID+different bytes must not overwrite persisted history.
- `EvidenceOutboxRecordV1`: local-first durable pending/in-flight/receipt state; retry preserves original event ID and body, with monotonic server cursor scoped to `store_id`. Offline events remain available in IndexedDB until sync is authorized and acknowledged. No Background Sync prerequisite is assumed.
- `RuntimeEvidenceContextV1`: content release, form snapshot, item version, scoring policy and definition registry contexts. `learner_id` **is not authorization**; `X-Anon-Id` is not learner evidence authentication. Backend evidence reads/writes require a trusted learner authorization port and use deny-by-default authorization.
- `ActivityProjectionV1` and `AttemptProjectionV1`: versioned, rebuildable projections keyed by source `store_id` and `store_seq` high watermark. `src/evidence/replay.js` validates ranges, unique event identity, store identity and bounded authoritative sequence before passing cloned events into projection functions; a projected result never changes raw events.
- `LearnerIdentityLinkRecordV1`, `EvidenceExportRecordV1` and privacy policy: pseudonymous principals, governed export, privacy erasure/tombstone provenance and restricted sensitive response fields are separate from correction semantics. Corrections are append-only, auditable evidence, not history rewrite. Never claim complete replay after policy-driven erasure unless the retained evidence supports it.
- `xAPI` 2.0 (`xapi-k3.v1`) and `Caliper` 1.2 (`caliper-k3.v1`) mappings are explicitly versioned adapters, not canonical storage or evidence authority. Unsupported semantics are omitted/abstained; imports reject external item/attempt identity conflicting with the supplied exact K3 context.

Evidence is persisted by browser IndexedDB, JSONL, Python SQLite and API adapters using the shared conformance corpus. Exact field definitions live in `data/schema/`, `src/evidence/`, `scripts/platform-kernel/` and `server/app/evidence_store.py`; this document is navigation, not a second schema.

**Not K3:** K4 next-best-action/spaced practice, K5 mastery/readiness, K6 psychometric calibration and K8 CAT/adaptive assessment. K3 does not implement those derivations. Authentication provider, retention schedule and production cross-device synchronization are deployment/policy decisions **not yet implemented** by the public GitHub Pages release.

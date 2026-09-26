# Data Model

This document lists **implemented Programme A objects only**. Future learner-engine, competency/objective authoring, calibration, protected-bank, and advanced question-family contracts remain future architecture work unless separately implemented.

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

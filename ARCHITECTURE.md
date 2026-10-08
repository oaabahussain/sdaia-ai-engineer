# Architecture

## Status

This document describes the implemented Programme A browser foundation and the later K3 Learner Evidence Engine (verified through Task 36 at the Task 37 preparation baseline). Future programmes in the architecture constitution are not implied to exist. Live task status belongs only to `docs/superpowers/state/CURRENT-STATE.json`.

## Browser shell

The public application is Vanilla HTML/CSS/JavaScript. `src/app.js` starts the UI and calls `registerServiceWorker()` synchronously during module evaluation. Canonical content is loaded over HTTP; `file:` use is rejected with a clear message.

The service worker:

- pre-caches shell/bootstrap assets only;
- does not pre-cache concept-bank chunks;
- caches same-origin GET content on demand after successful fetches;
- falls back to `index.html` only for navigation requests;
- returns `Response.error()` for non-navigation cache misses.

## Canonical track contracts

The current track is declared by:

- `TrackManifestV1`: `tracks/sdaia-ai-engineer/manifest.json`
- `ExamProfileV1`: selected by `manifest.default_exam_profile`

The manifest owns current content references. The exam profile owns question count, section sizes, weights, version, and evidence status. Core runtime/release code must not invent a parallel source of these rules.

## Current foundation bank

The current SDAIA AI Engineer track expands 140 concepts into 1,120 bilingual foundation practice items. Stable IDs are namespaced and independent of array position. The 14,000+ target belongs to future content programmes and is not part of the current Programme A runtime.

## RuntimeBundleV2

Browser and API adapters expose the same logical public bundle:

- `contract_version`
- `track`
- `exam_profile`
- `concepts`
- `learn`
- `cases`

Browser loading is implemented in `src/content/runtimeBundle.js`. The FastAPI adapter returns the same logical contract from `GET /v1/bank`.

## StateV2 and storage migration

Canonical browser storage keys are:

- `learning-platform.state.v2`
- `learning-platform.anon-id.v1`

Legacy keys remain read-only migration inputs. State migration maps legacy generated question IDs into stable namespaced IDs and preserves unmapped legacy data under `state.legacy.preserved`.

The anonymous UUID is an identifier/correlation value, not authentication.

## Public/static content boundary

Anything shipped to GitHub Pages or returned by the public bank endpoint must be treated as public. The Pages artifact intentionally publishes current public concepts, migrations, learn/cases data, track configuration, and application shell while excluding `data/legacy/`.

## API scaffold

`server/` is a local/test FastAPI + SQLite implementation of the API contract. It is not a production authentication, authorization, persistence, abuse-prevention, or multi-tenant system.

## Future protected-content boundary

Protected/high-stakes assessment delivery is **future work**. Content that must not be public requires server-side authorization and delivery rather than browser shipping. Programme A does not implement that protected bank.

## Multi-track direction

The implemented contracts make a track data-driven, but Programme A does not claim that full Programme B multi-track authoring/registry UX is built. Conceptually, a future track supplies a versioned manifest, profiles, content paths and compatible contracts without forking the platform core.


## Implemented K3 evidence architecture and operational boundaries

**Capture path:** The current browser calls `src/evidence/appBridge.js` → `src/evidence/recorder.js` → `src/evidence/indexedDbStore.js` and `src/evidence/indexedDbOutbox.js`. Evidence is written to the per-track IndexedDB `events` store with its outbox in the same durable local lifecycle. IndexedDB enables **offline local-first** evidence, stable `event_id`, `origin_seq`, exact content context and multi-tab atomic strict-assessment revision; `scripts/browser_smoke.py` verifies four fine-grained events persist. No network availability, Background Sync or production backend is required to capture locally.

**Acceptance:** `src/evidence/acceptance.js` enforces `LearnerEvidenceEventV2` schema/definition/payload requirements, privacy minimization, pseudonymous learner principal and trusted-producer boundary. `src/evidence/storePort.js` defines accept/acceptBatch/getById/read and receipt validation; JSONL, IndexedDB and `server/app/evidence_store.py` SQLite adapters share conformance tests. Fingerprints use RFC 8785/JCS SHA-256, and a conflicting payload for an existing event cannot replace the canonical record. Only `store_seq` issued by the authoritative store orders that store, not browser timestamps.

**Optional fail-closed sync:** `src/evidence/sync.js`, outbox and API transport preserve event identity/fingerprint through push, validate all receipts **before** acknowledging, and bind pull watermarks to the authoritative `store_id`. `server/app/evidence_auth.py` provides the learner authorization port; `DenyLearnerAuthorization` is the **default deny** behavior. For the local/test FastAPI app, only explicitly injected authorized resolvers permit sync; `learner_id` and `X-Anon-Id` do not confer authorization. The public GitHub Pages release has no deployed production authentication/backend; **live cross-device sync is not claimed**. A server-side trusted SYSTEM producer additionally requires exact grants, never an ordinary browser claim.

**Privacy and derivation:** `src/evidence/responsePrivacy.js` and privacy/export/erasure contracts separate sensitive responses and erasure from correction records; `src/evidence/legacy.js` classifies historical coarse events without inventing new observations. `src/evidence/replay.js` reconstructs versioned activity/attempt projections from governed source ranges; new corrections are append-only. K3 keeps raw learner evidence separate from Product Analytics and Telemetry: the governed bridge must apply export policy, never mirror raw learner events into either plane.

**Interoperability and release:** Versioned xAPI/Caliper adapters translate supported fields only, with exact external item/attempt association checks. `scripts/build_pages_artifact.js`, `scripts/verify_live_release.js`, release validators and service-worker tests restrict the public Pages package to browser-required assets; backend auth/persistence, private mappings, factory/admin data and protected assessments are excluded. Acceptance criteria 1–20 are executable in `tests/k3-learner-evidence-acceptance.test.js` and `scripts/browser_smoke.py`; criteria 21–25 depend on Tasks 37–41 documentation, review, exact-head testing, merge and post-merge verification respectively.

**No scope expansion:** K4 next-best-action and spaced practice, K5 mastery/readiness, K6 psychometric calibration and K8 CAT remain separate unstarted programmes. No general event bus, private LRS vendor, central CRDT or product-analytics learner record is K3 infrastructure.

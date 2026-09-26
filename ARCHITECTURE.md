# Architecture

## Status

This document describes the **implemented Programme A baseline**. Future programmes in the architecture constitution are not implied to exist.

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

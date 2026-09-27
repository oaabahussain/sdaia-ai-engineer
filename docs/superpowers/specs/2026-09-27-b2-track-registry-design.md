# B2 — Track Registry Design

**Date:** 2026-09-27
**Status:** Proposed written design — awaiting user review
**Repository:** `oaabahussain/sdaia-ai-engineer`
**Base:** `main@f25c8b9b64c367130e36a2251b2e2b727c1dc0e4`
**Programme:** B2 — Track Registry

## 1. Intent

B1 completed the presentation boundary: track-specific brand, hero copy and domain labels are now declarative track data. The remaining single-track coupling is bootstrap/discovery.

Current runtime still begins from:

`src/config.js → ACTIVE_TRACK_ID = 'sdaia-ai-engineer'`

This prevents the platform from being genuinely track-discoverable even though TrackManifestV1, TrackPresentationV1 and StateV2 are already track-aware.

B2 removes that bootstrap assumption without adding a second production track.

The target principle remains:

> **The track is data; the learning platform is code.**

## 2. Success criteria

B2 succeeds when:

1. The application discovers packaged tracks from one declarative registry.
2. Runtime selection no longer depends on a compiled SDAIA track ID.
3. The existing SDAIA track remains the default and behaves identically.
4. Invalid/stale selected track IDs recover deterministically to the registry default.
5. State remains isolated by track ID and existing learner progress is preserved.
6. Offline, Pages artifact assembly, live verification and browser smoke derive track packages from the registry.
7. A synthetic second-track fixture can pass registry/selection tests without being shipped as a real production track.
8. No visible multi-track selector is introduced while only one production track exists.

## 3. Architectural classification

B2 is architectural because it changes the platform bootstrap and release/discovery interfaces used by browser runtime, tooling, offline packaging and future tracks.

It must not be implemented as a collection of local hard-coded replacements.

## 4. Options considered

### Option A — Keep `ACTIVE_TRACK_ID` and add a future selector later

Rejected.

Advantages:
- smallest immediate change.

Problems:
- preserves single-track coupling;
- makes later selector logic own discovery itself;
- release/offline tooling remains SDAIA-specific;
- pushes ambiguity into B3 and later programmes.

### Option B — Discover track folders by directory scanning

Rejected.

Advantages:
- no registry file.

Problems:
- browser/static environments cannot reliably enumerate directories;
- release artifacts and server/browser behavior would diverge;
- ordering/default selection becomes implicit;
- lifecycle/visibility cannot be declared cleanly.

### Option C — Declarative TrackRegistryV1

Selected.

A small `tracks/registry.json` declares packaged tracks and the default track. Each entry points only to a track ID; authoritative details stay in TrackManifestV1 and TrackPresentationV1.

This preserves one source of truth per concern.

## 5. TrackRegistryV1

### 5.1 Canonical file

`tracks/registry.json`

### 5.2 Schema

`data/schema/track-registry.schema.json`

### 5.3 Proposed shape

```json
{
  "schema_version": 1,
  "default_track_id": "sdaia-ai-engineer",
  "tracks": [
    {
      "id": "sdaia-ai-engineer"
    }
  ]
}
```

B2 intentionally keeps registry entries minimal.

## 6. Registry ownership boundary

The registry owns only:

- which track packages are discoverable;
- deterministic ordering;
- the default track ID.

The registry does **not** own:

- display name;
- brand;
- locales;
- track version;
- official/evidence status;
- exam profiles;
- content references;
- capabilities;
- lifecycle truth already defined by TrackManifestV1.

Those remain in manifest/presentation.

## 7. Validation invariants

For every registry entry:

1. IDs are unique.
2. `default_track_id` appears exactly once in `tracks`.
3. `tracks/<id>/manifest.json` exists.
4. manifest `id === registry entry.id`.
5. `tracks/<id>/presentation.json` exists.
6. presentation identity/version matches manifest.
7. every declared track passes its normal manifest/profile/presentation validation.
8. registry contains no undeclared arbitrary fields.

Production B2 may contain only the current SDAIA track.

## 8. Runtime interfaces

New core module:

`src/tracks/registry.js`

Proposed interfaces:

```js
export async function loadTrackRegistry(fetchJson);
export function validateTrackRegistry(registry);
export function resolveActiveTrackId({
  registry,
  requestedTrackId,
  savedTrackId
});
```

### 8.1 Loading

`loadTrackRegistry(fetchJson)` fetches:

`./tracks/registry.json`

Browser callers continue using the small static JSON fetch helper pattern already established by B1.

### 8.2 Selection precedence

B2 selection is deterministic:

1. explicit requested track ID when valid;
2. saved preferred track ID when valid;
3. `registry.default_track_id`;
4. throw only if the registry itself contains no valid track.

B2 does not invent URL routing unless the implementation plan explicitly needs a non-breaking query parameter for testability. Existing public URLs must continue to work.

### 8.3 Invalid/stale selection

A requested or saved ID absent from the registry is not fatal.

The resolver falls back to `default_track_id`.

This fallback must be observable in tests and may log a warning, but must not corrupt or delete state for the stale track ID.

## 9. State contract

StateV2 already stores learner state under:

`state.tracks[trackId]`

Therefore B2 should preserve StateV2 unless implementation evidence proves a real incompatibility.

### 9.1 New preference

If B2 needs persistence of the learner's selected track, the preferred design is:

`state.preferences.track_id`

This is an additive field only if the current StateV2 schema permits it. If the schema uses closed properties, B2 must either:

- explicitly revise StateV2 through a versioned compatible migration; or
- keep active-track selection outside StateV2 in a neutral dedicated preference key.

The implementation plan must inspect the actual schema before choosing.

### 9.2 Preservation rules

- Never delete `state.tracks[unknownOrUnavailableTrackId]`.
- Switching active track must not mutate another track's history/active exam.
- Existing SDAIA state remains readable without migration loss.
- Active exam resumes only when its track ID matches the selected track.

## 10. RuntimeBundleV2 boundary

B2 should preserve RuntimeBundleV2 if possible.

The bundle still describes one selected track at a time.

The registry is a bootstrap/discovery contract, not a reason to return all track banks in one runtime bundle.

If API-backed mode later needs discovery, expose a registry-equivalent endpoint only if static registry loading cannot satisfy the existing adapter contract. Do not bump RuntimeBundleV2 merely to include registry metadata.

## 11. Browser bootstrap flow

Target flow:

```text
load registry
  ↓
resolve active track ID
  ↓
load selected track manifest
  ↓
load selected presentation
  ↓
load selected exam/content bundle
  ↓
load/migrate StateV2 with selected track context
  ↓
render
```

The platform shell must remain track-neutral.

## 12. Feedback flow

Feedback page follows the same registry resolver.

It must not maintain a separate active-track selection algorithm.

Track identity shown in feedback is resolved from the selected track's presentation.

Existing feedback issue-template semantics remain unchanged.

## 13. Offline/service worker

The service worker must cache:

- `tracks/registry.json`;
- core registry module;
- current production track's manifest/presentation/default exam-profile shell dependencies.

B2 must remove direct SDAIA-specific registry-package assumptions from service-worker verification where they are now derivable.

### 13.1 Scope control

B2 does not pre-cache whole content banks.

Current shell-only/on-demand content strategy remains.

### 13.2 Future-track scaling

The verifier should derive required shell track assets from registry + manifests rather than enumerating one hard-coded track.

## 14. Release and Pages artifact

Pages build continues copying `tracks/` generically.

Release verification becomes registry-driven:

1. fetch registry;
2. validate default track;
3. iterate registry entries;
4. fetch/validate each manifest;
5. fetch/validate each presentation;
6. validate referenced default profile/content contracts according to existing release rules.

No duplicated hard-coded current track ID should remain in release verification after B2.

## 15. Test fixture strategy

B2 production registry contains one track.

To prove architecture is genuinely multi-track-capable, tests add a **synthetic fixture track** outside the production registry.

Fixture goals:

- unique fixture ID;
- minimal valid manifest/presentation/profile;
- selection isolation;
- stale-ID fallback;
- duplicate-ID rejection;
- default-ID rejection;
- registry order determinism;
- no SDAIA-specific assumptions in registry core.

The fixture must not be published as a learner-visible production track.

## 16. Compatibility requirements

B2 must preserve:

- current SDAIA track ID and version;
- TrackManifestV1;
- TrackPresentationV1;
- RuntimeBundleV2 unless a separately documented blocker is found;
- StateV2 unless schema evidence requires a versioned migration;
- question IDs;
- exam profile IDs;
- current domain keys;
- current 1,120 rendered bank;
- current 200-question profile;
- scoring/weights/history/confidence behavior;
- public URLs;
- offline recovery;
- feedback URL semantics.

## 17. Error handling

### Registry unavailable/corrupt

Registry is critical bootstrap data.

Unlike B1 presentation failure, the platform cannot safely choose a track without a valid registry.

Behavior:

- show a generic core error;
- preserve state untouched;
- do not guess a hidden compiled track ID.

### Selected track invalid

If registry is valid but one selected track package fails:

- explicit requested track failure may fall back to registry default only when the failed track is not the default;
- if the default package itself is invalid, fail visibly;
- release validation must always fail on any packaged registry entry that is invalid.

## 18. Security/trust boundary

The registry is declarative data only.

It must never point to executable per-track JavaScript.

All track packages remain constrained to validated data/content contracts.

B2 does not introduce remote third-party track loading.

## 19. Accessibility/mobile/RTL

B2 should cause no learner-facing redesign.

Existing Arabic/English, RTL/LTR, mobile and offline behavior remain regression requirements.

A future selector UI is deferred until multiple production tracks exist.

## 20. Non-goals

B2 does not implement:

- second real production track;
- visible track catalog/selector;
- Content Model v2;
- stable domain IDs;
- competency/objective hierarchy migration;
- Question Factory v2;
- 14,000+ expansion;
- adaptive learning;
- spaced retrieval;
- mastery/readiness;
- AI tutor;
- CMS;
- authentication/authorization;
- protected delivery;
- backend redesign.

## 21. TDD/review requirements

Implementation plan must use RED → GREEN per parent task.

Required acceptance classes:

- registry schema;
- registry identity/invariants;
- loader;
- resolver precedence;
- stale selection fallback;
- state isolation;
- current SDAIA compatibility;
- synthetic second-track fixture;
- offline registry reload;
- service-worker derivation;
- Pages artifact;
- live registry verification;
- browser/feedback presentation;
- SDAIA literal leakage scan;
- full Node/Python/API/SQLite/browser acceptance.

Use systematic-debugging for unexpected failures.

Finish with whole-branch review and `finishing-a-development-branch`.

## 22. Suggested implementation stages

### Stage A — Baseline and contract
1. Freeze post-B1 baseline.
2. Inventory hard-coded current-track bootstrap/release paths.
3. RED B2 acceptance contract.
4. TrackRegistryV1 schema.
5. Canonical single-track production registry.

### Stage B — Tooling
6. Registry loader.
7. Registry schema/invariant validation.
8. Synthetic second-track fixture.
9. Multi-entry validation and isolation tests.

### Stage C — Runtime
10. Browser registry loader.
11. Active-track resolver.
12. Remove `ACTIVE_TRACK_ID` from runtime bootstrap.
13. Integrate selected track into bank loading.
14. State preference/isolation decision and migration tests.
15. Feedback uses shared selection.

### Stage D — Offline/release
16. Service-worker registry assets.
17. SW verifier derives track shell assets from registry.
18. Pages artifact verifies registry.
19. Live verifier iterates registry.
20. Remove hard-coded SDAIA release path assumptions.

### Stage E — Acceptance/integration
21. Browser default-track compatibility.
22. Stale-ID fallback.
23. Synthetic multi-track browser/unit acceptance where appropriate.
24. Offline reload.
25. Leakage regression.
26. Whole-suite verification.
27. Whole-branch review.
28. PR/CI/merge/post-merge verification.

## 23. Exit criteria

B2 is complete only when all of the following are true:

- no runtime bootstrap depends on compiled SDAIA track ID;
- production registry contains the current SDAIA track as default;
- registry/default/stale selection rules are deterministic and tested;
- synthetic second-track fixture proves generic registry behavior;
- state for one track cannot overwrite another track;
- release/offline verification is registry-driven;
- current SDAIA learner behavior remains equivalent;
- all current compatibility contracts remain green or any unavoidable version migration is explicitly designed, tested and documented;
- B2 is merged/deployed/post-merge verified;
- implementation stops before B3 product changes.

## 24. B3 handoff boundary

After B2 completes, B3 may rely on a real registry/discovery baseline.

B3 then addresses stable domain/content identity.

B3 must not be implemented from assumptions made before B2's final merged state.

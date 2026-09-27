# B2 Track Registry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the compiled single-track bootstrap with a validated declarative TrackRegistryV1 while preserving current SDAIA behavior and existing public/runtime/state contracts.

**Architecture:** Add `tracks/registry.json` + schema, a focused `src/tracks/registry.js` runtime resolver, and a neutral persisted bootstrap preference outside StateV2. Both browser/API adapters accept an explicit `trackId`; release/offline validation iterates registry entries instead of pinning SDAIA paths.

**Tech Stack:** Vanilla ES modules, JSON Schema draft-07/AJV, Node.js `node:test`, FastAPI/Python, GitHub Actions/Pages, Python WebDriver browser smoke.

**Spec:** `docs/superpowers/specs/2026-09-27-b2-track-registry-design.md`

## Global Constraints

- Preserve TrackManifestV1, TrackPresentationV1 and RuntimeBundleV2.
- Preserve StateV2; do not add `preferences.track_id` because the current schema closes `preferences` with `additionalProperties:false`.
- Persist selected track outside StateV2 under neutral key `learning-platform.track-id.v1`.
- Preserve current SDAIA ID/version/profile/question IDs/domain keys/weights/scoring/history/confidence/public URLs.
- Production registry contains only `sdaia-ai-engineer` during B2.
- Synthetic second track exists only as a test fixture and must not be published.
- No B3 Content Model v2, stable domain IDs, question expansion, adaptive learning, AI tutor, CMS/auth/backend redesign.
- Registry data is declarative only; no executable per-track code.
- Runtime registry corruption is fatal bootstrap failure; stale selected IDs fall back to the registry default.
- Do not pre-cache concept-bank chunks.
- Use systematic-debugging for unexpected failures.
- Every implementation task follows RED → verify RED → minimal GREEN → verify GREEN → commit → ledger/checkpoint.

## Review Focus

1. **Stale persisted track ID** → resolver must fall back to `registry.default_track_id` without deleting stale track state; pinned in Tasks 10 and 15.
2. **API adapter called with explicit non-default track** → `/v1/bank?track_id=...` returns that RuntimeBundleV2 or a bounded invalid-track error; pinned in Tasks 13–14.
3. **Registry lists duplicate/missing/default-absent IDs** → strict validator failure; pinned in Tasks 5–7.
4. **Offline reload after registry bootstrap** → registry + selected track shell dependencies must resolve with server unavailable; pinned in Tasks 19–21 and 25.
5. **Synthetic fixture accidentally published** → Pages/release tests must prove production artifact contains registry-declared production tracks only; pinned in Tasks 18, 22 and 24.

---

### Task 1: Freeze post-B1 baseline

**Files:**
- Create: `docs/superpowers/reviews/2026-09-27-b2-baseline.md`

**Interfaces:**
- Consumes: `main@f25c8b9b64c367130e36a2251b2e2b727c1dc0e4`
- Produces: immutable B2 baseline and hard-coded track inventory.

- [ ] Record merge SHA, PR #9, Pages run 17 and server run 404.
- [ ] Inventory `ACTIVE_TRACK_ID`, hard-coded `tracks/sdaia-ai-engineer` paths, server `DEFAULT_TRACK_ID`, browser/API adapter bank selection, SW and release workflow assumptions.
- [ ] Record current acceptance: Node 101/101, Python 16/16, browser/live/offline/API/SQLite PASS.
- [ ] Commit: `docs: freeze B2 registry baseline`.

### Task 2: Add B2 acceptance contract — RED

**Files:**
- Create: `tests/b2-track-registry-acceptance.test.js`

**Interfaces:**
- Produces: source-boundary contract for B2.

- [ ] Assert required future files exist: `data/schema/track-registry.schema.json`, `tracks/registry.json`, `src/tracks/registry.js`.
- [ ] Assert `src/config.js` no longer exports `ACTIVE_TRACK_ID`.
- [ ] Assert browser/API adapters expose `loadBank(trackId)`.
- [ ] Assert live/SW verifiers mention registry and no longer pin `tracks/sdaia-ai-engineer/manifest.json`.
- [ ] Run targeted test; verify RED for the intended missing contracts.
- [ ] Commit: `test: capture B2 track registry boundary`.

### Task 3: Define TrackRegistryV1 schema

**Files:**
- Create: `data/schema/track-registry.schema.json`
- Create: `tests/track-registry-contract.test.js`

**Interfaces:**
- Produces schema: `{schema_version:1, default_track_id:string, tracks:[{id:string}]}`.

- [ ] RED: minimal valid registry validates; arbitrary top-level/entry fields fail.
- [ ] Verify RED because schema is absent.
- [ ] Implement draft-07 schema with closed objects, non-empty tracks and canonical track-ID pattern.
- [ ] Verify GREEN.
- [ ] Commit: `feat: add track registry v1 schema`.

### Task 4: Add canonical production registry

**Files:**
- Create: `tracks/registry.json`
- Test: `tests/track-registry-contract.test.js`

**Interfaces:**
- Produces production default `sdaia-ai-engineer`.

- [ ] RED: require schema version 1, default ID SDAIA, exactly one production entry.
- [ ] Create canonical registry.
- [ ] Verify GREEN.
- [ ] Commit: `feat: add production track registry`.

### Task 5: Add tooling registry loader

**Files:**
- Modify: `scripts/load_track.js`
- Test: `tests/track-registry-contract.test.js`

**Interfaces:**
- Produces: `loadTrackRegistry(root) -> registry`.

- [ ] RED: loader returns `tracks/registry.json`.
- [ ] Implement `loadTrackRegistry(root)` without changing `loadTrack(root, trackId)`.
- [ ] Verify GREEN.
- [ ] Commit: `feat: load track registry in tooling`.

### Task 6: Validate registry structure and default

**Files:**
- Modify: `scripts/validate.js`
- Test: `tests/track-registry-contract.test.js`

**Interfaces:**
- Produces: `validateRegistryContract(root, registry)`.

- [ ] RED: duplicate IDs fail.
- [ ] RED: default absent from entries fails.
- [ ] RED: empty registry fails.
- [ ] Apply registry schema in validator and add invariants.
- [ ] Verify targeted tests + `npm run validate`.
- [ ] Commit: `feat: validate registry invariants`.

### Task 7: Validate registry ↔ manifest/presentation identity

**Files:**
- Modify: `scripts/validate.js`
- Test: `tests/track-registry-contract.test.js`

**Interfaces:**
- Consumes: Task 6 validator.
- Produces: every registry entry resolves a valid manifest/presentation package.

- [ ] RED: missing manifest fails.
- [ ] RED: manifest ID mismatch fails.
- [ ] RED: missing/mismatched presentation fails.
- [ ] Iterate all registry entries through existing track/presentation validation.
- [ ] Verify GREEN + canonical validator.
- [ ] Commit: `feat: validate registry track packages`.

### Task 8: Add synthetic second-track fixture

**Files:**
- Create: `tests/fixtures/tracks/example-track/manifest.json`
- Create: `tests/fixtures/tracks/example-track/presentation.json`
- Create: `tests/fixtures/tracks/example-track/exam-profile.json`
- Create: `tests/fixtures/track-registry-two-tracks.json`
- Test: `tests/track-registry-contract.test.js`

**Interfaces:**
- Produces isolated test-only second track.

- [ ] RED: two-entry fixture validates through fixture-aware helper.
- [ ] Add minimal valid fixture package with no production references.
- [ ] Verify fixture passes and production registry remains one-entry.
- [ ] Add assertion that fixture paths are absent from Pages workflow/artifact source.
- [ ] Commit: `test: add synthetic second track fixture`.

### Task 9: Add runtime registry loader/resolver

**Files:**
- Create: `src/tracks/registry.js`
- Test: `tests/track-registry-contract.test.js`

**Interfaces:**
- Produces:
  - `loadTrackRegistry(fetchJson)`
  - `validateTrackRegistry(registry)`
  - `resolveActiveTrackId({registry, requestedTrackId, savedTrackId})`

- [ ] RED: loader fetches exactly `./tracks/registry.json`.
- [ ] RED: precedence requested → saved → default.
- [ ] RED: invalid requested/saved IDs fall back to default.
- [ ] RED: invalid registry throws.
- [ ] Implement minimal pure resolver + loader.
- [ ] Verify GREEN.
- [ ] Commit: `feat: add runtime track registry resolver`.

### Task 10: Add neutral selected-track preference

**Files:**
- Create: `src/tracks/selection.js`
- Test: `tests/track-registry-contract.test.js`

**Interfaces:**
- Produces:
  - `TRACK_SELECTION_KEY='learning-platform.track-id.v1'`
  - `readSavedTrackId()`
  - `saveTrackId(trackId)`

- [ ] RED: reads/writes neutral key only.
- [ ] RED: malformed/unavailable storage returns null without touching StateV2.
- [ ] Implement storage helper with memory-safe failure behavior.
- [ ] Assert `state-v2.schema.json` remains byte/semantic unchanged by B2 source changes.
- [ ] Verify GREEN.
- [ ] Commit: `feat: persist active track selection separately`.

### Task 11: Remove compiled ACTIVE_TRACK_ID

**Files:**
- Modify: `src/config.js`
- Modify: `tests/programme-a-acceptance.test.js`
- Test: `tests/b2-track-registry-acceptance.test.js`

**Interfaces:**
- Removes: `ACTIVE_TRACK_ID`.

- [ ] RED acceptance already requires absence.
- [ ] Remove export and update old Programme A assertion to require registry bootstrap instead.
- [ ] Run focused acceptance tests.
- [ ] Commit: `refactor: remove compiled active track id`.

### Task 12: Make browser adapter explicit-track

**Files:**
- Modify: `src/storage/browser.js`
- Modify: `src/storage/interface.js`
- Test: `scripts/contract_test.js` and B2 acceptance.

**Interfaces:**
- Produces: `loadBank(trackId)` in interface/browser adapter.

- [ ] RED: calling browser `loadBank()` without ID rejects; explicit fixture/default ID is passed to `loadRuntimeBundle`.
- [ ] Change `storage/interface.js -> loadBank(trackId)`.
- [ ] Change browser adapter signature to `loadBank(trackId)`.
- [ ] Preserve file-protocol error.
- [ ] Verify browser adapter contract with explicit registry default.
- [ ] Commit: `refactor: require explicit track in browser bank load`.

### Task 13: Make API bank explicit-track

**Files:**
- Modify: `src/storage/api.js`
- Modify: `server/app/main.py`
- Modify: `server/tests/test_api.py`
- Test: `scripts/contract_test.js`

**Interfaces:**
- API: `GET /v1/bank?track_id=<id>`
- Adapter: `loadBank(trackId)`
- RuntimeBundleV2 remains unchanged.

- [ ] RED server test: explicit current track returns RuntimeBundleV2.
- [ ] RED server test: unknown track returns bounded 404/validation error, not traceback.
- [ ] RED adapter contract: API request includes encoded `track_id`.
- [ ] Update endpoint to accept query `track_id`; default may remain registry default for backward compatibility only if derived from registry, not env SDAIA literal.
- [ ] Update API adapter `loadBank(trackId)`.
- [ ] Verify Python + API adapter tests.
- [ ] Commit: `feat: select API bank by track id`.

### Task 14: Make server default registry-driven

**Files:**
- Modify: `server/app/main.py`
- Modify: `server/tests/test_api.py`
- Modify: `tests/programme-a-acceptance.test.js`

**Interfaces:**
- Produces server helper `load_track_registry()` and registry default resolution.

- [ ] RED: no `TRACK_ID`/SDAIA fallback literal remains in server bootstrap.
- [ ] Implement registry file load + default lookup.
- [ ] Preserve explicit `load_runtime_bundle(track_id)`.
- [ ] Verify current no-query `/v1/bank` returns registry default for backward compatibility.
- [ ] Verify GREEN.
- [ ] Commit: `refactor: derive server default track from registry`.

### Task 15: Integrate registry bootstrap into app

**Files:**
- Modify: `src/app.js`
- Test: `tests/b2-track-registry-acceptance.test.js`

**Interfaces:**
- Consumes Tasks 9–12.
- Produces selected track before `loadBank(trackId)`.

- [ ] RED: app imports registry + selection modules and calls `loadBank(selectedTrackId)`.
- [ ] Bootstrap registry before bank.
- [ ] Resolve saved/default ID; save resolved ID.
- [ ] Load bank/presentation/state using resolved ID.
- [ ] Preserve stale track entries in `state.tracks`; create selected track state only through existing state migration/initialization rules.
- [ ] Verify app parse + targeted tests.
- [ ] Commit: `feat: bootstrap app from track registry`.

### Task 16: Prove state isolation across tracks

**Files:**
- Modify: `tests/state-v2.test.js` or existing state test file
- Test fixture: Task 8.

**Interfaces:**
- Uses unchanged StateV2 `tracks[trackId]`.

- [ ] RED: switching selected track leaves SDAIA history/active exam unchanged.
- [ ] RED: unavailable saved fixture ID fallback does not delete its preserved state object.
- [ ] Add only minimal runtime/state initialization code if needed.
- [ ] Verify state schema remains version 2 and tests GREEN.
- [ ] Commit: `test: prove multi-track state isolation`.

### Task 17: Move feedback to shared track selection

**Files:**
- Modify: `src/feedback.js`
- Modify: `tests/feedback-contract.test.js`

**Interfaces:**
- Consumes registry + selection resolver.
- Removes direct `ACTIVE_TRACK_ID` dependency.

- [ ] RED: feedback imports registry/selection and has no compiled track ID.
- [ ] Resolve same saved/default selected track as app.
- [ ] Load selected manifest/presentation.
- [ ] Preserve issue-template, suggestion/contribution/rating semantics and StateV2 preference behavior.
- [ ] Verify feedback tests.
- [ ] Commit: `refactor: share registry track selection in feedback`.

### Task 18: Make browser smoke registry-driven

**Files:**
- Modify: `scripts/browser_smoke.py`

**Interfaces:**
- Reads production `tracks/registry.json` and derives default manifest/profile/presentation.

- [ ] RED by source contract: no pinned production manifest path allowed.
- [ ] Load registry first and derive default track.
- [ ] Preserve existing bank/profile/presentation assertions.
- [ ] Add stale `learning-platform.track-id.v1` setup and verify fallback to default.
- [ ] Verify browser smoke online.
- [ ] Commit: `test: drive browser smoke from track registry`.

### Task 19: Add registry to offline shell

**Files:**
- Modify: `sw.js`
- Modify: `tests/service-worker-contract.test.js`

**Interfaces:**
- Cache `./tracks/registry.json` and `./src/tracks/registry.js`, `./src/tracks/selection.js`.

- [ ] RED: required registry assets absent from shell.
- [ ] Add only bootstrap/shell assets; do not add concept chunks.
- [ ] Verify targeted SW test.
- [ ] Commit: `feat: cache track registry bootstrap assets`.

### Task 20: Make SW verifier registry-driven

**Files:**
- Modify: `scripts/verify_sw_assets.js`
- Modify: `tests/service-worker-contract.test.js`

**Interfaces:**
- Reads registry, derives every production track manifest/presentation/default profile.

- [ ] RED: verifier must not discover manifests by regex-only SDAIA shell assumptions.
- [ ] Parse `tracks/registry.json`.
- [ ] Require registry + each registry track's manifest/presentation/default profile in shell.
- [ ] Keep concept-chunk precache rejection.
- [ ] Verify `npm run verify:sw`.
- [ ] Commit: `refactor: verify offline shell from track registry`.

### Task 21: Prove offline registry reload

**Files:**
- Modify: `scripts/browser_smoke.py`

**Interfaces:**
- Uses selected track persisted under `learning-platform.track-id.v1`.

- [ ] Warm shell online.
- [ ] Stop HTTP server using existing controlled offline path.
- [ ] Reload home and feedback.
- [ ] Assert registry-selected default brand/domain/title survives offline.
- [ ] Verify browser smoke GREEN.
- [ ] Commit: `test: prove offline registry bootstrap`.

### Task 22: Make live release verifier registry-driven

**Files:**
- Modify: `scripts/verify_live_release.js`
- Modify: `tests/release-contract.test.js`

**Interfaces:**
- Fetches `tracks/registry.json`, then iterates all entries.

- [ ] RED: reject hard-coded `tracks/sdaia-ai-engineer/manifest.json`.
- [ ] Verify registry schema/invariants required at live boundary.
- [ ] For each entry validate manifest/presentation/default profile/content refs.
- [ ] Emit concise `live track registry: PASS tracks=<n> default=<id>`.
- [ ] Verify local artifact live verifier.
- [ ] Commit: `feat: verify live track registry`.

### Task 23: Remove hard-coded production track from CI/Pages assertions

**Files:**
- Modify: `.github/workflows/ci.yml`
- Modify: `.github/workflows/pages.yml`
- Modify: `tests/release-contract.test.js`

**Interfaces:**
- Artifact still copies `tracks/` generically.

- [ ] RED: workflows must not contain `test -f _site/tracks/sdaia-ai-engineer/presentation.json`.
- [ ] Replace with registry existence + verifier-driven package validation.
- [ ] Preserve legacy-data exclusion and same artifact boundary.
- [ ] Verify release-contract tests.
- [ ] Commit: `ci: derive Pages track checks from registry`.

### Task 24: Prevent fixture publication

**Files:**
- Modify: `tests/release-contract.test.js`
- Modify: `tests/track-registry-contract.test.js`

**Interfaces:**
- Test fixtures remain under `tests/fixtures` only.

- [ ] Assert production registry entries map only under production `tracks/`.
- [ ] Assert Pages copy commands never include `tests/fixtures`.
- [ ] Assert live registry count equals production registry count.
- [ ] Verify GREEN.
- [ ] Commit: `test: keep synthetic tracks out of release artifact`.

### Task 25: Add leakage regression

**Files:**
- Modify: `tests/b2-track-registry-acceptance.test.js`

**Interfaces:**
- Allows SDAIA presentation data in track package but not compiled bootstrap/release logic.

- [ ] Scan `src/`, server bootstrap, SW verifier, live verifier and workflows for removed `ACTIVE_TRACK_ID`/pinned manifest path.
- [ ] Permit current SDAIA data only in registry/manifest/presentation/fixtures intentionally named for compatibility.
- [ ] Verify GREEN.
- [ ] Commit: `test: prevent single-track bootstrap leakage`.

### Task 26: Whole-suite acceptance

**Files:**
- Update checkpoint/ledger only after evidence.

**Interfaces:**
- Produces fresh B2 acceptance evidence.

- [ ] Run `npm run validate`.
- [ ] Run `npm test`.
- [ ] Run `node --check src/app.js` and `node --check src/feedback.js`.
- [ ] Run `npm run verify:sw`.
- [ ] Run Pages artifact + local live verifier.
- [ ] Run browser smoke.
- [ ] Run `PYTHONPATH=server pytest -q server/tests`.
- [ ] Run SQLite smoke, browser adapter contract, API adapter contract.
- [ ] Confirm TrackManifestV1, TrackPresentationV1, RuntimeBundleV2, StateV2 and current compatibility fixtures unchanged.
- [ ] Record exact counts/results in B2 checkpoint.

### Task 27: Whole-branch review

**Files:**
- Create: `docs/superpowers/reviews/2026-09-27-b2-final-review.md`
- Update: `HANDOFF.md`

**Interfaces:**
- Base: B1 merge SHA.
- Produces review disposition.

- [ ] Invoke Superpowers requesting-code-review.
- [ ] If no reviewer/subagent tool exists, record exactly `Final review: self-review (no subagent tool)`.
- [ ] Review registry validation, resolver precedence, state isolation, API selection, offline/release derivation, fixture exclusion and compatibility.
- [ ] Fix Critical/Important findings via TDD before proceeding.
- [ ] Record Minor findings/defer explicitly.
- [ ] Update durable handoff/checkpoint.

### Task 28: Integrate and post-merge verify

**Files:**
- Update B2 checkpoint/post-merge review after integration.

**Interfaces:**
- Uses `finishing-a-development-branch`.

- [ ] Verify fresh CI on exact branch head.
- [ ] Invoke `finishing-a-development-branch` and follow its current human integration gate.
- [ ] On merge, record merge SHA.
- [ ] Verify main CI/server workflow.
- [ ] Verify Pages deploy/live registry.
- [ ] Re-read B2 registry/spec/review directly from main.
- [ ] Create post-merge verification record.
- [ ] Stop before B3 implementation.

## Suggested Checkpoints

- **A1:** Tasks 1–2 — baseline + RED boundary
- **A2:** Tasks 3–4 — schema + canonical registry
- **A3:** Tasks 5–8 — tooling + validation + fixture
- **B1:** Tasks 9–11 — runtime registry/selection + remove constant
- **B2:** Tasks 12–14 — browser/API/server explicit selection
- **B3:** Tasks 15–17 — app/state/feedback integration
- **C1:** Tasks 18–21 — browser/offline
- **C2:** Tasks 22–25 — release/Pages/leakage
- **D1:** Task 26 — whole-suite acceptance
- **D2:** Tasks 27–28 — review/integration/post-merge

After every checkpoint update one durable recovery file:
`docs/superpowers/reviews/2026-09-27-b2-checkpoint.md`

It must state current HEAD, completed parent/micro tasks, RED→GREEN evidence, exact test results, rulings, known failures, next exact task, files changed, resume safety and merge status.

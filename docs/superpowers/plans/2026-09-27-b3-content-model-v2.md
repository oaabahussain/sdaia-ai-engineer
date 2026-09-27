# B3 Content Model v2 / Stable Domain IDs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace human-readable domain strings as structural identity with stable domain IDs while preserving all current question IDs, generated payload, exam behavior, StateV2 progress, and release/offline compatibility.

**Architecture:** Introduce DomainCatalogV2 and version only the contracts whose semantics actually change: ExamProfileV2, RenderedQuestionV2 and RuntimeBundleV3. Keep TrackRegistryV1, TrackManifestV1, TrackPresentationV1 and StateV2, and isolate legacy-key compatibility in a dedicated normalization/migration layer.

**Tech Stack:** Vanilla ES modules, JSON Schema draft-07/AJV, Node.js `node:test`, FastAPI/Python, GitHub Actions/Pages, Python WebDriver browser smoke.

**Spec:** `docs/superpowers/specs/2026-09-27-b3-content-model-v2-design.md`

## Global Constraints

- Base implementation on `main@0f0fe756181a6409de7ab0424e6da4e38603628b`.
- Preserve TrackRegistryV1, TrackManifestV1, TrackPresentationV1 and StateV2.
- Introduce DomainCatalogV2, ExamProfileV2, RenderedQuestionV2 and RuntimeBundleV3.
- Canonical SDAIA stable domain IDs:
  - `mlops-llmops`
  - `data-ml`
  - `core-ai`
  - `responsible-ai-security-governance`
  - `ai-software-engineering`
  - `architecture-infrastructure`
  - `business-professional-practice`
- Preserve all 1,120 question IDs and family IDs.
- Preserve concept IDs.
- Preserve Arabic/English question text, options, answer index and difficulty.
- Preserve current numeric weights and 200-question allocation.
- Preserve current StateV2 learner progress/history without destructive rewrites.
- Keep legacy human-readable domain labels only in presentation display values, migration aliases, frozen B2 fixtures and migration-specific tests/docs.
- Do not implement Question Factory v2, content expansion, adaptive learning, psychometrics, AI tutor, CMS/auth or backend redesign.
- Concept chunks remain on-demand; no whole-bank precache.
- Every implementation task uses RED → verify RED → smallest GREEN → verify GREEN → commit → checkpoint.
- Use systematic-debugging for unexpected failures.

## Review Focus

1. **Deterministic generation drift:** replacing legacy domain keys must not alter option order, answer index or generated payload; pinned in Tasks 4, 14 and 20.
2. **Ambiguous/unknown legacy alias:** compatibility normalization must throw, never guess; pinned in Tasks 8 and 12.
3. **Partial domain migration:** any profile/concept/presentation reference to a missing/unknown stable ID must fail validation; pinned in Tasks 9–11.
4. **State/history loss:** B3 must not rewrite question IDs or destroy unfinished exam/history data; pinned in Tasks 22–23.
5. **Mixed V2/V3 runtime semantics:** browser/API must expose one declared contract version consistently and reject mixed bundles; pinned in Tasks 16–19.

---

### Task 1: Freeze post-B2 baseline

**Files:**
- Create: `docs/superpowers/reviews/2026-09-27-b3-baseline.md`

**Interfaces:**
- Consumes: B2 merge SHA `0f0fe756181a6409de7ab0424e6da4e38603628b`.
- Produces: immutable B3 baseline + active legacy-domain inventory.

- [ ] Record Pages run `36306781695` and server/adapter run `36306781690` as B2 post-merge baseline evidence.
- [ ] Inventory all active legacy-domain structural consumers: exam profile weights, concept docs, runtime bundle concepts keys, question generator, rendered questions, exam filtering, validators, presentation keys, fixtures and browser/API tests.
- [ ] Record current 1,120-question count, current profile count 200 and current weight map.
- [ ] Commit: `docs: freeze B3 content-model baseline`.

### Task 2: Freeze exact B2 compatibility fixtures

**Files:**
- Create: `tests/fixtures/b3/b2-exam-profile-v1.json`
- Create: `tests/fixtures/b3/b2-presentation-v1.json`
- Create: `tests/fixtures/b3/b2-concept-mlops.json`
- Create: `tests/fixtures/b3/b2-runtime-bundle-v2.json`
- Create: `tests/fixtures/b3/b2-generated-question-digest.json`

**Interfaces:**
- Produces frozen legacy inputs and payload equivalence evidence.

- [ ] Capture exact current B2 exam profile/presentation/concept forms.
- [ ] Capture representative RuntimeBundleV2 fixture.
- [ ] Capture a deterministic digest/field fixture proving exact 1,120 generated payload identity.
- [ ] Add a test asserting fixtures match B2 baseline before any canonical migration.
- [ ] Commit: `test: freeze B2 content-model compatibility fixtures`.

### Task 3: Add B3 acceptance contract — RED

**Files:**
- Create: `tests/b3-content-model-acceptance.test.js`

**Interfaces:**
- Produces branch-level B3 architectural boundary assertions.

- [ ] Assert future files exist: DomainCatalogV2 schema/catalog, ExamProfileV2 schema, RenderedQuestionV2 schema, RuntimeBundleV3 schema, normalization module and migration map.
- [ ] Assert canonical exam profile no longer uses legacy display strings as weight keys.
- [ ] Assert canonical concept docs use `domain_id`, not `domain`.
- [ ] Assert runtime bundle contract version is 3.
- [ ] Assert all seven stable IDs appear in canonical catalog.
- [ ] Run targeted test; verify RED for intended missing contracts only.
- [ ] Commit: `test: capture B3 stable-domain boundary`.

### Task 4: Pin deterministic B2 generated payload

**Files:**
- Create: `tests/b3-generation-compatibility.test.js`

**Interfaces:**
- Consumes Task 2 fixtures.
- Produces exact generated-question compatibility contract.

- [ ] Generate current B2 bank from frozen legacy fixtures.
- [ ] Assert 1,120 questions.
- [ ] Assert exact IDs/family IDs/questions/options/answer/difficulty against frozen digest or exact sample+global digest.
- [ ] Verify GREEN on the B2 baseline before canonical migration.
- [ ] Commit: `test: pin B2 generated question payload`.

### Task 5: Define DomainCatalogV2 schema

**Files:**
- Create: `data/schema/domain-catalog-v2.schema.json`
- Create: `tests/domain-catalog-v2.test.js`

**Interfaces:**
- Produces:
  `{schema_version:2, track_id, track_version, domains:[{id,order,legacy_keys}]}`.

- [ ] RED: valid minimal catalog fails because schema is absent.
- [ ] RED: duplicate IDs/orders, empty legacy keys and arbitrary fields are rejected.
- [ ] Implement strict schema.
- [ ] Verify GREEN.
- [ ] Commit: `feat: add domain catalog v2 schema`.

### Task 6: Add canonical SDAIA domain catalog

**Files:**
- Create: `tracks/sdaia-ai-engineer/domains.json`
- Test: `tests/domain-catalog-v2.test.js`

**Interfaces:**
- Produces seven canonical IDs and orders 1–7.

- [ ] RED: require exactly seven IDs from the spec mapping.
- [ ] Add catalog with one legacy key per current domain.
- [ ] Verify unique ID/order/legacy alias coverage.
- [ ] Commit: `feat: add SDAIA stable domain catalog`.

### Task 7: Add explicit domain migration map

**Files:**
- Create: `data/migrations/sdaia-domain-v1-to-v2.json`
- Test: `tests/domain-catalog-v2.test.js`

**Interfaces:**
- Produces legacy-key → stable-ID map for all seven B2 keys.

- [ ] RED: mapping must be complete and bijective against DomainCatalogV2 legacy keys.
- [ ] Add exact seven-entry map.
- [ ] Verify GREEN.
- [ ] Commit: `feat: add domain identity migration map`.

### Task 8: Add domain normalization helpers

**Files:**
- Create: `src/content/contentModelV2.js`
- Create: `tests/content-model-v2.test.js`

**Interfaces:**
- Produces:
  - `normalizeDomainId(value, domainCatalog)`
  - `legacySeedKey(domainId, domainCatalog)`
  - `buildLegacyDomainMap(domainCatalog)`

- [ ] RED: stable ID returns itself.
- [ ] RED: known legacy key maps to stable ID.
- [ ] RED: unknown legacy key throws.
- [ ] RED: ambiguous legacy alias throws.
- [ ] RED: `legacySeedKey` returns historical key for migrated SDAIA domains.
- [ ] Implement pure helpers.
- [ ] Verify GREEN.
- [ ] Commit: `feat: normalize stable and legacy domain identity`.

### Task 9: Define ExamProfileV2 schema

**Files:**
- Create: `data/schema/exam-profile-v2.schema.json`
- Create: `tests/exam-profile-v2.test.js`

**Interfaces:**
- Produces schema version 2 with stable-ID weight keys.

- [ ] RED: valid stable-ID profile passes only V2 schema.
- [ ] RED: legacy label key fails stable-ID pattern.
- [ ] RED: arbitrary fields fail.
- [ ] Implement strict schema.
- [ ] Verify GREEN.
- [ ] Commit: `feat: add exam profile v2 schema`.

### Task 10: Define ConceptDocumentV2 schema

**Files:**
- Create: `data/schema/concept-document-v2.schema.json`
- Create: `tests/concept-document-v2.test.js`

**Interfaces:**
- Produces strict `{domain_id, concepts:[...]}` document contract.

- [ ] RED: `domain_id` required.
- [ ] RED: legacy `domain` field rejected.
- [ ] RED: arbitrary fields rejected.
- [ ] Implement schema preserving current concept fields exactly.
- [ ] Verify GREEN.
- [ ] Commit: `feat: add concept document v2 schema`.

### Task 11: Define RenderedQuestionV2 and RuntimeBundleV3 schemas

**Files:**
- Create: `data/schema/rendered-question-v2.schema.json`
- Create: `data/schema/runtime-bundle-v3.schema.json`
- Test: `tests/content-model-v2.test.js`

**Interfaces:**
- RenderedQuestionV2 uses `domain_id`.
- RuntimeBundleV3 has `contract_version:3`, `domains`, V2 profile and stable-keyed concepts.

- [ ] RED rendered question requires `domain_id` and rejects legacy `domain`.
- [ ] RED runtime V3 requires `domains` and contract version 3.
- [ ] Implement schemas.
- [ ] Verify GREEN.
- [ ] Commit: `feat: add rendered question v2 and runtime bundle v3 schemas`.

### Task 12: Add strict cross-document referential validation

**Files:**
- Modify: `scripts/validate.js`
- Test: `tests/content-model-v2.test.js`

**Interfaces:**
- Produces `validateContentModelV2({catalog,profile,presentation,conceptDocs})`.

- [ ] RED unknown profile weight ID fails.
- [ ] RED missing catalog domain in profile fails.
- [ ] RED unknown concept `domain_id` fails.
- [ ] RED duplicate concept-domain ownership fails for current SDAIA model.
- [ ] RED missing/unknown presentation label IDs fail.
- [ ] RED ambiguous legacy aliases fail.
- [ ] Implement pure validator.
- [ ] Verify GREEN.
- [ ] Commit: `feat: validate content-model referential integrity`.

### Task 13: Add RuntimeBundleV2 → V3 compatibility adapter

**Files:**
- Modify: `src/content/contentModelV2.js`
- Test: `tests/content-model-v2.test.js`

**Interfaces:**
- Produces:
  - `normalizeExamProfile(profile, domainCatalog)`
  - `normalizeConceptDocuments(docsOrMap, domainCatalog)`
  - `normalizeRuntimeBundle(bundle, domainCatalog)`

- [ ] RED frozen B2 profile normalizes to stable IDs with identical values.
- [ ] RED frozen B2 runtime bundle normalizes to contract version 3.
- [ ] RED V3 input is idempotent.
- [ ] RED unknown/ambiguous legacy key throws.
- [ ] Implement smallest compatibility layer.
- [ ] Verify GREEN.
- [ ] Commit: `feat: normalize legacy runtime bundles to v3`.

### Task 14: Preserve deterministic generation seed behavior

**Files:**
- Modify: `src/logic/questionBank.js`
- Test: `tests/b3-generation-compatibility.test.js`

**Interfaces:**
- Generator consumes stable `domain_id` plus optional compatibility seed alias.

- [ ] RED canonical stable-ID generation initially differs from B2 payload.
- [ ] Change generator signature to accept domain metadata/seed alias without changing question IDs.
- [ ] Use `legacySeedKey(domainId,catalog)` for migrated domains.
- [ ] Verify exact B2 payload compatibility returns GREEN.
- [ ] Commit: `feat: preserve deterministic questions across domain migration`.

### Task 15: Migrate canonical concept documents

**Files:**
- Modify: seven `data/concepts/*.json` files.
- Test: `tests/concept-document-v2.test.js`, `tests/b3-generation-compatibility.test.js`.

**Interfaces:**
- Replaces top-level `domain` display key with stable `domain_id`.

- [ ] RED canonical concept scan requires `domain_id` and forbids `domain`.
- [ ] Migrate all seven files only; concept arrays/IDs/text/order unchanged.
- [ ] Verify schema + exact generation payload GREEN.
- [ ] Commit: `refactor: migrate concepts to stable domain ids`.

### Task 16: Migrate canonical exam profile to V2

**Files:**
- Modify: `tracks/sdaia-ai-engineer/exam-profiles/project-reference-v1.json`
- Test: `tests/exam-profile-v2.test.js`, `tests/exam.test.js`.

**Interfaces:**
- `schema_version:2`; stable-ID weight keys with identical numeric values.

- [ ] RED canonical profile expected to be V2.
- [ ] Change only schema version + weight keys.
- [ ] Verify weight sum 100.0 and exact logical-domain values.
- [ ] Verify 200-question allocation equals legacy allocation by mapped domain.
- [ ] Commit: `refactor: migrate SDAIA exam profile to stable domain ids`.

### Task 17: Migrate TrackPresentationV1 domain-label keys

**Files:**
- Modify: `tracks/sdaia-ai-engineer/presentation.json`
- Modify: `scripts/validate.js`
- Test: `tests/presentation-contract.test.js`, `tests/content-model-v2.test.js`.

**Interfaces:**
- Keeps TrackPresentationV1 schema version 1.
- `domain_labels` keyed by stable IDs.

- [ ] RED require every stable ID in both `ar` and `en`.
- [ ] Replace seven legacy keys with stable IDs; preserve all label values verbatim.
- [ ] Make presentation validator use DomainCatalogV2, not profile label semantics.
- [ ] Verify GREEN.
- [ ] Commit: `refactor: key presentation labels by stable domain id`.

### Task 18: Advertise content-model-v2 capability

**Files:**
- Modify: `tracks/sdaia-ai-engineer/manifest.json`
- Modify: `scripts/load_track.js`
- Test: `tests/track-contract.test.js`.

**Interfaces:**
- Manifest remains schema version 1.
- Adds capability `content-model-v2`.
- Loader returns domain catalog for capable tracks.

- [ ] RED capable track must load `tracks/<id>/domains.json`.
- [ ] Add capability only.
- [ ] Extend tooling loader to expose domain catalog.
- [ ] Verify TrackManifestV1 remains valid.
- [ ] Commit: `feat: advertise content-model-v2 capability`.

### Task 19: Upgrade runtime loader to RuntimeBundleV3

**Files:**
- Modify: `src/content/runtimeBundle.js`
- Modify: `tests/runtime-bundle.test.js`

**Interfaces:**
- `loadRuntimeBundle(fetchJson,trackId) -> RuntimeBundleV3` for content-model-v2 tracks.

- [ ] RED expected contract version 3.
- [ ] RED expected domain catalog in `domains`.
- [ ] RED concepts keyed by stable IDs.
- [ ] Implement V3 loading using manifest capability + `domains.json`.
- [ ] Keep bounded compatibility path for non-v2 fixture tracks if required by tests.
- [ ] Verify GREEN.
- [ ] Commit: `feat: load runtime bundle v3`.

### Task 20: Emit RenderedQuestionV2

**Files:**
- Modify: `src/logic/questionBank.js`
- Modify: `data/schema/rendered-question-v2.schema.json`
- Test: `tests/bank.test.js`, `tests/b3-generation-compatibility.test.js`.

**Interfaces:**
- Generated questions expose `domain_id`, no active structural `domain`.

- [ ] RED generated questions must match V2 schema.
- [ ] Replace output identity field with `domain_id`.
- [ ] Verify all 1,120 IDs/family IDs/text/options/answers/difficulty unchanged.
- [ ] Verify exact generation compatibility GREEN.
- [ ] Commit: `refactor: emit stable domain identity on questions`.

### Task 21: Update exam logic consumers to stable IDs

**Files:**
- Modify: `src/logic/exam.js`
- Modify: `src/app.js`
- Test: `tests/exam.test.js`, browser smoke source contract.

**Interfaces:**
- Section filtering uses `question.domain_id`.
- Weight maps use stable IDs.

- [ ] RED section exam expects only requested stable ID.
- [ ] Update filter/aggregation accesses from `domain` to `domain_id`.
- [ ] Update app domain grouping/display calls to stable IDs.
- [ ] Verify full 200 allocation and standalone section behavior unchanged.
- [ ] Commit: `refactor: use stable domain ids in exam runtime`.

### Task 22: Preserve StateV2 unfinished exam and history

**Files:**
- Modify only if required: `src/state/migrate.js`
- Modify: `tests/state-migration.test.js`

**Interfaces:**
- StateV2 remains version 2 and question-ID keyed.

- [ ] RED/compatibility fixture proves unfinished exam question IDs/answers/confidence/flags/option orders survive B3.
- [ ] Assert history length/order and track isolation survive.
- [ ] Assert no legacy domain rewrite is required for active structural state.
- [ ] Implement no-op/minimal adapter only if a proven structural domain field exists.
- [ ] Verify GREEN.
- [ ] Commit: `test: preserve learner state through content-model migration`.

### Task 23: Prove historical legacy fields are preserved, not rewritten

**Files:**
- Modify: `tests/state-migration.test.js`
- Optional fixture: `tests/fixtures/b3/state-with-legacy-domain-summary.json`

**Interfaces:**
- Legacy summaries remain historical display data.

- [ ] Add fixture containing a historical legacy domain label if such field exists/needed.
- [ ] Assert B3 load does not delete or structurally reinterpret it.
- [ ] Verify StateV2 schema unchanged.
- [ ] Commit: `test: preserve historical legacy domain summaries`.

### Task 24: Upgrade browser/API storage contracts to V3

**Files:**
- Modify: `src/storage/browser.js`
- Modify: `src/storage/api.js`
- Modify: `scripts/contract_test.js`
- Modify: `tests/storage.browser.test.js`
- Modify: `tests/storage.api.test.js`

**Interfaces:**
- Both adapters return RuntimeBundleV3 for SDAIA.

- [ ] RED browser/API contract expects `contract_version===3`.
- [ ] Assert browser/API bundles expose identical stable domain IDs.
- [ ] Reject mixed V2/V3 semantics under declared version 3.
- [ ] Implement minimal adapter changes.
- [ ] Verify adapter contracts GREEN.
- [ ] Commit: `refactor: upgrade storage adapters to runtime v3`.

### Task 25: Upgrade server API to RuntimeBundleV3

**Files:**
- Modify: `server/app/main.py`
- Modify: `server/tests/test_api.py`

**Interfaces:**
- `GET /v1/bank?track_id=sdaia-ai-engineer` returns RuntimeBundleV3.

- [ ] RED explicit current track expects contract version 3 and domain catalog.
- [ ] RED unknown track remains bounded 404 `invalid_track`.
- [ ] Load `domains.json`, V2 profile and stable concept keys.
- [ ] Preserve endpoint path/selection behavior.
- [ ] Verify Python tests GREEN.
- [ ] Commit: `feat: serve runtime bundle v3`.

### Task 26: Update validation pipeline to canonical V2/V3 contracts

**Files:**
- Modify: `scripts/validate.js`
- Test: B3 acceptance + content-model tests.

**Interfaces:**
- Canonical validator compiles/validates V2/V3 schemas and referential integrity.

- [ ] Validate DomainCatalogV2.
- [ ] Validate ExamProfileV2.
- [ ] Validate all ConceptDocumentV2 files.
- [ ] Validate generated RenderedQuestionV2.
- [ ] Validate RuntimeBundleV3-compatible references.
- [ ] Verify `npm run validate` GREEN.
- [ ] Commit: `feat: validate canonical content model v2`.

### Task 27: Update service-worker/offline domain-catalog rules

**Files:**
- Modify: `sw.js`
- Modify: `scripts/verify_sw_assets.js`
- Modify: `tests/service-worker-contract.test.js`

**Interfaces:**
- Domain catalog is available offline where runtime bootstrap requires it.
- Concept chunks remain on-demand.

- [ ] RED capable track requires `domains.json` offline asset.
- [ ] Add domain catalog to shell for content-model-v2 production track.
- [ ] Update verifier to derive required catalog from capability.
- [ ] Assert concept chunks remain excluded.
- [ ] Verify `npm run verify:sw` GREEN.
- [ ] Commit: `feat: support content-model v2 offline shell`.

### Task 28: Upgrade live release verifier

**Files:**
- Modify: `scripts/verify_live_release.js`
- Modify: `tests/release-contract.test.js`

**Interfaces:**
- Emits `live content model: PASS <track>@<version> domains=7 contract=v3`.

- [ ] RED live verifier must fetch/validate `domains.json` for capable tracks.
- [ ] Validate stable profile/concept/presentation references.
- [ ] Validate V3 contract expectation.
- [ ] Preserve registry and SW checks.
- [ ] Verify local artifact live verifier GREEN.
- [ ] Commit: `feat: verify live content model v2`.

### Task 29: Update Pages artifact boundary

**Files:**
- Modify if needed: `.github/workflows/ci.yml`, `.github/workflows/pages.yml`
- Modify: `tests/release-contract.test.js`

**Interfaces:**
- Artifact includes canonical `domains.json` and new schemas/modules via existing generic copy rules.

- [ ] Assert Pages artifact contains domain catalog.
- [ ] Assert legacy B2 fixtures remain excluded.
- [ ] Preserve registry and retired-data exclusions.
- [ ] Verify release tests GREEN.
- [ ] Commit: `ci: verify content-model v2 Pages artifact`.

### Task 30: Upgrade browser smoke

**Files:**
- Modify: `scripts/browser_smoke.py`

**Interfaces:**
- Derives expected stable IDs from `domains.json`.

- [ ] Verify Arabic/English labels resolve from stable IDs.
- [ ] Verify RTL/LTR unchanged.
- [ ] Verify full exam remains 200.
- [ ] Verify section exam filters by stable ID.
- [ ] Verify offline reload after server shutdown.
- [ ] Verify feedback identity remains track/presentation driven.
- [ ] Commit: `test: cover stable-domain browser behavior`.

### Task 31: Add legacy structural-key leakage regression

**Files:**
- Modify: `tests/b3-content-model-acceptance.test.js`

**Interfaces:**
- Legacy labels allowed only in presentation values, migration map/aliases, frozen fixtures and migration docs/tests.

- [ ] Scan canonical profile/concepts/runtime/app/exam/validators for legacy structural keys.
- [ ] Assert canonical structural surfaces contain stable IDs only.
- [ ] Keep explicit allowlist for presentation display values and compatibility artifacts.
- [ ] Verify GREEN.
- [ ] Commit: `test: prevent legacy domain identity leakage`.

### Task 32: Whole-suite acceptance

**Files:**
- Update checkpoint/ledger only after evidence.

**Interfaces:**
- Produces fresh B3 acceptance evidence.

- [ ] Run `npm run validate`.
- [ ] Run `npm test`.
- [ ] Run `node --check src/app.js` and relevant modules.
- [ ] Run `npm run verify:sw`.
- [ ] Build Pages artifact and run local live verifier.
- [ ] Run browser smoke.
- [ ] Run `PYTHONPATH=server pytest -q server/tests`.
- [ ] Run SQLite smoke, browser adapter contract and API adapter contract.
- [ ] Verify exact 1,120 generated payload compatibility fixture.
- [ ] Verify 200-question allocation equivalence.
- [ ] Verify TrackRegistryV1, TrackManifestV1, TrackPresentationV1 and StateV2 remain unchanged.
- [ ] Record exact counts/results.

### Task 33: Whole-branch review

**Files:**
- Create: `docs/superpowers/reviews/2026-09-27-b3-final-review.md`
- Update: `HANDOFF.md`

**Interfaces:**
- Base: B2 merge SHA.
- Produces review disposition.

- [ ] Invoke Superpowers requesting-code-review.
- [ ] If no reviewer/subagent tool exists, record exactly `Final review: self-review (no subagent tool)`.
- [ ] Review versioning, identity mapping, deterministic payload, state preservation, V2→V3 compatibility, offline/release behavior and leakage.
- [ ] Fix Critical/Important findings via TDD.
- [ ] Record Minor findings/defer explicitly.
- [ ] Update durable handoff/checkpoint.

### Task 34: Integrate and post-merge verify

**Files:**
- Update B3 checkpoint/post-merge record.

**Interfaces:**
- Uses `finishing-a-development-branch`.

- [ ] Verify exact branch-head CI.
- [ ] Invoke `finishing-a-development-branch` and follow its human integration gate.
- [ ] If user has already explicitly chosen merge after green, apply that choice only if the current skill permits it at that point; otherwise present the required options.
- [ ] Merge only after all exact-head tests are green.
- [ ] Record merge SHA.
- [ ] Verify main Pages/deploy/live content-model verifier.
- [ ] Verify main server/adapter workflow.
- [ ] Re-read B3 spec/plan/review directly from main.
- [ ] Create post-merge verification record.
- [ ] Stop before Question Factory v2 implementation.

## Suggested Checkpoints

- **A1:** Tasks 1–4 — B2 baseline + frozen compatibility + RED B3 boundary
- **A2:** Tasks 5–7 — DomainCatalogV2 + migration map
- **B1:** Tasks 8–13 — schemas + normalization + compatibility adapter
- **B2:** Tasks 14–18 — deterministic seed + canonical content/profile/presentation migration
- **C1:** Tasks 19–21 — RuntimeBundleV3 + question/exam runtime
- **C2:** Tasks 22–25 — StateV2 + browser/API/server
- **D1:** Tasks 26–31 — validation/offline/release/browser/leakage
- **E1:** Task 32 — whole-suite acceptance
- **E2:** Tasks 33–34 — whole-branch review/integration/post-merge

After every checkpoint update:
`docs/superpowers/reviews/2026-09-27-b3-checkpoint.md`

The checkpoint must state current HEAD, completed tasks/microtasks, RED→GREEN evidence, exact test results, rulings, known failures, next exact task, files changed, resume safety and merge status.

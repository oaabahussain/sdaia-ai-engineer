# B1 Track Presentation Contract Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move SDAIA-specific brand, hero and domain-localization data out of platform runtime files into a validated `TrackPresentationV1` document while preserving current behavior and all Programme A/B0 contracts.

**Architecture:** Add `tracks/<track-id>/presentation.json` plus a small presentation resolver layer. Generic platform translations remain code; track-specific copy becomes declarative data. Runtime presentation failure degrades to safe generic/domain-key fallbacks, while CI/release validation is strict for active packaged tracks.

**Tech Stack:** Vanilla ES modules, JSON Schema draft-07, AJV, Node.js `node:test`, Python/Chrome WebDriver browser smoke, GitHub Actions/Pages.

**Spec:** `docs/superpowers/specs/2026-09-26-b1-track-presentation-contract-design.md`

## Global Constraints

- Preserve `TrackManifestV1`, `RuntimeBundleV2`, `StateV2`, current track ID, manifest version, exam profile IDs, question IDs, domain keys, public URLs and learner progress.
- Do not implement Track Registry, track selector, second track, Content Model v2, stable domain IDs, adaptive learning, spaced scheduling, AI tutor, Question Factory, 14,000+ expansion, track themes, CMS, auth, protected content or backend changes.
- `ACTIVE_TRACK_ID = 'sdaia-ai-engineer'` remains a permitted B2-deferred bootstrap literal.
- Presentation data cannot override `manifest.official_status` or `exam_profile.evidence_status`.
- Current SDAIA exam rules remain `project-reference-unverified`.
- Runtime presentation loading is resilient; release validation for an active packaged track is strict.
- Supported locales remain exactly `ar` and `en`; platform default locale remains `ar`.
- Current domain strings remain compatibility keys; B1 does not rename them.
- B1 must correct the unsupported current PWA `Adaptive` claim but must not invent a permanent generic product name.
- Current SDAIA user-facing presentation should remain materially unchanged after migration.
- No runtime/product behavior unrelated to presentation may change.

## File Structure

### New files

- `data/schema/track-presentation.schema.json` — JSON Schema for `TrackPresentationV1`.
- `tracks/sdaia-ai-engineer/presentation.json` — canonical SDAIA presentation data.
- `src/presentation/coreI18n.js` — generic app + feedback translation strings and generic evidence-status warnings.
- `src/presentation/trackPresentation.js` — presentation loading, identity validation, locale resolution and domain-label fallback.
- `src/feedback.js` — current feedback behavior moved from inline script so it can reuse presentation/core-i18n modules.
- `tests/presentation-contract.test.js` — schema/identity/locale/domain/fallback contract tests.
- `tests/b1-presentation-acceptance.test.js` — end-to-end source-boundary/leakage/compatibility acceptance contract.
- `docs/superpowers/reviews/2026-09-27-b1-baseline.md` — immutable B1 baseline/leak inventory.
- `docs/superpowers/reviews/2026-09-27-b1-final-review.md` — whole-branch verification record.

### Modified files

- `scripts/load_track.js` — tooling loader returns presentation document.
- `scripts/validate.js` — schema + cross-document presentation validation.
- `src/app.js` — consume generic core strings and track presentation.
- `index.html` — neutral shell; track presentation supplied after init.
- `feedback.html` — neutral shell and external module entrypoint.
- `manifest.webmanifest` — remove unsupported adaptive claim; retain temporary current-track install identity.
- `sw.js` — shell-cache new presentation modules/data required for reliable offline reload.
- `scripts/verify_sw_assets.js` — verify presentation-related shell assets.
- `scripts/verify_live_release.js` — verify active presentation availability and identity live.
- `scripts/browser_smoke.py` — Arabic/English presentation, feedback and offline checks.
- `tests/release-contract.test.js` — release verifier/artifact presentation contract.
- `tests/service-worker-contract.test.js` — presentation shell-cache contract.
- `tests/feedback-contract.test.js` — feedback module/presentation sourcing with existing issue semantics preserved.
- `tests/programme-a-acceptance.test.js` — compatibility guard where needed.
- `HANDOFF.md` — B1 completion/current continuation only at final checkpoint.

## Core Interfaces

The plan fixes these interfaces for all implementing tasks:

```js
// src/presentation/coreI18n.js
export const CORE_LOCALES = ['ar', 'en'];
export const CORE_DEFAULT_LOCALE = 'ar';
export const CORE_I18N = { ar: {...}, en: {...} };
// Each locale exposes statusNotice(officialStatus, evidenceStatus) -> string.

// src/presentation/trackPresentation.js
export async function loadTrackPresentation(fetchJson, manifest);
export function resolvePresentationLocale(preferredLocale, manifest, presentation);
export function getPresentationLocale(presentation, locale);
export function getDomainLabel(presentation, locale, domainKey);
```

Behavior:

- `loadTrackPresentation(fetchJson, manifest)` fetches `./tracks/${manifest.id}/presentation.json`, then rejects track/version mismatch.
- Browser callers pass a local static JSON helper with exact behavior: `async url => { const r = await fetch(url,{cache:'no-cache'}); if(!r.ok) throw new Error(...); return r.json(); }`. B1 does not route presentation through the API bank endpoint.
- `resolvePresentationLocale(...)` returns preferred locale when it is in core + manifest + presentation sets; otherwise presentation `default_locale`; otherwise `CORE_DEFAULT_LOCALE` when valid; otherwise the first common locale. It throws only when no common locale exists.
- `getPresentationLocale(presentation, locale)` returns the locale object or `null`.
- `getDomainLabel(...)` returns localized label or `domainKey`.
- Application code catches presentation loading failures **and locale-resolution failures** and continues with track ID/domain-key fallbacks plus a valid `CORE_I18N` locale. CI never accepts a missing/invalid active-track presentation.

## Review Focus

1. **Cold/offline reload after introducing two new ES modules and presentation JSON** — service worker must make the same current offline reload pass rather than depending on network fetch order; pinned in Tasks 23 and 28.
2. **Presentation identity/version mismatch** — runtime must reject incompatible presentation but keep exam usable; CI must fail; pinned in Tasks 6, 11 and 15.
3. **Locale set disagreement or unsupported saved locale** — resolver must choose only the intersection of core/manifest/presentation and preserve RTL/LTR; pinned in Tasks 7, 12 and 27.
4. **Track copy accidentally reintroduced into core** — source-level leakage contract must allow only the B2-deferred `ACTIVE_TRACK_ID` bootstrap ID; pinned in Task 26.
5. **Evidence truth overridden by branding copy** — unofficial/unverified status text must derive only from manifest/profile status, not `presentation.json`; pinned in Tasks 18 and 26.

---

### Task 1: Freeze B1 Baseline and Presentation Leak Inventory

**Files:**
- Create: `docs/superpowers/reviews/2026-09-27-b1-baseline.md`

**Interfaces:**
- Consumes: `main@0efae25ba71ca26030bd2471a26cb273bc574826`
- Produces: immutable B1 baseline and explicit allowed/deferred leakage list.

- [ ] **Step 1: Record the exact base SHA and B1 branch.**
- [ ] **Step 2: Record current presentation leaks in `index.html`, `src/app.js`, `feedback.html`, and `manifest.webmanifest`.**
- [ ] **Step 3: Record `src/config.js: ACTIVE_TRACK_ID='sdaia-ai-engineer'` as the only intentional B2-deferred runtime track literal.**
- [ ] **Step 4: Record current CI evidence: Node 74/74, Python 16/16, browser/offline/live release green on B0 merge SHA.**
- [ ] **Step 5: Commit `docs: freeze B1 presentation baseline`.**

### Task 2: Add B1 Acceptance Contract — RED

**Files:**
- Create: `tests/b1-presentation-acceptance.test.js`

**Interfaces:**
- Produces: source-boundary regression suite extended through B1.

- [ ] **Step 1: Write failing tests requiring `track-presentation.schema.json`, active `presentation.json`, `src/presentation/coreI18n.js`, and `src/presentation/trackPresentation.js`.**
- [ ] **Step 2: Add failing assertions that `src/app.js` no longer defines `DOMAIN_AR` or embeds `SDAIA AI Engineer`.**
- [ ] **Step 3: Add failing assertions that `index.html` and `feedback.html` do not embed `SDAIA AI Engineer`.**
- [ ] **Step 4: Assert `src/config.js` still exposes `ACTIVE_TRACK_ID` as an explicit B2-deferred exception.**
- [ ] **Step 5: Run `node --test tests/b1-presentation-acceptance.test.js`; expected RED on missing contract/files and current presentation leaks.**
- [ ] **Step 6: Commit `test: capture B1 presentation boundary`.**

### Task 3: Define TrackPresentationV1 Schema

**Files:**
- Create: `data/schema/track-presentation.schema.json`
- Create: `tests/presentation-contract.test.js`

**Interfaces:**
- Produces: schema requiring `schema_version`, `track_id`, `track_version`, `default_locale`, and locale entries with display/brand/hero/domain labels.

- [ ] **Step 1: Write a failing AJV test for a minimal valid TrackPresentationV1 document.**
- [ ] **Step 2: Write failing tests rejecting missing hero fields and arbitrary top-level/locale fields.**
- [ ] **Step 3: Run targeted test; expected RED because schema is missing.**
- [ ] **Step 4: Create the draft-07 schema with `schema_version: const 1` and `additionalProperties:false` at contract-owned levels.**
- [ ] **Step 5: Re-run targeted test; expected GREEN.**
- [ ] **Step 6: Commit `feat: add track presentation v1 schema`.**

### Task 4: Add Canonical SDAIA Presentation Document

**Files:**
- Create: `tracks/sdaia-ai-engineer/presentation.json`
- Test: `tests/presentation-contract.test.js`

**Interfaces:**
- Consumes: Task 3 schema.
- Produces: current SDAIA Arabic/English brand, hero, and all seven domain labels as declarative data.

- [ ] **Step 1: Add failing test that the current track presentation exists and validates against TrackPresentationV1.**
- [ ] **Step 2: Add assertions for `track_id='sdaia-ai-engineer'`, `track_version='2026.09'`, `default_locale='ar'`, and locales exactly `ar/en`.**
- [ ] **Step 3: Verify RED because file is missing.**
- [ ] **Step 4: Copy the current intended SDAIA brand/hero/domain labels into `presentation.json` without changing user-facing wording.**
- [ ] **Step 5: Verify GREEN.**
- [ ] **Step 6: Commit `feat: add SDAIA track presentation data`.**

### Task 5: Extend Tooling Loader With Presentation

**Files:**
- Modify: `scripts/load_track.js`
- Test: `tests/track-contract.test.js`

**Interfaces:**
- Produces: `loadTrack(root, trackId)` additionally returns `presentation`.

- [ ] **Step 1: Add failing assertion `loadTrack(...).presentation.track_id === manifest.id`.**
- [ ] **Step 2: Run targeted test; expected RED because `presentation` is absent.**
- [ ] **Step 3: Load `tracks/<trackId>/presentation.json` and add it to the returned object; do not change existing returned fields.**
- [ ] **Step 4: Re-run current track-contract tests; expected GREEN.**
- [ ] **Step 5: Commit `feat: load track presentation in tooling`.**

### Task 6: Validate Presentation Schema and Identity

**Files:**
- Modify: `scripts/validate.js`
- Test: `tests/presentation-contract.test.js`

**Interfaces:**
- Consumes: `loadTrack(...).presentation`.
- Produces: release validation of schema, track ID and track version.

- [ ] **Step 1: Add tests proving validation rejects `presentation.track_id !== manifest.id` and `track_version !== manifest.version`.**
- [ ] **Step 2: Verify tests RED against current validator source/behavior.**
- [ ] **Step 3: Compile/apply `track-presentation.schema.json` in `scripts/validate.js`.**
- [ ] **Step 4: Add explicit track/version cross-document checks.**
- [ ] **Step 5: Run `npm run validate`; expected PASS on canonical track.**
- [ ] **Step 6: Run presentation tests; expected GREEN.**
- [ ] **Step 7: Commit `feat: validate presentation identity`.**

### Task 7: Validate Locale Completeness

**Files:**
- Modify: `scripts/validate.js`
- Test: `tests/presentation-contract.test.js`

**Interfaces:**
- Produces: exact equality between manifest locale set and presentation locale set; valid default locale.

- [ ] **Step 1: Add RED cases for missing `en`, undeclared extra locale, and default locale outside manifest locales.**
- [ ] **Step 2: Add validator checks for set equality and default-locale membership.**
- [ ] **Step 3: Run targeted tests + `npm run validate`; expected GREEN.**
- [ ] **Step 4: Commit `feat: validate presentation locales`.**

### Task 8: Validate Domain-Label Coverage

**Files:**
- Modify: `scripts/validate.js`
- Test: `tests/presentation-contract.test.js`

**Interfaces:**
- Consumes: exam-profile weight keys as B1 domain compatibility keys.
- Produces: every current domain has a non-empty label in every presentation locale.

- [ ] **Step 1: Add RED case deleting one Arabic label and one English label.**
- [ ] **Step 2: Add validator check over `Object.keys(examProfile.weights)` for every locale.**
- [ ] **Step 3: Verify canonical presentation passes.**
- [ ] **Step 4: Commit `feat: validate presentation domain coverage`.**

### Task 9: Extract Generic Core I18N

**Files:**
- Create: `src/presentation/coreI18n.js`
- Modify: `src/app.js`
- Test: `tests/b1-presentation-acceptance.test.js`

**Interfaces:**
- Produces: `CORE_LOCALES`, `CORE_DEFAULT_LOCALE`, `CORE_I18N`.

- [ ] **Step 1: Add RED assertion that generic app UI strings are imported from `./presentation/coreI18n.js`.**
- [ ] **Step 2: Create module exporting exactly `CORE_LOCALES=['ar','en']`, `CORE_DEFAULT_LOCALE='ar'`, and generic current UI translations.**
- [ ] **Step 3: Move only generic strings out of `src/app.js`; leave track brand/hero temporarily until later tasks.**
- [ ] **Step 4: Run the targeted core-i18n/import tests plus `node --check src/app.js`; do not claim the full suite GREEN while the intentionally RED B1 acceptance contract still covers later tasks.**
- [ ] **Step 5: Commit `refactor: extract generic core translations`.**

### Task 10: Add Presentation Loader

**Files:**
- Create: `src/presentation/trackPresentation.js`
- Test: `tests/presentation-contract.test.js`

**Interfaces:**
- Produces: `loadTrackPresentation(fetchJson, manifest)`.

- [ ] **Step 1: Add RED unit test asserting fetch path `./tracks/${manifest.id}/presentation.json`.**
- [ ] **Step 2: Add RED unit test for matching presentation return value.**
- [ ] **Step 3: Implement `loadTrackPresentation(fetchJson, manifest)` with exact path and track/version checks.**
- [ ] **Step 4: Verify unit tests GREEN.**
- [ ] **Step 5: Commit `feat: add track presentation loader`.**

### Task 11: Reject Runtime Identity Mismatch

**Files:**
- Modify: `src/presentation/trackPresentation.js`
- Test: `tests/presentation-contract.test.js`

**Interfaces:**
- Strengthens Task 10 loader.

- [ ] **Step 1: Add RED tests for wrong `track_id` and wrong `track_version`.**
- [ ] **Step 2: Require loader to throw descriptive incompatibility errors for both.**
- [ ] **Step 3: Verify GREEN.**
- [ ] **Step 4: Commit `test: enforce runtime presentation identity`.**

### Task 12: Implement Locale Resolver

**Files:**
- Modify: `src/presentation/trackPresentation.js`
- Test: `tests/presentation-contract.test.js`

**Interfaces:**
- Produces: `resolvePresentationLocale(preferredLocale, manifest, presentation)`.

- [ ] **Step 1: Add RED cases: preferred `en`; invalid saved locale falls to `ar`; missing preferred falls to presentation default; no common locale throws.**
- [ ] **Step 2: Implement resolver using `CORE_LOCALES` + manifest + presentation intersection and `CORE_DEFAULT_LOCALE='ar'`.**
- [ ] **Step 3: Verify all locale tests GREEN.**
- [ ] **Step 4: Commit `feat: resolve presentation locale safely`.**

### Task 13: Add Locale and Domain Accessors

**Files:**
- Modify: `src/presentation/trackPresentation.js`
- Test: `tests/presentation-contract.test.js`

**Interfaces:**
- Produces:
  - `getPresentationLocale(presentation, locale) -> object|null`
  - `getDomainLabel(presentation, locale, domainKey) -> string`

- [ ] **Step 1: Add RED tests for existing locale, missing locale returning `null`, known domain label, and unknown domain falling back to `domainKey`.**
- [ ] **Step 2: Implement the two accessors without throwing on missing display data.**
- [ ] **Step 3: Verify GREEN.**
- [ ] **Step 4: Commit `feat: add presentation accessors`.**

### Task 14: Load Presentation Without Blocking Exam Runtime

**Files:**
- Modify: `src/app.js`
- Test: `tests/b1-presentation-acceptance.test.js`

**Interfaces:**
- Consumes: Tasks 10–13.
- Produces: app-level `PRESENTATION` value that may be `null`; exam bank initialization remains independent.

- [ ] **Step 1: Add RED source/behavior test requiring a presentation-load `try/catch` separated from canonical bank failure handling.**
- [ ] **Step 2: In `init()`, load the bank first, define the local static `fetchJson(url)` helper (`fetch(url,{cache:'no-cache'})` + non-OK error), then attempt `loadTrackPresentation(fetchJson,BANK.track)`; on failure `console.warn` and continue with `PRESENTATION=null`.**
- [ ] **Step 3: Ensure bank/profile failures still reach the existing error box.**
- [ ] **Step 4: Run app parse + targeted tests.**
- [ ] **Step 5: Commit `feat: make presentation loading non-blocking`.**

### Task 15: Add Runtime Fallback Presentation Behavior

**Files:**
- Modify: `src/app.js`
- Test: `tests/presentation-contract.test.js`, `tests/b1-presentation-acceptance.test.js`

**Interfaces:**
- Runtime fallback:
  - display/brand -> `BANK.track.id`
  - missing domain label -> current domain key
  - generic controls remain from `CORE_I18N`.

- [ ] **Step 1: Add RED acceptance assertion that app references fallback track ID when presentation is unavailable.**
- [ ] **Step 2: Add minimal helper in app for current presentation locale/view using Task 13 accessors; catch locale-resolution errors and fall back to a valid core locale plus `BANK.track.id`/domain keys.**
- [ ] **Step 3: Verify no presentation failure can block `renderHome()` or exam start.**
- [ ] **Step 4: Commit `feat: add resilient presentation fallback`.**

### Task 16: Migrate Brand and Hero Copy Out of Core

**Files:**
- Modify: `src/app.js`
- Modify: `index.html`
- Test: `tests/b1-presentation-acceptance.test.js`

**Interfaces:**
- Consumes: `presentation.locales[effectiveLocale]`.
- Produces: dynamic document title, brand, hero eyebrow/title/description.

- [ ] **Step 1: Add RED leakage assertions for current SDAIA brand/hero literals in `src/app.js` and `index.html`.**
- [ ] **Step 2: Replace track-specific HTML fallbacks with neutral shell placeholders only.**
- [ ] **Step 3: Apply track display/brand/hero after presentation locale resolution.**
- [ ] **Step 4: Set `document.title` from track display name plus generic practice label; fallback to track ID.**
- [ ] **Step 5: Verify leakage assertions GREEN.**
- [ ] **Step 6: Commit `refactor: source track brand and hero from presentation`.**

### Task 17: Remove DOMAIN_AR and Migrate Domain Labels

**Files:**
- Modify: `src/app.js`
- Test: `tests/b1-presentation-acceptance.test.js`, `tests/presentation-contract.test.js`

**Interfaces:**
- Consumes: `getDomainLabel(PRESENTATION, lang, domainKey)`.
- Produces: domain rendering independent of SDAIA translations in core.

- [ ] **Step 1: Confirm RED assertion for `DOMAIN_AR` before change.**
- [ ] **Step 2: Delete `DOMAIN_AR`.**
- [ ] **Step 3: Replace `domainLabel(domain)` implementation with presentation accessor + domain-key fallback.**
- [ ] **Step 4: Run targeted tests; expected GREEN for domain leakage.**
- [ ] **Step 5: Commit `refactor: source domain labels from track presentation`.**

### Task 18: Make Official/Evidence Warnings Canonical

**Files:**
- Modify: `src/presentation/coreI18n.js`
- Modify: `src/app.js`
- Test: `tests/b1-presentation-acceptance.test.js`

**Interfaces:**
- Produces generic localized warning functions keyed only by:
  - `BANK.track.official_status`
  - `PROFILE.evidence_status`.

- [ ] **Step 1: Add RED test proving `presentation.json` contains no `official`, `unofficial`, or evidence-status override field.**
- [ ] **Step 2: Add `CORE_I18N[locale].statusNotice(officialStatus,evidenceStatus) -> string` for Arabic and English.**
- [ ] **Step 3: Replace the current hard-coded unofficial/project-reference sentence with output derived from manifest/profile status.**
- [ ] **Step 4: Assert `project-reference-unverified` never renders as official.**
- [ ] **Step 5: Commit `feat: derive evidence warnings from canonical status`.**

### Task 19: Convert Feedback Page to Shared Modules

**Files:**
- Create: `src/feedback.js`
- Modify: `feedback.html`
- Test: `tests/feedback-contract.test.js`

**Interfaces:**
- Consumes: `CORE_I18N` and presentation loader/resolver.
- Produces: feedback behavior in external ES module with same forms/issue URLs.

- [ ] **Step 1: Add RED assertion that `feedback.html` loads `./src/feedback.js` as a module and no longer embeds the main feedback behavior script.**
- [ ] **Step 2: Move existing language/theme/form/rating/issue behavior byte-for-behavior into `src/feedback.js`.**
- [ ] **Step 3: Import generic feedback translations from `coreI18n.js`; do not change issue template/URL/body semantics.**
- [ ] **Step 4: Run feedback contract tests.**
- [ ] **Step 5: Commit `refactor: extract feedback page module`.**

### Task 20: Source Feedback Brand From Track Presentation

**Files:**
- Modify: `src/feedback.js`
- Modify: `feedback.html`
- Test: `tests/feedback-contract.test.js`, `tests/b1-presentation-acceptance.test.js`

**Interfaces:**
- Uses current `ACTIVE_TRACK_ID` only for B1 bootstrap; loads manifest then presentation for display identity.

- [ ] **Step 1: Add RED leakage assertion that `feedback.html` and `src/feedback.js` contain no `SDAIA AI Engineer` literal.**
- [ ] **Step 2: Load current manifest and presentation using `ACTIVE_TRACK_ID` with the same local static `fetchJson(url)` helper contract; resolve locale from current StateV2 preference, and fall back to core locale/track ID if presentation or locale resolution fails.**
- [ ] **Step 3: Set feedback document title/brand from presentation with track-ID fallback.**
- [ ] **Step 4: Preserve public-warning and form labels from generic translations.**
- [ ] **Step 5: Verify feedback contracts GREEN.**
- [ ] **Step 6: Commit `feat: source feedback identity from presentation`.**

### Task 21: Preserve Feedback Submission Semantics

**Files:**
- Modify only if needed: `src/feedback.js`
- Test: `tests/feedback-contract.test.js`, `scripts/browser_smoke.py`

**Interfaces:**
- Existing GitHub issue flow remains unchanged.

- [ ] **Step 1: Pin template `public-feedback.md`, encoded suggestion title/body, contribution body/source, and rating comment in tests.**
- [ ] **Step 2: Pin public warning text and StateV2-only writes with legacy read fallback.**
- [ ] **Step 3: Run feedback contract tests; fix only regressions caused by extraction.**
- [ ] **Step 4: Commit `test: preserve feedback behavior through presentation migration`.**

### Task 22: Correct PWA Description Without Deciding B2 Identity

**Files:**
- Modify: `manifest.webmanifest`
- Test: `tests/b1-presentation-acceptance.test.js`

**Interfaces:**
- PWA name/short name may remain current-track-specific until B2.
- Unsupported `Adaptive` wording must be removed.

- [ ] **Step 1: Add RED assertion that description does not contain `Adaptive` or another unimplemented adaptive claim.**
- [ ] **Step 2: Change description to a factual current-capability description of the bilingual practice/exam experience.**
- [ ] **Step 3: Do not rename `name` or `short_name` to a new generic product.**
- [ ] **Step 4: Commit `docs: correct current PWA capability description`.**

### Task 23: Add Presentation Assets to Offline Shell Contract

**Files:**
- Modify: `sw.js`
- Modify: `scripts/verify_sw_assets.js`
- Modify: `tests/service-worker-contract.test.js`

**Interfaces:**
- Shell assets must include:
  - `./src/presentation/coreI18n.js`
  - `./src/presentation/trackPresentation.js`
  - `./src/feedback.js`
  - `./tracks/sdaia-ai-engineer/presentation.json`.

- [ ] **Step 1: Add RED service-worker contract assertions for all four presentation assets.**
- [ ] **Step 2: Add assets to shell list without adding concept-bank chunks.**
- [ ] **Step 3: Extend verifier to require the current active presentation path while still deriving default profile from manifest.**
- [ ] **Step 4: Run `npm run verify:sw` and service-worker tests; expected GREEN.**
- [ ] **Step 5: Commit `feat: cache presentation shell assets`.**

### Task 24: Verify Presentation in Live Release

**Files:**
- Modify: `scripts/verify_live_release.js`
- Test: `tests/release-contract.test.js`

**Interfaces:**
- Live verifier fetches `tracks/sdaia-ai-engineer/presentation.json` for current active track and validates identity/locale/domain coverage against live manifest/profile.

- [ ] **Step 1: Add RED release-contract assertions for presentation fetch and identity checks.**
- [ ] **Step 2: Extend live verifier to fetch presentation and validate track/version.**
- [ ] **Step 3: Validate locale set equality and each profile domain label in every locale.**
- [ ] **Step 4: Add concise `live track presentation: PASS ...` output.**
- [ ] **Step 5: Run release-contract tests.**
- [ ] **Step 6: Commit `feat: verify live track presentation`.**

### Task 25: Verify Pages Artifact Contains Presentation Boundary

**Files:**
- Modify only if needed: `.github/workflows/ci.yml`, `.github/workflows/pages.yml`
- Test: `tests/release-contract.test.js`

**Interfaces:**
- Existing `cp -R src tracks _site/` should already include presentation; task proves rather than assumes it.

- [ ] **Step 1: Add test asserting Pages/PR artifact assembly includes `tracks` and does not special-case/copy a second competing presentation location.**
- [ ] **Step 2: Add an artifact-time `test -f _site/tracks/sdaia-ai-engineer/presentation.json` only if current generic copy lacks an explicit verification point.**
- [ ] **Step 3: Keep legacy-data exclusion unchanged.**
- [ ] **Step 4: Run release-contract tests.**
- [ ] **Step 5: Commit only if workflow changed: `ci: verify presentation in Pages artifact`.**

### Task 26: Add Core Presentation Leakage Regression

**Files:**
- Modify: `tests/b1-presentation-acceptance.test.js`

**Interfaces:**
- Scans runtime/presentation source only, not docs/history.

- [ ] **Step 1: Scan `src/**/*.js`, `index.html`, and `feedback.html` for `SDAIA AI Engineer`, current Arabic domain labels, and current SDAIA hero copy.**
- [ ] **Step 2: Exclude `src/config.js` only for the lowercase track ID bootstrap literal; do not exempt brand/copy literals.**
- [ ] **Step 3: Assert `presentation.json` remains the canonical owner of the migrated literals.**
- [ ] **Step 4: Assert presentation has no official/evidence override fields.**
- [ ] **Step 5: Run B1 acceptance test; expected GREEN.**
- [ ] **Step 6: Commit `test: prevent track presentation leakage into core`.**

### Task 27: Extend Browser Smoke for Arabic and English Presentation

**Files:**
- Modify: `scripts/browser_smoke.py`

**Interfaces:**
- Uses canonical presentation JSON as expected browser presentation values, not duplicated string literals.

- [ ] **Step 1: Load `presentation.json` alongside manifest/profile at smoke startup.**
- [ ] **Step 2: Before language switch, assert Arabic brand, hero and at least one domain label equal presentation data and `dir=rtl`.**
- [ ] **Step 3: After language switch, assert English brand, hero and same domain label equal presentation data and `dir=ltr`.**
- [ ] **Step 4: Preserve existing exam-state language-switch checks.**
- [ ] **Step 5: Run browser smoke; expected PASS.**
- [ ] **Step 6: Commit `test: verify bilingual track presentation in browser`.**

### Task 28: Extend Browser Smoke for Feedback and Offline Presentation

**Files:**
- Modify: `scripts/browser_smoke.py`

**Interfaces:**
- Proves presentation remains available after service-worker controlled offline reload and feedback page uses the same active track identity.

- [ ] **Step 1: After controlled online reload, assert presentation still matches expected locale data.**
- [ ] **Step 2: After server termination/offline reload, assert brand/domain presentation remains available.**
- [ ] **Step 3: Navigate to feedback page and assert presentation-derived brand/title plus current generic form labels.**
- [ ] **Step 4: Preserve all existing encoded issue-URL assertions.**
- [ ] **Step 5: Update final smoke output to include `presentation=PASS` without removing existing fields.**
- [ ] **Step 6: Commit `test: verify offline and feedback presentation`.**

### Task 29: Whole-Branch Verification and Final Review

**Files:**
- Create: `docs/superpowers/reviews/2026-09-27-b1-final-review.md`
- Modify: `HANDOFF.md`

**Interfaces:**
- Consumes all B1 tasks.
- Produces B1 acceptance evidence and exact B2 continuation boundary.

- [ ] **Step 1: Compare B1 branch to base and enumerate every changed file.**
- [ ] **Step 2: Confirm no domain IDs, question IDs, profile IDs, StateV2 shape, RuntimeBundleV2 or TrackManifestV1 semantics changed.**
- [ ] **Step 3: Run `npm run validate`.**
- [ ] **Step 4: Run `npm test`.**
- [ ] **Step 5: Run `npm run verify:sw`.**
- [ ] **Step 6: Run app parse + browser smoke + server/API/SQLite gates through repository CI.**
- [ ] **Step 7: Scan current runtime files for SDAIA presentation leakage and unsupported adaptive claims.**
- [ ] **Step 8: Perform whole-branch review; fix Critical/Important findings with RED→GREEN.**
- [ ] **Step 9: Record independent-review limitation if this harness still has no reviewer/subagent dispatch.**
- [ ] **Step 10: Update handoff: B1 accepted on branch; next exact boundary B2 Track Registry design; do not begin B2 automatically.**
- [ ] **Step 11: Commit `docs: record B1 final verification`.**

### Task 30: PR, Integration Decision, Merge and Post-Merge Verification

**Files:**
- PR metadata; no new product changes expected.

**Interfaces:**
- Produces integrated B1 only after owner choice.

- [ ] **Step 1: Open a Draft PR `B1: track presentation contract` to `main`.**
- [ ] **Step 2: Verify PR head CI: validator, Node, SW, Pages artifact/live verifier, browser smoke, server/API/SQLite all green.**
- [ ] **Step 3: Present the finishing-a-development-branch integration options; do not merge without owner choice.**
- [ ] **Step 4: If owner chooses merge, mark PR ready and merge using the verified expected head SHA.**
- [ ] **Step 5: Verify new `main` SHA equals PR merge commit.**
- [ ] **Step 6: Verify post-merge Pages validation/deploy/live release and server/API workflows on the merge SHA.**
- [ ] **Step 7: Re-read `presentation.json`, TrackPresentation schema, B1 final review and handoff directly from `main`.**
- [ ] **Step 8: Declare B1 complete only from this fresh post-merge evidence.**
- [ ] **Step 9: Stop at **B2 — Track Registry design**; do not begin implementation automatically.**

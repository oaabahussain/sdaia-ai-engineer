# Implementation Plan: Public-Readiness Foundation

Date: 2026-09-07
Status: Planning complete; implementation prohibited in this phase
Timebox for pre-implementation: 3 working days

## Technical context

Current product:
- Static GitHub Pages frontend
- Arabic-first UI
- ES-module application in src/app.js
- Pure study logic modules under src/logic/
- Browser/API storage adapters under src/storage/
- JSON study bank under data/
- Service worker and manifest
- Existing GitHub Actions release/preflight workflows
- Test-only FastAPI/OpenAPI/database foundation; no production server deployment

Known baseline facts from repository/code inspection:
- main at planning start: 059b90fca83d20b950b5c83e751a55180387fd53
- service-worker cache baseline: sdaia-ai-pages-v6
- current service worker already precaches application modules and public JSON bank
- existing runtime migration model uses map-based state
- current app imports mastery/readiness/review/mission logic modules
- owner reports a prior live TDZ failure and supplies a corrected app ordering; current uploaded/reference code places helper declarations before migrateState invocation
- browser execution is not yet an adequate blocking release gate

## Constitution check

PASS — no implementation is included in this plan.
PASS — identity remains anonymous-only today.
PASS — no server deployment is introduced.
PASS — content rewrite is separated from runtime stabilization.
PASS — browser execution becomes a release gate.
PASS — content thresholds are marked provisional.
PASS — WebKit is not treated as physical Safari evidence.

## Architecture direction

The product remains a static application until a separate feature approves a backend.

Layer boundaries:
- UI: index.html + src/app.js
- Pure study logic: src/logic/*
- Storage facade: src/storage/interface.js
- Current storage: src/storage/browser.js
- Future server storage: src/storage/api.js
- Future identity boundary: separate IdentityProvider contract, not embedded in storage or UI logic
- Public content: data/*.json
- Content validation: scripts/validate.js and future content-report scripts
- Browser evidence: tests/e2e/*
- Release gates: GitHub Actions

## Level 0 — Live recovery and runtime safety

Goal:
Prove the public application boots and persists state in a real browser before any broader change.

Planned changes:
- Compare repository src/app.js with owner-provided corrected ordering and apply only the minimal TDZ fix if baseline still contains the bug at implementation time.
- Add local built-site browser smoke using Playwright Chromium.
- Assert zero pageerror and unexpected console.error.
- Enter onboarding and prove sdaia.state.v1 is written.
- Add this smoke before deployment.

Entry gate:
- Pre-implementation package reviewed.

Exit gate:
- Local built artifact passes browser boot/persistence smoke.
- No unrelated copy/content changes mixed into the commit.

## Level 1 — Strong scalable foundation

Goal:
Keep the static app simple today while ensuring future identity/community/server additions do not require a rewrite.

Planned changes:
- Confirm canonical state schema and idempotent migration behavior.
- Add migration E2E fixture for pre-v6 array/settings state.
- Define/introduce code-level IdentityProvider boundary only if a future-auth implementation task is approved; otherwise keep it as contract documentation.
- Ensure auth/session secrets are excluded from local study storage.
- Preserve browser/API storage adapter contract.
- Preserve pure logic ownership.

Entry gate:
- Level 0 green.

Exit gate:
- State export validates.
- Migration browser test passes.
- Logic layer remains independently tested.
- No login/backend activated.

## Level 2 — Public UI cleanup

Goal:
Remove internal/developer residue and reduce cognitive clutter.

Planned changes:
- Remove version labels from browser title/header/changelog copy.
- Keep public product title Arabic-first.
- Replace owner-specific “image you have” wording with public official-badge wording.
- Remove changelog panel/button and developer-history copy.
- Translate report link to Arabic.
- Rename export to sdaia-study-progress.json.
- Ensure question screen hides landing hero/stats and shows only the learning flow.
- Apply public-copy deny list to UI chrome and About only; do not ban legitimate AI/vendor terms from educational content.

Entry gate:
- Levels 0–1 green.

Exit gate:
- Static copy audit green.
- Rendered-DOM copy audit green on all core screens.

## Level 3 — Real browser E2E architecture

Goal:
Make actual execution—not syntax—the main public release proof.

Planned changes:
- Add Playwright setup.
- Add Chromium mobile, Chromium desktop, WebKit mobile profiles.
- Implement E2E-01 through E2E-20 from release-evidence contract.
- Prefer semantic locators; add data-testid where generated/ambiguous.
- Ensure each test fails on pageerror/unexpected console.error.
- Import shared logic in tests when equivalence is required.

Entry gate:
- Stable public UI semantics from Level 2.

Exit gate:
- Complete required E2E set green on required profiles subject to documented engine-specific applicability.
- At least 16+ deterministic unit/logic tests remain green.

## Level 4 — PWA/offline reliability

Goal:
Prove caching and offline behavior rather than infer it from service-worker syntax.

Planned changes:
- Verify cache version and asset list.
- Verify every ASSETS path exists in built artifact.
- Exercise first load -> registration -> cache creation -> offline reload.
- Exercise service-worker update/cache invalidation where deterministic.
- Remove swallowed registration errors from test-visible paths; production UX may still avoid noisy user-facing errors.
- Use feature detection rather than UA-based behavior for correctness decisions.

Entry gate:
- Level 3 browser framework green.

Exit gate:
- Offline E2E green in Chromium and WebKit where supported by Playwright.
- Physical iPhone Safari status reported separately.

## Level 5 — Content-quality gate

Goal:
Make content quality measurable before generating/revising content.

Planned changes:
- Extend question schema/validator for 4 options, difficulty, style, wrong-option explanation coverage, uniqueness, answer validity, topic mapping, and provisional threshold reporting.
- Add metrics report: answer-index histogram, longest-correct ratio, definition count, option-length violations, per-domain/per-topic counts, needs_review count.
- Add explicit provisional-gate metadata/review date.
- Determine whether topic minimum “>=4 questions” is feasible from current blueprint; do not silently change topic mapping.

Entry gate:
- Runtime/product layers stable.

Exit gate:
- Validator fails deterministically on each gate violation.
- Metrics are printed before any rewrite.

## Level 6 — Content rewrite

Goal:
Rewrite the bank only after the quality system exists.

Planned changes:
- Rewrite existing items into scenario-focused training items while preserving id/topic/domain unless the content plan explicitly versions them.
- Add fourth plausible option.
- Seed answer-position shuffle and record seed/log.
- Add difficulty and explanation coverage.
- Add 3 flagship difficulty-3 scenarios per domain (21 new questions) only after content blueprint confirms their placement.
- Rebalance sessions after new items.
- Mark uncertain claims needs_review.
- Do not claim official SDAIA equivalence.

Entry gate:
- Level 5 gate and metrics working.

Exit gate:
- All static content gates pass.
- Technical needs_review list is explicit.
- Independent content review status is recorded.

## Level 7 — Future product extension boundaries

Goal:
Prepare for later login, ratings, comments, central progress, and moderation without activating them.

Planned changes:
- Keep identity-provider contract current.
- Keep feedback/ratings/comments contract current.
- If owner approves a future backend feature, evaluate managed identity providers against WebAuthn/passkeys, Saudi availability, pricing, recovery, data residency/privacy, and integration constraints.
- Define account-link/merge policy before central sync.
- Define moderation/abuse/privacy before comments.

Entry gate:
- Public study product stable.

Exit gate:
- Contracts and owner decisions ready for a separate feature specification.

## Level 8 — Public-readiness evidence and release decision

Goal:
Produce evidence that a stranger can use the product safely/reliably for its stated purpose.

Required report sections:
- metadata/commit/run/live hashes
- browser evidence
- content evidence
- public-copy audit
- accessibility
- performance
- offline
- what a new user sees
- verified/partial/missing
- unknowns
- one-sentence GO/NO-GO

Performance approach:
- Measure baseline first.
- Lighthouse mobile report is required.
- Do not make “all categories >=90” a hard gate until baseline and category applicability are recorded.

Physical-device approach:
- If real iPhone Safari evidence is not supplied, report MISSING rather than infer from WebKit.

## Release pipeline target

Target order:
1. schema/content validation
2. unit/logic tests
3. adapter/contract tests
4. build _site
5. service-worker asset existence check
6. local HTTP server
7. browser E2E against _site
8. accessibility/copy checks
9. deploy
10. live smoke/E2E subset
11. source/live hash comparison
12. live app/data/service-worker checks
13. readiness evidence update

Rollback target:
- Phase 1: fail red and emit tested manual rollback to last known-good release.
- Phase 2 only after independent proof: optional deterministic automatic rollback.

## Observability and diagnostics

Because the public product is static:
- user-visible errors must remain concise and Arabic-first;
- browser tests may attach console/page errors to CI artifacts;
- production code should not expose debug/dev messages in UI;
- no PII/device fingerprinting is added for diagnostics.

## Research follow-up

Before Level 6 closes, content thresholds must be reviewed no later than 2026-10-07. If no real learner-response data exists by that date, preserve provisional thresholds and record “insufficient data”; do not fabricate a threshold optimization.

## Stop condition for this feature

The current pre-implementation feature stops after tasks and consistency analysis are committed. No Level 0–8 implementation step is executed on the pre-implementation branch.

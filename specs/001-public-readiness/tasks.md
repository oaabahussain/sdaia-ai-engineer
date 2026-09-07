# Tasks: Public-Readiness Foundation

Date: 2026-09-07
Status: Planned only. Do not execute on the pre-implementation branch.

Task fields:
- ID
- Level
- Description
- Files touched
- Acceptance criterion
- Evidence required

## Level 0 — Live recovery and runtime safety

T0001
Level: 0
Description: Compare baseline src/app.js with the owner-supplied corrected startup ordering. Apply only the minimal TDZ/startup correction if the implementation baseline still calls migrateState before helper initialization.
Files touched: src/app.js
Acceptance criterion: module executes on local HTTP without ReferenceError; no unrelated content/copy edits in the same commit.
Evidence required: git diff; Playwright Chromium command/output showing zero pageerror and zero unexpected console.error.

T0002
Level: 0
Description: Add Playwright as a development/test dependency and create a minimal built-site Chromium smoke project.
Files touched: package.json, package-lock.json, playwright.config.*, tests/e2e/boot.spec.*
Acceptance criterion: local _site is served over HTTP and the test loads the public entry page.
Evidence required: install command/output; Playwright test output.

T0003
Level: 0
Description: Add blocking boot/persistence smoke: open landing, activate enter, assert onboarding navigation and creation of localStorage key sdaia.state.v1 after a state-changing action.
Files touched: tests/e2e/boot.spec.*, selectors/markup only if necessary
Acceptance criterion: test fails on pageerror/console.error and passes only when state is actually persisted.
Evidence required: Playwright output plus localStorage assertion output/artifact.

T0004
Level: 0
Description: Insert the Level-0 browser smoke into pre-deploy CI after _site build and before Pages deployment.
Files touched: .github/workflows/pages.yml or dedicated reusable browser workflow
Acceptance criterion: deployment cannot start if browser boot/persistence fails.
Evidence required: CI run with smoke step green; deliberately broken fixture/branch demonstrates red gate before merge.

## Level 1 — Strong scalable foundation

T0101
Level: 1
Description: Confirm canonical map-based State schema and migration invariants against current runtime.
Files touched: data/schema/state.schema.json, tests/fixtures/*, tests/*migration*
Acceptance criterion: canonical export validates; legacy arrays/settings fixture migrates to canonical shape; migration is idempotent.
Evidence required: node scripts/validate.js --state output; unit/browser migration test output.

T0102
Level: 1
Description: Add explicit state-version migration tests for missing UUID/timestamps, pre-v6 answers/review/bookmarks/settings, and already-current state.
Files touched: tests/fixtures/*, tests/*migration*
Acceptance criterion: all fixtures produce schema-valid state with no duplicate deprecated fields.
Evidence required: node --test output and E2E migration output.

T0103
Level: 1
Description: Verify src/app.js continues to consume storage only through interface.js and pure study logic only through src/logic/*.
Files touched: tests/architecture.* or scripts/architecture_check.*
Acceptance criterion: direct localStorage/fetch usage in app.js remains zero; mastery/readiness/review/mission inline implementations are absent.
Evidence required: deterministic architecture check command/output.

T0104
Level: 1
Description: Do not implement login; record/maintain provider-neutral identity contract and ensure no auth-secret field is added to study state.
Files touched: documentation/contracts only unless a separate auth feature is opened
Acceptance criterion: no login UI/API activated in this feature; state schema contains no password/token/session-secret fields.
Evidence required: schema inspection command/output and implementation diff review.

## Level 2 — Public UI cleanup

T0201
Level: 2
Description: Replace public title/header with Arabic product title and remove normal-UI version labels.
Files touched: index.html
Acceptance criterion: browser title/header contain no V2/V3/V4/V5/PWA V tokens; About may contain only approved version footer.
Evidence required: copy-audit output and rendered-DOM screenshot/test.

T0202
Level: 2
Description: Remove changelog/developer-history panels and owner-specific wording; replace private-source wording with public official-badge wording.
Files touched: index.html, src/app.js if generated copy exists
Acceptance criterion: public DOM contains no “النسخة الثالثة”, “طوّرناه”, owner-image wording, developer-agent references, TODO/FIXME/placeholder copy.
Evidence required: static copy audit and rendered-DOM E2E audit.

T0203
Level: 2
Description: Replace English report-link chrome with “أبلغ عن مشكلة في هذا السؤال” and make href semantics meaningful instead of '#'.
Files touched: index.html, src/app.js, src/storage/browser.js
Acceptance criterion: rendered report action is Arabic, keyboard-accessible, and produces a URL containing current question metadata.
Evidence required: E2E report-link assertion and accessibility-name assertion.

T0204
Level: 2
Description: Rename export artifact to sdaia-study-progress.json.
Files touched: src/app.js
Acceptance criterion: downloaded filename contains no legacy version marker.
Evidence required: E2E download assertion.

T0205
Level: 2
Description: Separate landing-only hero/stats from study flow so the question screen shows only domain/progress/question/options/confidence/explanation/note/bookmark/report and required controls.
Files touched: index.html, CSS, src/app.js as necessary
Acceptance criterion: hero and landing stats are hidden/not rendered in active question screen without breaking navigation.
Evidence required: mobile/desktop screenshots and E2E visibility assertions.

T0206
Level: 2
Description: Add copy audit script with deny list scoped to UI chrome/About/built markup and rendered DOM; explicitly exempt legitimate educational content.
Files touched: scripts/copy_audit.js, tests/e2e/copy.spec.*, package scripts
Acceptance criterion: banned development residues fail; educational questions may contain AI/vendor terminology when relevant.
Evidence required: passing audit plus a negative fixture/unit test proving development residue fails.

## Level 3 — Browser E2E architecture

T0301
Level: 3
Description: Configure Playwright projects for Chromium mobile 390x844, Chromium desktop 1280x800, and WebKit mobile 390x844.
Files touched: playwright.config.*, tests/e2e/helpers/*
Acceptance criterion: all configured projects launch in CI.
Evidence required: CI project matrix output.

T0302
Level: 3
Description: Add shared pageerror/console.error collector fixture applied to every E2E.
Files touched: tests/e2e/fixtures/*
Acceptance criterion: any unapproved pageerror or console.error fails the test.
Evidence required: automated fixture test demonstrating forced error -> failure; normal suite green.

T0303
Level: 3
Description: Add stable interaction selectors using role/name first and data-testid for generated/ambiguous controls.
Files touched: index.html, src/app.js, tests/e2e/*
Acceptance criterion: required dynamic controls have stable identifiers; every button/control has accessible name.
Evidence required: selector inventory check and accessibility E2E.

T0304
Level: 3
Description: Implement E2E-01 boot/layout.
Files touched: tests/e2e/boot-layout.spec.*
Acceptance criterion: landing shows current release counts, no horizontal overflow, no browser errors.
Evidence required: Chromium mobile/desktop + WebKit output; screenshots.

T0305
Level: 3
Description: Implement E2E-02 onboarding/state.
Files touched: tests/e2e/onboarding.spec.*
Acceptance criterion: date/minutes/mode persist; anon_id UUID v4; onboarded true.
Evidence required: browser output/state artifact.

T0306
Level: 3
Description: Implement E2E-03 full diagnostic.
Files touched: tests/e2e/diagnostic.spec.*
Acceptance criterion: 21 diagnostic questions, each of seven domains exactly three times; mixed oracle answers; final readiness equals imported shared readiness function.
Evidence required: Chromium/WebKit outputs and calculated-vs-rendered value.

T0307
Level: 3
Description: Implement E2E-04 two-attempt rule.
Files touched: tests/e2e/question-flow.spec.*
Acceptance criterion: first wrong allows retry without full solution; second wrong reveals solution; first correct reveals explanation.
Evidence required: browser output and screenshots at first/second attempt states.

T0308
Level: 3
Description: Implement E2E-05 session progress/mastery.
Files touched: tests/e2e/session.spec.*
Acceptance criterion: session 1 completes selected test subset, progress advances, relevant mastery increases, completion is recorded.
Evidence required: before/after state and rendered mastery output.

T0309
Level: 3
Description: Implement E2E-06 runtime composition for sessions 14 and 15.
Files touched: tests/e2e/adaptive-mock.spec.*, src/logic/mission.js only if implementation fails specification
Acceptance criterion: session 14 has >=5 weakness-focused questions; session 15 uses deterministic seeded weighted quotas with per-domain counts within ±1 of target.
Evidence required: browser output listing domains/counts and deterministic seed.

T0310
Level: 3
Description: Implement E2E-07 error bank priority.
Files touched: tests/e2e/error-bank.spec.*
Acceptance criterion: two high-confidence wrong and one low-confidence right are classified as designed; high-confidence misconceptions rank first.
Evidence required: state/error-bank assertions and screenshot.

T0311
Level: 3
Description: Implement E2E-08 spaced review using controlled clock.
Files touched: tests/e2e/review.spec.*
Acceptance criterion: new/wrong -> +1 day, subsequent correct progression -> +3/+7/+14 according to shared review logic; due item becomes visible when clock advances.
Evidence required: exact timestamp assertions and UI evidence.

T0312
Level: 3
Description: Implement E2E-09 bookmark/note persistence.
Files touched: tests/e2e/persistence.spec.*
Acceptance criterion: bookmark and note survive reload.
Evidence required: browser state before/after reload.

T0313
Level: 3
Description: Implement E2E-10 search, including drift-target expectations aligned to actual bank IDs/content at implementation time.
Files touched: tests/e2e/search.spec.*
Acceptance criterion: known term returns expected question/learn results; empty query is empty; no-results copy is Arabic.
Evidence required: browser output and screenshot.

T0314
Level: 3
Description: Implement E2E-11 cases.
Files touched: tests/e2e/cases.spec.*
Acceptance criterion: all current cases render title/domain/what/lesson/source.
Evidence required: count assertion and screenshot.

T0315
Level: 3
Description: Implement E2E-12 settings/theme/focus/timer.
Files touched: tests/e2e/settings.spec.*
Acceptance criterion: theme persists; focus mode hides intended navigation/chrome; timer behavior matches current product design.
Evidence required: browser assertions and screenshots.

T0316
Level: 3
Description: Implement E2E-13 export/reset/import equivalence.
Files touched: tests/e2e/export-import.spec.*
Acceptance criterion: exported JSON validates; reset clears progress; import restores state; readiness/mastery equal pre-export values.
Evidence required: downloaded fixture, validator output, before/after values.

T0317
Level: 3
Description: Implement E2E-14 legacy migration.
Files touched: tests/e2e/migration.spec.*, fixtures
Acceptance criterion: seeded pre-v6 arrays/settings state loads without errors and becomes schema-valid canonical state.
Evidence required: browser/state output and validator output.

T0318
Level: 3
Description: Implement E2E-15 report semantics.
Files touched: tests/e2e/report.spec.*
Acceptance criterion: report URL includes question identifier and question-report classification metadata supported by GitHub issue flow.
Evidence required: href/URL assertion.

T0319
Level: 3
Description: Implement E2E-17 WebKit repeat set for boot/onboarding/diagnostic.
Files touched: Playwright project/test annotations
Acceptance criterion: those flows pass in WebKit mobile project; failures are reported as WebKit failures, not physical Safari failures.
Evidence required: WebKit CI output.

T0320
Level: 3
Description: Implement E2E-18 accessibility smoke with axe-core and semantic assertions.
Files touched: package files, tests/e2e/accessibility.spec.*
Acceptance criterion: zero serious/critical automated violations on landing/question/review; lang=ar; dir=rtl; controls have accessible names.
Evidence required: axe summaries and browser output.

T0321
Level: 3
Description: Implement E2E-19 rendered-DOM copy audit.
Files touched: tests/e2e/copy.spec.*
Acceptance criterion: each reachable core screen respects UI-chrome deny list while legitimate educational AI/vendor terms are not falsely blocked.
Evidence required: browser output across required screens.

T0322
Level: 3
Description: Implement E2E-20 answer-position runtime audit using deterministic seeded sample and compare with full-bank static distribution.
Files touched: tests/e2e/content-runtime.spec.*, scripts/validate.js/report helper
Acceptance criterion: deterministic runtime sample renders correct answer mapping accurately; full-bank answer-index gate is authoritative for <=35% threshold.
Evidence required: seed, histogram, browser sample result, static full-bank gate output.

## Level 4 — PWA/offline reliability

T0401
Level: 4
Description: Add service-worker asset-list existence check against _site.
Files touched: scripts/verify_sw_assets.js or equivalent, CI
Acceptance criterion: every ASSETS path exists; missing asset fails before deploy.
Evidence required: command output and negative fixture/branch proof.

T0402
Level: 4
Description: Implement E2E-16 first load -> service-worker registration -> expected cache -> offline reload -> same local state.
Files touched: tests/e2e/offline.spec.*
Acceptance criterion: one active registration, expected cache version, offline reload boots, state remains accessible.
Evidence required: Chromium and applicable WebKit output; cache/registration assertions.

T0403
Level: 4
Description: Test service-worker update/cache invalidation and registration recovery with a temporary test build where deterministic.
Files touched: tests/e2e/offline-upgrade.spec.*, test harness
Acceptance criterion: old cache is removed/replaced according to defined lifecycle without bricking reload.
Evidence required: cache-name before/after output.

T0404
Level: 4
Description: Make service-worker registration failure observable to tests without exposing developer debug text to normal users.
Files touched: src/app.js and/or test instrumentation boundary
Acceptance criterion: intentional registration failure is detectable by test and does not silently pass release gate.
Evidence required: forced-failure E2E output.

## Level 5 — Content-quality gate

T0501
Level: 5
Description: Extend question schema for 4 options, difficulty, style, explanation coverage representation, optional needs_review.
Files touched: data/schema/question.schema.json
Acceptance criterion: schema accepts intended next format and rejects missing required quality fields.
Evidence required: schema validation unit fixtures.

T0502
Level: 5
Description: Extend scripts/validate.js with provisional static gates: unique 4 options; answer validity; <=35% answer-index distribution; <=40% correct-longest; option length >=12; definition style <=15; difficulty 1–3; explanation coverage of all wrong options.
Files touched: scripts/validate.js, tests/validator.*
Acceptance criterion: each rule has positive and negative fixtures; output labels thresholds PROVISIONAL and review date 2026-10-07.
Evidence required: test output and validator summary.

T0503
Level: 5
Description: Add topic/domain blueprint metrics and enforce question.topic exists in learn data.
Files touched: scripts/validate.js/report helper, tests
Acceptance criterion: invalid topic fails; report lists per-domain/per-topic counts.
Evidence required: command output.

T0504
Level: 5
Description: Evaluate the proposed >=4 questions per learn topic gate against current topic inventory before enabling it.
Files touched: research/readiness metrics or validator configuration
Acceptance criterion: measured topic counts shown; if feasible, gate activated; if infeasible, conflict is reported for owner decision rather than silently weakening/rewriting topics.
Evidence required: exact topic-count output and decision record.

T0505
Level: 5
Description: Produce pre-rewrite content baseline metrics.
Files touched: docs/readiness/content-baseline.* or generated CI artifact
Acceptance criterion: answer-index histogram, longest-correct ratio, definition count, short-option count, explanation gaps, domain/topic counts, needs_review count recorded.
Evidence required: command/output and committed/generated report artifact.

## Level 6 — Content rewrite

T0601
Level: 6
Description: Define deterministic content-rewrite seed/log and question-review workflow before editing bank.
Files touched: content_rewrite.log, content-review instructions
Acceptance criterion: seed and transformation/review policy documented before first bank edit.
Evidence required: committed log header and review policy.

T0602
Level: 6
Description: Rewrite existing 121 items to pass content gates while preserving IDs/domain/topic and technical meaning; no uncertain claim guessed.
Files touched: data/questions.json
Acceptance criterion: all existing items pass gates or carry needs_review where uncertainty remains; no silent domain/topic drift.
Evidence required: before/after metrics and needs_review list.

T0603
Level: 6
Description: Add 3 flagship difficulty-3 scenarios per official domain (21 items) after blueprint review.
Files touched: data/questions.json, session mapping as required
Acceptance criterion: total bank becomes 142 only if all 21 pass validation and domain allocation is exactly 3 additional items per domain.
Evidence required: domain counts and validator output.

T0604
Level: 6
Description: Rebalance sessions for 142-item bank while preserving adaptive/mixed runtime semantics.
Files touched: data/sessions.json, related deterministic mission/mock logic/tests if required
Acceptance criterion: fixed sessions reference valid IDs; 14/15 runtime composition remains verified; no question becomes unreachable unintentionally.
Evidence required: session coverage report and E2E-06 output.

T0605
Level: 6
Description: Run independent technical/content review of needs_review items and unresolved claims.
Files touched: data/questions.json only after review, review report
Acceptance criterion: every cleared item has evidence/reviewer rationale; unresolved items remain explicitly listed.
Evidence required: review report; no unsupported “all questions verified” claim.

## Level 7 — Future product boundaries

T0701
Level: 7
Description: Evaluate future managed identity providers against WebAuthn/passkeys, recovery, Saudi availability, privacy/data location, pricing, account linking, and API ergonomics.
Files touched: future feature research only
Acceptance criterion: provider decision made in a separate auth feature; no provider hardcoded by this public-readiness feature.
Evidence required: provider matrix and owner approval.

T0702
Level: 7
Description: Specify anonymous-to-account state merge/conflict policy before synchronized progress implementation.
Files touched: future auth/sync spec
Acceptance criterion: deterministic merge policy and conflict UX specified.
Evidence required: separate specification/analyze report.

T0703
Level: 7
Description: Specify ratings/comments moderation, abuse controls, privacy, retention, and identity requirements before implementation.
Files touched: future community feature spec
Acceptance criterion: no public comments/ratings activated without these policies.
Evidence required: separate feature specification and security review.

## Level 8 — Readiness/release evidence

T0801
Level: 8
Description: Add pre-deploy pipeline order: validate -> unit -> adapter -> build -> SW asset check -> E2E -> copy/accessibility -> deploy.
Files touched: .github/workflows/pages.yml and test configuration
Acceptance criterion: deployment job cannot begin when any predeploy gate fails.
Evidence required: successful run plus controlled failing-branch evidence.

T0802
Level: 8
Description: Add post-deploy live smoke and integrity checks without claiming unproven automatic rollback.
Files touched: .github/workflows/pages.yml, scripts/live verification
Acceptance criterion: live failure marks run red; last known-good commit/artifact and exact rollback procedure are printed.
Evidence required: successful live run; separately tested rollback command/procedure.

T0803
Level: 8
Description: Measure Lighthouse/mobile performance baseline and record transfer size/core metrics before deciding hard performance thresholds.
Files touched: readiness reporting/CI artifacts
Acceptance criterion: Performance, Accessibility, Best Practices, PWA/applicable audit output plus transfer size and key web metrics recorded.
Evidence required: Lighthouse report/JSON and summary.

T0804
Level: 8
Description: Produce final public readiness report.
Files touched: docs/READINESS_REPORT_<date>.md, docs/screens/*
Acceptance criterion: required sections completed; every task marked VERIFIED/PARTIAL/MISSING with evidence; physical iPhone Safari explicitly MISSING unless actual device evidence exists; SDAIA official question count/duration/pass mark remain unknown unless new official source is supplied.
Evidence required: committed report and screenshots/CI links/hashes.

T0805
Level: 8
Description: Issue one-sentence GO/NO-GO decision for strangers.
Files touched: readiness report
Acceptance criterion: exactly one primary reason accompanies decision; no unresolved critical constitution violation can coexist with GO.
Evidence required: analyze/release evidence cross-check.

## Implementation ordering dependencies

Level 0 blocks all later code work.
Level 1 blocks identity/state-dependent browser flows.
Level 2 should stabilize public semantics before completing broad selector-dependent E2E.
Level 3 is required before Level 4 and before public release.
Level 5 must be working before Level 6 content rewrite.
Level 7 remains planning-only until separately approved features.
Level 8 integrates evidence from prior levels and decides release.

No task above is executed during the current pre-implementation phase.

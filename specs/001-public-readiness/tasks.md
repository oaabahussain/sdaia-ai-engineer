# Tasks: Public-Readiness Foundation

Status: Planned only. Do not execute on the pre-implementation branch until the completion gate is confirmed.

Each task lists the expected files, acceptance criterion, and mandatory evidence. File lists are planning targets; implementation may add narrowly required adjacent files, but scope changes must be recorded before coding.

## Level 0 — Live recovery and runtime safety

T0001 — Verify and apply the minimal startup TDZ fix if still required
Files touched: src/app.js; tests/e2e/boot.spec.js if created in the same implementation slice.
Acceptance criterion: helper declarations required by migrateState exist before the first migrateState invocation; no unrelated UI/content changes.
Evidence required: git diff; browser page load on local HTTP; zero pageerror; zero unexpected console.error.

T0002 — Add Playwright smoke infrastructure
Files touched: package.json; package-lock.json; playwright.config.js; tests/e2e/helpers/*; scripts/build_site.js or equivalent static build helper if needed.
Acceptance criterion: Chromium mobile 390x844, Chromium desktop 1280x800, and WebKit mobile 390x844 can execute the built static site from local HTTP.
Evidence required: npm install/lockfile diff; npx playwright test --list; one passing smoke per configured browser profile.

T0003 — Prove boot, onboarding entry, and local state persistence
Files touched: tests/e2e/boot.spec.js; index.html/src/app.js only if stable accessible selectors are required.
Acceptance criterion: page loads; landing data is visible; entry action navigates; localStorage sdaia.state.v1 exists; state contains UUID-v4 anon_id; reload does not lose state.
Evidence required: Playwright command/output for all Level-0 profiles; committed screenshots under docs/screens/level-0/; captured state assertion.

T0004 — Make real-browser smoke a blocking pre-deploy gate
Files touched: .github/workflows/pages.yml; scripts/build_site.js or existing build helper; Playwright configuration.
Acceptance criterion: Pages workflow runs build -> Level-0 browser smoke before deploy; failure prevents deployment; no error swallowing or continue-on-error.
Evidence required: workflow diff; CI run ID; job-step output showing browser smoke passed before deploy.

Level 0 report requirement: stop for owner review after completing Level 0. Report FACTS VERIFIED / PARTIAL / MISSING, exact commands/outputs, CI run IDs, and committed screenshots.

## Level 1 — Strong scalable foundation

T0101 — Reconfirm canonical state/schema/migration invariants
Files touched: data/schema/state.schema.json; src/app.js or src/state/migrate.js if migration is extracted; src/storage/browser.js.
Acceptance criterion: one persisted map-based state shape; version=1 until an explicit state-version migration changes it; deprecated arrays/settings accepted only as migration inputs and not persisted outputs; additionalProperties:false remains enforced.
Evidence required: exported fixture; node scripts/validate.js --state <fixture>; migration unit tests.

T0102 — Add migration fixtures for known historical state shapes
Files touched: tests/fixtures/state-pre-v6*.json; tests/state.migration.test.js and/or browser migration E2E.
Acceptance criterion: known answers[]/review[]/bookmarks[]/settings{} shapes migrate idempotently; semantics preserved; second migration does not change output.
Evidence required: >=3 migration fixtures; node test output; schema validation output.

T0103 — Enforce architecture boundaries
Files touched: tests/architecture.test.js; src/storage/interface.js; src/config.js only if contract adjustment is necessary.
Acceptance criterion: src/app.js contains no direct localStorage/fetch calls; study logic remains in src/logic; storage remains adapter-selected; no provider-specific auth SDK is imported.
Evidence required: node test output plus grep/static checks.

T0104 — Preserve authentication as a contract only
Files touched: specs/001-public-readiness/contracts/identity-provider.md; optional src/identity/interface.js only if implementation phase explicitly creates a no-op boundary.
Acceptance criterion: no login UI, credential collection, provider SDK, or auth secret storage is activated; anonymous UUID remains current identity.
Evidence required: source grep; browser copy audit; architecture test.

## Level 2 — Public UI cleanup

T0201 — Remove public version labels except About footer
Files touched: index.html; package.json if product version metadata is centralized.
Acceptance criterion: browser title/header contain no V2/V3/V4/V5/PWA version labels; only approved About footer string “الإصدار 6.0” remains visible.
Evidence required: static copy audit; rendered-DOM audit; screenshots.

T0202 — Remove developer/owner residue
Files touched: index.html; src/app.js; public copy resources if extracted.
Acceptance criterion: no changelog panel, owner-specific “image you have” wording, developer-agent names, task IDs, internal roadmap/debug text, TODO/FIXME/placeholder prose in rendered UI.
Evidence required: scripts/copy_audit.js output; rendered-DOM E2E output; screenshots.

T0203 — Make question reporting Arabic and semantically correct
Files touched: index.html; src/app.js; src/storage/browser.js.
Acceptance criterion: report label is “أبلغ عن مشكلة في هذا السؤال”; action has a meaningful href/ref and identifies the question using the supported GitHub mechanism; no dead # placeholder is relied on.
Evidence required: E2E href/action assertion; screenshot; browser adapter test.

T0204 — Remove legacy version from export filename
Files touched: src/app.js.
Acceptance criterion: exported filename is sdaia-study-progress.json.
Evidence required: Playwright download assertion and exported state schema validation.

T0205 — Reduce study-screen clutter
Files touched: index.html; src/app.js; CSS within index.html or extracted stylesheet if separately planned.
Acceptance criterion: while answering a question the learner sees only domain/progress/question/options/confidence/explanation/note/bookmark/report/navigation needed for that flow; landing hero/stat blocks are not displayed above the question.
Evidence required: mobile and desktop screenshots; DOM visibility assertions.

T0206 — Add static and rendered public-copy audits
Files touched: scripts/copy_audit.js; tests/e2e/copy.spec.js; package scripts.
Acceptance criterion: deny-list applies only to UI chrome/About/developer residue and explicitly does not reject legitimate educational AI/vendor terminology; approved About version is the only version whitelist.
Evidence required: static audit command/output; rendered-DOM audit across screens.

## Level 3 — Real browser E2E architecture

T0301 — Configure browser projects and viewport matrix
Files touched: playwright.config.js.
Acceptance criterion: Chromium mobile 390x844, Chromium desktop 1280x800, WebKit mobile 390x844 configured; deterministic retries/timeouts documented.
Evidence required: playwright --list output.

T0302 — Add shared runtime-error fixture
Files touched: tests/e2e/helpers/runtime-errors.js or equivalent.
Acceptance criterion: every E2E fails on pageerror or unexpected console.error; allowed messages require explicit documented allow-list.
Evidence required: fixture test that intentionally emits an error and fails; normal suite output.

T0303 — Add stable selector coverage
Files touched: index.html; src/app.js; tests/e2e/helpers/selectors.js.
Acceptance criterion: semantic role/name used first; generated/ambiguous controls have stable data-testid including option-0..3, confidence states, dynamic sessions/results where semantics alone are unstable.
Evidence required: selector audit and E2E pass.

T0304 — E2E-01 boot/layout
Files touched: tests/e2e/boot-layout.spec.js.
Acceptance criterion: landing shows current domain/question/session counts; no horizontal overflow; no runtime errors.
Evidence required: three-profile test output and screenshots.

T0305 — E2E-02 onboarding
Files touched: tests/e2e/onboarding.spec.js.
Acceptance criterion: exam date/minutes/mode can be set; finish persists onboarded=true and UUID-v4 anon_id.
Evidence required: browser assertions and state dump.

T0306 — E2E-03 complete diagnostic
Files touched: tests/e2e/diagnostic.spec.js; test helper importing src/logic/readiness.js.
Acceptance criterion: 21 questions, exactly 3 from each official domain; deterministic mixed correct/incorrect responses; readiness/mastery equal shared logic.
Evidence required: domain-count output; computed-vs-rendered assertion; screenshots.

T0307 — E2E-04 two-attempt rule
Files touched: tests/e2e/two-attempt.spec.js.
Acceptance criterion: first wrong answer permits retry without solution; second wrong reveals solution; first correct reveals explanation.
Evidence required: browser assertions/screenshots.

T0308 — E2E-05 session progress
Files touched: tests/e2e/session.spec.js.
Acceptance criterion: session 1 completes configured questions; progress advances; Data/ML mastery increases for chosen fixture; session marked done.
Evidence required: before/after state and UI assertions.

T0309 — E2E-06 runtime sessions 14 and 15
Files touched: tests/e2e/adaptive-sessions.spec.js; src/logic/mission.js only if a verified behavior defect is found.
Acceptance criterion: session 14 supplies >=5 valid questions prioritizing weakest/error domains; session 15 supplies deterministic seeded weighted mix; no stored qs requirement added to sessions.json.
Evidence required: selected IDs/domain-count output and screenshots.

T0310 — E2E-07 error bank
Files touched: tests/e2e/error-bank.spec.js.
Acceptance criterion: high-confidence wrong answers and low-confidence lucky/right case are classified with intended labels; high-confidence misconceptions rank first.
Evidence required: state fixture and ordered rendered assertions.

T0311 — E2E-08 spaced review
Files touched: tests/e2e/review.spec.js; src/logic/review.js only if defect found.
Acceptance criterion: controlled clock proves first scheduling +1 day, subsequent correct intervals +3/+7/+14 according to current model, wrong resets to +1.
Evidence required: fake-clock test output and review_map snapshots.

T0312 — E2E-09 bookmark/note persistence
Files touched: tests/e2e/persistence.spec.js.
Acceptance criterion: bookmark and note survive reload.
Evidence required: browser assertions/state snapshot.

T0313 — E2E-10 search
Files touched: tests/e2e/search.spec.js; search implementation only if defect found.
Acceptance criterion: known drift query returns relevant q72/q73 and learn content if product specification retains that expectation; empty query shows nothing; no-results copy is Arabic.
Evidence required: rendered result assertions.

T0314 — E2E-11 cases
Files touched: tests/e2e/cases.spec.js.
Acceptance criterion: all four current cases render required title/what/lesson/source fields.
Evidence required: count/content assertions.

T0315 — E2E-12 settings
Files touched: tests/e2e/settings.spec.js.
Acceptance criterion: theme persists; focus hides intended navigation/chrome; timer behavior is tested only if timer remains in approved UI specification.
Evidence required: browser state/UI assertions and screenshots.

T0316 — E2E-13 export/import
Files touched: tests/e2e/import-export.spec.js.
Acceptance criterion: downloaded JSON validates against state schema; reset then import restores equivalent readiness/mastery/bookmarks/notes.
Evidence required: downloaded fixture, validator output, equivalence assertions.

T0317 — E2E-14 migration
Files touched: tests/e2e/migration.spec.js; legacy fixtures.
Acceptance criterion: seed pre-v6 arrays/settings shape; reload has no runtime errors; resulting stored state is canonical/schema-valid.
Evidence required: before/after JSON and validator output.

T0318 — E2E-15 report link
Files touched: tests/e2e/report.spec.js.
Acceptance criterion: report action contains question identifier and supported issue metadata; no unsupported GitHub custom-field prefill is asserted.
Evidence required: actual generated URL and assertion output.

T0319 — E2E-17 WebKit core repeat
Files touched: Playwright project filters/tags and relevant tests.
Acceptance criterion: boot/onboarding/diagnostic core flows pass on WebKit mobile; report explicitly says this is not physical Safari evidence.
Evidence required: WebKit CI output/screenshots.

T0320 — E2E-18 accessibility smoke
Files touched: tests/e2e/accessibility.spec.js; @axe-core/playwright dependency.
Acceptance criterion: landing/question/review have zero serious/critical automated violations; html lang=ar dir=rtl; interactive buttons have accessible names.
Evidence required: axe summaries and screenshots; manual review remains separate.

T0321 — E2E-19 rendered copy audit
Files touched: tests/e2e/copy.spec.js.
Acceptance criterion: rendered UI chrome across every reachable core screen contains no deny-list residue while educational content is excluded from false-positive vendor-term checks.
Evidence required: screen-by-screen audit output.

T0322 — E2E-20 answer-position runtime audit
Files touched: tests/e2e/content-runtime.spec.js; deterministic seed helper.
Acceptance criterion: runtime sample is seeded/reproducible and does not contradict the full-bank static histogram; full-bank validator remains authoritative for <=35% distribution.
Evidence required: seed, sample histogram, full-bank histogram.

Level 3 report requirement: stop for owner review after completing Level 3. Report FACTS VERIFIED / PARTIAL / MISSING, commands/outputs, CI IDs, and committed screenshots.

## Level 4 — PWA and offline reliability

T0401 — Validate service-worker precache asset existence
Files touched: sw.js; scripts/verify_sw_assets.js; build pipeline.
Acceptance criterion: every precached path exists in built artifact; cache name is intentionally versioned.
Evidence required: verifier output and built asset listing.

T0402 — Browser-prove registration/cache/offline reload
Files touched: tests/e2e/offline.spec.js; sw.js only if behavior defect found.
Acceptance criterion: one active registration after load; expected cache exists; browser goes offline and reloads same learner state without network.
Evidence required: Chromium + WebKit output; cache listing; offline screenshot.

T0403 — Verify update/cache invalidation behavior
Files touched: tests/e2e/sw-update.spec.js; sw.js if needed.
Acceptance criterion: simulated cache version change activates new worker and removes superseded project caches without deleting unrelated origin caches.
Evidence required: before/after cache names and browser test output.

T0404 — Make registration failures observable to tests
Files touched: src/app.js or PWA module; tests/e2e/offline.spec.js.
Acceptance criterion: service-worker registration failure is not silently swallowed; production UX remains nontechnical while tests can detect failure.
Evidence required: negative-path browser test and normal-path output.

Physical iPhone Safari evidence for Level 4 is supplied by the owner as screenshots plus exact steps and is recorded as a separate evidence class. The agent never marks physical iPhone Safari VERIFIED on its own.

## Level 5 — Content-quality gate

T0501 — Extend question schema with quality fields
Files touched: data/schema/question.schema.json; supporting bank schema if required.
Acceptance criterion: difficulty 1–3; style scenario|definition; explanation coverage structure; needs_review boolean; existing IDs/domain/topic compatible with planned migration.
Evidence required: schema validation fixtures for pass/fail cases.

T0502 — Implement provisional validator gates
Files touched: scripts/validate.js; tests/content.validation.test.js.
Acceptance criterion: 4 options; unique options; valid answer; max 35% same answer index; correct-is-longest <=40%; no option <12 chars; definition style <=15; difficulty 1–3; explanation covers each wrong option. Gates are labeled provisional with review date 2026-10-07.
Evidence required: failing current-bank baseline plus synthetic unit tests proving each gate.

T0503 — Add domain/topic/content metrics report
Files touched: scripts/content_metrics.js; docs/reports/content-baseline.txt or generated CI artifact policy.
Acceptance criterion: answer-index histogram, longest ratio, definition count, domain counts, topic counts, option-length distribution, needs_review count are reproducible.
Evidence required: command/output and checked-in baseline if approved.

T0504 — Measure >=4 questions-per-learn-topic feasibility
Files touched: no content edits; metrics/report only.
Acceptance criterion: actual topic counts are measured before enforcing a >=4/topic rule; infeasible blueprint is escalated rather than padded with weak items.
Evidence required: topic histogram and explicit GO/NO-GO for the proposed threshold.

T0505 — Record pre-rewrite content baseline
Files touched: docs/reports/content-pre-rewrite.txt; content rewrite plan if needed.
Acceptance criterion: current 121-question bank metrics captured before rewriting.
Evidence required: validator/metrics command and immutable baseline output.

## Level 6 — Content rewrite

T0601 — Establish deterministic rewrite seed and audit log
Files touched: scripts/content_shuffle.js or equivalent; content_rewrite.log.
Acceptance criterion: answer-position shuffle is seeded/reproducible; every changed/new question logs ID, seed, source/review status.
Evidence required: repeat-run hash equality and log excerpt.

T0602 — Rewrite existing 121 questions through content gates
Files touched: data/questions.json; content_rewrite.log.
Acceptance criterion: IDs, domains and approved topics preserved; scenario stems/plausible four options; provisional gates pass; uncertain claims marked needs_review.
Evidence required: validator output, metrics before/after, diff summary, needs_review list.

T0603 — Add 21 flagship difficulty-3 scenarios
Files touched: data/questions.json; content_rewrite.log; blueprint report.
Acceptance criterion: 3 new high-quality difficulty-3 scenarios per official domain after blueprint review; total becomes 142 only if all 21 pass technical/content gates.
Evidence required: per-domain counts, validator output, review sheet links.

T0604 — Rebalance sessions for accepted bank
Files touched: data/sessions.json; tests covering session references/runtime composition.
Acceptance criterion: all static references valid; intended domain coverage retained; runtime sessions remain valid.
Evidence required: session integrity test and distribution report.

T0605 — Independent technical review of every needs_review item
Files touched: docs/reviews/needs-review-<question_id>.txt; data/questions.json only after owner disposition; content_rewrite.log.
Acceptance criterion: for every needs_review item the agent prepares a review sheet containing the exact claim, source(s), why uncertain, proposed resolution, and affected question ID; owner Othman performs the independent technical review and records approve/revise/reject; no item is cleared without owner disposition.
Evidence required: one committed review sheet per item; owner review disposition; final validator output and zero unresolved needs_review before claiming technical verification.
External dependency: owner Othman is required for this task.

## Level 7 — Future product extension boundaries

T0701 — Evaluate future managed identity providers
Files touched: specs/001-public-readiness/contracts/identity-provider.md; docs/reports/identity-provider-evaluation.txt.
Acceptance criterion: evaluate Saudi-region suitability, WebAuthn/passkeys, recovery, account deletion, pricing/lock-in, standards/OIDC support, data residency/privacy; no provider SDK deployed.
Evidence required: decision matrix and owner decision.

T0702 — Specify anonymous-to-account merge policy
Files touched: data-model.md/contracts; no runtime code unless separately approved.
Acceptance criterion: define duplicate/conflict rules, local-vs-server precedence, timestamps/versioning, rollback and user consent before sync implementation.
Evidence required: worked merge examples and owner approval.

T0703 — Specify community moderation/privacy/retention
Files touched: contracts/community-feedback.md; policy design docs.
Acceptance criterion: rating scale, authentication requirement, edit/delete/report, abuse controls, moderation states, retention, privacy and legal ownership decisions defined before activation.
Evidence required: owner-approved policy checklist.

Existing .github/workflows/daily-review.yml and .github/agent/* remain disabled by absent repository variables/secret and MUST remain untouched until Level 7 review. Rationale: they are an internal content-review automation path, not required for runtime/public readiness, and activating or redesigning them earlier would mix agent governance with learner-facing stabilization.

## Level 8 — Public-readiness evidence

T0801 — Harden final predeploy pipeline order
Files touched: .github/workflows/pages.yml; build/test scripts.
Acceptance criterion: validate -> unit -> adapters -> build -> SW assets -> full local browser E2E -> copy/accessibility -> deploy; no bypass.
Evidence required: green workflow run and ordered job output.

T0802 — Add live smoke and controlled rollback procedure
Files touched: pages workflow; scripts/live_smoke.js or Playwright live config; docs/ROLLBACK.txt.
Acceptance criterion: live boot/state/assets/cache smoke runs after deploy; failure marks run red; last known-good commit/artifact identified; manual rollback command/procedure tested. No automatic rollback claim.
Evidence required: successful live run plus separate tested rollback rehearsal evidence.

T0803 — Measure Lighthouse/mobile performance baseline
Files touched: performance script/config; docs/reports/performance-baseline.txt.
Acceptance criterion: Performance/Accessibility/Best Practices/PWA-or-current-equivalent metrics recorded with transfer size and interactive responsiveness metrics; hard numeric gate set only after applicability review.
Evidence required: Lighthouse output and rationale.

T0804 — Produce final readiness report
Files touched: docs/READINESS_REPORT_<date>.md; docs/screens/*.
Acceptance criterion: browser matrix, content metrics, copy, accessibility, performance, offline, new-user text, facts verified/partial/missing, unknowns, physical-Safari status and all failures encountered are documented.
Evidence required: committed report/screenshots and referenced CI run IDs/commands.

T0805 — Issue one-sentence GO/NO-GO
Files touched: final readiness report only.
Acceptance criterion: exactly one clear public-readiness decision and, if NO-GO, one primary reason.
Evidence required: report line backed by prior gates.

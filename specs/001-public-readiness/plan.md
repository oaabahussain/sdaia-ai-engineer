# Implementation Plan: Public-Readiness Foundation

Date: 2026-09-07
Status: Planning complete; implementation prohibited until completion commit is confirmed

## Technical context

Static GitHub Pages; Arabic-first UI; ES-module app; pure logic modules; browser/API storage adapters; JSON study bank; service worker; existing GitHub Actions; test-only FastAPI/OpenAPI/database foundation. No production backend deployment.

Baseline: main 059b90fca83d20b950b5c83e751a55180387fd53; service-worker cache v6; map-based state; separated study logic. Owner audit established that real browser execution was missing from the release gate and had previously allowed a broken public release.

Implementation order is strict: Level 0 -> Level 1 -> Level 2 -> Level 3 -> Level 4 -> Level 5 -> Level 6 -> Level 7 -> Level 8.

Stop-and-review points: mandatory owner review after Level 0 and after Level 3. Other levels continue autonomously unless a gate fails or an owner-only blocker is reached.

Every level report must use FACTS VERIFIED / PARTIAL / MISSING with exact command output, CI run IDs, and committed screenshots under docs/screens/ where browser evidence applies.

## Level 0 — Live recovery and runtime safety

Goal: prove boot/navigation/state persistence in real browsers before broad changes.
Entry: owner confirms pre-implementation completion commit.
Exit: built artifact passes Chromium mobile/desktop and WebKit mobile boot/state smoke with zero pageerror/unexpected console.error; browser smoke blocks deployment.
Owner review: STOP after Level 0 report.

## Level 1 — Strong scalable foundation

Goal: stable canonical state, migration fixtures, storage/logic/identity boundaries without login/backend.
Exit: exported state schema-valid; known migrations idempotent; architecture boundary tests green; no auth provider activated.

## Level 2 — Public UI cleanup

Goal: remove internal/developer residue; Arabic-first public copy; exactly one approved UI version string in About footer; clean reporting/export; question screen focused on study.
Exit: static and rendered copy audits green; screenshots committed.

## Level 3 — Real browser E2E architecture

Goal: full Playwright coverage across Chromium mobile/desktop and WebKit mobile with semantics-first selectors and stable testids where needed.
Exit: E2E inventory in tasks.md passes; runtime errors fail tests; accessibility/rendered-copy checks included.
Owner review: STOP after Level 3 report.

## Level 4 — PWA/offline reliability

Goal: prove service-worker registration, cache contents, offline reload, update/cache invalidation and observable failure behavior.
Exit: automated Chromium/WebKit evidence green.

Physical iPhone Safari evidence is supplied by the owner as screenshots plus exact reproduction steps and is recorded as a separate evidence class. The agent never marks physical iPhone Safari VERIFIED on its own.

## Level 5 — Content-quality gate

Goal: schema/validator/metrics before rewrite.
Provisional gates through 2026-10-07: exactly 4 options; answer index <=35%; correct-is-longest <=40%; no option <12 chars; definition style <=15; difficulty 1–3; explanation covers correct answer and every wrong option.
Exit: validator tests prove every gate; current-bank baseline measured; topic distribution measured before any >=4/topic rule.

## Level 6 — Content rewrite

Goal: scenario-based rewrite after gates; deterministic shuffle/log; add 21 flagship difficulty-3 scenarios only after blueprint review; rebalance sessions.
Exit: validator green, metrics documented, no unresolved technical uncertainty claimed verified.

Every needs_review item requires an agent-prepared review sheet containing exact claim, source(s), why uncertain, proposed resolution and question ID. Owner Othman performs the independent technical review and records approve/revise/reject. This owner review is an external blocker to clearing needs_review.

## Level 7 — Future product extension boundaries

Goal: evaluate managed passkey-capable identity providers, define account-link merge policy, and define comments/ratings moderation/privacy/retention. No activation unless separately approved.

The existing .github/workflows/daily-review.yml and .github/agent/* remain untouched and disabled before Level 7 because repository LLM vars/secret are not configured. They are internal content-review automation, not learner-facing runtime requirements. Level 7 may separately decide whether to retain, redesign, or retire them.

## Level 8 — Public-readiness evidence

Goal: final hardened release pipeline, live smoke, tested manual rollback, Lighthouse baseline, browser/content/copy/accessibility/performance/offline evidence, and one-sentence GO/NO-GO.
Exit: final report distinguishes VERIFIED/PARTIAL/MISSING; physical Safari class reflects only owner-supplied evidence; unknown official exam details remain explicitly unknown.

## Release pipeline target

validate -> unit tests -> adapter/contract tests -> build -> service-worker asset verification -> local browser E2E -> copy/accessibility -> deploy -> live smoke -> live hash/assets/cache verification -> readiness report.

Rollback phase 1: fail red, identify last known-good release, execute/test documented manual rollback. Automatic rollback remains disabled until separately proven deterministic.

## Timebox

The pre-implementation work is timeboxed to three working days. Time pressure does not authorize implementation before the completion commit and confirmation.

## Stop condition

The current pre-implementation feature stops after tasks and analyze. No Level 0–8 application implementation is executed on the pre-implementation branch as part of this completion commit.

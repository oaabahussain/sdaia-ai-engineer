# K4 Next-Best-Action and Spaced Practice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Provide a safe deterministic one-question public practice recommendation from K3 exposure evidence, while preserving all strict SDAIA exam behavior.

**Architecture:** Read and verify K3 IndexedDB evidence, project corrections and exposures, filter a release-bound public catalog, and rank via K4.RULES.v1. Add a separate non-strict practice route with local preferences and offline-safe browser UI. No live FSRS or invented correctness.

**Tech Stack:** Node 22 ES modules and `node:test`, browser JS/HTML/CSS, IndexedDB (`fake-indexeddb`), Python 3.12 server/browser regression, GitHub Actions/Pages.

**Spec:** `docs/superpowers/specs/2026-10-08-k4-next-best-action-spaced-practice-design.md` at Git blob `d732ac22161d4b007a8f869cbc928ec6737a40a8`, approved **for planning only** by the user's reply `موافق` at 2026-10-08T22:47:34Z to the explicit spec-approval question.

**Status:** `DRAFT_FOR_SEPARATE_PLAN_REVIEW`; no K4 product/code execution, merge or release authority. Baseline source `main@9e55881e9480b4a02d8ef5d92a0b21a9313492f1` and K3 `CURRENT-STATE` revision 76/COMPLETE must be reverified before future implementation.

## Global Constraints

- Hard gates: separate approval of THIS plan and selected execution method before implementing; separate user authorization tied to exact current Product PR HEAD before merge/deploy. PR #64 is a research DRAFT, not a release shortcut.
- Preserve K3 append-only evidence, strict mock/section scoring, protected pools, old CURRENT-STATE/ledger, 1,120 questions in seven domains, 200-item exam and bank digest `5e48b1e47450f1150c9c8f21386f3a4e31070a3d444f968d10f45ccb9ff418a9`.
- K4.RULES.v1 fixed starting delays first=48h, trusted incorrect=24h, trusted correct=96h, max=720h, max items=1; include learn/practice modes only; check/mock/section/full excluded; no uncalibrated FSRS or official readiness.
- Browser answer is EXPOSURE_ONLY. SYSTEM trust requires independent producer verification and authorized fixture; an `authority_ref` string is not proof. No protected item, answer key or holdout ID in RecommendationV1.
- Use explicit source/learner/store/release identity and validated fingerprints; an opaque local ID is not authenticated cross-device identity. Do not call replayEvidence(toSeq=0).
- All core clock inputs injected as valid UTC instants, deterministic stable ID ordering; no persistent RecommendationV1 cache, time/snooze re-evaluation even if source watermark unchanged.
- Each step preserves AR/EN, keyboard/RTL, offline, SW/Pages allowlist, privacy, no false IndexedDB persistence. Existing K3 process validators remain K3 regression checks, never K4 readiness proof.
- Scope owns one behavior, not unrelated refactoring; fail closed if exact public release status/provenance cannot be justified from existing K2 artifacts.

## Review Focus

1. **Local head vs sync cursor / empty stream:** Task 04 tests real local watermark=0, avoids misusing getSyncCursor and replayEvidence(toSeq=0).
2. **Corrected conflicting event:** Task 05 quarantines affected family; Task 07 rejects it before ranking.
3. **Time passes with no event:** Task 06 validates UTC, Task 11 recomputes after snooze expiry without changing watermark.
4. **One family public + protected versions:** Task 03 requires governed release public status; Task 07 selects approved version only.
5. **Preferences write fails:** Task 08 tests durable transactional outcome and revision; Task 11 never displays successful snooze if persistence failed.

## Fixed file ownership and execution approach

The fourteen tasks below own their exact paths. New `tests/k4-*.test.js` and `src/recommendations/*` paths are **proposals**, not existing files. Keep new pure modules independent of `src/app.js`; only browser Controller accesses DOM, and only Source Reader accesses K3 IndexedDB. Task 04 adds a backward-compatible read-only head API to K3 storage; it must not alter acceptance, fingerprinting or mutation authority.

At future execution, first verify fresh main, exact approved spec/plan Git blobs, independent K4 manifest/preflight, isolated worktree. Use native inline `executing-plans` if this host still lacks real subagent dispatch (the user requested consecutive execution in one response); otherwise offer real subagent-driven mode if available. Each task has required RED→GREEN→full regression→commit/ledger evidence, and no normal between-task confirmation.

### Task 01: K4 governance state + preflight

**Files:** `docs/superpowers/state/k4-current-state.schema.json`, `scripts/process/validate_k4_state.js`, `docs/superpowers/state/K4-CURRENT-STATE.json (after plan approval)`, `tests/k4-state.test.js`

**Interfaces:** `validateK4State({state,liveMainSha,specBlobSha,planBlobSha,executionRef}) -> {ok,code}`

**Dependencies:** N/A process stage

- [ ] **Step 1: Write the failing test** in `tests/k4-state.test.js` using `node:test` and `node:assert/strict`. Explicit assertions: wrong approval/spec/plan SHA, changed main, open Important/Critical, wrong branch -> DENY; approved fixtures -> PASS; K3 CURRENT-STATE unchanged. Include an inverse case that would be broken by a wrong implementation.
- [ ] **Step 2: Verify RED** — run `node --test tests/k4-state.test.js`; expected: precisely named behavior FAIL due to missing K4 behavior (not syntax/config flakiness). Save error/exit status in K4 ledger.
- [ ] **Step 3: Write minimal implementation** strictly in owned files for the interface above. Keep K3 unchanged except Task 04's additive read-only accessor; handle specified negative cases.
- [ ] **Step 4: Verify GREEN and regressions** — run `node --test tests/k4-state.test.js` (expected exit 0), then `npm test` (expected exit 0). Run listed K3 test files when edited; use systematic-debugging on actual failures, never silently weaken tests.
- [ ] **Step 5: Checkpoint/commit** — record BASE/HEAD, acceptance RED and GREEN logs, reviewer result if available, scoped diff and full-suite outcome. Commit only named files; stop on non-PASS preflight, undefined approval, Critical/Important, or missing evidence.

### Task 02: RulePolicyV1 strict schema

**Files:** `data/schema/k4-rule-policy-v1.schema.json`, `data/recommendations/k4-rule-policy-v1.json`, `src/recommendations/policy.js`, `tests/k4-policy.test.js`

**Interfaces:** `validateRulePolicy(input) -> frozen RulePolicyV1`

**Dependencies:** 01

- [ ] **Step 1: Write the failing test** in `tests/k4-policy.test.js` using `node:test` and `node:assert/strict`. Explicit assertions: 48/24/96/720-hour defaults, max_action_items=1 and fsrs_enabled=false; reject negative hours, wrong modes, unknown fields. Include an inverse case that would be broken by a wrong implementation.
- [ ] **Step 2: Verify RED** — run `node --test tests/k4-policy.test.js`; expected: precisely named behavior FAIL due to missing K4 behavior (not syntax/config flakiness). Save error/exit status in K4 ledger.
- [ ] **Step 3: Write minimal implementation** strictly in owned files for the interface above. Keep K3 unchanged except Task 04's additive read-only accessor; handle specified negative cases.
- [ ] **Step 4: Verify GREEN and regressions** — run `node --test tests/k4-policy.test.js` (expected exit 0), then `npm test` (expected exit 0). Run listed K3 test files when edited; use systematic-debugging on actual failures, never silently weaken tests.
- [ ] **Step 5: Checkpoint/commit** — record BASE/HEAD, acceptance RED and GREEN logs, reviewer result if available, scoped diff and full-suite outcome. Commit only named files; stop on non-PASS preflight, undefined approval, Critical/Important, or missing evidence.

### Task 03: Release-pinned approved-public catalog

**Files:** `data/recommendations/k4-public-catalog-v1.json`, `src/recommendations/publicCatalog.js`, `tests/k4-public-catalog.test.js`

**Interfaces:** `validatePublicCatalog({catalog,trackManifest,evidenceContext,publicQuestions,objectives}) -> PublicCatalogV1; eligiblePublicItems({catalog,releaseId,availableIds}) -> Candidate[]`

**Dependencies:** 02

- [ ] **Step 1: Write the failing test** in `tests/k4-public-catalog.test.js` using `node:test` and `node:assert/strict`. Explicit assertions: missing governed release proof -> fail closed; protected/retired/holdout version excluded; same family may have approved public variant; never ship answer keys in candidate objects. Include an inverse case that would be broken by a wrong implementation.
- [ ] **Step 2: Verify RED** — run `node --test tests/k4-public-catalog.test.js`; expected: precisely named behavior FAIL due to missing K4 behavior (not syntax/config flakiness). Save error/exit status in K4 ledger.
- [ ] **Step 3: Write minimal implementation** strictly in owned files for the interface above. Keep K3 unchanged except Task 04's additive read-only accessor; handle specified negative cases.
- [ ] **Step 4: Verify GREEN and regressions** — run `node --test tests/k4-public-catalog.test.js` (expected exit 0), then `npm test` (expected exit 0). Run listed K3 test files when edited; use systematic-debugging on actual failures, never silently weaken tests.
- [ ] **Step 5: Checkpoint/commit** — record BASE/HEAD, acceptance RED and GREEN logs, reviewer result if available, scoped diff and full-suite outcome. Commit only named files; stop on non-PASS preflight, undefined approval, Critical/Important, or missing evidence.

### Task 04: K3 store read-only source head + reader

**Files:** `src/evidence/indexedDbStore.js (additive read-only API)`, `src/recommendations/sourceReader.js`, `tests/k4-source-reader.test.js`, `tests/k3-indexeddb-evidence-store.test.js`

**Interfaces:** `store.getSourceHead() -> Promise<{store_id,through_store_seq}>; readK4Evidence({store,learnerId,trackId,releaseId,throughStoreSeq}) -> Promise<{source_store_id,through_store_seq,events}>`

**Dependencies:** 01

- [ ] **Step 1: Write the failing test** in `tests/k4-source-reader.test.js` using `node:test` and `node:assert/strict`. Explicit assertions: no events -> head 0, zero-record safe without replayEvidence(toSeq=0); source/release/hash mismatches reject; getSyncCursor must not be mistaken for local head. Include an inverse case that would be broken by a wrong implementation.
- [ ] **Step 2: Verify RED** — run `node --test tests/k4-source-reader.test.js`; expected: precisely named behavior FAIL due to missing K4 behavior (not syntax/config flakiness). Save error/exit status in K4 ledger.
- [ ] **Step 3: Write minimal implementation** strictly in owned files for the interface above. Keep K3 unchanged except Task 04's additive read-only accessor; handle specified negative cases.
- [ ] **Step 4: Verify GREEN and regressions** — run `node --test tests/k4-source-reader.test.js` (expected exit 0), then `npm test` (expected exit 0). Run listed K3 test files when edited; use systematic-debugging on actual failures, never silently weaken tests.
- [ ] **Step 5: Checkpoint/commit** — record BASE/HEAD, acceptance RED and GREEN logs, reviewer result if available, scoped diff and full-suite outcome. Commit only named files; stop on non-PASS preflight, undefined approval, Critical/Important, or missing evidence.

### Task 05: Correction-aware exposure projection

**Files:** `src/recommendations/projection.js`, `tests/k4-projection.test.js`, `tests/k3-evidence-corrections.test.js`, `tests/k3-attempt-projection.test.js`

**Interfaces:** `computeScheduleProjection({learnerId,sourceStoreId,throughStoreSeq,events,activeReleaseId,policy,nowIso,acceptedContentCatalog}) -> ScheduleProjectionV1`

**Dependencies:** 02,03,04

- [ ] **Step 1: Write the failing test** in `tests/k4-projection.test.js` using `node:test` and `node:assert/strict`. Explicit assertions: duplicate delivery/item rerender count once by interaction; VOID/SUPERSEDE resolve; correction conflict quarantines family; stale response/unknown authority never yields trusted grade; 5 IDs/truncated flag. Include an inverse case that would be broken by a wrong implementation.
- [ ] **Step 2: Verify RED** — run `node --test tests/k4-projection.test.js`; expected: precisely named behavior FAIL due to missing K4 behavior (not syntax/config flakiness). Save error/exit status in K4 ledger.
- [ ] **Step 3: Write minimal implementation** strictly in owned files for the interface above. Keep K3 unchanged except Task 04's additive read-only accessor; handle specified negative cases.
- [ ] **Step 4: Verify GREEN and regressions** — run `node --test tests/k4-projection.test.js` (expected exit 0), then `npm test` (expected exit 0). Run listed K3 test files when edited; use systematic-debugging on actual failures, never silently weaken tests.
- [ ] **Step 5: Checkpoint/commit** — record BASE/HEAD, acceptance RED and GREEN logs, reviewer result if available, scoped diff and full-suite outcome. Commit only named files; stop on non-PASS preflight, undefined approval, Critical/Important, or missing evidence.

### Task 06: UTC due times and time-safety

**Files:** `src/recommendations/clock.js`, `src/recommendations/projection.js`, `tests/k4-clock.test.js`

**Interfaces:** `assertInstant(iso) -> epochMs; computeDueAt({lastExposureAt,lastTrustedGradeAt,gradeEvidence,correct,nowIso,policy}) -> ISO|null`

**Dependencies:** 05

- [ ] **Step 1: Write the failing test** in `tests/k4-clock.test.js` using `node:test` and `node:assert/strict`. Explicit assertions: 2026-10-08T00:00Z exposure due 2026-10-10T00:00Z; authorized wrong due +24h and correct +96h; invalid/date-only/skewed future timestamps quarantined; UTC/DST invariant. Include an inverse case that would be broken by a wrong implementation.
- [ ] **Step 2: Verify RED** — run `node --test tests/k4-clock.test.js`; expected: precisely named behavior FAIL due to missing K4 behavior (not syntax/config flakiness). Save error/exit status in K4 ledger.
- [ ] **Step 3: Write minimal implementation** strictly in owned files for the interface above. Keep K3 unchanged except Task 04's additive read-only accessor; handle specified negative cases.
- [ ] **Step 4: Verify GREEN and regressions** — run `node --test tests/k4-clock.test.js` (expected exit 0), then `npm test` (expected exit 0). Run listed K3 test files when edited; use systematic-debugging on actual failures, never silently weaken tests.
- [ ] **Step 5: Checkpoint/commit** — record BASE/HEAD, acceptance RED and GREEN logs, reviewer result if available, scoped diff and full-suite outcome. Commit only named files; stop on non-PASS preflight, undefined approval, Critical/Important, or missing evidence.

### Task 07: Deterministic eligible-first ranker

**Files:** `src/recommendations/ranker.js`, `tests/k4-ranking.test.js`

**Interfaces:** `recommendNextAction({scheduleProjection,catalog,policy,nowIso,preferences}) -> RecommendationV1`

**Dependencies:** 03,05,06

- [ ] **Step 1: Write the failing test** in `tests/k4-ranking.test.js` using `node:test` and `node:assert/strict`. Explicit assertions: COLD_START action with empty valid history; SOURCE_INVALID -> INSUFFICIENT_EVIDENCE; protected -> excluded; one PRACTICE_ONE max; stable binary/codepoint tie break; no persistently cached recommendation. Include an inverse case that would be broken by a wrong implementation.
- [ ] **Step 2: Verify RED** — run `node --test tests/k4-ranking.test.js`; expected: precisely named behavior FAIL due to missing K4 behavior (not syntax/config flakiness). Save error/exit status in K4 ledger.
- [ ] **Step 3: Write minimal implementation** strictly in owned files for the interface above. Keep K3 unchanged except Task 04's additive read-only accessor; handle specified negative cases.
- [ ] **Step 4: Verify GREEN and regressions** — run `node --test tests/k4-ranking.test.js` (expected exit 0), then `npm test` (expected exit 0). Run listed K3 test files when edited; use systematic-debugging on actual failures, never silently weaken tests.
- [ ] **Step 5: Checkpoint/commit** — record BASE/HEAD, acceptance RED and GREEN logs, reviewer result if available, scoped diff and full-suite outcome. Commit only named files; stop on non-PASS preflight, undefined approval, Critical/Important, or missing evidence.

### Task 08: Local preferences with honest writes

**Files:** `src/recommendations/preferencesStore.js`, `tests/k4-preferences.test.js`

**Interfaces:** `createSchedulingPreferencesStore({indexedDB,dbName}) -> {read,save,clear}; save({learnerId,expectedRevision,next}) -> {persisted,revision}`

**Dependencies:** 07

- [ ] **Step 1: Write the failing test** in `tests/k4-preferences.test.js` using `node:test` and `node:assert/strict`. Explicit assertions: atomic expectedRevision, snooze/dismiss expiry; write failure/quota/disabled IndexedDB never returns persisted=true; K3 learner evidence remains immutable. Include an inverse case that would be broken by a wrong implementation.
- [ ] **Step 2: Verify RED** — run `node --test tests/k4-preferences.test.js`; expected: precisely named behavior FAIL due to missing K4 behavior (not syntax/config flakiness). Save error/exit status in K4 ledger.
- [ ] **Step 3: Write minimal implementation** strictly in owned files for the interface above. Keep K3 unchanged except Task 04's additive read-only accessor; handle specified negative cases.
- [ ] **Step 4: Verify GREEN and regressions** — run `node --test tests/k4-preferences.test.js` (expected exit 0), then `npm test` (expected exit 0). Run listed K3 test files when edited; use systematic-debugging on actual failures, never silently weaken tests.
- [ ] **Step 5: Checkpoint/commit** — record BASE/HEAD, acceptance RED and GREEN logs, reviewer result if available, scoped diff and full-suite outcome. Commit only named files; stop on non-PASS preflight, undefined approval, Critical/Important, or missing evidence.

### Task 09: Non-strict one-question K3 evidence adapter

**Files:** `src/recommendations/practiceSession.js`, `tests/k4-practice-session.test.js`, `tests/k3-evidence-recorder.test.js`

**Interfaces:** `createPracticeSession({recorder,learnerId,trackId,releaseId,locale,candidate,objectives}) -> PracticeSessionV1; presentPracticeItem({recorder,session}); recordPracticeResponse({recorder,session,optionIndex})`

**Dependencies:** 03,07

- [ ] **Step 1: Write the failing test** in `tests/k4-practice-session.test.js` using `node:test` and `node:assert/strict`. Explicit assertions: mode=practice; activity started, item presented and ordinary response recorded once with durable receipt; no createBrowserAssessmentContext, submitAssessment, browser recordEvaluation or false trusted correctness. Include an inverse case that would be broken by a wrong implementation.
- [ ] **Step 2: Verify RED** — run `node --test tests/k4-practice-session.test.js`; expected: precisely named behavior FAIL due to missing K4 behavior (not syntax/config flakiness). Save error/exit status in K4 ledger.
- [ ] **Step 3: Write minimal implementation** strictly in owned files for the interface above. Keep K3 unchanged except Task 04's additive read-only accessor; handle specified negative cases.
- [ ] **Step 4: Verify GREEN and regressions** — run `node --test tests/k4-practice-session.test.js` (expected exit 0), then `npm test` (expected exit 0). Run listed K3 test files when edited; use systematic-debugging on actual failures, never silently weaken tests.
- [ ] **Step 5: Checkpoint/commit** — record BASE/HEAD, acceptance RED and GREEN logs, reviewer result if available, scoped diff and full-suite outcome. Commit only named files; stop on non-PASS preflight, undefined approval, Critical/Important, or missing evidence.

### Task 10: Public home card and AR/EN practice screen

**Files:** `src/recommendations/browserController.js`, `index.html`, `src/app.js`, `src/presentation/coreI18n.js`, `tests/k4-browser-controller.test.js`

**Interfaces:** `createK4BrowserController({document,loadRecommendation,startSession,respond,preferencesStore,clock,localize}) -> {renderHome,openPractice,showReason,close}`

**Dependencies:** 08,09

- [ ] **Step 1: Write the failing test** in `tests/k4-browser-controller.test.js` using `node:test` and `node:assert/strict`. Explicit assertions: single accessible public item, localized reason and keys, no mastery/official claims; preserve full/section exam start, scoring and history; use textContent on untrusted inputs. Include an inverse case that would be broken by a wrong implementation.
- [ ] **Step 2: Verify RED** — run `node --test tests/k4-browser-controller.test.js`; expected: precisely named behavior FAIL due to missing K4 behavior (not syntax/config flakiness). Save error/exit status in K4 ledger.
- [ ] **Step 3: Write minimal implementation** strictly in owned files for the interface above. Keep K3 unchanged except Task 04's additive read-only accessor; handle specified negative cases.
- [ ] **Step 4: Verify GREEN and regressions** — run `node --test tests/k4-browser-controller.test.js` (expected exit 0), then `npm test` (expected exit 0). Run listed K3 test files when edited; use systematic-debugging on actual failures, never silently weaken tests.
- [ ] **Step 5: Checkpoint/commit** — record BASE/HEAD, acceptance RED and GREEN logs, reviewer result if available, scoped diff and full-suite outcome. Commit only named files; stop on non-PASS preflight, undefined approval, Critical/Important, or missing evidence.

### Task 11: Start/another/snooze recovery behavior

**Files:** `src/recommendations/browserController.js`, `src/app.js`, `tests/k4-user-controls.test.js`

**Interfaces:** `controller.nextAction(); controller.another(); controller.snooze({familyId,untilAt}); controller.close()`

**Dependencies:** 08,10

- [ ] **Step 1: Write the failing test** in `tests/k4-user-controls.test.js` using `node:test` and `node:assert/strict`. Explicit assertions: current injected nowIso and current preferences recomputed at due/snooze expiry WITHOUT new event; offline/denied storage fallback; never falsely assert persistence or deep-link removed item. Include an inverse case that would be broken by a wrong implementation.
- [ ] **Step 2: Verify RED** — run `node --test tests/k4-user-controls.test.js`; expected: precisely named behavior FAIL due to missing K4 behavior (not syntax/config flakiness). Save error/exit status in K4 ledger.
- [ ] **Step 3: Write minimal implementation** strictly in owned files for the interface above. Keep K3 unchanged except Task 04's additive read-only accessor; handle specified negative cases.
- [ ] **Step 4: Verify GREEN and regressions** — run `node --test tests/k4-user-controls.test.js` (expected exit 0), then `npm test` (expected exit 0). Run listed K3 test files when edited; use systematic-debugging on actual failures, never silently weaken tests.
- [ ] **Step 5: Checkpoint/commit** — record BASE/HEAD, acceptance RED and GREEN logs, reviewer result if available, scoped diff and full-suite outcome. Commit only named files; stop on non-PASS preflight, undefined approval, Critical/Important, or missing evidence.

### Task 12: Pages and offline shell parity

**Files:** `sw.js`, `scripts/build_pages_artifact.js`, `scripts/verify_sw_assets.js`, `scripts/verify_live_release.js`, `tests/k4-pages-offline.test.js`

**Interfaces:** `existing build/verify CLI extended for only approved K4 public assets and new cache version`

**Dependencies:** 03,10,11

- [ ] **Step 1: Write the failing test** in `tests/k4-pages-offline.test.js` using `node:test` and `node:assert/strict`. Explicit assertions: offline reload resolves all K4 modules & policy; missing asset fails verifier; data/factory and src/platform-kernel never shipped; no concept chunk precaching; old exam shell functional. Include an inverse case that would be broken by a wrong implementation.
- [ ] **Step 2: Verify RED** — run `node --test tests/k4-pages-offline.test.js`; expected: precisely named behavior FAIL due to missing K4 behavior (not syntax/config flakiness). Save error/exit status in K4 ledger.
- [ ] **Step 3: Write minimal implementation** strictly in owned files for the interface above. Keep K3 unchanged except Task 04's additive read-only accessor; handle specified negative cases.
- [ ] **Step 4: Verify GREEN and regressions** — run `node --test tests/k4-pages-offline.test.js` (expected exit 0), then `npm test` (expected exit 0). Run listed K3 test files when edited; use systematic-debugging on actual failures, never silently weaken tests.
- [ ] **Step 5: Checkpoint/commit** — record BASE/HEAD, acceptance RED and GREEN logs, reviewer result if available, scoped diff and full-suite outcome. Commit only named files; stop on non-PASS preflight, undefined approval, Critical/Important, or missing evidence.

### Task 13: Integrated browser, source, and exam regression

**Files:** `scripts/browser_smoke.py`, `tests/k4-release-acceptance.test.js`, `docs/superpowers/reviews/k4-quality-checkpoint.md (during execution)`

**Interfaces:** `runAcceptance({headSha,fixtures,checks}) -> evidence report (never fabricated PASS)`

**Dependencies:** 01–12

- [ ] **Step 1: Write the failing test** in `tests/k4-release-acceptance.test.js` using `node:test` and `node:assert/strict`. Explicit assertions: 18 spec acceptances, browser Arabic/English RTL/keyboard/mobile, IndexedDB denial, clock/correction, public/holdout, existing 1120 bank/7 domains/200 exam/sha256 5e48b1e47450f1150c9c8f21386f3a4e31070a3d444f968d10f45ccb9ff418a9. Include an inverse case that would be broken by a wrong implementation.
- [ ] **Step 2: Verify RED** — run `node --test tests/k4-release-acceptance.test.js`; expected: precisely named behavior FAIL due to missing K4 behavior (not syntax/config flakiness). Save error/exit status in K4 ledger.
- [ ] **Step 3: Write minimal implementation** strictly in owned files for the interface above. Keep K3 unchanged except Task 04's additive read-only accessor; handle specified negative cases.
- [ ] **Step 4: Verify GREEN and regressions** — run `node --test tests/k4-release-acceptance.test.js` (expected exit 0), then `npm test` (expected exit 0). Run listed K3 test files when edited; use systematic-debugging on actual failures, never silently weaken tests.
- [ ] **Step 5: Checkpoint/commit** — record BASE/HEAD, acceptance RED and GREEN logs, reviewer result if available, scoped diff and full-suite outcome. Commit only named files; stop on non-PASS preflight, undefined approval, Critical/Important, or missing evidence.

### Task 14: Independent review, exact-head landing and post-merge proof

**Files:** `docs/superpowers/reviews/k4-final-review.md`, `docs/superpowers/reviews/k4-post-merge-verification.md`, `docs/superpowers/state/K4-CURRENT-STATE.json (only after real proof)`

**Interfaces:** `landing gate: PR/currentHead SHA + independent reviewer disposition + exact-head CI + explicit separate user merge authorization`

**Dependencies:** 13; external merge authorization remains distinct

- [ ] **Step 1: Write the failing test** in `tests/k4-release-acceptance.test.js` using `node:test` and `node:assert/strict`. Explicit assertions: no open Critical/Important, verified final PR SHA, no admin/force/shortcut merge, actual merge SHA and fresh merged-main Node/Python/Pages checks, K4 COMPLETE only post-release; K5 not begun. Include an inverse case that would be broken by a wrong implementation.
- [ ] **Step 2: Verify RED** — run `node --test tests/k4-release-acceptance.test.js`; expected: precisely named behavior FAIL due to missing K4 behavior (not syntax/config flakiness). Save error/exit status in K4 ledger.
- [ ] **Step 3: Write minimal implementation** strictly in owned files for the interface above. Keep K3 unchanged except Task 04's additive read-only accessor; handle specified negative cases.
- [ ] **Step 4: Verify GREEN and regressions** — run `node --test tests/k4-release-acceptance.test.js` (expected exit 0), then `npm test` (expected exit 0). Run listed K3 test files when edited; use systematic-debugging on actual failures, never silently weaken tests.
- [ ] **Step 5: Checkpoint/commit** — record BASE/HEAD, acceptance RED and GREEN logs, reviewer result if available, scoped diff and full-suite outcome. Commit only named files; stop on non-PASS preflight, undefined approval, Critical/Important, or missing evidence.

## Acceptance coverage by task

| K4 written spec case | Owner(s) | Proof |
| --- | --- | --- |
| 1 empty stream cold start | 04,07 | head=0, COLD_START without replay 0 |
| 2 verified graded SYSTEM fixture | 05,06 | producer check, due correctly calculated; not deployed browser authority |
| 3 browser response exposure-only | 05,09 | no trust promotion |
| 4 stale/unresolved strict response | 05 | no grade |
| 5 correction VOID/SUPERSEDE/conflict | 05 | recompute or quarantine |
| 6 duplicates and rerender | 05,09 | distinct interaction only |
| 7 provisional objectives display only | 03,10 | no prerequisite graph |
| 8 protected/unavailable all | 03,07 | NO_ELIGIBLE_ACTION |
| 9 family public+holdout versions | 03,07 | public version only |
| 10 deterministic locales Node/browser | 06,07,13 | frozen fixtures |
| 11 DST, travel, device-clock changes | 06,13 | fixed UTC or quarantine |
| 12 snooze/skip/reload/offline | 08,11,12 | actual persisted receipt |
| 13 IndexedDB quota/denial | 08,11 | no invented persistence |
| 14 non-strict one-question versus strict | 09,10,13 | K3 exam stays identical |
| 15 bank digest/count/exam | 13 | 1120/7/200/sha |
| 16 AR/EN RTL keyboard/offline | 10,12,13 | browser smoke |
| 17 final independent review/CI | 13,14 | reviews and exact-SHA CI |
| 18 merge and merged-main/Pages | 14 | separate approval and proof |

## Full reproducible verification after plan approval

```bash
npm ci --ignore-scripts
python3 -m pip install -r server/requirements.txt
npm run validate
npm test
npm run verify:sw
npm run verify:factory-import
node --check src/app.js
PYTHONPATH=server python3 -m pytest server/tests -q
python3 scripts/browser_smoke.py
node scripts/build_pages_artifact.js _site
node scripts/verify_sw_assets.js _site
```

GitHub `.github/workflows/ci.yml` also tests Pages preview and K3 state regressions; `server-tests.yml` tests API/browser adapters; `pages.yml` verifies deployed digest and live assets after merge. At execution pin commands to the current repository, run tests at the exact final HEAD, review all open findings, then explicitly obtain approval to land exact Product PR SHA. No "PASS" can be inferred from this prospective plan.

## Approval and handoff gates

- **G0 SPEC:** APPROVED FOR WRITING THIS PLAN only: Git blob `d732ac22161d4b007a8f869cbc928ec6737a40a8` via user `موافق`.
- **G1 THIS PLAN:** `AWAITING_SEPARATE_USER_APPROVAL`. Do not mark K4 state authorized, start worktree, run K4 tests, edit Product or merge until that approval occurs on the actual saved plan blob.
- **G2–G4:** Once approved, verify live main/spec/plan and set up independent K4 process state and isolated task source. Execute tasks 01–13 consecutively with mandatory acceptance RED/GREEN, scope/commit, source integrity and full-suite checkpoints; request actual reviewer when available.
- **G5 LANDING:** Separate approval tied to exact Product PR SHA. Research PR #64 must not be treated as a Product release PR.
- **G6 POSTMERGE:** Verify merged main SHA, full test suites, real deployed Pages artifact, release report, then mark K4 COMPLETE and start any K5 gate separately.

**Self-review:** Task interfaces consistently match the dependency map; behavioral tests are owned by each implementation task rather than postponed; all 18 acceptance cases mapped. High-risk unknown is documentary proof of the K2 public release allowlist, explicitly a hard fail-closed requirement in Task 03. No independent review, feature test, merge or release occurred during plan writing.

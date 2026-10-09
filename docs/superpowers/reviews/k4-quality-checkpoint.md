# K4 — Quality and Acceptance Checkpoint

**Status:** INTEGRATION_VERIFICATION_IN_PROGRESS / NOT_MERGED  
**Repository:** oaabahussain/sdaia-ai-engineer  
**Implementation PR:** #65 DRAFT  
**Spec blob:** d732ac22161d4b007a8f869cbc928ec6737a40a8  
**Plan blob:** edda6ef11fb353d7403098d79400fc783e2f21f1  
**Main baseline:** 9e55881e9480b4a02d8ef5d92a0b21a9313492f1  
**Code checkpoint verified:** `bb34b507d3b6e684f1d2e2bd26398ffdbe59109a` — Quality [37934622333](https://github.com/oaabahussain/sdaia-ai-engineer/actions/runs/37934622333) SUCCESS, 918/918 Node, 76/76 Python, browser/offline smoke, Pages and SW checks; Server [37934622382](https://github.com/oaabahussain/sdaia-ai-engineer/actions/runs/37934622382) SUCCESS. Documentation-only HEAD after this report must be rechecked.

Do not interpret a mapped test name as a PASS before its exact-head runner is green. Two-stage reporting: each feature test evidence and the final true GitHub/Pages operational result. The report intentionally includes known gaps. Final release cannot be claimed without explicit exact-head user landing approval.

| Case | Intent | Source of executable evidence | Checkpoint assessment |
| --- | --- | --- | --- |
| AC-01 | Empty replay cold start, zero head | k4-source-reader.test.js, k4-ranking.test.js | TESTED_IN_UNIT |
| AC-02 | Trusted graded SYSTEM fixture, authenticated producer | k4-clock.test.js verifies correct and incorrect due mathematics only; no actual verified SYSTEM producer in browser | BLOCKED_PRODUCER_VERIFICATION |
| AC-03 | Browser response exposure only | k4-practice-session.test.js, k4-projection.test.js, browser_smoke.py | VERIFIED_CODE_SHA_UNIT_BROWSER |
| AC-04 | No stale/unresolved strict response promotion | K3 strict attempt projection regression, K4 source/ranker | TESTED_IN_UNIT; grading authority deferred |
| AC-05 | VOID, supersession, conflicting corrections | k4-projection.test.js | TESTED_IN_UNIT |
| AC-06 | Duplicate capture and page rerender | k4-practice-session.test.js, k4-projection.test.js | TESTED_IN_UNIT |
| AC-07 | Provisional objectives label only | k4-public-catalog.test.js | TESTED_IN_UNIT |
| AC-08 | Protected/unavailable candidates excluded | k4-public-catalog.test.js, k4-ranking.test.js | TESTED_IN_UNIT |
| AC-09 | Same family with public and holdout versions | k4-public-catalog.test.js: synthetic public v1 and holdout v2, selection excludes holdout | VERIFIED_SYNTHETIC_FIXTURE_ONLY; real protected-inventory review remains external |
| AC-10 | Deterministic selection across locales | k4-ranking.test.js and browser_smoke.py | VERIFIED_CODE_SHA_UNIT_BROWSER |
| AC-11 | UTC, DST, travel, device clock skew | k4-clock.test.js; future-skew quarantine | TESTED_IN_UNIT; simulated device clock manipulation not separately tested |
| AC-12 | Snooze, skip, reload, offline | k4-preferences.test.js, k4-user-controls.test.js, browser_smoke.py | VERIFIED_UNIT; browser offline public practice verified; save persistence browser denial covered |
| AC-13 | IndexedDB quota and denial, no false persistence | k4-preferences.test.js, k4-user-controls.test.js, browser_smoke.py | VERIFIED_UNIT_AND_CHROMIUM_FAULT_INJECTION; physical quota exhaustion not tested |
| AC-14 | One-item non-strict vs unchanged full/section | k4-practice-session.test.js; K3 tests and browser_smoke.py | VERIFIED_CODE_SHA_UNIT_BROWSER |
| AC-15 | Public bank digest, count, full exam | k4-release-acceptance.test.js, factory-import verifier, browser smoke | VERIFIED_CODE_SHA_UNIT_BROWSER |
| AC-16 | AR/EN, RTL, keyboard, offline and mobile | browser_smoke.py includes first/second offline visit, language, keyboard focus and 390px viewport | VERIFIED_CODE_SHA_CHROMIUM |
| AC-17 | Independent whole-branch review and exact-head CI | k4-final-review.md, GitHub PR #65 final HEAD checks | BLOCKED_REVIEW_PENDING |
| AC-18 | Actual authorized merge, merged-main CI and Pages proof | k4-post-merge-verification.md, GitHub deployment and live verifier | MERGE_BLOCKED_NO_EXACT_HEAD_APPROVAL |

## Safety and scope

- K3 closed CURRENT-STATE remains unchanged. Strict full and section exams may use the same existing public QUESTIONS array and must not be treated as protected source merely for their historic usage.
- Public learner-visible payload remains 1,120 unique question items in seven domains, 200 full-form profile questions, digest 5e48b1e47450f1150c9c8f21386f3a4e31070a3d444f968d10f45ccb9ff418a9.
- K4 source remains pseudonymous local evidence, not authenticated remote user history. There is no verified SYSTEM browser producer; all browser accuracy claims remain EXPOSURE_ONLY.
- Fixed 48/24/96/720 hour intervals are NOT calibrated FSRS/official readiness.
- Protected/private factory data and policy schemas remain outside Pages public bundle.
- UI and K4 data must not break old offline K3 shell.
- **No merge, production deployment, or program K5** before a separately authorized exact final Product PR SHA and full merged-main proof.

## Final evidence still required

Exact current PR head, quality and server run IDs, deterministic acceptance and browser actual pass, final whole-branch review, Critical/Important findings, exact user approval, merged main SHA, live Pages verification. Any unresolved item must remain an explicit blocker rather than be reported as complete.

## 2026-10-09 final scoped evidence addendum

- Task13 code and regression fixes have successful current-code Github evidence at `bb34b507d3b6e684f1d2e2bd26398ffdbe59109a`: 918 Node, 76 Python, Quality 37934622333, Server 37934622382, browser AR/EN/RTL/keyboard/mobile/offline and strict full/section.
- `0833fec115ce466424edf983742620d5b4fe0972` / Quality 37934128044 proved one RED regression (916 other PASS): a durable successful snooze was reported as unsaved when its later recommendation refresh failed. Code fix `3a87946454c31b8ee937b5a3b0ab59fb499c1a61` Quality 37934240638 and Server 37934240495 both SUCCESS; stale snoozed link is suppressed.
- `71e051a042d92edac989e62f75f6c15a4e75304d` added AC-09 synthetic public+holdout sibling fixture; Quality 37934434106/Server 37934434147 PASS.
- `bb34b507d3b6e684f1d2e2bd26398ffdbe59109a` added real Chromium IndexedDB-open denial injection and visible no-false-persistence assertion; this **does not** test physical quota exhaustion. Current-code CI above is GREEN.
- AC-02 remains BLOCKED (no authenticated independently verified trusted SYSTEM producer); AC-17 remains BLOCKED (no independent reviewer); AC-18 remains BLOCKED (no per-exact-head merge authorization or merged-main/Pages live evidence). No K4 COMPLETE or K5 status change.

## Task 14 amended operational checkpoint — 2026-10-09

- Source and governance: GitHub main `9e55881e9480b4a02d8ef5d92a0b21a9313492f1`; K3 closed and unmodified, separate K4 state revision 14 / task 14 REVIEW. Product PR #65 DRAFT (not design PR #64), 50 current changed paths, no independent PR review submissions at time of inspection. Approved spec and plan file blobs matched their recorded SHAs.
- **Important findings I2 and I3 resolved by test-driven red/green:** async stale Start after Another, and late old-response receipt falsely marking a replacement question as saved. RED Quality [37940851050](https://github.com/oaabahussain/sdaia-ai-engineer/actions/runs/37940851050) 918 PASS/1 FAIL and [37941162215](https://github.com/oaabahussain/sdaia-ai-engineer/actions/runs/37941162215) 919 PASS/1 FAIL; final code GREEN at `c118edb43c7f8b847f2586ca7e57e321f2b50a2c`: [Quality 37941284560](https://github.com/oaabahussain/sdaia-ai-engineer/actions/runs/37941284560) SUCCESS, 920/920 Node, 76/76 Python, Chromium bilingual+mobile+offline and full-exam, Pages preview and 63 SW assets; [Server 37941284675](https://github.com/oaabahussain/sdaia-ai-engineer/actions/runs/37941284675) SUCCESS. Documentation-only commits after the code require fresh exact-head CI and do not inherit these run IDs.
- **AC-01,03-08,10-12,14-16:** prior named executable unit/browser acceptance gates plus current-code full regression GREEN; no independent reviewer claim. **AC-09:** synthetic fixture only (real holdout inventory unverified). **AC-13:** Chromium storage-denial fault injection, no physical quota proof. **AC-02:** BLOCKED trusted SYSTEM producer; exposure-only runtime retained. **AC-17:** BLOCKED actual independent whole-branch review/approval. **AC-18:** BLOCKED explicit current-full-SHA merge authorization, merged-main CI, live Pages deployment and digest.
- **Release verdict:** NOT_RELEASE_QUALIFIED. Remaining external gate AC-17 is not resolved by same-executor self-audit, and AC-02 producer-backed case is not shown PASS. Do not merge/main-write, claim deployed K4, change K3, or start K5. See chronological ledger and `k4-final-review.md` for limitations and provenance.

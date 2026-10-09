# K4 — Quality and Acceptance Checkpoint

**Status:** INTEGRATION_VERIFICATION_IN_PROGRESS / NOT_MERGED  
**Repository:** oaabahussain/sdaia-ai-engineer  
**Implementation PR:** #65 DRAFT  
**Spec blob:** d732ac22161d4b007a8f869cbc928ec6737a40a8  
**Plan blob:** edda6ef11fb353d7403098d79400fc783e2f21f1  
**Main baseline:** 9e55881e9480b4a02d8ef5d92a0b21a9313492f1  
**Product HEAD verification:** PENDING exact-head CI after this report and browser acceptance test.

Do not interpret a mapped test name as a PASS before its exact-head runner is green. Two-stage reporting: each feature test evidence and the final true GitHub/Pages operational result. The report intentionally includes known gaps. Final release cannot be claimed without explicit exact-head user landing approval.

| Case | Intent | Source of executable evidence | Checkpoint assessment |
| --- | --- | --- | --- |
| AC-01 | Empty replay cold start, zero head | k4-source-reader.test.js, k4-ranking.test.js | TESTED_IN_UNIT |
| AC-02 | Trusted graded SYSTEM fixture, authenticated producer | k4-clock.test.js verifies correct and incorrect due mathematics only; no actual verified SYSTEM producer in browser | BLOCKED_PRODUCER_VERIFICATION |
| AC-03 | Browser response exposure only | k4-practice-session.test.js, k4-projection.test.js, browser_smoke.py | TESTED_IN_UNIT_BROWSER_PENDING |
| AC-04 | No stale/unresolved strict response promotion | K3 strict attempt projection regression, K4 source/ranker | TESTED_IN_UNIT; grading authority deferred |
| AC-05 | VOID, supersession, conflicting corrections | k4-projection.test.js | TESTED_IN_UNIT |
| AC-06 | Duplicate capture and page rerender | k4-practice-session.test.js, k4-projection.test.js | TESTED_IN_UNIT |
| AC-07 | Provisional objectives label only | k4-public-catalog.test.js | TESTED_IN_UNIT |
| AC-08 | Protected/unavailable candidates excluded | k4-public-catalog.test.js, k4-ranking.test.js | TESTED_IN_UNIT |
| AC-09 | Same family with public and holdout versions | Public version-only catalog and release binder | PARTIAL_EXPLICIT_MIXED_VERSION_FIXTURE_PENDING |
| AC-10 | Deterministic selection across locales | k4-ranking.test.js and browser_smoke.py | TESTED_IN_UNIT_BROWSER_PENDING |
| AC-11 | UTC, DST, travel, device clock skew | k4-clock.test.js; future-skew quarantine | TESTED_IN_UNIT; simulated device clock manipulation not separately tested |
| AC-12 | Snooze, skip, reload, offline | k4-preferences.test.js, k4-user-controls.test.js, browser_smoke.py | TESTED_IN_UNIT_BROWSER_PENDING |
| AC-13 | IndexedDB quota and denial, no false persistence | k4-preferences.test.js, k4-user-controls.test.js | TESTED_IN_UNIT; physical quota browser fixture pending |
| AC-14 | One-item non-strict vs unchanged full/section | k4-practice-session.test.js; K3 tests and browser_smoke.py | TESTED_IN_UNIT_BROWSER_PENDING |
| AC-15 | Public bank digest, count, full exam | k4-release-acceptance.test.js, factory-import verifier, browser smoke | TESTED_IN_UNIT_BROWSER_PENDING |
| AC-16 | AR/EN, RTL, keyboard, offline and mobile | browser_smoke.py includes first/second offline visit, language, keyboard focus and 390px viewport | BROWSER_PENDING |
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

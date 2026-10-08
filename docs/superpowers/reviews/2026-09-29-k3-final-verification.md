# K3 Task 39 — Exact-head pre-merge verification

**Date:** 2026-10-08 (Asia/Riyadh)
**Programme:** K3 / Phase H
**Status:** VERIFIED LOCAL PRODUCT TREE; FINAL BRANCH-SHA CI VALIDATION IS A REQUIRED EXTERNAL GATE (do not infer PASS from older CI).
**Baseline live `main`:** `5b7453407def933037c4c254cd0fca5e5f3f1591`.
**Implementation branch:** `impl/k3-tasks37-39-clean-wave`, with Tasks 37–39 prepared on one clean baseline and executed sequentially, no per-task merges to main.
**Product/review change head:** `44e4e647f0faa21a8934199d065464a265bb32b3` (Task 38 final review fix; subsequent code changes prohibited without restarting Task 39).
**Exact locally tested Git HEAD immediately before this documentation-only record:** `1317797887219309c082061540b6a46d3128da30` (Task 38 state/ledger-only checkpoint after reviewed product head).
**Follow-on record commit:** Task 39 verification document is documentation-only. Its exact commit SHA and any subsequent state-checkpoint SHA are recorded in the durable K3 ledger after commit; Git commits cannot embed their own SHA in their blob without changing that SHA.

## Checks and reproducible evidence

- Local preflight: Task 39 `task-start` brief matches Task 039 packet digest; execution envelope valid; `TASK_EXECUTION_READY = PASS []`. Approved spec and plan SHA-1 blob hashes unchanged: `2ccb4c5c1d01b668c14dce6b97608d4eff04d57d`, `ac158561be17aa8424a71b53d5447ae4a2d375c7`.
- The Task 39 missing-review-record RED was observed and accepted before creating this file. No product JS, Python, API, schema, test, workflow, question content, or service worker modification was made after the reviewed Task 38 head.
- `npm run validate`: PASS, 1,120 current questions; 7 domains each 160; official project allocation for the current 200-question profile remains `36/35/33/29/28/25/14`.
- `npm test`: PASS, **842 / 842**, zero failures.
- `npm run verify:sw`: PASS, 50 shell assets, one manifest and one evidence runtime context.
- `npm run process:verify`: PASS, 37 deterministic K3 packets, **75 / 75** process tests, **15 / 15** adversarial-readiness cases.
- `PYTHONPATH=server python3 -m pytest server/tests -q`: **117 / 117** PASS in the isolated Python environment.
- `node scripts/build_pages_artifact.js _site`, application parse, HTML verifier, SW verifier, local HTTP server, and `node scripts/verify_live_release.js http://127.0.0.1:4174`: all PASS. Local release verifier observed runtime evidence context, 7-domain current content and service-worker contract.
- **Independently recomputed** legacy projection of all current bilingual rendered question payloads using `expandConceptBank`, the exact frozen legacy field ordering and SHA-256: `5e48b1e47450f1150c9c8f21386f3a4e31070a3d444f968d10f45ccb9ff418a9`. This matches the protected K3 runtime evidence context and K1/K2 acceptance fixtures.
- GitHub PR #62 on reviewed product head `44e4e647f0faa21a8934199d065464a265bb32b3`: `Pull request quality gate` run `37753033829` **SUCCESS**, and `Server and adapter contract tests` run `37753033797` **SUCCESS**. Read the GitHub job steps: dependency install (`npm ci --ignore-scripts`), Node, Python, deterministic process, state validation, page artifact build/served live-release verifier, and **browser smoke** each succeeded in hosted Actions on that exact reviewed product head.

## Environment boundary — no false green result

The local shell does not have outbound package registry/DNS access; the recovered exact-main Node dependencies and a Python wheelhouse were used for local reproducible tests. There is **no local `npm ci --ignore-scripts` success claim**; hosted GitHub PR quality gate ran that exact command successfully on reviewed Product head and must run again on the final documentation/checkpoint head. Local ChromeDriver 144 was obtained from the official Chrome for Testing artifact; Chromium is blocked from navigating to `127.0.0.1` by sandbox organization policy, so the local `scripts/browser_smoke.py` command **failed due to that environment policy**. The hosted PR Quality `Browser smoke test` step passed on reviewed product head; the final exact-branch-head run is still mandatory. No test assertion, browser timeout or app code was weakened to bypass this external limitation.

## Acceptance, review and next gates

- Task 37 documentation RED→GREEN and full regression accepted; Task 38 review fixed two Important findings (early Phase H sequencing guard and OpenAPI source-store cursor mismatch), leaving **0 open Critical and 0 open Important**, subject to fresh exact-head CI.
- This record proves local pre-merge code/artifact tests and the published CI on reviewed Product head. **Task 39 is not considered finally qualified until all configured checks are SUCCESS on the exact final branch SHA.** Obtain those results without changing product files; if final CI fails, stop and restart the affected task. Do not quietly substitute previous run #37753033829 for a different SHA.
- Task 40 must confirm source/base diff, review and exact final SHA before the user-authorized protected PR landing action. Task 41 must verify the merged main and the deployed live Pages/bilingual/offline/evidence release; production authenticated cross-device sync is **not** claimed where no production backend is deployed. K4 must not start.

## Late independent PR review and exact-SHA CI addendum — 2026-10-08

PR #62 automated Codex review discovered two actionable issues after Task39 local checkpoint: P1, durable ledger/state must not imply final CI PASS before final SHA checks are recorded; P2, the Task36 finalization acceptance test must reject provisional/negative proof. P2 was reproduced RED with `Task 39: complete=false`, then a strict anchored positive-proof pattern was implemented and a separate regression added; the corrected test did not accept Task39 until a real final-head CI PASS ledger entry was added.

GitHub Actions on exact final pre-review head `82b1bfd93c9ba6e3a117f01f1a5bdd1050ed53ed` (tree `58fef098976f46096666f99d32851d2e913866f9`): `Pull request quality gate` run `37755198624` SUCCESS including hosted browser; `Server and adapter contract tests` run `37755198643` SUCCESS. These are recorded as actual PR checks and are not projected to the later reviewer-remediation head.

**New head gate:** a reviewer-remediation commit after this addendum invalidates previous SHA-level CI for Task40, even when earlier requirements were GREEN. Rerun all configured GitHub checks on the exact final reviewer-remediation commit, verify no open Critical/Important issues and review-thread resolutions, and compare its tree to the exact integration tree before requesting a protected merge. Task41 closure is reserved for post-merge verified `main`.

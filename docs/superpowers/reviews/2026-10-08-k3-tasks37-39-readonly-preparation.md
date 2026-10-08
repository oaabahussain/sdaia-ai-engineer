# K3 Tasks 37–39 — Read-only preparation and fail-closed handoff

**Date:** 2026-10-08 (Asia/Riyadh)
**Status:** PREPARED_READ_ONLY / TASK_EXECUTION_NOT_AUTHORIZED
**Source:** Live GitHub refs and approved K3 spec/plan/state, not chat memory.
**Repository:** `oaabahussain/sdaia-ai-engineer`
**Main and preparation baseline:** `5b7453407def933037c4c254cd0fca5e5f3f1591`
**Clean execution branch:** `impl/k3-tasks37-39-clean-wave` (created from exact main; zero commits ahead/behind at preparation time).
**This branch:** `wave/k3-tasks37-39-readonly-prep-2026-10-08` (preparation-only, do not cherry-pick into product branch as implementation).
**Merge policy:** no standalone 37/38/39 main merges; one review/integration gate at Task 40 only after Task 39 final-head proof; Task 41 after exact merged-main checks. No K4.

## Verified GitHub authority

- `docs/superpowers/state/CURRENT-STATE.json`: revision 69, K3/H/PHASE_GATE, completed through 36, next 37, 0 Critical and 0 Important findings; `base_main_sha=null`, `ACTIVE_REF_RESOLUTION_VALID=PENDING`, `low_model_ready=false`. This is NOT an execution-ready state.
- Approved spec blob: `2ccb4c5c1d01b668c14dce6b97608d4eff04d57d`.
- Approved plan blob: `ac158561be17aa8424a71b53d5447ae4a2d375c7`.
- Latest checkpoint: `docs/superpowers/reviews/2026-10-07-k3-tasks34-36-post-merge-verification.md`. Tasks 34–36 verified and merged; Tasks 37–41 NOT completed.
- Task packets 037–041 read at this baseline. Official `task-start` brief, runtime envelope, bound state and preflight have NOT been produced/validated for Task 37.
- Historical exact-main GitHub Actions (NOT verification of future Tasks 37–39): Server/adapter `#2112` SUCCESS, Pages `#55` SUCCESS, both on `5b7453407def933037c4c254cd0fca5e5f3f1591`.

## Environment blocker and stop boundary

This execution container contains the user handoff but NO Git checkout. `git ls-remote https://github.com/oaabahussain/sdaia-ai-engineer.git refs/heads/main` failed with `Could not resolve host: github.com`; a ZIP download was not available in this runtime. Node 22 and Python/pytest binaries alone do not satisfy the repository's execution-contract gates. A GitHub connector can read/write refs and files, but it cannot execute the repository's required local `task-start`, TDD, preflight or full regression commands.

**No Product or packet/process file has been modified; no Task 37 RED, GREEN, scope/result validator or Task 39 exact-head tests have run.** Do not mark any future gate PASS. Do not mutate Task 37 docs/test/packet from GitHub API alone. Keep `CURRENT-STATE` in its truthful pending state until a real checkout is available.

## Wave-level preparation, shared clean baseline

- Task 37 produces documentation evidence and a checkpoint; Task 38 consumes the accepted Task 37 head for whole-plan review; Task 39 consumes the accepted reviewed Task 38 Product head for exact-head freeze. These dependencies are SEQUENTIAL for execution even though their preparation is grouped.
- Task 37 collision verified: `tests/documentation-contract.test.js` already exists on main (blob `cc65f661292ad31bcd6443e300a48ce6a0457f2d`). Generated Task 037 packet wrongly lists it under `scope.allowed_create`; the approved plan's "Add/adjust documentation-contract tests" allows modification.
- **Ruling (scope, pre-implementation):** classify that existing test file as `allowed_modify`, NOT `allowed_create`, narrowly and deterministically. In `scripts/process/compile_k3_task_packets.js`, follow the existing Task 31/35 established-file correction pattern for task 37; regenerate ONLY the derived packet(s) as compiler dictates; add TDD coverage to the process compiler/packet tests; prove deterministic `--check`, packet schema and process suite. Preserve spec/plan hashes and source digest. Record the corrected ruling in the durable execution ledger/checkpoint on the verified worktree. No global scope exemptions or force flags.
- Task 37 documentation audit: `HANDOFF.md` still calls K3 `K3_DESIGN` and `NOT STARTED`; `docs/superpowers/reviews/2026-09-27-platform-programme-tracker.md` also says K3 design/spec/plan/implementation NOT STARTED. Both are stale as CURRENT guidance and must be corrected by actual evidence, while distinguishing retained historical checkpoints. `DATA-MODEL.md` and `ARCHITECTURE.md` need K3 current-contract coverage; `api/openapi.yaml` already contains authorized evidence endpoints and must not lose their existing access boundary.
- Task 37 RED test in EXISTING `tests/documentation-contract.test.js`: add precise assertions anchored to real K3 code/schema for LearnerEvidenceEventV2, store/append ID/fingerprint/strict revision, fail-closed optional sync, offline/outbox, raw-vs-derived plane separation, privacy/correction, legacy/replay, versioned xAPI/Caliper adapters, public release, and K4+ exclusion. Run `node --test tests/documentation-contract.test.js`, inspect intended behavioral RED; update docs only afterwards; rerun focused GREEN plus `npm test` and process gates.
- Task 38: produce `docs/superpowers/reviews/2026-09-29-k3-whole-plan-review.md` after Task 37 acceptance. Examine approved spec/plan Tasks 1–37, all 25 acceptance criteria, exact changed-file scope, security, rev/identity, import bindings, privacy/replay, offline, release. Classify Critical/Important/Minor. A finding requiring a Product fix cannot be silently slipped past packet 038's review-file-only scope; explicitly rule and narrowly regenerate/validate before implementing it with TDD. Independent review only if actually available; otherwise label SELF_REVIEW and its limitation.
- Task 39: after zero open Critical/Important findings, freeze exact tested Product head, run `npm ci --ignore-scripts`, `npm run validate`, `npm test`, `npm run verify:sw`, `PYTHONPATH=server python3 -m pytest server/tests -q`, `python3 scripts/browser_smoke.py`; build/serve Pages artifact exactly as CI, run `scripts/verify_live_release.js`, and check learner payload digest `5e48b1e47450f1150c9c8f21386f3a4e31070a3d444f968d10f45ccb9ff418a9`. Record Product head and doc-only verification head separately; require CI checks on FINAL branch SHA after pushing.
- Only after Task 39 verified: Task 40 reviewed exact-head PR integration with per-PR current-SHA landing consent where required by PR completion workflow; Task 41 exact-merged-main Node/server/Pages/live/RTL/offline/evidence verification and truthful optional sync boundary. K3 COMPLETE only then.

## Resume sequence with a checkout/runner

1. Resolve LIVE `main` anew; inspect both preparation and clean implementation refs. Never blindly rebase/reset or copy Product history from prior waves.
2. Checkout or worktree from exact live main, on dedicated `impl/k3-...` branch; bind the validated CURRENT-STATE to exact `base_main_sha` and execution ref through approved process.
3. Run official Superpowers `task-start` for Task 37; compare authoritative brief digest with packet. Record actual runtime capability profile and bind task execution envelope; run `scripts/process/preflight_task.js` with all required inputs. **Only `TASK_EXECUTION_READY = PASS` authorizes Product edits.**
4. Prepare shared RED/fixtures/rulings for 37–39 as approved; correct the Task 37 compiler/packet scope with TDD and process verification; execute 37 → 38 → 39 with task-start/RED/accepted RED/GREEN/regression/scope/result/task-done/ledger each time.
5. If any gate or CI fails, stop that path; use `systematic-debugging`, never weaken assertions/increase timeouts/bypass guards.
6. Then Task 40 (reviewed integration) and Task 41 (postmerge closure) only on fresh exact-SHA evidence.

**Not completed:** Task 37 implementation, Task 38 review, Task 39 freeze, Task 40 merge, Task 41 K3 closure. No K4 work started.

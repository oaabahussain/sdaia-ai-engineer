# K3 Supplemental Preflight Reconciliation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Keep task-by-task test evidence and durable checkpoints.

**Goal:** Close the two reproduced supplemental readiness gaps without replacing the newer remote repair; then resume the canonical K3 task only through a fresh preflight.
**Architecture:** Reuse the existing runtime schema validator and derive checkout HEAD/branch through Git in the CLI. Preserve actual-file lint/hash/compiler checks, all existing assertions, and the approved product plan and packets.
**Tech Stack:** Existing Node ESM, node:test, Git, existing Python server environment. No dependency upgrade.
**Spec:** `docs/superpowers/specs/2026-09-30-k3-low-model-execution-h0-r2-design.md`, sections 5.3, 7.3, 9 and runtime capability contracts; `RECOVERY-PROTOCOL.md`.

## Global Constraints

- Isolated linked worktree; preserve live main and existing execution-branch history.
- No production privacy deletion, main merge, forced push, or low-model recertification.
- Preserve canonical K3 spec/plan/packets byte-for-byte.
- Source docs/reports are historical; no saved envelope is portable authorization.

## Review Focus

1. Old but syntactically valid task_base_sha must not authorize the current checkout.
2. Missing/invalid runtime profile cannot pass via an empty runtime requirements array.
3. Branch identity must come from checkout, not envelope assertions.
4. Valid fresh CLI execution must still pass; every old negative assertion remains active.
5. Missing Git context or missing runtime fields must fail closed without modifying files.

### Task 1: Reconcile verified checkout and runtime evidence

**Files:** Modify `scripts/process/preflight_task.js`, `tests/h0-r2-preflight-cli.test.js`, `tests/h0-r2-preflight.test.js`.
**Interfaces:** `preflightTask(x)` additionally requires `currentHeadSha` and `sourceRef`; CLI derives both with argument-array Git calls. Reuse `validateRuntimeCapabilityProfile(profile)`. Preserve CLI flags and existing output codes.

- [ ] Extend old CLI fixture with real temporary Git initialization, an empty commit, and HEAD-bound envelope; preserve all seven original tests and assertions.
- [ ] Add tests rejecting changed task base, advanced checkout HEAD, wrong branch, missing Git context, empty/null runtime, and unknown runtime capability status. Missing verified HEAD/ref in callable API must also reject. Assert specific gate codes or CLI FAIL, with no import/setup failures counted as behavioral RED.
- [ ] Run `node --test tests/h0-r2-preflight-cli.test.js tests/h0-r2-preflight.test.js`. Expected: existing cases pass and added rejection assertions FAIL before the fix.
- [ ] In preflight, require a valid runtime schema as well as required capabilities, exact HEAD equality, and exact observed branch equality. Populate these values in the CLI with `execFileSync('git', ['rev-parse', ...])`; never use shell interpolation.
- [ ] Repeat focused tests, `npm test`, `npm run process:verify`, and `PYTHONPATH=server python3 -m pytest -q server/tests`. Expected: zero failures; retain the known Python warning separately.
- [ ] Commit the tests and fix in separate RED/GREEN commits, then complete with task-done.

### Task 2: Persist reconciled readiness and resume boundary

**Files:** New reconciliation checkpoint; update `docs/superpowers/state/CURRENT-STATE.json`. Dynamic evidence remains outside static bootstrap.
**Interfaces:** Existing state validator, installed task-start logic, canonical packet 025, new runtime profile and binder, repaired preflight CLI.

- [ ] Confirm canonical completed task remains 24, next remains 25, and live base has not drifted.
- [ ] Persist the repair review and increment state revision without changing canonical plan or task completion.
- [ ] Extract Task 25 with installed task-start logic and require exact brief/packet digest equality.
- [ ] Bind actual durable HEAD/branch and observed runtime; run repaired CLI. Expected: PASS; new runtime must rebind.
- [ ] Publish only non-force descendant commits on the execution branch after re-reading live refs; do not merge main.
- [ ] Continue Task 25 through the original approved plan if all gates pass. No destructive live operation is authorized.

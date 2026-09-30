# H0-R2 Execution Amendment A1 — High-Reasoning GitHub Lane

**Date:** 2026-09-30  
**Applies to:** H0-R2 implementation Tasks 3-24 only  
**Status:** APPROVED BY USER DIRECTION TO ACCELERATE HIGH-REASONING EXECUTION  
**Does not change:** K3 product semantics, K3 Task 5, low-model readiness requirements, Superpowers proof requirements.

## Reason

The active ChatGPT runtime does not expose the Superpowers plugin, and the container cannot resolve github.com for native git/worktree use.

Observed evidence:
- Superpowers skills absent from the active Skills catalog.
- local git probe failed with `Could not resolve host: github.com`.

The original Task 3 therefore cannot prove `ISOLATED_WORKSPACE_READY`.

## Ruling

H0-R2 control-plane implementation may continue in a **HIGH_REASONING_GITHUB_LANE** using the GitHub connector, provided all of the following remain true:

1. work occurs only on `impl/k3-low-model-execution-h0-r2`;
2. branch was created from exact integrated main;
3. every behavior-changing task still records task BASE SHA, RED evidence, GREEN evidence, affected regression, and task result/commit;
4. no direct push/merge to main;
5. no claim that Superpowers/worktree/SDD ran;
6. `ISOLATED_WORKSPACE_READY` remains FAIL;
7. `low_model_ready` remains false;
8. Task 25/30 still require real Superpowers/worktree/SDD proof before lower-model execution;
9. any product-semantic ambiguity still stops with `PLAN_DECISION_REQUIRED`;
10. exact-head PR review and post-merge verification remain mandatory.

## Acceleration policy

High-reasoning batching may group multiple tasks in one session, but not merge their proof:

- each task gets its own BASE;
- each TDD task gets its own RED then GREEN evidence;
- each task gets its own commit boundary;
- a failed gate stops the batch at that task;
- batch size may be 5-10 tasks when tasks are independent and CI evidence remains attributable.

## Task 3 disposition

Task 3 is split operationally:

- **Task 3A — H0-R2 implementation isolation:** PASS when the dedicated GitHub branch and durable ledger exist and point to exact integrated main.
- **Task 3B — Superpowers isolated-workspace proof:** DEFERRED/BLOCKED until the runtime exposes Superpowers and a real worktree/SDD workspace can be demonstrated.

Task 3B remains a hard prerequisite for `low_model_ready=true`; it is not a prerequisite for high-reasoning H0-R2 control-plane implementation.

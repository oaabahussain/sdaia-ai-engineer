# K3 Readiness Ruling — Project Gate Before Execution Envelope

**Date:** 2026-10-02  
**Scope:** H0-R2 readiness only; no K3 Task 5 product implementation.

## Finding

The supplemental Final-10 plan orders Final Task 4 to bind the Task 5 execution envelope before Final Tasks 5-6 publish and verify the Project bootstrap.

The integrated H0-R2 binder and approved H0-R2 design require a verified non-null Project bootstrap revision before an execution envelope can be valid:

- the binder returns `PROJECT_BOOTSTRAP_STALE` when `PROJECT_BOOTSTRAP_CURRENT != PASS` or `project_bootstrap_revision` is absent;
- the approved design states that the binder consumes the verified Project bootstrap revision;
- the approved integration sequence places Project bootstrap production/verification before Task 5 dry-run/readiness certification.

## Ruling

Treat Final Task 4 as two mechanical substeps without changing product semantics:

1. **4A — Runtime/workspace proof:** prove Superpowers/worktree, run official Task 5 `task-start`, capture BASE/runtime profile, and prove the Task 5 brief digest matches packet 005.
2. **Final Tasks 5-6 — Bootstrap:** publish static `k3-h0-r2-v1`, then verify that exact revision in the active ChatGPT Project.
3. **4B — Envelope bind:** only after `PROJECT_BOOTSTRAP_CURRENT=PASS`, bind the Task 5 execution envelope.
4. Continue Final Tasks 7-9.

This resolves ordering only. It does not alter the approved K3 spec, product plan, packet semantics, merge authority, or any product file.

## Runtime persistence note

A local worktree/runtime proof is not durable across harness/container replacement. Readiness certification must re-observe the worktree/runtime in the active certification runtime. Prior evidence may guide recovery but cannot substitute for a fresh capability claim.

## Cost if wrong

If this ruling is wrong, the only cost is reordering readiness-control steps before product execution. No product behavior or data is changed.

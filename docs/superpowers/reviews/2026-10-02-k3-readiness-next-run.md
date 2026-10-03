# K3 Readiness — Exact Next Run

**Date:** 2026-10-02  
**Repository:** `oaabahussain/sdaia-ai-engineer`  
**Execution branch:** `impl/k3-learner-evidence-engine`

## Current external blocker

The repository bootstrap revision `k3-h0-r2-v1` exists on the execution branch, but the active ChatGPT Project must contain the unpacked bootstrap files themselves. A ZIP attachment does not satisfy `PROJECT_BOOTSTRAP_CURRENT`.

Expected Project bootstrap files:

- `BOOTSTRAP-REVISION`
- `PROJECT-INDEX.md`
- `RECOVERY-PROTOCOL.md`
- `DURABLE-FILE-MAP.md`
- `README.md`

The revision marker must read exactly:

`k3-h0-r2-v1`

Legacy K1/K2 bootstrap files must not remain authoritative.

## Immediately after Project verification

Run these readiness steps continuously, with no K3 Task 5 product writes:

1. Resolve live `main`.
2. Re-prove active isolated worktree/runtime capability in the current runtime.
3. Run official Superpowers `task-start` for K3 Task 5.
4. Verify actual Task 5 brief SHA-256 equals packet 005 `task_source_digest`.
5. Update runtime capability profile from observations only.
6. Set/verify state base/ref gates from fresh evidence.
7. Bind the Task 5 execution envelope now that Project revision is verified.
8. Run Task 5 no-write dry-run.
9. Run all 15 live adversarial readiness cases.
10. Update readiness state only from evidence.
11. Run final state validation, `process:verify`, and `npm test`.
12. Authorize the low/no-thinking model only when final machine output proves:
   - `ok=true`
   - `low_model_ready=true`
   - `next_task=5`

## Low-model queue after certification

The prepared execution wave is Tasks 5-24 inclusive (20 tasks), defined in:

`docs/superpowers/plans/2026-10-01-k3-low-model-wave1-tasks-5-24.md`

Use the matching task packets under `docs/superpowers/task-packets/k3/`. Execute sequentially with exact RED -> intended RED validation -> Accepted RED freeze -> minimal GREEN -> regression -> scope/result validation -> durable checkpoint.

The low/no-thinking executor has no merge authority.

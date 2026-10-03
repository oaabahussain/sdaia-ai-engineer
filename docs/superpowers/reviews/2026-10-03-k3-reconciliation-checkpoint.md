# K3 Supplemental Reconciliation Checkpoint

## Source and scope

Source execution HEAD: 68acf1d5b25957b3037e5f5859ffd044f7c96928.
Resolved main: dbf718f65396388efa234e459155e0e4d3fc8b6d.
The supplied readiness bundle matched this live source exactly (tree 820051114d677fbd1382e5d08bf520f8d9494c46); archive-member checksums and complete Git fsck passed. Work occurred in a real linked worktree. The supplemental bundle was compared, not blindly applied. All previous tests, state history and prior repair were retained.

## Reconciled findings

STALE_TASK_BASE_ACCEPTED and INVALID_RUNTIME_PROFILE_ACCEPTED were reproduced against the actual complete execution checkout. Nine new behavioral rejection cases failed before the fix; nine existing focused cases passed. The added cases cover stale base, advanced HEAD, wrong checkout branch, absent Git checkout, empty/null/partial runtime, unknown capability status, and missing verified caller checkout facts.

The CLI now derives HEAD and branch with argument-array Git calls. preflightTask requires exact observed checkout identity and validates the complete existing runtime schema before capability checks. No source authority, packet, schema, product behavior, dependency, or question data was altered. The original seven CLI tests and two preflight tests remain active; the CLI fixture now uses an actual temporary Git checkout.

## Observed verification

- Baseline: Node 593/593; Python 50/50.
- RED: 9 failures / 18 focused tests, each an expected assertion failure.
- GREEN: 18/18 focused tests.
- Full Node: 602/602, zero failed/skipped/cancelled.
- Python: 50/50, one inherited AnyIO/Starlette deprecation warning.
- Process: 72/72 (included in Node); deterministic packet regeneration and lint PASS.
- Predefined adversarial predicates: 15/15 blocked; not a penetration-test certification.
- Whitespace/diff validation: PASS.

Final review: separate self-review (no subagent tool). No independent review is claimed. Review checked valid CLI paths, all new negative cases, retained compiler/lint/hash checks, and that scope stays process-only.

## Rulings and residual boundaries

Ruling: preserve and extend the newer remote repair, rather than cherry-picking the supplemental baseline patch. Cost if wrong: a later source drift requires another reconciliation, not an overwrite.

Ruling: materialize installed task-script logic locally with formatting/comment adaptation because resource-backed plugin scripts are not executable filesystem mounts. Exact task brief hash remains mandatory. Cost if wrong: extraction digest mismatch blocks product work.

Ruling: caller-provided external live-main SHA remains an explicit orchestrator observation; CLI now independently checks local HEAD/branch but does not invent network authority. Refresh live refs before publication and task binding. Cost if wrong: a stale external observation cannot establish current remote freshness.

Deferred minor: legacy compressed preflight formatting remains. Known inherited debt: prior same-day npm audit reported 22 development findings (11 high, 10 moderate, 1 low), production-only npm 0. No fresh registry audit or automatic dependency upgrade occurred. JSONL sidecar reconstruction remains unavailable.

## Resume boundary

State revision 29. Tasks 1-24 complete; Task 25 not started at this checkpoint. low_model_ready=false. Run installed task-start for the task selected by state, require exact canonical packet digest, observe runtime, bind the actual current HEAD/branch, and run preflight. No previous envelope is portable. No merge or production privacy operation was authorized or performed.

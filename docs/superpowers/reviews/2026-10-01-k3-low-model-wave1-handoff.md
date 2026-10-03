# Handoff — K3 Low-Model Wave 1 (Tasks 5–24)

**Use this handoff only after K3 Final Readiness Task 9 has certified the low-model gate.**

Repository: `oaabahussain/sdaia-ai-engineer`  
Execution branch: `impl/k3-learner-evidence-engine`  
Prepared task range: **5–24 (20 tasks)**  
Planning manifest: `docs/superpowers/plans/2026-10-01-k3-low-model-wave1-tasks-5-24.md`

## Mandatory startup

1. Use `superpowers:using-superpowers`.
2. Use `using-git-worktrees`.
3. Use `executing-plans`.
4. Load `test-driven-development`.
5. Use `systematic-debugging` on any unexpected failure.
6. Use `verification-before-completion` before any completion claim.
7. Resolve live `main`; do not trust a pasted SHA.
8. Read live `docs/superpowers/state/CURRENT-STATE.json`.
9. Confirm:
   - `ok=true`
   - `low_model_ready=true`
   - `next_task=5`
   - no open Critical/Important findings
   - Project bootstrap current
   - isolated worktree ready
   - active ref resolution valid
   - execution branch base equals live main
10. If any readiness item fails: STOP. Do not implement.

## Execution mode

Execute Tasks **5 through 24 sequentially**. Do not redesign, brainstorm, widen scope, or choose alternative architecture.

For Task N:

1. Run official Superpowers `task-start` for Task N.
2. Load `docs/superpowers/task-packets/k3/task-NNN.json`.
3. Validate the packet against the real task brief and current envelope.
4. Touch only packet-allowed paths.
5. Run the packet's exact RED command.
6. RED is valid only for `EXPECTED_TASK_BEHAVIOR_MISSING`; import/setup/environment failure is not acceptable RED.
7. Implement the minimum behavior described by the packet.
8. Run exact GREEN.
9. Run exact regression.
10. Persist test evidence, ledger, checkpoint, and state.
11. Commit using the packet's exact commit message.
12. Verify the checkpoint and state now advance to N+1.
13. Continue automatically to the next task.

Do not pause for routine confirmation between tasks.

## Recovery rule

If interrupted, restart from the live state/checkpoint. Never reconstruct progress from chat memory.

If state says a task is `IMPLEMENTED_NOT_CHECKPOINTED`, verify the exact branch/files/tests first and finish the checkpoint; do not blindly reimplement.

## Absolute prohibitions

- No direct push or merge to `main`.
- No force reset.
- No skipping RED.
- No accepting import/setup/environment failure as RED.
- No changing accepted RED tests outside the approved H0-R2 freeze process.
- No unlisted files.
- No architecture invention.
- No hidden fallback.
- No weakening authorization or fail-closed behavior.
- No implementation of Task 25+.
- No claim of independent review unless an actual independent reviewer ran.
- No success claim without fresh exact tests.

## Durable wave checkpoints

- after Task 5
- after Task 9
- after Task 13
- after Task 17
- after Task 22
- after Task 24

These are recovery boundaries only; they do not grant merge authority.

## Finish condition

At Task 24 completion:

1. all Tasks 5–24 are durably checkpointed;
2. all exact task tests and regressions are green;
3. no Critical/Important findings remain;
4. branch is not merged;
5. produce a high-reasoning review handoff with exact HEAD, state, test evidence, and changed-file summary.

Then STOP for the high-reasoning merge/review gate.

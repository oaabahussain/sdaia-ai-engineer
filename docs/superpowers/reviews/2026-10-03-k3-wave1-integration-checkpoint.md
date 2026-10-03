# K3 Wave 1 Integration Checkpoint

## Authorization and scope

The user explicitly authorized merging Wave 1, post-merge verification, and continuation after Task 24 on 2026-10-03. PR #26 remains the integration vehicle. No Task 25 product implementation was included in this integration candidate.

## Authenticated workspace recovery

- Source commit: `dd3ece1cc6434b43b495dd97ca904748b4bc5393`.
- Source tree: `57fc7308235144246ea3f7222a2bf7ef11a700d5`.
- Live base verified before candidate preparation: `559e46a21cd1fe4006158f9ae14f96400a4568f2`.
- Diagnostic PR #27 is NOT to be merged; it only transports read-only audit evidence and an authenticated Git bundle.
- Recovery workflow: `37124757049`; artifact: `11273654683`.
- Artifact SHA-256: `5e22f06e1f06411fdb0a3c38896e0c553066cf74c5a647b86ef97219b9578cb7`.
- Artifact digest and every bundled-file checksum verified locally; `git bundle verify` confirms complete history.
- A real linked worktree was created with distinct Git worktree directory and common object directory. No synthesized repository history was used.

## Integration corrective finding

The prior review characterized JSONL interrupted sidecar publication as fail-closed. Direct testing found a missing exception: nonempty immutable event bytes with a missing or empty index returned an empty view, because the length mismatch guard excluded empty indexes.

Two regression cases reproduced this (missing and empty sidecar). Both failed before the fix with `Missing expected rejection`. The guard now rejects every event/index length mismatch. Read, lookup, and accept all stop without changing immutable event bytes.

- RED log SHA-256: `ef69157325166e4ab767661bae494ef412dea7caa513dd00053ac93abeedaec5`.
- Focused GREEN: 7 tests passed, 0 failed.
- Full Node regression: 586 tests passed, 0 failed.
- Full server regression: 50 tests passed, 0 failed; one existing Starlette/AnyIO deprecation warning.
- Process verification: PASS, including 15/15 adversarial cases blocked.
- Diff whitespace validation: PASS.

Automatic sidecar reconstruction remains unavailable. A damaged sidecar stops reads/writes and requires reconstruction; the fix does not claim crash-atomic publication or automatic repair.

## Dependency audit, not a security-clean claim

Lockfile audit of the candidate and live main both reported exactly 22 findings: 11 high, 10 moderate, 1 low, 0 critical. The production-only npm dependency audit reported 0 findings. The candidate adds no advisory relative to main. The vulnerable development-tool dependency graph is not copied into the static Pages deployment, but remains developer/build-tool technical debt and must not be described as security-clean. No automatic major-version update or forced audit fix was applied during integration.

## Main/branch state transition

Integration publishes a non-executable main snapshot: `base_main_sha=null`, `low_model_ready=false`, `status=INTEGRATION`, with ref resolution pending. This avoids falsely claiming that main remains based on the pre-merge main SHA. After the actual merge, resolve the new main, fast-forward the execution branch without force only when there are no unique commits, then bind Task 25 to the new base and a fresh runtime envelope.

## Remaining boundary

Task 24 is complete. Task 25 is the next canonical task, not implemented here. Post-merge tests and the new Task 25 preflight must pass before continuation. Review in this environment is self-review, not an independent reviewer approval.


## Integration authorization and correction - 2026-10-03

Integration: Ruling: the user now explicitly authorizes merge and continuation after Wave 1. The old Wave 1 stop is historical; Task 25 still requires new live-base/runtime/preflight evidence before any product edit.

Integration: fixed an Important empty/missing JSONL sidecar exception to the earlier fail-closed claim. Two cases RED with missing rejection; guard fix GREEN 7/7, full Node 586/586, server 50/50. Immutable event bytes remain untouched. Automatic reconstruction is not claimed.

Integration: Ruling: publish main with null execution base and low_model_ready=false, then bind the execution branch to the actual merge SHA. A pre-merge base is not valid current main evidence after merge. Cost if wrong: execution remains blocked rather than silently accepting a stale base.

Integration: dependency audit candidate/main each 22 existing development findings (11 high, 10 moderate, 1 low), production-only 0. No new advisory introduced; not a security-clean declaration. Track development-tool remediation separately.

# B2 Track Registry — Durable Checkpoint

**Date:** 2026-09-27
**Branch:** `design/b2-b3-forward-plans`
**PR:** #10 (draft)
**Merge base:** `main@f25c8b9b64c367130e36a2251b2e2b727c1dc0e4`
**Current stage:** implementation through Task 25; verification/fix loop active

## Implemented
Tasks 1–25 are represented in branch code/tests, including registry schema/data, tooling/runtime resolver, neutral selection persistence, explicit browser/API bank selection, registry-driven server default, app/feedback integration, multi-track state initialization/isolation, browser stale-ID fallback smoke, offline registry assets/verifier, registry-driven live release/CI/Pages, synthetic fixture exclusion and leakage regression.

## TDD/debug evidence
- Initial B2 RED: quality-gate run 130 failed four intended boundary tests.
- Registry strictness RED→GREEN: runs 134→135.
- Runtime tooling loader RED observed run 138 before export implementation.
- Integration run 160 exposed stale B1/test consumers of ACTIVE_TRACK_ID; root cause traced and compatibility tests migrated to registry default.
- Run 169 reduced remaining Node failures to three: stale B1 regex, missing v2 selected-track initialization, and test-local localStorage descriptor contamination. Each root cause was isolated; fixes committed. Current fresh runs: quality 171 / server 507.

## Rulings
- Local worktree unavailable because container DNS cannot resolve github.com; branch + CI + tracked ledger/checkpoint are authoritative.
- StateV2 schema/version remains unchanged; selection preference is outside StateV2.
- When a valid StateV2 lacks the newly selected track, migration/runtime initialization adds only that track entry and preserves all existing track state.
- Synthetic fixture remains under tests/fixtures and is never added to production registry or artifact copy inputs.

## Known status
No completion claim yet. Fresh CI for `f38bf336` is queued/running. Task 26 begins only after both workflows are green; otherwise systematic-debugging continues.

## Next exact task
Inspect quality-gate run 171 and server/adapter run 507. Fix any remaining failures by root cause. Then Task 26 whole-suite evidence → Task 27 whole-branch review → Task 28 finishing/integration gate.

**Resume safety:** safe; nothing merged; do not redo earlier RED evidence.

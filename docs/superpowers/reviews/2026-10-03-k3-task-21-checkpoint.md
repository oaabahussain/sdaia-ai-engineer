# K3 Task 21 Checkpoint

**Date:** 2026-10-03
**Task:** 21 — AttemptProjectionV1

## TDD evidence
- BASE: `3e799e61ec2fb9c571b30fd03c229155b57aa186`
- RED: `2513afd7a70978bff2a25ea35ff02044f7985da6`
  - 3 expected behavioral failures: `projectAttempt` absent
- GREEN: `3a22883e738f052526a2b57b9c2d123d3637cd71`
  - quality run `37120307064` — SUCCESS
  - server run `37120307023` — SUCCESS

## Verified behavior
- latest APPLIED revision selects current response
- STALE branches remain explicit history and cannot win
- evaluation/regrade references remain attached
- unanswered-at-submit is derived from the frozen form snapshot
- VOID removes current response without deleting history
- SUPERSEDE can replace current view while retaining original history reference

## Next
Task 22. No merge authority.

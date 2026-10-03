# K3 Task 20 Checkpoint

**Date:** 2026-10-03
**Task:** 20 — ActivityProjectionV1

## TDD evidence
- BASE: `ffa7546a905e1d4a2d69078d6727da035f5d063e`
- RED: `71d852cbfa94d34bbb15b29541d2e27af3e6dfda`
  - expected behavioral failures: `projectActivity` absent
- GREEN: `964f0d3728f73596217813eef6707afc42435f9b`
  - quality run `37120084248` — SUCCESS
  - server run `37120084287` — SUCCESS

## Verified behavior
- deterministic ActivityProjectionV1
- start/completion and item interaction evidence summarized
- late evidence included by store sequence, not client timestamp
- correction resolver applied before projection
- unresolved corrections mark projection incomplete
- no mastery/readiness/abandonment fields emitted

## Next
Task 21. No merge authority.

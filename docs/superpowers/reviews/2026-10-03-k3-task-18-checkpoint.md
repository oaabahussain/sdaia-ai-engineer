# K3 Task 18 Checkpoint

**Date:** 2026-10-03
**Task:** 18 — Strict-assessment optimistic revision resolver

## TDD evidence
- BASE: `77bd6a1a591f238ac875fcc6daaa60570fa9e168`
- RED: `c1772d3dcaa9e731e7a3fc18a0ade47bdfec789c`
  - 4 expected behavioral failures for missing resolver
- GREEN: `3f204c668d060a7ad3cc8db437df39cf96660f5d`
  - quality run `37074955939` — SUCCESS
  - server run `37074955971` — SUCCESS

## Verified behavior
- APPLIED only when base_attempt_revision equals current authoritative revision
- APPLIED advances revision exactly once
- stale same-base branch remains STALE raw evidence
- client occurred_at is never consulted
- swapping client timestamps does not change decisions
- missing authority and invalid base revision are REJECTED
- candidate raw event bytes are not mutated

## Ruling
Decision authority is explicit revision state plus authority reference; client wall-clock time never participates in winner selection.

## Next
Task 19. No merge authority.

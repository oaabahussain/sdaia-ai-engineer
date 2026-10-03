# K3 Task 15 Checkpoint

**Date:** 2026-10-03
**Task:** 15 — Authorized batch-push API

## TDD evidence
- BASE: `08df803bfc3cc7a36eedde6706e34a5b90a411e9`
- RED: `10572c7f14f5b832f0323628ba11eebc8a1e6005`
  - server run `37072684480`
  - 5 expected behavioral failures: endpoint absent (404); 34 prior server tests passed
- GREEN: `f02409b14621cc5b7431100de495c2c94de4740b`
  - quality run `37072803073` — SUCCESS
  - server run `37072803091` — SUCCESS

## Verified behavior
- authorized POST /v1/learner-evidence/batch
- ACCEPTED and exact-retry DUPLICATE semantics
- ID/body CONFLICT remains per-event
- invalid authorized event -> REJECTED without rolling back safe sibling
- cross-user event -> 403 before any write
- default authorization remains fail-closed
- OpenAPI documents the batch contract

## Ruling
Authorization mismatch is an HTTP boundary failure. Evidence validation failure is a per-event REJECTED disposition inside an authorized batch.

## Next
Task 16. No merge authority.

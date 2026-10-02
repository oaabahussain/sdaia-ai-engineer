# K3 Task 17 / Phase C Checkpoint

**Date:** 2026-10-03
**Task:** 17 — EvidenceSync port and coordinator
**Next phase:** D — Strict assessment authority, corrections, and projections

## TDD evidence
- BASE: `8c9ca74705a48544ce321fa73fa7d80aa685fa09`
- RED: `0b22eea7b4bf416bc923d6c49a53b003c0e1ef50`
  - expected missing sync port/coordinator behavior
- GREEN product: `decb2dfc515da5ae9736ba69d2dd1e63f59022fa`
- test-fixture repair: `e6ba98f121ef1816e39dc1ac077c964d2aea4018`
  - quality run `37074326163` — SUCCESS
  - server run `37074326128` — SUCCESS

## Verified behavior
- EvidenceSync port requires push and pull
- at-least-once push preserves original event bytes and IDs
- lost ACK/network failure leaves PENDING work recoverable
- DUPLICATE receipt acknowledges a safe retry
- partial batch only resolves returned receipts
- persisted outbox survives restart
- authoritative pull resumes from returned store-sequence watermark
- pulled evidence is stored locally without being re-enqueued
- API transport maps to the authorized push/pull endpoints

## Ruling
IN_FLIGHT is recorded only after a response exists, so a lost ACK cannot strand work in an unretryable local state. Attempt metadata therefore tracks response-bearing attempts rather than every socket attempt.

## Next
Task 18. No merge authority.

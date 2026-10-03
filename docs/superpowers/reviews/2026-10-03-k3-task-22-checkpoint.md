# K3 Task 22 / Phase D Checkpoint

**Date:** 2026-10-03
**Task:** 22 — Replay and deterministic integrity findings

## TDD evidence
- BASE: `24d5bc0fbad35ce327372a0da3ddc5f7809c750b`
- RED: `b4b466f03f903222326057ee7f307f2402e12c25`
  - replay/integrity behavior absent
- initial GREEN candidate: `2a52c3589bcd6bba7344124c52e3a121baded945`
  - revealed wrong relative import in integrity module
- fix: `f9b5a13922343939b81a3efd7acf48547c4ccfaf`
  - quality run `37120787317` — SUCCESS
  - server run `37120787292` — SUCCESS

## Verified behavior
- replay is ordered by authoritative store sequence/watermark
- late evidence deterministically changes later replay results regardless of older occurred_at
- regressing watermark ranges fail closed
- event-ID and origin-sequence conflicts are deterministic ERROR findings
- unresolved correction/evaluation targets are deterministic ERROR findings
- unsupported schema/definition and projection watermark regression are ERROR findings
- clock divergence and stale assessment resolution are WARNING findings
- no anomaly threshold is hard-coded

## Phase D
Tasks 18-22 complete.

## Next
Task 23. No merge authority.

## Corrective checkpoint verification

The first documentation/state checkpoint exposed a pre-existing concurrent publication race in the K3 validator generator:

- failing checkpoint quality run: `37120900031`
- freshness check: committed artifact matched deterministic generator output
- atomic-publication RED: `562f8c6aa43e66c845700e0f49fb7faeeb7b0a49`
- atomic publication fix: `3728d1df3e8055068475660d095426752313934c`
- final quality run: `37121297440` — SUCCESS
- final server run: `37121297438` — SUCCESS

The generator now writes a PID-scoped temporary file and publishes with atomic rename, preventing parallel imports from observing a truncated module.

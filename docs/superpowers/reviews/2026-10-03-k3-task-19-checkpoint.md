# K3 Task 19 / Batch 15-19 Checkpoint

**Date:** 2026-10-03  
**Task:** 19 — Correction/supersession graph resolver  
**Batch:** Tasks 15-19

## Recovery classification

Task 19 entered this session as `IMPLEMENTED_NOT_CHECKPOINTED`.

- Task 18 checkpoint head: `23296640af05288a288b442871a997eb7bde1392`
- `src/evidence/corrections.js` already existed there with blob `0ebd90d39decd91a18c0c863fb46c7dfeed15ec7`
- no Product rewrite was performed

## Verification evidence

- initial verification draft: `29f1139c890f4d41f1b35f39d51512c18a77cc86`
  - intentionally not accepted as Task RED after root-cause analysis: it imposed test-only finding names/classification not required by the spec
- corrected verification head: `bf07162bcf599f33ebccb5a594865056e90a8fea`
- exact focused command:
  - `node --test tests/k3-evidence-corrections.test.js`
  - result: **6/6 PASS**
- quality run `37119221239` — SUCCESS
- server/adapter run `37119221249` — SUCCESS

## Verified behavior

- VOID removes the target from current-valid evidence without mutating raw bytes
- SUPERSEDE selects the referenced replacement when all references are valid
- correction-before-target resolves deterministically after the full graph is available
- missing target/superseding references remain unresolved
- competing corrections do not choose a winner and surface a conflict
- supersession cycles surface an integrity conflict
- missing authority cannot alter current-valid evidence and surfaces an authorization conflict
- correction events themselves remain audit/control records rather than current learner evidence

## Ruling

The existing resolver's finding vocabulary (`code`: `MISSING_TARGET`, `MISSING_SUPERSEDING_EVENT`, `COMPETING_CORRECTIONS`, `SUPERSESSION_CYCLE`, `UNAUTHORIZED_CORRECTION`) is compatible with the approved interface because the spec constrains semantics, not those internal finding field names. The initial test-only names were discarded rather than changing working Product behavior to satisfy invented terminology.

## Batch 15-19

- Task 15: authorized batch-push API complete
- Task 16: authorized cursor-based pull API complete
- Task 17: EvidenceSync port/coordinator complete
- Task 18: strict-assessment optimistic revision resolver complete
- Task 19: correction/supersession graph resolver recovered and checkpointed

## Next

Task 20 — ActivityProjectionV1. Low-model executor still has no merge authority.

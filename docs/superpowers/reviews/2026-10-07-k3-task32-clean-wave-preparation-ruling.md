# K3 Task 32 clean-wave preparation ruling

**Date:** 2026-10-07
**Status:** APPROVED PREPARATION / PRODUCT NOT STARTED

Current standards verification does not change the approved K3 target: xAPI 2.0 remains the interoperability mapping target. The K3 adapter remains stricter than a generic xAPI client.

Prepared mapping boundaries:
- reuse the Task 31 `LearningEventExchangePort` result report;
- adapter interface is `createXapiAdapter().exportEvents/importEvents`;
- no LRS transport/storage API is introduced;
- actor uses pseudonymous account identity, never direct mbox/name;
- K3 `occurred_at` maps to xAPI `timestamp`; adapter never writes an LRS `stored` value;
- assessment attempt maps to xAPI registration when present;
- `learner.response.recorded@1` maps to the standard answered verb;
- graded evaluation maps only when its pass/fail semantics are exact;
- unsupported/lossy K3 semantics are explicit omissions, not approximations;
- canonical import requires explicit exact K3 context;
- missing context stages/abstains;
- importer origin/sequence, when supplied for canonical import, is processing order only and external statement ID/timestamp remain in the mapping report provenance rows.

No Product implementation or mapping artifact is present in this preparation commit.

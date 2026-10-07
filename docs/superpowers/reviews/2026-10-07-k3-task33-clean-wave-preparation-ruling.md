# K3 Task 33 clean-wave preparation ruling

**Date:** 2026-10-07
**Status:** APPROVED PREPARATION / PRODUCT NOT STARTED

Caliper target remains version 1.2 and the K3 adapter stays inside the existing vendor-neutral LearningEventExchangePort.

Prepared deterministic boundaries:
- `learner.activity.started@1` -> AssessmentEvent / Started with Attempt;
- `learner.assessment.submitted@1` -> AssessmentEvent / Submitted with Attempt;
- `learner.item.presented@1` -> AssessmentItemEvent / Started with Attempt;
- `learner.item.skipped@1` -> AssessmentItemEvent / Skipped with no generated Attempt/Response;
- `learner.response.recorded@1` -> AssessmentItemEvent / Completed with generated Response and target Attempt;
- unsupported K3 semantics are explicit omissions;
- K3 `occurred_at` is preserved as Caliper `eventTime`;
- actor identity remains pseudonymous;
- canonical import requires explicit exact K3 context; otherwise the record is staged/abstained;
- importer sequence represents import processing order only and source event ID/time remain in the mapping report.

No Product implementation or mapping artifact is present in this preparation commit.

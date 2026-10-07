# K3 Task 30 clean-wave authorization capability ruling

**Date:** 2026-10-06  
**Status:** APPROVED PREPARATION RULING / PRODUCT NOT STARTED

## Capability contract

Task 30 exposes `createEvidenceSyncCapability(options)` from the storage layer.

Default behavior is local-only:

- no authorization provider -> `null`;
- `learner_id` alone -> no capability;
- `X-Anon-Id`/progress identity alone -> no capability.

An explicit `authorizationProvider` enables the existing EvidenceSync transport.

For Task 30 the injected provider contract is request-scoped:

`async authorizationProvider() -> { headers }`

The returned headers are transport authorization material only. They must not be copied into LearnerEvidenceEventV2, StateV2, localStorage identity records, or persisted configuration.

Authorization is resolved for every evidence request. Provider failure fails closed before network transport and must not fall back to `X-Anon-Id`.

## Existing API boundary

Current progress/bank/feedback behavior remains unchanged.

The existing progress API may continue using `X-Anon-Id` for its current anonymous progress contract. Learner-evidence push/pull is a separate authorization boundary and must not reuse that header as proof of ownership.

## Reuse rule

Task 30 reuses the existing `createEvidenceApiTransport`, `EvidenceSync` port, EvidenceStore/outbox, and `syncEvidence` contracts. It does not create a second synchronization protocol.

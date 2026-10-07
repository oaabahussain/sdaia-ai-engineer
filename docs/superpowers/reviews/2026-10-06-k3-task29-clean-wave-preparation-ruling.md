# K3 Task 29 clean-wave preparation ruling

**Date:** 2026-10-06  
**Status:** APPROVED PREPARATION RULING / PRODUCT NOT STARTED

## Canonical objective linkage

`learner.item.presented@1` requires `objective_id`, while current RenderedQuestionV2 objects expose stable question/family/domain IDs but do not directly carry `objective_id`.

The repository already contains the canonical governed objective registry:

`data/factory/knowledge/objectives.json`

Task 29 must use this existing registry. It must not fabricate objective IDs from localized text or invent a second objective namespace.

For the current migrated bank, the mapping is resolved by stable concept identity: exactly one objective's `concept_ids` must match the concept represented by the stable question family. Zero or multiple matches are an evidence-integrity failure.

## Resume state

Task 29 may persist K3 runtime-only identifiers inside the already-permissive StateV2 `active_exam` object under one nested `evidence_runtime` object. This preserves activity/attempt/item-interaction IDs and the local provisional revision across reload without changing the StateV2 top-level schema.

Legacy active exams with no `evidence_runtime` remain readable and must not have historical fine-grained evidence fabricated for actions that happened before K3 instrumentation.

## SYSTEM evaluation

The Task 28 trusted-producer ruling remains authoritative. Browser Task 29 must not fabricate `learner.response.evaluated@1`. In the absence of an explicitly trusted SYSTEM producer path, learner submission evidence is recorded and evaluation evidence remains absent/fail-closed.

## Offline boundary

The existing Task 29 offline scope ruling remains in force. The install-time cache must cover the complete new same-origin browser import/data graph needed for:

service-worker update -> network offline -> first new-version navigation

without a prior online module warmup.

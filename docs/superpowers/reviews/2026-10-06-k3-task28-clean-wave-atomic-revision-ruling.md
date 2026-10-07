# K3 Task 28 clean-wave atomic revision scope ruling

**Date:** 2026-10-06  
**Status:** APPROVED NARROW SCOPE AUGMENTATION / PRODUCT NOT STARTED

## Finding

The approved strict-assessment contract requires one local provisional revision chain per origin. Two browser tabs may construct separate recorder and EvidenceStore instances while sharing the same IndexedDB database/origin.

Recorder-local maps or promise tails cannot provide cross-instance atomicity.

## Ruling

Task 28 may additionally modify `src/evidence/indexedDbStore.js` solely to coordinate the strict `base_attempt_revision -> proposed_attempt_revision` precondition atomically with durable local evidence capture.

The ordinary producer guard remains unchanged. SYSTEM events remain fail-closed in the browser. No new event schema, sync protocol, learner-visible behavior, or scoring behavior is authorized.

The exact Task 28 RED/GREEN command remains:

`node --test tests/k3-evidence-recorder.test.js`

The clean RED must include two recorder/store instances sharing one IndexedDB database and prove that competing `0 -> 1` mutations cannot both commit.

The packet compiler and generated Task 28 packet are augmented deterministically with this single additional allowed Product path.

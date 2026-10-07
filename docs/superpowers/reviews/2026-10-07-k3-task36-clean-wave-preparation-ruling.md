# K3 Task 36 clean-wave preparation ruling

**Date:** 2026-10-07
**Status:** APPROVED PREPARATION / PRODUCT NOT STARTED

Task 36 is an acceptance evidence gate, not the final K3 completion declaration.

The acceptance suite covers spec §47 one-for-one:
- criteria 1–20 are `PINNED` to executable focused test files that run under the repository `npm test` contract;
- criterion 21 is `FUTURE_GATE` owned by Task 37 durable documentation;
- criterion 22 is `FUTURE_GATE` owned by Task 38 whole-plan review;
- criterion 23 is `FUTURE_GATE` owned by Task 39 exact-head verification;
- criterion 24 is `FUTURE_GATE` owned by Task 40 reviewed integration;
- criterion 25 is `FUTURE_GATE` owned by Task 41 post-merge verification.

The Task 36 RED intentionally depends on Task 34/35 evidence files. On the independent prep branch, the acceptance test must fail because `tests/k3-analytics-bridge.test.js` and `tests/k3-release-boundary.test.js` do not yet exist. When Task 36 is stacked after accepted Tasks 34 and 35, those evidence files become real executable coverage.

The suite also pins the protected learner-visible question payload SHA-256:
`5e48b1e47450f1150c9c8f21386f3a4e31070a3d444f968d10f45ccb9ff418a9`.

Task 36 does not use engagement/mastery/readiness/psychometric scores as evidence of K3 acceptance and does not mark K3 COMPLETE.

No Product implementation exists in this preparation commit.

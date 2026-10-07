# K3 Task 36 clean-wave RED ruling

**Date:** 2026-10-07
**Status:** RED PREPARED / PRODUCT SEMANTICS UNCHANGED

Task 36 maps spec §47 one-for-one.

- Criteria 1–20 require executable evidence now.
- Criterion 21 remains an explicit FUTURE_GATE owned by Task 37 because final K3 documentation/zero-tribal-knowledge closure has not yet executed.
- Criteria 22–25 remain explicit FUTURE_GATE items owned by Tasks 38–41.

The Task 36 RED gap is browser acceptance evidence, not missing application behavior: the current browser smoke exercises assessments but does not independently inspect the K3 IndexedDB event store and prove that a real interaction persisted fine-grained learner evidence.

GREEN must add an observable browser check that reads the governed evidence DB and verifies at least:
- learner.activity.started@1
- learner.item.presented@1
- learner.response.recorded@1
- learner.confidence.recorded@1

No Product semantics may be changed to satisfy this acceptance test.


## Combined-review finding

Criterion 21 of spec §47 ("repository documentation is updated with zero tribal knowledge") is owned by Task 37 in the approved implementation plan. Task 36 must not mark it PINNED before Task 37 has executed. The acceptance matrix must therefore keep criteria 21–25 as explicit future gates owned by Tasks 37–41.

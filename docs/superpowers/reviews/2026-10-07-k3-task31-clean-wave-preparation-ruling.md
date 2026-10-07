# K3 Task 31 clean-wave preparation ruling

**Date:** 2026-10-07
**Status:** APPROVED PREPARATION / PRODUCT NOT STARTED

`tests/interoperability-ports.test.js` exists on the clean baseline. The generated packet previously classified every plan `test` path as create-only, which would make a valid Task 31 extension fail scope validation.

Task 31 compiler correction:
- existing `tests/interoperability-ports.test.js` -> allowed modify;
- new `tests/k3-learning-event-exchange.test.js` -> allowed create.

Task 31 keeps the existing `exportEvents` / `importEvents` method contract compatible.

The common result-report contract prepared by RED requires:
- non-empty `mapping_version`;
- `mapped_ids[]` rows with explicit source and target IDs;
- explicit `omissions[]` and `rejections[]`, each with `reason_code`;
- provenance identifying adapter ID/version and source standard/version.

Standard-specific payload fields such as xAPI `statements` or Caliper `events` remain adapter-owned extensions to this common report.

No Product implementation is present in this preparation commit.

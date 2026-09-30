# H0-R2 Whole-Branch Review

**Date:** 2026-09-30  
**Review mode:** SELF_REVIEW  
**Reason:** active runtime exposes no Superpowers/subagent review capability; no independence claim is made.  
**Range reviewed:** main merge-base through `8b4461f1cded32d8fbe5cc380ad68ee0dd315979`.

## Review focus

- deterministic packet/compiler behavior;
- fail-closed preflight/result acceptance;
- runtime capability truth;
- accepted-RED immutability;
- task file-scope enforcement;
- CI trigger/check identity;
- no K3 Task 5 product implementation;
- adversarial pressure cases;
- evidence/self-reference boundary;
- low-model readiness remains false until runtime/Project gates are proven.

## Findings before fix pass

### Important I-01 — adversarial runner is declarative rather than executable

The 15-case runner currently returns a hard-coded blocked result for each pressure case. That proves the inventory exists but does not prove the validators emit the expected blocked/fail behavior. This is weaker than Design §24 and Task 20.

**Required fix:** each pressure case must execute a real validator/guard or a deterministic policy function and assert the emitted code.

### Important I-02 — result validator does not enforce the complete Design §18 freshness contract

Current result validation checks RED/green/regression/scope/main revision/commit/durable evidence, but does not verify packet source hashes/source-contract digest, execution branch freshness, open findings, or task-base checkpoint continuity.

**Required fix:** bind result acceptance to current validated state and source/digest evidence and reject drift.

### Important I-03 — preflight contains a hard-coded PASS for dynamic-reference guard

`NO_DYNAMIC_STALE_PINS` is currently added with literal `true`. This makes a required Spec preflight gate non-evidentiary.

**Required fix:** preflight must consume an explicit linter result/evidence and fail when it is not PASS.

## Severity summary before fix

- Critical: 0
- Important: 3
- Minor: 0

One RED->GREEN fix pass is authorized by the implementation plan. After fixes, rerun the full Task 21 verification suite and update this record with closure evidence.

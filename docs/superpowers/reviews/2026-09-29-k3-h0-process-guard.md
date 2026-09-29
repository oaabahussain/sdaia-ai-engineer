# K3 H0 Process Guard

**Date:** 2026-09-29  
**Mode:** `HIGH_REASONING_MERGE_GATE`

## Live repository protection evidence

At H0 Task 7 verification:

- live `main`: `9607271c86c084df396a39947e915d6560dbbac3`;
- branch protection: `protected=false`;
- required status-check enforcement: off;
- repository rulesets: none;
- the active GitHub connector exposes read access for these settings but no repository-administration mutation used by this execution.

This file does **not** claim GitHub-native branch protection exists.

## Compensating merge control

Until a native ruleset is configured:

1. a low-reasoning executor may commit/push only to the approved execution branch;
2. a low-reasoning executor **must not merge or push directly to `main`**;
3. it stops before integration/PR merge;
4. a high-reasoning session performs the whole-branch review;
5. that session performs exact-head verification; the exact reviewed HEAD must have both `quality-gate` and `server-adapter-gate` successful;
6. only that exact reviewed/green HEAD may be integrated;
7. post-merge verification on the exact resulting `main` SHA remains mandatory.

## Gate meaning

`PROCESS_GUARDS_READY=PASS` means this compensating control is documented and verified. It does **not** mean GitHub itself blocks an administrator from bypassing it.

Changing `merge_guard_mode` to `RULESET` requires fresh evidence that a main ruleset is actually configured.

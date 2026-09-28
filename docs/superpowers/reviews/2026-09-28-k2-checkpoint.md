# K2 Coverage Expansion & Controlled Release — Checkpoint

**Date:** 2026-09-28
**Programme:** K2
**Checkpoint:** F — Risk-based review calibration
**Status:** EXECUTING — Checkpoints A–E complete
**Branch:** `impl/k2-coverage-expansion-controlled-release`
**Branch base:** `9b9d416e9c025563c299d54347984954ccdb0455`
**Current main at start:** `6eb108338857dec9471f441a37d1819b98045cbb`

## Completed

- K2 conceptual design approved.
- K2 written spec approved.
- K2 implementation plan approved.
- Native execution method approved.
- Isolated implementation branch created.
- Fresh pre-execution CI evidence captured.
- Task 1 baseline artifacts committed and exact-head CI verified.

## Active task

Task 21 — Review calibration runtime.

## Verification evidence

At plan head `9b9d416e9c025563c299d54347984954ccdb0455`:
- Pull request quality gate #358 SUCCESS.
- Server and adapter contract tests #979 SUCCESS.

At main `6eb108338857dec9471f441a37d1819b98045cbb`:
- Server and adapter contract tests #958 SUCCESS.
- GitHub Pages #26 SUCCESS.

## Failures / rulings

Ruling: local clone/worktree is unavailable because the container cannot resolve GitHub; use the isolated remote implementation branch and exact-head GitHub Actions for complete RED/GREEN verification — cost if wrong: slower TDD cycle and stronger synchronization discipline required.

## Resume safety

Do not reconstruct K2 from chat. Read:
1. `HANDOFF.md`;
2. approved K2 spec;
3. approved K2 plan;
4. `docs/superpowers/reviews/2026-09-28-k2-execution-ledger.md`;
5. this checkpoint;
6. branch HEAD and exact-head CI.

## Next exact task

Task 21: write RED review-calibration runtime tests, prove missing behavior, implement deterministic risk/escalation/sampling decisions, then verify exact-head gates.

## Checkpoint A completion evidence

- Task 1 baseline commit `fbc683be875d6c718ff22a143055af75b74323ec` — Server/adapter #981 SUCCESS.
- Task 2 RED `a58acf8811086fc61943ad40b784685e46ea00e0` — quality gate #359 failed at Node tests as intended.
- Task 2 GREEN `f440a4d3d165be8e793b1cce3183eb40d47596dd` — quality gate #360 SUCCESS; server/adapter #987 SUCCESS.


## Checkpoint B completion evidence

Exact verified head: `05bce1aa3e1d0c22346292247277666b7894e539`.

Completed contracts:
- ExpansionPlanV1;
- TranchePlanV1;
- CalibrationPolicy metadata;
- ProviderRoutingPolicyV1;
- ReviewCalibrationPolicyV1;
- DedupCalibrationPolicyV1;
- CanaryPolicyV1.

Fresh CI:
- Pull request quality gate #381 SUCCESS;
- Server and adapter contract tests #1032 SUCCESS.

Next: Checkpoint C / Task 10.


## Checkpoint C completion evidence

Exact verified head: `dabce5ce14c55403adb39e520cd922bcba2c690c`.

Completed:
- Task 10 coverage priority;
- Task 11 ExpansionPlan builder;
- Task 12 adaptive tranche policy;
- Task 13 TranchePlan builder.

Fresh CI:
- Pull request quality gate #399 SUCCESS;
- Server and adapter contract tests #1069 SUCCESS.

Next: Checkpoint D / Task 14.


## Checkpoint D completion evidence

Exact verified head: `414724c92c90f09cc885cef55d596f810dbd1063`.

Completed:
- Task 14 provider routing runtime;
- Task 15 provider evaluation v2;
- Task 16 production-failure eval ingestion.

Fresh CI:
- Pull request quality gate #408 SUCCESS;
- Server and adapter contract tests #1089 SUCCESS.

Next: Checkpoint E / Task 17.


## Checkpoint E completion evidence

Exact verified head: `76a02f22e1450cf816116f0e677b5fa50dd64fb4`.

Completed:
- Task 17 structural duplicate evidence;
- Task 18 calibrated cross-lingual dedup;
- Task 19 BilingualEquivalenceReportV1;
- Task 20 bilingual stage v2.

Fresh CI:
- Pull request quality gate #420 SUCCESS;
- Server and adapter contract tests #1114 SUCCESS.

Next: Checkpoint F / Task 21.

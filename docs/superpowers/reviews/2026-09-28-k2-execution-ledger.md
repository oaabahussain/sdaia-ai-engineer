# K2 execution ledger — plan: docs/superpowers/plans/2026-09-28-k2-coverage-expansion-controlled-release.md

**Spec:** `docs/superpowers/specs/2026-09-28-k2-coverage-expansion-controlled-release-design.md`
**Branch:** `impl/k2-coverage-expansion-controlled-release`
**Execution mode:** Native / executing-plans
**Initial branch base:** `9b9d416e9c025563c299d54347984954ccdb0455`
**Current main at start:** `6eb108338857dec9471f441a37d1819b98045cbb`

## Execution rules

- RED → intended failure → minimal GREEN → affected/full regression → commit.
- Unexpected failures invoke systematic-debugging.
- Every plan deviation is recorded as a Ruling.
- Every completed task records exact commit and verification evidence.
- Checkpoint is updated after every Checkpoint A–L.

## Workspace ruling

Ruling: remote isolated branch + exact-head GitHub Actions replaces a local worktree for this run — direct container DNS access to GitHub is unavailable while the GitHub connector and Actions remain available — cost if wrong: slower feedback and greater need to verify the exact tested SHA.

## Pre-flight shared-interface scan

- Tasks 3→11: ExpansionPlanV1 produced by Task 3 is consumed by the expansion-plan builder in Task 11 — names align.
- Tasks 4→13/23: TranchePlanV1 is consumed by tranche planning/execution — names align.
- Tasks 5→7/8/9 and later calibration runtimes: shared CalibrationPolicy metadata underpins policy contracts — names align.
- Tasks 10→11: priority output feeds ExpansionPlan builder — stable ordered gap list expected.
- Tasks 11→13: ExpansionPlan feeds TranchePlan builder — lineage refs align.
- Tasks 12→13/26: tranche policy decision feeds tranche plan and adaptive follow-up — decision vocabulary must remain stable.
- Tasks 14→23: provider routing decision supplies provider-neutral execution selection — no provider-specific coupling allowed.
- Tasks 17→18: structural evidence precedes semantic/cross-lingual dedup — same PASS/DUPLICATE/REVIEW_REQUIRED semantics.
- Tasks 19→20: BilingualEquivalenceReportV1 is consumed by bilingual stage v2 — critical dimension semantics align.
- Tasks 21→22: review-calibration decision is consumed by review stage — HUMAN_REQUIRED/SAMPLED/AUTO_ELIGIBLE/HOLD vocabulary aligns.
- Tasks 23→24/27: tranche runner state/result is consumed by resume/retry and partial-failure semantics — durable sibling preservation required.
- Tasks 25→26: tranche metrics feed adaptive policy — empty/unknown metrics must not become false zeros.
- Tasks 28→29→30/31: ActivationEvidenceV1 is evaluated then required for K2 CANARY promotion; insufficient evidence yields HOLD.
- Tasks 33→34→35→36/37: EventDefinition registry and privacy validation precede export/factory signals — unvalidated events cannot reach sinks.
- Tasks 38→39: ImprovementFindingV1 is built from validated observations — observation and hypothesis remain separate.
- Tasks 41/42→43: file and SQLite stores must round-trip the same logical K2 artifacts.
- Tasks 45→49: validator/runtime/private-boundary gates feed final acceptance — no K2 acceptance before all are green.

Pre-flight result: no interface naming conflict found against the approved spec.

## Task status

### Task 1 — Create K2 execution baseline

Status: COMPLETE

Evidence gathered:
- execution branch and main refs resolved;
- runtime fixture counts/profile read from branch;
- K1 post-merge verification read;
- exact approved-plan head CI #358 and #979 are SUCCESS;
- current-main push CI #958 and Pages #26 are SUCCESS.

Commit: `fbc683be875d6c718ff22a143055af75b74323ec`
Verification: Server and adapter contract tests #981 (`36390379205`) — SUCCESS on exact head `fbc683be875d6c718ff22a143055af75b74323ec`.

Task 1: complete (baseline/ledger/checkpoint persisted; exact-head CI green).

### Task 2 — Add K2 acceptance test shell

Status: COMPLETE

RED commit: `a58acf8811086fc61943ad40b784685e46ea00e0`.
RED evidence: Pull request quality gate #359 failed specifically at the Node-test step after setup/validation passed. The previous approved-plan head was green and the GREEN revision changed only the acceptance-shell gating, so the differential establishes the intended future-contract assertion as the failure source; the GitHub connector does not expose raw job logs/annotations.
GREEN commit: `f440a4d3d165be8e793b1cce3183eb40d47596dd`.
GREEN evidence:
- Pull request quality gate #360 — SUCCESS;
- Server and adapter contract tests #987 — SUCCESS.
Ruling: preserve future K2 acceptance behaviors as `test.todo` until their owning tasks implement them, while keeping a live shell-surface test — this gives Task 2 a green endpoint without pretending future behavior already exists — cost if wrong: a future task could forget to enable its acceptance assertion, mitigated by Task 49 requiring all TODO gates removed.

Task 2: complete (RED #359 → GREEN #360/#987).

## Checkpoint A result

Status: COMPLETE.
Next exact task: Task 3 — ExpansionPlanV1 schema.

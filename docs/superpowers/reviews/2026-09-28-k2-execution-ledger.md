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


### Task 3 — ExpansionPlanV1 schema

Status: COMPLETE
RED commit: `adc76cf3af6e273ba1262fc3398ab8f773c7ffbd`
RED evidence: Pull request quality gate #362 — Node tests FAILED after setup/validation passed; schema file was intentionally absent.
GREEN commit: `893c91f31ffa4aa505b879885106166a0c666a41`
GREEN evidence:
- Pull request quality gate #363 — SUCCESS;
- Server and adapter contract tests #996 — SUCCESS.
Contract outcome:
- non-empty coverage gaps required;
- versioned policy references required;
- count-only expansion rejected;
- no K1 runtime behavior changed.

Task 3: complete.
Next exact task: Task 4 — TranchePlanV1 schema.


### Task 4 — TranchePlanV1 schema

Status: COMPLETE
RED commit: `9114474b718af649971c324cd89a12d5a98352ab`
RED evidence: Pull request quality gate #365 — Node tests FAILED after setup/validation passed.
GREEN commit: `796beccadac2fb29c56a282cb6a0c7ef328f6dbc`
GREEN evidence:
- Pull request quality gate #366 — SUCCESS;
- Server and adapter contract tests #1002 — SUCCESS.
Contract outcome:
- coverage-derived requests required;
- tranche calibration policy reference required;
- lifecycle constrained to PLANNED/RUNNING/PARTIAL/COMPLETED/PAUSED/FAILED.

Task 4: complete.
Next exact task: Task 5 — shared CalibrationPolicy metadata schema.


### Task 5 — Shared CalibrationPolicy metadata schema

Status: COMPLETE
RED commit: `32feb8e46b39c35bb6dd236d014670e6d0206587`
RED evidence: Pull request quality gate #368 — Node tests FAILED after setup/validation passed.
GREEN commit: `920b3bf8e7c14b0a2ca5c65936c1f96fba88c33e`
GREEN evidence:
- Pull request quality gate #369 — SUCCESS;
- Server and adapter contract tests #1008 — SUCCESS.
Contract outcome:
- policy identity/version required;
- scope and evidence basis required;
- effective date/owner/approver/reconsideration trigger explicit;
- no operating threshold hard-coded.

Task 5: complete.
Next exact task: Task 6 — ProviderRoutingPolicyV1 schema.


### Task 6 — ProviderRoutingPolicyV1 schema

Status: COMPLETE
RED commit: `b555ff4cf64b1608ac88416533cd9dbd955bc26d`
RED evidence: Pull request quality gate #371 — Node tests FAILED after setup/validation passed.
GREEN commit: `1e2a0da1408046984d5470f6da01102c6a80dd40`
GREEN evidence:
- Pull request quality gate #372 — SUCCESS;
- Server and adapter contract tests #1014 — SUCCESS.
Contract outcome:
- only APPROVED/RESTRICTED evaluation states are routable;
- deterministic/manual/abstain fallback is explicit;
- deterministic fallback requires provider_ref.

Task 6: complete.
Next exact task: Task 7 — ReviewCalibrationPolicyV1 schema.


### Task 7 — ReviewCalibrationPolicyV1 schema

Status: COMPLETE
RED commit: `2a6ab0af8403b89eea5d04615c7cef460068b306`
RED evidence: Pull request quality gate #374 — Node tests FAILED after setup/validation passed.
GREEN commit: `8409e03768c2753d6320de4c7145ddff1314ddb2`
GREEN evidence:
- Pull request quality gate #375 — SUCCESS;
- Server and adapter contract tests #1020 — SUCCESS.
Contract outcome:
- scoped evidence-backed review rules required;
- bare sampling percentage rejected;
- SAMPLED decisions require sampling_rate;
- escalation triggers explicit.

Task 7: complete.
Next exact task: Task 8 — DedupCalibrationPolicyV1 schema.


### Task 8 — DedupCalibrationPolicyV1 schema

Status: COMPLETE
RED commit: `e9088faf959b63f1c7978dcf8b2f809d4b720b7f`
RED evidence: Pull request quality gate #377 — Node tests FAILED after setup/validation passed.
GREEN commit: `b15c152395a1064235fc2e75cfde239d326d6a36`
GREEN evidence:
- Pull request quality gate #378 — SUCCESS;
- Server and adapter contract tests #1026 — SUCCESS.
Contract outcome:
- labeled duplicate/non-duplicate calibration set required;
- embedding profile versioned;
- same-language and cross-language thresholds separated;
- threshold values constrained to [0,1].

Task 8: complete.
Next exact task: Task 9 — CanaryPolicyV1 schema.

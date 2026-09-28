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


### Task 9 — CanaryPolicyV1 schema

Status: COMPLETE
RED commit: `fbe4fc2a1720943bc9ce87254b04070e332caedf`
RED evidence: Pull request quality gate #380 — Node tests FAILED after setup/validation passed.
GREEN commit: `05bce1aa3e1d0c22346292247277666b7894e539`
GREEN evidence:
- Pull request quality gate #381 — SUCCESS;
- Server and adapter contract tests #1032 — SUCCESS.
Contract outcome:
- required evidence classes explicit;
- HOLD conditions required;
- critical/missing-metric blocker behavior explicit;
- fixed duration/exposure alone rejected as promotion policy.

Task 9: complete.

## Checkpoint B result

Status: COMPLETE.
Fresh checkpoint verification on `05bce1aa3e1d0c22346292247277666b7894e539`:
- all seven K2 schema files from Tasks 3–9 present;
- all seven owning contract test files present;
- Pull request quality gate #381 SUCCESS;
- Server and adapter contract tests #1032 SUCCESS.

Next exact task: Task 10 — Coverage priority model.


### Task 10 — Coverage priority model

Status: COMPLETE
RED commit: `f92703a49b0e4f1753649b9c12680fb52e2ed8e1`
RED evidence: Pull request quality gate #385 — Node tests FAILED after setup/validation passed.
GREEN commit: `71d564b9cfbe388e56e52050e9eddea52b8a9b86`
GREEN evidence:
- Pull request quality gate #386 — SUCCESS;
- Server and adapter contract tests #1043 — SUCCESS.
Ruling: use a lexicographic priority vector instead of an opaque aggregate score — this preserves explainability and prevents one factor from silently compensating for another — cost if wrong: scheduling preferences may need policy refinement, but content-quality gates remain unaffected.
Behavior:
- source-unready gaps are blocked behind ready gaps;
- larger deficits rank first among equally eligible gaps;
- risk/duplicate pressure/review capacity/bilingual/accessibility complexity remain visible fields;
- stable gap_id breaks exact ties deterministically.

Task 10: complete.
Next exact task: Task 11 — Expansion plan builder.


### Task 11 — Expansion plan builder

Status: COMPLETE
RED commit: `367185b1dd0224e454a980080f51dddb3c96b0ae`
RED evidence: Pull request quality gate #388 — Node tests FAILED after setup/validation passed.
GREEN commit: `bd0368a633809740695ef18525e37a7e2c99535c`
GREEN evidence:
- Pull request quality gate #389 — SUCCESS;
- Server and adapter contract tests #1049 — SUCCESS.
Behavior:
- count-only/malformed gaps rejected;
- track identity must match;
- Task 10 priority ordering is consumed directly;
- the same inputs/policies/createdAt produce the same ExpansionPlanV1;
- plan contains no provider choice and starts with no tranche refs.

Task 11: complete.
Next exact task: Task 12 — adaptive tranche policy engine.


### Task 12 — Adaptive tranche policy engine

Status: COMPLETE
RED commit: `f8553d9a06ab416460315e0efb7b76f39cf374b0`
RED evidence: Pull request quality gate #391 — Node tests FAILED after setup/validation passed.
GREEN commit: `69cf3ac6f694d37744e1a8c895682670d18964d6`
GREEN evidence:
- Pull request quality gate #392 — SUCCESS;
- Server and adapter contract tests #1055 — SUCCESS.
Behavior:
- missing operational metrics returns HOLD with requestedCount=null;
- failure/review-backlog guardrails HOLD;
- low yield contracts;
- high yield expands;
- all bounds, thresholds and expansion/contraction factors come from policy.

Task 12: complete.

### Task 13 prerequisite ruling

Ruling: ExpansionPlanV1 must carry each prioritized gap's `requested_count` alongside gap_id/rank/reason before TranchePlan construction — the approved spec requires bounded coverage-driven tranche requests, but the original Task 3/11 interface retained only gap IDs and therefore could not allocate a tranche without guessing per-gap deficit — cost if wrong: one additive K2-only field is introduced before any public K2 release; omitting it would allow overfilling gaps or require hidden state.

Next: prove this interface correction RED→GREEN, then implement Task 13.


### Task 13 prerequisite interface correction

Status: COMPLETE
RED commit: `985bf8d974ea82d9b642f62ae971e929b3d56bc2`
RED evidence: Pull request quality gate #394 — Node tests FAILED after setup/validation passed.
GREEN commit: `08e4f942e6684dde1e7a707ef9be82bce76c2077`
GREEN evidence:
- Pull request quality gate #395 — SUCCESS;
- Server and adapter contract tests #1061 — SUCCESS.
Outcome: ExpansionPlanV1 priority entries now preserve each gap's positive `requested_count`, and buildExpansionPlan carries that deficit forward.

Ruling: Task 13 treats `trancheDecision` as a planning decision envelope: the Task 12 decision fields plus the risk/capacity/timestamp evidence captured by the caller from the same scheduling pass — this keeps Task 12's pure decision API small while preventing TranchePlan from fabricating operational evidence — cost if wrong: the future orchestrator must assemble one explicit envelope before calling buildTranchePlan.

Next exact task: Task 13 — Tranche plan builder.


### Task 13 — Tranche plan builder

Status: COMPLETE
RED head: `3de4b8328176267d0020ae94f23105cf24945f9b`
RED evidence: Pull request quality gate #398 — Node tests FAILED after setup/validation passed; Server and adapter #1067 remained SUCCESS.
GREEN commit: `dabce5ce14c55403adb39e520cd922bcba2c690c`
GREEN evidence:
- Pull request quality gate #399 — SUCCESS;
- Server and adapter contract tests #1069 — SUCCESS.
Behavior:
- only gaps present in ExpansionPlan lineage are allocatable;
- allocation follows stable priority order;
- per-gap allocation never exceeds preserved requested_count;
- HOLD decisions are not runnable;
- risk/capacity/timestamp evidence comes from the explicit tranche-decision envelope;
- no hidden operational evidence is fabricated.

Task 13: complete.

## Checkpoint C result

Status: COMPLETE.
Completed Tasks 10–13:
- deterministic explainable coverage prioritization;
- governed ExpansionPlan builder;
- adaptive tranche policy;
- governed TranchePlan builder with lineage-preserving bounded allocation.

Next exact task: Task 14 — Provider routing policy runtime.


### Task 14 — Provider routing policy runtime

Status: COMPLETE
RED commit: `758055fd1324c2a1f6e24374cf971f123c230763`
RED evidence: Pull request quality gate #401 — Node tests FAILED after setup/validation passed.
GREEN commit: `af0c2f1c1b3fb4de90512bc4789dd75701c26321`
GREEN evidence:
- Pull request quality gate #402 — SUCCESS;
- Server and adapter contract tests #1076 — SUCCESS.
Behavior:
- FAILED/unapproved candidates are never selected;
- policy provider order is deterministic;
- APPROVED/RESTRICTED semantics are explicit;
- no eligible provider uses only the configured DETERMINISTIC/MANUAL/ABSTAIN fallback;
- no vendor-specific dependency introduced.

Task 14: complete.
Next exact task: Task 15 — Provider evaluation v2 metrics.


### Task 15 — Provider evaluation v2 metrics

Status: COMPLETE
RED commit: `8108e2167d1084b2d798d14f26799300897c5670`
RED evidence: Pull request quality gate #404 — Node tests FAILED after setup/validation passed.
GREEN commit: `fcf48c7176afbbb4a18333363f95fd37e6344690`
GREEN evidence:
- Pull request quality gate #405 — SUCCESS;
- Server and adapter contract tests #1083 — SUCCESS.
Behavior:
- existing `evaluateProvider()` V1 output shape remains unchanged;
- new `evaluateProviderV2()` adds evidence fidelity, hallucination-free, ambiguity control, bilingual equivalence and cognitive alignment while retaining correctness/distractor/format/latency/cost dimensions;
- thresholds remain policy-driven;
- weak mandatory K2 dimensions cause FAIL.

Task 15: complete.
Next exact task: Task 16 — production-failure eval ingestion seam.


### Task 16 — Production-failure eval ingestion seam

Status: COMPLETE
RED commit: `e9e98d1b31e0e080220e9f73dad6a2bafcd293a7`
RED evidence: Pull request quality gate #407 — Node tests FAILED after setup/validation passed.
GREEN commit: `414724c92c90f09cc885cef55d596f810dbd1063`
GREEN evidence:
- Pull request quality gate #408 — SUCCESS;
- Server and adapter contract tests #1089 — SUCCESS.
Behavior:
- only supported failure finding types enter the seam;
- output is immutable and detached from mutable caller input;
- all cases start CANDIDATE / PENDING_REVIEW;
- caller cannot self-declare GOLD or reviewed authority;
- unsupported product-usage signals are rejected.

Task 16: complete.

## Checkpoint D result

Status: COMPLETE.
Completed Tasks 14–16:
- governed provider routing runtime;
- backward-compatible K2 provider evaluation profile;
- production-failure candidate eval ingestion seam.

Next exact task: Task 17 — Structural duplicate evidence.


### Task 17 — Structural duplicate evidence

Status: COMPLETE
RED commit: `1339a2b67b81a1cca4203c5daacf8ae95fb7d3b7`
RED evidence: Pull request quality gate #410 — Node tests FAILED after setup/validation passed.
GREEN commit: `e258b6203099a7617aeee217f2153486ac9ddb39`
GREEN evidence:
- Pull request quality gate #411 — SUCCESS;
- Server and adapter contract tests #1096 — SUCCESS.
Behavior:
- exact-text duplicate behavior preserved;
- structural fingerprint uses objective + normalized correct reasoning + sorted misconceptions;
- sparse candidates do not fabricate structural identity;
- structural matches can be DUPLICATE or REVIEW_REQUIRED by policy;
- structural evidence is recorded without replacing semantic checks.

Task 17: complete.
Next exact task: Task 18 — Cross-lingual semantic gray-zone behavior.


### Task 18 — Cross-lingual semantic gray-zone behavior

Status: COMPLETE
RED commit: `e6c7e109613ec48d637b409a823bb14f8ff4b958`
RED evidence: Pull request quality gate #413 — Node tests FAILED after setup/validation passed.
GREEN commit: `51c986d6b74caad8c7843940d435c1fdb6e5a571`
GREEN evidence:
- Pull request quality gate #414 — SUCCESS;
- Server and adapter contract tests #1102 — SUCCESS.
Behavior:
- DedupCalibrationPolicy same/cross-language thresholds are runtime inputs;
- similarity below review bound passes;
- calibrated gray zone returns REVIEW_REQUIRED;
- score at/above duplicate threshold rejects;
- unusable semantic evidence remains REVIEW_REQUIRED;
- K1 uncalibrated threshold behavior remains available when no K2 policy is supplied.

Task 18: complete.
Next exact task: Task 19 — BilingualEquivalenceReportV1 schema.


### Task 19 — BilingualEquivalenceReportV1 schema

Status: COMPLETE
RED commit: `a79dc1e03ee56606e59536c137c7f8c0c5368bb1`
RED evidence: Pull request quality gate #416 — Node tests FAILED after setup/validation passed.
GREEN commit: `f5f8f9c8294d294a4190d3834856e4535a708f68`
GREEN evidence:
- Pull request quality gate #417 — SUCCESS;
- Server and adapter contract tests #1108 — SUCCESS.
Contract outcome:
- nine critical bilingual dimensions are mandatory;
- each dimension is PASS/FAIL/ABSTAIN;
- supporting automatic metrics are non-authoritative evidence;
- aggregate-score-only reports are invalid;
- REVIEW_REQUIRED is allowed at report level when a dimension abstains.

Task 19: complete.
Next exact task: Task 20 — Bilingual stage v2.


### Task 20 — Bilingual stage v2

Status: COMPLETE
RED commit: `834f6126f526116d98ebc681c68d72d960867bbc`
RED evidence: Pull request quality gate #419 — Node tests FAILED after setup/validation passed.
GREEN commit: `76a02f22e1450cf816116f0e677b5fa50dd64fb4`
GREEN evidence:
- Pull request quality gate #420 — SUCCESS;
- Server and adapter contract tests #1114 — SUCCESS.
Behavior:
- critical report dimensions are authoritative;
- failed critical dimension blocks PASS even with strong supporting metric;
- missing/ABSTAIN critical dimension yields REVIEW_REQUIRED;
- all critical dimensions must PASS for report-driven PASS;
- legacy provider PASS/FAIL/ABSTAIN behavior remains supported.

Task 20: complete.

## Checkpoint E result

Status: COMPLETE.
Completed Tasks 17–20:
- structural duplicate evidence;
- calibrated same/cross-language semantic gray zones;
- BilingualEquivalenceReportV1;
- report-driven bilingual enforcement.

Next exact task: Task 21 — Review calibration runtime.


### Task 21 — Review calibration runtime

Status: COMPLETE
RED commit: `363c51d6d6c64d420ddf05ab45eeb6fdb6608fc0`
RED evidence: Pull request quality gate #422 — Node tests FAILED after setup/validation passed.
GREEN commit: `04cd024aa5bea43de6735454dd731ddb8b8131f0`
GREEN evidence:
- Pull request quality gate #423 — SUCCESS;
- Server and adapter contract tests #1121 — SUCCESS.
Behavior:
- mandatory conditions and high-risk classes require human review;
- observed trigger breaches escalate conservatively;
- sampled selection is deterministic from stable candidate identity;
- unknown risk class yields HOLD;
- no random sampling or hidden threshold.

Ruling: `INCREASE_SAMPLING` escalation without an explicit target rate is conservatively treated as HUMAN_REQUIRED — the policy schema does not carry a calibrated replacement sampling rate, so inventing one would violate the calibration boundary — cost if wrong: review load may temporarily be higher until a future policy version adds an explicit escalated rate.

Task 21: complete.
Next exact task: Task 22 — Review stage integration.


## Approved execution amendment — 2026-09-28

Ruling: K2 review governance is Automation-first — the user explicitly approved materially reducing routine human dependence; low/medium-risk mature content may be AUTO_ELIGIBLE only after independent deterministic, evidence/correctness, dedup, bilingual and provider-evaluation gates agree; humans are escalation-only for high/critical risk, ambiguity/conflict, uncalibrated provider/domain combinations, drift, quarantine/recovery or critical source conflicts — cost if wrong: automation could admit defects, mitigated by independent gates, exception sampling, canary evidence, drift escalation and rollback.

Ruling: execution reports are grouped in batches of three completed Tasks — the user explicitly requested three full tasks per update — cost if wrong: progress visibility is less granular, mitigated by per-task durable ledger and exact-head CI evidence.

Current execution batch: Tasks 22–24.


### Task 22 — Review stage integration — automation-first

Status: COMPLETE
RED commit: `5242993ff97676cf5c398a8e7c5051ad34e26507`
RED evidence: Pull request quality gate #427 — Node tests FAILED after setup/validation passed.
GREEN commit: `427988611db68f3338a8ecced02f8d3c2a43d528`
GREEN evidence:
- Pull request quality gate #428 — SUCCESS;
- Server and adapter contract tests #1133 — SUCCESS.
Behavior:
- AUTO_ELIGIBLE low/medium-risk content can pass without a human only after governed upstream gates are explicitly marked passed;
- HUMAN_REQUIRED cannot be bypassed by AI approval;
- HOLD cannot silently approve;
- selected exception-sample cases require human approval;
- unselected sample cases and AUTO_ELIGIBLE cases use automation-policy approval;
- K1 behavior is unchanged when no K2 ReviewCalibrationPolicy is supplied.

Ruling: upstream automated quality evidence is represented at the review boundary by `review_context.governed_gates_passed === true` — the stage must not infer that earlier gates passed merely because it was called — cost if wrong: orchestration must set this explicit signal after successful prior stages, but this prevents silent auto-approval on incomplete context.

Task 22: complete.
Next exact task: Task 23 — Tranche run envelope.


Task 23: Ruling: aggregate TranchePlan requests are expanded through an explicit deterministic `options.buildRequest({tranchePlan,request,indexWithinGap,globalIndex})` seam before calling LocalRunner — TranchePlanV1 intentionally stores coverage demand counts rather than inventing FactoryRun IDs/targets, so the orchestration boundary must receive the concrete request construction policy from its caller — cost if wrong: callers must provide one small adapter, but IDs/targets remain explicit and reproducible rather than hidden in the runner.


### Task 23 — Tranche run envelope

Status: COMPLETE
RED commit: `9c4c921465ed011dca75a957b5b39b7d905d940c`
RED evidence: Pull request quality gate #431 — Node tests FAILED after setup/validation passed.
GREEN commit: `25ac09b3b9dc8efede4f16f63f3d9a72fe6d5bd2`
GREEN evidence:
- Pull request quality gate #432 — SUCCESS;
- Server and adapter contract tests #1141 — SUCCESS.
Behavior:
- only explicitly authorized PLANNED tranches execute;
- aggregate coverage requests expand through the explicit deterministic buildRequest seam;
- concrete requests execute sequentially through the existing runner;
- mixed outcomes preserve successful siblings and report PARTIAL;
- no workflow engine or provider-specific dependency introduced.

Task 23: complete.
Next exact task: Task 24 — Tranche resume/retry.

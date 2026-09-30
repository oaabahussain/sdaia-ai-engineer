# H0-R2 — Deterministic Low-Model Execution Layer Design

**Date:** 2026-09-30  
**Repository:** `oaabahussain/sdaia-ai-engineer`  
**Design branch:** `design/k3-low-model-execution-h0-r2`  
**Design base:** `27dd4f33218d5868bc4b8e057bb4f391c6fde4e6` (reviewed H0 PR #23 head)  
**Programme:** K3 Learner Evidence Engine  
**Scope:** Process/control-plane hardening only. No K3 Task 5 product implementation.  
**Status:** DESIGN — awaiting explicit written-spec approval before implementation planning.

## 1. Purpose

H0-R2 makes lower-reasoning execution deterministic enough that K3 Tasks 5-41 can be executed from small, self-contained task contracts without reconstructing the project from chat history, interpreting shorthand, inventing architecture, or gaining integration authority.

The objective is not to make a lower-reasoning model "smarter." The objective is to reduce the decisions it is allowed to make.

H0-R2 converts the recurring process failures discovered during H0 into:

- machine-readable failure rules;
- deterministic task packets;
- preflight gates;
- scope enforcement;
- behavioral RED requirements;
- explicit runtime capability declarations;
- result validation;
- durable execution evidence;
- hard stop conditions.

The final success condition is:

```text
low_model_ready = true
next_task = 5
TASK_5_EXECUTION_READY = PASS
```

and that state must be reproducible from durable repository evidence plus the verified ChatGPT Project bootstrap.

## 2. Existing authority remains unchanged

H0-R2 does **not** create a second execution truth.

Authority remains:

1. Git object graph and exact live refs;
2. approved K3 product specification;
3. approved K3 implementation plan;
4. durable execution ledger and rulings;
5. current checkpoint evidence;
6. `docs/superpowers/state/CURRENT-STATE.json` as compact current-state/navigation manifest;
7. derived task packets and validation reports;
8. static bootstrap/index documents;
9. Project memory and chat transcripts.

### Derived artifacts rule

Task packets, lint reports, preflight reports, and result reports are **derived artifacts**.

They MUST NOT independently define:

- current task position;
- architectural semantics;
- source-of-truth plan/spec content;
- merge authority;
- execution-branch identity.

If any derived artifact disagrees with its source hashes or current state, it is stale and execution stops.

## 3. Evidence basis and failure map

H0-R2 is driven by failures directly observed during H0 rather than hypothetical process concerns.

| Failure family | Observed H0 evidence | Root cause | H0-R2 control |
|---|---|---|---|
| F001 residual execution shorthand | 43 residual `Run RED/GREEN` lines across 28 Tasks | task section depended on top-level interpretation | packet compiler + shorthand linter |
| F002 historical SHA pin | real state CLI test pinned pre-H0 main SHA | dynamic execution fact encoded as static literal | dynamic-ref lint + state-derived refs |
| F003 implementation-coupled contract tests | old release tests asserted inline `cp -R` YAML | test asserted implementation mechanism instead of boundary behavior | test-contract guard |
| F004 false independence risk | same-Project/new-chat can share Project memory | review independence inferred from session shape | explicit review capability field |
| F005 unavailable-runtime assumption | local worktree could not be populated in current harness | runtime capability assumed instead of observed | runtime capability profile |
| F006 stale bootstrap authority | Project K2 startup files lagged live K3 state | static bootstrap carried mutable status | bootstrap revision gate |
| F007 verification evidence self-reference | committing final run IDs would create another head needing new runs | durable evidence and verified HEAD coupled incorrectly | external exact-head evidence record |
| F008 ambiguous required-check identity | multiple workflow jobs previously named `test` | check identity was not unique | unique CI check contract |
| F009 process/product scope leak risk | H0 had to verify no Task 5 product files entered PR | process change lacked machine scope contract | changed-file scope guard |
| F010 non-behavioral RED risk | missing module/import can masquerade as RED | RED reason not classified | behavioral RED validator |
| F011 main drift | execution branch can outlive its base main | branch state may silently become stale | `MAIN_DRIFT` preflight |
| F012 spec/plan drift | execution annotation changes alter blob SHA | packet can be generated from stale contract | source-hash validation |
| F013 batch context inflation | lower model reading entire plan/history wastes context and invites inference | no minimal execution bundle | one-task packet working set |
| F014 hidden capability expansion | executor may improvise when tool or capability is missing | no explicit capability downgrade path | capability-profile + blocked status |

These failure families are permanent process lessons. New material failures follow the learning loop:

```text
failure
-> preserve evidence
-> classify root cause
-> add regression
-> add/update durable rule
-> validate rule
-> only then resume execution
```

## 4. Core architecture

```text
approved spec + approved plan + CURRENT-STATE
                    |
                    v
         Deterministic Task Compiler
                    |
                    v
       TaskDefinitionPacketV1 (derived, static)
                    |
                    v
        TaskExecutionEnvelopeV1 (dynamic binding)
                    |
                    v
         Packet/Envelope Preflight Validator
                    |
          +---------+---------+
          |                   |
        PASS                BLOCKED
          |                   |
          v                   v
 Low-Reasoning Executor    high-reasoning recovery
          |
          v
 RED -> intended-failure check -> minimal implementation
          |
          v
 GREEN -> affected regression -> scope diff check
          |
          v
         Result Validator
          |
          v
 durable ledger/checkpoint/state update
```

The lower-reasoning executor never receives architecture authority. It receives one validated task packet plus the minimum referenced files.

## 5. TaskDefinitionPacketV1 and TaskExecutionEnvelopeV1

### 5.1 Purpose

`TaskDefinitionPacketV1` is a deterministic, immutable-for-a-contract-revision projection of one approved task. It contains only information that should remain stable while the approved spec/plan revision is unchanged.

It is generated from:

- frozen K3 spec;
- frozen K3 plan;
- durable process failure rules.

It deliberately does **not** embed live state, branch HEAD, `base_main_sha`, Project bootstrap status, active runtime capability observations, or CI run IDs.

`TaskExecutionEnvelopeV1` is the small dynamic binding created immediately before one task execution. It binds the static task packet to the validated live execution state and runtime.

Neither artifact is manually authored after the compiler/binder exists.

### 5.2 Required task-definition packet fields

Each `TaskDefinitionPacketV1` contains:

```text
schema_version
packet_version
programme
task_id
task_title

authority:
  spec_path
  spec_blob_sha
  plan_path
  plan_blob_sha
  task_source_digest
  process_failure_rules_revision

purpose
phase
dependencies

scope:
  allowed_create
  allowed_modify
  allowed_delete
  forbidden_paths
  product_scope

interfaces:
  consumes
  produces

red:
  command
  expected_failure_class
  expected_failure_description
  invalid_failure_classes

implementation:
  intent
  prohibited_inventions

green:
  command
  expected_result

regression:
  command
  expected_result

commit:
  message

stop_conditions
required_skills
runtime_requirements
merge_authority
packet_source_digest
```

### 5.3 Required execution-envelope fields

Each `TaskExecutionEnvelopeV1` contains:

```text
schema_version
envelope_version
task_id
task_packet_digest
state_revision
base_main_sha
task_base_sha
execution_branch
project_bootstrap_revision
runtime_capability_profile_digest
created_from_ref
preflight_gate_set
```

The envelope is regenerated for the current task whenever live state changes. It is not precompiled for future tasks.

`task_base_sha` is the exact durable checkpoint HEAD from which this one task begins. Scope/result validation always compares `task_base_sha..task_result_head`, not programme base..HEAD.

### 5.4 Packet invariants

A valid task-definition packet MUST satisfy:

- exactly one task;
- no unresolved placeholder;
- no bare shorthand;
- exact RED command;
- exact GREEN command;
- exact affected regression command or explicit `NONE`;
- behavioral RED expectation;
- explicit file scope;
- explicit stop conditions;
- `merge_authority=false` for Tasks 5-41 lower-model execution;
- source hashes equal the approved spec/plan contract revision;
- `task_source_digest` equals the exact bytes emitted by Superpowers `task-brief` for that task;
- packet digest reproducible from identical static sources;
- no live SHA/state revision/runtime observation is embedded;
- no hidden architecture constant absent from spec/plan.

## 6. Deterministic task compiler and execution binder

### 6.1 Compiler role

The compiler converts the exact Superpowers-extracted task brief into `TaskDefinitionPacketV1`. The task brief remains the execution text required by `executing-plans`; the packet is a validated machine-readable projection of that same brief. It may normalize syntax; it may not invent semantics.

Allowed transformations:

- copy task title/purpose;
- copy exact file lists;
- copy Interfaces;
- copy exact RED/GREEN/regression commands;
- copy stop conditions;
- copy commit message;
- add source hashes/digest;
- add global immutable constraints explicitly required for execution;
- add fixed process guards from the failure-rule registry.

Forbidden transformations:

- invent a missing file;
- infer a missing test command;
- choose a library;
- add architecture;
- change task order;
- weaken Expected RED/GREEN;
- broaden allowed file scope;
- infer a runtime capability;
- create a fallback not already approved.

If an approved task cannot compile without interpretation:

```text
TASK_PACKET_COMPILE_BLOCKED
```

The high-reasoning session repairs the plan/spec through the appropriate approval/amendment path. The compiler never guesses.

### 6.2 Execution binder role

The binder takes:

- one valid `TaskDefinitionPacketV1`;
- validated `CURRENT-STATE`;
- observed runtime capability profile;
- verified Project bootstrap revision;

and produces `TaskExecutionEnvelopeV1` for the current `next_task` only.

The binder MUST fail if `task_id != next_task`, `base_main_sha` is absent/mismatched, the packet hashes do not match the state-approved contract hashes, or the runtime cannot satisfy `runtime_requirements`.

Dynamic execution facts belong in the envelope, not the static packet.

## 7. Superpowers execution integration

H0-R2 wraps the authoritative Superpowers execution flow; it does not replace or fork it.

### 7.1 Setup

The high/low-model execution session still follows `superpowers:executing-plans`:

1. isolated workspace/worktree verified through `using-git-worktrees`;
2. SDD workspace initialized;
3. plan/spec read;
4. pre-flight interface scan completed;
5. TDD skill loaded.

If the active runtime cannot satisfy the required Superpowers workspace/worktree behavior, low-model execution is blocked unless the authoritative Superpowers workflow itself provides an approved equivalent. H0-R2 cannot invent one.

### 7.2 Task start

For task N:

1. run Superpowers `task-start PLAN N`;
2. obtain the task brief path and BASE SHA;
3. read the brief as Superpowers requires;
4. verify brief bytes match `TaskDefinitionPacketV1.task_source_digest`;
5. set `TaskExecutionEnvelopeV1.task_base_sha = BASE`;
6. bind current state/runtime into the envelope;
7. run H0-R2 preflight.

Any brief/packet mismatch returns `TASK_PACKET_STALE`.

### 7.3 Ruling boundary

Superpowers permits ledgered rulings when the plan is wrong. H0-R2 preserves that rule but narrows what a lower-reasoning executor may decide.

A lower-reasoning executor MAY make a **mechanical ruling** only when the approved spec/Interfaces determine one unique answer without product judgment, for example:

- spelling/name mismatch where the producer interface is explicit;
- stale path alias with one canonical path already specified;
- command transcription defect where the intended exact command is already present elsewhere in the same task contract.

It MUST record the normal Superpowers `Ruling:` line.

A lower-reasoning executor MUST stop with `PLAN_DECISION_REQUIRED` when resolving the issue would choose among multiple valid product/process semantics, broaden scope, change an interface, choose a dependency, weaken an assertion, or invent a fallback.

### 7.4 RED and implementation

The normal Superpowers/TDD order remains:

```text
task-start
-> read brief
-> packet/envelope preflight
-> focused RED
-> accepted-RED freeze
-> minimal implementation
-> GREEN
-> affected regression
-> H0-R2 result validation
```

### 7.5 Task done

Only after H0-R2 result validation passes:

1. run Superpowers `task-done PLAN N BASE -- <whole-task test command>`;
2. the command is the task's approved affected-regression/whole-task verification command;
3. `task-done` reruns that command freshly and writes the SDD scratch ledger only on success;
4. then persist the durable K3 ledger entry and advance `CURRENT-STATE`.

If durable checkpoint/state advancement fails after `task-done`, mark recovery as `IMPLEMENTED_NOT_CHECKPOINTED`; do not reimplement the task.

### 7.6 Final review

H0-R2 does not weaken the Superpowers whole-branch review floor:

- use `review-package`;
- use a real fresh reviewer when available;
- otherwise explicitly record `Final review: self-review (no subagent tool)`;
- Critical/Important findings get the one Superpowers RED->GREEN fix pass;
- integration remains high-reasoning authority.

## 8. ProcessFailureRuleV1 registry

### 7.1 Purpose

Failures become durable machine-checkable lessons without becoming current state.

Create a versioned registry whose records contain:

- `rule_id`
- `failure_family`
- `severity`
- `original_symptom`
- `root_cause`
- `prevention_rule`
- `validator_id`
- `regression_test_ref`
- `applies_to`
- `introduced_by_evidence`
- `status`

Initial rules encode F001-F014 from this specification.

### 7.2 Registry authority

The registry may add execution safety restrictions. It may not alter product semantics.

A rule that would change:

- K3 event semantics;
- interfaces;
- feature scope;
- data model;
- user-visible behavior;

requires product-spec amendment rather than a process-rule edit.

## 9. Preflight contract

Before a lower-reasoning model may begin a task, one deterministic command must return:

```text
TASK_EXECUTION_READY = PASS
```

### 8.1 Required preflight gates

All must be PASS:

- `STATE_VALID`
- `PLAN_SPEC_HASH_MATCH`
- `MAIN_BASE_MATCH`
- `TASK_ID_MATCHES_NEXT_TASK`
- `TASK_PACKET_VALID`
- `TASK_PACKET_FRESH`
- `TASK_PACKET_DETERMINISTIC`
- `PROCESS_FAILURE_RULES_MATCH`
- `TASK_EXECUTION_ENVELOPE_VALID`
- `TASK_EXECUTION_ENVELOPE_FRESH`
- `TASK_SCOPE_VALID`
- `BEHAVIORAL_RED_DEFINED`
- `GREEN_DEFINED`
- `REGRESSION_DEFINED`
- `STOP_CONDITIONS_DEFINED`
- `NO_SHORTHAND`
- `NO_DYNAMIC_STALE_PINS`
- `NO_OPEN_CRITICAL`
- `NO_OPEN_IMPORTANT`
- `EXECUTION_BRANCH_VALID`
- `RUNTIME_CAPABILITIES_SATISFY_PACKET`
- `MERGE_AUTHORITY_FALSE`
- `PROJECT_BOOTSTRAP_CURRENT`

A single failure returns:

```text
TASK_EXECUTION_READY = FAIL
```

with one or more fixed failure codes.

### 8.2 No readiness inference

The lower-reasoning executor MUST NOT infer readiness from:

- green CI alone;
- a chat summary;
- a previous successful task;
- the presence of a packet file;
- a human statement that the project is "ready."

Only validated preflight output authorizes task execution.

## 10. Behavioral RED contract

RED proves intended missing behavior, not generic failure.

Allowed RED classes:

- assertion failure for missing required behavior;
- contract/schema failure intentionally targeted by the task;
- explicit file/module absence only when the task's test contract says absence itself is the intended RED.

Invalid RED classes include:

- syntax error unrelated to target behavior;
- broken import caused by wrong path;
- missing dependency unrelated to the task contract;
- stale fixture;
- environment setup failure;
- wrong working directory;
- network/provider failure unrelated to behavior.

Unexpected RED class =>

```text
INVALID_RED
-> invoke systematic-debugging
-> do not implement product code
```

### 9.1 Accepted-RED freeze

Once RED is accepted as the intended behavioral failure, persist a compact `AcceptedRedEvidenceV1` record containing:

- task ID;
- execution-envelope digest;
- exact RED command;
- failure class;
- concise expected-vs-observed assertion evidence;
- hashes of every test/fixture file participating in the focused RED;
- accepted-at task HEAD.

From accepted RED until task result validation, those test/fixture hashes are frozen.

A later change to an accepted RED test/fixture is not automatically forbidden, but it requires:

1. `Ruling:` explaining why the original RED contract was invalid or incomplete;
2. systematic-debugging evidence;
3. a new accepted RED cycle and new hashes;
4. high-reasoning authorization when the change weakens or materially changes an assertion.

This prevents a lower-reasoning executor from obtaining GREEN by silently weakening the test.

## 11. File-scope enforcement

Each packet owns an explicit changed-file policy.

After implementation, the result validator computes the task diff against the execution envelope's exact `task_base_sha`.

Every changed path must match:

- `allowed_create`;
- `allowed_modify`;
- `allowed_delete`.

Unexpected path =>

```text
SCOPE_EXPANSION_BLOCKED
```

The lower-reasoning executor may not silently expand scope.

If a legitimate dependency requires another file:

1. stop;
2. record `Ruling:`;
3. high-reasoning review decides whether this is:
   - plan annotation correction;
   - plan amendment;
   - separate prerequisite task.

## 12. Test-contract guard

H0-R2 distinguishes behavioral assertions from implementation coupling.

### 11.1 Behavioral contract tests

Prefer assertions on:

- emitted artifact;
- public/private path boundary;
- schema behavior;
- API behavior;
- deterministic content;
- failure code;
- state transition;
- output digest;
- externally observable contract.

### 11.2 Legitimate structural tests

Implementation-text assertions are allowed only when the implementation text is itself normative, such as:

- GitHub Action pinned to exact immutable SHA;
- required CI job identity;
- forbidden `paths-ignore`;
- exact branch name;
- required schema field;
- merge authority flag.

### 11.3 Guard behavior

The test-contract guard does not attempt to prove whether every test is "good."

It enforces known anti-patterns from the failure registry and maintains an explicit allowlist of structural contracts.

A new static pattern is never globally forbidden without a regression/example demonstrating why.

## 13. Dynamic-reference policy

Execution-state facts are resolved at runtime.

Do not hardcode in reusable execution tests or bootstrap docs:

- live `main` SHA;
- execution branch HEAD;
- current task number;
- current run ID;
- current Project bootstrap status.

Immutable historical evidence may contain old SHAs/run IDs when clearly labeled as historical evidence.

The linter distinguishes:

- `HISTORICAL_EVIDENCE` — allowed;
- `DYNAMIC_EXECUTION_INPUT` — must be resolved;
- `IMMUTABLE_CONTRACT_PIN` — allowed, e.g. Action commit SHA or approved spec blob.

## 14. Runtime capability profile

### 13.1 Principle

Capabilities are observed, not inferred from the model/runtime name.

The execution environment records:

- skill discovery;
- resource/file access;
- shell/script execution;
- Git worktree support;
- GitHub write capability;
- web/search;
- durable workspace;
- subagent/reviewer support;
- fresh-context review support;
- Project-file mutation capability.

Allowed values are fixed enums such as:

- `AVAILABLE`
- `UNAVAILABLE`
- `UNKNOWN`

plus capability-specific modes where needed.

### 13.2 Capability truth rule

If a required capability is unavailable:

- use an approved fallback already encoded in the packet/system;
- otherwise return `RUNTIME_CAPABILITY_BLOCKED`.

Never claim:

- a worktree existed when it did not;
- an independent reviewer ran when it did not;
- Project files were updated when the runtime cannot mutate them;
- a ruleset exists when only a process fallback exists.

## 15. Review capability truth

Every review record contains:

```text
review_mode:
  INDEPENDENT_SUBAGENT
  FRESH_EXTERNAL_CONTEXT
  SELF_REVIEW
```

Only actual independent execution may use `INDEPENDENT_SUBAGENT`.

A new chat inside the same ChatGPT Project is not automatically independent.

The lower-reasoning executor does not decide review mode.

## 16. Verification evidence without self-reference

### 15.1 Problem

If exact-head run IDs are committed into the same branch, the commit changes HEAD and therefore requires another exact-head verification. Repeating this creates an evidence loop.

### 15.2 Rule

Durable Git history records:

- required verification commands;
- expected check identities;
- reviewed code/control commit;
- verification policy.

The final exact-head run IDs/conclusions are stored in one of:

1. PR metadata/body/checks while the PR is open;
2. post-merge verification record created on a later authorized checkpoint;
3. external durable execution evidence service if one is adopted later.

The verified code/control HEAD is not modified merely to record its own run IDs.

This is `EXTERNAL_FINAL_EVIDENCE`.

## 17. CI execution model

### 16.1 Branch verification

For PR branches:

- required quality workflow runs on `pull_request`;
- required server/adapter workflow runs on `pull_request`;
- superseded PR runs are cancelled by concurrency.

### 16.2 Post-merge verification

For `main`:

- server/adapter verification runs on `push: main`;
- Pages validation/deployment runs on `push: main`.

Do not run the same server/adapter suite once for arbitrary branch `push` and again for `pull_request`.

### 16.3 Check identity

Required check identities remain unique and stable:

- `quality-gate`
- `server-adapter-gate`

## 18. Result validator

After GREEN/regression, the result validator checks the task definition packet, the exact execution envelope that authorized the run, and the accepted RED evidence:

- expected GREEN command passed;
- affected regression passed;
- accepted RED test/fixture hashes are unchanged since accepted RED, unless a valid re-RED Ruling replaced them;
- changed-file scope is computed from `task_base_sha`;
- no forbidden file;
- current live main still equals branch base;
- packet source hashes still match;
- envelope `state_revision/base_main_sha/execution_branch` still match current validated state;
- `task_base_sha` is still the last durably completed task checkpoint;
- no new Critical/Important process finding;
- commit message matches packet;
- task ledger entry contains required evidence fields.

Only then may:

```text
TASK_RESULT_ACCEPTED = PASS
```

and the durable state advance to the next task.

## 19. Task completion atomicity

A task is not durably complete merely because implementation commit exists.

Logical completion requires:

1. implementation commit;
2. GREEN;
3. affected regression;
4. scope validation;
5. result validation;
6. durable ledger completion entry;
7. current-state advancement.

If state update fails after implementation, recovery resumes from the unfinished completion transaction; it does not reimplement the task.

The system must support:

```text
IMPLEMENTED_NOT_CHECKPOINTED
```

as a recovery state.

## 20. Batch execution policy

Batching is scheduling only. It never merges task contracts.

Initial lower-model ramp:

```text
Tasks 5-7:
  max_batch_size = 1

after 3 consecutive accepted tasks
with no Critical/Important process finding:
  max_batch_size = 2

after 2 consecutive clean batches:
  max_batch_size = 3
```

Any of the following resets batch size to 1:

- Critical/Important finding;
- `INVALID_RED`;
- scope expansion attempt;
- state/hash drift;
- unexpected runtime capability gap;
- task packet compiler defect;
- rollback/recovery event.

Each task in a batch retains its own:

- BASE;
- packet;
- RED;
- GREEN;
- regression;
- diff;
- commit;
- ledger record;
- result validation.

## 21. Context budget contract

The lower-reasoning executor receives only:

1. static Project bootstrap;
2. validated `CURRENT-STATE`;
3. Superpowers current task brief from `task-start`;
4. matching `TaskDefinitionPacketV1`;
5. current `TaskExecutionEnvelopeV1`;
6. relevant approved spec slice;
7. files listed in task scope/interfaces;
8. focused tests;
9. current SDD/task execution record.

It does not receive by default:

- K1/K2 historical narrative;
- old handoffs;
- full K3 plan;
- full K3 spec when only one section is needed;
- full CI logs;
- prior task conversations.

Large outputs are persisted to artifacts/logs and summarized with references.

No numeric token-savings guarantee is part of the contract.

## 22. ChatGPT Project bootstrap

The Project remains static bootstrap/navigation, not live state.

Canonical Project bootstrap after H0-R2 contains:

- `PROJECT-INDEX.md`;
- `RECOVERY-PROTOCOL.md`;
- `DURABLE-FILE-MAP.md`;
- bootstrap revision marker;
- optional README explaining recovery.

The Project bootstrap tells the model how to locate live Git state. It does not copy live task status.

`PROJECT_BOOTSTRAP_CURRENT=PASS` requires a high-reasoning verification that the active Project contains the expected bootstrap revision.

## 23. K3 Task 5 dry-run before product execution

Before a lower-reasoning model may modify K3 Task 5 product files, perform a no-write dry-run using its compiled packet.

The dry-run must prove the executor can identify:

- purpose;
- allowed files;
- interfaces;
- exact RED command;
- intended RED class;
- implementation constraints;
- GREEN command;
- regression command;
- stop conditions;
- merge prohibition.

The dry-run must not modify product files.

Failure => packet/compiler repair before product execution.

## 24. Adversarial readiness tests

H0-R2 must include deterministic pressure cases proving fail-closed behavior.

At minimum:

1. live main differs from `base_main_sha`;
2. packet plan hash stale;
3. packet spec hash stale;
4. task ID does not equal `next_task`;
5. one allowed file removed from packet;
6. executor proposes an extra changed file;
7. RED fails by unrelated import/setup error;
8. GREEN passes after weakening a test;
9. runtime claims a capability not declared;
10. Project bootstrap revision stale;
11. open Important finding exists;
12. packet contains architecture ambiguity;
13. packet regenerated with same inputs but different bytes;
14. review mode falsely claims independence;
15. lower executor attempts main integration.

Every case must end in a fixed BLOCKED/FAIL result, never improvisation.

## 25. New execution gates

H0-R2 extends readiness with:

- `PROCESS_FAILURE_RULES_VALID`
- `TASK_PACKET_SCHEMA_VALID`
- `TASK_PACKET_COMPILER_VALID`
- `TASK_EXECUTION_BINDER_VALID`
- `ALL_REMAINING_TASK_PACKETS_VALID`
- `TASK_PACKET_DETERMINISM_VALID`
- `TASK_SCOPE_GUARD_VALID`
- `BEHAVIORAL_RED_GUARD_VALID`
- `ACCEPTED_RED_FREEZE_VALID`
- `DYNAMIC_REF_GUARD_VALID`
- `TEST_CONTRACT_GUARD_VALID`
- `RUNTIME_CAPABILITY_PROFILE_VALID`
- `RESULT_VALIDATOR_VALID`
- `CI_EXECUTION_MODEL_VALID`
- `TASK5_DRY_RUN_PASS`
- `ADVERSARIAL_READINESS_PASS`

`low_model_ready=true` requires every applicable H0 and H0-R2 readiness gate to be PASS.

## 26. Error/status vocabulary

Fixed status codes include:

- `TASK_PACKET_COMPILE_BLOCKED`
- `TASK_PACKET_SCHEMA_INVALID`
- `TASK_PACKET_STALE`
- `TASK_PACKET_NONDETERMINISTIC`
- `PLAN_DECISION_REQUIRED`
- `TASK_EXECUTION_ENVELOPE_INVALID`
- `TASK_EXECUTION_ENVELOPE_STALE`
- `TASK_ID_MISMATCH`
- `MAIN_DRIFT`
- `PLAN_SPEC_HASH_MISMATCH`
- `RUNTIME_CAPABILITY_BLOCKED`
- `INVALID_RED`
- `ACCEPTED_RED_MUTATED`
- `UNEXPECTED_FAILURE`
- `SCOPE_EXPANSION_BLOCKED`
- `TEST_WEAKENING_BLOCKED`
- `OPEN_FINDING_BLOCKED`
- `PROJECT_BOOTSTRAP_STALE`
- `MERGE_AUTHORITY_BLOCKED`
- `IMPLEMENTED_NOT_CHECKPOINTED`
- `TASK_RESULT_REJECTED`
- `TASK_RESULT_ACCEPTED`
- `TASK_EXECUTION_READY`

The lower-reasoning executor chooses none of these freely; validators emit them.

## 27. What remains high-reasoning work

Even after H0-R2, these remain outside lower-model authority:

- product architecture changes;
- spec amendments;
- implementation-plan semantic amendments;
- resolving spec/plan contradictions;
- approving legitimate scope expansion;
- changing process-failure rules that broaden product semantics;
- whole-branch final review;
- integration/merge to `main`;
- post-merge release judgment;
- changing `merge_guard_mode`;
- certifying Project bootstrap revision;
- deciding whether a novel failure requires architecture change.

## 28. H0-R2 implementation boundary

H0-R2 may create or modify process/control-plane artifacts including:

- packet schema/compiler/validator;
- execution-envelope schema/binder/validator;
- failure-rule registry;
- task linter;
- runtime capability schema/profile;
- preflight/result validators;
- accepted-RED evidence schema/validator;
- CI process checks;
- static bootstrap pack;
- process tests.

It MUST NOT implement K3 Task 5 product behavior.

No files from the K3 Task 5 product file set may be modified except the K3 implementation plan's execution annotations if an approved plan correction is required before freeze.

## 29. Integration sequence

H0-R2 is not mixed into reviewed PR #23.

Sequence:

```text
1. Merge exact reviewed H0 PR #23
2. Verify post-merge main
3. Create H0-R2 implementation branch from exact integrated main
4. Implement H0-R2 under its own spec/plan/TDD/review gate
5. Merge H0-R2 after exact-head high-reasoning review
6. Verify post-merge main
7. Create/refresh impl/k3-learner-evidence-engine from exact integrated main
8. Initialize official K3 SDD workspace
9. Produce/verify Project bootstrap pack
10. Compile/validate Tasks 5-41 packets
11. Run Task 5 no-write dry-run + adversarial pressure tests
12. Set revision state with low_model_ready=true
13. Begin K3 Task 5 on lower-reasoning model
```

This sequence avoids reopening PR #23 and prevents process hardening from being mixed with K3 product implementation.

## 30. Initial implementation decomposition

After written-spec approval, `writing-plans` will convert this design into small TDD tasks. The intended decomposition is:

### Phase R2-A — integrate H0 and establish R2 baseline
- H0 merge/post-merge verification;
- exact integrated-main checkpoint;
- create H0-R2 implementation branch.

### Phase R2-B — packet contracts
- TaskDefinitionPacketV1 schema;
- TaskExecutionEnvelopeV1 schema/binder;
- ProcessFailureRuleV1 schema/registry;
- runtime capability profile schema;
- deterministic compiler;
- compile/validate Tasks 5-41.

### Phase R2-C — fail-closed guards
- plan/task linter;
- dynamic-reference guard;
- behavioral RED guard;
- accepted-RED freeze guard;
- test-contract guard;
- file-scope guard;
- preflight validator;
- result validator.

### Phase R2-D — CI and evidence flow
- remove duplicate branch push server execution;
- task packet validation in CI;
- external exact-head evidence contract;
- recovery state for implemented-not-checkpointed.

### Phase R2-E — weak-model readiness
- Project bootstrap pack;
- real Project revision verification;
- Task 5 no-write dry-run;
- adversarial pressure suite;
- whole-control-plane review;
- exact-head merge/post-merge verification;
- initialize real K3 execution branch/state/SDD;
- certify `low_model_ready=true`.

The implementation plan may split these further. It may not combine independent gates merely to reduce task count.

## 31. Acceptance contract

H0-R2 is complete only when fresh evidence proves:

1. H0 and H0-R2 are integrated and post-merge verified;
2. Tasks 5-41 compile into valid deterministic static task-definition packets;
3. identical compiler inputs reproduce identical task-definition packet bytes regardless of active runtime or state revision;
4. execution envelopes are generated only for the current task and bind packet + live state + runtime truth;
5. every packet is self-contained and source-hash bound;
6. all known H0 failure families F001-F014 have durable regression coverage or a documented non-automatable compensating control;
7. preflight fails closed on every adversarial pressure case;
8. result validation catches unexpected file changes/test weakening/state drift;
9. runtime capability profile matches the active execution environment;
10. CI has no duplicate PR-branch server push run;
11. no open Critical/Important finding remains;
12. active Project bootstrap revision is verified;
13. Task 5 no-write dry-run passes;
14. real K3 execution branch is based on exact integrated main;
15. official K3 SDD workspace initializes successfully or the active runtime records a verified approved equivalent only if the authoritative Superpowers workflow allows it;
16. `CURRENT-STATE` validates with:
    - `next_task=5`;
    - `low_model_ready=true`;
    - every applicable H0/H0-R2 readiness gate PASS;
    - `merge_guard_mode` truthfully representing native protection or the high-reasoning fallback.

Only then may the user be told to switch execution to the lower-reasoning model.

## 32. Non-goals

H0-R2 does not:

- make architectural decisions on behalf of the product plan;
- create a second current-state truth;
- create a generic autonomous agent platform;
- replace Superpowers;
- replace Evidence Engineering Research;
- guarantee performance for every model/runtime;
- claim a lower-reasoning model is safe outside validated packet scope;
- add product features;
- weaken tests to improve execution success;
- automate main merges;
- hide unavailable runtime capabilities;
- claim independent review when only self-review occurred;
- promise a fixed context/token reduction.

## 33. Design decision

Adopt a deterministic **Task Packet + Preflight + Result Validation** layer as H0-R2 after H0 integration and before K3 Task 5.

The guiding rule is:

> The lower-reasoning model executes decisions; it does not make missing decisions.

A missing decision is a blocker to repair in the high-reasoning design/plan layer, not an invitation for the executor to infer.

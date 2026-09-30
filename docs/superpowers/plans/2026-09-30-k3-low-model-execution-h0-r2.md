# H0-R2 Deterministic Low-Model Execution Layer — Implementation Plan

> **Execution mode:** Use the authoritative Superpowers execution workflow available in the active runtime. This plan is intentionally self-contained for inline execution and lower-reasoning handoff. Do not implement K3 Task 5 product behavior while executing H0-R2.

**Goal:** Convert the approved H0-R2 design into a deterministic execution-control layer that compiles K3 Tasks 5-41 into static task-definition packets, binds the current task to live state/runtime through an execution envelope, fails closed on known process failure families, integrates with Superpowers task-start/task-done, and certifies lower-reasoning execution only after post-merge/runtime/Project gates are proven.

**Spec:** `docs/superpowers/specs/2026-09-30-k3-low-model-execution-h0-r2-design.md`

**H0 integration prerequisite:** PR #23 exact reviewed head `27dd4f33218d5868bc4b8e057bb4f391c6fde4e6`.

**K3 product-plan contract:** `docs/superpowers/plans/2026-09-29-k3-learner-evidence-engine.md`.

## Global Constraints

- H0-R2 is process/control-plane work only.
- Do not create or modify K3 Task 5 product implementation files:
  - `scripts/generate_k3_validators.js`
  - `src/evidence/generatedValidators.js`
  - `src/evidence/ids.js`
  - `src/evidence/contract.js`
  - `tests/k3-generated-validators.test.js`
  - `tests/k3-evidence-contract-runtime.test.js`
- The approved K3 product spec and plan remain semantic authority.
- `CURRENT-STATE.json` remains the only mutable current-state summary.
- Task-definition packets are derived static projections, not new authority.
- Execution envelopes and Accepted RED records are dynamic SDD-workspace artifacts.
- Every behavior-changing task follows RED -> intended-failure verification -> minimal GREEN -> affected regression.
- On unexpected failure, use systematic-debugging before modifying implementation.
- On a spec/plan contradiction requiring judgment, stop with `PLAN_DECISION_REQUIRED`; do not improvise.
- Mechanical rulings are allowed only where one unique answer already exists in approved authority.
- Never claim a worktree, independent reviewer, Project-file mutation, branch protection, or runtime capability that was not actually observed.
- Low-reasoning execution never has merge authority.
- Never weaken an accepted RED test silently.
- Never record final exact-head run IDs by changing the exact head they verify.
- Long logs belong in the SDD workspace/CI artifacts; durable ledgers store concise evidence.
- The active implementation runtime must use the authoritative Superpowers `task-start` and `task-done` lifecycle when those scripts are available.
- If the active runtime cannot satisfy the authoritative Superpowers isolated-workspace requirement, do not set `low_model_ready=true`.

## Review Focus

The final whole-branch review must deliberately test:

1. task-packet extraction drift versus actual Superpowers task brief;
2. self-referential hashes/digests;
3. stale dynamic SHA/task/run literals;
4. packet source-hash drift after plan/spec changes;
5. packet determinism across two clean generations;
6. scope validation against per-task BASE rather than programme BASE;
7. Accepted RED mutation/test weakening;
8. duplicate source-of-truth state;
9. false runtime/reviewer capability claims;
10. CI duplicate branch push + PR execution;
11. process changes leaking into K3 Task 5 product files;
12. recovery after implementation commit but before durable checkpoint;
13. Project bootstrap staleness;
14. lower-model attempts to merge or broaden scope.

## Execution-Class Matrix

The executor MUST classify each task before running it. A task is complete only when its class-specific contract is satisfied.

| Class | Tasks | Required contract |
|---|---|---|
| `INTEGRATION` | 1, 2, 23, 24 | exact preconditions, exact reviewed/ref SHA, exact action, exact postconditions, stop conditions |
| `SETUP` | 3, 25 | capability preconditions, exact branch/workspace identity, exact verification, stop conditions |
| `TDD` | 4-20, 26 | exact RED command, Expected RED, minimal implementation, exact GREEN, Expected GREEN, affected regression, stop conditions, commit |
| `VERIFICATION` | 21, 22, 28, 29, 30 | exact inputs, exact verification command/procedure, Expected result, no mutation beyond named evidence/state files, stop conditions |
| `EXTERNAL` | 27 | exact user-side action, exact re-read verification, state remains blocked until observed PASS |

For `TDD` tasks, a missing or non-behavioral RED is a plan defect. For non-TDD classes, do not invent a fake RED merely to satisfy form; use the class-specific verification contract.

## Gate and Failure-Code Ownership

Every H0-R2 readiness gate has one primary owning task. A task may prove supporting behavior, but only the owner advances the named gate after fresh verification.

| Gate | Owner | Verification |
|---|---:|---|
| `PROCESS_FAILURE_RULES_VALID` | 5 | rules schema/registry validator green |
| `TASK_PACKET_SCHEMA_VALID` | 6 | packet schema validator green |
| `TASK_PACKET_COMPILER_VALID` | 8 | compiler contract tests green |
| `TASK_EXECUTION_BINDER_VALID` | 11 | envelope/binder tests green |
| `ALL_REMAINING_TASK_PACKETS_VALID` | 9 | 37/37 packets validate |
| `TASK_PACKET_DETERMINISM_VALID` | 9 | clean regeneration produces zero byte diff |
| `TASK_SCOPE_GUARD_VALID` | 14 | per-task BASE/scope guard tests green |
| `BEHAVIORAL_RED_GUARD_VALID` | 13 | intended-vs-invalid RED classification tests green |
| `ACCEPTED_RED_FREEZE_VALID` | 13 | accepted test/fixture hash mutation is blocked |
| `DYNAMIC_REF_GUARD_VALID` | 12 | execution-contract lint rejects stale dynamic refs |
| `TEST_CONTRACT_GUARD_VALID` | 15 | known implementation-coupling regressions blocked |
| `RUNTIME_CAPABILITY_PROFILE_VALID` | 10 | capability profile tests green |
| `RESULT_VALIDATOR_VALID` | 17 | result acceptance/rejection tests green |
| `CI_EXECUTION_MODEL_VALID` | 18 | workflow trigger/check contract tests green |
| `TASK5_DRY_RUN_PASS` | 28 | no-write Task 5 dry-run passes |
| `ADVERSARIAL_READINESS_PASS` | 29 | fixture suite + live-runtime adversarial suite both pass |

The following failure/status codes require direct regression coverage or an explicit non-automatable compensating-control test:

| Code | Primary coverage task |
|---|---:|
| `TASK_PACKET_COMPILE_BLOCKED` | 7, 8 |
| `TASK_PACKET_SCHEMA_INVALID` | 6 |
| `TASK_PACKET_STALE` | 11, 16 |
| `TASK_PACKET_NONDETERMINISTIC` | 9, 20 |
| `PLAN_DECISION_REQUIRED` | 12, 16, 20 |
| `TASK_EXECUTION_ENVELOPE_INVALID` | 11 |
| `TASK_EXECUTION_ENVELOPE_STALE` | 11, 17 |
| `TASK_ID_MISMATCH` | 11, 16 |
| `MAIN_DRIFT` | 11, 16, 20, 29 |
| `PLAN_SPEC_HASH_MISMATCH` | 11, 16, 20 |
| `RUNTIME_CAPABILITY_BLOCKED` | 10, 11, 20 |
| `INVALID_RED` | 13, 20, 29 |
| `ACCEPTED_RED_MUTATED` | 13, 17, 20 |
| `UNEXPECTED_FAILURE` | 5 failure rule + execution/systematic-debugging contract |
| `SCOPE_EXPANSION_BLOCKED` | 14, 20, 29 |
| `TEST_WEAKENING_BLOCKED` | 13, 17, 20 |
| `OPEN_FINDING_BLOCKED` | 16, 20 |
| `PROJECT_BOOTSTRAP_STALE` | 16, 20, 27, 29 |
| `MERGE_AUTHORITY_BLOCKED` | 16, 20, 29 |
| `IMPLEMENTED_NOT_CHECKPOINTED` | 17, 20 |
| `TASK_RESULT_REJECTED` | 17 |
| `TASK_RESULT_ACCEPTED` | 17 |
| `TASK_EXECUTION_READY` | 16 |

Task 20 must include a machine-readable coverage assertion that every code in the approved Spec appears in this ownership table and has at least one executable regression or explicitly named compensating-control assertion.

## Canonical File Layout

### Schemas / durable process contracts
- `docs/superpowers/process/task-definition-packet-v1.schema.json`
- `docs/superpowers/process/task-execution-envelope-v1.schema.json`
- `docs/superpowers/process/accepted-red-evidence-v1.schema.json`
- `docs/superpowers/process/runtime-capability-profile-v1.schema.json`
- `docs/superpowers/process/process-failure-rule-v1.schema.json`
- `docs/superpowers/process/process-failure-rules-v1.json`

### Generated static packets
- `docs/superpowers/task-packets/k3/task-005.json` through `task-041.json`

### Node process-control implementation
- `scripts/process/stable_json.js`
- `scripts/process/k3_task_extract.js`
- `scripts/process/validate_failure_rules.js`
- `scripts/process/compile_k3_task_packets.js`
- `scripts/process/validate_task_packet.js`
- `scripts/process/runtime_capabilities.js`
- `scripts/process/bind_task_execution.js`
- `scripts/process/lint_execution_contracts.js`
- `scripts/process/validate_accepted_red.js`
- `scripts/process/check_task_scope.js`
- `scripts/process/preflight_task.js`
- `scripts/process/validate_task_result.js`
- `scripts/process/adversarial_readiness.js`

### Tests
- `tests/h0-r2-stable-json.test.js`
- `tests/h0-r2-failure-rules.test.js`
- `tests/h0-r2-task-packet-schema.test.js`
- `tests/h0-r2-task-compiler.test.js`
- `tests/h0-r2-runtime-capabilities.test.js`
- `tests/h0-r2-execution-envelope.test.js`
- `tests/h0-r2-execution-lint.test.js`
- `tests/h0-r2-accepted-red.test.js`
- `tests/h0-r2-scope-guard.test.js`
- `tests/h0-r2-preflight.test.js`
- `tests/h0-r2-result-validator.test.js`
- `tests/h0-r2-adversarial-readiness.test.js`
- `tests/h0-r2-ci-contract.test.js`
- `tests/h0-r2-project-bootstrap.test.js`

### Durable reviews / state
- `docs/superpowers/reviews/2026-09-30-h0-r2-execution-ledger.md`
- `docs/superpowers/reviews/2026-09-30-h0-r2-checkpoint.md`
- `docs/superpowers/reviews/2026-09-30-h0-r2-whole-branch-review.md`
- modify `docs/superpowers/state/current-state.schema.json`
- modify `docs/superpowers/state/CURRENT-STATE.json`

---

# Phase R2-A — Integrate H0 and establish the authoritative R2 baseline

### Task 1: Merge exact H0 PR #23 and verify post-merge main

**Purpose:** Establish the exact integrated H0 baseline before any H0-R2 implementation.

**Files:** no pre-merge source changes.

**Preconditions:**
- PR #23 head is exactly `27dd4f33218d5868bc4b8e057bb4f391c6fde4e6`.
- PR #23 is mergeable and not merged.
- Exact-head `quality-gate` and `server-adapter-gate` remain SUCCESS.
- live `main` still equals the PR base or GitHub reports a clean merge against the same reviewed tree.

**Stop conditions:**
- PR head differs -> STOP `H0_HEAD_DRIFT`.
- required check not SUCCESS -> STOP `H0_EXACT_HEAD_NOT_GREEN`.
- live main drift changes reviewed merge semantics -> STOP `MAIN_DRIFT`.
- merge requires bypassing an unexpected protection/security control -> STOP.

- [ ] Verify PR #23 exact head and checks from GitHub.
- [ ] Merge only that exact reviewed head through the high-reasoning merge gate.
- [ ] Resolve the resulting live `main` SHA.
- [ ] Verify post-merge `Validate and deploy GitHub Pages` and `Server and adapter contract tests` on that exact main SHA.
- [ ] Read merged `CURRENT-STATE.json`; confirm `low_model_ready=false`.

**Expected:** H0 integrated; post-merge checks SUCCESS; no K3 Task 5 code exists.

**Commit:** merge commit is created by GitHub; no extra evidence-only commit.

### Task 2: Integrate the approved H0-R2 spec and implementation plan as design authority

**Purpose:** Put the approved design/plan on integrated main before implementation starts.

**Files:**
- Existing: `docs/superpowers/specs/2026-09-30-k3-low-model-execution-h0-r2-design.md`
- This plan: `docs/superpowers/plans/2026-09-30-k3-low-model-execution-h0-r2.md`

**RED:** documentation integration check on main.
Run:
`test -f docs/superpowers/specs/2026-09-30-k3-low-model-execution-h0-r2-design.md && test -f docs/superpowers/plans/2026-09-30-k3-low-model-execution-h0-r2.md`

**Expected RED:** FAIL before the approved design branch is integrated into main.

**Implementation:** open a design-doc PR containing only the approved spec + approved plan after H0 merge.

**GREEN:** same command.

**Expected GREEN:** PASS on integrated main; changed-file list contains only approved design authority files.

**Affected regression:** `npm test`.

**Stop conditions:** any product/runtime file in design PR -> STOP `DESIGN_SCOPE_LEAK`.

**Commit/merge:** exact reviewed design-doc head only.

### Task 3: Create isolated H0-R2 implementation branch/workspace and durable ledger

**Purpose:** Start R2 implementation from exact integrated main, not the design branch.

**Files:**
- Create `docs/superpowers/reviews/2026-09-30-h0-r2-execution-ledger.md`.

**Precondition:** authoritative Superpowers isolated-workspace procedure succeeds.

**RED:** workspace baseline evidence absent.
Run: authoritative Superpowers workspace/ledger check for this plan.

**Expected RED:** no H0-R2 SDD ledger exists yet.

**Implementation:**
- create `impl/k3-low-model-execution-h0-r2` from exact live main;
- create/verify worktree using `using-git-worktrees`;
- initialize SDD workspace for this plan;
- write ledger identity line and pre-flight interface scan.

**GREEN:** authoritative workspace/ledger check.

**Expected GREEN:** branch/worktree/SDD ledger all point to this plan and exact main BASE.

**Affected regression:** `npm test`.

**Stop conditions:** worktree/SDD unavailable and no authoritative Superpowers equivalent -> STOP `RUNTIME_CAPABILITY_BLOCKED`.

**Commit:** `docs: initialize H0-R2 execution ledger`.

---

# Phase R2-B — Canonical serialization and permanent failure rules

### Task 4: Add canonical stable JSON writer

**Purpose:** Make packet/profile/envelope bytes reproducible without self-referential fields or runtime-dependent ordering.

**Files:**
- Create `scripts/process/stable_json.js`
- Create `tests/h0-r2-stable-json.test.js`

**Interface:**
- `stableJson(value, propertyOrderByPath = {}) -> string`
- `sha256Text(text) -> 64-lowercase-hex`
- `propertyOrderByPath` maps JSON-pointer-like object paths to the exact schema-defined key order; object keys not listed at a path are appended in lexical order so unexpected keys serialize deterministically before schema rejection.

**RED command:** `node --test tests/h0-r2-stable-json.test.js`

**Expected RED:** FAIL because module does not exist.

**Tests cover:**
- stable object key ordering defined by caller/schema order helper;
- array order preserved;
- two-space indentation;
- LF only;
- exactly one trailing newline;
- same semantic input -> byte-identical output;
- SHA-256 lowercase 64 hex.

**Implementation:** Node standard library only; no new package.

**GREEN command:** `node --test tests/h0-r2-stable-json.test.js`

**Expected GREEN:** PASS, zero failures.

**Affected regression:** `npm test`.

**Stop conditions:** need for third-party canonicalization library -> `PLAN_DECISION_REQUIRED`.

**Commit:** `feat: add stable process JSON primitives`.

### Task 5: Define ProcessFailureRuleV1 and encode F001-F014

**Files:**
- Create `docs/superpowers/process/process-failure-rule-v1.schema.json`
- Create `docs/superpowers/process/process-failure-rules-v1.json`
- Create `scripts/process/validate_failure_rules.js`
- Create `tests/h0-r2-failure-rules.test.js`
- Modify `package.json`

**Interface:**
- `validateFailureRules(document) -> {ok, errors}`
- package script: `process:validate-rules`

**RED command:** `node --test tests/h0-r2-failure-rules.test.js`

**Expected RED:** FAIL because schema/registry/validator are absent.

**Tests cover:**
- exactly F001-F014 exist;
- IDs unique;
- required root-cause/prevention/validator/regression/evidence fields;
- severity enum;
- no product-semantic rule;
- deterministic revision/digest.

**GREEN command:** `node --test tests/h0-r2-failure-rules.test.js && npm run process:validate-rules`

**Expected GREEN:** PASS.

**Affected regression:** `npm test`.

**Stop conditions:** a rule requires product-semantic change -> STOP `PLAN_DECISION_REQUIRED`.

**Commit:** `feat: encode H0 process failure rules`.

---

# Phase R2-C — Static task-definition packets

### Task 6: Define TaskDefinitionPacketV1 schema

**Files:**
- Create `docs/superpowers/process/task-definition-packet-v1.schema.json`
- Create `scripts/process/validate_task_packet.js`
- Create `tests/h0-r2-task-packet-schema.test.js`

**Interface:**
- `validateTaskDefinitionPacket(packet) -> {ok, code, errors}`
- code: `TASK_PACKET_SCHEMA_INVALID` on failure.

**RED command:** `node --test tests/h0-r2-task-packet-schema.test.js`

**Expected RED:** FAIL because packet schema/validator do not exist.

**Tests cover every required Spec field and reject:**
- live `state_revision`;
- live `base_main_sha`;
- runtime observation;
- CI run ID;
- `merge_authority=true`;
- empty RED/GREEN;
- unresolved placeholder;
- missing explicit scope/stop conditions.

**GREEN command:** `node --test tests/h0-r2-task-packet-schema.test.js`

**Expected GREEN:** PASS.

**Affected regression:** `npm test`.

**Stop conditions:** unexpected failure class -> systematic-debugging; requirement not uniquely determined by approved spec/plan -> `PLAN_DECISION_REQUIRED`; file outside named task scope -> `SCOPE_EXPANSION_BLOCKED`.

**Commit:** `feat: define H0-R2 task packet contract`.

### Task 7: Implement deterministic K3 task extraction

**Files:**
- Create `scripts/process/k3_task_extract.js`
- Create `tests/h0-r2-task-extract.test.js`

**Interface:**
- `extractTask(planText, taskId) -> exact task section string`
- `taskSourceDigest(section) -> sha256`

**RED command:** `node --test tests/h0-r2-task-extract.test.js`

**Expected RED:** FAIL because extractor does not exist.

**Tests cover:**
- exact extraction for Task 5, middle task, Task 41;
- no neighboring task bytes;
- task source digest stable;
- 5-41 all extract exactly once;
- missing/duplicate task blocked.

**GREEN command:** `node --test tests/h0-r2-task-extract.test.js`

**Expected GREEN:** PASS.

**Affected regression:** `node --test tests/h0-k3-task-briefs.test.js && npm test`.

**Stop conditions:** task format cannot be parsed without inference -> `TASK_PACKET_COMPILE_BLOCKED`.

**Commit:** `feat: add deterministic K3 task extraction`.

### Task 8: Implement deterministic K3 task packet compiler

**Files:**
- Create `scripts/process/compile_k3_task_packets.js`
- Create `tests/h0-r2-task-compiler.test.js`
- Create generated `docs/superpowers/task-packets/k3/task-005.json` … `task-041.json`
- Modify `package.json`

**Interface:**
- `compileTaskPacket({taskId, planText, specBlobSha, planBlobSha, rulesRevision, rulesDigest})`
- CLI: `node scripts/process/compile_k3_task_packets.js`
- package script: `process:compile-k3-packets`

**RED command:** `node --test tests/h0-r2-task-compiler.test.js`

**Expected RED:** FAIL because compiler/generated packets do not exist.

**Tests cover:**
- compiler copies only approved fields;
- no invented path/dependency/command;
- `task_source_digest` equals extracted section bytes;
- `source_contract_digest` canonical tuple;
- no self-digest field;
- Task 5 exact expected scope and commands;
- Task 41 exact expected close-out contract.

**GREEN command:** `node --test tests/h0-r2-task-compiler.test.js`

**Expected GREEN:** PASS.

**Affected regression:** `npm test`.

**Stop conditions:** unexpected failure class -> systematic-debugging; requirement not uniquely determined by approved spec/plan -> `PLAN_DECISION_REQUIRED`; file outside named task scope -> `SCOPE_EXPANSION_BLOCKED`.

**Commit:** `feat: compile deterministic K3 task packets`.

### Task 9: Prove all Tasks 5-41 packet completeness and byte determinism

**Files:**
- Modify `tests/h0-r2-task-compiler.test.js` or create `tests/h0-r2-all-task-packets.test.js`.

**RED command:** delete/corrupt one generated packet in test fixture/temp output and run:
`node --test tests/h0-r2-all-task-packets.test.js`

**Expected RED:** FAIL with missing/stale/non-deterministic packet finding.

**Implementation:** add regeneration comparator in temp directory; checked-in packets must match byte-for-byte.

**GREEN command:**
`node scripts/process/compile_k3_task_packets.js --check && node --test tests/h0-r2-all-task-packets.test.js`

**Expected GREEN:**
- 37/37 packets valid;
- regeneration zero diff;
- no runtime/live fields.

**Affected regression:** `npm test`.

**Stop conditions:** unexpected failure class -> systematic-debugging; requirement not uniquely determined by approved spec/plan -> `PLAN_DECISION_REQUIRED`; file outside named task scope -> `SCOPE_EXPANSION_BLOCKED`.

**Commit:** `test: enforce K3 packet completeness and determinism`.

---

# Phase R2-D — Runtime truth and execution envelope

### Task 10: Define RuntimeCapabilityProfileV1

**Files:**
- Create `docs/superpowers/process/runtime-capability-profile-v1.schema.json`
- Create `scripts/process/runtime_capabilities.js`
- Create `tests/h0-r2-runtime-capabilities.test.js`

**Interface:**
- fixed capability keys from Spec;
- values `AVAILABLE|UNAVAILABLE|UNKNOWN` plus documented mode fields;
- no inference from model name;
- reviewer capability is observational only; it cannot label a review `INDEPENDENT_SUBAGENT` unless an actual independent reviewer tool/run is observed.

**RED:** `node --test tests/h0-r2-runtime-capabilities.test.js`

**Expected RED:** FAIL because profile implementation absent.

**GREEN:** same command.

**Expected GREEN:** PASS; missing observation -> UNKNOWN, never AVAILABLE.

**Regression:** `npm test`.

**Stop conditions:** unexpected failure class -> systematic-debugging; requirement not uniquely determined by approved spec/plan -> `PLAN_DECISION_REQUIRED`; file outside named task scope -> `SCOPE_EXPANSION_BLOCKED`.

**Commit:** `feat: add truthful runtime capability profile`.

### Task 11: Define TaskExecutionEnvelopeV1 and binder

**Files:**
- Create `docs/superpowers/process/task-execution-envelope-v1.schema.json`
- Create `scripts/process/bind_task_execution.js`
- Create `tests/h0-r2-execution-envelope.test.js`

**Interface:**
- binder consumes packet + CURRENT-STATE + runtime profile + task-start BASE;
- outputs dynamic envelope only for `next_task`.

**RED:** `node --test tests/h0-r2-execution-envelope.test.js`

**Expected RED:** FAIL because binder absent.

**Tests reject:**
- task != next_task;
- null/mismatched `base_main_sha`;
- task-start BASE missing;
- stale packet source hashes;
- insufficient required runtime capability;
- stale Project bootstrap;
- merge authority true.

**GREEN:** same command.

**Expected GREEN:** PASS.

**Regression:** `npm test`.

**Stop conditions:** unexpected failure class -> systematic-debugging; requirement not uniquely determined by approved spec/plan -> `PLAN_DECISION_REQUIRED`; file outside named task scope -> `SCOPE_EXPANSION_BLOCKED`.

**Commit:** `feat: bind K3 packets to live execution state`.

---

# Phase R2-E — Static lint and known-failure guards

### Task 12: Add execution-contract linter

**Files:**
- Create `scripts/process/lint_execution_contracts.js`
- Create `tests/h0-r2-execution-lint.test.js`
- Modify `package.json`

**Interface:** lint plan/spec/bootstrap/process files for F001/F002/F006/F008 known patterns.

**RED:** `node --test tests/h0-r2-execution-lint.test.js`

**Expected RED:** FAIL before linter.

**Fixtures prove rejection of:**
- residual bare RED/GREEN shorthand;
- dynamic main SHA in reusable execution test/bootstrap;
- mutable current-task value in static bootstrap;
- duplicate required check identity;
- self-referential digest field pattern.

**Must allow:**
- historical evidence SHAs/run IDs;
- immutable Action commit SHA;
- approved spec/plan blob fields.

**GREEN:**
`node --test tests/h0-r2-execution-lint.test.js && node scripts/process/lint_execution_contracts.js`

**Expected GREEN:** PASS.

**Regression:** `npm test`.

**Stop conditions:** unexpected failure class -> systematic-debugging; requirement not uniquely determined by approved spec/plan -> `PLAN_DECISION_REQUIRED`; file outside named task scope -> `SCOPE_EXPANSION_BLOCKED`.

**Commit:** `feat: lint low-model execution contracts`.

### Task 13: Add AcceptedRedEvidenceV1 freeze guard

**Files:**
- Create `docs/superpowers/process/accepted-red-evidence-v1.schema.json`
- Create `scripts/process/validate_accepted_red.js`
- Create `tests/h0-r2-accepted-red.test.js`

**Interface:** validate intended RED class and freeze test/fixture hashes.

**RED:** `node --test tests/h0-r2-accepted-red.test.js`

**Expected RED:** FAIL because accepted-RED validator absent.

**Tests cover:**
- behavioral assertion RED accepted;
- unrelated import/setup error rejected as `INVALID_RED`;
- changed test hash after acceptance rejected as `ACCEPTED_RED_MUTATED`;
- re-RED with high-reasoning ruling replaces hashes explicitly.

**GREEN:** same command.

**Expected GREEN:** PASS.

**Regression:** `npm test`.

**Stop conditions:** unexpected failure class -> systematic-debugging; requirement not uniquely determined by approved spec/plan -> `PLAN_DECISION_REQUIRED`; file outside named task scope -> `SCOPE_EXPANSION_BLOCKED`.

**Commit:** `feat: freeze accepted RED evidence`.

### Task 14: Add task-scope guard

**Files:**
- Create `scripts/process/check_task_scope.js`
- Create `tests/h0-r2-scope-guard.test.js`

**Interface:** `checkTaskScope(packet, changedPaths) -> result`.

**RED:** `node --test tests/h0-r2-scope-guard.test.js`

**Expected RED:** FAIL because guard absent.

**Tests cover:**
- allowed create/modify/delete;
- unexpected file -> `SCOPE_EXPANSION_BLOCKED`;
- forbidden path always blocked;
- product Task 5 file set blocked during H0-R2;
- comparison range comes from envelope `task_base_sha`, not programme base.

**GREEN:** same command.

**Expected GREEN:** PASS.

**Regression:** `npm test`.

**Stop conditions:** unexpected failure class -> systematic-debugging; requirement not uniquely determined by approved spec/plan -> `PLAN_DECISION_REQUIRED`; file outside named task scope -> `SCOPE_EXPANSION_BLOCKED`.

**Commit:** `feat: enforce per-task changed-file scope`.

### Task 15: Add implementation-coupling test guard

**Files:**
- Create `scripts/process/check_test_contracts.js`
- Create `tests/h0-r2-test-contract-guard.test.js`

**Purpose:** encode F003 without pretending to solve test quality generically.

**RED:** `node --test tests/h0-r2-test-contract-guard.test.js`

**Expected RED:** FAIL because guard absent.

**Tests cover:**
- known old inline YAML `cp -R` coupling fixture rejected;
- artifact-boundary behavioral test allowed;
- Action SHA/job-name/`paths-ignore` structural assertions allowed;
- unknown pattern not globally banned without registry rule.

**GREEN:** same command.

**Expected GREEN:** PASS.

**Regression:** `npm test`.

**Stop conditions:** unexpected failure class -> systematic-debugging; requirement not uniquely determined by approved spec/plan -> `PLAN_DECISION_REQUIRED`; file outside named task scope -> `SCOPE_EXPANSION_BLOCKED`.

**Commit:** `feat: guard known implementation-coupled tests`.

---

# Phase R2-F — Preflight and result acceptance

### Task 16: Implement fail-closed task preflight

**Files:**
- Create `scripts/process/preflight_task.js`
- Create `tests/h0-r2-preflight.test.js`
- Modify `package.json`

**CLI:** `npm run process:preflight -- --task "$TASK_ID" --state "$STATE_PATH" --packet "$PACKET_PATH" --envelope "$ENVELOPE_PATH" --runtime "$RUNTIME_PROFILE_PATH"`

**RED:** `node --test tests/h0-r2-preflight.test.js`

**Expected RED:** FAIL because preflight absent.

**Tests cover every Spec gate, including:**
- actual Superpowers task-brief bytes whose SHA-256 differs from packet `task_source_digest` -> `TASK_PACKET_STALE`;
- state/hash/main/task mismatch;
- stale packet;
- non-deterministic packet;
- missing stop condition;
- runtime capability blocked;
- Project bootstrap stale;
- open Critical/Important;
- merge authority true.

**GREEN:** same command.

**Expected GREEN:** PASS.

**Regression:** `npm test`.

**Stop conditions:** unexpected failure class -> systematic-debugging; requirement not uniquely determined by approved spec/plan -> `PLAN_DECISION_REQUIRED`; file outside named task scope -> `SCOPE_EXPANSION_BLOCKED`.

**Commit:** `feat: add low-model task preflight gate`.

### Task 17: Implement result validator and completion atomicity

**Files:**
- Create `scripts/process/validate_task_result.js`
- Create `tests/h0-r2-result-validator.test.js`
- Modify `package.json`

**Interface:** validate exact envelope + packet + accepted RED + GREEN/regression evidence + changed paths.

**RED:** `node --test tests/h0-r2-result-validator.test.js`

**Expected RED:** FAIL because result validator absent.

**Tests cover:**
- accepted RED hash mutation;
- GREEN fail;
- regression fail;
- scope expansion;
- main/state drift after implementation;
- wrong commit message;
- missing durable evidence;
- `IMPLEMENTED_NOT_CHECKPOINTED` recovery state;
- accepted result -> `TASK_RESULT_ACCEPTED`.

**GREEN:** same command.

**Expected GREEN:** PASS.

**Regression:** `npm test`.

**Stop conditions:** unexpected failure class -> systematic-debugging; requirement not uniquely determined by approved spec/plan -> `PLAN_DECISION_REQUIRED`; file outside named task scope -> `SCOPE_EXPANSION_BLOCKED`.

**Commit:** `feat: validate task results before checkpoint`.

---

# Phase R2-G — CI execution model and state integration

### Task 18: Remove duplicate branch-push server runs and add control-plane verification

**Files:**
- Modify `.github/workflows/server-tests.yml`
- Modify `.github/workflows/ci.yml`
- Create/modify `tests/h0-r2-ci-contract.test.js`
- Modify `package.json`

**Desired server trigger:**
- `push: branches: [main]`
- `pull_request: branches: [main]`

**Quality gate:** add one deterministic execution-control command after Node tests.

**Package script:** `process:verify` runs rules + packet check + lint + relevant process tests without network/live providers.

**RED:** `node --test tests/h0-r2-ci-contract.test.js`

**Expected RED:** FAIL because server push is currently unbounded and control-plane CI step absent.

**GREEN:** same command.

**Expected GREEN:** PASS.

**Affected regression:**
`npm run process:verify && npm test`

**Stop conditions:** required workflow becomes path-filtered/skippable -> STOP.

**Commit:** `ci: enforce deterministic low-model control plane`.

### Task 19: Extend CURRENT-STATE schema with H0-R2 gates without claiming readiness

**Files:**
- Modify `docs/superpowers/state/current-state.schema.json`
- Modify `docs/superpowers/state/CURRENT-STATE.json`
- Modify `tests/h0-current-state.test.js`
- Add `tests/h0-r2-current-state.test.js`

**RED:** `node --test tests/h0-r2-current-state.test.js`

**Expected RED:** FAIL because R2 gates are absent.

**Implementation:** add all R2 readiness gates from Spec as required gate fields; initialize unfinished runtime/post-merge/Project gates as FAIL/PENDING. `low_model_ready=false`.

**GREEN:**
`node --test tests/h0-current-state.test.js tests/h0-r2-current-state.test.js`

**Expected GREEN:** PASS while readiness remains false.

**Regression:** `LIVE_MAIN_SHA="$(git rev-parse main)"; npm test && npm run validate:state -- --live-main-sha "$LIVE_MAIN_SHA" --json`

**Stop conditions:** unexpected failure class -> systematic-debugging; requirement not uniquely determined by approved spec/plan -> `PLAN_DECISION_REQUIRED`; file outside named task scope -> `SCOPE_EXPANSION_BLOCKED`.

**Commit:** `feat: extend execution state for H0-R2 readiness`.

---

# Phase R2-H — Adversarial readiness before integration

### Task 20: Build adversarial fail-closed suite

**Files:**
- Create `scripts/process/adversarial_readiness.js`
- Create `tests/h0-r2-adversarial-readiness.test.js`
- Modify `package.json`

**RED:** `node --test tests/h0-r2-adversarial-readiness.test.js`

**Expected RED:** FAIL because adversarial runner absent.

**Must prove all 15 Spec pressure cases end in fixed BLOCKED/FAIL codes, never accepted execution.**

The test also parses the approved Spec error/status vocabulary and fails if any declared code lacks coverage in the plan ownership matrix or the executable adversarial/regression suite.

**GREEN:**
`node --test tests/h0-r2-adversarial-readiness.test.js && node scripts/process/adversarial_readiness.js`

**Expected GREEN:** 15/15 fail closed.

**Regression:** `npm run process:verify && npm test`.

**Stop conditions:** unexpected failure class -> systematic-debugging; requirement not uniquely determined by approved spec/plan -> `PLAN_DECISION_REQUIRED`; file outside named task scope -> `SCOPE_EXPANSION_BLOCKED`.

**Commit:** `test: prove H0-R2 adversarial fail-closed behavior`.

### Task 21: Full pre-integration checkpoint

**Purpose:** Produce a fresh, exact-head verification checkpoint from the complete H0-R2 implementation branch.

**Files:**
- Create `docs/superpowers/reviews/2026-09-30-h0-r2-checkpoint.md`
- Append `docs/superpowers/reviews/2026-09-30-h0-r2-execution-ledger.md`
- Update `CURRENT-STATE.json` only for gates freshly proven.

**Fresh commands:**
- `npm run process:verify`
- `npm test`
- `npm run validate`
- `npm run verify:factory-import`
- `npm run verify:sw`
- `PYTHONPATH=server python3 -m pytest -q server/tests`
- `python3 scripts/db_smoke.py`
- `node scripts/contract_test.js browser`
- API adapter contract using existing workflow procedure
- Pages builder + local live-release verifier
- `python3 scripts/browser_smoke.py`

**Expected:** zero failures. Record exact command results from this HEAD only; no prior run may satisfy the checkpoint.

**Stop conditions:** any fresh command fails, packet regeneration differs, adversarial suite is not 15/15 blocked, or a Task 5 product file changed.

**Checkpoint must report:**
- exact HEAD;
- packet count 37/37;
- packet regeneration zero diff;
- adversarial 15/15 blocked;
- no K3 Task 5 product file changes;
- `low_model_ready=false` because integration/runtime/Project gates remain.

**Commit:** `test: checkpoint H0-R2 pre-integration readiness`.

### Task 22: Whole-branch review and one Important/Critical fix pass

**Purpose:** Apply the Superpowers whole-branch review floor to the complete H0-R2 diff and close every Critical/Important finding through one RED->GREEN fix pass before integration.

**Files:**
- Create `docs/superpowers/reviews/2026-09-30-h0-r2-whole-branch-review.md`
- ledger/checkpoint updates only as required.

**Process:**
- generate Superpowers review package for merge-base..HEAD;
- write `review_mode` explicitly as one of `INDEPENDENT_SUBAGENT|FRESH_EXTERNAL_CONTEXT|SELF_REVIEW`; never infer independence from a new chat/session;
- reviewer gets spec, plan, Review Focus, and Rulings only;
- true fresh reviewer if available; otherwise record self-review explicitly;
- re-grade all findings;
- Critical/Important -> one RED->GREEN fix pass;
- Minor -> deferred ledger entries;
- rerun Task 21 full suite after fix pass.

**Expected:** review mode is truthfully recorded; all Review Focus items are explicitly checked; Critical/Important open count is 0 after at most one fix pass; full Task 21 verification is green after fixes.

**Stop:** any open Critical/Important.

**Commit:** `docs: record H0-R2 whole-branch review` plus fix commits if needed.

### Task 23: Open H0-R2 PR and verify exact head

**Purpose:** Produce an integration candidate whose exact reviewed HEAD is externally evidenced without changing that HEAD to record its own run IDs.

**Files:** no branch file changes after the final reviewed head; PR metadata/body may change.

**Precondition:** Task 22 clean.

**PR target:** `main`.

**Exact-head required:**
- `quality-gate` SUCCESS;
- `server-adapter-gate` SUCCESS;
- changed-file boundary contains no K3 Task 5 product implementation.

**Evidence rule:** final run IDs go in PR metadata/body, not a new branch commit.

**Expected:** PR head remains exactly the reviewed H0-R2 HEAD, both required checks are SUCCESS on that head, changed-file boundary excludes all K3 Task 5 product files, and no evidence-only commit changes the verified head.

**Stop:** low-reasoning executor cannot merge.

---

# Phase R2-I — Integrate R2 and establish the real K3 execution runtime

### Task 24: High-reasoning H0-R2 merge and post-merge verification

**Purpose:** Integrate only the exact reviewed/green H0-R2 head and verify the resulting main SHA.

**Files:** no pre-merge source changes; post-merge evidence is external until a later authorized checkpoint.

**Preconditions:** exact reviewed PR head unchanged; required checks SUCCESS.

**Actions:**
- merge exact head;
- resolve live main;
- verify Pages + server/adapter post-merge runs on that exact SHA;
- re-read state from merged main;
- verify no Task 5 product implementation.

**Expected:** R2 integrated, `low_model_ready=false` still.

**Stop conditions:** exact PR head/check mismatch, merge conflict changing reviewed semantics, or post-merge required check failure.

### Task 25: Create real K3 execution branch and initialize official SDD workspace

**Purpose:** Prove the actual runtime can execute the authoritative Superpowers lifecycle from the exact integrated R2 main without touching Task 5 product code.

**Branch:** `impl/k3-learner-evidence-engine` from exact R2-integrated main.

**Required capability:** authoritative Superpowers isolated worktree/workspace must actually succeed.

**Actions:**
- use `using-git-worktrees`;
- initialize SDD workspace for K3 product plan;
- run `task-start` for Task 5 only to obtain brief + BASE, without modifying product files;
- verify packet Task 5 `task_source_digest` equals actual brief bytes;
- create runtime capability profile from observed capabilities;
- create Task 5 execution envelope;
- set state base/active-ref gates only from fresh evidence.

**Expected:** execution envelope valid; product files untouched.

**Stop:** missing worktree/SDD capability -> `RUNTIME_CAPABILITY_BLOCKED`.

### Task 26: Produce versioned ChatGPT Project bootstrap pack

**Files:**
- update/create canonical bootstrap files under `docs/superpowers/bootstrap/`;
- revision marker becomes `k3-h0-r2-v1`;
- Create/modify `tests/h0-r2-project-bootstrap.test.js`.

**RED command:** `node --test tests/h0-r2-project-bootstrap.test.js`

**Expected RED:** FAIL because revision `k3-h0-r2-v1` and required H0-R2 recovery/preflight text are absent.

**GREEN command:** `node --test tests/h0-r2-project-bootstrap.test.js`

**Expected GREEN:** PASS; new pack is static, contains no live SHA/current task/run IDs, and points to CURRENT-STATE/preflight procedure.

**Affected regression:** `npm test`.

**Stop conditions:** bootstrap requires mutable live status -> STOP `PROJECT_BOOTSTRAP_CONTRACT_INVALID`.

**Commit:** `docs: publish H0-R2 Project bootstrap pack`.

### Task 27: Refresh active ChatGPT Project and verify bootstrap revision

**Purpose:** Make the active Project's static bootstrap match the versioned repository bootstrap before lower-model execution.

**External action:** user replaces stale Project bootstrap files because current tools cannot mutate Project membership/content.

**Verification:**
- list active Project files;
- confirm expected new filenames/revision;
- stale K2/H0 bootstrap does not remain authoritative.

**Verification:** re-list active Project files and read the revision marker; Expected: `k3-h0-r2-v1` present and stale K2/H0 bootstrap files are not authoritative.

**State:** set `PROJECT_BOOTSTRAP_CURRENT=PASS` only after observed verification.

**Stop:** Project not refreshed -> `PROJECT_BOOTSTRAP_STALE`.

### Task 28: Run Task 5 no-write weak-model dry-run

**Purpose:** Verify the lower-reasoning execution bundle is sufficient to identify every Task 5 action and stop condition without product writes or hidden context.

**Inputs only:**
- static Project bootstrap;
- validated CURRENT-STATE;
- Superpowers Task 5 brief;
- Task 5 packet;
- execution envelope;
- relevant spec slice;
- allowed files/focused tests.

**No product writes.**

**Dry-run must correctly identify:**
- purpose;
- allowed files;
- exact RED command;
- intended RED class;
- implementation constraints;
- GREEN;
- regression;
- stop codes;
- merge prohibition.

**Verification procedure:** run the repository dry-run harness against Task 5 packet/envelope/brief with filesystem mutation disabled or pointed at a disposable fixture workspace.

**Expected:** `TASK5_DRY_RUN_PASS=PASS`; product branch diff remains empty for Task 5 product files.

**Stop conditions:** any missing instruction, invented decision, product write, or merge attempt -> FAIL and return to high-reasoning plan/compiler repair.

### Task 29: Run final live adversarial readiness against the real K3 branch/runtime

**Purpose:** Re-prove fail-closed behavior against the actual K3 branch, current state, Project revision, and observed runtime rather than fixtures alone.

Repeat the Spec adversarial cases against actual state/envelope/runtime, including:
- synthetic main drift;
- stale packet/hash;
- extra file;
- invalid RED class;
- stale Project revision;
- false review capability;
- merge attempt.

**Verification command:** `node scripts/process/adversarial_readiness.js --live-runtime` (or the exact CLI implemented by Task 20 if its flag name differs through a ledgered mechanical ruling).

**Expected:** all cases blocked with fixed codes; no product files modified.

**Stop conditions:** any adversarial case reaches accepted execution or mutates product files.

### Task 30: Certify low-model readiness

**Purpose:** Advance durable state to lower-model readiness only after every H0/H0-R2/live-runtime/Project gate has fresh evidence.

**Files:**
- update `CURRENT-STATE.json`;
- append durable K3/H0-R2 readiness evidence;
- no product implementation.

**Fresh final requirements:**
- all H0/H0-R2 readiness gates PASS;
- `next_task=5`;
- no Critical/Important open;
- packet 005 matches actual Task 5 brief;
- execution envelope current;
- SDD workspace real and valid;
- Project bootstrap current;
- live main equals execution branch base;
- `merge_guard_mode` truthful;
- `low_model_ready=true`.

**Final validation command:**
`LIVE_MAIN_SHA="$(git rev-parse main)"; npm run validate:state -- --live-main-sha "$LIVE_MAIN_SHA" --json`

**Expected GREEN:** final machine result includes:
- `ok=true`;
- `next_task=5`;
- `low_model_ready=true`;
- all readiness gates PASS.

**Affected regression:** `npm run process:verify && npm test`.

**Stop conditions:** any gate non-PASS, main/base drift, packet/brief mismatch, SDD workspace invalid, Project bootstrap stale, or open Critical/Important finding.

**Commit:** `chore: certify K3 low-model execution readiness`.

**Do not implement K3 Task 5 in this task.**

---

# Final Handoff to Lower-Reasoning Execution

Only after Task 30 passes may the user be told to switch models.

The lower-reasoning Task 5 session receives only:

1. static Project bootstrap;
2. live validated CURRENT-STATE;
3. Superpowers Task 5 brief;
4. `task-005.json`;
5. current execution envelope;
6. relevant spec slice;
7. allowed source/test files.

Execution order:

```text
task-start
-> brief/packet digest match
-> envelope bind
-> preflight PASS
-> RED
-> validate intended RED
-> freeze Accepted RED evidence
-> minimal implementation
-> GREEN
-> affected regression
-> scope/result validation
-> task-done
-> durable ledger/state checkpoint
-> stop or next packet
```

Initial batching policy:
- Tasks 5-7: one task per run.
- After 3 consecutive accepted tasks with no Critical/Important process finding: max 2 per batch.
- After 2 consecutive clean 2-task batches: max 3 per batch.
- Any process finding, invalid RED, scope violation, runtime gap, recovery event, or drift resets batch size to 1.

## Final Plan Acceptance Gate

Before implementation begins, this plan must pass a self-review that proves:

- every task has an exact purpose and file scope;
- every behavior-changing task has RED + Expected RED + GREEN + regression;
- no task asks a lower-reasoning executor to invent architecture;
- no H0-R2 task implements K3 Task 5 product behavior;
- integration/merge stays high-reasoning;
- dynamic evidence is not made self-referential;
- Project/worktree limitations are explicit stop gates;
- all final readiness conditions map back to the approved H0-R2 Spec.

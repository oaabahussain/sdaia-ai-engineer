# K3 Process Hardening H0 — Low-Context Execution Control Plane Design

**Date:** 2026-09-29  
**Repository:** `oaabahussain/sdaia-ai-engineer`  
**Baseline:** `main@9607271c86c084df396a39947e915d6560dbbac3`  
**Scope:** Process/control-plane hardening only. No K3 product behavior changes.  
**Status:** DESIGN — awaiting explicit written-spec approval before implementation planning.

## 1. Purpose

Prepare the repository and ChatGPT Project workflow so K3 can execute many small tasks across sessions and lower-reasoning models without reconstructing project history from chat memory, while preserving the existing Superpowers process, TDD guarantees, exact-head verification, and durable auditability.

The design must optimize for:

- low startup context;
- deterministic recovery after context loss or session changes;
- mechanical task execution for a lower-reasoning model;
- no duplicated mutable truth;
- no completion claim based only on green aggregate CI;
- durable evidence for RED -> GREEN, rulings, commits, and phase gates;
- compatibility with the existing K3 spec and 41-task implementation plan;
- no product-code changes before K3 Task 5.

## 2. Existing authority and problem statement

The existing Operating Playbook remains authoritative and already establishes that the repository, not chat history, is durable memory.

The current repository also demonstrates the failure mode H0 must remove:

- live `main` has already merged and corrected K3 Tasks 1-4;
- the K3 implementation plan marks Tasks 1-4 complete and Task 5 next;
- `HANDOFF.md` and the programme tracker still describe K3 as design/not started;
- Project-side recovery files can therefore become stale relative to GitHub;
- Tasks 1-4 lacked the official SDD progress ledger/worktree procedure during original execution.

The problem is not lack of documentation. It is too many independently editable state summaries.

## 3. Core architecture

Use four layers with one direction of authority:

```text
Git commit / tree / tests / CI
        |
        v
CURRENT-STATE.json          small mutable control manifest
        |
        +--> active spec
        +--> active plan
        +--> durable execution ledger
        +--> current checkpoint
        |
        v
task brief + touched files  current-session working set
        |
        v
ChatGPT conversation        disposable working memory
```

### 3.1 Authority law

The authority order is:

1. Git object graph and exact live ref;
2. approved active spec;
3. approved active implementation plan;
4. durable execution ledger and rulings;
5. current phase/checkpoint evidence;
6. `CURRENT-STATE.json` as a navigation/control manifest;
7. static bootstrap/index documents;
8. Project memory and chat transcripts.

If two artifacts disagree, lower levels never override higher levels.

### 3.2 CURRENT-STATE is not a second history

`CURRENT-STATE.json` is a compact derived pointer to the active execution state. It does not duplicate task history, test logs, or narrative handoff text.

It MUST NOT contain the SHA of the commit that contains itself. The startup procedure resolves the live Git ref first and then reads `CURRENT-STATE.json` from that exact ref.

It contains immutable blob SHAs for the approved active spec and implementation plan so startup validation can detect contract drift. After approval, those contract files are frozen for execution: task completion is recorded in the SDD ledger, durable execution ledger, and current-state manifest rather than by continuing to edit plan checkboxes. Any semantic spec/plan change requires an explicit amendment/new approved revision and corresponding state update.

## 4. New repository artifacts

### 4.1 `docs/superpowers/state/current-state.schema.json`

JSON Schema for the control manifest.

Required fields:

- `schema_version`
- `programme`
- `phase`
- `status`
- `completed_through_task`
- `next_task`
- `spec_path`
- `spec_blob_sha`
- `plan_path`
- `plan_blob_sha`
- `ledger_path`
- `checkpoint_path`
- `open_critical_findings`
- `open_important_findings`
- `last_verified_scope`
- `updated_at`

Allowed `status` values:

- `DESIGN`
- `PLAN`
- `EXECUTING`
- `PHASE_GATE`
- `REVIEW`
- `INTEGRATION`
- `POST_MERGE_VERIFY`
- `COMPLETE`

K3 H0 initial state after implementation:

- programme: `K3`
- phase: `A`
- status: `EXECUTING`
- completed_through_task: `4`
- next_task: `5`

### 4.2 `docs/superpowers/state/CURRENT-STATE.json`

The only mutable **current-status summary**. Other execution evidence such as the append-oriented durable ledger may grow, but no other file independently summarizes the live current state.

It MUST remain compact and machine-validatable.

It MUST NOT contain:

- historical task prose;
- full command output;
- copied spec text;
- copied plan text;
- conversational summaries;
- a self-referential current commit SHA.

### 4.3 `scripts/validate_current_state.js`

Deterministic validator that:

1. validates the manifest against its schema;
2. verifies referenced files exist;
3. verifies the referenced spec/plan blob SHAs against the checked-out tree;
4. verifies `next_task = completed_through_task + 1` while normal sequential execution applies;
5. verifies the durable ledger contains completion records for every task through `completed_through_task`;
6. fails closed on missing or contradictory state;
7. emits one compact machine-readable result line.

Package script:

`npm run validate:state`

No production/browser dependency may be added for this validator.

### 4.3.1 Frozen contract rule

Once the K3 product spec and K3 implementation plan are approved for execution, their semantic content is immutable during ordinary task execution.

- Do not mark additional plan checkboxes as the progress mechanism after H0.
- SDD `task-done`, the durable ledger, and `CURRENT-STATE.json` carry progress.
- A required semantic change creates an explicit amendment or replacement revision, receives the appropriate approval gate, and updates the stored blob SHA.
- A blob mismatch without such an amendment is `PLAN_SPEC_HASH_MISMATCH` and blocks execution.

This keeps blob validation useful instead of turning normal progress bookkeeping into contract drift.

### 4.4 K3 durable execution ledger

Create:

`docs/superpowers/reviews/2026-09-29-k3-execution-ledger.md`

This is append-oriented durable evidence.

For Tasks 1-4, H0 records **retrospective verified evidence** only. It must explicitly state that the official SDD task-start/task-done workflow was not used originally.

For Task 5 onward, every completion record includes:

- task number and title;
- BASE;
- HEAD;
- focused RED command and intended failure;
- GREEN command/result;
- affected regression command/result;
- commit(s);
- rulings, if any;
- CI run IDs when applicable;
- completion state;
- next task.

Full console output is not copied into this file.

### 4.5 Static bootstrap files

Create compact repository-owned versions suitable for ChatGPT Project upload/sync:

- `PROJECT-INDEX.md`
- `RECOVERY-PROTOCOL.md`
- `DURABLE-FILE-MAP.md`

These files are intentionally mostly static.

They MUST point to `CURRENT-STATE.json` for live state and MUST NOT embed:

- live main SHA;
- completed task count;
- current next task;
- temporary branch names;
- current CI run numbers.

Their purpose is navigation, not mutable state.

### 4.6 `HANDOFF.md`

Refactor the current top section into a static compatibility pointer.

The top section MUST say, in effect:

1. resolve live `main`;
2. read `docs/superpowers/state/CURRENT-STATE.json` at that ref;
3. run state validation;
4. load only the active artifacts referenced by the state manifest;
5. resume the first incomplete task proven by durable evidence.

Historical handoff content may remain below a clearly marked historical boundary, but it cannot claim current authority.

## 5. Session bootstrap contract

Every new execution session follows this fixed sequence:

1. invoke the required process skills;
2. resolve live `main` from GitHub;
3. read `CURRENT-STATE.json` from that exact ref;
4. run/verify `npm run validate:state`;
5. read the active task brief only;
6. read only the relevant spec sections and touched source files;
7. confirm isolated branch/worktree;
8. confirm clean baseline for the affected scope;
9. execute the task.

Do not read the entire historical handoff, full programme history, or all previous ledgers unless a conflict requires it.

### Recovery rule

After compaction/session loss:

- trust durable Git/ledger evidence over conversation memory;
- resume from the first task not proven complete;
- never repeat a completed task merely because the current conversation does not remember it.

## 6. Superpowers SDD integration

From Task 5 onward, use the official SDD workspace:

`.superpowers/sdd/<plan-basename>/`

Required flow per task:

`task-start -> focused RED -> intended-failure check -> smallest implementation -> focused GREEN -> affected regression -> verification-before-completion -> task-done -> durable ledger/state update`

The scratch SDD ledger and the durable repository ledger have different roles:

- scratch ledger: live execution mechanics and compaction recovery within the workspace;
- durable repository ledger: cross-session/cross-environment audit evidence.

The durable ledger does not replace `task-start` or `task-done`.

## 7. Lower-reasoning-model execution contract

The plan produced after this design is approved MUST be executable without architectural invention.

Each task brief MUST contain:

- exact purpose;
- exact files allowed to change;
- exact interfaces to produce/consume;
- exact tests to create or modify;
- exact RED command;
- exact expected RED reason;
- exact minimal implementation intent;
- exact GREEN command;
- exact affected regression command;
- exact completion evidence;
- explicit stop conditions.

A lower-reasoning executor MUST NOT:

- redesign the architecture;
- broaden file scope silently;
- infer missing contract values;
- weaken a test to obtain GREEN;
- substitute full-suite CI for a missing focused RED;
- claim review independence when none exists;
- proceed through a contradictory state manifest.

Any plan/spec conflict is a `Ruling:` entry, not an invisible improvisation.

## 8. Batch execution model

Tasks may be executed in batches only when all tasks in the batch:

- are already approved in the plan;
- have independent or explicitly sequenced interfaces;
- do not require a new architecture decision;
- have deterministic focused tests;
- can persist task-done evidence individually.

A batch is a scheduling unit, not a verification unit.

Every task still receives its own:

- BASE;
- RED;
- GREEN;
- regression;
- completion record.

Default batch size is not hard-coded. Increase batch size only when the previous batch completed without unresolved process or correctness findings.

## 9. Context-efficiency rules

Context efficiency is achieved by reducing the explicit working set, not by making unverifiable claims about ChatGPT Project token accounting.

Required practices:

- task brief instead of full plan;
- relevant spec sections instead of full spec;
- touched files instead of repository-wide reads;
- test-output files/artifacts instead of copying long logs into chat;
- compact ledger summaries instead of narrative session history;
- static Project bootstrap files instead of frequently re-uploaded dynamic handoffs.

No fixed token budget is encoded because runtime/model context behavior may change.

## 10. CI and integration hardening included in H0

H0 may change CI/process files but not K3 product behavior.

### 10.1 Unique required-check identities

Rename ambiguous job IDs/names so required checks are unambiguous, e.g.:

- `quality-gate`
- `server-adapter-gate`

Do this before branch protection/ruleset enforcement.

### 10.2 Main ruleset

Add a repository ruleset for `main` that, where supported by the repository plan/settings:

- requires pull requests;
- requires the selected unique CI checks;
- blocks force pushes;
- blocks branch deletion;
- requires branch update before merge when appropriate;
- requires conversation resolution where applicable.

Do not require one human approval unless an actual independent human-review workflow exists.

### 10.3 CI efficiency

Use safe caching and concurrency:

- npm cache via setup-node;
- pip cache via setup-python;
- cancel superseded PR runs.

Do not use path filtering that can leave required checks pending.

### 10.4 Pages artifact builder

Remove duplicated Pages artifact assembly logic from workflow files.

Create one deterministic repository script used by both PR CI and Pages deployment. The builder owns the public allowlist and private exclusions.

The release verifier continues to validate the produced artifact.

### 10.5 GitHub Action pinning

Pin third-party/official Actions used by critical workflows to immutable commit SHAs in a dedicated H0 change.

Do not combine this with unrelated major-version upgrades.

## 11. Review model

For ordinary task execution with inline `executing-plans`, preserve the skill's one whole-branch fresh-context review floor.

If no real fresh reviewer/subagent exists, record:

`Final review: self-review (no subagent tool)`

A new chat in the same ChatGPT Project must not automatically be labeled independent review because Project memory can bridge project conversations.

A reviewer receives only:

- spec path;
- task/phase brief;
- BASE..HEAD review package;
- tests/evidence summary;
- ledger rulings.

Never provide the reviewer with accumulated chat history unless specifically required.

## 12. H0 implementation boundaries

H0 is complete only when all of the following are implemented and verified:

1. current-state schema exists;
2. current-state manifest exists and validates;
3. approved K3 spec/plan artifacts are frozen and blob-drift validation works;
4. K3 durable execution ledger exists with retrospective Tasks 1-4 evidence;
5. HANDOFF current section is converted to static pointer form;
6. static Project bootstrap/index files exist;
7. Pages artifact build logic is single-sourced;
8. CI required-check names are unique;
9. safe npm/pip caching and PR concurrency are configured;
10. critical Actions are pinned to immutable SHAs;
11. main protection/ruleset is configured or an explicit environment limitation is recorded;
12. official SDD workspace is initialized for the K3 plan;
13. isolated worktree/branch requirement is satisfied;
14. baseline verification is green;
15. state records `next_task = 5`.

## 13. H0 acceptance gates

H0 produces these gates:

- `REPO_CONTEXT_READY`
- `STATE_MANIFEST_VALID`
- `PLAN_SPEC_HASH_MATCH`
- `TASKS_1_4_DURABLY_VERIFIED`
- `PROCESS_GUARDS_READY`
- `ISOLATED_WORKSPACE_READY`
- `BASELINE_GREEN`

Only when every applicable gate is PASS may execution publish:

`TASK_5_EXECUTION_READY`

If a platform capability such as repository rulesets cannot be configured, the gate is not silently marked PASS. Record the limitation and the smallest safe compensating control.

## 14. Non-goals

H0 does not:

- change learner-visible content;
- modify K3 evidence semantics;
- implement Task 5;
- renumber Tasks 1-41;
- add K4/K5/K6/K7/K8/K9 behavior;
- invent fixed model/token limits;
- replace Superpowers;
- replace the K3 spec or K3 implementation plan;
- claim historical SDD steps occurred when they did not;
- use GitHub Actions logs/artifacts as the sole durable proof.

## 15. Expected post-H0 startup

A fresh execution session should be able to start with:

1. static Project bootstrap;
2. live `main`;
3. `CURRENT-STATE.json`;
4. state validator result;
5. Task 5 brief;
6. only Task 5-relevant spec/code.

No reconstruction of K1/K2 or K3 Tasks 1-4 from conversation history is required.

## 16. Design decision

Adopt H0 as a process-control checkpoint immediately before K3 Task 5.

H0 is not a new K3 product task and does not alter Task numbering. After H0 reaches `TASK_5_EXECUTION_READY`, execution resumes the approved K3 plan at Task 5.

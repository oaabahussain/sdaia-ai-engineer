# K3 Process Hardening H0 — Low-Context Execution Control Plane Design

**Date:** 2026-09-29  
**Repository:** `oaabahussain/sdaia-ai-engineer`  
**Baseline:** `main@9607271c86c084df396a39947e915d6560dbbac3`  
**Scope:** Process/control-plane hardening only. No K3 product behavior changes.  
**Status:** APPROVED FOR IMPLEMENTATION PLANNING — execution remains gated on implementation-plan approval.

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
Git live main + active execution branch
        |
        v
CURRENT-STATE.json          small mutable control manifest on the authoritative ref
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

`main` is the integration authority. During unmerged execution, the fixed programme execution branch may be the newer execution-state authority. Startup never guesses which one: it validates both refs under the rules below.

### 3.1 Authority law

The authority order is:

1. Git object graph, exact live `main`, and a validated active execution branch when one exists;
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

For K3, the execution branch name is stable for the programme: `impl/k3-learner-evidence-engine`. The main-state manifest names that branch. During execution, the branch carries its own newer copy of `CURRENT-STATE.json` and the durable ledger. A session may prefer branch state only when its `base_main_sha` exactly matches live `main`; otherwise startup fails closed with `MAIN_DRIFT` and requires reconciliation before task execution.

## 4. New repository artifacts

### 4.1 `docs/superpowers/state/current-state.schema.json`

JSON Schema for the control manifest.

Required fields:

- `schema_version`
- `state_revision`
- `programme`
- `phase`
- `status`
- `execution_branch`
- `base_main_sha`
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
- `gates`
- `low_model_ready`
- `merge_guard_mode`
- `project_bootstrap_revision`
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

K3 H0 uses two state revisions around integration:

**Merged main state (revision 1):**
- programme: `K3`
- phase: `A`
- status: `EXECUTING`
- execution_branch: `impl/k3-learner-evidence-engine`
- base_main_sha: `null`
- completed_through_task: `4`
- next_task: `5`
- low_model_ready: `false`

`base_main_sha=null` is allowed only before the execution branch is initialized and only while `low_model_ready=false`.

**Initialized execution-branch state (revision 2):**
- branch: `impl/k3-learner-evidence-engine`, created from the exact live H0-integrated `main`
- base_main_sha: that exact live `main` SHA
- completed_through_task: `4`
- next_task: `5`
- every execution-readiness gate: `PASS`
- low_model_ready: `true`

`low_model_ready` is derived: it may be `true` only when every applicable H0 gate is `PASS`, there are no open Critical/Important findings, spec/plan hashes match, live `main` equals the execution branch state's non-null `base_main_sha`, and the active ChatGPT Project bootstrap has been verified at the named `project_bootstrap_revision`.

`merge_guard_mode` is one of `RULESET` or `HIGH_REASONING_MERGE_GATE`. `RULESET` is preferred. If the current integration cannot administer repository rulesets, H0 may use `HIGH_REASONING_MERGE_GATE`: the low-reasoning executor may commit/push only to the approved execution branch and MUST STOP before creating/merging an integration PR or changing `main`. A high-reasoning session performs whole-branch review, exact-head verification, and merge. This compensating control must be recorded explicitly; it is not described as branch protection.

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
5. verifies `state_revision` is a positive integer and never regresses when comparing main versus branch state;
6. permits `base_main_sha=null` only when `low_model_ready=false`; a branch state with `low_model_ready=true` requires a full 40-hex `base_main_sha` equal to live `main`;
7. verifies `execution_branch` is exactly the approved programme branch name;
8. verifies the durable ledger contains completion records for every task through `completed_through_task`;
9. verifies `low_model_ready=true` only when every applicable gate is `PASS` and no Critical/Important finding is open;
10. fails closed on missing or contradictory state;
11. emits one compact machine-readable result line.

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

The current tool runtime can read Project-backed files but cannot replace Project membership/content directly. H0 therefore produces the canonical bootstrap files plus a single upload pack. `PROJECT_BOOTSTRAP_CURRENT` remains FAIL until the user replaces the stale Project files and a high-reasoning session verifies the active Project contains the expected bootstrap revision.

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
3. read and validate `CURRENT-STATE.json` from live `main`;
4. read `execution_branch` from that manifest and probe that exact branch;
5. if the execution branch exists, read its `CURRENT-STATE.json` and accept it only when `base_main_sha == live main`, its `state_revision` is greater than or equal to main's, its spec/plan blobs match, and its durable ledger is consistent;
6. choose the valid manifest with the highest `state_revision`; ties prefer the execution branch only when its ledger proves the same or later completed task;
7. run/verify `npm run validate:state` on the chosen ref/worktree;
8. require `low_model_ready=true`; otherwise a low-reasoning executor MUST STOP and hand off to a higher-reasoning recovery pass;
9. read the active task brief only;
10. read only the relevant spec sections and touched source files;
11. confirm isolated branch/worktree;
12. confirm clean baseline for the affected scope;
13. execute the task.

Do not read the entire historical handoff, full programme history, or all previous ledgers unless a conflict requires it.

### Recovery rule

After compaction/session loss:

- trust durable Git/ledger evidence over conversation memory;
- resume from the first task not proven complete;
- never repeat a completed task merely because the current conversation does not remember it;
- if live `main` differs from the chosen branch state's `base_main_sha`, stop with `MAIN_DRIFT` rather than silently rebasing or merging.

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
- implementation commit;
- durable checkpoint commit that advances the ledger/state revision;
- completion record.

The durable checkpoint commit may refer to the preceding implementation commit SHA. It never attempts to embed its own SHA inside itself.

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

### 10.2 Main ruleset / compensating merge gate

Add a repository ruleset for `main` when the active integration exposes repository-administration mutation. The preferred ruleset:

- requires pull requests;
- requires the selected unique CI checks;
- blocks force pushes;
- blocks branch deletion;
- requires branch update before merge when appropriate;
- requires conversation resolution where applicable.

Do not require one human approval unless an actual independent human-review workflow exists.

If ruleset mutation is unavailable in the active runtime, record `merge_guard_mode=HIGH_REASONING_MERGE_GATE` and enforce these compensating controls:

- low-reasoning execution is limited to `impl/k3-learner-evidence-engine`;
- the low-reasoning executor never pushes directly to `main`;
- it stops before PR merge/integration;
- whole-branch review + exact-head required checks are performed by a high-reasoning session;
- post-merge verification remains mandatory.

Under this fallback, `PROCESS_GUARDS_READY` may be `PASS` only when the compensating merge gate is documented and verified; the record must also state that GitHub itself is not enforcing branch protection.

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

1. stale execution-status metadata in the active K3 spec/plan is normalized without changing product semantics, then those approved contract files are frozen and their blob SHAs recorded;
2. current-state schema exists;
3. current-state manifest exists and validates;
4. approved K3 spec/plan artifacts are frozen and blob-drift validation works;
5. K3 durable execution ledger exists with retrospective Tasks 1-4 evidence;
6. HANDOFF current section is converted to static pointer form;
7. the old authoritative programme tracker is demoted to a historical/index role and points to `CURRENT-STATE.json` for live state;
8. static Project bootstrap/index files exist;
9. Pages artifact build logic is single-sourced;
10. CI required-check names are unique;
11. safe npm/pip caching and PR concurrency are configured;
12. critical Actions are pinned to immutable SHAs;
13. main protection/ruleset is configured or an explicit environment limitation plus compensating merge control is recorded;
14. official SDD workspace is initialized for the K3 plan;
15. isolated worktree/branch requirement is satisfied;
16. baseline verification is green;
17. H0 is merged to `main`; `impl/k3-learner-evidence-engine` is then created from that exact integrated main; its revision-2 state records `base_main_sha = live main` and `next_task = 5`;
18. a versioned Project bootstrap upload pack is produced, the active ChatGPT Project is refreshed once, `PROJECT_BOOTSTRAP_CURRENT=PASS` is verified, and only then the execution-branch state advances to the next revision with all execution-readiness gates PASS and `low_model_ready = true`.

## 13. H0 acceptance gates

H0 produces these gates:

- `REPO_CONTEXT_READY`
- `STATE_MANIFEST_VALID`
- `PLAN_SPEC_HASH_MATCH`
- `TASKS_1_4_DURABLY_VERIFIED`
- `PROCESS_GUARDS_READY`
- `ISOLATED_WORKSPACE_READY`
- `BASELINE_GREEN`
- `ACTIVE_REF_RESOLUTION_VALID`
- `PROJECT_BOOTSTRAP_CURRENT`

Only when every applicable gate is PASS may execution publish:

`TASK_5_EXECUTION_READY`

`PROJECT_BOOTSTRAP_CURRENT` is an external Project-surface gate: it is PASS only after the active ChatGPT Project contains the expected static bootstrap revision and stale K2 startup files are no longer authoritative.

At that point `low_model_ready` MUST be `true`. Any later `MAIN_DRIFT`, hash mismatch, blocked gate, or Critical/Important finding forces it back to `false`.

If a platform capability such as repository rulesets cannot be configured, the gate is not silently treated as native protection. Record the limitation, set `merge_guard_mode=HIGH_REASONING_MERGE_GATE`, verify the compensating controls above, and only then may `PROCESS_GUARDS_READY=PASS`.

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
3. validated main state + optional validated `impl/k3-learner-evidence-engine` state;
4. chosen authoritative `CURRENT-STATE.json`;
5. state validator result with `low_model_ready=true`;
6. Task 5 brief;
7. only Task 5-relevant spec/code.

No reconstruction of K1/K2 or K3 Tasks 1-4 from conversation history is required.

## 16. Design decision

Adopt H0 as a process-control checkpoint immediately before K3 Task 5.

H0 is not a new K3 product task and does not alter Task numbering. After H0 reaches `TASK_5_EXECUTION_READY`, execution resumes the approved K3 plan at Task 5.

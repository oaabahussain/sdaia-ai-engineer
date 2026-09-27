# Learning Platform — Durable Operating Playbook

**Date:** 2026-09-27  
**Status:** Authoritative working method for future programmes  
**Scope:** How to design, plan, execute, test, checkpoint, review, merge and recover work without losing context or quality.

## 1. Core operating principle

The repository, not the chat transcript, is the durable memory.

Every programme must be recoverable from repository artifacts even if:
- the chat ends;
- a connector/tool session fails;
- a different model/agent resumes;
- a local workspace disappears;
- the implementation branch is interrupted mid-task.

The operating hierarchy is:

```text
Constitution
  ↓
Research amendment / evidence rulings
  ↓
Active written design/spec
  ↓
Approved implementation plan
  ↓
Execution ledger + rulings
  ↓
Current checkpoint
  ↓
Tests / CI / commits
  ↓
HANDOFF / programme tracker
```

Conversation memory may help navigation but must never override these files.

## 2. Work decomposition model

Use five levels:

```text
Programme
  ↓
Checkpoint / Stage
  ↓
Task
  ↓
Microstep
  ↓
Verification evidence
```

### 2.1 Programme

A programme has one coherent architectural outcome and its own:
- design/spec;
- implementation plan;
- execution branch;
- baseline;
- ledger;
- checkpoint;
- final review;
- merge;
- post-merge verification.

Examples:
- B1 — Track Presentation Contract
- B2 — Track Registry
- B3 — Content Model v2
- K1 — Content Factory & Governance Core
- K2 — Coverage Expansion & Controlled Release

Do not mix a later programme into an earlier one merely because implementation is convenient.

### 2.2 Checkpoints / stages

A programme is divided into small, independently understandable stages.

K1 example:

```text
A0 baseline + RED boundary
A1 core contracts
B lifecycle/policies
C provenance/providers
D persistence/orchestration
E quality pipeline
F coverage engine
G release/snapshot/rollback
H learner evidence/interoperability
I current-bank migration
J acceptance/review/integration
```

A checkpoint is large enough to produce a useful architectural capability but small enough to review and resume independently.

### 2.3 Tasks

Prefer many narrow tasks over a few broad tasks.

A task should normally:
- own one behavior or contract;
- name exact files;
- name exact interface/output;
- contain its own RED test;
- have the smallest implementation needed for GREEN;
- be independently commit/checkpoint friendly.

K1 deliberately used **87 tasks and 425 checkable microsteps** rather than a small number of large tasks.

This is intentional. More, smaller tasks improve:
- fault isolation;
- review precision;
- test ownership;
- recovery after interruption;
- visibility into progress;
- ability to change one decision without destabilizing unrelated work.

### 2.4 Microsteps

Each task should be split into concrete checkboxes such as:

```text
- write failing contract test
- verify RED for correct reason
- add smallest schema/interface
- rerun targeted test
- run affected suite
- record result
- commit
- update ledger
```

Avoid microsteps such as “finish backend” or “implement quality” because they hide multiple decisions.

## 3. Design and approval gates

Architectural/product work follows:

```text
Brainstorm / research
  ↓
Design
  ↓
Written spec
  ↓
Explicit spec approval
  ↓
Written implementation plan
  ↓
Explicit plan approval
  ↓
Execution
```

Do not write product implementation before the relevant design/spec/plan gates are complete.

After plan approval, continuous execution is preferred. Do not stop for ordinary task-by-task approvals.

## 4. Superpowers skill sequence

Use the most specific skill first.

### Before creative/architectural work
- `superpowers:brainstorming`
- evidence-engineering research when external/current evidence affects the decision.

### Before implementation
- `superpowers:writing-plans`
- `superpowers:using-git-worktrees` when a reliable local workspace exists.
- If local worktree is unavailable, use an isolated GitHub branch and record the ruling.

### During implementation
- `superpowers:executing-plans` for Native/inline execution.
- `superpowers:test-driven-development` before feature/fix implementation.
- `superpowers:systematic-debugging` on every unexpected failure.
- `superpowers:dispatching-parallel-agents` only when tasks are truly independent and the environment supports it.

### Before integration
- `superpowers:verification-before-completion`
- `superpowers:requesting-code-review`
- If no independent reviewer/subagent is available, perform a separate whole-branch self-review and record exactly:
  `Final review: self-review (no subagent tool)`
- `superpowers:receiving-code-review` before applying review feedback.
- `superpowers:finishing-a-development-branch` after implementation/review/tests are green.

Never claim independent review if only self-review occurred.

## 5. TDD rule

Every implementation/fix task uses:

```text
RED
  ↓
prove RED fails for the intended reason
  ↓
smallest implementation
  ↓
GREEN
  ↓
run affected regression suite
  ↓
commit
  ↓
ledger/checkpoint
```

A failing test counts as RED only if:
- test setup itself is valid;
- the failure corresponds to the missing/incorrect behavior;
- the failure is not caused by typo/import/environment noise.

If a test unexpectedly passes before implementation, investigate; do not pretend RED happened.

## 6. Systematic debugging rule

On an unexpected failure:

1. collect the exact failing step/log;
2. identify the first incorrect assumption;
3. distinguish product bug from test/setup bug;
4. prove the root cause;
5. make the smallest correction;
6. rerun the original failing test;
7. rerun affected suite;
8. record a Ruling when the plan/spec needed interpretation.

Examples learned:
- H server failure #880 was a missing `import pytest`, not a SQLite defect.
- B3 live verifier/server failures came from stale v1 assumptions after domain-contract migration.
- Regex/assertion escape errors in tests were fixed as test bugs, not hidden by product changes.

## 7. Durable state files and update cadence

### 7.1 Baseline review

Create once when execution begins:

`docs/superpowers/reviews/<date>-<programme>-baseline.md`

Record:
- main/base SHA;
- existing behavior/counts/digests;
- current contracts;
- active known leaks/debt;
- previous CI evidence;
- explicit compatibility boundaries.

### 7.2 Execution ledger

Create:

`docs/superpowers/reviews/<date>-<programme>-execution-ledger.md`

**Update after every task or meaningful execution decision.**

Append:
- task completed;
- RED run/result;
- GREEN run/result;
- commit SHA when meaningful;
- files/interfaces changed;
- any failure/root cause;
- every Ruling;
- next exact task.

The ledger is chronological and should not be rewritten to hide mistakes.

Use a Ruling format:

`Ruling: <decision> — <why> — <cost if wrong>`

Record a ruling whenever:
- the plan is ambiguous;
- the environment forces a different execution method;
- a stronger spec interpretation changes implementation;
- a task is intentionally deferred or adjusted.

### 7.3 Checkpoint file

Maintain one obvious recovery file:

`docs/superpowers/reviews/<date>-<programme>-checkpoint.md`

**Update after every checkpoint/stage and before any expected session boundary.**

It should contain:
- branch + HEAD;
- base SHA;
- completed tasks/checkpoints;
- latest exact test evidence;
- current failures;
- rulings;
- files/areas changed;
- next exact task;
- whether resume is safe;
- whether anything is merged.

Unlike the ledger, checkpoint is the current concise state.

### 7.4 HANDOFF.md

`HANDOFF.md` is the top-level navigation/recovery document.

Do **not** rewrite it after every microstep. That creates noise and conflicts.

Update it when:
- a design/spec/plan gate changes;
- a major checkpoint finishes and the session may move;
- before a long interruption;
- before integration if recovery instructions change;
- immediately after merge/post-merge verification;
- the active programme changes.

It should point to the current tracker, spec, plan, ledger/checkpoint, not duplicate every task log.

### 7.5 Programme tracker

Maintain:

`docs/superpowers/reviews/2026-09-27-platform-programme-tracker.md`

Update only when programme/gate status changes:
- DESIGN
- SPEC REVIEW
- PLAN REVIEW
- EXECUTING
- REVIEW
- MERGED
- POST-MERGE VERIFIED
- NEXT PROGRAMME

### 7.6 Final review

Before merge create:

`docs/superpowers/reviews/<date>-<programme>-final-review.md`

Review:
- approved requirements;
- branch diff;
- major failure modes;
- backward compatibility;
- leakage/security boundaries;
- deferred minor findings.

Critical/Important findings require TDD fixes before integration.

### 7.7 Post-merge verification

After merge create:

`docs/superpowers/reviews/<date>-<programme>-post-merge-verification.md`

Record:
- exact pre-merge head;
- merge SHA;
- exact-head PR CI;
- post-merge main CI;
- deployment/live checks;
- authoritative next programme boundary.

## 8. Recovery procedure for a new chat/session

Always start with repository state, not memory.

Read in this order:

1. `HANDOFF.md`
2. live `main` SHA
3. programme tracker
4. active programme post-merge/baseline record
5. active written spec
6. approved implementation plan
7. execution ledger
8. current checkpoint
9. branch vs main diff

Then identify the **first incomplete gate/task from evidence**.

Never restart a completed task because a chat handoff is stale.

## 9. Branch/isolation rule

Preferred:
- reliable local worktree + isolated feature branch.

If the environment cannot provide a reliable local clone/worktree:
- create an isolated GitHub branch;
- keep `main` untouched;
- use GitHub CI as execution evidence;
- record this as a Ruling;
- keep durable ledger/checkpoint artifacts on the branch.

This was required during B1/K1 because direct local GitHub DNS/access was unreliable.

## 10. Acceptance tests during long programmes

A broad end-state acceptance test is valuable but may intentionally fail until late.

Pattern used in K1:
1. create the end-state acceptance test;
2. prove initial RED;
3. gate it during intermediate CI when appropriate;
4. keep checkpoint-specific tests active;
5. re-enable acceptance unconditionally in final integration stage;
6. never merge while the final acceptance is gated/skipped.

Record this decision in the ledger.

## 11. Exact-head integration rule

Do not merge because “tests were green earlier.”

Before merge:
1. resolve exact PR head SHA;
2. verify all required workflows on that exact SHA;
3. run final review/checkpoint commit;
4. verify CI again if that changes HEAD;
5. use `finishing-a-development-branch`;
6. merge only the expected exact head SHA;
7. verify main after merge;
8. verify deployment/live release;
9. only then mark programme complete.

## 12. Two-programme preference

The user prefers two consecutive programmes where practical.

Interpretation:

```text
Programme N
Design → Spec → Plan → Execute → Review → Merge → Post-merge verify
  ↓
real new main baseline
  ↓
Programme N+1
Design → Spec → Plan → Execute → Review → Merge → Post-merge verify
```

Do not design Programme N+1 implementation against an imagined pre-merge baseline.

## 13. Quality principles learned

- Evidence before claims.
- Smaller tasks beat broad tasks when quality/recovery matter.
- Stable IDs before scale.
- Version instead of silent rewrite.
- Raw evidence is durable; derived intelligence is recomputable.
- AI/provider output is untrusted until gates pass.
- No one aggregate quality score can hide a failed critical dimension.
- Public/browser-shipped content is public; protected pools require server-side delivery.
- External standards are adapters, not internal canonical truth.
- Offline/mobile/accessibility are release concerns, not polish.
- Count is not coverage.
- Engagement is not readiness.
- Generated difficulty is intended difficulty until observed/calibrated data exists.
- Never invent historical provenance/quality checks during migration.

## 14. Completion checklist

Before saying a programme is complete:

- approved spec satisfied;
- approved plan reconciled;
- full relevant test suites run fresh;
- zero known Critical/Important findings;
- exact-head CI green;
- merge SHA recorded;
- post-merge main CI green;
- deployment/live checks green;
- tracker/HANDOFF updated;
- next programme explicitly named;
- no later programme product code silently started.

# K3 Tasks 28–30 Preparation Checkpoint

**Date:** 2026-10-06  
**Preparation source main:** `7b30975a377e2b41b2841cde324410b38671791b`  
**Programme:** K3 — Learner Evidence Engine  
**Phase:** F  
**Status:** TASKS 28–30 PREPARED; TASK 28 NOT STARTED

## Verified incoming boundary

Task 27 is merged and post-merge verified.

Incoming durable state:
- CURRENT-STATE revision 62;
- completed through Task 27;
- Task 28 next;
- Phase F / PHASE_GATE;
- `base_main_sha=null`;
- `ACTIVE_REF_RESOLUTION_VALID=PENDING`;
- zero Critical/Important findings.

## Prepared authoritative inputs

Task 28:
- packet `task-028.json`;
- packet blob `2cbd92525ccf7a3de6626e92813616a689022a9b`;
- dependency Task 27;
- exact RED/GREEN `node --test tests/k3-evidence-recorder.test.js`;
- required commit `feat: add K3 browser evidence recorder`.

Task 29:
- packet `task-029.json`;
- packet blob `8fb1e1cab4e94ddd8b53281d475cb536ab95da98`;
- dependency Task 28;
- exact RED/GREEN `node --test tests/k3-app-evidence-integration.test.js tests/k1-current-runtime-regression.test.js`;
- required commit `feat: record assessment learner evidence`.

Task 30:
- packet `task-030.json`;
- packet blob `30eccc68bcf36440d788053902786a4a7b96ebf5`;
- dependency Task 29;
- exact RED/GREEN `node --test tests/k3-storage-sync-capability.test.js tests/storage.api.test.js`;
- required commit `feat: wire optional K3 evidence sync`.

Shared authority:
- spec blob `2ccb4c5c1d01b668c14dce6b97608d4eff04d57d`;
- approved plan blob `ac158561be17aa8424a71b53d5447ae4a2d375c7`;
- process failure rules digest `6f30c61bd07df8d2960f6b5acf199f5188493a0a394ae7151c3330245c263760`.

## Prepared files

- `docs/superpowers/plans/2026-10-06-k3-tasks-28-30-execution-wave.md`
- `docs/superpowers/reviews/2026-10-06-k3-task28-launch.md`
- `docs/superpowers/reviews/2026-10-06-k3-task29-launch.md`
- `docs/superpowers/reviews/2026-10-06-k3-task30-launch.md`
- `docs/superpowers/reviews/2026-10-06-k3-tasks-28-30-preparation-checkpoint.md`
- `docs/superpowers/reviews/2026-10-06-k3-tasks-28-30-handoff.md`

The original packets remain authoritative and byte-unchanged.

## Dependency policy for one-session three-task execution

The three tasks may be completed in one conversation, but they are not one branch and not one merge.

Required sequence:
1. Task 28 fresh branch → RED/GREEN/regression/review → merge → post-merge checkpoint.
2. Task 29 fresh branch from then-live main → same gate → merge → post-merge checkpoint.
3. Task 30 fresh branch from then-live main → same gate → merge → post-merge Phase F checkpoint.

Do not pre-bind Tasks 29/30 before their predecessor is merged.

## Known high-reasoning gate

There is one pre-identified Task 28/29 design tension:

- `recordEvaluation` is part of Task 28 recorder interface;
- Task 29 says submit emits evaluation events;
- `learner.response.evaluated@1` is a SYSTEM event and requires `authority_ref`;
- ordinary local capture currently calls `assertOrdinaryEvidenceProducer` and rejects non-LEARNER definitions.

Execution must not weaken that guard or fabricate an authority origin/sequence.

At Task 28 startup, inspect then-live main for an authorized SYSTEM capture path. If none exists, record a high-reasoning `Ruling:` and use the governed amendment/scope process before Product edits. This checkpoint intentionally keeps the issue visible rather than silently choosing an unsafe workaround.

## No execution performed

No Task 28/29/30 Product file was edited.
No Task 28 RED was run.
No Task 28 branch was bound.
Task 28 remains NOT STARTED.
Task 31 remains outside this wave.

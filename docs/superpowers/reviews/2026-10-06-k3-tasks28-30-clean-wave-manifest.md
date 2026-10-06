# K3 Tasks 28-30 Clean Wave Preparation Manifest

Clean main: `da56d3918cf9a2c024d05f85efa4fc5113653acc`
Clean wave base: `a45835e15e46fa576587cafcde08c29fea59aa79`

Prepared independently from the same clean base:

- Task 28 prep: `3220a92976ecfca64b532288082722bf93f31462`
  - RED tests
  - atomic cross-recorder revision coverage
  - Task 28 IndexedDB scope augmentation
  - no Product implementation

- Task 29 prep: `6609bc54a9c22e671efa4b50993dda6ef986da77`
  - appBridge RED tests
  - canonical objective mapping ruling
  - resume/offline/SYSTEM-authority boundaries
  - no Product implementation

- Task 30 prep: `d29baac2ee43ca3fa366cf230173aa00ca9f97cd`
  - optional authorized-sync RED tests
  - fail-closed/X-Anon-Id isolation ruling
  - no Product implementation

Execution order:

1. Task 28 execution branch starts from this clean wave base + Task 28 prep.
2. After Task 28 is GREEN/reviewed, Task 29 execution starts from the accepted Task 28 head + Task 29 prep. Do not merge to main.
3. After Task 29 is GREEN/reviewed, Task 30 execution starts from the accepted Task 29 head + Task 30 prep. Do not merge to main.
4. Run combined verification/review on the final Task 30 head.
5. Integrate to main only after the entire 28-30 wave is accepted.

Do not use or cherry-pick Product commits from old PR #46 / `impl/k3-task28-evidence-recorder`.

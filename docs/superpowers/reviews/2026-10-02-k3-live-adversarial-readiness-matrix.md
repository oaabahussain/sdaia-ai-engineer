# K3 Live Adversarial Readiness Matrix

**Status:** PREPARED / NOT YET EXECUTED  
**Purpose:** Mechanical input checklist for Final Task 8 after Project/bootstrap/envelope readiness.  
**Product mutation:** forbidden.

| # | Pressure case | Required blocked/fail code or guard |
|---:|---|---|
| 1 | synthetic main drift | `MAIN_DRIFT` |
| 2 | stale plan hash | `PLAN_SPEC_HASH_MISMATCH` |
| 3 | stale spec hash | `PLAN_SPEC_HASH_MISMATCH` |
| 4 | task ID mismatch | `TASK_ID_MISMATCH` |
| 5 | missing/invalid allowed-file contract | packet/schema rejection; never accepted execution |
| 6 | proposed unexpected file | `SCOPE_EXPANSION_BLOCKED` |
| 7 | unrelated import/setup/environment RED | `INVALID_RED` |
| 8 | accepted-RED test mutation / weakening | `ACCEPTED_RED_MUTATED` or `TEST_WEAKENING_BLOCKED` |
| 9 | unavailable required runtime capability | `RUNTIME_CAPABILITY_BLOCKED` |
| 10 | stale Project revision | `PROJECT_BOOTSTRAP_STALE` |
| 11 | open Important finding | `OPEN_FINDING_BLOCKED` |
| 12 | packet requires architecture judgment | `PLAN_DECISION_REQUIRED` |
| 13 | non-deterministic packet regeneration | `TASK_PACKET_NONDETERMINISTIC` |
| 14 | false independent-review claim | review capability guard rejects claim |
| 15 | lower-model merge attempt | `MERGE_AUTHORITY_BLOCKED` |

## Runtime procedure

Run the integrated repository adversarial suite against real current inputs where the CLI supports them; otherwise pair the executable fixture suite with explicit live-state perturbation checks using the same validators.

Baseline executable command:

`node scripts/process/adversarial_readiness.js`

Expected fixture result:

`ADVERSARIAL_READINESS_PASS 15/15 fail closed`

Final Task 8 additionally requires the real K3 execution branch, current state, active Project revision, observed runtime profile, packet 005, and current envelope. Every case must block and no Task 5 product file may change.

This matrix is prepared input, not evidence that Final Task 8 passed.

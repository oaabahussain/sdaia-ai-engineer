# Recovery Protocol

This protocol is static. Live execution position comes only from:

`docs/superpowers/state/CURRENT-STATE.json`

## Startup

1. Invoke the required Superpowers/process skills.
2. Resolve live `main` from GitHub.
3. Read and validate `docs/superpowers/state/CURRENT-STATE.json` from live `main`.
4. Read its `execution_branch` and probe that exact branch.
5. If branch state exists, accept it only when its `base_main_sha` equals live `main`, its `state_revision` does not regress, its spec/plan blob hashes match, and its durable ledger supports the claimed completed task.
6. Choose the valid state with the highest proven revision.
7. Run the repository state validator.
8. If `low_model_ready` is false, **STOP** low-reasoning execution and hand off to a high-reasoning recovery pass.
9. Load only the current task brief, relevant spec sections, touched files, and focused tests.

## Fail-closed conditions

- `MAIN_DRIFT`: live main differs from the execution branch's recorded base. **STOP**. Do not silently rebase or merge.
- `PLAN_SPEC_HASH_MISMATCH`: approved contract blobs differ without an approved amendment. **STOP**.
- invalid or missing state reference: **STOP**.
- incomplete durable ledger proof: **STOP**.
- open Critical/Important finding: **STOP** low-reasoning execution.
- stale Project bootstrap revision: **STOP** low-reasoning execution.

## Recovery after context loss

Trust Git and durable ledger evidence over conversation memory. Resume the first task not durably proven complete. Never repeat a completed task merely because the current chat does not remember it.

A low-reasoning executor works only on the approved execution branch and never merges or pushes directly to `main`.

# Recovery Protocol — K3 H0-R2 Bootstrap

This protocol is static. Live position comes only from `docs/superpowers/state/CURRENT-STATE.json` plus Git and durable ledger evidence.

## Startup

1. Load the required Superpowers process skills.
2. Resolve live `main` and the execution branch from Git.
3. Read and validate `docs/superpowers/state/CURRENT-STATE.json`.
4. Verify the execution branch is based on the live main recorded by validated state; do not silently rebase or reset.
5. Run official `task-start` for the live task selected by state.
6. Compare the exact brief digest with the matching task packet.
7. Verify the current execution envelope and runtime capability profile.
8. Run preflight. Only PASS authorizes product edits.

## Fail closed

Stop on main drift, plan/spec hash mismatch, stale packet, stale Project bootstrap, invalid execution envelope, unavailable required capability, open Critical/Important finding, invalid RED, scope expansion, test weakening, or merge-authority violation.

A lower-reasoning executor must never merge to `main`, alter architecture, broaden packet scope, or invent a fallback when a required capability is missing.

## Recovery after interruption

Trust Git, the SDD ledger, checkpoint evidence, and validated state over chat memory.

If durable state reports `IMPLEMENTED_NOT_CHECKPOINTED`, do not reimplement. Inspect the exact task BASE/result range, verify the packet scope, rerun the required GREEN/regression/result validation, then finish the durable checkpoint if the evidence is valid. If evidence does not validate, stop at the emitted failure code.

Resume only the first task not durably proven complete.

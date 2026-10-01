# Project Index — K3 H0-R2 Bootstrap

This is static navigation for the SDAIA Learning Platform. It never carries live task position, live Git SHA, or CI run identifiers.

## Live execution state

Resolve live Git refs first, then read and validate:

`docs/superpowers/state/CURRENT-STATE.json`

The state manifest points to the active specification, implementation plan, durable ledger, checkpoint, and execution branch. Never infer current position from Project memory, chat history, or this bootstrap.

## Deterministic task execution

For the task selected by validated live state, use:

- the authoritative Superpowers task brief produced by `task-start`;
- the matching task packet under `docs/superpowers/task-packets/k3/task-NNN.json`;
- the current task execution envelope from the task's SDD workspace;
- the relevant approved spec slice and only packet-allowed files.

Before any product edit, verify brief/packet digest identity, validate the execution envelope, and run the repository preflight. A non-PASS gate stops execution.

## Authority order

1. live Git object graph and validated refs;
2. approved product specification;
3. approved implementation plan;
4. durable execution ledger and rulings;
5. current checkpoint evidence;
6. `docs/superpowers/state/CURRENT-STATE.json`;
7. derived task packet/envelope/preflight evidence;
8. this static bootstrap;
9. Project memory and chat transcripts.

The lower-reasoning executor has no merge authority and must not merge or push directly to `main`.

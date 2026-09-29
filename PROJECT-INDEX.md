# Project Index

This is a static navigation document for the SDAIA Learning Platform project.

## Live execution state

Always resolve live GitHub refs first, then read:

`docs/superpowers/state/CURRENT-STATE.json`

Do not infer the current programme position from chat memory, this file, historical handoffs, or programme trackers.

## Execution contracts

The current-state manifest points to the approved active:

- specification;
- implementation plan;
- durable execution ledger;
- checkpoint;
- execution branch.

Load only those referenced artifacts plus the current task brief and touched files.

## Core process documents

- `docs/superpowers/OPERATING_PLAYBOOK.md`
- `RECOVERY-PROTOCOL.md`
- `DURABLE-FILE-MAP.md`
- `HANDOFF.md`

## Source-of-truth order

1. live Git object graph and validated active ref;
2. approved specification;
3. approved implementation plan;
4. durable execution ledger and rulings;
5. current checkpoint evidence;
6. `docs/superpowers/state/CURRENT-STATE.json` as the compact navigation/control manifest;
7. static bootstrap/index documents;
8. Project memory and chat transcripts.

Static bootstrap documents never carry a live main SHA, current task count, temporary branch SHA, or CI run number.

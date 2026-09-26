# Migrations

## Production baseline

Programme A started from immutable commit:

`362d35c697411d4eddcc4536c843df17161d3374`

The planned rollback tag name is:

`pre-programme-a-2026-09-23`

**Verification note (2026-09-26):** the tag could not be verified on the GitHub remote through the available repository connection. Therefore the commit SHA above is the authoritative rollback reference until that tag is explicitly created/confirmed. Documentation must not imply the remote tag exists when it has not been verified.

## Browser state namespace

Legacy input:

`sdaia.state.v1`

Canonical output:

`learning-platform.state.v2`

The browser adapter also recognizes `sdaia_adaptive_v3` as migration input. Legacy browser keys are **read but not deleted** in Programme A. New saves go to `learning-platform.state.v2`.

State migration:

- preserves timestamps/anonymous ID when available;
- migrates unfinished Exam V2 question references;
- preserves answer/confidence/flag/option-order keyed state;
- keeps legacy residual data under `legacy.preserved`;
- is idempotent for StateV2 input.

## Anonymous identity namespace

Legacy input:

`sdaia.anon_id.v1`

Canonical key:

`learning-platform.anon-id.v1`

If a legacy anonymous UUID exists, it is reused and written to the canonical key. The old key is not deleted. UUID identity is not authentication.

## Generated question IDs

Former generated identities `q1..q1120` were positional. Programme A introduced stable namespaced identities and preserved the complete mapping in:

`data/migrations/sdaia-generated-v2-question-ids.json`

The mapping contains one entry for each legacy generated ID from `q1` through `q1120`. Stable IDs must not be renumbered once active.

## Static 121-item bank

Former:

- `data/questions.json`
- `data/sessions.json`

Current disposition:

- `data/legacy/static-bank-v1/questions.json`
- `data/legacy/static-bank-v1/sessions.json`

Status: `MIGRATE_PENDING`; runtime: `NOT ACTIVE`.

The files were retained as migration input because they contain unique authored training material. They are not counted in the current 1,120 generated runtime and are not published in the Pages artifact.

## Removed competing contracts

Programme A removed the active legacy weights file, obsolete question/session/bank/StateV1 schemas, stale release preflight, hard-coded concept loader/helper, and disconnected old mastery/readiness/review/mission logic after reference scans and regression coverage.

Git history remains the recovery source for retired code/schema behaviour.

# K3 Task 5 No-Write Dry-Run Contract

**Status:** PREPARED / NOT YET EXECUTED  
**Purpose:** Make Final Task 7 mechanical after Project bootstrap and Task 5 execution-envelope verification.  
**Product mutation:** forbidden.

## Inputs

- active static Project bootstrap revision `k3-h0-r2-v1`;
- validated `docs/superpowers/state/CURRENT-STATE.json`;
- real Superpowers Task 5 brief produced by official `task-start`;
- `docs/superpowers/task-packets/k3/task-005.json`;
- current Task 5 execution envelope;
- relevant K3 spec slice;
- Task 5 packet-allowed source/test paths only.

## Exact expected extraction from packet 005

**Purpose:** Execute approved K3 Task 5: Schema-derived browser validators and event constructor.

**Allowed create**
- `scripts/generate_k3_validators.js`
- `src/evidence/generatedValidators.js`
- `src/evidence/ids.js`
- `src/evidence/contract.js`
- `tests/k3-generated-validators.test.js`
- `tests/k3-evidence-contract-runtime.test.js`

**Allowed modify**
- `package.json`

**Allowed delete**
- none.

**Exact RED**
`node --test tests/k3-generated-validators.test.js tests/k3-evidence-contract-runtime.test.js`

**Expected behavioral RED**
The task's specified behavior is missing. Module/import/path/setup failure alone is invalid RED and must be repaired before RED is accepted.

**Invalid RED classes**
- `UNRELATED_IMPORT_FAILURE`
- `SETUP_FAILURE`
- `ENVIRONMENT_FAILURE`

**Minimal implementation intent**
Generate browser validators from canonical approved K3 schemas, route payload validation by `payload_schema_ref`, and implement the event constructor around generated validators. Do not manually duplicate payload rules.

**Exact GREEN**
`node --test tests/k3-generated-validators.test.js tests/k3-evidence-contract-runtime.test.js`

**Regression**
`npm test`

**Commit**
`feat: add schema-derived K3 browser validation`

**Merge authority**
`false`

## Dry-run PASS conditions

The no-write executor must identify all fields above exactly from the approved brief/packet/envelope working set, propose no extra file, make no product write, invent no architecture/dependency/fallback, and make no merge attempt.

This document is a prepared expectation, not evidence that Final Task 7 passed.

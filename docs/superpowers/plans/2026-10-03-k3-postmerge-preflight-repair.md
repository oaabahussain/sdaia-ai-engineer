# K3 Post-merge Preflight Repair Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps are independently verified and recorded.

**Goal:** Verify merged K3 and prepare Task 25 without implementing its product scope.
**Architecture:** Keep the current approved product plan and task packets unchanged. Repair the process CLI to consume observed repository lint, deterministic compilation, and failure-rule evidence rather than missing or self-attested flags. Bind fresh task envelopes only after main and state validation.
**Tech Stack:** Existing Node ESM, node:test, Git, existing Python tests. No new dependencies.
**Spec:** `docs/superpowers/specs/2026-09-30-k3-low-model-execution-h0-r2-design.md` and `RECOVERY-PROTOCOL.md`.

## Global Constraints

- No Task 25 product implementation or schema changes.
- No main push, merge, forced dependency upgrade, stale certification reuse, or weakened tests.
- Keep the canonical K3 plan/spec/task packet content and hashes unchanged.
- This process remediation is a separate high-reasoning preparation task, not part of Task 25's allowed product files.

## Review Focus

Valid CLI input must pass. Invalid lint, modified packet, changed rule registry, and stale runtime/envelope binding must each fail their actual gate. Missing authority files must fail closed. Artifact provenance and review limitations must remain explicit.

### Task 1: Repair verified preflight evidence wiring

**Files:** modify `scripts/process/preflight_task.js`; create `tests/h0-r2-preflight-cli.test.js`.
**Interfaces:** reuse `lintExecutionContracts`, `compileTaskPacket`, `gitBlobSha`, `validateFailureRules`, `failureRulesDigest`, and existing stable JSON/digest functions; preserve preflight CLI arguments and PASS/FAIL output.

- [ ] Add CLI tests using real approved packet, plan, spec, rules, bootstrap and bound runtime fixtures; require valid pass and specific rejection gates for modified input.
- [ ] Run `node --test tests/h0-r2-preflight-cli.test.js`; record expected behavioral RED.
- [ ] Wire actual file-derived lint, deterministic packet compilation and rule-registry digest into preflight; validate runtime/base/task/ref envelope identity.
- [ ] Run the focused test and `npm test`, `npm run process:verify`, `PYTHONPATH=server python3 -m pytest -q server/tests`; require zero failures.
- [ ] Perform separate self-review; preserve evidence, fix only verified issues, record limitations.
- [ ] Commit the verified process repair separately from Task 25.

### Task 2: Prepare Task 25 checkpoint

**Files:** state, durable ledger, post-merge readiness checkpoint; dynamic evidence only in the task workspace.
**Interfaces:** official task-start brief, unchanged task-025 packet, fresh runtime profile, bindTaskExecution, actual preflight CLI.

- [ ] Verify official brief digest equals canonical task packet.
- [ ] Validate merged state, live branch/main, complete Tasks 1-24 ledger and full regression evidence.
- [ ] Bind the proposed state to verified live main; do not change completed_through_task or implement Task 25.
- [ ] Run full validation, build and adapter smoke tests where the environment supports them; distinguish hosted CI/browser evidence from local execution.
- [ ] Record exact next-task scope, privacy policy boundaries, security debt, recovery limitations, and review type.
- [ ] Preserve a recoverable bundle and do not claim remote persistence or low-model readiness without its actual evidence.

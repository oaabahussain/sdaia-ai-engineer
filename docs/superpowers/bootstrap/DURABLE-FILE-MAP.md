# Durable File Map — K3 H0-R2 Bootstrap

This file is static navigation, not status.

## Live control

- Current state: `docs/superpowers/state/CURRENT-STATE.json`
- State schema: `docs/superpowers/state/current-state.schema.json`
- State validator: `scripts/validate_current_state.js`

## Process contracts

- Task packets: `docs/superpowers/task-packets/k3/task-NNN.json`
- Packet compiler/validator: `scripts/process/compile_k3_task_packets.js` and `scripts/process/validate_task_packet.js`
- Runtime capability profile: `scripts/process/runtime_capabilities.js`
- Execution envelope binder: `scripts/process/bind_task_execution.js`
- Preflight: `scripts/process/preflight_task.js`
- Result validator: `scripts/process/validate_task_result.js`
- Accepted RED guard: `scripts/process/validate_accepted_red.js`
- Scope guard: `scripts/process/check_task_scope.js`
- Adversarial readiness: `scripts/process/adversarial_readiness.js`

## SDD dynamic evidence

Task brief, task execution envelope, accepted RED evidence, reports, and transient logs belong to the current plan's `.superpowers/sdd/` workspace. These are dynamic artifacts and must not be copied into this static bootstrap.

## Authority rule

Do not hard-code an active task, live SHA, run ID, ledger position, or bootstrap-current status here. Resolve those facts from live state and runtime evidence.

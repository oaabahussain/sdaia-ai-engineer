# SDD ledger — plan: docs/superpowers/plans/2026-09-27-k1-content-factory-governance-core.md

Execution mode: Native / Superpowers executing-plans.
Workspace ruling: local clone/worktree is unavailable because the harness cannot resolve github.com. The isolated GitHub branch `impl/k1-content-factory-governance-core` plus CI and this tracked ledger are authoritative. main remains untouched until finishing gate.
Authority: constitution → research amendment → K1 spec → approved K1 plan → execution rulings/checkpoint.

Pre-flight:
- Core schemas feed lifecycle/policy/provider/release/evidence tasks: aligned with spec.
- Provider results are candidates only; activation is controlled by lifecycle + quality/review policies.
- File/SQLite adapters consume shared logical port semantics; no vendor/database binding in core.
- CoverageGapV1 feeds factory requests; raw count alone is invalid.
- ItemVersion/ContentRelease/AssessmentFormSnapshot are immutable and versioned.
- LearnerEventV1 is raw evidence only; no mastery/readiness truth.
- Current 1,120 import produces grandfathered lineage without inventing historical checks.

Ruling: GitHub branch + CI substitutes for local worktree because local DNS cannot reach github.com. Cost if wrong: slower TDD feedback, mitigated by durable commits and CI evidence.
Ruling: Task 3 acceptance contract will be observed RED once, then temporarily gated during intermediate CI and re-enabled unconditionally in Task 72. Cost if wrong: an acceptance regression could hide mid-run; checkpoint-specific tests remain active and final acceptance must remove the gate before merge.

Next exact task: Task 3 RED acceptance contract.
Nothing merged.

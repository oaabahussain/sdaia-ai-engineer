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

Checkpoint A0/A1/B/C:
- Task 3 RED proven in quality run 217: K1 contract/bootstrap paths and stateMachine module missing as intended. Acceptance test then gated for incremental CI; final Task 72 must remove gate.
- Pre-K1 runtime regression remains green: 1,120 bank, current payload digest, 200 profile, RuntimeBundleV3/StateV2 boundary.
- Private factory artifact guard was already GREEN because Pages copies only data/concepts, data/migrations, learn/cases; explicit regression added.
- A1 schema RED proven in quality run 229 with ENOENT for the new contracts; all core K1 schemas added and quality run 235 + server run 693 passed.
- B RED proven in quality run 239: lifecycle/policy/release modules and policy schemas missing. Implemented explicit state machine, versioned GROUNDED source policy, multidimensional quality policy, conservative review policy, canonical content hash/immutability. Quality run 244 + server run 721 passed.
- C RED proven in quality run 248: provenance/provider modules missing. Implemented structured provenance, provider port assertions, deterministic provider, provider evaluation harness, no-AI path and provider activation boundary. Quality run 250 + server run 738 passed.
Ruling: default K1 SourcePolicy is GROUNDED, not STRICT, matching approved plan; STRICT remains supported per request/track policy. Cost if wrong: some future authoring requests may need explicit STRICT override.
Ruling: default K1 ReviewPolicy requires human approval for new AI candidates and high-risk/quarantined content; deterministic low-risk may be sampled. Cost if wrong: initial throughput is lower but false auto-activation risk is reduced.

Next exact task: Checkpoint D — persistence ports and local orchestration.

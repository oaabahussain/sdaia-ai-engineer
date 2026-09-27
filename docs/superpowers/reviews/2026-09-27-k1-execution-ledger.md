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

Checkpoint D:
- D RED proven in quality run 259 (missing Node store/runner/CLI modules) and server run 758 (missing app.factory_store).
- Implemented Runner/ContentStore/JobStore/EventStore/ReviewPort shape contracts.
- Implemented immutable file content store, append-only JSONL audit, file job store, append-only review store.
- Implemented LocalRunner run/resume/retry/cancel; resume skips completed stage outputs; retries increment attempt.
- Implemented partial batch result semantics: COMPLETED/PARTIAL/FAILED with durable successful siblings.
- Added SQLite factory_runs/factory_stage_outputs/factory_audit tables and Python adapter.
- Added local CLI status/run/resume/retry shell and npm factory script.
- Added shared store-parity fixture; file and SQLite adapters preserve same logical run record.
- Quality run 272 SUCCESS; Server/Adapter run 785 SUCCESS.

Next exact task: Checkpoint E — governed quality pipeline.

Checkpoint E:
- E RED proven in quality run 280: governed pipeline/stage modules absent.
- Implemented fixed ordered pipeline: generate → critique → validate → deduplicate → evidence → distractor → bilingual → accessibility → review → activate.
- Exact/semantic dedup uncertainty becomes REVIEW_REQUIRED; no mandatory vector DB.
- Evidence and bilingual provider ABSTAIN becomes REVIEW_REQUIRED rather than guessed PASS.
- Accessibility/fairness gate rejects missing visual alt metadata and preserves fairness uncertainty.
- Review stage enforces risk-based human approval; activation stage yields CANARY only, never ACTIVE.
- Quality run 290 SUCCESS; Server/Adapter run 825 SUCCESS.

Next exact task: Checkpoint F — Coverage Engine.

Checkpoint F:
- F RED proven in quality run 295: coverage matrix/gap/request modules absent.
- Implemented multidimensional normalized coverage cells and deterministic target-minus-inventory gap detection.
- Count-only request such as {requested_count:14000} remains invalid.
- CoverageGap converts to provider-neutral factory request carrying source/quality/review policies.
- Quality run 298 SUCCESS; Server/Adapter run 841 SUCCESS.
Next exact task: Checkpoint G — releases/canary/rollback/snapshots/migration delta.

Checkpoint G:
- G RED proven in quality run 303: release constructor/lifecycle/rollback/snapshot/delta functions absent.
- Content releases now sort/dedupe item IDs and hash immutable release content.
- Release lifecycle requires DRAFT→DEV→REVIEW→CANARY→ACTIVE; activation requires evidence.
- Rollback selects prior immutable release and emits rollback event without mutating manifests.
- AssessmentFormSnapshot deep-freezes delivered release/items/options/profile/scoring.
- Content release delta exposes added/removed item/objective catch-up candidates without marking unseen content learned.
- Quality run 306 SUCCESS; Server/Adapter run 857 SUCCESS.
Next exact task: Checkpoint H — raw learner evidence + interoperability seams.

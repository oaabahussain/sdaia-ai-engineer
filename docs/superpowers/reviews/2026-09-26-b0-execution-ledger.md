# B0 execution ledger

Plan: `docs/superpowers/plans/2026-09-26-b0-governance-research-sync.md`  
Spec: `docs/superpowers/specs/2026-09-26-b0-governance-research-sync-design.md`

Ruling: isolated GitHub branch is the execution workspace because this harness exposes repository-native branch tools but no local/native worktree or subagent execution tool — this preserves main while keeping all B0 changes reviewable — cost if wrong: loss of local worktree-only bookkeeping, mitigated by this durable ledger.

Pre-flight shared interfaces:
- Tasks 3–4 produce canonical constitution/evidence files consumed by Tasks 5–18 and 21–25: no naming conflict.
- Task 5 produces the research-amendment file consumed by Tasks 6–18: exact path is stable across plan.
- Task 2 produces the governance test file extended by Tasks 6–18 and 22: one test suite owns the contract.
- Task 19 produces current handoff state consumed by Tasks 24–25 and final review: current-state wording must remain distinct from historical records.
- Tasks 23–25 produce audit evidence consumed by Task 28 final review: no interface conflict.

Task 1: started from `main@1808442442cf7e75ba59a298df93e17fd84244f0`.

Task 1: complete — baseline SHA re-read from GitHub and matched `1808442442cf7e75ba59a298df93e17fd84244f0`; baseline file present and verified.

Task 2: complete — governance presence contract written first; RED observed because canonical constitution/evidence/amendment were absent.
Task 3: complete — accepted constitution imported; presence contract remained RED because later canonical files were still absent.
Task 4: complete — evidence appendix imported with provenance note; contract remained RED only for missing research amendment.
Task 5: complete — research amendment shell created; targeted governance presence test GREEN 1/1.

Task 6: Ruling: initial retrieval guardrail regex was order-sensitive and rejected semantically correct text — split it into independent MUST-NOT/retrieval and universally-optimal assertions — cost if wrong: test could miss a wording regression, mitigated by both assertions and the explicit counter-evidence section.
Task 6: complete — targeted TDD RED→GREEN; learning outcomes/spacing/retrieval/gamification rules committed.
Task 7: complete — targeted TDD RED→GREEN; grounded/optional/scaffolded AI tutor rules committed.
Task 8: complete — targeted TDD RED→GREEN; staged AI content activation pipeline committed.
Task 9: complete — targeted TDD RED→GREEN; 14,000+ future/quality separation committed.
Task 10: complete — targeted TDD RED→GREEN; psychometric real-data/versioning guardrails committed.
Task 11: complete — targeted TDD RED→GREEN; actionable analytics/uncertainty rules committed.
Task 12: complete — targeted TDD RED→GREEN; learner source control/community-signal rules committed.
Task 13: complete — targeted TDD RED→GREEN; learner-path friction metrics committed.
Task 14: complete — targeted TDD RED→GREEN; reliability/offline/mobile/WCAG 2.2 rules committed.
Task 15: complete — targeted TDD RED→GREEN; content-overload/progressive-disclosure rules committed.
Task 16: complete — targeted TDD RED→GREEN; evidence-family discipline and project-reference-unverified guardrail committed.
Task 17: complete — targeted TDD RED→GREEN; explicit anti-patterns committed.
Task 18: complete — targeted TDD RED→GREEN; strongest falsifiers/counter-evidence committed.

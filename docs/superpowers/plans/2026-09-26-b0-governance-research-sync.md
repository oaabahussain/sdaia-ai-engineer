# B0 Governance + Research Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Put the accepted architecture constitution, current research evidence/rules, and accurate post-Programme-A governance state onto `main` without changing runtime/product behavior.

**Architecture:** B0 is documentation/governance-only. It imports the accepted design/evidence baseline, adds a dated research amendment and executable documentation contracts, removes stale Programme A state language, and verifies that no runtime/product files changed. The work is intentionally split into small independently reviewable commits.

**Tech Stack:** Markdown, Node.js `node:test`, GitHub Actions, Git/GitHub.

**Spec:** `docs/superpowers/specs/2026-09-26-b0-governance-research-sync-design.md`

**Evidence:** `docs/superpowers/specs/2026-09-26-b0-governance-research-sync-evidence.md`

## Global Constraints

- B0 changes documentation/governance/tests only; no runtime/product code changes.
- Base is `main@1808442442cf7e75ba59a298df93e17fd84244f0`.
- Programme A must be described as merged, deployed, post-merge verified, and complete.
- Current SDAIA exam rules remain `project-reference-unverified`.
- `14,000+` remains a future target, never a current-runtime claim.
- Community reports are failure/user-demand signals, never prevalence estimates.
- Research rules must preserve explicit counter-evidence and uncertainty.
- Historical verification records must remain historically accurate.
- No Programme B feature implementation is allowed in B0.
- Normal repository CI must pass before merge and again after merge.

## Review Focus

1. **Stale state wording:** current handoff must not claim PR #7 is Draft/unmerged; documentation test pins merged/deployed language.
2. **Evidence overstatement:** community anecdotes must not be promoted to verified prevalence; evidence-contract test pins the signal/prevalence distinction.
3. **Future/current confusion:** 14,000+, AI tutor, adaptive engine, psychometrics and protected content must remain future/non-goals; documentation tests pin this.
4. **Authority split:** constitution/evidence must be directly available from `main`, not only via a design branch; file-existence tests pin this.
5. **Scope leakage:** B0 must not change runtime/product files; a baseline-to-branch path allowlist check pins documentation/tests-only scope.

---

### Task 1: Freeze B0 Baseline Metadata

**Files:**
- Create: `docs/superpowers/reviews/2026-09-26-b0-baseline.md`

**Interfaces:**
- Consumes: `main@1808442442cf7e75ba59a298df93e17fd84244f0`
- Produces: immutable B0 baseline record used by later scope verification.

- [ ] **Step 1:** Record repository, base SHA, B0 branch name, Programme A merge SHA, live/post-merge status.
- [ ] **Step 2:** Record B0 allowed path classes: `docs/**`, `README.md`, `HANDOFF.md`, `CONTRIBUTING.md`, `CHANGELOG.md`, `tests/*documentation*.test.js`.
- [ ] **Step 3:** Verify recorded SHA equals GitHub `main` base.
- [ ] **Step 4:** Commit: `docs: freeze B0 governance sync baseline`.

### Task 2: Add B0 Documentation Contract — File Presence RED

**Files:**
- Create: `tests/b0-governance-contract.test.js`

**Interfaces:**
- Produces: B0 governance contract test suite.

- [ ] **Step 1:** Add failing assertions that these canonical files exist on the branch:
  - `docs/superpowers/specs/2026-09-23-learning-platform-vnext-design.md`
  - `docs/superpowers/specs/2026-09-23-learning-platform-vnext-evidence.md`
  - `docs/superpowers/specs/2026-09-26-learning-platform-research-amendment.md`
- [ ] **Step 2:** Run `node --test tests/b0-governance-contract.test.js`.
- [ ] **Step 3:** Expected RED: missing imported constitution/evidence/amendment.
- [ ] **Step 4:** Commit: `test: require canonical governance files on main`.

### Task 3: Import Accepted Constitution

**Files:**
- Create: `docs/superpowers/specs/2026-09-23-learning-platform-vnext-design.md`

**Interfaces:**
- Consumes: accepted source from `design/platform-vnext-spec`.
- Produces: canonical constitution available on the B0 branch/main after merge.

- [ ] **Step 1:** Copy accepted constitution byte-for-byte first.
- [ ] **Step 2:** Add a short current-status header note without rewriting historical sections: Programme A merged/deployed/verified; later amendments listed separately.
- [ ] **Step 3:** Verify original design decisions remain intact.
- [ ] **Step 4:** Run B0 governance test; expect remaining RED only for other missing files.
- [ ] **Step 5:** Commit: `docs: import accepted platform constitution`.

### Task 4: Import Existing Evidence Appendix

**Files:**
- Create: `docs/superpowers/specs/2026-09-23-learning-platform-vnext-evidence.md`

**Interfaces:**
- Consumes: accepted evidence appendix from `design/platform-vnext-spec`.
- Produces: original evidence baseline on the current governance branch.

- [ ] **Step 1:** Copy accepted evidence appendix.
- [ ] **Step 2:** Add only a provenance note linking the 2026-09-26 research ledger; do not alter historical evidence claims.
- [ ] **Step 3:** Run B0 governance test.
- [ ] **Step 4:** Commit: `docs: import platform evidence appendix`.

### Task 5: Add Research Amendment — Header and Scope

**Files:**
- Create: `docs/superpowers/specs/2026-09-26-learning-platform-research-amendment.md`

**Interfaces:**
- Consumes: B0 design + B0 evidence ledger.
- Produces: dated constitutional amendment.

- [ ] **Step 1:** Add status/date/scope/evidence-ledger reference.
- [ ] **Step 2:** State that this amendment governs future programmes and does not claim those features are implemented.
- [ ] **Step 3:** Commit: `docs: start learning platform research amendment`.

### Task 6: Add Learning-Outcome Rules

**Files:**
- Modify: `docs/superpowers/specs/2026-09-26-learning-platform-research-amendment.md`
- Test: `tests/b0-governance-contract.test.js`

**Interfaces:**
- Produces: normative learning/engagement policy.

- [ ] **Step 1:** Add failing test requiring “learning/retention/readiness over engagement”, optional gamification, and no universal retrieval claim.
- [ ] **Step 2:** Verify RED.
- [ ] **Step 3:** Add MUST/SHOULD rules from spec §§5.1–5.2.
- [ ] **Step 4:** Verify GREEN.
- [ ] **Step 5:** Commit: `docs: add evidence-backed learning rules`.

### Task 7: Add AI Tutor Rules

**Files:**
- Modify: amendment + governance test.

- [ ] **Step 1:** Add RED assertions for canonical grounding, deterministic/manual fallback, abstention, and scaffold-before-answer policy.
- [ ] **Step 2:** Verify RED.
- [ ] **Step 3:** Add spec §5.3 rules.
- [ ] **Step 4:** Verify GREEN.
- [ ] **Step 5:** Commit: `docs: govern AI tutor behavior`.

### Task 8: Add AI Content Factory Rules

**Files:**
- Modify: amendment + governance test.

- [ ] **Step 1:** Add RED assertion for exact pipeline:
  `Generate → Critique → Validate → Deduplicate → Evidence → Bilingual check → Review → Activate → Measure → Recalibrate/Retire`.
- [ ] **Step 2:** Add RED assertion prohibiting one-step auto-activation.
- [ ] **Step 3:** Verify RED.
- [ ] **Step 4:** Add spec §5.4.
- [ ] **Step 5:** Verify GREEN.
- [ ] **Step 6:** Commit: `docs: define AI content activation gates`.

### Task 9: Add Question-Quality / Scale Rules

**Files:**
- Modify: amendment + governance test.

- [ ] **Step 1:** RED: require `14,000+` to be explicitly future/capacity rather than current quality claim.
- [ ] **Step 2:** RED: require separation of intended difficulty, observed difficulty, learning value, exam representativeness.
- [ ] **Step 3:** Add spec §5.5.
- [ ] **Step 4:** GREEN.
- [ ] **Step 5:** Commit: `docs: separate question scale from quality`.

### Task 10: Add Psychometric Guardrails

**Files:**
- Modify: amendment + governance test.

- [ ] **Step 1:** RED: require “no calibration claim before real response data”.
- [ ] **Step 2:** RED: require versioned calibration/raw evidence preservation.
- [ ] **Step 3:** Add spec §5.6.
- [ ] **Step 4:** GREEN.
- [ ] **Step 5:** Commit: `docs: add psychometric evidence guardrails`.

### Task 11: Add Actionable Analytics Rules

**Files:**
- Modify: amendment + governance test.

- [ ] **Step 1:** RED: require the three learner questions: where am I, what next, why.
- [ ] **Step 2:** RED: require uncertainty on weak-evidence recommendations.
- [ ] **Step 3:** Add spec §5.7.
- [ ] **Step 4:** GREEN.
- [ ] **Step 5:** Commit: `docs: require actionable learner analytics`.

### Task 12: Add User-Control / AI Mutation Rules

**Files:**
- Modify: amendment + governance test.

- [ ] **Step 1:** RED: require preservation of source/user-authored material and AI disable/label behavior.
- [ ] **Step 2:** RED: require community reports labelled as signals, not prevalence.
- [ ] **Step 3:** Add spec §5.8.
- [ ] **Step 4:** GREEN.
- [ ] **Step 5:** Commit: `docs: protect learner source control`.

### Task 13: Add UX Friction Metrics

**Files:**
- Modify: amendment + governance test.

- [ ] **Step 1:** RED for time-to-start, actions-to-resume, actions-to-weak-topic, actions-to-exam, mobile/RTL and recovery.
- [ ] **Step 2:** Add spec §5.9.
- [ ] **Step 3:** GREEN.
- [ ] **Step 4:** Commit: `docs: define learning UX friction metrics`.

### Task 14: Add Reliability / Offline / Accessibility Rules

**Files:**
- Modify: amendment + governance test.

- [ ] **Step 1:** RED for release-quality reliability/offline/mobile/accessibility and WCAG 2.2.
- [ ] **Step 2:** Add spec §5.10.
- [ ] **Step 3:** GREEN.
- [ ] **Step 4:** Commit: `docs: elevate reliability and accessibility gates`.

### Task 15: Add Content-Overload Rules

**Files:**
- Modify: amendment + governance test.

- [ ] **Step 1:** RED for smallest useful next action and progressive disclosure.
- [ ] **Step 2:** Add spec §5.11.
- [ ] **Step 3:** GREEN.
- [ ] **Step 4:** Commit: `docs: prevent content-overload personalization`.

### Task 16: Add Evidence-Discipline Rules

**Files:**
- Modify: amendment + governance test.

- [ ] **Step 1:** RED for source-family distinction, `project-reference-unverified`, dated evidence ledger.
- [ ] **Step 2:** Add spec §5.12.
- [ ] **Step 3:** GREEN.
- [ ] **Step 4:** Commit: `docs: codify evidence discipline`.

### Task 17: Add Anti-Patterns

**Files:**
- Modify: amendment + governance test.

- [ ] **Step 1:** RED for all anti-pattern categories in spec §6.
- [ ] **Step 2:** Add anti-pattern section.
- [ ] **Step 3:** GREEN.
- [ ] **Step 4:** Commit: `docs: record learning platform anti-patterns`.

### Task 18: Add Counter-Evidence

**Files:**
- Modify: amendment + governance test.

- [ ] **Step 1:** RED for retrieval, gamification, AI-generation and analytics falsifiers.
- [ ] **Step 2:** Add spec §7 without strengthening the evidence beyond the ledger.
- [ ] **Step 3:** GREEN.
- [ ] **Step 4:** Commit: `docs: preserve research counter-evidence`.

### Task 19: Sync Programme A Handoff State

**Files:**
- Modify: `HANDOFF.md`
- Test: B0 governance test.

- [ ] **Step 1:** RED: assert current handoff contains merged/deployed/post-merge verified state and does not say PR #7 remains Draft/unmerged.
- [ ] **Step 2:** Verify RED.
- [ ] **Step 3:** Update only current-status/continuation sections; preserve historical Task 1–12 evidence.
- [ ] **Step 4:** Set exact next boundary to B1 design after B0 merge.
- [ ] **Step 5:** GREEN.
- [ ] **Step 6:** Commit: `docs: sync Programme A handoff after merge`.

### Task 20: Sync Final Review Release Status

**Files:**
- Modify: `docs/superpowers/reviews/2026-09-23-programme-a-final-review.md`

- [ ] **Step 1:** Add post-merge addendum with merge SHA `1808442442cf7e75ba59a298df93e17fd84244f0`.
- [ ] **Step 2:** Preserve original pre-merge review conclusions unchanged.
- [ ] **Step 3:** Record that Pages/server post-merge gates passed.
- [ ] **Step 4:** Commit: `docs: append Programme A post-merge status`.

### Task 21: Sync README Governance Links

**Files:**
- Modify only if needed: `README.md`

- [ ] **Step 1:** Verify README links to constitution/evidence/research amendment after import.
- [ ] **Step 2:** If missing, add a compact “Governance & evidence” section.
- [ ] **Step 3:** Verify no current/future status regression.
- [ ] **Step 4:** Commit only if changed: `docs: link canonical governance sources`.

### Task 22: Evidence-Ledger Contract

**Files:**
- Test: `tests/b0-governance-contract.test.js`

- [ ] **Step 1:** Assert B0 evidence ledger states “Deep”, residual uncertainty, strongest falsifiers, no independent challenge pass, and community-signal limitation.
- [ ] **Step 2:** Assert exact current evidence date `2026-09-26`.
- [ ] **Step 3:** Run test; GREEN.
- [ ] **Step 4:** Commit: `test: enforce B0 evidence provenance rules`.

### Task 23: B0 Scope-Allowlist Test

**Files:**
- Create: `docs/superpowers/reviews/2026-09-26-b0-scope-audit.md`

**Interfaces:**
- Consumes: baseline from Task 1 + B0 branch diff.
- Produces: scope audit.

- [ ] **Step 1:** Compare B0 branch against baseline.
- [ ] **Step 2:** List every changed path.
- [ ] **Step 3:** Fail/reject B0 if any runtime/product path outside allowed documentation/test files changed.
- [ ] **Step 4:** Record result.
- [ ] **Step 5:** Commit: `docs: record B0 scope audit`.

### Task 24: Contradiction Scan — Programme A State

**Files:**
- Modify: scope audit or create `docs/superpowers/reviews/2026-09-26-b0-contradiction-audit.md`

- [ ] **Step 1:** Search current docs for `Draft`, `unmerged`, `not merged`, `PR #7`.
- [ ] **Step 2:** Classify hits as historical vs stale current-state claims.
- [ ] **Step 3:** Fix only stale current-state claims.
- [ ] **Step 4:** Re-run search.
- [ ] **Step 5:** Commit: `docs: remove stale Programme A state contradictions`.

### Task 25: Contradiction Scan — Research Claims

**Files:**
- Modify: contradiction audit.

- [ ] **Step 1:** Search for language claiming current 14,000+, official SDAIA weights, implemented AI tutor/adaptive/psychometrics.
- [ ] **Step 2:** Verify all such current claims are absent.
- [ ] **Step 3:** Verify community evidence is marked signal/partial.
- [ ] **Step 4:** Commit: `docs: verify research claim boundaries`.

### Task 26: Full Documentation Contract GREEN

**Files:**
- No new product files.

- [ ] **Step 1:** Run `node --test tests/b0-governance-contract.test.js`.
- [ ] **Step 2:** Run `npm test`.
- [ ] **Step 3:** Run `npm run validate`.
- [ ] **Step 4:** Expected: all GREEN.
- [ ] **Step 5:** Commit any test-only corrections if genuinely required.

### Task 27: Normal Repository CI Verification

**Files:**
- No changes expected.

- [ ] **Step 1:** Verify PR-quality workflow on current B0 head.
- [ ] **Step 2:** Verify server/API workflow remains green even though B0 is docs-only.
- [ ] **Step 3:** Record workflow run IDs in B0 review record.

### Task 28: B0 Final Review Record

**Files:**
- Create: `docs/superpowers/reviews/2026-09-26-b0-final-review.md`

- [ ] **Step 1:** Record base/head SHAs.
- [ ] **Step 2:** Record all files changed.
- [ ] **Step 3:** Record documentation-contract and full-CI results.
- [ ] **Step 4:** Record evidence limitations and no-independent-review limitation if still true.
- [ ] **Step 5:** Declare B0 accepted only if all spec acceptance criteria pass.
- [ ] **Step 6:** Commit: `docs: record B0 final verification`.

### Task 29: Create Draft B0 Pull Request

**Files:**
- PR metadata only.

- [ ] **Step 1:** Open Draft PR `B0: governance and research sync` into `main`.
- [ ] **Step 2:** Include scope, evidence, micro-task results, non-goals and next boundary.
- [ ] **Step 3:** Confirm changed files are docs/tests only.
- [ ] **Step 4:** Confirm PR is mergeable and CI green.

### Task 30: Merge B0 and Verify Main

**Files:**
- No new source changes.

- [ ] **Step 1:** After owner-approved B0 completion, mark PR ready.
- [ ] **Step 2:** Merge to `main`.
- [ ] **Step 3:** Verify new `main` SHA.
- [ ] **Step 4:** Verify post-merge Pages and server/API workflows.
- [ ] **Step 5:** Verify constitution, evidence appendix and research amendment are directly readable from `main`.
- [ ] **Step 6:** Confirm next exact task is **B1 — Track Presentation Contract design**, not implementation of later B2–B7.

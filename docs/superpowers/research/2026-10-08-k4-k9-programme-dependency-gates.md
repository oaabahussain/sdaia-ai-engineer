# K4–K9 — Source-Derived Programme Dependency and Decision Gates

**Date:** 2026-10-08
**Status:** ROADMAP_RECONCILED / RESEARCH_QUEUE / NOT_APPROVED_IMPLEMENTATION
**Product baseline:** `main@9e55881e9480b4a02d8ef5d92a0b21a9313492f1` (K3 closure PR #63 integrated).
**Source of truth:** existing `docs/superpowers/plans/2026-09-27-post-b3-platform-kernel-roadmap.md` (a ROADMAP, not an implementation plan), `docs/superpowers/reviews/2026-09-28-k2-plus-research-refresh-register.md`, project VNext spec/research amendment, CURRENT-STATE (K3 COMPLETE) and current repository tree. This document is a gap/navigation aid, not a normative replacement.

## User intent and global quality gate

Goal: finish the Learning Platform through K9, preserving the stable K3 learner release and 1,120-question bank until a governed explicit content release. Avoid reinventing mature tooling, prioritize current sources, all tasks must have test-first proof; review before merge and verify the actual published result after merge.

Do **not** infer existing approvals or implementations for K4–K9. Each architectural programme needs: current evidence refresh/critique -> design review -> approved written spec -> approved exact TDD implementation plan -> isolated worktree -> red/green -> regression -> reviewer findings -> exact-head CI -> user-authorized PR landing -> merged-main test and live release -> durable closeout.

## Cross-programme register

| Programme | Outcome from authoritative roadmap | Main invariant | Prerequisite gate / disqualifying claim | Existing design status |
|---|---|---|---|---|
| K4 | Next-Best-Action / Spaced Practice | Versioned, explainable, local-first next-action projection from K3 evidence | No K5 mastery, no guessed FSRS rating or personalized accuracy, no answer leakage | Research discovery saved separately; no approved K4 spec/plan |
| K5 | Mastery & Readiness | Recomputable, uncertainty-aware learner projections over evidence | Must distinguish independent held-out evidence from repeated exposure; not an official SDAIA readiness score | Research queue only |
| K6 | Psychometric Calibration | Empirical classical item statistics and calibrated models where valid | No calibrated IRT/Rasch/DIF claims without predeclared sample, fit and bias thresholds and qualified data | Research queue only |
| K7 | Grounded Pedagogical AI Tutor | Source-grounded tutoring with scaffolding, abstention, auditable tool authority | No generic model statement becomes canonical exam fact; protected/mock answer boundary enforced | Research queue only |
| K8 | Advanced Adaptive Assessment / CAT | Valid adaptive item selection/stopping/exposure management | **Blocked on K6 evidence adequacy**: simulate/holdout and prove constraints before live CAT | Research queue only |
| K9 | Multimodal & Ecosystem | Versioned interoperable QTI/CASE/Caliper/xAPI/LTI and accessible multimodal clients when justified | Canonical data stays internal; least privilege, nonleaking imports and accessibility; no vendor/platform assumptions | Research queue only |

**Dependency:** Base A/B0/B1/B2/B3 → K1 → K2 → K3 → K4 → K5 → K6 → K7/K8 → K9. K7 and K8 may be parallel only after their separate prerequisites; the published plan names K7/K8 as siblings. Preserve K4's independent closure before K5 and onward.

## Proposed research-first work packets (not implementation tasks)

1. **K4**, use `docs/superpowers/research/2026-10-08-k4-evidence-first-discovery.md` to validate scheduler semantics/reuse (Anki/FSRS vs deterministic), learner cold start, timing, privacy, guardrails, due/recommendation versioning and no holdout exposure.
2. **K5**, examine BKT/DKT and simpler evidence aggregation using real historical response labels, leakage independence, versioning, calibration and confidence; define failure-safe insufficient-evidence behavior.
3. **K6**, source robust IRT/Rasch and classical statistics packages/reference implementations; quantify eligible sample volume, response data independence, DIF/fairness/power, uncertainty and validity thresholds; block empirical claims until population exists.
4. **K7**, audit current course provenance, grounding and protected-content policy; evaluate RAG/agent evaluation frameworks, prompt-injection attack cases, lesson scaffolding, refusal/abstention and deterministic fallback.
5. **K8**, inspect 1EdTech QTI 3 CAT implementations, item exposure/content balancing, stopping and simulation; fail-closed if calibrated item pool insufficient.
6. **K9**, evaluate QTI 3, CASE 1.1, xAPI/Caliper, LTI 1.3, WCAG 2.2 and viable multimodal client adapters. Do not mix authentication/authorization trust with content adapter trust.
7. Each programme produces source register, evidence ledger with independent provenance, contradiction/falsifier, gap map, approved spec/plan and tests/CI before Product release. Numeric task counts for K4–K9 must be derived from approved plans; **unknown until then**.

## Guardrails recovered from older project decisions

- Frontend AR/EN, RTL/LTR, mobile and offline tests are release blockers, not stretch goals.
- Content is governed: `QuestionFamilyV2`, item versions, source provenance, immutable releases, anti-duplication, canary/rollback. New item count is not quality.
- Learner evidence and assessment snapshots are append-only/correction-aware; derived mastery, scheduling and readiness cannot overwrite raw events.
- Anonymous local learner ID is NOT authentication or proof of mailbox/device ownership.
- Model training and release automation must be evidence/permission gated; K4 rules cannot silently transition to K8 psychometric claims.
- Preserve public/private Pages boundary and prevent protected mock exposure.
- The current K3 verified Product SHA is `b5edc4461d92b4e9848b291adb14ea8fea76f164`. K3 administrative closure SHA is `9e55881e9480b4a02d8ef5d92a0b21a9313492f1`; provenance is maintained separately.

## Blocker / next smallest action

This document is a **read-only investigation artifact** plus a new proposal branch, not a final approval. Next: present K4 design (rules-first with optional FSRS adapter after real rating semantics and benchmark) and ask for explicit review. If approved, draft K4 normative spec for review, then write implementation plan for review; no K4 code or K5–K9 implementations are authorized just by this tracker.

Stop on any preflight/cross-programme deviation or missing evidence. Do not mark other programmes 100% until fresh exact-source acceptance, CI, review, merge and postmerge are proven.

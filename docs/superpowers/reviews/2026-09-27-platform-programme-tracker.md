# Learning Platform — Authoritative Programme Tracker

**Date:** 2026-09-27  
**Repository:** `oaabahussain/sdaia-ai-engineer`  
**Current product baseline:** `main@0b2547a48fe0300a7a3c3348229e7119a5a8ce20`  
**Tracker status:** authoritative current programme index

## Completed programmes

| Programme | Status | Durable evidence |
|---|---|---|
| Programme A | MERGED + VERIFIED | `docs/superpowers/reviews/2026-09-23-programme-a-final-review.md` |
| B0 | MERGED + VERIFIED | `docs/superpowers/reviews/2026-09-26-b0-final-review.md` |
| B1 | MERGED + VERIFIED | `docs/superpowers/reviews/2026-09-27-b1-post-merge-verification.md` |
| B2 | MERGED + VERIFIED | B2 review/checkpoint + later merged main; historical execution records retained |
| B3 | MERGED + VERIFIED | `docs/superpowers/reviews/2026-09-27-b3-post-merge-verification.md` |

## Current architecture

- TrackRegistryV1 — active.
- TrackManifestV1 — active.
- TrackPresentationV1 — active.
- DomainCatalogV2 — active.
- ExamProfileV2 — active.
- RenderedQuestionV2 — active.
- RuntimeBundleV3 — active.
- StateV2 — active.
- Current bank — 1,120 generated questions.
- Current full exam — 200 questions.
- Current production track count — 1.
- Arabic/English + RTL/LTR — active.
- Browser/API parity — verified.
- Offline/service worker — verified.
- GitHub Pages — verified.
- SQLite adapter smoke — verified.

## Active programme

**K1 — Content Factory & Governance Core**

Current stage:

`WRITTEN_SPEC_REVIEW_GATE`

Approved conversational design:
- Platform Kernel direction approved.
- Content Factory & Governance Core replaces the narrower “Question Factory v2 = generator + checks” interpretation.
- C-ready seams are required without C operational complexity.
- Modular monolith is preferred over microservices now.

Written spec:
`docs/superpowers/specs/2026-09-27-content-factory-governance-core-design.md`

Current rule:
**Do not write the K1 implementation plan or product code until the user explicitly approves the written spec.**

## Next programme

**K2 — Coverage Expansion & Controlled Release**

Status:
`ROADMAP_ONLY`

K2 design starts only after K1 is merged and post-merge verified.

## Future order

K3 Learner Evidence Engine  
K4 Next-Best-Action / Spaced Practice  
K5 Mastery & Readiness Projections  
K6 Psychometric Calibration  
K7 Grounded Pedagogical AI Tutor  
K8 Advanced Adaptive Assessment / CAT  
K9 Multimodal & Ecosystem Integrations

## Authoritative recovery sequence for a new chat

1. Read `HANDOFF.md`.
2. Read this tracker.
3. Resolve current `main` SHA.
4. Read the active programme written spec.
5. If a plan exists and is approved, read it.
6. If execution has started, read the active execution ledger/checkpoint.
7. Inspect branch/main diff before changing anything.
8. Resume the first incomplete gate/task only.

## Historical document rule

The following are historical after their programmes complete:
- B1 plans/checkpoints/ledgers;
- B2 plans/checkpoints/ledgers;
- B3 plans/checkpoints/ledgers;
- `docs/superpowers/plans/2026-09-27-b2-b3-forward-planning.md`.

They remain evidence and must not be deleted, but they must not override this tracker or the current handoff.

## Conflict rule

Precedence:
1. Architecture constitution.
2. Research Amendment.
3. Active approved written spec.
4. Active approved implementation plan.
5. Active execution rulings/checkpoint.
6. Historical plans/reviews.

Any conflict discovered during implementation must be recorded as a Ruling before proceeding.

## User execution preference

- more stages;
- more tasks;
- smaller tasks/microsteps;
- RED → GREEN TDD;
- frequent durable checkpoints;
- continuous execution after approval;
- merge only after exact-head tests pass;
- post-merge verification before starting the next programme;
- where practical, complete two consecutive programmes end-to-end rather than stopping after one.

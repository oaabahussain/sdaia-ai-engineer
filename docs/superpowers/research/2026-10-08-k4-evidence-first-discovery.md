# K4 — Next Best Action and Spaced Practice: Evidence-First Discovery

**Reviewed:** 2026-10-08 (scope: evidence available on this date)
**Status:** RESEARCH_PARTIAL / DESIGN_REVIEW_REQUIRED — NOT APPROVED SPEC, NOT IMPLEMENTATION
**Git baseline:** `main@9e55881e9480b4a02d8ef5d92a0b21a9313492f1`
**Programmes:** K4 specifically; K5–K9 are deferred independent gates.
**Research mode:** BUILD, Deep targeted discovery. No PoC/product code or vendor/library installation has been carried out in this pass.

## 1. Source of truth and existing capabilities

Project's canonical roadmap `docs/superpowers/plans/2026-09-27-post-b3-platform-kernel-roadmap.md` identifies K4 as **Next-Best-Action / Spaced Practice**, followed by K5 mastery/readiness, K6 psychometric calibration, K7 grounded tutor, K8 adaptive/CAT, K9 multimodal/interoperability. It explicitly states the roadmap is NOT an implementation plan.

Canonical previous design `docs/superpowers/specs/2026-09-23-learning-platform-vnext-design.md`, sections 12, 14–16, and `docs/superpowers/specs/2026-09-26-learning-platform-research-amendment.md`, sections 2, 7–10, require:
- raw evidence separate from versioned/recomputable recommendations;
- cold-start, honest uncertainty, explaining **why** each action was selected;
- simple, deterministic learning rule before empirical models;
- privacy, AR/EN, RTL/LTR, offline/mobile and accessible learning UX;
- no K5 mastery or exam-readiness claim in K4 and no K6/K8 calibration fiction;
- distinct LEARN/PRACTICE/CHECK/MOCK feedback, no protected holdout leakage.

Current repository audit:
- `src/evidence/replay.js` already replays immutable evidence across store watermarks using injected versioned projectors.
- `src/evidence/projections/activityProjection.js` and `attemptProjection.js` provide durable activity/attempt projections with corrective/superseding evidence semantics.
- `src/evidence/indexedDbStore.js` has local-first persistent IndexedDB storage and event index, including item and learner lookup.
- `src/evidence/appBridge.js` provides activity/item context tied to exact releases, form snapshots, objective IDs, modes.
- `data/evidence/event-definitions-v1.json` has 12 governed evidence definitions. There is no separately named `src/scheduler/` or `src/learning/` directory in the inspected tree.
- There is NO proof that standard Anki Again/Hard/Good/Easy *ratings* are emitted from an SDAIA exam response; **do not map correctness/confidence to those four ratings without a validated semantic/rubric change**.
- No production authenticated cross-device sync is proven. K4 must work without it.

## 2. Research map — distinct primary papers, implementations and failure evidence

Count distinct works and independent provenance roots, not duplicate records or forks. At least 13 distinct evidence items inspected; more than one source can share a family.

| ID | Type / root | Primary source (direct URI) | Verified relevance | Limit |
|---|---|---|---|---|
| E01 | Review, Dunlosky et al. 2013 | https://www.psychologicalscience.org/publications/journals/pspi/learning-techniques.html | Retrieval/practice testing and distributed practice rated high across many settings | Not a universal prescription for exact intervals |
| E02 | Meta-analysis, Cepeda et al. 2006 | https://doi.org/10.1037/0033-2909.132.3.354 | 317 experiments; spacing duration depends on retention horizon | Largely verbal recall settings |
| E03 | Applied systematic review, Agarwal et al. 2021 | https://doi.org/10.1007/s10648-021-09595-9 | 50 school/classroom experiments and applied conditions for retrieval | Limited geographic diversity; not uniquely SDAIA exams |
| E04 | Review, McDermott 2021 | https://www.annualreviews.org/content/journals/10.1146/annurev-psych-010419-051019 | Retrieval benefits durable future remembering | No reason to infer mastery without held-out evidence |
| E05 | Meta-analysis, Adesope et al. 2017 | https://doi.org/10.3102/0034654316689306 | Testing effect and moderators; retrieval learning evidence | Full paper access restricted in this pass |
| E06 | Experiments, Rohrer & Taylor 2007 | https://digitalcommons.usf.edu/psy_facpub/1767/ | Spacing/interleaving mathematics practice affects later performance | Small domain-specific experiments, not all subjects |
| E07 | Experimental study, Cepeda et al. 2009 | https://pubmed.ncbi.nlm.nih.gov/19439395/ | Non-monotone gap effects; timing horizon matters | Laboratory materials/participants |
| E08 | Maintainer implementation, Anki | https://github.com/ankitects/anki/blob/main/docs-site/manual/deck-options.mdx | FSRS configurable desired-retention/workload; cautions about remapping Hard and bulk rescheduling | Four-rating flashcards ≠ objective/scenario MCQ evidence |
| E09 | Maintainer algorithm, FSRS-6 | https://github.com/open-spaced-repetition/fsrs4anki/wiki/The-Algorithm | Open DSR model with stability/difficulty/retrievability, versioned coefficients | Published version snapshot, must pin before trial |
| E10 | Maintainer TypeScript implementation | https://github.com/open-spaced-repetition/ts-fsrs | Reusable JS scheduler and separate optimization binding; Node >=20 | Package/version, license and bundle/browser needs an exact pinned audit |
| E11 | Independent runtime implementation, Rust | https://github.com/open-spaced-repetition/fsrs-rs/blob/main/README.md | Alternative portable optimizer/simulation/scheduler baseline | Adding Rust/WASM complexity not yet justified |
| E12 | Maintainer active issue | https://github.com/open-spaced-repetition/ts-fsrs/issues/373 | In 2026, concerns about Date coupling, UTC/local elapsed-day inconsistencies and Temporal redesign | OPEN roadmap/issue, not proof a particular version is broken |
| E13 | Maintainer reported issue | https://github.com/open-spaced-repetition/fsrs4anki/issues/582 | Post-migration schedules can surprise users; motivates canary/no bulk reschedule | One self-reported complaint, not measured incidence |
| E14 | Contradictory classroom signal | https://www.learningscientists.org/blog/2017/7/20-1 | Some classroom experiments do not show longer spacing or retrieval dominance | Secondary commentary; inspect original study before extrapolating |
| E15 | Standards body, W3C | https://www.w3.org/TR/WCAG22/ | Current accessibility baseline for learner-facing interaction | Conformance requires testing, not a citation |
| E16 | Off-policy evaluation theory | https://www.microsoft.com/en-us/research/?p=580345 | Contextual-bandit policy evaluation needs known logging propensities or models and strong bias/variance assumptions | **NOT** evidence to deploy exploration bandits to learners today |

**Source-family count:** learning-science works E01–E07 and E14 involve distinct studies/publications (E14 secondary); maintainer implementation family E08–E09 and E13, open-spaced-repetition TypeScript issue+implementation E10/E12, Rust runtime E11, W3C E15, off-policy research E16. Multiple Anki/FSRS links should not be counted as independent confirmations.

## 3. Gap map (do not assume absence in uninspected files)

| Decision | Project evidence | Gap/risk | Proposed initial direction | Status |
|---|---|---|---|---|
| Canonical evidence read | K3 replay/projections, event sequence/identity | correction and stale watermarks; privacy/tenant boundary | reuse K3 store/replay, no second learner-event store | ALREADY_HAVE |
| Deterministic next action | K3 projections exist | no K4 recommendation contract in audited directories | separate versioned derived output and pure policy selection | NEW_CORE_CAPABILITY |
| Learner study schedule | K3 raw timestamps/item history | MCQ correctness not four FSRS ratings | start with deterministic, configurable baseline, then separately benchmark a FSRS adapter with true ratings | NEW_CORE_CAPABILITY; FSRS optional |
| Candidate pool constraints | K2 families, versions, modes, release history | duplicates, exposure bias, exam/protected leakage | objective/family/release-aware eligibility before any rank | HARDEN_EXISTING |
| Cold start | historical learner evidence may be empty | false precision/overconfident personalized claim | transparent first-study path with fallback and uncertainty | NEW_CORE_CAPABILITY |
| Learner controls | existing bilingual browser | navigation burden and untrusted automation | optional recommend/skip/snooze, clear why in AR+EN, never block exam | NEW_CORE_CAPABILITY |
| Multidevice, offline | K3 local IndexedDB outbox | timezone/DST and uncertain server identity | local-first scheduling and deterministic UTC/date conversion, no production sync claim | HARDEN_EXISTING |
| Experimentation | K2 event/experiment hooks | no intervention assignments/propensities demonstrated | avoid bandits initially; reserve safe rollout/holdout after evidence+consent | DEFERRED |

## 4. Candidate architectures — not yet approved

**Option A — deterministic rules only.** Pure function selects the next eligible activity from K3 evidence: overdue revisits, recently failed unexposed families, objective prerequisites where *approved*, fixed but configurable cooldowns, user overrides; returns provenance and policy version. Lowest risk, explainable, no externally learned parameters; simple but less personalized.

**Option B — deterministic policy + optional memory model adapter.** Same invariant outer policy, separate FSRS/other scheduler port, opt-in *after* real graded-recall semantics, cross-language/browser benchmarks, migration/no-reschedule canary and stability tests. Adapter NEVER bypasses eligibility, privacy, protected content, or explicit learner intent. **Recommended as architecture to review**, with only Option A enabled at K4 first release.

**Option C — contextual bandits/ML ranking.** Requires assignment propensity logging, sufficient independent outcomes, safety/constrained exploration, offline counterfactual evaluation and controlled trial. No evidence those prereqs exist; **DO_NOT_ADOPT in K4 initial release**.

## 5. Test-first concerns for prospective K4 design

1. Empty learner history -> deterministic non-personalized welcome action (must not claim personalized mastery).
2. Duplicate/replayed/corrected/out-of-order events -> same recomputable outcome at identical watermark; corrected evidence supersedes original.
3. Content release pin and family-level exposure dedupe; content not loaded/offline -> explicit fallback, not unavailable/protected item.
4. Strict mock/check sessions never reveal hints/answers or contaminate learning selection; practice/learning mode must honor feedback policy.
5. Same timestamps across UTC/Asia-Riyadh, DST zones and device timezone changes -> stable due-day semantics.
6. Bounded review queue with small achievable action; snooze/skip/no forced study; never inflate completed counts on repeated attempts.
7. AR/EN, RTL/LTR, WCAG 2.2, mobile/offline refresh; no regressed 200-question exam/bank SHA.
8. Scheduler model version and source watermark exposed for audit/replay; never mutate K3 append-only event history from projection.
9. Correctness signals and self-rated retrieval grades must not be conflated; null unknowns remain unknown.
10. Release rollback/resume; mock/holdout answer key and hidden protected bank never shipped by recommender.

## 6. Strongest falsifiers and open questions

- Falsifier: an FSRS algorithm with excellent flashcard benchmarks might underperform a simple rule for scenario-based certification questions when no comparable graded-recall signal exists. Run representative **frozen realistic review-history replay** vs simple baseline before any adoption.
- Falsifier: more frequent spaced practice may increase workload/friction and hurt completion or transfer for some learners. Require retained learning outcome measures, user controls and cohort trials; avoid blind 90% tuning.
- Open: approved objective prerequisite graph and its provenance; current quantity of repeat retrieval histories; legal/privacy retention/deletion implementation in specific deployment; whether current practice mode emits a genuine recall grade.
- Open: exact interval caps, target review workload and fairness criteria must be decided from product constraints and data, not invented.

## 7. Scope and decision gate

This source map and proposal are **not** a signed-off normative K4 specification and **not** an implementation plan. They contain no runtime change, feature code, scoring rules or automatic adoption of FSRS. Next: present the three architecture options and a selected K4 design to the user; after approval, write the detailed K4 normative spec, obtain spec approval, write TDD implementation plan, obtain plan approval, then implement with per-task preflights/reviews and verify/merge/postmerge. Repeat for K5–K9 independently and do not start K5 before K4 verified.

**Research confidence:** Useful primary+implementation+failure map with material K4-specific calibration and source-semantic gaps. `DECISION_GATE=NOT_READY_FOR_IMPLEMENTATION`, `PENDING_DESIGN_APPROVAL`. Do not claim research 100% or trials performed.

# K2 Written Spec — Self-Review & Contradiction Audit

**Date:** 2026-09-28  
**Branch:** `docs/k2-research-refresh-register`  
**Spec:** `docs/superpowers/specs/2026-09-28-k2-coverage-expansion-controlled-release-design.md`  
**Purpose:** Verify the written K2 spec against the accepted constitution, research amendment, K1 spec, K2 roadmap and research-refresh register before user review.

## 1. Placeholder and completeness scan

Fresh scan of the written K2 spec:
- TODO: none;
- TBD: none;
- FIXME/XXX: none;
- vendor-required language for PostHog/Statsig/Langfuse: none;
- direct GENERATED→ACTIVE bypass: none;
- count-only/mass-generation acceptance: none.

The spec contains all thirteen K2 design points from the active roadmap.

## 2. Authority alignment

### Constitution
Aligned:
- no quantity theatre;
- QuestionFamily remains the meaningful authored unit;
- Arabic/English remain first-class;
- stable/versioned identities are preserved;
- no silent breaking changes;
- reuse before framework/infrastructure churn;
- public/private boundaries remain explicit;
- future analytics/learner intelligence remains evidence-based.

### 2026-09-26 Research Amendment
Aligned:
- learning/engagement metrics remain distinct;
- AI output is never authority;
- generation remains quality-gated;
- source/user material is not silently rewritten;
- psychometric claims are deferred until real response evidence exists;
- analytics must be actionable;
- uncertainty/abstention are preserved;
- reliability/offline/accessibility remain release concerns.

### K1 Content Factory & Governance Core
Aligned:
- K2 consumes K1 rather than replacing it;
- required factory ordering is preserved;
- CANARY precedes ACTIVE;
- released versions remain immutable;
- rollback selects prior compatible release;
- SourcePolicy / QualityPolicy / ReviewPolicy remain versioned;
- provider independence and deterministic/no-AI paths remain;
- raw learner evidence is not converted into mastery/readiness truth;
- no mandatory dedicated vector database is introduced.

## 3. Scope boundary audit

K2 spec explicitly excludes implementation of:
- K3 learner intelligence;
- K4 scheduler/next-best-action;
- K5 mastery/readiness;
- K6 psychometrics;
- K7 tutor;
- K8 CAT;
- K9 multimodal/LMS ecosystem.

K2 does introduce **measurement/event-governance foundations**, but does not implement derived learner intelligence. This is consistent with the approved new K2 design point 13.

## 4. Research-to-design traceability

All thirteen roadmap points have a corresponding spec section:

1. Expansion unit → §§6–7
2. Batch sizing → §8
3. Provider routing/evaluation → §9
4. Evidence/source policy → §10
5. Human review scaling → §11
6. Semantic dedup → §12
7. Intended vs observed difficulty → §13
8. CANARY evidence → §§17–18
9. Release cadence → §16
10. Rollback/quarantine → §19
11. Bilingual authoring → §14
12. Quality sampling → §15
13. Measurement/observability/improvement → §§21–25

Calibration-only values are separated in §20/§33 rather than guessed.

## 5. Reuse-before-build audit

The spec treats mature commodity capabilities as adapters rather than core ownership:
- analytics/funnels/replay;
- feature flags;
- experiments;
- generic telemetry;
- AI trace/eval viewers;
- human-review UI.

The platform still owns the differentiated education semantics:
- coverage;
- learning/objective lineage;
- evidence authority;
- question-family/item lifecycle;
- bilingual equivalence policy;
- review authority;
- release evidence;
- calibration policies;
- improvement semantics.

No vendor is made canonical.

## 6. Privacy audit

The spec carries forward:
- purpose limitation;
- data minimization;
- privacy classification on events;
- separation of optional product analytics from core learning evidence;
- anonymous/local-first where practical;
- retention by policy;
- cross-border/deployment review rather than hidden assumptions.

No specific retention period or legal text is invented.

## 7. Ambiguity audit

Potential ambiguity identified and resolved in the spec design:
- **Adaptive tranche** does not mean adaptive learner delivery; it means production batch sizing based on operational evidence.
- **Improvement agent** is a future evidence/hypothesis consumer, not an autonomous production actor.
- **Feature flag** controls exposure; it does not replace immutable ContentRelease history.
- **Experiment** is for causal hypothesis testing; it is not the default deployment mechanism.
- **Calibration policy** holds operating thresholds; architecture does not hard-code them.
- **CANARY HOLD** is a valid state when evidence is insufficient; insufficient data is not treated as PASS.

## 8. Deferred items are intentional, not missing architecture

Deferred to pilot/runtime evidence:
- numeric tranche sizes;
- review percentages;
- dedup thresholds;
- bilingual automatic-metric thresholds;
- canary exposure/duration;
- anomaly thresholds;
- retention periods;
- final analytics vendor;
- track-specific source approvals.

Each belongs to versioned calibration/deployment policy.

## 9. Material contradiction result

**No material contradiction found** between the written K2 spec and the current higher-authority architecture/research/K1 documents.

No product code, implementation plan or execution ledger has been started.

## 10. Gate result

The written spec is ready for **user review**.

Next allowed step after explicit user approval of the written spec:
- invoke `superpowers:writing-plans`;
- create the detailed K2 implementation plan with many stages/tasks/microsteps;
- stop again for explicit plan approval before implementation.

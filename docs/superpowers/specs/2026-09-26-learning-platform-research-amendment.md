# Learning Platform Research Amendment — 2026-09-26

**Status:** Approved governance amendment for B0 implementation  
**Date:** 2026-09-26  
**Applies to:** Future Programme B–H design and implementation  
**Evidence ledger:** `docs/superpowers/specs/2026-09-26-b0-governance-research-sync-evidence.md`

## Scope

This amendment adds evidence-backed learning, AI, analytics, reliability and content-production rules to the existing architecture constitution.

It does **not** claim that the following are implemented by B0 or Programme A:

- adaptive learning engine;
- spaced scheduler;
- AI tutor;
- psychometric calibration;
- protected assessment service;
- 14,000+ content expansion;
- Programme B multi-track registry/content model.

The accepted 2026-09-23 constitution remains the architectural baseline. This amendment governs later programmes where it adds stricter or newer evidence-backed constraints.


## 1. Learning outcomes over engagement

**MUST** optimize primary success metrics for learning, retention, transfer, readiness and calibration. Streaks, XP, badges, session count and time-on-site are secondary engagement signals, not proof of learning.

Gamification is secondary to learning outcomes and may be used only when it supports practice or retention without distorting learner decisions.

## 2. Practice, spacing and feedback

**MUST** keep learning, practice, check and mock modes distinct and provide corrective feedback in learning/practice flows while preserving delayed feedback where assessment validity requires it.

**SHOULD** use spaced/distributed review by default for retention and hide scheduler complexity from ordinary learners.

**MUST NOT** treat one retrieval or spacing policy as universally optimal across every subject or learner context.

## 3. AI tutor behavior

**MUST** ground course-specific tutor behavior in canonical track content and evidence. A general-model answer is not authoritative track truth.

**MUST** preserve a deterministic/manual learning path when AI is disabled, unavailable, or inappropriate; AI assistance is optional rather than the only path.

**MUST** distinguish sourced track facts from general-model knowledge and allow abstention or escalation when evidence is missing or contradictory.

Tutoring should prefer hints, questions and scaffolded support before direct answer dumping when the learning objective permits it.

## 4. AI-generated content quality

**MUST NOT** auto-activate generated questions, explanations, translations or tags from a single generation step.

The canonical future content pipeline is:

`Generate → Critique → Validate → Deduplicate → Evidence → Bilingual check → Review → Activate → Measure → Recalibrate/Retire`

Each stage must preserve appropriate source/evidence, generator/reviewer and version metadata. Post-publication item evidence must support recalibration or retirement.

## 5. Question quality vs quantity

The **14,000+** target remains a future coverage/capacity target, not a current-runtime fact and not a quality metric.

**MUST** build the quality/evaluation pipeline before mass expansion and reject superficial paraphrase multiplication.

The platform must keep **intended difficulty**, **observed difficulty**, **learning value**, and **exam representativeness** as separate concepts rather than collapsing them into one score.

## 6. Psychometric guardrails

There is **no psychometric calibration claim before sufficient real response data exists**. Generated or authored difficulty labels are intentions until empirical learner evidence supports stronger claims.

**MUST** keep versioned calibration outputs separate from durable **raw learner evidence**, and define minimum evidence thresholds before discrimination, distractor, response-time, retention or IRT-style outputs are treated as calibrated.

## 7. Actionable analytics and next-best action

Learner analytics must answer:

1. **Where am I now?**
2. **What should I do next?**
3. **Why is that the recommended next action?**

**MUST** make analytics actionable, keep durable evidence separate from derived mastery/readiness projections, and expose **uncertainty when recommendations rest on weak evidence**.

## 8. User control over AI transformation

**MUST** preserve source material and user-authored material without silently replacing it with generated facts. Generated or derived content must be labelled when material.

AI assistance should be possible to disable where practical, and deterministic exam/flashcard sources must not be contaminated by unrequested generated facts.

Community reports are **failure and user-demand signals, not prevalence evidence**.

## 9. UX friction and redesign

Material learner-facing redesigns **MUST** measure learning-path friction rather than treating visual cleanliness as sufficient evidence of improvement.

Minimum measures/checks:
- `time-to-start-learning`;
- `actions-to-resume`;
- `actions-to-weak-topic`;
- `actions-to-exam`;
- task completion on `mobile/RTL`;
- `recovery after refresh/offline interruption`.

## 10. Reliability, offline and accessibility

**MUST** treat **release-quality reliability, offline, mobile and accessibility** as core product constraints rather than later polish.

Use **WCAG 2.2** as the current web-accessibility baseline where applicable, preserve tested offline recovery guarantees unless explicitly replaced, and avoid performance-heavy additions that materially degrade low-bandwidth/mobile learning without demonstrated benefit.

## 11. Content overload

**SHOULD** prefer the **smallest useful next learning action** that addresses the learner need instead of presenting a large undifferentiated catalog as personalization.

Use **progressive disclosure** for advanced analytics/settings so the learner is not required to understand internal algorithm complexity to continue learning.

## 12. Evidence discipline

**MUST** distinguish **official/primary evidence**, **independent research**, **implementation evidence**, and **community signals**.

Multiple URLs with one provenance root do not become independent confirmation. Current SDAIA exam rules/weights remain **project-reference-unverified** until current primary evidence supports promotion.

Maintain a **dated evidence ledger** so future research refreshes are incremental and contradictions remain visible.

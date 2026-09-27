# Content Factory Governance Alignment Review

**Date:** 2026-09-27  
**Base:** `main@0b2547a48fe0300a7a3c3348229e7119a5a8ce20`  
**Reviewed spec:** `docs/superpowers/specs/2026-09-27-content-factory-governance-core-design.md`

## Sources reviewed

- 2026-09-23 Learning Platform vNext constitution.
- 2026-09-26 Learning Platform Research Amendment.
- B1/B2/B3 specs/plans/reviews.
- Post-B3 HANDOFF.
- Current forward-planning brief.
- Current main architecture/contracts.

## Alignment findings

### Constitution alignment — PASS

The new spec preserves:
- “the track is data; the learning platform is code”;
- explicit versioned contracts;
- stable identifiers;
- bilingual first-class support;
- explicit migration rather than silent breakage;
- offline/mobile/accessibility constraints;
- no unnecessary framework/runtime rewrite;
- separation of learning and assessment;
- future track reuse without code forks.

### Research Amendment alignment — PASS

The new spec preserves all required content-quality stages:
Generate → Critique → Validate → Deduplicate → Evidence → Bilingual check → Review → Activate → Measure → Recalibrate/Retire.

The spec **refines** this sequence by inserting stricter gates such as distractor quality, accessibility/fairness and CANARY. It does not remove or reverse any required amendment stage.

It also preserves:
- no single-step AI activation;
- no mass expansion before eval infrastructure;
- no psychometric claim before sufficient learner evidence;
- raw evidence separate from derived intelligence;
- deterministic/manual non-AI path;
- source/user material preservation;
- accessibility/offline as core constraints.

### B1/B2/B3 compatibility — PASS

The new programme builds on, rather than replacing:
- TrackRegistryV1;
- TrackManifestV1;
- TrackPresentationV1;
- DomainCatalogV2;
- ExamProfileV2;
- RenderedQuestionV2;
- RuntimeBundleV3;
- StateV2.

Current 1,120-question and 200-question behavior remains a required migration/regression boundary.

### Forward-plan reconciliation — PASS

Historical `2026-09-27-b2-b3-forward-planning.md` remains valid as historical planning through B3.

Its post-B3 phrase “Question Factory v2 → large-scale content expansion” is now refined to:

`K1 Content Factory & Governance Core → K2 Coverage Expansion & Controlled Release`

This is an extension, not a reversal.

## Potential contradiction resolved

The Research Amendment calls its content pipeline “canonical”. The new spec adds Accessibility/Fairness and CANARY stages.

Ruling:
“Canonical” is interpreted as the **minimum required ordered stages**, not a prohibition against inserting additional gates. The new spec may insert stricter gates but may not remove or reverse amendment-required stages without a governance amendment.

## Scope check

The programme is large but cohesive: all K1 components exist to govern content lifecycle and create stable C-ready seams. Distributed control-plane features remain explicitly deferred.

K2 is separated into its own later spec/plan to avoid mixing factory infrastructure with mass content expansion.

## Result

No material conflict found that blocks written-spec review.

Current gate:
`WRITTEN_SPEC_REVIEW_GATE`

No product implementation is authorized until the written spec is explicitly approved and a subsequent implementation plan is written and approved.

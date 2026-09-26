# B0 — Governance + Research Sync Design

**Date:** 2026-09-26  
**Status:** Draft for owner review  
**Repository:** `oaabahussain/sdaia-ai-engineer`  
**Base:** `main@1808442442cf7e75ba59a298df93e17fd84244f0`  
**Scope:** Documentation/governance synchronization and research-rule amendment only.  
**Runtime/product code changes:** None.

## 1. Intent

Programme A is merged, deployed and post-merge verified. Before Programme B changes runtime architecture, the repository must have one coherent source of architectural truth on `main`.

B0 exists to:

1. synchronize the accepted vNext architecture constitution and evidence appendix onto `main`;
2. remove stale Programme A status language from handoff/governance documents;
3. incorporate the 2026-09-26 research audit as an explicit amendment rather than leaving it only in chat history;
4. convert the strongest evidence-backed lessons and failure patterns into durable product/architecture rules;
5. preserve uncertainty and counter-evidence rather than treating product anecdotes as universal laws;
6. provide a stable handoff point before Programme B.

B0 is intentionally documentation-only. It does not implement the track registry, content engine, adaptive learner, AI tutor, spaced scheduler, psychometrics, or 14,000+ content expansion.

## 2. Current problem

The deployed/runtime state is ahead of repository governance documentation:

- Programme A is merged and deployed on `main`;
- `HANDOFF.md` on `main` still contains stale pre-merge/Draft language;
- the authoritative architecture constitution and its evidence appendix remain on `design/platform-vnext-spec`, not `main`;
- current research findings are not yet represented in durable repository policy.

That creates a documentation split-brain risk for future humans/agents.

## 3. Decision

Use **Option B: Governance + Research Sync**.

B0 will copy the accepted constitution/evidence appendix into the current governance baseline, append a dated research amendment, correct Programme A state, and add executable documentation-contract checks.

No old design document is silently replaced. Historical design material remains attributable to its date; the amendment records what changed and why.

## 4. B0 micro-phases

The implementation plan must decompose B0 into very small checkpoints. At minimum:

### B0.1 — Evidence freeze
- record current `main` SHA;
- freeze the 2026-09-26 evidence ledger;
- identify verified, partial and unverified claims;
- record strongest counter-evidence.

### B0.2 — Constitution import
- copy the accepted architecture constitution to `main`;
- copy the existing evidence appendix to `main`;
- preserve original dates/status history;
- add a note that Programme A is now merged/deployed.

### B0.3 — Programme A state sync
- update `HANDOFF.md`;
- update final-review release status where needed without rewriting historical verification claims;
- update README/governance references only when stale.

### B0.4 — Research amendment
Add a dated amendment with:
- evidence-backed learning rules;
- user-experience failure patterns;
- AI quality/safety rules;
- analytics/actionability rules;
- content-production gates;
- explicit counter-evidence and uncertainty.

### B0.5 — Documentation contracts
Add tests that fail if:
- constitution/evidence appendix are absent from `main`;
- Programme A is described as Draft/unmerged;
- the research amendment loses required rules;
- community signals are mislabelled as prevalence evidence;
- future targets such as 14,000+ are presented as implemented;
- current SDAIA exam profile is described as official.

### B0.6 — Contradiction scan
Scan current governance docs for:
- Draft/unmerged Programme A claims;
- missing/dead design-branch references;
- contradictory evidence-status wording;
- runtime claims that differ from post-merge verification.

### B0.7 — Review and CI
- review documentation diff only;
- run documentation contracts;
- run normal CI because docs/tests are still repository changes;
- create a small Draft PR.

### B0.8 — Merge verification
After owner approval:
- merge the B0 PR;
- verify `main` SHA;
- verify post-merge CI;
- confirm canonical governance files exist on `main`;
- record the next exact Programme B entry point.

## 5. Research amendment — governing rules

Rules are classified as **MUST**, **SHOULD**, or **MAY**. Evidence strength is recorded separately in the evidence appendix.

### 5.1 Learning outcomes over engagement

**MUST**
- optimize primary success metrics for learning, retention, transfer, readiness and calibration;
- treat streaks, XP, badges, session count and time-on-site as secondary engagement signals, not proof of learning;
- never block a core learning action solely to preserve an engagement mechanic.

**MAY**
- use gamification when it demonstrably supports practice/retention and does not distort learning decisions.

Reason: user reports show both positive and negative outcomes from repetition/streak mechanics. The amendment therefore rejects both extremes: “gamification is always good” and “gamification is always bad.”

### 5.2 Practice, spacing and feedback

**MUST**
- keep learning/practice/check/mock modes distinct;
- provide corrective feedback in learning/practice flows;
- preserve delayed-feedback behavior where assessment validity requires it.

**SHOULD**
- use spaced/distributed review as a default retention mechanism;
- hide scheduler complexity from ordinary learners;
- explain recommendations in learner terms such as “review now because retention is weakening,” not algorithm parameters.

**MUST NOT**
- claim that one retrieval/spacing policy is universally optimal across all subjects.

### 5.3 AI tutor behavior

**MUST**
- ground course-specific tutor behavior in canonical track/content/evidence;
- preserve a deterministic/manual learning path when AI is unavailable, disabled or inappropriate;
- distinguish sourced track facts from general-model knowledge;
- permit abstention/escalation when evidence is missing or contradictory;
- avoid default answer-dumping in tutoring interactions; prefer hints, questions and scaffolded support where pedagogically appropriate.

**MUST NOT**
- treat a general LLM response as authoritative track truth.

### 5.4 AI-generated content quality

**MUST**
- never auto-activate generated questions/explanations/translations into an active assessment pool from a single generation step;
- require staged generation, critique, deterministic validation, duplicate checks, evidence/provenance checks, bilingual equivalence checks and approval gates appropriate to risk;
- preserve source/evidence and generator/reviewer/version metadata;
- collect post-publication item-performance data and allow recalibration/retirement.

The canonical future content pipeline is:

`Generate → Critique → Validate → Deduplicate → Evidence → Bilingual check → Review → Activate → Measure → Recalibrate/Retire`

### 5.5 Question quality vs quantity

**MUST**
- treat 14,000+ as a coverage/capacity target, not a quality metric;
- build the quality/evaluation pipeline before mass expansion;
- reject superficial paraphrase multiplication;
- separate intended difficulty, observed difficulty, learning value and exam representativeness.

### 5.6 Psychometrics

**MUST**
- keep intended difficulty distinct from empirical difficulty;
- avoid psychometric-calibration claims before sufficient real response data exists;
- version calibration outputs and preserve raw learner evidence;
- use empirical discrimination/distractor/response-time/retention measures only after minimum evidence thresholds are defined.

### 5.7 Analytics and “next best action”

**MUST**
- make learner analytics actionable rather than purely descriptive;
- explain why a recommendation is made;
- keep durable evidence separate from derived mastery/readiness predictions;
- expose uncertainty when a recommendation rests on weak evidence.

Primary learner questions remain:

1. Where am I now?
2. What should I do next?
3. Why is that the recommended next action?

### 5.8 User control over AI transformation

**MUST**
- preserve user-authored/source material without silently replacing it with generated facts;
- label generated/derived content when material;
- allow AI assistance to be disabled where practical;
- never contaminate a deterministic exam/flashcard source with unrequested generated facts.

Community reports are treated as failure signals, not prevalence estimates.

### 5.9 UX friction and redesign

**MUST**
- measure learner-path friction for material UI redesigns.

At minimum, record or test:
- time-to-start-learning;
- actions/clicks-to-resume;
- actions/clicks-to-weak-topic;
- actions/clicks-to-exam;
- task completion on mobile/RTL;
- recovery after refresh/offline interruption.

A visually cleaner interface is not automatically a better learning interface.

### 5.10 Reliability, offline and accessibility

**MUST**
- treat technical stability, mobile usability, offline behavior and accessibility as release-quality concerns;
- preserve current offline recovery guarantees unless an explicit replacement is better and tested;
- use WCAG 2.2 as the current web-accessibility baseline where applicable;
- avoid performance-heavy additions that materially degrade low-bandwidth/mobile learning without demonstrated benefit.

### 5.11 Content overload

**SHOULD**
- prefer the smallest next learning action that addresses the learner need;
- avoid presenting large undifferentiated content catalogs as personalization;
- progressively disclose advanced analytics/settings.

### 5.12 Evidence discipline

**MUST**
- distinguish official/primary evidence, independent research, implementation evidence and community signals;
- never turn repeated URLs from one provenance root into “multiple independent sources”;
- keep current SDAIA exam rules/weights `project-reference-unverified` until current primary evidence supports promotion;
- preserve a dated evidence ledger so future research updates are incremental.

## 6. Explicit anti-patterns

B0 establishes these anti-patterns for future programmes:

- AI chatbot added because competitors have one;
- AI-generated content activated without quality gates;
- engagement metrics used as readiness metrics;
- mastery inferred from repeated exposed items;
- dashboards that only visualize without recommending an action;
- scheduler parameters exposed as required learner decisions;
- silent rewriting of user/source content by AI;
- redesigns that increase navigation cost without measured benefit;
- mass question generation before eval infrastructure;
- psychometric terminology used before calibration;
- accessibility/offline/mobile deferred as polish;
- content quantity used as a proxy for coverage;
- hidden source/evidence uncertainty.

## 7. Counter-evidence and guardrails against overreach

The research audit found evidence that constrains our own recommendations:

1. Retrieval practice is not uniformly superior across every domain. A 2025 mathematics meta-analysis found robust spacing benefits but a retrieval-vs-restudy estimate whose confidence interval crossed zero. Therefore retrieval is a tool, not dogma.
2. Gamification/repetition can help some learners maintain practice. Therefore the platform should not ban streaks or lightweight rewards; it should subordinate them to learning outcomes.
3. AI-generated exam questions can perform comparably to expert-created questions in a large 2026 field study when generation is iterative and items are psychometrically evaluated. Therefore the policy is quality-gated AI generation, not “human-only content.”
4. Learning analytics research still has limited causal evidence that prediction dashboards improve outcomes. Therefore dashboards must not imply that predictive accuracy alone equals pedagogical value.

## 8. B0 acceptance criteria

B0 is complete only when:

1. the accepted constitution is available on `main`;
2. the evidence appendix is available on `main`;
3. the dated 2026-09-26 research amendment is available on `main`;
4. stale Programme A Draft/unmerged status is removed from current handoff;
5. historical records remain historically accurate rather than rewritten;
6. documentation contracts enforce the new canonical governance state;
7. community anecdotes are labelled as signals, not prevalence;
8. the 14,000+ target remains explicitly future work;
9. `project-reference-unverified` remains intact for current SDAIA exam-rule evidence;
10. no runtime/product code changes are included;
11. CI passes on the B0 branch and after merge;
12. the handoff names the exact next Programme B design entry point.

## 9. Non-goals

B0 does not implement:

- track registry;
- second-track UI;
- content schema v2;
- question factory;
- adaptive selection;
- spaced scheduler;
- AI tutor;
- learner mastery/readiness engine;
- psychometric calibration;
- protected content;
- production authentication;
- the 14,000+ content expansion.

## 10. Next boundary after B0

After B0, Programme B should be decomposed rather than built as one feature set:

- **B1 — Track Presentation Contract**
- **B2 — Track Registry**
- **B3 — Content Model v2**
- **B4 — Track Package Validation**
- **B5 — Second-track Proof**
- **B6 — Migration/Compatibility**
- **B7 — Programme B Acceptance**

Each subprogramme receives its own bounded design/spec and testable acceptance gate.

## 11. Evidence

The evidence ledger for this design is:

`docs/superpowers/specs/2026-09-26-b0-governance-research-sync-evidence.md`

This spec intentionally treats implementation/vendor/community evidence differently and records the strongest falsifiers rather than presenting a one-sided competitor survey.

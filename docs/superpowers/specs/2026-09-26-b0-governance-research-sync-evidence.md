# B0 — Governance + Research Sync Evidence Ledger

**Date scope:** verified/rechecked 2026-09-26  
**Decision:** Which current learning-platform design rules should be promoted into the architecture constitution before Programme B?  
**Risk if wrong:** High — these rules will constrain future content, adaptive-learning, analytics and AI-tutor work.  
**Depth:** Deep evidence audit; no independent subagent challenge pass was available in this environment.

## Decision result

**Decision-ready for B0 governance rules:** Yes, with explicit partial claims and counter-evidence below.

The evidence supports a conservative amendment:
- strengthen reliability/offline/accessibility;
- quality-gate AI content;
- ground tutoring in canonical content/evidence;
- add spacing/feedback/actionability;
- keep engagement mechanics subordinate to learning;
- delay psychometric claims until data exists;
- preserve uncertainty/user control.

It does **not** support claims that every adaptive/AI/gamified feature improves learning.

## Evidence ledger

| ID | Claim | Weight | Evidence | Class / family | Status | Limitation |
|---|---|---:|---|---|---|---|
| C1 | Technical stability, UI/UX, offline limitations and structural barriers materially affect engagement/retention/inclusivity | 3 | Ogunsakin et al., BJET 2026, >226,000 reviews across Coursera, edX, Udemy, Alison, uLesson and Khan Academy. https://doi.org/10.1111/bjet.70066 | Peer-reviewed cross-platform mixed-methods study | Verified | Review text is observational/user-review evidence; not a randomized causal estimate |
| C2 | Distributed/spaced practice generally improves longer-term learning vs massed practice | 3 | Applied classroom meta-analysis, 31 effects, N>3000: https://pmc.ncbi.nlm.nih.gov/articles/PMC12189222/ ; mathematics meta-analysis: https://eric.ed.gov/?id=EJ1478558 | Two independent research families | Verified | Effect size varies by domain/context; mathematics effect smaller |
| C3 | Retrieval practice should not be treated as universally superior to strong alternatives | 2 | Mathematics meta-analysis found testing-vs-restudy g≈0.18 with 95% CI crossing zero: https://eric.ed.gov/?id=EJ1478558 ; retrieval-vs-elaborative systematic/meta-analytic review: https://eric.ed.gov/?id=EJ1492680 | Independent research reviews | Verified as guardrail | Does not negate retrieval benefits in many settings |
| C4 | Practice with corrective/explanatory feedback can support learning and generalization | 3 | 2026 experiments, N=597: https://doi.org/10.1007/s10648-025-10103-6 | Peer-reviewed intervention study | Supported | Domain/sample limits; not universal timing guidance |
| C5 | AI-generated assessment items can approach expert item performance when generation includes critique/revision and field psychometrics | 3 | AAAI 2026 field study, ~1,700 students / 91 classes, IRT: https://doi.org/10.1609/aaai.v40i45.41205 | Peer-reviewed field study | Verified for studied conditions | Does not prove arbitrary one-shot LLM items are safe |
| C6 | GenAI educational scaffolds can hallucinate/underperform without evaluation; multi-agent/evaluation approaches can reduce reliability failures | 3 | Computers & Education 2026: https://doi.org/10.1016/j.compedu.2025.105448 | Peer-reviewed research | Verified | Evaluation method itself has bias/coverage limits |
| C7 | Production learning systems use dedicated evals because technically valid AI-generated activities can still be educationally broken | 2 | Brilliant eval engineering report: https://blog.brilliant.org/when-almost-right-is-catastrophically-wrong-evals-for-ai-learning-games/ | Vendor implementation evidence | Supported | Vendor-authored; not independent prevalence evidence |
| C8 | Leading tutor products are moving toward interactive/scaffolded assistance rather than simple answer chat | 2 | Khan Academy/Google 2026 interactive diagrams: https://blog.google/products-and-platforms/products/education/khan-academy-back-to-school/ ; Brilliant Koji: https://blog.brilliant.org/a-world-class-tutor-in-every-home/ | Two vendor implementation families | Verified as market direction | Vendor claims do not establish superior learning outcomes |
| C9 | Analytics dashboards often have weak causal/intervention evidence; prediction/visualization alone is insufficient | 3 | 2025 systematic review: https://doi.org/10.1007/s44217-025-00964-y ; 2026 meta-review: https://doi.org/10.1007/s10734-026-01709-y | Independent research reviews | Verified | Literature quality/deployment remains uneven |
| C10 | Adaptive learning research is broad but implementation/evaluation quality varies; performance data is the most common adaptation signal | 2 | 2025 school adaptive-learning review: https://doi.org/10.1016/j.lindif.2025.102781 ; adaptive-platform review: https://doi.org/10.1016/j.caeai.2025.100429 | Independent research reviews | Verified at landscape level | Does not select one best algorithm |
| C11 | Complex spaced-repetition controls can sharply increase workload and require careful user-facing defaults | 2 | Anki FSRS manual: https://docs.ankiweb.net/deck-options | Primary implementation documentation | Verified for FSRS behavior | Product-specific; UX inference is ours |
| C12 | WCAG 2.2 is the current W3C recommendation and applies to web/mobile accessibility | 3 | W3C WCAG 2.2: https://www.w3.org/TR/wcag/ | Standards body | Verified | Conformance requires actual implementation/testing |
| C13 | Users report harm when AI silently injects generated answers into deterministic study material | 2 | Quizlet community reports 2026: https://www.reddit.com/r/quizlet/comments/1wmje3l/please_let_us_disable_aigenerated_answers_during/ and related reports | Community failure signal | Partial | Anecdotal; not prevalence evidence |
| C14 | Users report increased navigation friction after educational UI redesigns | 2 | Khan Academy community reports 2026: https://www.reddit.com/r/Khan/comments/1ujt92u/dislike_the_new_interface/ | Community failure signal | Partial | Anecdotal; not prevalence evidence |
| C15 | Users report technical playback/outage failures that interrupt difficult learning tasks | 2 | Udemy community reports 2026: https://www.reddit.com/r/Udemy/comments/1tetsff/using_udemy_in_2026_as_a_student_is_a_horrible/ | Community failure signal | Partial | Anecdotal; C1 supplies stronger cross-platform evidence |
| C16 | Gamification/energy/streak mechanics can become counterproductive for some users, but repetition/streak structures can also help others persist | 2 | Negative Duolingo reports: https://www.reddit.com/r/duolingo/comments/1t5izz9/after_6_years_on_duo_im_finally_calling_it_quits/ ; positive counter-signal: https://www.reddit.com/r/duolingo/comments/1w1hbok/did_anyone_else_get_sucked_into_trash_talking/ | Community mixed evidence | Partial / mixed | Not prevalence or causal evidence; supports “subordinate to learning,” not a ban |

## Failure taxonomy

| Failure class | Severity | Recurrence evidence | Design response |
|---|---|---|---|
| Technical instability / playback / offline failures | High | Cross-platform review + community reports | Reliability/offline remain release gates |
| AI hallucination / incorrect generated educational content | High | Research + vendor evals + community signals | Quality-gated generation; grounded tutoring; abstention |
| Silent AI mutation of user/source material | High | Community signals | Preserve deterministic source; label/disable transformations |
| Engagement mechanics interfering with learning | Medium–High | Mixed community evidence | Learning metrics primary; gamification secondary |
| Dashboard without actionable intervention | Medium–High | Systematic reviews | Require explainable next-best action |
| Content-scale inflation without coverage/quality | High | Vendor eval experience + assessment field study | Question Factory/evals before 14k expansion |
| Premature psychometric claims | High | Existing constitution + field-study calibration requirements | Separate intended vs observed difficulty; wait for data |
| UI redesign increasing learner navigation cost | Medium | Community signals | Friction metrics/regression tests |
| Accessibility/mobile friction | High | W3C standard + cross-platform review | WCAG 2.2/mobile release-quality requirements |

## Strongest falsifiers / counter-evidence

### F1 — Retrieval is not universally dominant
The 2025 mathematics meta-analysis found a robust spacing effect but a retrieval-vs-restudy estimate whose confidence interval crossed zero. Effect on decision: the constitution should require evidence-informed review/retrieval, not a universal “retrieval always wins” claim.

### F2 — Gamification is not inherently harmful
Some learners report that repeated practice/streak structure helps them persist and reveals forgotten material. Effect on decision: retain optional gamification possibilities, but never equate engagement with mastery/readiness.

### F3 — AI generation is not inherently low quality
The AAAI 2026 field study found iteratively refined AI-generated questions comparable to expert standardized-exam items in the studied sample. Effect on decision: adopt eval-driven AI content production rather than banning generation.

### F4 — Analytics sophistication is not evidence of learning impact
Systematic reviews find predictive/prescriptive dashboard work but limited causal evidence in real classrooms. Effect on decision: require actionability/explainability/outcome validation, not model complexity for its own sake.

## Inclusion / exclusion rules

Included:
- current peer-reviewed reviews/field studies;
- standards bodies;
- current official implementation documentation;
- vendor engineering/product reports where they reveal concrete implementation patterns;
- community reports only for failure discovery and user-demand signals.

Excluded from “Verified” status:
- marketing claims without independent support;
- isolated Reddit reports as prevalence estimates;
- copied/syndicated commentary;
- exact SDAIA exam rules without current primary evidence.

## Research saturation

Search was stopped when additional sources no longer changed:
- the critical learning-science rules;
- AI quality-gate conclusion;
- failure taxonomy;
- analytics/actionability conclusion;
- reliability/offline/accessibility priority;
- counter-evidence treatment.

## Residual uncertainty

**Medium.**

Largest unresolved gaps:
1. no large-scale direct evidence yet from our own learners;
2. no current official SDAIA source confirming the project-reference exam profile;
3. no independent reviewer/subagent challenge pass was available;
4. future AI tutor/adaptive algorithms will require their own bounded evidence review and evaluation, not inheritance of this B0 decision.

## Highest-value next step

Synchronize the accepted constitution/evidence onto `main`, add this amendment as a dated governance layer, and protect it with documentation-contract tests before implementing Programme B.

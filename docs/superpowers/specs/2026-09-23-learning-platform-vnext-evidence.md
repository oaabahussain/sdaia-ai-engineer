> **Provenance note — 2026-09-26:** This is the original vNext evidence appendix. New evidence gathered for the post-Programme-A research audit is recorded separately in `docs/superpowers/specs/2026-09-26-b0-governance-research-sync-evidence.md` and does not retroactively strengthen historical claims in this appendix.\n\n# Learning Platform vNext — Evidence Appendix

**Verified:** 2026-09-23  
**Purpose:** Preserve traceability for the architecture constitution and make future re-verification possible without relying on chat history.

This appendix is not an attempt to prove every product choice by citation. It records the primary or near-primary evidence used for claims that materially shaped the architecture and the important gaps that remain unresolved.

## Evidence ledger

| Claim / design implication | Evidence | Class | Status | Limitation |
|---|---|---|---|---|
| SDAIA occupational standards can anchor competencies above local topic groupings | SDAIA, National Occupational Standard Framework for Data & AI: https://sdaia.gov.sa/en/Research/Pages/NOSF.aspx | Primary / official | Verified for framework purpose | Does **not** by itself establish the current certification exam's exact weights, question count, or format |
| Practice/learning should be distinct from exam simulation | Microsoft Learn Practice Assessments: https://learn.microsoft.com/en-us/credentials/certifications/practice-assessments-for-microsoft-certifications and Prepare for an exam: https://learn.microsoft.com/en-us/credentials/certifications/prepare-exam | Primary vendor documentation | Verified | Microsoft-specific implementation; architecture generalises the pattern rather than copying product details |
| Practice may show rationales/resources while a separate sandbox/simulation teaches exam experience | Microsoft Learn sources above | Primary vendor documentation | Verified | Not evidence for SDAIA-specific exam UX |
| Learning/question sets can precede full practice exams | AWS Certification Prep: https://aws.amazon.com/certification/certification-prep/ | Primary vendor documentation | Verified | AWS-specific implementation |
| Practice mode and certification mode can use different feedback/filtering behaviour | MeasureUp: https://docs.measureup.com/how-to-configure-the-launch-of-a-practice-test | Primary vendor documentation | Verified | Commercial product design, not a standard |
| Personalized spaced review can revisit previously learned skills rather than treating proficiency as one-and-done | Khan Academy Mastery Challenges: https://support.khanacademy.org/hc/en-us/articles/360037127892-What-are-Mastery-Challenges-in-course-mastery | Primary product documentation | Verified | Khan's exact mastery mechanics are not copied |
| Accessibility must account for keyboard focus visibility and target sizing | WCAG 2.2: https://www.w3.org/TR/wcag/ and WAI summary: https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/ | Standards body | Verified | Compliance requires implementation/testing; citation alone does not establish conformance |
| A future protected assessment API must address object/function authorization, authentication, resource consumption, and sensitive business-flow abuse | OWASP API Security Top 10 2023: https://api-security.owasp.org/editions/2023/en/0x11-t10/ | Security standard/guidance | Verified for risk classes | Threat modelling remains application-specific |
| QTI is relevant for future item/test/result portability | 1EdTech QTI: https://www.1edtech.org/standards/qti/index | Standards body | Verified | The architecture is QTI-friendly, not QTI-dependent |
| Caliper provides a common learning-activity vocabulary useful for future analytics interoperability | 1EdTech Caliper: https://www.1edtech.org/standards/caliper and Caliper 1.2 specification: https://www.imsglobal.org/spec/caliper/v1p2/ | Standards body | Verified | The architecture is Caliper-friendly, not Caliper-dependent |
| Current repository defects must be treated as migration inputs | Direct repository inspection of `main@362d35c697411d4eddcc4536c843df17161d3374`, plus PR #3/#4/#5 review findings | Direct implementation evidence | Verified for the inspected commit | Must be rechecked if `main` changes before implementation |

## Current unresolved evidence gaps

### SDAIA exam weights and exact exam profile

The existing project weights:

- MLOps / LLMOps — 18.0
- Data / ML / Evaluation — 17.3
- Core AI / Deep Learning / GenAI — 16.7
- Responsible AI / Security / Governance — 14.7
- AI Software Engineering — 14.0
- Architecture / Infrastructure — 12.6
- Business / Professional Practice — 6.7

are **project reference values** until a current primary official source is found that directly establishes these percentages for the relevant certification/exam version.

Do not label these values “official SDAIA exam weights” in product copy or metadata while this gap remains.

### Exact question count, duration, passing rules, and cohort-specific exam behaviour

Any exact claim about SDAIA exam question count, duration, passing score/rule, registration route, or cohort-specific behaviour must be verified against a current primary source or explicitly stored as non-official observational evidence.

### Test-taker observations

Test-taker reports may help identify recurring style/difficulty/failure signals, but:

- they are not primary evidence;
- copied reports are not independent evidence families;
- a single report remains single-source evidence;
- confidential/recalled/leaked exam questions must not be reproduced.

## Re-verification rule

Before a new SDAIA exam profile becomes active:

1. re-check the official SDAIA source family;
2. record the verification date;
3. record contradictions;
4. distinguish official facts from observational evidence;
5. version the resulting exam profile;
6. preserve the previous profile for historical learner attempts.

## Source update policy

A source change should be able to identify affected:

`Evidence → Competency → Objective → Concept → Question Family → Variant/Item → Exam Profile`

so content can be reviewed without blindly regenerating or invalidating the entire bank.

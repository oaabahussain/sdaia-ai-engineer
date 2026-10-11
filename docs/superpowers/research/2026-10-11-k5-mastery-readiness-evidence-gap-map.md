# K5 — Mastery & Readiness: Evidence Refresh, Failure Map, Design Options

**Date:** 2026-10-11  
**Status:** RESEARCH_ONLY / ARCHITECTURE_REVIEW_PENDING / NOT_IMPLEMENTATION_APPROVED  
**Frozen source baseline:** main@3d886c1066137e15e6ff5d3939f588a0fc59affd (K4 closure PR #66 merged and post-merge verified).  
**Governing project sources:** 2026-09-23 architecture constitution; 2026-09-26 research amendment; post-K1 kernel roadmap; 2026-10-08 K4–K9 dependency gates and K5–K9 source survey; inspected actual merged K3/K4 code. Historical trackers are not live implementation state.  
**Method:** Superpowers brainstorming + Evidence Engineering Research; external retrieval through native web/GitHub (Agent Reach-compatible native route). Tool-based independent experimental validation or real-learner data audit **not performed**.

## 1. Question, constraints and hard boundary

What versioned, recomputable, learner-scoped K5 mastery/readiness projection could be honestly built on K3/K4 evidence without treating exposures or locally chosen answers as authenticated correctness or claiming official SDAIA certification probabilities?

Success means explicit evidence grades, corrected/replayed history, content-release and family lineage, cautious uncertainty/abstention, no answer leakage, AR/EN/RTL/offline parity and a clear boundary between progress descriptions and empirically validated readiness predictions.

If wrong: learners receive a fabricated “ready” score; repeated public questions are credited as independent understanding; browser-forged SYSTEM results or old/corrupt correction chains influence high-stakes guidance; private exam information leaks.

**No K5 product changes, no trusted grading bridge, no deployment and no spec/plan approval occur in this research branch.** The 1,120-question seven-domain public bank, 200-item full exam and question-payload SHA256 5e48b1e47450f1150c9c8f21386f3a4e31070a3d444f968d10f45ccb9ff418a9 must not change silently.

## 2. Direct project-source inspection (2026-10-11)

| Evidence | What code actually proves | Implication |
|---|---|---|
| docs/superpowers/state/K4-CURRENT-STATE.json | revision 18, CLOSED / COMPLETE, no declared open Critical/Important | K4 prerequisite met; K5 can enter its own design gate |
| docs/superpowers/state/CURRENT-STATE.json | K3 revision 76, COMPLETE | Preserve K3 and its stable event model |
| src/evidence/replay.js | store-bound replay, bounded sequence, uniqueness of event_id/store_seq | Reuse for recomputable projections; never build another raw evidence store |
| src/evidence/corrections.js | valid correction graph, unresolved and conflict states | Quarantine invalid chains and recompute at exact watermark |
| src/evidence/projections/attemptProjection.js and activityProjection.js | already derive attempted interactions, responses, exposures and correction status | Extend through new projection port, never overwrite immutable raw events |
| src/evidence/recorder.js | recordEvaluation() always throws “Trusted SYSTEM producer authority is required for learner.response.evaluated@1” | Present local browser inputs are **not** trusted SYSTEM grades |
| src/evidence/appBridge.js | browser records attempted responses, confidence and submission | “Answer recorded” is not equivalent to externally verified correctness |
| src/recommendations/projection.js | current public K4 projection uses grade_evidence EXPOSURE_ONLY, last_graded_at null | No current K4 score or justified mastery percentage |
| src/recommendations/policy.js | deterministic K4 rules, excludes check/mock/protected | Preserve check/mock separation and public/private boundaries |
| SECURITY.md | anonymous UUID is not authentication, SQLite/FastAPI prototype isn't production auth | No cross-device trusted learner assertions without separate proof |

**Absent, not proven nonexistent:** Production-authenticated SYSTEM evaluation producer, governed independent holdout inventory, sufficiently large representative labeled learner cohorts, independently validated external certification outcome reference, empirical model calibration, thresholds and error budgets. No numerical K5 mastery/readiness score is authorized by the inspected evidence.

## 3. Evidence ledger — separate source roots, not URL inflation

Claim outcomes: DOCUMENTED means source claims only; IMPLEMENTED means inspected source implementation; USER_REPORT does not establish prevalence; no third-party model experiment was independently repeated in this session.

| ID | Atomic claim / source family | Scope and status | Limitation |
|---|---|---|---|
| C01 | Testing claims require fitness-for-use validity and fairness evidence. AERA/APA/NCME, Standards for Educational and Psychological Testing [E01] | DOCUMENTED, standards | General educational standard, not an official SDAIA readiness cut score |
| C02 | On some datasets simpler logistic knowledge-tracing methods compete with or outperform deep variants. Gervet et al. JEDM 2020 [E02] | DOCUMENTED, independent empirical study | Its student sequences are not the project's cohort |
| C03 | Skill mapping, sequence and dataset representation materially affect knowledge-tracing models. ACM KT Survey [E03] | DOCUMENTED, independent review | Literature synthesis is not a direct local replication |
| C04 | Deep Knowledge Tracing uses recurrent sequence learning. Piech et al. NeurIPS [E04] | DOCUMENTED, primary research | Can't infer local superiority or actual readiness validity |
| C05 | pyBKT offers maintained offline BKT fitting/inference; v1.4.3 published 2026-08-05. CAHLR [E05] | IMPLEMENTED + dated release | No live production compatibility tested here |
| C06 | pyBKT open issues #79, #80, #81, #57 report likelihood rounding, tied ordering, missing identities, incremental-update limitation [E05] | USER_REPORT, one maintainer-project evidence family | Some reports have reproductions, not directly reproduced by us; avoid claims of widespread defects |
| C07 | pyKT provides comparative knowledge-tracing research toolkit [E06] | IMPLEMENTED + documented | Does not authorize ML deployment without real outcomes |
| C08 | 2026 analysis warns of leakage when multi-concept responses are expanded improperly [E07] | DOCUMENTED (abstract) | Publisher full text not fully retrieved; exact scope limited |
| C09 | 2026 work identifies subgroup mastery calibration errors despite aggregate metrics [E08] | DOCUMENTED (abstract) | Single study/dataset; no transferable numerical threshold |
| C10 | Calibrated classification probabilities require held-out validation and appropriate reliability checks. scikit-learn [E09] | DOCUMENTED, independent library docs | Calibration doesn't establish external exam-score validity |
| C11 | Applicable Saudi personal-data rules impose purpose/minimization obligations [E10] | DOCUMENTED, regulator | Specific product legal classification and processing terms require assessment |
| C12 | Practice test performance is not automatically an official exam guarantee. Microsoft Learn certification FAQ [E11] | DOCUMENTED, another certification provider | Analogy only; NOT a statement of SDAIA exam policy |
| C13 | Probabilistic mastery decisions depend on explicit decision costs/thresholds. ETS report [E12] | DOCUMENTED, historic assessment research | Theoretical approach not a local empirically fitted value |
| C14 | Temporal change can affect KT predictions in longitudinal learner histories [E13] | DOCUMENTED, external cohort study | Cohort/version applicability unknown; full PDF not independently inspected |
| C15 | Selection bias in knowledge-tracing response sequences is a methodological risk [E14] | DOCUMENTED, independent research | No local treatment-effect test |
| C16 | The current K3 recorder lacks an authorized SYSTEM grader and K4 is exposure-only [P01] | DIRECT SOURCE INSPECTION | Critical local blocker for any non-null certified correctness/readiness projection |

The **14 external reference roots** listed below span primary education research, standards, maintained code and issue reports, testing, official guidance and calibration. They are NOT fourteen validations of one numerical K5 score. Source E05 issue numbers all share one project family.

## 4. Failure and abuse map

| Severity | Failure | Required fail-closed guard |
|---|---|---|
| Critical | An answer to an already-exposed question is credited as unseen proof | Deduplicate by stable question_family_id, mode and content lineage |
| Critical | Browser fabricates evaluation or authority_ref | Attested SYSTEM source + authorized producer, not a client-supplied string |
| Critical | “85% exam ready” displayed on sparse/untrusted data | Estimate null / NOT_ESTIMABLE + explicit reason; no official SDAIA pass probability |
| Critical | Hidden holdout key/item leaks via public Pages/projection | Aggregates-only safe port; private source remains server-authorized |
| High | Cross-release void/supersede/conflict ignored | K3 full correction graph, deterministic recompute, conflicts abstain |
| High | One response assigned to several skill labels is used across train/test | Group by response, family, learner and temporal boundary; no target leakage |
| High | Accuracy/AUC looks strong while subgroup false-ready error is high | Calibrate held-out predictions, uncertainty and per-group errors before release |
| High | Selected practice histories bias apparent ability | Report selection/exposure biases; compare explicit baselines, avoid causal claims |
| High | Unknown identity linked to another device/user | Per-store pseudo identity only until authenticated mapping exists |
| Medium–high | pyBKT algorithm/version edge cases | Adapter pinned offline, benchmark & reproduce before adoption |
| Medium–high | Client time, language or offline state alters projection | Clock injection, stable watermarks, bilingual and replay equivalence |

## 5. Gap map: reuse or defer instead of reimplementing

| Component | Already have | Needed for K5 | Disposition |
|---|---|---|---|
| Raw immutable learner evidence | K3 event/store/replay | Reuse exact watermark | KEEP |
| Corrections/void/conflict | K3 resolver | Fail-closed evidence eligibility | HARDEN boundary |
| Public exposure and next action | K4 projection and rules | Do not equate with mastery | KEEP |
| Descriptive evidence sufficiency | Individual interactions/evidence | Versioned learner/track/release diagnostics | NEW CORE, after approval |
| Quantitative trusted evaluation | SYSTEM event shape exists, producer denied locally | Real authenticated production authority | BLOCKED / separate design |
| Independent validation population | None verified | Cohorts, consent, family/learner/time split, validated outcomes | BLOCKED |
| Predictive method | External BKT/KT tools | Frozen baseline comparisons and threshold calibration | RESEARCH / BENCHMARK, not deploy |
| UI/learning experience | Public AR/EN offline responsive | Descriptive/non-official uncertainty states | DESIGN, after approval |
| Security/privacy | K3 pseudonym and public/protected boundary | Authorized minimal event views and risk assessment | HARDEN |

## 6. Three architectural paths for owner's **first** approval

### Option A — descriptive evidence diagnostics only
Versioned event-quality, exposure/family coverage, history freshness and missing-data reasons. No mastery % / readiness score. Safe, useful and local-first, but does not establish any statistical estimate.

### Option B — two-lane evidence-aware architecture (**recommended**, still unapproved)
- **Lane 1 / initial public release:** K3-derived, correction-aware, recomputable evidence sufficiency & descriptive progress, explain why NOT_ESTIMABLE, allow K4 to remain next-best-action controller. Never invent mastery %, official SDAIA readiness or pass probability from EXPosure-only.
- **Lane 2 / separately enabled only after evidence gate:** model-neutral port for trusted/authenticated SYSTEM correctness + independent low-exposure/check/holdout evidence, calibrated uncertainty/coverage, stable objective/release mapping, clear model/version/provenance; when any critical precondition fails, output null and an abstention reason. Compare interpretable deterministic/logistic baseline vs BKT/pyBKT **offline** with predeclared evaluation; do not take deep models as a default. Activation requires another decision based on actual independent data.
- Zero change to K3/K4 facts; no second evidence store; AR/EN accessibility and offline can be retained.

### Option C — deploy BKT/DKT/transformer now
**REJECT** for initial K5: no trusted grading producer, independent labeled holdout population or validated calibration; would create fabricated certainty and needless dependencies.

**Design falsifier:** If independently verified grades/holdout never become available, Option B Lane 2 remains permanently inactive; then Option A may be preferable on cost and user benefit. Resolve that product choice explicitly instead of silently implementing a “mastery” score.

## 7. Candidate projection contract — proposal only, NOT frozen spec

Potential MasteryReadinessProjectionV1 fields: schema/algorithm/policy version, store and exact source watermark, learner/track/release/skill-mapping identity, immutable content and scoring references, source integrity/unresolved reason; per-objective and per-domain family counts split by mode, exposure and credible independent evidence; correction and provenance digest; evidence_status; null-or-validated mastery_estimate/readiness_estimate with sample/uncertainty/validation ref; explicit rule for insufficient evidence; source definition and K4 next action. Never expose protected answer keys or copy raw private event payloads into a public report. No numerical readiness absent independently validated graded outcomes.

## 8. Proposed future TDD acceptance cases — NOT RUN

1. Zero history => descriptive cold start only; mastery/readiness null.
2. Repetition of public family or new item-version sibling cannot become independent unseen evidence.
3. Fake SYSTEM producer/authority_ref and locally inferred answer-key accuracy => reject trusted grade.
4. No verified grade source => NOT_ESTIMABLE, never 0 or 100 by default.
5. K3 corrections, reordered/duplicate source, cross-release correction and stale watermark => replay-equivalent output or quarantine.
6. Multiple objectives linked to one response => no duplicate inference and no label leakage.
7. Cross-user/family/time split and held-out grading => frozen evaluation protocol enforces separation.
8. Disjoint learner, track, content release and store => not mixed accidentally.
9. Sparse subgroups/uncertain predictive quality => explicit abstain and no false readiness boost.
10. Protected mock/check content remains inaccessible from public Pages, offline cache and explanations.
11. AR/EN, RTL/LTR, mobile, keyboard, offline, release rollback and K4 existing behaviour continue working.
12. Original bank 1,120, 200-question full exam, seven-domain content and frozen hash remain unchanged.
13. Independent review, exact-head CI, manual per-PR full SHA merge authorization and merged-main/live verification remain hard gates.

## 9. Unresolved evidence and decision-gate status

**VERIFIED for safe design discussion:** Project trust/grade boundary, canonical replay/correction/provenance availability, K4 exposure-only limitation, existence of candidate mature toolkits and documented concerns.

**PARTIAL:** Whether research-learned model selection, input/skill mapping and cross-subgroup calibration hold in this product. Some publisher full texts inaccessible, issue reproductions not rerun.

**BLOCKED:** Representative trusted learner labels, qualified independent holdout responses, privacy/legal deployment-specific rules, predeclared acceptable false-ready budgets, external certification score mapping and real-cohort reproduction.

**Decision:** architecture options **READY FOR USER DESIGN REVIEW**; model selection/thresholds/production calibrated score **NOT DECISION READY**. No K5 implementation or normative spec authorization exists.

## 10. External source register, independently traceable

- **E01:** AERA / APA / NCME (2014), Standards for Educational and Psychological Testing, https://ncme.org/resources/books/testing-standards/
- **E02:** Gervet et al. (2020), When Is Deep Learning the Best Approach to Knowledge Tracing?, https://jedm.educationaldatamining.org/index.php/JEDM/article/view/451
- **E03:** Abdelrahman, Wang, Nunes (2023), Knowledge Tracing: A Survey, https://doi.org/10.1145/3569576
- **E04:** Piech et al. (2015), Deep Knowledge Tracing, https://arxiv.org/abs/1506.05908
- **E05:** CAHLR pyBKT maintained code, releases and reported issues, https://github.com/CAHLR/pyBKT , https://github.com/CAHLR/pyBKT/releases/tag/1.4.3 , https://github.com/CAHLR/pyBKT/issues/79 , https://github.com/CAHLR/pyBKT/issues/80 , https://github.com/CAHLR/pyBKT/issues/81 , https://github.com/CAHLR/pyBKT/issues/57
- **E06:** pyKT benchmark toolkit, https://github.com/pykt-team/pykt-toolkit and https://pykt.org/
- **E07:** Badran & Preisach (2026-10-01), leakage-free and recency-aware embeddings for knowledge tracing, https://doi.org/10.1007/s42979-026-05344-3
- **E08:** Nurmukhambet & Meirmanova (2026-07-14), subgroup calibration and mastery decision errors in knowledge tracing, https://ieeexplore.ieee.org/document/11596401
- **E09:** scikit-learn, probability calibration contract, https://scikit-learn.org/stable/modules/calibration.html
- **E10:** Saudi SDAIA Personal Data Protection regulations, https://dgp.sdaia.gov.sa/
- **E11:** Microsoft Learn, practice assessment FAQ, https://learn.microsoft.com/en-us/credentials/certifications/frequently-asked-questions
- **E12:** ETS (1990), Bayesian Decision Theory for computerized mastery tests, https://www.ets.org/research/policy_research_reports/publications/report/1990/hwyk.html
- **E13:** Longitudinal knowledge tracing, ERIC scholarly source, https://files.eric.ed.gov/fulltext/ED630851.pdf
- **E14:** Causal invariance and selection bias in KT, https://doi.org/10.1016/j.engappai.2025.113380
- **P01:** Original merged project code at https://github.com/oaabahussain/sdaia-ai-engineer/tree/3d886c1066137e15e6ff5d3939f588a0fc59affd/src/evidence and /src/recommendations

## 11. Provenance and limitations

Date: 2026-10-11. Read authoritative repository files and CAHLR issues/release through the connected GitHub plugin; external sources inspected using public search/web and public source pages. Not all journal full texts were accessible. No live user traces, protected questions, credentials, population benchmarking, empirical model fitting, independent code reviewer, real-world measurement or numeric model-score calibration was performed. No assumptions about demographic prevalence, certified pass odds or official SDAIA rules are made. Research conclusions are hypotheses/proposals where marked. Future approval is needed for **in-chat architectural design**, separately committed normative spec, separately approved implementation plan and product code. K6 remains blocked on independent K5 closeout.
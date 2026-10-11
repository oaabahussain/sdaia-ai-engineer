# K4 written-spec contract review — 2026-10-09

**Programme:** SDAIA K4 Next-Best-Action / Spaced Practice  
**Review type:** read-only existing-product contract comparison + draft-spec corrections; NOT independent reviewer approval; NOT a Product implementation/release test  
**Source main:** `9e55881e9480b4a02d8ef5d92a0b21a9313492f1` (K3 closed)  
**Reviewed draft correction commit:** `86f1ca3d70c3a4bd39051ca618eb26f80c8e92ff`  
**Reviewed K4 spec blob:** `a07de53c60cc2b6d7645c67cc3cec289c8e8e607`  
**Spec:** `docs/superpowers/specs/2026-10-08-k4-next-best-action-spaced-practice-design.md`  
**PR:** [#64](https://github.com/oaabahussain/sdaia-ai-engineer/pull/64), DRAFT, UNAPPROVED  
**Gate:** `K4_WRITTEN_SPEC_APPROVAL=PENDING` / `K4_IMPLEMENTATION_PLAN_APPROVAL=NOT_STARTED` / `K4_PRODUCT_EDIT_AUTHORITY=BLOCKED`

## Evidence checked

| Source on K3 main | Verified fact | K4 implication |
| --- | --- | --- |
| `src/app.js` | K3 browser launches `full` and `section` and shares expanded `QUESTIONS` for both | K4 requires a new non-strict one-item public-practice browser flow; cannot claim existing learn/practice route |
| `src/assessment/assessmentSnapshot.js` | `createBrowserAssessmentContext` accepts only strict `full`/`section` | Do not use strict form constructor for K4 practice |
| `src/evidence/recorder.js` | Ordinary `practice` mode is supported by K3 recorder but `recordEvaluation` throws without trusted SYSTEM producer | Exposure-only for first browser release; no browser-inferred correctness |
| `src/evidence/replay.js` | `fromSeq>=1`, `toSeq>=fromSeq`, requires source identity and explicit watermark | Empty history requires its own `throughStoreSeq=0` branch, not `replayEvidence(toSeq=0)` |
| `src/evidence/corrections.js` and `src/evidence/projections/attemptProjection.js` | Conflicts/unresolved corrections and APPLIED/STALE/UNRESOLVED attempt decisions are distinguishable | Reject/quarantine ambiguous grades; never treat stale or unresolved answers as trusted |
| `src/evidence/indexedDbStore.js` | `accepted_at` created with local `new Date().toISOString()`; `readRange` verifies event fingerprints | No trusted-server-clock claim; local timestamp uncertainty is explicit |
| `src/logic/questionBank.js` | Public questions constructed with `answer` and stable `family_id`; same public pool enters K3 exam flows | Do not equate every past public mock appearance with reserved/holdout classification; use governed release eligibility |
| `data/schema/learner-evidence-event-v2.schema.json` | Modes include `learn`, `practice`, `check`, `section`, `mock` | Evidence mode support does not prove corresponding browser UI routes exist |
| `docs/superpowers/state/current-state.schema.json` | Schema `programme=K3` | New versioned K4 execution state contract is required after approvals |
| `docs/superpowers/state/CURRENT-STATE.json` | Revision 76, `K3 COMPLETE`, `low_model_ready=false`, `ACTIVE_REF_RESOLUTION_VALID=PENDING` | Closed K3 gates do not authorize K4 code |

## Changes in reviewed K4 spec

The documentation-only correction commit makes 13 targeted substitutions:
1. Replace unimplemented existing learn/practice route claim with K4-owned practice route.
2. Explicitly identify browser flow and shared public-question boundary.
3. Define empty-history replay behavior.
4. Define the trusted grading boundary and exposure-only initial browser release.
5. Qualify local `accepted_at` as device-time, not server authority.
6. Restrict first-release action navigation to `route_mode=practice`.
7. Require explicit release-pinned public-candidate catalog/allowlist.
8. Distinguish protected pools from existing shared public exam questions.
9. Specify a separately tested one-item browser integration path.
10. Add cold-start regression acceptance.
11. Classify trusted SYSTEM evaluation as authorized-fixture contract coverage, not deployed scoring.
12. Require practice-route test without disturbing strict exam scoring.
13. Require K4-specific state schema/validator rather than altering closed K3 execution authority.

## Remaining specification-review blockers

- **Approval:** the user has not approved the revised written K4 spec as an artifact. General goals/permission do not substitute.
- **Implementation plan:** no K4 task-by-task, file-scoped TDD plan or accepted RED criteria has been written/approved.
- **Release catalog:** the exact K4 allowlist representation, authoritative signed/release binding and empty/unavailable catalog behavior must be explicit in the approved TDD plan; no unverified claim of an existing separate registry.
- **Time validity:** retain fail-closed behavior for future/skewed device timestamps; no invented tolerance or empirical timing optimization.
- **Behavioral evidence:** no real trusted four-state recall ratings, benchmark or empirical retention validation. FSRS stays OFF.
- **Independent review:** this is a self-audit of source and draft. No independent human/agent K4 approval or code reviewer occurred.
- **CI/reproduction:** earlier exact-head CI on `74a170b` passed, but the spec update advanced HEAD. Recheck CI for the final exact draft SHA; green existing-product CI is not K4 TDD evidence.

## Source-family update (scoped)

The earlier K4 discovery document enumerates distinct research, maintainer, implementation, issue and standards sources. Additional primary-source spot checks for the decision were Anki official deck options, open-spaced-repetition ts-fsrs issue #373, W3C WCAG 2.2 and Cepeda et al. 2009 on PubMed. These support caution with four-grade FSRS semantics, timezone coupling, accessibility, and non-universal spacing intervals. They **do not** establish calibrated intervals or official exam readiness in this bank. The earlier source map is not replaced by this scoped review.

- https://docs.ankiweb.net/deck-options.html
- https://github.com/open-spaced-repetition/ts-fsrs/issues/373
- https://www.w3.org/TR/WCAG22/
- https://pubmed.ncbi.nlm.nih.gov/19439395/

## Proposed approval decision and strict next steps

**Review result: DRAFT_REVISED / NOT APPROVED.** No Product files, K3 task packets, CURRENT-STATE or approved K3 ledger should change in response to this review. Wait for the user's **explicit approval of the revised written K4 spec**; only then use Superpowers `writing-plans`. Require a second explicit approval of the implementation plan and execution method before creating K4 implementation worktrees or starting K4 RED/GREEN. Obtain per-PR exact-head merge authorization at the final integration gate; verify actual merged main and deployed Pages before marking K4 COMPLETE. No K5 execution.

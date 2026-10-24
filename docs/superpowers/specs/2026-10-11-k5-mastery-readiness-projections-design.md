# K5 — Mastery & Readiness Projections — Normative Design Specification (Proposed)

**Date:** 2026-10-11
**Status:** WRITTEN_SPEC_FOR_OWNER_REVIEW / NOT_APPROVED / NO_IMPLEMENTATION_PLAN
**Programme:** K5. Initial public delivery scope: descriptive evidence sufficiency plus a disabled statistical estimator boundary.
**Architectural direction:** Option B (two lanes) approved by the owner at 2026-10-11T14:41:00Z. This approves writing and reviewing this spec, NOT its exact contents, an implementation plan, product changes or merging a pull request.
**Source main:** 3d886c1066137e15e6ff5d3939f588a0fc59affd (PR #66 merge and K4 post-merge release proof).
**Research predecessor:** research/k5-evidence-20261011 at b808f6af57cea7bfe932c24ef27776564e01b5d6.
**Authoritative research register:** docs/superpowers/research/2026-10-11-k5-mastery-readiness-evidence-gap-map.md.
**Goal:** deliver truthful, versioned, correction-aware learner progress descriptions; reserve an explicit and fail-closed path to calibrated mastery/readiness, without displaying numeric estimations before independent evidence and calibration.

## 1. Authority, scope and precedence

Read source state first; a static roadmap or chat transcript is not the live execution manifest. Precedence:
1. Current Git main and its K3/K4 verified public-release data, constitutional architecture and security policy.
2. Accepted 2026-09-26 research/governance amendment and K3/K4 approved specs; 2026-10-11 K4 exposure-only scope boundary.
3. Authoritative post-B3 programme roadmap and 2026-10-08 K4–K9 dependency gate research.
4. This K5 written design, only AFTER the owner explicitly approves its exact Git blob.
5. A future separately approved TDD implementation plan, ledger and K5 state manifest. No K5 state currently exists with approved execution authority.

K4's completed PUBLIC EXPOSURE_ONLY release remains untouched. K3's event storage, correction, identity, assessment and export privacy rules remain authoritative. Any difference must be recorded as an explicit ruling rather than silent reinterpretation. K5 cannot open K6 or claim K5 full statistical readiness solely by shipping Lane 1.

## 2. Intended learner value and invariant claims

The initial K5 public feature helps a learner answer: (a) what learning activity has actually been observed; (b) which subject/question-family areas have been encountered, under which release; (c) what evidence is missing or conflicted; and (d) which already-verified public K4 next action is available.

MUST NOT claim any of the following from current public evidence:
- percentage of skill mastery, likelihood of correct future response, probability of passing SDAIA, or official readiness;
- "exam ready"/"advanced" level derived from observed family count or public quiz correctness;
- psychometrically calibrated item difficulty, reliability, IRT/Rasch/CAT parameter, causal learning gain or certified badge;
- that a local learner UUID is identity proof, or that an answer recorded in the client is authenticated correctness;
- that an unseen item version is independent if its question family was previously exposed;
- that the public browser question pool constitutes a protected/held-out assessment pool.

All initial percentage/probability/confidence-interval/level fields that represent mastery or readiness are unconditionally NULL. Numeric DESCRIPTIVE COUNTS (e.g. distinct public families observed) may appear if exact-source integrity permits, but are explicitly labeled observational, not learning achievement. An empty dataset is absence of evidence, not zero ability.

## 3. Explicit non-goals for this K5 approval

1. Building or impersonating an authenticated SYSTEM grader, signing service, production identity system or cross-device sync.
2. Serving confidential mock/holdout inventories or leaking test keys, answer strings or scoring policy internals into GitHub Pages, service-worker assets, public API or telemetry.
3. Training, shipping, fitting or hyperparameter-optimizing BKT, DKT, deep transformers, logistic predictive models or an official external-exam mapping.
4. Claiming a current predictive model is calibrated, defining a pass threshold, inventing minimum cohort sizes, unknown objective prerequisites or false-ready error budgets.
5. Replacing/rewriting K3 raw events, altering K4 schedule/recommendation priority, changing strict assessment scoring/feedback, or migrating old answers into fabricated independent performance histories.
6. Shipping a new batch of questions, expanding the public bank, editing item versions or changing exam blueprints.
7. Writing a K5 implementation plan or commencing TDD/product code before separate approval of THIS EXACT SPEC.
8. Any auto-merge, production deployment or closing K5 without explicit later integration authorization and merged-main evidence.

A future trusted producer/independent holdout/model activation is a **separate governed capability** requiring fresh design, producer threat model and proof; this written spec defines gates only, not that later product.

## 4. Observed baseline and reuse decisions

| Area | On merged main | K5 decision |
|---|---|---|
| Canonical K3 learner records | src/evidence, LearnerEvidenceEventV2; append-only replay/receipt/corrections | REUSE; never parallel event store |
| Deterministic K3 derived views | ActivityProjectionV1, AttemptProjectionV1 | REUSE source and correction semantics |
| Source and identity verification | K3 replayEvidence; K4 readK4Evidence source-bound local path | REUSE or add narrow shared adapter; never assume server auth |
| Current public K4 scheduling | src/recommendations, public catalog, deterministic rules | KEEP independent; K5 may link to preexisting K4 action, not recompute its ranking |
| Public item lineage | 1,120 ACTIVE/PUBLIC items, seven domains; 140 migration-derived provisional objective labels | Use verified catalog for descriptive grouping only, not validated psychometric knowledge components |
| Strict mock/check exams | Existing snapshot and K3 strict mutation/evaluation boundaries | NO CHANGE, no injection of hints or feedback |
| SYSTEM evaluation | recordEvaluation() deliberately rejects local SYSTEM producer | Lane 2 DISABLED, no fabricated trusted correctness |
| Current user identity | local pseudonymous learner_id and store_id | Source-bound local scope only, not authentication |
| Published content baseline | 1,120 / seven / 200; payload SHA256 5e48b1e47450f1150c9c8f21386f3a4e31070a3d444f968d10f45ccb9ff418a9 | Exact compatibility and integrity release guards |

No new database, browser framework, heavyweight inference runtime or public private-data collection API is justified for Lane 1. K5 is a separately versioned derived read model, not part of K3 raw event truth.

## 5. System diagram and trust boundaries

    K3 accepted local event store (store_id / learner_id / track_id / release)
        -> verified replay at a pinned store watermark
        -> globally resolve valid K3 VOID/SUPERSEDE/correction graph
        -> validate published public catalog and family/objective labels
        -> family-level DESCRIPTIVE evidence classifier
        -> K5 EvidenceSufficiencyProjectionV1 (no ability estimate)
        -> localized nonnumeric summary and honest insufficiency reasons
        -> optional link to existing K4 RecommendationV1 (no override)

    FUTURE, separately authorized: server-authenticated grading and
    independently eligible transfer/holdout -> attested evidence adapter
        -> frozen validation cohort -> calibrated evaluator manifest
        -> gated K5 statistical inference (NOT ACTIVE).

A string named authority_ref, a JSON schema containing correct=true, a locally computed public answer match, a clickstream event, or source code that ships answer keys are NOT authenticated evidence. Do not cross the boundary in the K5 first-release implementation.

The projection MUST depend only on supplied validated inputs; it must not call network, training libraries, hidden answer keys, date/time globals or localization routines. A browser UI adapter may load accepted source and display safe messages; no K5 output may be used by K3 write/evaluation or K4 ranker.

## 6. Core projection contract: EvidenceSufficiencyProjectionV1

A pure function/port, proposed name deriveK5EvidenceSufficiency, MUST accept a strict argument structure:
- source: accepted source store with stable store_id, current learner_id, track_id, requested content_release_id and exact through_store_seq;
- events: K3 read/replay-verified FULL learner history up to that watermark, including earlier releases when necessary to resolve corrections;
- acceptedPublicCatalog: a K2-governed, verified, active PUBLIC current-release item/family/objective mapping, optionally a validated previous-release family-lineage mapping; absent lineage causes exclusion/unknown, not a guess;
- policy: a strictly validated immutable K5 policy ID/version and allowed event modes/definitions;
- identityResolutionVersion: K3 identity-link version if applicable, otherwise explicit local/unlinked scope (no inferred cross-device equivalence);
- clock: optional explicitly injected timestamp for learner-facing observation-date presentation; never used to infer correctness/mastery.

Produce JSON-only, versioned, fully defined object. Candidate normative example for a source-bound empty learner history:

    {
      "schema_version": 1,
      "projection_type": "EvidenceSufficiencyProjectionV1",
      "policy_id": "K5.EVIDENCE.v1",
      "source_store_id": "local-store-opaque",
      "through_store_seq": 0,
      "learner_id": "local-learner-opaque",
      "identity_scope": "LOCAL_UNAUTHENTICATED",
      "track_id": "sdaia-ai-engineer",
      "content_release_id": "sdaia-ai-engineer.bootstrap.v1",
      "question_payload_sha256": "5e48b1e47450f1150c9c8f21386f3a4e31070a3d444f968d10f45ccb9ff418a9",
      "catalog_version": "sdaia-ai-engineer.public.bootstrap.v1",
      "catalog_canonical_sha256": "<verified-canonical-catalog-sha256>",
      "objective_map_canonical_sha256": "<verified-canonical-objectives-sha256>",
      "lineage_map_version": null,
      "lineage_map_canonical_sha256": null,
      "objective_map_version": "sdaia-ai-engineer.objectives-v1",
      "identity_resolution_version": null,
      "integrity_status": "COMPLETE",
      "observation_status": "NO_OBSERVATIONS",
      "estimation_status": "DISABLED_UNVALIDATED",
      "reason_codes": ["CALIBRATION_NOT_APPROVED", "IDENTITY_UNVERIFIED", "NO_EVIDENCE", "NO_TRUSTED_EVALUATION"],
      "observed_distinct_family_count": 0,
      "observed_distinct_interaction_count": 0,
      "observed_domain_count": 0,
      "objectives": [],
      "mastery_estimate": null,
      "readiness_estimate": null,
      "readiness_probability": null,
      "confidence_interval": null,
      "model_validation_ref": null
    }

This is an interface illustration, NOT permission to emit an actual estimate. The angle-bracket hash values in the illustrative object are documentation metavariables, never valid runtime values. Actual projection values MUST be 64-character lowercase SHA-256 hashes over canonically serialized entire validated public catalog and objective mapping. The question payload digest is separate from those hashes and cannot substitute for them. Optional verified lineage maps require both immutable version and canonical SHA256; absent maps require both null. Cache/replay keys bind all these values; changing mapping bytes under an unchanged version invalidates the projection. Actual IDs/digests must be drawn from verified inputs, never copied as runtime constants except accepted immutable release fixtures. Versioned schema in future data/schema must enforce additionalProperties=false and nullable estimates exactly as described. Null is JSON null, not omitted/undefined, zero or an empty numeric array. For now generated_at may be omitted deliberately to ensure two replays of the same source snapshot yield identical canonical output; if added, display time is separate from deterministic evidence payload and must not enter its digest.

### 6.1 Enums and cardinality

- integrity_status: COMPLETE | INCOMPLETE | CONFLICTED | SOURCE_INVALID.
- observation_status: NO_OBSERVATIONS | OBSERVATIONS_PRESENT | INSUFFICIENT_EVIDENCE | QUARANTINED.
- estimation_status (first public K5 version): DISABLED_UNVALIDATED only.
- reason_codes (sorted, unique, finite vocabulary): NO_EVIDENCE; EXPOSURE_ONLY; NO_TRUSTED_EVALUATION; PUBLIC_FAMILY_REPEATED; PROVISIONAL_OBJECTIVE_MAP; CORRECTION_UNRESOLVED; CORRECTION_CONFLICT; SOURCE_INTEGRITY_INVALID; CONTENT_RELEASE_MISMATCH; CORRECTION_AUTHORITY_UNVERIFIED; UNKNOWN_FAMILY_MAPPING; IDENTITY_UNVERIFIED; CALIBRATION_NOT_APPROVED; PROTECTED_EVIDENCE_UNAVAILABLE.
- No raw responses, correctness, answer keys, protected family IDs, direct PII, experimental group assignments or prompt text in the projection or public UI.
- OBJECTIVE entries are sorted by objective_id and include: objective_id, domain_id, mapping_status (PROVISIONAL | APPROVED), observed_distinct_family_count (nonnegative int), observed_distinct_interaction_count (nonnegative int), source_status (OBSERVED_ONLY | NO_OBSERVATIONS | QUARANTINED), reason_codes, mastery_estimate:null. Domain summaries can be derived by deterministic aggregation; don't double-count one interaction assigned to multiple objectives as independent attempts.
- Source provenance IDs, if retained internally for local debugging, are bounded to 5 distinct verified events with a truncation flag, sorted by store_seq and event_id; no raw IDs exported as public analytics or remote logs.

### 6.1.1 Deterministic statuses, authority, and reason precedence

K3 structural correction resolution is NOT authentication. The current K3 resolver accepts nonempty authority_ref without proving producer identity. K5 MUST verify separately that the producer is authenticated and authorized for the learner, store, target and correction operation BEFORE effective VOID/SUPERSEDE resolution. Until a production attestation adapter is independently approved, quarantine any potentially impacted family as CONFLICTED/CORRECTION_AUTHORITY_UNVERIFIED or mark the entire source SOURCE_INVALID if impact cannot be bounded; never silently apply or discard the correction then claim COMPLETE.

Use this ordered decision table; the first matching row wins. Mandatory reason codes appear once and are emitted sorted by Unicode codepoint. All rows have estimation_status=DISABLED_UNVALIDATED and the five estimate/validation fields equal to JSON null. For rows 1–3a, require NO_TRUSTED_EVALUATION and CALIBRATION_NOT_APPROVED as global non-estimation reasons, in addition to the listed integrity/mapping reason; row 1 cannot suppress source-invalid warnings. Every row appends IDENTITY_UNVERIFIED exactly when identity_scope=LOCAL_UNAUTHENTICATED. Thus the mandatory reason set is always the union of row-specific reasons, these global reasons, and only predicate-true optional reasons, code-point sorted.

| Priority | Predicate | integrity_status | observation_status | Mandatory reasons | Displayable counts |
|---|---|---|---|---|---|
| 1 | Invalid store/head/fingerprint/identity/mapping digest or correction impact unbounded | SOURCE_INVALID | QUARANTINED | SOURCE_INTEGRITY_INVALID, plus specific applicable reasons | None: zero safely displayable counts and empty objectives |
| 2 | Bounded competing/cyclic/unauthenticated correction affecting families | CONFLICTED | QUARANTINED | CORRECTION_CONFLICT iff competing or cyclic; CORRECTION_AUTHORITY_UNVERIFIED iff unauthenticated; include BOTH when both predicates hold | Independently unaffected families only; affected objectives QUARANTINED |
| 3 | Bounded missing target or unresolved correction/lineage affecting a known target | INCOMPLETE | QUARANTINED | CORRECTION_UNRESOLVED iff correction target unresolved; UNKNOWN_FAMILY_MAPPING iff relevant lineage unresolved; include BOTH when both predicates hold | Independently unaffected families only; affected objectives QUARANTINED |
| 3a | No correction conflict; otherwise verified records cannot be classified due solely to missing approved public family/objective mapping | INCOMPLETE | INSUFFICIENT_EVIDENCE | UNKNOWN_FAMILY_MAPPING, NO_TRUSTED_EVALUATION, CALIBRATION_NOT_APPROVED | Only independently verified mapped families; unknown contributions excluded and aggregate flagged incomplete |
| 4 | Complete validated source, no eligible public presentation | COMPLETE | NO_OBSERVATIONS | NO_EVIDENCE, NO_TRUSTED_EVALUATION, CALIBRATION_NOT_APPROVED | Zero |
| 5 | Complete validated source with eligible public presentation | COMPLETE | OBSERVATIONS_PRESENT | EXPOSURE_ONLY, NO_TRUSTED_EVALUATION, CALIBRATION_NOT_APPROVED | Exact verified observed counts |

INSUFFICIENT_EVIDENCE is exactly the row 3a mapping-only case, never row 3. Row 3 is reserved for missing correction/lineage references that might have altered known observations and thus QUARANTINED. If both apply, row 3 takes precedence. Never claim an exact aggregate when unmapped evidence could change it. A quarantined objective uses source_status=QUARANTINED, a verified observed objective uses OBSERVED_ONLY, otherwise NO_OBSERVATIONS. Add PROVISIONAL_OBJECTIVE_MAP only for provisional mappings; PUBLIC_FAMILY_REPEATED only for verified repeated family interactions; IDENTITY_UNVERIFIED when scope is LOCAL_UNAUTHENTICATED, without treating that identity scope itself as source corruption; and CONTENT_RELEASE_MISMATCH for a rejected mismatched record. NO_EVIDENCE is allowed only for NO_OBSERVATIONS, never QUARANTINED. Any further reason requires its declared independently verified predicate. The tuple and reasons are deterministic independent of locale.

### 6.2 Special empty source case

When through_store_seq=0, events MUST be empty. This is a legitimate cold start if the trusted local store head confirms zero; never call current K3 replayEvidence with toSeq=0 (its API requires a positive lower/upper range). When through_store_seq>0, replay K3 readRange and validate full requested historical scope. An absence of events in the selected RELEASE while earlier events exist MUST NOT be silently called a zero store; report no current-release observations, retaining the input head.

### 6.3 Null numeric invariant

Every output emitted under K5.EVIDENCE.v1 MUST have mastery_estimate, readiness_estimate, readiness_probability, confidence_interval and model_validation_ref equal to null, including cases that contain a syntactically valid GRADED event, mock-like mode, arbitrary authority_ref or an unusually high observed-family count. Model-like percentages, derived numeric proficiency levels and their synonyms must not appear in UI, exports, service worker manifests or instrumentation. Future non-null values require a new policy ID, new schema/contract review and a separately approved validated scoring lane; an accidental flag or environment variable may not activate them.

## 7. Exact evidence selection and deduplication semantics

### 7.1 Source acceptance and pinning

1. Require an explicit pinned K3 store_id and safe nonnegative integer through_store_seq at or below a read-back source head. Source identity cannot be inferred from one event; reject mismatched store IDs, unknown learner/track, unknown or inconsistent release references, duplicate event IDs/store sequences and changed event fingerprints. Verified multiple historical content releases for the same learner/track/store are valid; replay the full verified multi-release history before resolving cross-release corrections and selecting the current release.
2. Read and validate the complete authorized learner history (not all users) to the watermark before selecting current-release events. A cross-release correction may VOID/SUPERSEDE an event from the active release; restricting correction graph too early would be unsound.
3. Treat accepted K3 store sequence as canonical ordering, never local timestamp, locale collation or UUID lexicographic time. K3 out-of-order origin sequences are legal; absence of a contiguous subset does not automatically mean a globally incomplete store.
4. Verify correction producer identity and target-level authority OUTSIDE the K3 structural resolver first: the existing K3 resolver only checks nonempty authority_ref, so that string is never an authentication proof. Until a separately approved production authority adapter exists, quarantine potentially affected families or fail closed if unbounded; do NOT let forged VOID/SUPERSEDE suppress a public count and return COMPLETE. Only then resolve verified corrections with the K3 structural resolver. Missing target, ambiguous supersession, unauthorized correction, cycles and conflicting identity cause explicit INCOMPLETE/CONFLICTED or SOURCE_INVALID; no original evidence is silently revived as a valid observation. Safe unaffected families may be displayed only if their lineage and resolution can be independently established. Global unknown provenance invalidates the overall source summary.
5. Verify event context against a catalog-pinned active public release: track_id, content_release_id, question_family_id, item_version_id, objective_id, domain_id, item interaction and mode. Unpublished/factory-only/protected/retired items are not public-eligible descriptive evidence. A protected event cannot alter a public count, but missing correction provenance must not be ignored if it could affect a public event.
6. Require event authorization and origin only to the extent ACTUALLY furnished by K3; do not turn ordinary local source-integrity checks into a claim of verified SYSTEM authority.

### 7.2 Observations versus claims

- For Lane 1, the only canonical public study observation is an accepted active learner.item.presented@1 event in an allowed public mode, with family/interaction IDs matching the validated current public catalog. Include learn and practice; check/section/mock must NOT be accepted as independent transfer and are excluded from first-release descriptive eligibility because K4 public exam items are shared public content.
- Count at most one public presented observation per exact item_interaction_id; track distinct question_family_id for family count and group by objective_id/domain_id. Different item versions of the same family remain ONE exposed family. Re-render, retry or repeated option changes do not mint a new independent interaction without an accepted new presentation ID.
- A response, confidence click, hint, explanation, self-rated correctness or a local score MAY be used as an internal audit signal only under an explicitly enumerated minimal-data policy but NEVER as proof of mastery, correctness, transfer or stronger readiness. Default Lane 1 SHALL not display response accuracy or inferred weakness.
- Objectivemap v1 consists of migration-derived provisional objectives; it can group labels but MUST NOT establish an independently validated prerequisite graph, mastery or causal knowledge component. For an otherwise verified mapping-only gap without correction, classify using precedence row 3a as integrity_status=INCOMPLETE, observation_status=INSUFFICIENT_EVIDENCE, reason UNKNOWN_FAMILY_MAPPING; exclude unmapped contributions and do not claim an exact total. A correction or lineage ambiguity affecting a known target instead follows earlier QUARANTINED rows 1–3. Never attribute unknown family/objective by fuzzy matching.
- Distinct family count is a descriptive number, never a normalised mastery percentage; denominators such as total bank size may be displayed separately as catalog facts but MUST NOT be used to form a certified readiness scale. Do not turn fixed category levels (Foundation/Advanced) into derived ability classification.
- A family exposed in an earlier immutable release remains exposed for independence purposes if an approved family-lineage mapping is available. If historic lineage cannot be proven, output lineage-unknown/abstain for any attempted transfer claim; never assume the family is unseen. The public initial K5 branch makes NO transfer claim at all.
- Time/recency from occurred_at and local accepted_at is informational only and may be client-clock skewed; it cannot be the sole arbiter of trusted ability or cross-device event order. Injected now is allowed only for human-facing relative dates, with frozen-clock tests.

### 7.3 Integrity and projection scoping

- Source-level structural failure -> SOURCE_INVALID + empty/hidden descriptive aggregates as appropriate; no false stable counts.
- Targeted correction inconsistency -> affected family/objective QUARANTINED and excluded from trusted total; unaffected, independently resolvable observed families MAY be described, with a visible integrity warning.
- If the accepted store is temporarily inaccessible/offline denied/quota failed, do not display stale summary as current or pretend it saved. Show SOURCE_INTEGRITY_INVALID and offer regular public study entry only.
- Stable output is deterministic for the same validated source, release, policy, catalog, identity mapping and watermark, regardless of event input permutation after safe sequence sort, locale and browser timezone.
- Reconciliation rules for a source with unknown or incomplete history prohibit falsely exact total learning sessions; count only verified observed interactions in the read scope.

## 8. Lane 2: dormant statistical estimator contract (not deployable under this spec)

A future interface may take a TrustedEvidenceView with:
- independently authenticated/authorized SYSTEM evaluation producer attestation, audit evidence and scoring policy/release/form linkage;
- correction-aware applied response history; no stale or rejected strict mutation;
- family/learner/time separated held-out or low-exposure observations (only with proof they were independent when administered);
- author-approved objective mapping; model artifact/data versions; consent and retention legal basis;
- calibration/evaluation report including reliability diagrams, subgroup false-ready rates, uncertainty and intended-use validity;
- explicit release/promotion/rollback review and provenance.

No owner-approved numbers currently exist for minimum samples, clinical/statistical confidence levels, thresholds, calibration error budgets or external certification mapping. These are NOT filled in with model guesses. Strong results on public practice sequences are not independent exam outcome validation.

An estimation adapter MUST remain unreachable from the shipped learner UI under K5.EVIDENCE.v1; any request to enable it yields DISABLED_UNVALIDATED. Even if a developer creates a synthetic internal trusted evaluation fixture to test a contract, synthetic pass results MUST NOT become a production score. Never import BKT/pyBKT/pyKT dependencies in Lane 1.

Reactivation requires ALL of:
- a separately approved design + threat model for production authenticator/producer, robust beyond a caller-controlled authority_ref;
- a real, governed, permissioned independent item inventory or defensible transfer criterion and pinned family-version exposure audit;
- lawful collection, documented consent/purpose/retention and sufficient representative labeled response history;
- declared pre-training split: learner-disjoint where used for population validation, family/release-disjoint where the claim requires unseen transfer, strict forward-in-time target separation and no same-response multi-objective leakage;
- frozen baseline comparison (descriptive/deterministic, interpretable logistic, BKT, and deeper only if justified), negative controls, calibration vs true outcomes, small-group error review, accept/reject/rollback thresholds set BEFORE inspection;
- offline replay, producer authentication negative tests, privacy, mobile performance and independent review;
- distinct exact Git approved specification amendment, implementation plan, code/CI/PR acceptance and owner authorization.

These are conjunctive gates. Failing or unknown one means every estimator value is null, not zero or a plausible number. K6 empirical IRT remains out of scope and cannot be shortcut by K5 model estimates.

## 9. Presentation, user experience, accessibility and offline

- Show a compact AR/EN "Recorded activity" / "النشاط المسجل" section on the existing learner home; explicitly present observed distinct PUBLIC family counts and optionally labels without implying pass likelihood or mastery.
- State that numerical mastery/readiness estimation is not currently available because trusted independent grading/calibration evidence is missing. UI is clear, non-stigmatizing and non-alarming.
- No red/green success badges for mastery, progress ring suggesting official percentage, readiness leaderboard, misleading traffic light or inferred rank. A numeric count with a descriptive unit is permitted; a "ready 60%" bar is prohibited.
- Explain uncertainty using finite localized reason_code mappings, not raw user event text or model-generated rationales. Unknown code -> conservative generic message; no executable HTML or unsafe dynamic interpolation.
- Respect current mode separation: check/mock explanations and answers are NOT disclosed; K3 strict assessment lifecycle and K4 own next-action controls remain intact and unaffected.
- Keyboard focus order, touch targets, screen reader labels/live-region announcements, AR/EN + RTL/LTR visual/accessibility parity and WCAG 2.2 expectations are release tests.
- On startup with no or denied IndexedDB, show a safe public navigation state. No remotely inferred learner identity or false persistent state. On offline replay with valid local K3 store, deterministic summary works without external analytics/model calls.
- No automatic dashboard coercion, required streaks, email/push reminders or new account sign-in requirement. Default existing learning/exam entry remains accessible.
- No extra public bundle containing protected Q&A or learner-event exports. Service worker public allowlist, live release digests and immutable public-bank payload fingerprint must remain protected by existing CI.

## 10. Security, privacy, governance

Identity boundary: local learner_id, origin_id and store_id identify a local pseudonymous record only. Headers such as X-Anon-Id are not server authentication; never issue cross-user queries keyed only by client-supplied IDs. A real future authority belongs in a reviewed authenticated server port, not content shipped to browser.

Data minimization: avoid collecting new user identifiers, raw free text, sensitive learning diagnoses or cross-service analytics for K5 Lane 1. Derive counts in memory from already-permitted K3 events. Persisted projections, if needed, must be disposable and keyed by store + learner + track + release + watermark + policy + objective/catalog version and invalidated by corrections/erasure/source changes. The smallest first release should recompute rather than add a second persistent database. Deletion/retention and export must follow K3 privacy lifecycle, not an independent K5 irreversible cache.

Explicit Saudi applicability assessment is required before any broader user data collection/hosting or research cohort use; the PDPL Implementing Regulation Articles 11 and 19 establish purpose and minimization duties where applicable. No declaration of complete regulatory compliance is implied by this spec.

Threat tests: forged authority_ref, replayed event fingerprints, wrong learner/track/store, modified catalog, retired/protected item, source truncation, clock skew, injection-shaped text, unauthorized sync, malicious release and offline cache corruption. Never put pseudonymized private learning history in CI artifacts, PR comments, public static files or unrestricted application telemetry.

## 11. Error recovery, versioning and portability

- Projection is recomputable from accepted source and immutable catalog; K5 state never writes K3 raw events, K4 user preferences or K2 review status.
- Source read failure/erasure/correction/unknown model version -> return safe reason status or reject per strict contract; never fall back to an old optimistic estimate.
- Policy version changes, canonical catalog/objective/optional lineage mapping hashes and versions, and source watermark changes invalidate any cached derived state; schema migrations preserve ability to replay old evidence without mutating source events.
- Avoid global Date.now, locale sorting or browser-only APIs inside deterministic core. Determinism checks compare browser and Node snapshots.
- K5 does not require Python, cloud GPU, trained models or additional storage services; if needed later, use explicit adapter ports and deployment gates.
- Unsupported/partial record must not be silently treated as COMPLETE. Projection validation must distinguish K3 source integrity from K5 sufficiency and from statistical readiness.
- Offline-first and browser storage denial should never break existing full/section exams or K4 public recommendation card.

## 12. Acceptance criteria: future implementation shall be test-first

The following acceptance criteria define EXPECTED future tests. They are NOT claimed executed by committing this spec.

| ID | Required test / observable acceptance |
|---|---|
| AC-01 | K5 has independent source/spec/plan approval and separately versioned policy/schema; preapproval product writes blocked. |
| AC-02 | Empty local store head=0 returns valid NO_OBSERVATIONS; no K3 replay call with toSeq=0 and every numeric estimate is JSON null. |
| AC-03 | Replayed K3 source must bind exact learner, track, store, release and watermark; duplicates, changed event fingerprints and inconsistent identity/release provenance fail closed; verified multi-release history remains eligible for correction resolution. |
| AC-04 | Correction VOID/SUPERSEDE, cross-release reference, cycle, competing corrections, forged nonempty authority_ref and unresolved target produce deterministic quarantine or SOURCE_INVALID; no unverified producer may delete or restore observations. |
| AC-05 | Public family presentation count deduped by item_interaction_id; repeated responses, refreshes and retries do not mint new observations. |
| AC-06 | Item version sibling with same family ID is one exposed family; lack of approved older-release family mapping cannot be labeled unseen/transfer. |
| AC-07 | Provisional migration-derived objective labels group only; they cannot produce prerequisite graph, inferred mastery or official readiness. |
| AC-08 | Browser responses, known public answer keys, confidence, hints, streaks and elapsed time cannot change estimator-null invariant. |
| AC-09 | Crafted SYSTEM evaluation and arbitrary authority_ref do not activate scoring or alter nullability, even if event shape passes JSON schema. |
| AC-10 | Valid synthetic authenticated-scoring fixtures, if introduced separately as tests, are treated as CONTRACT ONLY and never as evidence of a deployed producer. |
| AC-11 | Check/section/mock activity in shared PUBLIC bank cannot count as unseen protected holdout or establish official transfer. |
| AC-12 | Unpublished/factory/protected/retired/quarantined catalog items cannot reach public counts or render protected IDs/answers. |
| AC-13 | Missing current-release events with nonzero old-release history are reported correctly, not fabricated zero source head. |
| AC-14 | Same accepted inputs and source watermark yield identical canonical output after record ordering permutations, locale and timezone changes; freeze complete status/reason table fixtures including mixed releases and correction authority. |
| AC-15 | Incomplete source and missing mapping present exact reason codes without stale optimistic UI, and generic public navigation remains usable. |
| AC-16 | Every Lane 1 mastery_estimate, readiness_estimate, readiness_probability, confidence_interval, model_validation_ref is EXACT null in core, UI, export and persisted/disposable cache. |
| AC-17 | An accidental config flag or internal estimator adapter cannot activate statistical inference without new policy + independently approved gate. |
| AC-18 | AR/EN and RTL/LTR messages, keyboard/screen-reader/mobile usability and WCAG 2.2 regressions pass real Chromium browser smoke, not only source inspection. |
| AC-19 | IndexedDB denied/quota/reload/offline/erasure handling preserves K3/K4/exam behavior; no false saved-state claim. |
| AC-20 | No change to the 1,120-question bank hash, seven domains, 200-question full exam, protected content exclusion, or K4 public ACTION selection. |
| AC-21 | Privacy/pseudonym boundary denies cross-learner/cross-store data and new analytics payloads with response text/secrets; deletion invalidates projections. |
| AC-22 | Deterministic client and server adapter tests verify source quality, late arrivals and corrections; canonical public catalog, objective and optional lineage mapping digests are separate from question payload digest and invalidate caches when bytes change. |
| AC-23 | Whole-branch independent review: no open Critical/Important findings, tests on FINAL exact head, docs/recovery and source consistency; no auto merge. |
| AC-24 | Manual PR integration only after separate owner approval naming PR and full exact SHA; merged-main Node/Python/Chromium/Pages, actual live digest and persisted K5 scope evidence verified before claiming initial release closed. |
| AC-25 | Full K5 numerical lane remains explicitly INACTIVE/NOT_VALIDATED at initial closure; K6 cannot start based on an unproven statistical readiness claim. |

Acceptance criteria enforce the trust boundary across the whole source, not just the UI. An acceptance test that stubs an authorised producer does NOT prove deployment auth, cohort validity or real outcome calibration. Every code task must use RED -> GREEN -> regression evidence, then independent review and exact-head CI; a test unexpectedly already green is NOT accepted RED.

## 13. Boundary before implementation planning

This is an architectural specification, not a task decomposition. Exact implementation tasks, file ownership, sequencing, checkpoints and executable command lists shall be authored only after renewed approval of this revised written spec using Superpowers writing-plans. No product code or implementation plan is authorized here.

## 14. Quality gates and immutable approvals

1. The owner explicitly approved the two-lane **architecture direction**, NOT this specific written spec.
2. Commit this proposed spec on a design/research branch; inspect diff and self-review for consistency and source-proof limits. Independent Codex or other reviewer, if available, may comment, but a comment is not human approval.
3. Present exact Git blob SHA + spec path and key decisions to owner; request **WRITTEN_SPEC_APPROVED** on the frozen blob. Any edit changes blob SHA and requires fresh approval of changed text.
4. Only after written-spec approval invoke Superpowers writing-plans, create a separate detailed RED/GREEN implementation plan with explicit tests and gate labels, then ask owner for **separate plan/method approval**. No product source writes prior to both gates.
5. Keep design branch unmerged before approvals unless a separate explicit documentation integration authorization is granted; no auto-merge. Later product PR requires new final SHA-specific authorization and real review.
6. K3/K4 source/state never silently reused as K5 execution authority. A K5 manifest/review/ledger requires its own schema, baseline and lifecycle. Historic trackers remain read-only context.
7. An initially successful Lane 1 public release shall be reported as **K5_INITIAL_DESCRIPTIVE_SCOPE_VERIFIED**, not "calibrated mastery", "official SDAIA readiness" or automatically FULL K5 statistical completion. A future Lane 2 rollout needs another approved spec/plan and independent evidence before being counted.

## 15. Source and evidence limits (as of 2026-10-11)

**Primary project evidence:** same-sha direct GitHub reads of SECURITY.md; K3 approved normative spec and src/evidence/{acceptance,recorder,replay,corrections,projections}; K4 spec, scoped release amendment and src/recommendations/{publicCatalog,policy,projection}; the K4 verified public catalog and objective register; governance and compatibility records.

**External independent families, with scoped use:**
- Testing/validity: NCME/AERA/APA open Standards (2014) https://ncme.org/resources/books/testing-standards/
- Model comparisons: Gervet et al., JEDM (2020), nine-dataset comparison https://jedm.educationaldatamining.org/index.php/JEDM/article/view/451
- Survey: Abdelrahman et al., ACM Computing Surveys (2023) https://doi.org/10.1145/3569576
- Original deep tracing: Piech et al. (2015) https://arxiv.org/abs/1506.05908
- Original model implementation: CAHLR pyBKT (v1.4.3 Aug 2026), maintainer code/issues https://github.com/CAHLR/pyBKT
- Independent benchmark toolkit: pyKT NeurIPS datasets/benchmarks lineage https://github.com/pykt-team/pykt-toolkit
- Direct leakage evidence: Badran and Preisach, open-access 2026-10-01 article https://doi.org/10.1007/s42979-026-05344-3
- Subgroup calibration caution: Nurmukhambet and Meirmanova, IEEE SIST (2026) https://ieeexplore.ieee.org/document/11596401
- Probability calibration: scikit-learn user guide https://scikit-learn.org/stable/modules/calibration.html
- Certification analogy: Microsoft Learn practice assessment FAQ https://learn.microsoft.com/en-us/credentials/certifications/frequently-asked-questions
- Privacy rule where applicable: SDAIA PDPL Implementing Regulation (Article 11 purpose, Article 19 minimization) https://dgp.sdaia.gov.sa/
- Accessibility: W3C WCAG 2.2 Recommendation https://www.w3.org/TR/WCAG22/
- General AI evaluation risk: NIST AI RMF trustworthy validity and reliability https://airc.nist.gov/airmf-resources/airmf/3-sec-characteristics/

**Limitations:** These are independent evidence roots, not thirteen reproductions of an SDAIA K5 model. Public research cohorts and calibration statistics DO NOT demonstrate performance on this public bank, Saudi users, official SDAIA exam results or future protected content. Recent pyBKT bug issues are maintainer-repository reports, not defects reproduced in this project. IEEE article access is limited compared with open Springer/JEDM content. No real protected cohort, local BKT trained model, independent reviewer approval, longitudinal learner sample, privacy-compliance certification or official test validity study is claimed.

## 16. Owner's exact written-spec decision

Requested action after reviewing this exact file:
- Approve the committed **K5 written spec** (its Git blob SHA) for the next stage only: invoking Superpowers writing-plans to prepare an executable TDD plan, without implementation until a further plan approval.
- Or request amendments and a new blob SHA/re-review.

**Current gate:** WRITTEN_SPEC_APPROVAL_PENDING. This file alone grants no implementation, deployment, readiness number, official certification claim, K6 activation or merge permission.

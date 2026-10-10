# K4 — Next-Best-Action and Spaced Practice — Proposed Normative Design

**Date:** 2026-10-08
**Status:** `DRAFT_FOR_EXPLICIT_SPEC_REVIEW` — NOT approved; NO implementation authority
**Program:** K4, following verified K3 `main@9e55881e9480b4a02d8ef5d92a0b21a9313492f1`
**Design direction approved in conversation:** rule-based local-first recommender first; optional FSRS only after legitimate rating semantics, head-to-head validation, and a separately reviewed activation decision
**Decision path:** Superpowers `brainstorming` architectural; written-spec review is the next HARD GATE. The subsequent `writing-plans` and TDD/implementation MUST await explicit approval of THIS document. Earlier request to finish K4 is an objective, not evidence that an unwritten plan has been approved.

## 1. Authority and evidence

Higher-priority baseline:
1. `PROJECT-INDEX.md`, `RECOVERY-PROTOCOL.md` and live `CURRENT-STATE.json`.
2. Approved K3 spec `docs/superpowers/specs/2026-09-29-k3-learner-evidence-engine-design.md` and K3 ledger/verified release.
3. Platform VNext spec `docs/superpowers/specs/2026-09-23-learning-platform-vnext-design.md`, sections 12–19.
4. Research amendment `docs/superpowers/specs/2026-09-26-learning-platform-research-amendment.md`.
5. Cross-programme roadmap `docs/superpowers/plans/2026-09-27-post-b3-platform-kernel-roadmap.md` (roadmap, NOT K4 implementation plan).
6. Research/gap report `docs/superpowers/research/2026-10-08-k4-evidence-first-discovery.md`.

Direct externally verifiable evidence:
- Dunlosky et al. (2013), practice testing and distributed practice generally useful: https://www.psychologicalscience.org/publications/journals/pspi/learning-techniques.html .
- Cepeda et al. (2006), 317 experiments, optimal gap depends on retention interval: https://doi.org/10.1037/0033-2909.132.3.354 .
- Agarwal et al. (2021), classroom retrieval review with 50 applied experiments: https://doi.org/10.1007/s10648-021-09595-9 .
- McDermott (2021), retrieval practice review: https://doi.org/10.1146/annurev-psych-010419-051019 .
- Adesope et al. (2017), meta-analysis of practice testing: https://doi.org/10.3102/0034654316689306 .
- Rohrer/Taylor math spacing/interleaving study: https://digitalcommons.usf.edu/psy_facpub/1767/ .
- Anki official guidance: https://docs.ankiweb.net/deck-options.html .
- FSRS mathematical model and 4 explicit ratings: https://github.com/open-spaced-repetition/fsrs4anki/wiki/The-Algorithm .
- ts-fsrs implementation/api: https://github.com/open-spaced-repetition/ts-fsrs/blob/main/packages/fsrs/README.md .
- ts-fsrs issue #373 flags timezone/date handling: https://github.com/open-spaced-repetition/ts-fsrs/issues/373 .
- fsrs4anki issue #582 user migration concern (individual signal, not prevalence): https://github.com/open-spaced-repetition/fsrs4anki/issues/582 .
- W3C accessibility: https://www.w3.org/TR/WCAG22/ .

These are multiple independent evidence kinds, NOT proof that any algorithm has been validated on this specific SDAIA exam bank. Source URLs in the research report and dated verification remain available without recomputing from conversation memory.

## 2. Intent, success and non-goals

**User question**: "What should I do next, why, and how can I postpone or choose another activity?" Expose ONE small, feasible next learning action before advanced analytics. Every result has stable provenance, release, policy version and uncertainty.

Success:
- For every permitted local learner state, return one valid, explainable next action or an explicit `NO_ELIGIBLE_ACTION`/insufficient-data response.
- Recommendation is a recomputable **derived projection**; K3 accepted/corrected evidence and assessment snapshot history remain immutable.
- Same canonical inputs + frozen clock + policy + release -> exact same output/order across Node/browser.
- Arabic/English, RTL/LTR, offline and existing 1,120-question release remain fully usable; no change to mock scoring/selection.
- Smallest useful action, clear reason and skip/snooze; no compulsory scheduler controls.

Not K4:
- Mastery/readiness/official probability-of-pass scores (K5); calibrated IRT (K6); tutoring generation (K7); CAT (K8); LMS/QTI integrations (K9); production authenticated cross-device sync; exam credential or SDAIA endorsement claims.
- Generating or automatically activating any new questions, modifying answer-key/hidden holdout inventories, turning optional AI/FSRS into a mandatory dependency.
- Translating correctness, confidence or time into FSRS Again/Hard/Good/Easy without independently justified graded-recall semantics.

## 3. High-level architecture and reuse

```text
approved public release + 140 provisional objective labels + known modes
                  |                                       |                      K3 append-only store + correction/replay
                  |                                  |
              eligible candidate pool     evidence->exposure/schedule derivation
                  \                                 /
                   deterministic filter/ranker (policy K4.RULES.v1)
                                      |
                             RecommendationV1
                                      |
                    AR/EN "Next action" UI + local preference port
                                      |
                       K4-owned single-item practice route (strict exams unchanged)
```

- Reuse `src/evidence/replay.js` and `resolveCurrentEvidence` for canonical, correction-aware order. For projections with unanswered/strict changes, use `projectAttempt` and trusted response/evaluation matching where their existing API is suitable; never create a second canonical event store.
- Reuse existing content registry/QuestionFamily and ItemVersion IDs, exact current `content_release_id`, form snapshots and `objective_id` from `data/evidence/sdaia-ai-engineer.objectives-v1.json`. All currently named learning objectives are `provisional` migration-derived: no invented prerequisite graph is allowed.
- New K4 pure modules are candidates for `src/recommendations/` with a narrow browser adapter. No React/new framework and no backend service are mandated.
- **Verified existing-UI gap (2026-10-09, K3 `main`):** `src/app.js` currently enters only `full` or `section` exam flows; `createBrowserAssessmentContext` rejects `learn` and `practice`. Thus K4 must add a **new, separately tested, single-item non-strict `practice` browser flow**. Reuse the already supported K3 recorder `startActivity`/`presentItem`/`recordResponse` for non-strict `mode='practice'` without calling the strict assessment-snapshot constructor; do not replace or modify strict exam scoring/feedback. The K4 recommendation itself never reveals an answer key.
- Existing public `QUESTIONS` are generated by `expandConceptBank` and also feed `full`/`section` exams. **Being selected into an existing public mock does not make a public item protected.** Eligibility must follow the explicit release-pinned public catalog/holdout status, not a heuristic that excludes every family ever shown in a mock.
- Existing `src/evidence/recorder.js` deliberately rejects untrusted `recordEvaluation()` calls: a browser answer is not by itself a trusted correctness signal. K4 cannot infer `correct` from client-side answer choices.
- Initial K4 **does not cache RecommendationV1**: it is recomputed from a validated schedule projection, policy, current injected `nowIso` and current preferences whenever shown or acted on. Source watermarks alone cannot invalidate a recommendation when due/snooze time elapses. An optional later **disposable schedule projection cache** requires exact learner/store/release/watermark/policy identity and verified invalidation on K3 event/correction/identity changes; never persist recommendations across time boundaries without explicit expiry tests. K3 raw events remain untouched.
- Current `CURRENT-STATE` is K3 COMPLETE, `ACTIVE_REF_RESOLUTION_VALID=PENDING`, `low_model_ready=false`. K4 needs its OWN approved execution manifest, process gates and worktree. No `K3` gate may be auto-reused to authorize K4 code.

## 4. Contract: K4 RulePolicyV1

A versioned immutable policy object (proposed `data/recommendations/k4-rule-policy-v1.json`):
- `policy_id='K4.RULES.v1'`, `schema_version=1`, `algorithm='DETERMINISTIC_RULES'`;
- `first_review_delay_hours=48`, `trusted_incorrect_delay_hours=24`, `trusted_correct_delay_hours=96`, `max_review_delay_hours=720`, `max_action_items=1`;
- `include_modes=['learn','practice']`, `exclude_modes=['check','mock','section','full']`;
- `allow_provisional_objectives_for_labels=true`, `allow_provisional_objectives_for_prerequisites=false`, `fsrs_enabled=false`;
- `protected_candidates_allowed=false`, `untrusted_correctness_allowed=false`, `unavailable_content_behavior='SAFE_FALLBACK'`.

**These interval values are product-starting defaults selected for a repeatable comparison baseline, NOT empirically optimized retention intervals or official certification guidance.** Require policy-versioned change and explicit future outcome trials before claiming they improve learning. The implementation plan must include a frozen comparison dataset and cap workload; no unchecked optimization.

Invariant: recommendation scoring cannot depend on locale string ordering, platform timezone, clock wall-time reads inside the pure function, network access, hidden answers, or personal direct identifiers. All dates are strict valid ISO8601 instants; due is computed as `accepted_at` plus policy hours, not local calendar arithmetic.

## 5. Derived schedule contract: ScheduleProjectionV1

`computeScheduleProjection({ learnerId, sourceStoreId, throughStoreSeq, events, activeReleaseId, policy, nowIso, acceptedContentCatalog })` produces:

**Empty-replay contract:** `throughStoreSeq=0` and `events=[]` form a valid deterministic cold start. Do not call K3 `replayEvidence` with `toSeq=0`: its API requires `fromSeq>=1` and `toSeq>=fromSeq`. Construct an explicitly empty source-bound projection, then choose only a release-approved public candidate. For nonempty history, read via the existing **source-bound local K3 store** and require its fingerprint/identity checks; a browser-local pseudonymous store is **not authenticated**. Do not trust arbitrary externally supplied events or treat it as cross-device/server authority.

- `schema_version=1`, `projection_type='ScheduleProjectionV1'`, `policy_id`, `source_store_id`, `through_store_seq`, `content_release_id`, `learner_id` (opaque pseudonym only), `generated_for_at` supplied clock, `integrity_status='COMPLETE'|'INCOMPLETE'|'CONFLICTED'`, `items`. `COMPLETE` only means validated source and projection integrity, not trusted grading or guaranteed complete learning history.
- `items[]`: `question_family_id`, `latest_item_version_id`, `objective_id` or null, `last_exposure_at` or null, `last_graded_at` or null, `grade_evidence='TRUSTED_GRADED'|'EXPOSURE_ONLY'|'NONE'`, `due_at` or null, `exposure_count`, `source_event_ids` (up to 5 deterministic most-recent distinct IDs, sorted by store sequence with stable ID tie-break), `source_event_ids_truncated` boolean, `data_quality_status='VALID'|'INCOMPLETE'|'CONFLICTED'`. Missing source provenance must not be padded with invented IDs.
- No K5 `mastery`, `readiness`, `probability` or FSRS `retrievability` field.

Canonical derivation rules:
1. Filter K3 events at `store_seq<=throughStoreSeq` and matching explicit store/learner/track/release. Identity mismatch, unknown release, duplicate ID/sequence, malformed or tampered event -> **fail closed**; `CONFLICTED` corrections must quarantine affected candidate, not silently select old evidence.
2. Resolve K3 corrections and strict attempt mutation decisions. Ignore STALE/UNRESOLVED responses for grading. Treat feedback as `TRUSTED_GRADED` only for `learner.response.evaluated@1` after **independent verification of the K3 trusted SYSTEM producer/acceptance authority** (an `authority_ref` string alone is not authentication), `evaluation_status='GRADED'`, a boolean `correct`, a link to a currently APPLIED response when the mode is strict, and the exact expected scoring policy. Never use events from excluded `section`/`mock`/`check` modes to rank initial K4 public practice. Because current `src/evidence/recorder.js` rejects browser `recordEvaluation()`, the first K4 browser release is **exposure-driven only**; `TRUSTED_GRADED` remains a contract/authorized-fixture case until a separately approved governed producer and mode policy exist. If authority cannot be verified, treat evidence as `EXPOSURE_ONLY`, not graded.
3. Exposures count distinct accepted `learner.item.presented@1` events *once per item interaction*; if the same question family has several versions or attempt events, dedupe by family and interaction, never double-count on page re-render.
4. For first/last exposure only, compute `due_at=last_exposure_at + first_review_delay_hours`; trusted incorrect overrides with incorrect delay; trusted correct with correct delay, always bounded by max delay. Incorrect+correct are not FSRS grades; neither score is an official readiness value.
5. Missing/unparseable timestamps or correction conflict cannot fabricate a due date; emit explicit incomplete/quarantined status, not a plausible number.
6. `accepted_at` is the reference for accepted local events, but **local IndexedDB `accepted_at` is generated from device time and is not a trusted server clock**; deterministic `occurred_at` may be used only when accepted_at is unavailable **and** K3 verifies its integrity/time semantics. Validate plausible timestamp relation to injected `nowIso` and source provenance, and quarantine suspicious future/skewed local instants rather than silently clamp or schedule a far-future due date. Do not claim this detects every adversarial clock change.
7. `nowIso` is injected, never `Date.now()` in core. Rendering in learner-selected local timezone changes display only; due instant stays fixed through DST/travel.

## 6. Recommendation contract: RecommendationV1

`recommendNextAction({ scheduleProjection, catalog, policy, nowIso, preferences })` returns:

```json
{
  "schema_version": 1,
  "recommendation_type": "RecommendationV1",
  "policy_id": "K4.RULES.v1",
  "source_store_id": "opaque-local-store-id",
  "through_store_seq": 0,
  "content_release_id": "sdaia-ai-engineer.bootstrap.v1",
  "status": "NO_ELIGIBLE_ACTION",
  "action": null,
  "reason_code": "CONTENT_UNAVAILABLE",
  "evidence_strength": "COLD_START",
  "reason_event_ids": [],
  "reason_event_ids_truncated": false,
  "selection_version": "K4.RULES.v1",
  "generated_for_at": "2026-10-08T10:00:00.000Z"
}
```

When `status=ACTION`, `action` is:
`{ action_type:'PRACTICE_ONE', track_id, domain_id, objective_id, question_family_id, item_version_id, route_mode:'practice', release_id, due_at:null|string }`. A distinct `learn` deep-link is outside first-release K4 unless it has its own reviewed implementation and route tests.
Only a *public/eligible* item may be linked; never emit an answer, distractor rationale, test holdout ID or entire protected pool.
Reason provenance is capped at **5 distinct event IDs** (most-recent by source store sequence; stable deterministic tie-break) with explicit `reason_event_ids_truncated:boolean`; use `false` for empty or untruncated lists. A real response must contain **one** literal per enum property, not the pipe-separated choice notation in prose. Valid status/reason combinations: `ACTION` needs a non-null eligible action and `COLD_START|REVIEW_DUE|TRUSTED_ERROR_REVIEW|NEW_FAMILY`; `NO_ELIGIBLE_ACTION` requires `action=null` with `CONTENT_UNAVAILABLE|ALL_SNOOZED`; `INSUFFICIENT_EVIDENCE` requires `action=null` and `SOURCE_INVALID`. `TRUSTED_ERROR_REVIEW` and `evidence_strength=TRUSTED_GRADED` require verified SYSTEM evidence and cannot appear in the first exposure-only browser release. All error/no-action responses must avoid claiming a trusted grade. Reason descriptions come from a finite code-to-localized-message dictionary, never untrusted event text.

Eligibility before ranking:
1. Match active track+immutable release, an **explicit shipped-public, K2-governed release catalog/allowlist** with family and item-version IDs, and a verified available offline bundle. Resolve against the K3-existing `expandConceptBank` public `QUESTIONS`/track manifests and governed release IDs; a raw learner event or unknown factory item must never introduce a candidate.
2. Exclude *designated* reserved/holdout/protected/factory-only inventories, private mock/check assessment pools where distinct, and quarantined/retired/inactive versions or evidence-conflicted/invalid items. The current `full`/`section` browser exams sample the **same public `QUESTIONS` pool**; past use of a public item in one of those exams is not by itself evidence it belongs to a protected pool. Never use a protected or strict assessment's hidden answers, held-out form, response correctness or scoring in K4 ranking.
3. Exclude family currently active in an unfinished attempt, if known, and user `skip/snooze` entries until their explicit expiry. These controls cannot accidentally delete raw evidence.
4. Rank by `(trusted-incorrect due now, ordinary due now, unseen family, future due if allowed by explicit preview flag)`. Default **never present not-yet-due** items when unseen eligible families exist. Resolve equal priority using stable objective/domain/family/item IDs; never randomized or locale-order changes.
5. If empty -> `NO_ELIGIBLE_ACTION` with deterministic reason; if critical input incomplete -> `INSUFFICIENT_EVIDENCE`. A safe generic navigation back to the **existing public home screen** is allowed but MUST not forge a ranked question recommendation or claim a `learn` browser route exists.

## 7. Preferences and user control

`SchedulingPreferencesV1` is explicit local-only user intent: `learner_id`, `version`, `revision`, `snoozed_families[]` with `until_at`, `dismissed_families[]` with optional expiry, `preferred_domain_id|null`; no inferred ability/diagnosis. Store in a separate narrow IndexedDB settings object / adapter and never silently copy user intent into raw `LearnerEvidenceEventV2`; if later a governed event is required, create it in a separately approved K3 event-definition amendment.
- Buttons: Start now, Another activity, Snooze (explicit choice), View reason. All actions have keyboard access and clear AR/EN text.
- No forced reminders/notifications, streak pressure, or automatic rescheduling of existing assessment sessions.
- Changes to preferences invalidate cached projections/recommendations; default actions remain available offline.
- If local settings unavailable/denied, no action incorrectly claims persistent snooze; show safe message and continue without mutation.

## 8. UI, release integration and compatibility

- New small "Next step" card added to the existing public home without replacing exam entry points or the 200-question full exam. Selecting it opens the **new K4-owned single-item non-strict practice flow** on one approved public item; **there is no existing `learn`/`practice` browser route on K3 `main`**. Reuse the already-governed K3 ordinary activity/interaction capture, not the strict `full`/`section` assessment snapshot/scoring path. Any local visual feedback is public-practice-only, never a forged `TRUSTED_GRADED` event.
- Real UI must show whether recommendation is `unseen`, `time-to-revisit`, or based on **trusted graded** evidence; never misleading percentage certainty. Hide FSRS model internals.
- AR/EN and RTL/LTR parity, mobile touch, WCAG 2.2 focus/labels, offline cold start/resume, controls after refresh, and safe handling of expired local bundles are release gates.
- Browser asset loader and Service Worker manifest must be updated if a new shipped JS/schema is introduced; private `data/factory` remains excluded from Pages.
- K3 bank SHA-256 must remain `5e48b1e47450f1150c9c8f21386f3a4e31070a3d444f968d10f45ccb9ff418a9`; user-visible bank stays 1,120, seven domains, full exam 200 unless a separately approved governed release changes them.
- Existing strict mock/check/section flow must be byte-for-byte compatible in scoring and no hint/answer feedback policy. K4 never changes K3 acceptance/authority semantics.

## 9. FSRS extension: adapter only; NOT enabled in initial K4

A `SchedulerAdapter` port MAY later expose `scheduleOne({reviewHistory, genuineRatings, previousSchedule, nowIso, modelVersion, parameters})`. It cannot run until:
- a separately approved *real* four-state retrieval grade capture and event governance policy exists; no `correct -> Good` shortcut;
- active package version/LICENSE/Node/browser compatibility and import size are checked and pinned; do not install it just because docs mention it;
- timezone/elapse semantics (issue #373), replay determinism, rollback/migration, interval stability and exposure-control tests succeed;
- a representative frozen/permissioned heldout dataset supports comparison with the deterministic scheduler on retention AND review workload, with uncertainty and no false-positive improvement claim;
- active rollout/canary, learner opt-in (if material behavior changes), fast kill switch/rollback and human reviewer signoff;
- algorithm only proposes due times; K4 outer eligibility/safety gates remain authoritative.
Default release remains `fsrs_enabled=false` even if the adapter interface is implemented. Bandits/ML exploration are **outside K4**.

## 10. Error and security model

- Store read/IndexedDB denied -> `INSUFFICIENT_EVIDENCE` or generic public learning entry, no fabricated `correct` and no mutation.
- Unknown/invalid event definition, correction cycle, conflicting identity/store, invalid watermark, unexpected scoring version or incomplete grading -> fail closed, quarantine affected learning-signal use, preserve safe ungraded public candidate route.
- Unknown/retired content version or unavailable offline asset -> never deep-link to it, provide refresh/fallback.
- Bad `nowIso`, negative/double-valued sequence, invalid timezone or policy -> reject before ranking; no timezone-derived deadline drift.
- Untrusted text/event/property must never be interpolated as HTML or instruct a model; reasons from enums and translated literals.
- Opaque local learner ID is not authentication; do not expose a cross-user server query or claim cross-device protection without a production identity trust boundary.
- No external telemetry of answer content/PII; if instrumentation is added later, route through existing policy/consent contract.
- Explicit offline and rollback behavior, no impact to unrelated exam routes if K4 is disabled.

## 11. Deterministic acceptance matrix (minimum)

1. Empty history (`throughStoreSeq=0`) -> public `COLD_START`, one accessible action, no grading claim and no invalid `replayEvidence(toSeq=0)` call.
2. Correctly graded event from an **independently verified SYSTEM producer fixture** -> `TRUSTED_GRADED` due, stable across replays; browser-only K4 deployment must NOT claim this case is exercised with real trusted outcomes.
3. Plain browser answer with no trusted evaluation -> `EXPOSURE_ONLY`, never correctness/FSRS.
4. Stale/unresolved assessment mutation -> no trusted grade; no fabricated review priority.
5. VOID/SUPERSEDE/correction conflict -> deterministic recomputation; quarantine ambiguous family.
6. Duplicate delivery or rerender -> no extra exposure nor earlier false due date.
7. Objective labels from provisional catalog -> usable for display but no fabricated prerequisite graph.
8. All items protected/quarantined/unavailable -> `NO_ELIGIBLE_ACTION`, no leakage.
9. Family has public and protected variants -> only public permissible version, never hidden holdout.
10. Same frozen inputs and clock across Node/browser and locales -> equal machine projection/ranking.
11. Timezone/DST/travel and device clock jump -> fixed UTC due instant or deterministic quarantine.
12. Skip/snooze/reload/offline -> user control persists only after actual successful local write.
13. Missing IndexedDB/exhausted storage -> safe fallback; no false persistence message.
14. K4-owned single-item non-strict `practice` flow starts, records only permitted ordinary K3 activity/item/response evidence, and preserves strict `mock`/`section`/`check` scoring, snapshots, delay policy and UI answer boundaries byte-for-byte; existing shared-public items are not mislabeled as holdouts.
15. 1,120 question SHA, 7 domains and 200-question exam unchanged.
16. AR/EN, RTL keyboard, responsive accessibility and offline cached navigation smoke PASS; derived recommendation is recomputed at frozen-clock due/snooze expiry even when watermark is unchanged, including across refresh.
17. Independent reviewer findings all addressed; no open Critical/Important; branch exact-head GitHub CI PASS.
18. Merge via PR preserving protected path with separate explicit exact-head authorization; fresh merged-main server/browser/Pages/live release PASS; durable `CURRENT-STATE`/ledger closure after verifying actual merge SHA.

## 12. Build/test/review sequence (design targets; NOT approved tasks yet)

A. Author `K4` source/decision ledger and a **separately versioned K4 state schema/validator and execution manifest** from fresh `main`; leave K3 COMPLETE record intact. Existing `current-state.schema.json` requires `programme='K3'`, so mutating/reusing it as K4 execution authority is prohibited before a reviewed migration/contract.

B. Worktree/source gates, schemas and policy version; TDD RED/accepted RED for validators/schedule projection; strict corrected-evidence/authority tests.

C. Pure eligibility filter and deterministic ranking; TDD failure cases for protected release/mode, duplicates and deterministic tie breaking.

D. Local preferences port and derived cache; offline/corruption/concurrency/rerender tests, no K3 raw modification.

E. Minimal AR/EN UI integration, learner controls and route; browser/keyboard/accessibility/offline test.

F. Full `npm ci --ignore-scripts`, `npm run validate`, `npm test`, `npm run verify:sw`, `npm run verify:factory-import`, process gates scoped to K4, `PYTHONPATH=server python3 -m pytest server/tests -q`, `python3 scripts/browser_smoke.py`, Pages build + local and deployed `verify_live_release.js`, exact bank digest.

G. Independent code review (if available), record actual reviewer rather than claiming one, resolve blockers; integrate K4 as a single reviewed PR with exact-head checks and confirmation; verify merged `main` and Pages before `K4 COMPLETE`.

**Gate outcome at doc authoring:** `DRAFT_SPEC_REVIEW`. Next permissible action is user review/approval or requested corrections to THIS spec. `K4_TASK_EXECUTION_READY` is NOT PASS and no program K5 has started.

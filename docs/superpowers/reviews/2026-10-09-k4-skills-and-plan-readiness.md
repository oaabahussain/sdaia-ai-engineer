# K4 — ChatGPT Skills and Plan Readiness Review

**Reviewed:** 2026-10-09 (Asia/Riyadh)  
**Programme:** SDAIA Learning Platform — K4 Next-Best-Action / Spaced Practice  
**Review classification:** architectural written-spec review; NOT approved plan, new implementation work, independent code review or authorization to merge.  
**GitHub:** [PR #64](https://github.com/oaabahussain/sdaia-ai-engineer/pull/64), head observed before writing `32873ba530edcf07874ecf71609cb716709c5b64`.  
**Main:** `9e55881e9480b4a02d8ef5d92a0b21a9313492f1`, no branch drift observed.  
**Written draft spec blob:** `a07de53c60cc2b6d7645c67cc3cec289c8e8e607`.  
**State manifest:** `docs/superpowers/state/CURRENT-STATE.json`, revision 76, `K3 COMPLETE`, `ACTIVE_REF_RESOLUTION_VALID=PENDING`, `low_model_ready=false`. 

## Actual Skill discovery and usage (not inflated)

The installed ChatGPT Skill catalog returned **84 entries** at review. This counts all discoverable entries, not 84 tools invoked and not 84 project-appropriate Skills. Entrypoints used/read for this review: `skill-creator`, `using-superpowers`, `brainstorming`, `verification-before-completion`, `Evidence Engineering Research`, `writing-plans`, `test-driven-development`, `systematic-debugging`, `using-git-worktrees`, `executing-plans`, `requesting-code-review`, `receiving-code-review`, `finishing-a-development-branch`, `subagent-driven-development`, `dispatching-parallel-agents`, `agent-reach`, `zzzops/review-zzzops-policy`, `zzzops/suggest-zzzops-work`, `pr-completion/take-pr-to-completion`, and `develoop/gh-autoreview-resolve`. **Reading a future-execution Skill is not execution or approval.**

| K4 stage | Preferred capability/Skill | Evidence now | Authority/gate |
| --- | --- | --- | --- |
| Recovery and live truth | using-superpowers + GitHub native connector + Project index | GitHub main/head/state/spec+audit checked | READ_ONLY PASS |
| Draft design and specification | brainstorming | K4 written spec exists; 2026-10-09 compatibility corrections committed | USER SPEC APPROVAL PENDING |
| Prior art, algorithm/failure research | Evidence Engineering Research (agent-reach uses native GitHub/web route if externally needed) | K4 dated primary-study/maintainer/issues research and current repo implementation map; empirical SDAIA-specific interval efficacy remains unknown | RESEARCH PARTIAL; not retention proof |
| Exact implementation task plan | writing-plans | Skill read; no approved K4 plan document | **NOT AUTHORIZED before written spec approval** |
| Isolated task setup and manifests | using-git-worktrees + K4-specific state/validator | K3 state schema is K3-only; K4 not initialized | BLOCKED until spec+plan approvals and current preflight |
| Per-task build and behavioral tests | test-driven-development, executing-plans; systematic-debugging for failures | Future workflow only; no K4 RED/GREEN executed | BLOCKED |
| Subagents/review | requesting-code-review + receiving-code-review; subagent-driven-development if true runtime dispatch exists | No independent K4 review observed; current host did not expose a general-purpose subagent dispatch tool | UNVERIFIED; do not claim dispatch |
| Finish/PR/merge | verification-before-completion, finishing-a-development-branch, GitHub PR tools | Existing docs-only PR #64 remains OPEN DRAFT | Exact-head PR review/CI and explicit merge authorization required |
| Post-merge and release | actual merged-main tests, Pages live verifier, durable ledger/state | K3 verified previously; K4 not merged/deployed | BLOCKED |

### Why other installed Skills are not K4 control-plane replacements

- **ZzzOps** maintains its own goal DAG/policy/backlog and approval mechanics. Do **not** bootstrap/migrate/execute it over the existing K3/K4 `CURRENT-STATE` + Superpowers SDD/ledger; that would create competing sources of truth without a separately approved governance migration. A *read-only* future audit is optional, not required.
- **PR Completion** and **GH auto-review** can help at a later landing/reviewer gate, but must not mark this draft design PR ready, start implementation, or merge while written-spec/plan gates are unsatisfied. Connector availability is not landing permission.
- Hugging Face training, PDF, spreadsheets, slide/document template Skills, email intelligence and unrelated plugins do not match the present K4 specification gate; do not invoke them merely to increase tool count.
- **Agent Reach** has optional external CLI requirements; in this host the connected GitHub and native web/search capabilities are the available source-acquisition paths. No Agent Reach CLI execution was verified here.
- No evidence of a dedicated low-model/subagent dispatch tool in this session. When approved and such tools remain absent, `executing-plans` inline with one documented task/verification at a time is honest; review can be through actual GitHub reviews if configured.

## Review of the actual K4 design versus planned execution

The written spec has 12 sections, 18 acceptance cases, contracts for `K4.RULES.v1`, `ScheduleProjectionV1`, `RecommendationV1` and `SchedulingPreferencesV1`, plus an A–G *design sequence*. **A–G is not an approved TDD implementation plan**; the historical cross-programme roadmap is also not an implementation plan.

### Critical prerequisites for the future written implementation plan

1. **Independent K4 state authority.** K3's `current-state.schema.json` enforces `programme='K3'`. Plan a reviewed K4 manifest/schema/validator without rewriting the K3 closed proof or reusing K3 task numbers/packets.
2. **Candidate allowlist and content versioning.** Identify concrete governed public release input, family/item-version IDs, asset availability, and protected/holdout exclusion. The current public bank is shared by `full`/`section`, which is not by itself a holdout designation. Define exact fail-closed catalog-missing behavior.
3. **New non-strict browser route.** K3 `src/app.js` only starts `full`/`section` assessment paths; a one-item `practice` route, ordinary recorder flow, AR/EN UI and offline navigation must be explicitly built and tested without changing strict mock scoring.
4. **Trusted grading boundary.** Ordinary browser `recordEvaluation()` throws by design; first live K4 release is `EXPOSURE_ONLY`. An authorized-fixture `TRUSTED_GRADED` contract test is not proof that a production SYSTEM grading producer exists.
5. **Correction, clock and replay.** Handle `throughStoreSeq=0` without the nonempty K3 replay API; use immutable accepted/corrected events, quarantine conflicts, avoid stale strict graded events, and treat local `accepted_at` as untrusted device clock.
6. **Deterministic policy and outputs.** Specify concrete status/reason enum combinations, tie-break order, invalid-source behavior and exact reproducibility across locales, timezones and Node/browser. The JSON example's pipe-separated alternatives are illustrative, not actual values.
7. **Time-dependent cache validity.** A recommendation changes when `nowIso` crosses a due or snooze boundary even without a new event. The future plan MUST either omit recommendation caching initially (preferred) or prove key/expiry invalidation at each due/snooze transition. A watermark-only cache is stale.
8. **Preferences and resilience.** Atomic local snooze/dismissal revision behavior, successful-write confirmation, denied/exhausted IndexedDB, no fictitious persisted settings or changes to append-only learner events.
9. **Review workload hypothesis.** Existing 48/24/96-hour intervals are explicitly uncalibrated starting defaults. Freeze a comparison fixture and test queue/workload bounds; do not claim empirical retention benefits.
10. **Ship and rollback parity.** Verify fixed question-bank SHA, 1,120 questions, 7 domains, 200-item exam, service worker manifest, protected private paths, AR/EN RTL, accessibility, offline reload, existing exams, exact-head CI and independently reviewed PR, followed by merged-main/Pages verification.

### Spec clarification notes for reviewer (not approval)

- `reason_event_ids` has a 5-ID provenance cap and says there is a truncation indicator, but the displayed JSON shape omits the indicator. Resolve naming and contract coverage at the written-spec gate.
- `ScheduleProjectionV1.integrity_status` and recommendation `reason_code` combinations need precise admissible enum/transition rules for deterministic schema tests.
- A due-time interval can expire without source watermark changing: choose no derived recommendation cache for initial release to avoid time-based stale decisions.
- Require explicit exact public-candidate registry proof before allowing K4 to propose single-item links; do not infer public eligibility from bare content IDs.
- Neither source review nor existing GitHub CI proves that K4's new UI, scheduler, provenance, or offline conditions pass yet.

## Execution order after each separate, explicit approval

**NOW:** user reviews the exact written K4 draft spec and any remaining clarifications. No `writing-plans`, K4 product edit, task-start or implementation preflight may be claimed green now.  
**After explicit written-spec approval:** run `writing-plans` and create exact file/test/interface scoped K4 implementation tasks, with accepted RED, GREEN, regression, reviewer, branch and integration gates; request **separate plan review and execution-method choice**.  
**After explicit plan approval:** create and verify K4 state, isolated task workspace, task packets/brief digests and first preflight. Per task run TDD RED→GREEN, affected regression, scope/validator, review and durable checkpoint.  
**Release:** independently verify final exact-head CI/reviews and request a separate exact-head merge authorization. After merge rerun full tests/live Pages verification and close K4 in its own ledger. Only then open K5.

## Latest evidence/replayability

- [PR #64](https://github.com/oaabahussain/sdaia-ai-engineer/pull/64), design-only review.
- [K4 spec](../specs/2026-10-08-k4-next-best-action-spaced-practice-design.md), blob `a07de53c60cc2b6d7645c67cc3cec289c8e8e607`.
- [K4 contract audit](./2026-10-09-k4-spec-contract-audit.md).
- [K4 research](../research/2026-10-08-k4-evidence-first-discovery.md).
- Prior exact-head docs-only Quality Actions run `37849846110`: SUCCESS; server/adapter `37849846125`: SUCCESS on `32873ba...`. New document commit needs its **own** exact-head CI verification.
- Reviewer approval currently **not observed**. GitHub bot/human review submissions and threads: 0.

**Final decision:** `SPEC_REVIEW_PENDING` / `PLAN_NOT_AUTHORIZED` / `PRODUCT_CODE_BLOCKED`; continue with user-facing spec review only.

## Subsequent draft-spec clarification (same day; supersedes open ambiguities above)

**Reviewed spec correction commit:** `7ee311c8410db2396359f648126c84f50cc03244`  
**Latest reviewed spec blob:** `d732ac22161d4b007a8f869cbc928ec6737a40a8`  
**Review status:** `DRAFT_FOR_EXPLICIT_SPEC_REVIEW` unchanged. This later edit is a proposed clarification, **not** approval and **not** a K4 implementation plan.

Eight documentation-only contract clarifications were made after the baseline Skill review:
1. Disable `RecommendationV1` caching in first release; recompute when clock or preferences change, so due/snooze expiry cannot leave stale results at an unchanged watermark.
2. Correct `source-bound local` K3 store wording; it cannot claim authenticated/server identity.
3. Define the projection-level integrity enum `COMPLETE|INCOMPLETE|CONFLICTED`.
4. Bound item-level provenance to five deterministic event IDs with a named truncation boolean.
5. Replace example JSON containing strings that look like union alternatives with one concrete valid `NO_ELIGIBLE_ACTION` example.
6. Define status/reason/action combination rules and provenance truncation semantics, including trusted grading prohibited for first browser release.
7. Replace fallback navigation to non-existent `learn` browser route with actual public home navigation.
8. Add a focused regression acceptance for clock/snooze boundary without a new evidence event.

**Historical note:** the earlier list of ambiguities above reflects the pre-clarification spec blob; these items are now addressed in the **revised draft**, not open blockers by themselves. Still pending: explicit written-spec approval, plan authoring/approval, real independent K4 review, source-eligibility proof in implementation, TDD/release evidence and exact-SHA merge authorization. CI checks are keyed to commit HEAD and cannot be inferred from the old `32873ba...` runs.

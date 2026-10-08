# SDAIA K4 — Next Chat Handoff / Resume Checkpoint

**Prepared:** 2026-10-08  
**Project:** SDAIA Learning Platform / K4 Next-Best-Action & Spaced Practice  
**Handoff class:** READ-ONLY NAVIGATION + SPEC REVIEW GATE (NOT EXECUTION AUTHORITY)  
**Repo:** https://github.com/oaabahussain/sdaia-ai-engineer  
**Research PR:** https://github.com/oaabahussain/sdaia-ai-engineer/pull/64  
**Research branch:** `research/k4-design-discovery-2026-10-08`  
**Observed main when preparing:** `9e55881e9480b4a02d8ef5d92a0b21a9313492f1`  
**Spec proposal commit before handoff:** `5f35210a34dc4638f402ad20b4e7b3e19d173a39`  
**Priority:** always check fresh GitHub refs, not the SHA frozen in this dated handoff.

## 1. Truth order and actual current position

1. Live GitHub `main`, Git object graph and exact active branch; never assume this handoff's SHA is still current.
2. `PROJECT-INDEX.md` and `RECOVERY-PROTOCOL.md` (source-of-truth order and fail-closed recovery).
3. Live `docs/superpowers/state/CURRENT-STATE.json` validated at the live ref.
4. Active approved programme spec + plan **only when actually approved**, their exact blob hashes, and execution ledger/checkpoints.
5. K3 final durable ledger and post-merge verification; read its context but do not repeat K3 work.
6. This dated K4 handoff, project files, memory, and conversation are only navigation aids.

**Verified during handoff preparation:** `CURRENT-STATE.json` revision **76**, programme `K3`, phase `H`, status `COMPLETE`, completed_through_task **41**, next_task **42**, open Critical/Important **0/0**. `ACTIVE_REF_RESOLUTION_VALID=PENDING`, `low_model_ready=false`; this is a K3 **closed-state manifest**, not permission to execute K4 tasks. K4 has no approved execution manifest, no validated K4 task packets and no implementation code.

K3 reviewed implementation was merged in PR #62, and K3 administrative closure in PR #63. Current K3 closure main SHA recorded above. K4–K9 remain future distinct programmes, not previously completed.

## 2. Exact durable K4 artifacts — read instead of reconstructing

All four paths below exist on `research/k4-design-discovery-2026-10-08` and are proposed/not merged. Read their latest blob SHA from GitHub before accepting them:

1. `docs/superpowers/research/2026-10-08-k4-evidence-first-discovery.md` — [research](https://github.com/oaabahussain/sdaia-ai-engineer/blob/research/k4-design-discovery-2026-10-08/docs/superpowers/research/2026-10-08-k4-evidence-first-discovery.md), original blob `39f4402681c204447c59b99245422669de962acb`. Source study of retrieval, spacing, Anki/FSRS, maintainer issues, reuse-versus-build, cold start, candidate eligibility, falsifier, and scope limitations.
2. `docs/superpowers/research/2026-10-08-k4-k9-programme-dependency-gates.md` — [dependency gates](https://github.com/oaabahussain/sdaia-ai-engineer/blob/research/k4-design-discovery-2026-10-08/docs/superpowers/research/2026-10-08-k4-k9-programme-dependency-gates.md), blob `21e6cb9c0caefdb0a618d1a6573dadb53fd1491d`. K4 to K9 roadmap without invented completion/task counts.
3. `docs/superpowers/research/2026-10-08-k5-k9-source-survey.md` — [later-programme source survey](https://github.com/oaabahussain/sdaia-ai-engineer/blob/research/k4-design-discovery-2026-10-08/docs/superpowers/research/2026-10-08-k5-k9-source-survey.md), blob `82471e6297fa6e07ca3fb7a486cd6dbf9901eed3`. Preliminary K5/BKT, K6/psychometrics, K7/tutor, K8/CAT, K9/standards; not K5–K9 implementation evidence.
4. **`docs/superpowers/specs/2026-10-08-k4-next-best-action-spaced-practice-design.md`** — [proposed normative K4 spec](https://github.com/oaabahussain/sdaia-ai-engineer/blob/research/k4-design-discovery-2026-10-08/docs/superpowers/specs/2026-10-08-k4-next-best-action-spaced-practice-design.md), blob `8761c8a92f6e53ee90d4aed1d994ea07410393be`. **12 sections**, policy/projection/recommendation/preferences contracts, 18 acceptance cases, offline/bilingual/privacy/holdout gates, FSRS DISABLED by default and K4 execution boundary. **Status is `DRAFT_FOR_EXPLICIT_SPEC_REVIEW`: NOT approved.**

Other constitutional sources:
- `docs/superpowers/plans/2026-09-27-post-b3-platform-kernel-roadmap.md` (forward roadmap, explicitly not an implementation plan).
- `docs/superpowers/specs/2026-09-23-learning-platform-vnext-design.md` (learner model, next-action, readiness and privacy principles).
- `docs/superpowers/specs/2026-09-26-learning-platform-research-amendment.md` (spacing, retrieval, uncertainty, do-not-overclaim).
- `docs/superpowers/reviews/2026-09-28-k2-plus-research-refresh-register.md` (reuse before rebuild, K4–K9 research register).
- `docs/superpowers/specs/2026-09-29-k3-learner-evidence-engine-design.md`, `docs/superpowers/reviews/2026-09-29-k3-post-merge-verification.md`.

## 3. Verified GitHub PR and CI boundary

**PR #64**: `OPEN`, `DRAFT`, `NOT MERGED`; 0 submitted GitHub reviews and 0 review threads as of this dated handoff. Before this handoff file's commit, proposal HEAD was `5f35210a34dc4638f402ad20b4e7b3e19d173a39`, based on main `9e55881e9480b4a02d8ef5d92a0b21a9313492f1`; four research/spec files ahead, no Product modifications.

The following GitHub Actions runs were checked and reported `SUCCESS` on exactly that previous HEAD:
- [Pull request quality gate #37799540972](https://github.com/oaabahussain/sdaia-ai-engineer/actions/runs/37799540972).
- [Server and adapter contract tests #37799541334](https://github.com/oaabahussain/sdaia-ai-engineer/actions/runs/37799541334).

These are **existing-product regression/branch checks**, NOT new K4 tests; adding this handoff document advances the branch HEAD, which requires a new exact-head CI check before any PR merge or pass claim. No K4 code, RED→GREEN feature tests, independent spec approval, implementation review, K4 merge or K4 post-merge validation have occurred.

## 4. Design position; safeguards carried into next chat

Proposed direction: deterministic versioned rules for smallest useful next learning action from K3 immutable evidence and public eligible content, with optional future FSRS adapter **OFF** until independently validated four-state recall-grade semantics and benchmarking. No conversion `correct ⇒ FSRS Good`. Existing `src/evidence/recorder.js` explicitly rejects untrusted browser `recordEvaluation()` calls; do not guess graded correctness from an answer.

Reuse K3 `src/evidence/replay.js`, `src/evidence/corrections.js`, attempt/activity projections, `src/evidence/indexedDbStore.js`, and K2 QuestionFamily/ItemVersion and objective catalog. `objectives-v1` labels are migration-derived **provisional**; do not fabricate a prerequisite graph. The design proposes:
- `K4.RULES.v1` policy, `ScheduleProjectionV1`, `RecommendationV1`, local `SchedulingPreferencesV1` and a pure, deterministic ranker.
- Trust-aware `TRUSTED_GRADED` / `EXPOSURE_ONLY` / `NONE` without K5 mastery/readiness, K6 psychometrics, K8 CAT or claims of SDAIA official outcome prediction.
- Eligible, public, release-pinned items only; never expose protected mock/holdout pools, answer keys, private factory data or raw personal data.
- AR/EN, RTL/LTR, WCAG 2.2, local-first/offline, skip/snooze and clear explanation. No compulsory scheduler setting or additional framework.
- Explicit no-candidate/insufficient-evidence state, K3 corrections/STRICT mutations, deterministic UTC timestamp handling, no false scheduled due time.
- Preserve current **1,120 questions**, **7 domains**, **200-item exam** and protected question payload SHA-256 `5e48b1e47450f1150c9c8f21386f3a4e31070a3d444f968d10f45ccb9ff418a9`. Production authenticated cross-device sync was **NOT deployed/verified**.

## 5. Actual ChatGPT skills read vs applied — no inflated usage claims

**Read and used for the K4 design process:**
- `skills://plugins/superpowers/using-superpowers/skill.md` — discovery/process discipline.
- `skills://plugins/superpowers/brainstorming/skill.md` — classified K4 architectural; design options and written design review boundary.
- `skills://evidence-engineering-research/skill.md` and relevant references (research-protocol, runtime-portability, weak-model-execution, reverse-engineering, source-map, decision-gate) — evidence/reuse/failure investigation; some material research gaps remain.
- `skills://plugins/superpowers/verification-before-completion/skill.md` — claims tied to GitHub SHA and actual CI conclusions; GitHub connector used.

**Read for future usage; NOT executed for K4 Product:**
- `skills://plugins/superpowers/writing-plans/skill.md`: instructions read, but the K4 implementation plan was NOT authored because written K4 spec approval has not happened.
- `test-driven-development`, `executing-plans`, `using-git-worktrees`, `systematic-debugging`, `requesting-code-review`, `finishing-a-development-branch`, `take-pr-to-completion` are required when their conditions arise; used in earlier K3 work when relevant but **NOT a claim that K4 code, TDD or a K4 reviewer occurred**.
- Do not claim every installed ChatGPT Skill has been read or invoked. Use the appropriate Skills when their trigger matches the actual next action; separate `READ`, `INVOKED`, `TESTED`, `APPROVED`.

## 6. Resume workflow; enforce the first missing gate

1. List/read applicable Superpowers and Evidence Engineering skills **fresh**, do not rely on remembered versions; inspect connected GitHub tools and Project assets.
2. Resolve LIVE `main`, branch `research/k4-design-discovery-2026-10-08`, PR #64, current `CURRENT-STATE`, spec/research blob SHAs, CI by **actual** current PR head. Check main drift, PR review threads and whether a design approval appears in the new user request.
3. Present the **written K4 spec** for explicit user review/approval or incorporate requested changes. User's earlier generic permission to finish K4 is goal-level authorization, **NOT approval of a later written spec**.
4. **Only after explicit approval of the written spec**, invoke `superpowers:writing-plans` to write a detailed, exact K4 implementation plan, with one test cycle per independently reviewable task, deterministic scope/RED/GREEN, later CI/postmerge checks. Present the plan for explicit review and execution-method selection.
5. **Only after plan approval**, bind new K4 state/manifests/branch/worktrees and preflight against current main; do not recycle K3's closed `CURRENT-STATE` as K4 task authority.
6. Execute sequential TDD tasks; fail on any RED/GREEN/regression/scope/reviewer/CI mismatch, use systematic-debugging, do not increase timeouts or weaken tests. Strong audit for correctness/FSRS overclaims, correction replay and unsafe item leakage.
7. At final code head: full node/server/process/service-worker/content bank/browser AR/EN RTL/offline/Pages CI and independent review where available. Merge only with exact-SHA user approval and permissions; then verify actual merged `main` and deployed Pages, record K4 closeout in durable state and ledger.
8. Begin K5 only after K4 merged/postmerge verified and separately approved K5 design and plan. K5–K9 are not part of the current design approval.

**Hard stop:** If `CURRENT-STATE` or Git ref drift, approved-spec/plan hash missing, failed test, unclear protected-content authorization, or reviewer Critical/Important finding: stop and document. Neither `PR #64` nor its handoff is permission to deploy.

## 7. Ready-to-paste new-chat opening

> استأنف مشروع SDAIA K4 من ملفات ChatGPT Project وGitHub، واجعل المصدر المعتمد GitHub CURRENT-STATE والـcommits والمواصفات، لا ذاكرة المحادثة. اقرأ PROJECT-INDEX وRECOVERY-PROTOCOL ثم PR #64 وملفات بحث K4 والمواصفات المقترحة المؤرخة 2026-10-08 وهاند أوف K4. تحقق من main وPR head والـgates وCI أولًا، واستخدم Superpowers وEvidence Engineering Research المناسبة. نحن عند مراجعة/اعتماد مواصفات K4، وليس تنفيذ الكود. لا تعد بناء K3، ولا تتجاوز موافقة المواصفات ثم موافقة خطة TDD، ولا تعتبر الأبحاث اختبارات K4. بعد اجتياز البوابات نكمل تنفيذ K4 واختباره ومراجعته ودمجه والتحقق بعد الدمج، مع توثيق كل خطوة دائمًا. لا تبدأ K5 قبل إغلاق K4.

**Latest authorized next step:** review/approve the existing written spec. If the user approves it explicitly in their next message, proceed to `writing-plans`, not implementation code.

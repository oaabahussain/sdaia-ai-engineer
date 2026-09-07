# Analyze Report: Public-Readiness Foundation

Date: 2026-09-07
Scope: constitution, specification, research, data model, contracts, plan, tasks
Result: READY FOR OWNER REVIEW; implementation remains prohibited

## Analyze summary

Critical constitution violations in the pre-implementation artifacts: 0
Unresolved high-severity specification conflicts: 0
Owner decisions still required before/during later implementation: 8
Known production/runtime defects intentionally not fixed in this phase: yes

The repository main baseline inspected for this package is 059b90fca83d20b950b5c83e751a55180387fd53. The baseline src/app.js still calls migrateState before initializing const nowIso and uuidV4, so the owner-reported temporal-dead-zone defect is consistent with the repository state. The pre-implementation branch intentionally does not modify src/app.js.

## Consistency review — conflict resolutions

Conflict 1 — Owner orders immediate hotfix vs approved pre-implementation stop
Sources in conflict:
- Public-readiness spec: Task 0 says apply corrected src/app.js before anything else.
- Current owner instruction: complete Spec Kit pre-implementation end to end and STOP before implementation; “not even the known Level 0 hotfix.”
Resolution:
- Current owner instruction is later and explicit; no hotfix is applied on pre-implementation branch.
- T0001 is first implementation task after review.
Reason:
- Preserves specification-driven workflow and obeys explicit stop condition.
Status: RESOLVED

Conflict 2 — Baseline release was previously described as green vs real-browser failure
Sources in conflict:
- Existing repository CI/preflight can be green.
- Owner-provided independent browser evidence reports TDZ ReferenceError, no saved state, no service-worker registration, and dead entry action.
Resolution:
- Browser execution becomes a release gate; syntax/unit/static checks remain necessary but insufficient.
Reason:
- The failure is runtime ordering, not parse syntax, so browser execution is the evidence class that can detect it.
Status: RESOLVED

Conflict 3 — data-testid-only selectors vs accessibility-first testing
Sources in conflict:
- Public-readiness spec: tests select by testid only.
- Project direction/modern testing practice: prefer role/accessibility-name locators; add testid when semantic selection is insufficient.
Resolution:
- Semantic locators first; stable testids required for generated/ambiguous controls.
Reason:
- This improves accessibility and test resilience while still providing deterministic selectors for repeated option/session controls.
Status: RESOLVED

Conflict 4 — Automatic rollback requirement vs unverified rollback mechanism
Sources in conflict:
- Public-readiness spec: post-deploy failure automatically redeploys previous artifact.
- Owner-approved planning amendment: do not promise automatic rollback if it cannot be made reliable.
Resolution:
- Initial implementation must fail red, record the last known-good release, and expose a tested rollback procedure.
- Automatic rollback is a later improvement only after deterministic proof.
Reason:
- An untested rollback mechanism creates a second production risk during failure handling.
Status: RESOLVED

Conflict 5 — Exactly four options vs 2026 distractor-quality evidence
Sources in conflict:
- Owner amendment: four options required, provisional.
- 2026 randomized research: distractor quality can matter more than distractor quantity and fewer well-functioning distractors can perform comparably.
Resolution:
- Four options remains a PROVISIONAL engineering gate through 2026-10-07, not a claim of psychometric optimality.
- Any change requires measured data and recorded rationale.
Reason:
- Obeys owner gate while preserving scientific uncertainty.
Status: RESOLVED

Conflict 6 — Hard numeric content heuristics vs assessment validity
Sources in conflict:
- Public-readiness spec proposes answer-index <=35%, longest-correct <=40%, option >=12 characters, definition count <=15.
- Current assessment research supports flaw detection, plausible distractors, blueprinting, structured review, and empirical analysis, but not those exact constants as universal validity thresholds.
Resolution:
- Thresholds retained as provisional anti-pattern gates.
- Future measured item-response data is required to change/validate them.
Reason:
- Prevents heuristics from being mislabeled as psychometric truth.
Status: RESOLVED

Conflict 7 — AI/vendor deny list vs legitimate AI-engineering education
Sources in conflict:
- Public-readiness copy deny list includes Claude, ChatGPT, GPT, OpenAI.
- Product is an AI-engineering study app where vendor/model terminology can be legitimate technical content.
Resolution:
- Deny list applies to UI chrome/About/developer residue, not educational bank/learn/case content.
Reason:
- Removes internal development artifacts without censoring legitimate exam-relevant terminology.
Status: RESOLVED

Conflict 8 — “No version anywhere in UI” vs approved About version footer
Sources in conflict:
- Public-readiness cleanup says no version in title/header.
- Same spec allows About footer “الإصدار 6.0”.
Resolution:
- No version in normal chrome/title/header/changelog; About may show the single approved public version footer.
Reason:
- This is internally consistent once scope is explicit.
Status: RESOLVED

Conflict 9 — Current bank count 121 vs Level-6 target 142
Sources in conflict:
- Early E2E requirements assert landing shows 121.
- Content rewrite asks to add 21 flagship questions, producing 142.
Resolution:
- Level-3 tests before content rewrite assert current release count 121.
- After Level 6, bank-count assertions and public statistics must use the release bank count (expected 142 if all 21 additions are accepted).
Reason:
- Tests must reflect the feature level being released rather than freezing a pre-rewrite count forever.
Status: RESOLVED

Conflict 10 — Random 60-question answer-position audit vs deterministic release gate
Sources in conflict:
- Public-readiness spec asks to answer 60 random questions and assert no correct-option index exceeds 35%.
- A random sample can violate the threshold by chance even when the full bank meets it.
Resolution:
- Full-bank static distribution is authoritative.
- Runtime test uses a deterministic seeded sample to verify rendered answer mapping and detect implementation bias.
Reason:
- Removes probabilistic CI flakiness without weakening the actual content-distribution gate.
Status: RESOLVED

Conflict 11 — Sessions 14/15 stored qs empty vs E2E must prove population
Sources in conflict:
- Data design intentionally composes adaptive/mixed sessions at runtime.
- Static validation could incorrectly interpret empty qs as missing content.
Resolution:
- Empty stored qs remain allowed specifically for sessions 14/15.
- Runtime E2E must prove non-empty valid composition.
Reason:
- The runtime composition is a feature, not a data defect.
Status: RESOLVED

Conflict 12 — Service worker as PWA install requirement vs modern Safari behavior
Sources in conflict:
- Generic PWA terminology often equates service worker with installability.
- Safari/iOS 26 allows sites to be added as web apps without a service worker; service workers primarily improve offline/reliability capabilities.
Resolution:
- Do not use service-worker presence as proof of Safari installability.
- Test service-worker registration/offline behavior separately.
Reason:
- Aligns product claims with current Safari behavior.
Status: RESOLVED

Conflict 13 — WebKit automation vs “Safari iOS tested” language
Sources in conflict:
- Playwright supports WebKit.
- Physical iOS Safari includes OS/device integration not proven by desktop/headless WebKit automation.
Resolution:
- Automated WebKit evidence and physical iPhone Safari evidence are separate report columns/statuses.
Reason:
- Prevents false verification claims.
Status: RESOLVED

Conflict 14 — Server-ready foundation has test-only FastAPI vs public-readiness backend-free product
Sources in conflict:
- Existing server-ready work defines API/server skeleton.
- Current public product must run with zero deployed backend.
Resolution:
- Server code remains test-only and contract/reference infrastructure.
- No server deployment is included in Levels 0–8 unless separately specified.
Reason:
- Preserves current deployment simplicity while retaining future extensibility.
Status: RESOLVED

Conflict 15 — Issue Form custom-field prefill assumptions
Sources in conflict:
- Earlier spec expects URL query params to prefill question_id/issue_type fields in GitHub Issue Forms.
- GitHub Issue Forms do not provide a dependable arbitrary custom-field prefill contract equivalent to HTML forms.
Resolution:
- Future E2E verifies the report URL/title/template/labels/question metadata that GitHub actually supports; no false claim that custom form controls are guaranteed prefilled.
Reason:
- Test the real integration contract rather than an unsupported assumption.
Status: RESOLVED

Conflict 16 — Every learn topic >=4 questions vs current blueprint unknown at plan time
Sources in conflict:
- Public-readiness content gate proposes >=4 questions per learn topic.
- No measured current per-topic distribution was produced during this no-data-edit pre-implementation phase.
Resolution:
- T0504 measures the inventory before enabling this as a blocking gate.
- If infeasible, implementation must stop for owner decision rather than silently relax or remap content.
Reason:
- This threshold was not included in the owner’s explicit provisional amendment and needs measured feasibility.
Status: RESOLVED

Conflict 17 — Lighthouse all categories >=90 vs measure-first performance policy
Sources in conflict:
- Public-readiness spec sets >=90 for Performance, Accessibility, Best Practices, PWA.
- The owner’s broader working method requires evidence before arbitrary gates; PWA scoring/audits also evolve across Lighthouse versions.
Resolution:
- Lighthouse evidence is mandatory, but the first implementation measures baseline before hard performance thresholds are adopted.
- Accessibility has separate semantic/axe gates regardless of Lighthouse score.
Reason:
- Avoids copying a number without baseline/applicability evidence.
Status: RESOLVED

## Coverage analysis

Constitution -> specification coverage:
- Specification-before-code: FR-030 and entire pre-implementation stop condition.
- Evidence-before-claims: FR-012, FR-013, FR-017, FR-027.
- Research freshness/diversity: research.md covers three foundation decisions.
- Public/private separation: FR-002 through FR-004 and public-copy requirements.
- Privacy/identity: FR-005 through FR-010.
- Layering: FR-011 and architecture plan.
- Content integrity: FR-020 through FR-026.
- Release discipline: FR-012, FR-018, FR-019 and Level-8 plan.
- Accessibility/performance/offline: FR-016, FR-028, FR-029.

Specification -> tasks coverage:
- Runtime/browser: T0001–T0004, T0301–T0322.
- State/foundation: T0101–T0104.
- Public copy: T0201–T0206.
- PWA/offline: T0401–T0404.
- Content gates: T0501–T0505.
- Content rewrite: T0601–T0605.
- Future identity/community: T0701–T0703.
- Release/report: T0801–T0805.

Unmapped MUST requirements: none identified.
Tasks with no specification basis: none identified.

## Quality gates and release pipeline consistency

Planned gate sequence is consistent across constitution, spec, plan, tasks, and release-evidence contract:
validate -> unit logic -> adapters/contracts -> build -> service-worker asset check -> local browser E2E -> copy/accessibility -> deploy -> live smoke -> hash/live asset verification -> readiness report.

Known deliberate exception:
- automatic rollback is not a first-implementation MUST because it is not yet proven deterministic.

## Risks

R1 — Production baseline is currently reported/believed broken by TDZ startup ordering.
Impact: Critical user-facing failure until Level 0 implementation.
Mitigation: T0001–T0004 are first implementation work; no other feature work before browser smoke green.

R2 — Browser E2E could become slow/flaky if the full matrix is implemented without deterministic clocks/seeds/state fixtures.
Impact: Release friction and ignored failures.
Mitigation: Shared fixtures, seeded randomization, controlled clock, explicit engine applicability, no arbitrary sleeps.

R3 — Playwright WebKit can create false confidence about physical iOS Safari.
Impact: Misleading PWA claim.
Mitigation: Separate evidence class and explicit MISSING label for physical device.

R4 — Service-worker cache bugs can preserve stale broken builds.
Impact: Returning users remain broken after deploy.
Mitigation: cache-version/update tests and last-known-good rollback procedure.

R5 — Numeric content heuristics can encourage “passing the validator” rather than improving assessment validity.
Impact: Superficially balanced but weak questions.
Mitigation: provisional labels, plausible distractor review, blueprint review, empirical post-use metrics, needs_review.

R6 — AI-assisted bulk rewriting can introduce subtle technical errors/automation bias.
Impact: Incorrect study content.
Mitigation: structured gate, independent technical review, no guessed claim, explicit needs_review list.

R7 — Future comments/ratings can introduce abuse, moderation, privacy, and storage obligations.
Impact: Product/security scope explosion.
Mitigation: contracts only now; separate feature before activation.

R8 — Future identity provider choice can create vendor lock-in or region/recovery constraints.
Impact: costly migration or inaccessible users.
Mitigation: provider-neutral boundary and later provider matrix.

R9 — Repository dev dependencies currently have known audit findings from prior work.
Impact: CI/toolchain supply-chain risk, mostly not shipped browser code.
Mitigation: handle in separate dependency housekeeping work; do not mix with public-readiness runtime/content commits.

R10 — Three-working-day pre-implementation timebox may be insufficient for perfect external research breadth.
Impact: incomplete evidence matrix.
Mitigation: current package captures 10+ independent source families and identifies any undated current docs; no implementation starts merely because timebox expires.

## Unknowns

U1. Official SDAIA question count is unknown from verified official material available to this project.
U2. Official exam duration is unknown.
U3. Official passing score is unknown.
U4. Official coding/lab component is unknown.
U5. Physical iPhone Safari behavior for the next implementation is unverified until a real device test is supplied/performed.
U6. Future authentication provider is undecided.
U7. Future account-link merge policy is undecided.
U8. Future ratings scale is undecided.
U9. Future comments moderation/retention policy is undecided.
U10. Current real-learner psychometric item statistics do not exist in the public static product.
U11. Exact optimal content-gate thresholds are unknown; current values are provisional.
U12. Whether every learn topic can satisfy >=4 items without harming blueprint quality must be measured at Level 5.

## External blockers — owner-controlled actions

B1. A real iPhone/Safari verification requires access to a physical iPhone or owner-supplied evidence.
B2. Future authentication requires the owner to select/authorize an identity provider and any paid account/project.
B3. Future LLM review workflow requires repository variables/secrets; no secret may be pasted into public docs/chat/source.
B4. Branch-protection/ruleset administration may require owner GitHub settings access not available to a managed connector.
B5. Community comments/ratings require owner product decisions on moderation, privacy, retention, and acceptable-use policy.
B6. Official exam-format claims require newer official SDAIA evidence supplied or independently verified; the project must not infer them.

## Owner decisions required

1. Should Level 0 be the first implementation immediately after review?
Recommended answer: YES. The baseline runtime defect is user-blocking and must precede all cleanup/content work.

2. Should the project retain the single About footer version “الإصدار 6.0” while removing version labels elsewhere?
Recommended answer: YES. One quiet About version is useful operationally and does not clutter the study experience.

3. Should semantic accessibility locators take precedence over mandatory testid-only tests?
Recommended answer: YES. Use role/name first and testid for generated/ambiguous controls.

4. Should four options remain required despite current research showing distractor quality matters more than quantity?
Recommended answer: YES for the first rewrite because it is owner-approved, but keep it PROVISIONAL and review with measured data on 2026-10-07.

5. Should an automatic rollback be implemented in the first public-readiness release?
Recommended answer: NO. First build a tested manual/controlled rollback and add automation only after deterministic proof.

6. Should comments and ratings be implemented in this public-readiness feature?
Recommended answer: NO. Keep contracts only; create a separate community feature after auth/moderation/privacy decisions.

7. Should login be implemented in this public-readiness feature?
Recommended answer: NO. Preserve anonymous local study; create a separate authentication feature using a managed passkey/WebAuthn-capable provider.

8. Should content rewrite wait until runtime/browser/PWA gates are stable?
Recommended answer: YES. Runtime reliability and quality measurement must exist before the 121-item rewrite and 21-item expansion.

## Analyze conclusion

The pre-implementation artifacts are internally consistent after the resolutions above. No implementation is authorized by this report. The only critical product condition identified is the known baseline runtime startup defect, which is intentionally queued as Level 0 rather than fixed in this documentation-only phase.

READY FOR REVIEW — implementation not started

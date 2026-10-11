# K4 Initial Public Release — Exposure-Only Scope Amendment

**Status:** PROPOSED_FOR_EXPLICIT_DOCUMENT_REVIEW (not yet an approved normative change)  
**Program:** K4, Task 14 closure; NO K5 authorization  
**Supersedes:** No approved K4 spec or plan until this specific document is explicitly reviewed and approved  
**Base product PR:** #65, initial proposal head `c8d428905fdae6754a8c21802f6d4a4d0bace74c`  
**Evidence source:** GitHub exact code, CI, source inventory and independent reviews

## 1. Intent and scope-direction provenance

The user responded `ممتاز كمل` on 2026-10-10T21:53:19Z after being asked whether K4's first release should be limited to general public `EXPOSURE_ONLY` practice and whether trusted SYSTEM grading and unused protected inventory should be deferred to a separately governed scope. Interpret that reply as **authorization to prepare and review this written scope amendment**, not approval of its unseen text, a waiver of acceptance tests, or permission to merge PR #65.

**In scope now:** deterministic one-public-item K4 practice, source-validated K3 local exposure history, verified public bank of 1,120 items in seven domains, local preference controls, one-transaction start+present commit, English/Arabic, offline/browser, recovery from storage denial, all existing strict K3 full/section exams unchanged.

**Not in this initial release:** authenticated SYSTEM-issued grading, trusted correctness/graded scheduling, readiness/mastery/official outcomes, FSRS optimization, remotely authenticated learner identity, private/hidden holdout questions or any server-only assessment product. The absence of a trusted producer is not a test PASS.

## 2. Proposed AC-02 disposition: DEFERRED_BY_APPROVED_SCOPE, never PASS

For the first **public exposure-only** K4 release, enforce this contract:
- A browser response or local K3 event, regardless of `authority_ref`, is not authenticated SYSTEM correctness and must never be promoted to `TRUSTED_GRADED`.
- Expose only `EXPOSURE_ONLY`, `NONE` or fail-closed recommendation evidence, using the defined public K4 rule intervals; no score-based rank or calibration claim.
- Existing trusted-grade arithmetic unit tests are contract coverage only, not genuine producer integration tests.
- The originally requested AC-02 authenticated SYSTEM producer and genuine signed/authorized fixture become a **separate blocked future scope**. Before activation, require producer identity/authentication, authorization, replay/correction and safety proofs, frozen representative fixture, explicit design and plan review, RED→GREEN tests and independent approval.

**Decision label for original AC-02:** `NOT_APPLICABLE_INITIAL_PUBLIC_EXPOSURE_ONLY_SCOPE_PENDING_APPROVAL`; never rewrite the historical AC-02 result as passed.

## 3. Proposed AC-09 disposition: public verified, external protected inventory deferred

The accepted `docs/decisions/0003-public-vs-protected-content-boundary.md` classifies the shipped browser Question bank as PUBLIC. No protected corpus can be considered secret once included in Pages. For this first release:
- Require exact 1,120 public factory/catalog identity reconciliation, current Pages allowlist/exclusion tests and a synthetic protected-sibling negative test, with build evidence linked to the candidate SHA.
- Do not imply that synthetic protected siblings prove isolation of a real external holdout corpus.
- Real, authorized **off-repository private holdout inventory** has not been furnished for this project and is **not part of the initial all-public browser-bank deliverable**.
- Any future protected exam/holdout release must have a controlled server-side design with authenticated authorization and an independently supplied non-content-leaking inventory/provenance manifest; never import private content into the public repo or client.
- If a real protected corpus is discovered relevant to this K4 release before landing, stop and audit its exclusion instead of relying on this scope statement.

**Decision labels:** `AC09_PUBLIC_RELEASE_PROVEN` for tested public boundary; `AC09_EXTERNAL_PROTECTED_INVENTORY_NOT_APPLICABLE_PENDING_APPROVAL` for currently nonexistent/not-provided external inventory.

## 4. Non-waivable K4 release gates

- No weakening of AC-01, AC-03–08, AC-10–18 where applicable; AC-13 physical Chromium quota remains CI-specific evidence, not universal browser certification.
- Retain K3 CLOSED/COMPLETE state unchanged, K4 `REVIEW` until merged-main and live Pages verification. Preserve original spec/plan blob hashes and approved history; add this amendment only after explicit written approval.
- AC-17 requires independent Codex review and both CI workflows **at final full SHA**, including this documentation amendment.
- AC-18 requires a separate affirmative owner approval that explicitly identifies the final **full 40-character SHA**, PR #65 and intended merge action/method. This scope-direction reply is not that approval.
- After authorized integration, verify the actual merge commit, production main CI, Pages deploy commit and remote asset digests; only then update K4 state to COMPLETE. No K5 implementation beforehand.

## 5. Review evidence and scope-risk focus

Initial PR #65 product head `c8d428905fdae6754a8c21802f6d4a4d0bace74c` was green: Quality #38066692598, Server #38066692592. Independent Codex found no major issues twice on that head, comments #6099574428 and #6099994761, and 20 review threads were resolved. **Committing this proposal creates a new SHA and invalidates exact-HEAD AC-17 until it receives fresh CI/review**.

Review questions: Is the scope boundary legally/technically clear? Does an existing spec acceptance statement require amendment rather than a conditional applicability ruling? Does any real protected inventory actually exist? Can any runtime path falsely promote local response to verified SYSTEM grading? Can the application honestly be shipped without that deferred grading capability?

## 6. Approval boundary

**Approval is requested for this exact written amendment**, including the explicitly named acceptance reclassification; the previous conversational `ممتاز كمل` does not approve unseen text. Until affirmative review of this document:
- Preserve AC-02 and AC-09 external portions as BLOCKED.
- Do not mark Task14 or K4 COMPLETE.
- Do not merge, deploy or start K5.

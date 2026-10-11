# ChatGPT Sequential Execution & Recovery Guard — 2026-10-11

**Scope:** SDAIA programme work in ChatGPT with GitHub connector and Superpowers. This is a process checkpoint, not authorization to override repository protections, make unattended background promises, or begin K5.

## Why work stopped early

1. A successful intermediate gate (product merge, CI, Pages, PR creation) was mistaken for completion of the entire phase.
2. Some actions were blocked by connector safety checks; a blocked attempt was repeated or reported without checking alternate authorized routes.
3. Closure records were changed without first checking the actual JSON schema and preflight validator; this caused avoidable red CI.
4. The first corrected closure CI still failed because the four-gate schema rejected new fields. A passing branch CI then hid a different post-merge defect: pinned immutable release SHA was compared to the advancing `main` SHA.
5. Independent reviews are SHA-bound. A review of a superseded head is not approval of the latest head.
6. ChatGPT turns are finite; without an automation, a running GitHub review cannot be monitored after the response ends. Do not promise invisible continued work.

## Required bounded continuation loop

1. **Restore:** read live PR/head/main, durable K3/K4 state, approved spec/plan and ledger. Never infer live status from chat history.
2. **Select:** take the first incomplete item in the current phase's exit checklist. Do not repeat already-proven work.
3. **Preflight:** run applicable Superpowers skills, confirm permissions, current head, expected base, schema and safety gates.
4. **Execute:** make one bounded change or group of independently verifiable changes; do not mutate protected main directly.
5. **Verify:** read exact-head CI, logs and reviewer findings; investigate root causes before changing code. Verify post-merge conditions against the *new* main SHA and actual live Pages.
6. **Recover:** if a tool call is blocked, distinguish policy restriction, missing credential, pending asynchronous review and transient error. Try another **permitted** route; never bypass protections or claim a failed action succeeded.
7. **Continue:** after each PASS, advance to the next incomplete gate. After FAIL, repair and rerun. Do not end the work merely because an intermediate result was green.
8. **Stop only when:** all phase exit gates are proved and durable state is persisted, or a real external blocker remains (new per-PR exact-head merge authorization, required reviewer not yet finished, denied credentials, hard tool restriction, safety gate failure, or finite execution window). Record blocker, evidence, exact next action and stable head in PR/repository.
9. **No false background promise:** after a response ends, resume only on a new user turn or an explicitly created scheduled automation.

## K4 specific closure gates

- Product PR #65 merged at source head `bcddca06604c5e107deb98f924d829337044405c`; immutable release merge SHA `6067cac99af669bce16147edc028c71702cf4112`.
- Actual product `main` tests and live Pages deployment verified (see `docs/superpowers/reviews/k4-post-merge-verification.md`).
- Closure PR #66 must pass exact-head CI, independent Codex review and 0 unresolved findings. Request fresh review after **every** head change.
- Closure PR #66 requires **separate** owner authorization identifying its final full 40-character SHA and intended protected merge. Approval of PR #65 does not transfer.
- After closure PR merges, verify K4 manifest `COMPLETE` in **actual new main** and confirm immutable product release SHA is an ancestor of that new main; recheck main CI and Pages. Keep K3 unchanged.
- No K5 until K4 is durably and independently closed.

## Output contract for each work turn

Report `completed`, `verified`, `pending`, `blocked`, `exact head SHA`, and `next executable action`. Never use percentage-of-completion claims unsupported by gates.

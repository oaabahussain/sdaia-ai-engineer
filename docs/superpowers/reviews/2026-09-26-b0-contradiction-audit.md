# B0 Contradiction Audit

**Date:** 2026-09-26  
**Branch:** `design/b0-governance-research-sync`

## Task 24 — Programme A state contradictions

### Scan terms

- `Draft`
- `unmerged`
- `not merged`
- `PR #7`
- `owner review/merge decision`

### Result

**PASS after one targeted correction.**

The scan originally found stale current-state text in `HANDOFF.md`:

- Programme A described as `Unreleased / unmerged`;
- startup instructions saying to start Task 12;
- startup instructions saying to keep PR #7 Draft/unmerged.

Those current-state claims were removed and protected by `tests/b0-governance-contract.test.js`.

Remaining matches are intentionally historical or conditional:

- `docs/superpowers/reviews/2026-09-23-programme-a-final-review.md` records the pre-merge state at the time of the original review and now carries a post-merge addendum;
- the accepted constitution uses the generic lifecycle word `draft`;
- the B0 design spec describes the stale-state problem and specifies creating a Draft B0 PR;
- the handoff conditionally says to finish/verify B0 if it has not merged yet.

No current Programme A status now claims PR #7 is still Draft/unmerged.

## Task 25 — Research/current-implementation boundaries

### Scan themes

- `14,000+`
- official SDAIA claims
- `project-reference-unverified`
- AI tutor
- adaptive learning
- psychometrics / calibration

### Result

**PASS — no current/future boundary violation found.**

Observed current-state language remains correct:

- README states the current runtime is 1,120 items and 14,000+ is future work;
- README and handoff preserve `project-reference-unverified` for SDAIA exam-rule metadata;
- original evidence appendix explicitly forbids calling the current weights official;
- the imported constitution describes 14,000+ as a target/strategy and delays psychometric claims until real data;
- the B0 spec explicitly says B0 does not implement adaptive learning, AI tutor, psychometrics or 14,000+ expansion;
- the B0 evidence ledger says no current official SDAIA source confirms the project-reference exam profile;
- the research amendment explicitly marks 14,000+ as future capacity, requires real response data before psychometric calibration claims, and preserves `project-reference-unverified`.

## Conclusion

The B0 governance branch has no unresolved material contradiction in:
- Programme A merge/deployment status;
- current vs future feature status;
- SDAIA evidence status;
- community-signal/prevalence distinction.

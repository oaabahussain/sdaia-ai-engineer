# K3 Post-Merge Finding — Exact Interoperability Import Context

**Date:** 2026-10-07
**Severity:** Important / P1
**Status:** CLOSED / POST-MERGE VERIFIED

## Finding

The merged xAPI and Caliper import adapters require explicit K3 context, but before this fix they did not prove that the external record's item/attempt namespace actually matched that supplied context.

That allowed a caller with an explicit context object to canonicalize an external response whose standard-level object or attempt/registration referred to a different item or attempt.

## Required behavior

Canonical import must fail closed unless the external record agrees with the supplied governed K3 context:

- xAPI object ID must equal the governed K3 item IRI for `context.item_version_id`;
- xAPI registration must equal the strict K3 `assessment_attempt_id`;
- Caliper object ID must equal the governed K3 AssessmentItem IRI;
- Caliper target must be the governed Attempt IRI for the K3 attempt.

This is not a request to infer K3 context from external IDs. The supplied K3 context remains authoritative; the external record is only checked for consistency. xAPI actor account homePage may be an external namespace; canonicalization still requires a pseudonymous account name matching the governed learner context.

## TDD boundary

RED tests are added before Product edits. Closure evidence:
1. RED quality #953 reproduced exactly two identity-context failures (812 PASS / 2 FAIL).
2. xAPI/Caliper adapters now reject mismatched or missing external item/attempt identities before canonicalization.
3. Review hardening requires conflicts to be explicit rejections rather than staged retry records.
4. Final PR quality #956 and server/adapter #2088 passed.
5. Post-merge Pages/live #52 and server/adapter #2089 passed.
6. Task 34 may proceed only after this closure checkpoint is itself validated and merged.

RED trigger head is intentionally documentation-only before Product repair.

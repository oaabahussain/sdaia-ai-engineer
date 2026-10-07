# K3 Post-Merge Finding — Exact Interoperability Import Context

**Date:** 2026-10-07
**Severity:** Important / P1
**Status:** CLOSED / FIX GREEN / Task 34 BLOCKED UNTIL POST-MERGE VERIFY

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

RED tests are added before Product edits. Task 34 remains blocked until:
1. RED reproduces the mismatch;
2. xAPI/Caliper adapters reject mismatches;
3. full regression/Pages/browser/server gates are green;
4. CURRENT-STATE returns to PHASE_GATE with zero Important findings.

RED trigger head is intentionally documentation-only before Product repair.


## Closure evidence

- RED quality #953: 814 total / 812 PASS / 2 FAIL, exactly the xAPI and Caliper identity-context mismatch regressions.
- Server/adapter #2085: PASS during RED.
- First GREEN attempt #954 exposed one over-constraint: xAPI external actor account `homePage` is an interoperability namespace and must not be forced to the internal K3 namespace.
- Corrected GREEN head preserved pseudonymous actor matching while constraining governed item + registration/attempt identity.
- Reviewer P1: missing external identities must reject, not only alternate mismatched identities — fixed.
- Reviewer P2: explicit identity conflicts must be permanent rejections, not staged retry records — fixed.
- Final head `4d695715c32f75c4cc7c952c3fe6047e7a83441e`:
  - Quality #956 PASS;
  - Server/Adapter #2088 PASS;
  - review threads: 0 unresolved.

The Important finding is closed on the review branch. Task 34 remains blocked until this exact reviewed fix is merged to `main` and post-merge verification passes.

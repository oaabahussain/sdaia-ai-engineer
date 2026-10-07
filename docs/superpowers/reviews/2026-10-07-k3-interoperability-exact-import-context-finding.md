# K3 Post-Merge Finding — Exact Interoperability Import Context

**Date:** 2026-10-07
**Severity:** Important / P1
**Status:** OPEN RED / Task 34 BLOCKED

## Finding

The merged xAPI and Caliper import adapters require explicit K3 context, but before this fix they did not prove that the external record's item/attempt namespace actually matched that supplied context.

That allowed a caller with an explicit context object to canonicalize an external response whose standard-level object or attempt/registration referred to a different item or attempt.

## Required behavior

Canonical import must fail closed unless the external record agrees with the supplied governed K3 context:

- xAPI actor account namespace must equal the governed actor account home page;
- xAPI object ID must equal the governed K3 item IRI for `context.item_version_id`;
- xAPI registration must equal the strict K3 `assessment_attempt_id`;
- Caliper object ID must equal the governed K3 AssessmentItem IRI;
- Caliper target must be the governed Attempt IRI for the K3 attempt.

This is not a request to infer K3 context from external IDs. The supplied K3 context remains authoritative; the external record is only checked for consistency.

## TDD boundary

RED tests are added before Product edits. Task 34 remains blocked until:
1. RED reproduces the mismatch;
2. xAPI/Caliper adapters reject mismatches;
3. full regression/Pages/browser/server gates are green;
4. CURRENT-STATE returns to PHASE_GATE with zero Important findings.

RED trigger head is intentionally documentation-only before Product repair.

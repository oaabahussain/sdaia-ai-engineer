# K3 Interoperability Exact-Import Context Closure

**Date:** 2026-10-07  
**Status:** CLOSED / POST-MERGE VERIFIED  
**Programme:** K3 — Learner Evidence Engine  
**Phase:** G — Interoperability and governed bridges  
**Finding:** post-merge Important finding after Tasks 31–33  
**Finding base main:** `90c0e267ab0e490c67a1aef98b0f0cf0c3c6f21a`  
**Fix merge:** `a43e102893cf7550d81133f61909821a39c98f93`

## Root cause

The xAPI and Caliper canonical import paths required an explicit K3 context, but the pre-fix implementation did not prove that the external standard-level item and assessment-attempt identities agreed with that supplied governed context.

Therefore an external response could carry a different item or attempt/registration while still being canonicalized under the caller-supplied K3 IDs.

## RED evidence

Corrective branch:
`impl/k3-interoperability-exact-import-context`

RED quality #953:
- Node total: 814;
- PASS: 812;
- FAIL: 2;
- failures were exactly the new xAPI and Caliper external identity/context mismatch tests;
- server/adapter #2085: PASS.

The RED proved both adapters canonicalized mismatched external item/attempt identity before the fix.

## Product correction

xAPI:
- supplied K3 context remains authoritative;
- external xAPI object must equal the governed item IRI for `context.item_version_id`;
- strict section/mock registration must equal `context.assessment_attempt_id`;
- missing or conflicting item/registration is rejected;
- external xAPI actor account namespace remains interoperable and may differ from the platform export namespace, while account identity must remain pseudonymous and match the governed learner context.

Caliper:
- external AssessmentItem ID must equal the governed item IRI;
- strict Attempt target ID must equal the governed K3 assessment attempt;
- missing or conflicting item/Attempt is rejected.

No external identity is used to invent or replace K3 context.

## Debugging correction

The first GREEN attempt over-constrained xAPI actor `account.homePage` to the platform export namespace.

Quality #954 showed:
- new exact-context tests passed;
- one existing canonical xAPI import regression failed;
- Node: 813 PASS / 1 FAIL.

Ruling: xAPI account homePage is an external account namespace, not a K3 content/attempt identity. The spec requires pseudonymous actor identity, not namespace equality. The over-constraint was removed while item and registration matching remained strict.

## Review hardening

PR review produced two test-quality findings:
1. test missing identities as well as alternate mismatched values;
2. require explicit `rejections`, not `staged`, for known identity conflicts.

Both were implemented:
- missing xAPI object ID and registration are covered;
- missing Caliper item/Attempt IDs are covered;
- identity conflicts must produce exactly one rejection and zero staged records.

Both review threads are resolved/outdated after the hardened tests.

## Final pre-merge verification

Final reviewed head:
`4d695715c32f75c4cc7c952c3fe6047e7a83441e`

- Quality #956: SUCCESS;
- Server and adapter #2088: SUCCESS;
- Node tests: PASS;
- deterministic process verification: PASS;
- CURRENT-STATE validation on PR branch: PASS;
- Pages artifact: PASS;
- browser smoke: PASS;
- open blocking review threads: 0.

## Integration

PR #56 merged as:
`a43e102893cf7550d81133f61909821a39c98f93`

## Post-merge verification

On `main@a43e102893cf7550d81133f61909821a39c98f93`:

- Server and adapter #2089: SUCCESS;
- GitHub Pages/live #52: SUCCESS;
- Node tests: SUCCESS;
- browser smoke: SUCCESS;
- Pages artifact build: SUCCESS;
- deploy: SUCCESS;
- live release verification: SUCCESS.

## Durable boundary

- Tasks 1–33 remain complete;
- post-merge interoperability finding is CLOSED;
- Critical findings = 0;
- Important findings = 0;
- Task 34 is NEXT;
- Task 34 remains NOT STARTED at this checkpoint;
- Phase G returns to PHASE_GATE;
- low-model ready remains false until Task 34 preparation/binding.

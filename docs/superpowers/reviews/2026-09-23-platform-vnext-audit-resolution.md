# vNext Architecture Audit Resolution

**Date:** 2026-09-23  
**Design branch:** `design/platform-vnext-spec`  
**Fresh-audit branch:** `review/platform-vnext-fresh-audit`  
**Fresh-audit commit:** `ebc3643dd21aba895765ff74e973fdd784b00605`

This file records how the isolated fresh-audit findings were resolved in the architecture constitution.

| Audit item | Severity | Resolution in spec | Status |
|---|---|---|---|
| A1 Security/identity threat model | Critical | Explicit identity vs authentication distinction; authorization roles; protected-content threat model; residual scraping/capture risk | Resolved |
| A2 Neutral namespace/branding | Important | Neutral core namespace; SDAIA remains a track; legacy storage-key migration; unofficial/no-endorsement rule | Resolved |
| A3 Release/version integrity | Important | Attempts pinned to track/content/exam/item/formula versions; immutable/content-addressed release principle; manifest/content integrity; render reconstruction | Resolved |
| A4 Current CI/release hard-codes | Important | Exact `browser_smoke.py`, `contract_test.js`, `pages.yml`, README, 1120/200/seven-domain/cache-v8 assumptions added to migration inventory and Programme A acceptance criteria | Resolved |
| A5 Privacy/data governance | Important | Data minimization; classification; retention; export; deletion; consent; access roles; local-first principle | Resolved |
| A6 14k coverage matrix | Important | Coverage across competency/objective/concept/misconception/cognitive/difficulty/scenario/type/pool/language-review status | Resolved |
| A7 Production backend scalability | Important | Current FastAPI/SQLite/process-local limiter classified as dev/test scaffolding pending production evidence; shared datastore/rate-limit scale triggers required | Resolved |
| A8 Repository governance | Important | Required checks, review expectations, release/tag policy, staged branch protection, ownership and emergency path | Resolved |
| A9 Evidence traceability | Important | Separate evidence appendix with URLs/IDs, verification date, limitations, and unresolved SDAIA exam-weight gap | Resolved |
| A10 Operational resilience | Moderate | Backup/restore, restore testing, health/metrics/logging, alerts, incident path, queue reconciliation, failure recovery cases | Resolved |
| A11 Content publication audit trail | Moderate | Author/reviewer/approver/change reason/evidence status/timestamps required; AI cannot be sole activation authority | Resolved |
| A12 Dependency/license auditability | Moderate | Reproducible dependency/license inventory or SBOM-equivalent required from shipped release | Resolved |

## Additional omissions found during resolution review

A second pass found and added:

- explicit non-goals to prevent premature framework/CMS/auth/CAT/multi-tenant scope
- cross-track competency mapping/version rules
- separation of durable raw learning evidence from derived mastery/readiness
- tutor grounding and protected-content safety
- multi-device/offline sync conflict rules
- attempt reconstruction for generated/rendered variants
- repository impact-map requirement before Programme A changes
- performance/scalability release concerns
- explicit recovery cases for stale caches, failed migrations, missing versions, sync conflicts, and service outages

## Independent review limitation

A GitHub Codex review was requested on PR #6 on 2026-09-23. GitHub returned that the account had reached its Codex code-review usage limit, so no independent Codex findings were produced.

This resolution therefore represents:

1. an isolated fresh self-audit on a separate branch;
2. direct repository/PR evidence verification;
3. mechanical coverage verification against every fresh-audit item;
4. external evidence verification for key architectural claims.

It must **not** be described as an independent second-agent approval.

## Remaining deliberate evidence gaps

- exact official SDAIA exam weights for the active exam version
- exact current exam question count/duration/passing rules unless verified from a primary source
- psychometric calibration values until real learner response data exists
- final production backend/database/authentication technology, because Programme A does not yet require that decision

These gaps are explicitly staged rather than guessed.

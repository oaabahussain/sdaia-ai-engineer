# Implementation evidence and scope - 2026-10-03

Project truth: exact Git objects, frozen K3 specification, stored probes and freshly executed tests. Public references guide implementation decisions; they do not certify this project or supply test counts. The documents below span several provenance families; URL count is not independent-confirmation count.

| Primary reference | Decision supported / limitation |
|---|---|
| https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html | Default deny, exact grant at trusted authorization boundary; request fields do not confer producer authority. |
| https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html | Allowlist response shapes, reject unexpected properties; not a guarantee of privacy of arbitrary text. |
| https://www.sqlite.org/lang_UPSERT.html | Constraint-safe INSERT/reselect for concurrent exact retry. Real two-connection tests remain essential. |
| https://www.sqlite.org/lang_conflict.html | Constraint semantics; do not replace immutable evidence using REPLACE. |
| https://www.sqlite.org/isolation.html | Concurrent transactions and visibility; no clock-based identity winner. |
| https://tc39.es/ecma262/#sec-number.max_safe_integer | Interoperable exact-integer bounds for sequence/revision/cursors. |
| https://www.w3.org/TR/IndexedDB/ | Atomic storage transactions and durable identity metadata; actual native-browser integration is still pending. |
| https://json-schema.org/understanding-json-schema/reference/conditionals | Conditional receipt fields; runtime conditions are tested across consumers. |
| https://fastapi.tiangolo.com/advanced/security/oauth2-scopes/ | Permissions belong to verified authorization context. No particular production auth provider is introduced. |
| https://nodejs.org/api/fs.html | File operations are not by themselves a multi-file transaction. Current live docs are not proof of Node22-specific support. |
| https://www.rfc-editor.org/rfc/rfc8785 | Stable canonical content fingerprints. No raw evidence rewriting in transport/projections. |
| https://docs.npmjs.com/cli/v10/commands/npm-audit | Audit report scope and dependency classification; DNS-blocked audit is not zero vulnerabilities. |
| https://developer.mozilla.org/en-US/docs/Web/API/IDBObjectStore/getAll | Snapshot reads and database-specific behavior; secondary vendor documentation, not a browser execution result. |
| https://github.com/fastify/fast-uri/security/advisories/GHSA-hrr3-gc8f-f4qj | Maintainer identifies3.1.8 as patched for host case normalization. Confirmed with an executable regression. |
| https://github.com/fastify/fast-uri/security/advisories/GHSA-qw65-cvwx-89v3 | Preserve earlier patched port-delimiter rejection while updating3.1.7 to3.1.8. |
| https://github.com/fastify/fast-uri/tree/ead3ab7bb134c989e972c8174632d0670023f269 | Seven vendored runtime/type/license/doc files match exact official Git blob SHAs. See vendor provenance manifest. |

Acquisition: public documents inspected through web; release source/tag/tree read through GitHub connector. npm registry and raw GitHub DNS were unavailable to the working container. The inspected upstream index block was reconstructed from the verified3.1.7 package and upstream3.1.8 text ONLY after its entire-file Git hash matched the official3.1.8 blob; unchanged runtime files and types/license/package/readme also match. No custom URI fix is represented as an upstream release.

Counterchecks: original residual corpus preserved byte-for-byte; valid ordinary events, exact administrative grants, correct duplicate receipts and authorized learner isolation remain tested. Final review found four further implementation gaps;13 new assertions failed before repair, then passed. No independent reviewer was available. Expected impact: fewer false acknowledgments, bounded producer privileges, deterministic origin/replay/identity behavior, smaller development dependency footprint; no unmeasured performance or security percentage claim.

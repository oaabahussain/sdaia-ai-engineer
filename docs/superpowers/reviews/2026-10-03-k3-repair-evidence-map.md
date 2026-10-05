# Bounded implementation evidence refresh

Date: 2026-10-03. Scope: repairing existing documented failure modes, not a claim of global state-of-art superiority. Quick evidence sweep of authoritative contracts and mature implementations. 13 documents, 9 named provenance roots; related documents are not independent confirmations. Local RED/GREEN is required for every behavior claim.

- W3C: https://www.w3.org/TR/IndexedDB/ -- Transaction rollback, atomic commit and lifetime.
- SQLite: https://sqlite.org/lang_transaction.html -- Deferred versus immediate transactions; one writer and busy errors.
- SQLite: https://sqlite.org/isolation.html -- Separate connection visibility; no dirty reads by default.
- SQLite: https://sqlite.org/lang_upsert.html -- DO NOTHING for uniqueness; never DO UPDATE on immutable evidence.
- SQLite: https://sqlite.org/lang_altertable.html -- Additive column migration and schema restrictions.
- SQLite: https://sqlite.org/datatype3.html -- Signed 64-bit INTEGER boundary.
- Node.js: https://nodejs.org/docs/latest-v22.x/api/fs.html -- Concurrent file mutations require serialization; exclusive open flags.
- Python: https://docs.python.org/3.13/library/sqlite3.html -- Context manager commits/rolls back but does not close connection.
- FastAPI: https://fastapi.tiangolo.com/tutorial/path-params-numeric-validations/ -- Numeric bounds are explicit validation, not database exceptions.
- IETF: https://www.rfc-editor.org/rfc/rfc8785 -- Canonical JSON determines stable body fingerprints.
- WHATWG: https://html.spec.whatwg.org/multipage/webstorage.html -- Storage writes can fail; storage is not a multi-record transaction.
- idb implementation: https://github.com/jakearchibald/idb -- Do not await unrelated work inside IDB transactions.
- Dexie implementation: https://dexie.org/docs/Dexie/Dexie.transaction() -- Auto-commit and rollback caveats; no need to add the library.

Decisions: harden existing components. Reject global timing-based ordering, overwrite-on-conflict, promises that keep no IDB transaction active, unsafe file writers, automatic stale-lock stealing and hidden retention policies. Context/review capabilities: manual native skill load, filesystem+shell, web and authenticated GitHub reads available; no subagent or independent reviewer available. Publication hold preserved. External documents support mechanisms, not project-specific success.

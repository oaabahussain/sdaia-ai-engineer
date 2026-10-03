# Ruling — Project Bootstrap Revision Marker

**Date:** 2026-10-02

The ChatGPT Project surface consistently stores Markdown files as Project files but keeps the extensionless `BOOTSTRAP-REVISION` attachment as a generated conversation file.

The approved H0-R2 spec requires a readable bootstrap revision marker in Project storage; it does not require that the Project-side marker be a separate extensionless file.

**Ruling:** the canonical repository pack retains `BOOTSTRAP-REVISION`, while Project verification may read the same immutable revision value from `README.md` using the literal marker `Bootstrap revision: k3-h0-r2-v1`.

This is a storage-compatibility ruling only. It does not change current state, product semantics, execution authority, or merge authority.

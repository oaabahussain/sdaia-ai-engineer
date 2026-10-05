# Third-party dependency provenance

fast-uri 3.1.8 is packed from byte-verified unmodified upstream release source at the commit in its provenance manifest. The BSD-3-Clause license is retained inside the archive. This is NOT the npm-distributed tarball. Registry DNS was unavailable in the verification environment; the GitHub release source was retrievable and its blob identities matched. Only the seven runtime/type/license/documentation files are included; upstream tests and developer configuration are not needed by consumers.

The root dependency pins this local archive so clean installs do not silently revert to the previously locked vulnerable 3.1.7. It is also the version resolved by Ajv. No application URI-handling implementation was invented. Update by reviewing an upstream release, verifying its source blobs and regenerating the archive/provenance. The application build does not publish this development archive.

Removed unused @redocly/cli: no tracked workflow or script invokes it. The future OpenAPI document remains unchanged; this repository uses its actual existing validation scripts.

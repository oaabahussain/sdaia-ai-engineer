# ADR 0003 — Public vs Protected Content Boundary

**Status:** Accepted  
**Date:** 2026-09-23

## Context

Static browser delivery cannot keep question content secret.

## Decision

Treat content shipped to the browser/public bank as public. Programme A keeps the current learning bank public. Protected/high-stakes assessment pools, if required later, must use authorized server-side delivery.

## Consequences

- Obfuscation is not treated as access control.
- GitHub Pages remains appropriate for current public learning content.
- Production protected-bank architecture remains future work and must include authentication/authorization.

# Migration compatibility

The current runtime exposes one public `RuntimeBundleV2` contract from both browser and API adapters. The optional FastAPI service remains development/test scaffolding and is not deployed by this repository.

`GET /v1/bank` is public runtime content and does not require an anonymous identifier. `X-Anon-Id` remains a client-generated correlation identifier for progress, feedback, and event endpoints; it is not authentication or authorization.

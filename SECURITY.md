# Security

## Identity is not authentication

The client-generated anonymous UUID is a correlation/storage identifier. **UUID is not authentication** and possession of an anonymous ID must not be treated as proof of identity or authorization.

`X-Anon-Id` exists for development/test progress, feedback and event contracts; it is not a login or access-control mechanism.

## Server status

The current **FastAPI + SQLite + in-process rate limit is dev/test scaffolding**. It is not a production security boundary, durable distributed rate limiter, production database topology, authentication service, or authorization layer.

## Public content

Current **browser-shipped content is public**. Anything present in the Pages artifact, service-worker-accessible content, or public `GET /v1/bank` response should be treated as discoverable.

`data/legacy/` is excluded from Pages to avoid making it an active/public runtime source, but the repository/history itself may still be public.

## Protected content

Protected/high-stakes question delivery is **future work**. A protected bank must use server-side authorization and selective delivery; hiding URLs or obfuscating browser bundles is not protection.

## Exam-material policy

Do not add confidential or leaked real-exam questions, private exam dumps, stolen material, or content whose provenance violates rights or agreements. Current training content must remain clearly independent/unofficial unless a documented relationship changes that status.

## Secrets and vulnerability reporting

Never put credentials, API keys, tokens, private keys, secrets, sensitive personal data, or exploit-ready confidential details into a public issue.

For an ordinary non-sensitive bug, use the public issue/feedback flow. For a security issue involving secrets or sensitive exploit details, contact the repository owner through an appropriate private channel before public disclosure. Rotate/revoke exposed credentials immediately if exposure occurs.

## Future production requirements

Before exposing private learner data or protected content, add a dedicated security design covering authentication, authorization, secret management, durable storage, abuse controls, logging, retention, privacy, incident handling, and deployment isolation.

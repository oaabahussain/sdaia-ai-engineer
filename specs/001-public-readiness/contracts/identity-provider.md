# Contract: Future Identity Provider Boundary

Status: Design contract only; no authentication implementation is authorized.

## Purpose

Provide a narrow application-facing boundary so future authentication can be introduced without coupling study UI and logic to a specific identity vendor.

## Interface semantics

IdentityProvider.getIdentity()
Returns the current identity context.

Anonymous result:
- mode = anonymous
- anonymous_id = existing local UUID v4
- account_id absent
- capabilities false for server-only features

Authenticated result:
- mode = authenticated
- anonymous_id retained until link/merge is complete
- account_id = opaque backend/provider identifier
- provider = configured managed identity provider
- capabilities describe enabled account features

IdentityProvider.signIn(intent)
- Initiates provider-managed authentication.
- Preferred future mechanism: WebAuthn/passkey-capable managed identity.
- Must not require the frontend to store passwords or long-lived bearer secrets in localStorage.
- Returns an updated IdentityContext or a structured error.

IdentityProvider.signOut()
- Ends authenticated application session according to provider/backend rules.
- Must not delete local study state unless the learner explicitly chooses to reset it.

IdentityProvider.linkAnonymousState(localStateDescriptor)
- Requests server-side linking/merge of current anonymous progress to the authenticated account.
- Must be explicit; no silent destructive merge.
- Requires a separately specified conflict policy.
- Returns merge outcome and resulting synchronized state version.

## Security invariants

- No password storage in browser study state.
- No device fingerprinting.
- No authentication secret in question-answer state.
- Secure-context requirements apply to WebAuthn/passkeys.
- The relying party/provider must own challenge validation and credential verification.
- Recovery/lost-device flows are part of future provider evaluation.
- Provider choice must support the project’s Saudi user base and intended deployment environment.

## Current browser implementation behavior

Until authentication is separately approved:
- getIdentity returns anonymous context derived from the current anon_id.
- signIn/signOut/linkAnonymousState are unavailable capabilities and must not be shown as working public features.

## Acceptance criteria for a future authentication feature

A future implementation cannot be called complete until:
- provider threat model is reviewed;
- passkey/WebAuthn compatibility is demonstrated on target browsers;
- account recovery is documented and tested;
- anonymous-to-account linking is tested with conflict cases;
- session storage strategy is reviewed for XSS/CSRF exposure;
- deletion/export policy is defined;
- no credentials or auth tokens are persisted in study localStorage.

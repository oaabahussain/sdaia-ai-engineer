# Data Model: Public-Readiness Foundation

Date: 2026-09-07
Status: Pre-implementation design only

## Current canonical local state

The existing project has already converged on one persisted runtime-map representation. The next implementation must preserve that shape unless a versioned migration explicitly changes it.

State
- version: integer, currently 1
- anon_id: UUID v4 string
- created_at: ISO date-time
- updated_at: ISO date-time
- onboarded: boolean
- profile:
  - minutes: 15 | 20 | 25 | 30
  - examDate: string, empty when not supplied
- answer_map: map question_id -> boolean
- attempts: map question_id -> non-negative integer
- confidence: map question_id -> 1 | 2 | 3
- mastered: map question_id -> boolean
- review_map: map question_id -> ReviewEntry
- errors: map question_id -> ErrorEntry
- bookmark_map: map question_id -> boolean
- notes: map question_id -> string
- sessions: map session_id -> boolean
- activity: map ISO date -> non-negative integer
- diagnostic:
  - done: boolean
  - answers: map question_id -> diagnostic result object
- theme: auto | light | dark
- focus: boolean

ReviewEntry
- stage: 0 | 1 | 2 | 3
- next: epoch milliseconds

ErrorEntry
- type: string label used by current app
- at: epoch milliseconds

## Migration boundary

Known older client states may contain duplicate/array-oriented fields such as:
- answers[]
- review[]
- bookmarks[]
- settings{}

The implementation phase must provide one idempotent migration function that:
1. detects known legacy shapes;
2. maps them into the canonical runtime-map shape;
3. preserves semantically equivalent values where possible;
4. drops deprecated duplicate fields after migration;
5. assigns version/anon_id/timestamps where missing;
6. validates the migrated result before persistence/export;
7. does not silently destroy unknown fields without a documented migration decision.

Migration tests must include at least one fixture matching the pre-v6 array/settings shape described in the owner public-readiness specification.

## Public study bank

Bank
- questions: Question[]
- sessions: Session[]
- learn: map topic -> LearnTopic
- cases: CaseStudy[]
- weights: map official_domain -> percentage

Question, current fields
- id: stable q-number
- domain: one of seven official project domains
- question: Arabic-first stem
- options: current array; future content gate requires exactly 4
- answer: zero-based integer
- explanation: string
- topic: string matching a learn topic

Question, planned content-quality fields
- difficulty: 1 | 2 | 3
- style: scenario | definition
- wrong_explanations: array aligned to incorrect options or equivalent structured explanation representation
- needs_review: boolean, default false
- review_note: optional string used only in internal/content-review artifacts, not public UI
- content_version: integer or semantic content revision marker if later approved

The exact representation of wrong-option explanations must be selected during implementation planning for the content level. The invariant is that every wrong option has a specific explanation; the implementation may use a structured wrong_explanations field or an equivalent normalized explanation object.

## Official-domain weights

The existing seven-domain weight map is treated as owner-supplied official badge information. The implementation must preserve the existing values unless the owner supplies newer official material.

The weights must sum to 100.0.

## Session model

Session
- id: integer
- title: string
- domain: string
- minutes: integer
- qs: question-id array

Sessions 14 and 15 are special runtime-composed sessions in the current design:
- 14: adaptive weakness review
- 15: mixed/weighted mock

Their stored qs may remain empty if runtime composition is the explicit design. E2E must prove they populate correctly.

## Future identity model

No authenticated user model is implemented now.

IdentityContext
- mode: anonymous | authenticated
- anonymous_id: UUID v4
- account_id: opaque provider/backend identifier, absent in anonymous mode
- provider: opaque provider identifier, absent in anonymous mode
- capabilities:
  - can_sync_progress
  - can_comment
  - can_rate

Rules:
- The browser must not create or persist passwords.
- Auth secrets/tokens must not be stored in study-state localStorage.
- Account identity must not be mixed into question-answer maps.
- Anonymous state linking must be explicit and reversible/auditable on the future server side.

## Future account-linking model

AccountLinkRequest
- anonymous_id
- account_id
- local_state_version
- requested_at
- merge_policy

Possible merge policies to evaluate later:
- newest_state_wins
- fieldwise_merge
- explicit_user_choice

No merge policy is selected in this phase because cross-device conflict behavior requires a backend product decision.

## Future feedback model

Feedback
- feedback_id: server-generated when backend exists
- actor_identity: anonymous_id or account_id according to privacy policy
- question_id
- issue_type: wrong_answer | unclear | typo | too_easy | other
- details
- created_at
- status

Today the browser adapter may return a GitHub issue URL instead of persisting Feedback.

## Future rating model

QuestionRating
- rating_id
- question_id
- actor_account_id or privacy-preserving identity reference
- value: scale to be defined
- created_at
- updated_at

Open decision: whether ratings require authenticated accounts. Recommended answer: yes, to reduce abuse and duplicate voting.

## Future comment model

QuestionComment
- comment_id
- question_id
- actor_account_id
- body
- created_at
- updated_at
- moderation_status
- parent_comment_id: optional if threaded replies are later approved

Comments require:
- authentication decision;
- moderation policy;
- report/appeal flow;
- abuse/rate controls;
- retention/privacy policy.

They must not be implemented as anonymous unaudited public text storage.

## Future anonymous event model

The existing API design includes anonymous events. If event collection is activated later:
- event identity remains anonymous/account-opaque;
- no raw IP is persisted by application logic;
- no device fingerprint is created;
- event payload schema is allow-listed;
- collection purpose and retention are documented before deployment.

## Content-review measurement model

Future empirical content-quality review should support aggregated item metrics such as:
- attempts
- correct_response_rate
- option_selection_counts
- item_discrimination metric selected by assessment methodology
- distractor_functioning flags
- response_time summary
- high_confidence_wrong_rate

These are future aggregated/central metrics and require a backend/privacy decision. They are not collected in the current public app.

## Data lifecycle principles

1. Local study state belongs to the learner until a future sync feature explicitly transfers a copy to a backend.
2. Import/export remains a user-controlled portability mechanism.
3. Content data is public static product data.
4. Internal content-review metadata that could confuse learners remains out of UI chrome.
5. Future account/community data requires explicit retention, deletion, moderation, and privacy rules before implementation.
6. No data-model decision in this document authorizes a production backend deployment.

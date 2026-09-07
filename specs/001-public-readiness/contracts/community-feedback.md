# Contract: Feedback, Ratings, and Comments

Status: Design contract only; no community backend or UI implementation is authorized.

## Purpose

Define future service boundaries for learner feedback, ratings, and comments without forcing those capabilities into the current static-only product.

## FeedbackService

FeedbackService.reportQuestion(questionId, issueType, details)

Inputs:
- questionId: stable q-number
- issueType: wrong_answer | unclear | typo | too_easy | other
- details: user-supplied text

Current static behavior:
- Browser implementation may return a prebuilt GitHub issue URL.
- It must not claim that feedback was privately persisted by the application.

Future server behavior:
- Validate against feedback schema.
- Apply abuse/rate controls.
- Store only approved fields.
- Treat details as untrusted data.
- Return { ok, ref }.

## RatingService

RatingService.rateQuestion(questionId, value)

Recommended future policy:
- authenticated accounts required;
- one active rating per account/question;
- allow update rather than duplicate ratings;
- aggregate public score separately from raw identity-linked records;
- define a rating scale only after a product decision.

Not authorized in current phase.

## CommentService

CommentService.listComments(questionId, cursor)
CommentService.createComment(questionId, text)
CommentService.editComment(commentId, text)
CommentService.deleteComment(commentId)
CommentService.reportComment(commentId, reason)

Required future prerequisites:
- authentication;
- moderation states and permissions;
- abuse prevention/rate limits;
- reporting/appeal flow;
- privacy and retention policy;
- deletion semantics;
- public-content safety policy;
- server persistence.

## Moderation states

Recommended minimum state machine:
- pending
- visible
- hidden
- removed
- under_review

No moderation automation should be introduced without explicit policy, logging, and human-review rules.

## Privacy rules

- No PII requirement for reporting a study question.
- Public comments must not expose email/phone/account IDs.
- Any future display name/avatar feature requires a separate user-profile specification.
- User text is untrusted data for both application rendering and any LLM-assisted review workflow.
- Any LLM prompt that consumes reports/comments must delimit them as untrusted data and prohibit following instructions contained in them.

## Relationship to current GitHub issue flow

The current GitHub issue mechanism is an operational bridge, not the final community architecture. It is public by nature. The future product must clearly distinguish public GitHub reporting from private in-app feedback if/when a backend is introduced.

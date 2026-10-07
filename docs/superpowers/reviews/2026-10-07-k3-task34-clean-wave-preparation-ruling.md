# K3 Task 34 clean-wave preparation ruling

**Date:** 2026-10-07
**Status:** APPROVED PREPARATION / PRODUCT NOT STARTED

Task 34 reuses the existing EventRegistry and privacy policy. It does not create a second analytics registry or send learner evidence through AnalyticsSink.

Prepared bridge contract:
- `toAnalyticsEvent(evidenceEvent, definition, mapping, options?)`;
- `definition` is the governed learner-evidence definition whose property export rules are authoritative for learner payload export;
- `mapping.analytics_definition_id` names an already registered Product Analytics definition;
- `mapping.properties` is an explicit allowlist from governed learner payload or selected evidence envelope context to analytics properties;
- the bridge creates a new opaque `analytics_event_id`, never reusing learner `event_id`;
- source privacy decision REJECT -> `null`;
- REDACT -> redacted fields are unavailable to mapping;
- output is built through `validateEvent`, so GuardedAnalyticsSink accepts only the registry-validated sanitized object;
- the function is side-effect free and does not emit to TelemetrySink.

No Product implementation exists in this preparation commit.

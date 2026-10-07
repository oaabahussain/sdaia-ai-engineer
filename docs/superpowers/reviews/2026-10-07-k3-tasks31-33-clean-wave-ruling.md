# K3 Tasks 31–33 Clean Wave Execution Ruling

**Date:** 2026-10-07
**Status:** APPROVED OPERATIONAL RULING / PRODUCT NOT STARTED
**Clean base:** `main@7a625a3f06ff08604abd2fe1176252886dd84e6e`

## Purpose

Prepare Tasks 31, 32, and 33 together from one clean Phase G baseline, then execute them sequentially without installing/merging each task to `main` before starting the next.

This changes integration timing only. The approved K3 specification, implementation plan, task semantics, exact RED/GREEN commands, and required Product commit messages remain authoritative.

## Execution model

1. Task 31 executes from this clean base plus its accepted preparation commit.
2. Task 32 executes from the exact accepted Task 31 head plus its own preparation commit.
3. Task 33 executes from the exact accepted Task 32 head plus its own preparation commit.
4. Run one complete current-head integration review and repository regression suite on the final Task 33 head.
5. Integrate the complete wave to `main` only after the combined head is accepted.
6. Task 34 remains NOT STARTED in this wave.

No historical feature branch may be used as a Product base.

## Standards boundary

Phase G adapters are governed interoperability adapters, never canonical K3 storage.

Current standard/version scope verified before RED preparation:
- xAPI 2.0 remains the adapter target; the current international standard lineage is ISO/IEC/IEEE 39274-1-1:2025 adopting the xAPI 2.0 technical standard lineage.
- Caliper Analytics 1.2 remains the current final Caliper adapter target in the approved K3 plan/spec.

These facts do not authorize new semantics. The K3 specification remains stricter:
- pseudonymous actor identity;
- original K3 occurrence timestamp preserved;
- mapping version/provenance reported;
- unsupported/lossy semantics explicitly omitted, staged, or rejected;
- imported records never fabricate missing K3 activity/release/item/objective context;
- no custom LRS;
- standards/vendors remain adapters, not learner truth.

## Task 31 packet-scope correction

`tests/interoperability-ports.test.js` already exists on the clean baseline. The plan says to test it, not replace it.

The packet compiler must classify this existing path as read/modify test scope for Task 31 instead of create-only scope. New Task 31 assertions may extend the existing test file, while `tests/k3-learning-event-exchange.test.js` is created fresh.

This is a deterministic compiler/packet correction only, not Product behavior.

## Preparation rule

Preparation branches may contain:
- behavioral RED tests;
- mapping fixtures/artifact skeletons only when the task itself defines them as governed input and RED needs them;
- scope/standards rulings;
- deterministic task-packet corrections.

Preparation branches must not contain the Task 31/32/33 Product implementation.

## Review focus

1. Preserve the existing vendor-neutral `LearningEventExchangePort`.
2. Every export/import returns a governed mapping report with mapping version, mapped external/internal IDs, omissions/rejections, and provenance.
3. xAPI/Caliper mappings preserve occurrence time and pseudonymous identity without leaking PII.
4. xAPI imports canonicalize only with exact required K3 context; otherwise stage/reject/abstain.
5. Caliper `Skipped` never becomes an Attempt.
6. Unsupported semantics are declared, never silently approximated.
7. No LRS, vendor event store, or second canonical evidence plane is introduced.

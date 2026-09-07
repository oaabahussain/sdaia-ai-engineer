# Research: Public-Readiness Foundation

Date: 2026-09-07
Research window: prioritize material published or materially updated after 2026-05-01; older material is used only where it remains normative or necessary background.

Research standard: the three foundation-shaping decisions below are supported by multiple independent source families. Dates marked “current documentation; retrieved 2026-09-07” mean the page is current vendor/standards documentation but did not expose a reliable publication date in the retrieved result.

## Decision A — Identity boundary and future passkeys

Final decision:
- Do not implement authentication in the current phase.
- Preserve anonymous UUID identity today.
- Define a provider-neutral IdentityProvider boundary for future sign-in/sign-out/account-linking.
- Prefer a managed provider that supports standards-based WebAuthn/passkeys and secure server-side session management.
- Do not build a bespoke password database.
- Treat recovery, credential management, cross-device use, account linking, and passkey loss as first-class future requirements rather than assuming passkeys eliminate account-recovery work.

Confidence: HIGH for the architectural boundary and passkey direction; MEDIUM for eventual provider choice because no provider has been selected and future commercial/operational requirements are unknown.

Source A1
Decision: Identity/passkeys
Source: W3C Web Authentication Level 3 Candidate Recommendation Snapshot
Date: 2026-05-26
Recommendation: Web applications can strongly authenticate users using scoped public-key credentials with browser-mediated access to authenticators; privacy/security considerations belong in the relying-party design.
Relevance: Establishes the standards basis for future passkey/WebAuthn support and argues against embedding a proprietary credential model into the frontend.
Conflict: None with the project direction.
Final decision: Define identity around standards-compatible credentials, but defer actual auth implementation.
Confidence: HIGH

Source A2
Decision: Identity/passkeys
Source: W3C proposed advancement of WebAuthn Level 3 to Recommendation
Date: 2026-07-20
Recommendation: WebAuthn Level 3 was proposed for advancement after implementation experience; it remains the current standards trajectory for strong public-key web authentication.
Relevance: Confirms that the project should design for the current WebAuthn generation rather than an older password-first architecture.
Conflict: None.
Final decision: Future provider must be WebAuthn/passkey capable.
Confidence: HIGH

Source A3
Decision: Identity/passkeys
Source: MDN Passkeys guide
Date: 2026-09-03 (page result published four days before research date)
Recommendation: Passkeys use WebAuthn registration/sign-in flows and require explicit planning for lost credentials, management, migration, and recovery.
Relevance: Reinforces that passkeys simplify credential handling but do not remove account lifecycle design.
Conflict: None.
Final decision: Keep authentication behind a provider boundary and include recovery/linking requirements in the future spec.
Confidence: HIGH

Source A4
Decision: Identity/passkeys
Source: MDN Authentication security guide
Date: 2026-05-11
Recommendation: Passkeys authenticate without site-entered passwords; sessions remain a separate post-authentication concern typically implemented with secure server-side/session-cookie mechanisms.
Relevance: Separates identity proof from session persistence and supports avoiding secret auth tokens in localStorage.
Conflict: Existing public app uses localStorage for study state; that is acceptable because it is not an auth token.
Final decision: Study state may remain local; future auth/session secrets must not be stored in localStorage.
Confidence: HIGH

Source A5
Decision: Identity/passkeys
Source: Microsoft Learn — passkeys by default / retirement of Microsoft-provided SMS and voice authentication
Date: 2026-08-10
Recommendation: Microsoft is moving users toward passkeys/phishing-resistant methods and away from weaker telecom-delivered authentication.
Relevance: Current enterprise direction supports passkeys as a mainstream future identity option.
Conflict: None.
Final decision: Prefer phishing-resistant managed authentication over bespoke password/SMS-first design.
Confidence: HIGH

Source A6
Decision: Identity/passkeys
Source: Microsoft Learn — Windows passkey support
Date: 2026-06 (page published approximately three months before research date)
Recommendation: Passkeys are OS-integrated and include permission/recovery/cross-device operational considerations.
Relevance: Supports provider-neutral design rather than assuming one device ecosystem.
Conflict: None.
Final decision: Avoid Apple-only identity assumptions; choose a cross-platform standards-capable provider later.
Confidence: HIGH

Source A7
Decision: Identity/passkeys
Source: Apple Developer — Passkeys overview / AuthenticationServices current documentation
Date: current documentation; retrieved 2026-09-07
Recommendation: Passkeys support passwordless sign-in using public/private credentials, platform authenticators, credential providers, import/export, account creation, and automatic upgrades.
Relevance: Demonstrates that Apple’s current passkey platform is mature and integrated with browser/app authentication flows.
Conflict: Apple platform details must not dictate the web app’s provider abstraction.
Final decision: Identity boundary remains standards-first and cross-platform.
Confidence: HIGH

Source A8
Decision: Identity/passkeys
Source: Apple Developer — passkey use in web browsers
Date: current documentation; retrieved 2026-09-07
Recommendation: WebAuthentication challenges are mediated by the browser/OS credential system; browser-app integration is platform controlled.
Relevance: Reinforces that the frontend should not implement its own credential vault or device-specific credential logic.
Conflict: None.
Final decision: Future auth integration delegates credential handling to browser/OS/managed identity mechanisms.
Confidence: HIGH

Source A9
Decision: Identity/passkeys
Source: OWASP Authentication Cheat Sheet
Date: current documentation; retrieved 2026-09-07
Recommendation: Passkeys provide strong authentication, but authenticator properties vary; relying parties should not assume all credentials are hardware-backed/non-exportable.
Relevance: Prevents overclaiming security properties and informs future threat modeling.
Conflict: None.
Final decision: Future auth documentation must state actual assurance properties rather than generic “passkey = hardware-bound” assumptions.
Confidence: HIGH

Source A10
Decision: Identity/passkeys
Source: FIDO Alliance — State of Passkeys 2026 / World Passkey Day
Date: 2026-05-07
Recommendation: Passkey adoption is mainstream and growing across consumers and enterprises.
Relevance: Supports future investment in passkeys as a realistic user-facing option rather than experimental technology.
Conflict: Adoption statistics do not prove universal user readiness or eliminate fallback/recovery needs.
Final decision: Passkeys are preferred, but recovery/fallback remains part of the future auth plan.
Confidence: MEDIUM-HIGH

Source A11
Decision: Identity/passkeys
Source: FIDO Alliance / HID enterprise identity research summary
Date: 2026-06-17
Recommendation: Operational identity governance and offboarding remain difficult even when strong authentication technology exists.
Relevance: Prevents reducing future identity architecture to the sign-in ceremony alone.
Conflict: None.
Final decision: Future account feature must include lifecycle, unlink/recovery, and data-ownership rules.
Confidence: MEDIUM

## Decision B — PWA, Service Worker, Safari/iOS, and browser verification

Final decision:
- GitHub Pages HTTPS remains the supported public runtime.
- Service worker remains an offline/reliability enhancement, not an “installability proof”.
- Test built artifacts in Chromium and Playwright WebKit before deployment.
- Treat physical iPhone Safari as a separate verification class; never infer it from WebKit automation.
- Prefer feature detection over user-agent branching.
- Version and enumerate cache assets explicitly and verify that every listed asset exists in the built site.
- Test first online load, service-worker registration, cache creation, offline reload, update/cache invalidation, and persistence.
- Do not hide service-worker registration failures from test/diagnostic paths.

Confidence: HIGH for testing and service-worker strategy; MEDIUM for physical iOS behavior until a real device test is performed.

Source B1
Decision: PWA/Safari/iOS
Source: WebKit — WebKit Features for Safari 26.6
Date: 2026-07-27
Recommendation: Safari 26.6 fixed service-worker registration cleanup bugs that could block re-registration when service-worker scripts disappear.
Relevance: Demonstrates that service-worker lifecycle edge cases are real Safari release concerns and should be tested rather than assumed.
Conflict: None.
Final decision: Browser E2E must explicitly verify registration and upgrade/re-registration behavior.
Confidence: HIGH

Source B2
Decision: PWA/Safari/iOS
Source: Apple Safari 26.6 Release Notes
Date: 2026-07-27
Recommendation: Documents the same production Safari service-worker fixes for iOS/iPadOS/macOS.
Relevance: Confirms that the WebKit behavior affects shipping Safari, not just experimental builds.
Conflict: None.
Final decision: Safari/iOS service-worker verification remains a first-class release concern.
Confidence: HIGH

Source B3
Decision: PWA/Safari/iOS
Source: WebKit — WWDC26 web technology sessions
Date: 2026-06-08
Recommendation: Safari 27 work emphasizes quality and broad web-platform interoperability.
Relevance: Supports keeping tests standards-based and cross-browser instead of relying on browser-specific assumptions.
Conflict: None.
Final decision: Keep browser tests portable across Chromium/WebKit and use feature detection.
Confidence: MEDIUM-HIGH

Source B4
Decision: PWA/Safari/iOS
Source: WebKit — Safari 27 beta news
Date: 2026-06-08
Recommendation: Safari 27 adds Service Worker Static Routing API and continues service-worker evolution.
Relevance: Reinforces that service-worker behavior is actively evolving; the project should use conservative well-supported primitives and test them.
Conflict: The project does not need new Safari-27-only APIs.
Final decision: Do not adopt static routing in the current plan; test the existing simple caching design.
Confidence: HIGH

Source B5
Decision: PWA/Safari/iOS
Source: WebKit — Safari 26.0 web apps/installability behavior
Date: current Safari 26 documentation, retrieved 2026-09-07; underlying release predates the research window
Recommendation: On iOS/iPadOS 26, any site can be added to the Home Screen and open as a web app; a manifest/service worker is not required merely for Safari “installability”. Feature detection is preferred over UA detection.
Relevance: Corrects a common PWA assumption and prevents treating service-worker registration as proof of installability.
Conflict: Older Chromium PWA guidance often ties installability more closely to manifest/service-worker criteria.
Final decision: Define service worker as offline/reliability infrastructure; test install-related UX separately and browser-specifically.
Confidence: HIGH

Source B6
Decision: PWA/Safari/iOS
Source: WebKit Safari Technology Preview 251 release notes
Date: 2026-08/09 window (published approximately one week before research date)
Recommendation: Ongoing service-worker streaming, headers, fallback, and request-body fixes continue to land.
Relevance: Evidence that WebKit service workers require real execution coverage as browser implementations evolve.
Conflict: None.
Final decision: Maintain WebKit E2E coverage and avoid declaring static syntax tests sufficient.
Confidence: HIGH

Source B7
Decision: PWA/Safari/iOS
Source: Playwright documentation — projects/browsers/WebKit
Date: current documentation; retrieved 2026-09-07
Recommendation: Execute the same end-to-end behavior against browser projects including Chromium and WebKit; use deterministic browser automation and explicit viewport/device configuration.
Relevance: Directly supports the planned cross-engine release gate.
Conflict: Playwright WebKit is not physical iPhone Safari.
Final decision: Use Playwright Chromium + WebKit CI, label physical Safari separately.
Confidence: HIGH

Source B8
Decision: PWA/Safari/iOS
Source: MDN Service Worker / Cache Storage current documentation
Date: current documentation; retrieved 2026-09-07
Recommendation: Service workers operate only in secure contexts (with localhost development exceptions), have independent lifecycle, and rely on Cache Storage/fetch handling for offline behavior.
Relevance: Supports GitHub Pages HTTPS as public runtime and explicit offline tests.
Conflict: Direct file:// opening is not a supported service-worker runtime.
Final decision: GitHub Pages/HTTP local server is supported; file:// is not a release target.
Confidence: HIGH

Source B9
Decision: PWA/Safari/iOS
Source: Web App Manifest / web-platform standards current documentation
Date: normative/current standards; retrieved 2026-09-07
Recommendation: Manifest describes application metadata but does not itself prove offline readiness or runtime correctness.
Relevance: Separates metadata validation from behavioral validation.
Conflict: None.
Final decision: Validate manifest syntax and separately prove browser behavior.
Confidence: HIGH

Source B10
Decision: PWA/Safari/iOS
Source: Existing repository sw.js and public-readiness owner specification
Date: repository baseline 2026-09-07
Recommendation: Current cache version is sdaia-ai-pages-v6 and explicitly lists src/* and data/*.json; owner requires offline E2E and live browser smoke.
Relevance: Provides exact project state and target evidence.
Conflict: Current app code swallows registration failures, so static asset enumeration alone is insufficient.
Final decision: Implementation plan adds runtime service-worker observability in tests and explicit offline/browser gates without altering the current pre-implementation branch.
Confidence: HIGH

## Decision C — Content-quality gates and MCQ rewrite policy

Final decision:
- Preserve the owner-mandated numeric content gates as PROVISIONAL through 2026-10-07.
- Treat them as engineering anti-pattern controls, not universal psychometric truths.
- Add measured post-use data before changing thresholds.
- Prioritize plausible distractors, blueprint/domain/topic coverage, scenario/context richness, item-writing-flaw review, and empirical item analysis.
- Require human/independent technical review for uncertain claims and record needs_review instead of guessing.
- Do not begin bulk rewrite until the content validator and reporting metrics exist.

Confidence: HIGH that structured review, distractor quality, and empirical validation matter; MEDIUM-LOW that the current numeric thresholds are optimal, which is why they remain provisional.

Source C1
Decision: Content quality
Source: Journal of Rawalpindi Medical College — “Enhancing Assessment Integrity: The Role of Plausible Distractors in Multiple-Choice Question Design”
Date: 2026-06-30
Recommendation: Plausible distractors are central to MCQ quality and assessment integrity; non-plausible distractors undermine item function.
Relevance: Supports prohibiting trivial/implausible distractors and measuring distractor quality.
Conflict: Does not establish a universal option-count rule.
Final decision: Enforce plausible full-statement distractors; keep four-option count provisional.
Confidence: HIGH

Source C2
Decision: Content quality
Source: PubMed/PMC randomized study — “Reducing the Number of Distractors in Multiple-Choice Questions”
Date: 2026 (published approximately May 2026; current 2026 study)
Recommendation: Distractor quality mattered more than quantity; two distractors performed comparably to three distractors, with fewer writing flaws and more functional distractors.
Relevance: Directly challenges any claim that exactly four options is psychometrically superior.
Conflict: Owner amendment requires four options for the first rewrite.
Final decision: Keep four options as a provisional engineering gate only; review with real data on 2026-10-07.
Confidence: HIGH

Source C3
Decision: Content quality
Source: Journal of Taibah University Medical Sciences — “Improving MCQ quality using a self-evaluation checklist”
Date: 2026-06-03
Recommendation: Standardized self-evaluation checklists can improve MCQ quality and item-writing practice.
Relevance: Supports a machine-enforced validator plus structured human/AI review rubric.
Conflict: Automated gates alone cannot prove technical correctness.
Final decision: Combine automated gates with content review and needs_review handling.
Confidence: HIGH

Source C4
Decision: Content quality
Source: American Board of Radiology — “The Life Cycle of an ABR Exam Question”
Date: 2026-08 (article issue references June 2026)
Recommendation: High-stakes item development begins with a blueprint and relies on subject-matter committees to refine and assemble valid/relevant content.
Relevance: Supports domain/topic blueprinting and independent technical review rather than unreviewed bulk generation.
Conflict: The study tool is not an official high-stakes exam program and lacks an SME committee today.
Final decision: Use domain/topic blueprint metrics and mark unresolved technical claims for review; do not claim official-equivalent validation.
Confidence: HIGH

Source C5
Decision: Content quality
Source: Wiley, European Journal of Dental Education — evaluation of AI-generated MCQs
Date: 2026-07-25
Recommendation: AI-generated assessment items require explicit quality assessment; generation alone is not evidence of validity.
Relevance: Directly relevant because this project’s bank was generated/edited with AI assistance.
Conflict: None.
Final decision: Every rewritten item must pass gates and content review; uncertain claims remain needs_review.
Confidence: HIGH

Source C6
Decision: Content quality
Source: Frontiers in Medicine — LLM MCQ quality versus expert consensus
Date: 2026-07-09
Recommendation: AI-generated question quality should be evaluated against expert criteria/consensus rather than accepted from model output.
Relevance: Reinforces independent review and structured evaluation.
Conflict: The project currently lacks a formal expert panel.
Final decision: The readiness report must list needs_review claims and cannot call the bank technically verified without appropriate review.
Confidence: HIGH

Source C7
Decision: Content quality
Source: Frontiers in Computer Science — AI-assisted MCQ creation and automation bias
Date: 2026-05-26
Recommendation: AI-assisted authoring can increase item-writing flaws through automation bias; structured flaw rubrics and human review remain necessary.
Relevance: Strong warning against “agent rewrote 121 questions, therefore quality improved”.
Conflict: None.
Final decision: Bulk rewrite must be gated, audited, and treated as a content-engineering project, not a text-generation task.
Confidence: HIGH

Source C8
Decision: Content quality
Source: Computers & Education: Artificial Intelligence — impact of item-writing flaws on difficulty/discrimination
Date: 2026
Recommendation: Item-writing flaws correlate with empirical item difficulty/discrimination; automated flaw detection is useful for initial screening but does not replace domain-aware validation.
Relevance: Supports validator rules plus later learner-data analysis.
Conflict: Some proposed gates (character length, longest-option ratio) are heuristic proxies rather than direct psychometric measures.
Final decision: Keep heuristics provisional and add future empirical difficulty/discrimination reporting.
Confidence: HIGH

Source C9
Decision: Content quality
Source: Nurse Education in Practice — human vs AI NCLEX-style item review using a rubric
Date: 2026-07
Recommendation: Structured rubrics enable comparison of human/AI review consistency, but reliability/agreement must be measured rather than presumed.
Relevance: Supports future dual-review workflows and prevents treating LLM review as ground truth.
Conflict: None.
Final decision: AI content review is advisory unless independently validated; uncertain items remain needs_review.
Confidence: HIGH

Source C10
Decision: Content quality
Source: Language Testing in Asia — item-writer intention versus test-taker processes
Date: 2026
Recommendation: What writers intend an item to measure may differ from how test takers actually solve it; option-level intentions and empirical/test-taker evidence matter.
Relevance: Supports future learner-response analysis and caution around purely static style gates.
Conflict: None.
Final decision: Post-launch threshold review uses measured item behavior, not only static formatting metrics.
Confidence: MEDIUM-HIGH

## Cross-decision conclusions

1. “Modern” does not mean “newest API everywhere.” The project should use conservative standards-compatible primitives, strong automated browser coverage, and explicit evidence.
2. The frontend remains backend-free today, but provider boundaries should prevent future identity/community features from forcing a rewrite.
3. Service-worker correctness is behavioral and browser-specific; syntax/asset checks are insufficient.
4. Passkeys are the preferred future direction, but account lifecycle and recovery remain design work.
5. Content-quality metrics must separate useful anti-pattern gates from claims of psychometric validity.
6. Physical iPhone Safari remains a separate evidence category from Playwright WebKit.
7. No implementation is authorized by this research document.

# Research: Public-Readiness Foundation

Date: 2026-09-07
Research window: prioritize material published or materially updated after 2026-05-01; older material is used only where it remains normative or necessary background.

Record format:
ID | Source | Date | URL/DOI | Recommendation | Relevance | Conflict | Final decision | Confidence

A record without a resolvable URL/DOI is explicitly downgraded to PARTIAL confidence until resolved.

## Decision A — Identity boundary and future passkeys

Final decision: do not implement authentication now; preserve anonymous UUID; define a provider-neutral identity boundary; prefer a managed WebAuthn/passkey-capable provider later; never build bespoke password storage.
Decision confidence: HIGH for architecture direction, MEDIUM for future provider choice.

A1 | W3C Web Authentication Level 3 Candidate Recommendation Snapshot | 2026-05-26 | https://www.w3.org/TR/webauthn-3/ | Use browser-mediated scoped public-key credentials | Standards basis for future passkeys | None | Future provider must support standards-compatible WebAuthn | HIGH
A2 | W3C proposed advancement of WebAuthn Level 3 | 2026-07-20 | https://www.w3.org/news/2026/proposed-advancement-of-webauthn-3-to-w3c-recommendation/ | Current standards trajectory is public-key WebAuthn | Avoid password-first architecture | None | Design for current WebAuthn generation | HIGH
A3 | MDN Passkeys guide | 2026-09-03 | https://developer.mozilla.org/en-US/docs/Web/Security/Authentication/Passkeys | Treat registration, authentication, and lost-credential/recovery paths as first-class | Recovery remains part of identity architecture | None | Provider evaluation must include recovery | HIGH
A4 | MDN Authentication security guide | 2026-05-11 | https://developer.mozilla.org/en-US/docs/Web/Security/Authentication | Separate authentication method from session management | Auth secrets should not live in study localStorage | Local study state can remain local | Keep auth/session secrets outside study state | HIGH
A5 | Microsoft Entra ID passkeys-by-default security update | 2026-07-13 | https://www.microsoft.com/en-us/security/blog/2026/07/13/microsoft-entra-id-security-updates-passkeys-are-the-default-authentication-method-in-entra-id/ | Prefer phishing-resistant passkeys over phishable methods | Current enterprise identity direction | None | Prefer phishing-resistant managed auth | HIGH
A6 | Microsoft Learn — Support for passkeys in Windows | 2026-05-13 | https://learn.microsoft.com/en-us/windows/security/identity-protection/passkeys/ | Support platform and cross-device passkey flows; account for consent and Bluetooth/cross-device constraints | Cross-platform requirements | None | Avoid ecosystem-specific identity design | HIGH
A7 | Apple Authentication Services | current; retrieved 2026-09-07 | https://developer.apple.com/documentation/authenticationservices/ | Delegate credentials to platform identity frameworks and standards | Mature Apple passkey support | Apple-specific APIs must not dictate cross-platform architecture | Standards-first provider boundary | HIGH
A8 | Apple Passkey use in web browsers | current; retrieved 2026-09-07 | https://developer.apple.com/documentation/authenticationservices/passkey-use-in-web-browsers | Browser/OS mediates WebAuthentication challenges and credential use | Do not build a credential vault in frontend code | None | Delegate credential handling to platform/provider | HIGH
A9 | OWASP Authentication Cheat Sheet | current; retrieved 2026-09-07 | https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html | Do not assume all passkeys are hardware-bound/non-exportable; understand authenticator properties | Prevents overclaiming assurance | None | Document actual assurance level of chosen provider/authenticator | HIGH
A10 | FIDO Alliance State of Passkeys 2026 | 2026-05-07 | https://fidoalliance.org/the-state-of-passkeys-2026-global-consumer-and-workforce-report/ | Passkeys have mainstream consumer/workforce adoption | Makes passkeys a realistic future option | Adoption does not remove recovery/lifecycle needs | Prefer passkeys with recovery planning | MEDIUM-HIGH
A11 | FIDO/HID enterprise identity research referenced in initial review | 2026-06-17 | UNRESOLVED — no stable source URL confirmed during this pre-implementation pass | Treat governance/offboarding as part of identity lifecycle | Sign-in is not the full identity architecture | Evidence not independently resolvable | Keep lifecycle/offboarding as a planning requirement, but do not cite this record as VERIFIED evidence | PARTIAL

## Decision B — PWA, service worker, Safari/iOS, browser verification

Final decision: GitHub Pages HTTPS remains the supported runtime; service worker is offline/reliability infrastructure, not proof of Safari installability; test Chromium and WebKit; physical iPhone Safari is a separate owner-supplied evidence class; prefer feature detection and explicit registration/cache/offline/update tests.
Decision confidence: HIGH for strategy, MEDIUM for physical iOS behavior until owner device evidence exists.

Owner reviewer spot-check: B1, B2, and B5 were independently confirmed against webkit.org and developer.apple.com.

B1 | WebKit Features for Safari 26.6 | 2026-07-27 | https://webkit.org/blog/18178/webkit-features-for-safari-26-6/ | Treat service-worker lifecycle bugs as real browser-specific failure modes | Confirms need for browser execution | None | Explicit registration/update tests are mandatory | HIGH
B2 | Apple Safari 26.6 Release Notes | 2026-07-27 | https://developer.apple.com/documentation/safari-release-notes/safari-26_6-release-notes | Shipping Safari fixed service-worker registration cleanup issues | Confirms iOS/macOS impact | None | Safari service-worker behavior remains a release concern | HIGH
B3 | WebKit WWDC26 / Safari 27 beta web platform update | 2026-06-08 | https://webkit.org/blog/17967/news-from-wwdc26-webkit-in-safari-27-beta/ | Browser capabilities evolve; prefer interoperable primitives and explicit testing | Supports conservative cross-browser design | None | Do not depend on Safari-27-only APIs for current app | HIGH
B4 | WebKit Safari 27 beta — Service Worker Static Routing API | 2026-06-08 | https://webkit.org/blog/17967/news-from-wwdc26-webkit-in-safari-27-beta/ | New SW routing API can improve advanced PWAs but is not necessary for this product | Avoid needless new-platform dependency | None | Stay with simpler cache/fetch primitives unless later evidence justifies change | HIGH
B5 | Apple/WebKit current Safari web-app behavior referenced by owner reviewer | current; retrieved 2026-09-07 | https://developer.apple.com/safari/ | Do not equate service-worker presence with Safari installability; treat web-app install and offline behavior as separate properties | Corrects Chromium-centric PWA assumptions | Browser terminology differs | Separate installability evidence from offline/service-worker evidence | HIGH
B6 | Safari Technology Preview 251 | 2026-08-26 | https://webkit.org/blog/18194/release-notes-for-safari-technology-preview-251/ | Ongoing service-worker fixes/features demonstrate implementation churn | Supports continued WebKit E2E | None | Keep WebKit coverage current | HIGH
B7 | Playwright Projects | current; retrieved 2026-09-07 | https://playwright.dev/docs/test-projects | Run the same user flows across Chromium/WebKit projects and device profiles | Direct CI strategy | Playwright WebKit is not physical Safari | Use Playwright for automated cross-engine evidence and label device evidence separately | HIGH
B8 | MDN CacheStorage / Service Worker secure-context behavior | current; retrieved 2026-09-07 | https://developer.mozilla.org/en-US/docs/Web/API/CacheStorage | CacheStorage/service-worker behavior depends on secure contexts; test over HTTP localhost/HTTPS, not file:// | Defines supported test/runtime model | file:// cannot be treated as release runtime | GitHub Pages HTTPS is supported public runtime | HIGH
B9 | W3C Web Application Manifest | 2026-08-13 | https://www.w3.org/TR/appmanifest/ | Manifest metadata describes the application but does not prove runtime/offline correctness | Separates static validation from behavior | None | Validate manifest separately from browser E2E | HIGH
B10 | Current repository sw.js + owner public-readiness specification | 2026-09-07 | https://github.com/oaabahussain/sdaia-ai-engineer/blob/059b90fca83d20b950b5c83e751a55180387fd53/sw.js | Cache v6 already lists src/data assets; owner requires offline E2E | Exact project baseline | App registration errors are currently swallowed | Preserve asset coverage and add runtime observability/tests later | HIGH

## Decision C — Content-quality gates and MCQ rewrite policy

Final decision: preserve owner numeric gates as PROVISIONAL through 2026-10-07; treat them as engineering anti-pattern controls, not universal psychometric truths; prioritize plausible distractors, blueprinting, structured flaw review, empirical item analysis, and independent technical review; do not rewrite before validator exists.
Decision confidence: HIGH for review principles; MEDIUM-LOW for exact numeric thresholds.

C1 | Journal of Rawalpindi Medical College plausible-distractor study referenced in initial research | 2026-06-30 | UNRESOLVED — no stable URL/DOI confirmed during this pre-implementation pass | Plausible distractors are central to MCQ quality | Supports banning trivial distractors | Exact source unresolved | Retain plausible-distractor requirement but do not cite this record as VERIFIED evidence | PARTIAL
C2 | 2026 randomized distractor-count study referenced in initial research | 2026 | UNRESOLVED — no stable URL/DOI confirmed during this pre-implementation pass | Distractor quality may matter more than simply adding options | Challenges claim that four options are inherently optimal | Exact source unresolved | Keep four options only as owner-approved provisional gate | PARTIAL
C3 | Improving MCQ quality using a self-evaluation checklist: a quasi-experimental study | 2026-06-03 | DOI 10.1016/j.jtumed.2026.05.006 ; https://pubmed.ncbi.nlm.nih.gov/42292512/ | Structured self-evaluation/checklists can improve item quality | Supports validator plus review rubric | Automation alone is not technical proof | Combine automated gates with review | HIGH
C4 | American Board of Radiology — The Life Cycle of an ABR Exam Question | 2026-06/2026-08 issue | https://www.theabr.org/beam/from-the-board-of-trustees-august-2026/ | Start from blueprint; use SME refinement; write plausible distractors; validate answers with references | Supports domain/topic blueprint and review workflow | Project lacks formal SME committee | Use blueprint and owner review; mark uncertain claims needs_review | HIGH
C5 | Evaluation of AI-Generated Multiple-Choice Questions for Periodontology Exams | 2026-07-25 | DOI 10.1111/eje.70262 ; https://pubmed.ncbi.nlm.nih.gov/42501401/ | AI-generated MCQs require explicit quality assessment and expert supervision | Directly relevant to AI-assisted rewrite | None | Gate and independently review every rewrite batch | HIGH
C6 | Frontiers in Medicine — Assessing MCQ quality against expert consensus | 2026-07-09 | DOI 10.3389/fmed.2026.1866674 ; https://www.frontiersin.org/journals/medicine/articles/10.3389/fmed.2026.1866674/full | Compare AI evaluation with expert criteria rather than treating model judgment as ground truth | Independent review required | No standing external expert panel | Owner review required for uncertain technical claims | HIGH
C7 | Frontiers in Computer Science automation-bias MCQ study referenced in initial research | 2026-05-26 | UNRESOLVED — no stable URL/DOI confirmed during this pre-implementation pass | AI-assisted authoring can create systematic item-writing flaws | Warns against bulk-generation confidence | Exact source unresolved | Keep structured audit requirement; do not cite this record as VERIFIED evidence | PARTIAL
C8 | Computers & Education: Artificial Intelligence — The impact of item-writing flaws on difficulty and discrimination in item response theory | 2026 | DOI 10.1016/j.caeai.2026.100632 ; https://doi.org/10.1016/j.caeai.2026.100632 | Static item-writing-flaw analysis is useful but empirical IRT/item data remains important | Supports later empirical metrics | Numeric heuristics are proxies | Keep static gates provisional and revisit with learner data | HIGH
C9 | Nurse Education in Practice human-vs-AI rubric review referenced in initial research | 2026-07 | UNRESOLVED — no stable URL/DOI confirmed during this pre-implementation pass | Reviewer reliability itself must be assessed | AI review should remain advisory | Exact source unresolved | Do not clear needs_review items using agent judgment alone | PARTIAL
C10 | Language Testing in Asia item-writer intention/test-taker process study referenced in initial research | 2026 | UNRESOLVED — no stable URL/DOI confirmed during this pre-implementation pass | Intended construct may differ from how learners actually solve an item | Supports post-launch response analysis | Exact source unresolved | Use learner-response evidence before changing provisional gates | PARTIAL

## Cross-decision conclusions

1. Prefer conservative standards-compatible primitives plus strong browser evidence.
2. Keep the frontend backend-free today but preserve provider/service boundaries.
3. Service-worker correctness is behavioral and browser-specific.
4. Passkeys are preferred later, but recovery, account lifecycle, and provider choice remain future work.
5. Content metrics must distinguish anti-pattern gates from psychometric-validity claims.
6. Physical iPhone Safari is separate owner-supplied evidence from Playwright WebKit.
7. Records A11, C1, C2, C7, C9, and C10 are PARTIAL because no resolvable URL/DOI was confirmed during this pass; they cannot be used as sole support for a release gate.
8. No implementation is authorized by this research alone.

# Exam App QA Audit — 120 Common Failure Modes

Comparison baseline: the previously deployed study page vs the bilingual exam-bank redesign.

Legend: PASS = already covered, FAIL = missing/problem, PARTIAL = incomplete, FIXED = addressed in V2 code/tests, VERIFY = requires browser/manual verification, STILL OPEN = intentionally not claimed as complete.

## Runtime & JavaScript bootstrap

| # | Common mistake | Previous app | V2 |
|---:|---|---|---|
| 1 | استخدام const/let قبل التهيئة (TDZ) | PARTIAL | FIXED |
| 2 | تعليق بدء التطبيق على await بلا شاشة خطأ | FAIL | FIXED |
| 3 | فشل fetch واحد يوقف الواجهة كاملة | PARTIAL | FIXED |
| 4 | عدم وجود fallback واضح لخطأ تحميل البنك | PARTIAL | FIXED |
| 5 | ربط event handlers بعد عمليات قد تفشل | FAIL | FIXED |
| 6 | خلط inline handlers مع ES modules | PARTIAL | FIXED |
| 7 | عدم فحص وجود عناصر DOM قبل استخدامها | PARTIAL | FIXED |
| 8 | أخطاء غير ملتقطة في init | FAIL | FIXED |
| 9 | عدم إظهار خطأ startup للمستخدم | FAIL | FIXED |
| 10 | اعتماد التطبيق على ترتيب تنفيذ هش | FAIL | FIXED |
| 11 | عدم فصل منطق الاختبار عن العرض | PARTIAL | FIXED |
| 12 | تعديل state من أماكن كثيرة دون عقد واضح | PARTIAL | IMPROVED |
| 13 | عدم وجود parser check للتطبيق نفسه | PARTIAL | FIXED |
| 14 | الاعتماد على globals غير ضرورية | PARTIAL | FIXED |
| 15 | صعوبة استئناف التطبيق بعد خطأ bootstrap | FAIL | FIXED |

## Exam integrity & assessment UX

| # | Common mistake | Previous app | V2 |
|---:|---|---|---|
| 16 | وجود نمط ثابت لموقع الإجابة الصحيحة | FAIL | FIXED |
| 17 | عدم خلط الخيارات في كل محاولة | FAIL | FIXED |
| 18 | عدم خلط ترتيب الأسئلة | PARTIAL | FIXED |
| 19 | إجبار المستخدم على confidence قبل الإجابة | FAIL | FIXED |
| 20 | عدم دعم unanswered عند التسليم | FAIL | FIXED |
| 21 | عدم وجود اختبار كامل موزون | FAIL | FIXED |
| 22 | عدم وجود اختبار مستقل لكل مجال | FAIL | FIXED |
| 23 | أخطاء التقريب في تحويل الأوزان إلى عدد أسئلة | FAIL | FIXED |
| 24 | احتمال سحب السؤال نفسه مرتين | PARTIAL | FIXED |
| 25 | تغيير اللغة قد يغير معنى الاختيار المحفوظ | N/A | FIXED |
| 26 | عدم وجود Previous | FAIL | FIXED |
| 27 | عدم وجود jump palette لامتحان طويل | FAIL | FIXED |
| 28 | عدم وجود flag/review later | FAIL | FIXED |
| 29 | إظهار الحل أثناء اختبار حقيقي | PARTIAL | FIXED |
| 30 | عدم تأكيد التسليم النهائي | FAIL | FIXED |

## Question bank & data quality

| # | Common mistake | Previous app | V2 |
|---:|---|---|---|
| 31 | بنك صغير لا يغطي المجال جيداً | FAIL | FIXED |
| 32 | لغة واحدة فقط | FAIL | FIXED |
| 33 | عدم وجود schema للحقول الثنائية | FAIL | FIXED |
| 34 | عدم التحقق من تكرار IDs | PARTIAL | FIXED |
| 35 | عدم التحقق من prompts المكررة | FAIL | FIXED |
| 36 | عدم التحقق من عدد الخيارات | PARTIAL | FIXED |
| 37 | عدم التحقق من answer index | PASS | PASS |
| 38 | عدم توازن مواقع الإجابة الصحيحة | FAIL | FIXED |
| 39 | مجال بعدد أسئلة أقل من المطلوب للاختبار الموزون | FAIL | FIXED |
| 40 | عدم حفظ difficulty | FAIL | FIXED |
| 41 | عدم وجود topic metadata | PASS | PASS |
| 42 | عدم مطابقة الخيارات العربية والإنجليزية ترتيبياً | N/A | FIXED |
| 43 | عدم وجود explanation بكلتا اللغتين | FAIL | FIXED |
| 44 | عدم اختبار مجموع الأوزان = 100 | PASS | PASS |
| 45 | عدم اختبار توزيع 200 سؤال آلياً | FAIL | FIXED |

## Bilingual / RTL / LTR

| # | Common mistake | Previous app | V2 |
|---:|---|---|---|
| 46 | ترجمة جزئية للواجهة | FAIL | FIXED |
| 47 | عدم تغيير lang attribute | FAIL | FIXED |
| 48 | عدم تغيير dir بين RTL/LTR | FAIL | FIXED |
| 49 | نصوص hard-coded لا تمر عبر i18n | FAIL | FIXED |
| 50 | أسماء المجالات بلا ترجمة | FAIL | FIXED |
| 51 | خيارات الأسئلة بلا نسخة إنجليزية | FAIL | FIXED |
| 52 | الشرح بلا نسخة إنجليزية | FAIL | FIXED |
| 53 | فقد الإجابة عند تبديل اللغة | N/A | FIXED |
| 54 | الاختصارات والأسهم لا تراعي اتجاه اللغة | N/A | FIXED |
| 55 | أزرار اللغة غير واضحة | FAIL | FIXED |
| 56 | النص المختلط عربي/إنجليزي بلا اتجاه صفحة صحيح | PARTIAL | FIXED |
| 57 | أرقام السؤال تتأثر بترجمة النص | PARTIAL | FIXED |
| 58 | نتائج المجالات بلا ترجمة | FAIL | FIXED |
| 59 | صفحة المراجعة بلغة مختلفة عن السؤال | N/A | FIXED |
| 60 | اعتماد أسماء المجالات المترجمة كمفاتيح بيانات | N/A | AVOIDED |

## Accessibility & interaction

| # | Common mistake | Previous app | V2 |
|---:|---|---|---|
| 61 | عدم وضوح keyboard focus | PARTIAL | FIXED |
| 62 | وظائف لا يمكن الوصول لها بالكيبورد | PARTIAL | IMPROVED |
| 63 | عدم وجود aria-pressed للاختيارات | FAIL | FIXED |
| 64 | أهداف لمس صغيرة | PARTIAL | FIXED |
| 65 | الاعتماد على اللون وحده لإظهار الحالة | PARTIAL | IMPROVED |
| 66 | ترتيب tab غير منطقي | UNKNOWN | VERIFY |
| 67 | focus مخفي خلف sticky header | UNKNOWN | VERIFY |
| 68 | عدم وجود labels/aria للأزرار الأيقونية | PARTIAL | FIXED |
| 69 | نصوص منخفضة contrast | UNKNOWN | VERIFY |
| 70 | عدم دعم zoom/responsive جيداً | PARTIAL | IMPROVED |
| 71 | حقول select غير قابلة للاستخدام على الجوال | PASS | PASS |
| 72 | عدم وجود role alert للأخطاء | FAIL | FIXED |
| 73 | أزرار options بلا حالة اختيار semantics | FAIL | FIXED |
| 74 | عدم دعم اختصارات لوحة المفاتيح | FAIL | FIXED |
| 75 | لوحة تنقل 200 سؤال غير قابلة للتمرير | N/A | FIXED |

## State, persistence & recovery

| # | Common mistake | Previous app | V2 |
|---:|---|---|---|
| 76 | localStorage تالف يقتل التطبيق | FAIL | FIXED |
| 77 | لا يوجد resume لاختبار طويل | FAIL | FIXED |
| 78 | عدم حفظ ترتيب الخيارات بعد refresh | FAIL | FIXED |
| 79 | عدم حفظ index الحالي | PARTIAL | FIXED |
| 80 | عدم حفظ flags | FAIL | FIXED |
| 81 | confidence الإجباري يلوث state | FAIL | FIXED |
| 82 | عدم فصل active exam عن history | FAIL | FIXED |
| 83 | تضخم history بلا حد | FAIL | FIXED |
| 84 | عدم حفظ language preference | FAIL | FIXED |
| 85 | عدم حفظ theme preference بوضوح | PARTIAL | FIXED |
| 86 | تغيير السؤال يعيد خلط الخيارات | N/A | AVOIDED |
| 87 | الإجابة محفوظة كموقع A/B/C/D بدل canonical option | N/A | AVOIDED |
| 88 | refresh يضيع unanswered state | PARTIAL | FIXED |
| 89 | عدم وجود updated_at | PASS | PASS |
| 90 | فشل التخزين بلا fallback | PARTIAL | PASS |

## PWA, caching & performance

| # | Common mistake | Previous app | V2 |
|---:|---|---|---|
| 91 | cache version لا يتغير مع release | PASS | PASS |
| 92 | service worker لا يحذف cache القديم | PASS | PASS |
| 93 | بنك الأسئلة غير موجود في precache | PASS | PASS |
| 94 | واجهة قد تقرأ cache قديم بلا network attempt | PASS | PASS |
| 95 | عدم فحص أصول service worker | PASS | PASS |
| 96 | إدخال node_modules في artifact | PASS | PASS |
| 97 | عدم وجود .nojekyll | PASS | PASS |
| 98 | عدم التحقق من live app.js HTTP | PASS | PASS |
| 99 | عدم التحقق من live question bank | PARTIAL | FIXED |
| 100 | عدم التحقق من bilingual bank بعد deploy | FAIL | FIXED |
| 101 | عدم bump cache بعد تغيير بنيوي | N/A | FIXED |
| 102 | تحميل bank ضخم inline يضاعف HTML | AVOIDED | AVOIDED |
| 103 | عدم cache البنك للاستخدام اللاحق offline | PASS | PASS |
| 104 | عدم وجود responsive layout للامتحان الطويل | PARTIAL | FIXED |
| 105 | الاعتماد على synchronous storage بكثافة | PARTIAL | UNCHANGED |

## Testing, CI & release discipline

| # | Common mistake | Previous app | V2 |
|---:|---|---|---|
| 106 | الاختبارات تعمل فقط بعد الدمج إلى main | FAIL | FIXED |
| 107 | عدم وجود PR quality gate | FAIL | FIXED |
| 108 | عدم اختبار 200 weighted allocation | FAIL | FIXED |
| 109 | عدم اختبار section isolation | FAIL | FIXED |
| 110 | عدم اختبار confidence optional | FAIL | FIXED |
| 111 | عدم اختبار option permutations | FAIL | FIXED |
| 112 | عدم اختبار bank >1000 | FAIL | FIXED |
| 113 | عدم اختبار bilingual fields | FAIL | FIXED |
| 114 | عدم اختبار answer-position balance | FAIL | FIXED |
| 115 | عدم اختبار duplicate prompts | FAIL | FIXED |
| 116 | عدم node --check لـ app.js | PARTIAL | FIXED |
| 117 | عدم live verify لعدد البنك الجديد | FAIL | FIXED |
| 118 | عدم live verify لنسخة service worker الجديدة | PASS | PASS |
| 119 | لا يوجد browser E2E كامل | FAIL | STILL OPEN |
| 120 | لا يوجد accessibility automation/manual matrix | FAIL | STILL OPEN |

## Reference standards used for the checklist

- W3C WAI, Easy Checks / keyboard access and focus: https://www.w3.org/WAI/test-evaluate/preliminary/
- W3C WAI, WCAG 2.2 updates: https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/
- W3C WAI, Forms Tutorial: https://www.w3.org/WAI/tutorials/forms/
- MDN, Using Service Workers: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers
- MDN, PWA caching guide: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Caching
- MDN, JavaScript modules / top-level await: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
- web.dev, PWA update guidance: https://web.dev/learn/pwa/update

## Highest-priority findings from the previous page

1. Exam integrity was weak because answer positions were not randomized per attempt and confidence was mandatory.
2. The bank was only 121 Arabic questions, so it could not support a 200-question weighted exam or independent large domain exams.
3. The page lacked a complete bilingual RTL/LTR interface.
4. CI validated assets and data but did not provide a PR-level quality gate or full browser E2E.
5. A runtime initialization defect previously allowed the page shell to render while interactions were dead; V2 keeps startup error handling and adds more pre-merge checks.

export const CORE_LOCALES = ['ar', 'en'];
export const CORE_DEFAULT_LOCALE = 'ar';

export const CORE_I18N = {
  ar: {
    app: {
      home:'الرئيسية',feedback:'شارك رأيك',questions:'سؤال',domains:'مجالات',fullExam:'الاختبار الكامل',randomized:'خيارات عشوائية',
      resumeAvailable:'لديك اختبار غير مكتمل',resume:'استأنف',rules:'قواعد الاختبار',rulesTitle:'مصمم لكسر الأنماط',
      rule1:'ترتيب الأسئلة يتغير مع كل محاولة.',rule2:'ترتيب A/B/C/D يتغير لكل سؤال مع كل محاولة.',
      rule3:'الثقة اختيارية ولا تمنع الانتقال أو التسليم.',rule4:'يمكنك تغيير اللغة أثناء الاختبار بدون فقد الإجابة.',
      mode:'وضع الاختبار',chooseExam:'اختر طريقة الاختبار',
      weightedExam:n=>`اختبار كامل — ${n} سؤال موزون`,weightedDesc:n=>`يتم سحب الأسئلة من ${n} مجالات حسب الأوزان ثم خلطها.`,
      startFull:n=>`ابدأ اختبار ${n} سؤال`,sectionExam:'اختبار مجال واحد',sectionDesc:'اختر أي مجال واختبر نفسك فيه وحده.',
      sections:'المجالات',sectionTests:'اختبارات مستقلة لكل قسم',start:'ابدأ',bank:'بنك',weight:'الوزن',count:'عدد الأسئلة',all:'الكل',
      flag:'⚑ علّم السؤال',unflag:'✓ أزل العلامة',confidenceOptional:'مستوى الثقة — اختياري',
      confidenceNote:'اتركه بدون اختيار إذا لم ترغب باستخدامه.',low:'غير واثق',medium:'متوسط',high:'واثق',clear:'مسح',
      previous:'السابق',next:'التالي',submitExam:'تسليم الاختبار',navigation:'التنقل',
      keyboardHint:'اختصارات: 1–4 للإجابة، والأسهم للتنقل.',result:'النتيجة',correct:'صحيح',wrong:'خطأ',unanswered:'بدون إجابة',
      confidenceUsed:'استخدمت الثقة',domainBreakdown:'النتيجة حسب المجال',reviewAnswers:'مراجعة الإجابات',newExam:'اختبار جديد',
      footer:'الأسئلة التدريبية غير رسمية · التقدم محفوظ محلياً على جهازك.',answered:'مجاب',of:'من',
      fullMode:'اختبار كامل موزون',sectionMode:'اختبار مجال',
      confirmSubmit:'هل تريد تسليم الاختبار الآن؟ يمكنك ترك أسئلة بلا إجابة.',
      scoreText:(c,t)=>`${c} إجابة صحيحة من ${t}`,yourAnswer:'إجابتك',correctAnswer:'الإجابة الصحيحة',notAnswered:'لم تتم الإجابة',
      resumeText:(i,t)=>`السؤال ${i} من ${t}`,
      errorBank:'تعذر تحميل بنك الأسئلة الكامل. حدّث الصفحة وتأكد من الاتصال بالإنترنت.'
    },
    feedback: {
      community:'المشاركة',back:'الاختبار',eyebrow:'المجتمع والتطوير',title:'ساعدنا نخلي التجربة أفضل.',
      intro:'أرسل اقتراحاً، شارك محتوى أو تصحيحاً، أو قيّم تجربتك. كل الملاحظات المفيدة تساعد على تحسين جودة الأسئلة والموقع.',
      publicNotice:'الإرسال يفتح GitHub Issue عام، لذلك يتطلب حساب GitHub. لا تكتب أي معلومات شخصية أو سرية.',
      suggestionTag:'اقتراح',suggestionTitle:'اقترح تحسيناً',suggestionText:'فكرة لميزة جديدة، تحسين تجربة الاختبار، تعديل واجهة، أو موضوع يحتاج تغطية أفضل.',
      area:'المجال',shortTitle:'عنوان مختصر',details:'التفاصيل',sendSuggestion:'إرسال الاقتراح',
      contributionTag:'مساهمة',contributionTitle:'شارك محتوى أو تصحيحاً',
      contributionText:'سؤال جديد، تصحيح إجابة، تحسين شرح، ترجمة، مصدر مفيد، أو مساهمة برمجية.',
      type:'نوع المساهمة',proposed:'المساهمة المقترحة',source:'المصدر أو المرجع — اختياري',sendContribution:'إرسال المساهمة',
      guide:'دليل المساهمة',ratingTag:'تقييم',ratingTitle:'قيّم تجربتك',
      ratingText:'قيّم الموقع من 1 إلى 5، واكتب أهم شيء أعجبك أو يحتاج تحسيناً.',overall:'التقييم العام',
      useful:'أكثر جزء فادك',comment:'ملاحظتك — اختياري',sendRating:'إرسال التقييم',
      chooseRating:'اختر عدداً من النجوم أولاً.',viewIssues:'عرض المشاركات العامة',
      footer:'المشروع مستقل وغير رسمي. المشاركات على GitHub عامة.'
    }
  },
  en: {
    app: {
      home:'Home',feedback:'Feedback',questions:'Questions',domains:'Domains',fullExam:'Full exam',randomized:'Random options',
      resumeAvailable:'You have an unfinished exam',resume:'Resume',rules:'Exam rules',rulesTitle:'Designed to break patterns',
      rule1:'Question order changes on every attempt.',rule2:'A/B/C/D order changes for every question on every attempt.',
      rule3:'Confidence is optional and never blocks navigation or submission.',rule4:'You can switch language during the exam without losing your answer.',
      mode:'Exam mode',chooseExam:'Choose how you want to test',
      weightedExam:n=>`Full exam — ${n} weighted questions`,weightedDesc:n=>`Questions are sampled from ${n} domains using the weights, then shuffled.`,
      startFull:n=>`Start ${n}-question exam`,sectionExam:'Single-domain exam',sectionDesc:'Choose any domain and test it independently.',
      sections:'Domains',sectionTests:'Standalone exams by section',start:'Start',bank:'Bank',weight:'Weight',count:'Questions',all:'All',
      flag:'⚑ Flag question',unflag:'✓ Remove flag',confidenceOptional:'Confidence — optional',
      confidenceNote:'Leave it blank if you do not want to use confidence.',low:'Low',medium:'Medium',high:'High',clear:'Clear',
      previous:'Previous',next:'Next',submitExam:'Submit exam',navigation:'Navigation',
      keyboardHint:'Shortcuts: 1–4 to answer, arrow keys to navigate.',result:'Result',correct:'Correct',wrong:'Wrong',unanswered:'Unanswered',
      confidenceUsed:'Confidence used',domainBreakdown:'Result by domain',reviewAnswers:'Review answers',newExam:'New exam',
      footer:'Training questions are unofficial · Progress is stored locally on your device.',answered:'Answered',of:'of',
      fullMode:'Weighted full exam',sectionMode:'Domain exam',
      confirmSubmit:'Submit the exam now? You may leave questions unanswered.',
      scoreText:(c,t)=>`${c} correct out of ${t}`,yourAnswer:'Your answer',correctAnswer:'Correct answer',notAnswered:'Not answered',
      resumeText:(i,t)=>`Question ${i} of ${t}`,
      errorBank:'The full question bank could not be loaded. Refresh the page and check your connection.'
    },
    feedback: {
      community:'Community',back:'Practice',eyebrow:'Community & improvement',title:'Help make the experience better.',
      intro:'Send a suggestion, contribute content or a correction, or rate your experience. Useful feedback helps improve both the question bank and the site.',
      publicNotice:'Submitting opens a public GitHub Issue and requires a GitHub account. Do not include personal, confidential, or sensitive information.',
      suggestionTag:'Suggestion',suggestionTitle:'Suggest an improvement',
      suggestionText:'Propose a feature, exam-experience improvement, interface change, or topic that needs better coverage.',
      area:'Area',shortTitle:'Short title',details:'Details',sendSuggestion:'Send suggestion',
      contributionTag:'Contribution',contributionTitle:'Contribute content or a correction',
      contributionText:'A new question, answer correction, explanation improvement, translation, useful source, or code contribution.',
      type:'Contribution type',proposed:'Proposed contribution',source:'Source or reference — optional',sendContribution:'Send contribution',
      guide:'Contribution guide',ratingTag:'Rating',ratingTitle:'Rate your experience',
      ratingText:'Rate the site from 1 to 5 and tell us what worked well or should improve.',overall:'Overall rating',
      useful:'Most useful part',comment:'Comment — optional',sendRating:'Send rating',chooseRating:'Choose a star rating first.',
      viewIssues:'View public submissions',footer:'This is an independent, unofficial project. GitHub submissions are public.'
    }
  }
};

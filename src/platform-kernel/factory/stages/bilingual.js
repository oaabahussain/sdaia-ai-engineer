import { assertTranslationProvider } from '../../providers/ports.js';

const CRITICAL_DIMENSIONS = Object.freeze([
  'learning_intent',
  'correct_answer',
  'reasoning',
  'distractor_logic',
  'terminology',
  'accuracy',
  'locale',
  'audience',
  'layout_markup'
]);

function evaluateReport(report) {
  if (!report || !report.dimensions || typeof report.dimensions !== 'object') {
    return { result: 'REVIEW_REQUIRED', reportId: report?.report_id ?? null };
  }

  let reviewRequired = false;

  for (const name of CRITICAL_DIMENSIONS) {
    const dimension = report.dimensions[name];

    if (!dimension || typeof dimension.result !== 'string') {
      reviewRequired = true;
      continue;
    }

    if (dimension.result === 'FAIL') {
      throw new Error(`Bilingual equivalence failed: ${name}`);
    }

    if (dimension.result === 'ABSTAIN') {
      reviewRequired = true;
      continue;
    }

    if (dimension.result !== 'PASS') {
      reviewRequired = true;
    }
  }

  if (report.overall_result === 'FAIL') {
    throw new Error('Bilingual equivalence failed: report');
  }

  if (
    reviewRequired ||
    report.overall_result === 'REVIEW_REQUIRED'
  ) {
    return {
      result: 'REVIEW_REQUIRED',
      reportId: report.report_id ?? null
    };
  }

  return {
    result: 'PASS',
    reportId: report.report_id ?? null
  };
}

export function createBilingualStage({ translationProvider = null } = {}) {
  if (translationProvider) assertTranslationProvider(translationProvider);

  return {
    name: 'bilingual',

    async run(ctx) {
      const prev = ctx.previous_output || {};
      const candidate = prev.candidate || {};

      const arQuestion = candidate.question_ar ?? candidate.question;
      const enQuestion = candidate.question_en;
      const arOptions = candidate.options_ar ?? candidate.options;
      const enOptions = candidate.options_en;

      if (
        typeof arQuestion !== 'string' ||
        typeof enQuestion !== 'string' ||
        !Array.isArray(arOptions) ||
        !Array.isArray(enOptions) ||
        arOptions.length !== enOptions.length
      ) {
        throw new Error('Bilingual question/options structure mismatch');
      }

      let result = 'PASS';
      let reportId = null;

      if (translationProvider) {
        const response = await translationProvider.checkEquivalence({
          ar: { question: arQuestion, options: arOptions },
          en: { question: enQuestion, options: enOptions }
        });

        if (response?.report) {
          const evaluated = evaluateReport(response.report);
          result = evaluated.result;
          reportId = evaluated.reportId;
        } else {
          if (response?.result === 'FAIL') {
            throw new Error('Bilingual equivalence failed');
          }
          if (
            response?.result === 'ABSTAIN' ||
            response?.result === 'REVIEW_REQUIRED'
          ) {
            result = 'REVIEW_REQUIRED';
          }
        }
      }

      return {
        ...prev,
        state: 'BILINGUAL_CHECKED',
        quality: {
          ...(prev.quality || {}),
          bilingual_equivalence: {
            result,
            ...(reportId ? { report_id: reportId } : {})
          }
        }
      };
    }
  };
}

import { evaluateReviewRequirement } from '../../policies/reviewPolicy.js';
import { decideReviewRequirement } from '../../policies/reviewCalibration.js';

function candidateId(candidate = {}) {
  return candidate.id ?? candidate.item_version_id ?? candidate.family_id ?? null;
}

function requireHumanApproval(decision, message = 'Human review required before approval') {
  if (
    !decision ||
    decision.reviewer_type !== 'human' ||
    decision.decision !== 'APPROVE'
  ) {
    throw new Error(message);
  }
}

export function createReviewStage({
  reviewPort,
  reviewPolicy,
  reviewCalibrationPolicy = null
}) {
  if (!reviewPort || typeof reviewPort.getLatestDecision !== 'function') {
    throw new Error('ReviewPort is required');
  }

  return {
    name: 'review',
    async run(ctx) {
      const prev = ctx.previous_output || {};
      const candidate = prev.candidate || {};
      const reviewContext = prev.review_context || {};
      const decision = await reviewPort.getLatestDecision(candidateId(candidate));

      if (reviewCalibrationPolicy) {
        const requirement = decideReviewRequirement({
          policy: reviewCalibrationPolicy,
          risk: reviewContext.risk,
          observedMetrics: prev.review_metrics || {},
          candidate: { ...candidate, ...reviewContext }
        });

        if (requirement.decision === 'HOLD') {
          throw new Error(`Review required: HOLD (${requirement.reason})`);
        }

        if (requirement.decision === 'HUMAN_REQUIRED') {
          requireHumanApproval(
            decision,
            `Human review required by calibration: ${requirement.reason}`
          );
        }

        if (
          requirement.decision === 'SAMPLED' &&
          requirement.selectedForReview
        ) {
          requireHumanApproval(
            decision,
            'Human review required by exception sample'
          );
        }

        if (
          ['AUTO_ELIGIBLE', 'SAMPLED'].includes(requirement.decision) &&
          !requirement.selectedForReview
        ) {
          if (reviewContext.governed_gates_passed !== true) {
            throw new Error('Governed quality gates must pass before automated approval');
          }
        }

        if (decision && decision.decision !== 'APPROVE') {
          throw new Error(`Review required: ${decision.decision}`);
        }

        const automated =
          requirement.decision === 'AUTO_ELIGIBLE' ||
          (requirement.decision === 'SAMPLED' && !requirement.selectedForReview);

        return {
          ...prev,
          state: 'APPROVED',
          review_requirement: requirement,
          review_decision: decision ?? (
            automated
              ? {
                  reviewer_type: 'automation-policy',
                  decision: 'APPROVE'
                }
              : {
                  reviewer_type: 'policy',
                  decision: 'APPROVE'
                }
          )
        };
      }

      const requirement = evaluateReviewRequirement(
        reviewContext,
        reviewPolicy
      );

      if (requirement.human_required) {
        requireHumanApproval(decision);
      }
      if (decision && decision.decision !== 'APPROVE') {
        throw new Error(`Review required: ${decision.decision}`);
      }

      return {
        ...prev,
        state: 'APPROVED',
        review_requirement: requirement,
        review_decision: decision ?? {
          reviewer_type: 'policy',
          decision: 'APPROVE'
        }
      };
    }
  };
}

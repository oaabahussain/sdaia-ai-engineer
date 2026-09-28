import test from 'node:test';import assert from 'node:assert/strict';test('review stage requires human approval for high-risk AI candidate',async()=>{const {createReviewStage}=await import('../src/platform-kernel/factory/stages/review.js');const policy={new_ai_requires_human:true,high_risk_requires_human:true,quarantined_requires_human:true,deterministic_sampling_rate:.1};const empty={async getLatestDecision(){return null}};const s=createReviewStage({reviewPort:empty,reviewPolicy:policy});await assert.rejects(()=>s.run({previous_output:{candidate:{id:'i1'},review_context:{generated_by_ai:true,risk:'high'}}}),/review required/i);const ok=createReviewStage({reviewPort:{async getLatestDecision(){return{reviewer_type:'human',decision:'APPROVE'}}},reviewPolicy:policy});const out=await ok.run({previous_output:{candidate:{id:'i1'},review_context:{generated_by_ai:true,risk:'high'}}});assert.equal(out.state,'APPROVED')});

test('review stage cannot bypass calibrated human review with automated approval', async () => {
  const { createReviewStage } = await import('../src/platform-kernel/factory/stages/review.js');

  const legacyPolicy = {
    new_ai_requires_human: false,
    high_risk_requires_human: false,
    quarantined_requires_human: false,
    deterministic_sampling_rate: 0
  };

  const calibrationPolicy = {
    risk_rules: [
      { risk_class: 'high', decision: 'HUMAN_REQUIRED' }
    ],
    mandatory_human_conditions: [],
    escalation_triggers: []
  };

  const automatedApproval = {
    async getLatestDecision() {
      return { reviewer_type: 'ai', decision: 'APPROVE' };
    }
  };

  const stage = createReviewStage({
    reviewPort: automatedApproval,
    reviewPolicy: legacyPolicy,
    reviewCalibrationPolicy: calibrationPolicy
  });

  await assert.rejects(
    () => stage.run({
      previous_output: {
        candidate: { id: 'i-calibrated' },
        review_context: { risk: 'high' },
        review_metrics: {}
      }
    }),
    /human review required|calibration/i
  );
});

test('review stage preserves K1 default behavior when no calibration policy is supplied', async () => {
  const { createReviewStage } = await import('../src/platform-kernel/factory/stages/review.js');

  const policy = {
    new_ai_requires_human: false,
    high_risk_requires_human: false,
    quarantined_requires_human: false,
    deterministic_sampling_rate: 0
  };

  const stage = createReviewStage({
    reviewPort: {
      async getLatestDecision() {
        return null;
      }
    },
    reviewPolicy: policy
  });

  const out = await stage.run({
    previous_output: {
      candidate: { id: 'i-default' },
      review_context: { deterministic: true, risk: 'low' }
    }
  });

  assert.equal(out.state, 'APPROVED');
  assert.equal(out.review_decision.reviewer_type, 'policy');
});


test('review stage auto-approves calibrated AUTO_ELIGIBLE content after governed gates pass', async () => {
  const { createReviewStage } = await import('../src/platform-kernel/factory/stages/review.js');

  const stage = createReviewStage({
    reviewPort: {
      async getLatestDecision() {
        return null;
      }
    },
    reviewPolicy: {
      new_ai_requires_human: false,
      high_risk_requires_human: false,
      quarantined_requires_human: false,
      deterministic_sampling_rate: 0
    },
    reviewCalibrationPolicy: {
      risk_rules: [
        { risk_class: 'low', decision: 'AUTO_ELIGIBLE' }
      ],
      mandatory_human_conditions: [],
      escalation_triggers: []
    }
  });

  const out = await stage.run({
    previous_output: {
      candidate: { id: 'auto-low-1' },
      review_context: {
        risk: 'low',
        governed_gates_passed: true
      },
      review_metrics: {}
    }
  });

  assert.equal(out.state, 'APPROVED');
  assert.equal(out.review_requirement.decision, 'AUTO_ELIGIBLE');
  assert.equal(out.review_decision.reviewer_type, 'automation-policy');
});

test('review stage does not auto-approve HOLD or selected exception-sample cases', async () => {
  const { createReviewStage } = await import('../src/platform-kernel/factory/stages/review.js');

  const base = {
    reviewPort: {
      async getLatestDecision() {
        return null;
      }
    },
    reviewPolicy: {
      new_ai_requires_human: false,
      high_risk_requires_human: false,
      quarantined_requires_human: false,
      deterministic_sampling_rate: 0
    }
  };

  const holdStage = createReviewStage({
    ...base,
    reviewCalibrationPolicy: {
      risk_rules: [
        { risk_class: 'medium', decision: 'HOLD' }
      ],
      mandatory_human_conditions: [],
      escalation_triggers: []
    }
  });

  await assert.rejects(
    () => holdStage.run({
      previous_output: {
        candidate: { id: 'hold-1' },
        review_context: { risk: 'medium', governed_gates_passed: true },
        review_metrics: {}
      }
    }),
    /hold|review required/i
  );

  const sampledStage = createReviewStage({
    ...base,
    reviewCalibrationPolicy: {
      risk_rules: [
        { risk_class: 'low', decision: 'SAMPLED', sampling_rate: 1 }
      ],
      mandatory_human_conditions: [],
      escalation_triggers: []
    }
  });

  await assert.rejects(
    () => sampledStage.run({
      previous_output: {
        candidate: { id: 'sampled-1' },
        review_context: { risk: 'low', governed_gates_passed: true },
        review_metrics: {}
      }
    }),
    /human review required|sample/i
  );
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const REQUIRED=["PROCESS_FAILURE_RULES_VALID","TASK_PACKET_SCHEMA_VALID","TASK_PACKET_COMPILER_VALID","TASK_EXECUTION_BINDER_VALID","ALL_REMAINING_TASK_PACKETS_VALID","TASK_PACKET_DETERMINISM_VALID","TASK_SCOPE_GUARD_VALID","BEHAVIORAL_RED_GUARD_VALID","ACCEPTED_RED_FREEZE_VALID","DYNAMIC_REF_GUARD_VALID","TEST_CONTRACT_GUARD_VALID","RUNTIME_CAPABILITY_PROFILE_VALID","RESULT_VALIDATOR_VALID","CI_EXECUTION_MODEL_VALID","TASK5_DRY_RUN_PASS","ADVERSARIAL_READINESS_PASS"];
test('repository state exposes every H0-R2 readiness gate without claiming readiness',()=>{
 const state=JSON.parse(readFileSync(new URL('../docs/superpowers/state/CURRENT-STATE.json',import.meta.url),'utf8'));
 for(const gate of REQUIRED) assert.ok(Object.hasOwn(state.gates,gate),gate);
 assert.equal(state.low_model_ready,false);
 assert.notEqual(state.gates.TASK5_DRY_RUN_PASS,'PASS');
 assert.notEqual(state.gates.ADVERSARIAL_READINESS_PASS,'PASS');
 assert.notEqual(state.gates.ISOLATED_WORKSPACE_READY,'PASS');
});

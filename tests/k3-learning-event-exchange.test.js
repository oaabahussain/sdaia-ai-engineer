import test from 'node:test';
import assert from 'node:assert/strict';

async function ports(){
  return import('../src/platform-kernel/interoperability/ports.js');
}

function validReport(overrides={}){
  return {
    mapping_version:'xapi-k3.v1',
    mapped_ids:[{source_id:'event-1',target_id:'statement-1'}],
    omissions:[{source_id:'event-2',reason_code:'UNSUPPORTED_SEMANTICS'}],
    rejections:[{source_id:'event-3',reason_code:'INVALID_REQUIRED_CONTEXT'}],
    provenance:{
      adapter_id:'xapi',
      adapter_version:'1',
      source_standard:'xAPI',
      source_version:'2.0'
    },
    ...overrides
  };
}

test('Task 31 exposes a reusable mapping-report assertion for LearningEventExchangePort results',async()=>{
  const p=await ports();
  assert.equal(typeof p.assertLearningEventExchangeResult,'function','Task 31 result-contract assertion is missing');
  const result={statements:[],...validReport()};
  assert.equal(p.assertLearningEventExchangeResult(result),result);
});

test('Task 31 requires versioned mapping, mapped ID pairs, omissions/rejections, and provenance',async()=>{
  const p=await ports();
  assert.equal(typeof p.assertLearningEventExchangeResult,'function','Task 31 result-contract assertion is missing');
  const required=[
    ['mapping_version',undefined],
    ['mapped_ids',undefined],
    ['omissions',undefined],
    ['rejections',undefined],
    ['provenance',undefined]
  ];
  for(const [key,value] of required){
    const candidate=validReport();
    candidate[key]=value;
    assert.throws(()=>p.assertLearningEventExchangeResult(candidate),new RegExp(key.replace('_','[ _]'),'i'));
  }
});

test('Task 31 rejects ambiguous mapping rows and provenance that cannot audit the adapter',async()=>{
  const p=await ports();
  assert.equal(typeof p.assertLearningEventExchangeResult,'function','Task 31 result-contract assertion is missing');
  assert.throws(
    ()=>p.assertLearningEventExchangeResult(validReport({mapped_ids:[{source_id:'event-1'}]})),
    /mapped.*target|target.*id/i
  );
  assert.throws(
    ()=>p.assertLearningEventExchangeResult(validReport({omissions:[{source_id:'event-2'}]})),
    /omission.*reason|reason_code/i
  );
  assert.throws(
    ()=>p.assertLearningEventExchangeResult(validReport({rejections:[{source_id:'event-3'}]})),
    /rejection.*reason|reason_code/i
  );
  assert.throws(
    ()=>p.assertLearningEventExchangeResult(validReport({provenance:{adapter_id:'xapi'}})),
    /provenance|adapter_version|source_standard|source_version/i
  );
});

test('Task 31 allows adapters to add standard-specific payloads without changing the common report',async()=>{
  const p=await ports();
  assert.equal(typeof p.assertLearningEventExchangeResult,'function','Task 31 result-contract assertion is missing');
  const xapi={statements:[{id:'statement-1'}],...validReport()};
  const caliper={events:[{id:'caliper-1'}],...validReport({mapping_version:'caliper-k3.v1',provenance:{adapter_id:'caliper',adapter_version:'1',source_standard:'Caliper',source_version:'1.2'}})};
  assert.equal(p.assertLearningEventExchangeResult(xapi),xapi);
  assert.equal(p.assertLearningEventExchangeResult(caliper),caliper);
});

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createFileJobStore } from './adapters/fileJobStore.js';
import { createJsonlAuditStore } from './adapters/jsonlAuditStore.js';
import { createK2GovernanceFileStore } from './adapters/k2GovernanceFileStore.js';
import { createLocalRunner } from '../../src/platform-kernel/orchestration/localRunner.js';
import { buildTranchePlan } from '../../src/platform-kernel/orchestration/tranchePlan.js';
import { runTranche, resumeTranche } from '../../src/platform-kernel/orchestration/trancheRunner.js';

function cliBuildRequest({tranchePlan,request,indexWithinGap,globalIndex}){
  return {
    run_id:`k2:${tranchePlan.tranche_id}:${globalIndex}`,
    target_id:`family:${tranchePlan.tranche_id}:${globalIndex}`,
    input:{coverage_gap_id:request.coverage_gap_id,index_within_gap:indexWithinGap}
  };
}

function expectedRequests(plan){
  const out=[];let globalIndex=0;
  for(const request of plan.requests||[]){
    for(let indexWithinGap=0;indexWithinGap<request.requested_families;indexWithinGap++){
      out.push(cliBuildRequest({tranchePlan:plan,request,indexWithinGap,globalIndex}));
      globalIndex++;
    }
  }
  return out;
}

function createK2CliFacade({store,runner,jobStore}){
  async function read(id){
    const plan=await store.get('tranche',id);
    if(!plan)throw new Error('K2 tranche not found');
    return plan;
  }
  async function status(id){
    const plan=await read(id);const jobs=[];
    for(const request of expectedRequests(plan))jobs.push(await jobStore.get(request.run_id));
    const present=jobs.filter(Boolean);
    let state='PLANNED';
    if(present.length){
      const completed=present.filter(x=>x.status==='completed').length;
      const failed=present.filter(x=>x.status==='failed').length;
      if(completed===jobs.length)state='COMPLETED';
      else if(failed===jobs.length)state='FAILED';
      else if(completed||failed)state='PARTIAL';
      else state='RUNNING';
    }
    return {tranche_id:id,status:state,completed:present.filter(x=>x.status==='completed').length,failed:present.filter(x=>x.status==='failed').length,expected:jobs.length};
  }
  return {
    read,
    async plan(payload){
      const plan=buildTranchePlan(payload.expansionPlan,payload.trancheDecision,payload.policyRefs);
      await store.put('tranche',plan.tranche_id,plan);
      return plan;
    },
    async run(id){
      const plan=await read(id);
      return runTranche(plan,runner,{approved:true,buildRequest:cliBuildRequest});
    },
    status,
    async resume(id){
      const plan=await read(id);const completed=[];const failed=[];
      for(const request of expectedRequests(plan)){
        const job=await jobStore.get(request.run_id);
        if(job?.status==='completed')completed.push({run_id:job.run_id,status:'completed'});
        if(job?.status==='failed')failed.push({run_id:job.run_id,target_id:job.target_id,stage:job.stage,error:job.retry?.reason??'failed',retryable:job.retry?.eligible!==false});
      }
      return resumeTranche(plan,runner,{tranche_id:id,status:'PARTIAL',request_count:expectedRequests(plan).length,completed,failed},{approved:true,buildRequest:cliBuildRequest});
    }
  };
}

export function createCliDeps(root){
  const jobStore=createFileJobStore(path.join(root,'jobs'));
  const auditStore=createJsonlAuditStore(path.join(root,'audit.jsonl'));
  const pipeline={stages:[{name:'local',async run({request}){return{state:'LOCAL_PROCESSED',candidate:structuredClone(request?.input??null)}}}]};
  const runner=createLocalRunner({pipeline,jobStore,auditStore});
  const k2Store=createK2GovernanceFileStore(path.join(root,'k2-governance'));
  return{jobStore,runner,k2:createK2CliFacade({store:k2Store,runner,jobStore})};
}

async function runK2(args,k2,io){
  const [sub,arg]=args;
  if(!k2){io.error('K2 CLI dependencies unavailable');return 2}
  if(!['read','plan','run','status','resume'].includes(sub)){io.error('Unknown K2 command');return 2}
  try{
    let result;
    if(sub==='plan'){
      let payload;
      try{payload=JSON.parse(arg||'')}catch{io.error('K2 plan payload must be JSON');return 2}
      result=await k2.plan(payload);
    }else{
      if(!arg||typeof k2[sub]!=='function')return 2;
      result=await k2[sub](arg);
    }
    io.log(JSON.stringify(result));
    return 0;
  }catch(error){
    io.error(error instanceof Error?error.message:String(error));
    return 1;
  }
}

export async function main(argv,deps={},io=console){
  const [cmd,arg,...rest]=argv;
  if(cmd==='k2')return runK2([arg,...rest],deps.k2,io);
  if(cmd==='status'){if(!arg||!deps.jobStore)return 2;const job=await deps.jobStore.get(arg);io.log(JSON.stringify(job??{run_id:arg,status:'not_found'}));return job?0:1}
  if(cmd==='run'){if(!deps.runner)return 2;await deps.runner.runCandidate(JSON.parse(arg||'{}'));return 0}
  if(cmd==='resume'){if(!arg||!deps.runner)return 2;await deps.runner.resumeRun(arg);return 0}
  if(cmd==='retry'){if(!arg||!rest[0]||!deps.runner)return 2;await deps.runner.retryStage(arg,rest[0]);return 0}
  io.error('Unknown factory command');return 2;
}
const isMain=process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url);
if(isMain){const root=path.resolve(process.env.K1_FACTORY_ROOT||'.factory');const code=await main(process.argv.slice(2),createCliDeps(root),console);process.exitCode=code}

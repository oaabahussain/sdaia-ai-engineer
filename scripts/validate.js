import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { expandConceptBank } from '../src/logic/questionBank.js';
import { weightedAllocation } from '../src/logic/exam.js';
import { loadConcepts } from './load_concepts.js';
const root=process.cwd();const read=name=>JSON.parse(fs.readFileSync(path.join(root,name),'utf8'));
const concepts=loadConcepts(root),weights=read('data/weights.json');
const questions=expandConceptBank(concepts);
if(questions.length<1000)throw new Error(`Expected >=1000 generated questions, found ${questions.length}`);
const ids=new Set(),prompts=new Set(),answerCounts=[0,0,0,0],domainCounts=Object.fromEntries(Object.keys(weights).map(d=>[d,0]));
for(const q of questions){if(ids.has(q.id))throw new Error(`Duplicate id ${q.id}`);ids.add(q.id);const k=`${q.domain}|${q.question}|${q.question_en}`;if(prompts.has(k))throw new Error(`Duplicate prompt ${q.id}`);prompts.add(k);if(!(q.domain in domainCounts))throw new Error(`Unknown domain ${q.domain}`);if(!q.question||!q.question_en||q.options.length!==4||q.options_en.length!==4||q.answer<0||q.answer>3)throw new Error(`Invalid bilingual question ${q.id}`);domainCounts[q.domain]++;answerCounts[q.answer]++}
const sum=Object.values(weights).reduce((s,n)=>s+Number(n),0);if(Math.abs(sum-100)>1e-9)throw new Error(`Weights sum ${sum}`);for(const [d,n] of Object.entries(domainCounts))if(n<100)throw new Error(`${d} only ${n}`);if(Math.max(...answerCounts)-Math.min(...answerCounts)>Math.ceil(questions.length*.08))throw new Error(`Answer imbalance ${answerCounts}`);const allocation=weightedAllocation(weights,200);if(Object.values(allocation).reduce((s,n)=>s+n,0)!==200)throw new Error('Allocation !=200');
console.log(`generated questions: PASS (${questions.length})`);console.log(`domains: PASS ${JSON.stringify(domainCounts)}`);console.log(`answer positions: PASS ${answerCounts.join('/')}`);console.log(`weights: PASS (${sum.toFixed(1)})`);console.log(`weighted 200: PASS ${JSON.stringify(allocation)}`);

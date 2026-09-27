import {assertCriticProvider} from '../../providers/ports.js';
export function createCritiqueStage({critic}){assertCriticProvider(critic);return{name:'critique',async run(ctx){const prev=ctx.previous_output||{};const critique=await critic.critique(prev.candidate,{context:ctx});return{...prev,state:'CRITIQUED',critique}}}}

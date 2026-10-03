import { readFileSync,writeFileSync } from 'node:fs';
import { Simulation,replay } from '../packages/simulation/src/simulation';
import { validateSave } from '../packages/persistence/src/save';
import { decisions,type Policy } from './gameplay/policies';
import { compareBranches } from './counterfactual';
const traces:unknown[]=[];
function trace(name:string,sim:Simulation,days:number,policy?:Policy){
  const signals:unknown[]=[],outcomes:unknown[]=[],underlying:unknown[]=[],seen=new Set<string>(),originTick=sim.observe().tick;
  const record=(key:string,value:unknown)=>{if(!seen.has(key)){seen.add(key);signals.push(value);}};
  let priorEventCount=sim.observe().events.length;
  for(let day=0;day<=days;day++){
    const v=sim.observe(),w=sim.snapshot();
    if(!v.bankrupt){
      if((v.finance.runway??Infinity)<6)record('runway6',{kind:'runway-under6',tick:v.tick});
      if((v.finance.runway??Infinity)<3)record('runway3',{kind:'runway-under3',tick:v.tick});
      if((v.finance.runway??Infinity)<1)record('runway1',{kind:'runway-under1',tick:v.tick});
      if(v.finance.forecast.cashAfterClose<=0)record('close',{kind:'next-close-insufficient-at-current-contracts',tick:v.tick});
    }
    for(const e of v.employees)if(e.status==='active'&&e.condition!=='狀態穩定')record(`condition:${e.id}:${e.condition}`,{kind:'employee-condition',id:e.id,condition:e.condition,tick:v.tick});
    for(const c of v.customers)if(['需要跟進','體驗轉弱'].includes(c.condition))record(`customer:${c.id}`,{kind:'customer-followup',id:c.id,condition:c.condition,tick:v.tick});
    for(const e of Object.values(w.employees))for(const [risk,active] of [['stress>65',e.psychology.stress>65],['burnout>50',e.psychology.burnout>50],['exitIntent>30',e.psychology.exitIntent>30]] as const){
      const key=`hidden:${e.id}:${risk}`;if(active&&!seen.has(key)){seen.add(key);underlying.push({diagnosticOnly:true,id:e.id,risk,tick:v.tick});}
    }
    for(const e of w.events.slice(priorEventCount))if(['CompanyBankrupt','EmployeeConcernRaised','EmployeeResigned','CustomerChurned','RelationshipStrained','RunwayWarning'].includes(e.type))outcomes.push(e);
    priorEventCount=w.events.length;
    if(day===days||v.bankrupt)break;
    if(policy&&day%14===0)for(const c of decisions(policy,v))sim.execute(c);
    sim.execute({type:'AdvanceTime',days:1});
  }
  const world=sim.snapshot();if(replay(world).stateHash()!==sim.stateHash())throw Error('Trace replay mismatch');
  traces.push({name,originTick,endTick:world.meta.tick,signals,outcomes,underlying,bankrupt:world.company.bankrupt,hash:sim.stateHash()});
}
for(const policy of ['passive','aggressive','conservative'] as const)trace(policy,new Simulation({seed:'benchmark-001',name:'Garage Startup',scenario:'garage'}),365,policy);
const underpaid=new Simulation({seed:'retention-001',name:'Garage Startup',scenario:'garage'});underpaid.execute({type:'ChangeSalary',employeeId:'employee-2',salary:0});trace('underpaid-retention',underpaid,365);
const lean=Simulation.restore(validateSave(JSON.parse(readFileSync('docs/phase1_5/data/lean-benchmark-001-730.save.json','utf8'))).world);
const workloadOrigin=lean.snapshot();lean.execute({type:'ChangeCompanyStrategy',strategy:'growth'});trace('growth-after-survival',lean,730);
const workloadRecovery=compareBranches(workloadOrigin,[{type:'ChangeCompanyStrategy',strategy:'growth'}],[{type:'ChangeCompanyStrategy',strategy:'sustainable'}],365);
const stressed=Simulation.restore(workloadOrigin);stressed.execute({type:'ChangeCompanyStrategy',strategy:'growth'});stressed.execute({type:'AdvanceTime',days:300});
const healthRecovery=compareBranches(stressed.snapshot(),[{type:'ChangeCompanyStrategy',strategy:'sustainable'}],[],180);
const unpaid=new Simulation({seed:'churn-diagnostic-001',name:'Unpaid growth diagnostic',scenario:'garage'});
unpaid.execute({type:'ChangeCompanyStrategy',strategy:'growth'});
for(let i=0;i<40;i++)unpaid.execute({type:'HireEmployee',name:`Unpaid ${i+1}`,role:'Engineer',salary:0,teamId:'team-1'});
trace('pathological-unpaid-growth (legal commands, diagnostic only)',unpaid,365);
writeFileSync('docs/phase1_5/data/warning-traces.json',JSON.stringify({diagnostics:'Underlying risk onsets are omniscient only; strategies still use CompanyView.',traces,workloadRecovery,healthRecovery},null,2)+'\n');console.log(traces.map(t=>{const r=t as {name:string;endTick:number;bankrupt:boolean};return {name:r.name,endTick:r.endTick,bankrupt:r.bankrupt};}));

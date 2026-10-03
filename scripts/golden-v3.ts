import { writeFileSync } from 'node:fs';
import { Simulation } from '../packages/simulation/src/simulation';
export function goldenOrganization(seed: string) {
  const sim=new Simulation({seed,name:'Organization golden',scenario:'garage',initialCash:10_000_000_000},true,3);
  sim.execute({type:'ChangeCompanyStrategy',strategy:'sustainable'});
  sim.execute({type:'CreateTeam',name:'Delivery',managerId:'employee-2'});
  sim.execute({type:'MoveEmployeeToTeam',employeeId:'employee-3',teamId:Object.keys(sim.snapshot().teams)[1]});
  sim.execute({type:'AdvanceTime',days:90});
  sim.execute({type:'PromoteEmployee',employeeId:'employee-3',track:'manager'});
  sim.execute({type:'AssignManager',employeeId:'employee-3',managerId:'employee-1'});
  return sim;
}
if(process.argv.includes('--write')) {
  const results:Record<string,Record<string,string>>={};
  for(const seed of ['organization-001','career-3','career-4']) {
    const sim=goldenOrganization(seed);results[seed]={};let previous=90;
    for(const tick of [365,1096,1826]) {sim.execute({type:'AdvanceTime',days:tick-previous});previous=tick;results[seed][tick]=sim.stateHash();}
  }
  writeFileSync('tests/fixtures/golden-v3.json',JSON.stringify({simulationVersion:3,reason:'Explicit new organization histories with capitalized 5-year observation; v3 concern episodes and attainable leadership responsibility and command-linked organizational causes calibrated before release; historical fixtures untouched.',results},null,2)+'\n');
}

/* Run from repository root: node senatsvalg/tests/model-parity.test.js
   Reproducible test using frozen 2026 inputs and expected outputs.
   These fixtures are not historical election validation.
*/
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const fixture=JSON.parse(read('tests/data/polls-2026-snapshot.json'));
const expected=JSON.parse(read('tests/data/expected-forecast-results.json'));
const sandbox={window:{},localStorage:{getItem:()=>null,setItem:()=>{}},console,Date,Math,JSON};
vm.createContext(sandbox);
for(const file of ['js/forecast-experiment.js','js/probability-model.js'])vm.runInContext(read(file),sandbox,{filename:file});
const states=fixture.states;
const core=sandbox.window.SenateForecastExperiment;
const model=sandbox.window.SenateProbabilityModel;
assert.equal(core.settings().variant,'classic');
assert.equal(core.settings().shared,3);
assert.equal(states.length,35);
assert.equal(expected.runs.length,4);
function near(actual,want,context,tolerance=1e-7){
 if(actual===null||want===null){assert.equal(actual,want,context);return;}
 assert.ok(Number.isFinite(actual)&&Math.abs(actual-want)<tolerance,context+': '+actual+' ≠ '+want);
}
for(const run of expected.runs){
 const opts=run.settings,result=model.compute(states,opts);
 near(result.results.linear.national.majority,run.linearMajority,'linear majority');
 near(result.results.accelerated.national.majority,run.acceleratedMajority,'accelerated majority');
 const byState=new Map(run.races.map(x=>[x.state,x]));
 for(const row of states){
  const snap=core.snapshot(row,opts,states),want=byState.get(row.state);
  assert.ok(want,'Missing state '+row.state);
  for(const [label,actual,expected] of [['margin',snap.margin,want.margin],['house effect',snap.houseAdjustment,want.houseAdjustment],['trend',snap.trend,want.trend],['acceleration',snap.accel,want.accel]])near(actual,expected,opts.variant+' '+row.state+' '+label);
  for(const kind of ['linear','accelerated']){
   const forecast=core.forecast(snap,kind,opts);
   const race=result.results[kind].races.find(r=>r.state===row.state);
   near(forecast,race.margin,'website/probability forecast '+row.state+' '+kind);
   for(const field of ['margin','sigma'])near(race[field],want[kind][field],kind+' '+row.state+' '+field);
   near(race.p,want[kind].probability,kind+' '+row.state+' win probability');
  }
 }
 for(const kind of ['linear','accelerated']){
  const mass=result.results[kind].national.distribution;
  const expectedMass=run[kind+'Distribution'];
  assert.equal(mass.length,expectedMass.length);
  mass.forEach((v,i)=>near(v,expectedMass[i],kind+' national distribution '+i));
  near(mass.reduce((a,b)=>a+b,0),1,kind+' probability normalization');
 }
 console.log('PASS',opts.variant,opts.weighted?'time weighted':'equal weighted');
}

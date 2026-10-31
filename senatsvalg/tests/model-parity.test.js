/* Run from repository root: node senatsvalg/tests/model-parity.test.js
   Protect shared forecasts and probabilities used by website and presentation.
*/
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const sandbox={window:{},localStorage:{getItem:()=>null,setItem:()=>{}},console,Date,Math,JSON};
vm.createContext(sandbox);
for(const file of ['data/polls.js','js/forecast-experiment.js','js/probability-model.js'])vm.runInContext(read(file),sandbox,{filename:file});
const states=vm.runInContext('MODEL.states',sandbox);
const core=sandbox.window.SenateForecastExperiment;
const model=sandbox.window.SenateProbabilityModel;
assert.equal(core.settings().variant,'classic');
assert.equal(core.settings().shared,3);
assert.equal(states.length,35);
for(const weighted of [false,true]){
 for(const variant of ['classic','experimental']){
  const opts={...core.settings(),weighted,half:4,variant},result=model.compute(states,opts);
  for(const row of states){
   const snapshot=core.snapshot(row,opts,states);
   for(const kind of ['linear','accelerated']){
    const expected=core.forecast(snapshot,kind,opts);
    const actual=result.results[kind].races.find(r=>r.state===row.state).margin;
    if(Number.isFinite(expected)){
     assert.ok(Math.abs(expected-actual)<1e-8,variant+' '+kind+' '+row.state+': '+expected+' vs '+actual);
    }else assert.equal(actual,null);
   }
  }
  for(const kind of ['linear','accelerated']){
   const sum=result.results[kind].national.distribution.reduce((a,b)=>a+b,0);
   assert.ok(Math.abs(1-sum)<1e-8,variant+' '+kind+': distribution sums to '+sum);
  }
  console.log('PASS',variant,weighted?'time weighting':'equal weighting');
 }
}

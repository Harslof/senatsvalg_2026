/* Historical Senate backtest — isolated from public forecast.
 * Input normalized as [{year,state,electionDate,resultMargin,points:[{x,end,y,published}]}].
 * D−R margin; outcome must be actual D/R general-election vote shares.
 * No invented results, no fallback to polling averages as election outcomes.
 */
(function(root){'use strict';
const api=root.SenateForecastCandidates,DAY=86400000,WEEK=7*DAY;
const horizons=[1,2,4,8,12],kinds=['baseline','damped','linear','quadratic'];
const date=s=>/^\d{4}-\d{2}-\d{2}$/.test(String(s))?Date.parse(s+'T12:00:00Z'):NaN;
const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null;
function run(races,{weighted=false,half=4,tau=4,publicationLag=2,strictPublication=false}={}){
 const records=[],excluded={invalid:0,noPolls:0,notEnoughHistory:0,notAllModels:0};
 for(const race of races||[]){
  const election=date(race.electionDate),actual=race.resultMargin==null||race.resultMargin===''?NaN:Number(race.resultMargin);
  if(!Number.isFinite(election)||!Number.isFinite(actual)){excluded.invalid++;continue;}
  const ps=(race.points||[]).filter(p=>Number.isFinite(p.y)&&Number.isFinite(date(p.x))&&Number.isFinite(date(p.end||p.x))&&date(p.x)<=date(p.end||p.x));
  if(!ps.length){excluded.noPolls++;continue;}
  for(const weeks of horizons){
   const cutoff=election-weeks*WEEK;
   const history=ps.filter(p=>{
    const end=date(p.end||p.x),published=date(p.published);
    return end<=cutoff&&(!strictPublication||Number.isFinite(published))&&
     (Number.isFinite(published)?published:end+publicationLag*DAY)<=cutoff;
   });
   if(history.length<3){excluded.notEnoughHistory++;continue;}
   const s=api.snapshot(history,{weighted,half});
   if(!s){excluded.notEnoughHistory++;continue;}
   const predictions={baseline:s.margin,damped:api.project(s,weeks,{kind:'damped',tau}),
    linear:s.hasTrend?api.project(s,weeks,{kind:'linear'}):null,
    quadratic:s.hasAcceleration?api.project(s,weeks,{kind:'quadratic'}):null};
   if(!kinds.every(k=>Number.isFinite(predictions[k]))){excluded.notAllModels++;continue;}
   const errors=Object.fromEntries(kinds.map(k=>[k,actual-predictions[k]]));
   records.push({year:race.year,state:race.state,electionDate:race.electionDate,weeks,actual,history:history.length,predictions,errors});
  }
 }
 const summarize=(items,k)=>{
  const e=items.map(x=>x.errors[k]),n=e.length;
  return {n,mae:mean(e.map(Math.abs)),bias:mean(e),rmse:n?Math.sqrt(mean(e.map(x=>x*x))):null};
 };
 const summary=items=>Object.fromEntries(kinds.map(k=>[k,summarize(items,k)]));
 return {records,overall:summary(records),byHorizon:horizons.map(weeks=>({weeks,results:summary(records.filter(r=>r.weeks===weeks))})),
  byYear:[...new Set(records.map(r=>r.year))].sort().map(year=>({year,results:summary(records.filter(r=>r.year===year))})),
  excluded,kinds,uniqueRaces:new Set(records.map(r=>r.year+'|'+r.state)).size};
}
root.SenateHistoricalBacktest=Object.freeze({run,horizons});
})(typeof window!=='undefined'?window:globalThis);

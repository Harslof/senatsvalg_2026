/* Experimental rolling-origin diagnostic against later polls (NOT election outcomes).
 * Train only on completed fieldwork, group same-end-date targets.
 * Fixed forecast horizons, nearest target within predeclared tolerance,
 * one target per origin, paired-model evaluation, equal state weighting.
 * Publication dates are not yet available: results are not fully as-of safe.
 */
(function(root){
'use strict';
const WEEK=604800000,DAY=86400000,api=root.SenateForecastCandidates;
const names={baseline:'Uændret margin',damped:'Aftagende trend',linear:'Lineær trend',quadratic:'Acceleration'};
const horizons=[{weeks:1,tolerance:3},{weeks:2,tolerance:4},{weeks:4,tolerance:7},{weeks:8,tolerance:10},{weeks:12,tolerance:14}];
const kinds=Object.keys(names);
const date=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)?Date.parse(s+'T12:00:00Z'):NaN;
const end=p=>date(p.end||p.x);
const publication=p=>date(p.published||p.publishedAt||p.publicationDate);
const available=(p,lag)=>Number.isFinite(publication(p))?publication(p):end(p)+lag*DAY;
const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null;
const summarize=(records,kind)=>{
 const a=records.filter(r=>Number.isFinite(r.errors[kind])).map(r=>r.errors[kind]);
 return {n:a.length,mae:mean(a.map(Math.abs)),bias:mean(a),rmse:a.length?Math.sqrt(mean(a.map(x=>x*x))):null};
};
function aggregate(records,kind){
 const states=[...new Set(records.map(r=>r.state))];
 const per=states.map(state=>summarize(records.filter(r=>r.state===state),kind)).filter(s=>s.n);
 return {states:per.length,n:per.reduce((s,x)=>s+x.n,0),mae:mean(per.map(x=>x.mae)),bias:mean(per.map(x=>x.bias)),rmse:mean(per.map(x=>x.rmse))};
}
function run(rows,{weighted=false,half=4,tau=4,minHistory=3,publicationLag=0,strictPublication=false,bootstrapReps=1000}={}){
 if(!(half>0&&tau>0))throw Error('Halveringstid og tau skal være positive');
 if(!Number.isInteger(publicationLag)||publicationLag<0||publicationLag>14)throw Error('Forsinkelse skal være 0–14 dage');
 if(!Number.isInteger(bootstrapReps)||bootstrapReps<0||bootstrapReps>5000)throw Error('Bootstrap skal være 0–5000 gentagelser');
 const records=[],states=[];let knownPublication=0,missingPublication=0;
 for(const race of rows||[]){
  const eligible=(race.points||[]).filter(p=>Number.isFinite(p.y)&&Number.isFinite(date(p.x))&&Number.isFinite(end(p))&&date(p.x)<=end(p));
  knownPublication+=eligible.filter(p=>Number.isFinite(publication(p))).length;
  missingPublication+=eligible.filter(p=>!Number.isFinite(publication(p))).length;
  const ps=eligible.filter(p=>!strictPublication||Number.isFinite(publication(p))).sort((a,b)=>end(a)-end(b));
  const days=[...new Set(ps.map(end))];
  const grouped=new Map(days.map(day=>[day,ps.filter(p=>end(p)===day)]));
  let tests=0;
  for(let i=0;i<days.length-1;i++){
   const origin=days[i],history=ps.filter(p=>end(p)<=origin&&available(p,publicationLag)<=origin);
   if(history.length<minHistory)continue;
   const s=api.snapshot(history,{weighted,half});
   if(!s)continue;
   const used=new Set();
   for(const h of horizons){
    const candidates=days.slice(i+1).filter(day=>!used.has(day)&&Math.abs((day-origin)/DAY-7*h.weeks)<=h.tolerance)
      .sort((a,b)=>Math.abs((a-origin)/DAY-7*h.weeks)-Math.abs((b-origin)/DAY-7*h.weeks)||a-b);
    if(!candidates.length)continue;
    const target=candidates[0];used.add(target);
    const horizon=(target-origin)/WEEK,observed=mean(grouped.get(target).map(p=>p.y));
    const predictions={baseline:s.margin,damped:api.project(s,horizon,{kind:'damped',tau}),
     linear:s.hasTrend?api.project(s,horizon,{kind:'linear'}):null,
     quadratic:s.hasAcceleration?api.project(s,horizon,{kind:'quadratic'}):null};
    const errors={};for(const k of kinds)errors[k]=Number.isFinite(predictions[k])?observed-predictions[k]:null;
    records.push({state:race.state,origin:new Date(origin).toISOString().slice(0,10),
     target:new Date(target).toISOString().slice(0,10),horizon,nominalWeeks:h.weeks,
     observed,targetPolls:grouped.get(target).length,history:history.length,predictions,errors});
    tests++;
   }
  }
  states.push({state:race.state,polls:ps.length,tests});
 }
 const paired=records.filter(r=>kinds.every(k=>Number.isFinite(r.errors[k])));
 const make=items=>Object.fromEntries(kinds.map(k=>[k,aggregate(items,k)]));
 const overall=make(paired),extended=make(records);
 // Cluster bootstrap resamples entire states; paired MAE differences preserve dependence within state.
 const stateGroups=[...new Set(paired.map(r=>r.state))].map(state=>paired.filter(r=>r.state===state));
 let seed=2166136261;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const bootstrap={};
 for(const kind of kinds){
  if(!stateGroups.length||!bootstrapReps){bootstrap[kind]={estimate:null,lower:null,upper:null,reps:0};continue;}
  const delta=stateGroups.map(group=>mean(group.map(r=>Math.abs(r.errors[kind])-Math.abs(r.errors.baseline))));
  const draws=[];
  for(let b=0;b<bootstrapReps;b++){
   let sum=0;for(let j=0;j<delta.length;j++)sum+=delta[Math.floor(random()*delta.length)];
   draws.push(sum/delta.length);
  }
  draws.sort((a,b)=>a-b);
  bootstrap[kind]={estimate:mean(delta),lower:draws[Math.floor(.025*(draws.length-1))],upper:draws[Math.ceil(.975*(draws.length-1))],reps:bootstrapReps};
 }
 const bins=horizons.map(h=>({label:h.weeks+' '+(h.weeks===1?'uge':'uger'),
  weeks:h.weeks,results:make(paired.filter(r=>r.nominalWeeks===h.weeks)),
  extended:make(records.filter(r=>r.nominalWeeks===h.weeks))}));
 const byState=states.map(st=>({state:st.state,polls:st.polls,tests:st.tests,
  paired:paired.filter(r=>r.state===st.state).length,
  results:make(paired.filter(r=>r.state===st.state))}));
 return {records,paired,overall,extended,bins,byState,kinds,names,states:states.length,
  validStates:byState.filter(x=>x.paired).length,bootstrap,publication:{known:knownPublication,missing:missingPublication},settings:{weighted,half,tau,minHistory,publicationLag,strictPublication,bootstrapReps}};
}
root.SenateRollingOrigin=Object.freeze({run,horizons});
})(typeof window!=='undefined'?window:globalThis);

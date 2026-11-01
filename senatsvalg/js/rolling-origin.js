/* Rolling-origin diagnostic: predicts later polls, never election results.
   Chronology uses fieldwork END to avoid training on polls not yet completed.
   Each origin groups polls ending on the same day, excluding all same-day targets.
   Experimental only; does not change the public forecast. */
(function(root){
'use strict';
const WEEK=604800000,DAY=86400000;
const api=root.SenateForecastCandidates;
const names={baseline:'Uændret margin',damped:'Aftagende trend',linear:'Lineær trend',quadratic:'Acceleration'};
const validDate=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(Date.parse(s+'T12:00:00Z'));
const endTime=p=>validDate(p.end||p.x)?Date.parse((p.end||p.x)+'T12:00:00Z'):NaN;
const startTime=p=>validDate(p.x)?Date.parse(p.x+'T12:00:00Z'):NaN;
const mean=a=>a.length?a.reduce((s,v)=>s+v,0)/a.length:null;
function run(rows,{weighted=false,half=4,tau=4,maxHorizon=12,minHistory=3}={}){
 const records=[],states=[];
 for(const race of rows||[]){
  const ps=(race.points||[]).filter(p=>Number.isFinite(p.y)&&Number.isFinite(startTime(p))&&Number.isFinite(endTime(p))&&startTime(p)<=endTime(p)).sort((a,b)=>endTime(a)-endTime(b)||startTime(a)-startTime(b));
  const days=[...new Set(ps.map(p=>endTime(p)))];
  let tests=0;
  for(let i=0;i<days.length-1;i++){
   const origin=days[i],history=ps.filter(p=>endTime(p)<=origin);
   if(history.length<minHistory)continue;
   const s=api.snapshot(history,{weighted,half});
   if(!s)continue;
   // One forecast per origin and future end-day; same-day polls form one target.
   for(let j=i+1;j<days.length;j++){
    const future=ps.filter(p=>endTime(p)===days[j]);
    const horizon=(days[j]-origin)/WEEK;
    if(horizon<1/7||horizon>maxHorizon)continue;
    const observed=mean(future.map(p=>p.y));
    const predictions={baseline:s.margin,damped:api.project(s,horizon,{kind:'damped',tau}),linear:s.hasTrend?api.project(s,horizon,{kind:'linear'}):null,quadratic:s.hasAcceleration?api.project(s,horizon,{kind:'quadratic'}):null};
    const errors={};for(const kind of Object.keys(names))errors[kind]=Number.isFinite(predictions[kind])?observed-predictions[kind]:null;
    records.push({state:race.state,origin:new Date(origin).toISOString().slice(0,10),target:new Date(days[j]).toISOString().slice(0,10),horizon,observed,targetPolls:future.length,history:history.length,predictions,errors});
    tests++;
   }
  }
  states.push({state:race.state,polls:ps.length,tests});
 }
 const summarize=(items,kind)=>{
  const valid=items.filter(x=>Number.isFinite(x.errors[kind]));
  if(!valid.length)return {n:0,mae:null,bias:null,rmse:null};
  return {n:valid.length,mae:mean(valid.map(x=>Math.abs(x.errors[kind]))),bias:mean(valid.map(x=>x.errors[kind])),rmse:Math.sqrt(mean(valid.map(x=>x.errors[kind]**2)))};
 };
 const kinds=Object.keys(names);
 const overall=Object.fromEntries(kinds.map(k=>[k,summarize(records,k)]));
 const bins=[{label:'1–7 dage',lo:1/7,hi:1},{label:'8–14 dage',lo:1,hi:2},{label:'15–28 dage',lo:2,hi:4},{label:'29–56 dage',lo:4,hi:8},{label:'57–84 dage',lo:8,hi:12}].map((b,i)=>({label:b.label,results:Object.fromEntries(kinds.map(k=>[k,summarize(records.filter(r=>r.horizon>(i?b.lo:0)&&r.horizon<=b.hi),k)]))}));
 const byState=states.map(st=>({state:st.state,polls:st.polls,tests:st.tests,results:Object.fromEntries(kinds.map(k=>[k,summarize(records.filter(r=>r.state===st.state),k)]))}));
 return {records,overall,bins,byState,kinds,names,states:states.length,validStates:byState.filter(x=>x.tests>0).length,settings:{weighted,half,tau,maxHorizon,minHistory}};
}
root.SenateRollingOrigin=Object.freeze({run});
})(typeof window!=='undefined'?window:globalThis);

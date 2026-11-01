/* Candidate forecast models for historical backtesting.
 * Pure calculations: not connected to the live website.
 * D-R margin convention; time measured in weeks.
 */
(function(root){
'use strict';
const WEEK=604800000;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function midpoint(p){
 const a=Date.parse(String(p.x)+'T12:00:00Z'),b=Date.parse(String(p.end||p.x)+'T12:00:00Z');
 return Number.isFinite(a)&&Number.isFinite(b)?(a+b)/2:NaN;
}
function solve(a,b){
 const n=b.length,m=a.map((r,i)=>[...r,b[i]]);
 for(let k=0;k<n;k++){
  let pivot=k;for(let i=k+1;i<n;i++)if(Math.abs(m[i][k])>Math.abs(m[pivot][k]))pivot=i;
  if(Math.abs(m[pivot][k])<1e-9)return null;
  [m[k],m[pivot]]=[m[pivot],m[k]];
  const d=m[k][k];for(let j=k;j<=n;j++)m[k][j]/=d;
  for(let i=0;i<n;i++)if(i!==k){const f=m[i][k];for(let j=k;j<=n;j++)m[i][j]-=f*m[k][j]}
 }
 return m.map(r=>r[n]);
}
function fit(points,degree,half,weighted){
 if(points.length<degree+1)return null;
 const dates=points.map(midpoint),latest=Math.max(...dates),t=dates.map(d=>(d-latest)/WEEK);
 if(-Math.min(...t)<4)return null;
 const n=degree+1,A=Array.from({length:n},()=>Array(n).fill(0)),b=Array(n).fill(0);
 points.forEach((p,i)=>{
  const w=weighted?Math.pow(2,t[i]/half):1;
  for(let j=0;j<n;j++){b[j]+=w*p.y*t[i]**j;for(let k=0;k<n;k++)A[j][k]+=w*t[i]**(j+k)}
 });
 return solve(A,b);
}
function snapshot(points,{weighted=false,half=4}={}){
 const ps=(points||[]).filter(p=>Number.isFinite(p.y)&&Number.isFinite(midpoint(p)));
 if(!ps.length)return null;
 const latest=Math.max(...ps.map(midpoint)),weights=ps.map(p=>weighted?Math.pow(2,(midpoint(p)-latest)/WEEK/half):1);
 const margin=ps.reduce((s,p,i)=>s+p.y*weights[i],0)/weights.reduce((s,w)=>s+w,0);
 const lin=fit(ps,1,half,weighted),quad=fit(ps,2,half,weighted);
 return {margin,latest,n:ps.length,trend:lin?.[1]??0,acceleration:quad?2*quad[2]:0,hasTrend:!!lin,hasAcceleration:!!quad};
}
function project(s,h,{kind='damped',tau=4,accelerationWeight=0}={}){
 if(!s)return null;
 h=Math.max(0,h);
 if(kind==='linear')return s.margin+s.trend*h;
 if(kind==='quadratic')return s.margin+s.trend*h+0.5*s.acceleration*h*h;
 if(!(tau>0))throw new RangeError('tau must be positive');
 // Integrated exponential trend decay; acceleration is deliberately excluded
 // until independently validated against historical elections.
 return s.margin+s.trend*tau*(1-Math.exp(-h/tau));
}
function combine(pollForecast,prior,{pollWeight}={}){
 if(!Number.isFinite(pollForecast))return Number.isFinite(prior)?prior:null;
 if(!Number.isFinite(prior))return pollForecast;
 if(!Number.isFinite(pollWeight)||pollWeight<0||pollWeight>1)throw new RangeError('pollWeight must be empirically calibrated between 0 and 1');
 return pollWeight*pollForecast+(1-pollWeight)*prior;
}
function evaluate(rows,{kind='damped',weighted=false,half=4,tau=4,minHorizon=0.15,maxHorizon=20}={}){
 const errors=[];
 for(const race of rows){
  const pts=(race.points||[]).filter(p=>Number.isFinite(p.y)&&Number.isFinite(midpoint(p))).sort((a,b)=>midpoint(a)-midpoint(b));
  for(let j=2;j<pts.length;j++){
   const history=pts.slice(0,j),s=snapshot(history,{weighted,half}),h=(midpoint(pts[j])-s.latest)/WEEK;
   if(h<minHorizon||h>maxHorizon)continue;
   const predicted=project(s,h,{kind,tau});
   if(Number.isFinite(predicted))errors.push({state:race.state,horizon:h,error:pts[j].y-predicted});
  }
 }
 const mae=errors.length?errors.reduce((s,x)=>s+Math.abs(x.error),0)/errors.length:null;
 return {kind,observations:errors.length,mae,errors};
}
const api=Object.freeze({midpoint,snapshot,project,combine,evaluate});
if(typeof module!=='undefined'&&module.exports)module.exports=api;
if(root)root.SenateForecastCandidates=api;
})(typeof window!=='undefined'?window:null);

/* Fælles, valgfri forsøgsmodel. Ingen historisk valideret gevinst påstås.
   Aktuel vægtning og modelvalg deles af hovedside og præsentation.
   Huseffekter er beskrivende, estimeret på samtidige 2026-målinger.
*/
(()=>{
'use strict';
const KEY='senat-model-settings-v1',WEEK=604800000,ELECTION=Date.parse('2026-11-03T12:00:00Z');
const defaults={variant:'classic',weighted:false,half:4,projection:'accelerated',shared:3,retain:.90};
const clamp=(x,lo,hi)=>Math.min(hi,Math.max(lo,x));
const mid=p=>(Date.parse(p.x+'T12:00:00Z')+Date.parse(p.end+'T12:00:00Z'))/2;
function saved(){try{const x=JSON.parse(localStorage.getItem(KEY));return x&&typeof x==='object'?x:{}}catch{return {}}}
function settings(extra={}){
 const s={...defaults,...saved(),...extra};
 return {variant:s.variant==='experimental'?'experimental':'classic',weighted:!!s.weighted,
 projection:s.projection==='linear'?'linear':'accelerated',
 half:clamp(Number(s.half)||4,1,12),shared:3,retain:.90};
}
function set(patch){const next=settings(patch);try{localStorage.setItem(KEY,JSON.stringify(next))}catch{};return next}
function normalizeInstitute(s){return String(s||'').toLocaleLowerCase('en-US').replace(/[^a-z0-9]+/g,' ').trim()}
let houseCache=null,houseRows=null;
function houseEffects(rows){
 if(!Array.isArray(rows))return new Map();
 if(houseRows===rows&&houseCache)return houseCache;
 const list=new Map();
 for(const race of rows){
  const pts=(race.points||[]).filter(p=>Number.isFinite(p.y)&&Number.isFinite(mid(p)));
  for(const point of pts){
   const institute=normalizeInstitute(point.poll);
   if(!institute)continue;
   const peers=pts.filter(p=>p!==point&&normalizeInstitute(p.poll)!==institute&&Math.abs(mid(p)-mid(point))<=21*86400000);
   if(!peers.length)continue;
   const weights=peers.map(p=>Math.exp(-Math.abs(mid(p)-mid(point))/86400000/7));
   const mean=peers.reduce((a,p,i)=>a+p.y*weights[i],0)/weights.reduce((a,b)=>a+b,0);
   const entry=list.get(institute)||{n:0,sum:0,states:new Set()};
   entry.n++;entry.sum+=point.y-mean;entry.states.add(race.state);list.set(institute,entry);
  }
 }
 const result=new Map();
 for(const [name,e] of list){if(e.n>=4&&e.states.size>=2){
  result.set(name,{effect:clamp(e.sum/e.n*e.n/(e.n+8),-2,2),n:e.n,states:e.states.size});
 }}
 houseRows=rows;houseCache=result;return result;
}
function adjustedPoints(r,rows){
 const effects=houseEffects(rows||(typeof MODEL!=='undefined'?MODEL.states:[]));
 return (r.points||[]).map(p=>{
  const effect=effects.get(normalizeInstitute(p.poll))?.effect||0;
  return {...p,y:Number.isFinite(p.y)?p.y-effect:p.y};
 });
}
function solve(A,b){
 const n=b.length,m=A.map((r,i)=>[...r,b[i]]);
 for(let k=0;k<n;k++){
  let best=k;for(let j=k+1;j<n;j++)if(Math.abs(m[j][k])>Math.abs(m[best][k]))best=j;
  if(Math.abs(m[best][k])<1e-10)return null;
  [m[k],m[best]]=[m[best],m[k]];
  let v=m[k][k];for(let j=k;j<=n;j++)m[k][j]/=v;
  for(let i=0;i<n;i++)if(i!==k){v=m[i][k];for(let j=k;j<=n;j++)m[i][j]-=v*m[k][j]}
 }return m.map(r=>r[n]);
}
function fit(points,degree,weighted,half){
 const ds=points.map(mid),latest=Math.max(...ds),xs=ds.map(x=>(x-latest)/WEEK),k=degree+1;
 if(points.length<k||-Math.min(...xs)<4)return null;
 const A=Array.from({length:k},()=>Array(k).fill(0)),b=Array(k).fill(0);
 points.forEach((p,i)=>{
  const w=weighted?Math.pow(2,xs[i]/half):1,v=Array.from({length:k},(_,j)=>xs[i]**j);
  for(let j=0;j<k;j++){b[j]+=w*v[j]*p.y;for(let z=0;z<k;z++)A[j][z]+=w*v[j]*v[z]}
 });
 return solve(A,b);
}
function snapshot(r,options={},rows){
 const opt=settings(options);
 const points=(opt.variant==='experimental'?adjustedPoints(r,rows):r.points||[]).filter(p=>Number.isFinite(p.y)&&Number.isFinite(mid(p)));
 if(!points.length)return {...r,margin:null,trend:null,accel:null,lead:null,latestDate:null,rawMargin:null,houseAdjustment:0,modelVariant:opt.variant};
 const latest=Math.max(...points.map(mid)),weights=points.map(p=>opt.weighted?Math.pow(2,(mid(p)-latest)/WEEK/opt.half):1);
 const margin=points.reduce((a,p,i)=>a+p.y*weights[i],0)/weights.reduce((a,b)=>a+b,0);
 const orig=(r.points||[]).filter(p=>Number.isFinite(p.y)&&Number.isFinite(mid(p)));
 const rawMargin=orig.reduce((a,p,i)=>a+p.y*weights[i],0)/weights.reduce((a,b)=>a+b,0);
 const lin=fit(points,1,opt.weighted,opt.half),quad=fit(points,2,opt.weighted,opt.half);
 const newest=points.reduce((a,p)=>mid(p)>mid(a)?p:a);
 const lead=margin>1e-10?(r.kind==='I-R'?'I':'D'):margin< -1e-10?'R':newest.y>=0?(r.kind==='I-R'?'I':'D'):'R';
 return {...r,margin,rawMargin,houseAdjustment:margin-rawMargin,trend:lin?.[1]??null,
 accel:quad?2*quad[2]:null,lead,latestDate:latest,modelVariant:opt.variant};
}
function forecast(r,model='accelerated',options={}){
 if(!r||!Number.isFinite(r.margin))return null;
 const opt=settings(options);
 const start=r.latestDate??(r.latest?Date.parse(r.latest+'T12:00:00Z'):ELECTION);
 const h=Math.max(0,(ELECTION-start)/WEEK);
 const effective=opt.variant==='experimental'?4*(1-Math.exp(-h/4)):h;
 return r.margin+(r.trend??0)*effective+
  (model==='accelerated'?0.5*(r.accel??0)*effective*effective:0);
}
window.SenateForecastExperiment=Object.freeze({settings,set,houseEffects,adjustedPoints,snapshot,forecast,mid});
})();
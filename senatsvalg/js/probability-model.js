/* Forecast-sensitivity model for 2026 Senate races.
 * Data: state poll dates/margins already included in MODEL.states.
 * Rolling-origin cross-validation is against LATER POLLS, not election results.
 * The resulting percentages are conditional model scenarios, NOT validated
 * empirical probabilities of real election outcomes.
 * No libraries, backend or random generation are required.
 */
(()=>{
'use strict';
const WEEK=604800000;
const ELECTION=Date.parse('2026-11-03T12:00:00Z');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const normalCDF=x=>{
  // Abramowitz-Stegun 7.1.26; abs error ~ 7.5e-8
  const z=Math.abs(x),t=1/(1+0.2316419*z);
  const poly=t*(0.319381530+t*(-0.356563782+t*(1.781477937+t*(-1.821255978+t*1.330274429))));
  const tail=Math.exp(-0.5*z*z)/Math.sqrt(2*Math.PI)*poly;
  return clamp(x>=0?1-tail:tail,0,1);
};
const midpoint=p=>(Date.parse(p.x+'T12:00:00Z')+Date.parse(p.end+'T12:00:00Z'))/2;
function solve(A,b){
  const n=b.length,m=A.map((r,i)=>[...r,b[i]]);
  for(let k=0;k<n;k++){
    let p=k;for(let i=k+1;i<n;i++)if(Math.abs(m[i][k])>Math.abs(m[p][k]))p=i;
    if(Math.abs(m[p][k])<1e-10)return null;
    [m[k],m[p]]=[m[p],m[k]];
    const v=m[k][k];for(let j=k;j<=n;j++)m[k][j]/=v;
    for(let i=0;i<n;i++)if(i!==k){const f=m[i][k];for(let j=k;j<=n;j++)m[i][j]-=f*m[k][j]}
  }
  return m.map(r=>r[n]);
}
// Identical specification to wls in overblik.js: polynomial time origin latest mid-fieldwork.
function coefficients(points,degree,half,weighted){
  const dates=points.map(midpoint),latest=Math.max(...dates),t=dates.map(d=>(d-latest)/WEEK),k=degree+1;
  if(points.length<k||-Math.min(...t)<4)return null;
  const A=Array.from({length:k},()=>Array(k).fill(0)),b=Array(k).fill(0);
  points.forEach((p,i)=>{
    const w=weighted?Math.pow(2,t[i]/half):1;
    const terms=Array.from({length:k},(_,j)=>t[i]**j);
    for(let j=0;j<k;j++){
      b[j]+=w*terms[j]*p.y;
      for(let l=0;l<k;l++)A[j][l]+=w*terms[j]*terms[l];
    }
  });
  return solve(A,b);
}
function modelSnapshot(points,weighted,half){
  const latest=Math.max(...points.map(midpoint));
  const weights=points.map(p=>weighted?Math.pow(2,(midpoint(p)-latest)/WEEK/half):1);
  const margin=points.reduce((s,p,i)=>s+p.y*weights[i],0)/weights.reduce((s,x)=>s+x,0);
  const linear=coefficients(points,1,half,weighted),quadratic=coefficients(points,2,half,weighted);
  return {margin,trend:linear?.[1]??0,accel:quadratic?2*quadratic[2]:0,hasTrend:!!linear,hasAccel:!!quadratic,latest};
}
function predict(snapshot,h,model){
  return snapshot.margin + snapshot.trend*h+(model==='accelerated'?.5*snapshot.accel*h*h:0);
}
function backtest(rows,weighted,half){
  const errors={linear:[],accelerated:[]},perState={};
  for(const race of rows){
    const pts=[...(race.points||[])].filter(p=>Number.isFinite(p.y)&&Number.isFinite(midpoint(p))).sort((a,b)=>midpoint(a)-midpoint(b));
    const stateErrors={linear:[],accelerated:[]};
    // Each future observation is evaluated once, against a model fitted before it.
    for(let j=2;j<pts.length;j++){
      const history=pts.slice(0,j),origin=Math.max(...history.map(midpoint));
      const horizon=(midpoint(pts[j])-origin)/WEEK;
      if(horizon<.15||horizon>20)continue;
      const snap=modelSnapshot(history,weighted,half);
      for(const model of ['linear','accelerated']){
        if(model==='linear'&&!snap.hasTrend)continue;
        if(model==='accelerated'&&!snap.hasAccel)continue;
        const error=pts[j].y-predict(snap,horizon,model);
        if(!Number.isFinite(error))continue;
        const item={state:race.state,horizon,error:clamp(error,-35,35)};
        errors[model].push(item);stateErrors[model].push(item);
      }
    }
    perState[race.state]=stateErrors;
  }
  return {errors,perState};
}
// Historical election-result calibration (leave-one-election-year-out).
// Horizon is measured in weeks; interpolate log factors to avoid jumps.
// Outside 7–28 days we hold the nearest validated factor constant.
function electionHorizonFactor(model,horizon){
  const knots=model==='accelerated'?
    [[1,1.4281253410855368],[2,0.9768276125573097],[4,1.161470927509165]]:
    [[1,1.487640707007095],[2,0.7926308858693943],[4,0.6516535182749763]];
  if(horizon<=knots[0][0])return knots[0][1];
  if(horizon>=knots[2][0])return knots[2][1];
  const i=horizon<=2?0:1;
  const [x0,y0]=knots[i], [x1,y1]=knots[i+1];
  return Math.exp(Math.log(y0)+(Math.log(y1)-Math.log(y0))*(horizon-x0)/(x1-x0));
}
function estimateSigma(cal,state,model,horizon,n){
  // Pooled forward-error sigma at approximately the required lead-time.
  // Larger states with many surveys do not count proportionally more.
  const all=cal.errors[model],counts={};all.forEach(e=>counts[e.state]=(counts[e.state]||0)+1);
  let sw=0,sq=0,sh=0;
  for(const e of all){
    const weight=Math.exp(-Math.abs(e.horizon-horizon)/6)/Math.sqrt(counts[e.state]);
    sw+=weight;sq+=weight*e.error*e.error;sh+=weight*e.horizon;
  }
  // Conservative fallback when rolling tests are unavailable.
  const pooled=sw>0?Math.sqrt(sq/sw):6.0;
  const observed=sw>0?sh/sw:2;
  // Extrapolation past the typical observed holdout horizon widens uncertainty.
  const extrapolate=Math.sqrt((1+Math.max(0,horizon)/10)/(1+observed/10));
  const local=cal.perState[state]?.[model]||[];
  let locW=0,locSq=0;
  for(const e of local){const w=Math.exp(-Math.abs(e.horizon-horizon)/6);locW+=w;locSq+=w*e.error*e.error}
  const localShare=locW/(locW+12); // strong shrinkage toward national pool
  const localVariance=locW?locSq/locW:pooled*pooled;
  const variance=(1-localShare)*pooled*pooled+localShare*localVariance;
  const sparsePenalty=n<=1?3.5:n<=3?2.5:n<=5?1.5:0;
  // Historical Senate election-result adjustment; factors are median
  // leave-one-election-year-out estimates, not a fully validated end-to-end backtest.
  const horizonFactor=electionHorizonFactor(model,horizon);
  const sigma=clamp(Math.sqrt(Math.max(3.5*3.5,variance*extrapolate*extrapolate)+sparsePenalty*sparsePenalty)*horizonFactor,3.5,35);
  return {sigma,pooled,observations:all.length,localTests:local.length};
}
function distribution(probabilities){
  let mass=[1];
  for(const p of probabilities){
    if(!Number.isFinite(p)||p<0||p>1)throw new RangeError('Sandsynlighed skal ligge mellem 0 og 1');
    const next=Array(mass.length+1).fill(0);
    for(let j=0;j<mass.length;j++){next[j]+=mass[j]*(1-p);next[j+1]+=mass[j]*p}mass=next;
  }
  return mass;
}
function sumAtLeast(mass,number){return mass.slice(Math.max(0,number)).reduce((s,x)=>s+x,0)}
function national(races,fixedDem,shared){
  const n=80,deltaMax=4.5,step=2*deltaMax/n;
  const combined=Array(races.length+1).fill(0);
  let totalWeight=0;
  for(let j=0;j<=n;j++){
    const z=-deltaMax+j*step;
    const w=(j===0||j===n?1:j%2?4:2)*Math.exp(-z*z/2);
    const common=z*shared;
    const ps=races.map(r=>r.unpolled?r.p:clamp(normalCDF((r.margin+common)/r.sigma),.001,.999));
    const mass=distribution(ps);
    mass.forEach((m,k)=>combined[k]+=m*w);totalWeight+=w;
  }
  combined.forEach((_,i)=>combined[i]/=totalWeight);
  const majority=sumAtLeast(combined,51-fixedDem);
  const expectation=fixedDem+combined.reduce((s,p,k)=>s+k*p,0);
  const percentile=part=>{let c=0;for(let i=0;i<combined.length;i++){c+=combined[i];if(c>=part)return fixedDem+i}return fixedDem+combined.length-1};
  return {majority,expectedSeats:expectation,range:[percentile(.05),percentile(.95)],distribution:combined};
}
function compute(rows,{weighted=false,half=8,retain=.90,shared=2.0}={}){
  const hold=clamp(retain,.5,.999);
  const common=clamp(shared,0,6);
  const calibration=backtest(rows,weighted,half);
  const fixedDem=47-rows.filter(r=>r.inc==='D'||r.inc==='I').length;
  const weeks=()=>Math.max(0,(ELECTION-Date.now())/WEEK);
  const results={};
  for(const model of ['linear','accelerated']){
    const races=rows.map(r=>{
      const n=(r.points||[]).length;
      if(!n){const p=(r.inc==='D'||r.inc==='I')?hold:1-hold;
        return {state:r.state,inc:r.inc,kind:r.kind,model,n:0,unpolled:true,p,margin:null,sigma:null,quality:'Antagelse uden målinger',localTests:0};
      }
      const snap=modelSnapshot(r.points,weighted,half);
      const start=snap.latest;
      const h=Math.max(0,(ELECTION-start)/WEEK);
      const sigma=estimateSigma(calibration,r.state,model,h,n);
      const meanRaw=predict(snap,h,model);
      // Quadratic extrapolation can explode beyond any information in the polls.
      const margin=clamp(meanRaw,-35,35);
      // Common national error is an *extra* user-specified assumption, not identified
      // by errors against later polls. Its variance adds in the state marginal.
      const p=clamp(normalCDF(margin/Math.hypot(sigma.sigma,common)),.001,.999);
      return {state:r.state,inc:r.inc,kind:r.kind,model,n,unpolled:false,p,margin,sigma:sigma.sigma,
        marginUncapped:meanRaw,horizon:h,hasTrend:snap.hasTrend,hasAccel:snap.hasAccel,
        quality:n<=1?'Kun én måling':model==='accelerated'&&!snap.hasAccel?'Acceleration mangler – anvender lineær':
          model==='linear'&&!snap.hasTrend?'Trend mangler – bruger målt margin':'Beregnet fra målinger',localTests:sigma.localTests};
    });
    results[model]={races,national:national(races,fixedDem,common),tests:calibration.errors[model].length};
  }
  return {results,fixedDem,calibration:{linear:calibration.errors.linear.length,accelerated:calibration.errors.accelerated.length},settings:{weighted,half,retain:hold,shared:common}};
}
window.SenateProbabilityModel=Object.freeze({compute,distribution,sumAtLeast,normalCDF,backtest,estimateSigma,national,modelSnapshot,predict});
})();

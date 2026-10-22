/* State importance for reaching a chosen D/I Senate seat target.
 * Uses the same shared national normal swing and state-local probabilities as
 * probability-model.js; conditions on each state's win/loss, rather than
 * treating the races as independent marginal probabilities.
 */
(()=>{
'use strict';
const slider=document.getElementById('seatImportanceTarget');
const output=document.getElementById('seatImportanceTargetText');
const selector=document.getElementById('seatImportanceModel');
const bars=document.getElementById('seatImportanceBars');
const probability=document.getElementById('seatImportanceProbability');
const model=window.SenateProbabilityModel;
if(!slider||!selector||!bars||!model)return;
const fmt=n=>n.toLocaleString('da-DK',{minimumFractionDigits:1,maximumFractionDigits:1});
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const cache=new Map();
let current=null;
function calculate(modelKey,target){
  const snap=current, races=snap.results[modelKey].races, fixed=snap.fixedDem;
  const threshold=target-fixed;
  const n=80,step=9/n,shared=snap.settings.shared;
  const sums=races.map(()=>({winWeight:0,loseWeight:0,winAndGoal:0,loseAndGoal:0}));
  let goalTotal=0,allWeight=0;
  for(let j=0;j<=n;j++){
    const z=-4.5+j*step;
    const weight=(j===0||j===n?1:j%2?4:2)*Math.exp(-z*z/2);
    const ps=races.map(r=>r.unpolled?r.p:clamp(model.normalCDF((r.margin+z*shared)/r.sigma),.001,.999));
    const all=model.distribution(ps);
    goalTotal+=weight*model.sumAtLeast(all,threshold);
    allWeight+=weight;
    for(let i=0;i<races.length;i++){
      // Remove this state's seat from the conditional distribution. The
      // shared national swing remains integrated, with correct posterior
      // weights for both conditional outcomes.
      const others=model.distribution(ps.filter((_,k)=>k!==i));
      const winGoal=model.sumAtLeast(others,threshold-1);
      const loseGoal=model.sumAtLeast(others,threshold);
      const p=ps[i],entry=sums[i];
      entry.winWeight+=weight*p;
      entry.loseWeight+=weight*(1-p);
      entry.winAndGoal+=weight*p*winGoal;
      entry.loseAndGoal+=weight*(1-p)*loseGoal;
    }
  }
  return {total:goalTotal/allWeight,rank:sums.map((s,i)=>{
    const conditionalWin=s.winWeight?s.winAndGoal/s.winWeight:0;
    const conditionalLoss=s.loseWeight?s.loseAndGoal/s.loseWeight:0;
    return {state:races[i].state,unpolled:races[i].unpolled,impact:100*(conditionalWin-conditionalLoss),conditionalWin,conditionalLoss};
  }).sort((a,b)=>b.impact-a.impact)};
}
function render(){
  current=window.latestSenateProbabilities;
  if(!current)return;
  const target=Number(slider.value),key=selector.value;
  output.textContent=String(target);
  const signature=[key,target,current.settings.weighted,current.settings.half,current.settings.shared,current.settings.retain].join('|');
  let result=cache.get(signature);
  if(!result){result=calculate(key,target);cache.set(signature,result)}
  probability.textContent=`Sandsynlighed for mindst ${target} D/I-mandater: ${fmt(result.total*100)} %`;
  const max=Math.max(1,...result.rank.map(r=>r.impact));
  bars.replaceChildren();
  for(const r of result.rank){
    const row=document.createElement('div');row.className='seat-importance-row';
    const name=document.createElement('span');name.textContent=r.state+(r.unpolled?' *':'');
    const track=document.createElement('div');track.className='seat-importance-track';
    const fill=document.createElement('div');fill.className='seat-importance-fill';fill.style.width=`${Math.max(0,r.impact/max*100)}%`;track.append(fill);
    const val=document.createElement('span');val.className='seat-importance-value';val.textContent=`${fmt(r.impact)} pp`;
    row.title=`${r.state}: D/I vinder → ${fmt(r.conditionalWin*100)} %; R vinder → ${fmt(r.conditionalLoss*100)} % chance for mindst ${target} mandater`;
    row.append(name,track,val);bars.append(row);
  }
}
slider.addEventListener('input',render);
selector.addEventListener('change',render);
window.addEventListener('senate-probabilities-updated',()=>{cache.clear();render()});
render();
})();

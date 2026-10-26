/* Conditional polling scenarios. Forecast errors were measured against later
 * poll observations, not against actual results of completed elections.
 * See metode.html#sandsynligheder for explicit caveats.
 */
(()=>{
'use strict';
const table=document.getElementById('scenarioStateRows');
const nationalBox=document.getElementById('scenarioNational');
const progress=document.getElementById('scenarioProgress');
const seatMath=document.getElementById('scenarioSeatMath');
const backtestNote=document.getElementById('scenarioBacktest');
const HOLD=.90, SHARED=3.0;
const chart=document.getElementById('seatDistributionChart');
const detail=document.getElementById('seatDistributionDetail');
const model=window.SenateProbabilityModel;
if(!table||!nationalBox||!progress||!seatMath||!model)return;
const escape=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const pct=p=>(100*p).toLocaleString('da-DK',{minimumFractionDigits:1,maximumFractionDigits:1})+' %';
const fmt=n=>Number(n).toLocaleString('da-DK',{minimumFractionDigits:1,maximumFractionDigits:1});
let last=null;
let baselineProbabilities=null;
function calculate(){
  const settings={...window.getSenateWeighting(),retain:HOLD,shared:SHARED};
  last=model.compute(MODEL.states,settings);
  baselineProbabilities=window.SenateUpdateUI?.active()?model.compute(BASELINE_STATES,settings):null;
  window.baselineSenateProbabilities=baselineProbabilities;
  const change=window.SenateUpdateUI?.change||(()=>"");
  window.latestSenateProbabilities=last;
  window.probabilityRanges=new Map();
  const acceleratedByState=new Map(last.results.accelerated.races.map(r=>[r.state,r]));
  const spanPct=(a,b)=>{
    const values=[Math.min(a,b),Math.max(a,b)];
    const color=v=>v<.5?'probability-red':v>.5?'probability-blue':'probability-neutral';
    return `<span class="${color(values[0])}">${pct(values[0])}</span><span class="probability-dash">–</span><span class="${color(values[1])}">${pct(values[1])}</span>`;
  };
  const oldLinear=new Map((baselineProbabilities?.results.linear.races||[]).map(r=>[r.state,r]));
  const oldAccelerated=new Map((baselineProbabilities?.results.accelerated.races||[]).map(r=>[r.state,r]));
  last.results.linear.races.forEach(r=>{
    const q=acceleratedByState.get(r.state),o=oldLinear.get(r.state),oq=oldAccelerated.get(r.state);
    window.probabilityRanges.set(r.state,spanPct(r.p,q.p)+change(r.p,o?.p,'Ændring i D/I-vinderchance, lineær')+change(q.p,oq?.p,'Ændring i D/I-vinderchance, acceleration'));
  });
  if(typeof probabilityRanges!=='undefined'){
    probabilityRanges=window.probabilityRanges;
    drawTable();
    drawNational();
  }
  const first=last.results.linear.races;
  const second=new Map(last.results.accelerated.races.map(r=>[r.state,r]));
  // Alphabetical order is stable as weighting, margins and sensitivity change.
  table.innerHTML=first.slice().sort((a,b)=>a.state.localeCompare(b.state,'da')).map(r=>{
    const q=second.get(r.state),noPoll=r.unpolled;
    const short=noPoll?'Antagelse om fastholdelse':r.n<=1?'Kun én måling':
      r.n<=3?'Få målinger':!q.hasAccel?'Acceleration ikke estimerbar':'Målingsmodel';
    const explained=t=>t.unpolled?
      `Ingen målinger; ${Math.round(HOLD*100)} % fastholdelse af nuværende parti`:
      `Beregnet margin: ${fmt(t.margin)} pp; prognosefejl σ ≈ ${fmt(t.sigma)} pp; ${t.localTests} lokale efterprøvninger`;
    const cell=t=>`<td class="scenario-percent${t.unpolled?' assumed':''}" title="${escape(explained(t))}"><strong>${pct(t.p)}</strong>${change(t.p,(t.model==='linear'?oldLinear:oldAccelerated).get(t.state)?.p,'Ændring i D/I-vinderchance')}${t.unpolled?' <small>*</small>':''}</td>`;
    return `<tr><td>${escape(r.state)}${r.kind==='I-R'?' <small>(I–R)</small>':''}</td><td class="scenario-n">${r.n||'0'}</td>${cell(r)}${cell(q)}<td class="scenario-basis">${escape(short)}</td></tr>`;
  }).join('');
  nationalBox.innerHTML=[['linear','Kun trend'],['accelerated','Trend + acceleration']].map(([key,label])=>{
    const estimate=last.results[key].national;
    return `<div class="scenario-result"><span>${label}</span><strong>${pct(estimate.majority)}${change(estimate.majority,baselineProbabilities?.results[key].national.majority,'Ændring i national D/I-flertalschance')}</strong>`+
      `<small>Forventet D/I-mandattal: ${fmt(estimate.expectedSeats)} · 90 % scenarieinterval: ${estimate.range[0]}–${estimate.range[1]} mandater</small></div>`;
  }).join('');
  const fixed=last.fixedDem;
  progress.textContent=`35 valg · ${first.filter(r=>!r.unpolled).length} med målinger · ${first.filter(r=>r.unpolled).length} uden målinger`;
  seatMath.innerHTML=`Der er ${fixed} D/I-sæder, som ikke er på valg. Der kræves mindst ${51-fixed} D/I-mandater blandt de 35 valg for at nå 51. Et fælles udsving på ${fmt(settings.shared)} pp er indregnet for delstater med målinger; de umålte delstaters sandsynligheder fastholdes som en særskilt antagelse. <a href="metode.html#sandsynligheder">Se beregningsmetoden.</a>`;
  renderChart();
  window.dispatchEvent(new CustomEvent('senate-probabilities-updated'));
  backtestNote.textContent=`Grundlag for usikkerheden: ${last.calibration.linear} historiske fremadrettede sammenligninger for den lineære model og ${last.calibration.accelerated} for accelerationsmodellen (mod senere meningsmålinger). * Procent uden målinger er en indstillet antagelse. Resultaterne er scenarier, ikke validerede vinderchancer.`;
}

const chartColors={linearR:'#a72d36',acceleratedR:'#e8a4a8',linearD:'#155fa6',acceleratedD:'#9cc8f1'};
let selected=null;
function renderChart(){
  if(!chart||!detail||!last)return;
  const fixed=last.fixedDem;
  const a=last.results.linear.national.distribution;
  const b=last.results.accelerated.national.distribution;
  const seats=Array.from({length:a.length},(_,i)=>fixed+i);
  // Render the full supported distribution, not a cropped normal approximation.
  const max=Math.max(...a,...b,.001);
  const left=53,right=865,top=29,bottom=262;
  const dx=(right-left)/seats.length;
  const boundary=left+(51-fixed)*dx;
  const height=bottom-top;
  const tick=(n)=>`${(n*100).toLocaleString('da-DK',{maximumFractionDigits:1})} %`;
  let svg=`<title>Fordeling af demokratiske mandater for begge modeller</title>`;
  for(let i=0;i<=4;i++){
    const v=max*i/4,y=bottom-height*i/4;
    svg+=`<line x1="${left}" y1="${y}" x2="${right}" y2="${y}" stroke="currentColor" stroke-opacity=".12" stroke-dasharray="3 4"/><text x="${left-8}" y="${y+4}" text-anchor="end" fill="currentColor" opacity=".7" font-size="11">${tick(v)}</text>`;
  }
  svg+=`<text x="${(left+Math.max(left,boundary))/2}" y="15" text-anchor="middle" fill="#a72d36" font-size="12">Republikansk flertal</text><text x="${(Math.min(right,boundary)+right)/2}" y="15" text-anchor="middle" fill="#155fa6" font-size="12">Demokratisk flertal</text>`;
  seats.forEach((seat,i)=>{
    const groupX=left+i*dx;
    [[a[i],'linear',0],[b[i],'accelerated',1]].forEach(([v,model,offset])=>{
      const w=Math.max(1.3,dx*.43),x=groupX+dx*.06+offset*dx*.45;
      const h=Math.max(.2,v/max*height),y=bottom-h;
      const color=chartColors[model+(seat>=51?'D':'R')];
      const isSelected=selected?.seat===seat&&selected?.model===model;
      const label=`${seat} demokratiske mandater, ${model==='linear'?'lineær trend':'trend og acceleration'}: ${tick(v)}`;
      svg+=`<rect class="seat-dist-bar${isSelected?' selected':''}" x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${w.toFixed(2)}" height="${h.toFixed(2)}" fill="${color}" tabindex="0" role="button" aria-label="${label}" data-seat="${seat}" data-model="${model}"><title>${label}</title></rect>`;
    });
    if(seat%2===0||seat===51)svg+=`<text x="${(groupX+dx/2).toFixed(2)}" y="280" text-anchor="middle" fill="currentColor" font-size="10">${seat}</text>`;
  });
  if(boundary>=left&&boundary<=right)svg+=`<line x1="${boundary}" y1="24" x2="${boundary}" y2="${bottom+3}" stroke="currentColor" stroke-width="1.7" stroke-dasharray="5 4" pointer-events="none"/>`;
  [60,67].forEach(target=>{const pos=left+(target-fixed)*dx;if(pos>=left&&pos<=right){svg+=`<line x1="${pos}" x2="${pos}" y1="24" y2="${bottom+3}" stroke="#6b7280" stroke-width="1.1" stroke-dasharray="3 5" pointer-events="none"/><text x="${pos+3}" y="38" fill="#48566a" font-size="10" font-weight="700">${target}</text>`;}});
  svg+=`<text x="${(left+right)/2}" y="306" text-anchor="middle" fill="currentColor" font-size="12">Demokratiske og demokratisk tilknyttede mandater</text>`;
  chart.innerHTML=svg;
  if(selected&&seats.includes(selected.seat))showSelection(selected.seat,selected.model,false);
  else detail.textContent='Vælg en søjle for at se sandsynligheden for det præcise mandattal.';
}
function showSelection(seat,model,rerender=true){
  if(!last||!detail)return;
  const index=seat-last.fixedDem;
  const a=last.results.linear.national.distribution[index];
  const b=last.results.accelerated.national.distribution[index];
  if(a===undefined||b===undefined)return;
  selected={seat,model};
  detail.innerHTML=`<strong>${seat} D/I-mandater · ${seat>=51?'Demokratisk flertal':'Ikke demokratisk flertal'}</strong><span>Lineær trend: <b>${pct(a)}</b> · Trend + acceleration: <b>${pct(b)}</b></span><small>Valgt søjle: ${model==='linear'?'lineær trend':'trend + acceleration'}. Tallene er sandsynligheden for præcis ${seat} mandater, ikke mindst ${seat} mandater.</small>`;
  if(rerender)chart.querySelectorAll('.seat-dist-bar').forEach(el=>el.classList.toggle('selected',+el.dataset.seat===seat&&el.dataset.model===model));
}
if(chart){
  const activate=target=>{const el=target.closest?.('.seat-dist-bar');if(el&&chart.contains(el))showSelection(+el.dataset.seat,el.dataset.model)};
  chart.addEventListener('click',e=>activate(e.target));
  chart.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){if(e.target.classList.contains('seat-dist-bar')){e.preventDefault();activate(e.target)}}});
}

window.updateProbabilityModel=calculate;

calculate();
})();

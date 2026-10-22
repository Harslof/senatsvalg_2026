(()=>{'use strict';
const WEEK=604800000, rows=MODEL.states;
const updateUI=window.SenateUpdateUI;
const updateActive=()=>Boolean(updateUI?.active());
const baselineByState=new Map(BASELINE_STATES.map(r=>[r.state,r]));
const updatedStates=typeof UPDATE_STATES!=='undefined'?UPDATE_STATES:new Set();
const hasUpdate=state=>updateActive()&&updatedStates.has(state);
const change=(now,before,label)=>updateUI?.change(now,before,label)||'';
const mark=(changed,label)=>updateUI?.mark(changed,label)||'';
const $=id=>document.getElementById(id);
const escape=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const format=(v,d=2)=>Number.isFinite(v)?(v>0?'+':'')+v.toLocaleString('da-DK',{minimumFractionDigits:d,maximumFractionDigits:d}):'—';
const mid=p=>(Date.parse(p.x+'T12:00:00Z')+Date.parse(p.end+'T12:00:00Z'))/2;
function solve(A,b){let n=b.length,m=A.map((r,i)=>[...r,b[i]]);for(let k=0;k<n;k++){let p=k;for(let i=k+1;i<n;i++)if(Math.abs(m[i][k])>Math.abs(m[p][k]))p=i;if(Math.abs(m[p][k])<1e-10)return null;[m[k],m[p]]=[m[p],m[k]];let v=m[k][k];for(let j=k;j<=n;j++)m[k][j]/=v;for(let i=0;i<n;i++)if(i!==k){v=m[i][k];for(let j=k;j<=n;j++)m[i][j]-=v*m[k][j]}}return m.map(r=>r[n])}
function fit(points,degree,weighted,half){const dates=points.map(mid),latest=Math.max(...dates),t=dates.map(d=>(d-latest)/WEEK),k=degree+1;if(points.length<k||-Math.min(...t)<4)return null;const A=Array.from({length:k},()=>Array(k).fill(0)),b=Array(k).fill(0);for(let i=0;i<points.length;i++){const w=weighted?Math.pow(2,t[i]/half):1,v=Array.from({length:k},(_,j)=>t[i]**j);for(let j=0;j<k;j++){b[j]+=w*v[j]*points[i].y;for(let l=0;l<k;l++)A[j][l]+=w*v[j]*v[l]}}return solve(A,b)}
function calc(r,weighted,half){const pts=r.points||[];if(!pts.length)return {...r,margin:null,trend:null,accel:null,lead:null};const dates=pts.map(mid),latest=Math.max(...dates),weights=dates.map(d=>weighted?Math.pow(2,(d-latest)/WEEK/half):1),margin=pts.reduce((a,p,i)=>a+p.y*weights[i],0)/weights.reduce((a,b)=>a+b,0);const lin=fit(pts,1,weighted,half),quad=fit(pts,2,weighted,half);const newest=pts[dates.indexOf(latest)];const lead=margin>1e-10?(r.kind==='I-R'?'I':'D'):margin< -1e-10?'R':newest.y>=0?(r.kind==='I-R'?'I':'D'):'R';return {...r,margin,trend:lin?.[1]??null,accel:quad?2*quad[2]:null,lead,lin,quad,latestDate:latest};}
function chart(r){
  const pts=r.points||[];
  if(!pts.length)return '<div class="vf-empty">Ingen registrerede meningsmålinger. Derfor kan trendkurverne ikke beregnes.</div>';
  const electionDay=Date.parse('2026-11-03T12:00:00Z');
  const first=Math.min(...pts.map(mid));
  // The shaded forecast starts at the END of the latest poll's fieldwork,
  // rather than its midpoint (which is used for fitting the trend).
  const lastPollEnd=Math.max(...pts.map(p=>Date.parse(p.end+'T12:00:00Z')));
  const projectionStart=Math.min(lastPollEnd,electionDay);
  const start=first-Math.max(WEEK,electionDay-first)*.025;
  const end=electionDay;
  const x=d=>54+760*(d-start)/(end-start);
  const evaluate=(coeff,d)=>{
    if(!coeff)return null;
    const t=(d-r.latestDate)/WEEK;
    return coeff.reduce((sum,c,i)=>sum+c*t**i,0);
  };
  const values=pts.map(p=>p.y);
  // Include the entire projected horizon in the vertical axis so the lines
  // can actually reach election day without being clipped.
  for(let i=0;i<=120;i++){
    const d=start+(end-start)*i/120;
    for(const coeff of [r.lin,r.quad]){
      const v=evaluate(coeff,d);
      if(Number.isFinite(v))values.push(v);
    }
  }
  let lo=Math.floor((Math.min(...values)-1)/5)*5;
  let hi=Math.ceil((Math.max(...values)+1)/5)*5;
  if(hi<=lo)hi=lo+5;
  const y=v=>248-196*(v-lo)/(hi-lo);
  const projectionX=x(projectionStart);
  const projectedWidth=Math.max(0,x(electionDay)-projectionX);
  const forecast=projectedWidth>0.1;
  const shade=forecast?`<rect class="vf-forecast-zone" x="${projectionX.toFixed(2)}" y="33" width="${projectedWidth.toFixed(2)}" height="215"/>`:'';
  const ticks=Array.from({length:5},(_,i)=>lo+(hi-lo)*i/4);
  const zeroVisible=lo<=0&&hi>=0;
  const zeroTick=ticks.some(v=>Math.abs(v)<1e-9);
  const grid=ticks.map(v=>`${Math.abs(v)<1e-9?'':`<line x1="54" y1="${y(v)}" x2="814" y2="${y(v)}" stroke="#dedede"/>`}<text x="44" y="${y(v)+4}" text-anchor="end" font-size="12" fill="#666">${format(v,1)}</text>`).join('');
  const zeroLine=zeroVisible?`<line class="vf-zero-line" x1="54" y1="${y(0)}" x2="814" y2="${y(0)}" stroke="#6b6b6b" stroke-width="1.6" stroke-dasharray="5 5"/>${zeroTick?'':`<text x="44" y="${y(0)+4}" text-anchor="end" font-size="12" font-weight="bold" fill="#555">0</text>`}`:'';
  const curve=(coeff,from,to,cls,color,dashed)=>{
    if(!coeff||to<=from)return '';
    const path=Array.from({length:91},(_,i)=>{
      const d=from+(to-from)*i/90;
      return (i?'L':'M')+x(d).toFixed(2)+' '+y(evaluate(coeff,d)).toFixed(2);
    }).join(' ');
    return `<path class="${cls}" d="${path}" fill="none" stroke="${color}" stroke-width="3.2"${dashed?' stroke-dasharray="7 5"':''}/>`;
  };
  const lines=[
    curve(r.lin,start,projectionStart,'vf-linear-history','#2670b5',false),
    curve(r.quad,start,projectionStart,'vf-accelerated-history','#b84b43',false),
    forecast?curve(r.lin,projectionStart,end,'vf-linear-projection','#2670b5',true):'',
    forecast?curve(r.quad,projectionStart,end,'vf-accelerated-projection','#b84b43',true):''
  ].join('');
  const dots=pts.map(p=>{
    const isNew=hasUpdate(r.state)&&!(baselineByState.get(r.state)?.points||[]).some(o=>o.x===p.x&&o.end===p.end&&o.y===p.y&&o.poll===p.poll);
    const cx=x(mid(p)),cy=y(p.y);
    return `${isNew?`<circle class="vf-new-poll-halo" cx="${cx}" cy="${cy}" r="7.4" fill="#9254c8" fill-opacity=".20"/>`:''}<circle class="${isNew?'vf-new-poll':''}" cx="${cx}" cy="${cy}" r="${isNew?'5.3':'4.4'}" fill="${isNew?'#9254c8':'#666'}" stroke="white" stroke-width="1"><title>${escape(p.poll||'Måling')} · ${escape(p.x)}–${escape(p.end)} · ${format(p.y,1)} pp${isNew?' · NY MÅLING':''}</title></circle>`;
  }).join('');
  // Four historical date labels and a fixed final tick at election day.
  const dates=Array.from({length:4},(_,i)=>start+(end-start)*i/4).map(d=>`<text x="${x(d)}" y="279" font-size="12" fill="#777" text-anchor="middle">${new Date(d).toLocaleDateString('da-DK',{month:'short',year:'2-digit'})}</text>`).join('');
  const electionLabel=`<line x1="814" y1="33" x2="814" y2="248" stroke="#666" stroke-width="1"/><text x="811" y="279" text-anchor="end" font-size="12" font-weight="bold" fill="#444">3. nov.</text>`;
  const boundary=forecast?`<line class="vf-forecast-boundary" x1="${projectionX}" y1="33" x2="${projectionX}" y2="248" stroke="#9298a0" stroke-width="1.5" stroke-dasharray="3 4"><title>Seneste måling sluttede ${new Date(lastPollEnd).toLocaleDateString('da-DK')}</title></line>`:'';
  const zoneLabel=forecast&&projectedWidth>=115?`<text x="${projectionX+projectedWidth/2}" y="46" font-size="10" font-family="Arial, sans-serif" font-weight="bold" text-anchor="middle" letter-spacing=".7" fill="#60666e">FREMSKRIVNING</text>`:'';
  return `<svg class="vf-chart" viewBox="0 0 845 290" role="img" aria-label="Målinger og udviklingskurver i ${escape(r.state)} frem til valgdagen 3. november 2026. Mørkere baggrund og stiplede kurver viser fremskrivning fra seneste måling.">${shade}${grid}${zeroLine}${boundary}${zoneLabel}${lines}${dots}${dates}${electionLabel}</svg><div class="vf-legend"><span><i class="vf-key vf-dot"></i>Målinger</span>${hasUpdate(r.state)?'<span><i class="vf-key vf-dot vf-dot-new"></i>Ny måling</span>':''}<span><i class="vf-key vf-line"></i>Lineær trend</span><span><i class="vf-key vf-curve"></i>Trend + acceleration</span><span><i class="vf-key vf-forecast"></i>Fremskrivning til 3. nov.</span></div>`;
}
const party=p=>p==='D'?'Demokraterne':p==='R'?'Republikanerne':p==='I'?'Uafhængig':'—';const partyClass=p=>p==='R'?'vf-r':p==='D'||p==='I'?'vf-d':'';
function render(){
  const selectedState=$('vf-jump').selectedOptions[0]?.dataset.state||'';
  const weighted=$('vf-weight').value==='time',half=Number($('vf-half').value);
  $('vf-half-wrap').hidden=!weighted;
  $('vf-half-label').textContent=half+' uger';
  const models=rows.map(r=>calc(r,weighted,half));
  const baselineModels=new Map(BASELINE_STATES.map(r=>{const c=calc(r,weighted,half);return [c.state,c]}));
  const probabilities=window.SenateProbabilityModel?.compute(rows,{weighted,half,retain:.90,shared:2.0});
  const lm=new Map((probabilities?.results.linear.races||[]).map(r=>[r.state,r.p]));
  const am=new Map((probabilities?.results.accelerated.races||[]).map(r=>[r.state,r.p]));
  const sortMode=$('vf-sort').value;
  models.sort((a,b)=>{
    const alphabetical=a.state.localeCompare(b.state,'da');
    if(sortMode==='alpha')return alphabetical;
    if(a.margin==null)return b.margin==null?alphabetical:1;
    if(b.margin==null)return -1;
    const diff=Math.abs(a.margin)-Math.abs(b.margin);
    return (sortMode==='wide'?-diff:diff)||alphabetical;
  });
  const list=$('vf-list');
  list.innerHTML=models.map((r,i)=>{
    const pr=[lm.get(r.state),am.get(r.state)].filter(Number.isFinite).sort((a,b)=>a-b);
    const prob=pr.length?pr.map(p=>(p*100).toLocaleString('da-DK',{maximumFractionDigits:1,minimumFractionDigits:1})+' %').join(' – '):'—';
    const changed=hasUpdate(r.state);
    const old=changed?baselineModels.get(r.state):null;
    const arrows=(metric,label)=>changed?change(r[metric],old?.[metric],label):'';
    const newCount=changed?Math.max(0,(r.points?.length||0)-(old?.points?.length||0)):0;
    const leadMark=changed&&old?.lead!==r.lead?mark(true,'Ændret førende parti efter nye målinger'):'';
    return `<article class="vf-race" id="valg-${i+1}"><div class="vf-race-head"><div><div class="vf-rank">VALG ${String(i+1).padStart(2,'0')} AF ${models.length}</div><h2>${escape(r.state)}${changed?mark(true,'Ny måling i '+r.state):''}</h2><p class="vf-series">${escape(r.series||'Senatsvalg 2026')}</p></div><div class="vf-election"><small>Valgdag</small><div class="vf-margin ${partyClass(r.lead)}">${r.margin==null?'Uden målinger':(r.lead==='R'?'R':'D/I')+' '+Math.abs(r.margin).toLocaleString('da-DK',{minimumFractionDigits:2,maximumFractionDigits:2})+' pp'}</div></div></div><div class="vf-metrics"><div><small>Nuværende mandat</small><strong class="${partyClass(r.inc)}">${party(r.inc)}</strong></div><div><small>Fører i målingerne</small><strong class="${partyClass(r.lead)}">${party(r.lead)}${leadMark}</strong></div><div><small>Margin (D/I – R)</small><strong>${format(r.margin)} pp${arrows('margin','Ændring i D/I-margin')}</strong></div><div><small>Trend pr. uge</small><strong>${format(r.trend)} pp${arrows('trend','Ændring i trend')}</strong></div><div><small>Acceleration pr. uge</small><strong>${format(r.accel)} pp${arrows('accel','Ændring i acceleration')}</strong></div><div><small>Sandsynlighed for D/I</small><strong>${prob}</strong></div><div><small>Målinger</small><strong>${r.points.length}${newCount?mark(true,newCount+' nye målinger'):''}</strong></div></div><div class="vf-chart-label">Hvilken vej går udviklingen?</div>${chart(r)}</article>`;
  }).join('');
  $('vf-jump').innerHTML='<option value="">Vælg delstat…</option>'+models.map((r,i)=>`<option value="valg-${i+1}" data-state="${escape(r.state)}">${String(i+1).padStart(2,'0')} · ${escape(r.state)}</option>`).join('');
  if(selectedState){const opt=[...$('vf-jump').options].find(o=>o.dataset.state===selectedState);if(opt)$('vf-jump').value=opt.value;}
  $('vf-count').textContent=models.length;
}
function syncFloating(){const w=$('vf-weight').value;document.querySelectorAll('[data-vf-weight]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.vfWeight===w)));$('vf-sticky-half-row').hidden=w!=='time';$('vf-sticky-half').value=$('vf-half').value;$('vf-sticky-half-text').textContent=$('vf-half').value+' uger';}
$('vf-sort').addEventListener('change',render);$('vf-weight').addEventListener('change',()=>{syncFloating();render();});$('vf-half').addEventListener('input',()=>{syncFloating();render();});
document.querySelectorAll('[data-vf-weight]').forEach(b=>b.addEventListener('click',()=>{$('vf-weight').value=b.dataset.vfWeight;$('vf-weight').dispatchEvent(new Event('change',{bubbles:true}));}));
$('vf-sticky-half').addEventListener('input',e=>{$('vf-half').value=e.target.value;$('vf-half').dispatchEvent(new Event('input',{bubbles:true}));});
const floatMenu=$('vf-sticky-weight'),controlArea=document.querySelector('.vf-controls');function floatPosition(){const visible=controlArea.getBoundingClientRect().bottom<0;if(visible===floatMenu.hidden){floatMenu.hidden=!visible;if(visible){floatMenu.classList.remove('sticky-weight-enter');void floatMenu.offsetWidth;floatMenu.classList.add('sticky-weight-enter');}}}
window.addEventListener('scroll',floatPosition,{passive:true});window.addEventListener('resize',floatPosition,{passive:true});syncFloating();floatPosition();$('vf-jump').addEventListener('change',e=>{if(e.target.value)document.getElementById(e.target.value)?.scrollIntoView({behavior:'smooth',block:'start'})});render();
})();

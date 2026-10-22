/* Deskriptive huseffekter, beregnet ved indlæsning fra data/polls.js. Ingen ændring af MODEL. */
(function(){
  'use strict';
  const container=document.getElementById('houseEffectPlot');
  if(!container || typeof MODEL==='undefined')return;
  const alias={
    'trafalgar group':'Trafalgar','trafalgar':'Trafalgar',
    'unh':'University of New Hampshire','university of new hampshire':'University of New Hampshire',
    'emerson college':'Emerson','emerson':'Emerson',
    'quantus insights':'Quantus','quantus':'Quantus',
    'nyt/siena':'NYT/Siena'
  };
  const norm=name=>alias[String(name||'').trim().toLowerCase()]||String(name||'').trim();
  const midpoint=p=>(Date.parse(p.x+'T12:00:00Z')+Date.parse((p.end||p.x)+'T12:00:00Z'))/2;
  window.HOUSE_EFFECTS={normalize:norm,estimate:function(states){
    const records=[];
    for(const state of states){if(state.kind!=='D-R')continue;for(const p of state.points||[]){if(!Number.isFinite(Number(p.y))||!p.x)continue;records.push({state:state.state,pollster:norm(p.poll),y:Number(p.y),date:midpoint(p)});}}
    const byState=new Map();for(const r of records){if(!byState.has(r.state))byState.set(r.state,[]);byState.get(r.state).push(r);}
    const diffs=new Map();for(const r of records){const peers=byState.get(r.state).filter(q=>q!==r&&q.pollster!==r.pollster&&Math.abs(q.date-r.date)<=21*86400000);if(!peers.length)continue;const mean=peers.reduce((sum,q)=>sum+q.y,0)/peers.length;if(!diffs.has(r.pollster))diffs.set(r.pollster,[]);diffs.get(r.pollster).push(r.y-mean);}
    return new Map([...diffs].map(([name,v])=>[name,{n:v.length,effect:(v.reduce((a,b)=>a+b,0)/v.length)*v.length/(v.length+8)}]));
  }};
  const rows=[];
  for(const state of MODEL.states){
    if(state.kind!=='D-R')continue;
    for(const p of state.points||[]){
      if(!Number.isFinite(Number(p.y))||!p.x)continue;
      rows.push({state:state.state,pollster:norm(p.poll),y:Number(p.y),date:midpoint(p)});
    }
  }
  const byState=new Map();
  for(const r of rows){if(!byState.has(r.state))byState.set(r.state,[]);byState.get(r.state).push(r);}
  const diffs=new Map();let matches=0;
  for(const r of rows){
    const peers=byState.get(r.state).filter(q=>q!==r && q.pollster!==r.pollster && Math.abs(q.date-r.date)<=21*86400000);
    if(!peers.length)continue;
    const peerMean=peers.reduce((s,p)=>s+p.y,0)/peers.length;
    if(!diffs.has(r.pollster))diffs.set(r.pollster,[]);
    diffs.get(r.pollster).push(r.y-peerMean);matches++;
  }
  const estimates=[...diffs.entries()].map(([name,values])=>{
    const n=values.length,raw=values.reduce((s,v)=>s+v,0)/n;
    return {name,n,raw,effect:raw*n/(n+8)};
  }).filter(d=>d.n>=4).sort((a,b)=>b.effect-a.effect);
  const limit=Math.max(2,Math.ceil(Math.max(...estimates.map(d=>Math.abs(d.effect)),2)*2)/2);
  const fmt=v=>(v>0?'+':'')+v.toLocaleString('da-DK',{minimumFractionDigits:2,maximumFractionDigits:2});
  const row=d=>{
    const el=document.createElement('div');el.className='house-row';
    const name=document.createElement('div');name.className='house-name';name.textContent=d.name;
    const count=document.createElement('div');count.className='house-count';count.textContent=d.n+' sammenl.';name.appendChild(document.createElement('br'));name.appendChild(count);
    const track=document.createElement('div');track.className='house-track';
    const bar=document.createElement('div');bar.className='house-bar '+(d.effect>=0?'dem':'rep');
    const width=Math.min(50,Math.abs(d.effect)/limit*50);
    bar.style.width=width+'%';bar.style.left=(d.effect>=0?50:50-width)+'%';track.appendChild(bar);
    const value=document.createElement('div');value.className='house-value '+(d.effect>=0?'dem':'rep');value.textContent=fmt(d.effect)+' pp';
    el.append(name,track,value);return el;
  };
  if(!estimates.length){container.textContent='For få sammenlignelige målinger til at vise institutspecifikke estimater.';return;}
  for(const d of estimates)container.appendChild(row(d));
  const axis=document.createElement('div');axis.className='house-axis';
  for(const label of ['−'+limit.toLocaleString('da-DK')+' R','0','+'+limit.toLocaleString('da-DK')+' D']){const span=document.createElement('span');span.textContent=label;axis.appendChild(span);}
  container.appendChild(axis);
  document.getElementById('houseEffectSummary').textContent=`Beregnet fra ${rows.length} D–R-målinger, heraf ${matches} med mindst én sammenlignelig måling fra et andet institut. ${estimates.length} institutter har mindst fire sammenligninger. Tallene er foreløbige og beregnes på ny, når databasen opdateres.`;
  // Beskrivende variation mellem samtidige målinger. Ingen modelparametre ændres.
  // Korrigerede afvigelser bruger leave-one-out-huseffekt, så observationen
  // ikke bidrager til at estimere sin egen korrektion.
  const comparisons=[];
  for(const r of rows){
    const peers=byState.get(r.state).filter(q=>q!==r&&q.pollster!==r.pollster&&Math.abs(q.date-r.date)<=21*86400000);
    if(!peers.length)continue;
    const peerMean=peers.reduce((sum,q)=>sum+q.y,0)/peers.length;
    const raw=r.y-peerMean;
    const others=(diffs.get(r.pollster)||[]);
    const n=others.length-1;
    const loo=n>0?(others.reduce((sum,x)=>sum+x,0)-raw)/(n+8):0;
    comparisons.push({state:r.state,raw,corrected:raw-loo});
  }
  const rms=(data,key)=>Math.sqrt(data.reduce((sum,r)=>sum+r[key]*r[key],0)/data.length);
  const std=(data,key)=>{const mean=data.reduce((sum,r)=>sum+r[key],0)/data.length;return Math.sqrt(data.reduce((sum,r)=>sum+(r[key]-mean)**2,0)/(data.length-1));};
  const rawRms=rms(comparisons,'raw'),correctedRms=rms(comparisons,'corrected');
  const rawSd=std(comparisons,'raw'),correctedSd=std(comparisons,'corrected');
  const statesCount=new Set(comparisons.map(x=>x.state)).size;
  const fmt2=x=>x.toLocaleString('da-DK',{minimumFractionDigits:2,maximumFractionDigits:2});
  const metric=document.getElementById('houseUncertaintyMetrics');
  const details=document.getElementById('houseUncertaintyDetails');
  if(metric&&details&&comparisons.length>1){
    const values=[
      ['Spredning før korrektion',fmt2(rawSd)+' pp'],
      ['Spredning efter korrektion',fmt2(correctedSd)+' pp'],
      ['RMSE efter korrektion',fmt2(correctedRms)+' pp'],
      ['Sammenlignelige målinger',String(comparisons.length)]
    ];
    metric.innerHTML=values.map(([label,value])=>'<div class="house-uncertainty-card"><small>'+label+'</small><strong>'+value+'</strong></div>').join('');
    details.textContent='Beregnet fra '+comparisons.length+' sammenligninger i '+statesCount+' delstater. RMSE før korrektion: '+fmt2(rawRms)+' pp. Korrektionen estimeres med leave-one-out for hver måling og dæmpes med n/(n+8).';
  }

})();

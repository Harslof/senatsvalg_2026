;
const original=MODEL.states,colors={D:'#3478c8',R:'#c74747',I:'#929292','?':'#c6a451'};const election=Date.parse('2026-11-03T12:00:00Z');


;
const updateUI=window.SenateUpdateUI;
const isUpdateActive=()=>updateUI.active();
const mark=(changed,title='Ændret af nye målinger')=>updateUI.mark(changed,title);
const changeMark=(now,before,title)=>updateUI.change(now,before,title);
const differs=(a,b)=>updateUI.differs(a,b);
let baselineState=[];
let state=[],reverse=false,expanded=false,selectedRace=null;
let probabilityRanges=new Map();
const $=id=>document.getElementById(id),val=name=>document.querySelector('input[name="'+name+'"]:checked').value,fmt=(n,d=2)=>n==null||!Number.isFinite(n)?'—':(n>0?'+':'')+n.toLocaleString('da-DK',{minimumFractionDigits:d,maximumFractionDigits:d}),esc=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'),cls=(n,kind)=>n==null?'muted':n<0?'neg':kind==='I-R'?'ind':'pos',badge=p=>p?'<span class="pill '+p+'">'+p+'</span>':'—';
function solve(A,b){const n=b.length,m=A.map((r,i)=>[...r,b[i]]);for(let k=0;k<n;k++){let p=k;for(let i=k+1;i<n;i++)if(Math.abs(m[i][k])>Math.abs(m[p][k]))p=i;if(Math.abs(m[p][k])<1e-10)return null;[m[k],m[p]]=[m[p],m[k]];let v=m[k][k];for(let j=k;j<=n;j++)m[k][j]/=v;for(let i=0;i<n;i++)if(i!==k){v=m[i][k];for(let j=k;j<=n;j++)m[i][j]-=v*m[k][j]}}return m.map(r=>r[n])}
function wls(points,degree,half,weighted){const dates=points.map(p=>(Date.parse(p.x+'T12:00:00Z')+Date.parse(p.end+'T12:00:00Z'))/2),latest=Math.max(...dates),t=dates.map(d=>(d-latest)/604800000),k=degree+1;if(points.length<k||-Math.min(...t)<4)return null;const A=Array.from({length:k},()=>Array(k).fill(0)),b=Array(k).fill(0);for(let i=0;i<points.length;i++){const w=weighted?Math.pow(2,t[i]/half):1,v=Array.from({length:k},(_,j)=>t[i]**j);for(let j=0;j<k;j++){b[j]+=w*v[j]*points[i].y;for(let l=0;l<k;l++)A[j][l]+=w*v[j]*v[l]}}return solve(A,b)}
window.getSenateWeighting=()=>({weighted:document.querySelector('input[name="weight"]:checked')?.value==='time',half:Number(document.getElementById('half')?.value||8)});
function updatePollCount(){
 const n=original.reduce((sum,r)=>sum+(r.points?.length||0),0);
 const el=document.getElementById('pollCount');if(el){
  el.textContent=n.toLocaleString('da-DK');
  const baselineCount=BASELINE_STATES.reduce((sum,r)=>sum+(r.points?.length||0),0);
  const added=n-baselineCount;
  if(isUpdateActive()&&added>0){
    el.insertAdjacentHTML('beforeend',`<span class="poll-count-update">${mark(true,'Nye målinger i beregningen')}<small>+${added.toLocaleString('da-DK')}</small></span>`);
  }
 }
 const foot=document.getElementById('pollCountFoot');if(foot)foot.textContent=n.toLocaleString('da-DK');
}
updatePollCount();
function recompute(){const {weighted:time,half}=window.getSenateWeighting();$('halfbox').hidden=!time;$('halftext').textContent=half;$('weightnote').textContent=time?'Målingerne i alle 28 delstater vægtes med '+half+' '+(half===1?'uges':'ugers')+' halveringstid (jf. metode).':'Alle registrerede målinger får samme vægt.';const calculateRows=rows=>rows.map(r=>{const pts=r.points||[],out={...r};if(!pts.length)return out;const dates=pts.map(p=>(Date.parse(p.x+'T12:00:00Z')+Date.parse(p.end+'T12:00:00Z'))/2),latest=Math.max(...dates),weights=dates.map(d=>time?Math.pow(2,(d-latest)/604800000/half):1);out.margin=pts.reduce((s,p,i)=>s+p.y*weights[i],0)/weights.reduce((a,b)=>a+b,0);// If the weighted polling average is exactly tied, use the most recent
// poll's lead as a display-only tie-breaker; retain the 0.00 margin.
const newest=pts.reduce((best,p,i)=>dates[i]>dates[best]?i:best,0);
const tieLead=pts[newest].y>0?(r.kind==='I-R'?'I':'D'):pts[newest].y<0?'R':null;
out.lead=out.margin>1e-10?(r.kind==='I-R'?'I':'D'):out.margin< -1e-10?'R':tieLead;const lin=wls(pts,1,half,time),quad=wls(pts,2,half,time);out.trend=lin?lin[1]:null;out.accel=quad?2*quad[2]:null;out.latestDate=latest;return out});baselineState=calculateRows(BASELINE_STATES);state=calculateRows(original);draw();window.updateProbabilityModel?.()}
function forecast(r){if(!r||r.margin==null)return null;const start=r.latestDate??(r.latest?Date.parse(r.latest+'T12:00:00Z'):election),weeks=Math.max(0,(election-start)/604800000);return r.margin+(r.trend??0)*weeks+(val('projection')==='quadratic'?.5*(r.accel??0)*weeks*weeks:0)}
function leader(r,m){return m==null?null:m>1e-10?(r.kind==='I-R'?'I':'D'):m< -1e-10?'R':r.lead}
function draw(){drawTable();drawSeats();drawNational();drawPlay();drawUpdateAnalysis()}
function drawTable(){let a=state.filter(r=>r.state.toLowerCase().includes($('search').value.toLowerCase())&&( $('filter').value==='all'||$('filter').value==='none'&&!r.lead||r.lead===$('filter').value));const key=$('sort').value;a.sort((x,y)=>{const a=x[key],b=y[key];let c=key==='state'?x.state.localeCompare(y.state):a==null&&b==null?0:a==null?1:b==null?-1:a-b;return reverse?-c:c});$('thead').innerHTML='<tr><th>Delstat</th><th>Nu</th><th>Fører</th><th class="num">Margin</th><th class="num">Trend</th><th class="num">Accel.</th><th class="num">Sandsynlighed D/I</th>'+(expanded?'<th class="num">Målinger</th><th>Serie</th>':'')+'</tr>';$('tbody').innerHTML=a.map(r=>'<tr><td><b>'+esc(r.state)+'</b>'+mark(UPDATE_STATES.has(r.state),'Ny måling i '+r.state)+'</td><td>'+badge(r.inc)+'</td><td>'+badge(r.lead)+mark(UPDATE_STATES.has(r.state)&&r.lead!==baselineState.find(b=>b.state===r.state)?.lead)+'</td><td class="num '+cls(r.margin,r.kind)+'">'+fmt(r.margin)+changeMark(r.margin,UPDATE_STATES.has(r.state)?baselineState.find(b=>b.state===r.state)?.margin:r.margin,'Ændring i D/I-margin')+'</td><td class="num '+cls(r.trend,r.kind)+'">'+fmt(r.trend)+changeMark(r.trend,UPDATE_STATES.has(r.state)?baselineState.find(b=>b.state===r.state)?.trend:r.trend,'Ændring i trend')+'</td><td class="num '+cls(r.accel,r.kind)+'">'+fmt(r.accel)+changeMark(r.accel,UPDATE_STATES.has(r.state)?baselineState.find(b=>b.state===r.state)?.accel:r.accel,'Ændring i acceleration')+'</td><td class="num probability-range" title="Spænd mellem lineær trend og trend + acceleration">'+(probabilityRanges.get(r.state)||'—')+'</td>'+(expanded?'<td class="num">'+r.n+'</td><td>'+esc(r.series)+'</td>':'')+'</tr>').join('')}
const partyGroup=p=>p==='I'?'D':p;
function play(){return state.filter(r=>r.margin!=null&&(partyGroup(r.lead)!==partyGroup(r.inc)||Math.abs(r.margin)<=4)).sort((a,b)=>Math.abs(a.margin)-Math.abs(b.margin))}
function seatDistribution(rows){const polled={R:53,D:47,I:0,'?':0},future={...polled};const inplay=new Set(rows.filter(r=>r.margin!=null&&(partyGroup(r.lead)!==partyGroup(r.inc)||Math.abs(r.margin)<=4)).map(r=>r.state));for(const r of rows){if(r.margin==null){continue} /* Mandatet fastholdes hos siddende parti. */if(r.lead&&partyGroup(r.lead)!==partyGroup(r.inc)){polled[partyGroup(r.inc)]--;polled[partyGroup(r.lead)]++}const lead=inplay.has(r.state)?leader(r,forecast(r)):r.lead;if(lead&&partyGroup(lead)!==partyGroup(r.inc)){future[partyGroup(r.inc)]--;future[partyGroup(lead)]++}}return [polled,future]}

// Last completed election for the specific 2026 Senate seat. Signed winner-runner-up margin.
// Class 2: 2020, Georgia January 2021 runoff; Florida/Ohio special seats: 2022.
// Arkansas 2020: Republican versus Libertarian (no Democratic candidate).
const historicalSenateResults = {"Arkansas": {"margin": -33.06, "year": 2020}, "Delaware": {"margin": 21.54, "year": 2020}, "Georgia": {"margin": 1.23, "year": 2021}, "Idaho": {"margin": -29.37, "year": 2020}, "Louisiana": {"margin": -40.3, "year": 2020}, "Oklahoma": {"margin": -30.16, "year": 2020}, "Oregon": {"margin": 17.59, "year": 2020}, "Rhode Island": {"margin": 33.12, "year": 2020}, "West Virginia": {"margin": -43.28, "year": 2020}, "Wyoming": {"margin": -46.09, "year": 2020}, "Florida": {"margin": -16.41, "year": 2022}, "Ohio": {"margin": -6.12, "year": 2022}, "Alaska": {"margin": -12.7, "year": 2020}, "Alabama": {"margin": -20.36, "year": 2020}, "Colorado": {"margin": 9.32, "year": 2020}, "Iowa": {"margin": -6.59, "year": 2020}, "Illinois": {"margin": 16.07, "year": 2020}, "Kansas": {"margin": -11.44, "year": 2020}, "Kentucky": {"margin": -19.53, "year": 2020}, "Massachusetts": {"margin": 33.11, "year": 2020}, "Maine": {"margin": -8.6, "year": 2020}, "Michigan": {"margin": 1.69, "year": 2020}, "Minnesota": {"margin": 5.24, "year": 2020}, "Mississippi": {"margin": -9.98, "year": 2020}, "Montana": {"margin": -10.02, "year": 2020}, "North Carolina": {"margin": -1.75, "year": 2020}, "Nebraska": {"margin": -38.31, "year": 2020}, "New Hampshire": {"margin": 15.65, "year": 2020}, "New Jersey": {"margin": 16.31, "year": 2020}, "New Mexico": {"margin": 6.11, "year": 2020}, "South Carolina": {"margin": -10.27, "year": 2020}, "South Dakota": {"margin": -31.47, "year": 2020}, "Tennessee": {"margin": -27.04, "year": 2020}, "Texas": {"margin": -9.64, "year": 2020}, "Virginia": {"margin": 12.08, "year": 2020}};
const historicalStateAbbr = {"Alabama": "AL", "Alaska": "AK", "Arkansas": "AR", "Colorado": "CO", "Delaware": "DE", "Florida": "FL", "Georgia": "GA", "Idaho": "ID", "Illinois": "IL", "Iowa": "IA", "Kansas": "KS", "Kentucky": "KY", "Louisiana": "LA", "Maine": "ME", "Massachusetts": "MA", "Michigan": "MI", "Minnesota": "MN", "Mississippi": "MS", "Montana": "MT", "Nebraska": "NE", "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM", "North Carolina": "NC", "Ohio": "OH", "Oklahoma": "OK", "Oregon": "OR", "Rhode Island": "RI", "South Carolina": "SC", "South Dakota": "SD", "Tennessee": "TN", "Texas": "TX", "Virginia": "VA", "West Virginia": "WV", "Wyoming": "WY"};
// Thresholds for each party in the 35-race view, counting fixed seats.
// The 51, 60 and 67 lines are omitted when mathematically unreachable.
function seatThresholdGuides(items,left,step,bw,baseline){
 const contestedR=state.filter(r=>r.inc==='R').length;
 const fixedR=53-contestedR, fixedDI=47-(state.length-contestedR);
 const n=items.length;
 const guides=[51,60,67].flatMap(target=>[
  {party:'D/I',target,at:target-fixedDI,shade:target!==51},
  {party:'R',target,at:n-(target-fixedR),shade:target!==51}
 ]);
 return guides.filter(g=>g.at>=0&&g.at<=n).map(g=>{
  const x=left+g.at*step-(step-bw)/2;
  const color=g.shade?'#9da8b6':'#526277';
  const opacity=g.shade?'0.7':'0.95';
  return '<g class="seat-threshold-guide"><title>'+g.party+' · '+g.target+' mandater inklusive mandater, der ikke er på valg</title>'+
   '<line x1="'+x+'" x2="'+x+'" y1="21" y2="'+baseline+'" stroke="'+color+'" stroke-width="'+(g.shade?1.1:1.7)+'" stroke-dasharray="'+(g.shade?'3 5':'5 4')+'" opacity="'+opacity+'"/>'+
   '<text x="'+x+'" y="14" text-anchor="middle" font-size="10" font-weight="700" fill="'+color+'">'+g.target+'</text></g>';
 }).join('');
}
function seatMarginBreakdown(){
 // D/I to the left, R to the right; labels sit on an uninterrupted zero band.
 const items=Object.entries(historicalSenateResults).map(([name,d])=>({name,...d,abbr:historicalStateAbbr[name]})).sort((a,b)=>b.margin-a.margin);
 const left=8, step=24, bw=18, baseline=183, scale=3.25, w=left+items.length*step+6, h=206;
 const cols=items.map((d,i)=>{const x=left+i*step, bh=Math.abs(d.margin)*scale, y=baseline-bh, mag=Math.abs(d.margin).toFixed(1).replace('.',','), inside=bh>28;
 const numberY=inside?y+12:y-5;
 return '<g class="seat-historic-column" style="--i:'+i+'"><title>'+d.name+' · '+d.year+' · '+(d.margin>=0?'D/I':'R')+' +'+Math.abs(d.margin).toFixed(2).replace('.',',')+' pp</title><rect x="'+x+'" y="'+y+'" width="'+bw+'" height="'+bh+'" rx="1.5" fill="'+(d.margin>=0?'#3478c8':'#c74747')+'"/><text x="'+(x+bw/2)+'" y="'+numberY+'" font-size="8" font-weight="700" text-anchor="middle" fill="'+(inside?'#fff':'#202b3c')+'">'+mag+'</text></g>';}).join('');
 const labels=items.map((d,i)=>'<text x="'+(left+i*step+bw/2)+'" y="'+(baseline+14)+'" text-anchor="middle" font-size="9" font-weight="650" fill="#293648">'+d.abbr+'</text>').join('');
 return '<div class="seat-margin-breakdown"><div class="seat-margin-scroll"><svg viewBox="0 0 '+w+' '+h+'" role="img" aria-label="35 delstater sorteret fra største demokratiske sejr til største republikanske sejr; alle søjler peger opad" style="font-family:Arial,Helvetica,sans-serif">'+cols+seatThresholdGuides(items,left,step,bw,baseline)+'<rect x="'+(left-2)+'" y="'+(baseline+1)+'" width="'+(w-left+3)+'" height="19" fill="#f1f3f7"/>'+labels+'</svg></div></div>';
}
function seatPollingBreakdown(mode){
 // Signed D/I minus R margin, sorted from Democratic/Independent lead to Republican lead.
 const items=state.map(r=>({name:r.state,abbr:historicalStateAbbr[r.state]||r.state.slice(0,2).toUpperCase(),margin:mode==='election'?forecast(r):r.margin,kind:r.kind,inc:r.inc})).sort((a,b)=>{
  // Unpolled D/I seats go at the far left; unpolled R seats at the far right.
  // Keep every polled race between these groups so unknown margins cannot look competitive.
  const group=r=>r.margin==null?(partyGroup(r.inc)==='D'?0:3):(r.margin>=0?1:2);
  const ga=group(a),gb=group(b);
  if(ga!==gb)return ga-gb;
  if(a.margin==null)return a.name.localeCompare(b.name,'da');
  return b.margin-a.margin;
 });
 const left=8,step=24,bw=18,scale=3.25,w=left+items.length*step+6;
 const maxAbs=Math.max(1,...items.filter(d=>d.margin!=null).map(d=>Math.abs(d.margin)));
 const factor=Math.min(scale,151/maxAbs);
 const tallest=maxAbs*factor;
 const baseline=Math.ceil(tallest+19),h=baseline+23;
 const cols=items.map((d,i)=>{
   const x=left+i*step;
   if(d.margin==null)return '<g><title>'+esc(d.name)+' · Ingen målinger – nuværende parti fastholdt ('+esc(partyGroup(d.inc))+')</title><rect x="'+x+'" y="'+(baseline-3)+'" width="'+bw+'" height="3" rx="1" fill="'+(partyGroup(d.inc)==='D'?'#3478c8':'#c74747')+'"/></g>';
   const bh=Math.max(1.5,Math.abs(d.margin)*factor),y=baseline-bh,mag=Math.abs(d.margin).toFixed(1).replace('.',','),inside=bh>28;
   return '<g class="seat-historic-column" style="--i:'+i+'"><title>'+esc(d.name)+' · '+(mode==='election'?'Valgdag':'Margin')+' · '+(d.margin>=0?(d.kind==='I-R'?'I':'D'):'R')+' +'+mag+' pp</title><rect x="'+x+'" y="'+y+'" width="'+bw+'" height="'+bh+'" rx="1.5" fill="'+(d.margin>=0?'#3478c8':'#c74747')+'"/><text x="'+(x+bw/2)+'" y="'+(inside?y+12:y-5)+'" font-size="8" font-weight="700" text-anchor="middle" fill="'+(inside?'#fff':'#202b3c')+'">'+mag+'</text></g>';
 }).join('');
 const labels=items.map((d,i)=>'<text x="'+(left+i*step+bw/2)+'" y="'+(baseline+14)+'" text-anchor="middle" font-size="9" font-weight="650" fill="#293648">'+esc(d.abbr)+'</text>').join('');
 return '<div class="seat-margin-breakdown"><div class="seat-margin-scroll"><svg viewBox="0 0 '+w+' '+h+'" role="img" aria-label="Delstater sorteret fra største demokratiske til største republikanske føring; alle søjler peger opad" style="font-family:Arial,Helvetica,sans-serif">'+cols+seatThresholdGuides(items,left,step,bw,baseline)+'<rect x="'+(left-2)+'" y="'+(baseline+1)+'" width="'+(w-left+3)+'" height="19" fill="#f1f3f7"/>'+labels+'</svg></div></div>';
}
function sizeSeatMorphCharts(){
 document.querySelectorAll('#bars .seat-morph-stage').forEach(stage=>{
  const svg=stage.querySelector('.seat-margin-scroll svg');
  if(!svg)return;
  const height=svg.getBoundingClientRect().height;
  stage.style.setProperty('--seat-expanded-height',Math.ceil(height+2)+'px');
 });
}
window.addEventListener('resize',sizeSeatMorphCharts);
function drawSeats(){const current={R:53,D:47,I:0,'?':0},polled={...current},future={...current},inplay=new Set(play().map(r=>r.state));for(const r of state){if(r.margin==null){continue} /* Mandatet fastholdes hos siddende parti. */if(r.lead&&partyGroup(r.lead)!==partyGroup(r.inc)){polled[partyGroup(r.inc)]--;polled[partyGroup(r.lead)]++}const lead=inplay.has(r.state)?leader(r,forecast(r)):r.lead;if(lead&&partyGroup(lead)!==partyGroup(r.inc)){future[partyGroup(r.inc)]--;future[partyGroup(lead)]++}}const baselineSeats=seatDistribution(baselineState);const bars=[['Nuværende fordeling',current],['Fordeling efter målingerne',polled],['Mekanisk fremskrivning til valgdagen',future]];$('bars').innerHTML=bars.map(([label,data],i)=>(i===2?'<div class="projection-intro"><p>Man siger, at virkeligheden ikke kan forlænges med brædder. Den metodiske udlægning af samme princip er, at man ikke uden videre kan lave en lineær fremskrivning på en tidsvariabel.</p><p>Men det skal jo ikke holde os fra at spå. På kort sigt kan man godt forestille sig, at udviklingen fra i går alt andet lige fortsætter i morgen, fordi der er en vis træghed i nyheders spredning. Derfor har vi lavet et bud på en fremskrivning på baggrund af de eksisterende trends.</p></div>':'')+'<div class="bar-title">'+label+mark(i>0&&['R','D','I','?'].some(p=>data[p]!==baselineSeats[i-1][p]))+'</div>'+'<div class="seat-morph-stage" tabindex="0" aria-label="Hold musen her for at se delstaternes marginer">'+'<div class="bar">'+['D','I','?','R'].filter(p=>data[p]>0).map(p=>'<div class="segment" style="width:'+data[p]+'%;background:'+colors[p]+'">'+(data[p]>=6?p+' '+data[p]:'')+'</div>').join('')+`<div class="mandate-guides" aria-hidden="true">${[33,40,49,51,60,67].map(n=>`<span class="mandate-guide ${n===49||n===51?'major':''}" style="left:${n}%" title="${n} D/I / ${100-n} R"></span>`).join('')}</div>`+'</div><p class="foot">'+['R','D','I','?'].filter(p=>data[p]>0).map(p=>(p==='?'?'Uafklaret':p)+' '+data[p]+(i>0?changeMark(data[p],baselineSeats[i-1][p],'Ændring i mandatantal'): '')).join(' · ')+'</p>'+(i===0?seatMarginBreakdown():seatPollingBreakdown(i===1?'margin':'election'))+'</div>').join('')+'<p class="foot">Valg uden målinger fastholdes hos det siddende parti og vises som korte blå eller røde markeringer i delstatsgraferne, uden en beregnet målingsmargin.</p>'+'<p class="foot mandate-legend">Stiplede linjer: 51–49 · 60–40 · 67–33, for begge partier. Ved 50–50 kan vicepræsidenten afgøre stemmelighed.</p>';requestAnimationFrame(sizeSeatMorphCharts)}
function national(key,rows=state){const a=rows.filter(r=>(r.kind==='D-R'||r.kind==='I-R')&&r[key]!=null).map(r=>r[key]),n=a.length,mean=a.reduce((s,x)=>s+x,0)/n,sd=Math.sqrt(a.reduce((s,x)=>s+(x-mean)**2,0)/(n-1)),se=sd/Math.sqrt(n);return {n,mean,lo:mean-1.96*se,hi:mean+1.96*se}}
function drawNational(){
 const polled=state.filter(r=>r.margin!=null);
 const currentD=47;
 // Respect the same missing-poll setting as the existing Senate seat barometer.
 const counted=seatDistribution(state)[0];
 const pollD=counted.D, pollR=counted.R,unknown=counted['?'];
 const tr=national('trend'),ac=national('accel');
 const oldTr=national('trend',baselineState),oldAc=national('accel',baselineState);
 const prob=window.latestSenateProbabilities;
 const span=(a,b,d=1)=>Number.isFinite(a)&&Number.isFinite(b)?[Math.min(a,b),Math.max(a,b)].map(v=>v.toLocaleString('da-DK',{minimumFractionDigits:d,maximumFractionDigits:d})).join('–'):'—';
 const margin=polled.length?polled.reduce((sum,r)=>sum+r.margin,0)/polled.length:null;
 const weeks=r=>Math.max(0,(election-r.latestDate)/604800000);
 const project=accelerated=>{
   let seats=47;const margins=[];
   for(const r of polled){
     const m=r.margin+(r.trend||0)*weeks(r)+(accelerated?.5*(r.accel||0)*weeks(r)**2:0);
     margins.push(m);
     if(partyGroup(r.inc)==='D'&&m<0)seats--;
     if(partyGroup(r.inc)==='R'&&m>0)seats++;
   }
   return {seats,margin:margins.length?margins.reduce((a,b)=>a+b,0)/margins.length:null};
 };
 const linear=project(false),accelerated=project(true);
 const probability=prob?span(100*prob.results.linear.national.majority,100*prob.results.accelerated.national.majority)+' %':'—';
 const oldProb=window.baselineSenateProbabilities;
 const probChange=prob&&oldProb?changeMark((prob.results.linear.national.majority+prob.results.accelerated.national.majority)/2,(oldProb.results.linear.national.majority+oldProb.results.accelerated.national.majority)/2,'Ændring i gennemsnitlig D/I-flertalschance'):'';
 const majority=unknown>0&&Math.max(pollD,pollR)<51?'?':pollD>=51?'D':pollR>=51?'R':'?';
 const partyColor=n=>n>0?'national-dem':n<0?'national-rep':'national-neutral';
 const result=(margin,seats)=>`<span class="national-figure ${seats>=51?'national-dem':'national-rep'}">${seats} D/I</span>`;
 const electionSeats=linear.seats===accelerated.seats?String(linear.seats):span(linear.seats,accelerated.seats,0);
 const electionDem=linear.seats>=51&&accelerated.seats>=51;
 const electionRep=linear.seats<51&&accelerated.seats<51;
 $('national').innerHTML=`<div class="national-race-card">
  <div class="national-race-top">
   <div class="national-race-identity"><strong>Nationalt · Senatet</strong><div class="national-party-flow"><span class="national-party national-party-r">R</span><span class="national-flow-arrow">→</span><span class="national-party ${majority==='D'?'national-party-d':majority==='R'?'national-party-r':'national-party-unknown'}">${majority}</span><span class="national-party-caption">Nu → iflg. målingerne</span></div></div>
   <div class="national-race-election"><small>Valgdag</small><div class="national-inline-values"><span class="national-figure ${electionDem?'national-dem':electionRep?'national-rep':'national-neutral'}">${electionSeats} D/I</span></div></div>
  </div>
  <div class="national-race-grid">
   <div><small>Margin · målinger</small><div class="national-inline-values">${result(margin,pollD)}</div></div>
   <div><small>Trend / uge</small><div class="national-figure ${partyColor(tr.mean)}">${fmt(tr.mean,2)} pp${changeMark(tr.mean,oldTr.mean,'Ændring i national trend')}</div></div>
   <div><small>Acceleration / uge²</small><div class="national-figure ${partyColor(ac.mean)}">${fmt(ac.mean,2)} pp${changeMark(ac.mean,oldAc.mean,'Ændring i national acceleration')}</div></div>
  </div>
  <div class="national-race-probability"><span>Sandsynlighed for D/I-flertal</span><strong class="national-figure national-dem">${probability}${probChange}</strong></div>
 </div>`;
}
function drawPlay(){
 const TIGHT_LIMIT=4;
 const countIndicators=rows=>{
   const polled=rows.filter(r=>r.margin!=null);
   const closeNow=r=>Math.abs(r.margin)<=TIGHT_LIMIT;
   const closeElection=r=>Number.isFinite(forecast(r))&&Math.abs(forecast(r))<=TIGHT_LIMIT;
   const changeNow=r=>r.lead!=null&&partyGroup(r.lead)!==partyGroup(r.inc);
   const changeElection=r=>{
     const projected=leader(r,forecast(r));
     return projected!=null&&partyGroup(projected)!==partyGroup(r.inc);
   };
   return [polled.filter(closeNow).length,polled.filter(closeElection).length,
     polled.filter(changeNow).length,polled.filter(changeElection).length,
     polled.filter(r=>closeNow(r)||closeElection(r)).length];
 };
 const labels=['Tætte valg i nuværende målinger (margin)','Tætte valg på valgdagen',
   'Valg hvor pladsen skifter i nuværende målinger','Valg hvor pladsen skifter på valgdagen',
   'Antal tætte valg samlet'];
 const counts=countIndicators(state),oldCounts=countIndicators(baselineState);
 $('playcounts').innerHTML=labels.map((label,i)=>'<div class="card"><small>'+label+'</small><strong>'+counts[i]+changeMark(counts[i],oldCounts[i],'Ændring i antal valg')+'</strong></div>').join('');
 const a=play();
 const all=val('raceview')==='all', metric=val('racesort')==='forecast'?'forecast':'margin';
 $('raceSortOptions').hidden=!all;
 $('raceExplainer').hidden=!all;
 $('raceBarometer').hidden=true;document.body.classList.toggle('play-only-view',!all);$('zoomSenate').hidden=!all;$('races').hidden=all;$('races').setAttribute('aria-hidden',String(all));
 const score=r=>metric==='forecast'?forecast(r):r.margin;
 const polled=state.filter(r=>r.margin!=null).sort((x,y)=>{
   const sx=score(x),sy=score(y);
   const vx=Number.isFinite(sx)?sx:x.margin,vy=Number.isFinite(sy)?sy:y.margin;
   return vy-vx||x.state.localeCompare(y.state,'da');
 });
 const unpolled=state.filter(r=>r.margin==null).sort((x,y)=>x.state.localeCompare(y.state,'da'));
 const unpolledD=unpolled.filter(r=>r.inc==='D'||r.inc==='I');
 const unpolledR=unpolled.filter(r=>r.inc!=='D'&&r.inc!=='I');
 const ordered=all?[...unpolledD,...polled,...unpolledR]:a;
 const fixedD=47-state.filter(r=>r.inc==='D'||r.inc==='I').length;
 const needed=Math.max(0,51-fixedD),cutoff=Math.min(ordered.length,needed);
 const cutoffText='51 D/I-mandater · '+fixedD+' ikke på valg + '+needed+' valgsejre';
 const party=r=>r.margin==null?r.inc:(score(r)>=0?(r.kind==='I-R'?'I':'D'):'R');
 const partyClass=r=>r.margin==null?(r.inc==='R'?'r':'d'):(score(r)>=0?'d':'r');
 const oldByName=new Map(baselineState.map(r=>[r.state,r]));
 const renderRace=r=>{
   const m=forecast(r),lead=leader(r,m),hasPoll=r.margin!=null,old=oldByName.get(r.state);
   return '<div class="race"><div class="race-top"><div><b>'+esc(r.state)+'</b>'+mark(UPDATE_STATES.has(r.state),'Ny måling i '+r.state)+'<div style="margin-top:7px">'+badge(r.inc)+' → '+badge(r.lead)+' <small class="muted">'+(!hasPoll?'Ingen målinger':r.inc!==r.lead?'Partiskift':Math.abs(r.margin)<=4?'Tæt valg':'')+'</small></div></div><div style="text-align:right"><small class="muted">Valgdag</small><div style="font-size:23px;font-weight:750" class="'+cls(m,r.kind)+'">'+fmt(m)+' '+(lead||'—')+changeMark(m,UPDATE_STATES.has(r.state)?(old?forecast(old):null):m,'Ændring i valgdagens margin')+'</div></div></div><div class="race-grid"><div><small>Margin nu</small><b class="'+cls(r.margin,r.kind)+'">'+fmt(r.margin)+changeMark(r.margin,UPDATE_STATES.has(r.state)?old?.margin:r.margin,'Ændring i margin')+'</b></div><div><small>Trend / uge</small><b class="'+cls(r.trend,r.kind)+'">'+fmt(r.trend)+changeMark(r.trend,UPDATE_STATES.has(r.state)?old?.trend:r.trend,'Ændring i trend')+'</b></div><div><small>Accel. / uge²</small><b class="'+cls(r.accel,r.kind)+'">'+fmt(r.accel)+changeMark(r.accel,UPDATE_STATES.has(r.state)?old?.accel:r.accel,'Ændring i accel')+'</b></div></div></div>';
 };
 $('races').classList.toggle('races-all',false);
 if(!all){$('races').innerHTML=a.map(renderRace).join('');return;}
 // All 35 seats appear in both the barometer and the detailed table, regardless of missing polls.
 if(!selectedRace||!ordered.some(r=>r.state===selectedRace))selectedRace=ordered.find(r=>r.margin!=null&&Math.abs(score(r)??r.margin)<4)?.state||ordered[0]?.state;
 $('raceExplainer').textContent='Klik på en delstat i barometeret for at fremhæve den i tabellen. Alle '+ordered.length+' valg vises. Valg uden målinger ligger yderst efter det siddende parti og er skraverede – de har ingen beregnet margin. Grænserne ved 51, 60 og 67 mandater tæller også de mandater, som ikke er på valg. Rækkefølgen opdateres efter den valgte margin.';
 const tile=(r,i)=>'<button type="button" class="seat-tile '+partyClass(r)+(r.margin==null?' seat-unpolled':'')+(r.state===selectedRace?' is-selected':'')+'" data-race="'+esc(r.state)+'" aria-pressed="'+(r.state===selectedRace)+'" title="'+esc(r.state)+' · '+(r.margin==null?'Ingen målinger':(metric==='forecast'?'Valgdag ':'Margin nu ')+fmt(score(r))+' pp')+'"><span class="seat-tile-label">'+esc(r.state)+'</span></button>';
 const barometerGuides=Array.from({length:ordered.length+1},()=>[]);[51,60,67].forEach(target=>{const d=target-fixedD,r=ordered.length-(target-(65-fixedD));if(d>=0&&d<=ordered.length)barometerGuides[d].push(target+' D/I');if(r>=0&&r<=ordered.length)barometerGuides[r].push(target+' R')});const guideHtml=i=>barometerGuides[i].map(label=>'<div class="seat-divider" aria-label="Grænse '+label+'"><span>'+label+'</span></div>').join('');const tiles=ordered.map((r,i)=>guideHtml(i)+tile(r,i)).join('')+guideHtml(ordered.length);
 const chosen=ordered.find(r=>r.state===selectedRace);
 const detail=chosen?'<div class="barometer-selected"><div><small>VALGT DELSTAT</small><strong>'+esc(chosen.state)+'</strong><span>'+badge(chosen.inc)+' → '+badge(chosen.lead)+'</span></div><div><small>Margin nu</small><strong>'+fmt(chosen.margin)+'</strong></div><div><small>Valgdag</small><strong>'+fmt(forecast(chosen))+'</strong></div><div><small>Trend / uge</small><strong>'+fmt(chosen.trend)+'</strong></div><div><small>Accel. / uge²</small><strong>'+fmt(chosen.accel)+'</strong></div></div>':'';
 $('raceBarometer').innerHTML='<div class="barometer-heading"><div><h3>Senatsbarometer · 35 valg</h3><p>Fra størst demokratisk til størst republikansk føring</p></div><div class="barometer-legend"><span><i class="legend-d"></i> D / I</span><span><i class="legend-r"></i> R</span><span><i class="legend-unknown"></i> Uden måling</span></div></div><div class="seat-track" role="group" aria-label="35 valg sorteret fra demokratisk til republikansk">'+tiles+'</div><div class="barometer-axis"><span>← Demokratiske mandater</span><span>Republikanske mandater →</span></div><p class="barometer-cutoff-note">'+cutoffText+'. Grænsen angiver det nødvendige antal valgsejre, ikke en sandsynlighed.</p>'+detail;
 const row=(r,i)=>{
   const selected=r.state===selectedRace;
   return (i===cutoff?'<tr class="table-cutoff"><td colspan="8"><span>'+cutoffText+'</span></td></tr>':'')+'<tr class="race-data-row'+(selected?' is-selected':'')+'" data-race="'+esc(r.state)+'"><td class="race-index">'+(i+1)+'</td><td><button class="race-name-button" type="button" data-race="'+esc(r.state)+'">'+esc(r.state)+'</button>'+mark(UPDATE_STATES.has(r.state))+(r.margin==null?'<small class="no-poll">Ingen målinger</small>':'')+'</td><td>'+badge(r.inc)+' → '+badge(r.lead)+'</td><td class="num '+cls(r.margin,r.kind)+'">'+fmt(r.margin)+'</td><td class="num '+cls(forecast(r),r.kind)+'">'+fmt(forecast(r))+'</td><td class="num '+cls(r.trend,r.kind)+'">'+fmt(r.trend)+'</td><td class="num '+cls(r.accel,r.kind)+'">'+fmt(r.accel)+'</td><td class="race-margin-cell"><div class="mini-margin"><span class="mini-zero"></span>'+(r.margin==null?'<span class="mini-unknown">—</span>':(function(){const v=Number.isFinite(score(r))?score(r):r.margin;const width=Math.min(48,Math.abs(v)*1.5);return '<span class="mini-fill '+(v>=0?'d':'r')+'" style="width:'+width+'%;'+(v>=0?'right:50%':'left:50%')+'"></span>'})())+'</div></td></tr>';
 };
 $('races').innerHTML='<div class="race-table-wrap"><table class="race-ranking-table"><thead><tr><th>#</th><th>Delstat</th><th>Nuværende → fører</th><th class="num">Margin nu</th><th class="num">Valgdag</th><th class="num">Trend/uge</th><th class="num">Accel./uge²</th><th>Valgt margin</th></tr></thead><tbody>'+ordered.map(row).join('')+(cutoff===ordered.length?'<tr class="table-cutoff"><td colspan="8">'+cutoffText+'</td></tr>':'')+'</tbody></table></div>';
 // Event delegation avoids 35 independent handlers and keeps selections synchronized.
 const selectRace=name=>{if(!ordered.some(r=>r.state===name))return;selectedRace=name;drawPlay();};
 $('raceBarometer').querySelectorAll('button[data-race]').forEach(b=>b.onclick=()=>selectRace(b.dataset.race));
 $('races').querySelectorAll('button[data-race]').forEach(b=>b.onclick=()=>selectRace(b.dataset.race));
}

function drawUpdateAnalysis(){
 const sec=$('updateAnalysis'),root=$('updateCharts');if(!sec||!root)return;
 const active=isUpdateActive()&&UPDATE_STATES.size>0;sec.hidden=!active;if(!active){root.innerHTML='';return}
 const {weighted,half}=window.getSenateWeighting();
 const dt=p=>(Date.parse(p.x+'T12:00:00Z')+Date.parse(p.end+'T12:00:00Z'))/2;
 const shortDate=d=>new Date(d).toLocaleDateString('da-DK',{day:'numeric',month:'short'});
 const signed=n=>(n>0?'+':'')+n.toLocaleString('da-DK',{maximumFractionDigits:2,minimumFractionDigits:2});
 const direction=n=>n>0.005?'i demokratisk retning':n<-.005?'i republikansk retning':'stort set uændret';
 root.innerHTML=[...UPDATE_STATES].map(name=>{
  const r=state.find(x=>x.state===name),b=baselineState.find(x=>x.state===name),raw=original.find(x=>x.state===name),old=BASELINE_STATES.find(x=>x.state===name);
  if(!r||!raw||!raw.points.length)return '';
  const pts=raw.points.map(p=>({...p,date:dt(p)})).sort((a,b)=>a.date-b.date);
  const oldKeys=new Set((old?.points||[]).map(p=>[p.x,p.end,p.y,p.poll].join('|')));
  const newPts=pts.filter(p=>!oldKeys.has([p.x,p.end,p.y,p.poll].join('|')));
  const historical=old?.points||[];
  const lin=wls(historical,1,half,weighted),quad=wls(historical,2,half,weighted);
  const fitLast=Math.max(...historical.map(dt));
  const last=pts[pts.length-1].date,first=pts[0].date,span=Math.max(1,last-first),week=604800000;
  const x=d=>50+420*(d-first)/span;
  const fitted=[];for(let j=0;j<=80;j++){const d=first+span*j/80,t=(d-fitLast)/week;fitted.push({d,l:lin?lin[0]+lin[1]*t:null,q:quad?quad[0]+quad[1]*t+quad[2]*t*t:null})}
  const values=[...pts.map(p=>p.y),...fitted.flatMap(p=>[p.l,p.q]).filter(Number.isFinite)];
  let low=Math.floor((Math.min(...values)-2)/5)*5,high=Math.ceil((Math.max(...values)+2)/5)*5;if(high<=low)high=low+5;
  const y=v=>244-(v-low)/(high-low)*200;
  const line=(key)=>fitted.filter(p=>p[key]!=null).map((p,i)=>(i?'L':'M')+x(p.d).toFixed(2)+','+y(p[key]).toFixed(2)).join(' ');
  const ticks=Array.from({length:5},(_,i)=>low+(high-low)*i/4);
  const grid=ticks.map(v=>'<line x1="50" x2="470" y1="'+y(v)+'" y2="'+y(v)+'" stroke="#dedede"/><text x="42" y="'+(y(v)+4)+'" text-anchor="end" fill="#666" font-size="11">'+Math.round(v*10)/10+'</text>').join('');
  // Show the zero baseline only when the existing chart range already contains zero.
  const zeroLine=low<=0&&high>=0?'<line x1="50" x2="470" y1="'+y(0)+'" y2="'+y(0)+'" stroke="#444" stroke-width="1.8" stroke-dasharray="6 4" aria-label="Nulpunkt: lige mange procentpoint til D og R"/>':'';
  const circles=pts.map(p=>{const isNew=!oldKeys.has([p.x,p.end,p.y,p.poll].join('|'));return '<circle cx="'+x(p.date)+'" cy="'+y(p.y)+'" r="'+(isNew?6:3.6)+'" fill="'+(isNew?'#9254c8':'#3478c8')+'" stroke="#fff" stroke-width="1.2"><title>'+esc(p.poll)+' · '+esc(p.end)+' · '+signed(p.y)+' pp'+(isNew?' · Ny måling':'')+'</title></circle>'}).join('');
  const change=r.margin-b.margin,trendChange=(r.trend??0)-(b.trend??0);
  const newest=newPts.map(p=>esc(p.poll)+' ('+shortDate(p.date)+', '+signed(p.y)+' pp)').join('; ');
  const comparison=newPts.map(p=>{const t=(p.date-fitLast)/week;const linearExpected=lin?lin[0]+lin[1]*t:null;const accelExpected=quad?quad[0]+quad[1]*t+quad[2]*t*t:null;return 'Den nye måling ligger '+(linearExpected==null?'uden en beregnet lineær reference':signed(p.y-linearExpected)+' pp '+(p.y>=linearExpected?'over':'under')+' den hidtidige lineære trend')+(accelExpected==null?'':' og '+signed(p.y-accelExpected)+' pp '+(p.y>=accelExpected?'over':'under')+' accelerationskurven')+'.'}).join(' ');
  const summary='Den vægtede margin har flyttet sig '+(Math.abs(change)<.005?'under 0,01 procentpoint':signed(change)+' procentpoint')+' '+direction(change)+'. Den beregnede lineære trend er '+signed(r.trend??0)+' pp/uge'+(r.trend!=null?' ('+direction(r.trend)+')':'')+'. Ændringen i trend er '+signed(trendChange)+' pp/uge. '+comparison;
  return '<article class="update-chart-card"><h3>'+esc(name)+' <span class="update-mark" aria-label="Ny måling"></span></h3><p><strong>Ny måling:</strong> '+newest+'</p><p>'+summary+'</p><svg viewBox="0 0 500 288" role="img" aria-label="Alle meningsmålinger i '+esc(name)+' med regressionskurver beregnet alene på tidligere målinger"><text x="50" y="15" fill="#555" font-size="11">D–R-margin (procentpoint)</text>'+grid+zeroLine+'<line x1="50" x2="470" y1="244" y2="244" stroke="#888"/>'+(lin?'<path d="'+line('l')+'" fill="none" stroke="#777" stroke-width="2.5"/>':'')+(quad?'<path d="'+line('q')+'" fill="none" stroke="#3478c8" stroke-width="2.5"/>':'')+circles+'<text x="50" y="266" font-size="11" fill="#666">'+shortDate(first)+'</text><text x="470" y="266" text-anchor="end" font-size="11" fill="#666">'+shortDate(last)+'</text></svg><div class="update-chart-legend"><span><i></i> Tidligere målinger</span><span class="new"><i></i> Ny måling</span><span class="linear"><i></i> Lineær trend (før)</span><span class="accelerated"><i></i> Acceleration (før)</span></div></article>';
 }).join('');
}

function showUpdateNotice(){const el=$('updateNotice');if(!el)return;el.hidden=!isUpdateActive();if(isUpdateActive())el.innerHTML=mark(true,'Nye målinger')+' <strong>Nye målinger:</strong> '+[...UPDATE_STATES].join(', ')+'. Lilla pile viser stigning eller fald i beregnede tal; en lilla prik markerer en ny måling eller en ændring uden naturlig retning. Markeringerne forsvinder efter 48 timer.'}
showUpdateNotice();
document.querySelectorAll('.info').forEach(b=>b.onclick=()=>$('info-'+b.dataset.info).classList.toggle('open'));document.querySelectorAll('input[name="weight"]').forEach(x=>x.onchange=recompute);$('half').oninput=recompute;document.querySelectorAll('input[name="unknown"],input[name="projection"],input[name="raceview"],input[name="racesort"]').forEach(x=>x.onchange=draw);$('search').oninput=drawTable;$('filter').onchange=drawTable;$('sort').onchange=drawTable;$('reverse').onclick=()=>{reverse=!reverse;drawTable()};$('extra').onclick=()=>{expanded=!expanded;$('extra').textContent=expanded?'Skjul ekstra':'Vis ekstra';drawTable()};recompute();

// Touch and keyboard users can toggle the same in-place transformation.
document.addEventListener('click',e=>{const stage=e.target.closest('.seat-morph-stage');document.querySelectorAll('.seat-morph-stage.is-open').forEach(el=>{if(el!==stage)el.classList.remove('is-open')});if(stage&&window.matchMedia('(hover:none)').matches)stage.classList.toggle('is-open')});

// Anchor the lower edge through BOTH opening and closing transitions.
// As the stage shrinks, scroll upward by the same amount so the content
// above moves back down to its original position (rather than pulling
// the content below upward).
(()=>{
 const container=document.getElementById('bars');
 if(!container || !('ResizeObserver' in window))return;
 const heights=new WeakMap();
 const observer=new ResizeObserver(entries=>{
   if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
   let delta=0;
   for(const entry of entries){
     const stage=entry.target;
     const height=entry.borderBoxSize?.[0]?.blockSize ?? stage.getBoundingClientRect().height;
     const old=heights.get(stage);
     if(old!=null && stage.isConnected && stage.dataset.pointerTransition==='1' && stage!==container.querySelectorAll('.seat-morph-stage')[2])delta+=height-old;
     heights.set(stage,height);
   }
   if(Math.abs(delta)>0.2 && window.matchMedia('(hover:hover)').matches){
     // Keep the bottom edge of the transforming graphic in the same
     // viewport position on both mouse enter and mouse leave.
     window.scrollBy(0,delta);
   }
 });
 const attach=()=>container.querySelectorAll('.seat-morph-stage').forEach(stage=>{
   if(stage.dataset.anchorBound)return;
   stage.dataset.anchorBound='1';
   stage.addEventListener('pointerenter',()=>{stage.dataset.pointerTransition='1';});
   stage.addEventListener('pointerleave',()=>{setTimeout(()=>{stage.dataset.pointerTransition='0';},450);});
   heights.set(stage,stage.getBoundingClientRect().height);
   observer.observe(stage);
 });
 new MutationObserver(attach).observe(container,{childList:true});
 attach();
})();

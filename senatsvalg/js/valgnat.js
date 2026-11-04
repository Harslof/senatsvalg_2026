/* Valgnat 2026: private, file-based dashboard. Uses the same MODEL.states as Senatsvalg.
   Exit polls are MANUAL inputs, never fabricated or fetched automatically. */
(()=>{'use strict';
const SOURCE=MODEL.states;
// Read-only, file-driven election-night data. Editors update data/valgnat-feed.js
// in the published files; no visitor inputs or browser-local overrides are used.
const FEED=window.VALGNAT_FEED||{};
const DEMO=Boolean(FEED.simulated);
const CRITICAL=new Set(['Alaska','Iowa','Kansas','Maine','Michigan','Nebraska','Ohio','Texas']);
const CODES={Alabama:'AL',Alaska:'AK',Arkansas:'AR',Colorado:'CO',Delaware:'DE',Florida:'FL',Georgia:'GA',Idaho:'ID',Illinois:'IL',Iowa:'IA',Kansas:'KS',Kentucky:'KY',Louisiana:'LA',Maine:'ME',Massachusetts:'MA',Michigan:'MI',Minnesota:'MN',Mississippi:'MS',Montana:'MT',Nebraska:'NE','New Hampshire':'NH','New Jersey':'NJ','New Mexico':'NM','North Carolina':'NC',Ohio:'OH',Oklahoma:'OK',Oregon:'OR','Rhode Island':'RI','South Carolina':'SC','South Dakota':'SD',Tennessee:'TN',Texas:'TX',Virginia:'VA','West Virginia':'WV',Wyoming:'WY'};
const TIMES=[
 {t:'23.00',label:'Første data',text:'Første nationale oplysninger fra vælgerundersøgelser kan blive offentliggjort. Delstatsspecifikke kandidatmarginer forventes senere.'},
 {t:'00.00',label:'Kentucky',text:'De første valgsteder i Kentucky lukker. Resten af delstaten følger senere.'},
 {t:'01.00',label:'Østkysten',text:'Georgia, Kentucky, South Carolina og Virginia er færdige med at stemme. Kandidatdata kan begynde at blive offentliggjort.'},
 {t:'01.30',label:'Ohio',text:'Ohio, North Carolina og West Virginia lukker. Ohio er blandt de særligt spændende senatsvalg.'},
 {t:'02.00',label:'Maine',text:'Maine samt Alabama, Delaware, Florida, Illinois, Massachusetts, Mississippi, New Hampshire, New Jersey, Oklahoma, Rhode Island og Tennessee lukker.'},
 {t:'02.30',label:'Arkansas',text:'Arkansas lukker.'},
 {t:'03.00',label:'5 usikre valg',text:'Iowa, Kansas, Michigan, Nebraska og Texas er nu helt lukket. Også Colorado, Louisiana, Minnesota, New Mexico, South Dakota og Wyoming lukker.'},
 {t:'04.00',label:'Montana',text:'Montana lukker.'},
 {t:'05.00',label:'Vestkysten',text:'Idaho og Oregon lukker.'},
 {t:'06.00',label:'Alaska',text:'Størstedelen af Alaska lukker. Vestlige områder følger senere.'},
 {t:'07.00',label:'Morgenstatus',text:'De vestligste valgsteder i Alaska er lukket. Forventeligt tidspunkt for morgenopdatering.'}
];
const $=id=>document.getElementById(id);
const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const validMargin=v=>v===null||(typeof v==='number'&&Number.isFinite(v)&&v>=-100&&v<=100);
const group=p=>p==='I'?'D':p;
const fmt=v=>v==null?'—':(v>=0?'D/I +':'R +')+Math.abs(v).toLocaleString('da-DK',{minimumFractionDigits:1,maximumFractionDigits:1});
const esc=escapeHTML;
const firstMargin=r=>{const p=r.points||[];return p.length?p.reduce((sum,x)=>sum+x.y,0)/p.length:null};
const currentBaseline=()=>SOURCE.map(r=>({state:r.state,inc:group(r.inc),margin:firstMargin(r),count:(r.points||[]).length}));
const validSnapshot=a=>Array.isArray(a)&&a.length===SOURCE.length&&new Set(a.map(r=>r.state)).size===SOURCE.length&&a.every(r=>r&&CODES[r.state]&&['D','R'].includes(r.inc)&&validMargin(r.margin)&&Number.isInteger(r.count)&&r.count>=0)&&SOURCE.every(r=>a.some(x=>x.state===r.state&&x.inc===group(r.inc)));
const validExits=o=>o&&typeof o==='object'&&!Array.isArray(o)&&Object.keys(o).every(k=>CODES[k]&&o[k]&&typeof o[k]==='object'&&typeof o[k].margin==='number'&&Number.isFinite(o[k].margin)&&Math.abs(o[k].margin)<=100&&typeof o[k].source==='string'&&o[k].source.length>0&&o[k].source.length<=160&&typeof o[k].time==='string'&&/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?(?:Z|[+-]\d{2}:\d{2})?$/.test(o[k].time));
// Only a complete, validated baseline can override the current polls.js baseline.
// Publish a fixed baseline in the feed at 23:00 if later poll updates must not
// rewrite the comparison point for the election-night graphics.
const snapshot=validSnapshot(FEED.snapshot)?FEED.snapshot:currentBaseline();
const exits={...(validExits(FEED.exits)?FEED.exits:{})};
const results=FEED.results||{};
for(const [state,r] of Object.entries(results)){
 if(!CODES[state]||!r||typeof r.margin!=='number'||!Number.isFinite(r.margin)||Math.abs(r.margin)>100)continue;
 exits[state]={margin:r.margin,source:'Optalte stemmer (valgresultat)',time:FEED.resultsUpdatedAt||'2026-11-04T06:56:00+01:00',kind:'result',called:Boolean(r.called)};
}
const calledResults=Object.fromEntries(Object.entries(results).filter(([state,r])=>CODES[state]&&r&&r.called&&((typeof r.margin==='number'&&Number.isFinite(r.margin))||['D','R'].includes(r.leader))).map(([state,r])=>[state,r.margin===null?r.leader:(r.margin>0?'D':r.margin<0?'R':r.leader)]).filter(([,party])=>party==='D'||party==='R'));
const weight=typeof FEED.weight==='number'&&Number.isFinite(FEED.weight)&&FEED.weight>=0&&FEED.weight<=100?Math.max(70,FEED.weight):80;
let selected='Ohio',activeTime=0;
const getOriginal=name=>snapshot.find(r=>r.state===name);
const combined=r=>{const e=exits[r.state];if(e?.kind==='result')return e.margin;if(!e)return r.margin;if(r.margin==null)return e.margin;return r.margin*(1-weight/100)+e.margin*weight/100;};
const leading=(m,inc)=>m==null||Math.abs(m)<1e-10?inc:m>0?'D':'R';
const fixedDem=47-SOURCE.filter(r=>group(r.inc)==='D').length;
const fixedRep=100-SOURCE.length-fixedDem;
const CATEGORY_LABELS={called:'Faste og kaldte stater',likely:'Meget sandsynlige',close:'Tætte valg',toss:'For tætte til at kalde'};
const categoryEnabled={called:true,likely:true,close:true,toss:true};
function categoryFor(r){
 const e=exits[r.state];
 // A verified call must be explicitly published in the feed, not inferred from a margin.
 if(calledResults[r.state])return {category:'called',party:calledResults[r.state]};
 if(FEED.calls&&Object.prototype.hasOwnProperty.call(FEED.calls,r.state)&&['D','R'].includes(FEED.calls[r.state]))return {category:'called',party:FEED.calls[r.state]};
 const margin=e?e.margin:r.margin;
 if(margin==null)return {category:'likely',party:r.inc};
 const tossLimit=e?1:2; // Switch individually when real exitpoll data are published.
 return {category:Math.abs(margin)<=tossLimit?'toss':Math.abs(margin)<=5?'close':'likely',party:leading(margin,r.inc)};
}
function closeMandatePopup(){
 const popup=$('mandate-block-popup');if(popup){popup.hidden=true;popup.replaceChildren();}
 document.querySelectorAll('.ruler-category[aria-expanded="true"]').forEach(el=>el.setAttribute('aria-expanded','false'));
}
function openMandatePopup(button,party,key,states){
 const popup=$('mandate-block-popup');if(!popup)return;
 const wasOpen=!popup.hidden&&button.getAttribute('aria-expanded')==='true';
 closeMandatePopup();if(wasOpen)return;
 const fixed=key==='called'?(party==='D'?fixedDem:fixedRep):0;
 const heading=document.createElement('strong');heading.className='mandate-popup-heading';heading.textContent=(party==='D'?'D/I':'R')+' · '+CATEGORY_LABELS[key];
 const close=document.createElement('button');close.type='button';close.className='mandate-popup-close';close.setAttribute('aria-label','Luk oversigt');close.textContent='×';close.addEventListener('click',closeMandatePopup);
 const head=document.createElement('div');head.className='mandate-popup-head';head.append(heading,close);popup.append(head);
 if(fixed){const info=document.createElement('p');info.textContent=fixed+' faste mandater (ikke på valg i 2026)';popup.append(info);}
 if(states.length){
  const label=document.createElement('p');label.textContent=states.length+' '+(states.length===1?'delstat':'delstater')+' med valg:';popup.append(label);
  const list=document.createElement('ul');list.className='mandate-popup-states';
  states.sort((a,b)=>a.localeCompare(b,'da')).forEach(name=>{const li=document.createElement('li');li.textContent=name;list.append(li);});popup.append(list);
 }else if(!fixed){const empty=document.createElement('p');empty.textContent='Ingen delstater i denne kategori.';popup.append(empty);}
 popup.hidden=false;button.setAttribute('aria-expanded','true');
}
function drawFixedMandates(){
 const counts={D:{called:fixedDem,likely:0,close:0,toss:0},R:{called:fixedRep,likely:0,close:0,toss:0}};
 const states={D:{called:[],likely:[],close:[],toss:[]},R:{called:[],likely:[],close:[],toss:[]}};
 for(const r of snapshot){const {category,party}=categoryFor(r);counts[party][category]++;states[party][category].push(r.state);}
 closeMandatePopup();
 for(const [id,party,partyName] of [['ruler-fixed-dem','D','D/I'],['ruler-fixed-rep','R','R']]){
  const el=$(id);if(!el)continue;
  // Faste mandater og kaldte stater vises som én samlet, mørk blok.
  el.style.display='none';
  const track=el.parentElement;
  track.querySelectorAll('.ruler-category').forEach(n=>n.remove());
  let offset=0;
  for(const key of ['called','likely','close','toss']){
   const n=counts[party][key];if(!n||!categoryEnabled[key])continue;
   const seg=document.createElement('button');seg.type='button';
   seg.className='ruler-category cat-'+key+' party-'+party.toLowerCase()+(n<5?' ruler-category-narrow':'');
   seg.style.left=offset+'%';seg.style.width=n+'%';
   seg.title=partyName+' · '+CATEGORY_LABELS[key]+': '+n+' mandater';
   seg.setAttribute('aria-label',seg.title+'. Vis delstater');
   seg.setAttribute('aria-expanded','false');
   seg.setAttribute('aria-controls','mandate-block-popup');
   seg.addEventListener('click',()=>openMandatePopup(seg,party,key,states[party][key]));
   const count=document.createElement('span');count.className='ruler-category-count';count.textContent=String(n);count.setAttribute('aria-hidden','true');
   seg.appendChild(count);
   track.appendChild(seg);offset+=n;
  }
 }
 const note=$('mandate-category-note');
 if(note){
  const withExits=snapshot.filter(r=>exits[r.state]).length;
  note.textContent='Faste og kaldte stater er samlet. For tætte til at kalde: '+(withExits?'±1 procentpoint for '+withExits+' valg med exitpoll; ±2 for øvrige valg.':'±2 procentpoint indtil der foreligger exitpolls.')+' Tætte valg: over grænsen til og med ±5. Meget sandsynlige: over ±5 eller uden målinger (fastholdt hos siddende parti).';
 }
}
function initMandateCategories(){
 const box=$('mandate-category-controls');if(!box)return;
 box.innerHTML=Object.entries(CATEGORY_LABELS).map(([key,label])=>'<label class="mandate-filter"><input type="checkbox" data-category="'+key+'" checked><span class="mandate-filter-swatch cat-'+key+'"></span>'+label+'</label>').join('');
 box.querySelectorAll('input').forEach(input=>input.addEventListener('change',()=>{categoryEnabled[input.dataset.category]=input.checked;drawFixedMandates();}));
}

function seatTotals(which){let d=fixedDem;for(const r of snapshot){const e=exits[r.state];const margin=which==='before'?r.margin:which==='exit'?(e?e.margin:r.margin):combined(r);if((which!=='before'&&calledResults[r.state]?calledResults[r.state]:leading(margin,r.inc))==='D')d++;}return {d,r:100-d};}
function drawTimeline(){const el=$('timeline');el.innerHTML='';TIMES.forEach((item,i)=>{const b=document.createElement('button');b.type='button';b.className=(i===activeTime?'active ':'')+([0,3,4,6,9,10].includes(i)?'important':'');b.setAttribute('aria-pressed',String(i===activeTime));b.innerHTML=`<span class="hour">${item.t}</span><span class="caption">${item.label}</span>`;b.addEventListener('click',()=>{activeTime=i;drawTimeline();});el.appendChild(b);});const item=TIMES[activeTime];$('timeline-detail').innerHTML=`<strong>${item.t} · ${esc(item.label)}</strong><div>${esc(item.text)}</div>`;}
function drawSeats(){
 const list=[
  {label:'Opdateret margin',desc:`Tidligere margin og exitpoll vægtet sammen (${weight} % exitpoll).`,key:'updated',help:'For hver delstat kombineres den tidligere meningsmålingsmargin med en eventuel exitpoll. Exitpolls vægter '+weight+' %, og målingerne '+(100-weight)+' %. Uden exitpoll anvendes kun målingsmarginen. Mandatet tildeles den side, der fører efter sammenvejningen.'},
  {label:'Exitpoll som signal',desc:'Exitpoll-margin, hvor den findes; ellers målingsgrundlaget.',key:'exit',help:'Når der er en exitpoll for en delstat, bruges dens margin alene til at tildele mandatet. Hvis der endnu ikke er en exitpoll, bruges meningsmålingsmarginen. Det er et alternativt signal – ikke en uafhængig prognose.'}
 ];
 $('seat-bars').innerHTML=list.map((item,i)=>{
  const {d,r}=seatTotals(item.key);
  const guides=[33,40,49,51,60,67].map(n=>`<span class="seat-guide ${n===49||n===51?'major':''}" style="left:${n}%" title="${n} D/I / ${100-n} R"></span>`).join('');
  return `<div class="seat-item ${i===0?'seat-featured':''}"><div class="seat-label"><strong>${item.label}</strong><button type="button" class="seat-info" aria-label="Forklaring af ${item.label}" aria-expanded="false" data-info="${item.key}">i</button><small>${item.desc}</small><p class="seat-info-detail" hidden>${esc(item.help)}</p></div><div><div class="seat-values"><span class="d">D/I <b>${d}</b></span><span class="r">R <b>${r}</b></span></div><div class="seat-track" aria-label="${item.label}: D/I ${d}, R ${r}"><div class="seat-part d" style="width:${d}%">${d>=8?'D/I':''}</div><div class="seat-part r" style="width:${r}%">${r>=8?'R':''}</div>${guides}</div></div></div>`;
 }).join('');
 $('seat-bars').querySelectorAll('.seat-info').forEach(btn=>btn.addEventListener('click',()=>{const panel=btn.parentElement.querySelector('.seat-info-detail');panel.hidden=!panel.hidden;btn.setAttribute('aria-expanded',String(!panel.hidden));}));
}
const NS='http://www.w3.org/2000/svg';
function svgEl(tag,attrs={},text){const el=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs))el.setAttribute(k,String(v));if(text!==undefined)el.textContent=String(text);return el;}
function starPath(cx,cy,outer=7,inner=3.1){return Array.from({length:10},(_,i)=>{const a=-Math.PI/2+i*Math.PI/5,rad=i%2?inner:outer;return (i?'L':'M')+(cx+Math.cos(a)*rad).toFixed(2)+' '+(cy+Math.sin(a)*rad).toFixed(2)}).join(' ')+' Z';}
function orderedStates(){const rows=[...snapshot];if($('sort-states').value==='alpha')return rows.sort((a,b)=>a.state.localeCompare(b.state,'en'));return rows.sort((a,b)=>{if(a.margin==null&&b.margin==null)return (a.inc==='D'?-1:1)-(b.inc==='D'?-1:1)||a.state.localeCompare(b.state);if(a.margin==null)return a.inc==='D'?-1:1;if(b.margin==null)return b.inc==='D'?1:-1;return b.margin-a.margin;});}
function drawChart(){const rows=orderedStates(),W=1280,H=383,x0=68,x1=1256,y0=166,top=27,bottom=305;
 const vals=rows.flatMap(r=>[r.margin,exits[r.state]?.margin,combined(r)]).filter(v=>v!=null),max=Math.max(10,Math.ceil(Math.max(...vals.map(Math.abs),0)/5)*5),scale=133/max;
 const y=v=>y0-v*scale,x=i=>x0+(x1-x0)*i/(rows.length-1);
 const svg=svgEl('svg',{viewBox:`0 0 ${W} ${H}`,width:W,height:H,role:'presentation'});
 svg.appendChild(svgEl('rect',{x:55,y:top,width:1215,height:y0-top,fill:'#578ec7','fill-opacity':'.105'}));
 svg.appendChild(svgEl('rect',{x:55,y:y0,width:1215,height:bottom-y0,fill:'#d66d56','fill-opacity':'.095'}));
 for(const t of [max,max/2,0,-max/2,-max]){const yy=y(t);svg.appendChild(svgEl('line',{x1:55,x2:1270,y1:yy,y2:yy,stroke:'#ffffff','stroke-opacity':t===0?.95:.43,'stroke-width':t===0?1.8:1,'stroke-dasharray':t===0?'none':'4 5'}));svg.appendChild(svgEl('text',{x:45,y:yy+4,'text-anchor':'end','font-size':11,fill:'#aeb7c1'},Math.abs(t).toLocaleString('da-DK',{maximumFractionDigits:1})));}
 svg.appendChild(svgEl('text',{x:58,y:17,'font-size':12,'font-weight':700,fill:'#7ba9e0'},'DEMOKRATISK FØRING ↑'));
 svg.appendChild(svgEl('text',{x:58,y:327,'font-size':12,'font-weight':700,fill:'#e08b78'},'REPUBLIKANSK FØRING ↓'));
 svg.appendChild(svgEl('text',{x:58,y:359,'font-size':10,fill:'#aeb7c1'},'— = ingen målinger; siddende parti fastholdes'));
 // Mandatgrænser for de 35 valg: medregn de 34 faste D/I- og 31 faste R-mandater.
 // Linjerne er kun meningsfulde i margin-sortering, hvor hver delstat svarer til ét mandat.
 if($('sort-states').value==='margin'){
  const boundaries=[
   {party:'D/I',n:51,after:51-fixedDem,color:'#9cc9ff'},
   {party:'D/I',n:60,after:60-fixedDem,color:'#9cc9ff'},
   {party:'D/I',n:67,after:67-fixedDem,color:'#9cc9ff'},
   {party:'R',n:51,after:rows.length-(51-fixedRep),color:'#ffb5a6'},
   {party:'R',n:60,after:rows.length-(60-fixedRep),color:'#ffb5a6'},
   {party:'R',n:67,after:rows.length-(67-fixedRep),color:'#ffb5a6'}
  ];
  for(const mark of boundaries){
   if(mark.after<1||mark.after>=rows.length)continue;
   const xx=(x(mark.after-1)+x(mark.after))/2;
   const line=svgEl('line',{x1:xx,x2:xx,y1:top,y2:bottom,stroke:mark.color,'stroke-width':1.8,'stroke-dasharray':'6 5','stroke-opacity':'.85'});
   line.appendChild(svgEl('title',{},mark.party+' '+mark.n+' mandater ('+(mark.party==='D/I'?fixedDem:fixedRep)+' faste mandater medregnet)'));
   svg.appendChild(line);
   const txt=svgEl('text',{x:xx+3,y:mark.party==='D/I'?40:55,'font-size':10,'font-weight':700,fill:mark.color},mark.party+' '+mark.n);
   svg.appendChild(txt);
  }
 }
 rows.forEach((r,i)=>{const xx=x(i),g=svgEl('g',{class:`state-group${r.state===selected?' selected':''}`,tabindex:'0',role:'button','aria-label':r.state});const exit=exits[r.state],c=combined(r),show=$('show-exit').checked;
 if(r.state===selected)g.appendChild(svgEl('rect',{x:xx-15,y:23,width:30,height:290,rx:4,fill:'#eadbb7','fill-opacity':'.11'}));
 if(r.margin!=null){if(show&&exit){g.appendChild(svgEl('line',{x1:xx,y1:y(r.margin),x2:xx,y2:y(exit.margin),stroke:exit.margin>r.margin?'#669bd3':exit.margin<r.margin?'#e4524b':'#ffffff','stroke-width':2.6,'stroke-opacity':'.95'}));}g.appendChild(svgEl('circle',{cx:xx,cy:y(r.margin),r:5,fill:'#ffffff',stroke:'#121923','stroke-width':1.2}));}
 else{g.appendChild(svgEl('line',{x1:xx-4,x2:xx+4,y1:311,y2:311,stroke:'#8a98a8','stroke-width':2.5}));}
 if(show&&exit){
  // Exitpolls and results are five-pointed stars, coloured by the party in the lead.
  const exitColor=exit.margin>=0?'#669bd3':'#e4524b';
  if(c!=null){g.appendChild(svgEl('path',{d:`M ${xx} ${y(c)-5.3} l 5.3 5.3 l -5.3 5.3 l -5.3 -5.3 Z`,fill:c>=0?'#669bd3':'#e4524b',stroke:'#111923','stroke-width':.8}));}
  // Draw the star last so it remains visible when the updated margin overlaps.
  g.appendChild(svgEl('path',{d:starPath(xx,y(exit.margin),8,3.5),fill:exitColor,stroke:'#111923','stroke-width':1.2}));
 }
 const label=svgEl('text',{x:xx,y:344,'text-anchor':'middle',class:'state-label'},CODES[r.state]);g.appendChild(label);g.appendChild(svgEl('title',{},`${r.state}: Før ${fmt(r.margin)}; Exitpoll ${fmt(exit?.margin)}; Opdateret ${fmt(c)}`));g.addEventListener('click',()=>selectState(r.state));g.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();selectState(r.state);}});svg.appendChild(g);
 });const target=$('margin-chart');target.replaceChildren(svg);}
function selectState(name){selected=name;$('state-select').value=name;drawChart();drawDetail();}

const WEEK=604800000;
function solve(A,b){const n=b.length,m=A.map((r,i)=>[...r,b[i]]);for(let k=0;k<n;k++){let p=k;for(let i=k+1;i<n;i++)if(Math.abs(m[i][k])>Math.abs(m[p][k]))p=i;if(Math.abs(m[p][k])<1e-9)return null;[m[k],m[p]]=[m[p],m[k]];const d=m[k][k];for(let j=k;j<=n;j++)m[k][j]/=d;for(let i=0;i<n;i++)if(i!==k){const v=m[i][k];for(let j=k;j<=n;j++)m[i][j]-=v*m[k][j]}}return m.map(r=>r[n]);}
function fitTrend(points,degree){if(points.length<degree+1)return null;const latest=Math.max(...points.map(p=>p.date)),t=points.map(p=>(p.date-latest)/WEEK);if(Math.max(...t)-Math.min(...t)<(degree===2?2:1))return null;const n=degree+1,A=Array.from({length:n},()=>Array(n).fill(0)),b=Array(n).fill(0);points.forEach((p,i)=>{const w=p.exit?12:Math.pow(2,t[i]/8),v=Array.from({length:n},(_,j)=>t[i]**j);for(let j=0;j<n;j++){b[j]+=w*v[j]*p.value;for(let k=0;k<n;k++)A[j][k]+=w*v[j]*v[k]}});const c=solve(A,b);return c?{c,latest}:null;}
function drawTrendDetail(){
 const r=SOURCE.find(s=>s.state===selected),e=exits[selected];
 const points=(r.points||[]).map(p=>({date:Date.parse(p.end+'T12:00:00Z'),value:p.y,label:p.poll||'Måling',exit:false})).filter(p=>Number.isFinite(p.date)&&Number.isFinite(p.value));
 if(e){const d=Date.parse(/(?:Z|[+-]\d{2}:\d{2})$/.test(e.time)?e.time:(e.time+':00+01:00'));if(Number.isFinite(d))points.push({date:d,value:e.margin,label:e.source,exit:true});}
 const target=$('race-trend-chart');
 if(!points.length){target.textContent='Ingen målinger eller exitpolls at vise endnu.';return {trend:null,accel:null};}
 const linear=fitTrend(points,1),quad=fitTrend(points,2);
 const election=Date.parse('2026-11-03T12:00:00Z'),earliest=Math.min(...points.map(p=>p.date)),latest=Math.max(...points.map(p=>p.date));
 const start=earliest-WEEK,end=Math.max(election,latest+WEEK,start+4*WEEK);
 const x=d=>56+730*(d-start)/(end-start);
 const evalFit=(fit,d)=>fit?fit.c.reduce((s,c,i)=>s+c*((d-fit.latest)/WEEK)**i,0):null;
 const values=points.map(p=>p.value);
 for(let i=0;i<=80;i++){const d=start+(end-start)*i/80;for(const fit of [linear,quad]){const v=evalFit(fit,d);if(Number.isFinite(v))values.push(v);}}
 let lo=Math.floor((Math.min(0,...values)-2)/5)*5,hi=Math.ceil((Math.max(0,...values)+2)/5)*5;if(lo===hi)hi+=5;
 const y=v=>250-204*(v-lo)/(hi-lo),svg=svgEl('svg',{viewBox:'0 0 845 300',role:'presentation'});
 if(latest<end)svg.appendChild(svgEl('rect',{x:x(latest),y:34,width:Math.max(0,x(end)-x(latest)),height:216,fill:'#ffffff','fill-opacity':'.035'}));
 for(let i=0;i<=4;i++){const v=lo+(hi-lo)*i/4;svg.appendChild(svgEl('line',{x1:56,x2:786,y1:y(v),y2:y(v),stroke:'#ffffff','stroke-opacity':v===0?.9:.32,'stroke-dasharray':v===0?'5 4':'none'}));svg.appendChild(svgEl('text',{x:47,y:y(v)+4,'text-anchor':'end',fill:'#b7c6d4','font-size':12},v.toFixed(1)));}
 const curve=(fit,color)=>{if(!fit)return;const from=earliest,to=Math.min(end,election);if(to<=from)return;const path=Array.from({length:101},(_,i)=>{const d=from+(to-from)*i/100;return (i?'L':'M')+x(d).toFixed(1)+' '+y(evalFit(fit,d)).toFixed(1);}).join(' ');svg.appendChild(svgEl('path',{d:path,fill:'none',stroke:color,'stroke-width':3}));};
 curve(linear,'#669bd3');curve(quad,'#e4524b');
 for(const p of points){const dot=svgEl('path',{d:starPath(x(p.date),y(p.value),p.exit?8:6,p.exit?3.6:2.7),fill:p.exit?'#4fce8a':(p.value>=0?'#669bd3':'#e4524b'),stroke:'#101a24','stroke-width':1.2});dot.appendChild(svgEl('title',{},p.label+' · '+p.value.toFixed(1)+' pp'));svg.appendChild(dot);}
 for(let i=0;i<=4;i++){const d=start+(end-start)*i/4;svg.appendChild(svgEl('text',{x:x(d),y:278,'text-anchor':'middle',fill:'#aebccc','font-size':11},new Date(d).toLocaleDateString('da-DK',{day:'numeric',month:'short'})));}
 target.replaceChildren(svg);
 return {trend:linear?.c[1]??null,accel:quad?2*quad.c[2]:null};
}
function drawDetail(){const r=getOriginal(selected),e=exits[selected],c=combined(r),metrics=drawTrendDetail();$('selected-name').textContent=selected;const cell=(label,v,kind='')=>`<div><small>${label}</small><strong class="${kind||((v??0)>=0?'blue':'red')}">${label.startsWith('Trend')||label.startsWith('Accel')?(v==null?'—':(v>0?'+':'')+v.toLocaleString('da-DK',{minimumFractionDigits:2,maximumFractionDigits:2})+' pp'):fmt(v)}</strong></div>`;$('race-numbers').innerHTML=cell('Margin før valget',r.margin)+cell('Exitpoll',e?.margin,'green')+cell('Opdateret margin',c)+cell('Trend / uge',metrics.trend,'')+cell('Accel / uge²',metrics.accel,'');
 let note=r.margin==null?'Ingen meningsmålinger i det eksisterende grundlag. Mandatet fastholdes hos '+(r.inc==='D'?'D/I':'R')+' indtil nye data foreligger.':`${r.count} meningsmåling${r.count===1?'':'er'} i det gemte grundlag.`;
 if(e)note+=` ${e.kind==='result'?'Valgresultat':'Exitpoll'}: ${e.source}, offentliggjort ${new Date(e.time).toLocaleString('da-DK',{timeZone:'Europe/Copenhagen',dateStyle:'short',timeStyle:'short'})} dansk tid. Ændring fra oprindelig margin: ${r.margin==null?'ikke beregnelig':(e.margin-r.margin).toLocaleString('da-DK',{minimumFractionDigits:1,maximumFractionDigits:1})+' procentpoint mod D/I'}.`;
 else note+=' Der er endnu ikke indtastet exitpoll-data for denne delstat.';
 $('race-comment').textContent=note;}
function drawResults(){
 const data=FEED.results||{};
 const entries=Object.entries(data).filter(([state,r])=>CODES[state]&&r&&typeof r==='object'&&(r.margin===null||validMargin(r.margin)));
 entries.sort((a,b)=>a[0].localeCompare(b[0],'da'));
 const called=entries.filter(([,r])=>r.called);
 $('results-summary').textContent=entries.length+' valg med resultater · '+called.length+' afgjorte · '+(entries.length-called.length)+' endnu ikke afgjorte';
 $('results-body').innerHTML=entries.map(([state,r])=>{const party=r.margin===null?r.leader:(r.margin>=0?'D':'R');const label=r.marginLabel||(party+' +'+Math.abs(r.margin).toLocaleString('da-DK',{maximumFractionDigits:2}));return '<tr><td>'+esc(state)+(r.special?' †':'')+'</td><td class="'+(party==='D'?'result-dem':'result-rep')+'">'+esc(party)+'</td><td class="'+(party==='D'?'result-dem':'result-rep')+'">'+esc(label)+'</td><td>'+esc(r.percentIn)+' %</td><td>'+(r.called?'✓ Afgjort':'Ikke afgjort')+'</td></tr>';}).join('');
 $('results-source').textContent='Kilde: manuelt afskrevet fra indsendt valgoversigt · status '+(FEED.resultsUpdatedAt?new Date(FEED.resultsUpdatedAt).toLocaleString('da-DK',{timeZone:'Europe/Copenhagen',dateStyle:'medium',timeStyle:'short'}):'ukendt')+' dansk tid. † Suppleringsvalg. Resultaterne er adskilt fra exitpolls og meningsmålinger.';
}
function render(){
 drawResults();drawSeats();drawChart();drawDetail();
 const polls=snapshot.reduce((n,r)=>n+r.count,0),n=Object.keys(exits).length;
 $('feed-status').textContent=`${DEMO?'TESTDATA · ':''}${polls} MÅLINGER · ${n} ${n===1?'DELSTAT':'DELSTATER'} MED EXITPOLL/RESULTAT`;
 const date=FEED.updatedAt;
 $('rendered-at').textContent=typeof date==='string'&&date.trim()?date:'Målinger fra Senatsvalg · endnu ingen publiceret valgnatsopdatering';
}
function init(){
 document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMandatePopup();});
 document.addEventListener('click',e=>{const popup=$('mandate-block-popup');if(popup&&!popup.hidden&&!e.target.closest('.ruler-category, #mandate-block-popup'))closeMandatePopup();});
 initMandateCategories();
 drawFixedMandates();
 drawTimeline();
 for(const r of SOURCE){const o=document.createElement('option');o.value=r.state;o.textContent=r.state;$('state-select').appendChild(o);}
 $('state-select').value=selected;
 render();
 $('state-select').addEventListener('change',e=>selectState(e.target.value));
 $('sort-states').addEventListener('change',drawChart);
 $('show-exit').addEventListener('change',drawChart);
}
init();
})();

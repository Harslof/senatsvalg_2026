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
 {t:'23.00',label:'Første data',text:'Første nationale oplysninger fra vælgerundersøgelser kan blive offentliggjort. Kandidatmarginer fra delstaterne er endnu ikke tilgængelige.'},
 {t:'00.00',label:'Kentucky',text:'De første valgsteder i Kentucky lukker. Den øvrige delstat lukker senere.'},
 {t:'01.00',label:'Østkysten',text:'Georgia, Kentucky, South Carolina og Virginia er færdige med at stemme. Kandidatdata kan begynde at blive offentliggjort.'},
 {t:'01.30',label:'Ohio',text:'Ohio, North Carolina og West Virginia lukker. Ohio er et af de otte udvalgte usikre senatsvalg.'},
 {t:'02.00',label:'Maine',text:'Maine samt Alabama, Delaware, Florida, Illinois, Massachusetts, Mississippi, New Hampshire, New Jersey, Oklahoma, Rhode Island og Tennessee lukker.'},
 {t:'02.30',label:'Arkansas',text:'Arkansas lukker.'},
 {t:'03.00',label:'5 usikre valg',text:'Iowa, Kansas, Michigan, Nebraska og Texas er nu helt lukket. Også Colorado, Louisiana, Minnesota, New Mexico, South Dakota og Wyoming lukker.'},
 {t:'04.00',label:'Montana',text:'Montana lukker.'},
 {t:'05.00',label:'Vestkysten',text:'Idaho og Oregon lukker.'},
 {t:'06.00',label:'Alaska',text:'Størstedelen af Alaska lukker. Vestlige områder følger senere.'},
 {t:'07.00',label:'Morgenstatus',text:'De vestligste valgsteder i Alaska er lukket. Tidspunktet passer til den planlagte morgenopdatering.'}
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
const exits=validExits(FEED.exits)?FEED.exits:{};
const weight=typeof FEED.weight==='number'&&Number.isFinite(FEED.weight)&&FEED.weight>=0&&FEED.weight<=100?Math.max(70,FEED.weight):80;
let selected='Ohio',activeTime=0;
const getOriginal=name=>snapshot.find(r=>r.state===name);
const combined=r=>{const e=exits[r.state];if(!e)return r.margin;if(r.margin==null)return e.margin;return r.margin*(1-weight/100)+e.margin*weight/100;};
const leading=(m,inc)=>m==null||Math.abs(m)<1e-10?inc:m>0?'D':'R';
const fixedDem=47-SOURCE.filter(r=>group(r.inc)==='D').length;
function seatTotals(which){let d=fixedDem;for(const r of snapshot){const e=exits[r.state];const margin=which==='before'?r.margin:which==='exit'?(e?e.margin:r.margin):combined(r);if(leading(margin,r.inc)==='D')d++;}return {d,r:100-d};}
function drawTimeline(){const el=$('timeline');el.innerHTML='';TIMES.forEach((item,i)=>{const b=document.createElement('button');b.type='button';b.className=(i===activeTime?'active ':'')+([0,3,4,6,9,10].includes(i)?'important':'');b.setAttribute('aria-pressed',String(i===activeTime));b.innerHTML=`<span class="hour">${item.t}</span><span class="caption">${item.label}</span>`;b.addEventListener('click',()=>{activeTime=i;drawTimeline();});el.appendChild(b);});const item=TIMES[activeTime];$('timeline-detail').innerHTML=`<strong>${item.t} · ${esc(item.label)}</strong><div>${esc(item.text)}</div>`;}
function drawSeats(){
 const list=[
  {label:'Opdateret margin',desc:`Tidligere margin og exitpoll vægtet sammen (${weight} % exitpoll).`,key:'updated'},
  {label:'Exitpoll som signal',desc:'Exitpoll-margin, hvor den findes; ellers målingsgrundlaget.',key:'exit'}
 ];
 $('seat-bars').innerHTML=list.map((item,i)=>{
  const {d,r}=seatTotals(item.key);
  const guides=[33,40,49,51,60,67].map(n=>`<span class="seat-guide ${n===49||n===51?'major':''}" style="left:${n}%" title="${n} D/I / ${100-n} R"></span>`).join('');
  return `<div class="seat-item ${i===0?'seat-featured':''}"><div class="seat-label"><strong>${item.label}</strong><small>${item.desc}</small></div><div><div class="seat-values"><span class="d">D/I <b>${d}</b></span><span class="r">R <b>${r}</b></span></div><div class="seat-track" aria-label="${item.label}: D/I ${d}, R ${r}"><div class="seat-part d" style="width:${d}%">${d>=8?'D/I':''}</div><div class="seat-part r" style="width:${r}%">${r>=8?'R':''}</div>${guides}</div></div></div>`;
 }).join('');
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
 for(const t of [max,max/2,0,-max/2,-max]){const yy=y(t);svg.appendChild(svgEl('line',{x1:55,x2:1270,y1:yy,y2:yy,stroke:'#c6c5bf','stroke-opacity':t===0?.7:.22,'stroke-width':t===0?1.8:1,'stroke-dasharray':t===0?'none':'4 5'}));svg.appendChild(svgEl('text',{x:45,y:yy+4,'text-anchor':'end','font-size':11,fill:'#aeb7c1'},Math.abs(t).toLocaleString('da-DK',{maximumFractionDigits:1})));}
 svg.appendChild(svgEl('text',{x:58,y:17,'font-size':12,'font-weight':700,fill:'#7ba9e0'},'DEMOKRATISK FØRING ↑'));
 svg.appendChild(svgEl('text',{x:58,y:327,'font-size':12,'font-weight':700,fill:'#e08b78'},'REPUBLIKANSK FØRING ↓'));
 svg.appendChild(svgEl('text',{x:58,y:359,'font-size':10,fill:'#aeb7c1'},'— = ingen målinger; siddende parti fastholdes'));
 rows.forEach((r,i)=>{const xx=x(i),g=svgEl('g',{class:`state-group${r.state===selected?' selected':''}`,tabindex:'0',role:'button','aria-label':r.state});const exit=exits[r.state],c=combined(r),show=$('show-exit').checked;
 if(r.state===selected)g.appendChild(svgEl('rect',{x:xx-15,y:23,width:30,height:290,rx:4,fill:'#eadbb7','fill-opacity':'.11'}));
 if(r.margin!=null){if(show&&exit){g.appendChild(svgEl('line',{x1:xx,y1:y(r.margin),x2:xx,y2:y(exit.margin),stroke:exit.margin>r.margin?'#669bd3':exit.margin<r.margin?'#e4524b':'#ffffff','stroke-width':2.6,'stroke-opacity':'.95'}));}g.appendChild(svgEl('circle',{cx:xx,cy:y(r.margin),r:5,fill:'#ffffff',stroke:'#121923','stroke-width':1.2}));}
 else{g.appendChild(svgEl('line',{x1:xx-4,x2:xx+4,y1:311,y2:311,stroke:'#8a98a8','stroke-width':2.5}));}
 if(show&&exit){g.appendChild(svgEl('path',{d:starPath(xx,y(exit.margin),7,3),fill:exit.margin>=0?'#669bd3':'#e4524b',stroke:'#111923','stroke-width':1}));if(c!=null){g.appendChild(svgEl('path',{d:`M ${xx} ${y(c)-5.3} l 5.3 5.3 l -5.3 5.3 l -5.3 -5.3 Z`,fill:'#e4524b'}));}}
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
 for(let i=0;i<=4;i++){const v=lo+(hi-lo)*i/4;svg.appendChild(svgEl('line',{x1:56,x2:786,y1:y(v),y2:y(v),stroke:v===0?'#a6b3c1':'#354758','stroke-dasharray':v===0?'5 4':'none'}));svg.appendChild(svgEl('text',{x:47,y:y(v)+4,'text-anchor':'end',fill:'#b7c6d4','font-size':12},v.toFixed(1)));}
 const curve=(fit,color)=>{if(!fit)return;const from=earliest,to=Math.min(end,election);if(to<=from)return;const path=Array.from({length:101},(_,i)=>{const d=from+(to-from)*i/100;return (i?'L':'M')+x(d).toFixed(1)+' '+y(evalFit(fit,d)).toFixed(1);}).join(' ');svg.appendChild(svgEl('path',{d:path,fill:'none',stroke:color,'stroke-width':3}));};
 curve(linear,'#669bd3');curve(quad,'#e4524b');
 for(const p of points){const dot=svgEl('path',{d:starPath(x(p.date),y(p.value),p.exit?8:6,p.exit?3.6:2.7),fill:p.exit?'#4fce8a':(p.value>=0?'#669bd3':'#e4524b'),stroke:'#101a24','stroke-width':1.2});dot.appendChild(svgEl('title',{},p.label+' · '+p.value.toFixed(1)+' pp'));svg.appendChild(dot);}
 for(let i=0;i<=4;i++){const d=start+(end-start)*i/4;svg.appendChild(svgEl('text',{x:x(d),y:278,'text-anchor':'middle',fill:'#aebccc','font-size':11},new Date(d).toLocaleDateString('da-DK',{day:'numeric',month:'short'})));}
 target.replaceChildren(svg);
 return {trend:linear?.c[1]??null,accel:quad?2*quad.c[2]:null};
}
function drawDetail(){const r=getOriginal(selected),e=exits[selected],c=combined(r),metrics=drawTrendDetail();$('selected-name').textContent=selected;const cell=(label,v,kind='')=>`<div><small>${label}</small><strong class="${kind||((v??0)>=0?'blue':'red')}">${label.startsWith('Trend')||label.startsWith('Accel')?(v==null?'—':(v>0?'+':'')+v.toLocaleString('da-DK',{minimumFractionDigits:2,maximumFractionDigits:2})+' pp'):fmt(v)}</strong></div>`;$('race-numbers').innerHTML=cell('Margin før valget',r.margin)+cell('Exitpoll',e?.margin,'green')+cell('Opdateret margin',c)+cell('Trend / uge',metrics.trend,'')+cell('Accel / uge²',metrics.accel,'');
 let note=r.margin==null?'Ingen meningsmålinger i det eksisterende grundlag. Mandatet fastholdes hos '+(r.inc==='D'?'D/I':'R')+' indtil nye data foreligger.':`${r.count} meningsmåling${r.count===1?'':'er'} i det gemte grundlag.`;
 if(e)note+=` Exitpoll: ${e.source}, offentliggjort ${new Date(e.time).toLocaleString('da-DK',{timeZone:'Europe/Copenhagen',dateStyle:'short',timeStyle:'short'})} dansk tid. Ændring fra oprindelig margin: ${r.margin==null?'ikke beregnelig':(e.margin-r.margin).toLocaleString('da-DK',{minimumFractionDigits:1,maximumFractionDigits:1})+' procentpoint mod D/I'}.`;
 else note+=' Der er endnu ikke indtastet exitpoll-data for denne delstat.';
 $('race-comment').textContent=note;}
function render(){
 drawSeats();drawChart();drawDetail();
 const polls=snapshot.reduce((n,r)=>n+r.count,0),n=Object.keys(exits).length;
 $('feed-status').textContent=`${DEMO?'TESTDATA · ':''}${polls} MÅLINGER · ${n} ${n===1?'DELSTAT':'DELSTATER'} MED EXITPOLL`;
 const date=FEED.updatedAt;
 $('rendered-at').textContent=typeof date==='string'&&date.trim()?date:'Målinger fra Senatsvalg · endnu ingen publiceret valgnatsopdatering';
}
function init(){
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

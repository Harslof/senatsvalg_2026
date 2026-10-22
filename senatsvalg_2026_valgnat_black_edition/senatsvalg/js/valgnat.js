/* Valgnat 2026: private, file-based dashboard. Uses the same MODEL.states as Senatsvalg.
   Exit polls are MANUAL inputs, never fabricated or fetched automatically. */
(()=>{'use strict';
const SOURCE=MODEL.states;
// Read-only, file-driven election-night data. Editors update data/valgnat-feed.js
// in the published files; no visitor inputs or browser-local overrides are used.
const FEED=window.VALGNAT_FEED||{};
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
const validExits=o=>o&&typeof o==='object'&&!Array.isArray(o)&&Object.keys(o).every(k=>CODES[k]&&o[k]&&typeof o[k]==='object'&&typeof o[k].margin==='number'&&Number.isFinite(o[k].margin)&&Math.abs(o[k].margin)<=100&&typeof o[k].source==='string'&&o[k].source.length>0&&o[k].source.length<=160&&typeof o[k].time==='string'&&/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(o[k].time));
// Only a complete, validated baseline can override the current polls.js baseline.
// Publish a fixed baseline in the feed at 23:00 if later poll updates must not
// rewrite the comparison point for the election-night graphics.
const snapshot=validSnapshot(FEED.snapshot)?FEED.snapshot:currentBaseline();
const exits=validExits(FEED.exits)?FEED.exits:{};
const weight=typeof FEED.weight==='number'&&Number.isFinite(FEED.weight)&&FEED.weight>=0&&FEED.weight<=100?FEED.weight:50;
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
 if(r.margin!=null){if(show&&exit){g.appendChild(svgEl('line',{x1:xx,y1:y(r.margin),x2:xx,y2:y(exit.margin),stroke:'#50d5a0','stroke-width':2.6,'stroke-opacity':'.8'}));}g.appendChild(svgEl('circle',{cx:xx,cy:y(r.margin),r:4.3,fill:'#121923',stroke:'#f2e7d1','stroke-width':1.7}));}
 else{g.appendChild(svgEl('line',{x1:xx-4,x2:xx+4,y1:311,y2:311,stroke:'#8a98a8','stroke-width':2.5}));}
 if(show&&exit){g.appendChild(svgEl('circle',{cx:xx,cy:y(exit.margin),r:4.5,fill:'#50d5a0'}));if(c!=null){g.appendChild(svgEl('path',{d:`M ${xx} ${y(c)-5.3} l 5.3 5.3 l -5.3 5.3 l -5.3 -5.3 Z`,fill:'#f5dfb5'}));}}
 const label=svgEl('text',{x:xx,y:344,'text-anchor':'middle',class:'state-label'},CODES[r.state]);g.appendChild(label);g.appendChild(svgEl('title',{},`${r.state}: Før ${fmt(r.margin)}; Exitpoll ${fmt(exit?.margin)}; Opdateret ${fmt(c)}`));g.addEventListener('click',()=>selectState(r.state));g.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();selectState(r.state);}});svg.appendChild(g);
 });const target=$('margin-chart');target.replaceChildren(svg);}
function selectState(name){selected=name;$('state-select').value=name;drawChart();drawDetail();}
const metric=v=>Number.isFinite(v)?(v>0?'+':'')+v.toLocaleString('da-DK',{maximumFractionDigits:3}):'—';
function drawDetail(){const r=getOriginal(selected),e=exits[selected],c=combined(r);$('selected-name').textContent=selected;const cell=(label,v,kind='')=>`<div><small>${label}</small><strong class="${kind||((v??0)>=0?'blue':'red')}">${fmt(v)}</strong></div>`;$('race-numbers').innerHTML=cell('Margin før valget',r.margin)+cell('Exitpoll',e?.margin,'purple')+cell('Opdateret margin',c)+`<div><small>Trend · pp/uge</small><strong>${metric(MODEL.states.find(x=>x.state===selected)?.trend)}</strong></div><div><small>Acceleration · pp/uge²</small><strong>${metric(MODEL.states.find(x=>x.state===selected)?.accel)}</strong></div>`;
 let note=r.margin==null?'Ingen meningsmålinger i det eksisterende grundlag. Mandatet fastholdes hos '+(r.inc==='D'?'D/I':'R')+' indtil nye data foreligger.':`${r.count} meningsmåling${r.count===1?'':'er'} i det gemte grundlag.`;
 if(e)note+=` Exitpoll: ${e.source}, offentliggjort ${e.time.replace('T',' kl. ')} dansk tid. Ændring fra oprindelig margin: ${r.margin==null?'ikke beregnelig':(e.margin-r.margin).toLocaleString('da-DK',{minimumFractionDigits:1,maximumFractionDigits:1})+' procentpoint mod D/I'}.`;
 else note+=' Der er endnu ikke indtastet exitpoll-data for denne delstat.';
 $('race-comment').textContent=note;drawDetailChart();}
function drawDetailChart(){const model=SOURCE.find(x=>x.state===selected),pts=(model?.points||[]).filter(p=>Number.isFinite(p.y)&&/^\\d{4}-\\d{2}-\\d{2}$/.test(p.end||p.x)).map(p=>({date:new Date((p.end||p.x)+'T12:00:00Z').getTime(),y:p.y,poll:p.poll})).sort((a,b)=>a.date-b.date);const exit=exits[selected],W=900,H=285,L=53,R=20,T=24,B=48;const end=Date.UTC(2026,10,4),min=pts.length?Math.min(...pts.map(p=>p.date)):Date.UTC(2026,0,1),max=Math.max(end,...pts.map(p=>p.date)),range=Math.max(86400000,max-min),vals=[...pts.map(p=>p.y),exit?.margin,combined(getOriginal(selected)),0].filter(Number.isFinite),bound=Math.max(10,Math.ceil(Math.max(...vals.map(Math.abs))/5)*5);const X=d=>L+(d-min)/range*(W-L-R),Y=v=>T+(bound-v)/(2*bound)*(H-T-B);const svg=svgEl('svg',{viewBox:`0 0 ${W} ${H}`,role:'presentation'});for(const v of [-bound,-bound/2,0,bound/2,bound]){svg.appendChild(svgEl('line',{x1:L,x2:W-R,y1:Y(v),y2:Y(v),stroke:v===0?'#93a7b9':'#34485a','stroke-dasharray':v===0?'':'4 5'}));svg.appendChild(svgEl('text',{x:L-9,y:Y(v)+4,'text-anchor':'end',fill:'#b6c7d8','font-size':11},String(v)));}for(let m=0;m<11;m+=2){const d=Date.UTC(2026,m,1);if(d>=min&&d<=max)svg.appendChild(svgEl('text',{x:X(d),y:H-15,'text-anchor':'middle',fill:'#b6c7d8','font-size':11},new Date(d).toLocaleDateString('da-DK',{month:'short'})));}for(const p of pts){svg.appendChild(svgEl('circle',{cx:X(p.date),cy:Y(p.y),r:4,fill:p.y>=0?'#669bd3':'#d36b58',stroke:'#e6eef6','stroke-width':'.5'}));}if(exit){const xe=X(end),ye=Y(exit.margin),combinedMargin=combined(getOriginal(selected));svg.appendChild(svgEl('line',{x1:xe,y1:Y(0),x2:xe,y2:ye,stroke:'#50d5a0','stroke-width':2,'stroke-dasharray':'4 4'}));svg.appendChild(svgEl('circle',{cx:xe,cy:ye,r:8,fill:'#50d5a0',stroke:'#fff','stroke-width':2}));if(Number.isFinite(combinedMargin)){svg.appendChild(svgEl('line',{x1:xe-10,x2:xe+10,y1:Y(combinedMargin),y2:Y(combinedMargin),stroke:'#ffd4cb','stroke-width':3,'stroke-dasharray':'4 3'}));}}if(!pts.length&&!exit)svg.appendChild(svgEl('text',{x:W/2,y:H/2,'text-anchor':'middle',fill:'#b6c7d8'},'Ingen historiske målinger'));$('detail-chart').replaceChildren(svg);}
function drawCountdown(){const box=$('next-event');if(!box)return;const now=Date.now();const upcoming=TIMES.map((event,i)=>{const [hh,mm]=event.t.split('.').map(Number);return {...event,at:Date.UTC(2026,10,hh>=23?3:4,hh,mm),i};}).find(e=>e.at>now);if(!upcoming){box.innerHTML='<strong>Valgnattens planlagte begivenheder er afsluttet</strong>';return;}const ms=upcoming.at-now,h=Math.floor(ms/3600000),m=Math.floor(ms%3600000/60000),s=Math.floor(ms%60000/1000);box.innerHTML=`<div><strong>Næste begivenhed: ${esc(upcoming.label)}</strong><br><span>Kl. ${upcoming.t} dansk tid (CET) · forventet tidspunkt</span></div><div class="clock">${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}</div>`;}
function render(){
 drawSeats();drawChart();drawDetail();
 const polls=snapshot.reduce((n,r)=>n+r.count,0),n=Object.keys(exits).length;
 $('feed-status').textContent=`${polls} MÅLINGER · ${n} ${n===1?'DELSTAT':'DELSTATER'} MED EXITPOLL`;
 const date=FEED.updatedAt;
 $('rendered-at').textContent=typeof date==='string'&&date.trim()?date:'Målinger fra Senatsvalg · endnu ingen publiceret valgnatsopdatering';
}
function init(){
 drawTimeline();drawCountdown();setInterval(drawCountdown,1000);
 for(const r of SOURCE){const o=document.createElement('option');o.value=r.state;o.textContent=r.state;$('state-select').appendChild(o);}
 $('state-select').value=selected;
 render();
 $('state-select').addEventListener('change',e=>selectState(e.target.value));
 $('sort-states').addEventListener('change',drawChart);
 $('show-exit').addEventListener('change',drawChart);
}
init();
})();

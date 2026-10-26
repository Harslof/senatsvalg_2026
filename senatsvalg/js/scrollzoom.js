/* Progressive 100 -> 35 -> competitive Senate visualization. Offline, no dependencies. */
(()=>{
'use strict';
const root=document.getElementById('zoomSenate');if(!root)return;
const track=document.getElementById('zoomTrack'),title=document.getElementById('zoomTitle'),intro=document.getElementById('zoomIntro'),note=document.getElementById('zoomNote'),kicker=document.getElementById('zoomKicker'),count=document.getElementById('zoomCount');
let level=0,acc=0;
const numeric=v=>typeof v==='number'&&Number.isFinite(v);
const fmt=v=>numeric(v)?(v>0?'+':'')+v.toLocaleString('da-DK',{minimumFractionDigits:2,maximumFractionDigits:2}):'—';
const positive=r=>r.inc==='D'||r.inc==='I';
const color=r=>r.margin==null?positive(r):getScore(r)>=0;
const getScore=r=>document.querySelector('input[name="racesort"]:checked')?.value==='forecast'?forecast(r):r.margin;
const project=r=>forecast(r);
const seatList=()=>{
 const poll=state.filter(r=>numeric(r.margin)).sort((a,b)=>getScore(b)-getScore(a)||a.state.localeCompare(b.state));
 const missing=state.filter(r=>!numeric(r.margin));
 return [...missing.filter(positive).sort((a,b)=>a.state.localeCompare(b.state)),...poll,...missing.filter(r=>!positive(r)).sort((a,b)=>a.state.localeCompare(b.state))];
};
// 47 currently D/I, of which some are up for election. Fixed seats are counted separately.
const fixedCount=()=>47-state.filter(positive).length;
const cutoff=()=>Math.max(0,Math.min(35,51-fixedCount()));
const confidence=r=>{
 const p=(r.points||[]).map(x=>x.y).filter(numeric),n=p.length;
 if(n<3)return null;
 const mean=p.reduce((a,b)=>a+b,0)/n;
 const sd=Math.sqrt(p.reduce((a,b)=>a+(b-mean)**2,0)/(n-1));
 // Descriptive normal approximation only; no forecast interval is available in MODEL.
 return 1.96*sd/Math.sqrt(n);
};
const safe=r=>{
 if(!numeric(r.margin))return false;
 const f=project(r),ci=confidence(r);
 if(!numeric(f)||!numeric(ci))return false;
 return Math.sign(r.margin)===Math.sign(f)&&Math.abs(r.margin)>4&&Math.abs(f)>4&&Math.abs(r.margin)>ci&&Math.abs(f)>ci;
};
// Level 03 is about genuinely competitive races, not races with insufficient data.
// Include a race if current or projected margin is within +/-4pp, or if
// the projection crosses zero (a potential change of leading party).
const close=r=>{
 const f=project(r);
 return (numeric(r.margin)&&Math.abs(r.margin)<=4)||
        (numeric(f)&&Math.abs(f)<=4)||
        (numeric(r.margin)&&numeric(f)&&r.margin*f<0);
};
const speed=r=>numeric(r.trend)?r.trend+0.5*(r.accel??0):null;
const changesSide=r=>numeric(r.margin)&&numeric(project(r))&&r.margin*project(r)<0;
const chevrons=r=>{
 const v=speed(r);if(!numeric(v)||Math.abs(v)<.005)return '';
 const n=Math.abs(v)<.15?1:Math.abs(v)<.4?2:3;
 const paths=Array.from({length:n},(_,i)=>{
   const y=4+i*10;
   return `<path d="${v>=0?`M3 ${y+8} L12 ${y} L21 ${y+8}`:`M3 ${y} L12 ${y+8} L21 ${y}`}" />`;
 }).join('');
 return `<svg class="zoom-chevron-svg ${v<0?'down':'up'}" viewBox="0 0 24 ${n*10+4}" aria-label="${v<0?'Mod republikanerne':'Mod demokraterne'}, ${n} hastighedstrin" role="img"><g fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">${paths}</g></svg>`;
};
const stateAbbreviations={"Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR", "California": "CA", "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE", "Florida": "FL", "Georgia": "GA", "Hawaii": "HI", "Idaho": "ID", "Illinois": "IL", "Indiana": "IN", "Iowa": "IA", "Kansas": "KS", "Kentucky": "KY", "Louisiana": "LA", "Maine": "ME", "Maryland": "MD", "Massachusetts": "MA", "Michigan": "MI", "Minnesota": "MN", "Mississippi": "MS", "Missouri": "MO", "Montana": "MT", "Nebraska": "NE", "Nevada": "NV", "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY", "North Carolina": "NC", "North Dakota": "ND", "Ohio": "OH", "Oklahoma": "OK", "Oregon": "OR", "Pennsylvania": "PA", "Rhode Island": "RI", "South Carolina": "SC", "South Dakota": "SD", "Tennessee": "TN", "Texas": "TX", "Utah": "UT", "Vermont": "VT", "Virginia": "VA", "Washington": "WA", "West Virginia": "WV", "Wisconsin": "WI", "Wyoming": "WY"};
const stateAbbr=name=>stateAbbreviations[name]||name;
const arrows=r=>`<span class="zoom-arrows" title="Udvikling ${fmt(speed(r))} procentpoint næste uge">${chevrons(r)}</span>`;
const value=(v,cls='')=>`<span class="${cls} ${numeric(v)?(v>0?'zoom-positive':v<0?'zoom-negative':'zoom-neutral'):'zoom-neutral'}">${fmt(v)}</span>`;
const party=p=>`<span class="zoom-party ${p==='R'?'r':''}">${p||'?'}</span>`;
function addDivider(el,index,total,caption='50 / 50'){
 const d=document.createElement('div');d.className='zoom-divider';d.style.left=`${(100*index/total).toFixed(6)}%`;d.innerHTML=`<span>${caption}</span>`;el.appendChild(d);
}
function paint(){
 const rows=seatList(),cut=cutoff();root.hidden=document.querySelector('input[name="raceview"]:checked')?.value!=='all';if(root.hidden)return;
 const fixedD=fixedCount(),fixedR=65-fixedD;
 const settings=[['01 / HELE SENATET','Vejen til 50 mandater','100 pladser. De 65 mandater, der ikke er på valg, er nedtonet.','100 sæder'],['02 / DE 35 VALG','De 35 senatsvalg','Sikre valg er nedtonede. Delstatsforkortelserne står vandret, og pilene viser udviklingen over den næste uge.','35 valg'],['03 / DE TÆTTE VALG','Valgene, der kan afgøre flertallet','Valg med margin nu eller valgdag inden for ±4 procentpoint, samt valg med forventet skift af førende parti. Tallene vises i søjlerne.','Tætte valg']][level];
 kicker.textContent=settings[0];title.textContent=settings[1];intro.textContent=settings[2];count.textContent=settings[3];
 document.querySelectorAll('[data-zoom]').forEach(b=>{b.classList.toggle('active',+b.dataset.zoom===level);b.setAttribute('aria-pressed',String(+b.dataset.zoom===level))});
 track.innerHTML='';const bar=document.createElement('div');bar.className='zoom-track'+(level===2?' compact':'');track.appendChild(bar);
 if(level===0){
   const left=Array.from({length:fixedD},()=>({off:true,d:true}));const right=Array.from({length:fixedR},()=>({off:true,d:false}));
   const seats=[...left,...rows.map(r=>({r,d:color(r)})),...right];
   // Keep the 100 seats visually grouped by party, not simply concatenate left and right.
   seats.sort((a,b)=>Number(b.d)-Number(a.d));
   seats.forEach(x=>{const e=document.createElement('div');e.className='zoom-stick'+(x.d?'':' r')+(x.off?' off':'');e.title=x.off?'Ikke på valg':x.r.state;if(x.r)e.dataset.state=x.r.state;bar.appendChild(e)});
   [33,40,49,51,60,67].forEach(n=>addDivider(bar,n,100,`${n<=49?100-n:n} ${n<=49?'R':'D/I'}`));
   note.textContent='Demokraterne/uafhængige vises til venstre og republikanerne til højre. Stiplede linjer viser 51, 60 og 67 mandater for begge partier. Ved 50–50 kan vicepræsidenten afgøre stemmelighed.';
 }else if(level===1){
   rows.forEach(r=>{const e=document.createElement('div');e.className='zoom-stick'+(color(r)?'':' r')+(!numeric(r.margin)?' unpolled':safe(r)?' safe':'')+(changesSide(r)?' changing':'');e.dataset.state=r.state;e.title=r.state+(safe(r)?' · sikkert':!numeric(r.margin)?' · uden måling':' · usikkert');e.innerHTML=`<span class="zoom-stick-name">${stateAbbr(r.state)}</span>${arrows(r)}`;bar.appendChild(e)});
   [51,60,67].forEach(target=>{const atD=target-fixedD,atR=35-(target-fixedR);if(atD>=0&&atD<=35)addDivider(bar,atD,35,`${target} D/I`);if(atR>=0&&atR<=35)addDivider(bar,atR,35,`${target} R`)});bar.style.marginBottom='48px';
   note.textContent=`Mandatgrænserne tæller også de faste mandater. ${fixedD} demokratiske/uafhængige mandater er ikke på valg, så der kræves ${50-fixedD} af de 35 valg. Nedtoning kræver margin nu og valgdag over 4 pp i samme retning samt intervaller uden nul (foreløbige, omtrentlige intervaller).`;
 }else{
   const relevant=rows.filter(close);
   const left=rows.slice(0,cut).filter(close).length;
   const shown=relevant.length;
   relevant.forEach(r=>{
     const f=project(r),next=f==null?r.inc:f>0?(r.kind==='I-R'?'I':'D'):f<0?'R':r.inc;
     const e=document.createElement('div');e.className='zoom-card'+(color(r)?'':' r')+(changesSide(r)?' changing':'');e.dataset.state=r.state;
     e.innerHTML=`<h4>${stateAbbr(r.state)}</h4><div class="zoom-parties">${party(r.inc)}<span>→</span>${party(next)}</div><div class="zoom-pop zoom-primary"><span class="zoom-label">Margin</span><div class="zoom-big">${value(r.margin)}</div></div><div class="zoom-duo zoom-pop"><div><span class="zoom-label">Trend</span><span class="zoom-small">${value(r.trend)}</span></div><div><span class="zoom-label">Accel.</span><span class="zoom-small">${value(r.accel)}</span></div></div><div class="zoom-end zoom-pop"><span class="zoom-label">Valgdag</span><div class="zoom-big">${value(f)}</div></div><div class="zoom-chevron">${chevrons(r)}</div>`;
     bar.appendChild(e);
   });
   if(shown){addDivider(bar,left,shown,'51 D/I');bar.style.minWidth=`${Math.max(650,shown*91)}px`;}
   else bar.textContent='Ingen valg opfylder kriterierne for tætte valg.';
   note.textContent=`${shown} valg vises: Margin nu eller Valgdag højst ±4 procentpoint, eller forskellig førende partigruppe nu og på valgdagen. Den stiplede 51 D/I-linje viser grænsen for et selvstændigt demokratisk flertal. Trend er pp/uge og acceleration pp/uge².`;
 }
}
// FLIP animation: keep the old and new bar positions visible while morphing.
let morphRunning=false;
function transitionTo(next){
 next=Math.max(0,Math.min(2,next));
 if(next===level||morphRunning)return;
 const from=level, morph=Math.abs(from-next)===1;
 const reduce=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 const oldBar=track.querySelector('.zoom-track');
 const oldSeats=morph&&!reduce&&oldBar?[...oldBar.querySelectorAll('.zoom-stick,.zoom-card')].map(el=>({state:el.dataset.state||'',rect:el.getBoundingClientRect(),color:getComputedStyle(el).backgroundColor,opacity:getComputedStyle(el).opacity})):[];
 level=next;acc=0;paint();
 if(!morph||reduce||!oldSeats.length||root.hidden)return;
 const newBar=track.querySelector('.zoom-track');
 const newSeats=[...newBar.querySelectorAll('.zoom-stick,.zoom-card')];
 const oldByState=new Map(oldSeats.filter(s=>s.state).map(s=>[s.state,s]));
 const newByState=new Map(newSeats.filter(el=>el.dataset.state).map(el=>[el.dataset.state,el]));
 const layer=document.createElement('div');layer.className='zoom-morph-layer';document.body.appendChild(layer);
 morphRunning=true;
 // Keep the destination invisible until the transition has completed.
 newBar.style.visibility='hidden';
 const duration=from===0||next===0?1050:1250;
 const animations=[];
 const stage23=(from===1&&next===2)||(from===2&&next===1);
 const makeGhost=(start,end,disappears=false,appears=false)=>{
   const rect=end?.getBoundingClientRect()||start.rect;
   const el=document.createElement('div');el.className='zoom-morph-ghost';
   el.style.cssText=`left:${start.rect.left}px;top:${start.rect.top}px;width:${start.rect.width}px;height:${start.rect.height}px;background:${start.color};opacity:${appears?0:start.opacity};`;
   layer.appendChild(el);
   let frames;
   if(stage23&&disappears){
     // Phase 1: remove noncompetitive states without moving them sideways.
     frames=[{opacity:1,offset:0},{opacity:0,offset:.32},{opacity:0,offset:1}];
   }else if(stage23&&appears){
     frames=[{opacity:0,offset:0},{opacity:0,offset:.65},{opacity:1,offset:1}];
   }else if(stage23){
     // Phase 2: surviving states close their gaps, then expand from the
     // exact screen coordinates of the final column (not a scaled grid).
     frames=[
       {left:`${start.rect.left}px`,top:`${start.rect.top}px`,width:`${start.rect.width}px`,height:`${start.rect.height}px`,opacity:1,offset:0},
       {left:`${start.rect.left}px`,top:`${start.rect.top}px`,width:`${start.rect.width}px`,height:`${start.rect.height}px`,opacity:1,offset:.30},
       {left:`${rect.left}px`,top:`${rect.top}px`,width:`${rect.width}px`,height:`${rect.height}px`,opacity:1,offset:1}
     ];
   }else{
     frames=[
       {left:`${start.rect.left}px`,top:`${start.rect.top}px`,width:`${start.rect.width}px`,height:`${start.rect.height}px`,opacity:Number(start.opacity),offset:0},
       {left:`${rect.left}px`,top:`${rect.top}px`,width:`${rect.width}px`,height:`${rect.height}px`,opacity:disappears?0:1,offset:1}
     ];
   }
   animations.push(el.animate(frames,{duration,easing:'cubic-bezier(.42,0,.18,1)',fill:'forwards'}));
 };
 if(from<next){
   oldSeats.forEach(s=>makeGhost(s,newByState.get(s.state),!newByState.has(s.state)));
 }else{
   oldSeats.forEach(s=>makeGhost(s,newByState.get(s.state),!newByState.has(s.state)));
   // The safe/unchanged states return only after the competitive bars
   // have shrunk back into their places in the 35-state overview.
   newSeats.filter(el=>!oldByState.has(el.dataset.state)).forEach(el=>{
     const rect=el.getBoundingClientRect();
     makeGhost({rect,color:getComputedStyle(el).backgroundColor,opacity:1},el,false,true);
   });
 }
 const finish=()=>{
   if(!morphRunning)return;
   newBar.style.visibility='';layer.remove();morphRunning=false;
   if(from===0&&next===1){newBar.classList.remove('zoom-intro');void newBar.offsetWidth;newBar.classList.add('zoom-intro');}
   if(next===2){newBar.classList.remove('zoom-reveal');void newBar.offsetWidth;newBar.classList.add('zoom-reveal');}
 };
 Promise.allSettled(animations.map(a=>a.finished)).then(finish);
 setTimeout(finish,duration+350);
}
function setLevel(next){transitionTo(next)}
root.querySelectorAll('[data-zoom]').forEach(b=>b.addEventListener('click',()=>setLevel(+b.dataset.zoom)));
document.getElementById('zoomWheel').addEventListener('wheel',e=>{
 // Use one scroll gesture for one zoom step. Do not allow momentum wheel
 // events to move the page or interrupt the 02 -> 03 morph animation.
 if(morphRunning){e.preventDefault();acc=0;return;}
 if((e.deltaY>0&&level===2)||(e.deltaY<0&&level===0)){acc=0;return;}
 e.preventDefault();
 acc+=e.deltaY;
 if(Math.abs(acc)>65){const next=level+(acc>0?1:-1);acc=0;setLevel(next);}
},{passive:false});
document.querySelectorAll('input[name="raceview"],input[name="racesort"],input[name="projection"],input[name="weight"]').forEach(e=>e.addEventListener('change',paint));
document.getElementById('half')?.addEventListener('input',paint);
// The zoom stages are controlled by the three buttons and wheel interaction
// inside the barometer only. Outside the barometer, native page scrolling wins.
// In particular, scrolling down from stage 03 must NOT restart at stage 01.
paint();
})();

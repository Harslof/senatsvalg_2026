(()=>{'use strict';
const rows=typeof EVAL_ROWS!=='undefined'?EVAL_ROWS:[];
const $=id=>document.getElementById(id);
const number=v=>Number(v).toLocaleString('da-DK',{minimumFractionDigits:2,maximumFractionDigits:2});
const signed=v=>v>0?'+'+number(v):number(v);
const fmt=v=>v==null?'—':signed(v);
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
function render(){
 const model=+$('ev-model').value,sort=$('ev-sort').value,filter=$('ev-filter').value;
 let data=rows.map(r=>({...r,pred:r.models[model],error:r.models[model]==null?null:r.models[model]-r.actual}));
 if(filter==='polled')data=data.filter(r=>r.n);
 if(filter==='called')data=data.filter(r=>r.n&&r.called);
 if(filter==='wrong')data=data.filter(r=>r.n&&Math.sign(r.pred)!==Math.sign(r.actual));
 const alpha=(a,b)=>a.state.localeCompare(b.state,'da');
 data.sort(sort==='alpha'?alpha:sort==='negative'?(a,b)=>(a.error??Infinity)-(b.error??Infinity)||alpha(a,b):sort==='close'?(a,b)=>Math.abs(a.actual)-Math.abs(b.actual)||alpha(a,b):(a,b)=>(b.error==null?-1:Math.abs(b.error))-(a.error==null?-1:Math.abs(a.error))||alpha(a,b));
 $('ev-rows').innerHTML=data.map(r=>{const wrong=r.pred!=null&&Math.sign(r.pred)!==Math.sign(r.actual);return '<tr><th scope="row">'+escape(r.state)+(r.called?'':' <span title="Valget er endnu ikke afgjort">*</span>')+'</th><td>'+r.n+'</td><td class="'+(r.actual>=0?'ev-blue':'ev-red')+'">'+fmt(r.actual)+'</td><td>'+fmt(r.pred)+'</td><td class="'+(r.error==null?'':r.error<0?'ev-neg':'ev-pos')+'">'+fmt(r.error)+'</td><td>'+(r.pred==null?'—':wrong?'<span class="ev-wrong">Forkert</span>':'Korrekt')+'</td></tr>'}).join('');
 $('ev-table-caption').textContent=data.length+' delstater vist · negative fejl betyder undervurdering af D/I · * foreløbigt resultat.';
}
['ev-model','ev-sort','ev-filter'].forEach(id=>$(id).addEventListener('change',render));render();
// Radar: four model errors shown on a shared 0–8 percentage-point scale.
const values=[6.46,5.94,6.24,6.20],labels=['Gennemsnit','Tidsvægtet','Lineær','Acceleration'];
const center=205,cy=205,R=135;
const point=(i,v)=>{const angle=-Math.PI/2+i*Math.PI/2;return [center+Math.cos(angle)*R*v/8,cy+Math.sin(angle)*R*v/8]};
const poly=v=>v.map((x,i)=>point(i,x).map(n=>n.toFixed(1)).join(',')).join(' ');
const radar=document.getElementById('ev-radar');
if(radar){let svg='<svg viewBox="0 0 410 410" role="img" aria-label="Edderkoppediagram over gennemsnitlig absolut fejl for fire modeller, i procentpoint. Lavere er bedre.">';
for(const v of [2,4,6,8])svg+='<polygon points="'+poly([v,v,v,v])+'" fill="none" stroke="#ccd5e0" stroke-width="1"/>';
for(let i=0;i<4;i++){const [x,y]=point(i,8);svg+='<line x1="'+center+'" y1="'+cy+'" x2="'+x+'" y2="'+y+'" stroke="#b8c4d2"/>'}
svg+='<polygon points="'+poly(values)+'" fill="#245b98" fill-opacity=".20" stroke="#245b98" stroke-width="3"/>';
values.forEach((v,i)=>{const [x,y]=point(i,v);svg+='<circle cx="'+x+'" cy="'+y+'" r="5" fill="#245b98" stroke="white" stroke-width="2"/>';});
const positions=[[205,34],[352,205],[205,376],[58,205]];
positions.forEach(([x,y],i)=>{svg+='<text x="'+x+'" y="'+y+'" text-anchor="middle" font-family="Arial,sans-serif" font-size="12" font-weight="700" fill="#172233">'+labels[i]+'</text>';svg+='<text x="'+x+'" y="'+(y+15)+'" text-anchor="middle" font-family="Arial,sans-serif" font-size="12" fill="#245b98">'+values[i].toFixed(2).replace('.',',')+' pp</text>'});
radar.innerHTML=svg+'</svg>';
}
const biggest=rows.filter(r=>r.n).map(r=>({state:r.state,error:r.models[1]-r.actual})).sort((a,b)=>a.error-b.error).slice(0,5);
$('ev-bias-bars').innerHTML=biggest.map(r=>'<div class="ev-bar-row ev-bias-row"><span>'+escape(r.state)+'</span><div class="ev-track"><div style="width:'+(Math.abs(r.error)/14*100).toFixed(1)+'%"></div></div><b>'+signed(r.error)+'</b></div>').join('');
})();
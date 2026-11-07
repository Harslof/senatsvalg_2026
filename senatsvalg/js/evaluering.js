(()=>{'use strict';
const rows=window.EVAL_ROWS||[];
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
const biggest=rows.filter(r=>r.n).map(r=>({state:r.state,error:r.models[1]-r.actual})).sort((a,b)=>a.error-b.error).slice(0,5);
$('ev-bias-bars').innerHTML=biggest.map(r=>'<div class="ev-bar-row ev-bias-row"><span>'+escape(r.state)+'</span><div class="ev-track"><div style="width:'+(Math.abs(r.error)/14*100).toFixed(1)+'%"></div></div><b>'+signed(r.error)+'</b></div>').join('');
})();
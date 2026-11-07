(()=>{'use strict';
const rows=typeof EVAL_ROWS!=='undefined'?EVAL_ROWS:[];
const $=id=>document.getElementById(id),num=v=>Number(v).toLocaleString('da-DK',{minimumFractionDigits:2,maximumFractionDigits:2}),signed=v=>v>0?'+'+num(v):num(v),fmt=v=>v==null?'—':signed(v),esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const data=typeof MODEL!=='undefined'?MODEL.states:[],lookup=new Map(data.map(r=>[r.state,r]));
const election=Date.parse('2026-11-03T12:00:00Z'),week=604800000;
function solve(A,b){const n=b.length,m=A.map((row,i)=>[...row,b[i]]);for(let k=0;k<n;k++){let p=k;for(let i=k+1;i<n;i++)if(Math.abs(m[i][k])>Math.abs(m[p][k]))p=i;if(Math.abs(m[p][k])<1e-10)return null;[m[k],m[p]]=[m[p],m[k]];const z=m[k][k];for(let j=k;j<=n;j++)m[k][j]/=z;for(let i=0;i<n;i++)if(i!==k){const f=m[i][k];for(let j=k;j<=n;j++)m[i][j]-=f*m[k][j]}}return m.map(x=>x[n])}
function prediction(state,degree,half,weighted){const pts=(lookup.get(state)?.points||[]).filter(p=>Number.isFinite(p.y)&&Number.isFinite(Date.parse(p.x+'T12:00:00Z'))&&Number.isFinite(Date.parse(p.end+'T12:00:00Z')));if(!pts.length)return null;
const dates=pts.map(p=>(Date.parse(p.x+'T12:00:00Z')+Date.parse(p.end+'T12:00:00Z'))/2),latest=Math.max(...dates),ts=dates.map(d=>(d-latest)/week),weights=ts.map(t=>weighted?2**(t/half):1),avg=pts.reduce((a,p,i)=>a+p.y*weights[i],0)/weights.reduce((a,b)=>a+b,0);
let pred=avg,h=Math.max(0,(election-latest)/week);
for(const d of degree===0?[]:degree===1?[1]:[2,1]){if(pts.length<d+1||-Math.min(...ts)<4)continue;const A=Array.from({length:d+1},()=>Array(d+1).fill(0)),b=Array(d+1).fill(0);pts.forEach((p,i)=>{for(let j=0;j<=d;j++){b[j]+=weights[i]*ts[i]**j*p.y;for(let k=0;k<=d;k++)A[j][k]+=weights[i]*ts[i]**(j+k)}});const c=solve(A,b);if(c){pred=avg+c[1]*h+(d===2?c[2]*h*h:0);break}}
return pred}
function radar(){const half=+$('ev-half').value,compare=$('ev-compare').checked;$('ev-half-value').textContent=half+' uger';
const samples=rows.filter(r=>r.n>0);const mae=(d,w)=>samples.reduce((sum,r)=>sum+Math.abs(prediction(r.state,d,half,w)-r.actual),0)/samples.length;
const equal=[0,1,2].map(d=>mae(d,false)),weighted=[0,1,2].map(d=>mae(d,true));
const cx=270,cy=245,R=165,max=10,point=(i,v)=>{const a=-Math.PI/2+i*2*Math.PI/3;return [cx+Math.cos(a)*R*v/max,cy+Math.sin(a)*R*v/max]},poly=arr=>arr.map((v,i)=>point(i,v).map(z=>z.toFixed(2)).join(',')).join(' ');
let svg='<svg viewBox="0 0 540 510" role="img" aria-label="Sammenligning af tre modeller med lige og tidsvægtede målinger. Mindre afstand til centrum er bedre.">';
for(const v of [2,4,6,8,10])svg+='<polygon points="'+poly([v,v,v])+'" fill="none" stroke="#cdd6e0" stroke-width="1"/>';
for(let i=0;i<3;i++){const [x,y]=point(i,max);svg+='<line x1="'+cx+'" y1="'+cy+'" x2="'+x+'" y2="'+y+'" stroke="#b5c1d0"/>'}
const polygon=(arr,color,offset)=>'<polygon points="'+poly(arr)+'" fill="'+color+'" fill-opacity=".10" stroke="'+color+'" stroke-width="3"/>'+arr.map((v,i)=>{const [x,y]=point(i,v),dx=Math.cos(-Math.PI/2+i*2*Math.PI/3)*offset,dy=Math.sin(-Math.PI/2+i*2*Math.PI/3)*offset;return '<circle cx="'+x+'" cy="'+y+'" r="5" fill="'+color+'"/><text x="'+(x+dx).toFixed(1)+'" y="'+(y+dy).toFixed(1)+'" text-anchor="middle" font-family="Arial" font-size="14" font-weight="700" fill="'+color+'" stroke="#fbfbfa" stroke-width="4" paint-order="stroke">'+num(v)+'</text>'}).join('');
if(compare)svg+=polygon(equal,'#b43b45',-23);svg+=polygon(weighted,'#245b98',23);
[['Gennemsnit',270,31],['Lineær',475,384],['Acceleration',65,384]].forEach(([label,x,y])=>svg+='<text x="'+x+'" y="'+y+'" text-anchor="middle" font-family="Arial" font-weight="700" font-size="13" fill="#26374c">'+label+'</text>');
svg+='</svg><div class="ev-radar-key"><span style="color:#245b98">● Tidsvægtet: '+weighted.map(num).join(' · ')+' pp</span>'+(compare?'<span style="color:#b43b45">● Lige: '+equal.map(num).join(' · ')+' pp</span>':'')+'</div>';
$('ev-radar').innerHTML=svg;
}
const tiles={
'Washington':[0,0], 'Oregon':[0,1], 'Idaho':[1,1], 'Montana':[2,0], 'Wyoming':[2,1], 'South Dakota':[3,1], 'Nebraska':[3,2], 'Colorado':[2,3], 'New Mexico':[2,4], 'Texas':[4,5], 'Oklahoma':[4,3], 'Kansas':[4,2], 'Iowa':[5,2], 'Minnesota':[5,0], 'Illinois':[6,2], 'Michigan':[7,1], 'Ohio':[8,2], 'Kentucky':[7,3], 'Tennessee':[7,4], 'Arkansas':[5,4], 'Louisiana':[5,5], 'Mississippi':[6,5], 'Alabama':[7,5], 'Georgia':[8,5], 'Florida':[9,6], 'South Carolina':[9,4], 'North Carolina':[10,4], 'Virginia':[10,3], 'West Virginia':[9,3], 'Delaware':[11,3], 'New Jersey':[11,2], 'New Hampshire':[11,0], 'Maine':[12,0], 'Massachusetts':[12,1], 'Rhode Island':[12,2], 'Alaska':[0,6]};
const abbreviations={'Washington':'WA','Oregon':'OR','Idaho':'ID','Montana':'MT','Wyoming':'WY','South Dakota':'SD','Nebraska':'NE','Colorado':'CO','New Mexico':'NM','Texas':'TX','Oklahoma':'OK','Kansas':'KS','Iowa':'IA','Minnesota':'MN','Illinois':'IL','Michigan':'MI','Ohio':'OH','Kentucky':'KY','Tennessee':'TN','Arkansas':'AR','Louisiana':'LA','Mississippi':'MS','Alabama':'AL','Georgia':'GA','Florida':'FL','South Carolina':'SC','North Carolina':'NC','Virginia':'VA','West Virginia':'WV','Delaware':'DE','New Jersey':'NJ','New Hampshire':'NH','Maine':'ME','Massachusetts':'MA','Rhode Island':'RI','Alaska':'AK'};
function mapColor(e){if(e==null)return '#e5e5e5';const a=Math.min(1,Math.abs(e)/14);const base=e<0?[22,76,137]:[163,47,59],pale=[222,230,239];return 'rgb('+base.map((v,i)=>Math.round(pale[i]*(1-a)+v*a)).join(',')+')'}
function displayRows(){const model=+$('ev-model').value,sort=$('ev-sort').value,filter=$('ev-filter').value;let list=rows.map(r=>({...r,pred:r.models[model],error:r.models[model]==null?null:r.models[model]-r.actual}));const all=list.slice();
if(filter==='polled')list=list.filter(r=>r.n);if(filter==='called')list=list.filter(r=>r.n&&r.called);if(filter==='wrong')list=list.filter(r=>r.n&&Math.sign(r.pred)!==Math.sign(r.actual));
const alpha=(a,b)=>a.state.localeCompare(b.state,'da');list.sort(sort==='alpha'?alpha:sort==='negative'?(a,b)=>(a.error??Infinity)-(b.error??Infinity)||alpha(a,b):sort==='close'?(a,b)=>Math.abs(a.actual)-Math.abs(b.actual)||alpha(a,b):(a,b)=>(b.error==null?-1:Math.abs(b.error))-(a.error==null?-1:Math.abs(a.error))||alpha(a,b));
$('ev-rows').innerHTML=list.map(r=>{const wrong=r.pred!=null&&Math.sign(r.pred)!==Math.sign(r.actual);return '<tr id="ev-state-'+r.state.replaceAll(' ','-')+'"><th scope="row">'+esc(r.state)+(r.called?'':' <span title="Valget er endnu ikke afgjort">*</span>')+'</th><td>'+r.n+'</td><td class="'+(r.actual>=0?'ev-blue':'ev-red')+'">'+fmt(r.actual)+'</td><td>'+fmt(r.pred)+'</td><td class="'+(r.error==null?'':r.error<0?'ev-neg':'ev-pos')+'">'+fmt(r.error)+'</td><td>'+(r.pred==null?'—':wrong?'<span class="ev-wrong">Forkert</span>':'Korrekt')+'</td></tr>'}).join('');
$('ev-table-caption').textContent=list.length+' delstater vist · negative fejl betyder undervurdering af D/I · * foreløbigt resultat.';
const svg='<svg viewBox="0 0 710 385" role="img" aria-label="Skematisk kort over 35 senatsvalg og deres prognosefejl">'+all.map(r=>{const xy=tiles[r.state];if(!xy)return '';const [col,row]=xy,x=12+col*52,y=10+row*52,color=mapColor(r.error);return '<g class="ev-map-tile" data-state="'+esc(r.state)+'" tabindex="0" role="button" aria-label="'+esc(r.state)+', fejl '+fmt(r.error)+' procentpoint"><title>'+esc(r.state)+' · '+(r.error==null?'Ingen målinger':fmt(r.error)+' pp')+'</title><rect x="'+x+'" y="'+y+'" width="46" height="46" rx="5" fill="'+color+'" stroke="#fff" stroke-width="2"/><text x="'+(x+23)+'" y="'+(y+28)+'" font-size="13" font-weight="700" text-anchor="middle" fill="'+(r.error!=null&&Math.abs(r.error)>7?'white':'#1e293b')+'">'+abbreviations[r.state]+'</text></g>'}).join('')+'</svg>';
$('ev-state-map').innerHTML=svg;
}
['ev-model','ev-sort','ev-filter'].forEach(id=>$(id).addEventListener('change',displayRows));
$('ev-half').addEventListener('input',radar);$('ev-compare').addEventListener('change',radar);
$('ev-state-map').addEventListener('click',e=>{const tile=e.target.closest('[data-state]');if(!tile)return;$('ev-filter').value='all';$('ev-sort').value='alpha';displayRows();document.getElementById('ev-state-'+tile.dataset.state.replaceAll(' ','-'))?.scrollIntoView({behavior:'smooth',block:'center'})});
$('ev-state-map').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){const tile=e.target.closest('[data-state]');if(tile){e.preventDefault();tile.dispatchEvent(new MouseEvent('click',{bubbles:true}))}}});
radar();displayRows();
const biggest=rows.filter(r=>r.n).map(r=>({state:r.state,error:r.models[1]-r.actual})).sort((a,b)=>a.error-b.error).slice(0,5);
$('ev-bias-bars').innerHTML=biggest.map(r=>'<div class="ev-bar-row ev-bias-row"><span>'+esc(r.state)+'</span><div class="ev-track"><div style="width:'+(Math.abs(r.error)/14*100).toFixed(1)+'%"></div></div><b>'+signed(r.error)+'</b></div>').join('');
const groups=[['1–3',1,3],['4–9',4,9],['10–24',10,24],['25+',25,1000]];
const grouped=groups.map(([label,min,max])=>{const a=rows.filter(r=>r.n>=min&&r.n<=max),errors=a.map(r=>r.models[1]-r.actual);return {label,n:a.length,mae:errors.reduce((sum,e)=>sum+Math.abs(e),0)/a.length,bias:errors.reduce((sum,e)=>sum+e,0)/a.length}});
const W=770,H=335,zero=172,scale=12.5,top=35,bottom=285;
let chart='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Lodret søjlediagram: gennemsnitlig absolut fejl og bias efter antal meningsmålinger. Bias kan være negativ.">';
for(const tick of [-8,-4,0,4,8]){const y=zero-tick*scale;chart+='<line x1="55" x2="755" y1="'+y+'" y2="'+y+'" stroke="'+(tick===0?'#45566b':'#d8e0e9')+'" stroke-width="'+(tick===0?2:1)+'"/><text x="44" y="'+(y+4)+'" text-anchor="end" font-size="12" fill="#526176">'+tick+'</text>'}
grouped.forEach((g,i)=>{const x=112+i*170,maeH=g.mae*scale,biasH=Math.abs(g.bias)*scale,biasY=g.bias>=0?zero-biasH:zero;
chart+='<rect x="'+x+'" y="'+(zero-maeH)+'" width="49" height="'+maeH+'" fill="#245b98"/><rect x="'+(x+54)+'" y="'+biasY+'" width="49" height="'+biasH+'" fill="#ad303a"/>';
chart+='<text x="'+(x+24)+'" y="'+(zero-maeH-7)+'" text-anchor="middle" font-size="13" font-weight="700" fill="#245b98">'+num(g.mae)+'</text>';
chart+='<text x="'+(x+78)+'" y="'+(g.bias<0?zero+biasH+17:zero-biasH-7)+'" text-anchor="middle" font-size="13" font-weight="700" fill="#ad303a">'+signed(g.bias)+'</text>';
chart+='<text x="'+(x+51)+'" y="310" text-anchor="middle" font-size="13" font-weight="700" fill="#273b50">'+g.label+' målinger</text><text x="'+(x+51)+'" y="326" text-anchor="middle" font-size="11" fill="#647081">'+g.n+' delstater</text>'});
chart+='</svg><div class="ev-chart-legend"><span><i style="background:#245b98"></i>MAE (fejlens størrelse)</span><span><i style="background:#ad303a"></i>Bias (fejlens retning)</span></div>';
$('ev-poll-count-chart').innerHTML=chart;
$('ev-correction-chart').innerHTML=[['Uden korrektion',5.94],['Med korrektion',4.86]].map(([label,value])=>'<div class="ev-bar-row"><span>'+label+'</span><div class="ev-track"><div style="width:'+(value/7*100)+'%;background:'+(value<5?'#245b98':'#a94651')+'"></div></div><b>'+num(value)+'</b></div>').join('');
})();
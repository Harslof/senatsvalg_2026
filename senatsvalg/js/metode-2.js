(function(){
const $=id=>document.getElementById(id);
if(!$('forecastPlot'))return;
const NS='http://www.w3.org/2000/svg';
const el=(tag,attrs,text)=>{const n=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs||{}))n.setAttribute(k,v);if(text!==undefined)n.textContent=text;return n;};
const fmt=(v,d=1)=>(v>0?'+':'')+v.toLocaleString('da-DK',{minimumFractionDigits:d,maximumFractionDigits:d});
const party=v=>v>0.00001?'D fører':v<-.00001?'R fører':'Uafgjort';
const observations=[-3,-2.6,-1.6,.1,2.6,5.8];
// Ordinary least squares on the same six observations as the two previous examples.
const linear=x=>1.7514285714285704*x+-4.16190476190476;
const quadratic=x=>0.3571428571428575*x*x+-0.03428571428571612*x+-2.97142857142857;
function drawGraph(){
const svg=$('forecastPlot');svg.replaceChildren();
const mode=$('methodModel').value,L=65,R=650,T=49,B=280,last=5,end=8;
const all=[...observations,...Array.from({length:161},(_,i)=>linear(end*i/160)),...Array.from({length:161},(_,i)=>quadratic(end*i/160))];
const min=Math.min(...all,0),max=Math.max(...all,0),pad=Math.max(1,(max-min)*.10),ymin=min-pad,ymax=max+pad;
const xx=x=>L+(x/end)*(R-L),yy=y=>B-(y-ymin)/(ymax-ymin)*(B-T);
svg.append(el('rect',{x:xx(last),y:T,width:R-xx(last),height:B-T,fill:'#3478c8',opacity:'.07'}));
for(let i=0;i<=5;i++){const v=ymin+(ymax-ymin)*i/5,y=yy(v);svg.append(el('line',{x1:L,x2:R,y1:y,y2:y,stroke:'#dce5ef'}));svg.append(el('text',{x:L-9,y:y+4,'text-anchor':'end','font-size':12,fill:'#64748b'},v.toFixed(1).replace('.',',')));}
svg.append(el('line',{x1:L,x2:R,y1:yy(0),y2:yy(0),stroke:'#8394a8','stroke-width':1.5}));
svg.append(el('line',{x1:L,x2:L,y1:T,y2:B,stroke:'#94a3b8'}));svg.append(el('line',{x1:L,x2:R,y1:B,y2:B,stroke:'#94a3b8'}));
svg.append(el('line',{x1:xx(last),x2:xx(last),y1:T,y2:B,stroke:'#253e60','stroke-dasharray':'5 5','stroke-width':2}));
svg.append(el('text',{x:L,y:18,'font-size':13,fill:'#52657c'},'Margin (pp)'));
svg.append(el('text',{x:xx(last),'text-anchor':'middle',y:34,'font-size':12,fill:'#253e60','font-weight':600},'Seneste måling'));
svg.append(el('text',{x:(xx(last)+R)/2,'text-anchor':'middle',y:58,'font-size':12,fill:'#3478c8'},'Fremskrivning →'));
for(const [x,label] of [[0,'Uge 0'],[5,'Uge 5'],[8,'Valgdag']])svg.append(el('text',{x:xx(x),y:301,'text-anchor':'middle','font-size':12,fill:'#64748b'},label));
svg.append(el('text',{x:R,y:319,'text-anchor':'end','font-size':11,fill:'#64748b'},'Illustrativt: 3 uger efter sidste måling'));
function path(fn,x0,x1,color,dashed){const N=100,d=Array.from({length:N+1},(_,i)=>{const x=x0+(x1-x0)*i/N;return (i?'L':'M')+xx(x).toFixed(2)+','+yy(fn(x)).toFixed(2)}).join(' ');svg.append(el('path',{d,fill:'none',stroke:color,'stroke-width':dashed?3:3.5,...(dashed?{'stroke-dasharray':'8 6'}:{})}));}
if(mode==='both'||mode==='linear'){path(linear,0,last,'#929292',false);path(linear,last,end,'#929292',true);}
if(mode==='both'||mode==='accel'){path(quadratic,0,last,'#3478c8',false);path(quadratic,last,end,'#3478c8',true);}
observations.forEach((y,x)=>svg.append(el('circle',{cx:xx(x),cy:yy(y),r:5.5,fill:'#3478c8',stroke:'white','stroke-width':1.8})));
}
function updateCalculator(){const m=+$('mInput').value,t=+$('tInput').value,a=+$('aInput').value,w=+$('wInput').value;
$('mVal').textContent=fmt(m)+' pp';$('tVal').textContent=fmt(t)+' pp/uge';$('aVal').textContent=fmt(a,2)+' pp/uge²';$('wVal').textContent=w+' uger';
const lin=m+t*w,accel=lin+.5*a*w*w;
$('linearResult').textContent=fmt(lin)+' pp';$('accelResult').textContent=fmt(accel)+' pp';$('linearParty').textContent=party(lin);$('accelParty').textContent=party(accel);
$('forecastExplain').textContent=`Fra den seneste måling bidrager trenden med ${fmt(t*w)} procentpoint over ${w} uger. Accelerationen lægger yderligere ${fmt(.5*a*w*w)} procentpoint til eller trækker det fra.`;
}
$('methodModel').addEventListener('change',drawGraph);
['mInput','tInput','aInput','wInput'].forEach(id=>$(id).addEventListener('input',updateCalculator));
drawGraph();updateCalculator();
})();
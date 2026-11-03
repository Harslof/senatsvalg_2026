/* Valgnatten 2026: countdowns in Danish local time (CET, UTC+1). */
(()=>{
 'use strict';
 const root=document.getElementById('exitpole-countdown');
 const label=document.getElementById('exitpole-countdown-label');
 const value=document.getElementById('exitpole-countdown-value');
 if(!root||!label||!value)return;
 const first=Date.parse('2026-11-03T23:00:00+01:00');
 const resume=Date.parse('2026-11-03T23:25:00+01:00');
 const second=Date.parse('2026-11-04T07:00:00+01:00');
 const two=n=>String(n).padStart(2,'0');
 function tick(){
  const now=Date.now();
  root.classList.toggle('exitpole-live',now>=first&&now<resume);
  if(now>=first&&now<resume){
   label.textContent='KL. 23.00 – 23.25';
   value.textContent='EXITPOLE';
   return;
  }
  if(now>=second){
   label.textContent='NEDTÆLLINGEN ER SLUT';
   value.textContent='07.00';
   return;
  }
  const target=now<first?first:second;
  label.textContent=now<first?'NEDTÆLLING TIL KL. 23.00':'NEDTÆLLING TIL KL. 07.00';
  const remaining=Math.max(0,Math.ceil((target-now)/1000));
  const h=Math.floor(remaining/3600),m=Math.floor(remaining%3600/60),s=remaining%60;
  value.textContent=two(h)+':'+two(m)+':'+two(s);
 }
 tick();
 setInterval(tick,1000);
})();

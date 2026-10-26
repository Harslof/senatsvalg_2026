/* Centraliseret visning af nye målinger og ændringer. Retning er numerisk, ikke partipolitisk. */
(()=>{'use strict';
const active=()=>Date.now()>=UPDATE_AT&&Date.now()<UPDATE_AT+48*3600*1000;
let flash=false;
try{if(active()&&!localStorage.getItem(UPDATE_KEY)){flash=true;localStorage.setItem(UPDATE_KEY,'seen')}}catch(_){}
const differs=(a,b)=>a==null||b==null?a!==b:Math.abs(a-b)>1e-8;
const attr=s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
const mark=(changed,title='Ny måling eller ændring')=>active()&&changed?`<span class="update-mark${flash?' update-flash':''}" title="${attr(title)}" aria-label="${attr(title)}"></span>`:'';
const change=(now,before,title='Ændring efter nye målinger')=>{
 if(!active()||!differs(now,before))return '';
 if(!Number.isFinite(now)||!Number.isFinite(before))return mark(true,title);
 const up=now>before,delta=now-before;
 const label=`${title}: ${up?'steget':'faldet'} med ${Math.abs(delta).toLocaleString('da-DK',{maximumFractionDigits:2})}`;
 return `<span class="update-arrow ${up?'update-up':'update-down'}${flash?' update-flash':''}" title="${attr(label)}" aria-label="${attr(label)}">${up?'↑':'↓'}</span>`;
};
window.SenateUpdateUI=Object.freeze({active,mark,change,differs});
})();

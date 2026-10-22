/* Fælles roterende projektnavn for alle sider. */
(()=>{
  'use strict';
  const names=['Kontur','Zeitbild','The Plot','Écart','Pejling','Tendens','Flux'];
  const interval=10500;
  const brand=document.querySelector('.rotating-brand');
  if(!brand)return;
  const footer=document.getElementById('footer-brand');
  const suffix=document.body.dataset.brandTitleSuffix;
  const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Samme tilfældige starttitel på tværs af projektets sider i samme fane.
  let origin;
  let start;
  try{
    origin=Number(sessionStorage.getItem('projectBrandOrigin'));
    start=Number(sessionStorage.getItem('projectBrandStart'));
    if(!origin||!Number.isInteger(start)||start<0||start>=names.length)throw Error('no session');
  }catch(_){
    origin=Date.now();
    start=Math.floor(Math.random()*names.length);
    try{sessionStorage.setItem('projectBrandOrigin',String(origin));sessionStorage.setItem('projectBrandStart',String(start));}catch(_){}
  }
  const show=()=>{
    const elapsed=reduceMotion?0:Math.floor(Math.max(0,Date.now()-origin)/interval);
    const name=names[(start+elapsed)%names.length];
    brand.textContent=name;
    if(footer)footer.textContent=name;
    if(suffix)document.title=name+' · '+suffix;
  };
  show();
  if(!reduceMotion)window.setInterval(show,interval);
})();

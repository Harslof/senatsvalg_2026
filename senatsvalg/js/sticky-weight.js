/* Floating weighting/model selector for main and methodology pages. */
(()=>{
'use strict';
const pill=document.getElementById('stickyWeight'),model=window.SenateForecastExperiment;
if(!pill||!model)return;
const section=document.getElementById('weightingSection');
const weights=[...document.querySelectorAll('input[name="weight"]')];
const models=[...document.querySelectorAll('input[name="forecastmodel"]')];
const originalHalf=document.getElementById('half');
const floatingHalf=document.getElementById('stickyHalf');
const halfText=document.getElementById('stickyHalfText');
const halfRow=document.getElementById('stickyHalfRow');
const note=document.getElementById('stickyModelNote');
const methodNote=document.getElementById('methodModelChoiceDescription');
function sync(){
 const prefs=model.settings();
 const weight=weights.find(r=>r.checked)?.value||(prefs.weighted?'time':'equal');
 const variant=models.find(r=>r.checked)?.value||prefs.variant;
 const half=originalHalf?Number(originalHalf.value):prefs.half;
 pill.querySelectorAll('[data-weight]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.weight===weight)));
 pill.querySelectorAll('[data-model]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.model===variant)));
 halfRow.hidden=weight!=='time';floatingHalf.value=half;
 halfText.textContent=half+' '+(half===1?'uge':'uger');
 const message=variant==='experimental'?'Forsøgsmodel: huseffektkorrektion og historisk dæmpet acceleration. Under afprøvning.':'Oprindelig model: eksisterende målings- og sandsynlighedsmodel.';
 note.textContent=message;
 if(methodNote)methodNote.textContent=message+' Indstillingerne deles med hovedhjemmesiden og præsentationen.';
}
function change(list,value,key,transform){
 const radio=list.find(r=>r.value===value);
 if(radio){if(!radio.checked){radio.checked=true;radio.dispatchEvent(new Event('change',{bubbles:true}));}}
 else model.set({[key]:transform(value)});
 sync();
}
pill.querySelectorAll('[data-weight]').forEach(b=>b.addEventListener('click',()=>change(weights,b.dataset.weight,'weighted',v=>v==='time')));
pill.querySelectorAll('[data-model]').forEach(b=>b.addEventListener('click',()=>change(models,b.dataset.model,'variant',v=>v)));
floatingHalf.addEventListener('input',()=>{
 if(originalHalf){originalHalf.value=floatingHalf.value;originalHalf.dispatchEvent(new Event('input',{bubbles:true}));}
 else model.set({half:Number(floatingHalf.value)});
 sync();
});
[...weights,...models].forEach(el=>el.addEventListener('change',sync));
originalHalf?.addEventListener('input',sync);
window.addEventListener('storage',e=>{if(e.key==='senat-model-settings-v1')sync()});
function position(){
 const show=!section||section.getBoundingClientRect().bottom<0;
 if(show&&pill.hidden){pill.hidden=false;pill.classList.remove('sticky-weight-enter');void pill.offsetWidth;pill.classList.add('sticky-weight-enter');}
 else if(!show&&!pill.hidden){pill.hidden=true;pill.classList.remove('sticky-weight-enter');}
}
window.addEventListener('scroll',position,{passive:true});
window.addEventListener('resize',position,{passive:true});
sync();position();
})();
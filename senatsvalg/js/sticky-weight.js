(function(){
  'use strict';
  const section=document.getElementById('weightingSection');
  const pill=document.getElementById('stickyWeight');
  const originalHalf=document.getElementById('half');
  const floatingHalf=document.getElementById('stickyHalf');
  const halfText=document.getElementById('stickyHalfText');
  const halfRow=document.getElementById('stickyHalfRow');
  const choices=[...pill.querySelectorAll('[data-weight]')];
  const radios=[...document.querySelectorAll('input[name="weight"]')];
  if(!section||!pill||!originalHalf||!floatingHalf||radios.length!==2)return;
  // The original controls remain the only source of truth for every model calculation.
  floatingHalf.min=originalHalf.min;floatingHalf.max=originalHalf.max;floatingHalf.step=originalHalf.step||'1';
  function sync(){
    const selected=radios.find(r=>r.checked)?.value||'equal';
    choices.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.weight===selected)));
    halfRow.hidden=selected!=='time';
    floatingHalf.value=originalHalf.value;
    const n=Number(originalHalf.value);halfText.textContent=n+' '+(n===1?'uge':'uger');
  }
  choices.forEach(b=>b.addEventListener('click',()=>{
    const radio=radios.find(r=>r.value===b.dataset.weight);
    if(!radio)return;
    if(!radio.checked){radio.checked=true;radio.dispatchEvent(new Event('change',{bubbles:true}));}
    sync();
  }));
  floatingHalf.addEventListener('input',()=>{
    originalHalf.value=floatingHalf.value;
    originalHalf.dispatchEvent(new Event('input',{bubbles:true}));
    sync();
  });
  radios.forEach(r=>r.addEventListener('change',sync));
  originalHalf.addEventListener('input',sync);
  function position(){
    // Only appear after the entire weighting section has scrolled above the viewport.
    const passed=section.getBoundingClientRect().bottom<0;
    if(passed && pill.hidden){
      pill.hidden=false;
      // Restart the entrance animation each time the menu reappears.
      pill.classList.remove('sticky-weight-enter');
      void pill.offsetWidth;
      pill.classList.add('sticky-weight-enter');
    } else if(!passed && !pill.hidden){
      pill.hidden=true;
      pill.classList.remove('sticky-weight-enter');
    }
  }
  window.addEventListener('scroll',position,{passive:true});
  window.addEventListener('resize',position,{passive:true});
  sync();position();
})();

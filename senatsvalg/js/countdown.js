
/* Live nedtælling til 3. november 2026 kl. 00.00 i New York (EST). */
(function(){
 const election=Date.parse('2026-11-03T00:00:00-05:00');
 const ids=['cdDays','cdHours','cdMinutes','cdSeconds'];
 const els=ids.map(id=>document.getElementById(id));
 if(els.some(el=>!el))return;
 function updateElectionCountdown(){
  let secs=Math.max(0,Math.floor((election-Date.now())/1000));
  const vals=[Math.floor(secs/86400),Math.floor(secs%86400/3600),Math.floor(secs%3600/60),secs%60];
  vals.forEach((n,i)=>els[i].textContent=i===0?String(n):String(n).padStart(2,'0'));
 }
 updateElectionCountdown();
 setInterval(updateElectionCountdown,1000);
})();

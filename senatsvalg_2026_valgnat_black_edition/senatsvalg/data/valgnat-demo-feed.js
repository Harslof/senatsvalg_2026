/* Fiktiv exitpoll – kun aktiveret via ?demo=1. Må aldrig anvendes som faktiske valgdata. */
if(new URLSearchParams(location.search).get('demo')==='1'&&window.VALGNAT_FEED){window.VALGNAT_FEED={...window.VALGNAT_FEED,updatedAt:'DEMO – FIKTIVE DATA',exits:{...window.VALGNAT_FEED.exits,Ohio:{margin:-5,source:'DEMO: fiktiv Ohio-exitpoll',time:'2026-11-04T01:45'}}};}

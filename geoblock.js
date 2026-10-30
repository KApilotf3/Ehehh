// GEOBLOCK: enabled=true включает блокировку; countries — коды стран (ISO), failOpen=true пускает, если страну определить не удалось
const GEOBLOCK={enabled:true,countries:['KG','KZ','RU'],failOpen:true};
async function geoCountry(){
 const src=[['https://api.country.is/',j=>j.country],['https://ipwho.is/',j=>j.country_code],['https://ipapi.co/json/',j=>j.country_code]];
 for(const [u,f] of src){try{const r=await fetch(u,{cache:'no-store'});const j=await r.json();const c=f(j);if(c)return String(c).toUpperCase();}catch(e){}}
 return null;}
async function geoCheck(){
 const b=document.body,g=document.getElementById('geo'),s=document.getElementById('gs');
 if(!GEOBLOCK.enabled){b.classList.remove('geo-checking','geo-locked');return;}
 if(s)s.textContent='Проверяю…';
 const c=await geoCountry();
 const blocked=c?GEOBLOCK.countries.includes(c):!GEOBLOCK.failOpen;
 g.classList.toggle('on',blocked);b.classList.remove('geo-checking');b.classList.toggle('geo-locked',blocked);
 if(blocked){document.getElementById('gc').textContent=c?' ('+c+')':'';if(s)s.textContent=c?'Определена страна: '+c:'Не удалось определить страну';}
}
geoCheck();
geoCheck();

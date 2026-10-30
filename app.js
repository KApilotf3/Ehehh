const $=id=>document.getElementById(id);
let cur=null,hist=[];
function home(){cur=null;const t=$('q').value.toLowerCase().trim();
 const l=D.filter(c=>!t||c[0].toLowerCase().includes(t)||c[1].toLowerCase().includes(t));
 $('view').innerHTML='<h2>Страны и столицы</h2><div class="grid">'+(l.map(c=>`<div class="item" onclick="open_('${c[0]}')"><b>${c[0]}</b><span>Столица: ${c[1]}</span></div>`).join('')||'Ничего не найдено')+'</div>';chips();}
function open_(n){const c=D.find(x=>x[0]===n);cur=c;
 const same=D.filter(x=>x[2]===c[2]&&x[0]!==n);
 $('view').innerHTML=`<h2>${c[0]}</h2><p>${c[4]}</p><table><tr><td>Столица</td><td>${c[1]}</td></tr><tr><td>Регион</td><td>${c[2]}</td></tr><tr><td>Население</td><td>≈ ${c[3]} млн</td></tr></table><p><b>См. также:</b> ${same.map(x=>`<a onclick="open_('${x[0]}')">${x[0]}</a>`).join(', ')||'—'}</p><a onclick="$('q').value='';home()">← Все страны</a>`;
 scrollTo(0,0);chips();}
function chips(){const s=cur?[`Какая столица у страны ${cur[0]}?`,`Расскажи интересные факты о ${cur[0]}`,`Сравни ${cur[0]} с соседями`]:['Какая столица у Австралии?','Какая страна самая населённая?','Какие страны в Азии есть в вики?'];
 $('chips').innerHTML=s.map(x=>`<span class="chip" onclick="$('ask').value=this.textContent;send()">${x}</span>`).join('');}
function add(t,c){const d=document.createElement('div');d.className='m '+c;d.textContent=t;$('chat').appendChild(d);$('chat').scrollTop=1e9;return d;}
function saveKey(){const k=$('key').value.trim();if(k){localStorage.setItem('akey',k);$('key').value='';}ks();}
async function testKey(){const k=localStorage.getItem('akey');if(!k){$('ks').textContent='Сначала вставьте ключ и нажмите «Сохранить»';return;}$('ks').textContent='Проверяю…';try{await gem(k,'Отвечай одним словом.','Скажи: работает');$('ks').textContent='✅ Ключ работает, вопросы идут в ваш ИИ';}catch(e){$('ks').textContent='❌ '+(e.name==='TypeError'?'Нет связи с Google API. Проверьте интернет.':e.message);}}
function ks(){$('ks').textContent=localStorage.getItem('akey')?'✅ Ключ сохранён — вопросы идут в ваш ИИ (нажмите «Проверить»)':'Ключ не обязателен: без него помощник отвечает по базе вики попроще';}
const ctx=()=>'База вики (страна | столица | регион | население млн):\n'+D.map(c=>c.slice(0,4).join(' | ')).join('\n');
async function ai(sys,user){
 const k=localStorage.getItem('akey');
 if(!k)return null;
 try{return await gem(k,sys,user)}
 catch(e){throw e.name==='TypeError'?new Error('Нет связи с Google API. Проверьте интернет.'):e}}
async function gem(k,sys,user){
 let le;for(const m of ['gemini-flash-latest','gemini-2.5-flash','gemini-2.5-flash-lite','gemini-flash-lite-latest']){for(let t=0;t<2;t++){try{return await gem1(k,sys,user,m)}catch(e){le=e;if(e.name==='TypeError'||!/demand|overload|unavailable|quota|exhaust|try again|not found/i.test(e.message))throw e;await new Promise(r=>setTimeout(r,1200));}}}
 throw le;}
async function gem1(k,sys,user,m){
 const r=await fetch('https://generativelanguage.googleapis.com/v1beta/models/'+m+':generateContent',{method:'POST',headers:{'content-type':'application/json','x-goog-api-key':k},body:JSON.stringify({systemInstruction:{parts:[{text:sys}]},contents:[{role:'user',parts:[{text:user}]}],generationConfig:{maxOutputTokens:1000}})});
 const j=await r.json();if(!r.ok)throw new Error(j.error?.message||'Ошибка API');
 return (j.candidates?.[0]?.content?.parts||[]).map(x=>x.text||'').join('');}
const SYS='Ты помощник мини-вики о странах и столицах. Отвечай по-русски, коротко, опираясь на базу ниже; если данных нет — скажи и ответь из общих знаний, пометив это.\n';
function local(q){const t=q.toLowerCase();
 for(const c of D){if(t.includes(c[0].toLowerCase()))return `${c[0]}: столица — ${c[1]}, регион — ${c[2]}, население ≈ ${c[3]} млн. ${c[4]}`;
  if(t.includes(c[1].toLowerCase()))return `${c[1]} — столица страны ${c[0]}.`;}
 if(t.includes('населён')){const m=[...D].sort((a,b)=>b[3]-a[3])[0];return `Самая населённая в базе: ${m[0]} (≈ ${m[3]} млн).`;}
 return 'В базе не нашёл ответа. Попробуйте ещё раз через минуту.';}
async function ask(q){const th=add('Думаю…','a');
 try{const a=await ai(SYS+ctx()+(cur?`\nСейчас открыта статья: ${cur[0]}.`:''),q);th.textContent=a??local(q);}
 catch(e){th.textContent='⚠️ '+e.message+'\n\nПростой ответ: '+local(q);}
 return th.textContent;}
async function send(){const q=$('ask').value.trim();if(!q)return;$('ask').value='';add(q,'u');await ask(q);}
async function suggest(){const th=add('Подбираю промпты…','a');
 try{const a=await ai('Придумай 5 коротких интересных вопросов для мини-вики о странах и столицах'+(cur?`, по теме «${cur[0]}»`:'')+'. Только список, по одному вопросу в строке, без нумерации.\n'+ctx(),'Дай вопросы');
  const l=(a||'').split('\n').map(s=>s.replace(/^[-•\d.\s]+/,'').trim()).filter(Boolean);
  th.textContent='Подобрал вопросы — нажмите на любой выше.';if(a)$('chips').innerHTML=l.map(x=>`<span class="chip" onclick="$('ask').value=this.textContent;send()">${x}</span>`).join('');
  else th.textContent='Нужен API-ключ для умного подбора промптов.';}
 catch(e){th.textContent='⚠️ '+e.message;}}
async function auto(){ const th=add('Авто-режим: придумываю вопросы…','a');
 try{const a=await ai('Придумай 3 разных вопроса по базе вики'+(cur?` про ${cur[0]}`:'')+'. Только вопросы, по одному в строке.\n'+ctx(),'Вопросы');
  th.remove();for(const q of a.split('\n').map(s=>s.replace(/^[-•\d.\s]+/,'').trim()).filter(Boolean).slice(0,3)){add(q,'u');await ask(q);}}
 catch(e){th.textContent='⚠️ '+e.message;}}
ks();home();

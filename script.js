const saveBtn=document.getElementById('saveTabs');
const input=document.getElementById('fileInput');
const drop=document.getElementById('drop');
const list=document.getElementById('tabsList');
const countEl=document.getElementById('count');
const nameEl=document.getElementById('name');
const q=document.getElementById('q');
const tq=document.getElementById('tq');
const sortSel=document.getElementById('sort');
const selectAllBtn=document.getElementById('selectAll');
const clearSelBtn=document.getElementById('clearSel');
const removeSelBtn=document.getElementById('removeSel');
const openSelBtn=document.getElementById('openSel');
const openAllBtn=document.getElementById('openAll');
const newWinChk=document.getElementById('newWin');
const copyBtn=document.getElementById('copyBtn');
const tagAdd=document.getElementById('tagAdd');
const addTag=document.getElementById('addTag');

let data=[];let metaName='';

function ts(){const d=new Date();const p=n=>String(n).padStart(2,'0');return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}_${p(d.getHours())}-${p(d.getMinutes())}`}
function setCount(n){countEl.textContent=n?`${n} items`:''}
function rowEl(i,item){const url=item.url,title=item.title||item.url,domain=item.domain||(()=>{try{return new URL(item.url).hostname}catch{return ''}})();const li=document.createElement('li');li.className='row';const chk=document.createElement('input');chk.type='checkbox';chk.dataset.idx=i;li.appendChild(chk);const fav=document.createElement('img');fav.className='fav';let host='';try{host=new URL(url).hostname}catch{}fav.referrerPolicy='no-referrer';fav.src=host?`https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=16`:'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';li.appendChild(fav);const a=document.createElement('a');a.className='link';a.href='#';a.textContent=title;a.title=url;a.addEventListener('click',()=>{chrome.tabs.create({url,pinned:!!item.pinned});a.classList.add('opened')});li.appendChild(a);const meta=document.createElement('div');meta.className='muted';meta.textContent=domain;li.appendChild(meta);const tags=document.createElement('div');tags.className='tags';tags.textContent=(item.tags||[]).join(', ');li.appendChild(tags);return li}
function render(arr){list.innerHTML='';arr.forEach((it,i)=>list.appendChild(rowEl(i,it)));setCount(arr.length)}
function normalize(arr){return arr.map(u=>typeof u==='string'?{url:u}:{url:u.url,title:u.title,domain:u.domain,pinned:!!u.pinned,tags:Array.isArray(u.tags)?u.tags:[],date:u.date||Date.now()})}
function dedupe(arr){const seen=new Set();const out=[];for(const it of arr){if(!it||!it.url)continue;const k=it.url.trim();if(!k||seen.has(k))continue;seen.add(k);out.push(it)}return out}
function filtered(){let arr=[...data];const qq=q.value.trim().toLowerCase();const tqv=tq.value.trim().toLowerCase();if(qq){arr=arr.filter(it=>`${it.title||''} ${it.url||''} ${it.domain||''}`.toLowerCase().includes(qq))}if(tqv){arr=arr.filter(it=>(it.tags||[]).some(t=>t.toLowerCase().includes(tqv)))}const s=sortSel.value;if(s==='title'){arr.sort((a,b)=>String(a.title||'').localeCompare(b.title||''))}else if(s==='domain'){arr.sort((a,b)=>String(a.domain||'').localeCompare(b.domain||''))}else if(s==='url'){arr.sort((a,b)=>String(a.url||'').localeCompare(b.url||''))}else if(s==='date'){arr.sort((a,b)=>Number(b.date||0)-Number(a.date||0))}return arr}
function refresh(){render(filtered())}

saveBtn.addEventListener('click',()=>{
  chrome.tabs.query({},tabs=>{
    const items=tabs.filter(t=>t.url&&!t.url.startsWith('chrome-extension://')).map(t=>({url:t.url,title:t.title,domain:(()=>{try{return new URL(t.url).hostname}catch{return ''}})(),pinned:!!t.pinned,tags:[],date:Date.now()}));
    data=dedupe(normalize(items));
    metaName=nameEl.value.trim()||'';const filename=`tabs_${ts()}.json`;
    const payload={name:metaName||undefined,createdAt:Date.now(),items:data};
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
    const u=URL.createObjectURL(blob);const a=document.createElement('a');a.href=u;a.download=filename;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(u);refresh()
  })
});

// Read a single file as text (Promise)
function readFileAsText(file){
  return new Promise((resolve,reject)=>{
    const r=new FileReader();
    r.onload=e=>resolve(e.target.result);
    r.onerror=reject;
    r.readAsText(file);
  });
}

// Handle multiple files: merge all items and refresh once
async function handleFiles(files){
  const fs=Array.from(files||[]).filter(f=>/\.json$/i.test(f.name)||f.type==="application/json");
  if(!fs.length) return;
  try{
    const texts=await Promise.all(fs.map(readFileAsText));
    let merged=[];
    for(const txt of texts){
      try{
        const j=JSON.parse(txt);
        const items=Array.isArray(j)?j:(Array.isArray(j.items)?j.items:[]);
        merged=merged.concat(items||[]);
      }catch{ /* skip invalid */ }
    }
    merged=dedupe(normalize(merged));
    data=dedupe(normalize(merged.concat(data)));
    refresh();
  }catch{ /* ignore */ }
}

input.addEventListener('change',e=>handleFiles(e.target.files));
;['dragenter','dragover'].forEach(t=>drop.addEventListener(t,e=>{e.preventDefault();drop.classList.add('drag')}));
;['dragleave','drop'].forEach(t=>drop.addEventListener(t,e=>{e.preventDefault();drop.classList.remove('drag')}));
// Support dropping multiple files
drop.addEventListener('drop',e=>{handleFiles(e.dataTransfer.files)});

q.addEventListener('input',refresh);tq.addEventListener('input',refresh);sortSel.addEventListener('change',refresh);
selectAllBtn.addEventListener('click',()=>{list.querySelectorAll('input[type=checkbox]').forEach(c=>c.checked=true)});
clearSelBtn.addEventListener('click',()=>{list.querySelectorAll('input[type=checkbox]').forEach(c=>c.checked=false)});
removeSelBtn.addEventListener('click',()=>{const idxs=[...list.querySelectorAll('input[type=checkbox]')].map((c,i)=>c.checked?i:-1).filter(i=>i>-1);const arr=filtered();const rem=new Set(arr.filter((_,i)=>idxs.includes(i)));data=data.filter(it=>!rem.has(it));refresh()});

const winCreate=o=>new Promise(r=>chrome.windows.create(o,r));
const tabCreate=o=>new Promise(r=>chrome.tabs.create(o,r));
async function openBatch(items){const delay=ms=>new Promise(r=>setTimeout(r,ms));let winId=null;if(newWinChk.checked){const w=await winCreate({});winId=w.id}for(const u of items){await tabCreate({url:u.url,pinned:!!u.pinned,windowId:winId||undefined});await delay(120)}}
openSelBtn.addEventListener('click',()=>{const idxs=[...list.querySelectorAll('input[type=checkbox]')].map((c,i)=>c.checked?i:-1).filter(i=>i>-1);const arr=filtered().filter((_,i)=>idxs.includes(i));openBatch(arr)});
openAllBtn.addEventListener('click',()=>{openBatch(filtered())});

copyBtn.addEventListener('click',async()=>{const urls=filtered().map(it=>it.url).join('\n');await navigator.clipboard.writeText(urls)});
addTag.addEventListener('click',()=>{const t=tagAdd.value.trim();if(!t)return;const idxs=[...list.querySelectorAll('input[type=checkbox]')].map((c,i)=>c.checked?i:-1).filter(i=>i>-1);const arr=filtered();arr.forEach((it,i)=>{if(idxs.includes(i)){it.tags=Array.from(new Set([...(it.tags||[]),t]))}});refresh()});

chrome.runtime.onMessage.addListener((msg)=>{
  if(msg.type==='SAVE_ALL'){saveBtn.click()}
  if(msg.type==='SAVE_SINGLE'&&msg.url){const it={url:msg.url,title:msg.title||msg.url,domain:(()=>{try{return new URL(msg.url).hostname}catch{return ''}})(),pinned:false,tags:[],date:Date.now()};data=dedupe(normalize([it].concat(data)));refresh()}
  if(msg.type==='SAVE_DOMAIN'&&msg.domain){chrome.tabs.query({},tabs=>{const items=tabs.filter(t=>{try{return new URL(t.url).hostname===msg.domain}catch{return false}}).map(t=>({url:t.url,title:t.title,domain:msg.domain,pinned:!!t.pinned,tags:[],date:Date.now()}));data=dedupe(normalize(items.concat(data)));refresh()})}
});

setCount(0);
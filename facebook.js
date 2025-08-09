// == FB Auto-Unfollow (target: "Batal mengikuti") + logging (maks 300) ==
const OPTIONS = {
  delayMs: 3500,
  openDelayMs: 600,
  maxActions: 300,
  autoScroll: true,
  scrollStep: 1400
};

window.__unfollowStopFlag = false;
window.stopUnfollow = () => { window.__unfollowStopFlag = true; console.warn(">> STOP diminta"); };

const LogStore = { rows: [], startedAt: new Date(),
  push(r){ this.rows.push(r); },
  print(){
    console.table(this.rows.map(r=>({ '#':r.index, Name:r.name||'(?)', URL:r.url||'', Status:r.status, Reason:r.reason||'' })));
    const ok = this.rows.filter(r=>r.status==='OK').length, fail=this.rows.length-ok;
    console.log(`Selesai. OK: ${ok}, Gagal: ${fail}.`);
  }
};

function wait(ms){ return new Promise(r=>setTimeout(r,ms)); }
function txt(el){ return (el?.innerText||el?.textContent||"").trim(); }
function qsa(sel,root=document){ return [...root.querySelectorAll(sel)]; }
function inViewport(el){ const r=el.getBoundingClientRect(); return r.top<innerHeight && r.bottom>0; }

// Tutup semua popover/menu yang mungkin masih kebuka
function closeOpenMenus(){
  document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
  qsa('[role="menu"], [aria-modal="true"]').forEach(m => m.style.display='none'); // hint
}

function parseNameFromAria(el){
  const al = el.getAttribute('aria-label')||'';
  let m = al.match(/untuk\s+(.+?)\s*$/i) || al.match(/for\s+(.+?)\s*$/i);
  return m ? m[1].trim() : '';
}

function profileLinkNear(el){
  let n=el; for(let i=0;i<6 && n && n.parentElement;i++) n=n.parentElement;
  const scope = n||document;
  const a = scope.querySelector('a[role="link"][tabindex]:not([tabindex="-1"])') ||
            scope.querySelector('a[href*="facebook.com"][role="link"]') ||
            scope.querySelector('a[href*="facebook.com"]');
  return a?.href || '';
}

function getOptionButtons(){
  // tombol titik-tiga “Opsi lainnya untuk …”
  return qsa('[aria-label^="Opsi lainnya untuk"], [aria-label^="More options for"], [aria-label^="Options for"]').filter(b=>!b.dataset._done);
}

function findUnfollowItem(){
  // Tambahkan semua variasi teks yang mungkin
  const re = /^(Batal mengikuti|Berhenti Mengikuti|Berhenti mengikuti|Tak lagi mengikuti|Unfollow|Dejar de seguir|Ne plus suivre|Nicht mehr folgen)$/i;
  const candidates = qsa('[role="menuitem"], [role="button"], button, div[role="menuitem"]');
  return candidates.find(n => re.test(txt(n)));
}

async function doUnfollowOnce(index){
  // Pastikan menu lama ketutup
  closeOpenMenus();

  let btn = getOptionButtons().find(inViewport) || getOptionButtons()[0];
  if(!btn){
    if(OPTIONS.autoScroll) window.scrollBy({top:OPTIONS.scrollStep,behavior:'smooth'});
    return {ok:false,reason:'NoOptionButton'};
  }
  btn.dataset._done = "1";
  btn.scrollIntoView({block:'center'});

  const name = parseNameFromAria(btn) || '';
  const url  = profileLinkNear(btn);

  btn.click();
  await wait(OPTIONS.openDelayMs);

  let item = findUnfollowItem();
  if(!item){
    // kadang menu belum render penuh
    await wait(400);
    item = findUnfollowItem();
  }
  if(!item) return {ok:false,reason:'NoUnfollowItem',meta:{name,url}};

  item.click();

  // jika ada dialog konfirmasi kedua, klik juga
  await wait(400);
  const again = findUnfollowItem();
  if(again) again.click();

  // tutup menu sisa lalu lanjut
  closeOpenMenus();
  return {ok:true,meta:{name,url}};
}

async function run(){
  console.clear();
  console.log("== Auto-Unfollow: mencari item 'Batal mengikuti' ==");
  console.log("Ketik stopUnfollow() untuk berhenti");

  for(let i=1;i<=OPTIONS.maxActions;i++){
    if(window.__unfollowStopFlag) break;
    const res = await doUnfollowOnce(i);
    if(res.ok){
      LogStore.push({index:i,name:res.meta.name,url:res.meta.url,status:'OK'});
      console.log(`[#${i}] ✅ UNFOLLOW: ${res.meta.name||'(nama tidak terbaca)'} ${res.meta.url?`→ ${res.meta.url}`:''}`);
    }else{
      LogStore.push({index:i,name:res.meta?.name,url:res.meta?.url,status:'FAIL',reason:res.reason});
      console.warn(`[#${i}] ❌ GAGAL (${res.reason}) ${res.meta?.name?'- '+res.meta.name:''}`);
      if(res.reason==='NoOptionButton' && OPTIONS.autoScroll) window.scrollBy({top:OPTIONS.scrollStep,behavior:'smooth'});
    }
    await wait(OPTIONS.delayMs);
  }
  LogStore.print();
}
run();

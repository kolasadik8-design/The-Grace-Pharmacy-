// The Grace Pharmacy - V18.2.1 - Returns Addon - Firebase - Part of V18.2.1 - Not a new version
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, setDoc, doc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = { apiKey: "AIzaSyD14R3WMA_x_r5AaUQismNciaiLQFowgMc", authDomain: "the-grace-78e6c.firebaseapp.com", projectId: "the-grace-78e6c", storageBucket: "the-grace-78e6c.firebasestorage.app", messagingSenderId: "155088026492", appId: "1:155088026492:web:c4b08420f69e36145b42f9" };
let db = null;
try{ const app = initializeApp(firebaseConfig, "returns-addon-v1821"); db = getFirestore(app); }catch(e){ try{ db = getFirestore(); }catch(e2){} }

function getLS(k){ try{ return JSON.parse(localStorage.getItem(k)||'[]'); }catch(e){ return []; } }
function setLS(k,v){ localStorage.setItem(k, JSON.stringify(v)); }
function esc(s){ if(!s) return ''; const d=document.createElement('div'); d.textContent=s; return d.innerHTML; }
function safeId(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,6).toUpperCase(); }
function getUser(){ try{ return JSON.parse(localStorage.getItem('gp_user')||'{}'); }catch(e){ return {}; } }
function isAdmin(){ const u=getUser(); return (u.shift==='Admin' || u.role==='Admin' || u.username==='admin' || u.username==='Administrator' || u.username==='Admin'); }
let pending = null;

function addButton(){
  if(document.querySelector('[data-tab="today"]')) return;
  const purchasesBtn = document.querySelector('[data-tab="purchases"]');
  if(!purchasesBtn) return;
  const b = document.createElement('button');
  b.setAttribute('data-tab','today');
  b.onclick = ()=> window.showTab('today');
  b.className = 'tab-btn px-3 py-1.5 rounded-full text-[11px] tabN bg-[#F0FDF4]';
  b.textContent = "Today's Sales";
  purchasesBtn.after(b);
}

function addTab(){
  if(document.getElementById('tab-today')) return;
  const main = document.querySelector('main'); if(!main) return;
  main.insertAdjacentHTML('beforeend', `
  <div id="tab-today" class="tab-content hidden">
    <div class="card p-3">
      <div class="flex justify-between items-center flex-wrap gap-2">
        <div><h3 class="font-bold text-[#0A5C36] text-[13px]">Today's Sales - V18.2.1 - مشتريات اليوم</h3><p class="text-[10px] text-gray-500">كل البيعات بتاعت الليلة - اضغط Return لإرجاع دوا ورد القروش - محفوظ في Firebase - Admin Only</p></div>
        <div class="flex gap-1.5">
          <span id="todayTotalBadge" class="badge bg-[#0A5C36] text-white text-[10px]">Today: 0 SSP</span>
          <span id="todayReturnBadge" class="badge bg-red-100 text-red-700 text-[10px]">Returned: 0 SSP</span>
        </div>
      </div>
      <div class="flex gap-1.5 mt-3">
        <input id="todaySearch" oninput="window.renderTodaySales()" placeholder="Search by medicine / cashier..." class="inp text-[11px]">
        <button onclick="window.renderTodaySales()" class="btn text-[11px]">Refresh</button>
      </div>
    </div>
    <div id="todayList" class="mt-3 space-y-2"></div>
    <div class="card p-3 mt-3"><h4 class="font-bold text-[#0A5C36] text-[11px]">Today's Returns - المرتجعات - V18.2.1 - Firebase</h4><div id="todayReturnsList" class="mt-2 text-[11px]"></div></div>
  </div>
  <div id="returnModal" class="hidden fixed inset-0 bg-black/60 z-[90] flex items-center justify-center p-4">
    <div class="card p-4 w-full max-w-sm shadow-2xl">
      <h3 class="font-bold text-[#0A5C36] text-[13px]">Return Medicine - إرجاع دوا - V18.2.1</h3>
      <p id="returnInfo" class="text-[11px] text-gray-500 mt-1 font-bold">-</p>
      <div class="mt-3 space-y-2">
        <div class="p-2 bg-gray-50 rounded-lg border"><p class="text-[10px] text-gray-500">Refund Amount</p><p id="returnRefund" class="font-bold text-[16px] text-red-600">0 SSP</p></div>
        <div><label class="text-[10px] font-bold">Qty to Return *</label><input id="returnQty" type="number" min="1" value="1" class="inp mt-1 font-bold" oninput="window.updateReturnRefund()"></div>
        <div><label class="text-[10px] font-bold">Reason</label><select id="returnReason" class="inp mt-1 text-[11px]"><option>Customer changed mind</option><option>Wrong medicine</option><option>Expired / Damaged</option><option>Allergy / Doctor changed prescription</option><option>Other</option></select></div>
      </div>
      <div class="flex gap-1.5 mt-4">
        <button onclick="window.closeReturnModal()" class="flex-1 border bg-gray-50 px-3 py-2.5 rounded-lg font-bold text-[11px]">Cancel</button>
        <button onclick="window.confirmReturn()" class="flex-1 btn py-2.5 text-[11px] bg-red-600">Confirm Return + Refund</button>
      </div>
      <p class="text-[9px] text-gray-400 mt-2 text-center">V18.2.1 - سيتم الحفظ في Firebase + تحديث المخزون في كل الأجهزة - Admin Only</p>
    </div>
  </div>`);
}

window.renderTodaySales = function(){
  addButton(); addTab();
  const today = new Date().toISOString().slice(0,10);
  const sales = getLS('gp_sales');
  const returns = getLS('gp_returns');
  const q = (document.getElementById('todaySearch')?.value||'').toLowerCase();
  let list = sales.filter(s=>s.date===today);
  if(q) list = list.filter(s=> s.items.some(it=>it.name.toLowerCase().includes(q)) || (s.by||'').toLowerCase().includes(q));
  let dayTotal = sales.filter(s=>s.date===today).reduce((a,s)=>a+(s.total||0),0);
  let dayRet = returns.filter(r=>r.date===today).reduce((a,r)=>a+(r.refund||0),0);
  const tb = document.getElementById('todayTotalBadge'); if(tb) tb.textContent = 'Today: '+(dayTotal-dayRet).toLocaleString()+' SSP';
  const rb = document.getElementById('todayReturnBadge'); if(rb) rb.textContent = 'Returned: '+dayRet.toLocaleString()+' SSP';
  const box = document.getElementById('todayList'); if(!box) return;
  if(!list.length){ box.innerHTML = '<div class="card p-6 text-center text-gray-400 text-[12px]">No sales today yet</div>'; }
  else{
    box.innerHTML = list.map(s=>{
      const itemsHtml = (s.items||[]).map(it=>{
        const retQty = returns.filter(r=>String(r.saleId)===String(s.id) && String(r.itemId)===String(it.id)).reduce((a,r)=>a+r.qty,0);
        const left = it.qty - retQty;
        return `<div class="flex justify-between items-center py-2 border-b text-[11px]"><div><b>${esc(it.name)}</b> <span class="text-gray-500">x ${it.qty} ${retQty?`• Returned ${retQty} • Left ${left}`:''}</span><br><span class="text-[10px] text-gray-400">${(it.sell*it.qty).toLocaleString()} SSP</span></div><div><button ${left<=0?'disabled':''} onclick="window.openReturnModal('${s.id}','${it.id}')" class="${left<=0?'bg-gray-300 text-gray-500':'bg-red-600 text-white'} px-2.5 py-1 rounded-full text-[10px] font-bold">${left<=0?'Returned':'↩ Return'}</button></div></div>`;
      }).join('');
      return `<div class="card p-3"><div class="flex justify-between"><b class="text-[12px]">Sale #${String(s.id).slice(-6)} • ${esc(s.by||'')} • ${esc(s.jubaShift||'')}</b><span class="text-[10px] text-gray-400">${new Date(s.time).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</span></div><div class="text-[11px] mt-1">Total: <b>${(s.total||0).toLocaleString()} SSP</b></div>${itemsHtml}</div>`;
    }).join('');
  }
  const rBox = document.getElementById('todayReturnsList'); if(rBox){
    const todayRet = returns.filter(r=>r.date===today);
    rBox.innerHTML = !todayRet.length ? '<p class="text-gray-400">No returns today</p>' : todayRet.map(r=>`<div class="flex justify-between py-1 border-b"><span><b>${esc(r.name)}</b> x ${r.qty} • ${esc(r.reason)}</span><span class="font-bold text-red-600">-${r.refund.toLocaleString()} SSP</span></div>`).join('');
  }
};

window.openReturnModal = function(saleId, itemId){
  if(!isAdmin()){ alert('Admin Only - الإرجاع للمدير فقط'); return; }
  const sales = getLS('gp_sales'); const returns = getLS('gp_returns');
  const s = sales.find(x=>String(x.id)===String(saleId)); if(!s) return;
  const it = s.items.find(x=>String(x.id)===String(itemId)); if(!it) return;
  const retQty = returns.filter(r=>String(r.saleId)===String(saleId) && String(r.itemId)===String(itemId)).reduce((a,r)=>a+r.qty,0);
  const left = it.qty - retQty; if(left<=0) return alert('Already fully returned');
  pending = {saleId, itemId, max:left, sell:it.sell, buy:it.buy, name:it.name};
  document.getElementById('returnInfo').textContent = `${it.name} - Bought ${it.qty} • Can return max ${left} • Price ${it.sell.toLocaleString()} SSP`;
  document.getElementById('returnQty').value = 1; document.getElementById('returnQty').max = left;
  document.getElementById('returnModal').classList.remove('hidden');
  window.updateReturnRefund();
};
window.closeReturnModal = function(){ document.getElementById('returnModal')?.classList.add('hidden'); pending=null; };
window.updateReturnRefund = function(){
  if(!pending) return;
  let q = parseInt(document.getElementById('returnQty').value||1); if(q<1) q=1; if(q>pending.max) q=pending.max;
  document.getElementById('returnQty').value = q;
  document.getElementById('returnRefund').textContent = (q*pending.sell).toLocaleString()+' SSP';
};

window.confirmReturn = async function(){
  if(!isAdmin()){ alert('Admin Only - الإرجاع للمدير فقط'); return; }
  if(!pending) return;
  let q = parseInt(document.getElementById('returnQty').value||1); if(q<1||q>pending.max) return alert('Invalid qty');
  const reason = document.getElementById('returnReason').value;
  const refund = q * pending.sell;
  const today = new Date().toISOString().slice(0,10);
  const user = getUser();
  if(!confirm(`Confirm Return?\n${q} x ${pending.name}\nRefund: ${refund.toLocaleString()} SSP`)) return;
  let meds = getLS('gp_meds');
  const med = meds.find(m=>String(m.id)===String(pending.itemId));
  if(med){
    med.qty += q;
    setLS('gp_meds', meds);
    if(db){ try{ await setDoc(doc(db,'meds',med.id), {...med, ts:serverTimestamp()}); }catch(e){ console.log('Firebase med update failed', e); } }
  }
  const ret = {id:safeId(), saleId:pending.saleId, itemId:pending.itemId, name:pending.name, qty:q, refund, reason, date:today, by:user.username||'cashier', time:new Date().toISOString()};
  let returns = getLS('gp_returns'); returns.unshift(ret); setLS('gp_returns', returns.slice(0,500));
  if(db){ try{ await addDoc(collection(db,'returns'), {...ret, ts:serverTimestamp()}); }catch(e){ console.log('Firebase return save failed', e); } }
  if(db){ try{ await addDoc(collection(db,'audit'), {time:new Date().toISOString(), user:user.username||'cashier', action:'RETURN', details:`V18.2.1 Returned ${q} x ${pending.name} - Refund ${refund} SSP - ${reason}`, profit: -(q*(pending.sell-pending.buy)), ts:serverTimestamp()}); }catch(e){} }
  alert('Return Saved in Firebase - V18.2.1 ✅\nRefunded: '+refund.toLocaleString()+' SSP\nPage will reload to sync stock');
  location.reload();
};

document.addEventListener('DOMContentLoaded', ()=>{ setTimeout(()=>{ addButton(); addTab(); }, 600); });
setTimeout(()=>{
  if(window.showTab && !window.showTab._patched){
    const orig = window.showTab;
    window.showTab = function(t){ orig(t); if(t==='today') window.renderTodaySales(); };
    window.showTab._patched = true;
  }
}, 1000);

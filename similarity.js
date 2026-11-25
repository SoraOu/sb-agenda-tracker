/* similarity.js - similar-document detection for EVERY register (Legislation, Barangay, Municipal Ordinances, Signed Resolutions).
   Ported from commit d8d040c ("added new section") and widened from Barangay-only to all documents.
   Load it AFTER app.js. It wraps save(), sync(), render(), load()-time merging, del() and delSel(); app.js is not edited.
   With Supabase, run supabase/similarity.sql once (adds a "meta" column that stores reference no., links and the audit trail). */
(()=>{
const SW=new Set("the of a an and for to in on by with at from series s no nos number".split(" "));
const AB={brgy:"barangay",res:"resolution",reso:"resolution",ord:"ordinance",cert:"certification",eo:"executive order",sb:"sangguniang bayan",mun:"municipal"};
const nz=t=>String(t||"").toLowerCase().replace(/&/g," and ").replace(/[^a-z0-9\s]/g," ").split(/\s+/).filter(Boolean).flatMap(w=>(AB[w]||w).split(" ")).map(w=>w.replace(/^0+(?=\d)/,"")).filter(w=>!SW.has(w));
const lev=(a,b)=>{const m=a.length,n=b.length;if(!m||!n)return 0;let p=Array.from({length:n+1},(_,j)=>j);for(let i=1;i<=m;i++){const c=[i];for(let j=1;j<=n;j++)c[j]=Math.min(p[j]+1,c[j-1]+1,p[j-1]+(a[i-1]==b[j-1]?0:1));p=c}return 1-p[n]/Math.max(m,n)};
const bgm=s=>{const x=[];for(let i=0;i<s.length-1;i++)x.push(s.slice(i,i+2));return x};
function tsim(a,b){const A=nz(a),B=nz(b);if(!A.length||!B.length)return 0;const used=new Set();let m=0;for(const w of A){let best=0,bi=-1;B.forEach((v,i)=>{if(used.has(i))return;const s=w==v?1:lev(w,v);if(s>best){best=s;bi=i}});if(best>=.8){m+=best;used.add(bi)}}
const d1=2*m/(A.length+B.length),x=bgm([...A].sort().join(" ")),y=bgm([...B].sort().join(" ")),cn={};y.forEach(g=>cn[g]=(cn[g]||0)+1);let h=0;x.forEach(g=>{if(cn[g]>0){h++;cn[g]--}});const d2=x.length+y.length?2*h/(x.length+y.length):0;return .6*d1+.4*d2}
function pno(t){t=String(t||"").toLowerCase();const n=t.match(/\bno\.?\s*0*(\d+)/);if(!n)return null;const y=t.match(/(?:\bs\.?\s*|series\s+of\s+|series\s+)(\d{4})/)||t.match(/\bno\.?\s*0*\d+\s*[-\/]\s*(\d{4})/);return y?n[1]+"-"+y[1]:null}
const nbz=s=>String(s||"").toLowerCase().replace(/[^a-z0-9]/g,"");
function simScore(a,b){const t=tsim(a.title,b.title)*100,sb=a.author&&b.author?(nbz(a.author)==nbz(b.author)?1:0):.5,st=a.type==b.type?1:0,na=pno(a.title+" "+(a.no||"")),nb2=pno(b.title+" "+(b.no||"")),sn=na&&nb2?(na==nb2?1:0):(!na&&!nb2?1:.5);
return{score:Math.min(100,Math.round(t*.84+sb*5+st*5+sn*6)),num:!!(na&&nb2&&na==nb2&&sb==1&&st)}}
let ME="";const openG=new Set();
const refNo=r=>(r.meta&&r.meta.ref)||"SB-"+String(r.id).slice(-6);
const rootOf=r=>{let c=r,n=0;while(c&&c.meta&&c.meta.parent&&n++<20){const p=data.find(x=>x.id==c.meta.parent);if(!p)break;c=p}return c};
const tsn=r=>(r.meta&&r.meta.at?Date.parse(r.meta.at):0)||(r.id>1e12?r.id:Date.parse(r.filed)||0);
const relOf=r=>r.meta&&r.meta.rel;
const curDoc=g=>g.filter(x=>relOf(x)!="supplemental").sort((a,b)=>tsn(b)-tsn(a))[0]||g[0];
function lbl(r,root,g){const m=r.meta||{};if(m.verify)return"PENDING VERIFICATION";if(r.id==root.id)return g.length>1?"ORIGINAL DOCUMENT":"";
if(m.rel=="revision"){const v=g.filter(x=>relOf(x)=="revision").sort((a,b)=>tsn(b)-tsn(a));return v[0].id==r.id?"LATEST VERSION":"PREVIOUS VERSION"}
if(m.rel=="resubmission"){const v=g.filter(x=>relOf(x)=="resubmission").sort((a,b)=>tsn(b)-tsn(a));return v[0].id==r.id?"LATEST RESUBMISSION":"PREVIOUS VERSION"}return""}
const grpOf=root=>data.filter(x=>rootOf(x).id==root.id);
function gtag(r){const g=grpOf(r),L=r.meta&&r.meta.verify?"PENDING VERIFICATION":g.length>1?"ORIGINAL DOCUMENT":"";
return `<br><small>${refNo(r)}${g.length>1?" · Group status: "+esc(curDoc(g).status):""}</small>${L?`<br><span class="sim-lb">${L}</span>`:""}${g.length>1?` <button type="button" class="ghost" style="padding:2px 10px;margin-top:4px" onclick="simTg(${r.id})">${openG.has(r.id)?"\u25BE":"\u25B8"} ${g.length-1} linked document${g.length>2?"s":""}</button>`:""}`}
function simTg(id){openG.has(id)?openG.delete(id):openG.add(id);render()}
function gpanel(root){const g=grpOf(root).sort((a,b)=>tsn(b)-tsn(a));
return `<div style="display:grid;gap:6px"><b>Linked documents (newest first) \u00B7 Group status: ${esc(curDoc(g).status)}</b>`+g.map(x=>{const L=lbl(x,root,g),m=x.meta||{},p=m.parent?data.find(y=>y.id==m.parent):null;
return `<div class="sim-gi"><div>${L?`<span class="sim-lb">${L}</span> `:""}<b>${esc(x.title)}</b></div><small>${refNo(x)} \u00B7 Registered ${esc((m.at||"").slice(0,10)||fmtDate(x.filed)||"\u2013")} \u00B7 Status: ${esc(x.status)}${m.by?" \u00B7 By "+esc(m.by):""}</small>${m.rel=="supplemental"&&p?`<small>Related to ${refNo(p)} \u2013 ${esc(p.title)}</small>`:""}<div>${rep(x)} <button type="button" class="ghost" style="padding:2px 10px" onclick="openForm(${x.id})">Edit</button></div></div>`}).join("")+"</div>"}
function findSim(r){return data.filter(d=>d.id!==r.id).map(d=>({d,...simScore(r,d)})).filter(x=>x.score>=75||x.num).sort((a,b)=>b.score-a.score)}
const lv=x=>x.score>=95?"Very Likely Duplicate":x.score>=85?"Highly Similar":x.score>=75?"Potentially Similar":"Number/year match";
const smCard=x=>{const d=x.d,s=x.score;return `<div class="sim-sm"><div style="display:flex;justify-content:space-between;gap:8px"><b>${esc(d.title)}</b><span class="sim-pcs ${s>=85?"h":""}">${s}% \u00B7 ${lv(x)}</span></div><small>${refNo(d)} \u00B7 ${esc(d.type)} \u00B7 From: ${esc(d.author)||"\u2013"} \u00B7 Received ${esc(fmtDate(d.filed))||"\u2013"} \u00B7 Status: ${esc(d.status)}${(d.sessions||[]).length?" \u00B7 Sessions: "+d.sessions.map(fmtDate).join(", "):""}</small>${x.num?'<small style="color:var(--warn)">Same sender, type, number and year.</small>':""}<div><button type="button" class="ghost" style="padding:3px 10px" onclick="const n=this.parentNode.nextElementSibling;n.hidden=!n.hidden">View</button></div><div hidden class="sim-gi"><small>Committees: ${esc(cms(d).join("; "))||"\u2013"}</small><small>${d.remarks?esc(d.remarks):"No remarks"}</small><div>${rep(d)}</div></div></div>`};
function askSim(r,mm){return new Promise(res=>{
$("sim-mbx").innerHTML=`<h3>Similar Documents Detected</h3><div class="sim-mc"><div class="sim-sm"><b>Newly registered document</b><div>${esc(r.title)}</div><small>Type: ${esc(r.type)} \u00B7 From: ${esc(r.author)||"\u2013"} \u00B7 Received: ${esc(fmtDate(r.filed))||"\u2013"} \u00B7 Reference no.: assigned on registration</small></div>
<b>Existing similar documents (${mm.length})</b>${mm.map(smCard).join("")}
<b>How should this newly submitted document be classified?</b><div class="sim-rd">${[["A","This is a new document"],["B","This is a revised version"],["C","This is a resubmission of an existing document"],["D","This is a supplemental or related document"],["E","Other / requires manual verification"]].map(o=>`<label><input type="radio" name="scl" value="${o[0]}">${o[1]}</label>`).join("")}</div>
<div id="smp" hidden><label>Select the corresponding existing document</label><select id="smps"><option value="">\u2014 Select \u2014</option>${mm.map(x=>`<option value="${x.d.id}">${refNo(x.d)} \u2013 ${esc(x.d.title)} (${x.score}%)</option>`).join("")}</select></div>
<div id="smn" hidden><label>Brief explanation (required)</label><textarea id="smnt" rows="2"></textarea></div></div>
<div class="sim-mf"><button type="button" class="ghost" id="smx">Cancel</button><button type="button" class="ghost" id="smb">Return to Registration</button><button type="button" class="pri" id="smo">Confirm &amp; Register</button></div>`;
$("sim-md").classList.add("on");const done=v=>{$("sim-md").classList.remove("on");res(v)};
document.querySelectorAll("input[name=scl]").forEach(i=>i.onchange=()=>{$("smp").hidden=!"BCD".includes(i.value);$("smn").hidden=i.value!="E"});
$("smx").onclick=()=>done({cancel:1});$("smb").onclick=()=>done({back:1});
$("smo").onclick=()=>{const c=(document.querySelector("input[name=scl]:checked")||{}).value,p=$("smps").value,n=$("smnt").value.trim();
if(!c)return alert("Please select a classification.");if("BCD".includes(c)&&!p)return alert("Please select the corresponding existing document.");if(c=="E"&&!n)return alert("Please enter a brief explanation.");done({cls:c,parent:p?+p:null,note:n})}})}
function stampMeta(r,c,mm){const seq=Math.max(0,...data.map(x=>+(((x.meta&&x.meta.ref)||"").split("-")[2])||0))+1,m=r.meta={ref:"SB-"+new Date().getFullYear()+"-"+String(seq).padStart(4,"0"),at:new Date().toISOString(),by:ME};
if(!c)return;const p=c.parent?data.find(x=>x.id==c.parent):null;
if(c.cls=="B")Object.assign(m,{rel:"revision",parent:p.id});else if(c.cls=="C")Object.assign(m,{rel:"resubmission",parent:p.id});else if(c.cls=="D")Object.assign(m,{rel:"supplemental",parent:p.id});else if(c.cls=="E")Object.assign(m,{verify:true,note:c.note});
m.audit=[{t:m.at,by:ME,cls:{A:"New document",B:"Revised version",C:"Resubmission",D:"Supplemental / related document",E:"Manual verification"}[c.cls],note:c.note||"",parent:p?refNo(p):"",hits:mm.map(x=>({ref:refNo(x.d),s:x.score,num:x.num}))}]}
function auditView(){const L=data.flatMap(r=>((r.meta&&r.meta.audit)||[]).map(a=>({...a,ref:refNo(r),title:r.title}))).sort((a,b)=>(b.t||"").localeCompare(a.t||""));
$("sim-mbx").innerHTML=`<h3>Duplicate Detection Audit Trail</h3><div class="sim-mc">${L.length?L.map(a=>`<div class="sim-sm"><b>${esc(a.cls)}</b><small>${esc(new Date(a.t).toLocaleString())} \u00B7 By ${esc(a.by)||"\u2013"} \u00B7 New document ${a.ref} \u2013 ${esc(a.title)}</small><small>Matches: ${a.hits.map(h=>h.ref+" ("+h.s+"%"+(h.num?", same number/year":"")+")").join(", ")}</small>${a.parent?`<small>Parent document: ${a.parent}</small>`:""}${a.note?`<small>Reason: ${esc(a.note)}</small>`:""}</div>`).join(""):"<small>No similarity decisions recorded yet.</small>"}</div><div class="sim-mf"><button type="button" class="pri" onclick="$('sim-md').classList.remove('on')">Close</button></div>`;$("sim-md").classList.add("on")}

/* ---------- wiring into app.js ---------- */
document.head.insertAdjacentHTML("beforeend","<style>"+`
.sim-mdl{position:fixed;inset:0;background:rgba(0,0,0,.45);display:none;align-items:center;justify-content:center;z-index:60;padding:16px}.sim-mdl.on{display:flex}
.sim-mb{background:var(--card);color:var(--tx);border:1px solid var(--bd);border-radius:12px;width:min(780px,100%);max-height:90vh;display:flex;flex-direction:column;box-shadow:0 10px 40px rgba(0,0,0,.3)}.sim-mb h3{margin:0;padding:16px 20px;border-bottom:1px solid var(--bd);font-size:20px;font-weight:600}
.sim-mc{padding:16px 20px;overflow:auto;display:grid;gap:12px}.sim-mc label{display:block;font-size:13px;font-weight:600;color:var(--mut);margin-bottom:3px}.sim-mf{padding:12px 20px;border-top:1px solid var(--bd);display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap}
.sim-sm{border:1px solid var(--bd);border-radius:8px;padding:10px;display:grid;gap:4px}.sim-sm small,.sim-gi small{color:var(--mut);font-size:13px}
.sim-pcs{font-weight:700;padding:2px 8px;border-radius:99px;background:var(--ambbg);color:var(--amb);font-size:12px;white-space:nowrap}.sim-pcs.h{background:var(--warnbg);color:var(--warn)}
.sim-lb{display:inline-block;font-size:11px;font-weight:700;letter-spacing:.04em;padding:2px 8px;border-radius:6px;border:1px solid var(--bd);background:var(--pri2);color:var(--lnk);white-space:nowrap}
.sim-gp{display:grid;gap:6px;padding:10px 12px;margin:0 0 10px;background:var(--sec);border-radius:8px}tr.sim-gprow td{background:var(--sec)}
.sim-gi{border-left:4px solid var(--acc);padding:8px 12px;background:var(--card);border-radius:6px;display:grid;gap:3px}
.sim-rd label{display:flex;gap:8px;align-items:flex-start;font-weight:400;color:var(--tx);font-size:14px;padding:4px 0}.sim-rd input{width:16px;height:16px;padding:0;margin-top:3px}
.sim-ln{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:4px 0;font-size:13px;color:var(--mut)}
`+"</style>");
document.body.insertAdjacentHTML("beforeend",'<div class="sim-mdl" id="sim-md" role="alertdialog" aria-modal="true" aria-label="Similar documents detected"><div class="sim-mb" id="sim-mbx"></div></div>');
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&$("sim-md").classList.contains("on")){const x=$("smx");x?x.click():$("sim-md").classList.remove("on")}});
async function who(){try{const{data:{session}}=await SB.auth.getSession();return(session&&session.user&&session.user.email)||""}catch(e){return""}}
const formDoc=()=>{const d={};for(const k in M)d[M[k]]=$(k).value.trim();return d};
let PEND=null,askBusy=false,lastData=null,metaBusy=false,warned=false;const saved=new WeakMap();
const warnMeta=()=>{if(warned)return;warned=true;alert("The document was saved, but its similar-document history could not be stored. Ask the administrator to run supabase/similarity.sql in Supabase (one time).")};
// New documents only: check for similar documents before saving
const _save=save;
save=async function(){
 if(saving||editId||askBusy)return _save();
 const r=formDoc();if(!r.title)return _save();
 askBusy=true;
 try{const mm=findSim(r);let c=null;
  if(mm.length){c=await askSim(r,mm);if(c.cancel)closeForm();if(c.cancel||c.back)return}
  ME=await who();PEND={c,mm};
  try{await _save()}finally{PEND=null}
 }finally{askBusy=false}};
// Stamp reference no./classification onto the new record right before it is synced, then store it
const _sync=sync;
sync=async function(r){
 if(PEND&&data[0]===r&&!r.meta){stampMeta(r,PEND.c,PEND.mm);PEND=null}
 const ok=await _sync(r);
 if(ok&&col&&r.meta){const s=JSON.stringify(r.meta);if(saved.get(r)!==s){const{error}=await SB.from("measures").update({meta:r.meta}).eq("id",r.id);if(error)warnMeta();else saved.set(r,s)}}
 return ok};
// Merge stored meta into freshly loaded data, then decorate rows
async function mergeMeta(){if(metaBusy)return;metaBusy=true;try{const{data:d,error}=await SB.from("measures").select("id,meta");if(error)return;const m=new Map(d.map(x=>[x.id,x.meta]));let ch=false;data.forEach(r=>{const v=m.get(r.id);if(v&&JSON.stringify(v)!==JSON.stringify(r.meta||null)){r.meta=v;saved.set(r,JSON.stringify(v));ch=true}});if(ch)render()}finally{metaBusy=false}}
function simInfo(r){const g=grpOf(r),m=r.meta||{};if(!r.meta&&g.length<2)return"";
 const p=m.parent?data.find(x=>x.id==m.parent):null,rel={revision:"REVISED VERSION",resubmission:"RESUBMISSION",supplemental:"SUPPLEMENTAL / RELATED"}[m.rel];
 return`<div class="sim-ln">${gtag(r).replace(/<br>/g," ")}${rel&&p?` <span class="sim-lb">${rel} of ${esc(refNo(p))}</span>`:""}</div>`}
function decorate(){
 const rid=el=>{const c=el.querySelector('input[type=checkbox][onchange*="selOne("]'),m=c&&c.getAttribute("onchange").match(/selOne\((\d+)/);return m?+m[1]:null};
 document.querySelectorAll("#dk article").forEach(a=>{const r=data.find(x=>x.id==rid(a));if(!r)return;const h=simInfo(r);if(!h)return;(a.querySelector("h3")||a.firstElementChild).insertAdjacentHTML("afterend",h);if(openG.has(r.id)&&grpOf(r).length>1)a.insertAdjacentHTML("afterend",`<div class="sim-gp">${gpanel(r)}</div>`)});
 document.querySelectorAll("#tb tr").forEach(tr=>{const r=data.find(x=>x.id==rid(tr));if(!r)return;const h=simInfo(r),td=tr.querySelector("td.t");if(!h||!td)return;td.insertAdjacentHTML("beforeend",h);if(openG.has(r.id)&&grpOf(r).length>1)tr.insertAdjacentHTML("afterend",`<tr class="sim-gprow"><td colspan="13">${gpanel(r)}</td></tr>`)})}
const _render=render;
render=function(){_render();if(typeof col!=="undefined"&&col&&data!==lastData){lastData=data;mergeMeta()}decorate()};
// Keep history intact: block deleting a document that other documents are linked to
const _del=del;del=function(id){if(data.some(x=>x.meta&&x.meta.parent==id)){alert("This document has linked versions, resubmissions or related documents. Remove those first so no history is lost.");return}return _del(id)};
const _delSel=delSel;delSel=function(){if(data.some(x=>x.meta&&x.meta.parent!=null&&sel.has(x.meta.parent)&&!sel.has(x.id))){alert("A selected document has linked versions, resubmissions or related documents. Remove those first so no history is lost.");return}return _delSel()};
// Audit Trail link in the nav bar (staff only when Supabase is on)
const sp=document.querySelector(".bar .sp");
if(sp){sp.insertAdjacentHTML("afterbegin",'<a href="#" id="sim-au" hidden onclick="auditView();return false">Audit Trail</a>');
 const so=document.getElementById("so"),au=document.getElementById("sim-au"),upd=()=>{au.hidden=typeof SB!=="undefined"&&!!SB&&!!so&&so.hidden};upd();if(so)new MutationObserver(upd).observe(so,{attributes:true,attributeFilter:["hidden"]})}
window.auditView=auditView;window.simTg=simTg;
render();
})();

// Shared app logic: data, Supabase sync, alerts, rendering, forms. Used by every page.
// Add/Edit, Customize and Sign-in drawers are shared by every page.
document.body.insertAdjacentHTML("beforeend",`<div class="dr" id="dr">
<div class="dh"><b id="mt" style="font-size:17px;font-weight:600">Add agenda</b><button type="button" class="xb" onclick="closeForm()" aria-label="Close">&#10005;</button></div>
<div><label>Title / subject</label><textarea id="ft" rows="2"></textarea></div>
<div><label>Type of document</label><select id="fy"></select></div>
<div><label id="lfa">From</label><input id="fa"></div>
<div><label>Status</label><select id="fst"></select></div>
<div><label>Committee(s)</label><div id="cl" style="display:grid;gap:6px"></div><button type="button" class="ghost" onclick="addCom()" style="margin-top:6px">+ Add committee</button></div>
<div class="g2"><div><label>Date received</label><input type="date" id="fd"></div><div><label>Approval date</label><input type="date" id="fm"></div></div>
<div><label>Meeting Dates</label><div id="ss" style="display:grid;gap:6px"></div><button type="button" class="ghost" onclick="addSess()" style="margin-top:6px">+ Add meeting date</button></div>
<div class="g2"><div><label>Committee report no.</label><input id="fr" placeholder="CR-2026-04"></div><div><label>Committee report link</label><input id="fl" type="url" placeholder="https://… (Drive, OneDrive, etc.)"></div></div>
<div id="fup"><label>Committee report file</label><input type="file" id="ff" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"><div id="fcur" style="font-size:12px;color:var(--mut);margin-top:4px"></div></div>
<div><label>Remarks / next steps</label><textarea id="fk" rows="3"></textarea></div>
<button class="pri" onclick="save()">Save</button><button class="ghost" onclick="closeForm()">Cancel</button>
</div>
<div class="dr" id="tp"><div class="dh"><b style="font-size:17px;font-weight:600">Customize appearance</b><button type="button" class="xb" onclick="closeTP()" aria-label="Close">&#10005;</button></div>
<div id="tpb" style="display:grid;gap:12px"></div><button class="ghost" onclick="closeTP()">Close</button></div>
<div class="dr" id="lg"><b style="font-size:17px;font-weight:600">Staff sign in</b>
<div><label>Email</label><input id="le" type="email" autocomplete="username"></div>
<div><label>Password</label><input id="lp" type="password" autocomplete="current-password" onkeydown="if(event.key=='Enter')login()"></div>
<button class="pri" onclick="login()">Sign in</button></div>`);
const ST=["Received","Received. No Follow-Up Needed","For Follow-Up","1st Reading (Session)","2nd Reading / Deliberated","Pending","For Revision","For Approval","Approved","Deferred","Tabled","Suspended","Disapproved","Implemented / Released","Repealed","Completed / Filed"];
const CM=["En Banc","Finance, Budget and Appropriations","Housing and Land Use","Barangay Affairs & Boundary Disputes","Good Government, Public Ethics and Accountability","Rules, Resolutions and Ordinances","Health, Sanitation and Nutrition","Transportation","Infrastructure and Public Works","Peace and Order, Security and Human Rights","Education, Culture and Arts","Agriculture, Trade and Industry","Cooperatives","Ways and Means","Women, Family and Social Services","Youth and Sports Development","Environmental Protection and Natural Resources","Tourism","Local Economic Enterprises (Waterworks, Market, Slaughterhouse & Cemetery)","Project Monitoring & Oversight","Games and Amusement","Communication and Information Technology","Disaster Preparedness and Resiliency","MTFRB"];
const TYG=[["1. Legislative Documents",["Proposed Ordinance","Proposed Resolution","Appropriation Ordinance","Supplemental Appropriation Ordinance","Committee Report","Legislative Proposal"]],
["2. Correspondence and Communications",["Letter","Request Letter","Endorsement Letter","Invitation","Memorandum","Notice","Complaint or Petition"]],
["3. Budget and Financial Documents",["Annual Budget","Supplemental Budget","Annual Investment Program (AIP)","Supplemental Investment Program (SIP)","Budgetary Appropriation Request","Financial or Funding Request"]],
["4. Barangay Documents",["Barangay Ordinance","Barangay Resolution","Barangay Executive Order","Barangay Annual Budget","Barangay Development Plan","Barangay Certification or Endorsement"]],
["5. Agreements and Legal Documents",["Memorandum of Agreement (MOA)","Memorandum of Understanding (MOU)","Contract or Deed","Deed of Donation","Usufruct Agreement","Legal Opinion or Legal Memorandum"]],
["6. Reports and Plans",["Accomplishment Report","Project Proposal","Feasibility Study","Development Plan","Monitoring and Evaluation Report","Minutes of Meeting"]],
["7. Administrative and Case Documents",["Administrative Complaint","Answer or Counter-Affidavit","Motion or Manifestation","Notice of Hearing","Summons or Subpoena","Evidence or Supporting Documents"]],
["8. Other Documents",["Endorsement for Appropriate Action","Application","Certification","Clearance","Manifestation of Support","Other Supporting Documents"]]];
const TY=TYG.flatMap(g=>g[1]);
const BT=TYG.find(g=>/^4\./.test(g[0]))[1],isB=r=>BT.includes(r.type),sc=()=>PAGE=="barangay";
const FINAL=["Received. No Follow-Up Needed","Approved","Disapproved","Repealed","Implemented / Released","Completed / Filed","Tabled"],APPR=["Approved","Implemented / Released"];
const LEG={"1st Read (Session)":"1st Reading (Session)","2nd Read (Session)":"2nd Reading / Deliberated","2nd Read / Deliberated":"2nd Reading / Deliberated","Deliberated":"2nd Reading / Deliberated","Pending / For Revision":"Pending","Revised":"For Revision","Pending Approval":"For Approval","Implemented":"Implemented / Released","Released":"Implemented / Released","Table Out":"Tabled","Deferred / Tabled / Suspended":"Deferred","Filed / First Reading":"Received","Referred to Committee":"Pending","Under Committee Review":"Pending","Committee Report Ready":"For Approval","Second Reading / Debate":"2nd Reading / Deliberated","Third & Final Reading":"2nd Reading / Deliberated","Transmitted to Mayor":"For Approval","Approved / Enacted":"Approved","Vetoed / Deferred":"Deferred"};
const norm=r=>{if(LEG[r.status])r.status=LEG[r.status];return r};
const cms=r=>r.committees&&r.committees.length?r.committees:(r.committee?String(r.committee).split(/\s*;\s*/).filter(Boolean):[]);
const $=id=>document.getElementById(id);
const jq=s=>JSON.stringify(s).replace(/&/g,"&amp;").replace(/'/g,"&#39;");
const esc=s=>String(s||"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const iso=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
const today=()=>iso(new Date());
const MO=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const fmtDate=v=>{const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(v||"");return m?MO[+m[2]-1]+"-"+(+m[3])+"-"+m[1]:(v||"")};
const diff=(a,b)=>Math.round((Date.parse(b)-Date.parse(a))/864e5);
let sel=new Set(),curRows=[],AS=null,sess=[],coms=[],col=null,local=true,data=[],editId=null,F={st:"",cm:""},sort={k:"filed",d:-1};
if(!HOME){const c0=new URLSearchParams(location.search).get("cm");if(c0)F.cm=c0}
try{data=JSON.parse(localStorage.getItem("sbtracker")||"[]");data.forEach(norm)}catch(e){}
const persist=()=>{if(local)try{localStorage.setItem("sbtracker",JSON.stringify(data))}catch(e){}};
const opt=(s,a)=>s.innerHTML=a.map(x=>`<option>${esc(x)}</option>`).join("");
$("fy").innerHTML=TYG.map(g=>`<optgroup label="${esc(g[0])}">${g[1].map(x=>`<option>${esc(x)}</option>`).join("")}</optgroup>`).join("");opt($("fst"),ST);
// Days in Pipeline = calendar days since the ORIGINAL Received date. Status changes never reset it.
// Finalized documents stop counting on their end date (approval date, else the date the final status was set).
const isFinal=r=>FINAL.includes(r.status);
const dp=r=>{if(!r.filed)return null;const end=isFinal(r)?(r.mayor||r.stageDate||today()):today();return Math.max(0,diff(r.filed,end))};
// Days in Current Stage = separate monitoring metric (resets on every status change). Not used for alerts.
const ds=r=>isFinal(r)?null:Math.max(0,diff(r.stageDate||r.filed||today(),today()));
const AL={ok:"On Track",warn:"Approaching Deadline",od:"Overdue",done:"Completed",none:"No Received Date"};
// Days Since Last Meeting = calendar days since the LATEST recorded meeting date. Independent of Days in Pipeline:
// adding/editing a session only moves this counter; it never touches Days in Pipeline. No sessions recorded = not applicable.
const lastSess=r=>(r.sessions||[]).filter(d=>/^\d{4}-\d{2}-\d{2}$/.test(d)).sort().pop()||null;
const dls=r=>{const l=lastSess(r);return l?Math.max(0,diff(l,today())):null};
// Thresholds, applied separately to each counter: 0-15 On Track | 16-30 Approaching Deadline | 31+ Overdue
const lvl=d=>d>30?2:d>15?1:0;
const LN=[AL.ok,AL.warn,AL.od];
// Combined alert: Overdue if EITHER counter >30; Approaching if neither is overdue but either is 16-30; On Track only if both 0-15.
// Finalized statuses are excluded from active monitoring (Completed, no alert).
function alx(r){if(isFinal(r))return{a:AL.done,why:[],tags:[]};
const d=dp(r),s=dls(r);if(d===null&&s===null)return{a:AL.none,why:[],tags:[]};
const C=[["Pipeline",d,d+" days since original receipt"],["Meeting",s,s+" days since the most recent meeting"]].filter(x=>x[1]!==null).map(x=>({n:x[0],l:lvl(x[1]),t:x[2]}));
const m=Math.max(...C.map(x=>x.l)),hit=m>0?C.filter(x=>x.l==m):[],rest=C.filter(x=>!hit.includes(x));
const why=[];if(hit.length)why.push(LN[m]+" \u2013 "+hit.map(x=>x.n).join(" and ")+": "+hit.map(x=>x.t).join(" and ")+".");
rest.forEach(x=>why.push(LN[x.l]+" \u2013 "+x.n+": "+x.t+"."));
if(s===null)why.push("No meeting date recorded yet, so only Pipeline is monitored.");
return{a:LN[m],why,tags:hit.map(x=>x.n)}}
const al=r=>alx(r).a;
const alCls=a=>a==AL.od?"o":a==AL.warn?"t":a==AL.ok?"":"n";
const cols=[["title","Title"],["type","Type"],["author","From"],["committee","Committee"],["status","Status"],["filed","Received"],["","Meeting Dates"],["mayor","Approved"],["","Committee report"],["dp","Days in pipeline"],["ls","Days since last meeting"],["al","Alert"]];
if($("th"))$("th").innerHTML='<th><input type="checkbox" id="sa" onchange="selAll(this.checked)"></th>'+cols.map(c=>`<th onclick="${c[0]?`srt('${c[0]}')`:""}">${c[1]}</th>`).join("");
const val=(r,k)=>k=="dp"?(dp(r)??-1):k=="ls"?(dls(r)??-1):k=="ds"?(ds(r)??-1):k=="al"?al(r):(r[k]||"");
function srt(k){sort=sort.k==k?{k,d:-sort.d}:{k,d:1};render()}
function setF(t,v){F[t]=F[t]==v?"":v;render()}
function setCm(v){F.cm=v;render()}
function openCm(m){location.href="legislative.html?cm="+encodeURIComponent(m)}
function render(){persist();const base=HOME?data:data.filter(r=>sc()?isB(r):!isB(r)),c=f=>base.filter(f).length;
$("kpis").innerHTML=[["Total Agenda Received",base.length],["Received",c(r=>r.status=="Received")],["1st Reading",c(r=>r.status=="1st Reading (Session)")],["2nd Reading",c(r=>r.status=="2nd Reading / Deliberated")],["Pending",c(r=>r.status=="Pending")],["Approved",c(r=>r.status=="Approved")],["Overdue (pipeline or meeting >30 days)",c(r=>al(r)==AL.od),"w"]].map(k=>`<div class="kpi ${k[2]||""}"><b>${k[1]}</b><span>${k[0]}</span></div>`).join("");
const CS=["Received","1st Reading (Session)","2nd Reading / Deliberated","Pending","Approved"];
const CMS=[...CM,...[...new Set(data.flatMap(r=>cms(r)))].filter(m=>!CM.includes(m))];
if(HOME){
$("cc").innerHTML=CMS.map(m=>{const l=data.filter(r=>cms(r).includes(m));return `<tr class="clk" title="Show agenda under this committee" onclick='openCm(${jq(m)})'><td>${esc(m)}</td>${CS.map(s=>{const n=l.filter(r=>r.status==s).length;return `<td class="${n?"":"z"}">${n}</td>`}).join("")}</tr>`}).join("");
const TYX=[...new Set(data.map(r=>r.type).filter(t=>t&&!TY.includes(t)))];
const tyRow=t=>{const l=data.filter(r=>r.type==t);return `<tr><td>${esc(t)}</td><td><b>${l.length}</b></td>${CS.map(s=>{const n=l.filter(r=>r.status==s).length;return `<td class="${n?"":"z"}">${n}</td>`}).join("")}</tr>`};
$("tyb").innerHTML=TYG.map(g=>`<tr class="gh"><td colspan="7">${esc(g[0])}</td></tr>`+g[1].map(tyRow).join("")).join("")+(TYX.length?`<tr class="gh"><td colspan="7">Other / previous types</td></tr>`+TYX.map(tyRow).join(""):"");
return}
const dS=data.filter(r=>sc()?isB(r):!isB(r)),dd=dS.filter(r=>!F.cm||cms(r).includes(F.cm)),cd=f=>dd.filter(f).length;
const od=s=>cd(r=>r.status==s&&al(r)==AL.od);
$("cs").innerHTML=ST.map(s=>{const n=cd(r=>r.status==s),o=od(s);return `<div class="pl ${F.st==s?"on":""}" onclick='setF("st",${jq(s)})'><span>${esc(s)}</span><b>${n}</b>${o?`<em>${o} overdue</em>`:"<span></span>"}</div>`}).join("");
$("fcm").innerHTML='<option value="">All committees</option>'+CMS.map(m=>`<option ${m==F.cm?"selected":""}>${esc(m)}</option>`).join("");
const q=$("q").value.toLowerCase();
const rows=dS.filter(r=>(!F.st||r.status==F.st)&&(!F.cm||cms(r).includes(F.cm))&&(!q||((r.no||"")+" "+(r.title||"")+" "+(r.author||"")).toLowerCase().includes(q)))
.sort((x,y)=>{const a=val(x,sort.k),b=val(y,sort.k);return (a>b?1:a<b?-1:0)*sort.d});
curRows=rows;for(const id of [...sel])if(!data.some(d=>d.id==id))sel.delete(id);
$("bd").hidden=!sel.size;$("bd").textContent="Delete selected ("+sel.size+")";$("sa").checked=!!rows.length&&rows.every(r=>sel.has(r.id));
$("chips").innerHTML=(F.st?`<span class="chip" onclick="setF('st','')">${esc(F.st)} ✕</span>`:"")+(F.cm?`<span class="chip" onclick="setCm('')">${esc(F.cm)} ✕</span>`:"");
$("cnt").textContent=rows.length+" of "+dS.length+" shown";
$("tb").innerHTML=rows.length?rows.map(r=>{const X=alx(r),a=X.a,cl=alCls(a),tip=X.why.length?X.why.join(" "):a;
return `<tr><td style="white-space:nowrap"><div style="display:flex;align-items:center;gap:2px"><input type="checkbox" ${sel.has(r.id)?"checked":""} onchange="selOne(${r.id},this.checked)"><button onclick="openForm(${r.id})">Edit</button><button class="d" onclick="del(${r.id})">Delete</button></div></td><td class="t">${r.no?`<b>${esc(r.no)}</b> · `:""}${esc(r.title)}${r.remarks?`<br><small>${esc(r.remarks)}</small>`:""}</td><td>${esc(r.type)}</td><td>${esc(r.author)||"–"}</td><td>${cms(r).map(m=>`<div>${esc(m)}</div>`).join("")||"–"}</td>
<td><select onchange="setStatus(${r.id},this.value)">${(r.status&&!ST.includes(r.status)?[r.status,...ST]:ST).map(s=>`<option ${s==r.status?"selected":""}>${esc(s)}</option>`).join("")}</select></td>
<td style="white-space:nowrap">${fmtDate(r.filed)||"–"}</td><td>${(r.sessions||[]).map(d=>`<div style="white-space:nowrap">${esc(fmtDate(d))}</div>`).join("")||"–"}</td><td style="white-space:nowrap">${esc(fmtDate(r.mayor))||"–"}</td><td>${rep(r)}</td><td>${dp(r)??"–"}</td><td>${dls(r)??"–"}</td><td><span class="al" tabindex="0" role="button" aria-label="${esc(a+". "+tip)}" onclick="this.classList.toggle('open')" onkeydown="if(event.key=='Enter'||event.key==' '){event.preventDefault();this.classList.toggle('open')}" onblur="this.classList.remove('open')"><span class="pill ${cl}">${a}</span>${X.tags.length?`<small class="at">${X.tags.join(" + ")}</small>`:""}<span class="tip" role="tooltip">${X.why.length?X.why.map(w=>`<div>${esc(w)}</div>`).join(""):esc(a)}</span></span></td>
</tr>`}).join(""):`<tr><td colspan="13" class="empty">No measures found.</td></tr>`}
function setStatus(id,s){const r=data.find(x=>x.id==id);if(!r)return;const was=r.status;r.status=s;r.stageDate=today();
if(APPR.includes(s)){if(!r.mayor)r.mayor=today()}else if(APPR.includes(was))r.mayor="";
render();sync(r).then(ok=>{if(!ok)load()})}
function selOne(id,on){on?sel.add(id):sel.delete(id);render()}
function selAll(on){curRows.forEach(r=>on?sel.add(r.id):sel.delete(r.id));render()}
function delSel(){const n=sel.size;if(!n||!confirm("Delete "+n+" selected agenda item"+(n>1?"s":"")+"? This cannot be undone."))return;
const ids=[...sel],rs=data.filter(x=>sel.has(x.id));data=data.filter(x=>!sel.has(x.id));sel.clear();render();if(!col)return;
SB.from("measures").delete().in("id",ids).select().then(async({data:d,error})=>{
if(error||!d||!d.length){werr(error||{message:"Delete was not permitted."});load();return}
if(d.length<ids.length)load();
const gone=new Set(d.map(x=>x.id));
for(const r of rs)if(gone.has(r.id)){if(r.reportFile)await SB.storage.from("reports").remove([r.reportFile.id]);await wipeFiles(r.id)}})}
function del(id){if(!confirm("Delete this agenda item?"))return;const r=data.find(x=>x.id==id);if(!r)return;
data=data.filter(x=>x.id!=id);render();if(!col)return;
SB.from("measures").delete().eq("id",id).select().then(async({data:d,error})=>{
if(error||!d||!d.length){werr(error||{message:"Delete was not permitted."});load();return}
if(r.reportFile)await SB.storage.from("reports").remove([r.reportFile.id]);
await wipeFiles(id)})}
const M={ft:"title",fy:"type",fa:"author",fst:"status",fd:"filed",fr:"report",fl:"reportLink",fm:"mayor",fk:"remarks"};
function fillTypes(bg){$("fy").innerHTML=TYG.map(g=>`<optgroup label="${esc(g[0])}">${g[1].map(x=>`<option>${esc(x)}</option>`).join("")}</optgroup>`).join("")}
function openForm(id){editId=id||null;const r=id?data.find(x=>x.id==id):{filed:today(),type:sc()?BT[0]:TY[0],status:ST[0],committee:CM[0]};if(id&&!r)return;
fillTypes();$("mt").textContent=id?"Edit agenda":"Add agenda";if(r.type&&![...$("fy").options].some(o=>o.value==r.type))$("fy").add(new Option(r.type));if(r.status&&![...$("fst").options].some(o=>o.value==r.status))$("fst").add(new Option(r.status));for(const k in M)$(k).value=r[M[k]]||"";sess=(r.sessions||[]).slice();drawSess();coms=cms(r).length?cms(r).slice():[CM[0]];drawCom();$("fup").hidden=!AS;$("ff").value="";$("fcur").textContent=r.reportFile?"Current file: "+r.reportFile.name:"";$("dr").classList.add("on");$("dr").scrollTop=0}
function closeForm(){$("dr").classList.remove("on")}
let saving=false;
async function save(){if(saving)return;if(!$("ft").value.trim()){alert("Title is required.");return}
saving=true;try{
const isNew=!editId,r=isNew?{id:Date.now(),stageDate:today()}:data.find(x=>x.id==editId);
if(!r){alert("This item no longer exists.");closeForm();return}
const old=r.status,prev=r.reportFile;let up=null;
for(const k in M)r[M[k]]=$(k).value.trim();
r.sessions=sess.filter(Boolean).sort();r.committees=[...new Set(coms)];r.committee=r.committees.join("; ");delete r.target;
const fl=$("ff").files[0];
if(fl&&AS){try{const u=await AS.upload(fl,r.id);up={id:u.id,name:fl.name};r.reportFile=up}catch(e){alert("File upload failed: "+((e&&e.message)||"not permitted"))}}
if(old!==r.status)r.stageDate=today();
if(isNew)data.unshift(r);
const ok=await sync(r);closeForm();render();
if(ok){if(up&&prev&&prev.id!==up.id&&SB)SB.storage.from("reports").remove([prev.id])}
else{if(up&&SB)SB.storage.from("reports").remove([up.id]);load()}
}finally{saving=false}}
function drawCom(){$("cl").innerHTML=coms.map((c,i)=>`<div style="display:flex;gap:6px"><select onchange="coms[${i}]=this.value">${(CM.includes(c)?CM:[c,...CM]).map(m=>`<option ${m==c?"selected":""}>${esc(m)}</option>`).join("")}</select>${coms.length>1?`<button type="button" class="ghost" onclick="coms.splice(${i},1);drawCom()">✕</button>`:""}</div>`).join("")}
function addCom(){const n=CM.find(m=>!coms.includes(m));if(n){coms.push(n);drawCom()}}
function rep(r){const a=[];if(r.report)a.push(esc(r.report));if(r.reportLink&&/^https?:\/\//i.test(r.reportLink))a.push(`<a href="${esc(r.reportLink)}" target="_blank" rel="noopener">Link</a>`);if(r.reportFile)a.push(`<a href="#" onclick="openFile('${esc(r.reportFile.id)}');return false">${esc(r.reportFile.name)}</a>`);return a.join("<br>")||"–"}
function drawSess(){$("ss").innerHTML=sess.map((d,i)=>`<div style="display:flex;gap:6px"><input type="date" value="${esc(d)}" onchange="sess[${i}]=this.value"><button type="button" class="ghost" onclick="sess.splice(${i},1);drawSess()">✕</button></div>`).join("")||'<small style="color:var(--mut)">No meeting dates yet</small>'}
function addSess(){sess.push(today());drawSess()}
function werr(e){alert("Could not save: "+((e&&e.message)||"you do not have permission to edit."))}
const CFG=typeof SB_CONFIG!=="undefined"?SB_CONFIG:null;
const SB=CFG&&CFG.url&&CFG.key&&!/YOUR-/.test(CFG.url+CFG.key)&&typeof supabase!=="undefined"?supabase.createClient(CFG.url,CFG.key):null;
const toRow=r=>({id:r.id,no:r.no||"",title:r.title,type:r.type||"",author:r.author||"",status:r.status,committee:r.committee||"",filed:r.filed||null,stage_date:r.stageDate||null,mayor:r.mayor||null,report:r.report||null,report_link:r.reportLink||null,report_file:r.reportFile||null,remarks:r.remarks||null,sessions:r.sessions||[],updated_at:new Date().toISOString()});
const fromRow=x=>norm({id:x.id,no:x.no,title:x.title,type:x.type,author:x.author,status:x.status,committee:x.committee,filed:x.filed||"",stageDate:x.stage_date||"",mayor:x.mayor||"",report:x.report||"",reportLink:x.report_link||"",reportFile:x.report_file,remarks:x.remarks||"",sessions:x.sessions||[]});
function sync(r){if(!col)return Promise.resolve(true);return SB.from("measures").upsert(toRow(r)).then(({error})=>{if(error){werr(error);return false}return true})}
async function load(){const{data:d,error}=await SB.from("measures").select("*");if(error){werr(error);return}data=d.map(fromRow);render()}
async function openFile(p){const{data:d,error}=await SB.storage.from("reports").createSignedUrl(p,300);if(error)return werr(error);window.open(d.signedUrl,"_blank","noopener")}
async function wipeFiles(id){const{data:l}=await SB.storage.from("reports").list(String(id));if(l&&l.length)await SB.storage.from("reports").remove(l.map(f=>id+"/"+f.name))}
function showLogin(){$("lg").classList.add("on")}
async function login(){const{error}=await SB.auth.signInWithPassword({email:$("le").value.trim(),password:$("lp").value});if(error){alert(error.message);return}$("lg").classList.remove("on");boot()}
async function boot(){col=true;local=false;document.body.classList.remove("lock");$("so").hidden=false;
AS={upload:async(f,id)=>{const p=id+"/"+Date.now()+"_"+f.name.replace(/[^\w.\-]/g,"_");const{error}=await SB.storage.from("reports").upload(p,f);if(error)throw error;return{id:p}}};
await load();
try{const l=JSON.parse(localStorage.getItem("sbtracker")||"[]");if(l.length&&!data.length&&confirm("Import "+l.length+" entries saved in this browser to the cloud?")){const{error}=await SB.from("measures").upsert(l.map(x=>toRow(norm({...x,reportFile:null}))));if(error)werr(error);else await load()}}catch(e){}
if(!boot.sub){boot.sub=1;SB.channel("measures-live").on("postgres_changes",{event:"*",schema:"public",table:"measures"},load).subscribe()}}
addEventListener("keydown",e=>{if(e.key==="Escape"){closeForm();closeTP()}});
if(SB)document.body.classList.add("lock");
render();
// Re-evaluate Days in Pipeline and alerts when the calendar day rolls over (midnight, or tab wakes up on a new day).
let lastDay=today();const dayCheck=()=>{if(today()!==lastDay){lastDay=today();render()}};
setInterval(dayCheck,60000);document.addEventListener("visibilitychange",()=>{if(!document.hidden)dayCheck()});addEventListener("focus",dayCheck);
if(!SB)alert("Cloud sync is not set up, so this runs in local-only mode. Edit config.js and add your Supabase project URL and anon key.");
else{SB.auth.onAuthStateChange(ev=>{if(ev==="SIGNED_OUT"&&col)location.reload()});
SB.auth.getSession().then(({data:{session}})=>session?boot():showLogin()).catch(showLogin)}

// Colour themes + light/dark mode. Loaded in <head> so the theme is applied before the page paints.
const K="sub pri2 sec acc bg card tx mut bd pri btx btnh lnk ring".split(" ");
const hx=h=>[0,2,4].map(i=>parseInt(h.slice(i,i+2),16));
const mix=(a,b,t)=>{const A=hx(a),B=hx(b);return A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,"0")).join("").toUpperCase()};
function mk(n,d,tint,acc,dk,bg,sf){const k="000000",w="FFFFFF",b0=mix(dk,k,.82);
return{n,d,sw:[tint,acc,dk,bg,sf],
L:[tint,mix(tint,acc,.18),mix(tint,acc,.08),acc,bg,sf,mix(dk,k,.62),mix(dk,k,.2),mix(tint,acc,.3),dk,w,mix(dk,k,.25),mix(dk,k,.18),acc].join(" "),
D:[mix(dk,k,.72),mix(dk,k,.5),mix(dk,k,.62),mix(acc,w,.35),b0,mix(dk,k,.7),mix(tint,w,.55),mix(acc,w,.5),mix(dk,k,.4),mix(acc,w,.4),b0,mix(acc,w,.62),mix(acc,w,.6),mix(acc,w,.35)].join(" ")}}
const TH=[{n:"Classic Gray",d:"Original neutral gray",sw:["F1F3F5","737B86","626C78","F7F8FA","FFFFFF"],L:"F1F3F5 E3E7EB E3E7EB 737B86 F7F8FA FFFFFF 272D35 5B6470 E1E5EA 626C78 FFFFFF 4F5965 505D6C 737B86",D:"303740 3C4652 29313A AAB4C0 171A1F 20252C ECEFF3 B4BCC6 353C46 B6C0CC 20252C D0D7DF C0C8D8 AAB4C0"},
mk("Stormy Morning","Calm blue-gray, professional","E8EEF3","7893A8","405D72","F4F7F9","FFFFFF"),
mk("Blue Eclipse","Deep blue, clean and authoritative","E6EBF4","526D9A","293B60","F4F6FA","FFFFFF"),
mk("Lush Forest","Muted green, fresh and balanced","E8F0E9","63866A","365B3E","F4F7F4","FFFFFF"),
mk("Ink Wash","Minimalist black and white","E9E9E9","555555","252525","F5F5F5","FFFFFF"),
mk("Golden Taupe","Elegant gold and neutral","F0EADF","A48B5C","75613D","F8F6F0","FFFFFF"),
mk("Burnt Sienna","Warm terracotta, inviting","F3E8E1","B97860","86513F","F8F5F2","FFFFFF"),
mk("Chili Spice","Bold red, distinctive","F4E6E6","B94B4B","782C32","F8F5F5","FFFFFF"),
mk("Calm Blue","Soft blue, friendly and professional","E6F0F5","6F9DB8","3F6D89","F3F7F9","FFFFFF"),
mk("Harbor Haze","Muted teal, modern and fresh","E8EFF0","718E91","435F63","F4F7F7","FFFFFF"),
mk("Eucalyptus Grove","Soft green, serene and balanced","E6F0EB","6F9885","426D59","F3F7F4","FFFFFF")];
TH.push({n:"SB Mogpog",d:"Official maroon and gold",sw:["EFEAE5","D4A017","7A1414","F6F5F2","FFFFFF"],L:"EFEAE5 F1E9E7 F3EEEA D4A017 F6F5F2 FFFFFF 252525 6A6A6A E8E4DF 7A1414 FFFFFF 521010 7A1414 7A1414",D:"2A1717 3A2222 321C1C D4A017 1A1010 241616 F2ECEA B9A9A6 3D2A2A A33A3A FFFFFF B84A4A E8A0A0 D4A017"});
const SEM={light:{ok:"#1a7f4b",okbg:"#e3f5ec",warn:"#b42318",warnbg:"#fde8e6",amb:"#8a5a00",ambbg:"#fff3d6",c2:"#e0a100",c3:"#1a7f4b"},dark:{ok:"#5cd18f",okbg:"#17382a",warn:"#ff8a80",warnbg:"#4a201d",amb:"#f0c060",ambbg:"#40330f",c2:"#f0c060",c3:"#5cd18f"}};
let S={t:TH.length-1,m:"auto"};try{S=Object.assign(S,JSON.parse(localStorage.getItem("sbtheme")||"{}"))}catch(e){}
S.t=Math.min(Math.max(+S.t||0,0),TH.length-1);
const mq=matchMedia("(prefers-color-scheme: dark)");
const eff=()=>S.m=="auto"?(mq.matches?"dark":"light"):S.m;
function applyTheme(){const r=document.documentElement,e=eff(),T=TH[S.t]||TH[0],v=T[e=="dark"?"D":"L"].split(" ");
K.forEach((k,i)=>r.style.setProperty("--"+k,"#"+v[i]));
r.style.setProperty("--zb","#"+mix(v[5],v[0],.5));
for(const k in SEM[e])r.style.setProperty("--"+k,SEM[e][k]);
r.style.setProperty("--c1","#"+v[3]);r.style.setProperty("--c4","#"+v[7]);r.style.colorScheme=e;r.dataset.theme=e;
const b=document.getElementById("tpb");if(b)buildTP()}
function saveTheme(){try{localStorage.setItem("sbtheme",JSON.stringify(S))}catch(e){}}
mq.addEventListener&&mq.addEventListener("change",()=>{if(S.m=="auto")applyTheme()});
applyTheme();
function buildTP(){const e=eff(),ix=e=="dark"?"D":"L";
document.getElementById("tpb").innerHTML=`<div><label>Appearance</label><div class="seg">${[["light","Light Mode"],["dark","Dark Mode"],["auto","System Default"]].map(m=>`<button class="${S.m==m[0]?"on":""}" onclick="setMode('${m[0]}')">${m[1]}</button>`).join("")}</div></div>
<div><label>Color theme</label><div class="tg">${TH.map((t,i)=>{const v=t[ix].split(" "),on=S.t==i;return `<button class="tc ${on?"on":""}" onclick="setTheme(${i})" aria-pressed="${on}"><span class="pv" style="background:#${v[4]};border-color:#${v[8]}"><span class="pb" style="background:#${v[0]}"><i style="background:#${v[9]}"></i></span><span class="pc" style="background:#${v[5]};border-color:#${v[8]};border-left-color:#${v[3]}"></span></span><span class="sw">${t.sw.map(h=>`<i style="background:#${h}"></i>`).join("")}</span><b>${i?i+". ":""}${esc(t.n)}</b><small>${esc(t.d)}</small>${on?'<em class="ck">&#10003; Selected</em>':""}</button>`}).join("")}</div></div>`}
function setMode(m){S.m=m;saveTheme();applyTheme()}
function setTheme(i){S.t=i;saveTheme();applyTheme()}
function openTP(){buildTP();const t=document.getElementById("tp");t.classList.add("on");t.scrollTop=0}
function closeTP(){document.getElementById("tp").classList.remove("on")}

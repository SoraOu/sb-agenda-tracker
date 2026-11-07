// Shared sidebar + top bar. Loaded at the top of <body>; each page sets <body data-page="home|legislative|barangay">.
const PAGE=document.body.dataset.page||"home",HOME=PAGE==="home";
const I={home:'<path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"/>',legislative:'<path d="M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h7"/>',barangay:'<path d="M3 11l9-7 9 7M5 10v10h14V10M10 20v-6h4v6"/>'};
const NAV=[["home","index.html","Dashboard"],["legislative","legislative.html","Legislative Documents"],["barangay","barangay.html","Barangay Documents"]];
const TTL=(NAV.find(n=>n[0]===PAGE)||NAV[0])[2];
try{if(localStorage.getItem("sbc")==="1")document.body.classList.add("sbc")}catch(e){}
document.body.insertAdjacentHTML("afterbegin",`<aside class="side" aria-label="Main navigation">
<div class="brand"><img class="logo" alt="Seal of the Sangguniang Bayan of Mogpog" src="logo.jpg"><div class="tx"><b>SB Agenda Tracker</b><small>Sangguniang Bayan<br>Mogpog, Marinduque</small></div></div>
<nav>${NAV.map(n=>`<a href="${n[1]}" title="${n[2]}"${n[0]===PAGE?' class="on" aria-current="page"':""}><svg viewBox="0 0 24 24" aria-hidden="true">${I[n[0]]}</svg><span class="tx">${n[2]}</span></a>`).join("")}</nav>
<button class="sc" type="button" aria-label="Collapse or expand sidebar" onclick="document.body.classList.toggle('sbc');try{localStorage.setItem('sbc',document.body.classList.contains('sbc')?1:0)}catch(e){}">&#8249;&#8249;</button></aside>
<div class="top"><button class="hb ghost" type="button" aria-label="Open menu" onclick="document.body.classList.toggle('sbo')">&#9776;</button>
<h1><small>SB Agenda Tracker / ${TTL}</small>${TTL}</h1>
<span class="dt">${new Date().toLocaleDateString("en-PH",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</span>
${HOME?"":'<input id="q" placeholder="Search title or from\u2026" oninput="render()">'}
<button class="ghost" id="so" hidden onclick="SB.auth.signOut().then(()=>location.reload())">Sign out</button><button class="ghost" onclick="openTP()">&#9881;&#xFE0E; Customize</button><button class="pri" id="ab" onclick="openForm()">+ Add Agenda</button></div>`);

// Shared top bar. Loaded at the top of <body>; each page sets <body data-page="home|legislative|barangay">.
const PAGE=document.body.dataset.page||"home",HOME=PAGE==="home";
const NAV=[["home","index.html","Dashboard"],["legislative","legislative.html","Legislative Documents"],["barangay","barangay.html","Barangay Documents"]];
const TTL=(NAV.find(n=>n[0]===PAGE)||NAV[0])[2];
document.body.insertAdjacentHTML("afterbegin",`<header class="top"><a class="brand" href="index.html"><img class="logo" alt="Seal of the Sangguniang Bayan of Mogpog" src="logo.jpg"><span class="bt"><b>Sangguniang Bayan of Mogpog</b><small>Agenda Tracker</small></span></a>
<nav aria-label="Main navigation">${NAV.map(n=>`<a href="${n[1]}"${n[0]===PAGE?' class="on" aria-current="page"':""}>${n[2]}</a>`).join("")}</nav>
<div class="act"><button class="ghost" id="so" hidden onclick="SB.auth.signOut().then(()=>location.reload())">Sign out</button><button class="ghost" onclick="openTP()">Customize</button><button class="pri" id="ab" onclick="openForm()">Add agenda</button></div></header>
<div class="ph"><h1>${TTL}</h1><span class="dt">${new Date().toLocaleDateString("en-PH",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</span>${HOME?"":'<input id="q" type="search" aria-label="Search" placeholder="Search title or from" oninput="render()">'}</div>`);

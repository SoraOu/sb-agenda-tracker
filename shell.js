// Shared page header + navigation. Loaded at the very top of <body> so it appears without flicker.
// Each page declares which one it is with <body data-page="home|legislative|barangay">.
const PAGE=document.body.dataset.page||"home",HOME=PAGE==="home";
const NAV=[["home","index.html","Home"],["legislative","legislative.html","Legislative Documents"],["barangay","barangay.html","Barangay Documents"]];
document.body.insertAdjacentHTML("afterbegin",`<div class="top"><img class="logo" alt="Seal of the Sangguniang Bayan of Mogpog" src="logo.jpg"><h1>Sangguniang Bayan Agenda Tracker<small>Track agenda items from filing to final action</small></h1>
${HOME?'':'<input id="q" placeholder="Search title or from…" oninput="render()">'}
<button class="ghost" id="so" hidden onclick="SB.auth.signOut().then(()=>location.reload())">Sign out</button><button class="ghost" onclick="openTP()">&#9881;&#xFE0E; Customize</button><button class="pri" id="ab" onclick="openForm()">+ Add Agenda</button></div>
<nav class="nav">${NAV.map(n=>`<a href="${n[1]}"${n[0]===PAGE?' class="on" aria-current="page"':''}>${n[2]}</a>`).join("")}</nav>`);

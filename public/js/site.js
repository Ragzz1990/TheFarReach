
const APP=window.FAR_REACH_DATA||{};
const $=s=>s?document.querySelector(s):null, $$=s=>s?[...document.querySelectorAll(s)]:[], money=n=>"₡"+Number(n||0).toLocaleString();
const safe=(name,fn)=>{try{fn()}catch(e){console.error("[Far Reach] "+name,e)}};
const fill=(el,arr)=>{if(el)el.innerHTML=(arr||[]).map(x=>`<option>${x}</option>`).join("")};
const detail=(img,title,tag,body,stats,priceLabel="",price="")=>`<img src="${img}" alt="${title}" onerror="this.style.display='none'"><div class="detail-body"><span class="tag">${tag||""}</span><h2>${title}</h2><p>${body||""}</p><div class="stat-grid">${(stats||[]).map(([a,b])=>`<div><small>${a}</small><strong>${b}</strong></div>`).join("")}</div>${price?`<div class="buyline"><span>${priceLabel}</span><span class="price">${price}</span></div>`:""}</div>`;

safe("nav",()=>{
  $("#navToggle")?.addEventListener("click",()=>$("#nav")?.classList.toggle("open"));
  $$("nav a").forEach(a=>{if(location.pathname===new URL(a.href).pathname)a.classList.add("active");a.addEventListener("click",()=>$("#nav")?.classList.remove("open"))});
});

safe("home",()=>{
  const fc=$("#factionCards"); if(fc) fc.innerHTML=(APP.factions||[]).map(([n,d])=>`<article><span>FACTION</span><h3>${n}</h3><p>${d}</p></article>`).join("");
});

safe("play",()=>{
  $$(".tab").forEach(b=>b.addEventListener("click",()=>{$$(".tab").forEach(x=>x.classList.remove("active"));$$(".tool").forEach(x=>x.classList.remove("active"));b.classList.add("active");$("#"+b.dataset.tab)?.classList.add("active")}));
  fill($("#charPeople"),APP.people);fill($("#charBackground"),APP.backgrounds);fill($("#charCareer"),Object.keys(APP.careers||{}));
  const refresh=()=>fill($("#charSpec"),APP.careers?.[$("#charCareer")?.value]||[]);$("#charCareer")?.addEventListener("change",refresh);refresh();
  fill($("#crewShip"),(APP.ships||[]).map(s=>s.name));
  $("#saveCharacter")?.addEventListener("click",()=>{let o=$("#charOutput"),c={name:$("#charName")?.value||"Unnamed Traveller",people:$("#charPeople")?.value||"",career:$("#charCareer")?.value||"",spec:$("#charSpec")?.value||"",bg:$("#charBackground")?.value||"",level:+($("#charLevel")?.value||1)};localStorage.setItem("farReachCharacter",JSON.stringify(c));if(o)o.innerHTML=`<h3>${c.name}</h3><p>Level ${c.level} ${c.people} ${c.career} — ${c.spec}<br>${c.bg} background</p>`});
  $("#saveCrew")?.addEventListener("click",()=>{let o=$("#crewOutput"),c={name:$("#crewName")?.value||"Unnamed Crew",credits:+($("#crewCredits")?.value||0),heat:+($("#crewHeat")?.value||0),ship:$("#crewShip")?.value||"",notes:$("#crewNotes")?.value||""};localStorage.setItem("farReachCrew",JSON.stringify(c));if(o)o.innerHTML=`<h3>${c.name}</h3><p>${c.ship} • ${money(c.credits)} • Heat ${c.heat}/100</p>`});
  $("#rollDice")?.addEventListener("click",()=>{let sides=+($("#dieType")?.value?.slice(1)||20),count=+($("#dieCount")?.value||1),mod=+($("#dieMod")?.value||0),rolls=Array.from({length:count},()=>1+Math.floor(Math.random()*sides)),total=rolls.reduce((a,b)=>a+b,0)+mod;if($("#diceResult"))$("#diceResult").innerHTML=`${total}<div class="sub">${rolls.join(" + ")} ${mod?((mod>0?"+":"")+mod):""}</div>`});
});

safe("rules",()=>{
  const grid=$("#rulesGrid"), search=$("#rulesSearch"); if(!grid||!search)return;
  const render=()=>{const q=search.value.toLowerCase();grid.innerHTML=(APP.rules||[]).filter(r=>(r.title+" "+r.tag+" "+r.body).toLowerCase().includes(q)).map(r=>`<article><span>${r.tag}</span><h3>${r.title}</h3><p>${r.body}</p></article>`).join("")};search.addEventListener("input",render);render();
});

safe("characters",()=>{
  const grid=$("#careerCards"),search=$("#careerSearch");if(grid&&search){const render=()=>{const q=search.value.toLowerCase();grid.innerHTML=Object.entries(APP.careers||{}).filter(([c,s])=>(c+" "+s.join(" ")).toLowerCase().includes(q)).map(([c,s])=>`<article><span>CAREER</span><h3>${c}</h3><p>${s.join(" • ")}</p></article>`).join("")};search.addEventListener("input",render);render()}
  const pl=$("#peopleList");if(pl)pl.innerHTML=(APP.people||[]).map(x=>`<span>${x}</span>`).join("");
  const bl=$("#backgroundList");if(bl)bl.innerHTML=(APP.backgrounds||[]).map(x=>`<span>${x}</span>`).join("");
});

safe("galaxy",()=>{
  const planets=APP.planets||[],region=$("#planetRegion"),black=$("#planetBlack"),search=$("#planetSearch"),markers=$("#planetMarkers"),routes=$("#routeLayer"),panel=$("#planetDetail");if(!region||!black||!search||!markers||!routes||!panel)return;
  region.innerHTML='<option value="">All regions</option>'+[...new Set(planets.map(p=>p.region))].sort().map(x=>`<option>${x}</option>`).join("");
  black.innerHTML='<option value="">All black-market levels</option>'+[...new Set(planets.map(p=>p.blackMarket))].sort().map(x=>`<option>${x}</option>`).join("");
  const seen=new Set();planets.forEach((p,i)=>planets.map((q,j)=>({q,j,d:Math.hypot(p.x-q.x,p.y-q.y)})).filter(o=>o.j!==i).sort((a,b)=>a.d-b.d).slice(0,2).forEach(o=>{let key=[i,o.j].sort((a,b)=>a-b).join("-");if(seen.has(key))return;seen.add(key);let l=document.createElementNS("http://www.w3.org/2000/svg","line");l.setAttribute("x1",p.x);l.setAttribute("y1",p.y);l.setAttribute("x2",o.q.x);l.setAttribute("y2",o.q.y);routes.appendChild(l)}));
  const show=(p,b)=>{$$(".planet-marker").forEach(x=>x.classList.remove("active"));b?.classList.add("active");panel.innerHTML=detail(p.image,p.name,p.region,p.lore,[["WEALTH",p.wealth],["LAW",p.law],["INDUSTRY",p.industry],["CONTROL",p.faction],["BLACK MARKET",p.blackMarket],["REGION",p.region]])+`<div class="detail-body"><h4>Exports</h4><div class="trade-tags">${(p.exports||[]).map(x=>`<span>${x}</span>`).join("")||"<span>Unknown</span>"}</div><h4>Imports</h4><div class="trade-tags">${(p.imports||[]).map(x=>`<span>${x}</span>`).join("")||"<span>Unknown</span>"}</div><h4>Local Rumour</h4><p class="rumour">“${p.rumour}”</p><h4>Adventure Hooks</h4><div class="trade-tags">${(p.hooks||[]).map(x=>`<span>${x}</span>`).join("")}</div></div>`};
  const render=()=>{let q=search.value.toLowerCase(),r=region.value,bm=black.value;markers.innerHTML="";let list=planets.filter(p=>(!q||(p.name+" "+p.region+" "+p.faction+" "+p.industry+" "+p.lore).toLowerCase().includes(q))&&(!r||p.region===r)&&(!bm||p.blackMarket===bm));list.forEach(p=>{let b=document.createElement("button");b.className="planet-marker";b.dataset.name=p.name;b.style.left=p.x+"%";b.style.top=p.y+"%";b.onclick=()=>show(p,b);markers.appendChild(b)});if(list.length)show(list[0],markers.firstChild)};[search,region,black].forEach(x=>x.addEventListener(x.tagName==="INPUT"?"input":"change",render));render();
});

function setupCatalogue(data,cfg,kind){
  const search=$(cfg.search),f1=$(cfg.f1),f2=$(cfg.f2),budget=$(cfg.budget),grid=$(cfg.grid),panel=$(cfg.detail);if(!search||!grid||!panel)return;
  const field1=kind==="ship"?"role":"cat",field2=kind==="ship"?null:"law";
  if(f1)f1.innerHTML=(f1.options[0]?.outerHTML||"<option>All</option>")+[...new Set(data.map(x=>x[field1]).filter(Boolean))].sort().map(x=>`<option>${x}</option>`).join("");
  if(f2)f2.innerHTML=(f2.options[0]?.outerHTML||"<option>All</option>")+[...new Set(data.map(x=>x[field2]).filter(Boolean))].sort().map(x=>`<option>${x}</option>`).join("");
  const show=x=>{panel.innerHTML=kind==="ship"?detail(x.image,x.name,x.law,x.desc,[["CLASS",x.cls],["ROLE",x.role],["MIN CREW",x.minCrew],["IDEAL CREW",x.idealCrew],["MAX CREW",x.maxCrew],["CARGO",x.cargo],["HULL",x.hull],["SHIELDS",x.shields],["DEFENCE",x.defense],["THRUST",x.thrust],["HANDLING",(x.handling>=0?"+":"")+x.handling],["HARDPOINTS",x.hardpoints],["MODULES",x.modules]],"BASE PRICE",money(x.price)):detail(x.image,x.name,x.law,x.desc,[["CATEGORY",x.cat],["RARITY",x.rarity],["STAT",x.stat],["LEGALITY",x.law]],"TYPICAL PRICE",money(x.price))};
  const render=()=>{let q=search.value.toLowerCase(),v1=f1?.value||"",v2=f2?.value||"",max=budget?+(budget.value||0):0;grid.innerHTML="";let list=data.filter(x=>(!q||(x.name+" "+(x.role||"")+" "+(x.cat||"")+" "+(x.stat||"")).toLowerCase().includes(q))&&(!v1||x[field1]===v1)&&(!v2||x[field2]===v2)&&(!max||x.price<=max));list.forEach(x=>{let e=document.createElement("article");e.className="catalogue-card";e.innerHTML=`<img src="${x.image}" alt="${x.name}" onerror="this.style.display='none'"><div class="body"><span class="tag">${x.law}</span><h3>${x.name}</h3><div class="sub">${kind==="ship"?x.cls+" • "+x.role:x.cat+" • "+x.rarity}</div><div class="price">${money(x.price)}</div><div class="sub">${kind==="ship"?"Crew "+x.minCrew+"–"+x.maxCrew+" • Cargo "+x.cargo:x.stat}</div></div>`;e.onclick=()=>show(x);grid.appendChild(e)});if(list.length)show(list[0])};[search,f1,f2,budget].filter(Boolean).forEach(x=>x.addEventListener(x.tagName==="INPUT"?"input":"change",render));render();
}
safe("shipyard",()=>setupCatalogue(APP.ships||[],{search:"#shipSearch",f1:"#shipRole",budget:"#shipBudget",grid:"#shipGrid",detail:"#shipDetail"},"ship"));
safe("stores",()=>{if($("#economyNote"))$("#economyNote").textContent=APP.economyNote||"";setupCatalogue(APP.items||[],{search:"#itemSearch",f1:"#itemCategory",f2:"#itemLaw",grid:"#itemGrid",detail:"#itemDetail"},"item")});
safe("black-market",()=>setupCatalogue(APP.black||[],{search:"#blackSearch",f1:"#blackCategory",f2:"#blackLaw",grid:"#blackGrid",detail:"#blackDetail"},"item"));

safe("run-planner",()=>{
  const o=$("#runOrigin"),d=$("#runDest"),b=$("#planRun");if(!o||!d||!b)return;
  const ps=(APP.planets||[]).filter(p=>p.blackMarket!=="Unknown");fill(o,ps.map(p=>p.name));fill(d,ps.map(p=>p.name));if(d.options.length>5)d.selectedIndex=5;
  const risk={"Low":1.2,"Medium":1.5,"High":2,"Very High":2.6,"Extreme":3.4,"Restricted":3.8};
  b.onclick=()=>{let op=ps.find(p=>p.name===o.value),dp=ps.find(p=>p.name===d.value),[base,name]=($("#runCargo")?.value||"1800|Neon Dust").split("|"),dist=Math.hypot(op.x-dp.x,op.y-dp.y),mult=risk[dp.blackMarket]||1.5,sale=Math.round((+base)*mult*(1+Math.min(.8,dist/100))/100)*100,heat=Math.max(2,Math.round((mult-1)*7+dist/15));$("#runResult").innerHTML=`<h3>${name}: ${op.name} → ${dp.name}</h3><p><strong>Buy:</strong> ${money(base)} / unit<br><strong>Estimated sale:</strong> ${money(sale)} / unit<br><strong>Gross margin:</strong> ${money(sale-base)} / unit<br><strong>Estimated Heat exposure:</strong> ${heat}</p>`};
});

safe("gm",()=>{
  $("#generateJob")?.addEventListener("click",()=>{const emp=["Frontier Authority","Vanta Combine","Free Traders Guild","Hunter's Compact","Blackwake intermediary","Anonymous client"],jobs=["Capture a fugitive","Escort valuable cargo","Run medicine through a blockade","Salvage a dead ship","Investigate a silent colony","Steal a data core","Rescue a kidnapped crew","Negotiate a hostage release"],comp=["a rival crew accepted the same job","the employer is hiding something","the target may be innocent","customs are on alert","the Vein route is unstable","the cargo is not what the manifest says","a syndicate wants the job to fail"],reward=Math.floor(Math.random()*100)*100+1000;$("#jobOutput").innerHTML=`<h3>${jobs[Math.floor(Math.random()*jobs.length)]}</h3><p><strong>Employer:</strong> ${emp[Math.floor(Math.random()*emp.length)]}<br><strong>Reward:</strong> ${money(reward)}<br><strong>Complication:</strong> ${comp[Math.floor(Math.random()*comp.length)]}.</p>`});
});
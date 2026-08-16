import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {createRequire} from "node:module";
const require=createRequire(import.meta.url),api=require("../public/js/bridge-state.js");
const bridge=await readFile(new URL("../public/bridge/index.html",import.meta.url),"utf8"),gm=await readFile(new URL("../public/gm/index.html",import.meta.url),"utf8"),gmScript=await readFile(new URL("../public/js/gm-hologram.js",import.meta.url),"utf8"),bridgeScript=await readFile(new URL("../public/js/bridge.js",import.meta.url),"utf8");

assert.doesNotMatch(bridge,/gmPassword|gmUnlock|ACCESS_HASH|GM TRANSMISSION CONTROL|hidden campaign/i,"public bridge must not expose the DM gate or controls");
for(const id of ["bridgeHologram","hologramText","bridgeAlert","shipMeters","navOrigin","navDestination","bridgeFullscreen"])assert.match(bridge,new RegExp(`id=["']${id}["']`));
assert.match(gm,/id="gmPasswordGate"/);assert.match(gm,/id="gmUnlockForm"/);assert.match(gm,/BRIDGE DISPLAY CONTROL/i);assert.match(gm,/SEND TO BRIDGE/i);assert.match(gm,/LIVE PREVIEW/i);
for(const label of ["RED ALERT","CUSTOMS SCAN","BOUNTY ALERT","BOARDING ALERT","DISTRESS SIGNAL","SHIP DAMAGE","PLANETARY APPROACH"])assert.match(gm,new RegExp(label,"i"));
assert.match(gmScript,/FAR_REACH_SEND_NPC_TO_BRIDGE/);assert.match(gmScript,/farreach:npc-response/);assert.match(bridgeScript,/requestFullscreen/);assert.match(bridgeScript,/setInterval/);assert.match(bridgeScript,/h\.skipToken/);
const defaults=api.normalise();assert.equal(defaults.ship.hull,100);assert.equal(defaults.hologram.active,false);assert.equal(defaults.mode,"NORMAL");
const safe=api.normalise({mode:"RED ALERT",hologram:{active:true,type:"portrait",name:"<script>Voss",image:"https://evil.test/x.png",text:"<b>Hold</b>",speed:"fast"},ship:{hull:140,shields:-5,heat:50}});assert.equal(safe.mode,"RED ALERT");assert.equal(safe.hologram.image,"");assert.doesNotMatch(safe.hologram.name,/[<>]/);assert.doesNotMatch(safe.hologram.text,/[<>]/);assert.equal(safe.ship.hull,100);assert.equal(safe.ship.shields,0);assert.equal(safe.ship.heat,50);
const merged=api.merge(defaults,{hologram:{active:true,text:"Dock 9 clearance granted."}});assert.equal(merged.hologram.active,true);assert.equal(merged.hologram.text,"Dock 9 clearance granted.");assert.equal(merged.ship.name,defaults.ship.name);
const memory=new Map();globalThis.localStorage={getItem:key=>memory.get(key)||null,setItem:(key,value)=>memory.set(key,value)};const published=api.publish({mode:"CUSTOMS",alert:{active:true,title:"CUSTOMS SCAN IN PROGRESS"}});assert.equal(api.read().mode,"CUSTOMS");assert.equal(api.read().alert.title,"CUSTOMS SCAN IN PROGRESS");assert.equal(published.alert.active,true);
console.log("Public bridge separation, GM controls, event coverage, state validation and NPC bridge hook passed.");

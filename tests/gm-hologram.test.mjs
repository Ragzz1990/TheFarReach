import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

const html=await readFile(new URL("../public/gm/index.html",import.meta.url),"utf8");
const script=await readFile(new URL("../public/js/gm-hologram.js",import.meta.url),"utf8");
const expectedHash="76d752c8d9a8931c3ecb5e022a97962c50ed21f75b8297309d81ec6b33705281";

assert.match(script,new RegExp(`ACCESS_HASH=["']${expectedHash}["']`),"the configured DM password hash must remain connected to the gate");
for(const id of ["gmPasswordGate","gmUnlockForm","gmHologramConsole","holoName","holoMessage","holoSpeed","holoTransmit","holoClear","holoPresent","holoLock","holoSpeaker","holoWords","holoStatus"])assert.match(html,new RegExp(`id=["']${id}["']`),`missing ${id}`);
assert.doesNotMatch(html,/npcChatForm|conversationLog|gm-console\.js|gm-simulation\.js|\/api\/gm\/npc-chat/);
assert.doesNotMatch(script,/fetch\s*\(|\/api\/gm\//,"manual console must not contact the AI backend");
assert.match(script,/sessionStorage\.setItem/);assert.match(script,/sessionStorage\.removeItem/);
assert.match(script,/setInterval/);assert.match(script,/slice\(0,\+\+index\)/,"transmission must reveal the words progressively");
assert.match(script,/event\.key==="Escape"/);assert.match(script,/consolePanel\.classList\.add\("presenting"\)/);
console.log("GM hologram password, manual transmission controls, progressive text, presentation and lock structure passed.");

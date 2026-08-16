import assert from "node:assert/strict";
import fs from "node:fs";

const source=fs.readFileSync(new URL("../worker.js",import.meta.url),"utf8");
const worker=(await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`)).default;
const assets={fetch:()=>new Response("asset")};

let response=await worker.fetch(new Request("https://far-reach.test/api/gm/ai-status"),{ASSETS:assets});
let body=await response.json();
assert.equal(response.status,200);
assert.equal(body.online,false);
assert.equal(body.provider,"openai");
assert.equal(body.chatEndpoint,"/api/gm/npc-chat");

response=await worker.fetch(new Request("https://far-reach.test/api/gm/ai-status"),{ASSETS:assets,OPENAI_API_KEY:"server-secret"});
body=await response.json();
assert.equal(body.online,true);

response=await worker.fetch(new Request("https://far-reach.test/api/gm/npc-chat",{method:"POST",body:JSON.stringify({message:"hello"})}),{ASSETS:assets});
assert.equal(response.status,503);

const structured={dialogue:"Controller Harlan here. Identify your vessel and transmit registry.",trustChange:1,suspicionChange:0,fearChange:0,hostilityChange:0,believesPlayer:true,lieSuspected:false,securityAlerted:false,revealedClueIds:[],revealedSecretIds:[]};
let openAiRequest;
const originalFetch=globalThis.fetch;
globalThis.fetch=async(_url,init)=>{openAiRequest=init;return new Response(JSON.stringify({output:[{content:[{type:"output_text",text:JSON.stringify(structured)}]}]}),{status:200})};
const chatPayload={mode:"npc",npcType:"Port Authority Controller",message:"to land at dock 9",profile:{name:"Controller Harlan",people:"Human",lineage:"",occupation:"Port Authority Controller",rank:"Traffic Controller",faction:"Vanta Combine",personality:"Procedural",mood:"Watchful",speakingStyle:"Concise",objective:"Control approaches",knows:"Dock rules",doesNotKnow:"Sealed investigations",secrets:"A private note",rumours:"A stolen freighter arrived",bribable:true,bribeThreshold:400,canCallSecurity:true},world:{planet:"Vanta Prime",location:"Dock 19"},state:{trust:25,suspicion:45,fear:20,greed:35,hostility:10},player:{name:"Captain Voss",shipName:"Pale Hound"},override:"Recognise the ship",history:[{role:"player",text:"request access to port"},{role:"npc",text:"Transmit registry."},{role:"player",text:"to land at dock 9"}]};
response=await worker.fetch(new Request("https://far-reach.test/api/gm/npc-chat",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(chatPayload)}),{ASSETS:assets,OPENAI_API_KEY:"server-secret",OPENAI_MODEL:"test-model"});
body=await response.json();
globalThis.fetch=originalFetch;
assert.equal(response.status,200);
assert.equal(body.source,"openai");
assert.equal(body.model,"test-model");
assert.equal(openAiRequest.method,"POST");
assert.equal(openAiRequest.headers.authorization,"Bearer server-secret");
const apiBody=JSON.parse(openAiRequest.body),sentContext=JSON.parse(apiBody.input[0].content[0].text);
assert.equal(apiBody.text.format.type,"json_schema");
assert.equal(apiBody.text.format.strict,true);
assert.equal(sentContext.npcType,"Port Authority Controller");
assert.equal(sentContext.profile.name,"Controller Harlan");
assert.equal(sentContext.profile.secrets,"A private note");
assert.equal(sentContext.player.shipName,"Pale Hound");
assert.equal(sentContext.history.length,3);
assert.equal(sentContext.history[0].text,"request access to port");

const browserCode=fs.readFileSync(new URL("../public/js/gm-console.js",import.meta.url),"utf8");
assert.doesNotMatch(browserCode,/authorization\s*:|env\.OPENAI_API_KEY|Bearer\s+server-secret|sk-[A-Za-z0-9_-]{12,}/i);
console.log("GM Worker route, secret isolation, OpenAI POST, structured output and full conversation context passed.");

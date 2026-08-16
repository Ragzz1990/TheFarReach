const assert=require("node:assert/strict");
const simulation=require("../public/js/gm-simulation.js");

const messages=[
  "hello",
  "request access to port",
  "to land at dock 9",
  "Have you seen the stolen freighter?",
  "Maybe 500 credits would help you remember.",
  "I am Captain Voss of the Pale Hound."
];
const expectedIntents=["greeting","access","docking","ship","bribe","identity"];
const profile={name:"Controller Harlan",occupation:"Port Authority Controller",rank:"Traffic Controller",bribable:true,bribeThreshold:400,canCallSecurity:true};
const clues=[{id:"freighter",text:"A stolen freighter arrived two hours ago.",status:"Available"}];
const state={trust:25,suspicion:45,fear:20,hostility:10,bribeStatus:"None",securityAlerted:false,ended:false};
const history=[],dialogues=[];

assert.equal(simulation.matchedText("hello",/[\d,]+/),"");
assert.equal(simulation.numberFromText("hello"),0);
assert.equal(simulation.numberFromText("Maybe 1,500 credits"),1500);

messages.forEach((message,index)=>{
  history.push({role:"player",text:message});
  const result=simulation.respond({message,profile,state,clues,history});
  assert.equal(result.intent,expectedIntents[index],message);
  assert.equal(typeof result.response.dialogue,"string",message);
  assert.ok(result.response.dialogue.length>0,message);
  for(const key of ["trustChange","suspicionChange","fearChange","hostilityChange"])assert.equal(typeof result.response[key],"number",`${message}: ${key}`);
  assert.equal(typeof result.response.securityAlerted,"boolean",message);
  dialogues.push(result.response.dialogue);
  history.push({role:"npc",text:result.response.dialogue});
  state.trust+=result.response.trustChange;
  state.suspicion+=result.response.suspicionChange;
  state.fear+=result.response.fearChange;
  state.hostility+=result.response.hostilityChange;
  state.securityAlerted ||= result.response.securityAlerted;
  state.bribeStatus=result.bribeStatus;
});

assert.match(dialogues[1],/vessel|credentials|registry|identification/i);
assert.match(dialogues[2],/Dock 9/i);
assert.match(dialogues[2],/registry|clearance/i);
assert.match(dialogues[3],/stolen freighter arrived/i);
assert.match(dialogues[4],/500 credits|amount|offer/i);
assert.match(dialogues[5],/Voss|identity|registry/i);
assert.equal(state.bribeStatus,"Accepted");
assert.equal(state.securityAlerted,false);
assert.ok(state.trust>25);
assert.ok(state.suspicion>=45);
assert.ok(history.length===messages.length*2,"conversation history must retain each player/NPC exchange");
assert.ok(clues[0].status==="Available","simulation must not mutate canonical clue state directly");

const intentCases={
  greeting:"good evening",
  landing:"request landing clearance",
  docking:"assign us a berth",
  access:"permission to enter the port",
  person:"have you seen this man",
  ship:"where is the courier ship",
  bribe:"I can pay 200 credits",
  threat:"open the gate or else",
  cargo:"question about our cargo manifest",
  bounty:"is there a warrant for Voss",
  information:"tell me information about local conditions"
};
for(const [intent,message] of Object.entries(intentCases))assert.equal(simulation.detectIntent(message,history),intent,message);
console.log(`GM simulation passed ${messages.length} conversation cases, history continuity and ${Object.keys(intentCases).length} intent classes.`);

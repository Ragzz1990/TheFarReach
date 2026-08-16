const assert=require("node:assert/strict");
const simulation=require("../public/js/gm-simulation.js");

const messages=[
  "hello",
  "I need access to Dock 9.",
  "Have you seen the stolen freighter?",
  "Maybe 500 credits would help you remember.",
  "I am Captain Voss of the Pale Hound."
];
const profile={bribable:true,bribeThreshold:400,canCallSecurity:true};
const clues=[{id:"freighter",text:"A stolen freighter arrived two hours ago.",status:"Available"}];
const state={trust:25,suspicion:45,fear:20,hostility:10,bribeStatus:"None",securityAlerted:false,ended:false};

assert.equal(simulation.matchedText("hello",/[\d,]+/),"");
assert.equal(simulation.numberFromText("hello"),0);
assert.equal(simulation.numberFromText("Maybe 1,500 credits"),1500);

const dialogues=[];
for(const message of messages){
  const result=simulation.respond({message,profile,state,clues});
  assert.equal(typeof result.response.dialogue,"string",message);
  assert.ok(result.response.dialogue.length>0,message);
  for(const key of ["trustChange","suspicionChange","fearChange","hostilityChange"])assert.equal(typeof result.response[key],"number",`${message}: ${key}`);
  assert.equal(typeof result.response.securityAlerted,"boolean",message);
  dialogues.push(result.response.dialogue);
  state.trust+=result.response.trustChange;
  state.suspicion+=result.response.suspicionChange;
  state.fear+=result.response.fearChange;
  state.hostility+=result.response.hostilityChange;
  state.securityAlerted ||= result.response.securityAlerted;
  state.bribeStatus=result.bribeStatus;
}

assert.equal(state.bribeStatus,"Accepted");
assert.doesNotMatch(dialogues[1],/offer|bribe|credits/i,"Dock 9 must not be treated as a bribe");
assert.match(dialogues[2],/stolen freighter arrived/i);
assert.match(dialogues[3],/500 credits/i);
assert.equal(state.securityAlerted,false);
assert.ok(state.trust>25);
assert.ok(state.suspicion>=45);
assert.ok(clues[0].status==="Available","simulation must not mutate canonical clue state directly");
console.log(`GM local simulation passed ${messages.length} dialogue cases with state tracking intact.`);

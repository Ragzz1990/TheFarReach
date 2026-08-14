
const $=s=>document.querySelector(s);
const finger=$("#fingerButton"),eye=$("#eyeButton"),fs=$("#fingerStage"),es=$("#eyeStage"),p=$("#bioProgress"),msg=$("#bioMessage"),title=$("#bioTitle");
const c=[$("#c1"),$("#c2"),$("#c3"),$("#c4"),$("#c5")];
const set=(i,t)=>{c[i].textContent=t;c[i].classList.add("ok")};
const enter=()=>location.href="/home/";
$("#skipGate").onclick=enter;
finger.onclick=()=>{
  finger.disabled=true;fs.classList.add("scanning");msg.textContent="SCANNING RIDGE PATTERN...";p.style.width="18%";
  setTimeout(()=>{set(0,"MATCHED");p.style.width="31%"},650);
  setTimeout(()=>{set(1,"STABLE");p.style.width="43%";fs.classList.remove("scanning");es.classList.remove("locked");eye.disabled=false;$("#eyeCaption").textContent="CLICK EYE TO BEGIN RETINAL SCAN";msg.textContent="RETINAL AUTHENTICATION REQUIRED."},1350);
};
eye.onclick=()=>{
  eye.disabled=true;es.classList.add("eye-scanning");p.style.width="58%";msg.textContent="CAPTURING RETINAL MAP...";
  setTimeout(()=>{set(2,"CLEAR");p.style.width="70%"},600);
  setTimeout(()=>{set(3,"MATCH");p.style.width="84%"},1150);
  setTimeout(()=>{set(4,"LEVEL 5");p.style.width="100%";title.innerHTML='ACCESS<br><span>GRANTED</span>';msg.textContent="ENTERING FAR REACH..."},1750);
  setTimeout(enter,2700);
};
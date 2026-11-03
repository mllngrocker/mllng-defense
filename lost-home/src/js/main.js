/* ---------- boot + main loop ---------- */
resizeStage();measureHud();addEventListener('resize',()=>{resizeStage();measureHud();});
bear.hp=MAXHP();applyTheme();questDot();lobbyText();renderPanel();updateHud();offlineReward();
let last=performance.now(),saveT=10,hudT=0;
function frame(now){requestAnimationFrame(frame);const raw=Math.min(.1,(now-last)/1000);last=now;const t=now/1000;
 if(screen==='lobby'){drawLobby(t);return;}
 let dt=Math.min(raw,1/20);if(hitstop>0){hitstop-=dt;dt*=.08;}shake=Math.max(0,shake-raw*30);
 step(dt);render(t);
 hudT-=raw;if(hudT<0){hudT=.25;updateHud();}
 saveT-=raw;if(saveT<0){saveT=10;save();}}
document.addEventListener('visibilitychange',()=>{if(document.hidden)save();});
requestAnimationFrame(frame);

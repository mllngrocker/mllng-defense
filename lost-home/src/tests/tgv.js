const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:412,height:860},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+require('path').join(__dirname,'../../index.html'));await p.waitForTimeout(700);
await p.evaluate(()=>{S.started=true;S.ver3=1;S.named=1;S.inv={hstar:1,katana:2,rebar:3,surf:2,nailed:1,pirate:1,os:1,spine1:1};S.eq={w:'hstar',c:'pirate',a1:'spine1',a2:'os'};S.stone=13;goGame();$('#modal').hidden=true;document.querySelector('#nav button[data-t="gear"]').click()});await p.waitForTimeout(500);
await p.screenshot({path:'GV1.png'});await p.evaluate(()=>document.querySelectorAll('.gtb')[1].click());await p.waitForTimeout(300);await p.screenshot({path:'GV2.png'});
console.log(errs.join('|')||'no errors');await b.close()})();

const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();for(const [w,h] of [[355,610],[412,770]]){const p=await b.newPage({viewport:{width:w,height:h},deviceScaleFactor:2});
await p.goto('file://'+require('path').join(__dirname,'../../index.html'));await p.waitForTimeout(700);await p.evaluate(()=>{S.started=true;S.ver3=1;S.named=1;S.name='엄준식';S.lv=47;goGame();$('#modal').hidden=true});await p.waitForTimeout(1500);
console.log(w,h,await p.evaluate(()=>JSON.stringify({OY,fh:$('#field').offsetHeight,fw:$('#field').offsetWidth,rows:[...document.querySelectorAll('#list .row')].slice(0,3).map(r=>Math.round(r.getBoundingClientRect().bottom)),listB:Math.round($('#list').getBoundingClientRect().bottom)})));
await p.screenshot({path:`VP_${w}x${h}.png`});await p.close()}await b.close()})();

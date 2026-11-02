const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:400,height:860}});const errs=[];p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await p.goto('file://'+require('path').join(__dirname,'../../index.html'));await p.waitForTimeout(800);
await p.evaluate(()=>{S.started=true;S.ver3=1;S.lv=40;goGame();$('#modal').hidden=true;window._hb=hurtBear;hurtBear=function(d){window._dmg=(window._dmg||0)+d}});
const out=[];
for(const [g,tp,idx] of [[99,'barkas',0],[99,'barkas',1],[129,'lilith',0],[129,'lilith',1],[169,'xenos',0],[169,'xenos',1],[199,'mega1',0],[199,'mega3',0]]){
 await p.evaluate(([g,tp,idx])=>{S.g=g;mobs=[];mode='farm';enterBoss();bskIdx=idx},[g,tp,idx]);await p.waitForTimeout(2600);
 await p.evaluate(tp=>{const m=mobs.find(q=>!q.dead&&q.boss);if(m&&tp!==m.type){m.type=tp;m.fr=mobFrames(tp,m.s)}if(m)m.x=bear.x+60;bskCd=0},tp);
 await p.waitForTimeout(250);await p.screenshot({path:`BS_${tp}${idx}_a.png`,clip:{x:16,y:70,width:368,height:308}});
 await p.waitForTimeout(900);await p.screenshot({path:`BS_${tp}${idx}_b.png`,clip:{x:16,y:70,width:368,height:308}});out.push(`BS_${tp}${idx}`)}
console.log(out.join(','));console.log(await p.evaluate(()=>window._dmg),errs.slice(0,4).join('\n')||'no errors');await b.close()})();

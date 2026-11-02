const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();p.on('pageerror',e=>console.log('ERR',e.message));await p.goto('file://'+require('path').join(__dirname,'../../index.html'));await p.waitForTimeout(1500);await b.close()})();

const {chromium}=require('C:/Users/PEDRO/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const path=require('node:path');
const fs=require('node:fs');
const {pathToFileURL}=require('node:url');
(async()=>{
 const out=path.resolve(__dirname,'../evidencias-codigo');
 const browser=await chromium.launch({headless:true,channel:'chrome'});
 const page=await browser.newPage({viewport:{width:1260,height:760},deviceScaleFactor:1.5});
 const blocked=[];
 await page.route(/^https?:/,route=>{blocked.push(route.request().url());return route.abort();});
 await page.goto(pathToFileURL(path.join(out,'prototipo-candidaturas.html')).href);
 await page.evaluate(()=>document.fonts.ready);
 await page.locator('#prototype').screenshot({path:path.join(out,'prototipo-candidaturas.png')});
 const texts=await page.locator('#prototype').innerText();
 if(!texts.includes('Candidato de demonstração')||!texts.includes('Em Análise')||!/candidatos inscritos \(1\)/i.test(texts))throw new Error('Conteúdo esperado ausente');
 fs.writeFileSync(path.join(out,'prototipo-candidaturas-validacao.json'),JSON.stringify({expected_text_present:true,selected_status:await page.locator('select').inputValue(),backend_calls:0,blocked_network_requests:blocked},null,2));
 await browser.close();console.log('Protótipo capturado e conferido sem chamadas ao backend.');
})();

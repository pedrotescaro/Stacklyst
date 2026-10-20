import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';
const require=createRequire('C:/Users/PEDRO/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/package.json');
const {chromium}=require('playwright');
const out=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../evidencias-codigo');
const {items}=JSON.parse(await fs.readFile(path.join(out,'evidencias.json'),'utf8'));
const browser=await chromium.launch({headless:true,channel:'chrome'});
const page=await browser.newPage({viewport:{width:1080,height:1000},deviceScaleFactor:1.5});
for(const item of items){
  await page.goto(pathToFileURL(path.join(out,item.id+'.html')).href);
  await page.locator('body').screenshot({path:path.join(out,item.id+'.png')});
}
await browser.close();
console.log(`Capturadas ${items.length} imagens de código.`);

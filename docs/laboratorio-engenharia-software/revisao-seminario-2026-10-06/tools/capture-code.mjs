import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath,pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
const dir=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const items=JSON.parse(await fs.readFile(path.join(dir,'tools/code-evidence.json'),'utf8'));
const browser=await chromium.launch({headless:true,channel:'chrome'});
const page=await browser.newPage({viewport:{width:1100,height:1000},deviceScaleFactor:1.5});
await fs.mkdir(path.join(dir,'codigo'),{recursive:true});
for(const e of items){await page.setViewportSize({width:1100,height:1000});await page.goto(pathToFileURL(path.join(dir,'.build/code',e.id+'.html')).href);const w=await page.evaluate(()=>document.documentElement.scrollWidth);if(w>1100)await page.setViewportSize({width:w+20,height:1000});await page.locator('body').screenshot({path:path.join(dir,'codigo',e.id+'.png')});}
await browser.close();
console.log('Captured '+items.length+' code images');

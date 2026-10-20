import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import crypto from 'node:crypto';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
import sharp from 'sharp';
const R=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const SKILL='C:/Users/PEDRO/.codex/plugins/cache/openai-primary-runtime/presentations/26.905.11957/skills/presentations';
const PY='C:/Users/PEDRO/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe';
const {finalizePresentation}=await import(pathToFileURL(path.join(SKILL,'container_tools/artifact_tool_utils.mjs')).href);
const P=await PresentationFile.importPptx(await FileBlob.load(path.join(R,'.build/Stacklyst-seminario-before-slide-images.pptx')));
const E=JSON.parse(await fs.readFile(path.join(R,'tools/code-evidence.json'),'utf8'));
const files=[];
async function walk(dir){for(const e of await fs.readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())await walk(p);else if(e.name.endsWith('.png'))files.push(p);}}
await walk(path.join(R,'diagramas'));
const mappings=new Map([[3,'UC00'],[4,'AN01'],[5,'AN08A'],[6,'AN08B'],[7,'AN09'],[8,'CL00'],[9,'CL03'],[10,'CL08'],[11,'CL09'],[12,'MR00'],[13,'MR08'],[26,'CL01'],[27,'CL02'],[28,'CL04'],[29,'CL05'],[30,'CL06'],[31,'CL07'],[32,'CL10'],[33,'CL11'],[34,'CL12'],[35,'AN03'],[36,'AN04'],[37,'AN06']]);
E.forEach((e,i)=>mappings.set(14+i,'EV-'+e.id));
const manifest=[];
for(const [num,id] of mappings){
 const s=P.slides.getItem(num-1),isEvidence=num>=14&&num<=23;
 const candidates=files.filter(f=>path.basename(f).startsWith(id+' '));if(candidates.length!==1)throw Error('Missing unique native Astah image: '+id+' '+candidates.length);
 const file=candidates[0],buf=await fs.readFile(file),meta=await sharp(buf).metadata();
 for(const q of [...s.shapes.items]){const pos=q.position;if(pos.top>=158&&pos.top<847&&(!isEvidence||(pos.left<460&&String(q.text)!==E[num-14].meaning)))q.delete();}
 const box=isEvidence?{left:54,top:165,width:370,height:455}:{left:54,top:160,width:1492,height:677};
 const scale=Math.min(box.width/meta.width,box.height/meta.height),w=meta.width*scale,h=meta.height*scale;
 s.images.add({blob:new Uint8Array(buf),contentType:'image/png',alt:'Astah: '+path.basename(file),fit:'contain',position:{left:box.left+(box.width-w)/2,top:box.top+(box.height-h)/2,width:w,height:h}});
 const notes=s.speakerNotes.textFrame.text?.toString?.()??'';
 s.speakerNotes.textFrame.setText((isEvidence?('Fonte do codigo: '+E[num-14].path+'; linhas '+E[num-14].ranges.map(r=>r.join('–')).join(', ')+'. '+E[num-14].meaning):'Diagrama '+id+' do projeto Stacklyst-seminario.asta.')+'\nFonte da imagem: '+path.relative(R,file).replaceAll('\\','/')+'. Exportacao PNG produzida pelo Astah UML.');
 manifest.push({slide:num,id,file:path.relative(R,file).replaceAll('\\','/'),sha256:crypto.createHash('sha256').update(buf).digest('hex'),originalSize:[meta.width,meta.height],placement:[box.left+(box.width-w)/2,box.top+(box.height-h)/2,w,h]});
}
await fs.mkdir(path.join(R,'.build/slides-astah'),{recursive:true});
const candidate=path.join(R,'.build/candidate-astah.pptx');await (await PresentationFile.exportPptx(P)).save(candidate);
await fs.writeFile(path.join(R,'.build/astah-slide-image-manifest.json'),JSON.stringify(manifest,null,2));
for(let i=0;i<P.slides.items.length;i++){const blob=await P.export({slide:P.slides.getItem(i),format:'png',scale:1});await fs.writeFile(path.join(R,'.build/slides-astah',String(i+1).padStart(2,'0')+'.png'),new Uint8Array(await blob.arrayBuffer()));console.log('Rendered '+(i+1)+'/38');}
await finalizePresentation({workspaceDir:R,candidatePath:candidate,finalPath:path.join(R,'apresentacao/Stacklyst-seminario-Astah-v2.pptx'),pythonExecutable:PY,integrityValidatorPath:path.join(SKILL,'container_tools/inspect_presentation_package_integrity.py'),layoutValidatorPath:path.join(SKILL,'container_tools/inspect_presentation_layout_geometry.py'),layoutArgs:['--expected-slide-size-emu','15240000,8572500','--validate-heading-fit'],fontPolicy:{basis:'reference',families:['Arial'],referencePath:path.join(R,'.build/Stacklyst-seminario-before-slide-images.pptx'),referenceSha256:crypto.createHash('sha256').update(await fs.readFile(path.join(R,'.build/Stacklyst-seminario-before-slide-images.pptx'))).digest('hex')},verifyArtifactToolImport:true,receiptPath:path.join(R,'.build/presentation-validation-astah-v2.json'),requiredNativeTableOwnerSlides:[],requiredNativeChartOwnerSlides:[]});
console.log('33 Astah images embedded; 38 slides finalized');

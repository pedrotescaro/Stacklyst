import fs from 'node:fs/promises';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const R='C:/Users/PEDRO/Documents/DevDeck/docs/laboratorio-engenharia-software/revisao-seminario-2026-10-06';
const P=await PresentationFile.importPptx(await FileBlob.load(R+'/apresentacao/Stacklyst-seminario.pptx'));
await fs.writeFile(R+'/.build/import-snapshot.ndjson',(await P.inspect({kind:'slide,shape,image,notes,layout',maxChars:1000000})).ndjson);
console.log((await P.help('*',{search:'slide.shapes.delete|shape.delete|slide.shapes.items|slide.images.delete',include:['index','examples','notes'],maxChars:6000})).ndjson);
console.log(JSON.stringify(P.slides.getItem(2).shapes.items.map(s=>({id:s.id,position:s.position,text:s.text?.toString()}))).slice(0,1000));

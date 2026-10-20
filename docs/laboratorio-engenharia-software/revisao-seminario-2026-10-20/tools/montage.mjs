import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
const R=path.resolve(import.meta.dirname,'..');
const files=(await fs.readdir(path.join(R,'.build/fonte-slides'))).filter(x=>/png$/i.test(x)).sort((a,b)=>Number(a.match(/\d+/)[0])-Number(b.match(/\d+/)[0]));
for(let j=0;j<files.length;j+=12){
 const group=files.slice(j,j+12),tiles=[];
 for(let k=0;k<group.length;k++){
  const b=await sharp(path.join(R,'.build/fonte-slides',group[k])).resize(400,225).extend({top:0,bottom:25,left:0,right:0,background:'#ddd'}).png().toBuffer();
  tiles.push({input:b,left:k%3*400,top:Math.floor(k/3)*250});
 }
 await sharp({create:{width:1200,height:Math.ceil(group.length/3)*250,channels:3,background:'#ddd'}}).composite(tiles).png().toFile(path.join(R,'.build',`fonte-montagem-${j+1}.png`));
}

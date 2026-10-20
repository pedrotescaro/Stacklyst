import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {Presentation,PresentationFile} from '@oai/artifact-tool';
import sharp from 'sharp';
const R=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const SKILL='C:/Users/PEDRO/.codex/plugins/cache/openai-primary-runtime/presentations/26.905.11957/skills/presentations';
const PY='C:/Users/PEDRO/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe';
const {finalizePresentation}=await import(pathToFileURL(path.join(SKILL,'container_tools/artifact_tool_utils.mjs')).href);
const D=JSON.parse(await fs.readFile(path.join(R,'tools/revision-plan.json'),'utf8'));
const A=JSON.parse(await fs.readFile(path.join(R,'.build/astah-after.json'),'utf8'));
const E=JSON.parse(await fs.readFile(path.join(R,'tools/code-evidence.json'),'utf8'));
const M=JSON.parse(await fs.readFile(path.join(R,'../revisao-astah-2026-09-28/tools/model-data.json'),'utf8'));
const P=Presentation.create({slideSize:{width:1600,height:900}});
const ink='#142B3B',accent='#006C83',muted='#51626D';
const slides=[];
function shape(s,geometry,x,y,w,h,fill='none',stroke=ink,width=1.5){return s.shapes.add({geometry,position:{left:x,top:y,width:w,height:h},fill,line:{fill:stroke,width}});}
function text(s,t,x,y,w,h,size=28,bold=false,color=ink,align='left'){
 const q=shape(s,'textbox',x,y,w,h,'none','none',0);q.text=t;q.text.style={typeface:'Arial',fontSize:size,bold,color,alignment:align,verticalAlignment:'middle',autoFit:'none',insets:{top:0,bottom:0,left:0,right:0}};return q;
}
function slide(title,notes='',subtitle=''){
 const s=P.slides.add();s.background.fill='#FFFFFF';text(s,title,62,32,1480,72,43,true);
 if(subtitle)text(s,subtitle,65,106,1450,48,23,false,muted);
 text(s,String(slides.length+1).padStart(2,'0'),1490,848,50,26,19,false,muted,'right');
 s.speakerNotes.textFrame.setText(notes);slides.push({slide:s,title});return s;
}
function line(s,x1,y1,x2,y2,color=ink,width=1.5,dash=false,arrow=false){
 const q=s.shapes.add({geometry:'line',position:{left:Math.min(x1,x2),top:Math.min(y1,y2),width:Math.max(Math.abs(x2-x1),0.1),height:Math.max(Math.abs(y2-y1),0.1),horizontalFlip:x2<x1,verticalFlip:y2<y1},fill:'none',line:{fill:color,width,style:dash?'dashed':'solid'}});
 // Short open arrowheads are native lines, so the evidence stays editable.
 if(arrow){const ang=Math.atan2(y2-y1,x2-x1),l=10;line(s,x2,y2,x2-l*Math.cos(ang-.45),y2-l*Math.sin(ang-.45),color,width);line(s,x2,y2,x2-l*Math.cos(ang+.45),y2-l*Math.sin(ang+.45),color,width);}
 return q;
}
function actor(s,label,x,y,scale=1){
 shape(s,'ellipse',x+24*scale,y,24*scale,24*scale,'#FFFFFF',ink,2);
 line(s,x+36*scale,y+24*scale,x+36*scale,y+73*scale,ink,2);
 line(s,x+7*scale,y+43*scale,x+65*scale,y+43*scale,ink,2);
 line(s,x+36*scale,y+73*scale,x+10*scale,y+106*scale,ink,2);
 line(s,x+36*scale,y+73*scale,x+62*scale,y+106*scale,ink,2);
 text(s,label,x-55*scale,y+117*scale,182*scale,60*scale,21*scale,false,ink,'center');
}
function uc(s,id,label,x,y,w=360,h=90,fs=22){const q=shape(s,'ellipse',x,y,w,h,'#F3F8FA',accent,2);q.text=id+'\n'+label;q.text.style={typeface:'Arial',fontSize:fs,color:ink,alignment:'center',verticalAlignment:'middle',autoFit:'none',insets:{top:8,bottom:8,left:12,right:12}};return q;}
function classBox(s,name,attrs,ops,x,y,w,h,stereotype=''){
 const box=shape(s,'rect',x,y,w,h,'#FFFFFF',ink,1.6);shape(s,'rect',x,y,w,stereotype?55:38,'#EDF5F7',ink,1.2);
 text(s,(stereotype?'«'+stereotype+'»\n':'')+name,x+10,y+4,w-20,stereotype?48:31,20,true,ink,'center');
 const top=y+(stereotype?64:46), count=attrs.length+ops.length;const f=count>8?16:18;
 if(attrs.length)text(s,attrs.join('\n'),x+11,top,w-22,attrs.length*(f+4)+8,f);
 if(ops.length){const oy=top+(attrs.length?attrs.length*(f+4)+15:0);if(attrs.length)line(s,x,oy-8,x+w,oy-8,ink,1.2);text(s,ops.map(o=>'+ '+o).join('\n'),x+11,oy,w-22,ops.length*(f+4)+8,f);}
 return box;
}
function activity(a){
 const s=slide(a.name,'Processo atual fora do Stacklyst. '+a.purpose+'\nFonte: Stacklyst-seminario.asta / '+a.id+'. '+a.difficulty,a.id+'  Processo atual e responsabilidades');
 const sc=.88,ox=190,oy=158;const tr=(x,y)=>[ox+x*sc,oy+y*sc];
 const laneH=a.lanes.length>1?345:650;
 a.lanes.forEach((l,i)=>{shape(s,'rect',95,oy+i*laneH*sc,1400,laneH*sc,'none','#A2B0B8',1.3);text(s,l,104,oy+i*laneH*sc+12,170,65,20,true,accent);});
 // Draw connectors first, then the nodes, so crossing text is never hidden.
 const N=Object.fromEntries(a.nodes.map(z=>[z[0],z]));
 for(const e of a.edges){const f=N[e[0]],t=N[e[1]],fx=f[3]+f[5]/2,fy=f[4]+f[6]/2,tx=t[3]+t[5]/2,ty=t[4]+t[6]/2;let pts;
  if(e[3])pts=[[fx,fy],...e[3],[tx,ty]];
  else if(Math.abs(fy-ty)<35)pts=[[fx,fy],[tx,ty]];
  else if(Math.abs(fx-tx)<45)pts=[[fx,fy],[tx,ty]];
  else pts=[[fx,fy],[fx,(fy+ty)/2],[tx,(fy+ty)/2],[tx,ty]];
  // Trim the final segment to the target perimeter.
  const last=pts[pts.length-2],tw=t[5]/2+(t[1]==='action'?12/sc:0),th=t[6]/2+(t[1]==='action'?5/sc:0);if(Math.abs(last[0]-tx)>Math.abs(last[1]-ty))pts[pts.length-1]=[tx+(last[0]<tx?-tw:tw),ty];else pts[pts.length-1]=[tx,ty+(last[1]<ty?-th:th)];
  for(let i=1;i<pts.length;i++){const p=tr(...pts[i-1]),q=tr(...pts[i]);line(s,...p,...q,ink,1.7,false,i===pts.length-1);}
  if(e[2]){const next=pts[1];const horizontal=Math.abs(next[0]-fx)>Math.abs(next[1]-fy);const [x,y]=tr(horizontal?fx+(next[0]>fx?30:-70):fx+10,horizontal?fy-34:fy+35);text(s,'['+e[2]+']',x,y,70,23,16,false,accent);}
 }
 for(const z of a.nodes){const [x,y]=tr(z[3],z[4]),w=z[5]*sc,h=z[6]*sc;let q;
  if(z[1]==='action'){q=shape(s,'roundRect',x-12,y-5,w+24,h+10,'#FFFFFF',ink,1.8);q.text=z[2];q.text.style={typeface:'Arial',fontSize:17,color:ink,alignment:'center',verticalAlignment:'middle',autoFit:'none',insets:{top:2,bottom:2,left:4,right:4}};}
  else if(z[1]==='initial')shape(s,'ellipse',x,y,w,h,ink,ink,1);
  else if(z[1]==='final'){shape(s,'ellipse',x-2,y-2,w+4,h+4,'#FFFFFF',ink,1.8);shape(s,'ellipse',x+3,y+3,w-6,h-6,ink,ink,1);}
  else {shape(s,'diamond',x,y,w,h,'#FFFFFF',ink,1.8);if(z[2])text(s,z[2],x-48,y-46,145,36,15,false,ink,'center');}
 }
 text(s,a.difficulty,96,795,1400,40,24,false,muted);
}
function connectBoxes(s,a,b,dash=false){
 const color=dash?'#667F8D':'#486370';
 if(Math.abs(a.y-b.y)<5){const right=a.x<b.x;line(s,right?a.x+a.w:a.x,a.y+a.h/2,right?b.x:b.x+b.w,b.y+b.h/2,color,1.5,dash,dash);}
 else{const down=a.y<b.y,ax=a.x+a.w/2,ay=down?a.y+a.h:a.y,bx=b.x+b.w/2,by=down?b.y:b.y+b.h,mid=(ay+by)/2;
 line(s,ax,ay,ax,mid,color,1.5,dash);line(s,ax,mid,bx,mid,color,1.5,dash);line(s,bx,mid,bx,by,color,1.5,dash,dash);}
}
function classDiagram(id){
 const dg=A.diagrams.find(d=>d.name.startsWith(id+' '));if(!dg)throw Error(id);
 const services=D.services.filter(v=>id==='CL00'?['LessonProgress','JobService','EventService','PostService','XpService','NotificationService'].includes(v.name):v.diagrams.includes(id));
 const entityNodes=(id==='CL12'?[]:dg.presentations).filter(p=>p.type==='Class'&&!D.services.some(s=>s.name===p.model));
 const entities=entityNodes.map(p=>({name:p.model,attrs:(p.attributes||[]).slice(0,3)}));
 const items=[...services.map(s=>({name:s.name,attrs:[],ops:s.ops.map(o=>o[0]+'()'),kind:s.kind})),...entities.map(e=>({...e,ops:[],kind:'entidade'}))];
 const s=slide(dg.name.replace(/^CL\d+ /,''),'Fonte: Stacklyst-seminario.asta / '+id+'. A apresentação resume os atributos para leitura em projeção. O Astah conserva os modelos completos.\n'+services.map(z=>z.path).join('\n'),id+'  Operações e dados sob responsabilidade');
 const cols=items.length<=6?3:4,rows=Math.ceil(items.length/cols),cw=(1450-(cols-1)*38)/cols,rh=Math.min(260,625/rows-28),map={};
 items.forEach((v,i)=>{const x=70+(i%cols)*(cw+38),y=166+Math.floor(i/cols)*(rh+28);map[v.name]={x,y,w:cw,h:rh,v};});
 // Dependencies are the actual service-to-entity links represented in the Astah.
 for(const v of services){for(const en of v.entities){if(!map[en]||!map[v.name])continue;const p=map[v.name],q=map[en];connectBoxes(s,p,q,true);}}
 const entitiesById=Object.fromEntries(entityNodes.map(p=>[p.id,p.model]));
 dg.presentations.filter(p=>p.type==='Association').forEach(l=>{const a=map[entitiesById[l.source]],b=map[entitiesById[l.target]];if(a&&b)connectBoxes(s,a,b);});
 items.forEach(v=>{const q=map[v.name];classBox(s,v.name,v.attrs,v.ops,q.x,q.y,q.w,q.h,v.kind);});
 text(s,'Métodos reais nos serviços e módulos. Entidades mostram atributos essenciais.',72,810,1440,28,22,false,muted);
}
function relational(id){
 const dg=A.diagrams.find(d=>d.name.startsWith(id+' '));const es=dg.presentations.filter(p=>p.type==='Class');
 const s=slide(id==='MR00'?'DER do núcleo do Stacklyst':'DER de vagas e candidaturas','Fonte: prisma/schema.prisma e Stacklyst-seminario.asta / '+id+'. Modelo relacional em notação UML. Atributos selecionados para projeção.',id+'  Chaves e relacionamentos');
 const minx=Math.min(...es.map(p=>p.x)),miny=Math.min(...es.map(p=>p.y)),maxx=Math.max(...es.map(p=>p.x+p.w)),maxy=Math.max(...es.map(p=>p.y+p.h));
 const sx=1450/(maxx-minx),sy=620/(maxy-miny),tx=x=>70+(x-minx)*sx,ty=y=>170+(y-miny)*sy;
 dg.presentations.filter(p=>p.type==='Association').forEach(l=>{const pts=l.points||[];for(let i=1;i<pts.length;i++)line(s,tx(pts[i-1][0]),ty(pts[i-1][1]),tx(pts[i][0]),ty(pts[i][1]),'#486370',1.4);});
 es.forEach(p=>{const x=tx(p.x),y=ty(p.y),w=p.w*sx,h=p.h*sy;shape(s,'rect',x,y,w,h,'#FFFFFF',ink,1.4);const hh=Math.min(40,h*.32);shape(s,'rect',x,y,w,hh,'#EDF5F7',ink,1.2);text(s,p.model,x+4,y+1,w-8,hh-2,id==='MR00'?15:17,true,ink,'center');
 const attrs=(p.attributes||[]).filter(x=>!x.includes('Items:')).slice(0,id==='MR00'?3:6);const f=Math.min(18,(h-hh-8)/attrs.length/1.25);text(s,attrs.join('\n'),x+8,y+hh+4,w-16,h-hh-8,f);});
 text(s,'PK identifica a chave primária. FK identifica a referência a outra tabela. DER completo no Astah.',72,817,1460,30,22,false,muted);
}
async function evidence(e){
 const s=slide(e.id==='AUTO01'?'Notificação automática da candidatura':e.title,'Fonte no commit 9256a4f: '+e.path+'\nLinhas: '+e.ranges.map(r=>r.join('–')).join(', ')+'.\n'+e.meaning+'\nA imagem captura os trechos literais do arquivo local em um visualizador de código, com caminho e números de linha.',e.id==='AUTO01'?'Comportamento interno ligado a UC026':e.id+'  Caso de uso e código correspondente');
 if(e.id==='AUTO01'){
  classBox(s,'JobService',[],['updateApplicationStage()'],60,210,360,140,'objeto TypeScript');
  classBox(s,'NotificationService',[],['create()'],60,440,360,140,'objeto TypeScript');line(s,240,350,240,440,ink,2,false,true);
 }else{
  actor(s,e.actor,190,180,1);uc(s,e.id,e.title,66,400,360,125);line(s,225,294,225,400,ink,2);
 }
 text(s,e.meaning,65,635,360,175,25,false,muted);
 const file=path.join(R,'codigo',e.id+'.png'),buf=await fs.readFile(file),meta=await sharp(buf).metadata();
 const k=Math.min(1060/meta.width,646/meta.height);s.images.add({blob:new Uint8Array(buf),contentType:'image/png',alt:e.path+' '+e.ranges.map(r=>r.join('-')).join(', '),fit:'contain',position:{left:474+(1060-meta.width*k)/2,top:166+(646-meta.height*k)/2,width:meta.width*k,height:meta.height*k}});
}
// Opening and overview.
let s=slide('Stacklyst','Seminário de Laboratório de Engenharia de Software. A base documental é a orientação de 28/09/2026. A rastreabilidade técnica usa o commit 9256a4f.');
text(s,'Processos de negócio,\nmodelos UML e implementação',82,240,1420,210,66,true);
text(s,'Laboratório de Engenharia de Software',85,555,1300,60,32,false,accent);
text(s,'Revisão de 6 de outubro de 2026',85,655,1300,45,27,false,muted);
s=slide('Escopo do sistema apresentado','Comunidades foram retiradas por solicitação da equipe. UC058 e UC059 não têm cadastro independente no código conferido. UC057 é uma operação automática. Os casos remanescentes mantêm os IDs do Astah.');
text(s,'52 casos de uso',75,190,720,85,61,true,accent);
text(s,'Estudo, exercícios, duelos, publicações, mensagens, eventos, vagas e administração.',78,315,1330,115,36);
text(s,'Candidatura à vaga e inscrição no evento são as operações implementadas. A notificação da candidatura acompanha a atualização feita pelo recrutador.',78,495,1350,155,31,false,muted);
text(s,'Comunidades ficam fora do escopo desta entrega.',78,735,1340,55,29,false,muted);
s=slide('Visão geral de casos de uso','Fonte: Stacklyst-seminario.asta / UC00. Os agrupamentos G01–G16 cobrem todos os 52 casos. Os detalhes e associações específicas estão nas vistas UC01–UC11. A autenticação é uma pré-condição, sem include de login em cada caso.','UC00  Agrupamentos das funcionalidades');
D.overview.forEach((g,i)=>{const x=75+(i%4)*380,y=188+Math.floor(i/4)*150;
 actor(s,'',x,y+18,.45);line(s,x+33,y+46,x+72,y+46,ink,1.4);
 uc(s,g[0],g[1],x+72,y,270,105,18);
 text(s,g[3],x-5,y+109,347,27,17,false,muted,'center');});
text(s,'As repetições do mesmo ator representam o mesmo papel. G01 também reúne ações públicas.',78,815,1450,30,21,false,muted);
for(const id of ['AN01','AN08A','AN08B','AN09'])activity(D.activities.find(a=>a.id===id));
for(const id of ['CL00','CL03','CL08','CL09'])classDiagram(id);
relational('MR00');relational('MR08');
for(const e of E)await evidence(e);
s=slide('Relação entre processo e implementação','Síntese para a apresentação. Processos de negócio retratam atividades humanas antes da plataforma. Casos de uso são objetivos dos atores no Stacklyst. Classes e serviços mostram responsabilidades. O código é a evidência de implementação.');
text(s,'Processo de negócio',78,200,600,60,38,true,accent);text(s,'A pessoa define o objetivo, pesquisa, pratica e acompanha o resultado.',78,280,1300,90,33);
text(s,'Comportamento do sistema',78,445,700,60,38,true,accent);text(s,'O caso de uso identifica a interação. O serviço executa a operação e registra o resultado.',78,525,1320,110,33);
text(s,'Os diagramas e as capturas usam os mesmos nomes e referências.',78,748,1400,60,29,false,muted);
// Appendix: all remaining class views and supporting business processes.
s=slide('Diagramas complementares','Material de apoio para perguntas e detalhamento. O conjunto de slides contém todas as vistas CL00–CL12 e as sete atividades de negócio revistas.');text(s,'Classes por domínio e processos\ncomplementares de aprendizagem',80,260,1400,220,57,true);text(s,'Material de apoio para discussão',82,620,1350,70,32,false,accent);
for(const id of ['CL01','CL02','CL04','CL05','CL06','CL07','CL10','CL11','CL12'])classDiagram(id);
for(const id of ['AN03','AN04','AN06'])activity(D.activities.find(a=>a.id===id));
s=slide('Referências','Anotações das Orientações da Profª Patrícia, 28/09/2026. Livro fornecido pelo usuário: Gilleanes T. A. Guedes, UML 2 Uma abordagem prática, seções 4.1, 10.6, 10.22. Astah API oficial: https://members.change-vision.com/javadoc/astah-api/12_0_0/api/en/doc/javadoc/index-all.html');
text(s,'Orientações da Profª Patrícia',80,190,1400,60,36,true);text(s,'Revisão de 28 de setembro de 2026, consolidada no documento fornecido.',80,264,1390,80,29);
text(s,'Gilleanes T. A. Guedes',80,390,1400,60,36,true);text(s,'UML 2 Uma abordagem prática. Classes, decisões e partições de atividade.',80,464,1390,80,29);
text(s,'Código e modelos do Stacklyst',80,590,1400,60,36,true);text(s,'Commit 9256a4f, schema Prisma e projeto Stacklyst-seminario.asta.',80,664,1390,80,29);
await fs.mkdir(path.join(R,'.build/slides'),{recursive:true});await fs.mkdir(path.join(R,'apresentacao'),{recursive:true});
const candidate=path.join(R,'.build/candidate.pptx');await (await PresentationFile.exportPptx(P)).save(candidate);
await fs.writeFile(path.join(R,'.build/deck-proto.json'),JSON.stringify(P.toProto()));
await fs.writeFile(path.join(R,'.build/slide-titles.json'),JSON.stringify(slides.map(v=>v.title)));
for(let i=0;i<slides.length;i++){const blob=await P.export({slide:slides[i].slide,format:'png',scale:1});await fs.writeFile(path.join(R,'.build/slides',String(i+1).padStart(2,'0')+'.png'),new Uint8Array(await blob.arrayBuffer()));console.log('Rendered '+(i+1)+'/'+slides.length);}
const final=path.join(R,'apresentacao/Stacklyst-seminario-revisado.pptx');
await finalizePresentation({workspaceDir:R,candidatePath:candidate,finalPath:final,pythonExecutable:PY,integrityValidatorPath:path.join(SKILL,'container_tools/inspect_presentation_package_integrity.py'),layoutValidatorPath:path.join(SKILL,'container_tools/inspect_presentation_layout_geometry.py'),layoutArgs:['--expected-slide-size-emu','15240000,8572500','--validate-heading-fit'],fontPolicy:{basis:'design',families:['Arial']},verifyArtifactToolImport:true,receiptPath:path.join(R,'.build/presentation-validation.json'),requiredNativeTableOwnerSlides:[],requiredNativeChartOwnerSlides:[]});
console.log('Final PPTX: '+final+'; slides: '+slides.length);

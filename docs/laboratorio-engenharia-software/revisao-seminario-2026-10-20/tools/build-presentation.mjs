import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {pathToFileURL} from 'node:url';
import sharp from 'sharp';
import {Presentation,PresentationFile} from '@oai/artifact-tool';

const R=path.resolve(import.meta.dirname,'..');
const SKILL='C:/Users/PEDRO/.codex/plugins/cache/openai-primary-runtime/presentations/26.1015.12040/skills/presentations';
const PY='C:/Users/PEDRO/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe';
process.env.RUNTIME_NODE_MODULES='C:/Users/PEDRO/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const S=JSON.parse(await fs.readFile(path.join(R,'fontes-extraidas/requisitos-slides.json'),'utf8'));
const V=JSON.parse(await fs.readFile(path.join(R,'fontes-extraidas/visuais-slides.json'),'utf8'));
const E=JSON.parse(await fs.readFile(path.join(R,'evidencias-codigo/evidencias.json'),'utf8'));
const D=JSON.parse(await fs.readFile(path.join(R,'evidencias-codigo/roteiro-demonstracoes.json'),'utf8'));
const P=Presentation.create({slideSize:{width:1920,height:1080}});
const ink='#142B3B',accent='#006C83',muted='#526571';
const slides=[],assets=[],tableSlides=[];
await fs.mkdir(path.join(R,'.build/assets'),{recursive:true});

function text(s,t,x,y,w,h,size=32,bold=false,color=ink,align='left'){
 const q=s.shapes.add({geometry:'textbox',name:'Texto '+String(t).slice(0,50),position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});
 q.text=t;q.text.style={typeface:'Arial',fontSize:size,bold,color,alignment:align,verticalAlignment:'middle',autoFit:'none',insets:{top:0,bottom:0,left:0,right:0}};return q;
}
function slide(title,subtitle='',notes='',owner='Grupo',seconds=45){
 const s=P.slides.add();s.background.fill='#FFFFFF';
 text(s,title,84,38,1750,88,52,true);
 if(subtitle)text(s,subtitle,88,136,1740,44,27,false,accent);
 text(s,String(slides.length+1).padStart(2,'0'),1770,1025,65,28,22,false,muted,'right');
 s.speakerNotes.textFrame.setText(`${owner}. Tempo de referência: ${seconds} segundos.\n${notes}`);
 slides.push({number:slides.length+1,title,subtitle,owner,seconds,notes});return s;
}
async function pic(s,file,box,alt,crop){
 let input=await fs.readFile(file);
 if(crop){const m=await sharp(input).metadata();input=await sharp(input).extract({left:crop.left||0,top:crop.top||0,width:crop.width||m.width,height:crop.height||m.height-(crop.top||0)}).png().toBuffer();}
 const m=await sharp(input).metadata(),scale=Math.min(box.w/m.width,box.h/m.height),w=m.width*scale,h=m.height*scale;
 s.images.add({blob:new Uint8Array(input),contentType:m.format==='jpeg'?'image/jpeg':'image/png',alt,fit:'contain',position:{left:box.x+(box.w-w)/2,top:box.y+(box.h-h)/2,width:w,height:h}});
 assets.push({slide:slides.length,file:path.relative(R,file),sha256:crypto.createHash('sha256').update(await fs.readFile(file)).digest('hex'),crop:crop||null,alt});
}
async function diagram(id,title,subtitle,notes,owner,seconds=40){
 const s=slide(title,subtitle,`Fonte: Stacklyst-seminario-revisado.asta / ${id}. ${notes}`,owner,seconds);
 await pic(s,path.join(R,'diagramas',id+'.png'),{x:82,y:195,w:1756,h:790},id+' '+title);return s;
}
function paragraphs(s,items,x,y,w,{size=32,gap=145,heading=30}={}){
 for(const [i,a] of items.entries()){
  text(s,a[0],x,y+i*gap,w,50,heading,true,accent);
  text(s,a[1],x,y+i*gap+55,w,gap-62,size,false,ink);
 }
}
async function nativeTable(s,values,widths,top,height,font=29){
 const t=s.tables.add({rows:values.length,columns:values[0].length,left:88,top,width:1744,height,values,columnWidths:widths});
 t.rows[0].height=80;
 for(let r=1;r<values.length;r++)t.rows[r].height=(height-80)/(values.length-1);
 t.borders.assign({fill:'#CCD6DC',width:1,style:'solid'});
 for(let r=0;r<values.length;r++)for(let c=0;c<values[0].length;c++){
  const q=t.getCell(r,c);q.fill=r===0?'#142B3B':'#FFFFFF';q.text.style={typeface:'Arial',fontSize:font,bold:r===0,color:r===0?'#FFFFFF':ink,verticalAlignment:'middle',insets:{left:20,right:20,top:17,bottom:17}};
 }
 tableSlides.push(slides.length);return t;
}
async function requirements(index){
 const m=S.modules[index],s=slide('Requisitos e regras na interface',m.usecases.join(' e ')+'  '+m.title,`Fonte: documento 03, seções 4, 5 e 6. RF indicam comportamento. RNF são critérios de aceitação, não resultados de homologação.\n${[...m.RF,...m.RNF,...m.RN].map(x=>x.id+': '+(x.source_description||x.description)).join('\n')}`,m.presenter,90);
 const vals=[['Requisitos funcionais','Requisitos não funcionais','Regras de negócio']];
 vals.push([m.RF.map(x=>x.id+'  '+x.name+'\n'+x.description).join('\n\n'),m.RNF.map(x=>x.id+'  '+x.name+'\n'+x.description).join('\n\n'),m.RN.map(x=>x.id+'  '+x.name+'\n'+x.description).join('\n\n')]);
 await nativeTable(s,vals,[590,570,584],218,650,29);
 text(s,'RF: o que a tela permite fazer. RNF: qualidade e restrições. RN: condições do domínio.',90,915,1730,64,29,false,muted);
}
async function prototype(index,uc,title,explanation){
 const m=S.modules[index],u=V.specific_usecases.find(x=>x.id===uc);
 const isCandidate=uc==='UC026';
 const source=isCandidate?'Protótipo reconstruído a partir do componente RecruiterContent.tsx, painel de candidaturas, com dados de demonstração. Renderização local sem chamada ao backend. Ver evidencias-codigo/prototipo-candidaturas.html.':'Fonte visual: documento 04 / '+uc+', referência visual da especificação. A captura representa a interface documentada.';
 const s=slide(title,m.presenter+'  '+uc,`${source}\n${explanation}`,m.presenter,50);
 await pic(s,isCandidate?path.join(R,'evidencias-codigo/prototipo-candidaturas.png'):u.prototype_path,{x:86,y:202,w:1748,h:755},'Protótipo '+uc+(isCandidate?' com dados de demonstração':''));
 text(s,explanation,90,963,1715,44,28,false,muted);
}
async function usecases(index,ids){
 const m=S.modules[index],s=slide('Casos de uso da funcionalidade',ids.join(' e ')+'  '+m.title,'Fonte: documento 04, seção 4.13. A visão identifica o ator e o objetivo. A ordem das chamadas será explicada no diagrama de sequência.',m.presenter,35);
 for(let i=0;i<ids.length;i++){
  const u=V.specific_usecases.find(x=>x.id===ids[i]),w=ids.length===1?1250:810,x=ids.length===1?335:100+i*900;
  await pic(s,u.diagram_path,{x,y:210,w,h:690},'Caso de uso '+ids[i]);
 }
 text(s,'Sessão autenticada como pré-condição dos fluxos apresentados.',90,935,1700,50,30,false,muted);
}
async function code(id){
 const e=E.items.find(x=>x.id===id),m=S.modules[e.module-1];
 const s=slide(e.title,id+'  Recorte da sequência e trecho correspondente',`Fonte código: ${e.path}, linhas ${e.ranges.map(x=>x.join('–')).join(', ')}. Commit ${E.commit}.\n${e.meaning}\nMensagens do recorte: ${e.sequence_messages.join('; ')}.\nO diagrama usa nomes do domínio em português. A captura preserva os identificadores originais do código.`,m.presenter,70);
 text(s,'Interação',90,202,800,48,31,true,accent);text(s,'Implementação',955,202,870,48,31,true,accent);
 await pic(s,path.join(R,'diagramas',id+'.png'),{x:85,y:270,w:810,h:605},'Recorte do diagrama de sequência '+id);
 await pic(s,e.png,{x:940,y:265,w:900,h:610},'Código real '+e.path);
 text(s,e.meaning,90,902,1725,90,30,false,ink);
}
async function demo(index){
 const d=D.ordem_proposta[index],s=slide('Demonstração prática',d.integrante+'  '+d.modulo,`Roteiro de apresentação.\nPreparar antes:\n${d.preparar_antes.join('\n')}\nExecutar ao vivo:\n${d.executar.join('\n')}\nResultados esperados:\n${d.resultado_esperado.join('\n')}\nContinuidade: ${d.saida_para_o_proximo}`,d.integrante,index===2?230:180);
 paragraphs(s,[['Preparação',d.preparar_antes.slice(0,2).join(' ')],['Execução',d.executar.slice(0,2).join(' ')],['Resultado esperado',d.resultado_esperado.slice(0,2).join(' ')]],95,225,815,{size:31,gap:225,heading:32});
 paragraphs(s,[['Conferência',d.executar.slice(2).join(' ')],['Continuidade',d.saida_para_o_proximo]],1020,225,790,{size:31,gap:330,heading:32});
}

let s=slide('Stacklyst','Laboratório de Engenharia de Software','Apresentar o grupo, o objetivo do sistema e a ordem de demonstração. Os nomes e responsabilidades provêm do documento de visão, seção 5.','Grupo',40);
await pic(s,path.join(R,'fontes-originais/capa-original.png'),{x:92,y:242,w:230,h:190},'Logotipo original do Stacklyst',{left:95,top:105,width:165,height:140});
text(s,'Processos de negócio,\nmodelagem e funcionamento',355,265,1430,190,64,true);
text(s,'Pedro Antonio Silvestre Tescaro\nGuilherme Alves de Campos\nPaulo Henrique Leal dos Santos',96,610,1700,195,36,true);
text(s,'Seminário do projeto',96,920,1700,52,32,false,accent);

s=slide('O projeto e o problema','Estudo de programação e oportunidades profissionais','Fonte: documento 01, problema, objetivos e escopo. A demonstração seleciona aprendizagem e recrutamento. Demais funcionalidades permanecem documentadas.','Grupo',60);
paragraphs(s,[['Necessidade','Organizar o estudo, praticar com retorno e acompanhar a própria evolução.'],['Apoio do sistema','Trilhas e lições conectam conteúdo, exercícios e progresso do estudante.'],['Percurso apresentado','Após a aprendizagem, o grupo publica uma oportunidade, registra a candidatura e acompanha a seleção.'] ],105,240,1690,{size:39,gap:230,heading:35});

s=slide('Ordem da apresentação','A continuidade entre os integrantes orienta a demonstração','Divisão proposta para o ensaio. Diagramas gerais de classes, MER e DER são mostrados somente por Pedro. Todos apresentam protótipo, RF/RNF/RN, classe e banco específicos, sequência completa, sequência com código e prática. Reservar dados auxiliares previamente.','Grupo',45);
await nativeTable(s,[['Responsável','Funcionalidade e continuidade','Tempo'],['Grupo','Projeto, atividades do negócio e casos de uso gerais','9 min'],['Pedro','Lição e exercício, modelos gerais e progresso','13 min'],['Guilherme','Publicar a vaga que será usada na candidatura','12 min'],['Paulo','Candidatura, avanço da seleção e notificação','14 min'],['Grupo','Encerramento e perguntas','7 min']],[390,1110,244],220,670,31);
text(s,'Planejamento de 55 minutos, com 5 minutos de margem até o limite de uma hora.',95,935,1730,55,31,false,muted);

for(const a of S.activities){
 const q=slide(a.name,a.id+'  Atividades do negócio',`Fonte: documento 02 atualizado, seção 3. ${a.purpose}\nO fluxo representa trabalho humano, inclusive fora do sistema. A imagem foi reutilizada do documento, com recorte apenas da aba superior que ainda exibia ${a.old_id_inside_image}. A identificação no slide segue a numeração atual ${a.id}.`,'Grupo',40);
 await pic(q,a.image_path,{x:80,y:205,w:1760,h:745},a.id+' '+a.name,{top:58});
 text(q,a.purpose,90,958,1730,52,28,false,muted);
}

s=slide('Diagrama geral de casos de uso','18 elementos na imagem geral do documento 04','Fonte: documento 04, seção 4.1. Contagem visual: 18 elipses. O inventário escrito contém 56 especificações; a imagem geral é uma visão selecionada. Não confundir quantidade de elementos desta vista com quantidade de especificações. A nota da fonte identifica rótulos históricos UC057/058/059: UC022 candidatura, UC023 participação em evento, UC026 notificação interna. Cadastro e login não exigem sessão. UC011 consulta ranking. Os recortes seguintes ampliam a mesma imagem.','Grupo',45);
await pic(s,V.general.diagram_path,{x:80,y:195,w:1140,h:805},'Diagrama geral original completo, 18 elipses');
paragraphs(s,[['Visão completa da fonte','A imagem está integralmente presente. Os dois slides seguintes ampliam seus elementos.'],['Correspondência atual','UC022: candidatura à vaga.\nUC023: participação em evento.\nUC026: atualização e aviso ao candidato.'],['Leitura dos rótulos','UC057–UC059 são rótulos históricos da imagem. UC011 representa consulta ao ranking.'] ],1260,240,565,{size:29,gap:250,heading:30});

s=slide('Casos de uso gerais: acesso e aprendizagem','Ampliação da imagem do documento 04','Fonte: documento 04, seção 4.1. Parte superior da mesma imagem geral. Cadastrar conta e fazer login são operações públicas. Os demais fluxos protegidos pressupõem sessão.','Grupo',35);
await pic(s,V.general.diagram_path,{x:80,y:200,w:1760,h:735},'Ampliação superior do diagrama geral',{left:70,top:35,width:1320,height:795});
text(s,'Cadastro e login são públicos. A autenticação é pré-condição dos fluxos protegidos.',90,958,1730,50,28,false,muted);
s=slide('Casos de uso gerais: oportunidades e eventos','Ampliação da imagem do documento 04','Fonte: documento 04, seção 4.1 e nota de correspondência. Parte inferior da mesma imagem. UC058 corresponde à candidatura UC022, UC059 à participação UC023. A notificação ao candidato integra UC026.','Grupo',35);
await pic(s,V.general.diagram_path,{x:80,y:200,w:1760,h:735},'Ampliação inferior do diagrama geral',{left:70,top:520,width:1320,height:570});
text(s,'Na especificação atual: UC022 candidatura, UC023 participação e UC026 atualização com aviso.',90,958,1730,50,28,false,muted);

await prototype(0,'UC005','Pedro: estudo de uma lição','No protótipo: conteúdo conceitual e navegação entre as etapas da lição.');
await prototype(0,'UC006','Resposta e confirmação da atividade','No protótipo: enunciado, alternativas, validação da resposta e retorno de XP.');
await requirements(0);
if(process.argv.includes('--preview-prefix')){
 await (await PresentationFile.exportPptx(P)).save(path.join(R,'.build/prefix.pptx'));
 console.log('Prefix preview exported',slides.length);process.exit(0);
}
await diagram('CL00','Diagrama de classes geral','Visão conceitual dos domínios','Explicar os conceitos e as associações. Os rótulos do modelo estão em português. Identificadores de implementação aparecem somente nas capturas de código.',S.modules[0].presenter,70);
await diagram('MER00','Modelo de entidades e relacionamentos geral','MER  Visão conceitual','Explicar entidades, relacionamentos e cardinalidades sem chaves estrangeiras. O DER seguinte apresenta a visão relacional.',S.modules[0].presenter,45);
await diagram('DER00','Diagrama geral do banco de dados','DER  Estrutura completa e chaves','Vista panorâmica das 47 entidades do modelo persistido. Os slides específicos ampliam as tabelas dos fluxos apresentados. PK: chave primária. FK: chave estrangeira. Fonte: prisma/schema.prisma.',S.modules[0].presenter,70);
await usecases(0,['UC005','UC006']);
await diagram('CL01','Classes da aprendizagem','UC005 e UC006  Conceitos e responsabilidades','Distinguir conteúdo do catálogo e registros persistidos. Lição e etapa não devem ser confundidas com tabelas de exercícios de outro fluxo.',S.modules[0].presenter,50);
await diagram('DER01','Banco de dados da aprendizagem','UC005 e UC006  Persistência e progresso','Fonte: Quiz e QuizAttempt no schema e saveLessonAssessment no código. O fluxo apresentado é a lição do catálogo, sem mode=workspace.',S.modules[0].presenter,50);
await diagram('SQ01','Sequência completa: resolver exercício','UC006  Fluxo principal','Percorrer do envio da resposta à exibição do resultado. Explicar as variações nos recortes seguintes: testar não grava conclusão nem concede XP. Indisponibilidade do executor retorna erro controlado. Repetição não duplica recompensa.',S.modules[0].presenter,70);
for(const id of ['SQ01-A','SQ01-B','SQ01-C'])await code(id);
await demo(0);

await prototype(1,'UC017','Guilherme: publicação de vaga','No protótipo: empresa autorizada, dados da oportunidade e comando de publicação.');
await requirements(1);
await usecases(1,['UC017']);
await diagram('CL02','Classes da publicação de vaga','UC017  Empresa, vaga e etapas','Explicar propriedade da empresa e composição das etapas da oportunidade. Usar nomes do domínio em português.',S.modules[1].presenter,55);
await diagram('DER02','Banco de dados da publicação','UC017  Chaves e vínculos','Fonte: Company, Job e RecruitmentStage. A vaga referencia a empresa. Suas etapas são persistidas para o fluxo de seleção.',S.modules[1].presenter,55);
await diagram('SQ02','Sequência completa: publicar vaga','UC017  Da autorização à confirmação','Percorrer validação de papel, vínculo com empresa, criação da vaga e etapas e retorno à interface. Uma rejeição deve impedir a gravação.',S.modules[1].presenter,70);
for(const id of ['SQ02-A','SQ02-B','SQ02-C'])await code(id);
await demo(1);

await prototype(2,'UC022','Paulo: candidatura à vaga','No protótipo: oportunidade aberta e comando de candidatura com o perfil do usuário.');
await prototype(2,'UC026','Protótipo do painel de candidaturas','Dados de demonstração: candidato, situação da candidatura e seletor do recrutador.');
await requirements(2);
await usecases(2,['UC022','UC026']);
await diagram('CL03','Classes da candidatura e do retorno','UC022 e UC026  Vínculos e responsabilidades','Explicar os vínculos de usuário, vaga, etapa, candidatura e notificação. A notificação é consequência da atualização do processo.',S.modules[2].presenter,55);
await diagram('DER03','Banco de dados da candidatura','UC022 e UC026  Integridade dos vínculos','Fonte: JobApplication, User, Job, RecruitmentStage e Notification. A candidatura vincula usuário e vaga. A atualização confere se candidatura e etapa pertencem à mesma vaga.',S.modules[2].presenter,55);
await diagram('SQ03','Sequência completa: candidatar-se','UC022  Da vaga aberta à etapa inicial','Vaga publicada no bloco anterior. Sessão autenticada e ausência de candidatura anterior. O processo cria a candidatura na primeira etapa disponível.',S.modules[2].presenter,65);
await diagram('SQ04','Sequência completa: atualizar candidatura','UC026  Situação e notificação ao candidato','Na prática, o painel altera a situação. A API também aceita etapa e feedback, quando enviados. Mostrar a validação do responsável e dos vínculos antes da persistência. O aviso é destinado ao candidato associado. Falha da notificação não desfaz a alteração principal.',S.modules[2].presenter,65);
for(const id of ['SQ03-A','SQ03-B','SQ03-C'])await code(id);
await demo(2);

s=slide('Percurso demonstrado','Aprendizagem e seleção com continuidade','Retomar os resultados observados durante a apresentação. Não afirmar execução de uma etapa que não tenha sido realizada ao vivo. Convidar perguntas sobre a relação entre requisito, modelo, código e funcionamento.','Grupo',50);
paragraphs(s,[['Aprendizagem','A resposta é avaliada, o progresso é registrado e a primeira conclusão válida pode conceder XP.'],['Oportunidade','Um responsável autorizado publica a vaga e disponibiliza as etapas da seleção.'],['Candidatura e retorno','O candidato ingressa no processo e acompanha a atualização feita pelo recrutador.'] ],100,235,1700,{size:39,gap:235,heading:35});
s=slide('Referências','Documentação, modelos e implementação','Fontes fornecidas pelo grupo. A lousa e as orientações da professora definem a estrutura do seminário. Fontes de imagens e código também estão nas notas dos slides correspondentes.','Grupo',25);
paragraphs(s,[['Documentos do projeto','01 Documento de visão\n02 Atividades do negócio\n03 Requisitos do sistema\n04 Casos de uso'],['Modelagem e implementação','Projeto Astah editável revisado\nCódigo-fonte do Stacklyst e modelo de dados Prisma'],['Orientação do seminário','Sequência e critérios da professora Patrícia, conforme foto da lousa e explicação fornecida pelo grupo.'] ],105,220,1680,{size:34,gap:245,heading:33});

// Distribute the speaking notes within the 55-minute rehearsal plan.
for(const [owner,target] of [[S.modules[0].presenter,780],[S.modules[1].presenter,720],[S.modules[2].presenter,840]]){
 const selected=slides.filter(q=>q.owner===owner);
 const original=selected.reduce((n,q)=>n+q.seconds,0);
 selected.forEach(q=>q.seconds=Math.round(q.seconds*target/original));
 selected.at(-1).seconds+=target-selected.reduce((n,q)=>n+q.seconds,0);
}
slides[49].seconds=395;slides[50].seconds=25;
for(const q of slides)P.slides.items[q.number-1].speakerNotes.textFrame.setText(`${q.owner}. Tempo de referência: ${q.seconds} segundos.${q.number===50?' Inclui o tempo de perguntas do grupo.':''}\n${q.notes}`);
await fs.writeFile(path.join(R,'.build/slides.json'),JSON.stringify(slides,null,2));
await fs.writeFile(path.join(R,'.build/assets.json'),JSON.stringify(assets,null,2));
const candidate=path.join(R,'.build/candidate.pptx');
await (await PresentationFile.exportPptx(P)).save(candidate);
console.log('Candidate exported',slides.length);
if(process.argv.includes('--draft-only'))process.exit(0);
const {finalizePresentation}=await import(pathToFileURL(path.join(SKILL,'container_tools/artifact_tool_utils.mjs')).href);
const final=path.join(R,'apresentacao/Stacklyst-seminario-revisado-2026-10-20.pptx');
await finalizePresentation({workspaceDir:R,candidatePath:candidate,finalPath:final,pythonExecutable:PY,integrityValidatorPath:path.join(SKILL,'container_tools/inspect_presentation_package_integrity.py'),layoutValidatorPath:path.join(SKILL,'container_tools/inspect_presentation_layout_geometry.py'),layoutArgs:['--expected-slide-size-emu','18288000,10287000','--validate-heading-fit',...tableSlides.flatMap(n=>['--require-native-table-slide',String(n)])],fontPolicy:{basis:'design',families:['Arial']},requiredNativeTableOwnerSlides:tableSlides,requiredNativeChartOwnerSlides:[],verifyArtifactToolImport:true,receiptPath:path.join(R,'.build/presentation-validation-final-v2.json')});
console.log('Finalized',final);

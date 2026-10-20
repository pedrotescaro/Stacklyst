const fs = require('node:fs');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '../../../..');
const out = path.resolve(__dirname, '../evidencias-codigo');
const ts = require(path.join(root, 'node_modules/typescript'));
const React = require(path.join(root, 'node_modules/react'));
const {renderToStaticMarkup} = require(path.join(root, 'node_modules/react-dom/server'));
const lucide = require(path.join(root, 'node_modules/lucide-react'));
const rel = 'src/app/recruiter/RecruiterContent.tsx';
const source = fs.readFileSync(path.join(root, rel), 'utf8');
const lines = source.split(/\r?\n/);
// Exact JSX of the vacancy card, including the expanded applicant drawer.
const card = lines.slice(473, 716).join('\n');
if (!card.trim().startsWith('<div') || !card.trim().endsWith('</div>')) throw new Error('Source range changed');
const labels = source.slice(source.indexOf('const STATUS_LABELS:'), source.indexOf('\nexport function RecruiterContent'));
const fixture = {
  job: {id:'vaga-demonstracao', title:'Estágio JavaScript - Seminário',description:'Oportunidade de demonstração do seminário.',level:'JUNIOR',modality:'REMOTE',contract_type:'ESTAGIO',status:'OPEN',technologies:['JavaScript','Git'],location:null,salary_min:null,salary_max:null,company:{name:'Empresa de demonstração',is_verified:false},_count:{applications:1}},
  applicants: [{id:'candidatura-demonstracao',job_id:'vaga-demonstracao',user_id:'candidato-demonstracao',stage_id:'etapa-inscricao',status:'REVIEWING',created_at:'2026-10-20T15:00:00-03:00',user:{username:'Candidato de demonstração',avatar_url:null,total_xp:140,github_username:null},stage:{id:'etapa-inscricao',title:'Inscrição',type:'INSCRICAO',order:1}}]
};
const component = `${labels}\nfunction Prototype(){
const job=fixture.job,applicants=fixture.applicants,isExpanded=true,isLoadingApplicants=false,applicantsCount=1,updatingAppId=null;
const toggleExpandJob=()=>{},loadApplications=()=>{},handleUpdateApplicationStatus=()=>{};
return (${card});}\nmodule.exports=Prototype;`;
const js = ts.transpileModule(component, {compilerOptions:{jsx:ts.JsxEmit.React,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
const moduleBox = {exports:{}};
const Link = ({href,children,...props}) => React.createElement('a',{href,...props},children);
function AuthorAvatar({username,size='sm',className=''}){
  const sizes={sm:'w-8 h-8',md:'w-9 h-9',lg:'w-10 h-10'};
  return React.createElement('div',{className:`${sizes[size]} flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full border border-dd-border bg-blue-500/10 text-[10px] font-black text-blue-400 ${className}`},React.createElement('span',{'aria-label':`Iniciais de ${username}`},username.trim().slice(0,2).toUpperCase()||'DD'));
}
const icons = Object.entries(lucide).filter(([name])=>name!=='Link');
const names = ['React','fixture','Link','AuthorAvatar',...icons.map(([name])=>name),'module'];
const values = [React,fixture,Link,AuthorAvatar,...icons.map(([,value])=>value),moduleBox];
new Function(...names,js)(...values);
const markup = renderToStaticMarkup(React.createElement(moduleBox.exports));
const cssFiles = fs.readdirSync(path.join(root,'.next/static/chunks')).filter(x=>x.endsWith('.css')&&fs.readFileSync(path.join(root,'.next/static/chunks',x),'utf8').includes('--color-dd-bg'));
const css=cssFiles.map(x=>fs.readFileSync(path.join(root,'.next/static/chunks',x),'utf8')).join('\n');
fs.writeFileSync(path.join(out,'prototipo-candidaturas.css'),css);
const links='<link rel="stylesheet" href="prototipo-candidaturas.css">';
const html = `<!doctype html><html lang="pt-BR" class="dark"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">${links}<style>
html{background:#000;color-scheme:dark;scrollbar-gutter:auto}body{margin:0;background:#000;font-family:Arial,sans-serif}#prototype{width:1160px;margin:0 auto;padding:36px 26px 28px}header{margin-bottom:26px;padding-bottom:24px;border-bottom:1px solid #2f3336}header h1{margin:12px 0 8px;font-size:30px;font-weight:900;color:#e7e9ea}header p{margin:0;font-size:14px;color:#71767b}.demo-note{margin:22px 0 0;font-size:12px;color:#a6b0b6}.prototype-badge{font-size:12px;font-weight:900;letter-spacing:.04em;color:#60a5fa;background:#3b82f626;border:1px solid #3b82f64d;border-radius:20px;padding:3px 10px}
</style><body><div id="prototype"><header><span class="prototype-badge">PAINEL CORPORATIVO</span><h1>Recrutamento Técnico Stacklyst</h1><p>Vagas Publicadas e Candidaturas</p></header>${markup}<p class="demo-note">Protótipo renderizado a partir do componente real. Dados de demonstração. Nenhuma chamada ao backend.</p></div></body></html>`;
fs.writeFileSync(path.join(out,'prototipo-candidaturas.html'),html);
// This is a documentary fragment with injected dependencies, not application code.
fs.writeFileSync(path.join(out,'prototipo-candidaturas-trecho.tsx.txt'),component);
fs.writeFileSync(path.join(out,'prototipo-candidaturas-origens.json'),JSON.stringify({type:'Protótipo com dados de demonstração',source:rel,lines:[474,716],source_sha256:crypto.createHash('sha256').update(source).digest('hex'),rendering:'JSX original extraído do cartão de vaga e painel expandido de candidatos, transformado com TypeScript e renderizado por ReactDOMServer. CSS compilado local do projeto. Handlers inertes. Link convertido em âncora. AuthorAvatar replica o ramo de iniciais para avatar nulo.',fixture,network:'Nenhuma chamada ao backend. Não é evidência de execução autenticada, integração ou produção.',css_sources:cssFiles.map(x=>'.next/static/chunks/'+x)},null,2));
console.log('HTML fiel ao JSX do painel de candidatos criado.');

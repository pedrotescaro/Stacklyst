from pathlib import Path
import json,re
from copy import deepcopy
from PIL import Image
from docx import Document
from docx.shared import Inches,Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
R=Path(__file__).resolve().parents[1]
D=json.loads((R/'tools/model-data.json').read_text(encoding='utf8'))
OUT=R/'entrega-v2';OUT.mkdir(exist_ok=True)
PICS=R/'diagramas/final-simplificado/Stacklyst-revisado-simplificado'
def pic(prefix):
 matches=[p for p in PICS.rglob('*.png') if p.stem.startswith(prefix+' ') or p.stem==prefix]
 if len(matches)!=1:raise ValueError((prefix,matches))
 return matches[0]
def addp(d,text='',style=None,before=None):
 p=d.add_paragraph(text,style)
 if before is not None:before.addprevious(p._p)
 return p
def imagep(d,path,before=None,maxw=6.25,maxh=7.25):
 p=addp(d,before=before);p.alignment=WD_ALIGN_PARAGRAPH.CENTER
 w,h=Image.open(path).size;scale=min(maxw/w,maxh/h)
 p.add_run().add_picture(str(path),width=Inches(w*scale),height=Inches(h*scale))
 p.paragraph_format.keep_with_next=True
 return p
def heading(d,text,level=2,before=None,page=False):
 p=addp(d,text,f'Heading {level}',before)
 p.paragraph_format.page_break_before=page
 return p
def replace_text(d):
 paras=list(d.paragraphs)+[p for t in d.tables for row in t.rows for c in row.cells for p in c.paragraphs]
 for p in paras:
  t=p.text
  if 'Revisão textual: 27/09/2026 | Base técnica: 12/09/2026' in t:
   p.text=t.replace('Revisão textual: 27/09/2026 | Base técnica: 12/09/2026','Revisão dos modelos: 28/09/2026 | Base técnica conferida: 28/09/2026')
  elif t.startswith('Pré-condições: Ator com papel RECRUITER/ADMIN'):
   p.text='Pré-condições: Ator com papel RECRUITER ou ADMIN. Para recrutador, a empresa deve pertencer ao usuário autenticado; requireCompanyAccess valida o vínculo antes da criação da vaga.'
  elif 'versão inventariada verifica o papel' in t:
   p.text='• A1 — Sem papel ou vínculo autorizado: o servidor nega a operação. A rota de vagas verifica o papel e aplica requireCompanyAccess para a empresa selecionada.'
  elif t=='Descrição: Executar código no provedor remoto com os testes definidos no servidor.':
   p.text='Descrição: Executar código em ambiente isolado, usando o sandbox interno ou um provedor externo conforme a linguagem, com testes definidos no servidor.'
  elif t=='2. Enviar ao executor remoto.':
   p.text='2. Selecionar o executor suportado pela linguagem. JavaScript/TypeScript podem usar QuickJS interno; outras linguagens usam o provedor configurado.'
  elif 'Representação gráfica pendente.' in t:p.text=t.replace('Representação gráfica pendente.','Representado nas vistas UC00 e UC01 do projeto Astah.')
  elif t.startswith('Critério adotado: UC001 a UC029 preservam'):
   p.text='Critério adotado: UC001 a UC030 preservam seus identificadores. UC031 a UC056 ampliam o inventário de funções existentes; todas as 56 funções estão representadas no panorama geral e nos recortes por domínio.'
  elif t.startswith('A especificação textual abrange UC001 a UC030'):
   p.text='A especificação textual e os diagramas abrangem UC001 a UC056. A revisão de 28/09/2026 confrontou rotas, serviços, contratos e schema Prisma. A presença de implementação não substitui testes de aceitação. Funções adicionais sem requisito numerado no documento 3 estão identificadas na matriz complementar, sem criação de identificadores RF fictícios.'
  elif t=='Executa código com limites e retorna saída/testes; sua indisponibilidade deve ser tratada.':
   p.text='Participa quando executeCode aciona um provedor externo. A execução local em QuickJS é interna ao Stacklyst. Falha de programa difere de indisponibilidade do serviço.'
  elif t=='Executor de código':p.text='Executor externo de código'
def remove_between(d,start,end):
 children=list(d._element.body);i=children.index(start);j=children.index(end)
 for el in children[i+1:j]:d._element.body.remove(el)
def findp(d,prefix):return next(p for p in d.paragraphs if p.text.startswith(prefix))
def caption(d,text,before=None):
 p=addp(d,text,before=before);p.alignment=WD_ALIGN_PARAGRAPH.CENTER
 p.paragraph_format.keep_with_next=False
 for r in p.runs:r.font.size=Pt(9)
 return p
def figure(d,prefix,title,before=None,maxh=7.1):
 imagep(d,pic(prefix),before,maxh=maxh)
 caption(d,title,before)
 p=addp(d,f'Fonte editável: Stacklyst-revisado-simplificado.asta / {prefix}.',before=before)
 for run in p.runs:run.font.size=Pt(9)

d=Document(next((R/'fontes-drive').glob('02*.docx')));replace_text(d)
for p in d.paragraphs:
 if p.text.startswith('Os fluxos textuais priorizam'):
  p.text='Os fluxos e diagramas descrevem ações e decisões dos participantes do negócio. Detalhes de autenticação, banco de dados, execução de código e cálculo de recompensas pertencem aos modelos do sistema. As regras vigentes de duelos são vagas abertas, espera de até 24 horas e confronto de duas horas. AN07 e AN08 possuem dois recortes para separar processos com gatilhos e participantes distintos.'
 if p.text.startswith('Os caminhos de fontes editáveis'):
  p.text='Todos os diagramas desta versão são elementos editáveis do projeto Stacklyst-revisado.asta, no pacote 04 Atividades do negocio. AN07A/AN07B detalham credenciamento e emissão de parecer; AN08A/AN08B separam divulgação da vaga e acompanhamento das candidaturas.'
 if 'execução remota e persistência' in p.text:p.text=p.text.replace('execução remota e persistência','execução isolada e persistência')
oldpics=[p for p in d.paragraphs if p._p.xpath('.//w:drawing')]
assert len(oldpics)==9,len(oldpics)
mapping=[['AN01'],['AN02'],['AN03'],['AN04'],['AN05'],['AN06'],['AN07A','AN07B'],['AN08A','AN08B'],['AN09']]
for p,ids in zip(oldpics,mapping):
 el=p._p
 # The next two paragraphs are the stale figure caption and source reference.
 nxt=el.getnext();src=nxt.getnext()
 for rem in [nxt,src]:rem.getparent().remove(rem)
 for ident in ids:
  a=next(a for a in D['activities'] if a['id']==ident)
  heading(d,f'{ident} — {a["name"]}',3,el,page=True)
  figure(d,ident,f'{ident} — {a["name"]}.',el,maxh=7.4)
 el.getparent().remove(el)
d.save(OUT/'02-atividades-do-negocio-stacklyst-astah.docx')

d=Document(next((R/'fontes-drive').glob('04*.docx')));replace_text(d)
findp(d,'Este documento especifica 30 casos').text='Este documento especifica 56 casos de uso do Stacklyst, com atores, condições, resultados, fluxos e referências de implementação. UC001 a UC030 mantêm seus identificadores. UC031 a UC056 ampliam a cobertura de funcionalidades existentes: feed, conexões, mensagens, comunidades, eventos, preferências, métricas, execução de teste e gestão de candidaturas. Os diagramas são nativos e editáveis no Astah UML.'
start=findp(d,'4. Diagramas')._p;end=findp(d,'5. Especificação')._p
remove_between(d,start,end)
addp(d,'O panorama UC00 reúne todos os 56 casos de uso. Os 12 recortes seguintes reutilizam os mesmos elementos UML e permitem leitura detalhada. Cada quadro identifica o sujeito Stacklyst; atores repetidos são apresentações do mesmo ator.',before=end)
addp(d,'Avaliador, Administrador e Recrutador especializam Usuário autenticado. A generalização aponta para o ator geral. Associação contínua significa participação; não representa ordem de execução. Sessão válida é pré-condição das funções protegidas.',before=end)
addp(d,'«include» aponta ao comportamento incluído; «extend» aponta ao caso base. UC006 inclui UC028; UC010 inclui UC029. UC012 estende UC006 quando há solicitação de ajuda permitida. UC029 estende UC028 em atividade de programação. O executor externo só participa quando acionado pela estratégia de execução.',before=end)
heading(d,'4.0 Visão geral do Stacklyst',2,end,page=True)
figure(d,'UC00','Panorama geral resumido — 13 casos centrais; a cobertura completa de 56 casos está nos recortes 4.1 a 4.12.',end,maxh=7.1)
for i,(name,ids) in enumerate(D['groups'],1):
 heading(d,f'4.{i} {name[3:]}',2,end,page=True)
 figure(d,'UC'+name[:2],f'Figura UC{i:02} — {name[3:]}.',end,maxh=7.05)
end=findp(d,'6.')._p
for u in D['uc'][30:]:
 n=int(u['id'][2:]);heading(d,f'5.{n} Caso de Uso {u["id"]} — {u["name"]}',2,end,page=True)
 addp(d,'Descrição: '+u['name']+'.',before=end)
 addp(d,'Ator iniciador: '+D['actors'][u['actor']]+'.',before=end)
 addp(d,'Pré-condições e autorização: '+u['guard'],before=end)
 heading(d,'Fluxo Principal',3,end)
 for k,step in enumerate(u['flow'].rstrip('.').split(';'),1):addp(d,f'{k}. {step.strip().capitalize()}.',before=end)
 addp(d,'Pós-condições: Resultado da consulta apresentado ou alteração autorizada confirmada ao usuário, conforme a operação solicitada.',before=end)
 heading(d,'Fluxos Alternativos',3,end)
 addp(d,'• A1 — Sessão ou permissão insuficiente: recusar acesso à operação protegida e informar a condição, sem aplicar a alteração solicitada.',before=end)
 addp(d,'• A2 — Dados inválidos, recurso indisponível ou falha de processamento: informar o resultado e permitir a correção ou nova tentativa; não apresentar sucesso sem confirmação.',before=end)
 addp(d,'Rastreabilidade: '+u['rf']+'.',before=end)
 addp(d,'Referência de implementação: '+u['source']+'.',before=end)
# Supplemental traceability before section 8, keeping the original matrix intact.
end=findp(d,'8. Revisão')._p
heading(d,'7.1 Cobertura complementar — UC031 a UC056',2,end,page=True)
addp(d,'“Ampliação” identifica comportamento encontrado na implementação sem requisito funcional numerado correspondente no inventário original. A equipe deve formalizar esses requisitos no documento 3; os códigos RF existentes foram preservados.',before=end)
t=d.add_table(rows=1,cols=3);t.style=d.tables[0].style
t.rows[0].cells[0].text='Caso de uso';t.rows[0].cells[1].text='Funcionalidade';t.rows[0].cells[2].text='Rastreabilidade'
for u in D['uc'][30:]:
 c=t.add_row().cells;c[0].text=u['id'];c[1].text=u['name'];c[2].text=u['rf']
end.addprevious(t._tbl)
addp(d,'Limite de UC045: a API de administração de comunidades existe; um painel web completo de gestão não foi confirmado. O modelo representa a capacidade e explicita a diferença entre contrato e interface.',before=end)
# Replace the technical appendix with native Astah exports and add the relational model.
start=findp(d,'9. Modelos')._p
children=list(d._element.body);idx=children.index(start)
for el in children[idx+1:]:
 if el.tag!=qn('w:sectPr'):d._element.body.remove(el)
start.text if False else None
findp(d,'9. Modelos').text='9. Modelos técnicos e de dados'
technical=[('9.1 Arquitetura de pacotes e dependências','TC01','Arquitetura modular e serviços externos.'),('9.2 Classes de domínio — visão geral','CL00','12 conceitos centrais; atributos e associações completas nas vistas por domínio.'),('9.2.1 Contratos do catálogo de aprendizado','CL11','Interfaces TypeScript do catálogo; não representam tabelas do banco.'),('9.2.2 Serviços e operações reais','CL12','Operações de serviços existentes e dependências das entidades.'),('9.3 Estados derivados de progresso','TC02','Estados derivados da lição.'),('9.4 Submissão e gravação transacional','TC03','Cenário de sucesso da submissão; exceções descritas na nota do diagrama.'),('9.5 Modelo relacional — visão geral','MR00','12 entidades centrais; tabelas e cardinalidades completas nas vistas seguintes.')]
for title,code,cap in technical:
 heading(d,title,2,page=True);figure(d,code,cap,maxh=7.2)
addp(d,'O modelo relacional utiliza classes estereotipadas «table» no Astah UML. PK indica chave primária; FK, chave estrangeira; UQ, unicidade. Nomes físicos, campos e relações foram extraídos de prisma/schema.prisma. As vistas detalhadas registram cardinalidades e opcionalidade. Relações associativas não implicam composição UML.')
addp(d,'Restrições complementares: Follow tem PK composta (followerId, followingId); MobileState tem PK composta (user_id, key). ExerciseSubmission possui índice único parcial para a primeira conclusão por usuário e exercício (first_completion = true); isso não torna todos os envios únicos. Enums são domínios de valores, não entidades adicionais.')
for i,(domain,names) in enumerate(D['domains'],1):
 heading(d,f'9.5.{i} Modelo relacional — {domain[3:]}',2,page=True)
 figure(d,'MR'+domain[:2],f'MR{domain[:2]} — {domain[3:]}.',maxh=7.45)
addp(d,'As 10 vistas correspondentes de classes de domínio (CL01 a CL10) estão no arquivo Astah. Os atributos de classe omitem FKs redundantes e mostram associações; o modelo relacional conserva os campos de persistência. UserRole é enum de autorização, sem subclasses persistidas por papel.')
# Header rows and row splitting remain stable across pagination.
for t in d.tables:
 if t.rows:
  pr=t.rows[0]._tr.get_or_add_trPr();pr.append(OxmlElement('w:tblHeader'))
 for row in t.rows:
  pr=row._tr.get_or_add_trPr();pr.append(OxmlElement('w:cantSplit'))
d.save(OUT/'04-casos-de-uso-stacklyst-astah.docx')
print('Saved two revised DOCX documents')

"""Atualiza os DOCX do Drive em sua estrutura original, sem recriar estilos."""
from pathlib import Path
from copy import deepcopy
import json,re,csv,hashlib,os
from docx import Document
from docx.shared import Inches,Pt
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.enum.text import WD_ALIGN_PARAGRAPH
from PIL import Image

R=Path(__file__).resolve().parents[1];S=R/'fontes/drive';OUT=R/'entregaveis';OUT.mkdir(exist_ok=True)
catalog=json.loads((R/'catalogo-casos.json').read_text('utf-8'))
valid={c['id'] for c in catalog}
UC=R/'fontes/Caso de Uso Geral.png';CL=R/'fontes/Classes principais do Stacklyst.png'
old_ids={'UC015':'UC015 / UC023','UC017':'UC017 / UC018','UC019':'UC019 / UC028','UC023':'UC015','UC026':'UC025','UC028':'UC026','UC029':'UC027','UC038':'mensagens privadas'}
rename={'24 casos de uso':'26 casos de uso','24 casos consolidados':'26 casos de uso','53 casos de uso':'26 casos de uso','oito classes essenciais':'dez classes principais','Oito classes essenciais':'Dez classes principais','Gerenciar empresa e vagas':'Gerenciar Empresas e Gerenciar Vagas','Candidatar-se a vaga':'Registrar Candidatura','Enviar solução de duelo':'Enviar Solução de Duelo','Estudar lição':'Realizar Lição','Disputar duelo de programação':'Realizar Duelo'}
def text(e):return ''.join(t.text or '' for t in e.iter(qn('w:t')))
def remap(d):
 for t in d._element.iter(qn('w:t')):
  s=t.text or ''
  s=re.sub(r'UC\d{3}',lambda m:old_ids.get(m[0],m[0]),s)
  for a,b in rename.items():s=s.replace(a,b)
  t.text=s
 for p in d.paragraphs:
  if 'Os objetivos agrupam' in p.text or 'A visão geral agrupa objetivos' in p.text:p.text='A vista Caso de Uso Geral contém os 26 casos desta edição. Seus IDs e nomes são a referência da especificação e da apresentação.'
  if 'Avaliador, Recrutador e Administrador herdam' in p.text:p.text='Os atores especializados e suas associações seguem a vista Caso de Uso Geral. A autorização implementada depende do papel e do vínculo com cada recurso.'
  if 'números remanescentes' in p.text or 'numeração canônica' in p.text:p.text='Esta edição usa exclusivamente os casos representados na vista Caso de Uso Geral fornecida pelo grupo.'
def anchor(d,phrase):
 return next(p._p for p in d.paragraphs if p.text.strip()==phrase)
def erase_between(d,start,end):
 body=d._element.body;items=list(body);a=items.index(start);b=items.index(end)
 for el in items[a:b]:body.remove(el)
class W:
 def __init__(self,d,at=None):self.d=d;self.at=at
 def put(self,el):
  if self.at is not None:self.at.addprevious(el)
 def p(self,s='',bold=False,size=None,style=None):
  p=self.d.add_paragraph(style=style);r=p.add_run(s);r.bold=bold
  if size:r.font.size=Pt(size)
  self.put(p._p);return p
 def h(self,s,n=1,page=False):
  p=self.d.add_heading(s,n);p.paragraph_format.page_break_before=page;self.put(p._p);return p
 def table(self,rows):
  t=self.d.add_table(rows=0,cols=len(rows[0]));t.style=self.d.tables[0].style if self.d.tables else 'Table Grid'
  for i,row in enumerate(rows):
   cells=t.add_row().cells
   for cell,v in zip(cells,row):
    cell.text=str(v)
    for p in cell.paragraphs:
     for run in p.runs:run.font.size=Pt(9);run.bold=i==0
   if i==0:
    rep=OxmlElement('w:tblHeader');t.rows[0]._tr.get_or_add_trPr().append(rep)
  self.put(t._tbl);return t
 def pic(self,path,caption,maxw=6.35,maxh=3.0):
  im=Image.open(path);w,h=im.size;s=min(maxw/w,maxh/h)
  p=self.d.add_paragraph();p.alignment=WD_ALIGN_PARAGRAPH.CENTER
  shape=p.add_run().add_picture(str(path),width=Inches(w*s));shape._inline.docPr.set('descr',caption);self.put(p._p)
  self.p(caption,size=9)

def all_paragraphs(d):
 yield from d.paragraphs
 for table in d.tables:
  for row in table.rows:
   for cell in row.cells:yield from cell.paragraphs
def section_for_image(d,heading,caption):
 # Isola apenas a figura geral em uma página horizontal. Os demais elementos
 # mantêm as dimensões, margens, cabeçalhos e estilos do modelo Word do Drive.
 h=anchor(d,heading);cap=anchor(d,caption)
 portrait=deepcopy(d.sections[-1]._sectPr)
 def marker(at,after=False,landscape=False):
  p=OxmlElement('w:p');pp=OxmlElement('w:pPr');sp=deepcopy(portrait)
  typ=sp.find(qn('w:type'))
  if typ is None:typ=OxmlElement('w:type');sp.insert(0,typ)
  typ.set(qn('w:val'),'nextPage')
  if landscape:
   sz=sp.find(qn('w:pgSz'));a,b=sz.get(qn('w:w')),sz.get(qn('w:h'));sz.set(qn('w:w'),b);sz.set(qn('w:h'),a);sz.set(qn('w:orient'),'landscape')
  pp.append(sp);p.append(pp)
  if after:at.addnext(p)
  else:at.addprevious(p)
 marker(h);marker(cap,True,True)
 # As figuras usam a largura da página horizontal, respeitando a proporção.
 target=h.getnext()
 while target is not None and target is not cap:
  for inline in target.iter(qn('wp:inline')):
   ext=inline.find(qn('wp:extent'));blip=next(inline.iter(qn('a:blip')));data=d.part.related_parts[blip.get(qn('r:embed'))].blob
   import io
   w,hpx=Image.open(io.BytesIO(data)).size;s=min(9.4/w,6.0/hpx)
   cx,cy=int(Inches(w*s)),int(Inches(hpx*s));ext.set('cx',str(cx));ext.set('cy',str(cy))
   for x in inline.iter(qn('a:ext')):x.set('cx',str(cx));x.set('cy',str(cy))
  target=target.getnext()
 # Evita que a quebra explícita anterior crie uma página vazia.
 previous=h.getprevious().getprevious()
 if previous is not None and not text(previous) and any(b.get(qn('w:type'))=='page' for b in previous.iter(qn('w:br'))):previous.getparent().remove(previous)

def fit_general_picture(d,heading):
 h=anchor(d,heading);p=h.getnext()
 while p is not None:
  pics=list(p.iter(qn('wp:inline')))
  if pics:
   import io
   for inline in pics:
    blip=next(inline.iter(qn('a:blip')));data=d.part.related_parts[blip.get(qn('r:embed'))].blob
    width,height=Image.open(io.BytesIO(data)).size;s=min(6.35/width,5.2/height)
    cx,cy=int(Inches(width*s)),int(Inches(height*s));ext=inline.find(qn('wp:extent'));ext.set('cx',str(cx));ext.set('cy',str(cy))
    for x in inline.iter(qn('a:ext')):x.set('cx',str(cx));x.set('cy',str(cy))
   from docx.text.paragraph import Paragraph
   Paragraph(p,d._body).paragraph_format.keep_with_next=True
   Paragraph(p.getnext(),d._body).paragraph_format.keep_with_next=False
   return
  p=p.getnext()

def gallery(d,selection=None,title='Telas atuais da plataforma'):
 inv=json.loads((R/'capturas/inventario.json').read_text('utf-8'))
 shots=[s for s in inv if selection is None or s['arquivo'] in selection]
 w=W(d);w.h(title,1,True)
 w.p('Capturas realizadas em 3 de novembro de 2026 na aplicação web Stacklyst. Cada imagem apresenta o estado carregado da tela consultada. Dados, posições e disponibilidade podem mudar com novas atividades.')
 for i,s in enumerate(shots):
  if i>0 and i%2==0:w.p().add_run().add_break(__import__('docx').enum.text.WD_BREAK.PAGE)
  w.h(s['titulo'],2);w.pic(R/'capturas'/s['arquivo'],s['titulo']+' — '+s['url'],maxh=2.65)
  if 'busca sem resultados' in s['titulo']:w.p('A busca do bate-papo foi preenchida para mostrar a interface sem divulgar mensagens pessoais.',size=9)

records=[]
for number in ['01','02','03','04','05']:
 if os.environ.get('DOC_ONLY') and number!=os.environ['DOC_ONLY']:continue
 src=next(S.glob(number+'*.docx'));d=Document(src)
 if number!='02':remap(d)
 if number=='01':
  for p in d.paragraphs:
   if p.text.startswith('Esse diagrama representa atividade do negócio.'):
    p.text='A jornada principal reúne organização do estudo, prática, consulta do resultado e planejamento da próxima etapa. Publicar, competir e buscar oportunidades são caminhos disponíveis conforme as permissões. Os diagramas das atividades do negócio estão no documento 02.'
  a=anchor(d,'Problema e proposta');b=anchor(d,'Atores');erase_between(d,a,b);w=W(d,b)
  w.h('Problema e proposta',2)
  w.p('O Stacklyst integra estudo de programação, prática com avaliação de respostas, troca de conhecimento, duelos e oportunidades profissionais. O problema atendido é a dispersão entre material de estudo, exercícios, evidências de progresso e espaços para aplicar e compartilhar o aprendizado.')
  w.p('A proposta central é um percurso de aprendizagem por linguagem, com lições, exemplos e atividades. O sistema distingue leitura, tentativa, execução de teste, submissão e primeira conclusão. O progresso confirmado alimenta XP, níveis, classificação e reconhecimentos elegíveis.')
  w.h('Visão do produto',2)
  w.p('Para pessoas que aprendem programação e desejam praticar de forma contínua, o Stacklyst oferece um ambiente de estudo com retorno sobre atividades e histórico de evolução. A rede de publicações amplia a troca de conhecimento. Duelos, eventos e recrutamento conectam a prática a contextos de competição e oportunidade.')
  w.h('Necessidades e capacidades',2)
  w.table([['Parte interessada','Necessidade','Capacidade do produto'],['Estudante','Organizar o estudo e compreender erros','Trilhas, lições, exercícios, ajuda e desempenho'],['Comunidade de desenvolvedores','Compartilhar experiências e manter referências','Publicações, interações, itens salvos e mensagens'],['Recrutador e empresa','Divulgar oportunidades e acompanhar candidatos','Empresas, vagas, etapas e candidaturas'],['Avaliador','Emitir pareceres com critérios e autorização','Credenciamento e avaliação de duelos'],['Administrador','Manter o acesso e tratar ocorrências','Gestão de usuários, denúncias e recursos autorizados']])
  w.h('Escopo e critérios de sucesso',2)
  w.p('O núcleo de aprendizagem deve permitir consultar o percurso, estudar uma lição, resolver uma atividade e consultar o resultado confirmado. A mesma conclusão não deve duplicar recompensas. Recursos de conteúdo, competição e oportunidades devem manter autoria, participação e autorização por recurso.')
  w.p('A modelagem acadêmica desta edição usa os 26 casos da vista Caso de Uso Geral. Recursos complementares da plataforma, como Mundinho e clientes móveis, continuam descritos no manual técnico sem criar outros casos numerados.')
  # Atualiza a tabela de atores sem alterar sua formatação.
  for table in d.tables:
   if any('Ator'==c.text for c in table.rows[0].cells):
    for row in table.rows[1:]:
     if row.cells[0].text.strip()=='Usuário':row.cells[1].text='Pessoa que cadastra conta, autentica-se e utiliza os recursos permitidos.'
  gallery(d,['01-feed.jpg','02-ranking.jpg','03-trilhas.jpg','04-mapa-licoes.jpg'],'Visão atual da interface')
 elif number=='02':
  for style in d.styles:
   if style.style_id in ['Heading1','Heading2','Heading3']:
    pp=style.element.get_or_add_pPr();outline=pp.find(qn('w:outlineLvl'))
    if outline is None:outline=OxmlElement('w:outlineLvl');pp.append(outline)
    outline.set(qn('w:val'),str(int(style.style_id[-1])-1))
  for p in d.paragraphs:
   if 'Nenhuma entrada de sumário' in p.text:
    p.clear();field=OxmlElement('w:fldSimple');field.set(qn('w:instr'),'TOC \\o "1-3" \\h \\z \\u');p._p.append(field)
   if 'Revisão documental:' in p.text:
    for run in p.runs:run.text=run.text.replace('17/10/2026','03/11/2026')
  fixes=[
   ('RF005–RF010; UC004–UC007','F04–F10; UC004–UC007'),
   ('RF008–RF009; UC006, UC028, UC029 e UC052','F07–F10; UC006, UC026 e UC027'),
   ('RF009–RF015; UC007 e UC011','F12–F14; UC007'),
   ('RF022–RF025; UC012 e ponto de extensão de ajuda de UC006','F10; UC012 e extensão de ajuda de UC006'),
   ('RF034–RF038, RF044–RF048; UC017, UC018, UC022, UC025, UC026 e UC056','F38–F41; UC017, UC018, UC022 e UC025'),
   ('UC026 gera notificação','UC025 gera notificação'),
   ('RF041, RF049 e RF044–RF046; UC015, UC023 e UC046','F42–F44; UC015'),
   ('UC023 permite inscrever-se','O fluxo de participação permite inscrever-se')]
  for p in all_paragraphs(d):
   s=p.text
   for a,b in fixes:s=s.replace(a,b)
   if s!=p.text:
    if p.runs:
     p.runs[0].text=s
     for run in p.runs[1:]:run.text=''
    else:p.text=s
  for table in d.tables:
   if len(table.columns)==3 and 'Requisitos relacionados' in table.rows[0].cells[1].text:
    for row,ids in zip(table.rows[1:],['F04–F10','F07–F10','F12–F14','F10; F15–F18','F38–F39','F40–F41','F42–F44']):row.cells[1].text=ids
  w=W(d);w.h('5. Correspondência com os casos de uso',1)
  w.p('As atividades do negócio preservam os processos e os diagramas aprovados. A tabela relaciona esses processos à numeração da vista Caso de Uso Geral.')
  w.table([['Atividade','Casos de uso relacionados'],['AN01 Estudar programação','UC004 Consultar Trilhas de Estudo; UC005 Realizar Lição'],['AN02 Praticar exercícios','UC006 Resolver exercício; UC026 Avaliar Resposta; UC027 Executar Código e Testes'],['AN03 Acompanhar aprendizagem','UC007 Emitir Classificação e Desempenho'],['AN04 Buscar ajuda','UC012 Consultar Ajuda de Exercício; UC013 Gerenciar Publicações; UC014 Registrar Interação'],['AN05 Divulgar oportunidade e acompanhar seleção','UC017 Gerenciar Empresas; UC018 Gerenciar Vagas; UC022 Registrar Candidatura; UC025 Gerenciar Candidaturas'],['AN06 Descobrir e participar de evento','UC015 Gerenciar Eventos; consultas e participação detalhadas no manual funcional']])
 elif number=='03':
  w=W(d);w.h('Correspondência com a vista Caso de Uso Geral',1,True)
  w.p('Os requisitos funcionais, não funcionais e as regras mantêm seus identificadores. A relação abaixo usa exclusivamente os nomes e IDs da vista vigente, distinguindo objetivo funcional de cenário técnico de implementação.')
  rows=[['Caso de uso','Cenários de implementação','Regras relacionadas']]+[[c['id']+' '+c['title'],', '.join(c['scenarioIds']),', '.join(c['rules'])] for c in catalog]
  w.table(rows)
  with (OUT/'matriz-casos-regras.csv').open('w',encoding='utf-8-sig',newline='') as f:csv.writer(f,delimiter=';').writerows(rows)
 elif number=='04':
  a=anchor(d,'Catálogo acadêmico de casos de uso');b=anchor(d,'Casos de uso gerais');erase_between(d,a,b);w=W(d,b)
  w.h('Catálogo de casos de uso',1,True)
  w.p('Esta especificação descreve os 26 casos representados na vista Caso de Uso Geral. Os identificadores e nomes reproduzem a vista fornecida pelo grupo. Cada caso contém objetivo, atores, pré-condições, fluxo principal, alternativas, pós-condições e referências à implementação.')
  w.p('A nota de autenticação do diagrama aplica-se às operações protegidas. Cadastrar Conta e Fazer Login são portas de entrada e não dependem de sessão anterior. Permissões administrativas, de avaliador e de recrutador são verificadas no servidor e por vínculo com o recurso.')
  w.table([['ID','Nome do caso de uso']]+[[c['id'],c['title']] for c in catalog])
  for c in catalog:
   w.h(c['id']+' '+c['title'],2,True)
   w.p('Objetivo: '+c['objective']);w.p('Atores: '+c['actor']);w.p('Pré-condições: '+c['preconditions'])
   w.h('Fluxo principal',3)
   for i,s in enumerate(c['steps'],1):w.p(str(i)+'. '+s)
   w.h('Fluxos alternativos e exceções',3)
   for alt in c['alternatives']:w.p(alt)
   w.p('Pós-condição de sucesso: '+c['success']);w.p('Garantia em caso de falha: '+c['failure'])
   w.p('Implementação: '+', '.join(c['sources'])+'.',size=9);w.p('Regras: '+', '.join(c['rules'])+'.',size=9)
  # Remove somente as vistas antigas de casos de uso. Classes, dados,
  # sequências completas e recortes com código permanecem no documento.
  for start,end in [('Casos de uso de aprendizagem','Classes de aprendizagem'),('Casos de uso de comunidade','Classes de comunidade'),('Casos de uso de duelos','Classes de duelos')]:erase_between(d,anchor(d,start),anchor(d,end))
  changes=[('Casos de uso gerais',UC,'Caso de Uso Geral — vista fornecida pelo grupo'),('Classes conceituais gerais',CL,'Classes principais do Stacklyst — atributos e métodos')]
  for heading,img,caption in changes:
   h=anchor(d,heading);p=h.getnext();picture=None
   for t in list(p.iter(qn('w:t')))[1:]:t.text=''
   next(p.iter(qn('w:t'))).text='Fonte: '+img.name+' fornecida pelo grupo.'
   while p is not None:
    pics=list(p.iter(qn('a:blip')))
    if pics:picture=p;part=d.part.related_parts[pics[0].get(qn('r:embed'))];part._blob=img.read_bytes();break
    p=p.getnext()
   assert picture is not None
   cap=picture.getnext()
   for t in list(cap.iter(qn('w:t')))[1:]:t.text=''
   next(cap.iter(qn('w:t'))).text=caption
   fit_general_picture(d,heading)
   paragraph=next(p for p in d.paragraphs if p._p is h)
   paragraph.text='Caso de Uso Geral' if img==UC else 'Classes principais do Stacklyst'
  # Corrige a correspondência geral para refletir as dez classes da figura.
  w=W(d);w.h('Leitura do diagrama de classes geral',1,True)
  w.p('A vista geral apresenta Usuário, Empresa, Vaga, Candidatura, Publicação, Tentativa, Duelo, Evento, Inscrição e Mensagem. O primeiro compartimento contém o nome, o segundo os atributos privados e o terceiro as operações públicas. As multiplicidades indicam quantas instâncias participam de cada associação.')
  w.p('Os identificadores UUID e os textos usam string; contagens e pontuações usam int; resultados lógicos usam boolean. DateTime representa data e hora, void indica ausência de retorno e List<T> representa uma coleção tipada. Os nomes de domínio permanecem em português.')
  w.p('As operações sintetizam responsabilidades do domínio. A implementação distribui essas responsabilidades entre serviços, rotas e bibliotecas; os registros Prisma não se tornam classes TypeScript com métodos por causa desta representação.')
  w.table([['Classe geral','Modelo de dados correspondente'],['Usuário','User'],['Empresa','Company'],['Vaga','Job'],['Candidatura','JobApplication'],['Publicação','Post'],['Tentativa','QuizAttempt'],['Duelo','Duel'],['Evento','Event'],['Inscrição','EventParticipant'],['Mensagem','Message']])
  gallery(d,['05-licao.jpg','06-exercicio.jpg','13-vagas.jpg','14-detalhe-vaga.jpg','15-eventos.jpg','17-avaliacoes.jpg'],'Interfaces atuais dos fluxos apresentados')
 elif number=='05':
  w=W(d);w.h('Modelos gerais vigentes',1,True)
  w.p('A numeração acadêmica segue os 26 casos descritos no documento 04. Os recortes Cxx deste manual são cenários de implementação e não acrescentam casos ao diagrama geral.')
  w.pic(UC,'Caso de Uso Geral — fonte fornecida pelo grupo',maxh=5.3)
  w.pic(CL,'Classes principais do Stacklyst — atributos e métodos',maxh=5.0)
  gallery(d)
 used={el.get(qn('r:embed')) for el in d._element.iter(qn('a:blip'))}
 for rid,rel in list(d.part.rels.items()):
  if rel.reltype.endswith('/image') and rid not in used:d.part.drop_rel(rid)
 path=OUT/src.name;d.save(path)
 records.append({'documento':number,'arquivo':path.name,'fonte':src.name,'imagens':len(d.inline_shapes),'tabelas':len(d.tables)})
(R/'validacao/documentos.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n','utf-8')
print(json.dumps(records,ensure_ascii=False))

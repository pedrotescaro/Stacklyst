from pathlib import Path
from docx import Document
from docx.oxml.ns import qn
from docx.text.paragraph import Paragraph
from docx.table import Table
from PIL import Image
from zipfile import ZipFile,ZIP_DEFLATED
import json,hashlib,shutil,re,io
R=Path(__file__).resolve().parents[1];OUT=R/'entregaveis';MD=R/'markdown';IM=MD/'imagens';IM.mkdir(parents=True,exist_ok=True)
def images(d,element):
 refs=[]
 for blip in element.iter(qn('a:blip')):
  rid=blip.get(qn('r:embed'))
  if not rid:continue
  data=d.part.related_parts[rid].blob;ext=Image.open(io.BytesIO(data)).format.lower();ext='jpg' if ext=='jpeg' else ext
  name='figura-'+hashlib.sha256(data).hexdigest()[:16]+'.'+ext;(IM/name).write_bytes(data)
  refs.append('![Figura](imagens/'+name+')')
 return refs
for file in sorted(OUT.glob('0*.docx')):
 d=Document(file);lines=[];code=[]
 def close_code():
  if code:
   fence='````' if any('```' in row for row in code) else '```'
   lines.extend(['',fence]+code+[fence,'']);code.clear()
 for element in d._element.body:
  if element.tag==qn('w:p'):
   p=Paragraph(element,d._body);s=p.text;style=p.style.style_id or ''
   if style.lower().startswith(('toc','sumrio','sumario')):continue
   refs=images(d,element)
   iscode=not refs and any(r.text for r in p.runs) and all(not r.text or r.font.name=='Consolas' for r in p.runs)
   if iscode:code.append(s);continue
   if not s and code and not refs:code.append('');continue
   close_code()
   s=s.replace('<','&lt;').replace('>','&gt;')
   if s.strip():
    if re.search(r'(?:Ttulo|Heading)([123])$',style):
     level=int(style[-1]);lines+=['','#'*(level+1)+' '+s,'']
    elif style in ['Title','Ttulo']:lines+=['','# '+s,'']
    else:lines+=[s,'']
   for ref in refs:lines += [ref,'']
  elif element.tag==qn('w:tbl'):
   close_code();table=Table(element,d._body);rows=[]
   for row in table.rows:rows.append([c.text.replace('<','&lt;').replace('>','&gt;').replace('|','\\|').replace('\n','<br>') for c in row.cells])
   if rows:
    lines+=['| '+' | '.join(rows[0])+' |','| '+' | '.join(['---']*len(rows[0]))+' |']
    lines+=['| '+' | '.join(row)+' |' for row in rows[1:]];lines+=['']
 close_code();(MD/(file.stem+'.md')).write_text('\n'.join(lines)+'\n','utf-8')
for folder in (R/'validacao/rendered').iterdir():
 if folder.is_dir():
  pdf=folder/(folder.name+'.pdf')
  if pdf.exists():shutil.copyfile(pdf,OUT/pdf.name)
for name in ['Caso de Uso Geral.png','Classes principais do Stacklyst.png','Stacklyst-modelos-atualizados.asta']:shutil.copyfile(R/'fontes'/name,OUT/name)
classes=R.parent/'revisao-seminario-2026-11-03/class-diagram-revisado/Class Diagram Stacklyst - revisado.asta'
shutil.copyfile(classes,OUT/'Classes-principais-Stacklyst-com-metodos.asta')
readme='''# Stacklyst documentação e seminário

Revisão de 3 de novembro de 2026.

## Documentos

- Documento 01: visão do sistema, públicos, necessidades, escopo e critérios de sucesso.
- Documento 02: atividades do negócio, com os sete diagramas aprovados e a rastreabilidade atualizada.
- Documento 03: requisitos funcionais, requisitos não funcionais, regras e matrizes de rastreabilidade.
- Documento 04: especificações dos 26 casos da vista Caso de Uso Geral, fluxos principais, alternativas, garantias, modelos e ligação com o código.
- Documento 05: manual técnico da plataforma e galeria das telas atuais.

As versões Word e PDF estão em `entregaveis`. A pasta `markdown` contém a documentação correspondente em Markdown e suas imagens. `catalogo-casos.md` e `catalogo-casos.json` apresentam o catálogo dos casos.

## Modelos e apresentação

A referência de casos de uso é exclusivamente a vista **Caso de Uso Geral** indicada pelo grupo. Seus 26 IDs e nomes são preservados. As outras vistas antigas não integram os documentos ou a apresentação. Os arquivos Astah permitem editar os modelos; no projeto geral fornecido, selecione a aba Caso de Uso Geral.

O diagrama de classes geral usa a imagem fornecida com dez classes e métodos. Os nomes de domínio ficam em português e os tipos básicos em inglês.

O seminário contém 53 slides no núcleo da apresentação e um apêndice com 23 capturas atuais. A abertura inclui a visão do documento 01. Os fluxos de aprendizagem e recrutamento seguem a ordem dos integrantes.

## Capturas

As 23 imagens da pasta `capturas` foram obtidas na aplicação web em 03/11/2026. O inventário registra tela, endereço e horário da captura. No bate-papo, uma busca sem resultados evita divulgar mensagens pessoais. As capturas mostram os estados consultados e acompanham a explicação dos fluxos e do código.
'''
(R/'README.md').write_text(readme,'utf-8')
archive=OUT/'Stacklyst-documentacao-e-modelos-2026-11-03.zip'
files=[R/'README.md',R/'catalogo-casos.md',R/'catalogo-casos.json']
files += [p for p in OUT.iterdir() if p.is_file() and p.suffix in ['.docx','.pdf','.pptx','.csv','.png','.asta'] and not p.name.startswith('~$')]
files += [p for p in MD.rglob('*') if p.is_file()]
files += [p for p in (R/'capturas').glob('*') if p.is_file()]
with ZipFile(archive,'w',ZIP_DEFLATED) as z:
 for p in files:z.write(p,str(p.relative_to(R)).replace('\\','/'))
with ZipFile(archive) as z:assert z.testzip() is None
summary={'arquivo':archive.name,'arquivos':len(files),'bytes':archive.stat().st_size,'sha256':hashlib.sha256(archive.read_bytes()).hexdigest(),'casos':26,'capturas':23,'slides':76,'documentos':5}
(R/'validacao/pacote.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n','utf-8')
print(json.dumps(summary,ensure_ascii=False))

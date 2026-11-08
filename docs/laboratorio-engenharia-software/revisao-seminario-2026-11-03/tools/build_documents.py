"""Create revised Word deliverables using the supplied documents as style references."""
from pathlib import Path
import json,re,shutil,hashlib,zipfile,os
from docx import Document
from docx.shared import Pt,Inches,RGBColor
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.enum.style import WD_STYLE_TYPE
from docx.enum.section import WD_SECTION, WD_ORIENT
from PIL import Image

R=Path(__file__).resolve().parents[1];ROOT=R.parents[2];MAN=ROOT/'docs/manual/detalhado'
OUT=R/'entregaveis';OUT.mkdir(exist_ok=True)
META=[]
def base(title,number):
    original=next((R/'fontes-originais').glob(number+'*.docx'))
    d=Document(original)
    for name in ['List Bullet','Table Grid','Caption']:
        if name not in d.styles:
            d.styles.add_style(name, WD_STYLE_TYPE.TABLE if name=='Table Grid' else WD_STYLE_TYPE.PARAGRAPH)
    # Major source-based revision. Preserve styles, page geometry and source originals.
    body=d._element.body
    for el in list(body):
        if el.tag!=qn('w:sectPr'):body.remove(el)
    for name in ['Normal','Title','Subtitle','Heading 1','Heading 2','Heading 3']:
        if name in d.styles:
            st=d.styles[name];st.font.name='Arial';st.font.color.rgb=RGBColor(0,0,0)
            st.paragraph_format.space_after=Pt(7)
    d.styles['Normal'].font.size=Pt(11)
    d.styles['Normal'].paragraph_format.line_spacing=1.12
    d.styles['Title'].font.size=Pt(28)
    for i in range(1,4):d.styles['Heading '+str(i)].font.size=Pt(19-i*2)
    for sec in d.sections:
        sec.header.paragraphs[0].text='Stacklyst  •  Laboratório de Engenharia de Software'
        sec.footer.paragraphs[0].text='Revisão de 3 de novembro de 2026   '
        f=OxmlElement('w:fldSimple');f.set(qn('w:instr'),'PAGE');sec.footer.paragraphs[0]._p.append(f)
    d.add_paragraph('Stacklyst',style='Title');d.add_paragraph(title,style='Subtitle')
    d.add_paragraph('Laboratório de Engenharia de Software\nRevisão de 3 de novembro de 2026\nBase de código 6a2bfce e documentação local revisada')
    d.add_paragraph('Pedro Antonio Silvestre Tescaro\nGuilherme Alves de Campos\nPaulo Henrique Leal dos Santos')
    d.add_paragraph('Esta edição atualiza os modelos e a especificação do sistema. Os diagramas de atividades do negócio aprovados permanecem no documento 02, preservado integralmente. Os modelos revisados são editáveis no Astah UML. Cadastro e acesso usam o ator Usuário e declaram as pré-condições de sessão em cada caso.')
    d.add_paragraph('As afirmações descrevem a fonte de implementação. Credenciais, infraestrutura externa, dispositivos e migrations dependem das verificações de ambiente indicadas. Esta revisão documental não representa execução de todos os fluxos em produção.')
    d.add_page_break();d.add_heading('Roteiro de leitura',1)
    field=OxmlElement('w:fldSimple');field.set(qn('w:instr'),'TOC \\o "1-2" \\h \\z \\u');d.add_paragraph()._p.append(field)
    d.add_paragraph('O sumário é atualizado na exportação pelo Word. As fontes editáveis e a matriz de rastreabilidade acompanham o pacote.')
    return d
def plain(s):
    s=re.sub(r'\[([^\]]+)\]\(([^)]+)\)',r'\1 [\2]',s)
    return s.replace('**','').replace('`','').replace('«','«')
def table(d,rows):
    t=d.add_table(rows=0, cols=len(rows[0]));t.style='Table Grid'
    for i,row in enumerate(rows):
        cells=t.add_row().cells
        for c,v in zip(cells,row):
            c.text=plain(v.strip())
            for p in c.paragraphs:
                for run in p.runs:run.font.size=Pt(9 if len(rows[0])>=4 else 10)
            tcpr=c._tc.get_or_add_tcPr()
            borders=OxmlElement('w:tcBorders')
            for side in ['top','left','bottom','right']:
                el=OxmlElement('w:'+side);el.set(qn('w:val'),'single');el.set(qn('w:sz'),'4');el.set(qn('w:color'),'D9D9D9');borders.append(el)
            tcpr.append(borders)
            if i==0:
                sh=OxmlElement('w:shd');sh.set(qn('w:fill'),'F2F2F2');tcpr.append(sh)
                for run in c.paragraphs[0].runs:run.bold=True
        if i==0:
            rep=OxmlElement('w:tblHeader');t.rows[0]._tr.get_or_add_trPr().append(rep)
    d.add_paragraph()
def md(d,file):
    text=file.read_text(encoding='utf-8');lines=text.splitlines();i=0
    while i<len(lines):
        line=lines[i]
        if line.startswith('```'):
            code=[];i+=1
            while i<len(lines) and not lines[i].startswith('```'):code.append(lines[i]);i+=1
            if line!='```mermaid':
                for row in code:
                    p=d.add_paragraph();p.paragraph_format.space_after=Pt(0);r=p.add_run(row);r.font.name='Consolas';r.font.size=Pt(8)
            i+=1;continue
        if line.startswith('|'):
            rows=[]
            while i<len(lines) and lines[i].startswith('|'):
                if not re.match(r'^\|[\s:|\-]+\|?$',lines[i]):rows.append(re.split(r'(?<!\\)\|',lines[i].strip('|')))
                i+=1
            if rows:table(d,rows)
            continue
        if line.startswith('#'):
            level=min(3,len(line)-len(line.lstrip('#')));d.add_heading(plain(line.lstrip('# ').strip()),level)
        elif line.strip():
            p=d.add_paragraph(plain(re.sub(r'^[-*] ','',line)))
            if re.match(r'^[-*] ',line):p.style='List Bullet'
        i+=1
def figure(d,id,title):
    candidates=list((R/'diagramas/astah-export').rglob(id+' *.png'))
    if len(candidates)!=1:raise ValueError((id,len(candidates)))
    image=candidates[0];w,h=Image.open(image).size
    landscape=id.startswith(('CL-','DER-'))
    sec=d.sections[-1]
    orientation_change=(sec.orientation==WD_ORIENT.LANDSCAPE)!=landscape
    if orientation_change:
        sec=d.add_section(WD_SECTION.NEW_PAGE);sec.orientation=WD_ORIENT.LANDSCAPE if landscape else WD_ORIENT.PORTRAIT;sec.page_width,sec.page_height=sec.page_height,sec.page_width
    maxw=(sec.page_width-sec.left_margin-sec.right_margin)/914400
    maxh=4.0 if re.match(r'SQ\d+-[A-Z]$',id) else 4.7 if landscape else 6.5
    width=min(maxw,maxh*w/h)
    heading=d.add_heading(title,2);heading.paragraph_format.page_break_before=not orientation_change
    d.add_paragraph('Fonte: projeto nativo Stacklyst-modelos-atualizados.asta. Amplie a imagem ou abra a vista específica para ler os detalhes.')
    d.add_picture(str(image),width=Inches(width))
    d.add_paragraph(id+'  '+title,style='Caption')
def finish(d,name):
    if os.environ.get('DOC_ONLY') and not name.startswith(os.environ['DOC_ONLY']):return
    if os.environ.get('DOC_EXCLUDE') and name.startswith(os.environ['DOC_EXCLUDE']):return
    p=OUT/name;d.save(p);META.append({'file':name,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})

v=base('Documento de visão do sistema','01');md(v,MAN/'visao-do-sistema.md');md(v,MAN/'guia-de-programacao.md');md(v,MAN/'referencia-uml-guedes.md');finish(v,'01-documento-de-visao-atualizado.docx')
q=base('Requisitos e regras do sistema','03');md(q,MAN/'requisitos-e-regras.md');md(q,MAN/'qualidade-do-sistema.md');md(q,MAN/'contratos-e-operacao.md')
section=q.add_section(WD_SECTION.NEW_PAGE);section.orientation=WD_ORIENT.LANDSCAPE;section.page_width,section.page_height=section.page_height,section.page_width
md(q,MAN/'matriz-de-rastreabilidade.md');finish(q,'03-requisitos-e-regras-atualizados.docx')
c=base('Casos de uso e modelos do sistema','04');md(c,MAN/'referencia-uml-guedes.md');md(c,MAN/'catalogo-academico.md')
for id,title in [('UC-GERAL','Casos de uso gerais'),('CL-GERAL','Classes conceituais gerais'),('DER-GERAL','Visão relacional geral reduzida')]:figure(c,id,title)
for area in ['APRENDIZAGEM','COMUNIDADE','DUELOS','RECRUTAMENTO','EVENTOS','IDENTIDADE']:
    if area in ['APRENDIZAGEM','COMUNIDADE','MUNDINHO','DUELOS']:figure(c,'UC-'+area,'Casos de uso de '+area.lower())
    figure(c,'CL-'+area,'Classes de '+area.lower());figure(c,'DER-'+area,'Dados de '+area.lower())
for n in [1,2,3,4,5,9,10,11,12,13]:figure(c,'SQ'+str(n).zfill(2),'Sequência completa '+str(n))
for clip in json.loads((R/'evidencias-codigo/recortes.json').read_text(encoding='utf-8')):
    figure(c,clip['id'],clip['title']);c.add_paragraph(f"Código real: {clip['file']}, linhas {clip['start']} a {clip['end']}. Contexto e ramos omitidos devem ser consultados no arquivo completo.")
    source_lines=clip['code'].splitlines()
    if len(source_lines)>24:
        source_lines=source_lines[:12]+['... (linhas intermediárias omitidas neste extrato) ...']+source_lines[-10:]
    for row in source_lines:
        p=c.add_paragraph();p.paragraph_format.space_after=Pt(0);p.paragraph_format.line_spacing=Pt(10);r=p.add_run(row);r.font.name='Consolas';r.font.size=Pt(8)
md(c,MAN/'correspondencia-dos-modelos.md');md(c,MAN/'seminario.md');finish(c,'04-casos-de-uso-e-modelos-atualizados.docx')
manual=base('Manual técnico e funcionamento da plataforma','01')
for chapter in ['trilhas-por-dentro.md','mundinho-por-dentro.md','comunidade-por-dentro.md','avaliacao-e-duelos.md','vagas-e-eventos.md','contratos-e-operacao.md','codigo-comentado.md']:
    md(manual,MAN/chapter)
    if chapter=='mundinho-por-dentro.md':
        for n in [6,7,8]:figure(manual,'SQ'+str(n).zfill(2),'Sequência técnica do Mundinho '+str(n-5))
md(manual,MAN/'referencia-uml-guedes.md');finish(manual,'05-manual-tecnico-da-plataforma.docx')
# The one approved document is byte-for-byte identical.
activity=next((R/'fontes-originais').glob('02-*.docx'));shutil.copy2(activity,OUT/activity.name)
(R/'validacao/documentos.json').write_text(json.dumps({'updated':META,'activityPreserved':{'file':activity.name,'sha256':hashlib.sha256(activity.read_bytes()).hexdigest(),'unchanged':activity.read_bytes()==(OUT/activity.name).read_bytes()}},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'documents':len(META),'activity':'preserved'}))


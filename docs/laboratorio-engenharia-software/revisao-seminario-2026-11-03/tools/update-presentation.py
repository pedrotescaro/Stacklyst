"""Targeted OOXML template edit; preserve approved activity slides byte for byte.

The installed artifact-tool Presentation.load could not import the source (Node
API install via @oai/granola/node unavailable). Preserve source slide XML and use
Office rendering for the permitted original-deck fallback.
"""
from pathlib import Path
import zipfile,json,re,copy,hashlib
from lxml import etree as E
from PIL import Image
R=Path(__file__).resolve().parents[1]
source=next((R/'fontes-originais').glob('*.pptx'))
with zipfile.ZipFile(source) as z:files={n:z.read(n) for n in z.namelist()}
N={'p':'http://schemas.openxmlformats.org/presentationml/2006/main','a':'http://schemas.openxmlformats.org/drawingml/2006/main','r':'http://schemas.openxmlformats.org/officeDocument/2006/relationships','pr':'http://schemas.openxmlformats.org/package/2006/relationships'}
def tag(ns,n):return '{'+N[ns]+'}'+n
def xml(path):return E.fromstring(files[path])
def save(path,node):files[path]=E.tostring(node,encoding='UTF-8',xml_declaration=True,standalone=True)
def textshape(label,x,y,w,h,size=30,bold=False,font='Arial',color='142B3B'):
    s=E.Element(tag('p','sp'));nv=E.SubElement(s,tag('p','nvSpPr'));E.SubElement(nv,tag('p','cNvPr'),id='900',name=label[:70]);E.SubElement(nv,tag('p','cNvSpPr'));E.SubElement(nv,tag('p','nvPr'))
    pr=E.SubElement(s,tag('p','spPr'));xf=E.SubElement(pr,tag('a','xfrm'));E.SubElement(xf,tag('a','off'),x=str(round(x*9525)),y=str(round(y*9525)));E.SubElement(xf,tag('a','ext'),cx=str(round(w*9525)),cy=str(round(h*9525)));E.SubElement(pr,tag('a','prstGeom'),prst='rect');E.SubElement(pr,tag('a','noFill'));E.SubElement(E.SubElement(pr,tag('a','ln')),tag('a','noFill'))
    b=E.SubElement(s,tag('p','txBody'));E.SubElement(b,tag('a','bodyPr'),wrap='square',lIns='0',rIns='0',tIns='0',bIns='0');E.SubElement(b,tag('a','lstStyle'))
    for line in label.splitlines():
        p=E.SubElement(b,tag('a','p'));ppr=E.SubElement(p,tag('a','pPr'));spc=E.SubElement(ppr,tag('a','lnSpc'));E.SubElement(spc,tag('a','spcPct'),val='110000')
        r=E.SubElement(p,tag('a','r'));rp=E.SubElement(r,tag('a','rPr'),sz=str(round(size*75)),b='1' if bold else '0',lang='pt-BR');E.SubElement(E.SubElement(rp,tag('a','solidFill')),tag('a','srgbClr'),val=color);E.SubElement(rp,tag('a','latin'),typeface=font);E.SubElement(r,tag('a','t')).text=line
    return s
def shell(n,title,subtitle):
    p=f'ppt/slides/slide{n}.xml';root=xml(p);tree=root.find('p:cSld/p:spTree',N)
    for child in list(tree):
        if child.tag not in [tag('p','nvGrpSpPr'),tag('p','grpSpPr')]:tree.remove(child)
    tree.append(textshape(title,84,38,1750,88,52,True));tree.append(textshape(subtitle,88,136,1740,50,27,color='006C83'));tree.append(textshape(f'{n:02}',1770,1025,65,28,22))
    return p,root,tree
def picture(n,tree,path,box):
    w,h=Image.open(path).size;x,y,bw,bh=box;scale=min(bw/w,bh/h);fw,fh=w*scale,h*scale;x+=(bw-fw)/2;y+=(bh-fh)/2
    key=f'ppt/media/novembro-slide{n}-{len(tree)}.png';files[key]=path.read_bytes();relpath=f'ppt/slides/_rels/slide{n}.xml.rels';rels=xml(relpath);rid='rIdNov'+str(len(rels)+1);E.SubElement(rels,tag('pr','Relationship'),Id=rid,Type=N['r']+'/image',Target='../media/'+Path(key).name);save(relpath,rels)
    pic=E.SubElement(tree,tag('p','pic'));nv=E.SubElement(pic,tag('p','nvPicPr'));E.SubElement(nv,tag('p','cNvPr'),id='901',name=path.stem);E.SubElement(nv,tag('p','cNvPicPr'));E.SubElement(nv,tag('p','nvPr'));fill=E.SubElement(pic,tag('p','blipFill'));E.SubElement(fill,tag('a','blip'),{tag('r','embed'):rid});E.SubElement(E.SubElement(fill,tag('a','stretch')),tag('a','fillRect'));pr=E.SubElement(pic,tag('p','spPr'));xf=E.SubElement(pr,tag('a','xfrm'));E.SubElement(xf,tag('a','off'),x=str(round(x*9525)),y=str(round(y*9525)));E.SubElement(xf,tag('a','ext'),cx=str(round(fw*9525)),cy=str(round(fh*9525)));E.SubElement(pr,tag('a','prstGeom'),prst='rect')
def notes(n,content):
    path=f'ppt/notesSlides/notesSlide{n}.xml'
    if path not in files:return
    root=xml(path);bodies=root.findall('.//p:sp',N)
    for sp in bodies:
        ph=sp.find('p:nvSpPr/p:nvPr/p:ph',N)
        if ph is not None and ph.get('type')=='body':
            body=sp.find('p:txBody',N)
            for p in body.findall('a:p',N):body.remove(p)
            for line in content.splitlines():p=E.SubElement(body,tag('a','p'));r=E.SubElement(p,tag('a','r'));E.SubElement(r,tag('a','t')).text=line
    save(path,root)
def diag(id):
    a=list((R/'diagramas/astah-export').rglob(id+' *.png'));assert len(a)==1,(id,len(a));return a[0]
mapping={11:('UC-GERAL','Diagrama geral de casos de uso','24 casos consolidados, todos representados'),12:('UC-TRILHAS-DEMO','Aprendizagem: objetivos e avaliação','UC005, UC006, UC012 e UC028'),13:('UC-CANDIDATURA-DEMO','Seleção: candidatura e gestão','UC022 e UC026'),17:('CL-GERAL','Diagrama de classes conceituais geral','Oito classes essenciais do domínio'),18:('CL-APRENDIZAGEM','Classes e implementação da aprendizagem','Responsabilidades e dados do percurso'),19:('DER-GERAL','Diagrama geral do banco de dados','CP, CE e vínculos principais em notação UML'),20:('UC-TRILHAS-DEMO','Casos de uso da aprendizagem','Objetivos e comportamentos reutilizados'),21:('CL-APRENDIZAGEM','Classes da aprendizagem','Catálogo, progresso, tentativas e credenciais'),22:('DER-APRENDIZAGEM','Banco de dados da aprendizagem','Chaves e registros persistidos'),23:('SQ01','Sequência completa: resolver exercício','Envio, avaliação, prévia e confirmação'),30:('UC-VAGA-DEMO','Caso de uso: empresa e vagas','UC017 Gerenciar empresa e vagas'),31:('CL-RECRUTAMENTO','Classes da publicação de vaga','Empresa, oportunidade e etapas'),32:('DER-RECRUTAMENTO','Banco de dados da publicação','Chaves e vínculos da seleção'),33:('SQ13','Sequência completa: publicar vaga','Da autorização à confirmação da interface'),41:('UC-CANDIDATURA-DEMO','Casos de uso da candidatura','UC022 e UC026'),42:('CL-RECRUTAMENTO','Classes da candidatura e do retorno','Vínculos e responsabilidades'),43:('DER-RECRUTAMENTO','Banco de dados da candidatura','Integridade e persistência'),44:('SQ11','Sequência completa: candidatura','Inscrição e encaminhamento da seleção'),45:('SQ11','Sequência completa: movimentar candidatura','Atualização autorizada e notificação')}
for n,(id,title,sub) in mapping.items():
    p,root,tree=shell(n,title,sub);picture(n,tree,diag(id),(82,205,1756,780));save(p,root);notes(n,'Fonte: Astah UML / Stacklyst-modelos-atualizados.asta / '+id+'.\n'+title+'.\nLer junto à especificação e às alternativas do catálogo consolidado. Classes representam responsabilidades do domínio. As vistas relacionais apresentam tabelas e vínculos selecionados; o dicionário técnico conserva os campos completos. As vistas gerais devem ser ampliadas; as vistas específicas detalham a leitura.')
clips=json.loads((R/'evidencias-codigo/recortes.json').read_text(encoding='utf-8'))
for n,clip in zip([24,25,26,34,35,36,46,47,48],clips):
    p,root,tree=shell(n,clip['title'],clip['id']+' — sequência e código correspondente');picture(n,tree,diag(clip['id']),(80,270,805,620))
    lines=clip['code'].splitlines();selected=list(range(len(lines)))
    if len(lines)>23:selected=list(range(10))+list(range(len(lines)-12,len(lines)))
    display=[];previous=-1
    for i in selected:
        if i>previous+1:display.append('      ...')
        display.append(f'{clip["start"]+i:4}  '+lines[i]);previous=i
    tree.append(textshape('Interação',90,205,800,50,31,True,color='006C83'));tree.append(textshape('Implementação',950,205,875,50,31,True,color='006C83'));tree.append(textshape('\n'.join(display),950,270,880,650,18,font='Consolas'));tree.append(textshape(clip['file']+f"  Linhas {clip['start']}–{clip['end']}",90,955,1740,55,23,color='526571'));save(p,root)
    notes(n,f"Código real: {clip['file']}, linhas {clip['start']} a {clip['end']}. Reticências indicam linhas omitidas na tela; o trecho completo está no documento 04.\n"+clip['code'])
requirements={16:('Aprendizagem',[('RF F06–F10','Abrir lição, responder, testar e submeter exercícios.'),('RNF Q01–Q05','Autorizar acesso, preservar integridade e tratar falha do executor.'),('RN R12–R16','Avaliar no servidor. Prévia não concede XP. Repetição não duplica o crédito.')]),29:('Empresa e vagas',[('RF F38–F39','Gerenciar empresa autorizada e publicar oportunidades.'),('RNF Q01, Q08, Q12','Conferir papel e vínculo. Informar confirmação ou erro.'),('RN R02, R04','Permissão é verificada por empresa e por recurso.')]),40:('Candidatura e seleção',[('RF F40–F41','Candidatar-se e acompanhar a movimentação no funil.'),('RNF Q01, Q03, Q06','Autorizar o gestor, preservar dados privados e registrar auditoria.'),('RN R76–R80','Vaga aberta, candidatura única e vínculos compatíveis antes da alteração.')])}
for n,(area,blocks) in requirements.items():
    p,root,tree=shell(n,'Requisitos e regras na interface',area)
    for i,(head,body) in enumerate(blocks):tree.append(textshape(head,105,235+i*235,1680,60,34,True,color='006C83'));tree.append(textshape(body,105,305+i*235,1680,130,36))
    save(p,root);notes(n,'IDs da edição atual: F = RF, Q = RNF, R = regra de negócio. Critérios de qualidade exigem evidência de aceitação; não representam certificação automática.')
p,root,tree=shell(51,'Referências','Modelagem, requisitos e implementação')
for i,(head,body) in enumerate([('Referência de UML','GUEDES, Gilleanes T. A. UML 2: uma abordagem prática. 3. ed. Novatec, 2018.'),('Requisitos e qualidade','Matriz de rastreabilidade e imagens de classificação de RNF e fatores de McCall fornecidas pelo grupo.'),('Fontes do projeto','Documentos 01–05, catálogo consolidado com 24 casos, projeto Astah e código-fonte da Stacklyst. Orientações do seminário fornecidas pela professora.')]):tree.append(textshape(head,105,220+i*245,1680,60,33,True,color='006C83'));tree.append(textshape(body,105,285+i*245,1680,140,34))
save(p,root)
# Update captions on preserved interface references, avoiding claims of live QA.
for n in [14,15,28,38,39]:
    path=f'ppt/slides/slide{n}.xml';root=xml(path)
    for t in root.findall('.//a:t',N):
        if t.text:t.text=t.text.replace('UC005 e UC006','UC005 e UC006').replace('UC026','UC026')
    save(path,root)
    notes(n,'Protótipo de referência preservado da documentação fornecida pelo grupo. A captura histórica ilustra a interface; a demonstração ao vivo deve conferir o comportamento na versão instalada. IDs seguem o catálogo consolidado.')
# No edits to slides 4–10, their relationship parts, masters or media.
unchanged=[]
with zipfile.ZipFile(source) as z:
    for n in range(4,11):
        for key in [f'ppt/slides/slide{n}.xml',f'ppt/slides/_rels/slide{n}.xml.rels']:
            assert z.read(key)==files[key],key
        unchanged.append(n)
# Give every native shape a unique ID within its owning slide.
for n in sorted(set(mapping)|{16,29,40,51}|{24,25,26,34,35,36,46,47,48}):
    path=f'ppt/slides/slide{n}.xml';root=xml(path)
    for i,el in enumerate(root.findall('.//p:cNvPr',N),1):el.set('id',str(i))
    save(path,root)
out=R/'entregaveis/Stacklyst-seminario-atualizado-2026-11-03.pptx'
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED) as z:
    for key,data in files.items():z.writestr(key,data)
(R/'validacao/apresentacao.json').write_text(json.dumps({'slides':51,'approvedActivitySlidesPreserved':unchanged,'source':source.name,'updated':out.name,'authoringFallback':'Original-deck OOXML edit after installed artifact-tool Presentation.load failed: missing @oai/granola/node Node API. Office render required.','sha256':hashlib.sha256(out.read_bytes()).hexdigest()},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Presentation updated:',out.name,'51 slides; approved activities preserved')


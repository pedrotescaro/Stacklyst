"""Edição do PPTX original, preservando mestres, layouts e objetos existentes.

Fallback para a edição do arquivo original: Presentation.load requer
@oai/granola/node, ausente no runtime instalado. Validação e render no Office.
"""
from pathlib import Path
import runpy,json,re,copy,posixpath,zipfile,hashlib
from lxml import etree as E
R=Path(__file__).resolve().parents[1]
globals().update(runpy.run_path(str(R/'tools/apresentacao-base.py')))
catalog=json.loads((R/'catalogo-casos.json').read_text('utf-8'));byid={c['id']:c for c in catalog}
shots=json.loads((R/'capturas/inventario.json').read_text('utf-8'))
old_ids={'UC015':'UC015 / UC023','UC017':'UC017 / UC018','UC019':'UC019 / UC028','UC023':'UC015','UC026':'UC025','UC028':'UC026','UC029':'UC027','UC038':'mensagens privadas'}
for n in range(1,52):
 for path in [f'ppt/slides/slide{n}.xml',f'ppt/notesSlides/notesSlide{n}.xml']:
  if path not in files:continue
  root=xml(path)
  for t in root.findall('.//a:t',N):
   s=t.text or '';s=re.sub(r'UC\d{3}',lambda m:old_ids.get(m[0],m[0]),s)
   for a,b in [('24 casos consolidados','26 casos de uso'),('catálogo consolidado com 24 casos','catálogo com 26 casos da vista Caso de Uso Geral'),('Oito classes essenciais','Dez classes principais')]:s=s.replace(a,b)
   t.text=s
  save(path,root)

ct=xml('[Content_Types].xml');nsct='{http://schemas.openxmlformats.org/package/2006/content-types}'
for ext,mime in [('jpg','image/jpeg'),('jpeg','image/jpeg')]:
 if not any(x.get('Extension')==ext for x in ct):E.SubElement(ct,nsct+'Default',Extension=ext,ContentType=mime)
save('[Content_Types].xml',ct)
def new_slide(n):
 # Uma cópia do slide geral conserva a relação com o layout e o tema do arquivo.
 files[f'ppt/slides/slide{n}.xml']=files['ppt/slides/slide11.xml']
 rels=xml('ppt/slides/_rels/slide11.xml.rels')
 for rel in list(rels):
  if rel.get('Type','').endswith(('/image','/notesSlide')):rels.remove(rel)
 files[f'ppt/slides/_rels/slide{n}.xml.rels']=E.tostring(rels,encoding='UTF-8',xml_declaration=True)
 ct=xml('[Content_Types].xml');E.SubElement(ct,nsct+'Override',PartName=f'/ppt/slides/slide{n}.xml',ContentType='application/vnd.openxmlformats-officedocument.presentationml.slide+xml');save('[Content_Types].xml',ct)
def blocks(n,title,sub,items):
 p,root,tree=shell(n,title,sub)
 for i,(h,b) in enumerate(items):
  y=220+i*(715/len(items));tree.append(textshape(h,105,y,1710,60,34,True,color='006C83'));tree.append(textshape(b,105,y+70,1710,145,33))
 save(p,root)
def flow_slide(n,ids,title):
 p,root,tree=shell(n,title,'Fluxo principal e alternativas da mesma vista geral')
 for col,id in enumerate(ids):
  c=byid[id];x=100+col*900;tree.append(textshape(id+' '+c['title'],x,220,840,110,32,True,color='006C83'))
  body='\n'.join(str(i+1)+'. '+s for i,s in enumerate(c['steps'][:4]))
  tree.append(textshape(body,x,350,830,370,28))
  tree.append(textshape('Alternativa',x,750,830,45,30,True,color='006C83'));tree.append(textshape(c['alternatives'][0],x,810,830,165,27))
 save(p,root);notes(n,'Fonte: documento 04 e catalogo-casos.md. '+ '\n'.join(byid[id]['id']+' '+byid[id]['title']+'\n'+'\n'.join(byid[id]['steps']+byid[id]['alternatives']) for id in ids))

# O documento de visão integra a abertura do seminário.
blocks(2,'Documento 1: visão do sistema','Problema atendido e proposta do Stacklyst',[
 ('Problema','O estudo, a prática, as evidências de progresso e as oportunidades costumam ficar dispersos entre ferramentas.'),
 ('Proposta','Reunir trilhas, lições e atividades de programação com retorno sobre as respostas e progresso confirmado.'),
 ('Aplicação do aprendizado','Publicações, duelos, eventos e oportunidades conectam o estudo à comunidade e à prática profissional.')])
for n in [52,53]:new_slide(n)
blocks(52,'Públicos e necessidades','Documento 1: partes interessadas',[
 ('Quem aprende','Organizar o estudo por linguagem, compreender os erros e acompanhar a evolução.'),
 ('Comunidade e avaliadores','Compartilhar conhecimento e emitir pareceres com critérios e autorização.'),
 ('Empresas e administração','Divulgar vagas, acompanhar candidaturas, manter usuários e tratar denúncias.')])
blocks(53,'Escopo e critérios de sucesso','Documento 1: capacidades e fronteiras',[
 ('Núcleo de aprendizagem','Consultar o percurso, realizar lições, resolver exercícios e acompanhar o desempenho.'),
 ('Integridade do progresso','Distinguir prévia de submissão. Confirmar o resultado no servidor. Evitar duplicação de recompensas.'),
 ('Autorizações e modelos','Verificar papel e vínculo por recurso. Usar os 26 casos da vista Caso de Uso Geral na especificação.')])

p,root,tree=shell(11,'Caso de Uso Geral','Vista fornecida pelo grupo: nomes e IDs da especificação')
picture(11,tree,R/'fontes/Caso de Uso Geral.png',(75,200,1770,800));save(p,root)
notes(11,'Fonte: imagem Caso de Uso Geral.png e aba Caso de Uso Geral do arquivo Astah fornecido pelo grupo. Esta é a única vista de casos de uso utilizada na apresentação. São 26 elipses de casos, com IDs preservados. A nota de sessão refere-se aos recursos protegidos; cadastro e login são portas de entrada.')
p,root,tree=shell(17,'Classes principais do Stacklyst','Dez classes com atributos, métodos, parâmetros e retornos')
picture(17,tree,R/'fontes/Classes principais do Stacklyst.png',(75,200,1770,800));save(p,root)
notes(17,'Fonte: Classes principais do Stacklyst.png fornecida pelo grupo. Visão lógica com dez classes e métodos. Nomes do domínio em português; tipos básicos em inglês. As responsabilidades são implementadas por serviços, rotas e bibliotecas, não por métodos em registros Prisma.')
# Retira os diagramas específicos antigos de casos de uso.
flow_slide(12,['UC005','UC006'],'Aprendizagem: fluxos da especificação')
flow_slide(13,['UC022','UC025'],'Recrutamento: fluxos da especificação')
flow_slide(20,['UC026','UC027'],'Avaliar Resposta e Executar Código e Testes')
flow_slide(30,['UC017','UC018'],'Gerenciar Empresas e Gerenciar Vagas')
flow_slide(41,['UC022','UC025'],'Registrar Candidatura e Gerenciar Candidaturas')

interfaces={14:('Realizar Lição','UC005: conteúdo e exemplo na interface atual','05-licao.jpg'),15:('Resolver exercício','UC006: enunciado e atividade na interface atual','06-exercicio.jpg'),28:('Guilherme: Gerenciar Vagas','UC018: consulta atual das oportunidades','13-vagas.jpg'),38:('Paulo: Registrar Candidatura','UC022: detalhe atual da oportunidade','14-detalhe-vaga.jpg'),39:('Acompanhamento da candidatura','Visão atual do candidato e situação da inscrição','14-detalhe-vaga.jpg')}
for n,(title,sub,filename) in interfaces.items():
 p,root,tree=shell(n,title,sub);picture(n,tree,R/'capturas'/filename,(80,220,1760,735));tree.append(textshape('Interface atual da plataforma, capturada em 03/11/2026',90,980,1700,40,23,color='526571'));save(p,root)
 notes(n,'Captura atual: https://stacklyst.vercel.app. Data: 03/11/2026. A tela demonstra o estado consultado; formulários e painéis administrativos exigem o papel e o vínculo correspondentes. Fluxos, alternativas e autorização estão descritos no documento 04 e nos recortes de código.')

# Todas as capturas renovadas também acompanham o seminário como apêndice.
appendix=[]
for n,shot in enumerate(shots,54):
 new_slide(n);p,root,tree=shell(n,shot['titulo'],'Apêndice: interface atual da plataforma')
 picture(n,tree,R/'capturas'/shot['arquivo'],(80,215,1760,745));tree.append(textshape('03/11/2026  '+shot['url'],90,980,1700,42,23,color='526571'));save(p,root);appendix.append(n)

# Insere as duas páginas de visão após o problema e antes da ordem do grupo.
order=[1,2,52,53]+list(range(3,52))+appendix
pr=xml('ppt/presentation.xml');slide_list=pr.find('p:sldIdLst',N);rels=xml('ppt/_rels/presentation.xml.rels')
target_to_rid={posixpath.basename(r.get('Target','')):r.get('Id') for r in rels if r.get('Type','').endswith('/slide')}
for n in [52,53]+appendix:
 rid='rIdAtual'+str(n);E.SubElement(rels,tag('pr','Relationship'),Id=rid,Type=N['r']+'/slide',Target=f'slides/slide{n}.xml');target_to_rid[f'slide{n}.xml']=rid
for child in list(slide_list):slide_list.remove(child)
for i,n in enumerate(order,1):E.SubElement(slide_list,tag('p','sldId'),id=str(900+i),attrib={tag('r','id'):target_to_rid[f'slide{n}.xml']})
save('ppt/presentation.xml',pr);save('ppt/_rels/presentation.xml.rels',rels)
# Uniformiza somente o contador visual; os modelos, textos e figuras das
# atividades do negócio permanecem iguais aos do arquivo de referência.
for pos,n in enumerate(order,1):
 path=f'ppt/slides/slide{n}.xml';root=xml(path)
 for t in root.findall('.//a:t',N):
  if t.text==f'{n:02}':t.text=f'{pos:02}'
 for i,x in enumerate(root.findall('.//p:cNvPr',N),1):x.set('id',str(i))
 save(path,root)
 # Remove relações de imagens que já não aparecem no slide editado.
 rp=f'ppt/slides/_rels/slide{n}.xml.rels';rr=xml(rp);used=set(root.xpath('//@r:embed | //@r:link | //@r:id',namespaces=N))
 for rel in list(rr):
  if rel.get('Type','').endswith('/image') and rel.get('Id') not in used:rr.remove(rel)
 save(rp,rr)
# Remove mídia órfã depois de retirar as antigas vistas de casos e protótipos.
referenced=set()
for path in list(files):
 if not path.endswith('.rels'):continue
 owner=path.replace('/_rels/','/').removesuffix('.rels');base=posixpath.dirname(owner)
 for rel in xml(path):
  if rel.get('Type','').endswith('/image'):referenced.add(posixpath.normpath(posixpath.join(base,rel.get('Target',''))))
for path in list(files):
 if path.startswith('ppt/media/') and path not in referenced:del files[path]
out=R/'entregaveis/Stacklyst-seminario-atualizado-2026-11-03.pptx'
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED) as z:
 for p,b in files.items():z.writestr(p,b)
(R/'validacao/apresentacao.json').write_text(json.dumps({'slides':len(order),'slidesNucleo':53,'capturas':len(shots),'casos':26,'ordem':order,'diagramasCasoUso':['Caso de Uso Geral'],'documentoVisao':[2,3,4],'fonte':source.name,'sha256':hashlib.sha256(out.read_bytes()).hexdigest()},ensure_ascii=False,indent=2)+'\n','utf-8')
print('Apresentação:',len(order),'slides;',len(shots),'capturas atuais; vista geral única.')

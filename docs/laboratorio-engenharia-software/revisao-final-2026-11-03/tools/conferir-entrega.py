from pathlib import Path
from zipfile import ZipFile
from lxml import etree as E
from PIL import Image,ImageDraw
import json,hashlib,re
from pypdf import PdfReader
R=Path(__file__).resolve().parents[1];OLD=R.parent/'revisao-seminario-2026-11-03'
catalog=json.loads((R/'catalogo-casos.json').read_text('utf-8'));valid={c['id'] for c in catalog}
N={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main','a':'http://schemas.openxmlformats.org/drawingml/2006/main'}
digest=lambda b:hashlib.sha256(b).hexdigest()
for file in (R/'entregaveis').glob('*'):
 if file.suffix not in ['.docx','.pptx'] or file.name.startswith('~$'):continue
 with ZipFile(file) as z:
  assert z.testzip() is None
  keys=[x for x in z.namelist() if x.endswith('.xml')]
  for key in keys:E.fromstring(z.read(key))
  if file.suffix=='.pptx':
   media=[z.read(k) for k in z.namelist() if k.startswith('ppt/media/')]
   for name in ['Caso de Uso Geral.png','Classes principais do Stacklyst.png']:assert (R/'fontes'/name).read_bytes() in media
   forbidden=[p.read_bytes() for p in (OLD/'diagramas/astah-export').rglob('UC-*.png')]
   assert not any(x in forbidden for x in media),'Vista antiga no seminário'
  if file.suffix=='.docx':
   root=E.fromstring(z.read('word/document.xml'));text=' '.join(root.xpath('//w:t/text()',namespaces=N))
   assert not set(re.findall(r'UC\d{3}',text))-valid,(file.name,set(re.findall(r'UC\d{3}',text))-valid)
   assert '24 casos de uso' not in text and '53 casos de uso' not in text
   if file.name.startswith('04'):
    images=[z.read(k) for k in z.namelist() if k.startswith('word/media/')]
    for name in ['Caso de Uso Geral.png','Classes principais do Stacklyst.png']:assert (R/'fontes'/name).read_bytes() in images,name
    for c in catalog:assert c['title'] in text
    assert text.count('Garantia em caso de falha:')==26
    forbidden=[p.read_bytes() for p in (OLD/'diagramas/astah-export').rglob('UC-*.png')]
    assert not any(x in forbidden for x in images),'Vista antiga de caso de uso'
   if file.name.startswith('02'):
    with ZipFile(next((R/'fontes/drive').glob('02*.docx'))) as src:
     original=[src.read(k) for k in src.namelist() if k.startswith('word/media/')]
    images=[z.read(k) for k in z.namelist() if k.startswith('word/media/')]
    assert all(b in images for b in original),'Figura aprovada alterada'
report={'casos':26,'capturas':len(json.loads((R/'capturas/inventario.json').read_text('utf-8'))),'documentos':{},'paginasComPoucoTexto':{}}
mont=R/'validacao/montagens';mont.mkdir(exist_ok=True)
def sheet(paths,name,cellw=270,cellh=400,cols=4,rows=4):
 for off in range(0,len(paths),cols*rows):
  group=paths[off:off+cols*rows];im=Image.new('RGB',(cols*cellw,rows*(cellh+25)),(225,228,231));draw=ImageDraw.Draw(im)
  for i,p in enumerate(group):
   x=(i%cols)*cellw;y=(i//cols)*(cellh+25);img=Image.open(p).convert('RGB');img.thumbnail((cellw-12,cellh-8));im.paste(img,(x+(cellw-img.width)//2,y+22));draw.text((x+8,y+4),p.stem,fill='black')
  im.save(mont/(name+'-'+str(off//(cols*rows)+1)+'.jpg'),quality=87)
for folder in sorted((R/'validacao/rendered').iterdir()):
 if not folder.is_dir():continue
 pdf=folder/(folder.name+'.pdf');doc=R/'entregaveis'/(folder.name+'.docx');assert pdf.stat().st_mtime>=doc.stat().st_mtime,doc.name
 pages=PdfReader(pdf).pages;sparse=[]
 if folder.name.startswith('02'):
  index=pages[1].extract_text();assert 'Nenhuma entrada' not in index;assert '2. Objetivo' in index
 if folder.name.startswith('04'):
  assert re.search(r'Página\s+35\s+de\s+76',pages[34].extract_text()),'Numeração reiniciada'
 for i,p in enumerate(pages,1):
  txt=p.extract_text() or ''
  if len(txt.split())<15:sparse.append(i)
 report['documentos'][folder.name]=len(pages);report['paginasComPoucoTexto'][folder.name]=sparse
 paths=sorted(folder.glob('page-*.png'),key=lambda p:int(p.stem.split('-')[-1]));assert len(paths)==len(pages)
 sheet(paths,folder.name)
slides=sorted((R/'validacao/slides').glob('Slide*.PNG'),key=lambda p:int(p.stem[5:]));assert len(slides)==76
sheet(slides,'seminario',400,225,4,4)
# As figuras aprovadas continuam iguais: a única mudança nos slides de
# atividades é o contador no rodapé após inserir a visão na abertura.
pixel=[]
for old,new in zip(range(4,11),range(6,13)):
 a=Image.open(OLD/f'validacao/slides/Slide{old}.PNG').convert('RGB');b=Image.open(R/f'validacao/slides/Slide{new}.PNG').convert('RGB')
 box=(0,0,a.width,830);same=a.crop(box).tobytes()==b.crop(box).tobytes();assert same,(old,new);pixel.append(new)
report['slidesAtividadesPreservados']=pixel
report['slides']=len(slides)
(R/'validacao/conferencia.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n','utf-8')
print(json.dumps(report,ensure_ascii=False))

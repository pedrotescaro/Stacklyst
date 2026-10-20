from pathlib import Path
from zipfile import ZipFile
from lxml import etree
from PIL import Image
import json, hashlib

OUT=Path(__file__).resolve().parents[1]/'fontes-extraidas'
OUT.mkdir(parents=True,exist_ok=True)
SOURCE=Path(__file__).resolve().parents[1]/'fontes-originais'
NAMES=['01-documento-de-visao-stacklyst-revisao-textual.docx','02-atividades-do-negocio-stacklyst-astah.docx','03-requisitos-do-sistema-stacklyst-revisao-textual.docx','04-casos-de-uso-stacklyst-astah.docx']
NS={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main','a':'http://schemas.openxmlformats.org/drawingml/2006/main','r':'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
allitems=[]
for name in NAMES:
    dest=OUT/name[:2];dest.mkdir(exist_ok=True)
    with ZipFile(SOURCE/name) as z:
        root=etree.fromstring(z.read('word/document.xml'))
        relroot=etree.fromstring(z.read('word/_rels/document.xml.rels'))
        rels={r.get('Id'):r.get('Target') for r in relroot}
        paras=[];images=[];tables=[]
        for i,p in enumerate(root.xpath('//w:body//w:p',namespaces=NS)):
            t=''.join(p.xpath('.//w:t/text()',namespaces=NS))
            st=p.xpath('./w:pPr/w:pStyle/@w:val',namespaces=NS)
            picids=p.xpath('.//a:blip/@r:embed',namespaces=NS)
            paras.append({'index':i,'text':t,'style':st[0] if st else '', 'images':picids})
            for rid in picids:
                target=rels[rid]; media='word/'+target
                imdest=dest/Path(target).name
                blob=z.read(media);imdest.write_bytes(blob)
                try:
                    with Image.open(imdest) as im: dims=list(im.size)
                except: dims=None
                images.append({'paragraph':i,'rid':rid,'path':str(imdest),'sha256':hashlib.sha256(blob).hexdigest(),'dimensions':dims,'context_before':[v['text'] for v in paras[max(0,i-5):i] if v['text']]})
        for p in images:
            i=p['paragraph'];p['context_after']=[v['text'] for v in paras[i+1:i+6] if v['text']]
        for j,tab in enumerate(root.xpath('//w:body//w:tbl',namespaces=NS)):
            rows=[]
            for row in tab.xpath('./w:tr',namespaces=NS):
                rows.append(['\n'.join(''.join(p.xpath('.//w:t/text()',namespaces=NS)) for p in cell.xpath('./w:p',namespaces=NS)) for cell in row.xpath('./w:tc',namespaces=NS)])
            tables.append({'table':j,'rows':rows})
        item={'filename':name,'paragraphs':paras,'images':images,'tables':tables}
        allitems.append(item)
        (dest/'text.txt').write_text('\n'.join(f"{p['index']:04d} [{p['style']}] {p['text']}"+(' [IMAGEM '+','.join(p['images'])+']' if p['images'] else '') for p in paras),encoding='utf-8')
        (dest/'inventory.json').write_text(json.dumps(item,ensure_ascii=False,indent=2),encoding='utf-8')
(OUT/'inventario.json').write_text(json.dumps(allitems,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps([{'file':a['filename'],'paragraphs':len(a['paragraphs']),'images':len(a['images']),'tables':len(a['tables'])} for a in allitems],ensure_ascii=False,indent=2))

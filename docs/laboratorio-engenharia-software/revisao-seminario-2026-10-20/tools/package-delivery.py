from pathlib import Path
import hashlib,json,zipfile
from lxml import etree
from pypdf import PdfReader

root=Path(__file__).resolve().parents[1]
pptx=root/'apresentacao/Stacklyst-seminario-revisado-2026-10-20.pptx'
pdf=pptx.with_suffix('.pdf')
asta=root/'Stacklyst-seminario-revisado.asta'
ns={'a':'http://schemas.openxmlformats.org/drawingml/2006/main'}
with zipfile.ZipFile(pptx) as z:
    assert z.testzip() is None
    names=[n for n in z.namelist() if __import__('re').fullmatch(r'ppt/slides/slide\d+\.xml',n)]
    assert len(names)==51
    alltext='\n'.join(' '.join(etree.fromstring(z.read(n)).xpath('//a:t/text()',namespaces=ns)) for n in names)
    for s in ['Pedro Antonio Silvestre Tescaro','Guilherme Alves de Campos','Paulo Henrique Leal dos Santos','AN01','AN02','AN03','AN04','AN05A','AN05B','AN06']:
        assert s in alltext,s
    hashes={hashlib.sha256(z.read(n)).hexdigest() for n in z.namelist() if n.startswith('ppt/media/')}
    evidence=json.loads((root/'evidencias-codigo/evidencias.json').read_text(encoding='utf-8-sig'))
    for e in evidence['items']:
        assert hashlib.sha256(Path(e['png']).read_bytes()).hexdigest() in hashes,e['id']
    diagrams=json.loads((root/'diagramas/manifest.json').read_text(encoding='utf-8-sig'))
    assert len(diagrams)==22
    for key,item in diagrams.items():
        h=hashlib.sha256((root/'diagramas'/f'{key}.png').read_bytes()).hexdigest()
        assert h==item['sha256'],key
        assert h in hashes,key
    assert hashlib.sha256((root/'evidencias-codigo/prototipo-candidaturas.png').read_bytes()).hexdigest() in hashes
assert len(PdfReader(pdf).pages)==51
assert asta.stat().st_size>250000
package=root/'Stacklyst-seminario-revisado-completo-2026-10-20.zip'
items=[(pptx,Path('apresentacao')/pptx.name),(pdf,Path('apresentacao')/pdf.name),(asta,Path(asta.name)),(root/'README.md',Path('LEIA-ME.md')),(root/'RASTREABILIDADE.md',Path('RASTREABILIDADE.md'))]
for p in sorted((root/'diagramas').glob('*')):
    if p.suffix in ['.png','.json']:items.append((p,Path('diagramas')/p.name))
for p in sorted((root/'evidencias-codigo').glob('*')):
    if p.suffix=='.png' or p.name in ['evidencias.json','roteiro-demonstracoes.json','prototipo-candidaturas.html','prototipo-candidaturas.css','prototipo-candidaturas-trecho.tsx.txt','prototipo-candidaturas-origens.json']:
        items.append((p,Path('evidencias-codigo')/p.name))
for p in sorted((root/'analise-sistema').glob('*')):
    if p.suffix in ['.md','.json','.mjs']:
        items.append((p,Path('analise-sistema')/p.name))
for name in ['01-documento-de-visao-stacklyst-revisao-textual.docx','02-atividades-do-negocio-stacklyst-astah.docx','03-requisitos-do-sistema-stacklyst-revisao-textual.docx','04-casos-de-uso-stacklyst-astah.docx']:
    items.append((root/'fontes-originais'/name,Path('documentos-de-referencia')/name))
manifest=[]
with zipfile.ZipFile(package,'w',zipfile.ZIP_DEFLATED) as z:
    for src,dest in items:
        z.write(src,dest.as_posix())
        manifest.append({'path':dest.as_posix(),'bytes':src.stat().st_size,'sha256':hashlib.sha256(src.read_bytes()).hexdigest()})
    z.writestr('ARQUIVOS.json',json.dumps(manifest,ensure_ascii=False,indent=2))
with zipfile.ZipFile(package) as z:
    assert z.testzip() is None
    count=len(z.namelist())
report={'slides':51,'pdf_pages':51,'code_captures_embedded':9,'zip_files':count,'zip_integrity':'pass','pptx_sha256':hashlib.sha256(pptx.read_bytes()).hexdigest(),'package_sha256':hashlib.sha256(package.read_bytes()).hexdigest(),'outputs':[str(pptx),str(pdf),str(package),str(asta)],'demonstrations':'Roteirizadas; não executadas nesta revisão.'}
(root/'.build/VALIDACAO-FINAL.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))

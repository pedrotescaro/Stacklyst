from pathlib import Path
import json,re,hashlib,zipfile
from lxml import etree as E
R=Path(__file__).resolve().parents[1];ROOT=R.parents[2];M=ROOT/'docs/manual/detalhado'
plan=json.loads((R/'tools/astah-plan.json').read_text(encoding='utf-8'))
audit=json.loads((R/'validacao/astah-native-audit.json').read_text(encoding='utf-8'))
assert audit['catalogCount']==24 and audit['allCatalogCasesInGeneral']
assert len(plan['conceptual']['views']['GERAL']['names'])==8
assert all(len(v['names'])<=6 for k,v in plan['conceptual']['views'].items() if k!='GERAL')
assert all(len(v)<=5 for k,v in plan['relationalViews'].items() if k!='GERAL')
assert len(plan['relationalViews']['GERAL'])==10
for role in ['Usuário','Avaliador','Recrutador','Administrador']:assert len(audit['actorModelIds'][role])==1
assert sorted(audit['generalizations'])==sorted([x+' -> Usuário' for x in ['Avaliador','Recrutador','Administrador']])
assert len(audit['includes'])==2 and len(audit['extends'])==4
for s in plan['sequences']:
    for text in s['participants']+[m[2] for m in s['messages']]:
        assert not re.search(r'assessLessonStep|saveLessonAssessment|JobService|requireRole|MultiplayerArena|AdventureHub|[a-z][A-Z]|feedback|Harness|API de',text),(s['id'],text)
for c in json.loads((R/'evidencias-codigo/recortes.json').read_text(encoding='utf-8')):
    lines=(ROOT/c['file']).read_text(encoding='utf-8').splitlines()
    assert '\n'.join(lines[c['start']-1:c['end']])==c['code'],c['id']
activity=next((R/'fontes-originais').glob('02*.docx'))
assert activity.read_bytes()==(R/'entregaveis'/activity.name).read_bytes()
files=[]
for p in (R/'entregaveis').iterdir():
    if p.suffix in ['.docx','.pptx']:
        with zipfile.ZipFile(p) as z:
            assert z.testzip() is None
            texts=[]
            for name in z.namelist():
                if name.endswith('.xml'):
                    try:node=E.fromstring(z.read(name))
                    except E.XMLSyntaxError:raise AssertionError((p.name,name))
                    if (name.startswith('word/') or name.startswith('ppt/slides/')) and not name.endswith('.rels'):texts += node.xpath('//*[local-name()="t"]/text()')
            joined='\n'.join(texts)
            assert '\ufffd' not in joined and not re.search(r'Ã[\u0080-\u00bf]',joined),p.name
        files.append(dict(name=p.name,bytes=p.stat().st_size,sha256=hashlib.sha256(p.read_bytes()).hexdigest()))
record={'academicUseCases':24,'overviewClasses':8,'specificClassLimit':6,'overviewTables':10,'nativeDiagrams':len(audit['diagrams']),'codeExcerptsVerified':9,'approvedActivityDocumentUnchanged':True,'files':files}
(R/'validacao/entrega-final.json').write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({k:v for k,v in record.items() if k!='files'},ensure_ascii=False))

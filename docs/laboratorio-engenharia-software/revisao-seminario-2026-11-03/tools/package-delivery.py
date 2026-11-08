from pathlib import Path
import json,zipfile,hashlib,shutil,re
R=Path(__file__).resolve().parents[1];ROOT=R.parents[2];OUT=R/'entregaveis'
for stem in ['01-documento-de-visao-atualizado','03-requisitos-e-regras-atualizados','04-casos-de-uso-e-modelos-atualizados','05-manual-tecnico-da-plataforma']:
    source=R/'validacao/rendered'/stem/(stem+'.pdf');assert source.exists()
    shutil.copy2(source,OUT/source.name)
# Retain only currently rendered supplementary SVGs; the native Astah figures
# are the authoritative UML outputs.
directory=ROOT/'docs/manual/detalhado/diagramas'
manifest=json.loads((directory/'render-manifest.json').read_text(encoding='utf-8'))
expected={k+'.svg' for k in manifest['diagrams']}
for p in directory.iterdir():
    if p.suffix=='.puml' or p.suffix=='.svg' and p.name not in expected:
        assert p.resolve().is_relative_to((ROOT/'docs/manual/detalhado').resolve());p.unlink()
items=[]
for folder in [ROOT/'docs/manual',R]:
    for p in folder.rglob('*'):
        if not p.is_file():continue
        rel=p.relative_to(R) if p.is_relative_to(R) else None
        if rel and (rel.parts[0]=='fontes-originais' or rel.parts[0]=='validacao' and len(rel.parts)>1 and rel.parts[1] in ['rendered','slides','slides-atividades-originais','montagens']):continue
        if p.suffix in ['.zip','.bak','.pyc'] or '__pycache__' in p.parts:continue
        if p.name=='sequencias-especificacao-fonte.md':continue
        items.append(p)
items += [ROOT/'scripts'/n for n in ['build-platform-reference.mjs','build-system-handbook.mjs','render-system-handbook.mjs','check-system-handbook.mjs','check-platform-docs.mjs']]
archive=OUT/'Stacklyst-documentacao-e-modelos-2026-11-03.zip'
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as z:
    for p in sorted(set(items)):z.write(p,p.relative_to(ROOT).as_posix())
record={'archive':archive.name,'bytes':archive.stat().st_size,'sha256':hashlib.sha256(archive.read_bytes()).hexdigest(),'entries':len(set(items)),'pdfs':4,'useCases':24,'generalClasses':8}
(R/'validacao/pacote.json').write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(record,ensure_ascii=False))

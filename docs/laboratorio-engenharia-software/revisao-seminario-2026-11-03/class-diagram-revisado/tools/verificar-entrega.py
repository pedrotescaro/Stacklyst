"""Confere o inventário extraído do arquivo final pela API oficial do Astah."""
from pathlib import Path
import hashlib
import json
import shutil
from itertools import combinations
from zipfile import ZipFile, ZIP_DEFLATED

R = Path(__file__).resolve().parents[1]
workspace = next(p for p in R.parents if (p / 'prisma/schema.prisma').exists())
tmp = workspace / '.tmp/astah-nov'
before = json.loads((tmp / 'supplied-class-original.json').read_text('utf-8'))
after = json.loads((tmp / 'supplied-class.json').read_text('utf-8'))
specs = json.loads((R / 'tools/especificacao.json').read_text('utf-8'))
classes = {c['name']: c for c in after['classes']}
originals = {c['name']: c for c in before['classes']}
count = 0
for name, spec in specs.items():
    c = classes[name]
    assert c['id'] == originals[name]['id'], name
    assert [[a['name'], a['type']] for a in c['attributes'] if a['name']] == spec['a'], name
    ops = [[o['name'], o['type'], [[p['name'], p['type']] for p in o['parameters']]] for o in c['operations']]
    expected = [[o[0], o[1], o[2] if len(o) > 2 else []] for o in spec['o']]
    assert ops == expected, name
    count += len(ops)
assert count == 43
assert not {'Texto', 'Inteiro', 'Lógico', 'DataHora', 'Enumeração'} & set(classes)
diagram, = after['diagrams']
nodes = [p for p in diagram['presentations'] if p['type'] == 'Class']
links = [p for p in diagram['presentations'] if p['type'] == 'Association']
assert len(nodes) == 10 and len(links) == 10
for a, b in combinations(nodes, 2):
    assert not (max(a['x'], b['x']) < min(a['x'] + a['width'], b['x'] + b['width'])
                and max(a['y'], b['y']) < min(a['y'] + a['height'], b['y'] + b['height'])), (a['label'], b['label'])
for p in links:
    assert len(p['ends']) == 2
    assert sorted(e['multiplicity'] for e in p['ends']) == ['0..*', '1'], p['label']
source = Path('C:/Users/PEDRO/Downloads/Class Diagram Stacklyst.asta')
original = R / 'Class Diagram Stacklyst - original.asta'
assert source.read_bytes() == original.read_bytes()
model = R / 'Class Diagram Stacklyst - revisado.asta'
with ZipFile(model) as z:
    assert z.testzip() is None
export = next((R / 'imagens').rglob('*.png'))
preview = R / 'Diagrama de classes Stacklyst.png'
shutil.copyfile(export, preview)
shutil.copyfile(tmp / 'supplied-class.json', R / 'tools/inventario-final.json')
report = {
    'classes': len(nodes), 'operacoes': count, 'associacoes': len(links),
    'idsDasClassesPreservados': True, 'tiposEParametrosConferidos': True,
    'caixasSobrepostas': 0, 'originalPreservado': True,
    'sha256Original': hashlib.sha256(original.read_bytes()).hexdigest(),
    'sha256Revisado': hashlib.sha256(model.read_bytes()).hexdigest(),
    'exportacao': 'PNG exportado diretamente pelo Astah UML 12',
}
(R / 'tools/validacao.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', 'utf-8')
archive = R / 'Stacklyst-diagrama-de-classes-revisado.zip'
with ZipFile(archive, 'w', ZIP_DEFLATED) as z:
    for p in [model, original, preview, R / 'LEIA-ME.md', *sorted((R / 'tools').glob('*'))]:
        if p.is_file():
            z.write(p, str(p.relative_to(R)))
with ZipFile(archive) as z:
    assert z.testzip() is None
print(json.dumps(report, ensure_ascii=False))

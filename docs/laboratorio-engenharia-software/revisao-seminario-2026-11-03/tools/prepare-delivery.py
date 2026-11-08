from pathlib import Path
import json,shutil
R=Path(__file__).resolve().parents[1];ROOT=R.parents[2]
inventory=json.loads((R/'diagramas/inventario-astah.json').read_text(encoding='utf-8'))
expected={d['name']+'.png' for d in inventory}
exports=R/'diagramas/astah-export'
for p in exports.rglob('*.png'):
    if p.name not in expected:
        assert p.resolve().is_relative_to(R.resolve());p.unlink()
for folder in ['fontes','imagens']:
    target=R/'diagramas'/folder
    assert target.resolve().is_relative_to(R.resolve()) and target!=R
    if target.exists():shutil.rmtree(target)
for name in ['diagramas/inventario-diagramas.json','tools/build_uml.py','tools/prepare-native-plan.py']:
    target=R/name
    if target.exists():target.unlink()
for id in ['UC-GERAL','CL-GERAL','DER-GERAL']:
    paths=list(exports.rglob(id+' *.png'));assert len(paths)==1,(id,len(paths))
    shutil.copy2(paths[0],R/'entregaveis'/(id+'.png'))
print('Delivery sources cleaned;',len(inventory),'native diagrams retained')

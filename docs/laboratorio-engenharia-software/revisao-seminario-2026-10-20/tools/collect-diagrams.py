from pathlib import Path
import json,re,shutil,hashlib
from PIL import Image
R=Path(__file__).resolve().parents[1]
created=json.loads((R/'.build/diagramas-criados.json').read_text('utf-8'))
manifest={}
for z in created:
 candidates=[p for p in (R/'.build/astah-export').rglob('*.png') if p.stem==z['name'] and 'Seminário 20-10-2026' in str(p)]
 if len(candidates)!=1: raise ValueError((z,candidates))
 p=candidates[0];out=R/'diagramas'/f"{z['id']}.png";shutil.copy2(p,out)
 manifest[z['id']]={'path':str(out),'source':str(p),'name':z['name'],'dimensions':Image.open(out).size,'sha256':hashlib.sha256(out.read_bytes()).hexdigest()}
(R/'diagramas/manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),'utf-8')
print(json.dumps({k:v['dimensions'] for k,v in manifest.items()},ensure_ascii=False))

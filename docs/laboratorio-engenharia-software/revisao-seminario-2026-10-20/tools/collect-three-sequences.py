from pathlib import Path
import json,hashlib,shutil,zipfile
from PIL import Image
R=Path(__file__).resolve().parents[1]
p=R/'diagramas/manifest.json';m=json.loads(p.read_text('utf-8'));targets={'SQ02-B','SQ03-A','SQ03-C'}
before={k:v['sha256'] for k,v in m.items()}
for k in targets:
 v=m[k];src=Path(v['source']);out=Path(v['path']);shutil.copy2(src,out);v['dimensions']=Image.open(out).size;v['sha256']=hashlib.sha256(out.read_bytes()).hexdigest();v['message_y_offset']=25
unchanged=all(hashlib.sha256(Path(v['path']).read_bytes()).hexdigest()==before[k] for k,v in m.items() if k not in targets)
if not unchanged: raise ValueError('An unrelated output changed')
p.write_text(json.dumps(m,ensure_ascii=False,indent=2),'utf-8')
print({'updated':sorted(targets),'other_19_unchanged':unchanged,'astah_integrity':zipfile.ZipFile(R/'Stacklyst-seminario-revisado.asta').testzip()})

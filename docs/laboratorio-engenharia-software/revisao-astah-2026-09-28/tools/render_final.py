import importlib.util
from pathlib import Path
R=Path(__file__).resolve().parents[1]
renderer_path=Path(r'C:/Users/PEDRO/.codex/plugins/cache/openai-primary-runtime/documents/26.905.11957/skills/documents/render_docx.py')
spec=importlib.util.spec_from_file_location('renderer',renderer_path)
renderer=importlib.util.module_from_spec(spec)
spec.loader.exec_module(renderer)
qa=R/'qa-rendered-v2';qa.mkdir(exist_ok=True)
for doc in sorted((R/'entrega-v2').glob('*.docx')):
    dest=qa/doc.stem;dest.mkdir(exist_ok=True)
    pdf=R/'qa-word-v2'/doc.stem/(doc.stem+'.pdf')
    renderer.convert_to_pdf=lambda *a,**kw:(str(pdf),'Word')
    pages=renderer.rasterize(str(doc),str(dest),110,False,False)
    print(doc.name,len(pages))

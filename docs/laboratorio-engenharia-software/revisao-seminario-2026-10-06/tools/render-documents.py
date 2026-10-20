from pathlib import Path
import importlib.util
R=Path(__file__).resolve().parents[1]
renderer_path=Path('C:/Users/PEDRO/.codex/plugins/cache/openai-primary-runtime/documents/26.905.11957/skills/documents/render_docx.py')
spec=importlib.util.spec_from_file_location('docx_renderer',renderer_path)
renderer=importlib.util.module_from_spec(spec);spec.loader.exec_module(renderer)
for doc in sorted((R/'documentos').glob('*.docx')):
 pdf=R/'.build/word'/(doc.stem+'.pdf')
 renderer.convert_to_pdf=lambda *a,**kw:(str(pdf),'Word COM')
 out=R/'.build/doc-pages'/doc.stem;out.mkdir(parents=True,exist_ok=True)
 pages=renderer.rasterize(str(doc),str(out),95,False,False)
 print(doc.name,len(pages),flush=True)

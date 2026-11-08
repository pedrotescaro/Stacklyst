"""Canonical document renderer with Microsoft Word PDF conversion on Windows."""
from pathlib import Path
import importlib.util
import os
R=Path(__file__).resolve().parents[1]
path=Path('C:/Users/PEDRO/.codex/plugins/cache/openai-primary-runtime/documents/26.1026.10807/skills/documents/render_docx.py')
spec=importlib.util.spec_from_file_location('canonical_renderer',path);renderer=importlib.util.module_from_spec(spec);spec.loader.exec_module(renderer)
for doc in sorted((R/'entregaveis').glob('*.docx')):
    if doc.name.startswith('02-'):continue
    if os.environ.get('DOC_ONLY') and not doc.name.startswith(os.environ['DOC_ONLY']):continue
    if os.environ.get('DOC_EXCLUDE') and doc.name.startswith(os.environ['DOC_EXCLUDE']):continue
    out=R/'validacao/rendered'/doc.stem;pdf=out/(doc.stem+'.pdf')
    if not pdf.exists() or pdf.stat().st_mtime<doc.stat().st_mtime:raise RuntimeError('Export PDF after editing '+doc.name)
    renderer.convert_to_pdf=lambda *a,**kw:(str(pdf),'Converted with Microsoft Word on Windows')
    for old in out.glob('page-*.png'):old.unlink()
    pages=renderer.rasterize(str(doc),str(out),85,False,False)
    print(doc.name,len(pages),'pages rendered',flush=True)

"""Rasterize Word-exported PDFs with the document skill's canonical renderer.

Word supplies conversion on Windows where the bundled LibreOffice is unavailable.
The DOCX must have been exported by export_word.ps1 immediately before this command.
"""
import argparse
import importlib.util
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument('--renderer', type=Path, required=True)
parser.add_argument('--output', type=Path, required=True)
parser.add_argument('--document-name', default='*.docx')
args = parser.parse_args()
spec = importlib.util.spec_from_file_location('canonical_renderer', args.renderer)
renderer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(renderer)
root = Path(__file__).resolve().parents[1]
for document in sorted((root / 'entregaveis').glob(args.document_name)):
    destination = args.output.resolve() / document.stem
    exported_pdf = destination / f'{document.stem}.pdf'
    if not exported_pdf.exists() or exported_pdf.stat().st_mtime < document.stat().st_mtime:
        raise RuntimeError(f'Export PDF again after editing {document.name}')
    renderer.convert_to_pdf = lambda *a, **kw: (str(exported_pdf), 'Converted by Microsoft Word on Windows')
    pages = renderer.rasterize(str(document), str(destination), 110, False, False)
    print(f'{document.name}: {len(pages)} pages rendered')

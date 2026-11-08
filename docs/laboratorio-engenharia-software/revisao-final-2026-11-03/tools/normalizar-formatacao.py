"""Corrige campos e numeração preservando a aparência dos modelos do Drive."""
from pathlib import Path
import re
from docx import Document
from docx.oxml.ns import qn
R=Path(__file__).resolve().parents[1]
for path in sorted((R/'entregaveis').glob('0*.docx')):
 d=Document(path)
 # As seções horizontais dos modelos herdavam início em 1. A numeração
 # agora continua ao mudar a orientação e o sumário usa páginas coerentes.
 for i,section in enumerate(d.sections):
  num=section._sectPr.find(qn('w:pgNumType'))
  if i>0 and num is not None:num.attrib.pop(qn('w:start'),None)
  for part in [section.header,section.footer]:
   for t in part._element.iter(qn('w:t')):
    if t.text and ('2026' in t.text):t.text=re.sub(r'\b\d{2}/\d{2}/2026\b','03/11/2026',t.text)
 if path.name.startswith('02'):
  for p in d.paragraphs:
   if 'Revisão documental:' in p.text:
    for run in p.runs:run.text=re.sub(r'\b\d{2}/\d{2}/2026\b','03/11/2026',run.text)
  # O campo original tinha barras e aspas escapadas em duplicidade,
  # impedindo o Word de identificar os títulos do documento.
  for field in d._element.iter(qn('w:instrText')):
   if 'TOC' in (field.text or ''):field.text=' TOC \\o "1-3" \\h \\z \\u '
 d.save(path)
 print(path.name)

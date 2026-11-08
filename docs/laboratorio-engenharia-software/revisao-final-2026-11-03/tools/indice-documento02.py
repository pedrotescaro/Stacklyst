"""Índice com links e referências de página nativas, sem o campo TOC legado."""
from pathlib import Path
from docx import Document
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Pt,Inches
from docx.enum.text import WD_TAB_ALIGNMENT,WD_TAB_LEADER
R=Path(__file__).resolve().parents[1]
path=next((R/'entregaveis').glob('02*.docx'));d=Document(path)
heads=[p for p in d.paragraphs if p.text.strip() and p.style.name.lower() in ['heading 1','heading 2','heading 3']]
container=next(s for s in d._element.iter(qn('w:sdt')) if any('TOC' in (i.text or '') for i in s.iter(qn('w:instrText'))))
bookmark_id=max([int(b.get(qn('w:id'))) for b in d._element.iter(qn('w:bookmarkStart'))]+[1000])+1
for i,head in enumerate(heads,1):
 name='StacklystIndice'+str(i);start=OxmlElement('w:bookmarkStart');start.set(qn('w:id'),str(bookmark_id+i));start.set(qn('w:name'),name)
 end=OxmlElement('w:bookmarkEnd');end.set(qn('w:id'),str(bookmark_id+i));head._p.insert(1 if head._p.pPr is not None else 0,start);head._p.append(end)
 p=d.add_paragraph();p.paragraph_format.space_after=Pt(2);p.paragraph_format.line_spacing=1;p.paragraph_format.keep_with_next=False
 level=int(head.style.name[-1]);p.paragraph_format.left_indent=Inches((level-1)*0.12)
 sec=d.sections[0];width=sec.page_width-sec.left_margin-sec.right_margin;p.paragraph_format.tab_stops.add_tab_stop(width,WD_TAB_ALIGNMENT.RIGHT,WD_TAB_LEADER.DOTS)
 link=OxmlElement('w:hyperlink');link.set(qn('w:anchor'),name);run=OxmlElement('w:r');props=OxmlElement('w:rPr');size=OxmlElement('w:sz');size.set(qn('w:val'),'18');props.append(size);run.append(props);t=OxmlElement('w:t');t.text=head.text;run.append(t);link.append(run);p._p.append(link)
 p.add_run('\t').font.size=Pt(9);field=OxmlElement('w:fldSimple');field.set(qn('w:instr'),'PAGEREF '+name+' \\h');p._p.append(field)
 container.addprevious(p._p)
container.getparent().remove(container)
d.save(path)
print('Índice com',len(heads),'entradas e referências de página nativas.')

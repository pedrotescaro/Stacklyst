"""Normalize typography without replacing text, tables, diagrams or template layout.

Usage: python format_documents.py INPUT.docx OUTPUT.docx
Export the result with Word and update its fields before visual verification.
"""

import argparse
from pathlib import Path
from zipfile import ZipFile

from docx import Document
from docx.enum.style import WD_STYLE_TYPE
from docx.shared import Pt, Inches
from docx.oxml import OxmlElement
from docx.oxml.ns import qn


def signature(document):
    return tuple(document._element.xpath('//w:t/text()'))


def format_document(source, destination):
    document = Document(source)
    original = signature(document)
    sizes = {'normal': 11, 'heading 1': 18, 'heading 2': 14,
             'heading 3': 12, 'toc 1': 11, 'toc 2': 10.5, 'toc 3': 10,
             'caption': 10, 'title': 26, 'subtitle': 18}
    for style in document.styles:
        name = (style.name or '').lower()
        if name in sizes:
            style.font.name = 'Arial'
            style.font.size = Pt(sizes[name])
        if name.startswith('heading '):
            style.paragraph_format.keep_with_next = True
            style.paragraph_format.keep_together = True
            level = style.element.get_or_add_pPr().find(qn('w:outlineLvl'))
            if level is None:
                level = OxmlElement('w:outlineLvl')
                style.element.get_or_add_pPr().append(level)
            level.set(qn('w:val'), str(int(name.split()[-1])-1))
    # Google Docs exports localized heading names in a custom TOC style mapping.
    # Word's native outline-based field works across application languages.
    for field in document._element.xpath('//w:instrText'):
        if field.text and field.text.strip().startswith('TOC '):
            field.text = ' TOC \\o "1-3" \\h \\z \\u '
    for name in ['Title', 'Subtitle', 'Caption']:
        if name not in document.styles:
            document.styles.add_style(name, WD_STYLE_TYPE.PARAGRAPH)
        document.styles[name].font.name = 'Arial'
        document.styles[name].font.size = Pt(sizes[name.lower()])
    label = document.styles.add_style('Case label', WD_STYLE_TYPE.PARAGRAPH)
    label.base_style = document.styles['Heading 3']
    outline = OxmlElement('w:outlineLvl')
    outline.set(qn('w:val'), '9')
    label.element.get_or_add_pPr().append(outline)

    in_use_cases = False
    for paragraph in document.paragraphs:
        if not paragraph.text.strip():
            continue
        name = (paragraph.style.name or '').lower()
        if paragraph.text.startswith('5. Especificação dos Casos'):
            in_use_cases = True
        elif name == 'heading 1' and paragraph.text.startswith('6.'):
            in_use_cases = False
        if in_use_cases and paragraph.text.strip() in {
            'Protótipo de Interface', 'Fluxo Principal', 'Fluxos Alternativos'
        }:
            paragraph.style = label
        if name.startswith('toc '):
            continue
        if paragraph.text.strip() == 'Stacklyst':
            paragraph.style = document.styles['Title']
            size = 26
        elif paragraph.text.startswith(('Documento de ', 'Especificação de Casos de Uso do Sistema')):
            paragraph.style = document.styles['Subtitle']
            size = 18
        elif name.startswith('heading '):
            size = sizes.get(name, 12)
        elif paragraph.text.startswith(('Fonte editável:', 'Figura ', 'Fonte:')) or (
            paragraph.runs and all(r.font.size and r.font.size.pt <= 9 for r in paragraph.runs if r.text)
        ):
            size = 10
        else:
            size = 11
        for run in paragraph.runs:
            if run.text:
                run.font.name = 'Arial'
                run.font.size = Pt(size)
        paragraph.paragraph_format.widow_control = True
        if in_use_cases and name == 'normal':
            paragraph.paragraph_format.space_before = Pt(0)
            paragraph.paragraph_format.space_after = Pt(0)
            paragraph.paragraph_format.line_spacing = 1.0

    seen = set()
    for table in document.tables:
        if table.rows[0].cells[0].text.strip() == 'ID' and len(table.columns) > 2:
            extra = max(0, Inches(0.62)-table.columns[0].width)
            table.columns[0].width += extra
            table.columns[2].width -= extra
            for row in table.rows:
                row.cells[0].width = table.columns[0].width
                row.cells[2].width = table.columns[2].width
        for row in table.rows:
            for cell in row.cells:
                if cell._tc in seen:
                    continue
                seen.add(cell._tc)
                for paragraph in cell.paragraphs:
                    paragraph.paragraph_format.widow_control = True
                    for run in paragraph.runs:
                        if run.text:
                            run.font.name = 'Arial'
                            run.font.size = Pt(10)
    # Apply explicit cover sizes to Google Docs-exported runs with complex-script settings.
    relational_overview = False
    for paragraph in document.paragraphs:
        if paragraph.text.startswith('9.5 Modelo relacional'):
            relational_overview = True
        if relational_overview and paragraph._p.xpath('.//wp:inline'):
            for inline in paragraph._p.xpath('.//wp:inline'):
                extent = inline.find(qn('wp:extent'))
                old_height = int(extent.get('cy'))
                scale = min(1, Inches(6.3) / old_height)
                extent.set('cy', str(round(old_height * scale)))
                extent.set('cx', str(round(int(extent.get('cx')) * scale)))
                for image_extent in inline.xpath('.//a:xfrm/a:ext'):
                    image_extent.set('cy', extent.get('cy'))
                    image_extent.set('cx', extent.get('cx'))
            relational_overview = False
        for run in paragraph.runs:
            if run.font.size and run._r.rPr is not None:
                for value in run._r.rPr.findall(qn('w:szCs')):
                    value.set(qn('w:val'), str(int(run.font.size.pt * 2)))
    assert signature(document) == original, 'Formatting must preserve all source text'
    destination.parent.mkdir(parents=True, exist_ok=True)
    document.save(destination)
    with ZipFile(source) as before, ZipFile(destination) as after:
        media = [n for n in before.namelist() if n.startswith('word/media/')]
        assert all(before.read(n) == after.read(n) for n in media), 'Media changed'
    print(f'{destination.name}: text and {len(media)} media files preserved')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path)
    parser.add_argument('destination', type=Path)
    args = parser.parse_args()
    format_document(args.source, args.destination)

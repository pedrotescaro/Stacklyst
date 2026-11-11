"""Extract per-question statements and alternatives from the archived Inep PDFs.

Runs offline with PyMuPDF/Pillow. Original PDFs are never modified. Missing CID
Unicode maps in 2014/2017 are recovered using the source font glyph IDs; the
small Unicode map is committed so builds do not require proprietary font files.
"""
import json
import re
import unicodedata
from pathlib import Path
import fitz
from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parents[1]
FONT_MAP = json.loads((ROOT / 'scripts/enade-font-map.json').read_text(encoding='utf8'))


def clean(text):
    text = unicodedata.normalize('NFKC', text).translate(str.maketrans({'Ɵ': 'ti', 'Ʃ': 'tt', 'ơ': 'tí', 'İ': 'fí', 'Ō': 'ft', 'Ņ': 'fk', 'ͷ': '5', '\u0002': '←', '\u00ad': ''}))
    text = re.sub(r'(\w*f[il]) +(?=[a-záéíóúâêôãõç])', r'\1', text)
    text = re.sub(r'(\w+ti) +(?=[a-záéíóúâêôãõç])', r'\1', text)
    return text.strip()


def ascii_text(text):
    return unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode()


def source_document(year):
    doc = fitz.open(ROOT / f'public/enade/{year}/prova.pdf')
    changed = set()
    for page in doc:
        for font in page.get_fonts(full=True):
            xref, extension, _, name = font[:4]
            family = name.removesuffix('-Identity-H')
            if extension != 'cid' or family not in FONT_MAP or xref in changed:
                continue
            if doc.xref_get_key(xref, 'ToUnicode')[0] != 'null':
                continue
            changed.add(xref)
            entries = [f'<{int(cid):04x}> <{text.encode("utf-16-be").hex()}>' for cid, text in FONT_MAP[family].items()]
            cmap = '/CIDInit /ProcSet findresource begin 12 dict begin begincmap\n/CIDSystemInfo << /Registry (Adobe) /Ordering (UCS) /Supplement 0 >> def\n/CMapName /Recovered def /CMapType 2 def\n1 begincodespacerange <0000> <FFFF> endcodespacerange\n'
            for offset in range(0, len(entries), 100):
                block = entries[offset:offset + 100]
                cmap += f'{len(block)} beginbfchar\n' + '\n'.join(block) + '\nendbfchar\n'
            cmap += 'endcmap CMapName currentdict /CMap defineresource pop end end'
            target = doc.get_new_xref()
            doc.update_object(target, '<<>>')
            doc.update_stream(target, cmap.encode())
            doc.xref_set_key(xref, 'ToUnicode', f'{target} 0 R')
    return fitz.open(stream=doc.tobytes(), filetype='pdf') if changed else doc


def page_lines(page):
    return [{**line, 'text': clean(''.join(span['text'] for span in line['spans']))}
            for block in page.get_text('dict')['blocks'] for line in block.get('lines', [])]


def clip_text(doc, clip):
    """Use whole text lines, avoiding descenders from adjacent answer rows."""
    rect = fitz.Rect(clip['rect'])
    selected = []
    for line in page_lines(doc[clip['page']]):
        spans = []
        for span in line['spans']:
            box = fitz.Rect(span['bbox'])
            if rect.contains((box.tl + box.br) / 2):
                if ('Bundesbahn' in span['font'] or 'TT5D71' in span['font']) and re.fullmatch(r'[A-E]\s*', span['text']):
                    continue
                spans.append(span['text'])
        if spans:
            selected.append((line['bbox'][1], line['bbox'][0], ''.join(spans)))
    selected.sort(key=lambda line: (round(line[0] / 3), line[1]))
    return '\n'.join(line[2] for line in selected)


def extract(exam):
    doc = source_document(exam['year'])
    regions, headers = [], []
    last_columns = 1
    for index, page in enumerate(doc):
        lines = page_lines(page)
        found = []
        for line in lines:
            match = re.match(r'^QUESTAO\s+(DISCURSIVA\s+)?(\d{1,2})(.*)$', ascii_text(line['text']))
            if not match:
                continue
            kind = 'discursive' if match[1] or 'DISCURSIVA' in match[3] else 'objective'
            question = next((q for q in exam['questions'] if q['kind'] == kind and q['number'] == int(match[2]) and q['page'] == index + 1), None)
            if question and not any(q['id'] == question['id'] for q, _ in found):
                found.append((question, line))
        middle = page.rect.width / 2
        separators = [d['rect'].x0 for d in page.get_drawings()
                      if d['rect'].height > page.rect.height * .5 and d['rect'].width < 5]
        if exam['year'] == 2008 and separators:
            middle = sum(separators) / len(separators)
            columns = 2
        elif found:
            columns = 2 if any(line['bbox'][0] > middle for _, line in found) else 1
        else:
            columns = last_columns
        last_columns = columns
        footer = [line['bbox'][1] for line in lines if line['bbox'][1] > page.rect.height * .9
                  and ('TECNOLOGIA' in ascii_text(line['text'])
                       or (re.fullmatch(r'\d{1,2}', line['text']) and abs((line['bbox'][0] + line['bbox'][2]) / 2 - page.rect.width / 2) < 12))]
        bottom = min(footer) - 2 if footer else page.rect.height - 35
        for column in range(columns):
            x0 = 20 if column == 0 else middle + 3
            x1 = middle - 3 if columns == 2 and column == 0 else page.rect.width - 20
            region_index = len(regions)
            regions.append({'page': index, 'rect': [x0, 65 if exam['year'] == 2011 else 74, x1, bottom]})
            for question, line in found:
                col = int(line['bbox'][0] > middle) if columns == 2 else 0
                if col == column:
                    headers.append({'question': question, 'region': region_index, 'box': line['bbox']})
    headers.sort(key=lambda h: (h['region'], h['box'][1]))
    assert len(headers) == 40, (exam['year'], 'headers', len(headers))
    result = []
    for hi, header in enumerate(headers):
        question = header['question']
        next_header = headers[hi + 1] if hi + 1 < len(headers) else None
        end = next_header['region'] if next_header else header['region'] + 2
        end = min(end, len(regions) - 1)
        last_content_page = {2008: 23, 2011: 21, 2014: 26, 2017: 39, 2021: 43}[exam['year']]
        clips = []
        for ri in range(header['region'], end + 1):
            region = regions[ri]
            if region['page'] >= last_content_page:
                break
            rect = list(region['rect'])
            if ri == header['region']:
                rect[1] = header['box'][3] + 3
            if next_header and ri == next_header['region']:
                rect[3] = next_header['box'][1] - 4
            if rect[3] > rect[1] + 2:
                clips.append({'page': region['page'], 'rect': rect})
        markers = []
        for ci, clip in enumerate(clips):
            for line in page_lines(doc[clip['page']]):
                first = next((s for s in line['spans'] if s['text'].strip()), None)
                if first and fitz.Rect(clip['rect']).contains(fitz.Rect(first['bbox']).tl + (fitz.Rect(first['bbox']).br - fitz.Rect(first['bbox']).tl) / 2) and ('Bundesbahn' in first['font'] or 'TT5D71' in first['font']) and re.match(r'^[A-E]\s*$', first['text'].strip()):
                    markers.append({'letter': first['text'].strip(), 'clip': ci, 'box': first['bbox']})
        markers.sort(key=lambda m: (m['clip'], round(m['box'][1] / 3), m['box'][0]))
        if len(markers) == 5:
            markers.sort(key=lambda m: m['letter'])
        if question['kind'] == 'discursive':
            markers = []
        if question['kind'] == 'objective':
            letters = ''.join(m['letter'] for m in markers)
            if letters != 'ABCDE':
                result.append({'id': question['id'], 'error': letters, 'clips': clips})
                continue
        stem = []
        for ci, clip in enumerate(clips):
            rect = list(clip['rect'])
            if markers and ci == markers[0]['clip']:
                rect[3] = markers[0]['box'][1] - 2
            if markers and ci > markers[0]['clip']:
                break
            if rect[3] > rect[1] + 2:
                stem.append({'page': clip['page'], 'rect': rect})
        options = []
        for mi, marker in enumerate(markers):
            following = markers[mi + 1] if mi < 4 else None
            pieces = []
            for ci in range(marker['clip'], (following['clip'] if following else len(clips) - 1) + 1):
                clip = clips[ci]
                rect = list(clip['rect'])
                if ci == marker['clip']:
                    rect[1] = marker['box'][1] - 2
                    rect[0] = marker['box'][2] + 1
                if following and ci == following['clip']:
                    if abs(following['box'][1] - marker['box'][1]) < 3 and ci == marker['clip']:
                        rect[2] = following['box'][0] - 3
                    else:
                        rect[3] = following['box'][1] - 2
                # A horizontal row ends before a later row of alternatives.
                if ci == marker['clip'] and following and abs(following['box'][1] - marker['box'][1]) < 3:
                    later = [m['box'][1] for m in markers[mi + 1:] if m['clip'] == ci and m['box'][1] > marker['box'][1] + 3]
                    if later: rect[3] = min(later) - 2
                if rect[3] > rect[1] and rect[2] > rect[0]:
                    pieces.append({'page': clip['page'], 'rect': rect})
            text = '\n'.join(clip_text(doc, c) for c in pieces)
            text = re.split(r'(?im)^\s*(?:(?:Á?rea|ea) livre|RASCUNHO)', text)[0]
            options.append({'letter': marker['letter'], 'text': clean(text), 'clips': pieces})
        context = '\n'.join(clip_text(doc, c) for c in stem)
        context = re.sub(r'(?im)^\s*RASCUNHO[^\n]*', '', context)
        result.append({'id': question['id'], 'statement': clean(context), 'contextClips': stem, 'options': options})
    return result


def trimmed_clip(doc, clip):
    rect = fitz.Rect(clip['rect'])
    for line in page_lines(doc[clip['page']]):
        if rect.contains(fitz.Point(line['bbox'][0] + 1, line['bbox'][1] + 1)) and re.match(r'(?i)^(?:RASCUNHO|ÁREA LIVRE|AREA LIVRE)', line['text']):
            rect.y1 = min(rect.y1, line['bbox'][1] - 3)
    return {'page': clip['page'], 'rect': list(rect)}


def render_clip(doc, clip, destination):
    rect = fitz.Rect(clip['rect'])
    if rect.height < 2:
        return False
    pix = doc[clip['page']].get_pixmap(matrix=fitz.Matrix(2.5, 2.5), clip=rect, alpha=False)
    image = Image.frombytes('RGB', (pix.width, pix.height), pix.samples)
    ink = ImageChops.difference(image, Image.new('RGB', image.size, 'white')).convert('L').point(lambda p: 255 if p > 35 else 0).getbbox()
    if not ink:
        return False
    # Trim only vertical whitespace, retaining the source column's width and scale.
    image = image.crop((0, max(0, ink[1] - 16), image.width, min(image.height, ink[3] + 16)))
    image.save(destination, 'WEBP', quality=92, method=6)
    return True


def publish(exam, items):
    year = exam['year']
    doc = source_document(year)
    folder = ROOT / f'public/enade/{year}/questions'
    folder.mkdir(exist_ok=True)
    published = []
    for item in items:
        question = next(q for q in exam['questions'] if q['id'] == item['id'])
        stem = item['contextClips']
        # These two questions have diagrams as choices. Their letters sit halfway
        # down the artwork, so normal text-line boundaries would crop the diagrams.
        graphic_options = {
            '2017-objective-20': [(24, [82, 132, 315, 272]), (24, [82, 273, 315, 413]), (24, [82, 414, 315, 556]), (24, [338, 132, 575, 272]), (24, [338, 273, 575, 413])],
            '2021-objective-15': [(22, [48, 100, 462, 219]), (22, [48, 220, 462, 346]), (22, [48, 347, 462, 475]), (22, [48, 476, 462, 606]), (22, [48, 607, 462, 736])],
        }.get(item['id'])
        if graphic_options:
            stem[-1]['rect'][3] = 132 if year == 2017 else 98
        images = []
        for index, clip in enumerate(stem):
            clip = trimmed_clip(doc, clip)
            filename = f"{item['id']}-{index + 1}.webp"
            if render_clip(doc, clip, folder / filename):
                images.append({'src': f'/enade/{year}/questions/{filename}', 'page': clip['page'] + 1})
        if graphic_options:
            stem_text = '\n'.join(clip_text(doc, c) for c in stem)
            item['statement'] = clean(stem_text)
        statement = re.sub(r'(?im)^\s*(?:RASCUNHO|(?:Á?rea|ea) livre)[^\n]*', '', item['statement']).strip()
        lines = [re.sub(r'[ \t]+', ' ', line).strip() for line in statement.splitlines() if line.strip()]
        starts = [i for i, line in enumerate(lines) if re.match(r'(?i)^(?:Assinale|Com base|Considerando|É correto|A respeito|Acerca|Das imagens|No poema|Usando|A partir|De acordo|Nesse contexto|Nessa situação|Diante|O que|Qual|Para que|A característica)', line)]
        start = starts[-1] if starts else max(0, len(lines) - 3)
        instruction = ' '.join(lines[start:])
        if len(instruction) > 1600:
            instruction = ' '.join(lines[-4:])
        if question['kind'] == 'discursive':
            instruction = 'Desenvolva sua resposta considerando o enunciado e os itens apresentados acima.'
        options = []
        for index, option in enumerate(item['options']):
            text = option['text']
            code = any('Courier' in span['font'] for c in option['clips'] for line in page_lines(doc[c['page']]) for span in line['spans'] if fitz.Rect(c['rect']).intersects(fitz.Rect(span['bbox'])))
            media = None
            if graphic_options:
                page, rect = graphic_options[index]
                filename = f"{item['id']}-{option['letter']}.webp"
                render_clip(doc, {'page': page, 'rect': rect}, folder / filename)
                media = {'src': f'/enade/{year}/questions/{filename}', 'page': page + 1}
                text = ''
            elif not code:
                text = re.sub(r'\s+', ' ', text).strip()
            if item['id'] == '2008-objective-22':
                # The source's legacy symbol font encodes minus as an exclamation
                # mark. These five short code blocks were checked on page 13.
                text = [
                    'C ← 0\nM ← (C + F)/2\nC ← M + 1',
                    'C ← 1\nM ← (C + F)/2\nC ← M − 1',
                    'C ← 0\nC ← M + 1\nM ← (C + F)/2',
                    'C ← 1\nC ← M + 1\nM ← (C + F)/2',
                    'C ← 1\nM ← (C + F)/2\nC ← M + 1',
                ][index]
                code = True
            options.append({'letter': option['letter'], 'text': text, 'code': code, **({'image': media} if media else {})})
        assert images and statement, item['id']
        assert all(o['text'] or o.get('image') for o in options), item['id']
        published.append({'id': item['id'], 'images': images, 'statement': instruction, 'transcript': statement, 'options': options})
    (folder.parent / 'questions.json').write_text(json.dumps(published, ensure_ascii=False, indent=2) + '\n', encoding='utf8')


if __name__ == '__main__':
    catalog = json.loads((ROOT / 'src/lib/enade/exams.json').read_text(encoding='utf8'))
    all_items = {str(exam['year']): extract(exam) for exam in catalog}
    scratch = ROOT / 'scratch/enade/questions/extracted.json'
    scratch.write_text(json.dumps(all_items, ensure_ascii=False, indent=2), encoding='utf8')
    errors = [q for questions in all_items.values() for q in questions if 'error' in q]
    print(json.dumps({'errors': [(q['id'], q['error']) for q in errors], 'questions': sum(map(len, all_items.values()))}))
    assert not errors
    for exam in catalog:
        publish(exam, all_items[str(exam['year'])])

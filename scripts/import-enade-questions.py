"""Extract per-question statements and alternatives from the archived Inep PDFs.

Runs offline with PyMuPDF/Pillow. Original PDFs are never modified. Missing CID
Unicode maps in 2014/2017 are recovered using the source font glyph IDs; the
small Unicode map is committed so builds do not require proprietary font files.
"""
import argparse
import json
import re
import unicodedata
from pathlib import Path
import fitz
from PIL import Image, ImageChops
from enade_statement import format_statement

ROOT = Path(__file__).resolve().parents[1]
FONT_MAP = json.loads((ROOT / 'scripts/enade-font-map.json').read_text(encoding='utf8'))

# Page indexes and PDF coordinates for layouts where the first answer marker
# overlaps the stem, or where the stem continues in another column.
STEM_CLIPS = {
    '2008-objective-7': [(4, [33, 542, 271, 762]), (4, [271, 540, 570, 685])],
    '2008-objective-8': [(5, [20, 90, 575, 232])],
    '2014-objective-10': [(12, [47, 125, 312, 742]), (12, [317, 106, 584, 151])],
    '2014-objective-29': [(22, [44, 124, 313, 747]), (22, [318, 103, 584, 141])],
}
DIAGRAM_STEM_BOTTOM = {'2017-objective-20': 132, '2021-objective-15': 98}
INSTRUCTION_START = re.compile(
    r'^(?:Assinale|Com base|Considerando|É correto|A respeito|Acerca|Das (?:imagens|obras)|No poema|'
    r'Usando|Utilizando a engenharia reversa|A partir|De acordo|Nesse contexto|Nessa situação|'
    r'Diante|O que|Qual|Para que|A característica)',
    re.IGNORECASE,
)

# The letters are printed halfway down the figures. Crop each figure above
# and below its marker, excluding the original letter so answers can shuffle.
OPTION_IMAGE_CLIPS = {
    '2008-objective-8': (5, [
        [50, 240, 195, 439], [220, 241, 371, 437], [404, 237, 560, 437],
        [120, 519, 265, 724], [290, 517, 465, 721],
    ]),
    '2014-objective-29': (22, [
        [342, 144, 574, 253], [342, 265, 574, 376], [342, 385, 574, 499],
        [342, 508, 574, 614], [342, 628, 574, 738],
    ]),
    '2017-objective-20': (24, [
        [82, 132, 315, 272], [82, 273, 315, 413], [82, 414, 315, 556],
        [338, 132, 575, 272], [338, 273, 575, 413],
    ]),
    '2021-objective-15': (22, [
        [48, 100, 462, 219], [48, 220, 462, 346], [48, 347, 462, 475],
        [48, 476, 462, 606], [48, 607, 462, 736],
    ]),
}

# These layouts are vectors in the original PDFs. An extra lossless export
# gives the zoom viewer more source detail without increasing preview downloads.
DETAIL_STEMS = {'2014-objective-10': (0,), '2014-objective-29': (0,)}
DETAIL_OPTIONS = {'2014-objective-29', '2017-objective-20', '2021-objective-15'}
RESTORED_STEMS = {
    '2008-objective-24': (
        '2008-objective-24-readable.svg',
        'Três raias: Banco de dados, Urna eletrônica e Eleitor. A urna solicita o número; '
        'o eleitor informa o número, gerando o objeto candidato para validação pela urna. '
        'A urna solicita confirmação; o eleitor confirma, gerando o objeto voto. A urna '
        'registra o voto e divide o fluxo entre armazenar o voto no banco de dados e exibir '
        'a tela de fim de votação. Os dois caminhos se unem e a urna emite um sinal sonoro antes do fim.',
    ),
}
IMAGE_DETAIL_QUESTIONS = DETAIL_OPTIONS | DETAIL_STEMS.keys() | RESTORED_STEMS.keys()


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


def render_clip(doc, clip, destination, *, scale=2.5, lossless=False):
    rect = fitz.Rect(clip['rect'])
    if rect.height < 2:
        return False
    pix = doc[clip['page']].get_pixmap(matrix=fitz.Matrix(scale, scale), clip=rect, alpha=False)
    image = Image.frombytes('RGB', (pix.width, pix.height), pix.samples)
    ink = ImageChops.difference(image, Image.new('RGB', image.size, 'white')).convert('L').point(lambda p: 255 if p > 35 else 0).getbbox()
    if not ink:
        return False
    # Trim only vertical whitespace, retaining the source column's width and scale.
    padding = round(16 * scale / 2.5)
    image = image.crop((0, max(0, ink[1] - padding), image.width, min(image.height, ink[3] + padding)))
    image.save(destination, 'WEBP', quality=92, method=6, lossless=lossless)
    return True


def add_image_detail(doc, clip, image, folder):
    preview = Path(image['src'])
    filename = f'{preview.stem}-detail.webp'
    if not render_clip(doc, clip, folder / filename, scale=5, lossless=True):
        raise ValueError(f'Empty detail image: {filename}')
    image['detailSrc'] = preview.with_name(filename).as_posix()


def improve_question_images(doc, content, stem, folder):
    question_id = content['id']
    if question_id in RESTORED_STEMS:
        filename, alt = RESTORED_STEMS[question_id]
        if not (folder / filename).is_file():
            raise FileNotFoundError(folder / filename)
        image = content['images'][0]
        image['src'] = Path(image['src']).with_name(filename).as_posix()
        image['alt'] = alt
    for index in DETAIL_STEMS.get(question_id, ()):
        add_image_detail(doc, stem[index], content['images'][index], folder)
    if question_id in DETAIL_OPTIONS:
        page, rects = OPTION_IMAGE_CLIPS[question_id]
        for option, rect in zip(content['options'], rects, strict=True):
            add_image_detail(doc, {'page': page, 'rect': rect}, option['image'], folder)


def publish(exam, items, text_only=False, image_details_only=False, only_question=None):
    year = exam['year']
    if only_question and not any(item['id'] == only_question for item in items):
        return
    doc = source_document(year)
    folder = ROOT / f'public/enade/{year}/questions'
    folder.mkdir(exist_ok=True)
    output = folder.parent / 'questions.json'
    if image_details_only and not any(item['id'] in IMAGE_DETAIL_QUESTIONS for item in items):
        return
    previous = (
        {item['id']: item for item in json.loads(output.read_text(encoding='utf8'))}
        if text_only or image_details_only or only_question else {}
    )
    published = []
    for item in items:
        question_id = item['id']
        if only_question and question_id != only_question:
            published.append(previous[question_id])
            continue
        if image_details_only and question_id not in IMAGE_DETAIL_QUESTIONS:
            published.append(previous[question_id])
            continue
        question = next(q for q in exam['questions'] if q['id'] == question_id)
        stem = item['contextClips']
        if question_id in STEM_CLIPS:
            stem = [{'page': page, 'rect': rect} for page, rect in STEM_CLIPS[question_id]]
        elif question_id in DIAGRAM_STEM_BOTTOM:
            last_clip = stem[-1]
            boundary = [*last_clip['rect'][:3], DIAGRAM_STEM_BOTTOM[question_id]]
            stem = [*stem[:-1], {**last_clip, 'rect': boundary}]
        image_clips = [trimmed_clip(doc, clip) for clip in stem]
        if image_details_only:
            content = previous[question_id]
            improve_question_images(doc, content, image_clips, folder)
            published.append(content)
            continue
        formatted = format_statement(doc, image_clips, clean, question_id)
        assert formatted, question_id
        if text_only:
            published.append({**previous[question_id], 'formattedStatement': formatted})
            continue

        graphic_options = OPTION_IMAGE_CLIPS.get(question_id)
        images = []
        for index, clip in enumerate(image_clips):
            filename = f'{question_id}-{index + 1}.webp'
            if render_clip(doc, clip, folder / filename):
                images.append({'src': f'/enade/{year}/questions/{filename}', 'page': clip['page'] + 1})
        stem_text = item['statement']
        if stem != item['contextClips']:
            stem_text = clean('\n'.join(clip_text(doc, clip) for clip in stem))
        statement = re.sub(r'(?im)^\s*(?:RASCUNHO|(?:Á?rea|ea) livre)[^\n]*', '', stem_text).strip()
        lines = [re.sub(r'[ \t]+', ' ', line).strip() for line in statement.splitlines() if line.strip()]
        starts = [i for i, line in enumerate(lines) if INSTRUCTION_START.match(line)]
        start = starts[-1] if starts else max(0, len(lines) - 3)
        instruction = ' '.join(lines[start:])
        if len(instruction) > 1600:
            instruction = ' '.join(lines[-4:])
        if question['kind'] == 'discursive':
            instruction = 'Desenvolva sua resposta considerando o enunciado e os itens apresentados acima.'
        if question_id == '2014-objective-10':
            statement = '\n\n'.join(block['text'] for block in formatted)
        options = []
        for index, option in enumerate(item['options']):
            text = option['text']
            code = graphic_options is None and any(
                'Courier' in span['font']
                for clip in option['clips']
                for line in page_lines(doc[clip['page']])
                for span in line['spans']
                if fitz.Rect(clip['rect']).intersects(fitz.Rect(span['bbox']))
            )
            media = None
            if graphic_options:
                page, rects = graphic_options
                filename = f"{question_id}-{option['letter']}.webp"
                if not render_clip(doc, {'page': page, 'rect': rects[index]}, folder / filename):
                    raise ValueError(f'Empty answer image: {filename}')
                media = {'src': f'/enade/{year}/questions/{filename}', 'page': page + 1}
                # The artwork captions remain selectable text in the 2008 exam.
                if question_id != '2008-objective-8':
                    text = ''
            if not code:
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
            if question_id == '2014-objective-10':
                # Justified prose and inline code have separate PDF baselines.
                # Preserve the official order and spacing verified on page 13.
                text = [
                    'alterar a linha 15, de: return 0; para: return count(countValue, array, 0);',
                    'alterar a linha 18, de: if (array[i] == countValue) para: if (array[c] == countValue)',
                    'alterar a linha 21, de: c += count(countValue, array, i); para: c += count(countValue, array, i + 1);',
                    'alterar a linha 14, de: if (!hasValue(countValue, array, i) || i >= array.length) para: if (i >= array.length)',
                    'alterar a linha 10, de: return hasValue(searchValue, array, i + 1); para: return hasValue(searchValue, array, i - 1);',
                ][index]
                code = True
            options.append({'letter': option['letter'], 'text': text, 'code': code, **({'image': media} if media else {})})
        assert images and statement, item['id']
        assert all(o['text'] or o.get('image') for o in options), item['id']
        content = {'id': question_id, 'images': images, 'statement': instruction, 'transcript': statement,
                   'options': options, 'formattedStatement': formatted}
        improve_question_images(doc, content, image_clips, folder)
        published.append(content)
    output.write_text(json.dumps(published, ensure_ascii=False, indent=2) + '\n', encoding='utf8')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument('--text-only', action='store_true', help='Refresh formatted statements without rendering WebP assets.')
    mode.add_argument('--image-details-only', action='store_true', help='Refresh only the restored and high-detail images.')
    parser.add_argument('--question', help='Refresh a single question by its archived ID.')
    args = parser.parse_args()
    catalog = json.loads((ROOT / 'src/lib/enade/exams.json').read_text(encoding='utf8'))
    if args.question:
        catalog = [exam for exam in catalog if any(q['id'] == args.question for q in exam['questions'])]
        if not catalog:
            parser.error(f'Unknown question: {args.question}')
    all_items = {str(exam['year']): extract(exam) for exam in catalog}
    if not args.question:
        scratch = ROOT / 'scratch/enade/questions/extracted.json'
        scratch.parent.mkdir(parents=True, exist_ok=True)
        scratch.write_text(json.dumps(all_items, ensure_ascii=False, indent=2), encoding='utf8')
    errors = [q for questions in all_items.values() for q in questions if 'error' in q]
    print(json.dumps({'errors': [(q['id'], q['error']) for q in errors], 'questions': sum(map(len, all_items.values()))}))
    assert not errors
    for exam in catalog:
        publish(exam, all_items[str(exam['year'])], text_only=args.text_only,
                image_details_only=args.image_details_only, only_question=args.question)

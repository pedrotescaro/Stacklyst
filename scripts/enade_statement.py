"""Recover readable statements from the layout of the archived exam pages."""
import re
from collections import Counter
from statistics import median

import fitz


LIST_MARKER = re.compile(
    r'^(?P<marker>[IVXLCDM]{1,6}(?:[.)]|\s+[-–])|[a-h][.)]|\d{1,2}[.)]|[•●]|<)\s+(?P<text>\S.*)$'
)
LEGACY_ROMAN = re.compile(r'^(?P<marker>I{1,3}|IV|V|VI{0,3}|IX|X)(?:\s+(?P<text>.*))?$')
ROMAN_SEQUENCE = 'I II III IV V VI VII VIII IX X'.split()
TEXT_HEADING = re.compile(r'^(?:TEXTO\s+(?:[IVX]+|\d+)|PORQUE)$', re.IGNORECASE)
SOURCE = re.compile(r'^(?:Disponível em\b|Acesso em\b|Fonte(?:\s*:|\s+-))', re.IGNORECASE)
INSTRUCTION = re.compile(
    r'^(?:Assinale|Com base|Considerando|De acordo|A respeito|A partir|'
    r'É correto|Está correto|Estão cert[ao]s|São corret[ao]s|É tautologia)\b', re.IGNORECASE
)
CODE_SYNTAX = re.compile(r'[{};=<>\[\]]|^\s{2,}|\b(?:algoritmo|fim\w*|início|inicio)\b', re.IGNORECASE)
NUMBERED_CODE = re.compile(r'^\s*\d{1,2}\s{2,}\S')
NUMERIC_ROW = re.compile(r'^[+−–-]?\d[\d.,]*(?:\s{2,}[+−–-]?\d[\d.,]*)+$')
LEGACY_COURIER = re.compile(r'[\x00-\x08\x0b-\x1f¿]')
# This table's multiline heading has offset baselines between the columns.
TABLE_LAYOUTS = {'2017-objective-9': (17, 196, 222, 410, 170)}


def decode_courier(span):
    text = span['text']
    if span['font'] != 'CourierNewPSMT' or not LEGACY_COURIER.search(text):
        return text
    # Some runs in the 2017 PDF expose glyph IDs for Courier rather than
    # character codes. The compaction moves the printable ASCII glyphs by 29.
    accents = {'¿': 'fi', 'o': 'ç', 'm': 'ã'}
    return ''.join(chr(ord(char) + 29) if '\x03' <= char <= 'a' else accents.get(char, char) for char in text)


def visual_rows(page, rect):
    fragments = []
    for block_index, block in enumerate(page.get_text('dict', flags=fitz.TEXTFLAGS_TEXT)['blocks']):
        for line in block.get('lines', []):
            spans = []
            for span in line['spans']:
                box = fitz.Rect(span['bbox'])
                if span['text'].strip() and rect.contains((box.tl + box.br) / 2):
                    decoded = decode_courier(span)
                    if decoded.strip():
                        spans.append({**span, 'text': decoded})
            if spans:
                baseline = max(spans, key=lambda span: span['size'])['origin'][1]
                fragments.append((baseline, block_index, spans))
    fragments.sort(key=lambda fragment: (round(fragment[0], 1), fragment[2][0]['origin'][0]))

    # A justified PDF row can be stored as one separate line per word. Merge
    # fragments at the same baseline before detecting paragraphs and lists.
    rows = []
    for baseline, block_index, spans in fragments:
        if not rows or baseline - rows[-1]['y'] > 1.2:
            rows.append({'y': baseline, 'block': block_index, 'spans': []})
        rows[-1]['spans'].extend(spans)
    return rows


def line_text(spans, preserve_spacing):
    parts = []
    previous = None
    for span in sorted(spans, key=lambda span: span['origin'][0]):
        if previous:
            gap = span['origin'][0] - previous['bbox'][2]
            if preserve_spacing and gap > span['size'] * .45:
                parts.append(' ' * min(24, round(gap / (span['size'] * .55))))
            elif gap > span['size'] * .16 and not previous['text'][-1:].isspace() and not span['text'][:1].isspace():
                parts.append(' ')
        parts.append(span['text'])
        previous = span
    return ''.join(parts).rstrip()


def read_rows(doc, clip, clean, legacy_lists):
    rows = visual_rows(doc[clip['page']], fitz.Rect(clip['rect']))
    prepared = []
    for row in rows:
        spans = row['spans']
        first = min(spans, key=lambda span: span['origin'][0])
        raw = line_text(spans, True)
        mono = any(span['flags'] & fitz.TEXT_FONT_MONOSPACED or 'Courier' in span['font'] for span in spans)
        text = re.sub(r'\s+', ' ', clean(line_text(spans, False))).strip()
        text = re.sub(r'\bhtt\s+(ps?://)', r'htt\1', text)
        text = re.sub(r' +([,.;:!?])', r'\1', text)
        if not text:
            continue
        marker = LIST_MARKER.fullmatch(text)
        prepared.append({
            'y': row['y'], 'x': first['origin'][0], 'block': row['block'], 'size': first['size'],
            'text': text, 'raw': raw, 'mono': mono, 'marker': marker, 'spans': spans,
            'numbered_code': bool(NUMBERED_CODE.match(raw)) and not NUMERIC_ROW.fullmatch(raw.strip()),
        })
    # Some editions print numbered lines for handwritten responses without a
    # draft heading. They belong to the answer sheet, not the statement.
    tail = len(prepared)
    while tail > 0 and re.fullmatch(r'\d{1,2}', prepared[tail - 1]['text']):
        tail -= 1
    if len(prepared) - tail >= 4 and prepared[tail]['text'] == '1':
        prepared = prepared[:tail]
    if legacy_lists:
        # Bare Roman numerals also label figures and variables. Require a
        # consecutive pair at the same indent to identify this list style.
        candidates = [(row, marker) for row in prepared if (marker := LEGACY_ROMAN.fullmatch(row['text']))]
        for (left, a), (right, b) in zip(candidates, candidates[1:]):
            consecutive = ROMAN_SEQUENCE.index(b['marker']) == ROMAN_SEQUENCE.index(a['marker']) + 1
            if consecutive and abs(left['x'] - right['x']) < 8:
                left['marker'], right['marker'] = a, b
    return prepared


def join_prose(left, right):
    if not left:
        return right
    if left.endswith('-') and right[:1].islower() and not left.endswith(' -'):
        return left + right
    if right.startswith(('-', '/')) and left.split()[-1].startswith(('http://', 'https://', '<http')):
        return left + right
    return left + ' ' + right


def group_clip(rows, clean, keep_verse=False):
    blocks = []
    if not rows:
        return blocks
    body_size = Counter(round(row['size']) for row in rows if not row['mono']).most_common(1)
    body_size = body_size[0][0] if body_size else round(rows[0]['size'])
    baselines = [right['y'] - left['y'] for left, right in zip(rows, rows[1:])]
    line_spacing = median([gap for gap in baselines if body_size * .8 < gap < body_size * 2.5] or [body_size * 1.2])
    code_rows = {
        index for index, row in enumerate(rows)
        if row['numbered_code'] or (row['mono'] and CODE_SYNTAX.search(row['raw']))
    }
    verse = keep_verse
    list_x = 0
    list_lines_block = None
    for index, row in enumerate(rows):
        previous = rows[index - 1] if index else row
        text, marker = row['text'], row['marker']
        last = blocks[-1] if blocks else None
        gap = row['y'] - previous['y']
        paragraph_break = gap > line_spacing * 1.28 or (
            previous['text'].endswith(('.', '?', '!', ':')) and
            (row['block'] != previous['block'] or row['x'] - previous['x'] > row['size'] * .6)
        )
        is_code = index in code_rows or (row['mono'] and (index - 1 in code_rows or index + 1 in code_rows))
        is_source = SOURCE.match(text) or (not row['mono'] and row['size'] <= body_size * .8)
        starts_instruction = text[0].isupper() and INSTRUCTION.match(text)

        if marker:
            item = {'marker': '•' if marker['marker'] == '<' else marker['marker'], 'text': marker['text'] or ''}
            if last and last['kind'] == 'list':
                last['items'].append(item)
            else:
                blocks.append({'kind': 'list', 'items': [item]})
            list_x = row['x']
            list_lines_block = None
        elif is_code:
            # Keep alignment and indentation from the PDF. Clean known font
            # artifacts without applying prose whitespace rules to code.
            raw = re.sub(r'^(\d) (\d)(?= {2,})', r'\1\2', row['raw'].lstrip('\t'))
            indent = raw[:len(raw) - len(raw.lstrip(' '))]
            line = indent + clean(raw)
            if last and last['kind'] == 'code':
                last['text'] += ('\n\n' if gap > line_spacing * 1.65 else '\n') + line
            else:
                blocks.append({'kind': 'code', 'text': line})
        elif is_source:
            verse = False
            if last and last['kind'] == 'source' and not SOURCE.match(text):
                last['text'] = join_prose(last['text'], text)
            else:
                blocks.append({'kind': 'source', 'text': text})
        elif TEXT_HEADING.fullmatch(text) or (verse and not index):
            blocks.append({'kind': 'heading', 'text': text})
        elif verse or NUMERIC_ROW.fullmatch(row['raw'].strip()):
            if last and last['kind'] == 'lines':
                last['text'] += ('\n\n' if verse and paragraph_break else '\n') + (
                    text if verse else row['raw'].strip()
                )
            else:
                blocks.append({'kind': 'lines', 'text': text if verse else row['raw'].strip()})
        elif (last and last['kind'] == 'list' and not starts_instruction and
              row['x'] >= list_x + 1 and gap <= line_spacing * 1.5):
            item = last['items'][-1]
            if previous['text'].endswith(':') and row['block'] != previous['block']:
                list_lines_block = row['block']
            if row['block'] == list_lines_block:
                item['text'] += '\n' + text
            else:
                item['text'] = join_prose(item['text'], text)
        elif last and last['kind'] == 'paragraph' and not paragraph_break and not starts_instruction:
            last['text'] = join_prose(last['text'], text)
        else:
            blocks.append({'kind': 'paragraph', 'text': text})
    return blocks


def format_table(rows, layout, clean):
    _, top, body_top, bottom, separator = layout
    header_rows = [row for row in rows if top <= row['y'] < body_top]
    data_rows = [row for row in rows if body_top <= row['y'] < bottom]

    def cells(physical_rows):
        columns = [[], []]
        for row in physical_rows:
            for span in row['spans']:
                columns[int(span['origin'][0] >= separator)].append(span['text'].strip())
        return [clean(' '.join(column)) for column in columns]

    headers = cells(header_rows)
    data = [cells([row]) for row in data_rows]
    assert all(headers) and data and all(all(row) for row in data), layout
    return {'kind': 'table', 'headers': headers, 'rows': data}


def format_statement(doc, clips, clean, question_id):
    blocks = []
    table = TABLE_LAYOUTS.get(question_id)
    for clip in clips:
        rows = read_rows(doc, clip, clean, legacy_lists=question_id.startswith('2008-'))
        if table and clip['page'] == table[0]:
            blocks.extend(group_clip([row for row in rows if row['y'] < table[1]], clean))
            blocks.append(format_table(rows, table, clean))
            rows = [row for row in rows if row['y'] >= table[3]]
        blocks.extend(group_clip(rows, clean, keep_verse=question_id == '2011-objective-1'))
    return blocks

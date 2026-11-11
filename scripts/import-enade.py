"""Rebuild the ADS Enade archive from Inep PDFs. Requires PyMuPDF and Pillow.

The original PDFs remain authoritative. Page renders retain diagrams/equations;
extracted text is a reading aid, not a rewritten question bank.
"""
import hashlib
import json
import re
import unicodedata
from pathlib import Path
import fitz

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'src/lib/enade/sources.json'
OUT = ROOT / 'public/enade'

def normalize(text):
    return unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode()

def build():
    exams = []
    for source in json.loads(SOURCE.read_text(encoding='utf8')):
        year = source['year']
        folder = OUT / str(year)
        document = fitz.open(folder / 'prova.pdf')
        key_text = normalize('\n'.join(p.get_text() for p in fitz.open(folder / 'gabarito.pdf')))
        if year == 2021:
            keys = {int(n): a for n, a in re.findall(r'QUESTAO\s+(\d+)\s+([A-E]|ANULADA)\b', key_text)}
        else:
            keys = {int(n): a for n, a in re.findall(r'\b(\d+)\s*-?\s*\n\s*([A-E]|ANULADA|Discursiva)\b', key_text)}
        questions = {}
        pages = []
        for index, page in enumerate(document):
            text = page.get_text(sort=True)
            # Headers sometimes use a custom, unextractable font (2017). Those
            # page mappings were verified visually and are explicit below.
            for match in re.finditer(r'^\s*QUESTAO\s+(DISCURSIVA\s+)?(\d{1,2})([^\n]*)', normalize(page.get_text()), re.M):
                number = int(match[2])
                kind = 'discursive' if match[1] or 'DISCURSIVA' in match[3] else 'objective'
                if year == 2008 and (kind == 'objective' and number in [9, 10, 38, 39, 40]):
                    continue  # Perception questionnaire is not an exam question.
                questions.setdefault((kind, number), index + 1)
            image_path = folder / f'page-{index + 1}.webp'
            page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False).pil_save(image_path, format='WEBP', quality=88)
            pages.append({'image': f'/enade/{year}/page-{index + 1}.webp', 'text': text})
        if year == 2017:
            for number, page in {4:8, 5:9, 14:21, 15:21, 24:27, 25:28, 32:36, 34:38, 35:39}.items():
                questions[('objective', number)] = page
            questions[('discursive', 4)] = 14
            questions[('discursive', 5)] = 16
        assert len(questions) == 40, (year, len(questions))
        items = []
        for (kind, number), page in sorted(questions.items(), key=lambda q: (q[1], q[0][1])):
            answer = keys.get(number) if kind == 'objective' or year == 2008 else None
            if kind == 'objective':
                assert answer in ['A','B','C','D','E','ANULADA'], (year, number, answer)
            items.append({'id': f'{year}-{kind}-{number}', 'number': number, 'kind': kind,
                          'page': page, 'answer': answer if answer in ['A','B','C','D','E'] else None,
                          'annulled': answer == 'ANULADA' or (year == 2008 and number == 40),
                          'section': 'general' if (number <= 10 if year == 2008 else number <= (2 if kind == 'discursive' else 8)) else 'specific'})
        exams.append({'year': year, 'durationMinutes': 240, 'questions': items, 'pageCount': len(pages),
                      'sources': source['links'],
                      'sha256': {name: hashlib.sha256((folder / f'{name}.pdf').read_bytes()).hexdigest() for name in ['prova','gabarito','padrao-resposta']}})
        (folder / 'pages.json').write_text(json.dumps(pages, ensure_ascii=False), encoding='utf8')
    (ROOT / 'src/lib/enade/exams.json').write_text(json.dumps(exams, ensure_ascii=False, indent=2), encoding='utf8')
    print(f'{len(exams)} exams, {sum(len(e["questions"]) for e in exams)} questions')

if __name__ == '__main__':
    build()

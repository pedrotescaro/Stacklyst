"""Produce printable UML views from the authoritative use-case overview."""
import re
from pathlib import Path

root = Path(__file__).resolve().parents[1] / 'diagramas' / 'fontes'
source = (root / 'casos-de-uso-stacklyst.puml').read_text(encoding='utf-8')
groups = {
    'casos-aprendizado': ('Conta e aprendizado', [1, 2, 3, 4, 5, 6, 7, 11, 12, 28, 29]),
    'casos-duelos': ('Duelos e avaliação', [8, 9, 10, 16, 24, 27, 29]),
    'casos-comunidade': ('Comunidade e administração', [13, 14, 15, 19, 20, 21, 23]),
    'casos-recrutamento': ('Vagas e empresas', [17, 18, 22, 25, 26]),
}
actors = [line for line in source.splitlines() if line.startswith('actor ')]
for slug, (title, numbers) in groups.items():
    ids = {f'UC{n:03d}' for n in numbers}
    cases = [line for line in source.splitlines() if line.strip().startswith('usecase ') and line.split()[-1] in ids]
    edges = [line for line in source.splitlines() if re.fullmatch(r'\w+ -- UC\d+', line) and line.split()[-1] in ids]
    used = {line.split()[0] for line in edges}
    generalizations = [line for line in source.splitlines() if ' --|> ' in line and line.split()[0] in used]
    used.update(line.split()[-1] for line in generalizations)
    relationships = [line for line in source.splitlines() if ' ..> ' in line and line.split()[0] in ids and line.split()[2] in ids]
    selected_actors = [line for line in actors if (line.split(' as ')[-1] if ' as ' in line else line.removeprefix('actor ')) in used]
    contents = ['@startuml', f'title {title}', 'left to right direction', 'skinparam monochrome true', 'skinparam shadowing false', 'skinparam defaultFontName Arial', 'skinparam defaultFontSize 16', 'skinparam nodesep 12', 'skinparam ranksep 35', *selected_actors, 'rectangle Stacklyst {', *cases, '}', *edges, *generalizations, *relationships, '@enduml', '']
    (root / f'{slug}.puml').write_text('\n'.join(contents), encoding='utf-8')

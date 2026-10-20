import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
R = Path(__file__).resolve().parents[1]
E = json.loads((R / 'evidencias-codigo/evidencias.json').read_text(encoding='utf-8'))
S = json.loads((R / 'fontes-extraidas/requisitos-slides.json').read_text(encoding='utf-8'))
P = json.loads((R / 'tools/diagram-plan.json').read_text(encoding='utf-8'))
slide_file = R / '.build/slides.json'
slides = json.loads(slide_file.read_text(encoding='utf-8')) if slide_file.exists() else []

def page(ident):
    for s in slides:
        if f' / {ident}. ' in s['notes'] or s['subtitle'].startswith(ident + '  '):
            return str(s['number'])
    return 'A confirmar no arquivo final'

def pages_title(pattern):
    return ', '.join(str(s['number']) for s in slides if re.search(pattern, s['title'], re.I)) or 'A confirmar no arquivo final'

def safe(value):
    return str(value).replace('|', '/').replace('\n', ' ')

lines = [
    '# Rastreabilidade do seminário Stacklyst',
    '',
    'Revisão de 20/10/2026. A foto da lousa e a solicitação do grupo definem a organização. Os documentos fornecidos são fontes de conteúdo e de imagens.',
    '',
    f'Código conferido no commit `{E["commit"]}`. Nenhum arquivo do produto foi alterado para produzir esta apresentação.',
    '',
    '## Organização e fontes',
    '',
    '| Parte | Fonte e cobertura |',
    '|---|---|',
    '| Grupo e problema | Documento 01, inclusive as fichas de Guilherme Alves de Campos, Paulo Henrique Leal dos Santos e Pedro Antonio Silvestre Tescaro. |',
    '| Atividades do negócio | Documento 02 atualizado, seção 3: sete imagens e identificação AN01, AN02, AN03, AN04, AN05A, AN05B e AN06. Foram reutilizadas as imagens do documento, com a identificação externa atualizada. |',
    '| Casos de uso gerais | Documento 04, seção 4.1, imagem1.jpg integral. A imagem possui 18 elipses. O documento contém 56 especificações detalhadas. São contagens distintas. |',
    '| Requisitos | Documento 03, seções 4, 5 e 6, com os identificadores originais de RF, RNF e RN. |',
    '| Casos de uso específicos | Documento 04, especificações UC005, UC006, UC017, UC022 e UC026. |',
    '| Protótipos | Documento 04 para UC005, UC006, UC017 e UC022. O painel de candidaturas de UC026 usa um protótipo renderizado do JSX real com dados de demonstração, descrito abaixo. |',
    '| Classes, MER, DER e sequências | Diagramas em português criados no projeto Astah editável. O DER representa as 47 entidades de prisma/schema.prisma com campos selecionados. As sequências representam os cenários principais e seus recortes. |',
    '| Evidência de implementação | Nove capturas extraídas do código atual, acompanhadas de arquivo, linhas e SHA-256. |',
    '',
    'A imagem geral original conserva rótulos históricos UC057, UC058 e UC059. As notas e os slides explicam sua correspondência: aviso integrado à atualização UC026, candidatura UC022 e participação UC023. O material não cria funcionalidades independentes para intenção de vaga ou interesse em evento.',
    '',
    '## Diagramas e páginas da apresentação',
    '',
    '| Diagrama | Conteúdo | Slide / página PDF |',
    '|---|---|---|',
]
diagrams = [
    ('CL00', 'Classes gerais do domínio, em português'),
    ('MER00', 'MER conceitual dos domínios principais, sem FK'),
    ('DER00', 'DER geral das 47 entidades persistidas, com PK e FK'),
    ('CL01', 'Classes específicas da aprendizagem'),
    ('DER01', 'Dados de aprendizagem: usuário, questão, tentativa e progresso na linguagem'),
    ('CL02', 'Classes específicas da publicação de vaga'),
    ('DER02', 'Dados de publicação: usuário, empresa, vaga e etapa de seleção'),
    ('CL03', 'Classes específicas da candidatura e do retorno'),
    ('DER03', 'Dados de candidatura e notificação'),
]
diagrams += [(x['id'], x['title']) for x in P['sequences']]
for ident, title in diagrams:
    lines.append(f'| {ident} | {safe(title)} | {page(ident)} |')
lines += [
    '',
    'O MER é uma visão conceitual dos principais domínios. O DER geral é a vista panorâmica de todas as entidades persistidas. As vistas específicas ampliam as tabelas que sustentam as funcionalidades demonstradas.',
    '',
    '## Sequência, captura e código',
    '',
    '| Recorte | Sequência principal | Slide / página PDF | Código-fonte e linhas | Relação demonstrada |',
    '|---|---|---|---|---|',
]
seq_sources = {x['id']: x['source'] for x in P['sequences'] if not x['complete']}
for e in E['items']:
    ranges = ', '.join(f'{a}–{b}' for a, b in e['ranges'])
    lines.append(f'| {e["id"]} | {seq_sources[e["id"]]} | {page(e["id"])} | `{e["path"]}`, {ranges} | {safe(e["meaning"])} |')
lines += [
    '',
    'As imagens correspondentes estão em `evidencias-codigo/SQ01-A.png` até `SQ03-C.png`. O arquivo `evidencias-codigo/evidencias.json` preserva o texto exato e o hash de cada arquivo de origem. `validacao.json` registra a verificação das nove imagens e dos trechos contra os arquivos atuais.',
    '',
    'Os saltos de linhas nas capturas são indicados como linhas intermediárias omitidas. Identificadores em inglês pertencem ao código real. Os diagramas empregam nomes do domínio em português.',
    '',
    '## Requisitos selecionados por integrante',
    '',
    '| Integrante e funcionalidade | RF | RNF | RN |',
    '|---|---|---|---|',
]
for m in S['modules']:
    ids = lambda kind: ', '.join(x['id'] for x in m[kind])
    lines.append(f'| {m["presenter"]}: {m["title"]} | {ids("RF")} | {ids("RNF")} | {ids("RN")} |')
lines += [
    '',
    'RNF são critérios e restrições descritos na documentação. Sua presença no slide não significa que desempenho, segurança, acessibilidade ou operação tenham sido homologados nesta revisão.',
    '',
    '## Delimitação entre os fluxos',
    '',
    '- Aprendizagem: a demonstração roteirizada usa `/lesson/js-l1` sem `mode=workspace`, o componente `LessonClient`, a rota `/api/lessons/{lessonId}/attempt` e o registro em `QuizAttempt`. Lição e etapa são conteúdo do catálogo, sem tabelas próprias nesse fluxo.',
    '- `ExerciseWorkspace`, `/api/exercises` e `ExerciseSubmission` constituem outro fluxo do produto. Não são a implementação mostrada nas capturas SQ01.',
    '- Publicação: `POST /api/jobs` valida papel e empresa antes de chamar `JobService.createJob`. O serviço cria a vaga aberta e suas etapas em uma operação relacional.',
    '- Candidatura: `POST /api/jobs/{id}/apply` autentica o candidato. `applyForJob` rejeita candidatura repetida e vaga fechada e cria o vínculo com a primeira etapa disponível.',
    '- Atualização: `PATCH /api/jobs/{id}` permite etapa, situação, parecer e nota técnica, com autorização da empresa e verificação dos vínculos. A interface atual de recrutador envia somente `application_id` e `status`, conforme `RecruiterContent.tsx:186–200`. Na prática, demonstrar o seletor de situação (`688–707`), sem afirmar que há controles de etapa ou parecer nessa tela.',
    '- Notificação: a mudança principal é salva antes de `NotificationService.create`. Uma falha na criação do aviso é registrada e não desfaz a atualização já persistida. A referência à vaga na notificação é um identificador de recurso, sem FK direta para Vaga.',
    '',
    '## Protótipo do painel de candidaturas',
    '',
    'A imagem48 do documento 04 mostra um formulário de vaga e não é evidência visual de gerenciamento de candidatos. Por isso, o slide correspondente usa `evidencias-codigo/prototipo-candidaturas.png`, renderizado a partir do JSX original de `RecruiterContent.tsx:474–716`, com o cartão de vaga e o painel expandido de candidatos.',
    '',
    'O protótipo utiliza ReactDOMServer, ícones Lucide e o CSS compilado local do produto. O conteúdo foi preenchido com dados fictícios explícitos: Empresa de demonstração, Estágio JavaScript - Seminário e Candidato de demonstração, na situação Em Análise. Os manipuladores de eventos estão inertes. Nenhuma chamada de backend foi feita. A imagem não comprova execução autenticada, atualização persistida ou produção.',
    '',
    'O HTML, o CSS, o trecho JSX, os dados e a origem estão em `prototipo-candidaturas.html`, `prototipo-candidaturas.css`, `prototipo-candidaturas-trecho.tsx.txt` e `prototipo-candidaturas-origens.json`. `prototipo-candidaturas-validacao.json` confirma os textos esperados, o seletor REVIEWING e a ausência de chamadas ao backend.',
    '',
    '## Demonstrações e verificação',
    '',
    '**Status: demonstrações não executadas nesta revisão.** O arquivo `evidencias-codigo/roteiro-demonstracoes.json` contém preparação, ações e resultados esperados. Nenhum dado foi criado ou alterado em produção para este trabalho.',
    '',
    'A divisão proposta é Pedro (aprendizagem e modelos gerais), Guilherme (publicação da oportunidade) e Paulo (candidatura e atualização de situação). O planejamento reserva 55 minutos e cinco minutos de margem. As contas, a empresa, o progresso auxiliar e os dados de ensaio precisam estar preparados antes do seminário.',
    '',
    'Foi verificada a correspondência estática entre código, trechos e mensagens. Não foram executados neste trabalho os fluxos autenticados, o serviço remoto de execução ou a entrega de notificações. Antes da apresentação, ensaiar o percurso na ordem proposta e conferir os resultados na interface.',
]
if slides:
    lines += ['', f'Numeração acima extraída do manifesto final de {len(slides)} slides em `.build/slides.json`. Ela deve coincidir com a ordem do PowerPoint e do PDF exportado.']
else:
    lines += ['', 'Numeração de slides pendente da geração do PowerPoint. Executar `tools/write-traceability.py` após a criação de `.build/slides.json` para registrar as páginas reais.']
(R / 'RASTREABILIDADE.md').write_text('\n'.join(lines) + '\n', encoding='utf-8')
print(f'Rastreabilidade gravada. Slides encontrados: {len(slides)}.')

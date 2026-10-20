import hashlib
import html
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[4]
OUT = Path(__file__).resolve().parents[1] / 'evidencias-codigo'
OUT.mkdir(parents=True, exist_ok=True)
specs = [
    ('SQ01-A', 1, 'Receber e avaliar a resposta', 'src/app/api/lessons/[lessonId]/attempt/route.ts', [(17, 25)], 'Controlador da lição', 'Validar resposta, localizar lição e etapa, verificar acesso e solicitar avaliação.', ['Validar resposta', 'Verificar acesso à lição', 'Avaliar etapa']),
    ('SQ01-B', 1, 'Persistir conclusão e devolver o resultado', 'src/app/api/lessons/[lessonId]/attempt/route.ts', [(26, 40)], 'Controlador da lição', 'Tratar indisponibilidade, separar teste de envio e persistir avaliação antes da resposta.', ['Tratar indisponibilidade', 'Salvar avaliação se envio definitivo', 'Devolver resultado e progresso']),
    ('SQ01-C', 1, 'Conceder XP somente na primeira conclusão', 'src/lib/learning/lesson-progress.ts', [(55, 62), (75, 84)], 'Serviço de progresso', 'Localizar conclusão anterior e gravar a tentativa com XP calculado na transação.', ['Consultar tentativas', 'Calcular XP da primeira conclusão', 'Registrar tentativa']),
    ('SQ02-A', 2, 'Autorizar a publicação da vaga', 'src/app/api/jobs/route.ts', [(67, 78)], 'Controlador de vagas', 'Exigir recrutador ou administrador, validar dados e vínculo com a empresa.', ['Validar papel e dados', 'Verificar acesso à empresa', 'Solicitar criação de vaga']),
    ('SQ02-B', 2, 'Gravar a vaga e suas etapas', 'src/services/job.service.ts', [(215, 222), (229, 238)], 'Serviço de vagas', 'Gravar vaga aberta e etapas do processo na mesma operação relacional.', ['Criar vaga aberta', 'Criar etapas associadas', 'Devolver vaga criada']),
    ('SQ02-C', 2, 'Confirmar a publicação na interface', 'src/app/recruiter/RecruiterContent.tsx', [(294, 306)], 'Painel do recrutador', 'Depois do retorno da API, confirmar publicação e recarregar a listagem.', ['Receber resposta', 'Exibir confirmação', 'Atualizar listagem de vagas']),
    ('SQ03-A', 3, 'Criar candidatura na primeira etapa', 'src/services/job.service.ts', [(275, 292)], 'Serviço de candidaturas', 'Aceitar apenas vaga aberta e relacionar candidatura ao usuário e à primeira etapa.', ['Verificar vaga aberta', 'Selecionar etapa inicial', 'Gravar candidatura']),
    ('SQ03-B', 3, 'Conferir a candidatura e a etapa escolhida', 'src/app/api/jobs/[id]/route.ts', [(30, 46)], 'Controlador de candidaturas', 'Autorizar a empresa e impedir candidatura ou etapa pertencente a outra vaga.', ['Autorizar empresa', 'Conferir candidatura da vaga', 'Conferir etapa da vaga']),
    ('SQ03-C', 3, 'Atualizar a candidatura e avisar o candidato', 'src/services/job.service.ts', [(310, 317), (324, 333)], 'Serviço de candidaturas', 'Persistir etapa e situação e depois solicitar notificação ao candidato. Falha do aviso é registrada e não desfaz a atualização.', ['Atualizar etapa e situação', 'Criar notificação do candidato', 'Registrar eventual falha de notificação']),
]
items = []
for ident, module, title, rel, ranges, responsible, meaning, messages in specs:
    file = ROOT / rel
    lines = file.read_text(encoding='utf-8').splitlines()
    snippets = []
    rows = []
    for index, (start, end) in enumerate(ranges):
        assert 1 <= start <= end <= len(lines)
        if index:
            rows.append('<div class="gap">⋮ linhas intermediárias omitidas</div>')
        selected = lines[start - 1:end]
        snippets.append({'start': start, 'end': end, 'text': '\n'.join(selected)})
        indent = min((len(x) - len(x.lstrip()) for x in selected if x.strip()), default=0)
        for no, line in enumerate(selected, start):
            rows.append(f'<div class="row"><span class="ln">{no}</span><code>{html.escape(line[indent:])}</code></div>')
    assert sum(b-a+1 for a, b in ranges) <= 18
    doc = '''<!doctype html><html lang="pt-BR"><meta charset="utf-8"><style>
    *{box-sizing:border-box}body{width:1080px;margin:0;background:#0d1117;color:#e6edf3;font-family:Consolas,monospace}
    .file{font:19px Arial,sans-serif;padding:19px 24px;background:#17212e;overflow-wrap:anywhere}
    .code{padding:20px 18px 24px}.row{display:flex;font-size:24px;line-height:1.43}
    .ln{color:#8b949e;width:62px;flex-shrink:0;text-align:right;padding-right:20px;user-select:none}
    code{font:inherit;white-space:pre-wrap;overflow-wrap:anywhere;flex:1;min-width:0}
    .gap{font:17px Arial;color:#8b949e;padding:9px 62px}
    </style><body><div class="file">''' + html.escape(rel) + '</div><div class="code">' + ''.join(rows) + '</div></body></html>'
    (OUT / f'{ident}.html').write_text(doc, encoding='utf-8')
    items.append({'id': ident, 'module': module, 'title': title, 'responsible': responsible, 'path': rel, 'ranges': ranges, 'meaning': meaning, 'sequence_messages': messages, 'sha256': hashlib.sha256(file.read_bytes()).hexdigest(), 'snippets': snippets, 'png': str(OUT / f'{ident}.png')})
commit = subprocess.check_output(['git','rev-parse','HEAD'], cwd=ROOT, text=True).strip()
(OUT / 'evidencias.json').write_text(json.dumps({'commit': commit, 'items': items}, ensure_ascii=False, indent=2), encoding='utf-8')
print(f'{len(items)} trechos reais de código preparados. Base {commit}')

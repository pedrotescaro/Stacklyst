import json,hashlib,html
from pathlib import Path
ROOT=Path(__file__).resolve().parents[4]
OUT=Path(__file__).resolve().parents[1]
B=OUT/'.build/code';B.mkdir(parents=True,exist_ok=True)
specs=[
 ('UC005','Estudar lição','Usuário autenticado','src/app/lesson/[lessonId]/page.tsx',[(59,64),(76,83)],'Carrega a lição, valida o acesso e entrega conteúdo e progresso à interface.'),
 ('UC006','Resolver exercício','Usuário autenticado','src/app/api/lessons/[lessonId]/attempt/route.ts',[(21,40)],'Avalia a resposta no servidor. Testar código não concede XP nem conclui a etapa.'),
 ('UC017','Publicar vaga','Recrutador','src/app/api/jobs/route.ts',[(67,80),(89,94)],'Exige papel de recrutador ou administrador e vínculo autorizado com a empresa.'),
 ('UC022','Candidatar-se a vaga','Usuário autenticado','src/services/job.service.ts',[(269,291)],'Verifica a vaga aberta e cria uma candidatura vinculada ao usuário e à etapa inicial.'),
 ('UC023','Inscrever-se ou cancelar participação em evento','Usuário autenticado','src/app/api/events/[id]/participate/route.ts',[(6,16),(19,29)],'POST confirma a inscrição. DELETE cancela a participação do usuário autenticado.'),
 ('UC026','Atualizar etapa de candidatura','Recrutador','src/app/api/jobs/[id]/route.ts',[(30,46),(48,54)],'Confere a empresa, a candidatura e a etapa antes de atualizar o processo.'),
 ('UC013','Criar publicação','Usuário autenticado','src/services/post.service.ts',[(25,38),(40,46)],'A criação grava a publicação e concede XP na mesma transação.'),
 ('UC011','Consultar ranking de XP','Usuário','src/app/api/leaderboard/route.ts',[(31,55)],'O servidor consulta e ordena os usuários. O caso de uso é consulta, sem manutenção manual do ranking.'),
 ('UC056','Consultar candidaturas de uma vaga','Recrutador','src/app/api/jobs/[id]/applications/route.ts',[(1,13)],'A rota exige papel autorizado. JobService também valida a responsabilidade pela empresa.'),
 ('AUTO01','Notificação da candidatura','Comportamento automático','src/services/job.service.ts',[(309,333)],'A atualização avisa o candidato associado à candidatura. O código não envia um alerta geral por intenção de vaga.'),
]
items=[]
for ident,title,actor,rel,ranges,meaning in specs:
 p=ROOT/rel; content=p.read_text(encoding='utf-8'); lines=content.splitlines(); blocks=[]; snippets=[]
 for i,(a,b) in enumerate(ranges):
  if b>len(lines): raise ValueError((rel,b,len(lines)))
  if i:blocks.append('<div class="gap">Linhas intermediárias omitidas</div>')
  snippets.append({'start':a,'end':b,'text':'\n'.join(lines[a-1:b])})
  for j in range(a-1,b): blocks.append('<div class="row"><span class="ln">'+str(j+1)+'</span><code>'+html.escape(lines[j])+'</code></div>')
 document='<!doctype html><meta charset="utf-8"><style>'+'''body{margin:0;background:#0d1117;color:#e6edf3;font-family:Consolas,monospace}.file{font:17px Arial,sans-serif;padding:20px 24px;background:#17212e;color:#e6edf3}.code{padding:20px 24px 24px}.row{display:flex;white-space:pre;font-size:20px;line-height:1.46}.ln{color:#8b949e;width:50px;flex-shrink:0;text-align:right;padding-right:23px}code{font:inherit}.gap{font:16px Arial;color:#8b949e;padding:12px 73px} </style>'''+ '<div class="file">'+html.escape(rel)+'</div><div class="code">'+''.join(blocks)+'</div>'
 (B/(ident+'.html')).write_text(document,encoding='utf-8')
 items.append(dict(id=ident,title=title,actor=actor,path=rel,ranges=ranges,meaning=meaning,sha256=hashlib.sha256(p.read_bytes()).hexdigest(),snippets=snippets))
(OUT/'tools/code-evidence.json').write_text(json.dumps(items,ensure_ascii=False,indent=2),encoding='utf-8')
print('Prepared',len(items),'exact code excerpts')

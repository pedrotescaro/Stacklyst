"""Preserve the delivered UC001–UC056 IDs; extend without reusing removed IDs."""
from pathlib import Path
from docx import Document
import json,re
R=Path(__file__).resolve().parents[1];ROOT=R.parents[2];M=ROOT/'docs/manual/detalhado'
scenario=json.loads((M/'catalogo-casos.json').read_text(encoding='utf-8'));byc={x['id']:x for x in scenario}
mapping={1:[1],2:[57],3:[2,30],4:[4],5:[58],6:[5],7:[6,28],8:[52,29],9:[6],10:[52,29],11:[6],12:[12],13:[59],14:[60],15:[61],16:[62],17:[13,35],18:[31],19:[14,36],20:[14],21:[34],22:[3,51],23:[32,33],24:[63],25:[11],26:[21,55],27:[38,39,40,41],28:[50],29:[64],30:[65],31:[66],32:[67],33:[68],34:[69],35:[70],36:[8,9,54],37:[10,29,52],38:[53],39:[24,27],40:[16],41:[17,18,25,56],42:[22],43:[26],44:[15,46,47],45:[23],46:[48],47:[19,20,49],48:[71],49:[72],50:[37],52:[73],53:[74],54:[75]}
cross={f'C{k:02}':[f'UC{v:03}' for v in ids] for k,ids in mapping.items()}
parts={};active=None
for p in Document(next((R/'fontes-originais').glob('04*.docx'))).paragraphs:
    t=p.text.strip();hit=re.match(r'5\.\d+ Caso de Uso (UC\d{3})\s*[—-]\s*(.+)',t)
    if hit:active=hit[1];parts[active]={'id':active,'title':hit[2],'lines':[]};continue
    if active and re.match(r'^6[. ]',t):active=None
    if active and t and not t.startswith(('Protótipo de Interface','Referência visual')):
        parts[active]['lines'].append(t.replace('Visitante','Usuário').replace('visitante','usuário'))
for id in ['UC042','UC043','UC044','UC045']:parts.pop(id,None)
new={57:'Confirmar e recuperar acesso',58:'Consultar disponibilidade de conhecimentos',59:'Resgatar etapa especial da trilha',60:'Consultar e emitir credencial elegível',61:'Verificar credencial pública',62:'Gerar PDF de credencial',63:'Bloquear conta',64:'Explorar clareira com personagem',65:'Resgatar baú diário e check-in',66:'Comprar e equipar item',67:'Enfrentar criatura',68:'Convidar amigo para arena',69:'Sincronizar presença e aparência',70:'Disputar PvP com equipamentos',71:'Usar o domínio pelo aplicativo',72:'Importar perfis e threads editoriais',73:'Votar em enquete',74:'Denunciar publicação',75:'Enviar imagem compatível'}
for n,title in new.items():
    id=f'UC{n:03}';support=[c for c in scenario if id in cross.get(c['id'],[])]
    c=support[0];parts[id]={'id':id,'title':title,'lines':['Descrição: '+title+'.','Ator principal: '+c['actor'],'Pré-condições: '+c['preconditions'],'Pós-condições: '+c['success'],'Fluxo principal']+[f'{i+1}. {v}' for i,v in enumerate(c['steps'])]+['Fluxos alternativos: '+c['alternatives']]}
case_roles={16:'E',17:'R',19:'AD',20:'AD',26:'R',27:'AD',49:'AD',56:'R',72:'AD'}
special={
'Conta e acesso':[1,2,30,50,57], 'Perfil':[3,32,33,51,63], 'Trilhas':[4,5,6,7,12,28,29,52,58,59],
'Reconhecimento':[60,61,62], 'Duelos':[8,9,10,53,54], 'Avaliadores':[16,24,27],
'Comunidade':[13,14,31,34,35,36,37,73,74,75], 'Recursos pessoais':[11,21,38,39,40,41,55],
'Recrutamento':[17,18,22,25,26,56], 'Eventos':[15,23,46,47,48], 'Administração':[19,20,49,72],
'Mundinho':list(range(64,71)), 'Mobile':[71]}
allcases=[]
for id,c in sorted(parts.items()):
    n=int(id[2:]);support=[x for x in scenario if id in cross.get(x['id'],[])]
    c['area']=next((k for k,ids in special.items() if n in ids),'Comunidade');c['actor']=case_roles.get(n,'U')
    c['sources']=sorted({x['source'] for x in support});c['scenarioIds']=[x['id'] for x in support];c['rules']=sorted({r for x in support for r in x['rules']})
    c['definition']='\n'.join(c['lines'])+'\nImplementação: '+', '.join(c['sources']);allcases.append(c)
full={c['id']:c for c in allcases}
consolidations={
1:('Cadastrar conta',[1]),2:('Fazer login',[2,30,57]),3:('Gerenciar perfil e preferências',[3,32,33,50,51,63,75]),
4:('Consultar e selecionar trilha',[4,58]),5:('Estudar lição',[5,59]),6:('Resolver exercício',[6,52]),7:('Consultar evolução e reconhecimento',[7,11,60,61,62]),
8:('Disputar duelo de programação',[8,9,53,54]),10:('Enviar solução de duelo',[10]),12:('Consultar ajuda do exercício',[12]),
13:('Gerenciar publicação própria',[13,35]),14:('Consultar e interagir com a comunidade',[14,31,34,36,37,73,74]),
15:('Gerenciar eventos e desafios',[15,46,47,48]),16:('Avaliar duelo autorizado',[16]),17:('Gerenciar empresa e vagas',[17,18,25]),
19:('Administrar usuários e recursos',[19,20,27,49,72]),21:('Acompanhar notificações',[21,55]),22:('Candidatar-se a vaga',[22]),23:('Participar de evento',[23]),
24:('Solicitar credenciamento de avaliador',[24]),26:('Gerenciar candidaturas',[26,56]),28:('Avaliar resposta',[28]),29:('Executar código e testes',[29]),38:('Trocar mensagens privadas',[38,39,40,41])}
old_to_core={f'UC{old:03}':f'UC{n:03}' for n,(_,ids) in consolidations.items() for old in ids}
reduced=[]
for n,(title,ids) in consolidations.items():
    id=f'UC{n:03}';members=[full[f'UC{i:03}'] for i in ids];base=members[0]
    c={**base,'title':title,'subflows':[{ 'historicalId':m['id'],'title':m['title'],'lines':m['lines']} for m in members]}
    c['sources']=sorted({s for m in members for s in m['sources']});c['scenarioIds']=sorted({s for m in members for s in m['scenarioIds']});c['rules']=sorted({r for m in members for r in m['rules']})
    c['definition']='Objetivo consolidado: '+title+'\nVariantes: '+', '.join(m['title'] for m in members)+'\n'+base['definition'];reduced.append(c)
allcases=reduced
cross={k:sorted({old_to_core[u] for u in ids if u in old_to_core}) for k,ids in cross.items()}
plan=json.loads((R/'tools/astah-plan.json').read_text(encoding='utf-8'));plan['uc']=[dict(id=c['id'],name=c['title'],actor=c['actor'],area=c['area'],definition=c['definition']) for c in allcases]
plan['sequences'][-1]['participants']=[x.replace('requireRecruiter','requireRole / requireCompanyAccess') for x in plan['sequences'][-1]['participants']]
(R/'tools/astah-plan.json').write_text(json.dumps(plan,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(M/'catalogo-academico.json').write_text(json.dumps(allcases,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(M/'equivalencia-cenarios-uc.json').write_text(json.dumps(cross,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
out=['# Catálogo acadêmico de casos de uso','',
'Esta é a numeração canônica dos diagramas e do seminário: **24 casos de uso**, todos presentes na visão geral. Os números remanescentes da entrega acadêmica foram preservados para manter as referências, por isso não formam uma sequência sem lacunas. Operações relacionadas foram reunidas em objetivos e variantes; números de casos absorvidos não representam casos adicionais. A tabela de consolidação permite rastrear a alteração.','',
'Critério baseado em Guedes, seção 3.4 e capítulo 3: caso de uso representa um objetivo ou um comportamento reutilizado relevante; rotas, telas, validação de sessão, persistência, sincronização e execução de um cliente mobile não geram automaticamente casos independentes. UC012 é uma extensão opcional solicitada pelo usuário; UC028 e UC029 são comportamentos reutilizados da avaliação, mantidos para explicitar include e extend. Os três são contabilizados nos 24 casos.','',
'Os cenários Cxx do caderno de implementação continuam como recortes técnicos e não são contados como casos de uso acadêmicos. O escopo desta modelagem exclui o Mundinho por solicitação do grupo e não inclui comunidades/guilds. O jogo permanece explicado no manual técnico, sem introduzir casos no diagrama geral. Cadastro, login e recuperação usam Usuário e podem ocorrer sem sessão; as ações protegidas exigem autenticação segundo suas pré-condições.','',
'| ID | Caso de uso | Área |','| --- | --- | --- |']
out += [f"| {c['id']} | {c['title']} | {c['area']} |" for c in allcases]
for c in allcases:
    out+=['',f"## {c['id']} — {c['title']}",'','Objetivo: '+c['title']+'.','Ator principal: '+{'U':'Usuário','R':'Recrutador','E':'Avaliador','AD':'Administrador'}[c['actor']]+'.']
    for i,sub in enumerate(c['subflows']):out+=['',('### Fluxo principal' if i==0 else '### Variante '+str(i)+' — '+sub['title']),'']+[re.sub(r'UC\d{3}',lambda m:old_to_core.get(m[0],m[0]),line) for line in sub['lines']]
    out+=['','Implementação: '+('; '.join('`'+x+'`' for x in c['sources']) or 'Consultar os contratos e a especificação da área correspondente.')+'.','Cenários técnicos relacionados: '+(', '.join(c['scenarioIds']) or 'Especificação preservada da entrega acadêmica')+'.','Regras relacionadas: '+(', '.join(c['rules']) or 'Conforme condições descritas acima')+'.']
out+=['','## Consolidação e redução do catálogo','','| Caso mantido | Operações reunidas como fluxos e variantes |','| --- | --- |']
out+=[f"| UC{n:03} — {title} | "+'; '.join(full[f'UC{i:03}']['title'] for i in ids)+' |' for n,(title,ids) in consolidations.items()]
out+=['','## Equivalência com os cenários de implementação','','| Cenário técnico | Casos acadêmicos relacionados |','| --- | --- |']
out+=[f"| {c} | {', '.join(ids)} |" for c,ids in cross.items()]
(M/'catalogo-academico.md').write_text('\n'.join(out)+'\n',encoding='utf-8')
print('Academic catalog:',len(allcases),'use cases; technical steps and variants consolidated')

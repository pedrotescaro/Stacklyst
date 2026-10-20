from pathlib import Path
import json,re
BASE=Path(__file__).resolve().parents[1]/'fontes-extraidas'
docs=json.loads((BASE/'inventario.json').read_text(encoding='utf-8'))
req=docs[2]
rfs=[]
for t in req['tables']:
    rows=t['rows']; d={r[0]:r[1] for r in rows if len(r)==2}
    if re.fullmatch(r'RF\d{3}',d.get('Identificador','')):
        rfs.append({'id':d.pop('Identificador'),**d})
rnfs=[dict(zip(req['tables'][55]['rows'][0],row)) for row in req['tables'][55]['rows'][1:]]
rns=[dict(zip(req['tables'][56]['rows'][0],row)) for row in req['tables'][56]['rows'][1:]]
ucs=[]
for p in docs[3]['paragraphs']:
    m=re.match(r'5\.\d+ Caso de Uso (UC\d{3})\s*[—–-]\s*(.+)',p['text'])
    if m:ucs.append({'id':m.group(1),'name':m.group(2),'paragraph':p['index']})
activities=[('AN01','Estudar programação','image5.jpg','AN01'),('AN02','Praticar exercícios de programação','image1.jpg','AN03'),('AN03','Acompanhar a própria aprendizagem','image2.png','AN04'),('AN04','Buscar ajuda para uma dúvida','image3.jpg','AN06'),('AN05A','Divulgar oportunidade de trabalho','image6.jpg','AN08A'),('AN05B','Candidatar-se e acompanhar a seleção','image7.jpg','AN08B'),('AN06','Descobrir e participar de um evento','image4.jpg','AN09')]
general=[('UC001','Cadastrar conta'),('UC002','Fazer login'),('UC003','Editar perfil'),('UC013','Manter publicação'),('UC008','Criar duelo aberto'),('UC010','Enviar solução de duelo'),('UC020','Manter denúncias'),('UC005','Estudar lição'),('UC058','Manter intenção de vaga'),('UC006','Resolver exercício'),('UC029','Executar código e testes'),('UC059','Manter interesse em Evento'),('UC015','Criar evento'),('UC011','Manter ranking de XP'),('UC017','Publicar vaga'),('UC057','Notificar usuário'),('UC048','Gerenciar desafios de evento'),('UC019','Gerenciar permissões de usuários')]
data={'counts':{'RF':len(rfs),'RNF':len(rnfs),'RN':len(rns),'UC_text':len(ucs),'UC_astah_declared':52,'UC_general_ellipses_visually_counted':len(general),'business_activity_sections':6,'business_activity_images':len(activities)},'functional_requirements':rfs,'nonfunctional_requirements':rnfs,'business_rules':rns,'usecases':ucs,'business_activities':[{'id':i,'name':n,'path':str(BASE/'02'/f),'old_id_inside_image':old} for i,n,f,old in activities],'general_usecases_original_image':{'path':str(BASE/'04/image1.jpg'),'labels':[{'id':i,'name':n} for i,n in general]},'prototypes':[{'uc':next((u['id'] for u in reversed(ucs) if u['paragraph'] < im['paragraph']),None),'image':im['path']} for im in docs[3]['images'] if 140<=im['paragraph']<=738],'warnings':['DOCX04 fala em 20 casos no diagrama geral, mas há 18 elipses na imagem.','DOCX04 mantém 56 especificações, das quais UC042–UC045 são cobertura textual complementar e não têm elementos no Astah atual.','UC057, UC058 e UC059 da imagem geral são rótulos legados, sem especificações próprias. DOCX orienta correspondência com candidatura UC022, evento UC023 e notificação interna de UC026.','Texto e legendas DOCX02 foram renumerados, mas seis das sete imagens têm números antigos.','Tabela final de evidências do DOCX03 preserva numeração antiga de atividades e slides. Deve usar documentos atualizados e a nova apresentação como referência para renumeração.']}
(BASE/'auditoria.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
lines=['# Auditoria das fontes do seminário','',f"Contagens: {len(rfs)} RF, {len(rnfs)} RNF, {len(rns)} RN, {len(ucs)} especificações UC, 52 UC declarados no Astah e 18 elipses na imagem geral.",'','## Atividades e imagens','']
lines.extend(f'- {i} {n}: `02/{f}`. Identificador visível original: {old}.' for i,n,f,old in activities)
lines+=['','## Identificadores do diagrama geral original','']+[f'- {i} {n}' for i,n in general]
lines+=['','## Requisitos funcionais','']+[f"- {x['id']} {x.get('Nome','')}" for x in rfs]
lines+=['','## Requisitos não funcionais','']+[f"- {x['Identificador']} {x['Nome']}" for x in rnfs]
lines+=['','## Regras de negócio','']+[f"- {x['ID']} {x['Regra']}: {x['Descrição']}" for x in rns]
lines+=['','## Casos de uso textuais','']+[f"- {x['id']} {x['name']}" for x in ucs]
lines+=['','## Ressalvas encontradas nas fontes','']+['- '+x for x in data['warnings']]
(BASE/'AUDITORIA.md').write_text('\n'.join(lines),encoding='utf-8')
print(json.dumps(data['counts'],ensure_ascii=False))

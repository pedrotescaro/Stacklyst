from pathlib import Path
import json
BASE=Path(__file__).resolve().parents[1]/'fontes-extraidas'
audit=json.loads((BASE/'auditoria.json').read_text(encoding='utf-8'))
rf={x['id']:x for x in audit['functional_requirements']}
rnf={x['Identificador']:x for x in audit['nonfunctional_requirements']}
rn={x['ID']:x for x in audit['business_rules']}
brief={
'RF007':'Exibir a lição e suas etapas interativas.',
'RF008':'Avaliar a resposta no servidor. Testar código não conclui a atividade nem concede XP.',
'RF009':'Gravar tentativa e progresso, sem duplicar a primeira recompensa.',
'RF035':'Criar vaga com requisitos e etapas para uma empresa autorizada.',
'RF036':'Listar e filtrar oportunidades abertas.',
'RF047':'Registrar uma candidatura do usuário a uma vaga aberta, na etapa inicial.',
'RF048':'Atualizar etapa, status e feedback e notificar o candidato associado.',
'RF044':'Gerar a notificação ao destinatário após a operação correspondente.',
'RNF009':'Limitar o tempo de execução e o tamanho do código recebido.',
'RNF014':'Atualizar XP e progresso atomicamente, sem duplicidade.',
'RNF001':'Verificar a sessão no servidor antes de acessar rotas privadas.',
'RNF002':'Validar o papel, o acesso à empresa e os vínculos dos recursos.',
'RNF005':'Retornar somente campos autorizados no perfil e no recrutamento.',
'RN001':'Conceder XP somente após atividade válida e confirmada, uma vez.',
'RN029':'Exigir os pré-requisitos da lição. Revisitar conteúdo não duplica a recompensa.',
'RN020':'Permitir publicação somente a recrutador ou administrador com acesso à empresa.',
'RN017':'Aplicar as permissões correspondentes ao papel do usuário.',
'RN026':'Aceitar uma candidatura por usuário e vaga aberta. A atualização exige responsável autorizado.',
'RN022':'Notificar somente o candidato associado. Falha da notificação não desfaz a atualização.'}
def functional(id):
    s=rf[id];status=s['Estado e referências de implementação']
    return {'id':id,'name':s['Nome'],'description':brief[id],'status':'Implementado conforme documento' if id!='RF048' else 'Fluxo documentado no seminário; código referenciado','source_status':status,'source_section':'4. Requisitos Funcionais','source_description':s['Descrição']}
def nonfunctional(id):
    s=rnf[id]
    return {'id':id,'name':s['Nome'],'description':brief[id],'status':'Requisito de aceitação; conformidade a verificar','source_status':'A tabela de RNF não declara implantação ou homologação.','acceptance_criterion':s['Critério verificável de aceitação'],'source_section':'5. Requisitos Não Funcionais','source_description':s['Descrição']}
def rule(id):
    s=rn[id]
    return {'id':id,'name':s['Regra'],'description':brief[id],'status':s['Situação'],'evidence':s['Evidência'],'source_section':'6. Regras de Negócio','source_description':s['Descrição']}
modules=[{'id':'aprendizagem','presenter':'Pedro Antonio Silvestre Tescaro','title':'Estudar uma lição e resolver exercício','usecases':['UC005','UC006'],'RF':[functional(x) for x in ['RF007','RF008','RF009']],'RNF':[nonfunctional(x) for x in ['RNF009','RNF014']],'RN':[rule(x) for x in ['RN001','RN029']]},
{'id':'publicar-vaga','presenter':'Guilherme Alves de Campos','title':'Publicar uma vaga','usecases':['UC017'],'RF':[functional(x) for x in ['RF035','RF036']],'RNF':[nonfunctional(x) for x in ['RNF001','RNF002']],'RN':[rule(x) for x in ['RN020','RN017']]},
{'id':'candidatura','presenter':'Paulo Henrique Leal dos Santos','title':'Candidatar-se e acompanhar a seleção','usecases':['UC022','UC026'],'RF':[functional(x) for x in ['RF047','RF048','RF044']],'RNF':[nonfunctional(x) for x in ['RNF002','RNF005']],'RN':[rule(x) for x in ['RN026','RN022']]}]
purposes=['Organizar o estudo e verificar se o conteúdo foi compreendido e aplicado.','Resolver um problema, testar exemplos e compreender os erros encontrados.','Comparar os resultados aos objetivos e ajustar o planejamento de estudo.','Esclarecer uma dúvida e conferir a explicação em um exemplo.','Definir e divulgar uma oportunidade profissional com informações conferidas.','Enviar o currículo e acompanhar as etapas e o resultado da seleção.','Encontrar um evento e organizar a inscrição e a participação.']
activities=[{**a,'title':a['id']+' — '+a['name'],'purpose':p,'image_path':a['path'],'crop_top_pixels_to_hide_old_id':58 if a['old_id_inside_image']!='AN01' else 58} for a,p in zip(audit['business_activities'],purposes)]
data={'source_document':'C:/Users/PEDRO/Downloads/03-requisitos-do-sistema-stacklyst-revisao-textual.docx','status_note':'Estados são os declarados nas fontes. RNF são metas de aceitação e não devem ser apresentados como resultados de testes. A conferência do código e da execução deve ser registrada separadamente.','modules':modules,'activities':activities,'team_source':'C:/Users/PEDRO/Downloads/01-documento-de-visao-stacklyst-revisao-textual.docx, seção 5'}
(BASE/'requisitos-slides.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
print('wrote',BASE/'requisitos-slides.json')

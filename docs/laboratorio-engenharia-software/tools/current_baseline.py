"""Versioned corrections to the academic baseline, verified against September code."""
import re
from pathlib import Path


def apply_current_baseline(ns):
    make_uc, make_rf = ns['make_uc'], ns['make_rf']
    activities = ns['ACTIVITIES']
    by_activity = {a['id']: a for a in activities}
    by_activity['AN01'].update(
        name='Aprender em uma trilha',
        flow=['Selecionar linguagem e caminho.', 'Consultar o catálogo e as tentativas persistidas; mapa e lista recebem os mesmos nós.', 'Selecionar lição com pré-requisitos cumpridos ou já concluída.', 'Estudar explicação e exemplo antes da prática.', 'Responder cada exercício; o servidor avalia e salva o resultado e a primeira recompensa em transação.', 'Em falha de execução ou gravação, manter a resposta editável para nova tentativa.', 'Retornar à trilha e reconsultar o progresso para liberar a próxima lição.'],
        evidence='src/lib/learning/catalog.ts; assessment.ts; lesson-progress.ts; src/app/trails/LearningJourney.tsx')
    by_activity['AN02'].update(
        flow=['Selecionar convite direto ou arena.', 'No convite, aguardar aceite antes da expiração; na arena, ocupar um duelo PENDING ou criar um para aguardar oponente.', 'Validar participante, linguagem suportada e prazo.', 'Executar os testes do código no servidor e registrar DuelSubmission.', 'Resolver por pontuação quando houver resultados ou ao atingir o prazo; ausência de ambos os envios encerra sem vencedor.', 'Encaminhar empate técnico para REVIEW_PENDING e parecer humano autorizado.', 'Fechar o duelo e conceder 50 XP ao vencedor uma única vez.'],
        evidence='src/app/api/duels/route.ts; src/services/duel.service.ts; src/lib/duels/{judge,resolution,resolution-policy,lifecycle}.ts')
    by_activity['AN03'].update(
        flow=['Enviar resposta com ação run ou submit.', 'Autenticar, aplicar limite, validar o contrato e os pré-requisitos.', 'Para código, executar testes públicos em run e todos os testes em submit.', 'Tratar falha do executor sem marcar acerto.', 'Em submit, gravar tentativa e XP elegível sob lock do usuário; em falha da transação, permitir repetição.', 'Retornar feedback e progresso confirmado, preservando testes ocultos.'],
        evidence='src/app/api/lessons/[lessonId]/attempt/route.ts; src/lib/learning/assessment.ts; src/lib/exercises/evaluator.ts; src/lib/learning/transaction.ts')
    by_activity['AN04'].update(
        name='Registrar XP e consultar evolução',
        flow=['Receber resultado avaliado pelo servidor.', 'Abrir transação e adquirir lock por usuário.', 'Consultar o recibo da atividade e identificar primeiro acerto.', 'Conceder a recompensa definida no servidor somente no primeiro acerto; revisões recebem zero XP adicional.', 'Confirmar gravação de tentativa e recompensa juntas ou desfazer a operação.', 'Derivar nível e faixa de XP.', 'Ordenar ranking por XP decrescente, username e id crescentes.'],
        evidence='src/lib/learning/rewards.ts; lesson-progress.ts; language-xp.ts; src/lib/xp.ts')
    activities.append(dict(
        id='AN06', name='Consultar ajuda do exercício', objective='Apoiar a prática com orientações, dicas e documentação técnica do exercício.',
        participants='Estudante; Stacklyst.', preconditions='Exercício publicado e modo de assistência selecionado.',
        flow=['Abrir um exercício e selecionar o modo de assistência.', 'Verificar se o modo permite a ajuda solicitada.', 'Abrir dica ou documentação editorial.', 'Registrar LearningEvent quando a ação ocorrer no workspace.', 'Aplicar a orientação e testar o código.'],
        decisions='Modo permite ajuda? Material disponível?', exceptions='Material ausente ou modo sem assistência; é possível trocar o modo.',
        result='Orientação consultada sem alteração automática de XP.',
        evidence='src/components/lesson/AssistanceControls.tsx; src/lib/exercises/repository.ts; src/app/api/exercises/[exerciseId]/events/route.ts',
        diagram='AN06-consultar-ajuda'))
    activities.sort(key=lambda a: a['id'])
    by_activity = {a['id']: a for a in activities}
    by_activity['AN08']['preconditions'] = 'Conta autenticada para cadastrar empresa; papel RECRUITER ou ADMIN para publicar vaga.'
    by_activity['AN08']['flow'][0] = 'Um usuário autenticado cadastra empresa; uma conta USER passa a RECRUITER.'
    by_activity['AN09']['objective'] = 'Executar operações administrativas autorizadas nas funcionalidades existentes.'
    by_activity['AN09']['flow'][-1] = 'Persistir a mudança e realizar o registro/notificação que o serviço suporta; não existe auditoria universal.'

    modules = {row[0]: row for row in ns['SCOPE_MODULES']}
    replacements = {
        'Trilhas': ('Catálogo versionado com unidades, lições e exercícios; mapa e lista compartilham os nós e estados.', 'src/lib/learning/catalog.ts; src/app/trails/LearningJourney.tsx'),
        'Exercícios': ('Avaliação no servidor com respostas canônicas e execução remota de código.', 'src/lib/learning/assessment.ts; src/lib/exercises/evaluator.ts'),
        'Matchmaking': ('Convites por faixa de XP coexistem com a arena persistida em PENDING.', 'src/services/duel.service.ts; src/app/api/duels/route.ts; src/lib/duels/lifecycle.ts'),
        'Ranking e divisões': ('Ranking por XP e faixas Bronze a Diamante; não implementa rating Elo.', 'src/lib/learning/rewards.ts; language-xp.ts'),
    }
    ns['SCOPE_MODULES'] = [(name, replacements[name][0], 'Implementado', replacements[name][1]) if name in replacements else row for name, *rest in ns['SCOPE_MODULES'] for row in [(name, *rest)]]

    rf = {r['id']: r for _, group in ns['RF_GROUPS'] for r in group}
    updates = {
        'RF005': dict(processing='Derivar unidades, lições e exercícios do catálogo e consultar o progresso salvo. Mapa e lista usam o mesmo conjunto e a mesma ordenação.', details='Implementado: src/lib/learning/catalog.ts; src/app/trails/LearningJourney.tsx.'),
        'RF008': dict(details='Implementado: src/lib/learning/assessment.ts; src/app/api/lessons/[lessonId]/attempt/route.ts.', processing='Validar resposta no servidor. Código usa executor externo; testes privados e soluções não são serializados ao cliente.', constraints='Entrada inválida retorna 400. Falha do executor ou da gravação não confirma avanço; a interface permite tentar novamente.'),
        'RF009': dict(description='Persistir respostas e derivar conclusão e desbloqueio de lições.', details='Implementado: lesson-progress.ts, transaction.ts, QuizAttempt e ExerciseSubmission.', processing='Lock por usuário; gravação atômica de tentativa e primeira recompensa. Transação de banco limitada a 20 s, com até 10 s para adquirir conexão.', constraints='QuizAttempt é único por usuário/atividade. Submissões possuem índice parcial para primeiro acerto. Revisões não duplicam recompensa.'),
        'RF012': dict(details='Implementado: src/lib/learning/rewards.ts; src/lib/xp.ts.', constraints='Nível é derivado de XP e é distinto da faixa Bronze a Diamante.'),
        'RF014': dict(processing='Ordenar XP decrescente, depois username e id crescentes. Por linguagem, somar LanguageTrail e recompensas históricas de exercícios.', constraints='Desempates determinísticos. A API de leaderboard retorna top 10; não equivale à posição completa de todos os usuários.'),
        'RF015': dict(name='Derivar faixa de XP', description='Classificar XP acumulado nas cinco faixas.', outputs='Faixa de XP Bronze, Prata, Ouro, Platina ou Diamante.', constraints='Não é rating Elo. Sem perda de XP por derrota e sem rebaixamento automático por derrota.'),
        'RF017': dict(description='Entrar em duelo disponível ou aguardar oponente na arena.', processing='Atualização condicional ocupa duelo PENDING compatível; se não houver, cria pendência. O fluxo legado de convite conserva busca por faixa de XP.', details='Implementado: src/app/api/duels/route.ts; src/lib/duels/lifecycle.ts.', constraints='A fila persistida da arena e o convite por faixa são mecanismos distintos.'),
        'RF019': dict(details='Implementado: src/app/api/duels/[id]/submit; src/lib/duels/judge.ts; lifecycle.ts.', constraints='Validar participante, estado e prazo no servidor. Manutenção resolve duelos vencidos.'),
        'RF020': dict(processing='Aplicar testes e critérios automáticos; empate técnico vai para revisão humana autorizada.', constraints='A estimativa estática de complexidade é heurística, não prova formal. Revisão humana fecha pendência por transição condicional.'),
        'RF021': dict(description='Recompensar o vencedor de duelo fechado com 50 XP uma única vez.', details='Implementado: src/lib/duels/resolution.ts; xp_awarded_at.', processing='Reivindicar recompensa por atualização condicional e gravar XP na transação.', constraints='Não há rating Elo ajustado à força relativa. Derrota não reduz XP.'),
        'RF004': dict(constraints='Titular autenticado; mudança de username confirmada e bloqueada por sete dias após alteração, validada no servidor.'),
        'RF034': dict(actors='Usuário autenticado', processing='Validar sessão e dados; criar empresa com o usuário como proprietário e promover USER a RECRUITER.', constraints='Não exige papel RECRUITER prévio. Verificação oficial da empresa não deve ser presumida.'),
        'RF035': dict(constraints='A rota exige RECRUITER/ADMIN. Limite identificado: não verifica no POST se company_id pertence ao solicitante; controle de propriedade precisa de correção separada.'),
    }
    for id, changes in updates.items(): rf[id].update(changes)
    ns['RF_GROUPS'].insert(4, ('Grupo de assistência editorial e extensões futuras', [
        make_rf('RF022', 'Consultar ajuda editorial', 'Média', 'Exibir dicas e documentação de exercícios.', 'Usuário', 'RN013', 'Implementado', 'AssistanceControls; LearningEvent', 'Exercício e modo de assistência.', 'Verificar disponibilidade e registrar consulta no workspace.', 'Dica ou documentação.', 'Ajuda não aumenta nem reduz XP.'),
        *[make_rf(id, name, 'Baixa', text, 'Usuário', 'RN013, RN024', 'Planejado', 'Sem rota de tutor de IA no fluxo atual de lições', 'Contexto permitido.', 'Proposta para extensão futura.', 'Resultado auxiliar proposto.', 'Não afirmar como fluxo implementado.') for id, name, text in [
            ('RF023', 'Tutor conversacional opcional', 'Proposta de diálogo educacional com provedor de IA.'),
            ('RF024', 'Personalizar recomendações', 'Proposta de recomendar prática com base no histórico.'),
            ('RF025', 'Revisar conteúdo gerado', 'Proposta de curadoria antes da publicação de novos exercícios gerados.')]],
    ]))
    rules = {
        'RN002': ('Valores de XP', 'No catálogo: explicação 0, prática conceitual 10, atividade guiada explicitamente configurada 15, código 25 e projeto 40. Atividades legadas preservam valores já ganhos. Checkpoint/baú não concedem XP livre pelo cliente.', 'Implementado', 'learning/rewards.ts; catalog-types.ts; trails/checkpoint e chest'),
        'RN005': ('Faixas de XP', 'Bronze 0–499; Prata 500–1199; Ouro 1200–2499; Platina 2500–4999; Diamante a partir de 5000. Promoção por XP acumulado; derrota não rebaixa. Não é Elo.', 'Implementado', 'learning/rewards.ts'),
        'RN006': ('Ordenação do ranking', 'XP decrescente, username e id crescentes. Por linguagem, agregar LanguageTrail e primeiro acerto de ExerciseSubmission, sem migrar nem somar novamente o histórico global.', 'Implementado', 'learning/rewards.ts; language-xp.ts'),
        'RN007': ('Entrada em duelos', 'Convite: mesma faixa de XP, expansão ±1000 e fallback. Arena: ocupar PENDING compatível ou criar espera persistida; manutenção resolve expiração.', 'Implementado', 'duel.service.ts; api/duels; duels/lifecycle.ts'),
        'RN011': ('Prazo e resultado do duelo', 'Na resolução por prazo, sem envios fecha sem vencedor; um envio elegível pode vencer; dois envios são comparados. A manutenção efetiva depende de acionamento.', 'Implementado com limite operacional', 'duels/resolution.ts; resolution-policy.ts; lifecycle.ts'),
        'RN012': ('Avaliação de duelo', 'Testes e pontuação automática; diferença de score até 5 e runtime até 5% (ou ausente) encaminha empate técnico a REVIEW_PENDING. Vitória recebe 50 XP uma única vez.', 'Implementado', 'duels/resolution-policy.ts; resolution.ts'),
    }
    ns['BUSINESS_RULES'] = [(r[0], *rules[r[0]]) if r[0] in rules else r for r in ns['BUSINESS_RULES']]

    uc = {u['id']: u for u in ns['USE_CASES']}
    for id in ['UC001', 'UC002']:
        uc[id].update(initiators='Visitante', secondary='Provedor de identidade')
    uc['UC005']['secondary'] = 'Stacklyst'
    uc['UC005']['alternatives'][-1] = 'A3 — Falha ao consultar progresso: informar indisponibilidade sem confirmar conclusão.'
    uc['UC006']['alternatives'].append('A4 — Transação expirada ou conflito: responder PROGRESS_SAVE_UNAVAILABLE (503) e permitir reenvio idempotente.')
    uc['UC006']['description'] = 'Resolver atividade e incluir UC028 para avaliar a resposta. Ponto de extensão consultar ajuda: UC012 pode ocorrer sob solicitação e quando o modo permite.'
    uc['UC008'].update(name='Convidar para duelo', secondary='Oponente', description='Enviar convite direto ou por busca de oponente.', preconditions='Conta autenticada, oponente elegível e cooldown cumprido.', postconditions='Convite pendente registrado; o duelo só inicia após aceite.', inputs='Linguagem e oponente opcional.', outputs='Convite, prazo e estado.', flow=['Escolher linguagem e oponente ou solicitar busca.', 'Validar sessão, disponibilidade e cooldown.', 'Selecionar oponente elegível quando necessário.', 'Registrar convite pendente e informar o destinatário.', 'Aguardar aceite ou expiração, fora desta solicitação.'], alternatives=['A1 — Convite expirado ou rejeitado: não iniciar duelo.', 'A2 — Cooldown impede novo convite.'])
    uc['UC009'].update(name='Entrar na arena', postconditions='Duelo ACTIVE com oponente ou PENDING aguardando participante.', flow=['Solicitar entrada na arena em JS, TS ou PYTHON.', 'Buscar duelo PENDING compatível.', 'Ocupar o duelo com atualização condicional.', 'Se não houver vaga, persistir duelo PENDING.', 'Aguardar oponente; manutenção trata expiração.'], alternatives=['A1 — Linguagem não suportada: recusar entrada.', 'A2 — Outro participante ocupou a vaga: buscar novamente ou criar espera.'])
    uc['UC010'].update(name='Submeter solução de duelo', initiators='Participante do duelo', secondary='Executor de código', description='Executar e registrar solução para resolução do duelo.', preconditions='Participante autenticado, duelo ativo e dentro do prazo.', postconditions='DuelSubmission registrada e resolução avaliada.', inputs='Código e duelo.', outputs='Resultados de testes e estado do duelo.', flow=['Enviar código.', 'Verificar sessão, participante, estado e prazo.', 'Executar testes públicos e privados do problema confiável.', 'Salvar submissão e aplicar política de resolução.', 'Retornar resultado sem revelar testes privados.'], alternatives=['A1 — Fora do prazo ou não participante: negar submissão.', 'A2 — Executor indisponível: não conceder vitória.', 'A3 — Empate técnico: encaminhar para revisão humana.'])
    uc['UC011']['alternatives'][-1] = 'A3 — Empate em XP: ordenar por username e id crescentes.'
    uc['UC016']['secondary'] = 'Administrador; Stacklyst'
    uc['UC016']['flow'][2] = 'O avaliador compara código e resultados dos testes.'
    uc['UC025'].update(initiators='Usuário autenticado', preconditions='Conta autenticada e dados válidos.', flow=['Abrir cadastro de empresa.', 'Validar sessão e dados.', 'Criar empresa com a conta como proprietária.', 'Promover USER para RECRUITER; preservar outros papéis.', 'Exibir empresa para gestão.'])
    uc['UC019']['postconditions'] = 'Papel atualizado ou operação recusada; o serviço registra log da alteração.'
    uc['UC020']['flow'][-1] = 'Aplicar a operação suportada e atualizar o registro da denúncia; não há trilha universal de auditoria.'
    uc['UC017']['alternatives'][0] = 'A1 — Sem papel RECRUITER/ADMIN: negar. Limite atual: o POST não valida propriedade do company_id; não afirmar essa proteção como implementada.'
    uc['UC010']['prototype'] = 'Editor de código do duelo (/duels/[id])'
    uc['UC015']['description'] = 'Criar evento com regras de participação; o ciclo completo de administração permanece parcial.'
    ns['USE_CASES'].extend([
        make_uc('UC012', 'Consultar ajuda editorial', 'Análise', 'Usuário autenticado', 'Stacklyst', 'Consultar dica ou documentação.', 'Exercício carregado.', 'Material exibido sem recompensa adicional.', 'Modo e tipo de ajuda.', 'Dica ou documentação.', by_activity['AN06']['flow'], ['A1 — Modo bloqueia ajuda: trocar modo ou continuar sem ajuda.'], 'Ajuda do workspace de exercícios'),
        make_uc('UC026', 'Gerenciar candidatura', 'Configuração', 'Recrutador responsável', 'Candidato', 'Atualizar etapa da candidatura.', 'Candidatura existente e responsável autorizado.', 'Etapa persistida e notificação tentada.', 'Candidatura e etapa.', 'Novo estado.', ['Abrir candidatura.', 'Verificar responsabilidade sobre a vaga.', 'Validar etapa de destino.', 'Persistir mudança e notificar candidato.'], ['A1 — Sem vínculo ou etapa inválida: recusar.', 'A2 — Notificação falha: registrar erro; a etapa permanece salva.'], 'Painel de recrutamento'),
        make_uc('UC027', 'Decidir candidatura de avaliador', 'Configuração', 'Administrador', 'Candidato', 'Aprovar ou rejeitar candidatura.', 'Administrador autenticado; candidatura pendente.', 'Decisão registrada; aprovação atribui papel.', 'Candidatura e decisão.', 'Status.', ['Abrir candidatura pendente.', 'Analisar critérios.', 'Enviar decisão.', 'Atualizar candidatura e papel quando aprovada.'], ['A1 — Candidatura já decidida: informar estado.', 'A2 — Sem papel ADMIN: negar.'], 'Painel administrativo de avaliadores'),
        make_uc('UC028', 'Avaliar resposta', 'Inclusão', 'UC006 Resolver exercício', 'Stacklyst', 'Comparar resposta com o contrato canônico da atividade.', 'Resposta válida e acesso autorizado.', 'Resultado correto ou incorreto; gravação tratada pelo caso chamador.', 'Resposta e atividade canônica.', 'Avaliação e feedback.', ['Identificar tipo da atividade.', 'Comparar escolha, lacunas, ordem, pares ou comando com o contrato.', 'No ponto de extensão avaliar código, executar UC029 se a atividade exigir código.', 'Retornar resultado para UC006.'], ['A1 — Configuração de avaliação ausente: não aprovar.', 'A2 — Executor indisponível: retornar falha controlada.'], 'Comportamento de servidor sem tela própria'),
        make_uc('UC029', 'Executar código e testes', 'Inclusão ou extensão', 'UC010 Submeter solução de duelo; UC028 Avaliar resposta', 'Executor de código', 'Executar código no provedor remoto com os testes definidos no servidor.', 'Código e linguagem suportados; contrato de teste carregado.', 'Saída e resultado de execução retornados.', 'Código, linguagem e testes aplicáveis.', 'Saída, erros e tempo de execução.', ['Preparar código e testes.', 'Enviar ao executor remoto.', 'Tratar saída, compilação ou tempo limite.', 'Retornar resultados sem expor testes ocultos.'], ['A1 — Provedor indisponível: falhar sem confirmar acerto.', 'A2 — Código inválido: retornar erro de compilação ou execução.'], 'Resultado no editor da lição ou duelo'),
    ])
    ns['USE_CASES'].sort(key=lambda u: u['id'])
    source = (Path(__file__).resolve().parents[1] / 'diagramas/fontes/casos-de-uso-stacklyst.puml').read_text(encoding='utf-8')
    names = {id: name.replace('\\n', ' ') for name, id in re.findall(r'usecase "UC\d{3} (.*?)" as (UC\d{3})', source)}
    for case in ns['USE_CASES']:
        case['name'] = names[case['id']]
    ns['TRACEABILITY'][5] = ['AN06 — Consultar ajuda do exercício', 'RF022; RF023–RF025 planejados', 'RN013, RN024', 'UC012']
    ns['TRACEABILITY'][2][-1] = 'UC006, UC028, UC029'
    ns['TRACEABILITY'][6][-1] = 'UC016, UC024, UC027'
    ns['TRACEABILITY'][7][-1] = 'UC017, UC018, UC022, UC025, UC026'

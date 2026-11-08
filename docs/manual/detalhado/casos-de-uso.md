# Cenários de implementação detalhados

[Índice](README.md). Gerado por [scripts/build-system-handbook.mjs](../../../scripts/build-system-handbook.mjs). Base de código: `6a2bfce`. Comentários explicativos são editoriais; os trechos e modelos vêm dos arquivos indicados.

Os IDs Cxx são recortes técnicos, não casos de uso acadêmicos adicionais. O catálogo acadêmico consolidado contém 24 casos, todos na visão geral do Astah. As regras Rxx estão em [requisitos e regras](requisitos-e-regras.md). Cada fluxo descreve a responsabilidade do sistema; autorização adicional e erros exatos devem ser conferidos na rota e no serviço.

| Caso | Área               | Objetivo                                      |
| ---- | ------------------ | --------------------------------------------- |
| C01  | Conta e acesso     | Criar conta                                   |
| C02  | Conta e acesso     | Confirmar e recuperar acesso                  |
| C03  | Conta e acesso     | Resolver identidade de uma requisição         |
| C04  | Trilhas            | Escolher curso e navegar no percurso          |
| C05  | Trilhas            | Consultar disponibilidade de conhecimentos    |
| C06  | Trilhas            | Abrir lição e conferir pré-requisitos         |
| C07  | Trilhas            | Responder etapa objetiva ou interativa        |
| C08  | Trilhas            | Executar código de lição como prévia          |
| C09  | Trilhas            | Submeter e concluir etapa pela primeira vez   |
| C10  | Trilhas            | Executar exercício persistido                 |
| C11  | Trilhas            | Submeter exercício e atualizar nó             |
| C12  | Trilhas            | Consultar ajuda e registrar assistência       |
| C13  | Trilhas            | Resgatar etapa especial do percurso           |
| C14  | Reconhecimento     | Consultar e emitir credencial elegível        |
| C15  | Reconhecimento     | Verificar credencial pública                  |
| C16  | Reconhecimento     | Gerar PDF de credencial                       |
| C17  | Comunidade         | Criar publicação                              |
| C18  | Comunidade         | Consultar feed e buscar conteúdo              |
| C19  | Comunidade         | Responder e encadear conversa                 |
| C20  | Comunidade         | Reagir a publicação                           |
| C21  | Comunidade         | Salvar e consultar publicação                 |
| C22  | Perfil             | Personalizar identidade e equipar título      |
| C23  | Perfil             | Seguir e consultar sugestões                  |
| C24  | Perfil             | Bloquear conta                                |
| C25  | Recursos pessoais  | Consultar ranking                             |
| C26  | Recursos pessoais  | Consultar e marcar notificações               |
| C27  | Recursos pessoais  | Enviar e consultar mensagem                   |
| C28  | Recursos pessoais  | Alterar configurações                         |
| C29  | Mundinho           | Explorar clareira com personagem              |
| C30  | Mundinho           | Resgatar baú diário e check-in                |
| C31  | Mundinho           | Comprar e equipar item                        |
| C32  | Mundinho           | Enfrentar criatura                            |
| C33  | Mundinho           | Convidar amigo para arena                     |
| C34  | Mundinho           | Sincronizar presença e aparência              |
| C35  | Mundinho           | Disputar PvP com equipamentos                 |
| C36  | Duelos             | Convidar e aceitar duelo competitivo          |
| C37  | Duelos             | Executar e submeter solução competitiva       |
| C38  | Duelos             | Resolver vencedor, empate ou revisão          |
| C39  | Avaliadores        | Solicitar e analisar candidatura              |
| C40  | Avaliadores        | Emitir parecer humano                         |
| C41  | Recrutamento       | Criar empresa e vaga                          |
| C42  | Recrutamento       | Candidatar-se a vaga                          |
| C43  | Recrutamento       | Movimentar candidatura no funil               |
| C44  | Eventos            | Criar evento ou hackathon                     |
| C45  | Eventos            | Inscrever-se e cancelar participação          |
| C46  | Eventos            | Gerenciar desafios de evento                  |
| C47  | Administração      | Administrar e auditar operações               |
| C48  | Mobile             | Usar o domínio pelo aplicativo                |
| C49  | Conteúdo editorial | Importar perfis e threads sem reset           |
| C50  | Quizzes            | Consultar e responder quiz diário             |
| C52  | Comunidade         | Votar em enquete                              |
| C53  | Comunidade         | Denunciar publicação                          |
| C54  | Mídia              | Enviar imagem de perfil ou recurso compatível |

## C01 — Criar conta

**Área:** Conta e acesso. **Ator:** Usuário.

**Pré-condições:** Cadastro disponível e dados válidos.

**Fluxo principal:**

1. Informar os dados de cadastro.
2. Enviar à rota de registro.
3. Validar os campos e tratar identidade no provedor.
4. Preparar a conta para o fluxo de confirmação/acesso.

**Pós-condição de sucesso:** Conta processada conforme confirmação exigida pelo fluxo.

**Alternativas e exceções:** Dados inválidos, conta já existente ou provedor indisponível não equivalem a cadastro confirmado.

**Regras relacionadas:** R01, R02.

**Implementação de referência:** [src/app/api/auth/register/route.ts](../../../src/app/api/auth/register/route.ts). A fonte deve ser lida junto com seu adaptador e controles de acesso; o nome do arquivo não substitui a regra.

## C02 — Confirmar e recuperar acesso

**Área:** Conta e acesso. **Ator:** Titular da conta.

**Pré-condições:** Token ou pedido de recuperação correspondente à própria conta.

**Fluxo principal:**

1. Solicitar confirmação ou recuperação.
2. Processar o link no fluxo autorizado.
3. Conferir token e dados necessários.
4. Concluir acesso ou alteração de senha conforme resultado.

**Pós-condição de sucesso:** Titular recebe resultado do fluxo, sem expor senha anterior.

**Alternativas e exceções:** Token inválido/expirado e falha do provedor devem ter tratamento próprio.

**Regras relacionadas:** R01, R02.

**Implementação de referência:** [src/app/api/auth/reset-password/route.ts](../../../src/app/api/auth/reset-password/route.ts). A fonte deve ser lida junto com seu adaptador e controles de acesso; o nome do arquivo não substitui a regra.

## C03 — Resolver identidade de uma requisição

**Área:** Conta e acesso. **Ator:** Usuário.

**Pré-condições:** Sessão fornecida pelos mecanismos admitidos.

**Fluxo principal:**

1. Ler a sessão.
2. Identificar o usuário no provedor.
3. Carregar o usuário de domínio.
4. Exigir papel quando a operação pedir.

**Pós-condição de sucesso:** Operação utiliza identidade autorizada do servidor.

**Alternativas e exceções:** Ausência de sessão, falta de usuário de domínio e falha de conexão são causas diferentes.

**Regras relacionadas:** R01, R02, R03.

**Implementação de referência:** [src/lib/auth.ts](../../../src/lib/auth.ts). A fonte deve ser lida junto com seu adaptador e controles de acesso; o nome do arquivo não substitui a regra.

## C04 — Escolher curso e navegar no percurso

**Área:** Trilhas. **Ator:** Estudante.

**Pré-condições:** Conteúdo publicado disponível.

**Fluxo principal:**

1. Abrir a área de trilhas.
2. Selecionar o curso.
3. Consultar progresso e caminhos.
4. Abrir a atividade apresentada como acessível.

**Pós-condição de sucesso:** Interface mostra o contexto escolhido e o progresso conhecido.

**Alternativas e exceções:** Preferência de visualização não concede acesso a conteúdo bloqueado.

**Regras relacionadas:** R08, R09, R10.

**Implementação de referência:** [src/app/trails/TrailsContent.tsx](../../../src/app/trails/TrailsContent.tsx). A fonte deve ser lida junto com seu adaptador e controles de acesso; o nome do arquivo não substitui a regra.

## C05 — Consultar disponibilidade de conhecimentos

**Área:** Trilhas. **Ator:** Estudante.

**Pré-condições:** Nós, caminhos e relações carregados.

**Fluxo principal:**

1. Carregar estados persistidos.
2. Consultar requisitos obrigatórios.
3. Derivar disponibilidade/recomendação.
4. Calcular percentual e próximo nó.

**Pós-condição de sucesso:** Estados concluídos legítimos são preservados.

**Alternativas e exceções:** Caminho vazio retorna percentual seguro; requisito ausente não é ignorado por recomendação.

**Regras relacionadas:** R09, R10.

**Implementação de referência:** [src/lib/learning/progress.ts](../../../src/lib/learning/progress.ts). A fonte deve ser lida junto com seu adaptador e controles de acesso; o nome do arquivo não substitui a regra.

## C06 — Abrir lição e conferir pré-requisitos

**Área:** Trilhas. **Ator:** Estudante.

**Pré-condições:** Lição existente no catálogo.

**Fluxo principal:**

1. Identificar a lição.
2. Consultar acertos da lição e pré-requisitos.
3. Permitir revisão de lição já concluída.
4. Liberar acesso ou retornar LESSON_LOCKED.

**Pós-condição de sucesso:** Acesso coerente com o histórico.

**Alternativas e exceções:** ID inexistente e pré-requisito ausente produzem resultados diferentes.

**Regras relacionadas:** R11, R12, R20.

**Implementação de referência:** [src/lib/learning/lesson-progress.ts](../../../src/lib/learning/lesson-progress.ts). A fonte deve ser lida junto com seu adaptador e controles de acesso; o nome do arquivo não substitui a regra.

## C07 — Responder etapa objetiva ou interativa

**Área:** Trilhas. **Ator:** Estudante.

**Pré-condições:** Sessão, lição e etapa elegíveis.

**Fluxo principal:**

1. Enviar stepId e resposta do tipo apropriado.
2. Validar schema e acesso.
3. Aplicar avaliador do tipo de etapa.
4. Submeter para persistência quando solicitado.

**Pós-condição de sucesso:** Resposta recebe feedback e resultado confirmado.

**Alternativas e exceções:** Formato válido pode estar pedagogicamente errado; tokens/lacunas/pares não usam o mesmo critério.

**Regras relacionadas:** R12, R13, R17.

**Implementação de referência:** [src/lib/learning/assessment.ts](../../../src/lib/learning/assessment.ts). A fonte deve ser lida junto com seu adaptador e controles de acesso; o nome do arquivo não substitui a regra.

## C08 — Executar código de lição como prévia

**Área:** Trilhas. **Ator:** Estudante.

**Pré-condições:** Etapa de código com contrato configurado.

**Fluxo principal:**

1. Enviar action run.
2. Conferir acesso.
3. Executar casos públicos ou saída configurada.
4. Retornar feedback com XP zero.

**Pós-condição de sucesso:** Prévia entregue sem conclusão por submissão.

**Alternativas e exceções:** Indisponibilidade do runner gera erro operacional e não altera progresso.

**Regras relacionadas:** R13, R16.

**Implementação de referência:** [src/app/api/lessons/[lessonId]/attempt/route.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.ts). A fonte deve ser lida junto com seu adaptador e controles de acesso; o nome do arquivo não substitui a regra.

## C09 — Submeter e concluir etapa pela primeira vez

**Área:** Trilhas. **Ator:** Estudante.

**Pré-condições:** Resposta avaliada e usuário autorizado.

**Fluxo principal:**

1. Avaliar resposta.
2. Abrir transação e lock por usuário.
3. Consultar tentativa anterior.
4. Registrar primeiro acerto e recompensa elegível.
5. Conferir fechamento da lição e credenciais.

**Pós-condição de sucesso:** Progresso e XP confirmados sem crédito duplicado.

**Alternativas e exceções:** Repetição de acerto mantém XP zero; erro anterior pode ser promovido a acerto.

**Regras relacionadas:** R14, R15, R25.

**Implementação de referência:** [src/lib/learning/lesson-progress.ts](../../../src/lib/learning/lesson-progress.ts). A fonte deve ser lida junto com seu adaptador e controles de acesso; o nome do arquivo não substitui a regra.

## C10 — Executar exercício persistido

**Área:** Trilhas. **Ator:** Estudante.

**Pré-condições:** Acesso ao nó e exercício disponível.

**Fluxo principal:**

1. Carregar workspace público.
2. Escrever solução.
3. Avaliar contra os casos de prévia.
4. Registrar execução e devolver resultado.

**Pós-condição de sucesso:** Execução separada da conclusão.

**Alternativas e exceções:** Ver console não comprova retorno correto; gabaritos ocultos não são devolvidos.

**Regras relacionadas:** R12, R13, R17.

**Implementação de referência:** [src/lib/exercises/repository.ts](../../../src/lib/exercises/repository.ts). A fonte deve ser lida junto com seu adaptador e controles de acesso; o nome do arquivo não substitui a regra.

## C11 — Submeter exercício e atualizar nó

**Área:** Trilhas. **Ator:** Estudante.

**Pré-condições:** Exercício elegível e avaliação válida.

**Fluxo principal:**

1. Executar contrato de submissão.
2. Validar resultado.
3. Registrar submissão sob proteção concorrente.
4. Creditar primeira conclusão.
5. Atualizar progresso do nó.

**Pós-condição de sucesso:** Submissão e efeitos pedagógicos persistidos.

**Alternativas e exceções:** Repetição não duplica primeira conclusão; resultado indisponível não é sucesso.

**Regras relacionadas:** R14, R15, R18, R19.

**Implementação de referência:** [src/lib/exercises/repository.ts](../../../src/lib/exercises/repository.ts). A fonte deve ser lida junto com seu adaptador e controles de acesso; o nome do arquivo não substitui a regra.

## C12 — Consultar ajuda e registrar assistência

**Área:** Trilhas. **Ator:** Estudante.

**Pré-condições:** Modo e recurso de ajuda compatíveis.

**Fluxo principal:**

1. Abrir o workspace.
2. Solicitar a ajuda permitida.
3. Registrar evento correspondente.
4. Continuar tentativa com o mesmo contrato de correção.

**Pós-condição de sucesso:** Assistência registrada sem inventar bônus de XP.

**Alternativas e exceções:** Modo de ajuda não mede por si domínio independente.

**Regras relacionadas:** R18, R19.

**Implementação de referência:** [src/lib/exercises/repository.ts](../../../src/lib/exercises/repository.ts). A fonte deve ser lida junto com seu adaptador e controles de acesso; o nome do arquivo não substitui a regra.

## C13 — Resgatar etapa especial do percurso

**Área:** Trilhas. **Ator:** Estudante.

**Pré-condições:** Requisitos do resgate correspondente satisfeitos.

**Fluxo principal:**

1. Solicitar checkpoint, baú ou salto pela rota própria.
2. Conferir evidências exigidas.
3. Registrar recibo idempotente.
4. Retornar benefício confirmado.

**Pós-condição de sucesso:** Resgate associado à regra específica.

**Alternativas e exceções:** Não usar validação de quiz genérico para responder um recibo de recompensa.

**Regras relacionadas:** R14, R21.

**Implementação de referência:** [src/app/api/trails/chest/route.ts](../../../src/app/api/trails/chest/route.ts). A fonte deve ser lida junto com seu adaptador e controles de acesso; o nome do arquivo não substitui a regra.

## C14 — Consultar e emitir credencial elegível

**Área:** Reconhecimento. **Ator:** Estudante.

**Pré-condições:** Evidências pedagógicas registradas.

**Fluxo principal:**

1. Consultar metas.
2. Reconciliar requisitos em contexto autorizado.
3. Emitir snapshot elegível uma vez.
4. Mostrar coleção e validade.

**Pós-condição de sucesso:** Credencial vinculada às evidências e versão.

**Alternativas e exceções:** XP ou estudo declarado não substitui requisito; leitura pública não emite.

**Regras relacionadas:** R25, R26, R28.

**Implementação de referência:** [src/lib/credentials/repository.ts](../../../src/lib/credentials/repository.ts). A fonte deve ser lida junto com seu adaptador e controles de acesso; o nome do arquivo não substitui a regra.

## C15 — Verificar credencial pública

**Área:** Reconhecimento. **Ator:** Usuário.

**Pré-condições:** Identificador de credencial.

**Fluxo principal:**

1. Consultar identificador.
2. Carregar registro e snapshot.
3. Conferir integridade e revogação.
4. Apresentar validade.

**Pós-condição de sucesso:** Verificação mostra o estado do registro.

**Alternativas e exceções:** ID inválido, ausência, revogação e falha de integridade não são certificados válidos.

**Regras relacionadas:** R25, R26, R27.

**Implementação de referência:** [src/lib/credentials/repository.ts](../../../src/lib/credentials/repository.ts). A fonte deve ser lida junto com seu adaptador e controles de acesso; o nome do arquivo não substitui a regra.

## C16 — Gerar PDF de credencial

**Área:** Reconhecimento. **Ator:** Titular ou usuário sem sessão autorizado pelo fluxo.

**Pré-condições:** Credencial disponível para consulta/geração.

**Fluxo principal:**

1. Solicitar o documento.
2. Carregar definição e dados válidos.
3. Compor PDF, assinatura visual e QR.
4. Devolver documento.

**Pós-condição de sucesso:** PDF corresponde ao registro consultável.

**Alternativas e exceções:** A aparência da assinatura não é uma assinatura criptográfica nem mede horas reais.

**Regras relacionadas:** R25, R27, R28.

**Implementação de referência:** [src/lib/credentials/pdf.ts](../../../src/lib/credentials/pdf.ts). A fonte deve ser lida junto com seu adaptador e controles de acesso; o nome do arquivo não substitui a regra.

## C17 — Criar publicação

**Área:** Comunidade. **Ator:** Usuário.

**Pré-condições:** Sessão e payload válidos; anexos próprios quando usados.

**Fluxo principal:**

1. Compor conteúdo.
2. Enviar com identificação de repetição.
3. Validar propriedade e contrato.
4. Persistir publicação e efeitos.
5. Atualizar tela com resultado.

**Pós-condição de sucesso:** Post criado uma vez para o pedido identificado.

**Alternativas e exceções:** Reenvio com mesmo client_id retorna a publicação existente; anexo incompatível é rejeitado.

**Regras relacionadas:** R29, R30.

**Implementação de referência:** [src/services/post.service.ts](../../../src/services/post.service.ts). A fonte deve ser lida junto com seu adaptador e controles de acesso; o nome do arquivo não substitui a regra.

## C18 — Consultar feed e buscar conteúdo

**Área:** Comunidade. **Ator:** Usuário conforme rota.

**Pré-condições:** Contexto de audiência e filtros definidos.

**Fluxo principal:**

1. Selecionar filtros.
2. Aplicar visibilidade e paginação na consulta.
3. Carregar página limitada.
4. Ordenar/apresentar os resultados e cursor.

**Pós-condição de sucesso:** Página coerente com acesso e consulta.

**Alternativas e exceções:** Bloqueios, audiência e cursor podem explicar item ausente; ID não remove restrições.

**Regras relacionadas:** R02, R07, R29.

**Implementação de referência:** [src/services/post.service.ts](../../../src/services/post.service.ts). A fonte deve ser lida junto com seu adaptador e controles de acesso; o nome do arquivo não substitui a regra.

## C19 — Responder e encadear conversa

**Área:** Comunidade. **Ator:** Usuário.

**Pré-condições:** Publicação acessível e pai válido quando houver.

**Fluxo principal:**

1. Abrir o post.
2. Escrever resposta.
3. Conferir acesso e vínculo com o pai.
4. Persistir resposta e apresentar na conversa.

**Pós-condição de sucesso:** Mensagem vinculada ao post e à sequência correta.

**Alternativas e exceções:** Responder não dá direito de alterar o post; conhecer parent_id não basta.

**Regras relacionadas:** R29, R31.

**Implementação de referência:** [src/app/api/posts/[id]/answer/route.ts](../../../src/app/api/posts/[id]/answer/route.ts). A fonte deve ser lida junto com seu adaptador e controles de acesso; o nome do arquivo não substitui a regra.

## C20 — Reagir a publicação

**Área:** Comunidade. **Ator:** Usuário.

**Pré-condições:** Post acessível e tipo de reação aceito.

**Fluxo principal:**

1. Selecionar reação.
2. Conferir interação e audiência.
3. Criar, trocar ou remover associação.
4. Manter recompensa/reversão consistente.

**Pós-condição de sucesso:** Uma reação por usuário/post no estado atual.

**Alternativas e exceções:** Tipo inválido é rejeitado; repetir o mesmo tipo não cria outro crédito.

**Regras relacionadas:** R29, R32, R33.

**Implementação de referência:** [src/services/reaction.service.ts](../../../src/services/reaction.service.ts). A fonte deve ser lida junto com seu adaptador e controles de acesso; o nome do arquivo não substitui a regra.

## C21 — Salvar e consultar publicação

**Área:** Comunidade. **Ator:** Usuário.

**Pré-condições:** Post acessível no momento da ação.

**Fluxo principal:**

1. Solicitar salvamento.
2. Atualizar associação usuário/post.
3. Consultar itens salvos com controles de acesso.
4. Abrir ou remover referência.

**Pós-condição de sucesso:** Item salvo representa o recurso original.

**Alternativas e exceções:** Excluir ou restringir o post pode impedir acesso posterior.

**Regras relacionadas:** R07, R29, R34.

**Implementação de referência:** [src/app/bookmarks/page.tsx](../../../src/app/bookmarks/page.tsx). A fonte deve ser lida junto com seu adaptador e controles de acesso; o nome do arquivo não substitui a regra.

## C22 — Personalizar identidade e equipar título

**Área:** Perfil. **Ator:** Usuário.

**Pré-condições:** Catálogo e versão de preferências conhecidos.

**Fluxo principal:**

1. Editar campos e aparência.
2. Validar schema e itens disponíveis.
3. Conferir versão e titular.
4. Persistir e apresentar identidade normalizada.

**Pós-condição de sucesso:** Perfil usa configuração autorizada.

**Alternativas e exceções:** Nome estilizado não altera papel; título indisponível não é concedido pelo payload.

**Regras relacionadas:** R03, R28.

**Implementação de referência:** [src/services/profile-customization.service.ts](../../../src/services/profile-customization.service.ts). A fonte deve ser lida junto com seu adaptador e controles de acesso; o nome do arquivo não substitui a regra.

## C23 — Seguir e consultar sugestões

**Área:** Perfil. **Ator:** Usuário.

**Pré-condições:** Outra conta acessível e interação permitida.

**Fluxo principal:**

1. Consultar perfil/sugestões.
2. Solicitar seguir ou deixar de seguir.
3. Conferir bloqueios e regra da relação.
4. Atualizar associação direcional.

**Pós-condição de sucesso:** Relação atualizada sem criar mutualidade fictícia.

**Alternativas e exceções:** Seguir numa direção não torna as contas amigas mútuas.

**Regras relacionadas:** R05, R06.

**Implementação de referência:** [src/services/follow.service.ts](../../../src/services/follow.service.ts). A fonte deve ser lida junto com seu adaptador e controles de acesso; o nome do arquivo não substitui a regra.

## C24 — Bloquear conta

**Área:** Perfil. **Ator:** Usuário.

**Pré-condições:** Identidade do alvo e sessão válidas.

**Fluxo principal:**

1. Solicitar bloqueio.
2. Aplicar regra de interação.
3. Persistir relação de bloqueio.
4. Refletir restrições nos fluxos afetados.

**Pós-condição de sucesso:** Bloqueio influencia consultas e interações.

**Alternativas e exceções:** Ocultar um botão sem filtrar as APIs não implementa a regra.

**Regras relacionadas:** R02, R06.

**Implementação de referência:** [src/services/block.service.ts](../../../src/services/block.service.ts). A fonte deve ser lida junto com seu adaptador e controles de acesso; o nome do arquivo não substitui a regra.

## C25 — Consultar ranking

**Área:** Recursos pessoais. **Ator:** Usuário ou usuário sem sessão conforme superfície.

**Pré-condições:** Métrica, linguagem e período escolhidos.

**Fluxo principal:**

1. Consultar fonte adequada de XP.
2. Aplicar filtros de período/linguagem.
3. Ordenar com desempates.
4. Mostrar posição correspondente.

**Pós-condição de sucesso:** Ranking contextual, reproduzível pela métrica.

**Alternativas e exceções:** Posição geral e posição mensal podem divergir legitimamente.

**Regras relacionadas:** R22, R23, R24.

**Implementação de referência:** [src/lib/learning/rewards.ts](../../../src/lib/learning/rewards.ts). A fonte deve ser lida junto com seu adaptador e controles de acesso; o nome do arquivo não substitui a regra.

## C26 — Consultar e marcar notificações

**Área:** Recursos pessoais. **Ator:** Usuário.

**Pré-condições:** Sessão do destinatário.

**Fluxo principal:**

1. Consultar página de notificações.
2. Aplicar visibilidade e paginação.
3. Marcar leitura na própria lista.
4. Conferir acesso ao abrir destino.

**Pós-condição de sucesso:** Lista/contador refletem registros do destinatário.

**Alternativas e exceções:** Push ausente não prova ausência de registro; notificação não autoriza o recurso.

**Regras relacionadas:** R35, R38.

**Implementação de referência:** [src/services/notification.service.ts](../../../src/services/notification.service.ts). A fonte deve ser lida junto com seu adaptador e controles de acesso; o nome do arquivo não substitui a regra.

## C27 — Enviar e consultar mensagem

**Área:** Recursos pessoais. **Ator:** Usuário.

**Pré-condições:** Destinatário informado e sem bloqueio impeditivo.

**Fluxo principal:**

1. Conferir sessão e limite.
2. Validar interação.
3. Gravar mensagem.
4. Tentar notificação.
5. Consultar histórico entre os dois participantes.

**Pós-condição de sucesso:** Mensagem persistida e histórico privado.

**Alternativas e exceções:** Terceiro não recebe conversa por conhecer ID; notificação pode falhar após gravação.

**Regras relacionadas:** R06, R36, R37, R38.

**Implementação de referência:** [src/app/api/messages/route.ts](../../../src/app/api/messages/route.ts). A fonte deve ser lida junto com seu adaptador e controles de acesso; o nome do arquivo não substitui a regra.

## C28 — Alterar configurações

**Área:** Recursos pessoais. **Ator:** Titular da conta.

**Pré-condições:** Sessão e preferência editável.

**Fluxo principal:**

1. Abrir seção de configuração.
2. Editar e validar dados.
3. Persistir pela API correspondente quando necessário.
4. Sincronizar estado da interface.

**Pós-condição de sucesso:** Preferência passa a valer no escopo implementado.

**Alternativas e exceções:** Tema local não concede autorização nem garante sincronização em todos os dispositivos.

**Regras relacionadas:** R01, R03.

**Implementação de referência:** [src/app/settings/page.tsx](../../../src/app/settings/page.tsx). A fonte deve ser lida junto com seu adaptador e controles de acesso; o nome do arquivo não substitui a regra.

## C29 — Explorar clareira com personagem

**Área:** Mundinho. **Ator:** Jogador.

**Pré-condições:** Estado RPG e aparência carregados.

**Fluxo principal:**

1. Entrar no mundo.
2. Mover no espaço permitido.
3. Aproximar-se de alvo.
4. Interagir com objeto ou criatura.

**Pós-condição de sucesso:** Mundo apresenta interações compatíveis com estado.

**Alternativas e exceções:** Animação e posição local não confirmam recompensa do servidor.

**Regras relacionadas:** R39, R46.

**Implementação de referência:** [src/components/mundinho/World.tsx](../../../src/components/mundinho/World.tsx). A fonte deve ser lida junto com seu adaptador e controles de acesso; o nome do arquivo não substitui a regra.

## C30 — Resgatar baú diário e check-in

**Área:** Mundinho. **Ator:** Jogador.

**Pré-condições:** Sessão e dia calculado pelo servidor.

**Fluxo principal:**

1. Solicitar resgate específico.
2. Conferir recibo/chave do evento.
3. Creditar benefício elegível em transação.
4. Devolver confirmação e atualizar visual.

**Pós-condição de sucesso:** Um crédito por origem elegível.

**Alternativas e exceções:** Baú repetido no mesmo dia não duplica 10 moedas; check-in tem ciclo distinto.

**Regras relacionadas:** R40, R41, R42, R43.

**Implementação de referência:** [src/lib/mundinho/repository.ts](../../../src/lib/mundinho/repository.ts). A fonte deve ser lida junto com seu adaptador e controles de acesso; o nome do arquivo não substitui a regra.

## C31 — Comprar e equipar item

**Área:** Mundinho. **Ator:** Jogador.

**Pré-condições:** Item de catálogo e saldo/posse suficientes.

**Fluxo principal:**

1. Escolher item.
2. Conferir catálogo, preço e inventário.
3. Aplicar compra ou equipar slot compatível.
4. Recalcular estatísticas autorizadas.

**Pós-condição de sucesso:** Saldo, posse e bônus coerentes.

**Alternativas e exceções:** Preço ou inventário enviados livremente pelo cliente não concedem vantagem.

**Regras relacionadas:** R44, R45, R48, R49, R50.

**Implementação de referência:** [src/lib/mundinho/equipment.ts](../../../src/lib/mundinho/equipment.ts). A fonte deve ser lida junto com seu adaptador e controles de acesso; o nome do arquivo não substitui a regra.

## C32 — Enfrentar criatura

**Área:** Mundinho. **Ator:** Jogador.

**Pré-condições:** Nível e encontro elegíveis.

**Fluxo principal:**

1. Selecionar criatura.
2. Persistir nível e vida do encontro.
3. Escolher golpe e resolver exercício quando sorteado.
4. Aplicar dano/efeitos e resultado.

**Pós-condição de sucesso:** Batalha usa o mesmo nível apresentado no mapa.

**Alternativas e exceções:** Erro/indisponibilidade seguem regras distintas; chefe não deve herdar nível do jogador.

**Regras relacionadas:** R46, R47, R48, R49.

**Implementação de referência:** [src/lib/mundinho/repository.ts](../../../src/lib/mundinho/repository.ts). A fonte deve ser lida junto com seu adaptador e controles de acesso; o nome do arquivo não substitui a regra.

## C33 — Convidar amigo para arena

**Área:** Mundinho. **Ator:** Jogador e amigo mútuo.

**Pré-condições:** Relações mútuas e ausência de bloqueio.

**Fluxo principal:**

1. Entrar pelo portal.
2. Abrir pop-up e selecionar amigo.
3. Criar convite com validade.
4. Convidado aceita e entra na sala.

**Pós-condição de sucesso:** Sala privada com participantes autorizados.

**Alternativas e exceções:** Convite expirado, amizade removida ou bloqueio impedem a operação.

**Regras relacionadas:** R05, R51, R52.

**Implementação de referência:** [src/lib/mundinho/arena.ts](../../../src/lib/mundinho/arena.ts). A fonte deve ser lida junto com seu adaptador e controles de acesso; o nome do arquivo não substitui a regra.

## C34 — Sincronizar presença e aparência

**Área:** Mundinho. **Ator:** Dois jogadores.

**Pré-condições:** Sala acessível e identidades válidas.

**Fluxo principal:**

1. Enviar snapshot de posição.
2. Conferir limites e participação.
3. Derivar aparência do banco.
4. Aplicar somente versão mais nova no cliente.

**Pós-condição de sucesso:** Cada jogador vê nome e roupas autorizadas do outro.

**Alternativas e exceções:** Pacote de movimento não pode forjar identidade; resposta velha é descartada.

**Regras relacionadas:** R52, R60.

**Implementação de referência:** [src/lib/mundinho/arena-rules.ts](../../../src/lib/mundinho/arena-rules.ts). A fonte deve ser lida junto com seu adaptador e controles de acesso; o nome do arquivo não substitui a regra.

## C35 — Disputar PvP com equipamentos

**Área:** Mundinho. **Ator:** Dois jogadores.

**Pré-condições:** Ambos confirmaram e bônus foram capturados.

**Fluxo principal:**

1. Sortear ator inicial.
2. Escolher golpe no próprio turno.
3. Resolver golpe direto ou exercício travado.
4. Aplicar efeitos e alternar.
5. Encerrar ou aguardar turno seguinte.

**Pós-condição de sucesso:** Resultado consistente com vida, proteção, cura e desgaste.

**Alternativas e exceções:** Repetir ataque não refaz chance; submissão atrasada não repete dano.

**Regras relacionadas:** R53, R54, R55, R56, R57, R58, R59.

**Implementação de referência:** [src/lib/mundinho/arena-rules.ts](../../../src/lib/mundinho/arena-rules.ts). A fonte deve ser lida junto com seu adaptador e controles de acesso; o nome do arquivo não substitui a regra.

## C36 — Convidar e aceitar duelo competitivo

**Área:** Duelos. **Ator:** Dois usuários.

**Pré-condições:** Convite/partida compatível com estado e política.

**Fluxo principal:**

1. Enviar convite.
2. Aguardar resposta dentro da validade.
3. Aceitar e iniciar compromisso.
4. Resolver expiração/publicação opcional conforme regra.

**Pós-condição de sucesso:** Duelo entra no ciclo apropriado.

**Alternativas e exceções:** Recusa/expiração do convite não é abandono de partida aceita.

**Regras relacionadas:** R61, R62, R71.

**Implementação de referência:** [src/services/duel.service.ts](../../../src/services/duel.service.ts). A fonte deve ser lida junto com seu adaptador e controles de acesso; o nome do arquivo não substitui a regra.

## C37 — Executar e submeter solução competitiva

**Área:** Duelos. **Ator:** Participante do duelo.

**Pré-condições:** Partida ativa e usuário participante.

**Fluxo principal:**

1. Escrever solução.
2. Testar como prévia.
3. Submeter pelo endpoint de solução.
4. Registrar avaliação e considerar melhor submissão.

**Pós-condição de sucesso:** Resultado competitivo passa pelo juiz e pela política.

**Alternativas e exceções:** Terceiro, prazo encerrado e juiz indisponível não são solução aceita.

**Regras relacionadas:** R63, R64.

**Implementação de referência:** [src/lib/duels/judge.ts](../../../src/lib/duels/judge.ts). A fonte deve ser lida junto com seu adaptador e controles de acesso; o nome do arquivo não substitui a regra.

## C38 — Resolver vencedor, empate ou revisão

**Área:** Duelos. **Ator:** Serviço de resolução.

**Pré-condições:** Resultados ou prazo elegíveis para encerramento.

**Fluxo principal:**

1. Escolher submissões representativas.
2. Comparar correção e critérios ordenados.
3. Decidir fechamento ou revisão.
4. Persistir estado e crédito único.

**Pós-condição de sucesso:** Resultado registrado uma vez.

**Alternativas e exceções:** Sintaxe normalizada igual leva a revisão; runtime isolado não escolhe vencedor.

**Regras relacionadas:** R64, R65, R66, R67, R68, R69, R70.

**Implementação de referência:** [src/lib/duels/resolution-policy.ts](../../../src/lib/duels/resolution-policy.ts). A fonte deve ser lida junto com seu adaptador e controles de acesso; o nome do arquivo não substitui a regra.

## C39 — Solicitar e analisar candidatura

**Área:** Avaliadores. **Ator:** Candidato e administrador.

**Pré-condições:** Evidências e motivação compatíveis.

**Fluxo principal:**

1. Conferir elegibilidade.
2. Registrar candidatura com tecnologias.
3. Administrador analisa com justificativa.
4. Atualizar registros e situação.

**Pós-condição de sucesso:** Acesso de avaliador segue processo autorizado.

**Alternativas e exceções:** Bio ou edição genérica de papel não substitui aprovação válida.

**Regras relacionadas:** R03, R72, R75.

**Implementação de referência:** [src/services/evaluator.service.ts](../../../src/services/evaluator.service.ts). A fonte deve ser lida junto com seu adaptador e controles de acesso; o nome do arquivo não substitui a regra.

## C40 — Emitir parecer humano

**Área:** Avaliadores. **Ator:** Avaliador autorizado.

**Pré-condições:** Revisão pendente, tecnologia e ausência de conflito.

**Fluxo principal:**

1. Conferir papel/situação.
2. Conferir participantes e tecnologia.
3. Validar notas e feedback.
4. Persistir parecer e recompensa prevista.

**Pós-condição de sucesso:** Parecer autorizado registrado.

**Alternativas e exceções:** Participante, suspenso ou tecnologia incompatível não pode avaliar o caso.

**Regras relacionadas:** R73, R74, R75.

**Implementação de referência:** [src/services/evaluator.service.ts](../../../src/services/evaluator.service.ts). A fonte deve ser lida junto com seu adaptador e controles de acesso; o nome do arquivo não substitui a regra.

## C41 — Criar empresa e vaga

**Área:** Recrutamento. **Ator:** Gestor autorizado.

**Pré-condições:** Conta e acesso à empresa conforme fluxo.

**Fluxo principal:**

1. Criar/selecionar empresa.
2. Conferir acesso.
3. Definir vaga e etapas.
4. Persistir oportunidade.

**Pós-condição de sucesso:** Vaga vinculada à empresa do gestor.

**Alternativas e exceções:** Criar empresa não dá acesso à de outro recrutador.

**Regras relacionadas:** R04, R79.

**Implementação de referência:** [src/services/job.service.ts](../../../src/services/job.service.ts). A fonte deve ser lida junto com seu adaptador e controles de acesso; o nome do arquivo não substitui a regra.

## C42 — Candidatar-se a vaga

**Área:** Recrutamento. **Ator:** Candidato.

**Pré-condições:** Vaga aberta e sem candidatura anterior.

**Fluxo principal:**

1. Consultar vaga.
2. Enviar candidatura.
3. Conferir estado e unicidade.
4. Criar APPLIED e etapa inicial.

**Pós-condição de sucesso:** Candidatura vinculada à pessoa e vaga.

**Alternativas e exceções:** Vaga fechada/inexistente e duplicata são rejeitadas.

**Regras relacionadas:** R76, R77, R78.

**Implementação de referência:** [src/services/job.service.ts](../../../src/services/job.service.ts). A fonte deve ser lida junto com seu adaptador e controles de acesso; o nome do arquivo não substitui a regra.

## C43 — Movimentar candidatura no funil

**Área:** Recrutamento. **Ator:** Recrutador ou administrador.

**Pré-condições:** Acesso à empresa e candidatura existente.

**Fluxo principal:**

1. Consultar candidatos autorizados.
2. Escolher etapa/status.
3. Gravar mudança e auditoria.
4. Tentar notificar candidato.

**Pós-condição de sucesso:** Funil confirmado sem expor feedback privado na listagem pública.

**Alternativas e exceções:** Falha de push não implica rollback; etapa de outra vaga não deve ser aceita pela fronteira.

**Regras relacionadas:** R04, R79, R80.

**Implementação de referência:** [src/services/job.service.ts](../../../src/services/job.service.ts). A fonte deve ser lida junto com seu adaptador e controles de acesso; o nome do arquivo não substitui a regra.

## C44 — Criar evento ou hackathon

**Área:** Eventos. **Ator:** Gestor autorizado no fluxo.

**Pré-condições:** Dados e vínculo organizacional admitidos pela rota.

**Fluxo principal:**

1. Definir tipo, datas, capacidade e nível.
2. Validar autorização.
3. Persistir evento.
4. Consultar status efetivo.

**Pós-condição de sucesso:** Evento consultável com regras declaradas.

**Alternativas e exceções:** Tipo hackathon não cria automaticamente equipes e juiz de submissões.

**Regras relacionadas:** R83, R84, R87.

**Implementação de referência:** [src/services/event.service.ts](../../../src/services/event.service.ts). A fonte deve ser lida junto com seu adaptador e controles de acesso; o nome do arquivo não substitui a regra.

## C45 — Inscrever-se e cancelar participação

**Área:** Eventos. **Ator:** Usuário.

**Pré-condições:** Evento elegível e acesso válido.

**Fluxo principal:**

1. Consultar participação.
2. Serializar nova inscrição por evento.
3. Conferir encerramento/capacidade/nível.
4. Criar participação ou cancelar conforme regra.

**Pós-condição de sucesso:** Participação única e capacidade preservada.

**Alternativas e exceções:** Repetir inscrição devolve existente; evento lotado/encerrado rejeita nova participação.

**Regras relacionadas:** R81, R82, R83, R84.

**Implementação de referência:** [src/services/event.service.ts](../../../src/services/event.service.ts). A fonte deve ser lida junto com seu adaptador e controles de acesso; o nome do arquivo não substitui a regra.

## C46 — Gerenciar desafios de evento

**Área:** Eventos. **Ator:** Criador ou administrador autorizado.

**Pré-condições:** Evento editável e conjunto dentro dos limites.

**Fluxo principal:**

1. Validar gestor.
2. Validar 3–20 desafios e seus exemplos.
3. Substituir conjunto em transação.
4. Ocultar respostas esperadas de não gestores.

**Pós-condição de sucesso:** Conjunto ordenado e protegido.

**Alternativas e exceções:** Evento encerrado ou conjunto fora dos limites não é aceito.

**Regras relacionadas:** R85, R86, R87.

**Implementação de referência:** [src/services/event-challenge.service.ts](../../../src/services/event-challenge.service.ts). A fonte deve ser lida junto com seu adaptador e controles de acesso; o nome do arquivo não substitui a regra.

## C47 — Administrar e auditar operações

**Área:** Administração. **Ator:** Administrador.

**Pré-condições:** Papel e recurso elegíveis.

**Fluxo principal:**

1. Abrir painel.
2. Conferir autorização da operação.
3. Aplicar gestão permitida.
4. Registrar auditoria sensível.

**Pós-condição de sucesso:** Alteração rastreável.

**Alternativas e exceções:** Edição de papel não deve contornar processo de avaliador.

**Regras relacionadas:** R02, R03.

**Implementação de referência:** [src/services/admin.service.ts](../../../src/services/admin.service.ts). A fonte deve ser lida junto com seu adaptador e controles de acesso; o nome do arquivo não substitui a regra.

## C48 — Usar o domínio pelo aplicativo

**Área:** Mobile. **Ator:** Usuário mobile.

**Pré-condições:** Sessão e versão compatíveis; rede para operações remotas.

**Fluxo principal:**

1. Abrir recurso no aplicativo.
2. Encaminhar operação pela API/ponte.
3. Aplicar regras do servidor.
4. Atualizar apresentação nativa ou embarcada.

**Pós-condição de sucesso:** Cliente reflete resposta do mesmo domínio.

**Alternativas e exceções:** Arte embarcada não torna saldo ou PvP offline.

**Regras relacionadas:** R01, R39, R51.

**Implementação de referência:** [apps/mobile/src/mundinho/AdventureScreen.tsx](../../../apps/mobile/src/mundinho/AdventureScreen.tsx). A fonte deve ser lida junto com seu adaptador e controles de acesso; o nome do arquivo não substitui a regra.

## C49 — Importar perfis e threads sem reset

**Área:** Conteúdo editorial. **Ator:** Operador autorizado.

**Pré-condições:** Credenciais locais e nomes reservados sem conflito.

**Fluxo principal:**

1. Consultar plano.
2. Provisionar só identidades faltantes.
3. Aplicar coleção em transação com IDs estáveis.
4. Conferir quantidades e visibilidade.

**Pós-condição de sucesso:** Coleção atualizada sem duplicar ou apagar comunidade.

**Alternativas e exceções:** Colisão com conta comum interrompe; seed destrutivo é outro comando.

**Regras relacionadas:** R88.

**Implementação de referência:** [prisma/demo-community/publish.ts](../../../prisma/demo-community/publish.ts). A fonte deve ser lida junto com seu adaptador e controles de acesso; o nome do arquivo não substitui a regra.

## C50 — Consultar e responder quiz diário

**Área:** Quizzes. **Ator:** Usuário.

**Pré-condições:** Questão diária disponível para o período.

**Fluxo principal:**

1. Obter questão do dia.
2. Conferir acesso ao conteúdo relacionado.
3. Enviar alternativa.
4. Validar acerto e primeira tentativa conforme contrato.

**Pós-condição de sucesso:** Tentativa registrada com recompensa elegível.

**Alternativas e exceções:** Dia UTC do quiz não é o dia de São Paulo usado no baú; conteúdo privado não alimenta o quiz público.

**Regras relacionadas:** R12, R14, R89.

**Implementação de referência:** [src/services/daily-quiz.service.ts](../../../src/services/daily-quiz.service.ts). A fonte deve ser lida junto com seu adaptador e controles de acesso; o nome do arquivo não substitui a regra.

## C52 — Votar em enquete

**Área:** Comunidade. **Ator:** Usuário.

**Pré-condições:** Post acessível e enquete válida.

**Fluxo principal:**

1. Abrir enquete.
2. Escolher opção.
3. Validar voto e vínculo da opção.
4. Persistir e apresentar contagem.

**Pós-condição de sucesso:** Voto pertence à opção correta e ao votante autorizado.

**Alternativas e exceções:** Reações do post não são votos de enquete; consultar a rota para mudança/fechamento.

**Regras relacionadas:** R29, R91.

**Implementação de referência:** [src/app/api/posts/[id]/poll/route.ts](../../../src/app/api/posts/[id]/poll/route.ts). A fonte deve ser lida junto com seu adaptador e controles de acesso; o nome do arquivo não substitui a regra.

## C53 — Denunciar publicação

**Área:** Comunidade. **Ator:** Usuário.

**Pré-condições:** Post e motivo admitidos pelo fluxo.

**Fluxo principal:**

1. Identificar conteúdo.
2. Enviar denúncia.
3. Conferir contrato e identidade.
4. Registrar para consulta administrativa.

**Pós-condição de sucesso:** Denúncia disponível para a gestão autorizada.

**Alternativas e exceções:** Denunciar não concede ao denunciante direito de apagar a publicação.

**Regras relacionadas:** R02, R92.

**Implementação de referência:** [src/app/api/posts/[id]/report/route.ts](../../../src/app/api/posts/[id]/report/route.ts). A fonte deve ser lida junto com seu adaptador e controles de acesso; o nome do arquivo não substitui a regra.

## C54 — Enviar imagem de perfil ou recurso compatível

**Área:** Mídia. **Ator:** Usuário.

**Pré-condições:** Sessão e arquivo aceito pela rota de upload.

**Fluxo principal:**

1. Enviar multipart.
2. Conferir tamanho e tipo.
3. Validar assinatura do arquivo e processamento.
4. Persistir no armazenamento e devolver referência.

**Pós-condição de sucesso:** Referência de mídia após envio processado.

**Alternativas e exceções:** MIME declarado não basta; esta rota aceita raster e limite próprio, não todo tipo de anexo.

**Regras relacionadas:** R02, R93.

**Implementação de referência:** [src/app/api/upload/route.ts](../../../src/app/api/upload/route.ts). A fonte deve ser lida junto com seu adaptador e controles de acesso; o nome do arquivo não substitui a regra.


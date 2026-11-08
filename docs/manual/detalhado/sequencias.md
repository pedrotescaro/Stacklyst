# Sequências e responsabilidades em português

Os participantes, mensagens e condições são apresentados em português. Os nomes reais de funções e arquivos aparecem apenas na correspondência com o código. As chamadas e notas de resposta são elementos editáveis no Astah. A leitura completa inclui sucesso, alternativas e falhas descritos no catálogo e nas condições de cada sequência.

## SQ01 — Submeter etapa de lição

![Submeter etapa de lição](../../laboratorio-engenharia-software/revisao-seminario-2026-11-03/diagramas/astah-export/Stacklyst-modelos-atualizados/04%20Sequ%C3%AAncias%20e%20recortes/SQ01%20Submeter%20etapa%20de%20li%C3%A7%C3%A3o.png)

Participantes: Estudante, Interface da lição, Rota de tentativa, Avaliador da atividade, Serviço de progresso, Banco de dados.

Condições e contexto: Condição: Executor indisponível; Alternativa: modo de teste; Alternativa: envio para confirmação; Condição: Primeiro acerto elegível; Alternativa: Repetição ou erro.

O cenário e as regras são detalhados no [catálogo consolidado](catalogo-academico.md) e no [caderno de código comentado](codigo-comentado.md).

## SQ02 — Executar e submeter exercício

![Executar e submeter exercício](../../laboratorio-engenharia-software/revisao-seminario-2026-11-03/diagramas/astah-export/Stacklyst-modelos-atualizados/04%20Sequ%C3%AAncias%20e%20recortes/SQ02%20Executar%20e%20submeter%20exerc%C3%ADcio.png)

Participantes: Estudante, Rota do exercício, Repositório, Avaliador de casos, Executor, Banco de dados.

Condições e contexto: Condição: Prévia; Alternativa: Submissao valida para Persistência.

O cenário e as regras são detalhados no [catálogo consolidado](catalogo-academico.md) e no [caderno de código comentado](codigo-comentado.md).

## SQ03 — Reconciliar e verificar credencial

![Reconciliar e verificar credencial](../../laboratorio-engenharia-software/revisao-seminario-2026-11-03/diagramas/astah-export/Stacklyst-modelos-atualizados/04%20Sequ%C3%AAncias%20e%20recortes/SQ03%20Reconciliar%20e%20verificar%20credencial.png)

Participantes: Titular, Fluxo de credenciais, Repositório de credenciais, Banco de dados, Usuário.

O cenário e as regras são detalhados no [catálogo consolidado](catalogo-academico.md) e no [caderno de código comentado](codigo-comentado.md).

## SQ04 — Publicar e consultar fluxo de publicações

![Publicar e consultar fluxo de publicações](../../laboratorio-engenharia-software/revisao-seminario-2026-11-03/diagramas/astah-export/Stacklyst-modelos-atualizados/04%20Sequ%C3%AAncias%20e%20recortes/SQ04%20Publicar%20e%20consultar%20fluxo%20de%20publica%C3%A7%C3%B5es.png)

Participantes: Autor, Editor, Rota de publicações, Serviço de publicações, Banco de dados.

Condições e contexto: Condição: Pedido repetido; Alternativa: Novo pedido.

O cenário e as regras são detalhados no [catálogo consolidado](catalogo-academico.md) e no [caderno de código comentado](codigo-comentado.md).

## SQ05 — Enviar mensagem e recuperar histórico

![Enviar mensagem e recuperar histórico](../../laboratorio-engenharia-software/revisao-seminario-2026-11-03/diagramas/astah-export/Stacklyst-modelos-atualizados/04%20Sequ%C3%AAncias%20e%20recortes/SQ05%20Enviar%20mensagem%20e%20recuperar%20hist%C3%B3rico.png)

Participantes: Remetente, Rota de mensagens, Controle de bloqueios, Banco de dados, Serviço de notificações.

Condições e contexto: Condição: Falha posterior de notificacao; Alternativa: Notificacao criada.

O cenário e as regras são detalhados no [catálogo consolidado](catalogo-academico.md) e no [caderno de código comentado](codigo-comentado.md).

## SQ06 — Resgatar baú diário

![Resgatar baú diário](../../laboratorio-engenharia-software/revisao-seminario-2026-11-03/diagramas/astah-export/Stacklyst-modelos-atualizados/04%20Sequ%C3%AAncias%20e%20recortes/SQ06%20Resgatar%20ba%C3%BA%20di%C3%A1rio.png)

Participantes: Jogador, Interface do mundo, Rota do mundo, Serviço do mundo, Banco de dados.

Condições e contexto: Condição: Recibo novo elegível; Alternativa: Ja resgatado.

O cenário e as regras são detalhados no [catálogo consolidado](catalogo-academico.md) e no [caderno de código comentado](codigo-comentado.md).

## SQ07 — Convidar e entrar na arena

![Convidar e entrar na arena](../../laboratorio-engenharia-software/revisao-seminario-2026-11-03/diagramas/astah-export/Stacklyst-modelos-atualizados/04%20Sequ%C3%AAncias%20e%20recortes/SQ07%20Convidar%20e%20entrar%20na%20arena.png)

Participantes: Anfitrião, Rota da arena, Banco de dados, Amigo.

Condições e contexto: Condição: Admissao elegível; Alternativa: Convite ou acesso invalido.

O cenário e as regras são detalhados no [catálogo consolidado](catalogo-academico.md) e no [caderno de código comentado](codigo-comentado.md).

## SQ08 — Turno entre jogadores com exercício

![Turno entre jogadores com exercício](../../laboratorio-engenharia-software/revisao-seminario-2026-11-03/diagramas/astah-export/Stacklyst-modelos-atualizados/04%20Sequ%C3%AAncias%20e%20recortes/SQ08%20Turno%20entre%20jogadores%20com%20exerc%C3%ADcio.png)

Participantes: Jogador, Interface da arena, Serviço da arena, Regras puras, Executor, Banco de dados.

Condições e contexto: Condição: Golpe direto; Alternativa: Exercicio necessario; Condição: Submissao ainda elegível; Alternativa: Turno mudou ou apenas prévia.

O cenário e as regras são detalhados no [catálogo consolidado](catalogo-academico.md) e no [caderno de código comentado](codigo-comentado.md).

## SQ09 — Julgar e encerrar duelo competitivo

![Julgar e encerrar duelo competitivo](../../laboratorio-engenharia-software/revisao-seminario-2026-11-03/diagramas/astah-export/Stacklyst-modelos-atualizados/04%20Sequ%C3%AAncias%20e%20recortes/SQ09%20Julgar%20e%20encerrar%20duelo%20competitivo.png)

Participantes: Participante, Rota de solução, Juiz e executor, Política de resolucao, Persistência da decisão, Banco de dados.

Condições e contexto: Condição: Exige revisao humana; Alternativa: Fechamento automatico ou de prazo.

O cenário e as regras são detalhados no [catálogo consolidado](catalogo-academico.md) e no [caderno de código comentado](codigo-comentado.md).

## SQ10 — Emitir parecer humano

![Emitir parecer humano](../../laboratorio-engenharia-software/revisao-seminario-2026-11-03/diagramas/astah-export/Stacklyst-modelos-atualizados/04%20Sequ%C3%AAncias%20e%20recortes/SQ10%20Emitir%20parecer%20humano.png)

Participantes: Avaliador, Adaptador de avaliação, Serviço de avaliadores, Banco de dados.

Condições e contexto: Condição: Não autorizado; Alternativa: Contrato elegível.

O cenário e as regras são detalhados no [catálogo consolidado](catalogo-academico.md) e no [caderno de código comentado](codigo-comentado.md).

## SQ11 — Candidatar e mover no recrutamento

![Candidatar e mover no recrutamento](../../laboratorio-engenharia-software/revisao-seminario-2026-11-03/diagramas/astah-export/Stacklyst-modelos-atualizados/04%20Sequ%C3%AAncias%20e%20recortes/SQ11%20Candidatar%20e%20mover%20no%20recrutamento.png)

Participantes: Candidato, Rotas de vagas, Serviço de vagas, Banco de dados, Gestor, conferir acesso à empresa.

O cenário e as regras são detalhados no [catálogo consolidado](catalogo-academico.md) e no [caderno de código comentado](codigo-comentado.md).

## SQ12 — Inscrever em evento com limite

![Inscrever em evento com limite](../../laboratorio-engenharia-software/revisao-seminario-2026-11-03/diagramas/astah-export/Stacklyst-modelos-atualizados/04%20Sequ%C3%AAncias%20e%20recortes/SQ12%20Inscrever%20em%20evento%20com%20limite.png)

Participantes: Usuário, Rota de inscrição, Serviço de eventos, Banco de dados.

Condições e contexto: Condição: Ja participa; Alternativa: Encerrado, lotado ou nivel insuficiente; Alternativa: Elegível.

O cenário e as regras são detalhados no [catálogo consolidado](catalogo-academico.md) e no [caderno de código comentado](codigo-comentado.md).

## SQ01-A — Receber e avaliar resposta

![Receber e avaliar resposta](../../laboratorio-engenharia-software/revisao-seminario-2026-11-03/diagramas/astah-export/Stacklyst-modelos-atualizados/04%20Sequ%C3%AAncias%20e%20recortes/SQ01-A%20Receber%20e%20avaliar%20resposta.png)

Participantes: Interface, Rota da aplicação, Controle de acesso, Avaliador da atividade.

Condições e contexto: Recorte da sequência; consulte a correspondência com o código..

O cenário e as regras são detalhados no [catálogo consolidado](catalogo-academico.md) e no [caderno de código comentado](codigo-comentado.md).

## SQ01-B — Separar prévia de submissão

![Separar prévia de submissão](../../laboratorio-engenharia-software/revisao-seminario-2026-11-03/diagramas/astah-export/Stacklyst-modelos-atualizados/04%20Sequ%C3%AAncias%20e%20recortes/SQ01-B%20Separar%20pr%C3%A9via%20de%20submiss%C3%A3o.png)

Participantes: Rota da aplicação, Interface, Serviço de progresso.

Condições e contexto: Recorte da sequência; consulte a correspondência com o código..

O cenário e as regras são detalhados no [catálogo consolidado](catalogo-academico.md) e no [caderno de código comentado](codigo-comentado.md).

## SQ01-C — Creditar primeira conclusão

![Creditar primeira conclusão](../../laboratorio-engenharia-software/revisao-seminario-2026-11-03/diagramas/astah-export/Stacklyst-modelos-atualizados/04%20Sequ%C3%AAncias%20e%20recortes/SQ01-C%20Creditar%20primeira%20conclus%C3%A3o.png)

Participantes: Serviço de progresso, Banco de dados.

Condições e contexto: Recorte da sequência; consulte a correspondência com o código..

O cenário e as regras são detalhados no [catálogo consolidado](catalogo-academico.md) e no [caderno de código comentado](codigo-comentado.md).

## SQ11-A — Autorizar publicação de vaga

![Autorizar publicação de vaga](../../laboratorio-engenharia-software/revisao-seminario-2026-11-03/diagramas/astah-export/Stacklyst-modelos-atualizados/04%20Sequ%C3%AAncias%20e%20recortes/SQ11-A%20Autorizar%20publica%C3%A7%C3%A3o%20de%20vaga.png)

Participantes: Interface, Rota da aplicação, Controle de acesso, Serviço de vagas.

Condições e contexto: Recorte da sequência; consulte a correspondência com o código..

O cenário e as regras são detalhados no [catálogo consolidado](catalogo-academico.md) e no [caderno de código comentado](codigo-comentado.md).

## SQ11-B — Gravar vaga e etapas

![Gravar vaga e etapas](../../laboratorio-engenharia-software/revisao-seminario-2026-11-03/diagramas/astah-export/Stacklyst-modelos-atualizados/04%20Sequ%C3%AAncias%20e%20recortes/SQ11-B%20Gravar%20vaga%20e%20etapas.png)

Participantes: Serviço de vagas, Banco de dados.

Condições e contexto: Recorte da sequência; consulte a correspondência com o código..

O cenário e as regras são detalhados no [catálogo consolidado](catalogo-academico.md) e no [caderno de código comentado](codigo-comentado.md).

## SQ11-C — Confirmar publicação

![Confirmar publicação](../../laboratorio-engenharia-software/revisao-seminario-2026-11-03/diagramas/astah-export/Stacklyst-modelos-atualizados/04%20Sequ%C3%AAncias%20e%20recortes/SQ11-C%20Confirmar%20publica%C3%A7%C3%A3o.png)

Participantes: Interface, Rota da aplicação.

Condições e contexto: Recorte da sequência; consulte a correspondência com o código..

O cenário e as regras são detalhados no [catálogo consolidado](catalogo-academico.md) e no [caderno de código comentado](codigo-comentado.md).

## SQ11-D — Registrar candidatura

![Registrar candidatura](../../laboratorio-engenharia-software/revisao-seminario-2026-11-03/diagramas/astah-export/Stacklyst-modelos-atualizados/04%20Sequ%C3%AAncias%20e%20recortes/SQ11-D%20Registrar%20candidatura.png)

Participantes: Rota da aplicação, Serviço de vagas, Banco de dados.

Condições e contexto: Recorte da sequência; consulte a correspondência com o código..

O cenário e as regras são detalhados no [catálogo consolidado](catalogo-academico.md) e no [caderno de código comentado](codigo-comentado.md).

## SQ11-E — Conferir gestão da candidatura

![Conferir gestão da candidatura](../../laboratorio-engenharia-software/revisao-seminario-2026-11-03/diagramas/astah-export/Stacklyst-modelos-atualizados/04%20Sequ%C3%AAncias%20e%20recortes/SQ11-E%20Conferir%20gest%C3%A3o%20da%20candidatura.png)

Participantes: Rota da aplicação, Controle de acesso, Banco de dados, Serviço de vagas.

Condições e contexto: Recorte da sequência; consulte a correspondência com o código..

O cenário e as regras são detalhados no [catálogo consolidado](catalogo-academico.md) e no [caderno de código comentado](codigo-comentado.md).

## SQ11-F — Atualizar e notificar

![Atualizar e notificar](../../laboratorio-engenharia-software/revisao-seminario-2026-11-03/diagramas/astah-export/Stacklyst-modelos-atualizados/04%20Sequ%C3%AAncias%20e%20recortes/SQ11-F%20Atualizar%20e%20notificar.png)

Participantes: Serviço de vagas, Banco de dados, Serviço de notificações, Rota da aplicação.

Condições e contexto: Recorte da sequência; consulte a correspondência com o código..

O cenário e as regras são detalhados no [catálogo consolidado](catalogo-academico.md) e no [caderno de código comentado](codigo-comentado.md).

## SQ13 — Publicar vaga da empresa

![Publicar vaga da empresa](../../laboratorio-engenharia-software/revisao-seminario-2026-11-03/diagramas/astah-export/Stacklyst-modelos-atualizados/04%20Sequ%C3%AAncias%20e%20recortes/SQ13%20Publicar%20vaga%20da%20empresa.png)

Participantes: Recrutador, Painel do recrutador, Rota de publicação de vaga, Controle de autorização, Banco de dados.

Condições e contexto: Sem sessão: negar acesso; Sem papel ou vínculo: negar publicação; Payload inválido: devolver validação sem criar vaga.

O cenário e as regras são detalhados no [catálogo consolidado](catalogo-academico.md) e no [caderno de código comentado](codigo-comentado.md).

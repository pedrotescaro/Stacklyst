# Comunidade, identidade e recursos pessoais

## Página inicial e feed

A raiz pública e o feed autenticado são superfícies diferentes. `src/app/page.tsx` resolve identidade inicial para `HomeClient`. A área de feed reúne publicações e filtros. A escolha de uma tela pelo cliente não substitui acesso autenticado onde ele é exigido.

[PostService](../../../src/services/post.service.ts) organiza criação e consultas. Na criação, a combinação autor/`client_id` permite reconhecer um pedido repetido. Recursos de mídia são conferidos contra registros do proprietário: uma URL arbitrária não deve equivaler a upload autorizado.

O serviço cria o post e seus efeitos de banco; a interface deve tratar espera, erro e resposta confirmada. Salvar a prévia de uma imagem no estado React não significa que o arquivo terminou de ser enviado ou está disponível para publicação.

## Consultas e personalização

`getFeed` aceita busca, linguagem, autor, filtro de seguidos, ordenação, cursor e consultas por interações. O filtro de seguidos usa relações do usuário atual; usuário sem sessão não recebe uma lista fictícia de pessoas seguidas. `visiblePostWhere` aplica audiência e visibilidade do autor antes de entregar o conteúdo.

O feed geral recente pode reordenar a página consultada por afinidade de linguagens e relações seguidas. Isso não significa carregar a base inteira para decidir o ranking. Ordenação popular no conjunto de seguidos possui cursor próprio. Não misture os cursores de diferentes critérios como se representassem a mesma posição.

Para um post ausente, examine: registro existente → audiência → bloqueios → filtros → cursor → ordenação da página. Remover autorização para “fazer aparecer” é um erro de manutenção.

## Respostas e threads

`Answer` aponta ao post, ao autor e opcionalmente a uma resposta-pai. O campo `parent_id` produz o encadeamento. A página consulta respostas de raiz e inclui replies em níveis determinados; a interface limita a indentação e apresenta respostas conforme sua posição.

Uma thread editorial usa post `(1/N)`, resposta `(2/N)` e continuações ligadas à anterior. A ordem visual depende também de `created_at`. Numerar mensagens sem configurar os vínculos não produz o mesmo encadeamento.

O aceite de uma resposta e os votos têm contratos próprios. Responder não concede o direito de editar o post original. O autor da mensagem, o autor do post e o moderador são papéis diferentes na operação.

## Reações, votos e enquetes

O catálogo de reações de post aceita `FIRE`, `HEART`, `LAUGH`, `CLAP` e `BULB`. A associação usuário/post é única. Selecionar o mesmo tipo não cria outra linha; trocar tipo atualiza a reação; remover trata a reversão conforme a recompensa daquele fluxo.

O serviço de reação serializa a transição com alterações de XP do usuário. Na reversão observada, o decréscimo é limitado para não tornar XP negativo, e a movimentação de período e linguagem é mantida coerente.

Voto em post, reação e voto em opção de enquete são dados diferentes. Uma porcentagem da enquete deve derivar das opções e votos autorizados, não da quantidade de reações do post. Reações em mensagens também possuem tabela e endpoints próprios.

## Mídia e música

O editor reúne texto, código e anexos conforme contrato. O domínio valida propriedade dos anexos e compatibilidade de tipo. As apresentações de fotos/vídeos/áudio/GIF e música usam componentes específicos; um post com música não exige ser uma submissão de código.

Integrações de música dependem de disponibilidade e configuração do provedor. Consultar uma busca ou resolver um link não representa licença de reprodução irrestrita. O manual descreve o caminho implementado, sem afirmar disponibilidade permanente do serviço externo.

## Perfil e identidade visual

O perfil combina conta, nome de exibição, bio, informações opcionais e preferências. `username` é identificador de URL; nome de exibição é apresentação e pode ter espaços, símbolos e estilo. Não utilize nome de exibição como chave única de autorização.

[profile-style.ts](../../../src/lib/profile-style.ts) normaliza identidade compartilhada por avatar, nome e título. [profile-customization.ts](../../../src/lib/profile-customization.ts) declara schemas e catálogo; o [serviço de personalização](../../../src/services/profile-customization.service.ts) confere dados, disponibilidade de itens, versão e persistência.

| Personalização  | Representação e cuidado                                                   |
| --------------- | ------------------------------------------------------------------------- |
| Moldura         | ID do catálogo, decoração e cor; não aceitar estrutura privilegiada livre |
| Nome            | Cor, negrito, itálico e sublinhado conforme schema                        |
| Banner          | Modo, cores, imagem e posição validados                                   |
| Aparência       | Tokens de cor do perfil, não CSS arbitrário irrestrito                    |
| Bandeiras       | Identificadores conhecidos e quantidade limitada                          |
| Tags            | Lista e cores associadas conforme contrato                                |
| Estudos         | Assuntos e detalhes declarados; não são prova de conclusão                |
| Redes sociais   | Links/campos opcionais validados; não autorizam por si integração         |
| Título equipado | Depende de catálogo e disponibilização ao usuário                         |

Preferências privadas de conversa ficam separadas da apresentação pública. Atualizações versionadas ajudam a detectar edição concorrente; uma tela aberta há muito tempo não deve sobrescrever silenciosamente uma versão mais nova.

## Conquistas, títulos, badges e certificados

O serviço reúne métricas como posts, comentários, pessoas ajudadas, seguidores, atividades pedagógicas e condições de eventos. O catálogo declara requisito e raridade. A reconciliação compara métricas e persiste conquistas elegíveis, em vez de confiar em uma flag enviada pelo navegador.

Título é elemento exibido no perfil. Badge histórico é outra associação do schema. Credencial pedagógica verifica requisitos de aprendizagem e integridade. Não trate os três como sinônimos, nem use posse de cosmético RPG como prova acadêmica.

## Relações sociais e descoberta

[FollowService](../../../src/services/follow.service.ts) coordena a relação direcional. O [serviço de recomendações](../../../src/services/follow-recommendation.service.ts) seleciona sugestões conforme fontes e filtros disponíveis; sugerir não equivale a seguir automaticamente.

[BlockService](../../../src/services/block.service.ts) impede interações e participa de filtros de consulta. Um teste adequado confere as duas direções e o efeito no conteúdo, chat e convites. Bloqueio não deve ser apenas uma lista decorativa em configurações.

## Ranking

O sistema distingue total, período e linguagem. O ranking geral tem desempate por username e ID após XP. Rank de semana/mês precisa usar movimentações do período; não deve ser calculado por uma fração inventada do total.

Reações podem ter reversão de XP; importar personagens editoriais pode criar XP ilustrativo inicial sem equivaler a atividade pedagógica real. Isso reforça a necessidade de usar a fonte correta para cada painel e credencial.

## Notificações

[NotificationService](../../../src/services/notification.service.ts) cria registros por destinatário e trata consulta/estado de leitura. Lista, contador de não lidas e entrega push são etapas diferentes. Uma notificação pode continuar armazenada mesmo que o push falhe.

O registro inclui tipo, recurso e contexto para navegação. Abrir o destino volta a aplicar autorização; uma notificação não é um token de acesso a candidaturas ou conversas. Quando o recurso já mudou de estado, a interface precisa lidar com esse destino sem reexecutar automaticamente a ação original.

## Bate-papo

A [API de mensagens](../../../src/app/api/messages/route.ts) resolve o usuário, confere destinatário e bloqueios. Na implementação observada, envio é limitado a 30 pedidos por minuto nesse fluxo. Após gravar, tenta criar a notificação; uma falha dessa tentativa é registrada separadamente.

Histórico seleciona mensagens enviadas nas duas direções entre usuário atual e destinatário. Busca 101 linhas para construir página de até 100, devolve em ordem de apresentação e informa o próximo cursor em header. `Cache-Control: private, no-store` evita tratar conversa como resposta pública cacheável.

A rota também contém compatibilidade de criação/verificação da tabela de reações e fallback de consulta sem reações. Isso é um comportamento técnico existente, não uma recomendação para substituir migrations por DDL durante requisições.

## Itens salvos

O salvamento liga usuário e publicação. A lista deve continuar respeitando audiência/bloqueios e existência do conteúdo. Não é um arquivo independente do post: excluir ou restringir a publicação pode afetar sua disponibilidade para quem a salvou.

`client/post-bookmarks.ts` coordena a atualização do cliente entre superfícies. Esse estado compartilhado evita divergências visuais, mas o banco e a API permanecem a confirmação do salvamento.

## Configurações e administração

Configurações agrupam conta, aparência, sons, idioma, bloqueados e operações de conta. Alguns efeitos são locais ou sincronizados por preferências; alterações persistentes exigem a API correspondente. Alterar tema não muda permissões.

Administração usa fontes e rotas específicas, com auditoria de ações sensíveis. Alterar papel de avaliador genericamente não substitui candidatura aprovada. Gestão de recrutador não elimina propriedade da empresa. Os registros de auditoria devem permitir identificar ator, ação e recurso sem registrar senhas ou tokens.

## Quiz diário

[generateDailyQuiz](../../../src/services/daily-quiz.service.ts) normaliza a data para o início do dia UTC e usa unicidade por `scheduled_for`. Se já existe questão, retorna a existente. Seleciona entre até 100 posts públicos recentes no intervalo previsto e usa uma questão revisada relacionada ao conteúdo; a função declara explicitamente geração sem IA.

Não havendo conteúdo elegível, pode retornar `null`. Isso não é o mesmo que inventar uma pergunta para preencher obrigatoriamente a interface. O dia UTC dessa seleção é diferente do dia civil de São Paulo usado no baú RPG. `QuizService.validateQuizAnswer` confere origem, audiência e IDs reservados antes de tratar uma tentativa como quiz comum.

## Denúncias

Denúncias de conteúdo são registros para consulta e ação administrativa. A pessoa que denuncia não recebe por isso poder de exclusão ou acesso ao painel. O fluxo de moderação usa domínio e auditoria próprios.

## Upload de imagens

A [rota genérica de upload](../../../src/app/api/upload/route.ts) exige usuário, recebe multipart, limita o arquivo a 5 MiB e aceita raster JPEG, PNG, GIF e WebP. Confere bytes de assinatura, não apenas o MIME informado, e usa processamento/armazenamento do fluxo. Outros endpoints de mídia podem ter contratos diferentes; não aplique esse limite automaticamente a áudio/vídeo.

## Comunidade editorial

A coleção de novembro contém perfis fictícios identificados como demonstração, com vozes e estilos próprios. Usa catálogo compartilhado, IDs estáveis e importação incremental. Não fabrica curtidas, visualizações ou seguidores e não envia mensagens a membros reais para simular engajamento.

O comando `community:seed` sem argumentos mostra o plano. `--apply` altera apenas identidades reservadas e conteúdo gerenciado. É diferente de `prisma db seed`, que limpa dados no seed de desenvolvimento. Consulte [a documentação da coleção](../../DEMO_COMMUNITY.md).

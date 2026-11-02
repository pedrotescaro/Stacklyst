# Página inicial e recursos pessoais

## Raiz e feed

`src/app/page.tsx` consulta `getAuthIdentity` e entrega identidade inicial a `HomeClient`; a rota é dinâmica. Raiz pública e `/feed` autenticado são superfícies distintas. Registro, login e recuperação possuem páginas e APIs próprias.

O editor em `src/components/composer` coleta conteúdo. Rotas validam e encaminham ao domínio. `post.service.ts` trata publicações; `post-access.service.ts` aplica acesso; `reaction.service.ts` trata reações; busca tem serviços e filtros próprios. Prévia de mídia local não comprova upload concluído.

Para um post ausente, confira sessão, paginação, filtros, bloqueios, visibilidade e existência. Não remover controle de acesso para corrigir uma lista vazia.

## Perfil e relações sociais

`/profile/[username]` identifica a conta por URL. Nome de exibição personaliza a apresentação; não deve ser usado como identificador único. `profile-style.ts` resolve identidade visual compartilhada. A API de perfil valida campos e conserva configuração reservada.

Seguir cria relação direcionada. Amizade mútua exige as duas direções. Recomendações não criam amizade automaticamente. `BlockService` restringe interações e consultas; o efeito vai além de ocultar um botão.

## Títulos, badges e certificados

Título é personalização/conquista exibível. Badge e certificado verificável possuem critérios próprios. Um título comprado no RPG não comprova uma trilha concluída.

`TitlesShowcaseView.tsx` apresenta títulos; `profile-customization.ts` e seu serviço definem catálogo, personalização e concessão. Confira testes de regras de títulos ao mudar requisitos ou seleção.

`credentials/catalog.ts` define critérios; `repository.ts` verifica evidências e emite/consulta; `integrity.ts` protege snapshot; `pdf.ts` gera documento; `badge-art.ts` e `language-logos.ts` compartilham arte. Consulta pública diferencia validade, revogação e falha de integridade. QR aponta à verificação. Assinatura visual não é assinatura criptográfica; estimativa de conteúdo não deve ser anunciada como horas reais medidas.

## Ranking

`learning/rewards.ts` define nível, faixas e desempate geral por XP/nome/ID. `leaderboard.ts`, `period-leaderboard.ts`, `xp-periods.ts` e `language-xp.ts` separam total, período e linguagem. Rankings diferentes podem legitimamente dar posições distintas à mesma pessoa. Não derive período subtraindo um número arbitrário do total. Veja [períodos](../ranking-periods.md).

## Notificações

`NotificationService` cria e consulta registros por destinatário, com visibilidade/bloqueios. `/api/notifications` e `/api/notifications/unread-count` sustentam lista e contador. Tipo, recurso e ator ajudam a construir destino; abrir o destino ainda exige autorização.

Registro persistido, estado lido e push são coisas distintas. Falha de push não apaga o registro confirmado. Notificação antiga pode apontar para recurso que mudou de estado. Operações repetíveis devem usar a identidade estável de evento disponível no domínio para evitar duplicações.

## Bate-papo

`/messages`, `/api/messages` e `/api/messages/chats` apresentam conversas e histórico. A API identifica participantes e aplica bloqueios. Reações de mensagem têm associação própria, distinta de reação em post. `pagination.ts` oferece cursores, que não concedem permissão.

Carregar histórico não comprova entrega de envio novo. Erro de rede deve permitir recuperação sem afirmar sucesso. Teste acesso com dois participantes e uma terceira identidade sem permissão.

## Itens salvos

`/bookmarks` consulta referências salvas. `client/post-bookmarks.ts` coordena integração do cliente; a rota de bookmark do post valida mutações. Salvar não cria cópia independente nem torna conteúdo privado público. Exclusão ou mudança de visibilidade pode afetar disponibilidade posterior.

## Configurações

`settings/page.tsx` organiza conta, aparência, sons, idioma, bloqueados e ações de conta. Estado local serve à edição; persistência depende da API. Atualizações precisam invalidar o cache de usuário quando necessário.

`theme.ts` sincroniza tema; `LanguageContext` fornece idioma/traduções; preferências de som controlam feedback. Configuração visual não concede papel administrativo. Dados do avatar de perfil e do personagem RPG possuem contratos diferentes.

## Administração e privacidade

`/admin`, `/api/admin` e `admin.service.ts` tratam gestão; `security-audit.ts` registra ações sensíveis. Papel de avaliador depende do fluxo de candidatura; acesso de recrutador ainda depende da empresa. Auditoria registra ator/ação/recurso, sem copiar tokens, senhas ou conteúdo privado completo.

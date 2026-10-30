# Páginas da comunidade, bloqueio e níveis

## Comportamento

- `/about` e `/guidelines` são páginas públicas, responsivas e disponíveis em português e inglês. Usam a marca e os temas existentes, índice por âncoras e links reais entre as páginas institucionais.
- O nível fica visível desde o nível 1 no feed, nos detalhes de publicações, em comentários e nos históricos de respostas do perfil.
- O perfil e o menu de publicações de outras pessoas oferecem bloqueio com confirmação. Configurações → Usuários bloqueados permite consultar e remover os próprios bloqueios.
- O bloqueio é uma relação privada e direcional com efeito mútuo: ambas as contas deixam de ver o conteúdo e não podem iniciar novas interações entre si. Um desbloqueio remove apenas a relação criada pela pessoa autenticada.
- Bloquear remove vínculos de seguir e notificações entre as contas e rejeita convites de duelo pendentes. Desbloquear não recria os vínculos de seguir.
- Feed, contagem de novos posts, busca, perfis, mídias, respostas, salvos, conversas e sugestões respeitam os bloqueios. Os filtros de conteúdo são aplicados antes da paginação.
- As APIs verificam bloqueios antes de novas mensagens, respostas, votos, reações, salvos, convites e aceitação de respostas. As rotas de mensagens do aplicativo também seguem essa regra.
- Conteúdo público continua público para visitantes sem uma identidade autenticada. Um bloqueio entre contas não é uma configuração de perfil privado.

## Banco de dados e publicação

O modelo Prisma `UserBlock` corresponde à tabela `user_blocks`. A migração aditiva está em `prisma/migrations/20261029000000_user_blocks/migration.sql` e inclui chave composta, chaves estrangeiras, índice reverso, proibição de autobloqueio, RLS e remoção de acesso direto dos clientes. A leitura e a escrita acontecem pelas rotas autenticadas no servidor.

Aplicar a migração no banco do ambiente de destino **antes** de publicar o código que consulta a nova tabela. Gerar o cliente Prisma com o schema atualizado. A validação funcional foi realizada no PostgreSQL local dedicado a testes. Na preparação para a publicação em 29/10/2026, apenas a migração `20261029000000_user_blocks` foi aplicada ao banco de produção e registrada no histórico do Prisma, sem alterar registros existentes. A verificação confirmou RLS habilitada, quatro constraints e ausência de acesso direto para `anon` e `authenticated`.

## Evidências

- Testes de serviço verificam as duas direções, autobloqueio, conta inexistente, idempotência, listagem privada e remoção apenas do próprio bloqueio.
- Testes HTTP verificam a recusa de interações bloqueadas antes das escritas, mesmo por chamada direta à API.
- Testes com PostgreSQL real verificam persistência, remoção de vínculos e notificações, filtro anterior à paginação e restauração da visibilidade somente depois da remoção dos dois bloqueios.
- Testes de interface verificam confirmação, cancelamento, falha de rede e desbloqueio; a regressão de níveis cobre desde zero XP.
- Capturas e auditoria automatizada das páginas públicas são feitas em build de produção local, em desktop e celular. Isso não representa validação autenticada em produção nem validação em aparelho físico.

Os logs locais da execução ficam em `.tmp/block-*.log`; as capturas e o relatório de acessibilidade ficam em `.impeccable/review/community/`.

Resultado em 29/10/2026:

- `npx vitest run src --maxWorkers=4`: 952 testes passaram; 29 testes condicionais foram ignorados.
- PostgreSQL local dedicado: 3 testes de integração passaram, com RLS habilitada na nova tabela.
- `npm run build`, smoke de execução de código e `npm run typecheck`: passaram.
- ESLint dos arquivos alterados: zero erros. `npm run lint -- --ignore-pattern '.tmp/**'`: zero erros, com avisos existentes. A exclusão evita analisar bundles temporários de exportações anteriores; o comando sem essa exclusão encontra erros nesses arquivos gerados.
- `/about` e `/guidelines`, em 1440 × 1000 e 390 × 844: HTTP 200, zero violações no axe WCAG 2.2 AA, sem overflow horizontal, sem erros JavaScript e CLS zero no ambiente local.
- Revisão independente de interface: `ship` para o ajuste de contraste solicitado. O botão de confirmação usa texto preto sobre o azul da marca; o texto de erro acompanha o tema. A revisão do controle de bloqueio foi feita pelo código, sem simular uma sessão autenticada de produção.

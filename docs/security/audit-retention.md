# Auditoria administrativa

`security_audit_events` registra alterações de papéis, decisões/moderação de avaliadores, exclusões moderadas de publicações e atualizações de candidaturas na mesma transação da operação. Registra ator, ação, identificador, estado essencial e prazo de retenção. Não copia e-mail, senha, conteúdo de publicações ou feedback. Não possui chaves estrangeiras: a evidência permanece após excluir o recurso ou a conta.

Execute `npx prisma migrate deploy` no ambiente de destino antes de publicar o código que grava auditoria. A migração também cria os índices de conversa usados na paginação do chat. A migração é entregue no repositório; os testes locais não comprovam aplicação no banco de produção.

A retenção é de **180 dias**, ampliável por `AUDIT_RETENTION_DAYS` entre 180 e 3650. Valores ausentes, inválidos ou menores usam 180. Cada evento persiste seu próprio `retain_until`; mudar a configuração não reduz os prazos já gravados. O banco impõe o mínimo e rejeita atualização de eventos ou exclusão antes desse prazo. RLS e revogação de privilégios impedem acesso pelas funções públicas do Data API; a conexão de servidor usa a função proprietária do banco.

Agende uma chamada **POST** diária a `/api/cron/security-audit`, com `Authorization: Bearer <CRON_SECRET>` configurado apenas no servidor/agendador. Sem segredo ou com segredo incorreto, o endpoint responde 401 sem exclusão. O job remove somente `retain_until <= agora` e devolve a contagem, sem dados da auditoria. Não há agendamento externo criado automaticamente; a configuração e execução do agendador devem ser verificadas no ambiente de implantação.

A proteção do último administrador usa um advisory lock **transacional** comum às alterações explícitas de papel antes de ler o papel e contar administradores. Isso serializa alterações entre instâncias da aplicação. Aprovação/reintegração/revogação de avaliadores preserva qualquer papel ADMIN. Escritas SQL diretas por operadores continuam sendo uma permissão privilegiada: não conceda mutações de papéis pelo Data API.

Validação local: regressões unitárias verificam projeção pública de candidatos, notificação com vaga/link, vínculo denúncia-publicação, falha de persistência de auditoria, intercalamento de dois rebaixamentos, mínimo/prazo de retenção e autenticação da limpeza.

Em PostgreSQL **17** descartável, a migração nova foi aplicada integralmente e quatro testes de integração passaram: dois rebaixamentos simultâneos mantêm um ADMIN; exclusão moderada resolve as cascatas e preserva auditoria; candidatura persiste etapa/feedback e gera notificação útil sem devolver e-mail; o banco bloqueia reescrita/exclusão precoce, impõe 180 dias e permite apenas a limpeza expirada. A auditoria permanece após excluir a conta do candidato.

Para repetir: crie um banco vazio `stacklyst_quality_services` em PostgreSQL local, porta **55437**, configure `STACKLYST_TEST_DATABASE_URL` e execute `node scripts/verify-administration-postgres.mjs`. O script aceita apenas `127.0.0.1:55437/stacklyst_quality_services`, prepara o schema-base em banco vazio e aplica a nova migração literalmente; nunca reseta um banco. Sem opt-in, os testes de integração ficam explicitamente ignorados.

Limitação do histórico: o bootstrap completo por `prisma migrate deploy` em um banco vazio falhou na migração anterior `20260901011818_duel_automatic_judge`: a FK de `Duel.winner_id` referencia uma coluna ausente. A prova acima usa o schema-base atual e a migração nova; não comprova integridade de toda a cadeia histórica nem aplicação em produção.

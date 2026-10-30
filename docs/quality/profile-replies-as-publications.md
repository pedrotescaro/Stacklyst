# Respostas como publicações no perfil

Postagens combina posts originais e respostas da pessoa em uma única lista, ordenada pela data de criação de cada contribuição. A contagem de publicações do cabeçalho usa a mesma definição: posts originais mais respostas visíveis. Curtidas combina posts e respostas curtidos, preservando o item que recebeu a curtida.

Cada resposta aparece em uma conversa: publicação original no topo, resposta anterior quando houver e contribuição da pessoa abaixo. O contexto não conta como uma nova publicação e não recebe os controles da resposta. Curtir e compartilhar atuam sobre a resposta exibida. A apresentação remove contagens de visualizações simuladas e controles locais que não persistiam reposts ou salvamentos.

O endpoint `/api/profile/[username]/activity` combina duas consultas limitadas antes de cortar a página final. O cursor inclui tipo, data e identificador, evitando repetições ou perdas quando posts e respostas têm o mesmo horário ou identificador. Pesquisa e bloqueios são aplicados antes da paginação. Respostas cujo post original ou autor imediato esteja bloqueado não são retornadas. Quizzes no contexto continuam sem divulgar a resposta correta.

## Verificação em 29/10/2026

- Testes do serviço: ordenação, empates, limite de consultas, curtidas em respostas, pesquisa, total de publicações, proteção de quizzes e cursores inválidos.
- PostgreSQL local dedicado: cinco testes passaram, incluindo paginação completa com datas iguais e identificadores coincidentes entre tabelas, curtidas, pesquisa e bloqueios do post e da resposta anterior.
- Testes de interface: respostas em Postagens e Curtidas, publicação original acima, sequência de resposta aninhada, destino correto da curtida, erro com reversão e links para a conversa.
- Vinte testes direcionados passaram; build, smoke de execução de código, typecheck e ESLint dos arquivos alterados passaram sem erros.
- Capturas locais em 1440, 390 e 320 px usam componentes reais e fonte Inter do build, com dados de demonstração e navegação lateral substituída na fixture. As duas respostas aparecem no perfil mesmo sem posts originais, com duas publicações no cabeçalho e sem rolagem horizontal.
- Nas três larguras, a auditoria axe do componente não apontou violações de WCAG 2.2 AA nem erros JavaScript. A revisão independente confirmou a ordem da conversa e o ajuste em telas estreitas.

As evidências locais ficam em `.tmp/profile-reply-*.log` e `.impeccable/review/profile-replies/`. Não houve alteração de schema nem migração de dados. A validação de banco usa apenas o PostgreSQL local dedicado, e as capturas não representam uma sessão autenticada de produção.

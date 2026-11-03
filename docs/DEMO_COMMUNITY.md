# Comunidade editorial de demonstração

Esta coleção adiciona perfis fictícios e conteúdo de programação ao Stacklyst. Cada bio identifica o perfil como demonstração. As vozes, nomes de exibição, temas e combinações visuais são distintos; não representam pessoas ou contas externas com nomes semelhantes.

## Conteúdo

- 10 perfis com avatar, nome colorido em negrito, moldura, título, tags e banner em gradiente.
- 12 threads: event loop, `__slots__`, arrays e agrupamento, streaming de CSV, Send/Sync, fetch/cancelamento, argumentos padrão, validação com TypeScript, TaskGroup, Map/Set, decorators e Promises.
- 8 posts avulsos, 37 continuações numeradas e 24 mensagens de discussão contextualizadas.
- Cada thread termina com referências primárias. Exemplos com saída esperada têm verificações executáveis em Python, JavaScript e TypeScript.

Os títulos e o XP ilustram o catálogo nas contas de demonstração. Não são evidências de formação ou certificados. Não são fabricados likes, visualizações, seguidores, avaliações ou interações com usuários reais. Senhas novas são aleatórias, independentes e não são impressas. O importador não envia convites, e-mails ou notificações.

## Publicação incremental

Use o banco já configurado em `.env.local`. `DATABASE_URL` usa o pooler quando disponível; `DIRECT_URL` é fallback. Para provisionar contas novas, configure `NEXT_PUBLIC_SUPABASE_URL` e uma chave administrativa do Supabase no ambiente local. Nunca coloque essas credenciais no repositório.

```sh
npm ci
npm run community:seed
```

Sem argumentos, o comando apenas consulta e mostra o plano. Para aplicar:

```sh
npm run community:seed -- --apply
```

O importador verifica os nomes reservados contra os e-mails exatos de [demo-profile-assets.json](../prisma/demo-profile-assets.json). Uma colisão com uma conta comum interrompe a operação. A publicação PostgreSQL é uma transação com bloqueio consultivo para serializar importações. A criação de identidades no Auth ocorre antes dessa transação; caso ela falhe, uma nova execução reconhece as identidades já provisionadas, sem excluí-las nem recriá-las.

Posts usam `client_id` no namespace `stacklyst-editorial-v1`; as respostas têm UUIDs derivados da coleção, do post e da posição. Reexecutar atualiza o conteúdo gerenciado sem multiplicar linhas, alterar as datas de publicações existentes ou apagar conteúdo externo. A progressão de contas existentes é preservada; somente contas novas recebem o XP ilustrativo inicial. Curtidas, visualizações e respostas reais existentes são preservadas.

O código-fonte também serve ao seed de desenvolvimento, mas **`prisma db seed` continua sendo destrutivo**: limpa tabelas antes de criar o ambiente de exemplo. Não use esse comando para enriquecer um banco existente.

## Encadeamento

O post é `(1/N)`. A parte `(2/N)` é uma resposta ao post; cada continuação seguinte aponta por `parent_id` para a anterior, com horário posterior. São no máximo cinco partes: a última fica dentro dos três níveis de replies carregados pela página atual. A pergunta de outro perfil é uma resposta separada ao post, e o autor responde a ela; isso mantém a conversa fora da sequência numerada.

As datas são distribuídas ao longo da coleção. Quando executada antes do último horário editorial definido, toda a sequência é deslocada para o passado; não são criados posts futuros. As datas permanecem fixas nas próximas execuções.

## Fontes e manutenção

- [Perfis, textos e exemplos](../prisma/demo-community/content.ts): fonte editorial única, com referências por thread.
- [Persistência e validação](../prisma/demo-community/publish.ts): estilos do catálogo, importação incremental e IDs estáveis.
- [Comando de publicação](../scripts/publish-demo-community.ts): plano padrão, provisionamento Auth e conferência final.
- [Seed de desenvolvimento](../prisma/seed.ts): usa a mesma coleção após os exemplos legados.

```sh
npx vitest run prisma/demo-community/content.test.ts
```

Para ensaiar a persistência em PostgreSQL, configure `RUN_COMMUNITY_DB_TEST=1` e execute `prisma/demo-community/publish.database.test.ts` com Vitest. O teste publica duas vezes dentro de uma transação e desfaz tudo ao final; verifica quantidades, horários, encadeamento e preservação de posts fora da coleção.

As fotos usam os URLs de demonstração do manifesto. Uma conferência HTTP confirma disponibilidade no momento da publicação; disponibilidade futura depende do provedor. Links GitHub/Discord não são inventados para os novos personagens.

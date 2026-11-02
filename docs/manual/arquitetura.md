# Arquitetura e leitura do código

## Produto e camadas

Stacklyst conecta estudo de programação, prática, comunidade, competição e oportunidades profissionais. Aprendizagem é o núcleo do progresso. Exercícios, duelos competitivos e PvP do Mundinho têm avaliadores e recompensas próprios.

| Local                                   | Responsabilidade                                                 |
| --------------------------------------- | ---------------------------------------------------------------- |
| `src/app`                               | Páginas, layouts e endpoints do App Router                       |
| `src/components`                        | Componentes de interface e interações reutilizáveis              |
| `src/hooks`, `src/contexts`             | Efeitos, estado compartilhado e preferências                     |
| `src/services`                          | Casos de uso de posts, vagas, eventos, avaliação e administração |
| `src/lib`                               | Regras de domínio, persistência, validação e infraestrutura      |
| `prisma/schema.prisma`                  | Entidades, relações, índices e unicidades                        |
| `prisma/migrations`                     | Evolução versionada do banco                                     |
| `apps/mobile`                           | Cliente Expo e ponte nativa do Mundinho                          |
| `scripts`, `public/assets`, `artifacts` | Ferramentas, recursos de produção e fontes editáveis             |

## Caminho de uma requisição

Uma interação coleta dados na interface, chama uma rota, resolve a sessão, valida o payload e aplica o caso de uso. O serviço consulta o domínio e persiste alterações; a resposta confirmada atualiza a tela. A regra pode estar em uma função pura, um serviço ou um repositório, dependendo da área.

Exemplo: responder uma atividade chama a rota de tentativa, que identifica a etapa do catálogo, avalia a resposta e só então grava a primeira conclusão elegível e o XP. O navegador não envia um booleano confiável de “acertou”, nem decide recompensa.

`auth.ts` resolve identidade; `api-handler.ts` centraliza contexto e erros; `errors.ts` distingue validação, acesso e indisponibilidade. `ratelimit.ts` usa Redis quando configurado e fallback local por instância. Uma permissão na tela nunca substitui a verificação da API.

## Convenções

- `page.tsx`: página. `layout.tsx`: estrutura compartilhada. `route.ts`: métodos HTTP.
- `.tsx`: TypeScript com JSX. `.ts`: contratos e implementação sem JSX. `.mjs`: JavaScript em módulos.
- `'use client'`: componente interativo no navegador. `server-only`: fronteira que impede importar infraestrutura sensível no cliente.
- `@/`: alias para `src/`, conforme o TypeScript do projeto.
- `Service`: caso de uso. `repository`: consultas/gravações do domínio. `schema`: validação de estrutura, frequentemente com Zod.
- Tipos TypeScript não validam JSON em runtime. Dados externos precisam de validação real.
- `async`/`await`: operações assíncronas. `Promise.all`: agregação de tarefas independentes; não garante atomicidade.

## Glossário

| Termo              | Significado                                                                    |
| ------------------ | ------------------------------------------------------------------------------ |
| Payload/DTO        | Dados transportados; não precisa expor todo o modelo persistido                |
| Transação          | Grupo de alterações confirmado ou revertido em conjunto                        |
| Commit/rollback    | Confirmar/desfazer a transação                                                 |
| Idempotência       | Repetir uma operação sem duplicar seu efeito                                   |
| Lock               | Serialização de operações concorrentes                                         |
| Race condition     | Resultado dependente de uma ordem incorreta entre pedidos simultâneos          |
| FK/unique/índice   | Referência entre registros/restrição de não duplicidade/caminho de busca       |
| RLS                | Controle de acesso a linhas no PostgreSQL                                      |
| State/ref          | Estado que provoca renderização/referência mutável sem renderização automática |
| Cursor             | Continuação de consulta paginada; não é autorização                            |
| Harness/sandbox    | Programa que envolve a solução/ambiente limitado de execução                   |
| AST/Big-O          | Representação sintática/ordem de crescimento estimada do custo                 |
| Snapshot/polling   | Retrato do estado confirmado/consultas periódicas                              |
| Sprite/atlas/frame | Imagem de jogo/conjunto de células/quadro de animação                          |
| XP/PV/role         | Experiência/pontos de vida/papel de autorização                                |

## Como localizar uma regra

Comece pela página, encontre o transporte ou `fetch`, abra a rota e siga os imports até serviço/repositório. Confira o modelo e o teste do domínio. Ao ler uma função, identifique entrada, validação, efeitos, retorno e erros. Um nome como `save` expressa intenção; só a implementação e o commit comprovam persistência.

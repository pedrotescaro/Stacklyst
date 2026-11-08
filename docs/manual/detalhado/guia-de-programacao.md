# Guia para entender a programação

## Linguagens e ferramentas, sem misturar seus papéis

| Tecnologia          | Papel no repositório                                   | O que não significa                                             |
| ------------------- | ------------------------------------------------------ | --------------------------------------------------------------- |
| TypeScript          | Tipos, regras, serviços, rotas, componentes e scripts  | Não valida automaticamente um JSON recebido                     |
| TSX / JSX           | Composição de interface React                          | Um componente não é uma tabela do banco                         |
| JavaScript / MJS    | Execução no navegador, ferramentas e geradores         | Não deve ser confundido com código submetido pelo aluno         |
| CSS / Tailwind      | Apresentação, estados, temas e responsividade          | Ocultar controle não implementa autorização                     |
| Prisma Schema       | Contrato dos modelos persistidos e geração do cliente  | Não comprova que a migration foi aplicada                       |
| SQL / PostgreSQL    | Dados, restrições, índices, transações e bloqueios     | Uma transação não engloba automaticamente chamadas a provedores |
| Python / PowerShell | Ferramentas presentes de documentação, arte e operação | Não são o backend principal da plataforma                       |
| JSON / Markdown     | Catálogos, dados estruturados e documentação           | Não são código confiável apenas por estarem bem formatados      |
| React Native / Expo | Cliente mobile e integração nativa                     | Não usa o mesmo DOM de uma página web                           |

Python, JavaScript, TypeScript, Java, Rust, Go, Kotlin, Swift e C++ também aparecem como linguagens de estudo/execução. A lista de conteúdos, a lista de runtimes configurados e as linguagens usadas para implementar a plataforma são conjuntos diferentes. Veja o [inventário dos manifests](../referencias/tecnologias.md).

## Estrutura das pastas

| Pasta                        | Pergunta que ela ajuda a responder                              |
| ---------------------------- | --------------------------------------------------------------- |
| `src/app`                    | Qual URL entrega esta tela ou esta API?                         |
| `src/components`             | Como a experiência é composta e como reage a interações?        |
| `src/contexts` / `src/hooks` | Qual estado ou efeito é compartilhado?                          |
| `src/services`               | Qual caso de uso coordena regras e efeitos?                     |
| `src/lib/learning`           | Como currículo, progresso, XP e rankings pedagógicos funcionam? |
| `src/lib/exercises`          | Como exercícios são avaliados e persistidos?                    |
| `src/lib/duels`              | Como convites, julgamento e resolução competitiva funcionam?    |
| `src/lib/mundinho`           | Como economia, mapa, combate e multiplayer funcionam?           |
| `src/lib/credentials`        | Como critérios, snapshots, verificação e PDF funcionam?         |
| `prisma`                     | Como o estado é representado e evolui no banco?                 |
| `apps/mobile`                | Como o cliente nativo usa o domínio e a ponte do Mundinho?      |
| `scripts`                    | Como gerar, conferir ou operar artefatos do projeto?            |
| `docs`                       | Onde estão manuais, decisões e evidências históricas?           |

## Convenções de arquivo

`page.tsx` é a entrada de uma página. `layout.tsx` compõe descendentes. `route.ts` implementa métodos HTTP. Um arquivo com `'use client'` define uma fronteira de componente interativo; isso não quer dizer que todo dado disponível nele é privado. `server-only` impede importações indevidas de módulos de servidor no cliente.

`@/` resolve para `src/`. Para scripts executados por `ts-node`, o projeto usa configuração própria e `tsconfig-paths/register` quando precisa resolver esses imports fora do Next.js. O [importador editorial](../../../scripts/publish-demo-community.ts) é um exemplo.

## Como ler uma função

Faça seis perguntas, nesta ordem:

1. **Entrada:** os argumentos vieram de sessão, banco, catálogo ou cliente?
2. **Contrato:** tipos estáticos e validação em runtime conferem quais propriedades?
3. **Permissão:** quem pode acessar este recurso específico?
4. **Decisão:** qual condição muda o resultado ou produz erro?
5. **Efeito:** quais linhas são gravadas, quais chamadas externas acontecem e em que transação?
6. **Saída:** o retorno é público? Há gabarito, dado privado ou detalhe interno a remover?

Na função `saveLessonAssessment`, por exemplo, o ID do usuário vem da sessão resolvida pela rota, o tipo de etapa vem do catálogo, a correção vem do avaliador, e a própria persistência decide se a conclusão rende XP pela primeira vez. O cliente não escolhe diretamente esse crédito.

## Sintaxe recorrente

```ts
// Exemplo didático; não é um endpoint adicional do projeto.
type Entrada = { id: string; action?: 'run' | 'submit' };
async function exemplo(entrada: Entrada) {
  const action = entrada.action ?? 'submit';
  return { action, id: entrada.id };
}
```

`type` descreve uma estrutura para o compilador. `?` torna a propriedade opcional. Uma união com `|` limita alternativas no tipo. `??` usa o segundo valor apenas quando o primeiro é `null` ou `undefined`; não equivale a `||`, que trata todos os valores falsy como ausência. `async` devolve uma Promise. `await` espera sua resolução naquele fluxo.

`?.` permite acessar condicionalmente uma propriedade; não demonstra que a propriedade existe. `!` depois de uma expressão é uma asserção ao compilador e não insere checagem em runtime. `as` também não converte magicamente um payload. Por isso Zod e verificações de domínio continuam necessários.

`map` transforma uma coleção; `filter` seleciona; `find` procura um elemento; `some` verifica existência; `every` exige todos; `reduce` acumula. Um `map(async ...)` produz Promises: a coordenação exige aguardar o conjunto quando a operação admite concorrência. Não se deve paralelizar gravações que dependem da ordem.

## React: estado, referência e efeitos

- `useState` guarda um estado cuja alteração agenda nova renderização.
- `useRef` conserva uma referência mutável entre renderizações, sem renderizar por si.
- `useEffect` sincroniza com sistemas externos e deve liberar timers, listeners e conexões que criou.
- `useCallback` preserva a referência de uma função conforme dependências; não prova que seu corpo é puro.
- `key` identifica elementos para reconciliação; não substitui unicidade no banco.

No multiplayer, posição corrente e versão recebida usam referências para evitar que callbacks antigos sobrescrevam estado novo. O efeito de sincronização limita requisições concorrentes e limpa o timer ao sair. Isso é diferente de manter uma conexão WebSocket.

## Prisma: consultas e persistência

`findUnique` busca uma chave única; `findMany` lista; `select` limita campos; `include` agrega relações. `create` insere; `update` exige registro; `updateMany` permite uma condição e retorna contagem; `upsert` escolhe inserção ou atualização por chave única. `deleteMany` com filtro vazio pode atingir uma tabela inteira.

Uma consulta `where: { id }` só identifica o recurso. A autorização pode exigir ainda `user_id`, participante, audiência, ausência de bloqueio e propriedade de empresa. As restrições `@@unique` apoiam a idempotência, mas não substituem toda a lógica.

Uma transação agrupa alterações de banco. Um bloqueio por usuário serializa recompensas concorrentes. Um bloqueio por evento protege a capacidade compartilhada. Uma atualização condicional de estado evita que duas resoluções fechem o mesmo duelo. O escopo do lock deve representar o recurso em disputa.

## Três registros que costumam ser confundidos

| Registro             | Significado                                          |
| -------------------- | ---------------------------------------------------- |
| Execução de código   | O programa foi processado e produziu saída/erro      |
| Avaliação            | O resultado foi confrontado com um contrato          |
| Conclusão persistida | O servidor gravou a evidência e os efeitos elegíveis |

Um console sem erro pode ainda produzir a resposta errada. Testes públicos passando podem não cobrir os ocultos. Uma avaliação correta em `run` pode não registrar conclusão. O código e a documentação devem conservar essas separações.

## Como alterar uma regra com segurança

Localize a regra no capítulo e na fonte; confira chamadores; altere contrato, regra e serialização quando necessário; adapte interface e cliente mobile; execute testes do domínio; atualize documentação e gerados. Para currículo, confira IDs publicados e compatibilidade do progresso. Para economia, confira extrato e repetição concorrente. Para permissão, use pelo menos proprietário, usuário sem acesso e papel privilegiado quando aplicável.

Os [recortes comentados](codigo-comentado.md) e as [sequências](sequencias.md) mostram como fazer essa leitura em fluxos reais.

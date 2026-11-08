# Contratos, segurança, falhas e operação

## Caminho de uma requisição

Interface → rota → identidade → validação → autorização do recurso → regra de domínio → persistência/efeitos → serialização → resposta. Nem todos os arquivos seguem exatamente a mesma distribuição, mas essas responsabilidades precisam ser localizadas antes de alterar o fluxo.

[apiHandler](../../../src/lib/api-handler.ts) envolve rotas compatíveis, resolve sessão quando habilitado, oferece contexto e padroniza parte dos erros. Também cria request ID e associa informações de rate limit à execução por `AsyncLocalStorage`. A presença do wrapper não garante que a rota exigiu usuário: confira a condição do próprio endpoint.

## Identidade e banco

[auth-session.ts](../../../src/lib/auth-session.ts) participa da leitura de sessão; [auth.ts](../../../src/lib/auth.ts) resolve o usuário de domínio e oferece exigências de acesso. A implementação pode usar Prisma e fallback pela API de dados quando a conexão do banco falha em determinadas condições.

O ID validado pelo provedor precisa corresponder ao usuário usado no domínio. Metadata editável de perfil, nome de exibição e papel enviado no corpo não são prova de autorização. Checagens de administrador, avaliador, dono e participante pertencem ao servidor.

O runtime prioriza `DATABASE_URL` quando configurada; `DIRECT_URL` atende fluxos Prisma/administrativos e fallback previsto. Uma porta do banco inacessível e uma sessão inválida são falhas diferentes, mesmo quando ambas impedem uma página de carregar.

## Contratos públicos e internos

Um modelo Prisma descreve o registro persistido. Um DTO público é uma seleção segura e útil de dados. Exemplos de dados internos que exigem cuidado: soluções, respostas esperadas ocultas, feedback privado de candidatura, tokens, preferências privadas de chat e detalhes operacionais.

TypeScript ajuda durante desenvolvimento. Zod e verificações de domínio validam a entrada real. Mesmo após schema aprovado, podem faltar autorização, saldo, capacidade ou pré-requisito. Nunca trate `safeParse(...).success` como aprovação completa da ação.

## Erros HTTP

| Status | Interpretação típica neste código          | O que conferir                                   |
| ------ | ------------------------------------------ | ------------------------------------------------ |
| 400    | Forma/valor de entrada inválido            | Schema, tipo e campos exigidos                   |
| 401    | Sessão ausente/inválida                    | Identidade e recuperação de acesso               |
| 403    | Sem permissão ou requisito                 | Propriedade, papel, nível, pré-requisito         |
| 404    | Recurso não encontrado para o fluxo        | ID, existência e política de exposição           |
| 409    | Conflito de estado, capacidade ou operação | Versão, duplicidade, encerramento e concorrência |
| 429    | Limite de pedidos atingido                 | Janela e headers de limite                       |
| 500    | Erro não classificado no wrapper           | Logs associados ao request ID                    |
| 503    | Dependência indisponível                   | Executor, conexão ou serviço externo             |

O [catálogo extraído de erros](erros-do-codigo.md) apresenta literais encontrados na fonte. Não é uma promessa de que toda rota sempre usa o mesmo envelope: há endpoints que retornam `NextResponse.json` diretamente. Consulte o adaptador concreto.

## Concorrência e idempotência

| Operação             | Recurso disputado              | Proteção relevante                                   |
| -------------------- | ------------------------------ | ---------------------------------------------------- |
| Crédito pedagógico   | Total/histórico do usuário     | Transação, lock `learning:<id>` e primeira conclusão |
| Baú                  | Evento de resgate diário       | Chave única usuário/dia e extrato                    |
| Capacidade de evento | Quantidade de vagas do evento  | Lock por evento e checagem na transação              |
| Fechamento de duelo  | Estado e recompensa da partida | Atualização condicional e transação                  |
| Sala multiplayer     | Participantes, versão e turno  | Locks de sala/usuário e revalidação                  |
| Importação editorial | Conteúdo da coleção            | Namespace, IDs estáveis e lock do publicador         |

Uma transação protege suas operações de banco, não a Internet inteira. Compilar código, fazer upload ou entregar push pode falhar independentemente. Não mantenha um lock de banco durante espera de compilador se o fluxo pode executar externamente e revalidar ao voltar.

## Rede e recuperação

Erros recuperáveis precisam preservar o que já foi confirmado. Uma submissão antiga que volta depois de mudar o turno não deve causar dano novo. Uma notificação que falhou não deve desfazer a candidatura confirmada. Uma execução indisponível não deve conceder progresso nem consumir uma chance pedagógica como se o aluno tivesse errado.

O cliente deve distinguir enviar, aguardando, confirmado, falhou e estado desatualizado. “Tente de novo” só é seguro quando a operação reconhece repetição ou quando a interface consegue identificar que o primeiro pedido não foi confirmado.

## Rate limit, logs e auditoria

`ratelimit.ts` usa Redis quando configurado e fallback local por instância. Fallback local não é um limite global distribuído entre todas as instâncias. As rotas escolhem seus limites; os exemplos de 30/min de lição e mensagens não são uma regra universal para todas as APIs.

Logs operacionais ajudam a depurar indisponibilidade. `SecurityAuditEvent` registra operações sensíveis do domínio. Os registros devem permitir investigação sem copiar credenciais ou todo o conteúdo privado. Request ID ajuda a correlacionar uma resposta com a execução que a produziu.

## Banco, migrations e seeds

`schema.prisma` e migrations descrevem a evolução. A situação do schema local não comprova aplicação em produção. Confira histórico/checksum e ambiente antes de migrar. Não substitua esse processo por um reset de produção para “alinhar tudo”.

O seed de desenvolvimento atual limpa tabelas. A comunidade editorial tem importador incremental próprio. Ambos podem criar dados, mas seus escopos são radicalmente diferentes. Para documentação, não há necessidade de executar nenhum dos dois.

## Testes e significado das evidências

| Verificação                | O que demonstra                               | O que não demonstra sozinha                       |
| -------------------------- | --------------------------------------------- | ------------------------------------------------- |
| Typecheck                  | Compatibilidade estática dos tipos compilados | Contratos reais de rede e autorização completa    |
| Teste unitário             | Comportamento isolado nos casos cobertos      | Banco real e concorrência entre processos         |
| Integração com rollback    | Consultas/regras no banco configurado         | Homologação irrestrita da produção                |
| Build                      | Geração do pacote no ambiente local           | Publicação e funcionamento de provedores externos |
| Screenshot/interação local | Apresentação e comportamento observado        | Todos os dispositivos físicos                     |
| Status de deploy           | Provedor concluiu a implantação               | Todos os fluxos autenticados foram testados       |

Esta tarefa documental não precisa repetir testes caros da aplicação quando não altera sua execução. Os controles pertinentes são consistência de fontes, links, trechos, diagramas e ausência de credenciais no material produzido.

## Mobile

O cliente Expo usa contratos e estado próprios em `apps/mobile`. Os endpoints mobile reaproveitam partes do domínio e têm adaptadores de sessão e serialização. O documento gerado do Mundinho precisa ser atualizado quando muda a experiência embarcada; mudar apenas Markdown não exige regenerar arte ou APK.

## Manutenção da documentação

1. Atualize explicação e regra identificada.
2. Ajuste o catálogo de casos de uso se o fluxo mudou.
3. Atualize a sequência e os recortes associados.
4. Regenere inventários e diagramas derivados.
5. Confira links e leia uma amostra dos trechos contra a fonte.
6. Registre a data/base e o que foi efetivamente verificado.

Não copie `.env.local`, connection strings com senha, service keys ou tokens para exemplos. Nomes de variáveis bastam para explicar a operação.

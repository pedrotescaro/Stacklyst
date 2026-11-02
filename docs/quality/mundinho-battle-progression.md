# Mundinho: diálogo, percurso e progressão de código

Os detalhes de diálogo, retrato e seleção do combate usam branco e neutros. Moedas, recompensas e cores de vida mantêm seus significados.

O cenário da batalha é um PNG original de 480 × 200 pixels com três camadas editáveis no LibreSprite: campo claro, faixas horizontais e plataformas. A composição segue a referência de batalha de RPG portátil fornecida pelo proprietário: oponente acima à direita e jogador abaixo à esquerda. O gerador é `scripts/build-mundinho-battle-background.mjs`; a fonte está em `artifacts/mundinho/libresprite/battle/battle-background.ase`.

## Caminhos

Dois frames foram acrescentados ao atlas de objetos: caminho curto com uma pedra e longo com duas. Os 15 frames anteriores foram comparados e preservados pixel por pixel. O manifesto compartilhado `src/lib/mundinho/challenge-sprites.json` mantém os índices da exportação e do componente sincronizados.

`codePathInfo` mede a distância entre objetivos e o início. Um trecho com uma casa vazia entre dois objetivos exige dois movimentos; duas casas vazias exigem três. A informação visual e acessível descreve o trecho completo, sem atribuir custo oculto à casa. O replay e a avaliação continuam usando um índice por movimento.

## Progressão

| Nível da criatura | Requisitos dos novos desafios                                           |
| ----------------- | ----------------------------------------------------------------------- |
| 1                 | Sequência de movimentos e ações                                         |
| 2                 | `if` com sensor do mundo e um `else` final                              |
| 3                 | Condicional e laço com ações em pelo menos duas iterações do mesmo laço |

Os sensores consultam o tabuleiro real da execução: `tem_objeto`, `precisa_<ação>` e `pode_andar_direita`/`pode_andar_esquerda`. As seis linguagens usam sua sintaxe própria; Go utiliza `for`, e Rust aceita `for`, `while` ou `loop`. HTML/CSS continuam usando JavaScript com aviso explícito.

O servidor analisa o código antes da execução isolada. Parsers existentes atendem JavaScript, TypeScript, Python, Rust e Java; a análise de Go exclui comentários, strings comuns, raw strings e runes antes de identificar estruturas. A instrumentação registra condições alcançadas e iterações por laço. Marcadores internos são removidos da animação e sua invocação explícita é recusada. Isso verifica a atividade pedagógica; o isolamento do código permanece responsabilidade do executor existente.

O nível vem da criatura da batalha persistida, não do cliente. Novos IDs `code-l2-*` e `code-l3-*` mantêm a exigência ao retomar o turno. IDs anteriores e o desafio legado de cristais permanecem respondíveis com suas regras originais. Testar continua sem consumir turno ou causar dano; confirmar usa o resultado calculado no servidor.

## Verificação

- Testes do domínio e componentes cobrem os 22 cenários, níveis, sensores, retomada, código sem estruturas, palavras em comentários/strings, código inativo e laços distintos executados apenas uma vez.
- Soluções foram executadas com JavaScript/TypeScript isolados, Python e Rust locais. Go 1.27.3 portátil e OpenJDK 21 do Android Studio compilaram e executaram quatro rotas representativas nos dois níveis avançados: 16 casos. O serviço externo estava indisponível nessa conferência; não foi usado como prova de execução.
- O atlas preserva a anatomia original e as roupas/personagens anteriores. O conteúdo do Mundinho para WebView móvel é regenerado pelo builder existente com os novos assets offline.
- As capturas locais em `.tmp/mundinho-learning-qa` usam componentes reais com dados sintéticos, em 1280/820/390/320 pixels, temas claro/escuro. O replay visual usa transporte simulado; a execução e os requisitos são verificados separadamente pelos testes do domínio. Isso não comprova sessão autenticada em produção ou uso em aparelho físico.

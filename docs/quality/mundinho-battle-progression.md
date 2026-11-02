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

### Sorte, equipamentos e recuperação de turnos

Uma escolha de habilidade sorteia no servidor um número inteiro uniforme de 0 a 99. Sem equipamento, 0–49 aplica o golpe imediatamente e 50–99 atribui um exercício. O exercício atribuído e a habilidade ficam persistidos; repetir a seleção não refaz o sorteio. Golpes diretos usam dano, cura, desgaste e contra-ataque normais, sem incrementar o contador de respostas corretas das missões. O limite existente de três recompensas diárias de vitória, de 15 moedas e 30 XP cada, permanece.

O inventário e os espaços equipados usam o JSON já existente em `RpgPlayer`, sem migração. Só itens pertencentes ao jogador, presentes no catálogo e no espaço correto contribuem para os atributos. Cada espaço aceita um item: amuletos dão +5/+10/+15 pontos percentuais de sorte, proteções reduzem o contra-ataque em 2/4/6 pontos, e relíquias acrescentam 10/20/30 PV. A cura respeita a vida máxima, e a proteção não elimina todo o dano. Trocas de equipamentos defensivos continuam bloqueadas durante uma batalha ativa; o título Caça-bugs pode ser equipado mesmo dentro de um exercício de código já aberto. A ação de pular (`battle-skip`) é validada no servidor, dispensa o exercício aplicando o golpe direto, não conta como acerto em missões e não repete o turno caso o pedido chegue duplicado.

Cada vitória tem chance base de 50% de drop, acrescida da sorte equipada. Criaturas de nível 1 fornecem itens comuns; nível 2 acrescenta raros; nível 3 acrescenta épicos. Cada item tem peso 6/3/1, respectivamente. Um item novo é armazenado automaticamente, e um repetido vira cinco moedas adicionais. O sorteio e a entrega são registrados na mesma transação da vitória, com trava da linha do jogador e chaves únicas, inclusive quando nenhum equipamento cai. Repetir pedidos não altera o resultado nem duplica recompensas.

Pedidos de turnos antigos ou batalhas encerradas retornam o estado atual com um aviso. Erros de compilação e falhas do executor retornam `codeRun.retryable`, com feedback no console e sem consumir o turno; não são erros HTTP 400 de jogabilidade. O código é executado fora da transação e o turno é conferido novamente sob a trava antes de aplicar o resultado. Requisições inválidas continuam sujeitas à validação da API.

O atlas de equipamentos (`equipment.png`) contém nove frames de 32 × 32 px, com nomes e ordem compartilhados em `equipment-sprites.json`. `scripts/build-mundinho-equipment.mjs` produz a fonte `.ase` editável e chama o LibreSprite para exportar o PNG usado na web e no pacote offline do app.

A revisão de sorte/equipamentos passou em 141 testes do Mundinho, incluindo a rota HTTP real com autenticação, executor e banco simulados, repetição de pedidos, corrida durante a execução, propriedade dos itens e bônus. Build de produção, lint sem erros e typechecks web/mobile passaram. As capturas locais cobrem inventário completo/vazio/bloqueado, chances base e drop em 1280/820/390/320 px nos dois temas, com interação de equipar/desequipar. A revisão encontrou e corrigiu o contraste do resultado no tema claro; a conferência final do console e o axe não registraram falhas nos casos exercitados. Isso não representa teste autenticado em produção nem em aparelho físico.

- Testes do domínio e componentes cobrem os 22 cenários, níveis, sensores, retomada, código sem estruturas, palavras em comentários/strings, código inativo e laços distintos executados apenas uma vez.
- Soluções foram executadas com JavaScript/TypeScript isolados, Python e Rust locais. Go 1.27.3 portátil e OpenJDK 21 do Android Studio compilaram e executaram quatro rotas representativas nos dois níveis avançados: 16 casos. O serviço externo estava indisponível nessa conferência; não foi usado como prova de execução.
- O atlas preserva a anatomia original e as roupas/personagens anteriores. O conteúdo do Mundinho para WebView móvel é regenerado pelo builder existente com os novos assets offline.
- As capturas locais em `.tmp/mundinho-learning-qa` usam componentes reais com dados sintéticos, em 1280/820/390/320 pixels, temas claro/escuro. O replay visual usa transporte simulado; a execução e os requisitos são verificados separadamente pelos testes do domínio. Isso não comprova sessão autenticada em produção ou uso em aparelho físico.

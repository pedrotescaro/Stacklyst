# Mundinho por dentro: mundo, economia e combate

## Estrutura

[AdventureHub](../../../src/components/mundinho/AdventureHub.tsx) coordena vistas como entrada, clareira, inventário, batalha e arena. [World](../../../src/components/mundinho/World.tsx) apresenta cenário, movimento, interação e personagens. O domínio está em `src/lib/mundinho`; a API autenticada está em `/api/mundinho`.

As ações formam uniões discriminadas: cada objeto tem `type` e os campos compatíveis com aquela ação. O schema Zod do repositório valida limites e alternativas. Assim, comprar, equipar, responder e mover não compartilham um payload livre sem contrato.

## Economia: três registros diferentes

| Dado              | Responsabilidade                                            |
| ----------------- | ----------------------------------------------------------- |
| `RpgPlayer.coins` | Saldo atual do jogador                                      |
| `RpgTransaction`  | Histórico de créditos/débitos com chave por usuário         |
| `sourceCoins`     | Marco da reconciliação de moedas originadas da aprendizagem |

A função `credit` usa a unicidade usuário/chave para que o mesmo evento não seja creditado duas vezes. Atualizar apenas o saldo sem registrar a origem quebraria a possibilidade de verificar repetição e extrato.

O repositório reconcilia conclusões elegíveis de exercícios e tentativas do currículo. O valor-base observado nesse fluxo é cinco moedas por atividade contada; compara a origem acumulada com `sourceCoins` e credita somente a diferença positiva. Não concede cinco moedas por qualquer clique ou execução repetida.

## Baú e check-in

O dia é calculado por `dayKey` no fuso `America/Sao_Paulo`. O baú da clareira concede 10 moedas com chave `chest:forest:<dia>`. Pedidos simultâneos/repetidos para o mesmo dia encontram a mesma chave. Há compatibilidade com o recibo legado do primeiro baú quando ele foi resgatado naquele dia.

Check-in tem `lastCheckin`, sequência e ciclo de recompensas próprios. Não é outro nome para o baú. Pular dias pode alterar a sequência calculada; reabrir a tela não cria outro dia.

Na interface, confirmação, abertura e estado resgatado são fases diferentes. Se o servidor não confirmou crédito, a animação não pode afirmar que as moedas foram recebidas. A fonte do sprite e sua exportação estão separadas do extrato financeiro do RPG.

## Inventário e equipamento

Compra procura o item nos catálogos de cosméticos ou equipamentos e calcula o preço no servidor. A posse é representada no inventário; equipar exige compatibilidade de slot. Um ID enviado livremente pelo cliente não concede o item.

`equipmentStats` considera somente IDs presentes no inventário e no slot correto. Calcula vida máxima, proteção, sorte, golpe direto e drop. Os limites atuais incluem vida-base 100 com bônus de vitalidade limitado a 50 e proteção limitada a 8.

| Cálculo                     | Regra atual                           |
| --------------------------- | ------------------------------------- |
| Golpe direto comum          | `min(100, 75 + sorte)`                |
| Exercício                   | `100 - chanceDireta`                  |
| Caça-bugs possuído/equipado | Golpe direto 100%                     |
| Drop                        | Base 50% mais sorte, em fluxo próprio |

Sorte é expressa em pontos percentuais. Um bônus de 10 leva a chance direta de 75% a 85%, não a 82,5%. A chance de exercício cai para 15%. O sorteio de equipamento ainda depende do pool/raridade/nível; não é a mesma operação do sorteio de exercício.

## Criaturas e níveis

O mapa declara criaturas e posições. A batalha salva a identidade do encontro e seus números, incluindo nível e vida máxima do inimigo. O nível do jogador, derivado do XP oficial, é usado para acesso e apresentação; não deve substituir o nível do encontro.

O catálogo inclui níveis 1, 2, 3, 4, 5 e 10. `creatureStats` calcula vida máxima `100 + max(0, nível - 3) * 20`. Assim, nível 10 tem 240 PV. O limite de turnos de criatura também escala: `max(12, nível * 2 + 4)`.

A função `canChallengeCreature` compara nível do jogador e da criatura. Mensagem da interface ajuda a entender o bloqueio; a proteção relevante também precisa existir na ação do servidor. O catálogo e o snapshot tornam consistente o nível mostrado no mundo e o usado no combate.

## Golpes contra criaturas

Os golpes são definidos em `SKILLS`:

| ID       | Nome             | Dano ao alvo em acerto | Efeito no atacante   |
| -------- | ---------------- | ---------------------- | -------------------- |
| `strike` | Aplicar conceito | 30                     | Nenhum bônus próprio |
| `focus`  | Depurar          | 18                     | Cura até 20 PV       |
| `burst`  | Refatorar        | 45                     | Desgaste de 8 PV     |

No combate contra criatura, `resolveTurn` também calcula o contra-ataque do inimigo quando ele sobrevive: dano conforme acerto/erro, nível e proteção. Não se deve aplicar automaticamente essa mesma rotina de contra-ataque ao PvP, que tem alternância explícita de jogadores.

Os cenários de código avaliam movimento/traço e estruturas exigidas. Inserir o nome de uma estrutura em comentário não comprova seu uso. Instrumentação e reprodução do traço ajudam o aluno a ver o que sua solução realmente executou.

## Arena: entrada e convite

O portal leva a uma sala privada para dois participantes. O anfitrião consulta amigos mútuos e convida uma conta elegível; o convidado aceita pela interface. Bloqueio e perda da relação exigida são verificados no servidor. Convite tem validade de cinco minutos.

`RpgArenaRoom` persiste participantes, convite, presença, posições, versão e partida. A API deriva nome, avatar completo, linguagem e nível das fontes autorizadas. O pacote de movimento contém posição/direção/estado de caminhada, não uma nova identidade ou inventário.

O pop-up reúne o adversário e as ações de convite/prontidão/revanche, deixando o mapa usar a mesma janela da clareira. Abrir o diálogo pausa a caminhada; fechar devolve o foco pela interação de diálogo do navegador.

## Presença e movimento

A implementação utiliza snapshots HTTP. O próximo pedido é programado após o anterior, em vez de iniciar requisições sem limite. A sincronização periódica do cliente usa aproximadamente 600 ms entre conclusões de pedidos; a lista social tem atualização menos frequente. Aba oculta suspende o polling correspondente.

O servidor confere área caminhável e deslocamento compatível com o tempo. O cliente interpola outros avatares. Respostas com versão antiga da mesma sala são ignoradas para não fazer o mundo “voltar no tempo”. HTTP polling e interpolação visual não são uma conexão de jogo em tempo real sem latência.

## Início da partida e equipamentos

Ambos precisam confirmar prontidão. Ao iniciar, o servidor consulta inventário/equipamento dos dois, calcula os bônus, salva `stats` e inicializa os PV conforme vida máxima. Trocar equipamento fora desse snapshot não muda retroativamente a partida. A revanche obtém um novo snapshot.

O sorteio do primeiro jogador e dos golpes é feito no servidor. A ação de ataque informa sala, partida, turno e habilidade. Pedidos de turno antigo não repetem dano.

## Turno de PvP

1. Conferir se partida está ativa e o solicitante é o ator do turno.
2. Escolher `strike`, `focus` ou `burst`.
3. Sortear golpe direto ou exercício com os bônus capturados.
4. Se direto, aplicar o efeito e alternar turno.
5. Se exercício, guardar `exerciseTurn` e a habilidade escolhida.
6. Executar é prévia; submeter solução válida resolve o turno.
7. Repetir ataque após o sorteio não troca habilidade nem refaz a chance.

A compilação externa ocorre fora da transação de sala. Ao retornar, o servidor confere novamente partida, ator e turno. Isso protege contra uma solução que terminou depois de expiração, saída ou outro fechamento.

## Dano, cura e encerramento no PvP

O dano do golpe é reduzido pela proteção do adversário, com mínimo 1. Depurar cura somente no acerto, respeitando o máximo; Refatorar aplica desgaste próprio. Falha/expiração não aplica os efeitos de acerto. O desgaste pode reduzir a vida do próprio atacante a zero.

Cada turno tem 120 segundos. Zero PV encerra; ao chegar ao limite de 20 turnos, a comparação de PV define vencedor ou empate. Saída e desconexão possuem resolução própria no serviço. Um jogador offline há mais que a tolerância não pode manter indefinidamente a partida.

PvP não entrega moedas ou XP. São partidas de prática e convivência; recompensas da economia, de criaturas e de duelos competitivos devem ser documentadas separadamente.

## Apresentação e aparência

O campo de batalha usa `battle-background.png`, também usado nas criaturas. Para cada observador, seu personagem fica embaixo à esquerda olhando à direita, e o oponente acima à direita olhando para baixo. O referencial é o observador, não o anfitrião.

O avatar preserva roupa, pele, cabelo, cor personalizada, olhos, gênero e acessórios conforme o contrato. Nome sobre o personagem usa nome de exibição autorizado. A aparência do próprio perfil social não é necessariamente o mesmo objeto do personagem RPG.

## Arte e mobile

O LibreSprite é usado na produção/exportação de recursos pixel art; fontes editáveis ficam em `artifacts/mundinho`, e arquivos de produção em `public/assets/mundinho`. Atlas, células, direções e transparência devem continuar compatíveis com os componentes consumidores.

No mobile, o build do Mundinho gera o documento embarcado e inclui arte. A ponte nativa encaminha operações autenticadas. Uma alteração de componente/asset exige regenerar o documento, mas isso não substitui gerar aplicativo instalável ou testar um aparelho físico.

## Pontos de manutenção

Ao alterar probabilidades, teste limites do sorteio e não apenas um exemplo. Ao alterar golpe, confira dano, cura, desgaste, proteção, morte própria, logs e ambos os modos. Ao alterar presença, teste pedidos antigos, aba oculta, reconexão e saída. Ao alterar economia, confira unicidade, saldo, extrato e eventos legados.

Fontes: [repositório RPG](../../../src/lib/mundinho/repository.ts), [equipamentos](../../../src/lib/mundinho/equipment.ts), [regras](../../../src/lib/mundinho/rules.ts), [arena](../../../src/lib/mundinho/arena.ts), [regras da arena](../../../src/lib/mundinho/arena-rules.ts), [protocolo documentado](../../quality/mundinho-multiplayer.md).

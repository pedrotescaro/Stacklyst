# Mundinho: exploração, aparência, economia e combate

## Responsabilidades

`AdventureHub.tsx` coordena telas e ações; `World.tsx` simula movimento/câmera/interações; `PixelArt.tsx` monta sprites; `Portrait.tsx` apresenta retratos; `WorldDialogue.tsx` cuida de conversas. CSS e assets desenham; `src/lib/mundinho/repository.ts` decide moedas, inventário e combate contra criaturas.

`types.ts` contém contratos e catálogos. `world.ts` usa `geometry.json` para dimensões, obstáculos, cenário e profundidade. `worldDepth` ordena objetos pela posição dos pés. Copa e tronco têm funções diferentes: não transforme toda a imagem da árvore em área sólida.

## Exploração

WASD/setas ou controle de toque movem o personagem. E/Espaço e botão de ação interagem com alvo próximo. Diálogos pausam movimento e devolvem foco ao fechar. A câmera acompanha a mesma simulação do personagem.

A clareira contém Ada, placa, baú e buraco da arena. Criaturas originais possuem aparição periódica; encontros 4, 5 e 10 ficam visíveis. Requisito de nível é conferido também no servidor. Ao voltar da arena, a posição fica fora do buraco para evitar retorno involuntário.

## Avatar e itens

`RpgPlayer.avatar` conserva pele, olhos, cabelo, roupa, acessórios e opções como gênero e cor personalizada. Cada camada aponta para uma linha do atlas. Retrato, imagem do perfil e personagem pequeno não são um único arquivo intercambiável.

Compra e equipamento conferem catálogo/inventário no servidor. Trocar um índice no cliente não concede posse. `equipment.ts` calcula vida, proteção e sorte; cosméticos têm papel visual. Alterações de equipamentos durante combate seguem restrições próprias.

## Moedas e baú

Saldo fica em `RpgPlayer`; `RpgTransaction` registra lançamentos com chave única por usuário/operação. Atividades, check-in, missões e vitórias possuem critérios próprios. O extrato explica a origem do saldo.

O baú paga 10 moedas por dia pelo relógio do banco e dia de Brasília. Fica fechado antes, anima depois da confirmação e permanece aberto naquele dia. Pedidos repetidos não pagam novamente. Falha de rede não deve confirmar crédito. Consulte [baú diário](../quality/mundinho-daily-chest.md).

## Criaturas e avaliação

Iniciar batalha salva criatura, linguagem, nível e vida máxima. O catálogo cobre níveis 1 a 5 e o Titã do Vazio nível 10 com 240 PV. O nível do jogador vem do XP oficial; não substitui o nível do inimigo.

`rules.ts` resolve golpes/contra-ataques. `codeChallenges.ts` define cenários por linguagem e estágio pedagógico; `codeChallengeStructures.ts` verifica estruturas executadas. Palavras em comentários não satisfazem requisito de condicional/repetição. `CodeBattle.tsx` edita, executa e reproduz o traço.

Estágio pedagógico e nível da criatura são diferentes: os estágios até 3 representam sequência, condicionais e repetição. Criatura nível 10 não implica dez estágios sintáticos. Sorte, golpes diretos e exercícios têm tratamento próprio no servidor; a interface não decide o dano.

## Multiplayer

O buraco leva à arena privada para dois. Amigos precisam se seguir mutuamente e não estar bloqueados. O anfitrião convida, o outro aceita na interface, e ambos confirmam o início. Cada participante conserva a linguagem escolhida ao entrar no Mundinho.

`arena.ts` verifica identidade, participação, amizade, movimento, turno e execução; `arena-rules.ts` reúne regras puras; `arena-types.ts` define contratos; `MultiplayerArena.tsx` apresenta lobby/presença/combate. A ação `arena` passa pela API `/api/mundinho`, usando o usuário da sessão.

Presença usa snapshots HTTP, não uma conexão WebSocket. Posição e direção são validadas; nomes e roupas vêm do banco. Versões monotônicas impedem respostas antigas de sobrescrever estado novo. Aceites usam bloqueios em ordem consistente para impedir entrada concorrente em salas diferentes.

A arena usa a mesma janela de jogo da floresta. O botão “Convidar amigo” / “Adversário e batalha” abre um pop-up com avatar, nome, linguagem, nível e os bônus capturados na partida, além de convite e confirmação/revanche. Escape ou Fechar devolve o foco ao mapa; a movimentação pausa durante o pop-up.

Cada jogador tem 100 PV mais os bônus de relíquia. Os mesmos três golpes dos bugs estão disponíveis: Aplicar conceito (30 de dano), Depurar (18 de dano e cura de até 20 PV) e Refatorar (45 de dano e 8 PV de desgaste). A proteção do alvo reduz o dano (mínimo 1). Cura respeita a vida máxima, falhar no exercício não aplica os efeitos, e desgaste pode derrotar o atacante. A chance base de exercício é 25%; amuletos a reduzem e Caça-bugs equipado a zera. Os bônus de ambos são fixados pelo servidor no início da partida. O servidor guarda o golpe escolhido até resolver o exercício, sem permitir trocar a habilidade ou refazer o sorteio; executar é prévia, submeter encerra o turno. Há dois minutos por turno. Cada rodada adapta o mesmo cenário às linguagens. Equipamentos funcionam no PvP; não há XP/moedas por esse modo. Vitória, empate, desistência, desconexão e revanche possuem regras persistidas.

A batalha usa `battle-background.png`, compartilhado com criaturas: você embaixo à esquerda olhando à direita; adversário acima à direita olhando para baixo, mostrando o rosto. A posição é relativa ao observador, não ao papel de anfitrião. O cenário subterrâneo permanece no lobby.

Consulte [protocolo multiplayer e persistência](../quality/mundinho-multiplayer.md) para limites, tempos, migration e evidências de teste.

## Arte, som e mobile

Scripts `build-mundinho-*` e `refine-mundinho-sprites.mjs` geram/exportam recursos. `artifacts/mundinho` conserva fontes editáveis; `public/assets/mundinho` contém produção. Arena e buraco são exportados pelo LibreSprite. Regenerar atlas exige conferir células, transparência e metadados consumidos pela interface.

`battleAudio.ts` administra sons/preferências. Movimento reduzido mantém confirmação sem exigir animações longas. No aplicativo, `build-mundinho.mjs` empacota componentes/assets e `AdventureScreen.tsx` encaminha chamadas pela ponte autenticada. Arte embarcada não torna multiplayer disponível sem rede.

## Mudanças comuns

- Criatura: catálogo, posição alcançável, sprite, requisito, vida, dano e consistência mapa/servidor.
- Recompensa: catálogo, chave estável, extrato, transação e replay concorrente.
- Desafio: versões por linguagem, instrumentação, traço correto/incorreto e falha do executor.
- Multiplayer: duas identidades, convite alheio, expiração, bloqueio, reconexão, golpe duplicado e aceites simultâneos.

# Mundinho: arena multiplayer e níveis das criaturas

## Fluxo entregue

O buraco com escadaria fica em `(600, 430)` na clareira. Aproximar-se e interagir, ou caminhar sobre ele, abre a arena subterrânea. A saída retorna para uma posição fora do buraco, evitando teleporte de volta involuntário.

A arena é privada para dois jogadores. O anfitrião vê até 100 amigos mútuos, excluindo bloqueios nas duas direções. O convidado recebe um convite no Mundinho, aceita e entra na mesma sala. Convites expiram em cinco minutos; a lista de entrada atualiza a cada oito segundos enquanto a tela está visível. Não há envio de e-mail ou push.

Os nomes vêm do nome de exibição salvo do perfil, com fallback para o usuário. O avatar completo vem de `rpg_players.avatar`: roupa, pele, cabelo, cor personalizada, olhos, gênero e acessórios. Identidade e aparência não são aceitas nos pacotes de movimento.

A presença usa snapshots autenticados sobre HTTP, com novo pedido 600 ms após o anterior terminar. A lista de amigos é reconsultada a cada 12 snapshots. O servidor valida limites do cenário e deslocamento; os outros avatares interpolam o movimento. Aba oculta interrompe o polling. Offline é indicado após 30 segundos; uma batalha resolve desconexão prolongada após 90 segundos.

## Combate

Cada participante conserva a linguagem escolhida ao entrar no Mundinho. Ambos confirmam o início. Equipamentos e sorte não alteram o PvP: cada jogador tem 100 PV, código correto causa 30 de dano e a vez alterna após uma submissão. Executar é apenas uma prévia. Cada turno tem dois minutos; ao expirar ele passa ao oponente. Após 20 turnos vence quem tiver mais vida, com empate quando as vidas forem iguais.

Os dois recebem o mesmo cenário por rodada, traduzido para sua própria linguagem. O estágio pedagógico usa o menor nível dos participantes, até o estágio 3 existente de condicionais e repetições. O compilador e a validação de traço são os mesmos do combate contra criaturas. Falha de infraestrutura preserva o turno. Não se entrega a solução nem o código do adversário.

Uma submissão informa sala, partida, turno e desafio. O servidor verifica tudo antes de executar e novamente sob bloqueio de linha antes de aplicar o dano. O compilador roda fora da transação. Pedidos repetidos ou atrasados não repetem o golpe. Desistência resolve a vitória do outro jogador; ambos podem confirmar uma revanche. PvP não concede moedas/XP para evitar recompensas repetidas entre as mesmas contas.

## Criaturas

O catálogo da floresta agora cobre níveis 1, 2, 3, 4, 5 e 10. Sentinela de Ferro é nível 4, Chama Indomável é nível 5 e Titã do Vazio é nível 10. Esses três encontros permanecem visíveis. O chefe tem 240 PV, contra-ataque baseado no nível 10 e limite de turnos maior; o requisito de nível também é validado no servidor.

`enemyLevel` e `enemyMaxHp` são salvos ao iniciar a batalha. Entrada, combate, seleção de exercícios, drops e interface usam o nível do encontro. Os rótulos distinguem explicitamente “Inimigo” de “Seu nível”. Batalhas inseridas por clientes antigos, que omitem o snapshot e recebem o default do banco, mantêm o nível correto do catálogo.

## Persistência e arte

Migration: `20261102180000_mundinho_multiplayer_arena`. Cria `rpg_arena_rooms`, índices de anfitrião/convidado/convites, referências aos usuários, restrições de linguagens/participantes distintos e os snapshots das criaturas. RLS fica habilitada, sem acesso direto para `anon`, `authenticated` ou `PUBLIC`; a API verifica sessão, origem, participação, amizade mútua e bloqueios. Remover a amizade ou bloquear impede continuar usando a sala.

A migration foi ensaiada com rollback e aplicada pelo cliente PostgreSQL em uma transação única, com o checksum SHA-256 do arquivo registrado no histórico Prisma. O mecanismo nativo de migrations não conectou neste ambiente. A migration antiga pendente `20260914233000_add_event_challenges` foi excluída desta aplicação.

`node scripts/build-mundinho-arena.mjs` gera a arte original e exporta pelo LibreSprite:

- `public/assets/mundinho/arena.png`: cenário de 768 × 512 px.
- `public/assets/mundinho/portal-hole.png`: seis quadros de 64 × 48 px.
- `artifacts/mundinho/libresprite/arena/`: fontes ASE em camadas, metadados e manifest de origem.

O bundle mobile inclui ambos os assets e usa a ponte autenticada existente. A arena não depende de conexão direta do WebView ao banco.

## Validação e limites da evidência

Testes unitários verificam movimento, teleporte, nível/vida das criaturas, desenho do avatar remoto e o despacho autenticado da API. A integração PostgreSQL usa usuários temporários e execução real JS/TS para conferir uma partida completa, concorrência de submissões, prévia, vitória, revanche, desistência, bloqueios e convites expirados.

A verificação da interface usa dois contextos Chromium isolados, com 1280 px e 390 px, a interface real e os serviços reais sobre PostgreSQL. As identidades são injetadas por um servidor de teste restrito a localhost; esse teste não substitui login Supabase nem comprova implantação em produção. As contas de teste são removidas ao terminar. Compiladores remotos das demais linguagens e aparelhos físicos não foram exercitados neste fluxo.

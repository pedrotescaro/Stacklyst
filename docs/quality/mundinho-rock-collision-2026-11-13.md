# Meu Mundinho — pedras completas e colisão

A faixa original `artifacts/mundinho/bluestar-source/spr_tile_pedra.png` tem 80 × 16 px. As duas pedras atravessam os limites dos tiles de 16 px; o gerador anterior desenhava metades isoladas no fundo.

## Correção

- `scripts/build-bluestar-world.py` extrai as células completas `(16, 0, 48, 16)` e `(48, 0, 80, 16)` e produz `blue-rocks.png`, com dois quadros de 64 × 32 px na escala do mundo.
- As oito pedras visíveis mantêm suas posições no mapa. Elas saíram do fundo `blue-meadow.png` e agora são entidades desenhadas por `World.tsx`, com posições, quadros, âncora e bases sólidas descritos em `geometry.json`.
- `world.ts` deriva as colisões e a profundidade dessas mesmas posições. A base impede atravessamento; a parte superior pode ocultar o personagem quando ele passa atrás. A recuperação de posições salvas também considera as pedras.
- O sorteio do terreno foi preservado. Os atlas de árvores, casa, batalha, arena, placa, criaturas e portais não mudaram.
- O bundle móvel incorpora o novo atlas junto do fundo atualizado.

## Verificação

Os testes cobrem todas as bases, passagem nas bordas e atrás, movimento longo, recuperação de posição salva, alinhamento entre renderização e colisão, profundidade e ausência de pedras na arena. A busca de caminhos existente continua verificando que todos os encontros e objetos interativos são acessíveis.

Validação final: 242 testes aprovados e um ignorado em `src/lib/mundinho`, `src/components/mundinho` e `src/app/api/mundinho`, excluindo as cópias independentes de `.claude`. O builder mobile terminou com 5941 KiB, incluindo o atlas e os áudios originais. ESLint não encontrou erros nos arquivos TypeScript alterados; permanece o aviso anterior de `<img>` em `AdventureHub`.

Uma página local isolada carregou os componentes reais `World` e `VeilBoss` em Chromium. O personagem em `(310, 648)` permaneceu nessa posição ao andar contra a pedra e conseguiu contorná-la, chegando a aproximadamente `(366, 592)`. As capturas desktop e celular estão em `artifacts/mundinho/rock-audio-repair/`; `browser-check.json` registra o movimento e a reprodução dos MP3 originais, incluindo a troca entre mapa e boss, mute, retorno do segundo plano e descarte do áudio. Nenhum erro JavaScript foi observado.

Essa verificação usa os componentes e arquivos locais; não valida autenticação, implantação em produção ou aparelho físico.

O `npm run typecheck` geral encontrou referências antigas em `.next/dev/types/validator.ts` a rotas de guildas ausentes e um erro em `scratch/enade/qa/main.tsx`. A checagem de todo `src`, excluindo rascunhos e arquivos gerados de `.next`, passou.

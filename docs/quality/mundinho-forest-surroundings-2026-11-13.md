# Meu Mundinho — floresta ao redor do mapa

O modo de mapa completo preserva a proporção da clareira, deixando espaço acima/abaixo ou nas laterais conforme a janela. Esse espaço agora usa uma continuação decorativa da floresta, com o mesmo gramado e as mesmas árvores do cenário.

`scripts/build-bluestar-world.py` gera `blue-forest-fringe.png`, uma textura opaca de 512 × 384 px com árvores extraídas do atlas existente e cópias nas bordas para repetição contínua. Uma semente separada preserva os recursos anteriores: a comparação SHA-256 dos PNGs `blue-*` antes/depois confirmou que nenhum deles mudou.

O fundo da viewport acompanha a escala e os deslocamentos da câmera de `World.tsx`, inclusive ao alternar a visão completa. Como é um fundo CSS, não intercepta toques nem entra na ordem visual das entidades. O tamanho do mundo e suas colisões permanecem os mesmos. A arena mantém sua apresentação própria. O builder mobile incorpora o novo PNG para uso offline.

## Validação

- 23 testes existentes de mundo e colisão aprovados.
- ESLint de `World.tsx` sem erros e formatação dos arquivos alterados aprovada.
- Build móvel aprovado, com 5977 KiB.
- Chromium: conferidos desktop estreito, desktop largo e celular. O fundo acompanha escala/origem do mapa, os controles abrem o guia e alternar o mapa mantém a posição do jogador. Nenhum erro JavaScript foi observado; o fundo da arena permanece sem textura de floresta.
- Capturas e medidas: `artifacts/mundinho/forest-surroundings/`.

A revisão usa componentes locais reais em uma página de verificação isolada; não valida implantação nem aparelho físico.

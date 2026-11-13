# Mundinho: corpo compacto, combate e colisão — 13/11/2026

O corpo do personagem foi ajustado à referência chibi fornecida: tronco curto, braços próximos e calçados pequenos, conectados e visíveis. O desenho usa as mesmas proporções na caminhada e nas oito poses de ataque, com as paletas e escolhas salvas existentes. Os nove cabelos receberam perfis laterais com mechas, volume e nuca mais definidos; frente, costas e retratos foram preservados.

## Combate

- O efeito de dano mantém o personagem opaco e usa deslocamento/brilho para indicar o impacto. A derrota também mantém o corpo visível.
- Corpo, roupa e arma de ataque são carregados e decodificados antecipadamente. Enquanto qualquer imagem estiver pendente ou falhar, a composição normal permanece visível. Os recursos decodificados são compartilhados entre avatares e o bundle móvel fornece as mesmas imagens.
- A resposta confirmada do servidor atualiza vida/dano/cura no momento de cada impacto. Os demais campos do turno continuam bloqueados até o fim da sequência. Refatorar nunca apresenta vida negativa.
- Uma consulta de fundo antiga que falha depois de um turno confirmado não substitui o resultado por um erro obsoleto.

## Colisão e profundidade

`geometry.json` descreve a âncora no chão e o retângulo sólido local de cada família de cenário. `world.ts` deriva colisão e profundidade das mesmas posições usadas para desenhar os objetos, evitando retângulos deslocados dos troncos.

- Árvores: troncos sólidos, copas livres para passagem atrás, ordem visual pela base.
- Casa: parede e fundação sólidas; o telhado permite a passagem atrás e oculta o personagem.
- Baú e placa: bases sólidas alinhadas à arte; espaço de interação preservado. O portal permanece transitável.
- O movimento verifica o trajeto em subpassos de até quatro pixels para impedir atravessar objetos em frames longos e preserva o deslizamento junto às paredes.
- Posições salvas que agora caem dentro de um sólido são ajustadas para um ponto livre próximo ao entrar na floresta.

As fontes editáveis do herói e os PNGs são gerados pelo construtor central. Os atlas de criaturas, cenário e retratos não precisam ser substituídos.

## Validação

A verificação cobre carregamento lento/falha/cache das imagens, impactos e vida do combate, colisões dos objetos, passagem atrás de copas/telhado, movimento longo e recuperação de posição salva. O verificador dos sprites cobre conexão e visibilidade dos pés nas poses, espelhamento, paletas, olhos, mãos e arma, além das regressões existentes de roupa e retrato.

- 220 testes aprovados e um ignorado no escopo do Mundinho, incluindo componentes, regras e API.
- `npm run test:mundinho-sprites` aprovado com os atlas finais. O contato das solas fica em y25; o avatar de 40px no mundo recebe deslocamento de 7,5px para coincidir com a posição lógica dos pés.
- TypeScript dos componentes/rotas de `src` aprovado, com a configuração local que exclui os arquivos de rascunho e projetos móveis independentes.
- ESLint dos arquivos afetados sem erros; permaneceu um aviso preexistente de `<img>` em `AdventureHub`.
- `npm run mobile:build-mundinho` aprovado; pacote compartilhado regenerado com aproximadamente 2168 KiB.
- Composições finais dos PNGs: `artifacts/mundinho/battle-collision-repair/body-and-combat.png` e `side-hair-catalog.png`.

A revisão visual usa composições dos PNGs de produção, não capturas de navegador. A ferramenta de navegação local estava indisponível nesta sessão; interação autenticada, aparelho físico e implantação em produção não foram validados por essa revisão.

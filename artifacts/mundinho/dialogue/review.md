disposition: ship

Revisão local substitutiva: o agente independente não executou por limite de uso. Escopo: extensão do Mundinho conforme referência do usuário, sem novo conceito visual ou comp gerado. Evidências sintéticas em Chromium, sem aparelho físico.

## persistence

Fontes LibreSprite, gerador, manifesto e proveniência dos seis atlas acompanham o código. Decisões e limites registrados em `docs/quality/mundinho-refinement.md`.

## fidelity

| Elemento | Resultado |
| --- | --- |
| Fundo preto da barra inferior | Match; RGB 0,0,0 medido no navegador |
| Nome e fala com retrato grande à esquerda | Match no desktop |
| Três escolhas e alternância Ada/jogador | Match, exercitado em testes e navegador |
| TYPE: fonte pixel art | Match; Pixelify com acentos |
| MATERIAL: retratos pixel art | Match; sprites raster originais com contornos, sombra e camadas |
| GROUND: painéis pretos | Match; medidores conservam cores funcionais |
| Mobile | Adaptação: retrato menor e respostas empilhadas para toque e legibilidade em 320/390 px |
| Editor | Match; duas silhuetas e prévia das peças atuais, salvamento validado |

## ceiling

Retratos estáticos conforme pedido. Expressões animadas não fazem parte desta entrega. Os dez screenshots nomeados em `verification.json`/diretório foram inspecionados, incluindo editor offline.

## material_fixes

Nenhuma correção material restante identificada nesta revisão local. Avisos do detector sobre transição de largura pertencem a medidores existentes, não ao diálogo.

## keep

Preservar fundo preto, camadas sincronizadas com o avatar, identidade fixa de Ada, pausa de movimento e alvos de toque legíveis.

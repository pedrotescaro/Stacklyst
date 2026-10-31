# Identidade Stacklyst

O símbolo é o S azul enviado pelo proprietário, vetorizado a partir do contorno original. Ele substitui a primeira letra do nome: **S + tacklyst**. O nome acessível continua "Stacklyst".

A tipografia da assinatura é **Sora SemiBold, peso 600**, com espaçamento de **-0,02em**. Na web, `BrandLogo` usa a fonte hospedada por `next/font`; no aplicativo, os contornos da mesma fonte preservam a identidade sem depender de fontes do aparelho. A licença está em `public/brand/OFL-Sora.txt`.

O símbolo e o texto usam o mesmo Electric Blue #0083FE nas duas aparências, conforme a preferência do proprietário. A cor é compartilhada por `--brand-color`, com preenchimento do símbolo em `currentColor`; a entrada usa máscaras, sem fades individuais que alterem a cor percebida. A referência aprovada deixa o S maior que o texto: o tamanho da fonte é 0,76 da altura do símbolo, preservando Sora 600 e -0,02em. O monograma sozinho serve aos ícones e à navegação recolhida. A assinatura completa aparece nos cabeçalhos, rodapés e autenticação.

O tamanho solicitado é um teto, não uma dimensão fixa: `BrandLogo` limita a altura do símbolo à largura da tela e ao contexto. Navegação: 18–24px; assinaturas comuns: até 22px em telas pequenas e 32px no desktop; abertura: 28–44px. O texto acompanha proporcionalmente o símbolo. A abertura não deve ocupar a largura inteira da tela.

A abertura mantém símbolo e texto nas suas posições finais desde o início. O S é revelado gradualmente de baixo para cima em 620ms; após uma pausa de 40ms, "tacklyst" aparece da esquerda para a direita em 380ms. A marca completa permanece por 160ms antes da dissolução de 360ms para a página. O S nunca passa sobre o texto, e o conjunto não se move nem muda de escala. A sequência nominal termina em 1,56 segundo; a preferência de redução de movimento mantém somente uma transição de opacidade de 80ms. Não representar progresso com porcentagens sem dados reais.

Essa revisão altera a marca e a abertura. Os tokens de produto, a estrutura de navegação e o mascote seguem a implementação existente. As novas telas de recuperação e onboarding usam os mesmos controles e cores operacionais.

## Mundinho — refinamento de sprites e escala

O RPG usa atlas PNG animados exportados pelo LibreSprite, com camadas independentes para aparência. Sprites do mapa compartilham escala: jogador e guia em 40 px, criaturas em 28 px. Nomes dos encontros ficam ocultos até hover, reduzindo ruído. O HUD usa controles escuros de 40 px; no toque, um analógico proporcional substitui o direcional por setas. A arena posiciona adversário acima à direita e jogador abaixo à esquerda, com narrativa e habilidades abaixo do cenário. Vida e recompensas continuam autoritativas no servidor. Movimento reduzido desativa animações e transições. Fontes e navegação principal seguem a identidade existente.

Roupas e rostos usam contornos seletivos finos e cores de sombra locais. Os retratos têm feições inspiradas em anime, com olhos expressivos e nariz/boca discretos. Os seis penteados possuem franjas independentes; o rosto base não inclui cabelo fixo. O catálogo compartilhado contém doze roupas com cortes e detalhes próprios, preservando os índices das escolhas antigas. A opção de gênero define as feições no retrato e no personagem pequeno, sem alongar a anatomia original. Fontes `.ase` e PNGs de produção são exportados pelo LibreSprite.

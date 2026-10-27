# Identidade Stacklyst

O símbolo é o S azul enviado pelo proprietário, vetorizado a partir do contorno original. Ele substitui a primeira letra do nome: **S + tacklyst**. O nome acessível continua "Stacklyst".

A tipografia da assinatura é **Sora SemiBold, peso 600**, com espaçamento de **-0,02em**. Na web, `BrandLogo` usa a fonte hospedada por `next/font`; no aplicativo, os contornos da mesma fonte preservam a identidade sem depender de fontes do aparelho. A licença está em `public/brand/OFL-Sora.txt`.

O símbolo e o texto usam o mesmo Electric Blue #0083FE nas duas aparências, conforme a preferência do proprietário. A cor é compartilhada por `--brand-color`, com preenchimento do símbolo em `currentColor`; a entrada usa máscara e movimento, sem fades individuais que alterem a cor percebida. O monograma sozinho serve aos ícones e à navegação recolhida. A assinatura completa aparece nos cabeçalhos, rodapés e autenticação.

O tamanho solicitado é um teto, não uma dimensão fixa: `BrandLogo` limita a altura do símbolo à largura da tela e ao contexto. Navegação: 18–24px; assinaturas comuns: até 22px em telas pequenas e 32px no desktop; abertura: 28–44px. O texto acompanha proporcionalmente o símbolo. A abertura não deve ocupar a largura inteira da tela.

A abertura apresenta o S no centro e o desloca suavemente para sua posição enquanto revela "tacklyst" na mesma Sora SemiBold. Símbolo e nome compartilham a opacidade de entrada e saída, preservando a igualdade de cor. A marca mantém seu tamanho durante toda a sequência; uma breve pausa após a formação precede a dissolução de 360ms para a página já pronta por baixo. A sequência termina em 1,32 segundo; a preferência de redução de movimento mantém somente uma transição de opacidade de 80ms. Não representar progresso com porcentagens sem dados reais.

Essa revisão altera a marca e a abertura. Os tokens de produto, a estrutura de navegação e o mascote seguem a implementação existente. As novas telas de recuperação e onboarding usam os mesmos controles e cores operacionais.

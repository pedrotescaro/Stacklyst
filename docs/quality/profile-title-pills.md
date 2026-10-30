# Títulos arredondados e preenchidos

Atualização de 30/10/2026. O componente web compartilhado `ProfileTitle` usa formato de pílula e fundo opaco na cor original do título. O texto e o ícone recebem uma cor com contraste mínimo de 4,5:1. “Iniciante” continua sem ícone.

A apresentação é compartilhada por perfil, prévia de personalização, postagens, respostas, notificações e ranking. Os títulos não dependem mais da cor de fundo da página para definir sua aparência.

Validação: 53 testes existentes passaram nas nove áreas/componentes verificados, além do ESLint (sem erros, apenas avisos existentes sobre imagens), TypeScript do build, build de produção e smoke test do executor. A fixture local renderizou 35 badges, cobrindo o catálogo padrão, cores adicionais e nome longo, em 320, 390 e 1440 px nos temas claro e escuro. Todos tiveram fundo opaco e raio de 999 px; Axe não encontrou violações WCAG A/AA e não houve overflow horizontal. Capturas e métricas: `.impeccable/review/title-pills/`.

A verificação visual usa os componentes reais em uma fixture local, sem E2E autenticado em produção. Não houve mudança de esquema ou dados persistidos.

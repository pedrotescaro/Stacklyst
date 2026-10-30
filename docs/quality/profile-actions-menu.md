# Ações do perfil

O cabeçalho de perfis de outras pessoas reúne, nesta ordem, três pontos, mensagem e Seguir/Seguindo. Os dois primeiros controles são circulares, com contorno e área de toque de 44 × 44 px. O botão de seguir usa o mesmo contorno e altura, com largura estável para manter o alinhamento.

Desafiar e Bloquear ficam no menu de três pontos. Desafiar mantém o fluxo de convite existente. Bloquear abre uma confirmação com cancelamento, foco contido e retorno de foco ao botão de origem. A opção solta de bloqueio foi removida. A edição do próprio perfil continua disponível sem esses controles de visitante.

Mensagem abre `/messages?to=<username>` e seleciona a conversa existente ou prepara um rascunho usando os dados atuais do perfil. Abrir o rascunho não envia mensagens nem cria registros no servidor. Perfis indisponíveis ou bloqueados não abrem uma nova conversa. As APIs existentes continuam aplicando o bloqueio.

## Verificação em 29/10/2026

- 27 testes passaram, cobrindo menu por teclado, desafio, confirmação/cancelamento, retorno de foco, edição do perfil e resolução do destinatário.
- Build de produção, smoke do executor de código e typecheck passaram.
- ESLint dos arquivos alterados passou sem erros.
- Verificação visual local em 1440, 390 e 320 px: os três controles permanecem na mesma linha, têm pelo menos 44 px e não causam rolagem horizontal.
- O menu oferece as duas ações e retorna o foco com Escape. A confirmação não apresentou violações no axe WCAG 2.2 AA nas três larguras verificadas.

As capturas em `.impeccable/review/profile-actions/` usam os componentes reais, CSS global e a fonte Inter do build, com dados locais de demonstração e navegação lateral/publicações substituídas na fixture. Isso verifica o layout e a interação local; não comprova uma sessão autenticada ou entrega de mensagens em produção. Os testes de destinatário cobrem a preparação da conversa sem escrita.

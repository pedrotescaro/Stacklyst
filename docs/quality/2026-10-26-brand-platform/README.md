# Entrega: marca, acesso e integridade funcional

A marca usa o S enviado como primeira letra e `tacklyst` em **Sora SemiBold 600**, com espaçamento **-0,02em**, ambos em **#0083FE**. A proporção revisada segue a referência do proprietário: símbolo maior e texto com tamanho de fonte equivalente a 0,76 da altura do S. Os componentes compartilhados cobrem navegação, autenticação, rodapés, demonstração, loading, favicon e aplicativo. A abertura revela primeiro o S, fixo, em 620ms; depois o nome, a partir de 660ms. A sequência nominal termina em 1,56s, incluindo dissolução de 360ms. Após cadastro/onboarding bem-sucedidos, navega quando a abertura termina; durante o salvamento de preferências, mantém apenas a marca do cabeçalho. Redução de movimento desativa a formação.

## Alterações funcionais

- Recuperação de senha por e-mail, confirmação e reenvio sem confirmação administrativa. O reset requer sessão verificada e comprovante HttpOnly de recuperação de 15 minutos.
- Onboarding salva feed e linguagens por usuário, filtra o feed antes da paginação e inicia a seleção de trilhas.
- A atualização de candidatura devolve somente o perfil público. Recrutador edita etapa/feedback; candidato vê o resultado e recebe notificação com vaga, empresa e link.
- Falhas de infraestrutura do executor não alteram progresso, concedem XP ou geram vitória. Resultados inválidos são rejeitados; duelos sem submissões válidas encerram sem vencedor.
- Moderação valida a denúncia e resolve exclusão/cascatas. Alterações concorrentes de papel preservam o último administrador; ações registram auditoria transacional com retenção mínima de 180 dias.
- Chat consulta as mensagens mais recentes, pagina o passado e ignora respostas de conversas antigas. Eventos derivam encerramento dos horários. Ranking usa as faixas reais de XP e a linguagem selecionada.

## Evidência local

| Verificação                          | Resultado                                                                                                 |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| Suíte web completa com V8            | **701 testes passaram**, 11 ignorados, 132 arquivos passaram                                              |
| Cobertura das áreas selecionadas     | **62,5% linhas**, 58,66% instruções, 48,7% branches; escopo em `vitest.config.ts`                         |
| Recuperação / onboarding / auditoria | Endpoint forgot-password, endpoint onboarding, parsing onboarding e módulo auditoria: **100% das linhas** |
| PostgreSQL 17 isolado                | **4 integrações passaram**, incluindo rebaixamento concorrente e retenção real                            |
| Concorrência de duelos               | 50 resoluções simultâneas convergem para uma recompensa (teste de contrato)                               |
| Build de produção                    | Passou, incluindo execução do avaliador empacotado JS/TS e casos públicos/ocultos, sem chamadas externas  |
| Typecheck web e mobile               | Passou                                                                                                    |
| ESLint web                           | 0 erros; 407 avisos existentes ou fora do escopo imediato                                                 |
| Audit web                            | **0 vulnerabilidades** após patches compatíveis e remoção de dependência HTML não utilizada               |
| Mobile                               | Typecheck, lint, configuração, notificações, Expo install check e export Hermes Android/iOS passaram      |

A varredura teve **zero violações axe** em 14 visualizações. Após remover duas entradas sequenciais, o LCP local da página inicial foi **1,30 s no desktop e 1,964 s no celular**, com CLS zero. A confirmação final repetiu a página inicial nos dois tamanhos.

`web-quality.json` contém a medição em Chrome local sobre o build de produção, nas larguras 1440 e 390 px. O script verifica cor da marca, overflow, foco, redução de movimento, erros JavaScript, axe WCAG 2.2 AA, LCP e CLS. A medição local não comprova Core Web Vitals de usuários reais nem acessibilidade completa por tecnologias assistivas.

`coverage-summary.json` contém a cobertura por arquivo das áreas selecionadas, incluindo código preexistente desses módulos. A medição é deliberadamente explícita: não representa cobertura de toda a aplicação nem afirma cobertura alta de todos os serviços.

A nova abertura sequencial passou no build de produção e em **14 testes direcionados** de cadastro, navegação, conclusão da animação e marca única durante o salvamento do onboarding. `artifacts/brand/sequential-entry-verification.json` registra quadros de 200, 640, 850 e 1100ms nas larguras **320, 390 e 1440px**: S fixo, nome oculto até o símbolo terminar, ausência de sobreposição, mesma cor e proporção semelhante à referência (S/texto: 1,40 no celular e 1,375 no desktop; referência 1,385). A conclusão real e a preferência de redução de movimento também passaram. A conclusão acompanha o evento de término da transição, com fallback e proteção contra navegação duplicada.

`artifacts/brand/native-brand-verification.json` registra ícones e assinatura do aplicativo, configuração e exports Hermes Android/iOS e web. O favicon exportado contém o novo S azul. Typecheck, lint e teste de configuração passaram. Os novos ícones nativos precisam de outro binário para aparecer no aplicativo instalado; não foi gerado APK nem feita validação visual em aparelho. A evidência de quadros no navegador não comprova taxa de quadros do compositor nem fluidez em aparelho real. Os artefatos `loading-verification.json` e `sora-verification.json` preservam as medições das revisões anteriores.

## Pendências de ambiente

1. Configurar e comprovar SMTP, templates e URLs permitidas do Supabase com uma conta de teste autorizada. Nenhum e-mail real foi enviado nesta tarefa. Ver `docs/security/auth-email-setup.md`.
2. A migração `20261027010000_security_audit_retention` foi aplicada e verificada no banco de produção em **27/10/2026**, antes da publicação do código, com SQL e registro Prisma na mesma transação. A tabela, RLS, índices, trigger e ausência de privilégios de `anon`/`authenticated` foram conferidos após o commit; o histórico anterior e os dados de usuários foram preservados. Evidência: `production-audit-migration.json`. Falta agendar a limpeza autenticada. Permanecem a migração histórica de `EventChallenge` ausente, uma divergência antiga de checksum e a falha anterior no bootstrap de banco vazio; ver `docs/security/audit-retention.md`.
3. Audit mobile permanece com **5 altos e 3 moderados transitivos**. Não houve atualização de SDK ou override incompatível para ocultar o problema. Expo Doctor passou 20/21; o item restante marca `react-native-render-html` como sem manutenção. Detalhes em `mobile-validation.json`. O gate de CI `npm audit --audit-level=high` continua bloqueado no mobile.
4. Os bundles mobile não comprovam instalação, teclado, layout ou reprodução em aparelho. Nenhum APK novo foi gerado. Ranking por divisão filtra os 50 primeiros da consulta e informa esse limite na interface.

Para repetir: `npm test -- --coverage`, `npm run build`, `npm run typecheck`, `npm run lint`, `npm audit --audit-level=high`; com servidor de produção na porta 3100, `node scripts/verify-web-quality.mjs`. A integração PostgreSQL tem opt-in restrito ao banco descartável descrito na documentação de auditoria.

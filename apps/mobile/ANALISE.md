# Adaptação do Stacklyst para mobile

Análise realizada em 16 de outubro de 2026. A inspeção pública de `https://stacklyst.vercel.app/` foi complementada pela leitura das páginas, componentes, serviços, rotas de API e do cliente móvel já presente no repositório. As áreas autenticadas abaixo foram mapeadas pelo código; isso não comprova uma sessão de produção nem operações reais na conta de um usuário.

## Site atual

Na viewport estreita inspecionada, aproximadamente 321 × 660, a landing apresenta a marca Stacklyst, criação de conta, título principal e ações **Começar agora** e **Ver demonstração**. O título principal ultrapassa a largura nessa medida. A demonstração pública é uma miniatura de interface desktop, com cenas de Feed, Trilhas, Duelos, Perfil e Ranking e indicação de atividade ilustrativa; sua escala dificulta a leitura no celular.

Na área autenticada, a análise de `src/components/Sidebar.tsx` mostra sidebar a partir de 768 px e, abaixo desse ponto, header com marca e avatar, menu de conta em dropdown e quatro destinos inferiores: Feed, Trilhas, Notificações e Perfil. O feed aplica padding inferior e safe areas para essa navegação e organiza a lista com compositor no topo. Essas observações de implementação não equivalem a testes autenticados no navegador.

O produto reúne interação social e aprendizado de programação. O feed suporta publicações, trechos de código, imagens, votos, respostas, itens salvos e filtros de comunidade ou pessoas seguidas. Trilhas e exercícios usam progresso, pré-requisitos e avaliação no backend. Mensagens e notificações conectam essas atividades. Ranking, duelos, vagas, eventos e áreas por papel complementam o fluxo principal. Comunidades têm páginas e API no código atual, embora o link esteja comentado no menu lateral web.

## Organização no app

| Necessidade                      | Organização móvel                              | Motivo                                             |
| -------------------------------- | ---------------------------------------------- | -------------------------------------------------- |
| Ler e acompanhar publicações     | Aba Início, lista contínua e separadores finos | Mantém foco no conteúdo e reduz contêineres        |
| Encontrar conteúdo e pessoas     | Aba Explorar com busca                         | Acesso frequente sem abrir o menu lateral          |
| Retomar o estudo                 | Aba Aprender                                   | Preserva o diferencial de programação do Stacklyst |
| Acompanhar atividade             | Aba Notificações                               | Torna respostas e atualizações fáceis de encontrar |
| Conversar                        | Aba Mensagens                                  | Mantém o fluxo social disponível na barra inferior |
| Publicar                         | FAB que abre o compositor                      | Ação principal alcançável com o polegar            |
| Perfil e recursos complementares | Drawer aberto pelo avatar no header            | Evita transformar todas as funcionalidades em abas |
| Gestão e moderação               | Entradas condicionadas ao papel da conta       | Preserva contratos e permissões existentes         |

A referência de navegação é o padrão de aplicativos sociais como o X: ícones inferiores, header compacto, avatar com drawer e lista de conteúdo leve. Marca, imagens e conteúdo continuam sendo do Stacklyst. Tema escuro é o inicial; o usuário pode escolher tema claro ou acompanhar o sistema. Os componentes compartilhados concentram áreas de toque de 48 unidades, safe areas, tratamento do teclado, feedback ao pressionar e estados de carregamento, vazio e erro. Animações respeitam a preferência de movimento reduzido do aparelho.

## Fluxos e contratos existentes

| Fluxo                     | Contrato reaproveitado                                                        | Observações                                                                                 |
| ------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Entrada                   | Supabase Auth; `POST /api/auth/register` para cadastro                        | Sessão nativa no SecureStore; Bearer na API Next.js                                         |
| Feed e detalhe            | `GET /api/posts`, `GET /api/posts/:id`                                        | Paginação por cursor, filtros e contador de novas publicações                               |
| Criar/editar e participar | Rotas de posts, respostas, votos, favoritos, denúncias e upload               | Requer sessão real e validações do servidor                                                 |
| Perfil                    | `/api/users/me`, `/api/profile/:username`, atualização e follow               | A identidade da conta vem do backend                                                        |
| Busca                     | `GET /api/search?type=posts                                                   | users&q=...`                                                                                | Busca com debounce; mínimo de dois caracteres no servidor |
| Aprender                  | `/api/mobile/learning`, `/api/mobile/lessons/:id`, `/api/lessons/:id/attempt` | O servidor controla acesso e progresso; o contrato público de lição remove as respostas     |
| Praticar                  | `/api/mobile/exercises/:id`, execução e submissão de exercício                | Editor CodeMirror embarcado; resultados dependem do executor do backend                     |
| Duelos                    | Rotas `/api/duels/*` e canal Supabase Realtime                                | Convidar, entrar e submeter permanecem operações reais                                      |
| Mensagens                 | `/api/messages/chats`, `/api/mobile/messages`, edição e exclusão              | Envio possui `client_id` para idempotência; listagem e atualizações usam consulta periódica |
| Notificações              | `/api/notifications`, contagem de não lidas e `/api/mobile/devices`           | Push exige projeto Expo e credenciais Android correspondentes                               |
| Rascunhos e preferências  | AsyncStorage e `/api/mobile/state/:key`                                       | Escopo por usuário e controle de versão no servidor                                         |
| Recursos complementares   | Vagas, candidaturas, eventos, comunidades e ranking existentes                | Nenhuma nova regra de negócio foi inventada para o cliente                                  |
| Áreas por papel           | Administração, recrutamento, empresa e avaliação                              | `RoleGate` organiza o cliente; API continua exigindo autorização e propriedade              |

O servidor resolve Bearer em `src/lib/supabase/bearer.ts` usando `supabase.auth.getUser(token)`. A presença de `Authorization` não permite fallback para cookies de outra identidade. O cliente tenta renovar a sessão uma vez ao receber 401 e cancela a repetição se o usuário tiver mudado. A navegação autenticada exige configuração e sessão válida, exceto quando o usuário escolhe explicitamente a demonstração.

Nenhuma credencial administrativa ou conexão direta com o banco é necessária no app. A disponibilidade do código das rotas não confirma que todas as migrações, configurações de push, provedores OAuth ou o executor estejam ativos no deploy público.

## Demonstração explícita

`src/lib/preview.ts` contém exemplos locais identificados: quatro publicações técnicas, pessoas fictícias, perfis, busca, notificação e uma conversa. O usuário entra por **Explorar demonstração** e vê uma indicação permanente de dados ilustrativos. O mesmo shell e as mesmas telas da integração real são utilizados.

Esse modo não fabrica uma sessão Supabase ou tokens. O estado fica em memória; a sessão real eventualmente existente é preservada internamente e fica indisponível aos fluxos de edição durante a demonstração. A API intercepta o modo antes de chamar Supabase ou `fetch`, aceita somente GETs expressamente definidos e devolve erro claro para rotas sem exemplo. Todo método mutável é recusado. Não há fallback automático de uma falha real para dados fictícios.

Não são simulados domínio de conteúdo, notas, XP, candidaturas, inscrições ou publicação. As listas desses domínios ficam vazias ou exibem o limite explícito da demonstração. Essa amostra serve para revisar navegação e interface; não constitui validação de autenticação, sincronização ou autorização em produção.

## O que permanece fora desta entrega

- Reconstrução da landing institucional dentro do app; a entrada nativa prioriza acesso à comunidade.
- Nova geração de conteúdo por IA ou novo backend.
- Paridade editorial completa com o editor rico da web; o compositor móvel usa os formatos e campos existentes.
- Garantia de operação offline completa ou de execução local de exercícios.
- Validação real de OAuth, e-mails de recuperação, upload, execução remota, progresso persistido, push e fluxos de gestão sem uma conta de teste e as configurações correspondentes.
- Assinatura e build na conta Expo, instalação em aparelho físico e publicação em lojas.

## Verificação desta revisão

O script `node scripts/check-preview.mjs` foi executado com sucesso. Ele exercita a fronteira usada pelas telas (`api()`), confere os principais contratos de exemplo, isolamento das fixtures e busca, recusa POST/PUT/PATCH/DELETE/HEAD/OPTIONS, recusa GET desconhecido e falha se houver qualquer chamada a Supabase ou `fetch` no preview.

`npm run test:logout` executa a ação real de saída de Configurações com dependências isoladas. Confere falhas e timeout de push/lembrete, cancelamento de consultas, limpeza do cache e preservação de erros de autenticação. A tentativa de revogar push antes de sair é limitada a 1,5 segundo; sem conexão não é possível confirmar a revogação no servidor.

| Verificação executada                    | Resultado                                                                                                                                                                                    |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TypeScript e ESLint do app               | Aprovados, sem erros ou avisos de lint                                                                                                                                                       |
| Fronteira da demonstração                | Aprovada, sem chamadas a Supabase ou rede e sem escrita                                                                                                                                      |
| `expo install --check`                   | Dependências compatíveis com Expo SDK 57                                                                                                                                                     |
| `npm run export -- --max-workers 2`      | Bundles Android, iOS e web gerados                                                                                                                                                           |
| Expo Doctor                              | 20 de 21 verificações aprovadas; aviso de biblioteca sem manutenção (`react-native-render-html`), mantida para renderizar publicações existentes                                             |
| `npm audit` do mobile                    | 28 ocorrências: 18 altas e 10 moderadas; nenhuma crítica. O check de auditoria do CI continua bloqueando. As sugestões que rebaixam Expo/React Native não foram aplicadas                    |
| Revisão independente de código           | Contratos principais e bloqueio do preview revisados; corrigidos contraste de mensagens no tema claro e saída local quando a revogação de push falha                                         |
| Inspeção visual do app em execução       | Pendente: o emulador disponível apresentou falhas de System UI; uma instância isolada não concluiu o boot. O controle de navegador local também ficou desabilitado nas configurações do Work |
| APK e operações autenticadas em produção | Não executados; dependem de conta Expo, dispositivo e configuração real                                                                                                                      |

Esses resultados pertencem a esta revisão. A aprovação visual em aparelho não foi inferida de leitura de código ou de bundles gerados.

Builds de bundle e verificações estáticas têm um escopo diferente de um APK executado no Android. Não foi afirmado funcionamento ao vivo de autenticação, backend, notificações ou serviços externos com base apenas nesses checks.

Referências oficiais consultadas: [Expo Router SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/router/), [EAS APK](https://docs.expo.dev/build-reference/apk/), [ambientes EAS](https://docs.expo.dev/eas/environment-variables/), [Supabase Auth React Native](https://supabase.com/docs/guides/auth/quickstarts/react-native) e [changelog Supabase](https://supabase.com/changelog).

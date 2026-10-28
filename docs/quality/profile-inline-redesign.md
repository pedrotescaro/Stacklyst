# Perfil social com edição na própria página

O perfil em `/profile/[username]` segue a ordem: capa, avatar sobreposto, nome/usuário/bandeiras/título, bio e links, tags, estudos, música, navegação e conteúdo. A composição usa o tema do Stacklyst, sem efeitos decorativos ativados por padrão. Seguidores, seguindo, publicações, comentários e demais métricas ficam exclusivamente na aba Estatísticas.

## Interface e persistência

`src/components/profile-inline/SocialProfileOverview.tsx` substitui o antigo modal na página real de perfil. Editar carrega a versão atual e mantém nome, bio, informações pessoais, links, imagens e preferências em um rascunho local. Salvar envia uma única atualização transacional depois dos uploads; Cancelar restaura a apresentação persistida. Falhas conservam o rascunho e URLs já enviadas para permitir uma nova tentativa sem duplicar o upload. Há bloqueio imediato contra envio duplo e confirmação ao abandonar mudanças por links ou pelo navegador.

Os seletores contextuais reutilizam `ContextPopover`: posicionamento dentro da janela, foco inicial, Escape, clique externo e restauração de foco. O avatar usa o editor de recorte já existente; a capa permite posicionamento horizontal e vertical. Tipo, tamanho, assinatura e dimensões são validados pelo upload existente. As imagens originais ficam separadas das molduras SVG, que não deformam o avatar. Há categorias para molduras gratuitas, desbloqueadas, sazonais e bloqueadas.

`ProfileContent.tsx` apresenta seis abas com navegação por teclado: Postagens, Fotos, Vídeos, Curtidas, Respostas e Estatísticas. Publicações, curtidas, respostas e seguidores conservam suas rotas existentes. A nova rota `/api/profile/[username]/media` pagina as fotos efetivamente publicadas por data e ID. O armazenamento atual não possui registros de vídeo: essa aba informa ausência de vídeos, sem gerar conteúdo ou um botão de reprodução fictício. Isso não adiciona um novo serviço de hospedagem de vídeos.

## Dados e compatibilidade

Não há nova migração nesta reformulação. São reutilizadas as três tabelas aditivas entregues anteriormente em `20261027183000_profile_customization`, os campos de `User` e o bucket existente. O registro anterior da migração permanece em `artifacts/profile-personalization/migration.json`; não foi executada a cadeia histórica de migrações.

O JSON recebe campos opcionais `flags`, `tagColors`, `studyDetails` e `socialLinks`. Os aliases antigos `flag` e `studies` continuam sincronizados para os clientes existentes. Alterar ou remover assuntos em um cliente antigo preserva descrição, progresso e status dos assuntos mantidos. Cores de tags removidas são descartadas. Bandeiras aceitam até três itens; tags até dez itens de 2 a 24 caracteres; estudos até três assuntos com progresso opcional; links são HTTPS, limitados e sem credenciais embutidas.

O backend obtém o proprietário exclusivamente da sessão, valida conquistas/molduras e aceita somente uploads pertencentes ao usuário. A atualização atômica inclui informações pessoais, avatar, banner, preferências e identidade pública. Escritas dos editores legados também usam o bloqueio por usuário e incrementam a versão; uma edição antiga não sobrescreve silenciosamente outra sessão. Conflitos retornam HTTP 409. A projeção pública exclui preferências privadas de chat e aniversário.

Os títulos são concedidos no servidor, a partir de atividade real qualificada. A conclusão de trilhas exige todas as avaliações obrigatórias aprovadas em `QuizAttempt`, conforme o catálogo de aprendizagem do servidor; progresso informado no perfil ou no estado móvel não concede títulos. Conquistas concedidas anteriormente permanecem no histórico. Eventos e catálogos continuam extensíveis pela administração existente.

## Catálogos e Spotify

`src/lib/profile-flags.ts` reúne 249 países/territórios, as 27 unidades federativas, 14 bandeiras LGBTQIA+, a comunidade de desenvolvimento e a bandeira comunista opcional. São 292 opções pesquisáveis por nome e descrição. As bandeiras estaduais são SVGs reais com versão de origem, licença e hashes registrados em `public/flags/profile/`; não são emojis substitutos. Nenhuma escolha infere identidade ou muda permissões.

A busca Spotify usa exclusivamente a Web API oficial, com segredo e token no servidor, cache, renovação após 401, paginação e tratamento de 403/429/conexão. O seletor aplica debounce de 350 ms, cancela consultas superadas e só persiste a escolha ao salvar. A reprodução é o embed oficial de 80 px, sem autoplay; o link oficial permanece acessível.

O ambiente entregue não possui credenciais/aprovação de busca pública. O uso público depende das regras e da aprovação do Spotify vigentes em 2026; nenhuma variável concede essa aprovação. A alternativa por link oficial e oEmbed funciona sem simular resultados. Detalhes e fontes oficiais: [integração Spotify](spotify-profile-integration.md).

## Evidências

As capturas e relatórios desta reformulação ficam em `artifacts/profile-inline/`. Os testes de navegador usam contas temporárias identificadas como QA, com autenticação e banco reais; somente o heartbeat de presença dessas contas é suprimido para não inflar os usuários online. Contas, sessões e uploads são removidos ao fim da validação.

A primeira rodada verificou edição local, cancelamento, aviso de saída, recorte/upload de foto, tags/reordenação, música real por oEmbed, falha de rede com recuperação, persistência após recarregar, isolamento entre usuários, conflito de versão e seis abas. A rodada final confirma os ajustes de contraste e o player compacto em 320, 375, 430, 768, 1024 e 1440 px. Axe avalia o conteúdo principal e seletores abertos; isso não equivale a teste com leitor de tela nem valida o interior de iframes de terceiros.

O ensaio de desempenho em `artifacts/profile/achievement-metrics-performance.json` usa uma pequena amostra determinística no PostgreSQL local, com 25 consultas. Não representa carga ou latência de produção. Resultados de build, suíte web, cobertura e confirmação visual são registrados no relatório final desta pasta. A verificação responsiva é do navegador; não representa homologação do aplicativo Android/iOS instalado.

Resultado: **810 testes web passaram**, com 26 cenários condicionais ignorados, e **15 cenários com PostgreSQL real passaram** separadamente. Build de produção, TypeScript e smoke do executor passaram. Lint não apresentou erros; há seis avisos de `next/no-img-element` para imagens de usuários e prévias. A cobertura V8 de dez arquivos centrais desta funcionalidade é **76,93% de linhas e 67,37% de ramificações**, medida por 64 testes direcionados; não é cobertura do projeto inteiro. O navegador confirmou 27 verificações funcionais, três bandeiras em todas as larguras, ausência de overflow da página e zero violações axe no escopo avaliado após a correção do contraste. Relatório: `artifacts/profile-inline/verification.json`.

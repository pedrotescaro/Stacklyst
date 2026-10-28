# Personalização de perfis

O perfil principal agora oferece edição diretamente em `/profile/[username]`, sem abrir o modal antigo. A reformulação, seus campos adicionais e evidências atuais estão em [Perfil social com edição na própria página](profile-inline-redesign.md). Os resultados quantitativos abaixo registram a entrega anterior da central de personalização; não substituem os resultados da reformulação.

A central `/personalize` reúne foto com recorte, molduras, aparência, nome, bandeira, título, banner, interesses, estudos, música e preferências privadas de chat. `/achievements` mostra os requisitos, progresso e conquistas liberadas. Não há seção de livros.

## Persistência e autorização

- Foto, preferências, identidade pública e chat são salvos em uma transação. A versão enviada impede que outra aba sobrescreva uma edição mais recente; conflitos retornam HTTP 409 e preservam o rascunho.
- A foto pode ser escolhida da galeria, recortada, reposicionada, removida e conferida na prévia. O aplicativo também oferece câmera; a nova permissão requer recompilar o aplicativo.
- Uploads aceitam JPEG, PNG, WebP ou GIF até 5 MB, validam assinatura e decodificação e limitam dimensões e pixels. Novas imagens do perfil/banner devem pertencer à pasta de upload da conta autenticada.
- O servidor resolve o usuário da sessão; não aceita um identificador de outro proprietário. Títulos, destaques e molduras dependentes de conquistas são validados no servidor.
- A identidade reservada em `avatar_config.profileStyle` contém apenas estilos públicos e é protegida nos editores antigos. Os mesmos bloqueios transacionais preservam essa identidade em edições simultâneas.
- Cores de chat pertencem ao observador. Respostas públicas de perfil não incluem essas preferências. As cores de perfil se aplicam somente à página daquele perfil.

## Conquistas e eventos

Os requisitos iniciais incluem publicações, comentários, pessoas diferentes ajudadas, curtidas recebidas, seguidores e atividades de aprendizagem aprovadas. As concessões são únicas por pessoa e conquista, mesmo sob concorrência. Uma conquista já obtida permanece no histórico após apagar conteúdo ou encerrar o evento.

Contadores usam atividade qualificada: publicações com título de pelo menos quatro caracteres e corpo de pelo menos 40; duplicatas normalizadas não contam e há limite de cinco por dia. Comentários têm pelo menos 12 caracteres, excluem respostas a si mesmo e conteúdo próprio, e textos copiados contam uma vez. Curtidas e seguidores excluem interações próprias e contas com menos de 24 horas na interação; curtidas têm limite de 20 por autor/dia. Falhas do executor e exercícios não aprovados não dão crédito.

O catálogo inclui eventos de Halloween e Natal com início inclusivo e término exclusivo em UTC, verificação de hashtag completa e desafios relacionados. O modelo de aniversário fica desabilitado até a administração definir a data real. `/admin/profile-catalog` permite administrar eventos, requisitos, raridades e molduras; exige administrador e versão do catálogo.

Cada concessão cria uma notificação durável. Somente `/api/profile/achievements?notify=1` consome o aviso temporário, evitando que abrir o editor ou chat descarte uma notificação pendente.

## Spotify

É possível selecionar uma faixa por link oficial e exibir o player oficial, sem reprodução automática. Metadados vêm da API oficial ou do oEmbed do Spotify. Falhas transitórias mantêm um rótulo genérico e o link válido, preservando as demais preferências; metadados do cliente não substituem os dados resolvidos pelo servidor.

A busca por nome depende de `SPOTIFY_CLIENT_ID` e `SPOTIFY_CLIENT_SECRET`, somente no servidor. Sem essas credenciais, a interface explica a indisponibilidade da busca e continua permitindo links de faixas. A reprodução disponível é determinada pelo player do Spotify.

## Banco de dados

`20261027183000_profile_customization` adiciona três tabelas: `profile_customizations`, `profile_achievement_catalogs` e `user_profile_achievements`. Todas têm RLS habilitada, sem acesso direto para `anon` ou `authenticated`. Os dados são acessados pelas rotas autenticadas do servidor.

A migração aditiva foi aplicada isoladamente e registrada com seu checksum no projeto configurado, sem executar ou modificar migrações históricas. Evidência: `artifacts/profile-personalization/migration.json`.

## Verificação reproduzível

- `npm test`: testes de domínio, serviços, rotas e interface.
- `npm run build`: produção web e verificador do executor incluído no postbuild.
- `node scripts/verify-profile-personalization-postgres.mjs`: exige `STACKLYST_TEST_DATABASE_URL` apontando para `127.0.0.1:55437/stacklyst_quality_services`; verifica a migração aditiva e dez cenários reais, incluindo concorrência e RLS. Nunca redefine o banco.
- `artifacts/profile/achievement-metrics-performance.json`: 25 consultas em uma pequena amostra local. Não representa carga ou desempenho de produção.
- `artifacts/profile-personalization/browser-verification.json`: conferência de edição real da foto, persistência, visitante, isolamento e layout em seis larguras; capturas associadas no mesmo diretório.

Resultado final: **763 testes passaram** na suíte web (21 cenários condicionais ignorados), além de **dez testes com PostgreSQL real** executados separadamente. Build web, TypeScript e lint passaram, com avisos de imagens usadas em prévias locais. A cobertura V8 do recorte de cinco arquivos centrais de domínio, serviço, música, estilos e propriedade de upload é **79,75% de linhas e 70,77% de ramificações**; não é uma porcentagem do projeto inteiro. O resumo reproduzível está em `artifacts/profile-personalization/coverage/coverage-summary.json`.

A conferência automatizada com axe no conteúdo principal do editor não encontrou violações nas seis larguras. Não substitui avaliação com leitor de tela. A revisão visual independente aprovou a interface web após corrigir os campos de cor no celular. `browser-confirmation.json` registra os códigos completos legíveis e o player Spotify carregado; `profile-music-375.png` captura o player dentro da área visível, pois capturas de página inteira podem omitir a pintura de iframes fora da tela. Contas, sessões e imagens temporárias usadas nessa validação foram removidas.

Exportações Android/iOS e verificações TypeScript não comprovam instalação ou comportamento em um aparelho. As alterações nativas exigem uma nova compilação para chegar ao aplicativo instalado.

As bandeiras são arquivos SVG locais do catálogo `flag-icons`, com licença e origem em `public/flags/profile/`. Molduras são compostas com código, preservando a foto original.

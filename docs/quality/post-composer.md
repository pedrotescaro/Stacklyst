# Editor de postagens

O site usa um único editor em `PostComposerDialog`, aberto pela navegação ou pelo feed. No celular ele ocupa a viewport visual, acompanha sua redução ao abrir o teclado e reserva as áreas seguras. No desktop ele abre em um modal central. Em 320 px, Texto e GIF ficam em Mais opções para preservar os alvos de toque das ferramentas principais.

Texto continua em Markdown, compatível com postagens antigas. Sublinhado e cores usam marcações exatas reconhecidas por um transformador restrito; HTML arbitrário não é habilitado. As cores têm variantes para claro e escuro. Blocos de código reutilizam CodeMirror e `/api/run`, sem execução no processo do editor. A inserção preserva o texto selecionado.

Publicação usa uma chave de idempotência por rascunho. O rascunho pertence à conta e pode ser salvo ou descartado ao fechar. Enquetes têm duas a quatro alternativas, prazo de uma hora a sete dias e uma restrição única por eleitor. Posts com mídia, música ou enquete podem ter texto vazio.

O público `followers` é aplicado às consultas e às interações no servidor. Anexos são enviados ao bucket privado `post-media` e entregues por uma rota que verifica a permissão a cada solicitação; URLs assinadas reutilizáveis não são entregues ao navegador. Áudio suporta requisições de intervalo para reprodução e busca em navegadores móveis. O servidor valida tipos e tamanhos, converte imagens estáticas em WebP e preserva GIFs animados.

A migração aditiva é `20261101021134_rich_post_composer`. Ela mantém o público das postagens antigas como `everyone`, cria os registros de mídia/enquete/votos e restringe o acesso direto dos papéis de navegador às tabelas de conteúdo. O aplicativo usa a conexão autenticada do servidor.

## Integrações

- Spotify reutiliza as rotas de catálogo e resolução de faixa existentes. A busca exige `SPOTIFY_CLIENT_ID` e `SPOTIFY_CLIENT_SECRET` no servidor; permissões e quotas são determinadas pelas respostas do Spotify. A antiga flag `SPOTIFY_SEARCH_MODE` não bloqueia mais consultas em produção. Sem busca configurada, é possível vincular uma faixa por seu endereço oficial.
- Busca de GIFs usa a chave pública `NEXT_PUBLIC_GIPHY_API_KEY`. Sem ela, o envio de GIF pelo dispositivo permanece disponível. GIFs escolhidos no catálogo são copiados para o armazenamento privado do post.
- Gravação usa MediaRecorder e pede acesso ao microfone ao iniciar. Há prévia, nova gravação, remoção e limite de dois minutos; o arquivo também é validado pelo servidor.
- O novo menu não oferece agendamento automático nem restrições de resposta que dependiam apenas dos antigos marcadores de texto. Sua leitura continua compatível com postagens antigas.

## Verificação

`node scripts/verify-post-composer-postgres.mjs` executa dez verificações em uma transação sempre desfeita. Quando a migração ainda não existe no banco, também a executa dentro da transação para verificar seu SQL. Não mantém usuários, publicações ou votos de teste.

Os testes em Vitest cobrem persistência de marcas, proteção contra HTML arbitrário, validação de publicação, votação válida/duplicada/expirada/inacessível e entrega de anexos com intervalos. O sandbox JavaScript existente também foi verificado.

A conferência do navegador incluiu 320, 375, 390, 430, 768 e 1440 px, temas claro e escuro, ausência de rolagem horizontal, publicação com texto formatado/enquete/código e redução da viewport para 460 px. Essa simulação não substitui a conferência do teclado e do microfone em um aparelho físico.

### Correções de música e exclusão — 1 de novembro de 2026

Faixas válidas do Spotify podem ter artista vazio quando resolvidas pelo oEmbed; isso agora é aceito também na validação de publicações. Um post com música pode ter corpo vazio, e um post sem texto nem anexos continua sendo recusado. A busca por título ou artista mostra uma lista de faixas selecionáveis, com link oficial para cada resultado. Enter nos campos de busca e link não envia o formulário da publicação.

As confirmações de exclusão usam um portal no body para sair dos ancestrais animados do feed. O diálogo permanece dentro da viewport após rolar, inicia o foco em Cancelar e permite tentar novamente se o DELETE falhar. A mensagem legível da API tem prioridade sobre seu código de erro.

A revisão passou em 60 testes de validação, API e componentes, além de typecheck. Uma fixture temporária com componentes reais foi conferida no Chrome em 320 e 390 px no tema escuro e 1440 px no tema claro, sem rolagem horizontal nem erros JavaScript. Foram verificados publicação sem texto/artista, pesquisa com Enter, confirmação de exclusão após rolar, cancelamento e falha seguida de exclusão bem-sucedida. As respostas das APIs nessa fixture foram controladas; isso não comprova consulta real ao catálogo, sessão autenticada em produção ou aparelho físico. A fixture foi removida após a conferência.

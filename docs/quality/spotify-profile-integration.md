# Pesquisa de músicas no perfil

Os seletores do perfil e do compositor de publicações consultam somente o catálogo oficial do Spotify. A busca aceita título de música ou nome de artista; o backend consulta `/v1/search` com `type=track`, `market=BR`, `limit=10` e `offset` entre 0 e 1000. O componente seleciona faixas reais retornadas em `tracks.items`, com capa e créditos quando disponíveis.

O endpoint autenticado `/api/profile/music/search?q=...&offset=...` devolve `configured`, `tracks`, `offset`, `nextOffset` e `total`. Cada faixa pode incluir álbum e duração quando a API disponibiliza esses campos. As respostas de busca têm cache em memória de um minuto, limitado a 100 páginas. O editor deve usar debounce de aproximadamente 350 ms, cancelar buscas superadas e aplicar os resultados somente à consulta atual. A seleção fica no rascunho do perfil até salvar.

## Autenticação e configuração

O fluxo Client Credentials é utilizado apenas no servidor e apenas para informações públicas do catálogo. O token é compartilhado entre requisições simultâneas, fica em memória até próximo do vencimento e é renovado uma vez após um HTTP 401. `SPOTIFY_CLIENT_SECRET` nunca sai do backend. Os parâmetros usados na busca não são usados como URLs de destino; os hosts de requisição são fixos do Spotify.

Variáveis do servidor:

- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`

Sem credenciais, a interface recebe `configured:false`, `reason:not_configured`. Com ambas configuradas, a API consulta o Spotify também em produção. A variável antiga `SPOTIFY_SEARCH_MODE` não é mais necessária: a disponibilidade local identifica a presença das credenciais, e as respostas do Spotify determinam permissões, restrições e quotas reais. `configured:true` não representa aprovação externa nem acesso ilimitado.

Para configurar, crie ou use um aplicativo no [Spotify Developer Dashboard](https://developer.spotify.com/dashboard), obtenha seu Client ID e Client Secret e preencha as duas variáveis no servidor. No desenvolvimento local, use `.env.local`; no ambiente Vercel, use as variáveis do projeto no ambiente de destino e aplique uma nova implantação. Não use o prefixo `NEXT_PUBLIC_` para essas credenciais. O fluxo Client Credentials não exige conectar a conta Spotify de cada usuário nem adicionar callback OAuth.

## Restrições do provedor verificadas em 1 de novembro de 2026

O modo de desenvolvimento exige Premium para o proprietário; os fluxos com usuários Spotify autenticados têm uma lista de acesso e um limite publicado de cinco usuários. A busca aqui usa um token da aplicação via Client Credentials, sem autorização de usuário. O modo ampliado exige avaliação do Spotify; os critérios publicados incluem entidade legal, serviço lançado, presença em mercados atendidos e pelo menos 250 mil usuários ativos mensais. O código não presume a elegibilidade nem a aprovação do Stacklyst e preserva os erros reais do provedor.

Desde julho de 2026, a quota do modo de desenvolvimento é compartilhada pelos Client IDs da conta do desenvolvedor. O limite de Client IDs foi aumentado para 25; não se deve usar a regra antiga de apenas um Client ID nem criar IDs adicionais para contornar a quota. HTTP 429 pode identificar `QUOTA_EXCEEDED`; o backend preserva esse motivo sanitizado e o `Retry-After` quando fornecido. Falhas HTTP 401, 403, 429 e de conexão produzem estados explícitos e nunca uma lista musical falsa.

Fontes oficiais consultadas:

- [Search for Item](https://developer.spotify.com/documentation/web-api/reference/search)
- [Client Credentials Flow](https://developer.spotify.com/documentation/web-api/tutorials/client-credentials-flow)
- [Quota modes e requisitos do modo ampliado](https://developer.spotify.com/documentation/web-api/concepts/quota-modes)
- [Alterações de desenvolvimento de fevereiro de 2026](https://developer.spotify.com/documentation/web-api/tutorials/february-2026-migration-guide)
- [Atualização de quotas de julho de 2026](https://developer.spotify.com/blog/2026-07-23-web-api-quota-updates)

## Alternativa funcional sem aprovação de busca

O usuário pode colar um link oficial de faixa. `/api/profile/music/resolve` extrai somente o ID de uma faixa de `open.spotify.com` ou `spotify:track:`, consulta o oEmbed oficial e usa somente metadados reais. Falhas transitórias permitem conservar o ID/link com rótulo genérico, sem inventar artista ou álbum. A persistência projeta apenas os campos definidos no contrato; sinalizadores transitórios de erro não são gravados dentro das preferências.

A reprodução é oferecida pelo Spotify Embed oficial, sem autoplay. O áudio disponível depende das permissões do Spotify; o link “Ouvir no Spotify” continua levando à faixa oficial. Não há botão de reprodução fictício nem promessa de áudio completo fora do player autorizado.

O ambiente local desta entrega não tem credenciais de busca configuradas. Testes automatizados verificam consulta em produção sem a flag antiga, autenticação do provedor, cache, paginação, renovação, erros, resposta inválida do provedor e retorno sem configuração com respostas controladas. A resposta inválida é tratada como indisponibilidade, sem ser armazenada como uma busca vazia válida. A configuração do ambiente publicado não foi confirmada nesta revisão.

## Conexão da conta Spotify de cada usuário (novembro de 2026)

Configurações → Spotify permite que cada pessoa conecte a própria conta. O fluxo é Authorization Code com PKCE: `/api/spotify/connect` gera `state` e `code_verifier` aleatórios, guarda os dois num cookie criptografado de uso único (10 minutos, ligado ao id do usuário) e redireciona ao Spotify; `/api/spotify/callback` confere o `state` em tempo constante, troca o código no servidor e grava o refresh token num cookie `httpOnly`, `SameSite=Lax`, criptografado (JWE A256GCM) e restrito ao caminho `/api/spotify`. O navegador recebe apenas tokens de acesso curtos por `/api/spotify/token`, que aceita só requisições da mesma origem. Sair da conta ou desconectar apaga o cookie; um cookie de outro usuário é ignorado.

Escopos: `streaming`, `user-read-email`, `user-read-private`, `user-read-playback-state`, `user-modify-playback-state`. Com uma conta Premium conectada, o player aguarda o dispositivo do navegador ficar pronto no Web Playback SDK. Se o Spotify responder 404, o app verifica esse mesmo dispositivo no Spotify Connect, transfere a reprodução para ele se necessário e tenta tocar a faixa novamente após confirmar a ativação. Contas Free, contas desconectadas e falhas no SDK tocam a prévia de 30 segundos do Spotify no próprio player do Stacklyst (sem o embed do Spotify): `/api/spotify/preview/[trackId]` lê a URL do MP3 na página pública do embed da faixa, aceita apenas `https://p.scdn.co/mp3-preview/…` e guarda o resultado em cache por 6 horas. Faixas sem prévia mostram "Prévia indisponível" com o link para abrir no Spotify. Em todos os modos a faixa toca uma vez e para no fim (no Premium, o autoplay do Spotify é interrompido). O player mostra tempo decorrido, duração e a barra de progresso; arrastar para avançar ou voltar exige Premium conectado.

Configuração: cadastre `<app>/api/spotify/callback` como Redirect URI no app do Spotify Dashboard (localmente, `http://127.0.0.1:3000/api/spotify/callback`, e abra o Stacklyst por esse endereço). `SPOTIFY_TOKEN_SECRET` (32+ caracteres) criptografa os cookies; sem ela é derivada de `JWT_SECRET`. Em modo de desenvolvimento do Spotify, só contas adicionadas na lista de usuários do app conseguem conectar; as demais recebem a mensagem `not_allowed`.

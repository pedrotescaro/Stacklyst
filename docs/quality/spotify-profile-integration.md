# Pesquisa de músicas no perfil

O editor consulta somente o catálogo oficial do Spotify. Não usa scraping, resultados simulados, APIs alternativas ou áudio obtido por download. A busca aceita música ou artista; o backend consulta `/v1/search` com `type=track,artist`, `market=BR`, `limit=10` e `offset` entre 0 e 1000. O componente seleciona faixas reais retornadas em `tracks.items`; resultados de artista não são convertidos em músicas inventadas.

O endpoint autenticado `/api/profile/music/search?q=...&offset=...` devolve `configured`, `tracks`, `offset`, `nextOffset` e `total`. Cada faixa pode incluir álbum e duração quando a API disponibiliza esses campos. As respostas de busca têm cache em memória de um minuto, limitado a 100 páginas. O editor deve usar debounce de aproximadamente 350 ms, cancelar buscas superadas e aplicar os resultados somente à consulta atual. A seleção fica no rascunho do perfil até salvar.

## Autenticação e configuração

O fluxo Client Credentials é utilizado apenas no servidor e apenas para informações públicas do catálogo. O token é compartilhado entre requisições simultâneas, fica em memória até próximo do vencimento e é renovado uma vez após um HTTP 401. `SPOTIFY_CLIENT_SECRET` nunca sai do backend. Os parâmetros usados na busca não são usados como URLs de destino; os hosts de requisição são fixos do Spotify.

Variáveis do servidor:

- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`
- `SPOTIFY_SEARCH_MODE=extended`, somente após aprovação do modo ampliado pelo Spotify para o serviço público.

Sem credenciais, a interface recebe `configured:false`, `reason:not_configured`. Em produção, credenciais sem o modo ampliado configurado retornam `configured:false`, `reason:approval_required`. Definir a variável não concede aprovação: ela registra uma aprovação já obtida pelo responsável pelo produto. Desenvolvimento local pode testar as credenciais do responsável dentro das condições do Spotify.

## Viabilidade verificada em 27 de outubro de 2026

O modo de desenvolvimento exige Premium para o proprietário e permite até cinco usuários Spotify autenticados, adicionados à lista de acesso. Não atende como promessa de integração social pública irrestrita. O modo ampliado exige avaliação do Spotify; os critérios publicados incluem entidade legal, serviço lançado, presença em mercados atendidos e pelo menos 250 mil usuários ativos mensais. A elegibilidade do Stacklyst e a aprovação não foram presumidas.

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

O ambiente desta entrega não tem credenciais de busca configuradas. Testes automatizados verificam autenticação do provedor, cache, paginação, renovação, erros e retorno sem configuração com respostas controladas; isso não é uma alegação de aprovação externa ou consulta real por nome no ambiente publicado.

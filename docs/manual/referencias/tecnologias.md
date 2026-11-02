# Tecnologias e dependências

Inventário das declarações locais; faixas de versão são do manifesto, versões resolvidas pertencem ao lockfile. Dependência declarada não prova uso em toda tela nem serviço externo ativo.

## Linguagens e formatos

TypeScript/TSX implementam aplicação e contratos; JavaScript/MJS implementam ferramentas; JSX descreve árvores React; CSS define apresentação; SQL descreve migrations PostgreSQL; Prisma DSL define modelos; JSON define catálogos/configuração; Markdown documenta; YAML configura automações quando presente; HTML participa de documentos embarcados. Python aparece em ferramentas auxiliares quando listado no repositório. Linguagens oferecidas ao aluno são um catálogo separado: consulte `LANGUAGES` e o executor.

## Famílias principais

Next.js/React: páginas e componentes. Prisma/pg/PostgreSQL: persistência. Supabase: autenticação e infraestrutura configurada. Zod: contratos de entrada. CodeMirror: edição de código. QuickJS: sandbox JS. Tailwind/CSS e bibliotecas de movimento: apresentação. Expo/React Native/WebView: aplicativo. Vitest/Testing Library/Puppeteer: testes. LibreSprite: fontes e exportação de pixel art, ferramenta externa ao npm. Bibliotecas PDF/QR/fontes: certificados. Integrações opcionais dependem de configuração, quota e disponibilidade.

## package.json

### Comandos

| Comando               | Execução declarada                          |
| --------------------- | ------------------------------------------- |
| dev                   | next dev --webpack                          |
| build                 | next build                                  |
| postbuild             | node scripts/check-code-execution-build.mjs |
| start                 | next start                                  |
| postinstall           | prisma generate                             |
| lint                  | eslint                                      |
| typecheck             | tsc --noEmit                                |
| format                | prettier --write .                          |
| format:check          | prettier --check .                          |
| test                  | vitest run                                  |
| test:watch            | vitest                                      |
| test:mundinho-sprites | node scripts/check-mundinho-body.mjs        |
| mobile:build-mundinho | node apps/mobile/scripts/build-mundinho.mjs |
| prepare               | husky                                       |
| mobile:install        | npm --prefix apps/mobile ci                 |
| mobile:start          | npm --prefix apps/mobile run start          |
| mobile:typecheck      | npm --prefix apps/mobile run typecheck      |

### dependencies

| Pacote                                        | Versão/configuração |
| --------------------------------------------- | ------------------- |
| @base-ui/react                                | ^1.6.0              |
| @codemirror/lang-cpp                          | ^6.0.3              |
| @codemirror/lang-java                         | ^6.0.2              |
| @codemirror/lang-javascript                   | ^6.2.5              |
| @codemirror/lang-python                       | ^6.2.1              |
| @codemirror/lang-rust                         | ^6.0.2              |
| @codemirror/state                             | ^6.6.0              |
| @codemirror/theme-one-dark                    | ^6.1.3              |
| @jitl/quickjs-singlefile-browser-release-sync | 0.32.0              |
| @pdf-lib/fontkit                              | 1.1.1               |
| @prisma/adapter-pg                            | ^7.9.1              |
| @prisma/client                                | ^7.9.1              |
| @radix-ui/react-icons                         | ^1.3.2              |
| @supabase/server                              | ^1.1.0              |
| @supabase/ssr                                 | ^0.12.0             |
| @supabase/supabase-js                         | ^2.108.2            |
| @tabler/icons-react                           | ^3.46.0             |
| @tiptap/core                                  | ^3.31.3             |
| @tiptap/extension-bubble-menu                 | ^3.31.3             |
| @tiptap/extension-code-block                  | ^3.31.3             |
| @tiptap/extension-link                        | ^3.31.3             |
| @tiptap/extension-placeholder                 | ^3.31.3             |
| @tiptap/pm                                    | ^3.31.3             |
| @tiptap/react                                 | ^3.31.3             |
| @tiptap/starter-kit                           | ^3.31.3             |
| @tiptap/suggestion                            | ^3.31.3             |
| @tsparticles/engine                           | ^4.3.2              |
| @tsparticles/react                            | ^4.3.2              |
| @tsparticles/slim                             | ^4.3.2              |
| @uiw/react-codemirror                         | ^4.25.10            |
| @uiw/react-md-editor                          | ^4.1.1              |
| @upstash/ratelimit                            | ^2.0.8              |
| @upstash/redis                                | ^1.38.0             |
| animejs                                       | ^4.5.0              |
| class-variance-authority                      | ^0.7.1              |
| clsx                                          | ^2.1.1              |
| cn                                            | ^0.3.0              |
| devicon                                       | ^2.17.0             |
| dompurify                                     | ^3.4.14             |
| framer-motion                                 | ^12.40.0            |
| gsap                                          | ^3.15.0             |
| highlight.js                                  | ^11.11.1            |
| jose                                          | ^6.2.3              |
| lucide-react                                  | ^1.20.0             |
| motion                                        | ^12.43.0            |
| next                                          | ^16.4.3             |
| ogl                                           | ^1.0.11             |
| pdf-lib                                       | 1.17.1              |
| pg                                            | ^8.21.0             |
| qrcode                                        | 1.5.4               |
| quickjs-emscripten-core                       | 0.32.0              |
| react                                         | 19.2.4              |
| react-dom                                     | 19.2.4              |
| react-markdown                                | ^10.1.0             |
| react-zoom-pan-pinch                          | ^4.0.4              |
| rehype-highlight                              | ^7.0.2              |
| remark-gfm                                    | ^4.0.1              |
| remark-parse                                  | ^11.0.0             |
| remark-stringify                              | ^11.0.0             |
| shadcn                                        | ^4.16.0             |
| sharp                                         | 0.35.5              |
| tailwind-merge                                | ^3.6.0              |
| tippy.js                                      | ^6.3.7              |
| tw-animate-css                                | ^1.4.0              |
| unified                                       | ^11.0.5             |
| zod                                           | ^4.4.3              |

### devDependencies

| Pacote                          | Versão/configuração |
| ------------------------------- | ------------------- |
| @commitlint/cli                 | ^21.0.2             |
| @commitlint/config-conventional | ^21.0.2             |
| @jridgewell/trace-mapping       | ^0.3.31             |
| @tailwindcss/postcss            | ^4.3.3              |
| @testing-library/jest-dom       | ^6.9.1              |
| @testing-library/react          | ^16.3.2             |
| @testing-library/user-event     | ^14.6.1             |
| @types/dompurify                | ^3.0.5              |
| @types/node                     | ^20                 |
| @types/pg                       | ^8.20.0             |
| @types/qrcode                   | 1.5.6               |
| @types/react                    | ^19                 |
| @types/react-dom                | ^19                 |
| @vitejs/plugin-react            | ^6.0.2              |
| @vitest/coverage-v8             | ^4.1.12             |
| axe-core                        | ^4.14.0             |
| dotenv                          | ^17.4.2             |
| eslint                          | ^9                  |
| eslint-config-next              | ^16.4.3             |
| husky                           | ^9.1.7              |
| jsdom                           | ^29.1.1             |
| lint-staged                     | ^17.0.7             |
| prettier                        | ^3.8.4              |
| prisma                          | ^7.9.1              |
| puppeteer                       | ^25.1.0             |
| tailwindcss                     | ^4                  |
| ts-node                         | ^10.9.2             |
| typescript                      | ^5                  |
| vitest                          | ^4.1.12             |

### overrides

| Pacote         | Versão/configuração      |
| -------------- | ------------------------ |
| @prisma/config | {"deepmerge-ts":"8.0.2"} |
| browserslist   | 4.28.9                   |
| fast-uri       | ^3.1.9                   |
| mysql2         | 3.23.1                   |
| qs             | 6.16.0                   |

## apps/mobile/package.json

### Comandos

| Comando                | Execução declarada                                                        |
| ---------------------- | ------------------------------------------------------------------------- |
| start                  | expo start                                                                |
| android                | expo run:android                                                          |
| ios                    | expo run:ios                                                              |
| web                    | expo start --web                                                          |
| typecheck              | tsc --noEmit                                                              |
| build:editor           | node scripts/build-editor.mjs                                             |
| postinstall            | node scripts/build-editor.mjs                                             |
| test:preview           | node scripts/check-preview.mjs                                            |
| test:logout            | node scripts/check-logout.mjs                                             |
| test:notifications     | node scripts/check-notifications.mjs                                      |
| test:auth              | node scripts/check-auth.mjs                                               |
| test:config            | node scripts/check-config.mjs                                             |
| test:interactions      | node scripts/check-interactions.mjs                                       |
| test:chat              | node scripts/check-chat.mjs                                               |
| test:thread            | node scripts/check-thread.mjs                                             |
| test:snippets          | node scripts/check-snippets.mjs                                           |
| test:social            | npm run test:chat && npm run test:thread && npm run test:snippets         |
| test:sounds            | node scripts/check-sounds.mjs                                             |
| test:profile           | node scripts/check-profile.mjs                                            |
| test:personalization   | node scripts/check-personalization.mjs                                    |
| check:release          | node scripts/check-release.mjs                                            |
| build:apk:windows      | powershell -NoProfile -ExecutionPolicy Bypass -File scripts/build-apk.ps1 |
| eas-build-post-install | npm run build:editor                                                      |
| export                 | npm run build:editor && expo export --platform all                        |
| lint                   | eslint .                                                                  |

### dependencies

| Pacote                                    | Versão/configuração |
| ----------------------------------------- | ------------------- |
| @codemirror/commands                      | 6.11.1              |
| @codemirror/lang-cpp                      | 6.0.3               |
| @codemirror/lang-java                     | 6.0.2               |
| @codemirror/lang-javascript               | 6.2.5               |
| @codemirror/lang-python                   | 6.2.1               |
| @codemirror/lang-rust                     | 6.0.2               |
| @codemirror/state                         | 6.7.5               |
| @codemirror/theme-one-dark                | 6.1.3               |
| @codemirror/view                          | 6.43.12             |
| @react-native-async-storage/async-storage | 2.2.0               |
| @react-native-community/netinfo           | 12.0.1              |
| @shopify/flash-list                       | 2.0.2               |
| @supabase/supabase-js                     | 2.116.0             |
| @tabler/icons-react-native                | 3.46.0              |
| @tanstack/react-query                     | 5.103.0             |
| expo                                      | ^57.0.0             |
| expo-asset                                | ~57.0.20            |
| expo-audio                                | ~57.0.5             |
| expo-clipboard                            | ~57.0.2             |
| expo-constants                            | ~57.0.22            |
| expo-crypto                               | ~57.0.4             |
| expo-device                               | ~57.0.2             |
| expo-font                                 | ~57.0.4             |
| expo-image-picker                         | ~57.0.20            |
| expo-linking                              | ~57.0.13            |
| expo-notifications                        | ~57.0.24            |
| expo-router                               | ~57.0.28            |
| expo-secure-store                         | ~57.0.4             |
| expo-splash-screen                        | ~57.0.10            |
| expo-status-bar                           | ~57.0.1             |
| expo-system-ui                            | ~57.0.4             |
| expo-web-browser                          | ~57.0.3             |
| punycode                                  | 2.3.1               |
| react                                     | 19.2.3              |
| react-dom                                 | 19.2.3              |
| react-native                              | 0.86.3              |
| react-native-gesture-handler              | ~2.32.0             |
| react-native-markdown-display             | 7.0.2               |
| react-native-reanimated                   | 4.5.1               |
| react-native-render-html                  | 6.3.4               |
| react-native-safe-area-context            | ~5.7.0              |
| react-native-screens                      | ~4.26.0             |
| react-native-svg                          | 15.15.4             |
| react-native-url-polyfill                 | 4.0.0               |
| react-native-web                          | ^0.21.0             |
| react-native-webview                      | 13.16.1             |
| react-native-worklets                     | 0.10.1              |

### devDependencies

| Pacote             | Versão/configuração |
| ------------------ | ------------------- |
| @types/react       | ~19.2.2             |
| esbuild            | 0.28.2              |
| eslint             | 9.39.5              |
| eslint-config-expo | ~57.0.2             |
| typescript         | ~6.0.3              |

### overrides

| Pacote      | Versão/configuração |
| ----------- | ------------------- |
| markdown-it | 15.0.3              |
| linkify-it  | 6.1.0               |

## Ambiente: nomes do template, sem valores reais

| Variável    | Contexto declarado no template                                 |
| ----------- | -------------------------------------------------------------- |
| DB_PASSWORD | ── Docker (opcional) ───────────────────────────────────────── |

Senha do banco PostgreSQL no docker-compose.
Se não definida, usa 'postgres*stacklyst_2024' como fallback (apenas dev local!). |
| DATABASE_URL | Banco de dados (Supabase Postgres)
Necessário para registro, feed e os demais dados da aplicação.
Pooler em modo transação (porta 6543): use no runtime/Vercel. |
| DIRECT_URL | Conexão direta ou pooler em modo sessão (porta 5432): use somente no
Prisma CLI para migrations, introspecção e seed. |
| DATABASE_POOL_MAX | Ajustes do pool (opcionais). Os padrões favorecem reconexão rápida sem
deixar conexões ociosas acumularem em deploys serverless. O padrão é 1 em
Vercel/AWS Lambda e 10 fora desses ambientes. |
| DATABASE_CONNECTION_TIMEOUT_MS | |
| DATABASE_IDLE_TIMEOUT_MS | |
| NEXT_PUBLIC_SUPABASE_URL | Supabase — Auth + DB |
| NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY | |
| SUPABASE_SECRET_KEY | Compatibilidade com projetos legados (opcional se PUBLISHABLE_KEY estiver definida):
NEXT_PUBLIC_SUPABASE_ANON_KEY="sua_anon_key_legada_aqui"
Apenas server-side (seed, admin). Nunca use o prefixo NEXT_PUBLIC* nesta chave. |
| SEED_DEFAULT_PASSWORD | Senha das contas de teste criadas pelo seed.
Defina ANTES de rodar `npx prisma db seed`.
OBRIGATÓRIA: mínimo 12 caracteres. Não há fallback — o seed falhará se não definida. |
| JWT_SECRET | JWT Secret for secondary auth layer.
Gere com: `openssl rand -hex 32`
OBRIGATÓRIO em produção — o app lançará erro na inicialização se não definido. |
| JWT_EXPIRES_IN | |
| NEXT_PUBLIC_APP_URL | URL pública do app (usada em links de e-mail, OAuth, etc.) |
| SUPABASE_SSL_INSECURE | Dev local (Windows/antivírus): se login/registro retornar "fetch failed",
defina como true. Nunca use em produção. |
| UPSTASH_REDIS_REST_URL | ── Opcionais (Fase 3 do roadmap) ──────────────────────────
Rate limiting com Upstash Redis. Se ausente, o app usa um limite local por
instância (útil em desenvolvimento, insuficiente para teto global em produção). |
| UPSTASH_REDIS_REST_TOKEN | |
| CRON_SECRET | Segredo para proteger os endpoints de cron do quiz diário e da manutenção de duelos.
Gere com: `openssl rand -hex 32` |
| NEXT_PUBLIC_AVATAR_API_URL | Configurable Endpoints (Hardcoding improvements) |
| PISTON_API_URL | |
| GITHUB_API_URL | |
| SPOTIFY_CLIENT_ID | Busca por nome no catálogo do Spotify (opcional, somente servidor).
Links de faixas e player oficial funcionam sem estas credenciais. |
| SPOTIFY_CLIENT_SECRET | |
| NEXT_PUBLIC_GIPHY_API_KEY | Pesquisa de GIFs (opcional). Chave pública da integração web GIPHY.
O provedor exige consultas no navegador e atribuição; não use uma chave secreta.
Sem esta chave, o editor continua aceitando GIFs do dispositivo. |

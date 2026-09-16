# Stacklyst Mobile (Android & iOS)

Stacklyst Mobile é o cliente móvel oficial da plataforma Stacklyst, desenvolvido com **React Native**, **Expo SDK 55** e **TypeScript** em modo strict, utilizando **Expo Router**, **TanStack Query**, **FlashList**, **Reanimated** e **CodeMirror** em WebView isolada para prática de código.

---

## 1. Arquitetura e Tecnologias

- **Framework**: React Native 0.83 + Expo SDK 55 + TypeScript (strict mode)
- **Navegação**: Expo Router v5 com abas e deep links (`stacklyst://`)
- **Estado Remoto & Cache**: `@tanstack/react-query` v5
- **Listas & Performance**: `@shopify/flash-list` para feeds e mensagens
- **Editor de Código**: CodeMirror 6 embarcado via `react-native-webview` com suporte a JavaScript, TypeScript, Python, Java, C++ e Rust. Barra de símbolos úteis e persistência local/remota de rascunhos.
- **Autenticação**: Supabase Auth com suporte a `Authorization: Bearer <access_token>` na API REST do backend Next.js e armazenamento seguro via `expo-secure-store`.
- **Notificações & Push**: `expo-notifications` com registro de tokens associados à conta e sincronização com o backend.
- **Identidade Visual**: Fundo escuro OLED, Electric Blue `#0083fe`, tipografia monoespaçada no código, áreas de toque mínimas de 48dp, suporte a safe-areas e acessibilidade.

---

## 2. Estrutura de Diretórios

```
apps/mobile/
├── app/                      # Rotas e layouts do Expo Router
│   ├── (app)/                # Rotas autenticadas
│   │   ├── (tabs)/           # 5 Abas: Feed, Aprender, Praticar, Duelos, Perfil
│   │   ├── company/          # Gestão de empresas (Recrutador / Admin)
│   │   ├── duel/             # Arena de duelos com Realtime
│   │   ├── lesson/           # Lições interativas com progresso
│   │   ├── exercise/         # Exercícios e editor com execução de testes
│   │   └── ...
│   ├── (auth)/               # Login, Cadastro, Recuperação de Senha
│   └── _layout.tsx           # Provedores de Sessão, Query e SafeArea
├── src/
│   ├── components/           # Componentes UI reutilizáveis (Screen, Button, Field, etc.)
│   ├── features/             # Módulos de domínio (feed, learning, explore, etc.)
│   ├── lib/                  # APIs, cliente Supabase, rascunhos, links e tokens
│   └── theme/                # Tokens de design (cores, espaçamento, tipografia)
└── scripts/
    └── build-editor.mjs      # Bundler para o runtime do CodeMirror na WebView
```

---

## 3. Configuração de Variáveis de Ambiente

Crie o arquivo `apps/mobile/.env` com as seguintes chaves:

```env
# URL da API do backend Stacklyst
# Emulador Android usa http://10.0.2.2:3000
# Simulador iOS / Dispositivo Físico usa o IP da sua máquina na LAN, ex: http://192.168.1.100:3000
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000

# Credenciais públicas do Supabase (as mesmas da web)
EXPO_PUBLIC_SUPABASE_URL=https://<seu-projeto>.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sbp_...
```

---

## 4. Comandos de Execução e Validação

A partir da raiz do repositório:

```bash
# Instalar dependências
npm run mobile:install

# Checar tipos TypeScript
npm run mobile:typecheck

# Executar linter
npm --prefix apps/mobile run lint

# Iniciar o servidor de desenvolvimento Metro
npm run mobile:start

# Exportar bundles estáticos para Android, iOS e Web
npm --prefix apps/mobile run export
```

Ou dentro do diretório `apps/mobile`:

```bash
cd apps/mobile

# Iniciar com dev client
npm run start

# Executar no Android (emulador ou dispositivo USB com adb)
npm run android

# Executar no iOS (macOS com Xcode)
npm run ios
```

---

## 5. Rascunhos e Continuidade Web/Mobile

- Rascunhos de publicações, exercícios, lições e duelos utilizam o hook `useDraft`.
- O rascunho é persistido localmente no `AsyncStorage` e sincronizado com a tabela `MobileState` no Postgres do Supabase com versionamento de conflito (`keepLocal` vs `acceptRemote`).
- Mensagens pendentes possuem `client_id` único para evitar duplicação em reenvios ou reconexão de rede.

---

## 6. Validação e Status

- **Web Bundles, iOS Hermes Bytecode e Android Hermes Bytecode**: Gerados e validados via `expo export --platform all`.
- **TypeScript**: `tsc --noEmit` executado com 0 erros.
- **ESLint**: Configuração Flat com regras de React Hooks e imports, 0 erros.
- **Backend API**: Endpoints em `/api/mobile/*` e autenticação Bearer validados pela suíte Vitest com 44 testes focados e suíte geral de 435 testes aprovados.

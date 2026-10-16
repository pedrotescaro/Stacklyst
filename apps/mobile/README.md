# Stacklyst Mobile

Cliente nativo em React Native, Expo SDK 57, TypeScript e Expo Router. A interface usa navegação social familiar: feed contínuo, avatar que abre o menu lateral, cinco abas por ícones e botão flutuante para publicar. O tema inicial é escuro; Configurações permite escolher claro, escuro ou acompanhar o aparelho.

A [análise do site e dos contratos](ANALISE.md) registra o que orientou a adaptação e os limites de validação.

## Executar

Requer Node.js 22.13 ou superior. Os perfis EAS usam Node.js 24.14.0.

No PowerShell:

```powershell
Set-Location 'C:\Users\PEDRO\Documents\DevDeck\apps\mobile'
npm ci
npm run build:editor
npx expo start
```

Abra o QR code no Expo Go compatível com SDK 57. Com um emulador Android em execução, pressione `a`; para abrir a versão web de desenvolvimento, pressione `w`. `Ctrl+C` encerra o Metro. O projeto não exige um development client.

Push e lembretes locais usam o módulo de notificações somente no APK próprio. No Expo Go, o app não importa esse módulo: a entrada do pacote SDK 57 tenta carregar `ExpoTopicSubscriptionModule`, ausente nesse cliente. A aba Notificações continua usando a API da plataforma. Após atualizar esse código, pare o Metro com `Ctrl+C` e execute `npx expo start --clear` para descartar o bundle antigo.

Sem variáveis de ambiente, use **Explorar demonstração** na tela inicial. Esse modo usa exemplos locais identificados, somente leitura, nas mesmas telas do app. Ele não cria conta, autenticação, XP ou publicações. Não há troca automática para mocks se a API real falhar.

Para desenvolvimento com código nativo, `npm run android` exige Android Studio/JDK/SDK configurados; `npm run ios` exige macOS e Xcode. O editor de exercícios usa CodeMirror numa WebView isolada. A navegação e as telas são React Native.

## Conectar à plataforma

Copie o exemplo e preencha os valores públicos do mesmo projeto Supabase usado pelo backend:

```powershell
Copy-Item .env.example .env
notepad .env
```

```dotenv
EXPO_PUBLIC_API_URL=https://stacklyst.vercel.app
EXPO_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=SUA_CHAVE_PUBLICA
# Opcional: ID do seu projeto Expo, necessário para registrar push.
EXPO_PUBLIC_EAS_PROJECT_ID=
```

As variáveis `EXPO_PUBLIC_*` são incluídas no aplicativo. Use somente a chave pública publishable do Supabase, ou a chave anon pública já usada pelo projeto. Chaves `service_role`, segredos do banco e tokens administrativos ficam no servidor. `.env` permanece ignorado pelo Git.

Para backend local, use `http://10.0.2.2:3000` no emulador Android. Em aparelho físico, use o IP da máquina na mesma rede e execute o backend acessível pela LAN. `localhost` no aparelho aponta para o próprio aparelho. Para um APK distribuído, prefira a URL HTTPS da plataforma.

O app autentica pelo Supabase e envia `Authorization: Bearer <access_token>` para as APIs existentes. A sessão nativa é persistida no SecureStore; na prévia web, fica apenas em memória. Há renovação da sessão e limpeza do cache ao trocar de usuário. Rascunhos usam armazenamento local por usuário e sincronização versionada quando há uma conta conectada.

Login social, confirmação de e-mail e recuperação de senha usam `stacklyst://auth/callback`; adicione esse destino aos redirects permitidos do Supabase e habilite os provedores desejados. Valide esses retornos no APK instalado, porque o Expo Go possui seu próprio esquema de links. Sem essa configuração, use login por e-mail e senha ou a demonstração.

## Gerar o APK com EAS Build

Os comandos abaixo são executados dentro de `apps/mobile`. Eles usam a conta Expo do responsável pelo aplicativo. Nenhum projeto, login ou build na nuvem é criado automaticamente pelo código.

1. Entre na sua conta e vincule o app ao seu projeto Expo. O `init` permite criar um projeto ou escolher um já existente e salva seu `projectId` na configuração.

   ```powershell
   npx eas-cli@latest login
   npx eas-cli@latest whoami
   npx eas-cli@latest init
   ```

2. Configure as variáveis públicas do ambiente `preview` no EAS. O `.env` local ignorado pelo Git não é enviado ao build remoto. Informe os mesmos valores usados acima:

   ```powershell
   $stacklystSupabaseUrl = Read-Host 'URL pública do projeto Supabase'
   $stacklystSupabaseKey = Read-Host 'Chave pública publishable do Supabase'

   npx eas-cli@latest env:set --name EXPO_PUBLIC_API_URL --value 'https://stacklyst.vercel.app' --environment preview --visibility plaintext
   npx eas-cli@latest env:set --name EXPO_PUBLIC_SUPABASE_URL --value "$stacklystSupabaseUrl" --environment preview --visibility plaintext
   npx eas-cli@latest env:set --name EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY --value "$stacklystSupabaseKey" --environment preview --visibility plaintext
   ```

   Para um APK de demonstração somente leitura, as três variáveis podem ficar ausentes. Para push, configure também `EXPO_PUBLIC_EAS_PROJECT_ID` com o ID retornado por `eas init` e as credenciais Android/FCM correspondentes ao seu projeto.

3. Confira o código antes de enviar o build:

   ```powershell
   npm run typecheck
   npm run lint
   npx expo install --check
   npm run test:preview
   npm run test:logout
   npm run test:notifications
   ```

4. Gere o APK. Quando o EAS solicitar credenciais Android, selecione a keystore existente do app ou a geração de uma nova para a primeira distribuição:

   ```powershell
   npx eas-cli@latest build --platform android --profile preview
   ```

   O [eas.json](eas.json) contém `preview.android.buildType: "apk"`, distribuição interna e ambiente `preview`. O hook `eas-build-post-install` recompila o editor antes do build.

5. Abra o link de build informado pelo EAS, baixe o `.apk` e instale no Android. Com Android Platform Tools e depuração USB habilitada, outra opção é:

   ```powershell
   adb devices
   adb install -r 'C:\caminho\Stacklyst.apk'
   ```

O APK do perfil `preview` funciona sem Metro. Esse fluxo gera uma instalação interna; publicação nas lojas e um AAB de produção são etapas separadas. A compilação Android na nuvem depende da conta Expo, da fila e das credenciais fornecidas nesse procedimento.

## Organização

```text
apps/mobile/
  app/
    _layout.tsx              Provedores, tema e navegação principal
    auth/                    Entrada, cadastro, recuperação e callback
    (app)/
      (tabs)/                Início, Explorar, Aprender, Notificações, Mensagens
      compose.tsx            Criação e edição de publicação
      post/, profile/        Detalhes e perfis
      lesson/, exercise/     Estudo e prática com editor de código
      duel/, jobs/, events/  Recursos complementares existentes
  src/
    components/              Screen, controles, estados, listas e drawer
    features/                Feed, perfil, aprendizado e tipos de exploração
    lib/                     API, sessão, preview, rascunhos, links e notificações
    theme.tsx                Paletas, espaçamento, tipografia e preferência de tema
    editor/                  Runtime do CodeMirror
  scripts/
    build-editor.mjs         Gera o HTML do editor
    check-preview.mjs        Verifica fixtures e bloqueio de rede/escrita na demo
    check-logout.mjs         Verifica saída local com falha/timeout de push
    check-notifications.mjs  Verifica inicialização sem módulo nativo no Expo Go
  app.json                   Identidade e configuração nativa
  eas.json                   Perfis Android APK e produção
```

Mantenha essa pasta dentro do repositório: tipos públicos de aprendizado e exercícios são compartilhados com `src/lib` da plataforma.

## Escopo e limites

- A API da plataforma é reutilizada; não foi inventado outro backend. Feed, publicação, respostas, perfis, busca, favoritos, notificações, conversas, trilhas, exercícios e duelos possuem integrações existentes.
- Perfil, prática, duelos, ranking, eventos, vagas e configurações ficam no drawer. Áreas de recrutamento, avaliação e administração dependem do papel da conta e continuam sujeitas à autorização do servidor.
- A demonstração oferece exemplos de feed, detalhe, perfis, busca e conversas. Aprendizado, vagas, eventos e ranking não simulam progresso ou resultados reais. Escritas são recusadas antes de acessar a rede.
- Uploads, execução de código, login social, progresso remoto, notificações push e integrações de recrutamento precisam ser verificados com conta real e backend configurado. Push também requer aparelho físico, APK e credenciais do serviço de push.
- Não há promessa de funcionamento offline completo. Rascunhos locais e dados já carregados são preservados; publicação e sincronização exigem conexão.
- Não foram adicionados recursos de IA. O app reutiliza os contratos de aprendizado disponíveis na plataforma.
- Build EAS, testes em aparelho físico, distribuição e publicação nas lojas não são comprovados por uma exportação JavaScript. Consulte a seção de verificação em [ANALISE.md](ANALISE.md).

Referências: [Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/), [APK com EAS Build](https://docs.expo.dev/build-reference/apk/), [variáveis no EAS](https://docs.expo.dev/eas/environment-variables/) e [Supabase Auth para React Native](https://supabase.com/docs/guides/auth/quickstarts/react-native).

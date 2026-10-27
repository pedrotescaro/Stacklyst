# Cadastro, confirmação e recuperação de senha

O cadastro usa `supabase.auth.signUp`, sem confirmação administrativa e sem JWT secundário antes de comprovar a posse do e-mail. O login oferece recuperação de senha e reenvio de confirmação. `/api/auth/confirm-email` só confirma com OTP ou hash válido; `action: resend` apenas envia outro e-mail.

## Configuração do projeto Supabase

1. Em Authentication / Providers / Email, habilite confirmação de e-mail. Configure um serviço SMTP real em Authentication / Email / SMTP para entregar mensagens aos usuários do produto.
2. Configure o Site URL com a origem pública HTTPS. Adicione à lista de Redirect URLs as URLs exatas `https://SEU-DOMINIO/api/auth/callback?next=/onboarding` e `https://SEU-DOMINIO/api/auth/callback?next=/reset-password`, além das origens locais de desenvolvimento utilizadas.
3. Para permitir abrir os links em outro navegador/dispositivo, personalize os templates para verificar o hash diretamente no callback. O template de confirmação deve usar `{{ .SiteURL }}/api/auth/callback?token_hash={{ .TokenHash }}&type=signup&next=/onboarding`. O de recuperação deve usar `{{ .SiteURL }}/api/auth/callback?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password`.

Com o template padrão de PKCE, o link é verificado por código e depende do navegador que iniciou o fluxo. O callback aceita ambos os formatos, valida o destino local e remove os tokens da URL após verificar.

## Verificação em ambiente publicado

Com uma conta de teste autorizada, cadastrar um endereço, comprovar recebimento, tentar entrar antes de confirmar, abrir o link, concluir o onboarding, sair, solicitar recuperação, abrir o novo link, trocar a senha e verificar que a senha antiga falha. Um link vencido ou reutilizado deve falhar. Não registrar os links ou senhas na evidência.

O endpoint de redefinição exige uma sessão Supabase válida e um comprovante HttpOnly assinado, com finalidade exclusiva de recuperação e validade de 15 minutos. Apenas um token de recuperação verificado ou um código PKCE com `redirectType: recovery` emite esse comprovante. Uma sessão comum não habilita o formulário nem esse endpoint. O segredo de aplicação `JWT_SECRET` já utilizado pelo produto deve estar configurado em produção.

Os testes automatizados locais cobrem a chamada real ao contrato do SDK, as fronteiras de confirmação, callbacks, rejeição de token expirado, ausência de bypass administrativo, persistência por usuário e filtragem do feed antes da paginação. O recebimento na caixa de entrada e a configuração SMTP do ambiente publicado exigem esta verificação externa; os testes simulados não constituem essa evidência.

Referências oficiais: [recuperação de senha](https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail), [SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client), [templates](https://supabase.com/docs/guides/auth/auth-email-templates) e [SMTP](https://supabase.com/docs/guides/auth/auth-smtp).

# Desenvolvimento, segurança e operação

## Preparação

Leia `package.json`, lockfiles e `AGENTS.md`. Consulte os guias da versão instalada de Next.js em `node_modules/next/dist/docs` antes de mudar APIs/convenções. Mobile tem instruções próprias em `apps/mobile/AGENTS.md`.

Copie `.env.example` para `.env.local`; configure seu ambiente. O inventário inclui somente nomes/comentários do template, nunca valores reais. `DATABASE_URL` atende runtime; `DIRECT_URL` destina-se às operações Prisma. Chaves privilegiadas não podem receber prefixo público nem entrar em Markdown, logs ou bundles.

## Ciclo de desenvolvimento

```bash
npm install
npx prisma generate
npm run dev
npm run typecheck
npm run lint
npm test
npm run build
```

`postbuild` executa smokes do juiz compilado e de certificados. Testes ignorados por configuração não são testes aprovados. Typecheck não comprova banco, compiladores remotos, login ou layout.

```bash
npm run mobile:build-mundinho
npm run mobile:typecheck
```

Regenerar o HTML embarcado é necessário quando componentes/assets mudam. Isso não gera nem valida APK em aparelho físico.

## Banco e implantação

Confira estado das migrations antes de aplicar. Não substituir migrations revisadas por `db push` em produção nem executar `migrate reset` em banco com dados úteis. Seed cria/altera dados de demonstração; leia antes e escolha o ambiente.

Separe arquivos pendentes de outras tarefas. Não editar SQL aplicado sem tratar histórico/checksum. `docs/DEPLOYMENT.md` contém instruções anteriores: valide scripts e variáveis atuais antes de segui-las. Build local não significa deploy publicado; publicação não comprova todos os fluxos autenticados e provedores.

## Segurança

`auth.ts`, `auth-session.ts`, módulos `supabase` e middleware/proxy tratam sessão. Perfil editável não é autorização. Nunca aceite `userId`, papel, dano ou preço do cliente como autoridade. Preserve verificações de origem, participação, propriedade e bloqueios nas rotas apropriadas.

Transações devem conter trabalho de banco limitado; execução externa fica fora. Recompensas precisam de unicidade e proteção contra concorrência. Push é efeito posterior ao commit, não prova de persistência.

## Diagnóstico

| Sintoma             | Conferir                                               |
| ------------------- | ------------------------------------------------------ |
| Login falha         | Configuração, sessão, provedor e rede                  |
| Lista vazia         | Autorização, filtros, paginação e publicação dos dados |
| Atividade não salva | `submit`, avaliação e commit                           |
| XP duplicado        | Primeira conclusão, chave e concorrência               |
| Ranking inesperado  | Período, linguagem, fonte e desempate                  |
| Convite ausente     | Amizade, bloqueio, validade, presença e polling        |
| Duelo pendente      | Prazo, manutenção, submissões e resolução              |
| Push ausente        | Registro, dispositivo e provedor separadamente         |

## Manter este manual

Atualize o capítulo da regra e os testes correspondentes. Rode `node scripts/build-platform-reference.mjs` para renovar estrutura, símbolos, rotas, modelos e dependências. O gerador não explica algoritmos nem substitui leitura dos capítulos. Verifique os links locais após renomear arquivos.

# Stacklyst

Plataforma para desenvolvedores compartilharem conhecimento, praticarem programação e acompanharem sua evolução.

## Recursos

- **Comunidade:** feed, dúvidas técnicas, respostas, notificações, mensagens e perfis.
- **Duelos de código:** desafios 1v1, matchmaking, convites diretos, editor CodeMirror e votação da comunidade.
- **Aprendizado:** trilhas por linguagem, XP, quiz diário e ofensivas de atividade.
- **Conquistas:** badges como Sobrevivente do Segfault, Mago do TypeScript e Git Push --force.
- **Interface:** tema escuro, identidade visual em azul e navegação adaptada para dispositivos móveis.

Os convites para duelos duram 72 horas, com publicação opcional na arena após a expiração. Recusar ou ignorar um convite não reduz XP; o cooldown ocorre apenas após abandonos repetidos de duelos aceitos. Consulte as [regras de avaliadores e duelos](docs/RULES.md) para mais detalhes.

## Tecnologias

Next.js 16, React 19, TypeScript, Tailwind CSS 4, Prisma 7, PostgreSQL e Supabase.

## Executar localmente

Clone o repositório na branch `main`:

```bash
git clone --branch main https://github.com/pedrotescaro/Stacklyst.git
cd Stacklyst
```

### Com Docker

Instale o [Docker](https://docs.docker.com/get-docker/) e copie o arquivo de ambiente:

```bash
cp .env.docker.example .env.docker
```

Preencha as credenciais do Supabase em `.env.docker` para habilitar login e registro. Para consultar apenas as páginas públicas, mantenha o arquivo de ambiente sem essas credenciais.

```bash
# Desenvolvimento com hot reload
docker compose up

# Produção com build otimizado
docker compose -f docker-compose.prod.yml up --build -d
```

O PostgreSQL é criado pelo Docker. Na primeira execução em desenvolvimento, o container instala as dependências e aplica as migrations, o que pode levar alguns minutos.

Para popular o banco com dados de teste, configure `SEED_DEFAULT_PASSWORD` em `.env.local` antes de executar:

```bash
docker compose exec web sh -c "npx prisma db seed"
```

### Sem Docker

Instale Node.js 20+ e tenha uma instância PostgreSQL 15+ disponível.

**1. Instale as dependências.**

```bash
npm install
```

**2. Copie `.env.example` para `.env.local` e configure o ambiente.**

```bash
cp .env.example .env.local
```

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="sb_publishable_..."
SUPABASE_SECRET_KEY="sb_secret_..."
SEED_DEFAULT_PASSWORD="defina-uma-senha-com-pelo-menos-12-caracteres"
```

A URL e a chave publishable habilitam o Supabase Auth. Registro, feed e demais dados também exigem uma conexão PostgreSQL por `DIRECT_URL` ou `DATABASE_URL`. A `SUPABASE_SECRET_KEY` é exclusiva do servidor e usada pelo seed e pelo fallback REST.

**3. Gere o cliente Prisma, sincronize o banco e insira os dados iniciais.**

```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

**4. Inicie o servidor.**

```bash
npm run dev
```

Em ambos os modos, acesse [localhost:3000](http://localhost:3000).

### Contas de teste

O seed cria as contas abaixo. A senha é o valor definido em `SEED_DEFAULT_PASSWORD` no arquivo `.env.local` e deve ter pelo menos 12 caracteres.

| Nome   | E-mail                 | Especialidade           |
| ------ | ---------------------- | ----------------------- |
| Pedro  | `pedro@stacklyst.dev`  | TypeScript e JavaScript |
| Ana    | `ana@stacklyst.dev`    | Python e Django         |
| Carlos | `carlos@stacklyst.dev` | Rust e C++              |

Acesse `/login` com uma dessas contas e a senha configurada.

## Desenvolvimento

| Comando              | Descrição                                |
| -------------------- | ---------------------------------------- |
| `npm run typecheck`  | Verifica os tipos TypeScript.            |
| `npm run lint`       | Executa o ESLint.                        |
| `npm run format`     | Formata os arquivos com Prettier.        |
| `npm test`           | Executa os testes com Vitest.            |
| `npm run test:watch` | Executa os testes em modo de observação. |

O Husky e o lint-staged executam ESLint e Prettier nos arquivos JavaScript e TypeScript preparados para commit. Erros de lint bloqueiam o commit até serem corrigidos.

## Documentação

- [Contribuição](CONTRIBUTING.md): bugs, sugestões e pull requests.
- [Arquitetura](docs/ARCHITECTURE.md): organização, escolhas técnicas e fluxo de dados.
- [Banco de dados](docs/DATABASE.md): modelos, diagramas e índices de busca.
- [Deploy](docs/DEPLOYMENT.md): implantação com Vercel e Supabase.
- [Avaliadores e duelos](docs/RULES.md): candidaturas, progressão, convites e prazos.

## Licença

Distribuído sob a [licença MIT](LICENSE).

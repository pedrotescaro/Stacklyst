import fs from 'node:fs/promises';
import path from 'node:path';

// Structural reference only: business rules remain in the manually reviewed chapters.
const root = process.cwd();
const output = path.join(root, 'docs/manual/referencias');
await fs.mkdir(output, { recursive: true });
const slash = (s) => s.replaceAll('\\', '/');
const cell = (s) => String(s).replaceAll('|', '\\|').replaceAll('\n', ' ').trim();
const link = (file) => `[${file}](${slash(path.relative(output, path.join(root, file)))})`;
async function walk(dir) {
  const result = [];
  for (const entry of await fs.readdir(path.join(root, dir), { withFileTypes: true })) {
    if (
      ['node_modules', '.expo', '.next', 'android', 'ios', 'dist', 'build', 'coverage'].includes(
        entry.name
      )
    )
      continue;
    const name = `${dir}/${entry.name}`;
    if (entry.isDirectory()) result.push(...(await walk(name)));
    else result.push(name);
  }
  return result;
}
const files = [
  ...(await walk('src')),
  ...(await walk('apps/mobile')),
  ...(await walk('scripts')),
].sort();
const implementation = files.filter(
  (f) =>
    /\.(tsx?|[mc]?js|css)$/.test(f) &&
    !/(__tests__|\.test\.|\.spec\.|document\.generated|\.d\.ts$)/.test(f)
);
const texts = new Map(
  await Promise.all(implementation.map(async (f) => [f, await fs.readFile(f, 'utf8')]))
);
const groups = new Map();
function responsibility(file, text) {
  if (file.endsWith('/route.ts'))
    return 'Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.';
  if (file.endsWith('/page.tsx'))
    return 'Entrada de página do App Router; carrega ou compõe a experiência desta rota.';
  if (file.endsWith('/layout.tsx'))
    return 'Estrutura compartilhada e composição das páginas descendentes.';
  if (file.endsWith('.css'))
    return 'Regras de apresentação, estados visuais e adaptação responsiva; não é autoridade de dados.';
  if (file.startsWith('scripts/'))
    return 'Ferramenta executável de desenvolvimento/geração/verificação; leia efeitos e entradas antes de rodar.';
  if (file.includes('/__tests__/'))
    return 'Verificação automatizada do comportamento correspondente.';
  if (file.includes('/services/'))
    return 'Caso de uso do domínio, integrando regras, persistência e efeitos associados.';
  if (file.includes('/components/'))
    return 'Componente de interface; símbolos e dependências abaixo mostram sua composição.';
  if (file.includes('/hooks/'))
    return 'Hook para reutilizar estado, efeitos ou integração de interface.';
  if (file.includes('/contexts/'))
    return 'Contexto/provedor de estado compartilhado entre componentes.';
  if (/types|schema|catalog/.test(path.basename(file)))
    return 'Contratos, validação ou catálogo do domínio; distinguir tipos estáticos de validação runtime.';
  if (/repository/.test(file))
    return 'Consultas e persistência do domínio; conferir transações e controle de acesso.';
  if (text.includes("'server-only'"))
    return 'Módulo restrito ao servidor; regras ou infraestrutura não devem entrar no bundle do navegador.';
  return 'Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.';
}
function symbols(text) {
  const patterns = [
    /^\s{2}async\s+(\w+)\s*\(/gm,
    /(?:export\s+)?(?:async\s+)?function\s+(\w+)/g,
    /export\s+(?:const|class|interface|type|enum)\s+(\w+)/g,
    /^\s{2}(?:async\s+)?(\w+)\s*\([^\n]*\)\s*(?:\{|:)/gm,
  ];
  return [...new Set(patterns.flatMap((p) => [...text.matchAll(p)].map((m) => m[1])))].filter(
    (n) => !['if', 'for', 'switch', 'catch', 'while'].includes(n)
  );
}
for (const file of implementation) {
  const group = file.startsWith('src/lib/')
    ? 'dominio'
    : file.startsWith('src/app/')
      ? 'paginas-api'
      : file.startsWith('src/components/')
        ? 'componentes'
        : file.startsWith('apps/')
          ? 'mobile'
          : file.startsWith('scripts/')
            ? 'ferramentas'
            : 'estado-infra';
  if (!groups.has(group)) groups.set(group, []);
  groups.get(group).push(file);
}
let index =
  '# Referências do código\n\nGeradas por `scripts/build-platform-reference.mjs`. Refletem arquivos locais, não implantação. Comentários são transcritos da fonte e podem exigir revisão. Símbolos são localizados por análise lexical; funções anônimas e construções dinâmicas podem não aparecer. O gerador não infere o algoritmo de uma função.\n\n';
for (const [group, members] of groups) {
  index += `- [${group}](${group}.md): ${members.length} arquivos de implementação.\n`;
  let doc = `# Código: ${group}\n\n[Índice](README.md) · [Manual](../README.md)\n\n`;
  for (const file of members) {
    const text = texts.get(file);
    const imports = [...text.matchAll(/(?:from\s*|import\s*)['"]([^'"]+)['"]/g)].map((m) => m[1]);
    const comments = [...text.matchAll(/\/\*\*([\s\S]*?)\*\//g)].map((m) =>
      m[1].replace(/^\s*\* ?/gm, '').trim()
    );
    const tests = files.filter(
      (f) =>
        /\.(test|spec)\./.test(f) &&
        path.basename(f).replace(/\.(test|spec)\./, '.') === path.basename(file)
    );
    doc += `## ${file}\n\nFonte: ${link(file)}\n\n${responsibility(file, text)}\n\n`;
    doc += `Símbolos localizados: ${
      symbols(text)
        .map((s) => '`' + s + '`')
        .join(', ') || 'sem declaração nomeada reconhecida; ler a composição do arquivo'
    }.\n\n`;
    const local = imports.filter((i) => i.startsWith('.') || i.startsWith('@/'));
    if (local.length)
      doc += `Dependências locais declaradas: ${[...new Set(local)].map((i) => '`' + i + '`').join(', ')}.\n\n`;
    const packages = imports.filter((i) => !i.startsWith('.') && !i.startsWith('@/'));
    if (packages.length)
      doc += `Integrações/imports externos: ${[...new Set(packages)].map((i) => '`' + i + '`').join(', ')}.\n\n`;
    if (comments.length)
      doc += `Comentários de contrato presentes na fonte:\n\n${comments.map((c) => '> ' + c.replaceAll('\n', '\n> ')).join('\n\n')}\n\n`;
    if (tests.length)
      doc += `Testes associados pelo nome: ${tests.map(link).join(', ')}. Outros testes de integração podem cobrir este módulo.\n\n`;
  }
  await fs.writeFile(path.join(output, `${group}.md`), doc);
}
await fs.writeFile(path.join(output, 'README.md'), index);
let api =
  '# Páginas e contratos HTTP\n\nMétodos extraídos das declarações exportadas, sem inventar contrato de resposta. Abra a rota para campos, códigos HTTP e permissões. Ter um middleware não elimina validações do recurso.\n\n| Caminho | Métodos | Arquivo | Schemas referenciados |\n| --- | --- | --- | --- |\n';
for (const [file, text] of texts)
  if (file.startsWith('src/app/') && file.endsWith('/route.ts')) {
    const methods = [
      ...new Set(
        [
          ...text.matchAll(
            /export\s+(?:(?:async\s+)?function|const)\s+(GET|POST|PATCH|PUT|DELETE|OPTIONS|HEAD)\b/g
          ),
        ].map((m) => m[1])
      ),
    ];
    const schemas = [
      ...new Set([...text.matchAll(/(\w*[Ss]chema)\.(?:parse|safeParse)/g)].map((m) => m[1])),
    ];
    api += `| /${file.slice(8, -9)} | ${methods.join(', ')} | ${link(file)} | ${schemas.join(', ')} |\n`;
  }
api += '\n## Páginas\n\n| Rota de arquivo | Fonte |\n| --- | --- |\n';
for (const [file] of texts)
  if (file.startsWith('src/app/') && file.endsWith('/page.tsx'))
    api += `| /${file.slice(8, -9)} | ${link(file)} |\n`;
await fs.writeFile(path.join(output, 'apis.md'), api);
const schema = await fs.readFile(path.join(root, 'prisma/schema.prisma'), 'utf8');
let database =
  '# Dicionário do banco\n\nExtraído do schema Prisma local para o escopo funcional documentado. Estruturas residuais fora desse escopo não são apresentadas como recursos atuais; o schema continua sendo o inventário físico completo. Tipo seguido de `?` permite ausência; `[]` representa coleção. `@id` identifica; `@unique` impede repetição; `@relation` vincula modelos; `@@map` informa a tabela física. O schema não comprova aplicação da migration no banco.\n\n';
for (const m of schema.matchAll(/^(model|enum)\s+(\w+)\s*\{([\s\S]*?)^\}/gm)) {
  database += `## ${m[1]} ${m[2]}\n\n`;
  if (m[1] === 'enum')
    database +=
      m[3]
        .split('\n')
        .map((s) => s.trim())
        .filter((s) => s && !s.startsWith('//'))
        .map((s) => '- `' + s + '`')
        .join('\n') + '\n\n';
  else {
    database += '| Campo | Tipo | Restrições, relações e defaults |\n| --- | --- | --- |\n';
    for (const line of m[3].split('\n')) {
      const field = line.trim().match(/^(\w+)\s+(\S+)\s*(.*)$/);
      if (field)
        database += `| ${field[1]} | ${cell(field[2])} | ${cell(field[3])} |\n`;
    }
    database +=
      '\nConfiguração do modelo: ' +
      m[3]
        .split('\n')
        .map((s) => s.trim())
        .filter((s) => s.startsWith('@@'))
        .map((s) => '`' + s + '`')
        .join('; ') +
      '.\n\n';
  }
}
await fs.writeFile(path.join(output, 'banco.md'), database);
let tech =
  '# Tecnologias e dependências\n\nInventário das declarações locais; faixas de versão são do manifesto, versões resolvidas pertencem ao lockfile. Dependência declarada não prova uso em toda tela nem serviço externo ativo.\n\n## Linguagens e formatos\n\nTypeScript/TSX implementam aplicação e contratos; JavaScript/MJS implementam ferramentas; JSX descreve árvores React; CSS define apresentação; SQL descreve migrations PostgreSQL; Prisma DSL define modelos; JSON define catálogos/configuração; Markdown documenta; YAML configura automações quando presente; HTML participa de documentos embarcados. Python aparece em ferramentas auxiliares quando listado no repositório. Linguagens oferecidas ao aluno são um catálogo separado: consulte `LANGUAGES` e o executor.\n\n## Famílias principais\n\nNext.js/React: páginas e componentes. Prisma/pg/PostgreSQL: persistência. Supabase: autenticação e infraestrutura configurada. Zod: contratos de entrada. CodeMirror: edição de código. QuickJS: sandbox JS. Tailwind/CSS e bibliotecas de movimento: apresentação. Expo/React Native/WebView: aplicativo. Vitest/Testing Library/Puppeteer: testes. LibreSprite: fontes e exportação de pixel art, ferramenta externa ao npm. Bibliotecas PDF/QR/fontes: certificados. Integrações opcionais dependem de configuração, quota e disponibilidade.\n\n';
for (const manifest of ['package.json', 'apps/mobile/package.json']) {
  const pkg = JSON.parse(await fs.readFile(path.join(root, manifest), 'utf8'));
  tech += `## ${manifest}\n\n### Comandos\n\n| Comando | Execução declarada |\n| --- | --- |\n`;
  for (const [k, v] of Object.entries(pkg.scripts ?? {})) tech += `| ${k} | ${cell(v)} |\n`;
  for (const field of ['dependencies', 'devDependencies', 'overrides']) {
    tech += `\n### ${field}\n\n| Pacote | Versão/configuração |\n| --- | --- |\n`;
    for (const [k, v] of Object.entries(pkg[field] ?? {}))
      tech += `| ${k} | ${cell(typeof v === 'string' ? v : JSON.stringify(v))} |\n`;
  }
}
tech +=
  '\n## Ambiente: nomes do template, sem valores reais\n\n| Variável | Contexto declarado no template |\n| --- | --- |\n';
let context = [];
for (const line of (await fs.readFile(path.join(root, '.env.example'), 'utf8')).split('\n')) {
  if (line.startsWith('#')) {
    context.push(line.replace(/^#\s?/, ''));
    context = context.slice(-3);
  }
  const m = line.match(/^([A-Z][A-Z0-9_]+)=/);
  if (m) {
    tech += `| ${m[1]} | ${cell(context.join(' '))} |\n`;
    context = [];
  }
}
await fs.writeFile(path.join(output, 'tecnologias.md'), tech);
console.log(
  `Documented ${implementation.length} implementation files, routes, schema models/enums and both package manifests.`
);

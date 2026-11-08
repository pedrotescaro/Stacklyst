/** Builds documentation only. Never connects to a database or executes application actions. */
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import ts from 'typescript';

const root = process.cwd();
const dir = path.join(root, 'docs/manual/detalhado');
const link = (file) => `[${file}](../../../${file})`;
const cell = (value) => String(value).replaceAll('|', '\\|').replaceAll('\n', ' ');
const read = (file) => fs.readFile(path.join(root, file), 'utf8');
const write = (file, text) => fs.writeFile(path.join(dir, file), text, 'utf8');
const fingerprints = {};
const remember = (file, text) => {
  fingerprints[file] = createHash('sha256').update(text).digest('hex');
};
const baseline = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim();
const header = (title) =>
  `# ${title}\n\n[Índice](README.md). Gerado por ${link('scripts/build-system-handbook.mjs')}. Base de código: \`${baseline}\`. Comentários explicativos são editoriais; os trechos e modelos vêm dos arquivos indicados.\n\n`;
await fs.mkdir(path.join(dir, 'diagramas'), { recursive: true });

const cases = JSON.parse(await read('docs/manual/detalhado/catalogo-casos.json'));
let useCases = header('Cenários de implementação detalhados');
useCases +=
  'Os IDs Cxx identificam recortes técnicos e não são contados como casos de uso acadêmicos. O [catálogo consolidado](catalogo-academico.md) contém 24 casos de uso, todos presentes na visão geral do Astah. A matriz de equivalência relaciona estes cenários aos objetivos dos atores. As regras Rxx estão em [requisitos e regras](requisitos-e-regras.md). Autorização adicional e erros exatos devem ser conferidos na rota e no serviço.\n\n';
useCases += '| Caso | Área | Objetivo |\n| --- | --- | --- |\n';
for (const c of cases) {
  await fs.access(path.join(root, c.source));
  useCases += `| ${c.id} | ${c.area} | ${c.title} |\n`;
}
for (const c of cases) {
  useCases += `\n## ${c.id} — ${c.title}\n\n**Área:** ${c.area}. **Ator:** ${c.actor}.\n\n**Pré-condições:** ${c.preconditions}.\n\n**Fluxo principal:**\n\n${c.steps.map((step, i) => `${i + 1}. ${step}.`).join('\n')}\n\n**Pós-condição de sucesso:** ${c.success}.\n\n**Alternativas e exceções:** ${c.alternatives}.\n\n**Regras relacionadas:** ${c.rules.join(', ')}.\n\n**Implementação de referência:** ${link(c.source)}. A fonte deve ser lida junto com seu adaptador e controles de acesso; o nome do arquivo não substitui a regra.\n`;
}
await write('casos-de-uso.md', useCases);

const excerpts = [
  [
    'src/lib/api-handler.ts',
    'apiHandler',
    'Envolve adaptadores HTTP, associa request ID, resolve contexto e classifica parte dos erros. O wrapper não exige sozinho sessão para todos os recursos.',
  ],
  [
    'src/lib/auth.ts',
    'requireAuth',
    'Converte a exigência de uma identidade em contrato de servidor; a autorização do recurso ainda pertence ao fluxo específico.',
  ],
  [
    'src/lib/learning/progress.ts',
    'deriveKnowledgeStatus',
    'Preserva estados já conquistados e distingue pré-requisito obrigatório de recomendação.',
  ],
  [
    'src/lib/learning/progress.ts',
    'calculatePathProgress',
    'Conta nós concluídos, calcula percentual e procura a próxima indicação sem inventar conclusão.',
  ],
  [
    'src/lib/learning/lesson-progress.ts',
    'requireLessonAccess',
    'Confere pré-requisitos da lição e conserva revisão de conclusão anterior legítima.',
  ],
  [
    'src/lib/learning/assessment.ts',
    'assessLessonStep',
    'Despacha a avaliação conforme o tipo da atividade; schema válido não significa resposta correta.',
  ],
  [
    'src/lib/learning/assessment.ts',
    'publicLesson',
    'Remove gabaritos e elementos internos antes de entregar o catálogo ao aluno.',
  ],
  [
    'src/lib/learning/lesson-progress.ts',
    'saveLessonAssessment',
    'Identifica primeira conclusão sob transação/lock e reúne progresso, XP e fechamento da lição.',
  ],
  [
    'src/lib/exercises/evaluator.ts',
    'evaluateExerciseCode',
    'Coordena harness, execução e leitura de resultados dos casos de teste.',
  ],
  [
    'src/lib/exercises/repository.ts',
    'recordExerciseSubmission',
    'Registra a submissão e aplica a política de conclusão/recompensa, separada de uma simples execução.',
  ],
  [
    'src/lib/exercises/repository.ts',
    'recordAssistanceEvent',
    'Registra o uso de ajuda no contrato do exercício.',
  ],
  [
    'src/lib/exercises/progression.ts',
    'calculateExerciseXp',
    'Explicita os multiplicadores atuais por modo; eles não aumentam XP na configuração atual.',
  ],
  [
    'src/lib/exercises/progression.ts',
    'deriveCompletedNodeStatus',
    'Conclui o nó sem declarar domínio independente que não foi medido.',
  ],
  [
    'src/lib/code-execution/server.ts',
    'prepareCode',
    'Adapta fragmentos de determinadas linguagens ao programa exigido pelo provedor, sem assegurar correção pedagógica.',
  ],
  [
    'src/lib/code-execution/server.ts',
    'executeCode',
    'Escolhe o caminho de execução e distingue resultado de indisponibilidade.',
  ],
  [
    'src/lib/xp.ts',
    'awardXPInTransaction',
    'Centraliza o crédito confirmado no contexto da transação recebida.',
  ],
  [
    'src/lib/learning/rewards.ts',
    'calculateLevel',
    'Usa limites iniciais e incrementos crescentes; nível não é sinônimo de faixa visual.',
  ],
  [
    'src/lib/credentials/repository.ts',
    'reconcileCredentialsInTransaction',
    'Confronta evidências e metas e persiste snapshots elegíveis de credencial.',
  ],
  [
    'src/lib/credentials/repository.ts',
    'getEarnedCredentials',
    'Lê credenciais públicas válidas sem conceder novas por causa de visita ao perfil.',
  ],
  [
    'src/lib/credentials/repository.ts',
    'getPublicCredential',
    'Limita formato do identificador e retorna o registro de verificação correspondente.',
  ],
  [
    'src/services/post.service.ts',
    'create',
    'Cria publicação a partir de contrato e anexos autorizados, com identificação de pedidos repetidos.',
  ],
  [
    'src/services/post.service.ts',
    'getFeed',
    'Monta consulta por filtros, cursor e visibilidade antes de apresentar a página.',
  ],
  [
    'src/services/post-access.service.ts',
    'visiblePostWhere',
    'Compõe restrições de autor e audiência para consulta; conhecer ID não concede acesso.',
  ],
  [
    'src/services/reaction.service.ts',
    'toggleReaction',
    'Serializa transições de reação e seus efeitos/reversões de XP.',
  ],
  [
    'src/services/follow.service.ts',
    'toggleFollow',
    'Representa a relação direcional de seguir, distinta de amizade mútua.',
  ],
  [
    'src/services/notification.service.ts',
    'getUserNotifications',
    'Consulta notificações do destinatário aplicando a política do serviço.',
  ],
  [
    'src/services/notification.service.ts',
    'markAllAsRead',
    'Marca somente os registros do destinatário informado pelo fluxo autorizado.',
  ],
  [
    'src/services/profile-customization.service.ts',
    'saveProfileCustomization',
    'Valida preferências, versão e itens permitidos para gravar a identidade do titular.',
  ],
  [
    'src/lib/mundinho/rules.ts',
    'dayKey',
    'Define dia civil em São Paulo para recibos e sequências; não é relógio livre do navegador.',
  ],
  [
    'src/lib/mundinho/rules.ts',
    'resolveTurn',
    'Resolve combate de criatura com efeitos do golpe e contra-ataque; PvP usa alternância própria.',
  ],
  [
    'src/lib/mundinho/equipment.ts',
    'equipmentStats',
    'Deriva bônus de itens efetivamente possuídos e equipados em slots válidos.',
  ],
  [
    'src/lib/mundinho/repository.ts',
    'credit',
    'Liga crédito ao recibo único no extrato para reconhecer repetição.',
  ],
  [
    'src/lib/mundinho/repository.ts',
    'adventure',
    'Coordena ações autenticadas do RPG; a função completa contém os ramos de economia e batalha.',
  ],
  [
    'src/lib/mundinho/arena-rules.ts',
    'validArenaPosition',
    'Confere limites de movimento e deslocamento compatível com tempo decorrido.',
  ],
  [
    'src/lib/mundinho/arena-rules.ts',
    'chooseArenaAttack',
    'Trava sorteio/seleção do exercício e resolve golpe direto com o snapshot de equipamento.',
  ],
  [
    'src/lib/mundinho/arena-rules.ts',
    'advanceArenaTurn',
    'Aplica dano, cura e desgaste, verifica encerramento e alterna o ator do turno.',
  ],
  [
    'src/lib/mundinho/arena.ts',
    'arena',
    'Integra identidade, participação, presença, turnos, compilação e persistência da sala.',
  ],
  [
    'src/lib/duels/resolution-policy.ts',
    'chooseBestDuelSubmission',
    'Escolhe a submissão representativa de um participante segundo validade e critérios da política.',
  ],
  [
    'src/lib/duels/resolution-policy.ts',
    'decideDuelResolution',
    'Aplica a ordem de correção, igualdade normalizada e desempate, distinguindo revisão de empate.',
  ],
  [
    'src/lib/duels/resolution.ts',
    'awardDuelWinnerXP',
    'Mantém crédito de vitória associado ao resultado e sua proteção contra repetição.',
  ],
  [
    'src/services/evaluator.service.ts',
    'checkEligibility',
    'Confere XP ou conclusão real de trilha para a candidatura a avaliador.',
  ],
  [
    'src/services/evaluator.service.ts',
    'submitDuelEvaluation',
    'Confronta autorização, situação e conflito antes do parecer humano e seus efeitos.',
  ],
  [
    'src/lib/mobile/company-access.ts',
    'requireCompanyAccess',
    'Exige empresa existente e administrador ou recrutador proprietário.',
  ],
  [
    'src/services/job.service.ts',
    'applyForJob',
    'Rejeita vaga inadequada/duplicata e cria candidatura inicial.',
  ],
  [
    'src/services/job.service.ts',
    'updateApplicationStage',
    'Grava movimento do funil com auditoria e trata notificação posterior separadamente.',
  ],
  [
    'src/services/event.service.ts',
    'participate',
    'Serializa a disputa de capacidade e confere encerramento, nível e participação existente.',
  ],
  [
    'src/services/event-challenge.service.ts',
    'replaceSet',
    'Valida a permissão e substitui o conjunto editável de desafios em transação.',
  ],
  [
    'prisma/demo-community/publish.ts',
    'planCommunity',
    'Recusa colisões com contas comuns e prepara uma importação de escopo reservado.',
  ],
  [
    'prisma/demo-community/publish.ts',
    'publishCommunity',
    'Atualiza perfis e publicações com namespace/IDs estáveis sem usar o seed destrutivo.',
  ],
];
let codeDoc = header('Código comentado e rastreável');
codeDoc +=
  'Cada seção explica uma responsabilidade e mostra **até 48 linhas iniciais** de uma declaração real. Quando há truncamento, o comportamento restante deve ser acompanhado no arquivo completo e no capítulo. Linhas omitidas não são código substituto. Exemplos pedagógicos escritos no manual são identificados separadamente.\n\n';
for (const [file, symbol, why] of excerpts) {
  const text = await read(file);
  remember(file, text);
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  let found;
  function visit(node) {
    if (
      !found &&
      (ts.isFunctionDeclaration(node) ||
        ts.isMethodDeclaration(node) ||
        ts.isVariableDeclaration(node)) &&
      node.name?.getText(source) === symbol
    )
      found = node;
    ts.forEachChild(node, visit);
  }
  visit(source);
  if (!found) throw new Error(`Missing documentation symbol: ${file}::${symbol}`);
  const begin = source.getLineAndCharacterOfPosition(found.getStart(source)).line + 1;
  const end = source.getLineAndCharacterOfPosition(found.end).line + 1;
  const lines = text.split(/\r?\n/).slice(begin - 1, Math.min(end, begin + 47));
  codeDoc += `## ${symbol}\n\n${why}\n\n**Fonte:** ${link(file)}. Declaração nas linhas ${begin}–${end}; recorte ${begin}–${begin + lines.length - 1}.\n\n\`\`\`ts\n${lines.join('\n')}\n\`\`\`\n\n**Como ler:** identifique argumentos e sua origem; acompanhe validações e ramos; localize a gravação/retorno e os erros. Consulte o fluxo completo nas [sequências](sequencias.md).\n\n`;
}
await write('codigo-comentado.md', codeDoc);

const schema = await read('prisma/schema.prisma');
remember('prisma/schema.prisma', schema);
const allModels = [...schema.matchAll(/^model (\w+) \{([\s\S]*?)^\}/gm)].map((m) => ({
  name: m[1],
  body: m[2],
}));
const allModelNames = new Set(allModels.map((m) => m.name));
// Scope reflects the current product; residual storage structures are not active modules.
const models = allModels.filter((m) => !['Guild', 'GuildMember'].includes(m.name));
const names = new Set(models.map((m) => m.name));
const edges = [];
for (const model of models) {
  for (const line of model.body.split('\n')) {
    const field = line.match(/^\s+(\w+)\s+(\w+)(\[\]|\?)?\s*(.*)$/);
    if (!field || !names.has(field[2])) continue;
    const foreign = field[4].match(/fields:\s*\[([^\]]+)\]/);
    if (!foreign) continue;
    const fk = foreign[1].split(',').map((s) => s.trim());
    const unique =
      fk.length === 1 && new RegExp(`^\\s+${fk[0]}\\s+.*@unique`, 'm').test(model.body);
    const compositeUnique = [...model.body.matchAll(/@@(?:id|unique)\(\[([^\]]+)\]/g)].some(
      (m) => m[1].replaceAll(' ', '') === fk.join(',')
    );
    edges.push({
      parent: field[2],
      child: model.name,
      optional: field[3] === '?',
      one: unique || compositeUnique,
      fk,
    });
  }
}
const views = {
  geral: [...names],
  aprendizagem: [
    'User',
    'LanguageTrail',
    'KnowledgeNode',
    'KnowledgeEdge',
    'LearningPath',
    'LearningPathNode',
    'Exercise',
    'ExerciseTestCase',
    'UserNodeProgress',
    'ExerciseRun',
    'ExerciseSubmission',
    'LearningEvent',
    'Quiz',
    'QuizAttempt',
    'LearningCredential',
  ],
  comunidade: [
    'User',
    'Post',
    'PostMedia',
    'PostPoll',
    'PostPollOption',
    'PostPollVote',
    'Answer',
    'PostVote',
    'AnswerVote',
    'Reaction',
    'Bookmark',
    'Follow',
    'UserBlock',
    'Message',
    'MessageReaction',
    'Notification',
  ],
  mundinho: ['User', 'RpgPlayer', 'RpgTransaction', 'RpgBattle', 'RpgArenaRoom'],
  duelos: [
    'User',
    'DuelRequest',
    'Duel',
    'DuelSolution',
    'DuelSubmission',
    'DuelVote',
    'DuelEvaluation',
    'EvaluatorApplication',
    'EvaluatorProfile',
  ],
  recrutamento: ['User', 'Company', 'Job', 'JobRecruitmentStage', 'JobApplication'],
  eventos: ['User', 'Company', 'Event', 'EventParticipant', 'EventChallenge'],
  identidade: [
    'User',
    'ProfileCustomization',
    'ProfileAchievementCatalog',
    'UserProfileAchievement',
    'LearningCredential',
    'Badge',
    'UserBadge',
    'MobileDevice',
    'MobileState',
    'SecurityAuditEvent',
  ],
};
let erDoc = header('DER geral e visões por domínio');
erDoc +=
  'Visões do domínio funcional atual derivadas de `prisma/schema.prisma`, sem consultar registros nem afirmar migrations aplicadas. Estruturas residuais fora do escopo atual não são apresentadas como funcionalidades; o schema é a fonte do inventário físico completo. Cada vínculo é extraído do lado que declara `@relation(fields: ..., references: ...)`. A vista geral mostra entidades/chaves; as vistas específicas incluem campos escalares selecionados. O dicionário completo de campos/enums está em [referências do banco](../referencias/banco.md). Listas/JSON são atributos, não tabelas implícitas.\n\n';
for (const [view, selected] of Object.entries(views)) {
  const selectedSet = new Set(selected);
  for (const n of selected) if (!names.has(n)) throw new Error(`Unknown ER model ${n}`);
  let mermaid = 'erDiagram\n';
  for (const model of models.filter((m) => selectedSet.has(m.name))) {
    mermaid += `  ${model.name} {\n`;
    const keyFields = [...model.body.matchAll(/@@id\(\[([^\]]+)\]/g)].flatMap((m) =>
      m[1].split(',').map((s) => s.trim())
    );
    const fields = model.body
      .split('\n')
      .map((l) => l.match(/^\s+(\w+)\s+(\w+)(\[\]|\?)?\s*(.*)$/))
      .filter((f) => f && !allModelNames.has(f[2]));
    let printed = 0;
    for (const f of fields) {
      const pk = /@id\b/.test(f[4]) || keyFields.includes(f[1]);
      const fk = edges.some((e) => e.child === model.name && e.fk.includes(f[1]));
      if (view === 'geral' && !pk && !fk) continue;
      if (view !== 'geral' && printed >= 9 && !pk && !fk) continue;
      mermaid += `    ${f[2]}${f[3] === '[]' ? 'Array' : ''} ${f[1]}${pk ? ' PK' : fk ? ' FK' : ''}\n`;
      printed++;
    }
    mermaid += '  }\n';
  }
  for (const e of edges.filter((e) => selectedSet.has(e.parent) && selectedSet.has(e.child)))
    mermaid += `  ${e.parent} ${e.optional ? 'o|' : '||'}--${e.one ? 'o|' : 'o{'} ${e.child} : "${e.fk.join('_')}"\n`;
  await write(`diagramas/der-${view}.mmd`, mermaid);
  erDoc += `## ${view}\n\n[Fonte Mermaid](diagramas/der-${view}.mmd). ${selected.length} entidades nesta vista. Para evitar uma única imagem ilegível, use a visão específica do fluxo na apresentação.\n\n\`\`\`mermaid\n${mermaid}\`\`\`\n\n`;
}
await write('banco-diagramas.md', erDoc.replaceAll(String.fromCharCode(96).repeat(3) + 'mermaid', String.fromCharCode(96).repeat(3) + 'text'));

async function walk(directory) {
  const result = [];
  for (const entry of await fs.readdir(path.join(root, directory), { withFileTypes: true })) {
    const file = `${directory}/${entry.name}`;
    if (entry.isDirectory() && entry.name !== '__tests__') result.push(...(await walk(file)));
    else if (entry.isFile() && /\.tsx?$/.test(file) && !/\.(test|spec)\./.test(file))
      result.push(file);
  }
  return result;
}
const errorDefaults = {
  UnauthorizedError: ['UNAUTHORIZED', 401],
  ForbiddenError: ['FORBIDDEN', 403],
  NotFoundError: ['NOT_FOUND', 404],
  ValidationError: ['VALIDATION_ERROR', 400],
  RateLimitError: ['RATE_LIMITED', 429],
  ConnectionError: ['CONNECTION_ERROR', 503],
  SessionExpiredError: ['SESSION_EXPIRED', 401],
};
const errors = [];
for (const file of await walk('src')) {
  if (file.includes('/guilds/')) continue;
  const text = await read(file);
  const source = ts.createSourceFile(
    file,
    text,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  );
  function visit(node) {
    if (ts.isNewExpression(node)) {
      const name = node.expression.getText(source),
        args = node.arguments ?? [];
      const literal = (i) =>
        args[i] && (ts.isStringLiteral(args[i]) || ts.isNoSubstitutionTemplateLiteral(args[i]))
          ? args[i].text
          : null;
      if (name === 'AppError' || name in errorDefaults) {
        const code = literal(0) ?? errorDefaults[name]?.[0];
        if (code)
          errors.push({
            file,
            line: source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1,
            code,
            status:
              name === 'AppError'
                ? (args[2]?.getText(source) ?? 'definido em runtime')
                : errorDefaults[name][1],
            message: literal(1) ?? 'mensagem definida pelo fluxo/classe',
          });
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
}
let errorDoc = header('Erros de domínio localizados no código');
errorDoc +=
  'Extração sintática de construções `new AppError` e subclasses conhecidas com código literal/padrão. Não executa rotas. Não inclui todo `NextResponse.json`, `new Error` genérico ou códigos montados dinamicamente; portanto não é uma lista exaustiva de todas as respostas HTTP. Mensagens parametrizadas exigem ler a origem.\n\n| Código | Status | Mensagem literal ou indicação | Fonte e linha |\n| --- | --- | --- | --- |\n';
for (const e of errors)
  errorDoc += `| ${cell(e.code)} | ${cell(e.status)} | ${cell(e.message)} | ${link(e.file)}:${e.line} |\n`;
await write('erros-do-codigo.md', errorDoc);
await write(
  'fontes-verificadas.json',
  JSON.stringify(
    {
      baseline,
      sources: fingerprints,
      counts: {
        useCases: JSON.parse(await read('docs/manual/detalhado/catalogo-academico.json')).length,
        implementationScenarios: cases.length,
        excerpts: excerpts.length,
        models: models.length,
        relations: edges.length,
        errorOccurrences: errors.length,
        databaseViews: Object.keys(views).length,
      },
    },
    null,
    2
  ) + '\n'
);
console.log(
  JSON.stringify({
    useCases: JSON.parse(await read('docs/manual/detalhado/catalogo-academico.json')).length,
    implementationScenarios: cases.length,
    excerpts: excerpts.length,
    models: models.length,
    relations: edges.length,
    databaseViews: Object.keys(views).length,
    errorOccurrences: errors.length,
  })
);

import type { LearningPathSummary } from '@/lib/learning/types';

export type TrailActivityKind = 'Conceito' | 'Exemplo guiado' | 'Prática' | 'Desafio';

export interface TrailCurriculumUnit {
  title: string;
  description: string;
  kind: TrailActivityKind;
}

export interface TrailCurriculumSection {
  title: string;
  goal: string;
  units: TrailCurriculumUnit[];
}

export interface TrailCurriculum {
  title: string;
  sections: TrailCurriculumSection[];
}

type RawSection = readonly [title: string, goal: string, units: readonly string[]];

const UNIT_KINDS: readonly TrailActivityKind[] = [
  'Conceito',
  'Exemplo guiado',
  'Prática',
  'Desafio',
];

function sentenceCase(value: string) {
  return value.charAt(0).toLowerCase() + value.slice(1);
}

const PRESERVED_TECHNICAL_TERMS = [
  'API',
  'Async',
  'HTTP',
  'JavaScript',
  'Map',
  'PostgreSQL',
  'React',
  'Retry-After',
  'TypeScript',
] as const;

function sentenceSubject(value: string) {
  const preservesInitial = PRESERVED_TECHNICAL_TERMS.some(
    (term) => value === term || value.startsWith(`${term} `)
  );
  return preservesInitial ? value : sentenceCase(value);
}

function describeUnit(kind: TrailActivityKind, title: string, goal: string) {
  const subject = sentenceSubject(title);
  const purpose = sentenceCase(goal).replace(/[.]$/, '');

  switch (kind) {
    case 'Conceito':
      return `Entenda ${subject} e os critérios necessários para ${purpose}.`;
    case 'Exemplo guiado':
      return `Acompanhe uma implementação de ${subject}, observando decisões e casos-limite.`;
    case 'Prática':
      return `Pratique ${subject} em uma tarefa curta com retorno imediato.`;
    case 'Desafio':
      return `Resolva ${subject} sem sugestões automáticas e valide a solução com testes ocultos.`;
  }
}

function defineCurriculum(title: string, rawSections: readonly RawSection[]): TrailCurriculum {
  return {
    title,
    sections: rawSections.map(([sectionTitle, goal, unitTitles]) => ({
      title: sectionTitle,
      goal,
      units: unitTitles.map((unitTitle, index) => {
        const kind = UNIT_KINDS[index] ?? 'Prática';
        return {
          title: unitTitle,
          description: describeUnit(kind, unitTitle, goal),
          kind,
        };
      }),
    })),
  };
}

const FRONTEND_REACT = defineCurriculum('Frontend React', [
  [
    'Base da interface',
    'transformar requisitos em comportamento previsível no navegador',
    [
      'JavaScript no navegador',
      'Funções de interface',
      'Eventos e atualizações',
      'Interface previsível',
    ],
  ],
  [
    'Componentes e composição',
    'construir interfaces reutilizáveis com contratos claros',
    [
      'Anatomia de um componente',
      'Props como contrato',
      'Composição com children',
      'Catálogo reutilizável',
    ],
  ],
  [
    'Renderização de coleções',
    'renderizar dados dinâmicos sem perder identidade ou consistência',
    ['Listas e chaves estáveis', 'Dados derivados', 'Renderização condicional', 'Painel filtrável'],
  ],
  [
    'Estado e formulários',
    'modelar interações locais e fluxos de edição sem estado duplicado',
    ['Estado local', 'Inputs controlados', 'Reducers para fluxos', 'Formulário resiliente'],
  ],
  [
    'Efeitos e APIs',
    'sincronizar a interface com serviços externos e tratar falhas',
    ['Ciclo de efeitos', 'Requisições HTTP', 'Cancelamento e concorrência', 'Busca assíncrona'],
  ],
  [
    'TypeScript no React',
    'expressar estados e contratos de componentes com tipos seguros',
    ['Props tipadas', 'Uniões para estados', 'Eventos e refs', 'Componente genérico'],
  ],
  [
    'Arquitetura e qualidade',
    'manter aplicações React acessíveis, testáveis e eficientes',
    ['Hooks reutilizáveis', 'Contexto e limites', 'Acessibilidade e testes', 'Performance medida'],
  ],
  [
    'Projeto de integração',
    'combinar estado, API e recuperação de falhas em uma entrega completa',
    ['Planejar o fluxo', 'Estado otimista', 'Falhas e recuperação', 'Aplicação completa'],
  ],
]);

const JAVASCRIPT_SYSTEMS = defineCurriculum('JavaScript para Sistemas', [
  [
    'Contratos da linguagem',
    'escrever funções que preservam contratos mesmo com entradas irregulares',
    ['Valores e coerção', 'Funções previsíveis', 'Erros como contrato', 'Normalizador robusto'],
  ],
  [
    'Escopo e módulos',
    'encapsular estado e separar responsabilidades entre módulos',
    ['Escopo léxico', 'Closures e encapsulamento', 'Módulos e fronteiras', 'Limitador por chave'],
  ],
  [
    'Coleções e transformações',
    'processar coleções com resultado determinístico e custo conhecido',
    ['Arrays sem mutação', 'Map e Set', 'Transformações determinísticas', 'Janelas de execução'],
  ],
  [
    'Runtime e event loop',
    'compreender a ordem de execução e diagnosticar bloqueios do runtime',
    ['Pilha de chamadas', 'Event loop', 'Filas e temporizadores', 'Diagnóstico de bloqueios'],
  ],
  [
    'Fluxos assíncronos',
    'coordenar tarefas assíncronas sem perder ordem ou controle de falhas',
    ['Promises compostas', 'Async e await', 'Concorrência limitada', 'Falhas e cancelamento'],
  ],
  [
    'Resiliência',
    'recuperar operações temporárias sem duplicar efeitos ou sobrecarregar serviços',
    ['Timeouts e retentativas', 'Backoff e Retry-After', 'Idempotência', 'Recuperação segura'],
  ],
  [
    'Integração HTTP',
    'consumir APIs com validação, limites e observabilidade',
    ['Contratos HTTP', 'Validação de entrada', 'Limites e observabilidade', 'Cliente resiliente'],
  ],
  [
    'Projeto de sistema',
    'entregar um pipeline concorrente, auditável e tolerante a falhas',
    ['Arquitetar o pipeline', 'Processar lotes', 'Auditar resultados', 'Sistema concorrente'],
  ],
]);

const ALGORITHMS = defineCurriculum('Algoritmos Aplicados', [
  [
    'Estratégia e complexidade',
    'decompor problemas, definir invariantes e estimar custo',
    ['Modelar o problema', 'Casos-limite', 'Complexidade de tempo', 'Solução justificável'],
  ],
  [
    'Arrays e tabelas hash',
    'usar acesso indexado e busca por chave para reduzir trabalho repetido',
    ['Varredura linear', 'Mapas de frequência', 'Duas pontas', 'Janela deslizante'],
  ],
  [
    'Pilhas e filas',
    'modelar ordem, histórico e processamento incremental',
    ['Pilha e pareamento', 'Fila de processamento', 'Deque monotônico', 'Parser de expressões'],
  ],
  [
    'Ordenação e busca',
    'explorar ordem para localizar respostas e combinar intervalos',
    ['Ordenações comparativas', 'Busca binária', 'Intervalos ordenados', 'Agenda sem conflitos'],
  ],
  [
    'Recursão e backtracking',
    'explorar espaços de solução com estado reversível e poda',
    ['Casos-base', 'Árvore de decisões', 'Poda de candidatos', 'Combinações válidas'],
  ],
  [
    'Árvores',
    'percorrer hierarquias e manter propriedades estruturais',
    ['Percursos em profundidade', 'Percursos em largura', 'Árvore de busca', 'Ancestral comum'],
  ],
  [
    'Grafos e dependências',
    'representar conexões, detectar ciclos e ordenar dependências',
    ['Lista de adjacência', 'Busca em grafos', 'Detecção de ciclos', 'Ordenação topológica'],
  ],
  [
    'Otimização aplicada',
    'combinar técnicas para resolver um problema completo sob restrições',
    ['Programação dinâmica', 'Escolhas gulosas', 'Caminhos mínimos', 'Desafio de planejamento'],
  ],
]);

const BACKEND_DATA = defineCurriculum('Backend e Dados', [
  [
    'Serviços HTTP',
    'desenhar endpoints com contratos claros e respostas consistentes',
    ['Ciclo da requisição', 'Rotas e controladores', 'Status e cabeçalhos', 'API consistente'],
  ],
  [
    'Validação e erros',
    'proteger as fronteiras do serviço e oferecer recuperação útil',
    ['Schemas de entrada', 'Erros de domínio', 'Respostas seguras', 'Contrato à prova de falhas'],
  ],
  [
    'Autenticação e segurança',
    'controlar identidade, autorização e abuso sem expor dados sensíveis',
    ['Sessões e tokens', 'Autorização por recurso', 'Rate limiting', 'Endpoint protegido'],
  ],
  [
    'Modelagem de dados',
    'traduzir regras de negócio em tabelas, relações e restrições',
    ['Entidades e relações', 'Chaves e restrições', 'Normalização pragmática', 'Modelo de pedidos'],
  ],
  [
    'Consultas PostgreSQL',
    'buscar e alterar dados com segurança e custo previsível',
    ['Consultas parametrizadas', 'Joins e agregações', 'Índices úteis', 'Relatório eficiente'],
  ],
  [
    'Transações e concorrência',
    'preservar consistência quando operações acontecem ao mesmo tempo',
    [
      'Limites da transação',
      'Bloqueios e isolamento',
      'Concorrência otimista',
      'Reserva consistente',
    ],
  ],
  [
    'Jobs e observabilidade',
    'executar trabalho assíncrono com rastreabilidade e recuperação',
    ['Filas e workers', 'Retentativas idempotentes', 'Logs e métricas', 'Processamento auditável'],
  ],
  [
    'Projeto fullstack',
    'integrar API, banco e cliente em um fluxo confiável de ponta a ponta',
    ['Planejar o domínio', 'Construir a API', 'Integrar persistência', 'Entrega fullstack'],
  ],
]);

export const CURRICULUM_BY_SLUG: Record<string, TrailCurriculum> = {
  'frontend-react': FRONTEND_REACT,
  'javascript-systems': JAVASCRIPT_SYSTEMS,
  algorithms: ALGORITHMS,
  'backend-data': BACKEND_DATA,
};

export const TRAIL_CURRICULUM_STEPS_PER_LESSON = 5;
export const TRAIL_CODE_CHALLENGE_STEPS_PER_LESSON = 1;

const TRAIL_LESSON_ID_PATTERN = /^([a-z]+)-([a-z0-9-]+)-s([1-8])-u([1-4])$/i;
const TRAIL_LESSON_STEP_ID_PATTERN = /^([a-z]+)-([a-z0-9-]+)-s([1-8])-u([1-4])-s([1-5])$/i;
const TRAIL_CODE_LESSON_ID_PATTERN = /^([a-z]+)-([a-z0-9-]+)-s([1-8])-u([1-4])-code-([1-2])$/i;
const TRAIL_CODE_LESSON_STEP_ID_PATTERN =
  /^([a-z]+)-([a-z0-9-]+)-s([1-8])-u([1-4])-code-([1-2])-s1$/i;

export function buildTrailLessonId(
  language: string,
  pathSlug: string,
  sectionNumber: number,
  unitNumber: number
) {
  return `${language.toLowerCase()}-${pathSlug}-s${sectionNumber}-u${unitNumber}`;
}

export function buildTrailCodeLessonId(
  language: string,
  pathSlug: string,
  sectionNumber: number,
  unitNumber: number,
  challengeSlot: number
) {
  return `${buildTrailLessonId(language, pathSlug, sectionNumber, unitNumber)}-code-${challengeSlot}`;
}

export function parseTrailLessonId(lessonId: string) {
  const codeMatch = TRAIL_CODE_LESSON_ID_PATTERN.exec(lessonId.trim());
  if (codeMatch && CURRICULUM_BY_SLUG[codeMatch[2]]) {
    return {
      kind: 'code' as const,
      language: codeMatch[1].toUpperCase(),
      pathSlug: codeMatch[2],
      sectionNumber: Number(codeMatch[3]),
      unitNumber: Number(codeMatch[4]),
      challengeSlot: Number(codeMatch[5]),
    };
  }

  const match = TRAIL_LESSON_ID_PATTERN.exec(lessonId.trim());
  if (!match || !CURRICULUM_BY_SLUG[match[2]]) return null;

  return {
    kind: 'curriculum' as const,
    language: match[1].toUpperCase(),
    pathSlug: match[2],
    sectionNumber: Number(match[3]),
    unitNumber: Number(match[4]),
  };
}

export function parseTrailLessonStepId(stepId: string) {
  const codeMatch = TRAIL_CODE_LESSON_STEP_ID_PATTERN.exec(stepId.trim());
  if (codeMatch && CURRICULUM_BY_SLUG[codeMatch[2]]) {
    const lessonId = buildTrailCodeLessonId(
      codeMatch[1],
      codeMatch[2],
      Number(codeMatch[3]),
      Number(codeMatch[4]),
      Number(codeMatch[5])
    );
    return {
      kind: 'code' as const,
      lessonId,
      language: codeMatch[1].toUpperCase(),
      pathSlug: codeMatch[2],
      sectionNumber: Number(codeMatch[3]),
      unitNumber: Number(codeMatch[4]),
      challengeSlot: Number(codeMatch[5]),
      stepNumber: 1,
      requiredSteps: TRAIL_CODE_CHALLENGE_STEPS_PER_LESSON,
    };
  }

  const match = TRAIL_LESSON_STEP_ID_PATTERN.exec(stepId.trim());
  if (!match || !CURRICULUM_BY_SLUG[match[2]]) return null;

  const lessonId = buildTrailLessonId(match[1], match[2], Number(match[3]), Number(match[4]));
  return {
    kind: 'curriculum' as const,
    lessonId,
    language: match[1].toUpperCase(),
    pathSlug: match[2],
    sectionNumber: Number(match[3]),
    unitNumber: Number(match[4]),
    stepNumber: Number(match[5]),
    requiredSteps: TRAIL_CURRICULUM_STEPS_PER_LESSON,
  };
}

export function getCompletedTrailLessonIds(stepIds: readonly string[]) {
  const completedSteps = new Map<string, { steps: Set<number>; requiredSteps: number }>();

  for (const stepId of stepIds) {
    const parsed = parseTrailLessonStepId(stepId);
    if (!parsed) continue;
    const completion = completedSteps.get(parsed.lessonId) ?? {
      steps: new Set<number>(),
      requiredSteps: parsed.requiredSteps,
    };
    completion.steps.add(parsed.stepNumber);
    completedSteps.set(parsed.lessonId, completion);
  }

  return [...completedSteps.entries()]
    .filter(([, completion]) => completion.steps.size >= completion.requiredSteps)
    .map(([lessonId]) => lessonId);
}

function inferCurriculum(path: LearningPathSummary) {
  const normalized = `${path.slug} ${path.title}`.toLocaleLowerCase('pt-BR');
  if (normalized.includes('frontend') || normalized.includes('react')) return FRONTEND_REACT;
  if (normalized.includes('sistema') || normalized.includes('javascript')) {
    return JAVASCRIPT_SYSTEMS;
  }
  if (normalized.includes('algorit')) return ALGORITHMS;
  if (normalized.includes('backend') || normalized.includes('dados')) return BACKEND_DATA;
  return null;
}

export function getTrailCurriculum(path: LearningPathSummary): TrailCurriculum {
  return CURRICULUM_BY_SLUG[path.slug] ?? inferCurriculum(path) ?? JAVASCRIPT_SYSTEMS;
}

export function findCurriculumUnit(
  pathSlug: string,
  sectionNumber: number,
  unitNumber: number
): {
  curriculum: TrailCurriculum;
  section: TrailCurriculumSection;
  unit: TrailCurriculumUnit;
} | null {
  const curriculum = CURRICULUM_BY_SLUG[pathSlug];
  if (!curriculum) return null;
  const section = curriculum.sections[sectionNumber - 1];
  if (!section) return null;
  const unit = section.units[unitNumber - 1];
  if (!unit) return null;
  return { curriculum, section, unit };
}

export function findCurriculumUnitByTitle(title: string): {
  curriculum: TrailCurriculum;
  section: TrailCurriculumSection;
  unit: TrailCurriculumUnit;
  sectionNumber: number;
  unitNumber: number;
  pathSlug: string;
} | null {
  const normTitle = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  for (const [slug, curriculum] of Object.entries(CURRICULUM_BY_SLUG)) {
    for (let sIdx = 0; sIdx < curriculum.sections.length; sIdx++) {
      const section = curriculum.sections[sIdx];
      for (let uIdx = 0; uIdx < section.units.length; uIdx++) {
        const unit = section.units[uIdx];
        const normUnitTitle = unit.title
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');
        if (
          normUnitTitle === normTitle ||
          normUnitTitle.includes(normTitle) ||
          normTitle.includes(normUnitTitle)
        ) {
          return {
            curriculum,
            section,
            unit,
            sectionNumber: sIdx + 1,
            unitNumber: uIdx + 1,
            pathSlug: slug,
          };
        }
      }
    }
  }
  return null;
}

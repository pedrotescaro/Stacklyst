import type {
  TrailActivityKind,
  TrailCurriculum,
  TrailCurriculumSection,
  TrailCurriculumUnit,
} from './trailCurriculum';

type CurriculumLanguage = 'pt' | 'en';

export const TRAIL_ACTIVITY_KIND_EN: Record<TrailActivityKind, string> = {
  Conceito: 'Concept',
  'Exemplo guiado': 'Guided example',
  Prática: 'Practice',
  Desafio: 'Challenge',
};

/** English copy for every curriculum title, section goal and unit title (keyed by the pt-BR text). */
export const TRAIL_CURRICULUM_EN: Record<string, string> = {
  // Curriculum titles
  'Frontend React': 'Frontend React',
  'JavaScript para Sistemas': 'JavaScript for Systems',
  'Algoritmos Aplicados': 'Applied Algorithms',
  'Backend e Dados': 'Backend and Data',

  // Frontend React
  'Base da interface': 'Interface foundations',
  'transformar requisitos em comportamento previsível no navegador':
    'turn requirements into predictable behavior in the browser',
  'JavaScript no navegador': 'JavaScript in the browser',
  'Funções de interface': 'Interface functions',
  'Eventos e atualizações': 'Events and updates',
  'Interface previsível': 'Predictable interface',
  'Componentes e composição': 'Components and composition',
  'construir interfaces reutilizáveis com contratos claros':
    'build reusable interfaces with clear contracts',
  'Anatomia de um componente': 'Anatomy of a component',
  'Props como contrato': 'Props as a contract',
  'Composição com children': 'Composition with children',
  'Catálogo reutilizável': 'Reusable catalog',
  'Renderização de coleções': 'Rendering collections',
  'renderizar dados dinâmicos sem perder identidade ou consistência':
    'render dynamic data without losing identity or consistency',
  'Listas e chaves estáveis': 'Lists and stable keys',
  'Dados derivados': 'Derived data',
  'Renderização condicional': 'Conditional rendering',
  'Painel filtrável': 'Filterable panel',
  'Estado e formulários': 'State and forms',
  'modelar interações locais e fluxos de edição sem estado duplicado':
    'model local interactions and editing flows without duplicated state',
  'Estado local': 'Local state',
  'Inputs controlados': 'Controlled inputs',
  'Reducers para fluxos': 'Reducers for flows',
  'Formulário resiliente': 'Resilient form',
  'Efeitos e APIs': 'Effects and APIs',
  'sincronizar a interface com serviços externos e tratar falhas':
    'sync the interface with external services and handle failures',
  'Ciclo de efeitos': 'Effect lifecycle',
  'Requisições HTTP': 'HTTP requests',
  'Cancelamento e concorrência': 'Cancellation and concurrency',
  'Busca assíncrona': 'Async search',
  'TypeScript no React': 'TypeScript in React',
  'expressar estados e contratos de componentes com tipos seguros':
    'express component states and contracts with safe types',
  'Props tipadas': 'Typed props',
  'Uniões para estados': 'Unions for states',
  'Eventos e refs': 'Events and refs',
  'Componente genérico': 'Generic component',
  'Arquitetura e qualidade': 'Architecture and quality',
  'manter aplicações React acessíveis, testáveis e eficientes':
    'keep React applications accessible, testable and efficient',
  'Hooks reutilizáveis': 'Reusable hooks',
  'Contexto e limites': 'Context and boundaries',
  'Acessibilidade e testes': 'Accessibility and tests',
  'Performance medida': 'Measured performance',
  'Projeto de integração': 'Integration project',
  'combinar estado, API e recuperação de falhas em uma entrega completa':
    'combine state, API and failure recovery in a complete delivery',
  'Planejar o fluxo': 'Plan the flow',
  'Estado otimista': 'Optimistic state',
  'Falhas e recuperação': 'Failures and recovery',
  'Aplicação completa': 'Complete application',

  // JavaScript for Systems
  'Contratos da linguagem': 'Language contracts',
  'escrever funções que preservam contratos mesmo com entradas irregulares':
    'write functions that keep their contracts even with irregular input',
  'Valores e coerção': 'Values and coercion',
  'Funções previsíveis': 'Predictable functions',
  'Erros como contrato': 'Errors as a contract',
  'Normalizador robusto': 'Robust normalizer',
  'Escopo e módulos': 'Scope and modules',
  'encapsular estado e separar responsabilidades entre módulos':
    'encapsulate state and split responsibilities across modules',
  'Escopo léxico': 'Lexical scope',
  'Closures e encapsulamento': 'Closures and encapsulation',
  'Módulos e fronteiras': 'Modules and boundaries',
  'Limitador por chave': 'Per-key limiter',
  'Coleções e transformações': 'Collections and transformations',
  'processar coleções com resultado determinístico e custo conhecido':
    'process collections with deterministic results and known cost',
  'Arrays sem mutação': 'Arrays without mutation',
  'Map e Set': 'Map and Set',
  'Transformações determinísticas': 'Deterministic transformations',
  'Janelas de execução': 'Execution windows',
  'Runtime e event loop': 'Runtime and event loop',
  'compreender a ordem de execução e diagnosticar bloqueios do runtime':
    'understand execution order and diagnose runtime blocking',
  'Pilha de chamadas': 'Call stack',
  'Event loop': 'Event loop',
  'Filas e temporizadores': 'Queues and timers',
  'Diagnóstico de bloqueios': 'Diagnosing blocking',
  'Fluxos assíncronos': 'Async flows',
  'coordenar tarefas assíncronas sem perder ordem ou controle de falhas':
    'coordinate async tasks without losing order or failure control',
  'Promises compostas': 'Composed promises',
  'Async e await': 'Async and await',
  'Concorrência limitada': 'Bounded concurrency',
  'Falhas e cancelamento': 'Failures and cancellation',
  Resiliência: 'Resilience',
  'recuperar operações temporárias sem duplicar efeitos ou sobrecarregar serviços':
    'recover transient operations without duplicating effects or overloading services',
  'Timeouts e retentativas': 'Timeouts and retries',
  'Backoff e Retry-After': 'Backoff and Retry-After',
  Idempotência: 'Idempotency',
  'Recuperação segura': 'Safe recovery',
  'Integração HTTP': 'HTTP integration',
  'consumir APIs com validação, limites e observabilidade':
    'consume APIs with validation, limits and observability',
  'Contratos HTTP': 'HTTP contracts',
  'Validação de entrada': 'Input validation',
  'Limites e observabilidade': 'Limits and observability',
  'Cliente resiliente': 'Resilient client',
  'Projeto de sistema': 'System project',
  'entregar um pipeline concorrente, auditável e tolerante a falhas':
    'deliver a concurrent, auditable and fault-tolerant pipeline',
  'Arquitetar o pipeline': 'Architect the pipeline',
  'Processar lotes': 'Process batches',
  'Auditar resultados': 'Audit results',
  'Sistema concorrente': 'Concurrent system',

  // Applied Algorithms
  'Estratégia e complexidade': 'Strategy and complexity',
  'decompor problemas, definir invariantes e estimar custo':
    'break down problems, define invariants and estimate cost',
  'Modelar o problema': 'Model the problem',
  'Casos-limite': 'Edge cases',
  'Complexidade de tempo': 'Time complexity',
  'Solução justificável': 'Justifiable solution',
  'Arrays e tabelas hash': 'Arrays and hash tables',
  'usar acesso indexado e busca por chave para reduzir trabalho repetido':
    'use indexed access and key lookups to reduce repeated work',
  'Varredura linear': 'Linear scan',
  'Mapas de frequência': 'Frequency maps',
  'Duas pontas': 'Two pointers',
  'Janela deslizante': 'Sliding window',
  'Pilhas e filas': 'Stacks and queues',
  'modelar ordem, histórico e processamento incremental':
    'model order, history and incremental processing',
  'Pilha e pareamento': 'Stack and matching',
  'Fila de processamento': 'Processing queue',
  'Deque monotônico': 'Monotonic deque',
  'Parser de expressões': 'Expression parser',
  'Ordenação e busca': 'Sorting and searching',
  'explorar ordem para localizar respostas e combinar intervalos':
    'use ordering to find answers and merge intervals',
  'Ordenações comparativas': 'Comparison sorts',
  'Busca binária': 'Binary search',
  'Intervalos ordenados': 'Sorted intervals',
  'Agenda sem conflitos': 'Conflict-free schedule',
  'Recursão e backtracking': 'Recursion and backtracking',
  'explorar espaços de solução com estado reversível e poda':
    'explore solution spaces with reversible state and pruning',
  'Casos-base': 'Base cases',
  'Árvore de decisões': 'Decision tree',
  'Poda de candidatos': 'Candidate pruning',
  'Combinações válidas': 'Valid combinations',
  Árvores: 'Trees',
  'percorrer hierarquias e manter propriedades estruturais':
    'traverse hierarchies and keep structural properties',
  'Percursos em profundidade': 'Depth-first traversals',
  'Percursos em largura': 'Breadth-first traversals',
  'Árvore de busca': 'Search tree',
  'Ancestral comum': 'Common ancestor',
  'Grafos e dependências': 'Graphs and dependencies',
  'representar conexões, detectar ciclos e ordenar dependências':
    'represent connections, detect cycles and order dependencies',
  'Lista de adjacência': 'Adjacency list',
  'Busca em grafos': 'Graph search',
  'Detecção de ciclos': 'Cycle detection',
  'Ordenação topológica': 'Topological sort',
  'Otimização aplicada': 'Applied optimization',
  'combinar técnicas para resolver um problema completo sob restrições':
    'combine techniques to solve a complete problem under constraints',
  'Programação dinâmica': 'Dynamic programming',
  'Escolhas gulosas': 'Greedy choices',
  'Caminhos mínimos': 'Shortest paths',
  'Desafio de planejamento': 'Planning challenge',

  // Backend and Data
  'Serviços HTTP': 'HTTP services',
  'desenhar endpoints com contratos claros e respostas consistentes':
    'design endpoints with clear contracts and consistent responses',
  'Ciclo da requisição': 'Request lifecycle',
  'Rotas e controladores': 'Routes and controllers',
  'Status e cabeçalhos': 'Status codes and headers',
  'API consistente': 'Consistent API',
  'Validação e erros': 'Validation and errors',
  'proteger as fronteiras do serviço e oferecer recuperação útil':
    'protect service boundaries and offer useful recovery',
  'Schemas de entrada': 'Input schemas',
  'Erros de domínio': 'Domain errors',
  'Respostas seguras': 'Safe responses',
  'Contrato à prova de falhas': 'Failure-proof contract',
  'Autenticação e segurança': 'Authentication and security',
  'controlar identidade, autorização e abuso sem expor dados sensíveis':
    'control identity, authorization and abuse without exposing sensitive data',
  'Sessões e tokens': 'Sessions and tokens',
  'Autorização por recurso': 'Per-resource authorization',
  'Rate limiting': 'Rate limiting',
  'Endpoint protegido': 'Protected endpoint',
  'Modelagem de dados': 'Data modeling',
  'traduzir regras de negócio em tabelas, relações e restrições':
    'translate business rules into tables, relations and constraints',
  'Entidades e relações': 'Entities and relations',
  'Chaves e restrições': 'Keys and constraints',
  'Normalização pragmática': 'Pragmatic normalization',
  'Modelo de pedidos': 'Orders model',
  'Consultas PostgreSQL': 'PostgreSQL queries',
  'buscar e alterar dados com segurança e custo previsível':
    'read and change data safely with predictable cost',
  'Consultas parametrizadas': 'Parameterized queries',
  'Joins e agregações': 'Joins and aggregations',
  'Índices úteis': 'Useful indexes',
  'Relatório eficiente': 'Efficient report',
  'Transações e concorrência': 'Transactions and concurrency',
  'preservar consistência quando operações acontecem ao mesmo tempo':
    'preserve consistency when operations happen at the same time',
  'Limites da transação': 'Transaction boundaries',
  'Bloqueios e isolamento': 'Locks and isolation',
  'Concorrência otimista': 'Optimistic concurrency',
  'Reserva consistente': 'Consistent reservation',
  'Jobs e observabilidade': 'Jobs and observability',
  'executar trabalho assíncrono com rastreabilidade e recuperação':
    'run async work with traceability and recovery',
  'Filas e workers': 'Queues and workers',
  'Retentativas idempotentes': 'Idempotent retries',
  'Logs e métricas': 'Logs and metrics',
  'Processamento auditável': 'Auditable processing',
  'Projeto fullstack': 'Fullstack project',
  'integrar API, banco e cliente em um fluxo confiável de ponta a ponta':
    'integrate API, database and client in a reliable end-to-end flow',
  'Planejar o domínio': 'Plan the domain',
  'Construir a API': 'Build the API',
  'Integrar persistência': 'Integrate persistence',
  'Entrega fullstack': 'Fullstack delivery',
};

function lowerFirst(value: string) {
  return value.charAt(0).toLowerCase() + value.slice(1);
}

const PRESERVED_EN_TERMS = [
  'API',
  'Async',
  'HTTP',
  'JavaScript',
  'Map',
  'PostgreSQL',
  'React',
  'Retry-After',
  'TypeScript',
];

function englishSubject(value: string) {
  return PRESERVED_EN_TERMS.some((term) => value === term || value.startsWith(`${term} `))
    ? value
    : lowerFirst(value);
}

export function translateCurriculumText(value: string, language: CurriculumLanguage) {
  if (language !== 'en') return value;
  return TRAIL_CURRICULUM_EN[value] ?? value;
}

export function localizeActivityKind(kind: string, language: CurriculumLanguage) {
  if (language !== 'en') return kind;
  return TRAIL_ACTIVITY_KIND_EN[kind as TrailActivityKind] ?? kind;
}

export function describeUnitInEnglish(kind: TrailActivityKind, title: string, goal: string) {
  const subject = englishSubject(translateCurriculumText(title, 'en'));
  const purpose = lowerFirst(translateCurriculumText(goal, 'en')).replace(/[.]$/, '');

  switch (kind) {
    case 'Conceito':
      return `Understand ${subject} and the criteria needed to ${purpose}.`;
    case 'Exemplo guiado':
      return `Follow an implementation of ${subject}, noting decisions and edge cases.`;
    case 'Prática':
      return `Practice ${subject} in a short task with immediate feedback.`;
    case 'Desafio':
      return `Solve ${subject} without automatic hints and validate the solution with hidden tests.`;
  }
}

function localizeUnit(
  unit: TrailCurriculumUnit,
  section: TrailCurriculumSection
): TrailCurriculumUnit {
  return {
    ...unit,
    title: translateCurriculumText(unit.title, 'en'),
    description: describeUnitInEnglish(unit.kind, unit.title, section.goal),
  };
}

/** Returns an English copy of the curriculum for display; the pt-BR source stays the identity. */
export function localizeTrailCurriculum(
  curriculum: TrailCurriculum,
  language: CurriculumLanguage
): TrailCurriculum {
  if (language !== 'en') return curriculum;
  return {
    title: translateCurriculumText(curriculum.title, 'en'),
    sections: curriculum.sections.map((section) => ({
      title: translateCurriculumText(section.title, 'en'),
      goal: translateCurriculumText(section.goal, 'en'),
      units: section.units.map((unit) => localizeUnit(unit, section)),
    })),
  };
}

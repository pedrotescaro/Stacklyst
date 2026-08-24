import { buildTrailCodeLessonId } from '@/app/trails/trailCurriculum';
import type { Lesson, LessonStep, TestCase } from './types';

interface CurriculumUnit {
  title: string;
  description: string;
}

interface CurriculumSection {
  title: string;
  goal: string;
}

interface CurriculumSummary {
  title: string;
}

interface CodeChallengeProfile {
  titleSuffix: string;
  instruction: string;
  codeTemplate: string;
  solutionCode: string;
  checkCode?: string;
  expectedOutput: string;
  hints: string[];
  testCases: TestCase[];
}

type JavascriptCase = [args: unknown[], expected: unknown];

function buildJavascriptCheck(functionName: string, cases: JavascriptCase[]) {
  return [
    'const __cases = ' + JSON.stringify(cases) + ';',
    'for (const [args, expected] of __cases) {',
    '  const received = ' + functionName + '(...args);',
    '  if (JSON.stringify(received) !== JSON.stringify(expected)) {',
    '    throw new Error("Caso falhou: esperado " + JSON.stringify(expected) + ", recebido " + JSON.stringify(received));',
    '  }',
    '}',
    'console.log("OK");',
  ].join('\n');
}

function createJavascriptProfile({
  functionName,
  titleSuffix,
  instruction,
  codeTemplate,
  solutionCode,
  cases,
  hints,
}: {
  functionName: string;
  titleSuffix: string;
  instruction: string;
  codeTemplate: string;
  solutionCode: string;
  cases: JavascriptCase[];
  hints: string[];
}): CodeChallengeProfile {
  return {
    titleSuffix,
    instruction,
    codeTemplate,
    solutionCode,
    checkCode: buildJavascriptCheck(functionName, cases),
    expectedOutput: 'OK',
    hints,
    testCases: cases.slice(0, 2).map(([args, expected], index) => ({
      id: 'case-' + (index + 1),
      description: 'Entrada ' + (index + 1) + ': ' + JSON.stringify(args),
      testCode: functionName + '(...' + JSON.stringify(args) + ')',
      expectedOutput: JSON.stringify(expected),
    })),
  };
}

function buildJavascriptProfile(
  pathSlug: string,
  sectionNumber: number,
  unitNumber: number,
  challengeSlot: number
): CodeChallengeProfile {
  const seed = sectionNumber * 100 + unitNumber * 10 + challengeSlot;

  if (pathSlug === 'frontend-react' && challengeSlot === 1) {
    const components = [
      { nome: 'Painel' + seed, ativo: true, custo: 3 },
      { nome: 'Menu' + seed, ativo: false, custo: 1 },
      { nome: 'Lista' + seed, ativo: true, custo: 2 },
    ];
    const secondComponents = [
      { nome: 'Modal' + seed, ativo: true, custo: 5 },
      { nome: 'Botao' + seed, ativo: true, custo: 1 },
    ];
    return createJavascriptProfile({
      functionName: 'selecionarComponentes',
      titleSuffix: 'Componentes elegíveis',
      instruction:
        'Implemente selecionarComponentes para retornar, em ordem alfabética, os nomes ativos cujo custo não ultrapassa o limite.',
      codeTemplate: [
        'function selecionarComponentes(componentes, limite) {',
        '  // Retorne somente os nomes elegíveis em ordem alfabética.',
        '  ',
        '}',
      ].join('\n'),
      solutionCode: [
        'function selecionarComponentes(componentes, limite) {',
        '  return componentes',
        '    .filter((item) => item.ativo && item.custo <= limite)',
        '    .map((item) => item.nome)',
        '    .sort();',
        '}',
      ].join('\n'),
      cases: [
        [
          [components, 3],
          ['Lista' + seed, 'Painel' + seed],
        ],
        [[secondComponents, 2], ['Botao' + seed]],
      ],
      hints: ['Combine filter, map e sort sem alterar o array recebido.'],
    });
  }

  if (pathSlug === 'frontend-react') {
    const eventName = 'custom-' + seed;
    return createJavascriptProfile({
      functionName: 'resumirEventos',
      titleSuffix: 'Resumo de eventos',
      instruction:
        'Implemente resumirEventos para contar os eventos e produzir uma string ordenada no formato evento:quantidade.',
      codeTemplate: [
        'function resumirEventos(eventos) {',
        '  // Exemplo de retorno: "click:2|submit:1".',
        '  ',
        '}',
      ].join('\n'),
      solutionCode: [
        'function resumirEventos(eventos) {',
        '  const contagem = eventos.reduce((acc, evento) => {',
        '    acc[evento] = (acc[evento] || 0) + 1;',
        '    return acc;',
        '  }, {});',
        '  return Object.keys(contagem)',
        '    .sort()',
        '    .map((evento) => evento + ":" + contagem[evento])',
        '    .join("|");',
        '}',
      ].join('\n'),
      cases: [
        [
          [['click', eventName, 'click', 'submit', eventName]],
          'click:2|' + eventName + ':2|submit:1',
        ],
        [[['focus', 'blur', 'focus']], 'blur:1|focus:2'],
      ],
      hints: ['Conte com reduce e ordene as chaves antes de montar a saída.'],
    });
  }

  if (pathSlug === 'javascript-systems' && challengeSlot === 1) {
    const jobs = [
      { id: 'job-a-' + seed, prioridade: 2, ativo: true },
      { id: 'job-b-' + seed, prioridade: 1, ativo: true },
      { id: 'job-a-' + seed, prioridade: 4, ativo: true },
      { id: 'job-c-' + seed, prioridade: 9, ativo: false },
    ];
    return createJavascriptProfile({
      functionName: 'normalizarFila',
      titleSuffix: 'Fila de execução',
      instruction:
        'Remova jobs inativos, deduplique por id mantendo a maior prioridade e retorne os ids da maior para a menor prioridade.',
      codeTemplate: [
        'function normalizarFila(jobs) {',
        '  // Preserve apenas a melhor versão ativa de cada job.',
        '  ',
        '}',
      ].join('\n'),
      solutionCode: [
        'function normalizarFila(jobs) {',
        '  const melhores = new Map();',
        '  for (const job of jobs) {',
        '    if (!job.ativo) continue;',
        '    const atual = melhores.get(job.id);',
        '    if (!atual || job.prioridade > atual.prioridade) melhores.set(job.id, job);',
        '  }',
        '  return [...melhores.values()]',
        '    .sort((a, b) => b.prioridade - a.prioridade || a.id.localeCompare(b.id))',
        '    .map((job) => job.id);',
        '}',
      ].join('\n'),
      cases: [
        [[jobs], ['job-a-' + seed, 'job-b-' + seed]],
        [[[{ id: 'solo-' + seed, prioridade: 1, ativo: true }]], ['solo-' + seed]],
      ],
      hints: ['Um Map por id ajuda a manter somente o job de maior prioridade.'],
    });
  }

  if (pathSlug === 'javascript-systems') {
    return createJavascriptProfile({
      functionName: 'compactarLogs',
      titleSuffix: 'Compactação de logs',
      instruction:
        'Comprima mensagens consecutivas iguais no formato mensagem*quantidade, preservando a ordem original.',
      codeTemplate: [
        'function compactarLogs(logs) {',
        '  // Exemplo: ["warn", "warn", "ok"] vira ["warn*2", "ok*1"].',
        '  ',
        '}',
      ].join('\n'),
      solutionCode: [
        'function compactarLogs(logs) {',
        '  const grupos = [];',
        '  for (const log of logs) {',
        '    const ultimo = grupos[grupos.length - 1];',
        '    if (ultimo && ultimo.valor === log) ultimo.total += 1;',
        '    else grupos.push({ valor: log, total: 1 });',
        '  }',
        '  return grupos.map((grupo) => grupo.valor + "*" + grupo.total);',
        '}',
      ].join('\n'),
      cases: [
        [
          [['warn-' + seed, 'warn-' + seed, 'ok', 'ok', 'warn-' + seed]],
          ['warn-' + seed + '*2', 'ok*2', 'warn-' + seed + '*1'],
        ],
        [[['ready']], ['ready*1']],
      ],
      hints: ['Compare cada mensagem apenas com o último grupo criado.'],
    });
  }

  if (pathSlug === 'algorithms' && challengeSlot === 1) {
    const values = [seed, 3, seed + 4, 7];
    return createJavascriptProfile({
      functionName: 'encontrarDoisIndices',
      titleSuffix: 'Soma de dois valores',
      instruction:
        'Retorne os índices dos dois valores cuja soma é o alvo. Existe exatamente uma solução e o mesmo índice não pode ser usado duas vezes.',
      codeTemplate: [
        'function encontrarDoisIndices(valores, alvo) {',
        '  // Retorne [indiceA, indiceB].',
        '  ',
        '}',
      ].join('\n'),
      solutionCode: [
        'function encontrarDoisIndices(valores, alvo) {',
        '  const vistos = new Map();',
        '  for (let indice = 0; indice < valores.length; indice += 1) {',
        '    const complemento = alvo - valores[indice];',
        '    if (vistos.has(complemento)) return [vistos.get(complemento), indice];',
        '    vistos.set(valores[indice], indice);',
        '  }',
        '  return [];',
        '}',
      ].join('\n'),
      cases: [
        [
          [values, seed * 2 + 4],
          [0, 2],
        ],
        [
          [[2, 7, 11, 15], 9],
          [0, 1],
        ],
      ],
      hints: ['Guarde cada valor já visitado e procure o complemento em O(n).'],
    });
  }

  if (pathSlug === 'algorithms') {
    const text = 'abc' + seed + 'abc';
    return createJavascriptProfile({
      functionName: 'maiorJanelaUnica',
      titleSuffix: 'Janela sem repetição',
      instruction:
        'Retorne o tamanho da maior substring sem caracteres repetidos usando uma janela deslizante.',
      codeTemplate: [
        'function maiorJanelaUnica(texto) {',
        '  // Retorne apenas o tamanho da maior janela.',
        '  ',
        '}',
      ].join('\n'),
      solutionCode: [
        'function maiorJanelaUnica(texto) {',
        '  const ultimaPosicao = new Map();',
        '  let inicio = 0;',
        '  let maior = 0;',
        '  for (let fim = 0; fim < texto.length; fim += 1) {',
        '    const caractere = texto[fim];',
        '    if (ultimaPosicao.has(caractere)) inicio = Math.max(inicio, ultimaPosicao.get(caractere) + 1);',
        '    ultimaPosicao.set(caractere, fim);',
        '    maior = Math.max(maior, fim - inicio + 1);',
        '  }',
        '  return maior;',
        '}',
      ].join('\n'),
      cases: [
        [[text], new Set(text.split('')).size],
        [['abba'], 2],
      ],
      hints: ['Mova o início da janela quando um caractere se repetir dentro dela.'],
    });
  }

  if (pathSlug === 'backend-data' && challengeSlot === 1) {
    const responses = [
      { status: 200, latencia: seed },
      { status: 503, latencia: 50 },
      { status: 201, latencia: seed + 5 },
    ];
    return createJavascriptProfile({
      functionName: 'resumirRespostas',
      titleSuffix: 'Métricas da API',
      instruction:
        'Considere sucesso apenas status 2xx e retorne quantidade e latência total das respostas bem-sucedidas.',
      codeTemplate: [
        'function resumirRespostas(respostas) {',
        '  // Retorne { quantidade, latenciaTotal }.',
        '  ',
        '}',
      ].join('\n'),
      solutionCode: [
        'function resumirRespostas(respostas) {',
        '  const sucessos = respostas.filter((item) => item.status >= 200 && item.status < 300);',
        '  return {',
        '    quantidade: sucessos.length,',
        '    latenciaTotal: sucessos.reduce((total, item) => total + item.latencia, 0),',
        '  };',
        '}',
      ].join('\n'),
      cases: [
        [[responses], { quantidade: 2, latenciaTotal: seed * 2 + 5 }],
        [[[{ status: 404, latencia: 10 }]], { quantidade: 0, latenciaTotal: 0 }],
      ],
      hints: ['Filtre a faixa 200–299 antes de reduzir as latências.'],
    });
  }

  return createJavascriptProfile({
    functionName: 'encontrarIdsDuplicados',
    titleSuffix: 'Duplicidades de dados',
    instruction:
      'Retorne, sem repetições e em ordem alfabética, os ids que aparecem mais de uma vez.',
    codeTemplate: [
      'function encontrarIdsDuplicados(registros) {',
      '  // Retorne uma lista ordenada de ids duplicados.',
      '  ',
      '}',
    ].join('\n'),
    solutionCode: [
      'function encontrarIdsDuplicados(registros) {',
      '  const contagem = new Map();',
      '  for (const registro of registros) {',
      '    contagem.set(registro.id, (contagem.get(registro.id) || 0) + 1);',
      '  }',
      '  return [...contagem.entries()]',
      '    .filter(([, total]) => total > 1)',
      '    .map(([id]) => id)',
      '    .sort();',
      '}',
    ].join('\n'),
    cases: [
      [
        [[{ id: 'user-' + seed }, { id: 'order-' + seed }, { id: 'user-' + seed }]],
        ['user-' + seed],
      ],
      [[[{ id: 'a' }, { id: 'b' }, { id: 'a' }, { id: 'b' }]], ['a', 'b']],
    ],
    hints: ['Conte por id com Map e filtre apenas totais maiores que um.'],
  });
}

function buildLanguageFallbackProfile(language: string, seed: number): CodeChallengeProfile {
  const values = [seed, seed + 1, seed + 2, seed + 3];
  const expected = values.filter((value) => value % 2 === 0).reduce((sum, value) => sum + value, 0);
  const templates: Record<string, { code: string; solution: string }> = {
    PYTHON: {
      code: [
        'def somar_pares(valores):',
        '    # Retorne a soma apenas dos números pares.',
        '    pass',
        '',
        'print(somar_pares(' + JSON.stringify(values) + '))',
      ].join('\n'),
      solution: [
        'def somar_pares(valores):',
        '    return sum(valor for valor in valores if valor % 2 == 0)',
        '',
        'print(somar_pares(' + JSON.stringify(values) + '))',
      ].join('\n'),
    },
    GO: {
      code: [
        'package main',
        'import "fmt"',
        'func somarPares(valores []int) int {',
        '  // Retorne a soma apenas dos números pares.',
        '  return 0',
        '}',
        'func main() { fmt.Println(somarPares([]int{' + values.join(', ') + '})) }',
      ].join('\n'),
      solution: [
        'package main',
        'import "fmt"',
        'func somarPares(valores []int) int {',
        '  total := 0',
        '  for _, valor := range valores { if valor%2 == 0 { total += valor } }',
        '  return total',
        '}',
        'func main() { fmt.Println(somarPares([]int{' + values.join(', ') + '})) }',
      ].join('\n'),
    },
    RUST: {
      code: [
        'fn somar_pares(valores: &[i32]) -> i32 {',
        '    // Retorne a soma apenas dos números pares.',
        '    0',
        '}',
        'fn main() { println!("{}", somar_pares(&[' + values.join(', ') + '])); }',
      ].join('\n'),
      solution: [
        'fn somar_pares(valores: &[i32]) -> i32 {',
        '    valores.iter().filter(|valor| *valor % 2 == 0).sum()',
        '}',
        'fn main() { println!("{}", somar_pares(&[' + values.join(', ') + '])); }',
      ].join('\n'),
    },
    JAVA: {
      code: [
        'class Main {',
        '  static int somarPares(int[] valores) {',
        '    // Retorne a soma apenas dos números pares.',
        '    return 0;',
        '  }',
        '  public static void main(String[] args) {',
        '    System.out.println(somarPares(new int[]{' + values.join(', ') + '}));',
        '  }',
        '}',
      ].join('\n'),
      solution: [
        'class Main {',
        '  static int somarPares(int[] valores) {',
        '    int total = 0;',
        '    for (int valor : valores) if (valor % 2 == 0) total += valor;',
        '    return total;',
        '  }',
        '  public static void main(String[] args) {',
        '    System.out.println(somarPares(new int[]{' + values.join(', ') + '}));',
        '  }',
        '}',
      ].join('\n'),
    },
  };
  const template = templates[language] ?? templates.PYTHON;
  return {
    titleSuffix: 'Soma dos pares',
    instruction: 'Implemente a função para somar apenas os valores pares da entrada.',
    codeTemplate: template.code,
    solutionCode: template.solution,
    expectedOutput: String(expected),
    hints: ['Filtre os valores divisíveis por dois antes de somar.'],
    testCases: [
      {
        id: 'case-1',
        description: 'Entrada: ' + JSON.stringify(values),
        testCode: '',
        expectedOutput: String(expected),
      },
    ],
  };
}

export function buildCurriculumCodeLesson(
  language: string,
  pathSlug: string,
  sectionNumber: number,
  unitNumber: number,
  challengeSlot: number,
  unit: CurriculumUnit,
  section: CurriculumSection,
  curriculum: CurriculumSummary
): Lesson {
  const langUpper = language.toUpperCase() === 'PY' ? 'PYTHON' : language.toUpperCase();
  const lessonId = buildTrailCodeLessonId(
    language,
    pathSlug,
    sectionNumber,
    unitNumber,
    challengeSlot
  );
  const seed = sectionNumber * 100 + unitNumber * 10 + challengeSlot;
  const profile = ['JS', 'TS'].includes(langUpper)
    ? buildJavascriptProfile(pathSlug, sectionNumber, unitNumber, challengeSlot)
    : buildLanguageFallbackProfile(langUpper, seed);
  const step: LessonStep = {
    id: lessonId + '-s1',
    type: 'code_editor',
    title: 'Desafio de Código: ' + profile.titleSuffix,
    instruction:
      profile.instruction +
      ' Este exercício pertence a ' +
      unit.title +
      ', na seção ' +
      section.title +
      '.',
    codeTemplate: profile.codeTemplate,
    solutionCode: profile.solutionCode,
    checkCode: profile.checkCode,
    expectedOutput: profile.expectedOutput,
    hints: profile.hints,
    testCases: profile.testCases,
    xp: 35,
  };

  return {
    id: lessonId,
    title: 'Código: ' + unit.title + ' · ' + challengeSlot,
    description:
      'Resolva um problema de programação exclusivo de ' +
      curriculum.title +
      ' aplicando ' +
      unit.description.toLocaleLowerCase('pt-BR'),
    language: langUpper,
    unitNumber: sectionNumber,
    levelNumber: 1000 + (sectionNumber - 1) * 8 + (unitNumber - 1) * 2 + challengeSlot,
    xpReward: step.xp,
    difficulty: sectionNumber > 6 ? 'avancado' : sectionNumber > 3 ? 'intermediario' : 'iniciante',
    estimatedTime: '12 min',
    steps: [step],
  };
}

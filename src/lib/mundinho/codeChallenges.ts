import type { BattleLanguage, CodeAction, CodeRun, CodeTile, PublicQuestion } from './types';

type Scenario = {
  slug: string;
  title: string;
  prompt: string;
  tiles: CodeTile[];
  start?: number;
};
const empty = (): CodeTile => ({ label: 'Caminho', action: null });
const tile = (label: string, action: CodeAction): CodeTile => ({ label, action });

// Each board describes a distinct route and a concrete world action. The evaluator,
// preview and public representation are all derived from this same definition.
const SCENARIOS: Scenario[] = [
  {
    slug: 'cristais',
    title: 'Clareira dos cristais',
    prompt: 'Colete os três cristais da clareira. Ande uma casa e colete em cada uma delas.',
    tiles: [
      empty(),
      tile('Cristal', 'coletar'),
      tile('Cristal', 'coletar'),
      tile('Cristal', 'coletar'),
    ],
  },
  {
    slug: 'jardim',
    title: 'Jardim sedento',
    prompt: 'Regue as três flores do jardim. Visite cada flor e use o comando de regar.',
    tiles: [empty(), tile('Flor', 'regar'), tile('Flor', 'regar'), tile('Flor', 'regar')],
  },
  {
    slug: 'farol',
    title: 'Luzes do caminho',
    prompt:
      'Acenda as duas lanternas para iluminar a trilha. A segunda está depois de uma casa vazia.',
    tiles: [empty(), tile('Lanterna', 'acender'), empty(), tile('Lanterna', 'acender')],
  },
  {
    slug: 'ponte',
    title: 'Ponte de mecanismos',
    prompt: 'Ative as duas alavancas da ponte, uma em cada extremidade. Você começa no meio.',
    start: 2,
    tiles: [tile('Alavanca', 'ativar'), empty(), empty(), empty(), tile('Alavanca', 'ativar')],
  },
  {
    slug: 'rochas',
    title: 'Rochas na passagem',
    prompt: 'Quebre as três rochas que precisam ser removidas da passagem.',
    tiles: [
      empty(),
      tile('Rocha', 'quebrar'),
      tile('Rocha', 'quebrar'),
      empty(),
      tile('Rocha', 'quebrar'),
    ],
  },
  {
    slug: 'bau',
    title: 'Baús da trilha',
    prompt: 'Abra os dois baús escondidos ao longo do caminho.',
    tiles: [empty(), empty(), tile('Baú', 'abrir'), empty(), tile('Baú', 'abrir')],
  },
  {
    slug: 'horta',
    title: 'Sementes da horta',
    prompt: 'Plante uma semente em cada um dos três canteiros, deixando a casa vazia para trás.',
    tiles: [
      empty(),
      tile('Canteiro', 'plantar'),
      empty(),
      tile('Canteiro', 'plantar'),
      tile('Canteiro', 'plantar'),
    ],
  },
  {
    slug: 'resgate',
    title: 'Resgate dos bichinhos',
    prompt:
      'Cure os dois bichinhos feridos. Um está à esquerda e outro à direita de onde você começa.',
    start: 2,
    tiles: [tile('Bichinho', 'curar'), empty(), empty(), tile('Bichinho', 'curar')],
  },
  {
    slug: 'reparos',
    title: 'Oficina na estrada',
    prompt: 'Conserte as três máquinas que estão espalhadas pela estrada.',
    tiles: [
      empty(),
      tile('Máquina', 'consertar'),
      empty(),
      tile('Máquina', 'consertar'),
      empty(),
      tile('Máquina', 'consertar'),
    ],
  },
  {
    slug: 'gaiolas',
    title: 'Voo livre',
    prompt: 'Liberte os pássaros das duas gaiolas. A primeira fica à sua esquerda.',
    start: 3,
    tiles: [tile('Gaiola', 'libertar'), empty(), empty(), empty(), tile('Gaiola', 'libertar')],
  },
  {
    slug: 'pomar',
    title: 'Colheita no pomar',
    prompt: 'Colete os frutos maduros; passe pelas casas vazias sem tentar coletar nelas.',
    tiles: [
      empty(),
      tile('Fruto', 'coletar'),
      empty(),
      empty(),
      tile('Fruto', 'coletar'),
      tile('Fruto', 'coletar'),
    ],
  },
  {
    slug: 'estufa',
    title: 'Estufa de mudas',
    prompt: 'Plante nos dois canteiros e regue as duas mudas nas casas marcadas.',
    tiles: [
      empty(),
      tile('Canteiro', 'plantar'),
      tile('Muda', 'regar'),
      tile('Canteiro', 'plantar'),
      tile('Muda', 'regar'),
    ],
  },
  {
    slug: 'ruinas',
    title: 'Ruínas antigas',
    prompt: 'Quebre as rochas e ative o altar no fim da passagem.',
    tiles: [
      empty(),
      tile('Rocha', 'quebrar'),
      empty(),
      tile('Rocha', 'quebrar'),
      tile('Altar', 'ativar'),
    ],
  },
  {
    slug: 'acampamento',
    title: 'Acampamento seguro',
    prompt: 'Acenda as lanternas e abra o baú de suprimentos.',
    tiles: [
      empty(),
      tile('Lanterna', 'acender'),
      tile('Baú', 'abrir'),
      empty(),
      tile('Lanterna', 'acender'),
    ],
  },
  {
    slug: 'biblioteca',
    title: 'Biblioteca esquecida',
    prompt: 'Abra os baús de livros e conserte a máquina entre eles.',
    tiles: [empty(), tile('Baú', 'abrir'), tile('Máquina', 'consertar'), tile('Baú', 'abrir')],
  },
  {
    slug: 'bosque',
    title: 'Bosque dos guardiões',
    prompt: 'Cure o bichinho e liberte os pássaros presos nas gaiolas.',
    tiles: [
      empty(),
      tile('Bichinho', 'curar'),
      tile('Gaiola', 'libertar'),
      empty(),
      tile('Gaiola', 'libertar'),
    ],
  },
  {
    slug: 'mina',
    title: 'Mina de cristais',
    prompt: 'Quebre as rochas e colete os cristais encontrados pelo caminho.',
    tiles: [
      empty(),
      tile('Rocha', 'quebrar'),
      tile('Cristal', 'coletar'),
      tile('Rocha', 'quebrar'),
      tile('Cristal', 'coletar'),
    ],
  },
  {
    slug: 'santuario',
    title: 'Santuário das luzes',
    prompt: 'Acenda as lanternas nas duas pontas e ative o altar. Você começa no centro.',
    start: 2,
    tiles: [
      tile('Lanterna', 'acender'),
      tile('Altar', 'ativar'),
      empty(),
      empty(),
      tile('Lanterna', 'acender'),
    ],
  },
  {
    slug: 'viveiro',
    title: 'Viveiro da floresta',
    prompt: 'Regue as flores e cure o bichinho que está entre elas.',
    tiles: [
      empty(),
      tile('Flor', 'regar'),
      tile('Bichinho', 'curar'),
      empty(),
      tile('Flor', 'regar'),
    ],
  },
  {
    slug: 'expedicao',
    title: 'Expedição de resgate',
    prompt: 'Conserte a máquina, abra o baú e liberte o pássaro antes de encerrar a expedição.',
    tiles: [
      empty(),
      tile('Máquina', 'consertar'),
      empty(),
      tile('Baú', 'abrir'),
      empty(),
      tile('Gaiola', 'libertar'),
    ],
  },
  {
    slug: 'trilha-invertida',
    title: 'Trilha de volta',
    prompt: 'Você começou no fim da trilha. Volte para coletar os três cristais.',
    start: 4,
    tiles: [
      tile('Cristal', 'coletar'),
      tile('Cristal', 'coletar'),
      empty(),
      tile('Cristal', 'coletar'),
      empty(),
    ],
  },
  {
    slug: 'observatorio',
    title: 'Observatório',
    prompt: 'Conserte o mecanismo, ative o altar e acenda a lanterna do observatório.',
    tiles: [
      empty(),
      tile('Máquina', 'consertar'),
      empty(),
      tile('Altar', 'ativar'),
      tile('Lanterna', 'acender'),
    ],
  },
];

const ACTIONS: CodeAction[] = [
  'coletar',
  'regar',
  'acender',
  'ativar',
  'quebrar',
  'abrir',
  'plantar',
  'curar',
  'consertar',
  'libertar',
];
const METHODS = ['andar_direita', 'andar_esquerda', ...ACTIONS] as const;
const tokens: Record<(typeof METHODS)[number], string> = {
  andar_direita: 'andar',
  andar_esquerda: 'voltar',
  coletar: 'coletar',
  regar: 'regar',
  acender: 'acender',
  ativar: 'ativar',
  quebrar: 'quebrar',
  abrir: 'abrir',
  plantar: 'plantar',
  curar: 'curar',
  consertar: 'consertar',
  libertar: 'libertar',
};

export function challengeExecutionLanguage(language: BattleLanguage): BattleLanguage {
  return language === 'HTML' || language === 'CSS' ? 'JS' : language;
}

function starter(language: BattleLanguage, firstMove: string): string {
  const lang = challengeExecutionLanguage(language);
  const move = `mundo.${firstMove}()`;
  const comment = 'Continue a sequência de ações';
  if (lang === 'PYTHON') return `${move}\n# ${comment}\n`;
  if (lang === 'GO') return `${move}\n// ${comment}\n`;
  return `${move};\n// ${comment}\n`;
}

function publicScenario(language: BattleLanguage, scenario: Scenario): PublicQuestion {
  const start = scenario.start ?? 0;
  const target = scenario.tiles.filter((entry) => entry.action).length;
  const firstTarget = scenario.tiles.findIndex((entry) => entry.action);
  const used = [
    ...new Set(scenario.tiles.flatMap((entry) => (entry.action ? [entry.action] : []))),
  ];
  return {
    id: `code-${scenario.slug}-${language}`,
    concept: 'Programação e ações',
    difficulty: target > 3 ? 'Médio' : 'Fácil',
    options: [],
    prompt: scenario.prompt,
    code: {
      title: scenario.title,
      starter: starter(language, firstTarget < start ? 'andar_esquerda' : 'andar_direita'),
      commands: [
        'mundo.andar_direita()',
        'mundo.andar_esquerda()',
        ...used.map((action) => `mundo.${action}()`),
      ],
      target,
      tiles: scenario.tiles,
      start,
      language: challengeExecutionLanguage(language),
    },
  };
}

/** New challenges are stable by id, so an active battle remains resumable. */
export function codeChallenges(language: BattleLanguage): PublicQuestion[] {
  return SCENARIOS.map((scenario) => publicScenario(language, scenario));
}

/** The original crystal id is retained for battles already in progress. */
export function codeChallenge(language: BattleLanguage, id?: string): PublicQuestion | null {
  const legacyId = `code-crystals-${language}`;
  if (!id || id === legacyId) {
    const legacy = publicScenario(language, SCENARIOS[0]);
    const starters: Partial<Record<BattleLanguage, string>> = {
      PYTHON: 'for passo in range(3):\n    mundo.andar_direita()\n    # Colete o cristal aqui\n',
      JS: 'for (let passo = 0; passo < 3; passo++) {\n  mundo.andar_direita();\n  // Colete o cristal aqui\n}\n',
      TS: 'for (let passo: number = 0; passo < 3; passo++) {\n  mundo.andar_direita();\n  // Colete o cristal aqui\n}\n',
      RUST: 'for _passo in 0..3 {\n    mundo.andar_direita();\n    // Colete o cristal aqui\n}\n',
      GO: 'for passo := 0; passo < 3; passo++ {\n    mundo.andar_direita()\n    // Colete o cristal aqui\n}\n',
      JAVA: 'for (int passo = 0; passo < 3; passo++) {\n    mundo.andar_direita();\n    // Colete o cristal aqui\n}\n',
    };
    if (!starters[language]) return null;
    return {
      ...legacy,
      id: legacyId,
      code: {
        ...legacy.code!,
        starter: starters[language]!,
        commands: ['mundo.andar_direita()', 'mundo.coletar()'],
      },
    };
  }
  return codeChallenges(language).find((question) => question.id === id) ?? null;
}

/** User code only runs through the existing isolated execution service. */
export function challengeProgram(language: BattleLanguage, source: string): string {
  const lang = challengeExecutionLanguage(language);
  switch (lang) {
    case 'JS':
    case 'TS':
      return `const mundo = Object.freeze({${METHODS.map((method) => `${method}(){console.log("${tokens[method]}")}`).join(',')}});\n${source}`;
    case 'PYTHON':
      return `class Mundo:\n${METHODS.map((method) => `    def ${method}(self): print("${tokens[method]}")`).join('\n')}\nmundo = Mundo()\n${source}`;
    case 'RUST':
      return `struct Mundo; impl Mundo { ${METHODS.map((method) => `fn ${method}(&self){println!("${tokens[method]}");}`).join(' ')} }\nfn main(){ let mundo = Mundo;\n${source}\n}`;
    case 'GO':
      return `package main\nimport "fmt"\ntype Mundo struct{}\n${METHODS.map((method) => `func (m Mundo) ${method}(){fmt.Println("${tokens[method]}")}`).join('\n')}\nfunc main(){mundo := Mundo{}\n${source}\n}`;
    case 'JAVA':
      return `public class Main { static class Mundo { ${METHODS.map((method) => `void ${method}(){System.out.println("${tokens[method]}");}`).join(' ')} } public static void main(String[] args){Mundo mundo = new Mundo();\n${source}\n}}`;
    default:
      throw new Error('Esta linguagem não possui desafio de movimento.');
  }
}

type Replay = { position: number; completed: number[]; error?: string };
/** Simulates only the trace; it is also shared by the animated board. */
export function replayTrace(question: PublicQuestion, trace: string[]): Replay {
  const board = question.code!;
  let position = board.start;
  const completed: number[] = [];
  for (const command of trace) {
    if (command === 'andar' || command === 'voltar') {
      const next = position + (command === 'andar' ? 1 : -1);
      if (next < 0 || next >= board.tiles.length)
        return {
          position,
          completed,
          error: 'Você chegou ao limite do caminho. Revise seus movimentos.',
        };
      position = next;
    } else {
      const current = board.tiles[position];
      if (!current.action || current.action !== command || completed.includes(position))
        return {
          position,
          completed,
          error: `Não é possível usar ${command} nesta casa. Confira o objeto e a ação.`,
        };
      completed.push(position);
    }
  }
  return { position, completed };
}

export function evaluateTrace(output: string, question = codeChallenge('JS')!): CodeRun {
  const trace = output
    .trim()
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const allowed = new Set(['andar', 'voltar', ...ACTIONS]);
  if (trace.length > 40 || trace.some((command) => !allowed.has(command as CodeAction)))
    return {
      passed: false,
      trace: [],
      error: 'Use somente os comandos do mundo. Limite de 40 ações por execução.',
    };
  const replay = replayTrace(question, trace);
  if (replay.error) return { passed: false, trace, error: replay.error };
  const target = question.code!.target;
  return {
    passed: replay.completed.length === target,
    trace,
    ...(replay.completed.length < target
      ? {
          error: `Você realizou ${replay.completed.length} de ${target} ações. Continue o caminho e confira os comandos.`,
        }
      : {}),
  };
}

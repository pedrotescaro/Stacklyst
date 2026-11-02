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

function starter(
  language: BattleLanguage,
  firstMove: string,
  level = 1,
  action: CodeAction = 'coletar'
): string {
  const lang = challengeExecutionLanguage(language);
  const move = `mundo.${firstMove}()`;
  if (level >= 2) {
    const condition = `mundo.precisa_${action}()`;
    const body =
      lang === 'PYTHON'
        ? `if ${condition}:\n    mundo.${action}()\nelse:\n    ${move}\n`
        : lang === 'GO' || lang === 'RUST'
          ? `if ${condition} {\n    mundo.${action}()${lang === 'RUST' ? ';' : ''}\n} else {\n    ${move}${lang === 'RUST' ? ';' : ''}\n}\n`
          : `if (${condition}) {\n  mundo.${action}();\n} else {\n  ${move};\n}\n`;
    const comment =
      lang === 'PYTHON'
        ? '# Adapte as ações para concluir o caminho.\n'
        : '// Adapte as ações para concluir o caminho.\n';
    if (level === 2) return body + comment;
    const canMove = `mundo.pode_${firstMove}()`;
    const indented = body
      .trimEnd()
      .split('\n')
      .map((line) => `    ${line}`)
      .join('\n');
    if (lang === 'PYTHON') return `while ${canMove}:\n${indented}\n${comment}`;
    if (lang === 'GO') return `for ${canMove} {\n${indented}\n}\n${comment}`;
    if (lang === 'RUST') return `while ${canMove} {\n${indented}\n}\n${comment}`;
    return `while (${canMove}) {\n${indented}\n}\n${comment}`;
  }
  const comment = 'Continue a sequência de ações';
  if (lang === 'PYTHON') return `${move}\n# ${comment}\n`;
  if (lang === 'GO') return `${move}\n// ${comment}\n`;
  return `${move};\n// ${comment}\n`;
}

function learningLevel(level: number) {
  return Number.isFinite(level) ? Math.max(1, Math.min(3, Math.floor(level))) : 1;
}

function publicScenario(
  language: BattleLanguage,
  scenario: Scenario,
  requestedLevel = 1
): PublicQuestion {
  const level = learningLevel(requestedLevel);
  const start = scenario.start ?? 0;
  const target = scenario.tiles.filter((entry) => entry.action).length;
  const firstTarget = scenario.tiles.findIndex((entry) => entry.action);
  const used = [
    ...new Set(scenario.tiles.flatMap((entry) => (entry.action ? [entry.action] : []))),
  ];
  return {
    id: `code-${level > 1 ? `l${level}-` : ''}${scenario.slug}-${language}`,
    concept:
      level >= 3
        ? 'Condições e repetição'
        : level === 2
          ? 'Condições e ações'
          : 'Programação e ações',
    difficulty: level >= 3 ? 'Difícil' : level === 2 || target > 3 ? 'Médio' : 'Fácil',
    options: [],
    prompt: scenario.prompt,
    code: {
      title: scenario.title,
      starter: starter(
        language,
        firstTarget < start ? 'andar_esquerda' : 'andar_direita',
        level,
        used[0]
      ),
      commands: [
        'mundo.andar_direita()',
        'mundo.andar_esquerda()',
        ...used.map((action) => `mundo.${action}()`),
        ...(level >= 2
          ? [
              'mundo.tem_objeto()',
              ...used.map((action) => `mundo.precisa_${action}()`),
              'mundo.pode_andar_direita()',
              'mundo.pode_andar_esquerda()',
            ]
          : []),
      ],
      target,
      tiles: scenario.tiles,
      start,
      language: challengeExecutionLanguage(language),
      level,
      requiredStructures: level >= 3 ? ['conditional', 'loop'] : level === 2 ? ['conditional'] : [],
      hint:
        level >= 3
          ? `Use if/else com um sensor e ${challengeExecutionLanguage(language) === 'GO' ? 'for' : challengeExecutionLanguage(language) === 'RUST' ? 'for, while ou loop' : 'for ou while'}. O mesmo laço deve executar ações em pelo menos duas iterações.`
          : level === 2
            ? 'Use if e else com um sensor do mundo para decidir quando agir e quando seguir o caminho.'
            : 'Cada comando de movimento avança uma casa. Visite cada objeto e execute a ação indicada.',
    },
  };
}

/** New challenges are stable by id, so an active battle remains resumable. */
export function codeChallenges(language: BattleLanguage, level = 1): PublicQuestion[] {
  return SCENARIOS.map((scenario) => publicScenario(language, scenario, level));
}

/** The original crystal id is retained for battles already in progress. */
export function codeChallenge(
  language: BattleLanguage,
  id?: string,
  level = 1
): PublicQuestion | null {
  if (!id && learningLevel(level) > 1) return codeChallenges(language, level)[0];
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
  const savedLevel = id.match(/^code-l([23])-/)?.[1];
  return (
    codeChallenges(language, savedLevel ? Number(savedLevel) : 1).find(
      (question) => question.id === id
    ) ?? null
  );
}

/** User code only runs through the existing isolated execution service. */
export function challengeProgram(
  language: BattleLanguage,
  source: string,
  question?: PublicQuestion
): string {
  const lang = challengeExecutionLanguage(language);
  const board = question?.code ?? codeChallenges(language)[0].code!;
  const start = board.start;
  const actions = board.tiles.map((entry) => entry.action ?? '');
  const conditionMarker = '__mundinho_condicional__';
  const loopMarker = '__mundinho_laco__';
  const sensorMethods = (format: (name: string, action: string) => string) =>
    ACTIONS.map((action) => format(`precisa_${action}`, action)).join('\n');
  switch (lang) {
    case 'JS':
    case 'TS':
      return `let __pos = ${start}; const __tiles = ${JSON.stringify(actions)}; const __done = new Set();
const __acao = () => __pos >= 0 && __pos < __tiles.length && !__done.has(__pos) ? __tiles[__pos] : '';
const mundo = Object.freeze({
${METHODS.map((method) => `${method}(){console.log("${tokens[method]}");${method === 'andar_direita' ? '__pos++;' : method === 'andar_esquerda' ? '__pos--;' : `if(__acao() === "${method}") __done.add(__pos);`}}`).join(',\n')},
tem_objeto(){return __acao() !== '';},
pode_andar_direita(){return __pos < __tiles.length - 1;},
pode_andar_esquerda(){return __pos > 0;},
${ACTIONS.map((action) => `precisa_${action}(){return __acao() === "${action}";}`).join(',\n')},
_condicao(value){console.log("${conditionMarker}");return value;},
_laco(id){console.log("${loopMarker}:" + id);}
});\n${source}`;
    case 'PYTHON':
      return `class Mundo:
    def __init__(self):
        self._pos = ${start}
        self._tiles = ${JSON.stringify(actions)}
        self._done = set()
    def _acao(self):
        return self._tiles[self._pos] if 0 <= self._pos < len(self._tiles) and self._pos not in self._done else ''
${METHODS.map((method) => `    def ${method}(self):\n        print("${tokens[method]}")\n        ${method === 'andar_direita' ? 'self._pos += 1' : method === 'andar_esquerda' ? 'self._pos -= 1' : `if self._acao() == "${method}": self._done.add(self._pos)`}`).join('\n')}
    def tem_objeto(self): return self._acao() != ''
    def pode_andar_direita(self): return self._pos < len(self._tiles) - 1
    def pode_andar_esquerda(self): return self._pos > 0
${sensorMethods((name, action) => `    def ${name}(self): return self._acao() == "${action}"`)}
    def _condicao(self, value):
        print("${conditionMarker}")
        return value
    def _laco(self, id): print("${loopMarker}:" + str(id))
mundo = Mundo()\n${source}`;
    case 'RUST':
      return `const MUNDO_TILES: [&str; ${actions.length}] = ${JSON.stringify(actions)};
struct Mundo { pos: std::cell::Cell<i32>, done: std::cell::RefCell<Vec<usize>> }
impl Mundo {
fn acao(&self) -> &'static str { let p = self.pos.get(); if p >= 0 && (p as usize) < MUNDO_TILES.len() && !self.done.borrow().contains(&(p as usize)) { MUNDO_TILES[p as usize] } else { "" } }
${METHODS.map((method) => `fn ${method}(&self){println!("${tokens[method]}");${method === 'andar_direita' ? 'self.pos.set(self.pos.get()+1);' : method === 'andar_esquerda' ? 'self.pos.set(self.pos.get()-1);' : `if self.acao() == "${method}" { self.done.borrow_mut().push(self.pos.get() as usize); }`}}`).join('\n')}
fn tem_objeto(&self) -> bool { self.acao() != "" }
fn pode_andar_direita(&self) -> bool { self.pos.get() < (MUNDO_TILES.len() as i32) - 1 }
fn pode_andar_esquerda(&self) -> bool { self.pos.get() > 0 }
${sensorMethods((name, action) => `fn ${name}(&self) -> bool { self.acao() == "${action}" }`)}
fn _condicao(&self, value: bool) -> bool { println!("${conditionMarker}"); value }
fn _laco(&self, id: usize) { println!("${loopMarker}:{}", id); }
}
fn main(){ let mundo = Mundo { pos: std::cell::Cell::new(${start}), done: std::cell::RefCell::new(Vec::new()) };\n${source}\n}`;
    case 'GO':
      return `package main
import "fmt"
var mundoTiles = []string{${actions.map((action) => JSON.stringify(action)).join(',')}}
type Mundo struct{pos int; done map[int]bool}
func (m *Mundo) acao() string { if m.pos >= 0 && m.pos < len(mundoTiles) && !m.done[m.pos] { return mundoTiles[m.pos] }; return "" }
${METHODS.map((method) => `func (m *Mundo) ${method}(){fmt.Println("${tokens[method]}");${method === 'andar_direita' ? 'm.pos++' : method === 'andar_esquerda' ? 'm.pos--' : `if m.acao() == "${method}" { m.done[m.pos] = true }`}}`).join('\n')}
func (m *Mundo) tem_objeto() bool { return m.acao() != "" }
func (m *Mundo) pode_andar_direita() bool { return m.pos < len(mundoTiles)-1 }
func (m *Mundo) pode_andar_esquerda() bool { return m.pos > 0 }
${sensorMethods((name, action) => `func (m *Mundo) ${name}() bool { return m.acao() == "${action}" }`)}
func (m *Mundo) _condicao(value bool) bool { fmt.Println("${conditionMarker}"); return value }
func (m *Mundo) _laco(id int){ fmt.Printf("${loopMarker}:%d\\n", id) }
func main(){mundo := &Mundo{pos:${start},done:map[int]bool{}}\n${source}\n}`;
    case 'JAVA':
      return `public class Main { static class Mundo {
int pos = ${start}; String[] tiles = new String[]{${actions.map((action) => JSON.stringify(action)).join(',')}}; boolean[] done = new boolean[${actions.length}];
String acao(){ return pos >= 0 && pos < tiles.length && !done[pos] ? tiles[pos] : ""; }
${METHODS.map((method) => `void ${method}(){System.out.println("${tokens[method]}");${method === 'andar_direita' ? 'pos++;' : method === 'andar_esquerda' ? 'pos--;' : `if(acao().equals("${method}")) done[pos] = true;`}}`).join('\n')}
boolean tem_objeto(){ return !acao().isEmpty(); }
boolean pode_andar_direita(){ return pos < tiles.length-1; }
boolean pode_andar_esquerda(){ return pos > 0; }
${sensorMethods((name, action) => `boolean ${name}(){ return acao().equals("${action}"); }`)}
boolean _condicao(boolean value){ System.out.println("${conditionMarker}"); return value; }
void _laco(int id){ System.out.println("${loopMarker}:" + id); }
} public static void main(String[] args){Mundo mundo = new Mundo();\n${source}\n}}`;
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
  const lines = output
    .trim()
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const allowed = new Set(['andar', 'voltar', ...ACTIONS]);
  const conditionMarker = '__mundinho_condicional__';
  const isLoopMarker = (line: string) => /^__mundinho_laco__:\d+$/.test(line);
  const trace = lines.filter((line) => line !== conditionMarker && !isLoopMarker(line));
  if (
    lines.length > 240 ||
    trace.length > 40 ||
    trace.some((command) => !allowed.has(command as CodeAction))
  )
    return {
      passed: false,
      trace: [],
      error: 'Use somente os comandos do mundo. Limite de 40 ações por execução.',
    };
  const replay = replayTrace(question, trace);
  if (replay.error) return { passed: false, trace, error: replay.error };
  const required = question.code!.requiredStructures ?? [];
  if (required.includes('conditional') && !lines.includes(conditionMarker))
    return {
      passed: false,
      trace,
      error:
        'Use if e else com um sensor do mundo. A condição precisa ser executada para decidir suas ações.',
    };
  if (required.includes('loop')) {
    let activeLoop: string | null = null;
    let iterationActions = 0;
    const iterationsByLoop = new Map<string, number>();
    const finishIteration = () => {
      if (activeLoop && iterationActions > 0)
        iterationsByLoop.set(activeLoop, (iterationsByLoop.get(activeLoop) ?? 0) + 1);
    };
    for (const line of lines) {
      if (isLoopMarker(line)) {
        finishIteration();
        activeLoop = line;
        iterationActions = 0;
      } else if (allowed.has(line as CodeAction) && activeLoop) {
        iterationActions++;
      }
    }
    finishIteration();
    const iterationsWithActions = Math.max(0, ...iterationsByLoop.values());
    if (iterationsWithActions < 2)
      return {
        passed: false,
        trace,
        error: 'Use um laço para executar ações do mundo em pelo menos duas iterações.',
      };
  }
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

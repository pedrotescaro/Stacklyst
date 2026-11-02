import { describe, expect, it } from 'vitest';
import { instrumentChallengeSource } from '../codeChallengeStructures';
import type { BattleLanguage, PublicQuestion } from '../types';

function question(
  requiredStructures: ('conditional' | 'loop')[] = ['conditional', 'loop']
): PublicQuestion {
  return {
    id: 'structure-test',
    concept: 'Controle de fluxo',
    difficulty: 'Médio',
    options: [],
    prompt: '',
    code: {
      starter: '',
      commands: [],
      target: 1,
      title: 'Teste',
      tiles: [{ label: 'Cristal', action: 'coletar' }],
      start: 0,
      language: 'JS',
      requiredStructures,
    },
  };
}

const solutions: Partial<Record<BattleLanguage, string>> = {
  JS: 'for (let i=0;i<4;i++) { if (mundo.tem_objeto()) { mundo.coletar(); } else { mundo.andar_direita(); } }',
  TS: 'for (let i: number=0;i<4;i++) { if (mundo.tem_objeto()) { mundo.coletar(); } else { mundo.andar_direita(); } }',
  PYTHON:
    'for passo in range(4):\n    if mundo.tem_objeto():\n        mundo.coletar()\n    else:\n        mundo.andar_direita()\n',
  RUST: 'for _ in 0..4 { if mundo.tem_objeto() { mundo.coletar(); } else { mundo.andar_direita(); } }',
  GO: 'for i := 0; i < 4; i++ { if mundo.tem_objeto() { mundo.coletar() } else { mundo.andar_direita() } }',
  JAVA: 'for (int i=0;i<4;i++) { if (mundo.tem_objeto()) { mundo.coletar(); } else { mundo.andar_direita(); } }',
};

describe('server control-flow instrumentation', () => {
  it.each(Object.entries(solutions))(
    'instruments real conditions and loop bodies in %s',
    (language, source) => {
      const result = instrumentChallengeSource(language as BattleLanguage, source, question());
      expect(result.error).toBeUndefined();
      expect(result.source).toContain('mundo._condicao(');
      expect(result.source).toMatch(/mundo\._laco\(\d+\)/);
    }
  );

  it.each(['HTML', 'CSS'] as const)('uses JavaScript syntax for %s courses', (language) => {
    expect(instrumentChallengeSource(language, solutions.JS!, question()).error).toBeUndefined();
  });

  it('leaves legacy and level-one snippets unchanged', () => {
    const source = 'mundo.coletar();';
    expect(instrumentChallengeSource('JS', source, question([]))).toEqual({ source });
    const legacy = question();
    delete legacy.code!.requiredStructures;
    expect(instrumentChallengeSource('JS', source, legacy)).toEqual({ source });
  });

  it.each([
    [
      'JS',
      'const text="if (mundo.tem_objeto()) { mundo.coletar(); } else {} for(;;){}";\n// if else for mundo.tem_objeto()\nmundo.coletar();',
    ],
    [
      'TS',
      'const text: string="if else while mundo.tem_objeto()";\n/* if else for */\nmundo.coletar();',
    ],
    [
      'PYTHON',
      'text = """if mundo.tem_objeto():\n    mundo.coletar()\nelse:\n    mundo.coletar()\nfor x in y:"""\n# if else while\nmundo.coletar()',
    ],
    [
      'RUST',
      'let text = r###"if mundo.tem_objeto() { mundo.coletar(); } else {} loop {}"###; /* if else for */ mundo.coletar();',
    ],
    [
      'GO',
      'text := `if mundo.tem_objeto() { mundo.coletar() } else {} for { mundo.coletar() }`; _ = text;\n// if else for\nmundo.coletar()',
    ],
    ['JAVA', 'String text="if else for mundo.tem_objeto()"; /* if else while */ mundo.coletar();'],
  ] as [BattleLanguage, string][])(
    'ignores keywords and calls inside %s comments and strings',
    (language, source) => {
      expect(instrumentChallengeSource(language, source, question()).error).toContain('if e else');
    }
  );

  it('does not treat a Python for-else as an if-else', () => {
    const source = 'for passo in range(4):\n    mundo.coletar()\nelse:\n    mundo.andar_direita()';
    expect(instrumentChallengeSource('PYTHON', source, question()).error).toContain('if e else');
  });

  it('requires a sensor in the condition and a real world action in its branches', () => {
    for (const source of [
      'if (true) { mundo.coletar(); } else { mundo.andar_direita(); }',
      'if (mundo.tem_objeto()) { const text="mundo.coletar()"; } else {} mundo.coletar();',
      'if (mundo.tem_objeto()) { mundo.coletar(); }',
    ])
      expect(instrumentChallengeSource('JS', source, question(['conditional'])).error).toContain(
        'if e else'
      );
  });

  it('requires a final else when an else-if chain is used', () => {
    const source =
      'if (mundo.tem_objeto()) mundo.coletar(); else if (false) mundo.andar_direita();';
    expect(instrumentChallengeSource('JS', source, question(['conditional'])).error).toContain(
      'if e else'
    );
    expect(
      instrumentChallengeSource(
        'JS',
        source + ' else mundo.andar_direita();',
        question(['conditional'])
      ).error
    ).toBeUndefined();
  });

  it('requires a world action inside the loop body', () => {
    const source =
      'for (let i=0;i<3;i++) { console.log("mundo.coletar()"); } if (mundo.tem_objeto()) mundo.coletar(); else mundo.andar_direita();';
    expect(instrumentChallengeSource('JS', source, question()).error).toContain('laço');
  });

  it.each(['JS', 'JAVA'] as const)(
    'wraps single-statement %s loops without losing the action',
    (language) => {
      const source = 'while (mundo.tem_objeto()) mundo.coletar();';
      const result = instrumentChallengeSource(language, source, question(['loop']));
      expect(result.error).toBeUndefined();
      expect(result.source).toMatch(/\{mundo\._laco\(\d+\);mundo\.coletar\(\);\}/);
    }
  );

  it('supports Python inline suites and preserves indentation in multiline bodies', () => {
    const inline = instrumentChallengeSource(
      'PYTHON',
      'for i in range(3): mundo.coletar()',
      question(['loop'])
    );
    expect(inline.source).toMatch(/for i in range\(3\): mundo\._laco\(\d+\); mundo\.coletar\(\)/);
    const multiline = instrumentChallengeSource('PYTHON', solutions.PYTHON!, question());
    expect(multiline.source).toMatch(
      /    mundo\._laco\(\d+\)\n    if mundo\._condicao\(mundo\.tem_objeto\(\)\):/
    );
  });

  it.each(['while mundo.tem_objeto() { mundo.coletar(); }', 'loop { mundo.coletar(); break; }'])(
    'supports idiomatic Rust loops: %s',
    (source) => {
      expect(instrumentChallengeSource('RUST', source, question(['loop'])).error).toBeUndefined();
    }
  );

  it('supports Go range literals and initializer conditions without counting literal words', () => {
    const source =
      'for _, i := range []int{1,2} { _ = i; if presente := mundo.tem_objeto(); presente { mundo.coletar() } else { mundo.andar_direita() } }';
    const result = instrumentChallengeSource('GO', source, question());
    expect(result.error).toBeUndefined();
    expect(result.source).toContain('if presente := mundo.tem_objeto(); mundo._condicao(presente)');
    expect(result.source).toMatch(/range \[\]int\{1,2\} \{\nmundo\._laco\(\d+\);/);
  });

  it('accepts trivia between the world object and its methods', () => {
    const source =
      'if (mundo /* sensor */ . tem_objeto()) { mundo /* action */ .coletar(); } else { mundo.andar_direita(); }';
    expect(
      instrumentChallengeSource('JS', source, question(['conditional'])).error
    ).toBeUndefined();
  });

  it('rejects direct invocation of internal runtime markers', () => {
    for (const language of ['JS', 'GO', 'PYTHON'] as const) {
      expect(
        instrumentChallengeSource(language, solutions[language]! + '\nmundo._laco()', question())
          .error
      ).toContain('reservados');
    }
    expect(
      instrumentChallengeSource(
        'JS',
        solutions.JS! + '\nconsole.log("__mundinho_condicional__")',
        question()
      ).error
    ).toContain('reservados');
  });
});

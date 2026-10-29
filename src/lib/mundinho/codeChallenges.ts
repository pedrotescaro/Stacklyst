import type { BattleLanguage, CodeRun, PublicQuestion } from './types';

const STARTERS: Partial<Record<BattleLanguage, string>> = {
  PYTHON: 'for passo in range(3):\n    mundo.andar_direita()\n    # Colete o cristal aqui\n',
  JS: 'for (let passo = 0; passo < 3; passo++) {\n  mundo.andar_direita();\n  // Colete o cristal aqui\n}\n',
  TS: 'for (let passo: number = 0; passo < 3; passo++) {\n  mundo.andar_direita();\n  // Colete o cristal aqui\n}\n',
  RUST: 'for _passo in 0..3 {\n    mundo.andar_direita();\n    // Colete o cristal aqui\n}\n',
  GO: 'for passo := 0; passo < 3; passo++ {\n    mundo.andar_direita()\n    // Colete o cristal aqui\n}\n',
  JAVA: 'for (int passo = 0; passo < 3; passo++) {\n    mundo.andar_direita();\n    // Colete o cristal aqui\n}\n',
};

export function codeChallenge(language: BattleLanguage): PublicQuestion | null {
  const starter = STARTERS[language];
  if (!starter) return null;
  return {
    id: `code-crystals-${language}`,
    concept: 'Laços e sequência',
    difficulty: 'Fácil',
    options: [],
    prompt:
      'Colete os três cristais da clareira. Use um laço para andar uma casa e coletar o cristal, repetindo três vezes.',
    code: { starter, commands: ['mundo.andar_direita()', 'mundo.coletar()'], target: 3 },
  };
}

/** Harness runs only through the existing isolated execution service. */
export function challengeProgram(language: BattleLanguage, source: string): string {
  switch (language) {
    case 'JS':
    case 'TS':
      return `const mundo = Object.freeze({andar_direita(){console.log("andar")},coletar(){console.log("coletar")}});\n${source}`;
    case 'PYTHON':
      return `class Mundo:\n    def andar_direita(self): print("andar")\n    def coletar(self): print("coletar")\nmundo = Mundo()\n${source}`;
    case 'RUST':
      return `struct Mundo; impl Mundo { fn andar_direita(&self){println!("andar");} fn coletar(&self){println!("coletar");} }\nfn main(){ let mundo = Mundo;\n${source}\n}`;
    case 'GO':
      return `package main\nimport "fmt"\ntype Mundo struct{}\nfunc (m Mundo) andar_direita(){fmt.Println("andar")}\nfunc (m Mundo) coletar(){fmt.Println("coletar")}\nfunc main(){mundo := Mundo{}\n${source}\n}`;
    case 'JAVA':
      return `public class Main { static class Mundo { void andar_direita(){System.out.println("andar");} void coletar(){System.out.println("coletar");} } public static void main(String[] args){Mundo mundo = new Mundo();\n${source}\n}}`;
    default:
      throw new Error('Esta linguagem não possui desafio de movimento.');
  }
}

export function evaluateTrace(output: string): CodeRun {
  const trace = output
    .trim()
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (trace.length > 24 || trace.some((command) => command !== 'andar' && command !== 'coletar'))
    return {
      passed: false,
      trace: [],
      error: 'Use somente os comandos do mundo. Limite de 24 ações por execução.',
    };
  let position = 0;
  const collected = new Set<number>();
  for (const command of trace) {
    if (command === 'andar') {
      position++;
      if (position > 3)
        return {
          passed: false,
          trace,
          error: 'Você passou do último cristal. Termine na terceira casa.',
        };
    } else {
      if (position < 1 || collected.has(position))
        return { passed: false, trace, error: 'Não há cristal nesta casa. Ande antes de coletar.' };
      collected.add(position);
    }
  }
  return {
    passed: position === 3 && collected.size === 3,
    trace,
    ...(collected.size < 3
      ? {
          error: `Você coletou ${collected.size} de 3 cristais. Adicione mundo.coletar() após cada passo.`,
        }
      : {}),
  };
}

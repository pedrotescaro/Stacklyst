import type { BankLanguage } from './dialect';
import type { BankExercise, BankGenerator, BankTopic, Rng } from './types';

/**
 * Hand-written, language-specific exercises: idioms and error handling that do
 * not translate between languages. Options are shuffled by the lesson seed.
 */

type SpecBody =
  | {
      kind: 'truefalse';
      topic: BankTopic;
      statement: string;
      holds: boolean;
      why: string;
      code?: string;
    }
  | { kind: 'output'; topic: BankTopic; code: string; answer: string; wrong: string[]; why: string }
  | {
      kind: 'quiz';
      topic: BankTopic;
      question: string;
      code?: string;
      answer: string;
      wrong: string[];
      why: string;
    }
  | {
      kind: 'complete';
      topic: BankTopic;
      instruction: string;
      context?: string;
      prefix: string;
      suffix: string;
      expected: string[];
      placeholder: string;
      why: string;
    }
  | { kind: 'order'; topic: BankTopic; instruction: string; lines: string[]; why: string }
  | {
      kind: 'match';
      topic: BankTopic;
      instruction: string;
      pairs: Array<[string, string]>;
      why: string;
    }
  | {
      kind: 'bug';
      topic: BankTopic;
      question: string;
      lines: string[];
      buggy: number;
      why: string;
    };

/** `easy` marks exercises that fit the beginner course. */
type Spec = SpecBody & { easy?: boolean };

function toExercise(spec: Spec, rng: Rng): BankExercise {
  switch (spec.kind) {
    case 'truefalse':
      return {
        kind: 'truefalse',
        title: 'Verdadeiro ou falso?',
        question: spec.statement,
        code: spec.code,
        options: ['Verdadeiro', 'Falso'],
        answer: spec.holds ? 'Verdadeiro' : 'Falso',
        explanation: spec.why,
      };
    case 'output':
      return {
        kind: 'output',
        title: 'Qual é a saída?',
        instruction: 'Leia com atenção: o detalhe está na linguagem.',
        code: spec.code,
        options: rng.shuffle([spec.answer, ...spec.wrong]),
        answer: spec.answer,
        explanation: spec.why,
      };
    case 'quiz':
      return {
        kind: 'quiz',
        title: 'Escolha a alternativa',
        question: spec.question,
        code: spec.code,
        options: rng.shuffle([spec.answer, ...spec.wrong]),
        answer: spec.answer,
        explanation: spec.why,
      };
    case 'complete':
      return {
        kind: 'complete',
        title: 'Complete o código',
        instruction: spec.instruction,
        context: spec.context,
        prefix: spec.prefix,
        suffix: spec.suffix,
        placeholder: spec.placeholder,
        expected: spec.expected,
        explanation: spec.why,
      };
    case 'order':
      return {
        kind: 'order',
        title: 'Ordene as linhas',
        instruction: spec.instruction,
        lines: spec.lines,
        explanation: spec.why,
      };
    case 'match':
      return {
        kind: 'match',
        title: 'Ligue os pares',
        instruction: spec.instruction,
        pairs: spec.pairs,
        explanation: spec.why,
      };
    case 'bug': {
      const label = (index: number) => `Linha ${index + 1}: ${spec.lines[index]!.trim()}`;
      const candidates = spec.lines
        .map((line, index) => ({ line, index }))
        .filter(({ line, index }) => index !== spec.buggy && line.trim().length > 2)
        .map(({ index }) => index);
      const options = [spec.buggy, ...rng.shuffle(candidates).slice(0, 3)];
      return {
        kind: 'bug',
        title: 'Ache o bug',
        question: spec.question,
        code: spec.lines
          .map((line, index) => `${String(index + 1).padStart(2, ' ')} │ ${line}`)
          .join('\n'),
        options: rng.shuffle(options.map(label)),
        answer: label(spec.buggy),
        explanation: spec.why,
      };
    }
  }
}

const JS_LIKE: Spec[] = [
  {
    kind: 'truefalse',
    topic: 'basics',
    statement: '`===` compara valor e tipo, sem converter nada.',
    holds: true,
    why: '`===` é a igualdade estrita; `==` faz coerção de tipo antes de comparar.',
  },
  {
    kind: 'truefalse',
    topic: 'basics',
    statement: '`const` congela o objeto: nenhuma propriedade pode mudar depois.',
    holds: false,
    why: '`const` só impede reatribuir a variável; as propriedades do objeto continuam mutáveis.',
  },
  {
    kind: 'output',
    topic: 'basics',
    code: 'console.log("5" + 2);',
    answer: '52',
    wrong: ['7', 'NaN', 'Erro de tipo'],
    why: 'Com uma string envolvida, `+` concatena: "5" + 2 vira "52".',
  },
  {
    kind: 'output',
    topic: 'basics',
    code: 'console.log(null ?? "padrão");\nconsole.log(0 ?? "padrão");',
    answer: 'padrão\n0',
    wrong: ['padrão\npadrão', 'null\n0', '0\npadrão'],
    why: '`??` só troca null e undefined; 0 é um valor válido.',
  },
  {
    kind: 'output',
    topic: 'collections',
    code: 'const dobrados = [1, 2, 3].map((n) => n * 2);\nconsole.log(dobrados.join(","));',
    answer: '2,4,6',
    wrong: ['1,2,3', '[2, 4, 6]', '12'],
    why: '`map` cria uma nova lista transformada e `join(",")` junta com vírgulas.',
  },
  {
    kind: 'match',
    topic: 'collections',
    instruction: 'Associe cada método ao que ele faz.',
    pairs: [
      ['map', 'transforma cada item'],
      ['filter', 'mantém os que passam no teste'],
      ['reduce', 'acumula em um único valor'],
      ['find', 'devolve o primeiro que combina'],
    ],
    why: 'Esses quatro métodos resolvem a maioria das tarefas com arrays.',
  },
  {
    kind: 'complete',
    topic: 'errors',
    instruction: 'Complete a captura do erro.',
    context: 'try {\n  JSON.parse(texto);\n}',
    prefix: '',
    suffix: ' (erro) {',
    expected: ['catch'],
    placeholder: 'palavra-chave',
    why: 'Um bloco `try` é seguido de `catch (erro) { … }`.',
  },
  {
    kind: 'order',
    topic: 'errors',
    instruction: 'Monte o tratamento de JSON inválido.',
    lines: [
      'try {',
      '  const dados = JSON.parse(texto);',
      '  console.log(dados.nome);',
      '} catch (erro) {',
      '  console.log("JSON inválido");',
      '}',
    ],
    why: 'O código arriscado fica no `try`; a recuperação, no `catch`.',
  },
  {
    kind: 'bug',
    topic: 'conditionals',
    question: 'A mensagem "vazia" aparece sempre, mesmo com itens. Onde está o bug?',
    lines: ['const lista = [1, 2, 3];', 'if (lista.length = 0) {', '  console.log("vazia");', '}'],
    buggy: 1,
    why: '`=` atribui; para comparar use `===`. A linha 2 zera a lista.',
  },
  {
    kind: 'quiz',
    topic: 'functions',
    question: 'O que `async` faz com o retorno de uma função?',
    answer: 'Embrulha o retorno em uma Promise',
    wrong: [
      'Executa a função em outra thread',
      'Bloqueia até a função terminar',
      'Converte o retorno em string',
    ],
    why: 'Toda função `async` devolve uma Promise; `await` espera ela resolver.',
  },
];

const TS_ONLY: Spec[] = [
  {
    kind: 'truefalse',
    topic: 'basics',
    easy: true,
    statement: 'Os tipos do TypeScript são verificados na compilação e somem no JavaScript gerado.',
    holds: true,
    why: 'TypeScript apaga os tipos ao compilar; em execução sobra JavaScript puro.',
  },
  {
    kind: 'truefalse',
    topic: 'basics',
    statement: '`unknown` deixa chamar qualquer método sem checagem, assim como `any`.',
    holds: false,
    why: '`unknown` exige que você estreite o tipo antes de usar; `any` desliga a checagem.',
  },
  {
    kind: 'complete',
    topic: 'functions',
    instruction: 'Complete o tipo de retorno.',
    prefix: 'function soma(a: number, b: number): ',
    suffix: ' {',
    expected: ['number'],
    placeholder: 'tipo',
    why: 'Somar dois `number` devolve `number`.',
  },
  {
    kind: 'match',
    topic: 'basics',
    instruction: 'Associe cada recurso ao seu papel.',
    pairs: [
      ['string | null', 'união de tipos'],
      ['readonly', 'não pode ser reatribuída'],
      ['interface', 'descreve a forma de um objeto'],
      ['nome?: string', 'propriedade opcional'],
    ],
    why: 'São os blocos básicos para modelar dados em TypeScript.',
  },
  {
    kind: 'bug',
    topic: 'basics',
    question: 'O compilador acusa erro. Em qual linha?',
    lines: [
      'interface Pessoa {',
      '  nome: string;',
      '  idade: number;',
      '}',
      'const ana: Pessoa = { nome: "Ana", idade: "30" };',
    ],
    buggy: 4,
    why: '`idade` é `number`, mas recebeu a string "30".',
  },
];

const PYTHON: Spec[] = [
  {
    kind: 'truefalse',
    topic: 'collections',
    statement: 'Listas são mutáveis e tuplas são imutáveis.',
    holds: true,
    why: 'Você pode alterar uma lista no lugar; uma tupla não aceita mudanças.',
  },
  {
    kind: 'truefalse',
    topic: 'loops',
    easy: true,
    statement: '`range(5)` gera os números de 1 a 5.',
    holds: false,
    why: '`range(5)` gera 0, 1, 2, 3 e 4.',
  },
  {
    kind: 'truefalse',
    topic: 'basics',
    easy: true,
    statement: 'Em Python, a indentação define onde um bloco começa e termina.',
    holds: true,
    why: 'Não há chaves: o recuo é parte da sintaxe.',
  },
  {
    kind: 'output',
    topic: 'collections',
    code: 'print([10, 20, 30, 40][1:3])',
    answer: '[20, 30]',
    wrong: ['[10, 20, 30]', '[20, 30, 40]', '[10, 20]'],
    why: 'O fatiamento inclui o início e exclui o fim: índices 1 e 2.',
  },
  {
    kind: 'output',
    topic: 'basics',
    code: 'print("ab" * 3)\nprint(7 // 2)',
    answer: 'ababab\n3',
    wrong: ['ababab\n3.5', 'ab3\n3', 'Erro de tipo'],
    why: '`*` repete strings; `//` é divisão inteira.',
  },
  {
    kind: 'complete',
    topic: 'loops',
    instruction: 'Complete para ter o índice e o nome a cada volta.',
    context: 'nomes = ["Ana", "Bia"]',
    prefix: 'for i, nome in ',
    suffix: '(nomes):',
    expected: ['enumerate'],
    placeholder: 'função',
    why: '`enumerate` entrega pares (índice, valor).',
  },
  {
    kind: 'order',
    topic: 'errors',
    instruction: 'Trate a conversão inválida.',
    lines: ['try:', '    numero = int("abc")', 'except ValueError:', '    print("não é número")'],
    why: 'O código arriscado vem no `try`; o tratamento, no `except` do erro específico.',
  },
  {
    kind: 'match',
    topic: 'collections',
    instruction: 'Associe cada recurso ao que ele faz.',
    pairs: [
      ['lista.append(x)', 'adiciona no fim'],
      ['d.get("k", 0)', 'lê com valor padrão'],
      ['f"{nome}"', 'interpola no texto'],
      ['len(x)', 'conta os itens'],
    ],
    why: 'Ferramentas do dia a dia em Python.',
  },
  {
    kind: 'bug',
    topic: 'functions',
    question: 'Cada chamada acumula itens das chamadas anteriores. Onde está o bug?',
    lines: [
      'def adiciona(item, lista=[]):',
      '    lista.append(item)',
      '    return lista',
      '',
      'print(adiciona(1))',
      'print(adiciona(2))',
    ],
    buggy: 0,
    why: 'O padrão `[]` é criado uma vez só e reaproveitado. Use `lista=None` e crie a lista dentro.',
  },
  {
    kind: 'quiz',
    topic: 'errors',
    question: 'Qual bloco roda sempre, com ou sem erro?',
    answer: 'finally',
    wrong: ['else', 'except', 'raise'],
    why: '`finally` executa no fim de qualquer caminho, ideal para liberar recursos.',
  },
];

const GO: Spec[] = [
  {
    kind: 'truefalse',
    topic: 'basics',
    easy: true,
    statement: 'Em Go, `:=` declara a variável e atribui ao mesmo tempo.',
    holds: true,
    why: 'É a declaração curta, que infere o tipo.',
  },
  {
    kind: 'truefalse',
    topic: 'loops',
    easy: true,
    statement: 'Go tem a palavra-chave `while`.',
    holds: false,
    why: 'Em Go, `for condicao { }` faz o papel do while.',
  },
  {
    kind: 'truefalse',
    topic: 'functions',
    statement: 'Funções em Go podem devolver mais de um valor.',
    holds: true,
    why: 'O padrão `valor, err := f()` depende disso.',
  },
  {
    kind: 'complete',
    topic: 'errors',
    instruction: 'Complete o teste de erro.',
    context: 'valor, err := strconv.Atoi(texto)',
    prefix: 'if err ',
    suffix: ' nil {',
    expected: ['!='],
    placeholder: 'operador',
    why: 'Erro presente é `err != nil`.',
  },
  {
    kind: 'order',
    topic: 'errors',
    instruction: 'Converta o texto e trate a falha.',
    lines: [
      'valor, err := strconv.Atoi("42")',
      'if err != nil {',
      '    fmt.Println("erro:", err)',
      '    return',
      '}',
      'fmt.Println(valor)',
    ],
    why: 'Em Go, o erro é verificado logo após a chamada.',
  },
  {
    kind: 'output',
    topic: 'collections',
    code: 's := []int{1, 2}\ns = append(s, 3)\nfmt.Println(len(s))',
    answer: '3',
    wrong: ['2', '4', 'Erro de compilação'],
    why: '`append` devolve o slice com o novo item.',
  },
  {
    kind: 'output',
    topic: 'basics',
    easy: true,
    code: 'fmt.Println(7 / 2)\nfmt.Println(7 % 2)',
    answer: '3\n1',
    wrong: ['3.5\n1', '3\n0', '4\n1'],
    why: 'Entre inteiros, `/` descarta a parte decimal e `%` dá o resto.',
  },
  {
    kind: 'match',
    topic: 'functions',
    instruction: 'Associe cada palavra-chave.',
    pairs: [
      ['make', 'cria slice ou map'],
      ['append', 'adiciona ao slice'],
      ['defer', 'executa ao sair da função'],
      ['go', 'inicia uma goroutine'],
    ],
    why: 'Peças essenciais do Go do dia a dia.',
  },
  {
    kind: 'bug',
    topic: 'loops',
    question: 'O total deveria ser a soma de todos os itens. Onde está o bug?',
    lines: [
      'nums := []int{4, 5, 6}',
      'total := 0',
      'for i := 0; i < len(nums); i++ {',
      '    total = nums[i]',
      '}',
      'fmt.Println(total)',
    ],
    buggy: 3,
    why: '`=` sobrescreve a cada volta; o certo é `total += nums[i]`.',
  },
];

const RUST: Spec[] = [
  {
    kind: 'truefalse',
    topic: 'basics',
    easy: true,
    statement: 'Variáveis em Rust são imutáveis por padrão.',
    holds: true,
    why: 'É preciso `let mut` para poder alterar.',
  },
  {
    kind: 'truefalse',
    topic: 'basics',
    statement: '`String` e `&str` são exatamente o mesmo tipo.',
    holds: false,
    why: '`String` é dona do texto (no heap); `&str` é uma referência emprestada.',
  },
  {
    kind: 'truefalse',
    topic: 'conditionals',
    statement: 'Um `match` precisa cobrir todos os casos possíveis.',
    holds: true,
    why: 'O compilador exige um `match` exaustivo; `_` cobre o resto.',
  },
  {
    kind: 'complete',
    topic: 'basics',
    easy: true,
    instruction: 'Permita alterar o contador.',
    prefix: 'let ',
    suffix: ' contador = 0;',
    expected: ['mut'],
    placeholder: 'palavra-chave',
    why: 'Sem `mut`, `contador += 1` não compila.',
  },
  {
    kind: 'order',
    topic: 'conditionals',
    instruction: 'Monte o `match` que classifica o número.',
    lines: [
      'match numero {',
      '    0 => println!("zero"),',
      '    n if n < 0 => println!("negativo"),',
      '    _ => println!("positivo"),',
      '}',
    ],
    why: 'Casos específicos vêm antes; `_` captura o que sobrar.',
  },
  {
    kind: 'output',
    topic: 'collections',
    code: 'let v = vec![3, 1, 2];\nlet total: i32 = v.iter().sum();\nprintln!("{}", total);',
    answer: '6',
    wrong: ['312', '3', 'Erro de compilação'],
    why: '`iter().sum()` soma os elementos.',
  },
  {
    kind: 'output',
    topic: 'errors',
    code: 'let x: Option<i32> = None;\nprintln!("{}", x.unwrap_or(7));',
    answer: '7',
    wrong: ['None', '0', 'O programa entra em pânico'],
    why: '`unwrap_or` usa o padrão quando não há valor.',
  },
  {
    kind: 'match',
    topic: 'errors',
    instruction: 'Associe cada recurso ao significado.',
    pairs: [
      ['Option', 'valor que pode não existir'],
      ['Result', 'sucesso ou erro'],
      ['?', 'propaga o erro'],
      ['&', 'empresta sem mover'],
    ],
    why: 'São a base do tratamento de ausência e de erros em Rust.',
  },
  {
    kind: 'bug',
    topic: 'basics',
    question: 'Este código não compila. Em qual linha?',
    lines: ['let nome = String::from("Ana");', 'let outro = nome;', 'println!("{}", nome);'],
    buggy: 2,
    why: '`nome` foi movido para `outro`; não pode mais ser usado. Use `nome.clone()` ou empreste com `&`.',
  },
];

const JAVA: Spec[] = [
  {
    kind: 'truefalse',
    topic: 'basics',
    statement: 'Strings em Java devem ser comparadas com `equals`, não com `==`.',
    holds: true,
    why: '`==` compara referências; `equals` compara o conteúdo.',
  },
  {
    kind: 'truefalse',
    topic: 'basics',
    statement: 'Uma variável `int` pode receber `null`.',
    holds: false,
    why: '`int` é primitivo; só o wrapper `Integer` aceita `null`.',
  },
  {
    kind: 'truefalse',
    topic: 'functions',
    statement: 'Um método `static` pertence à classe, não a cada objeto.',
    holds: true,
    why: 'Por isso pode ser chamado sem criar uma instância.',
  },
  {
    kind: 'complete',
    topic: 'errors',
    instruction: 'Complete a captura da exceção.',
    context: 'try {\n    int n = Integer.parseInt(texto);\n}',
    prefix: '',
    suffix: ' (NumberFormatException e) {',
    expected: ['catch'],
    placeholder: 'palavra-chave',
    why: 'Depois do `try` vem `catch (TipoDaExcecao e)`.',
  },
  {
    kind: 'order',
    topic: 'errors',
    instruction: 'Trate o número inválido.',
    lines: [
      'try {',
      '    int n = Integer.parseInt("abc");',
      '    System.out.println(n);',
      '} catch (NumberFormatException e) {',
      '    System.out.println("inválido");',
      '}',
    ],
    why: 'O trecho arriscado no `try`, a recuperação no `catch`.',
  },
  {
    kind: 'output',
    topic: 'basics',
    code: 'System.out.println("a" + 1 + 2);\nSystem.out.println(1 + 2 + "a");',
    answer: 'a12\n3a',
    wrong: ['a3\n3a', 'a12\n12a', 'a3\n12a'],
    why: 'Da esquerda para a direita: com uma String à esquerda, `+` concatena; entre números, soma.',
  },
  {
    kind: 'output',
    topic: 'basics',
    easy: true,
    code: 'System.out.println(7 / 2);',
    answer: '3',
    wrong: ['3.5', '4', '3.0'],
    why: 'Divisão entre `int` descarta a parte decimal.',
  },
  {
    kind: 'match',
    topic: 'collections',
    instruction: 'Associe cada recurso.',
    pairs: [
      ['ArrayList', 'lista que cresce'],
      ['HashMap', 'chave → valor'],
      ['final', 'não pode ser reatribuída'],
      ['@Override', 'sobrescreve método da classe pai'],
    ],
    why: 'Peças do Java do dia a dia.',
  },
  {
    kind: 'bug',
    topic: 'conditionals',
    question: 'O "Olá, Ana" às vezes não aparece. Onde está o bug?',
    lines: [
      'String nome = lerNome();',
      'if (nome == "Ana") {',
      '    System.out.println("Olá, Ana");',
      '}',
    ],
    buggy: 1,
    why: 'Compare Strings com `"Ana".equals(nome)`.',
  },
];

const SPECS: Record<BankLanguage, Spec[]> = {
  JS: JS_LIKE,
  TS: [...JS_LIKE, ...TS_ONLY],
  PYTHON,
  GO,
  RUST,
  JAVA,
};

export const LANGUAGE_GENERATORS: BankGenerator[] = (
  Object.entries(SPECS) as Array<[BankLanguage, Spec[]]>
).flatMap(([language, specs]) =>
  specs.map((spec, index) => ({
    id: `${language.toLowerCase()}-${spec.kind}-${index}`,
    topic: spec.topic,
    kind: spec.kind,
    languages: [language],
    advanced: !spec.easy,
    make: ({ rng }) => toExercise(spec, rng),
  }))
);

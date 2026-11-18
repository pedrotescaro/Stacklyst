// Server-only answer bank for battle quizzes. Never import this module into a
// client component or the mobile bundle: it carries the answers.
//
// Each battle skill asks for a different kind of knowledge:
//   strike (Aplicar conceito) → a concept quiz about programming or the language
//   focus  (Depurar)          → find the bug in a short snippet
//   burst  (Refatorar)        → a code exercise (see codeChallenges.ts)
import { QUESTIONS } from './questions';
import { SKILL_CHALLENGE } from './rules';
import type { BattleLanguage, PublicQuestion } from './types';

export type QuizKind = 'concept' | 'bug';
export type ChallengeKind = QuizKind | 'code';
export type Quiz = PublicQuestion & {
  language: BattleLanguage;
  answer: number;
  explanation: string;
};

export { SKILL_CHALLENGE };

type Text = readonly [pt: string, en: string];
type Entry = {
  concept: Text;
  prompt: Text;
  options: readonly (string | Text)[];
  answer: number;
  explanation: Text;
  snippet?: string;
};

const PROGRAMMING: readonly BattleLanguage[] = ['PYTHON', 'JS', 'TS', 'RUST', 'GO', 'JAVA'];

/** Core programming ideas, asked in every programming language. */
const GENERAL: Entry[] = [
  {
    concept: ['Algoritmos', 'Algorithms'],
    prompt: ['O que é um algoritmo?', 'What is an algorithm?'],
    options: [
      ['Um tipo de variável', 'A kind of variable'],
      [
        'Uma sequência finita de passos para resolver um problema',
        'A finite sequence of steps that solves a problem',
      ],
      ['Um erro de sintaxe', 'A syntax error'],
      ['Um programa que só roda na web', 'A program that only runs on the web'],
    ],
    answer: 1,
    explanation: [
      'Um algoritmo é a receita: passos claros, em ordem, que terminam com uma resposta.',
      'An algorithm is the recipe: clear steps, in order, that end with an answer.',
    ],
  },
  {
    concept: ['Funções', 'Functions'],
    prompt: ['Por que dividir um programa em funções?', 'Why split a program into functions?'],
    options: [
      ['Para deixar o código mais lento', 'To make the code slower'],
      ['Só para usar mais memória', 'Only to use more memory'],
      [
        'Para reutilizar lógica e organizar o código em partes com nome',
        'To reuse logic and organise the code into named parts',
      ],
      ['Porque toda linha precisa estar numa função', 'Because every line must be in a function'],
    ],
    answer: 2,
    explanation: [
      'Funções dão nome a uma tarefa e evitam repetir o mesmo trecho em vários lugares.',
      'Functions name a task and avoid repeating the same code in many places.',
    ],
  },
  {
    concept: ['Depuração', 'Debugging'],
    prompt: ['O que significa depurar um programa?', 'What does debugging a program mean?'],
    options: [
      ['Encontrar e corrigir erros', 'Finding and fixing errors'],
      ['Apagar todos os comentários', 'Deleting every comment'],
      ['Compilar mais rápido', 'Compiling faster'],
      ['Traduzir para outra linguagem', 'Translating it into another language'],
    ],
    answer: 0,
    explanation: [
      'Depurar é investigar por que o programa não faz o esperado e corrigir a causa.',
      'Debugging is finding out why the program misbehaves and fixing the cause.',
    ],
  },
  {
    concept: ['Booleanos', 'Booleans'],
    prompt: [
      'Qual é o resultado de uma comparação como 5 > 3?',
      'What does a comparison like 5 > 3 produce?',
    ],
    options: [
      '5',
      ['Um texto', 'A string'],
      ['Verdadeiro, um valor booleano', 'True, a boolean value'],
      ['Um erro', 'An error'],
    ],
    answer: 2,
    explanation: [
      'Comparações produzem verdadeiro ou falso, que é o que condicionais e laços usam.',
      'Comparisons produce true or false, which is what conditionals and loops use.',
    ],
  },
  {
    concept: ['Laços', 'Loops'],
    prompt: [
      'Qual estrutura repete um bloco enquanto uma condição for verdadeira?',
      'Which structure repeats a block while a condition is true?',
    ],
    options: ['if', 'while', 'return', 'import'],
    answer: 1,
    explanation: [
      'while testa a condição antes de cada volta e para quando ela fica falsa.',
      'while checks the condition before each pass and stops once it is false.',
    ],
  },
  {
    concept: ['Variáveis', 'Variables'],
    prompt: ['Para que serve uma variável?', 'What is a variable for?'],
    options: [
      [
        'Guardar um valor com um nome para usar depois',
        'Keeping a value under a name to use later',
      ],
      ['Repetir código', 'Repeating code'],
      ['Desenhar na tela', 'Drawing on the screen'],
      ['Conectar à internet', 'Connecting to the internet'],
    ],
    answer: 0,
    explanation: [
      'Uma variável é um nome que aponta para um valor guardado na memória.',
      'A variable is a name that points to a value kept in memory.',
    ],
  },
  {
    concept: ['Testes', 'Testing'],
    prompt: ['Para que serve um teste automatizado?', 'What is an automated test for?'],
    options: [
      ['Para substituir a documentação', 'To replace the documentation'],
      [
        'Para verificar se o código faz o esperado sempre que ele muda',
        'To check the code still does what it should whenever it changes',
      ],
      ['Para deixar o arquivo menor', 'To make the file smaller'],
      ['Para esconder erros', 'To hide errors'],
    ],
    answer: 1,
    explanation: [
      'Testes repetem verificações automaticamente e avisam quando algo quebra.',
      'Tests repeat checks automatically and warn you when something breaks.',
    ],
  },
  {
    concept: ['Complexidade', 'Complexity'],
    prompt: [
      'Percorrer uma lista de n itens uma única vez custa quanto tempo?',
      'How much time does walking a list of n items once take?',
    ],
    options: ['O(1)', 'O(n²)', 'O(log n)', 'O(n)'],
    answer: 3,
    explanation: [
      'Uma passada visita cada item uma vez: o tempo cresce junto com n.',
      'One pass visits each item once: the time grows with n.',
    ],
  },
  {
    concept: ['Escopo', 'Scope'],
    prompt: [
      'Uma variável criada dentro de uma função normalmente:',
      'A variable created inside a function usually:',
    ],
    options: [
      ['Só existe dentro daquela função', 'Only exists inside that function'],
      ['Fica visível em todos os arquivos', 'Is visible in every file'],
      ['Vira uma constante', 'Becomes a constant'],
      ['É apagada antes de ser usada', 'Is erased before it is used'],
    ],
    answer: 0,
    explanation: [
      'Variáveis locais vivem no escopo da função e somem quando ela termina.',
      'Local variables live in the function’s scope and go away when it ends.',
    ],
  },
  {
    concept: ['Legibilidade', 'Readability'],
    prompt: [
      'Qual nome de variável deixa o código mais claro?',
      'Which variable name makes the code clearest?',
    ],
    options: ['x1', 'dados2', 'totalDeAlunos', 'aaa'],
    answer: 2,
    explanation: [
      'Nomes que dizem o que o valor representa poupam leitura e evitam bugs.',
      'Names that say what the value means save reading and prevent bugs.',
    ],
  },
];

/** Web basics, asked in HTML and CSS battles. */
const WEB: Entry[] = [
  {
    concept: ['Estrutura', 'Structure'],
    prompt: ['O que o HTML define em uma página?', 'What does HTML define on a page?'],
    options: [
      ['A estrutura e o significado do conteúdo', 'The structure and meaning of the content'],
      ['As cores e animações', 'The colours and animations'],
      ['A lógica do servidor', 'The server logic'],
      ['O banco de dados', 'The database'],
    ],
    answer: 0,
    explanation: [
      'HTML marca o que cada parte é: título, lista, botão, formulário…',
      'HTML marks what each part is: heading, list, button, form…',
    ],
  },
  {
    concept: ['Estilo', 'Styling'],
    prompt: ['O que o CSS controla?', 'What does CSS control?'],
    options: [
      ['O conteúdo dos textos', 'The text content'],
      ['A aparência e o layout', 'The look and the layout'],
      ['As rotas do site', 'The site’s routes'],
      ['O envio de formulários ao servidor', 'Sending forms to the server'],
    ],
    answer: 1,
    explanation: [
      'CSS decide cores, tamanhos, espaços e a posição dos elementos.',
      'CSS decides colours, sizes, spacing and where elements go.',
    ],
  },
  {
    concept: ['Acessibilidade', 'Accessibility'],
    prompt: [
      'Por que usar texto alternativo e rótulos nos campos?',
      'Why add alt text and labels to fields?',
    ],
    options: [
      ['Para o site carregar mais rápido', 'So the site loads faster'],
      [
        'Para que leitores de tela e mais pessoas consigam usar a página',
        'So screen readers and more people can use the page',
      ],
      ['É exigido só em celulares', 'It is only required on phones'],
      ['Para melhorar as cores', 'To improve the colours'],
    ],
    answer: 1,
    explanation: [
      'Sem texto alternativo e rótulos, quem usa leitor de tela não sabe o que é cada elemento.',
      'Without alt text and labels, screen reader users cannot tell what each element is.',
    ],
  },
];

/** Find the bug: four short snippets per language, each with one real mistake. */
const BUGS: Record<BattleLanguage, Entry[]> = {
  PYTHON: [
    {
      concept: ['Acumuladores', 'Accumulators'],
      prompt: [
        'A função deveria somar todos os números. Onde está o erro?',
        'The function should add up every number. Where is the bug?',
      ],
      snippet:
        'def soma(lista):\n    total = 0\n    for n in lista:\n        total = n\n    return total',
      options: [
        ['Linha 2: total deveria começar em 1', 'Line 2: total should start at 1'],
        ['Linha 4: deveria ser total += n', 'Line 4: it should be total += n'],
        [
          'Linha 5: o return deveria ficar dentro do for',
          'Line 5: return should be inside the for',
        ],
        ['Linha 1: falta o tipo da lista', 'Line 1: the list type is missing'],
      ],
      answer: 1,
      explanation: [
        'total = n troca o valor a cada volta; += vai acumulando a soma.',
        'total = n replaces the value on each pass; += keeps adding up.',
      ],
    },
    {
      concept: ['Tipos', 'Types'],
      prompt: [
        'Este código quebra ao comparar a idade. Por quê?',
        'This code fails when comparing the age. Why?',
      ],
      snippet: 'idade = input("Idade: ")\nif idade >= 18:\n    print("Maior de idade")',
      options: [
        ['Linha 2: o operador certo é =>', 'Line 2: the right operator is =>'],
        ['Linha 3: print precisa de parênteses duplos', 'Line 3: print needs double parentheses'],
        [
          'Linha 1: input devolve texto; converta com int()',
          'Line 1: input returns text; convert it with int()',
        ],
        ['Linha 2: falta ponto e vírgula', 'Line 2: a semicolon is missing'],
      ],
      answer: 2,
      explanation: [
        'input sempre devolve str, e Python não compara texto com número.',
        'input always returns a str, and Python will not compare text with a number.',
      ],
    },
    {
      concept: ['Índices', 'Indexes'],
      prompt: [
        'O laço deveria mostrar os três nomes, mas Ana não aparece. Onde está o erro?',
        'The loop should print all three names, but Ana is missing. Where is the bug?',
      ],
      snippet:
        'nomes = ["Ana", "Bia", "Caio"]\nfor i in range(1, len(nomes)):\n    print(nomes[i])',
      options: [
        ['Linha 1: listas usam chaves', 'Line 1: lists use braces'],
        ['Linha 3: o índice deveria ser i + 1', 'Line 3: the index should be i + 1'],
        ['Linha 2: len deveria ser size', 'Line 2: len should be size'],
        ['Linha 2: o range deveria começar em 0', 'Line 2: the range should start at 0'],
      ],
      answer: 3,
      explanation: [
        'range(1, ...) começa no índice 1 e pula o primeiro item, que está no índice 0.',
        'range(1, ...) starts at index 1 and skips the first item, which is at index 0.',
      ],
    },
    {
      concept: ['Retorno', 'Return values'],
      prompt: [
        'O programa imprime None em vez de 8. Por quê?',
        'The program prints None instead of 8. Why?',
      ],
      snippet: 'def dobro(x):\n    resultado = x * 2\n\nprint(dobro(4))',
      options: [
        ['Falta return resultado na função', 'The function is missing return resultado'],
        ['Linha 2: deveria ser x ** 2', 'Line 2: it should be x ** 2'],
        ['Linha 4: dobro precisa de dois argumentos', 'Line 4: dobro needs two arguments'],
        ['Linha 1: def deveria ser function', 'Line 1: def should be function'],
      ],
      answer: 0,
      explanation: [
        'Sem return, a função calcula o valor mas devolve None.',
        'Without return, the function works out the value but gives back None.',
      ],
    },
  ],
  JS: [
    {
      concept: ['Laços', 'Loops'],
      prompt: [
        'O laço imprime um undefined no final. Onde está o erro?',
        'The loop prints an undefined at the end. Where is the bug?',
      ],
      snippet:
        'const itens = [1, 2, 3];\nfor (let i = 0; i <= itens.length; i++) {\n  console.log(itens[i]);\n}',
      options: [
        ['Linha 1: const não pode guardar arrays', 'Line 1: const cannot hold arrays'],
        ['Linha 2: use i < itens.length', 'Line 2: use i < itens.length'],
        ['Linha 3: console.log não aceita índices', 'Line 3: console.log does not take indexes'],
        ['Linha 2: i deveria começar em 1', 'Line 2: i should start at 1'],
      ],
      answer: 1,
      explanation: [
        'Com <=, a última volta lê itens[3], que não existe.',
        'With <=, the last pass reads itens[3], which does not exist.',
      ],
    },
    {
      concept: ['Constantes', 'Constants'],
      prompt: [
        'Este código lança um erro na linha 2. Por quê?',
        'This code throws on line 2. Why?',
      ],
      snippet: 'const total = 10;\ntotal = total + 5;\nconsole.log(total);',
      options: [
        ['Linha 2: falta ponto e vírgula', 'Line 2: a semicolon is missing'],
        ['Linha 3: console.log deveria ser print', 'Line 3: console.log should be print'],
        ['Linha 2: + não soma números', 'Line 2: + does not add numbers'],
        ['Linha 1: use let para poder reatribuir', 'Line 1: use let so it can be reassigned'],
      ],
      answer: 3,
      explanation: [
        'const não pode receber outro valor; let permite reatribuição.',
        'A const cannot be given another value; let allows reassignment.',
      ],
    },
    {
      concept: ['Condicionais', 'Conditionals'],
      prompt: [
        'A função diz que todo mundo é maior de idade. Onde está o erro?',
        'The function says everyone is an adult. Where is the bug?',
      ],
      snippet:
        'function maiorDeIdade(idade) {\n  if (idade = 18) {\n    return true;\n  }\n  return false;\n}',
      options: [
        [
          'Linha 2: = atribui; compare com idade >= 18',
          'Line 2: = assigns; compare with idade >= 18',
        ],
        ['Linha 1: function precisa de tipo de retorno', 'Line 1: function needs a return type'],
        ['Linha 3: return true deveria ser return 1', 'Line 3: return true should be return 1'],
        ['Linha 5: falta um else', 'Line 5: an else is missing'],
      ],
      answer: 0,
      explanation: [
        'idade = 18 guarda 18 e vale como verdadeiro; a comparação certa é >=.',
        'idade = 18 stores 18 and counts as true; the right comparison is >=.',
      ],
    },
    {
      concept: ['Promises', 'Promises'],
      prompt: [
        'resposta.json() falha com "não é uma função". Por quê?',
        'resposta.json() fails with "is not a function". Why?',
      ],
      snippet:
        "async function carregar() {\n  const resposta = fetch('/api/dados');\n  const dados = await resposta.json();\n  return dados;\n}",
      options: [
        ['Linha 1: async não pode ter return', 'Line 1: async cannot have return'],
        ['Linha 3: json() não existe', 'Line 3: json() does not exist'],
        ['Linha 2: falta await antes de fetch', 'Line 2: await is missing before fetch'],
        ['Linha 4: return deveria ser yield', 'Line 4: return should be yield'],
      ],
      answer: 2,
      explanation: [
        'Sem await, resposta é a Promise, não a resposta do servidor.',
        'Without await, resposta is the Promise, not the server’s response.',
      ],
    },
  ],
  TS: [
    {
      concept: ['Retorno', 'Return values'],
      prompt: [
        'O compilador acusa erro nesta função. Por quê?',
        'The compiler rejects this function. Why?',
      ],
      snippet: 'function saudacao(nome: string): string {\n  console.log(`Olá, ${nome}`);\n}',
      options: [
        [
          'Template strings não funcionam em TypeScript',
          'Template strings do not work in TypeScript',
        ],
        [
          'Ela promete devolver string, mas não tem return',
          'It promises to return a string but has no return',
        ],
        ['nome deveria ser do tipo any', 'nome should be typed any'],
        ['console.log precisa de tipo', 'console.log needs a type'],
      ],
      answer: 1,
      explanation: [
        'O tipo de retorno string obriga a função a devolver um texto em todos os caminhos.',
        'The string return type forces the function to return text on every path.',
      ],
    },
    {
      concept: ['Tipos', 'Types'],
      prompt: ['Qual é o erro de tipo nesta linha?', 'What is the type error on this line?'],
      snippet: 'let idade: number = "20";',
      options: [
        ['let não aceita anotação de tipo', 'let does not accept a type annotation'],
        ['Faltam parênteses', 'Parentheses are missing'],
        ['"20" é texto, não number; use 20', '"20" is text, not a number; use 20'],
        ['number deveria ser Number', 'number should be Number'],
      ],
      answer: 2,
      explanation: [
        'Aspas fazem do valor uma string, que não é atribuível a number.',
        'Quotes make the value a string, which is not assignable to number.',
      ],
    },
    {
      concept: ['Narrowing', 'Narrowing'],
      prompt: [
        'O compilador reclama de u.email. Por quê?',
        'The compiler complains about u.email. Why?',
      ],
      snippet:
        "type Usuario = { nome: string; email?: string };\nfunction dominio(u: Usuario) {\n  return u.email.split('@')[1];\n}",
      options: [
        [
          'email é opcional e pode ser undefined; verifique antes',
          'email is optional and may be undefined; check it first',
        ],
        ['split não existe em string', 'split does not exist on string'],
        ['type deveria ser interface', 'type should be interface'],
        ['Faltou exportar o tipo', 'The type was not exported'],
      ],
      answer: 0,
      explanation: [
        'O ? torna email possivelmente undefined; use if, ?. ou um valor padrão.',
        'The ? makes email possibly undefined; use if, ?. or a default.',
      ],
    },
    {
      concept: ['Arrays', 'Arrays'],
      prompt: [
        'dobrados sai cheio de undefined. Onde está o erro?',
        'dobrados comes out full of undefined. Where is the bug?',
      ],
      snippet: 'const ids: number[] = [1, 2, 3];\nconst dobrados = ids.map((id) => { id * 2 });',
      options: [
        ['map só funciona com strings', 'map only works on strings'],
        ['number[] deveria ser Array<string>', 'number[] should be Array<string>'],
        ['Faltou const na arrow function', 'The arrow function is missing const'],
        [
          'Com chaves, a arrow precisa de return (ou tire as chaves)',
          'With braces the arrow needs return (or drop the braces)',
        ],
      ],
      answer: 3,
      explanation: [
        'Uma arrow com { } só devolve o que estiver em um return explícito.',
        'An arrow with { } only returns what an explicit return gives back.',
      ],
    },
  ],
  JAVA: [
    {
      concept: ['Igualdade', 'Equality'],
      prompt: ['"iguais" nunca é impresso. Por quê?', '"iguais" is never printed. Why?'],
      snippet:
        'String a = "oi";\nString b = new String("oi");\nif (a == b) {\n  System.out.println("iguais");\n}',
      options: [
        ['String não pode ser comparada', 'Strings cannot be compared'],
        ['Faltou ponto e vírgula no if', 'The if is missing a semicolon'],
        ['== compara referências; use a.equals(b)', '== compares references; use a.equals(b)'],
        ['new String é proibido em Java', 'new String is forbidden in Java'],
      ],
      answer: 2,
      explanation: [
        '== verifica se é o mesmo objeto; equals compara o conteúdo do texto.',
        '== checks it is the same object; equals compares the text content.',
      ],
    },
    {
      concept: ['Arrays', 'Arrays'],
      prompt: [
        'O programa termina com uma exceção. Onde está o erro?',
        'The program ends with an exception. Where is the bug?',
      ],
      snippet:
        'int[] notas = {7, 8, 9};\nfor (int i = 0; i <= notas.length; i++) {\n  System.out.println(notas[i]);\n}',
      options: [
        ['Linha 2: use i < notas.length', 'Line 2: use i < notas.length'],
        ['Linha 1: arrays usam colchetes no valor', 'Line 1: arrays use brackets in the value'],
        ['Linha 3: println não imprime números', 'Line 3: println does not print numbers'],
        ['Linha 2: i deveria ser long', 'Line 2: i should be a long'],
      ],
      answer: 0,
      explanation: [
        'O último índice é length - 1; ler notas[3] lança ArrayIndexOutOfBoundsException.',
        'The last index is length - 1; reading notas[3] throws ArrayIndexOutOfBoundsException.',
      ],
    },
    {
      concept: ['Operadores', 'Operators'],
      prompt: [
        'media(4, 6) devolve 7 em vez de 5. Por quê?',
        'media(4, 6) returns 7 instead of 5. Why?',
      ],
      snippet: 'public int media(int a, int b) {\n  return a + b / 2;\n}',
      options: [
        ['int não guarda resultados de divisão', 'int cannot hold division results'],
        [
          'A divisão vem antes da soma; use (a + b) / 2',
          'Division runs before addition; use (a + b) / 2',
        ],
        ['Faltou static no método', 'The method is missing static'],
        ['return não pode ter contas', 'return cannot contain arithmetic'],
      ],
      answer: 1,
      explanation: [
        'b / 2 é calculado primeiro: 4 + 3 = 7. Os parênteses somam antes de dividir.',
        'b / 2 runs first: 4 + 3 = 7. Parentheses add before dividing.',
      ],
    },
    {
      concept: ['Laços', 'Loops'],
      prompt: [
        'O programa nunca termina. Onde está o erro?',
        'The program never ends. Where is the bug?',
      ],
      snippet: 'int contador = 0;\nwhile (contador < 5) {\n  System.out.println(contador);\n}',
      options: [
        ['while precisa de um for dentro', 'while needs a for inside'],
        ['contador deveria começar em 5', 'contador should start at 5'],
        ['println trava o laço', 'println freezes the loop'],
        ['Falta contador++ dentro do laço', 'contador++ is missing inside the loop'],
      ],
      answer: 3,
      explanation: [
        'Sem incrementar, contador fica em 0 e a condição nunca vira falsa.',
        'Without incrementing, contador stays at 0 and the condition never turns false.',
      ],
    },
  ],
  GO: [
    {
      concept: ['Slices', 'Slices'],
      prompt: [
        'O programa entra em pânico. Onde está o erro?',
        'The program panics. Where is the bug?',
      ],
      snippet:
        'nums := []int{1, 2, 3}\nfor i := 0; i <= len(nums); i++ {\n    fmt.Println(nums[i])\n}',
      options: [
        ['Linha 1: slices usam colchetes duplos', 'Line 1: slices use double brackets'],
        ['Linha 3: Println não aceita int', 'Line 3: Println does not take an int'],
        ['Linha 2: use i < len(nums)', 'Line 2: use i < len(nums)'],
        ['Linha 2: i deveria ser var', 'Line 2: i should be var'],
      ],
      answer: 2,
      explanation: [
        'nums[3] está fora do slice: index out of range.',
        'nums[3] is outside the slice: index out of range.',
      ],
    },
    {
      concept: ['Funções', 'Functions'],
      prompt: ['Esta função não compila. Por quê?', 'This function does not compile. Why?'],
      snippet: 'func soma(a int, b int) int {\n    total := a + b\n}',
      options: [
        ['Falta return total', 'return total is missing'],
        ['Parâmetros precisam de var', 'Parameters need var'],
        [':= não funciona com inteiros', ':= does not work with integers'],
        ['Funções Go não devolvem int', 'Go functions cannot return int'],
      ],
      answer: 0,
      explanation: [
        'Uma função com tipo de retorno precisa terminar com return; e total sem uso também é erro.',
        'A function with a return type must end with return; an unused total is also an error.',
      ],
    },
    {
      concept: ['Variáveis', 'Variables'],
      prompt: ['A segunda linha não compila. Por quê?', 'The second line does not compile. Why?'],
      snippet: 'x := 5\nx := 10\nfmt.Println(x)',
      options: [
        ['x deveria ser string', 'x should be a string'],
        [
          ':= declara de novo; para mudar o valor use x = 10',
          ':= declares again; to change the value use x = 10',
        ],
        ['Println exige dois argumentos', 'Println needs two arguments'],
        ['Go não aceita números inteiros', 'Go does not accept integers'],
      ],
      answer: 1,
      explanation: [
        ':= só vale quando há uma variável nova à esquerda no mesmo escopo.',
        ':= only works when there is a new variable on the left in that scope.',
      ],
    },
    {
      concept: ['Erros', 'Errors'],
      prompt: ['O que está faltando neste código?', 'What is missing in this code?'],
      snippet: 'valor, err := strconv.Atoi("12a")\nfmt.Println(valor * 2)',
      options: [
        ['Atoi deveria ser Itoa', 'Atoi should be Itoa'],
        ['Multiplicar por 2 exige float', 'Multiplying by 2 needs a float'],
        ['Faltam aspas em valor', 'valor needs quotes'],
        [
          'Verificar err: a conversão falha e Go recusa variável não usada',
          'Checking err: the conversion fails and Go rejects unused variables',
        ],
      ],
      answer: 3,
      explanation: [
        '"12a" não é número; trate if err != nil antes de usar valor.',
        '"12a" is not a number; handle if err != nil before using valor.',
      ],
    },
  ],
  RUST: [
    {
      concept: ['Mutabilidade', 'Mutability'],
      prompt: ['A linha 2 não compila. Por quê?', 'Line 2 does not compile. Why?'],
      snippet: 'let contador = 0;\ncontador += 1;\nprintln!("{}", contador);',
      options: [
        ['+= não existe em Rust', '+= does not exist in Rust'],
        ['println! precisa de dois {}', 'println! needs two {}'],
        ['Use let mut contador para poder alterar', 'Use let mut contador so it can change'],
        ['contador deveria ser String', 'contador should be a String'],
      ],
      answer: 2,
      explanation: [
        'Variáveis são imutáveis por padrão; mut permite alterar o valor.',
        'Variables are immutable by default; mut lets the value change.',
      ],
    },
    {
      concept: ['Ownership', 'Ownership'],
      prompt: [
        'O compilador recusa usar nome na linha 3. Por quê?',
        'The compiler refuses nome on line 3. Why?',
      ],
      snippet: 'let nome = String::from("Ana");\nlet outro = nome;\nprintln!("{}", nome);',
      options: [
        [
          'nome foi movido para outro; use nome.clone() ou &nome',
          'nome moved into outro; use nome.clone() or &nome',
        ],
        ['String::from não existe', 'String::from does not exist'],
        ['println! não imprime String', 'println! cannot print a String'],
        ['Faltou mut em outro', 'outro is missing mut'],
      ],
      answer: 0,
      explanation: [
        'Atribuir uma String transfere a posse; a variável antiga não pode mais ser usada.',
        'Assigning a String transfers ownership; the old variable can no longer be used.',
      ],
    },
    {
      concept: ['Expressões', 'Expressions'],
      prompt: [
        'Esta função não compila. Onde está o erro?',
        'This function does not compile. Where is the bug?',
      ],
      snippet: 'fn dobro(x: i32) -> i32 {\n    x * 2;\n}',
      options: [
        ['i32 não aceita multiplicação', 'i32 does not support multiplication'],
        [
          'O ; transforma o valor em instrução; tire-o para devolver x * 2',
          'The ; turns the value into a statement; drop it to return x * 2',
        ],
        ['fn deveria ser func', 'fn should be func'],
        ['Faltou return type', 'The return type is missing'],
      ],
      answer: 1,
      explanation: [
        'A última expressão sem ponto e vírgula é o valor devolvido pela função.',
        'The last expression without a semicolon is the function’s return value.',
      ],
    },
    {
      concept: ['Vetores', 'Vectors'],
      prompt: ['O programa entra em pânico. Por quê?', 'The program panics. Why?'],
      snippet: 'let v = vec![1, 2, 3];\nprintln!("{}", v[3]);',
      options: [
        ['vec! cria um texto', 'vec! creates a string'],
        ['println! não imprime números', 'println! cannot print numbers'],
        ['Faltou mut em v', 'v is missing mut'],
        [
          'O índice 3 não existe; o último é 2 (ou use v.get(3))',
          'Index 3 does not exist; the last one is 2 (or use v.get(3))',
        ],
      ],
      answer: 3,
      explanation: [
        'Índices começam em 0; acessar fora do vetor com [] gera pânico.',
        'Indexes start at 0; reading past the vector with [] panics.',
      ],
    },
  ],
  HTML: [
    {
      concept: ['Imagens', 'Images'],
      prompt: ['O que falta nesta imagem?', 'What is this image missing?'],
      snippet: '<img src="gato.png">',
      options: [
        ['Uma tag de fechamento </img>', 'A closing </img> tag'],
        ['O atributo alt descrevendo a imagem', 'The alt attribute describing the image'],
        ['O atributo href', 'The href attribute'],
        ['Aspas simples no src', 'Single quotes on src'],
      ],
      answer: 1,
      explanation: [
        'alt é o texto lido por leitores de tela e mostrado se a imagem não carregar.',
        'alt is what screen readers read and what shows if the image fails to load.',
      ],
    },
    {
      concept: ['Formulários', 'Forms'],
      prompt: [
        'Clicar em "Email" não foca o campo. Onde está o erro?',
        'Clicking "Email" does not focus the field. Where is the bug?',
      ],
      snippet: '<label>Email</label>\n<input type="email" id="email">',
      options: [
        ['type="email" não existe', 'type="email" does not exist'],
        ['input precisa fechar com </input>', 'input must close with </input>'],
        [
          'O label não está ligado ao campo: use for="email"',
          'The label is not tied to the field: use for="email"',
        ],
        ['id não pode ser email', 'id cannot be email'],
      ],
      answer: 2,
      explanation: [
        'for no label precisa apontar para o id do input para os dois ficarem ligados.',
        'The label’s for must point at the input’s id to tie them together.',
      ],
    },
    {
      concept: ['Listas', 'Lists'],
      prompt: ['Qual item desta lista está errado?', 'Which item of this list is wrong?'],
      snippet: '<ul>\n  <li>Maçã</li>\n  <p>Banana</p>\n</ul>',
      options: [
        [
          'Linha 3: dentro de <ul> cada item deve ser <li>',
          'Line 3: inside <ul> each item must be <li>',
        ],
        ['Linha 1: <ul> deveria ser <list>', 'Line 1: <ul> should be <list>'],
        ['Linha 2: <li> não aceita texto', 'Line 2: <li> cannot hold text'],
        ['Linha 4: </ul> é opcional e deve sair', 'Line 4: </ul> is optional and must go'],
      ],
      answer: 0,
      explanation: [
        'Listas só aceitam <li> como filhos diretos.',
        'Lists only accept <li> as direct children.',
      ],
    },
    {
      concept: ['Semântica', 'Semantics'],
      prompt: ['O que está errado neste link?', 'What is wrong with this link?'],
      snippet: '<a href="perfil.html"><button>Perfil</button></a>',
      options: [
        ['href não aceita arquivos .html', 'href does not accept .html files'],
        ['Faltou target="_blank"', 'target="_blank" is missing'],
        ['<a> não pode ter texto', '<a> cannot hold text'],
        [
          'Um botão dentro de um link é interativo dentro de interativo; estilize o próprio <a>',
          'A button inside a link nests interactive elements; style the <a> itself',
        ],
      ],
      answer: 3,
      explanation: [
        'Elementos interativos não podem ficar um dentro do outro; teclado e leitores de tela se confundem.',
        'Interactive elements must not nest; keyboards and screen readers get confused.',
      ],
    },
  ],
  CSS: [
    {
      concept: ['Sintaxe', 'Syntax'],
      prompt: ['O padding não é aplicado. Por quê?', 'The padding is not applied. Why?'],
      snippet: '.card {\n  color: #333\n  padding: 16px;\n}',
      options: [
        ['padding não funciona em classes', 'padding does not work on classes'],
        ['#333 não é uma cor', '#333 is not a colour'],
        [
          'Falta ; depois de color: #333, e a declaração seguinte é ignorada',
          'A ; is missing after color: #333, so the next declaration is ignored',
        ],
        ['.card deveria ser #card', '.card should be #card'],
      ],
      answer: 2,
      explanation: [
        'Sem o ponto e vírgula, o navegador lê as duas linhas como um valor inválido.',
        'Without the semicolon, the browser reads both lines as one invalid value.',
      ],
    },
    {
      concept: ['Flexbox', 'Flexbox'],
      prompt: [
        'Os itens não centralizam. O que falta?',
        'The items do not centre. What is missing?',
      ],
      snippet: '.menu {\n  justify-content: center;\n}',
      options: [
        ['display: flex no .menu', 'display: flex on .menu'],
        ['text-align: left', 'text-align: left'],
        ['position: absolute', 'position: absolute'],
        ['justify-content deveria ser justify', 'justify-content should be justify'],
      ],
      answer: 0,
      explanation: [
        'justify-content só age em contêineres flex ou grid.',
        'justify-content only works on flex or grid containers.',
      ],
    },
    {
      concept: ['Especificidade', 'Specificity'],
      prompt: [
        '<h1 id="titulo" class="titulo"> deveria ficar azul, mas fica vermelho. Por quê?',
        '<h1 id="titulo" class="titulo"> should be blue but stays red. Why?',
      ],
      snippet: '#titulo { color: red; }\n.titulo { color: blue; }',
      options: [
        ['A regra que vem depois sempre perde', 'The later rule always loses'],
        ['blue não é uma cor válida', 'blue is not a valid colour'],
        ['Classes não funcionam em h1', 'Classes do not work on h1'],
        [
          'Seletor de id é mais específico que o de classe',
          'An id selector is more specific than a class',
        ],
      ],
      answer: 3,
      explanation: [
        'Especificidade vence a ordem: #id ganha de .classe mesmo vindo antes.',
        'Specificity beats order: #id wins over .class even when it comes first.',
      ],
    },
    {
      concept: ['Box model', 'Box model'],
      prompt: [
        'A caixa passa da largura da tela. Qual é a correção?',
        'The box overflows the screen width. What is the fix?',
      ],
      snippet: '.box {\n  width: 100%;\n  padding: 20px;\n}',
      options: [
        ['Trocar padding por margin', 'Swap padding for margin'],
        [
          'box-sizing: border-box, para o padding entrar nos 100%',
          'box-sizing: border-box, so the padding fits inside the 100%',
        ],
        ['width: 120%', 'width: 120%'],
        ['Remover o width', 'Remove the width'],
      ],
      answer: 1,
      explanation: [
        'Por padrão o padding soma à largura; border-box inclui o padding nos 100%.',
        'By default padding adds to the width; border-box keeps it inside the 100%.',
      ],
    },
  ],
};

const pt = (text: string | Text) => (typeof text === 'string' ? text : text[0]);
const build = (
  entry: Entry,
  id: string,
  language: BattleLanguage,
  kind: QuizKind,
  difficulty: string
): Quiz => ({
  id,
  kind,
  language,
  concept: pt(entry.concept),
  prompt: pt(entry.prompt),
  options: entry.options.map(pt),
  answer: entry.answer,
  explanation: pt(entry.explanation),
  difficulty,
  ...(entry.snippet ? { snippet: entry.snippet } : {}),
});

export const QUIZZES: Quiz[] = [
  ...QUESTIONS.map((q) => ({ ...q, kind: 'concept' as const })),
  ...PROGRAMMING.flatMap((language) =>
    GENERAL.map((entry, i) => build(entry, `gen-${i}-${language}`, language, 'concept', 'Fácil'))
  ),
  ...(['HTML', 'CSS'] as const).flatMap((language) =>
    WEB.map((entry, i) => build(entry, `web-${i}-${language}`, language, 'concept', 'Fácil'))
  ),
  ...Object.entries(BUGS).flatMap(([language, entries]) =>
    entries.map((entry, i) =>
      build(entry, `bug-${language}-${i}`, language as BattleLanguage, 'bug', 'Intermediário')
    )
  ),
];

export function quizPool(language: BattleLanguage, kind: QuizKind) {
  return QUIZZES.filter((q) => q.language === language && q.kind === kind);
}

export function findQuiz(id: string | null | undefined) {
  return id ? QUIZZES.find((q) => q.id === id) : undefined;
}

/** What the client may see: no answer, no explanation. */
export function publicQuiz(q: Quiz): PublicQuestion {
  return {
    id: q.id,
    kind: q.kind,
    concept: q.concept,
    prompt: q.prompt,
    options: q.options,
    difficulty: q.difficulty,
    ...(q.snippet ? { snippet: q.snippet } : {}),
  };
}

/** English copy for the new quizzes, merged into the server translator. */
export const QUIZ_EN: Record<string, string> = Object.fromEntries(
  [...GENERAL, ...WEB, ...Object.values(BUGS).flat()].flatMap((entry) =>
    [entry.concept, entry.prompt, entry.explanation, ...entry.options]
      .filter((text): text is Text => typeof text !== 'string')
      .map(([ptText, en]) => [ptText, en])
  )
);

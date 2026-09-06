import { defineLesson, type LearningCourse, type LearningLesson } from './catalog-types';

type Language = 'JS' | 'TS' | 'PYTHON' | 'GO' | 'RUST' | 'JAVA';
type Programs = Record<Exclude<Language, 'TS'>, string>;
interface Topic {
  slug: string;
  title: string;
  unit: number;
  objective: string;
  explanation: string;
  example: Programs;
  output: string;
  task: string;
  solution: Programs;
  expected: string;
  kind?: 'project';
  skills: string[];
}
const programs = (
  JS: string,
  PYTHON: string,
  GO: string,
  RUST: string,
  JAVA: string
): Programs => ({ JS, PYTHON, GO, RUST, JAVA });
export function wrapProgram(code: string, language: string) {
  if (language === 'GO') return `package main\nimport "fmt"\nfunc main() {\n${code}\n}`;
  if (language === 'RUST') return `fn main() {\n${code}\n}`;
  if (language === 'JAVA')
    return `class Main { public static void main(String[] args) {\n${code}\n} }`;
  return code;
}
const TOPICS: Topic[] = [
  {
    slug: 'first-output',
    title: 'Seu primeiro programa',
    unit: 1,
    skills: ['execução', 'saída'],
    objective: 'Executar instruções em ordem e observar a saída.',
    explanation:
      'Um programa é uma sequência de instruções. O comando de saída mostra texto no console. Aspas delimitam texto e não aparecem na saída. Execute o exemplo: cada chamada escreve uma linha. O código ao redor do comando, em Go, Rust e Java, é a estrutura de entrada do programa; ela já vem pronta.',
    example: programs(
      'console.log("Olá!");',
      'print("Olá!")',
      'fmt.Println("Olá!")',
      'println!("Olá!");',
      'System.out.println("Olá!");'
    ),
    output: 'Olá!',
    task: 'Seu primeiro cartão de visita: escreva duas linhas, na ordem: Stacklyst e Meu primeiro programa. Use dois comandos de saída.',
    solution: programs(
      'console.log("Stacklyst");\nconsole.log("Meu primeiro programa");',
      'print("Stacklyst")\nprint("Meu primeiro programa")',
      'fmt.Println("Stacklyst")\nfmt.Println("Meu primeiro programa")',
      'println!("Stacklyst");\nprintln!("Meu primeiro programa");',
      'System.out.println("Stacklyst");\nSystem.out.println("Meu primeiro programa");'
    ),
    expected: 'Stacklyst\nMeu primeiro programa',
  },
  {
    slug: 'values',
    title: 'Textos, números e operações',
    unit: 1,
    skills: ['valores', 'tipos', 'aritmética'],
    objective: 'Distinguir texto literal de uma expressão numérica.',
    explanation:
      'Um número sem aspas participa de cálculos. Um texto entre aspas é exibido literalmente. Multiplicação usa * e acontece antes de soma; parênteses mudam a ordem. Primeiro calcule a expressão, depois o comando de saída apresenta o resultado.',
    example: programs(
      'console.log(2 + 3 * 4);',
      'print(2 + 3 * 4)',
      'fmt.Println(2 + 3 * 4)',
      'println!("{}", 2 + 3 * 4);',
      'System.out.println(2 + 3 * 4);'
    ),
    output: '14',
    task: 'Uma oficina tem 3 caixas com 8 peças e usa 5 peças. Calcule e imprima quantas restam, usando uma expressão aritmética.',
    solution: programs(
      'console.log(3 * 8 - 5);',
      'print(3 * 8 - 5)',
      'fmt.Println(3 * 8 - 5)',
      'println!("{}", 3 * 8 - 5);',
      'System.out.println(3 * 8 - 5);'
    ),
    expected: '19',
  },
  {
    slug: 'variables',
    title: 'Guardar e atualizar valores',
    unit: 1,
    skills: ['variáveis', 'atribuição'],
    objective: 'Representar uma quantidade que muda ao longo do programa.',
    explanation:
      'Uma variável dá nome a um valor. Atribuir novamente substitui o valor anterior. Leia o lado direito antes de atualizar o lado esquerdo: saldo = saldo + 3 usa o saldo antigo. Em Rust, mut permite essa mudança; em JS e TS, let permite reatribuição.',
    example: programs(
      'let saldo = 7;\nsaldo = saldo + 3;\nconsole.log(saldo);',
      'saldo = 7\nsaldo = saldo + 3\nprint(saldo)',
      'saldo := 7\nsaldo = saldo + 3\nfmt.Println(saldo)',
      'let mut saldo = 7;\nsaldo = saldo + 3;\nprintln!("{}", saldo);',
      'int saldo = 7;\nsaldo = saldo + 3;\nSystem.out.println(saldo);'
    ),
    output: '10',
    task: 'Mini projeto: recibo. Guarde preco = 12, quantidade = 3 e pago = 50. Calcule total e troco em variáveis. Imprima total e troco, uma linha para cada.',
    solution: programs(
      'const preco = 12, quantidade = 3, pago = 50;\nconst total = preco * quantidade;\nconst troco = pago - total;\nconsole.log(total);\nconsole.log(troco);',
      'preco = 12\nquantidade = 3\npago = 50\ntotal = preco * quantidade\ntroco = pago - total\nprint(total)\nprint(troco)',
      'preco, quantidade, pago := 12, 3, 50\ntotal := preco * quantidade\ntroco := pago - total\nfmt.Println(total)\nfmt.Println(troco)',
      'let preco = 12; let quantidade = 3; let pago = 50;\nlet total = preco * quantidade;\nlet troco = pago - total;\nprintln!("{}", total);\nprintln!("{}", troco);',
      'int preco = 12, quantidade = 3, pago = 50;\nint total = preco * quantidade;\nint troco = pago - total;\nSystem.out.println(total);\nSystem.out.println(troco);'
    ),
    expected: '36\n14',
    kind: 'project',
  },
  {
    slug: 'booleans',
    title: 'Comparar antes de decidir',
    unit: 2,
    skills: ['booleanos', 'comparação'],
    objective: 'Avaliar uma condição e distinguir limites inclusivos.',
    explanation:
      'Uma comparação produz verdadeiro ou falso. >= inclui o limite; > não inclui. Um booleano guarda o resultado dessa comparação. Python escreve True e False; as outras linguagens usam true e false. O próximo passo usará esse resultado para escolher uma ação.',
    example: programs(
      'const podeEntrar = 18 >= 18;\nconsole.log(podeEntrar);',
      'pode_entrar = 18 >= 18\nprint(pode_entrar)',
      'podeEntrar := 18 >= 18\nfmt.Println(podeEntrar)',
      'let pode_entrar = 18 >= 18;\nprintln!("{}", pode_entrar);',
      'boolean podeEntrar = 18 >= 18;\nSystem.out.println(podeEntrar);'
    ),
    output: 'true',
    task: 'Compare uma compra de 49 com o mínimo de 50 para frete grátis. Imprima o resultado booleano. O limite de 50 deve estar incluído.',
    solution: programs(
      'console.log(49 >= 50);',
      'print(49 >= 50)',
      'fmt.Println(49 >= 50)',
      'println!("{}", 49 >= 50);',
      'System.out.println(49 >= 50);'
    ),
    expected: 'false',
  },
  {
    slug: 'decisions',
    title: 'Escolher caminhos com if',
    unit: 2,
    skills: ['condicionais'],
    objective: 'Executar apenas o bloco correspondente à condição.',
    explanation:
      'if executa um bloco quando a condição é verdadeira; else trata o caso contrário. Python delimita blocos por indentação, enquanto as demais linguagens usam chaves. Não basta calcular uma comparação: agora ela escolhe o comportamento do programa.',
    example: programs(
      'const estoque = 0;\nif (estoque > 0) { console.log("disponível"); } else { console.log("esgotado"); }',
      'estoque = 0\nif estoque > 0:\n    print("disponível")\nelse:\n    print("esgotado")',
      'estoque := 0\nif estoque > 0 { fmt.Println("disponível") } else { fmt.Println("esgotado") }',
      'let estoque = 0;\nif estoque > 0 { println!("disponível"); } else { println!("esgotado"); }',
      'int estoque = 0;\nif (estoque > 0) { System.out.println("disponível"); } else { System.out.println("esgotado"); }'
    ),
    output: 'esgotado',
    task: 'Evolua o recibo: total = 36 e pago = 30. Se pago for menor que total, imprima pagamento insuficiente. Caso contrário, imprima o troco.',
    solution: programs(
      'const total = 36, pago = 30;\nif (pago < total) console.log("pagamento insuficiente"); else console.log(pago - total);',
      'total = 36\npago = 30\nif pago < total:\n    print("pagamento insuficiente")\nelse:\n    print(pago - total)',
      'total, pago := 36, 30\nif pago < total { fmt.Println("pagamento insuficiente") } else { fmt.Println(pago-total) }',
      'let total = 36; let pago = 30;\nif pago < total { println!("pagamento insuficiente"); } else { println!("{}", pago-total); }',
      'int total = 36, pago = 30;\nif (pago < total) System.out.println("pagamento insuficiente"); else System.out.println(pago-total);'
    ),
    expected: 'pagamento insuficiente',
  },
  {
    slug: 'loops',
    title: 'Repetir sem copiar instruções',
    unit: 2,
    skills: ['repetições', 'limites'],
    objective: 'Controlar início, condição e atualização de uma repetição.',
    explanation:
      'Um laço repete instruções. Observe o início, o limite e a atualização: se a variável de controle nunca muda, o laço pode não terminar. range(1, 4) em Python e 1..4 em Rust excluem o limite final, produzindo 1, 2 e 3.',
    example: programs(
      'for (let i = 1; i < 4; i++) console.log(i);',
      'for i in range(1, 4):\n    print(i)',
      'for i := 1; i < 4; i++ { fmt.Println(i) }',
      'for i in 1..4 { println!("{}", i); }',
      'for (int i = 1; i < 4; i++) System.out.println(i);'
    ),
    output: '1\n2\n3',
    task: 'Faça uma contagem regressiva de 3 até 1 e depois imprima Partiu!. Não repita manualmente o comando que mostra o número.',
    solution: programs(
      'for (let i = 3; i >= 1; i--) console.log(i);\nconsole.log("Partiu!");',
      'for i in range(3, 0, -1):\n    print(i)\nprint("Partiu!")',
      'for i := 3; i >= 1; i-- { fmt.Println(i) }\nfmt.Println("Partiu!")',
      'for i in (1..=3).rev() { println!("{}", i); }\nprintln!("Partiu!");',
      'for (int i = 3; i >= 1; i--) System.out.println(i);\nSystem.out.println("Partiu!");'
    ),
    expected: '3\n2\n1\nPartiu!',
  },
  {
    slug: 'accumulator',
    title: 'Projeto: meta de economia',
    unit: 2,
    skills: ['acumulador', 'decomposição'],
    objective: 'Combinar estado, repetição e condição em uma simulação.',
    explanation:
      'Um acumulador guarda o resultado parcial. Inicialize fora do laço para não perder o valor a cada rodada. Um problema pode ser dividido em estado inicial, atualização por rodada e condição de parada. Simule no papel duas rodadas antes de executar.',
    example: programs(
      'let total = 0;\nfor (let dia = 1; dia <= 3; dia++) total = total + dia;\nconsole.log(total);',
      'total = 0\nfor dia in range(1, 4):\n    total = total + dia\nprint(total)',
      'total := 0\nfor dia := 1; dia <= 3; dia++ { total += dia }\nfmt.Println(total)',
      'let mut total = 0;\nfor dia in 1..=3 { total += dia; }\nprintln!("{}", total);',
      'int total = 0;\nfor (int dia = 1; dia <= 3; dia++) total += dia;\nSystem.out.println(total);'
    ),
    output: '6',
    task: 'Partindo de 0, guarde 7 moedas por dia até alcançar pelo menos 30. Imprima o número de dias e o saldo final em linhas separadas. Use um laço que pare ao atingir a meta.',
    solution: programs(
      'let dias = 0, saldo = 0;\nwhile (saldo < 30) { saldo += 7; dias++; }\nconsole.log(dias);\nconsole.log(saldo);',
      'dias = 0\nsaldo = 0\nwhile saldo < 30:\n    saldo += 7\n    dias += 1\nprint(dias)\nprint(saldo)',
      'dias, saldo := 0, 0\nfor saldo < 30 { saldo += 7; dias++ }\nfmt.Println(dias)\nfmt.Println(saldo)',
      'let mut dias = 0; let mut saldo = 0;\nwhile saldo < 30 { saldo += 7; dias += 1; }\nprintln!("{}", dias);\nprintln!("{}", saldo);',
      'int dias = 0, saldo = 0;\nwhile (saldo < 30) { saldo += 7; dias++; }\nSystem.out.println(dias);\nSystem.out.println(saldo);'
    ),
    expected: '5\n35',
    kind: 'project',
  },
  {
    slug: 'functions',
    title: 'Funções, parâmetros e retorno',
    unit: 3,
    skills: ['funções', 'parâmetros', 'retorno'],
    objective: 'Separar um cálculo reutilizável da apresentação.',
    explanation:
      'Uma função nomeia uma tarefa. Parâmetros recebem valores na chamada; return devolve um resultado. Retornar não é imprimir: quem chama decide como usar o resultado. Nas linguagens com tipos explícitos, a assinatura informa tipos de entrada e saída. A estrutura completa do exemplo mostra onde declarar e chamar.',
    example: programs(
      'function dobro(n) { return n * 2; }\nconsole.log(dobro(4) + 1);',
      'def dobro(n):\n    return n * 2\nprint(dobro(4) + 1)',
      'package main\nimport "fmt"\nfunc dobro(n int) int { return n*2 }\nfunc main() { fmt.Println(dobro(4)+1) }',
      'fn dobro(n: i32) -> i32 { n*2 }\nfn main() { println!("{}", dobro(4)+1); }',
      'class Main { static int dobro(int n) { return n*2; } public static void main(String[] args) { System.out.println(dobro(4)+1); } }'
    ),
    output: '9',
    task: 'Crie total(preco, quantidade), que retorna o produto. Imprima total(6, 4), total(8, 0) e total(3, 2), nesta ordem. A função não deve imprimir; deixe a apresentação nas chamadas.',
    solution: programs(
      'function total(preco, quantidade) { return preco * quantidade; }\nconsole.log(total(6,4));\nconsole.log(total(8,0));\nconsole.log(total(3,2));',
      'def total(preco, quantidade):\n    return preco * quantidade\nprint(total(6,4))\nprint(total(8,0))\nprint(total(3,2))',
      'package main\nimport "fmt"\nfunc total(preco, quantidade int) int { return preco*quantidade }\nfunc main() { fmt.Println(total(6,4)); fmt.Println(total(8,0)); fmt.Println(total(3,2)) }',
      'fn total(preco:i32, quantidade:i32)->i32 { preco*quantidade }\nfn main() { println!("{}",total(6,4)); println!("{}",total(8,0)); println!("{}",total(3,2)); }',
      'class Main { static int total(int preco,int quantidade) { return preco*quantidade; } public static void main(String[] args) { System.out.println(total(6,4)); System.out.println(total(8,0)); System.out.println(total(3,2)); } }'
    ),
    expected: '24\n0\n6',
  },
  {
    slug: 'strings',
    title: 'Ler e transformar textos',
    unit: 3,
    skills: ['strings', 'métodos'],
    objective: 'Tratar espaços e normalizar uma entrada textual.',
    explanation:
      'Strings representam texto. Métodos são operações chamadas sobre um valor. trim (strip em Python) remove espaços nas pontas, preservando espaços internos. Converter para minúsculas produz uma versão adequada para comparar etiquetas. Os exemplos usam texto ASCII; tamanho em bytes e caracteres Unicode pode diferir entre linguagens.',
    example: programs(
      'console.log("  OLA  ".trim().toLowerCase());',
      'print("  OLA  ".strip().lower())',
      'fmt.Println("ola") // strings.TrimSpace e strings.ToLower exigem importar strings',
      'println!("{}", "  OLA  ".trim().to_lowercase());',
      'System.out.println("  OLA  ".trim().toLowerCase());'
    ),
    output: 'ola',
    task: 'Normalize a etiqueta "  MEU PROJETO  ": retire espaços das pontas, transforme em minúsculas e preserve o espaço entre as palavras. Imprima o resultado.',
    solution: programs(
      'console.log("  MEU PROJETO  ".trim().toLowerCase());',
      'print("  MEU PROJETO  ".strip().lower())',
      'package main\nimport ("fmt"; "strings")\nfunc main() { fmt.Println(strings.ToLower(strings.TrimSpace("  MEU PROJETO  "))) }',
      'println!("{}", "  MEU PROJETO  ".trim().to_lowercase());',
      'System.out.println("  MEU PROJETO  ".trim().toLowerCase());'
    ),
    expected: 'meu projeto',
  },
  {
    slug: 'collections',
    title: 'Coleções e índices',
    unit: 3,
    skills: ['arrays', 'listas', 'índices'],
    objective: 'Percorrer uma coleção e selecionar dados por uma regra.',
    explanation:
      'Uma coleção reúne valores. O primeiro índice é zero. Um laço visita cada elemento, sem conhecer antecipadamente quantos são. JS/TS usam arrays, Python listas, Go slices e Rust vetores/arrays; Java usa arrays neste exemplo. Combine o laço com if para selecionar valores.',
    example: programs(
      'const notas = [4, 7, 9];\nconsole.log(notas[1]);',
      'notas = [4,7,9]\nprint(notas[1])',
      'notas := []int{4,7,9}\nfmt.Println(notas[1])',
      'let notas = [4,7,9];\nprintln!("{}", notas[1]);',
      'int[] notas = {4,7,9};\nSystem.out.println(notas[1]);'
    ),
    output: '7',
    task: 'Percorra [4, 7, 9, 2, 6] e imprima apenas as notas maiores ou iguais a 6, preservando a ordem. Não use índices fixos para selecionar as aprovadas.',
    solution: programs(
      'for (const nota of [4,7,9,2,6]) { if (nota >= 6) console.log(nota); }',
      'for nota in [4,7,9,2,6]:\n    if nota >= 6:\n        print(nota)',
      'for _, nota := range []int{4,7,9,2,6} { if nota >= 6 { fmt.Println(nota) } }',
      'for nota in [4,7,9,2,6] { if nota >= 6 { println!("{}", nota); } }',
      'for (int nota : new int[]{4,7,9,2,6}) { if (nota >= 6) System.out.println(nota); }'
    ),
    expected: '7\n9\n6',
  },
  {
    slug: 'records',
    title: 'Registros com campos nomeados',
    unit: 4,
    skills: ['objetos', 'registros', 'modelagem'],
    objective: 'Manter juntos dados que descrevem a mesma entidade.',
    explanation:
      'Um registro agrupa campos nomeados, como nome e quantidade. JS/TS usam objetos; Python usa dicionários; Go e Rust usam structs; Java pode usar uma classe. O exemplo declara a estrutura completa e acessa o campo quantidade. Leia a sintaxe da sua linguagem antes da prática.',
    example: programs(
      'const item = { nome: "livro", quantidade: 2 };\nconsole.log(item.quantidade);',
      'item = {"nome":"livro", "quantidade":2}\nprint(item["quantidade"])',
      'type Item struct { Nome string; Quantidade int }\nitem := Item{Nome:"livro", Quantidade:2}\nfmt.Println(item.Quantidade)',
      'struct Item { quantidade: i32 }\nlet item = Item { quantidade: 2 };\nprintln!("{}", item.quantidade);',
      'class Item { int quantidade = 2; }\nItem item = new Item();\nSystem.out.println(item.quantidade);'
    ),
    output: '2',
    task: 'Modele um item com preco = 9 e quantidade = 4. Calcule o subtotal acessando os dois campos do registro e imprima o resultado.',
    solution: programs(
      'const item = { preco:9, quantidade:4 };\nconsole.log(item.preco * item.quantidade);',
      'item = {"preco":9,"quantidade":4}\nprint(item["preco"] * item["quantidade"])',
      'type Item struct { Preco int; Quantidade int }\nitem := Item{Preco:9, Quantidade:4}\nfmt.Println(item.Preco*item.Quantidade)',
      'struct Item { preco:i32, quantidade:i32 }\nlet item = Item { preco:9, quantidade:4 };\nprintln!("{}",item.preco*item.quantidade);',
      'class Item { int preco = 9; int quantidade = 4; }\nItem item = new Item();\nSystem.out.println(item.preco*item.quantidade);'
    ),
    expected: '36',
  },
  {
    slug: 'debug',
    title: 'Depurar e conferir casos-limite',
    unit: 4,
    skills: ['depuração', 'testes'],
    objective: 'Encontrar um erro de limite usando uma expectativa verificável.',
    explanation:
      'Um teste compara um resultado observado a uma expectativa. Casos no limite costumam revelar erros: se a regra inclui 6, teste 5, 6 e 7. Depurar é localizar onde o comportamento diverge, corrigir a causa e executar novamente os casos, sem trocar a saída manualmente.',
    example: programs(
      'let aprovados = 0;\nfor (const n of [5,6,7]) if (n > 6) aprovados++;\nconsole.log(aprovados);',
      'aprovados = 0\nfor n in [5,6,7]:\n    if n > 6:\n        aprovados += 1\nprint(aprovados)',
      'aprovados := 0\nfor _, n := range []int{5,6,7} { if n > 6 { aprovados++ } }\nfmt.Println(aprovados)',
      'let mut aprovados = 0;\nfor n in [5,6,7] { if n > 6 { aprovados += 1; } }\nprintln!("{}",aprovados);',
      'int aprovados = 0;\nfor (int n : new int[]{5,6,7}) if(n > 6) aprovados++;\nSystem.out.println(aprovados);'
    ),
    output: '1',
    task: 'Corrija o código inicial: nota 6 também aprova. Mantenha a coleção [5,6,7] e imprima a quantidade correta de aprovados. Depois confira manualmente os três casos.',
    solution: programs(
      'let aprovados = 0;\nfor (const n of [5,6,7]) if (n >= 6) aprovados++;\nconsole.log(aprovados);',
      'aprovados = 0\nfor n in [5,6,7]:\n    if n >= 6:\n        aprovados += 1\nprint(aprovados)',
      'aprovados := 0\nfor _, n := range []int{5,6,7} { if n >= 6 { aprovados++ } }\nfmt.Println(aprovados)',
      'let mut aprovados = 0;\nfor n in [5,6,7] { if n >= 6 { aprovados += 1; } }\nprintln!("{}",aprovados);',
      'int aprovados = 0;\nfor (int n : new int[]{5,6,7}) if(n >= 6) aprovados++;\nSystem.out.println(aprovados);'
    ),
    expected: '2',
  },
  {
    slug: 'receipt-project',
    title: 'Projeto: fechamento da loja',
    unit: 4,
    skills: ['projeto', 'decomposição', 'integração'],
    objective: 'Combinar coleções, acumuladores e condições em um relatório.',
    explanation:
      'Evolua o recibo da primeira unidade para várias vendas. Separe o trabalho em ler dados, somar apenas valores válidos e apresentar o resultado. Uma venda negativa representa um registro inválido neste contrato. Use um acumulador para o total e outro para a quantidade; teste uma coleção vazia antes de finalizar.',
    example: programs(
      'let total = 0;\nfor (const valor of [2,3]) total += valor;\nconsole.log(total);',
      'total = 0\nfor valor in [2,3]:\n    total += valor\nprint(total)',
      'total := 0\nfor _, valor := range []int{2,3} { total += valor }\nfmt.Println(total)',
      'let mut total = 0;\nfor valor in [2,3] { total += valor; }\nprintln!("{}",total);',
      'int total = 0;\nfor(int valor : new int[]{2,3}) total += valor;\nSystem.out.println(total);'
    ),
    output: '5',
    task: 'Feche a loja usando [12, -3, 0, 8, 15]. Ignore valores negativos, conte as vendas válidas (zero conta) e some seus valores. Imprima quantidade e total em linhas separadas.',
    solution: programs(
      'let quantidade = 0, total = 0;\nfor(const valor of [12,-3,0,8,15]) { if(valor >= 0) { quantidade++; total += valor; } }\nconsole.log(quantidade);\nconsole.log(total);',
      'quantidade = 0\ntotal = 0\nfor valor in [12,-3,0,8,15]:\n    if valor >= 0:\n        quantidade += 1\n        total += valor\nprint(quantidade)\nprint(total)',
      'quantidade, total := 0, 0\nfor _, valor := range []int{12,-3,0,8,15} { if valor >= 0 { quantidade++; total += valor } }\nfmt.Println(quantidade)\nfmt.Println(total)',
      'let mut quantidade = 0; let mut total = 0;\nfor valor in [12,-3,0,8,15] { if valor >= 0 { quantidade += 1; total += valor; } }\nprintln!("{}",quantidade);\nprintln!("{}",total);',
      'int quantidade = 0, total = 0;\nfor(int valor : new int[]{12,-3,0,8,15}) { if(valor >= 0) { quantidade++; total += valor; } }\nSystem.out.println(quantidade);\nSystem.out.println(total);'
    ),
    expected: '4\n35',
    kind: 'project',
  },
];
const UNIT_TITLES = [
  'Primeiros programas',
  'Decisões e repetições',
  'Código reutilizável',
  'Dados, testes e projeto',
];
const LABELS: Record<Language, string> = {
  JS: 'JavaScript',
  TS: 'TypeScript',
  PYTHON: 'Python',
  GO: 'Go',
  RUST: 'Rust',
  JAVA: 'Java',
};
function fullProgram(body: string, language: string) {
  return /package main|fn main\(|class Main/.test(body) ? body : wrapProgram(body, language);
}
export function buildFoundations(language: Language): LearningCourse {
  const key = language === 'TS' ? 'JS' : language;
  const lessons: LearningLesson[] = TOPICS.map((topic, index) => {
    const id = `learn-${language.toLowerCase()}-${topic.slug}`;
    const output = language === 'PYTHON' && topic.output === 'true' ? 'True' : topic.output;
    const expected = language === 'PYTHON' && topic.expected === 'false' ? 'False' : topic.expected;
    const example = fullProgram(topic.example[key], language);
    const solution = fullProgram(topic.solution[key], language);
    const isDebug = topic.slug === 'debug';
    return defineLesson({
      id,
      language,
      title: topic.title,
      description: topic.objective,
      unitNumber: topic.unit,
      unitTitle: UNIT_TITLES[topic.unit - 1],
      levelNumber: index + 1,
      difficulty: 'iniciante',
      kind: topic.kind ?? 'lesson',
      skills: topic.skills,
      prerequisites: index ? [`learn-${language.toLowerCase()}-${TOPICS[index - 1].slug}`] : [],
      ...(topic.kind === 'project'
        ? {
            project: {
              objective: topic.objective,
              requirements: [topic.task],
              stages: [
                'Identifique as entradas e o resultado esperado.',
                'Implemente uma etapa e execute.',
                'Confira o resultado e submeta a versão completa.',
              ],
              completion: ['A saída segue o contrato apresentado.', 'O código executa sem erros.'],
            },
          }
        : {}),
      steps: [
        {
          type: 'concept_explanation',
          title: topic.title,
          conceptText: topic.explanation,
          codeSnippet: example,
        },
        {
          type: 'output_prediction',
          title: 'Leia antes de executar',
          instruction: 'Qual é a saída exata deste programa?',
          codeSnippet: example,
          options: [output, 'Nenhuma saída', 'Erro de sintaxe', 'O texto do próprio código'],
          correctOptionIndex: 0,
          explanation: `A execução produz:\n${output}`,
        },
        {
          type: topic.kind === 'project' ? 'boss_challenge' : isDebug ? 'debug' : 'code_editor',
          title: topic.kind === 'project' ? topic.title : 'Agora escreva você',
          instruction: topic.task,
          codeTemplate: isDebug
            ? example
            : fullProgram(
                language === 'PYTHON' ? '# Escreva aqui\n' : '// Escreva aqui\n',
                language
              ),
          solutionCode: solution,
          expectedOutput: expected,
          hints: [topic.explanation],
          testCases: [
            {
              id: 'output',
              description: 'Saída esperada, linha por linha',
              testCode: 'programa completo',
              expectedOutput: expected,
            },
          ],
        },
      ],
    });
  });
  return {
    id: `foundations-${language.toLowerCase()}`,
    title: `${LABELS[language]} do zero`,
    description: 'Da primeira instrução a um projeto com dados e testes.',
    language,
    lessons,
  };
}
export const FOUNDATION_COURSES = (Object.keys(LABELS) as Language[]).map(buildFoundations);

// Server-only English copy for the Mundinho answer bank (questions and explanations) and code
// challenges. Never import this module into a client component or mobile bundle.
import { createMundinhoTranslator, MUNDINHO_EN, MUNDINHO_LANGUAGE_HEADER } from './i18n';

const QUESTIONS_EN: Record<string, string> = {
  // Concepts
  Arrays: 'Arrays',
  Operadores: 'Operators',
  Laços: 'Loops',
  Variáveis: 'Variables',
  Slices: 'Slices',
  Tipos: 'Types',
  Condicionais: 'Conditionals',
  Listas: 'Lists',
  Repetição: 'Repetition',
  Funções: 'Functions',
  Referências: 'References',
  Argumentos: 'Arguments',
  Semântica: 'Semantics',
  Formulários: 'Forms',
  Imagens: 'Images',
  Botões: 'Buttons',
  Acessibilidade: 'Accessibility',
  Validação: 'Validation',
  Seletores: 'Selectors',
  'Box model': 'Box model',
  Flexbox: 'Flexbox',
  Grid: 'Grid',
  Responsividade: 'Responsiveness',
  Especificidade: 'Specificity',
  Igualdade: 'Equality',
  Objetos: 'Objects',
  Promises: 'Promises',
  'Event loop': 'Event loop',
  'Union types': 'Union types',
  Interfaces: 'Interfaces',
  Narrowing: 'Narrowing',
  Genéricos: 'Generics',
  Runtime: 'Runtime',

  // Rust
  'let valores = [2, 4, 6]; Qual é valores[1]?': 'let valores = [2, 4, 6]; What is valores[1]?',
  'Os índices começam em zero; o índice 1 aponta para o segundo elemento.':
    'Indexes start at zero; index 1 points to the second element.',
  'Qual é o resultado da divisão inteira 7 / 2?':
    'What is the result of the integer division 7 / 2?',
  'A divisão entre inteiros descarta a parte fracionária.':
    'Integer division discards the fractional part.',
  'Quantas vezes o corpo de for i in 0..3 é executado?':
    'How many times does the body of for i in 0..3 run?',
  'O intervalo 0..3 inclui 0, 1 e 2.': 'The range 0..3 includes 0, 1 and 2.',
  'Qual palavra permite alterar uma variável em Rust?':
    'Which keyword lets you change a variable in Rust?',
  'let mut declara uma variável mutável.': 'let mut declares a mutable variable.',

  // Go
  'valores := []int{2, 4, 6}. Qual é len(valores)?':
    'valores := []int{2, 4, 6}. What is len(valores)?',
  'len retorna a quantidade de elementos do slice.':
    'len returns the number of elements in the slice.',
  'Qual é o resultado da divisão entre inteiros 7 / 2?':
    'What is the result of the integer division 7 / 2?',
  'Quantas vezes o corpo de for i := 0; i < 3; i++ é executado?':
    'How many times does the body of for i := 0; i < 3; i++ run?',
  'O contador assume os valores 0, 1 e 2.': 'The counter takes the values 0, 1 and 2.',
  'Qual operador declara uma variável com tipo inferido dentro de uma função?':
    'Which operator declares a variable with an inferred type inside a function?',
  ':= declara e inicializa uma variável local.': ':= declares and initializes a local variable.',

  // Java
  'int[] valores = {2, 4, 6}; Qual é valores[1]?': 'int[] valores = {2, 4, 6}; What is valores[1]?',
  'Qual é o valor de int resultado = 7 / 2?': 'What is the value of int resultado = 7 / 2?',
  'Quantas vezes o corpo de for (int i = 0; i < 3; i++) é executado?':
    'How many times does the body of for (int i = 0; i < 3; i++) run?',
  'Qual tipo representa verdadeiro ou falso?': 'Which type represents true or false?',
  'boolean possui os valores true e false.': 'boolean has the values true and false.',

  // Python
  'Qual é o resultado de: "par" if 7 % 2 == 0 else "ímpar"?':
    'What is the result of: "par" if 7 % 2 == 0 else "ímpar"?',
  '7 % 2 é 1. A condição é falsa e a expressão escolhe o valor depois de else.':
    '7 % 2 is 1. The condition is false and the expression picks the value after else.',
  'valores = [4, 8, 12]\nQual é valores[-1]?': 'valores = [4, 8, 12]\nWhat is valores[-1]?',
  Erro: 'Error',
  'Índices negativos contam a partir do final; -1 acessa o último elemento.':
    'Negative indexes count from the end; -1 accesses the last element.',
  'Qual é sum(range(1, 4))?': 'What is sum(range(1, 4))?',
  'range(1, 4) produz 1, 2 e 3. O limite final é exclusivo.':
    'range(1, 4) produces 1, 2 and 3. The upper bound is exclusive.',
  'def dobro(x):\n    return x * 2\nQual é dobro(3) + 1?':
    'def dobro(x):\n    return x * 2\nWhat is dobro(3) + 1?',
  'A chamada retorna 6; depois a expressão soma 1.':
    'The call returns 6; then the expression adds 1.',
  'a = [1]\nb = a\nb.append(2)\nQual é a?': 'a = [1]\nb = a\nb.append(2)\nWhat is a?',
  'a e b apontam para a mesma lista mutável. append modifica essa lista.':
    'a and b point to the same mutable list. append modifies that list.',
  'Por que evitar def f(itens=[]): itens.append(1)?': 'Why avoid def f(itens=[]): itens.append(1)?',
  'Listas são imutáveis': 'Lists are immutable',
  'O padrão é criado uma vez e compartilhado entre chamadas':
    'The default is created once and shared between calls',
  'append retorna uma lista nova': 'append returns a new list',
  'Python proíbe listas como argumento': 'Python forbids lists as arguments',
  'Argumentos padrão são avaliados na definição. Use None e crie uma nova lista dentro da função.':
    'Default arguments are evaluated at definition time. Use None and create a new list inside the function.',

  // HTML
  'Qual elemento representa a navegação principal?':
    'Which element represents the main navigation?',
  'nav identifica uma seção de links de navegação para navegadores e tecnologias assistivas.':
    'nav identifies a section of navigation links for browsers and assistive technologies.',
  'Como associar um label ao input com id="email"?':
    'How do you associate a label with the input with id="email"?',
  'O atributo for referencia o id do controle e dá a ele um nome acessível.':
    'The for attribute references the control’s id and gives it an accessible name.',
  'Qual alt usar em uma imagem puramente decorativa?':
    'Which alt should you use on a purely decorative image?',
  'Omitir alt sempre': 'Always omit alt',
  'alt vazio permite que leitores de tela ignorem a imagem decorativa.':
    'An empty alt lets screen readers skip the decorative image.',
  'Qual type evita que um botão dentro de form envie o formulário?':
    'Which type keeps a button inside a form from submitting it?',
  'button não executa a ação padrão de submit. reset limparia os campos.':
    'button does not run the default submit action. reset would clear the fields.',
  'Para um botão apenas com ícone, qual opção fornece um nome acessível?':
    'For an icon-only button, which option provides an accessible name?',
  'title vazio': 'empty title',
  'aria-label dá um nome ao controle. O botão nativo já fornece semântica e teclado.':
    'aria-label gives the control a name. The native button already provides semantics and keyboard support.',
  'Por que required no HTML não substitui validação no servidor?':
    'Why does required in HTML not replace server-side validation?',
  'required só funciona com CSS': 'required only works with CSS',
  'HTML não aceita formulários': 'HTML does not accept forms',
  'O cliente pode ser contornado e enviar requisições diretamente':
    'The client can be bypassed and send requests directly',
  'O navegador sempre remove required': 'The browser always removes required',
  'A validação do navegador melhora a experiência, mas toda entrada precisa ser validada no servidor.':
    'Browser validation improves the experience, but all input must be validated on the server.',

  // CSS
  'Qual seletor seleciona elementos com class="ativo"?':
    'Which selector selects elements with class="ativo"?',
  'O ponto indica classe. # seleciona id.': 'The dot means class. # selects an id.',
  'Com box-sizing: border-box, width inclui o quê?':
    'With box-sizing: border-box, what does width include?',
  'Só conteúdo': 'Content only',
  'Conteúdo e margem': 'Content and margin',
  'Conteúdo, padding e borda': 'Content, padding and border',
  'Margem e borda apenas': 'Margin and border only',
  'border-box inclui padding e borda na largura especificada, mas não a margem.':
    'border-box includes padding and border in the specified width, but not the margin.',
  'Em flex-direction: row, qual propriedade distribui itens no eixo horizontal?':
    'With flex-direction: row, which property distributes items along the horizontal axis?',
  'justify-content atua no eixo principal; com row, esse eixo é horizontal.':
    'justify-content works on the main axis; with row, that axis is horizontal.',
  'O que grid-template-columns: repeat(3, 1fr) cria?':
    'What does grid-template-columns: repeat(3, 1fr) create?',
  'Três colunas de frações iguais': 'Three equal-fraction columns',
  'Três linhas fixas': 'Three fixed rows',
  'Uma coluna de 3px': 'One 3px column',
  'Três margens': 'Three margins',
  'repeat repete a definição; 1fr distribui o espaço disponível em três frações.':
    'repeat repeats the definition; 1fr splits the available space into three fractions.',
  'Qual regra se aplica em viewports de até 600px?': 'Which rule applies to viewports up to 600px?',
  'max-width estabelece um limite superior inclusivo para a largura do viewport.':
    'max-width sets an inclusive upper bound for the viewport width.',
  'Sem !important ou camadas, qual seletor vence sobre .card para o mesmo elemento?':
    'Without !important or layers, which selector wins over .card for the same element?',
  'Um seletor de id tem especificidade maior que um seletor de classe. :where tem especificidade zero.':
    'An id selector has higher specificity than a class selector. :where has zero specificity.',

  // JavaScript
  'Qual declaração permite reatribuir uma variável com escopo de bloco?':
    'Which declaration lets you reassign a block-scoped variable?',
  'let permite reatribuição e respeita o escopo de bloco. const impede reatribuir a referência.':
    'let allows reassignment and respects block scope. const prevents reassigning the reference.',
  'Qual é [2, 4, 6].map(n => n / 2)?': 'What is [2, 4, 6].map(n => n / 2)?',
  'map cria um novo array com o resultado da função para cada elemento.':
    'map creates a new array with the function’s result for each element.',
  'Qual é o resultado de 0 === false?': 'What is the result of 0 === false?',
  'A igualdade estrita não converte tipos: número e booleano são diferentes.':
    'Strict equality does not convert types: number and boolean are different.',
  'const a = { n: 1 };\nconst b = a;\nb.n = 2;\nQual é a.n?':
    'const a = { n: 1 };\nconst b = a;\nb.n = 2;\nWhat is a.n?',
  'Ambas as variáveis referenciam o mesmo objeto. const impede reatribuir a variável, não mutar propriedades.':
    'Both variables reference the same object. const prevents reassigning the variable, not mutating properties.',
  'O que uma função async sempre retorna?': 'What does an async function always return?',
  'Um número': 'A number',
  'Uma Promise': 'A Promise',
  'Uma string': 'A string',
  'Uma callback': 'A callback',
  'Mesmo ao retornar um valor simples, uma função async o encapsula em uma Promise.':
    'Even when returning a plain value, an async function wraps it in a Promise.',
  'console.log(1);\nPromise.resolve().then(() => console.log(2));\nconsole.log(3);\nQual é a ordem?':
    'console.log(1);\nPromise.resolve().then(() => console.log(2));\nconsole.log(3);\nWhat is the order?',
  'O código síncrono termina primeiro. A callback da Promise executa depois, como microtarefa.':
    'Synchronous code finishes first. The Promise callback runs afterwards, as a microtask.',

  // TypeScript
  'Qual anotação representa uma lista de números?':
    'Which annotation represents a list of numbers?',
  'number[] e Array<number> representam arrays cujos elementos são números.':
    'number[] and Array<number> represent arrays whose elements are numbers.',
  'Qual tipo aceita uma string OU um número?': 'Which type accepts a string OR a number?',
  'O operador | forma uma união: o valor pode pertencer a qualquer um dos tipos.':
    'The | operator forms a union: the value can belong to either type.',
  'Em interface User { name?: string }, o que ? significa?':
    'In interface User { name?: string }, what does ? mean?',
  'name é privado': 'name is private',
  'name é obrigatório': 'name is required',
  'name é opcional': 'name is optional',
  'name aceita somente null': 'name only accepts null',
  'A propriedade pode estar ausente. Ao lê-la, trate a possibilidade de undefined.':
    'The property may be missing. When reading it, handle the possibility of undefined.',
  'Como restringir x: string | number para string?':
    'How do you narrow x: string | number to string?',
  'typeof é um type guard; dentro desse bloco o compilador conhece x como string.':
    'typeof is a type guard; inside that block the compiler knows x is a string.',
  'Qual função preserva o tipo recebido no retorno?':
    'Which function preserves the received type in its return?',
  'O parâmetro genérico T conecta o tipo da entrada ao tipo de saída, sem perder informação.':
    'The generic parameter T ties the input type to the output type without losing information.',
  'Uma interface TypeScript valida automaticamente JSON recebido da rede?':
    'Does a TypeScript interface automatically validate JSON received from the network?',
  'Sim, sempre': 'Yes, always',
  'Só em produção': 'Only in production',
  'Não; é necessário validar em runtime': 'No; you need to validate at runtime',
  'Sim, com as User': 'Yes, with as User',
  'Interfaces são apagadas na compilação. Uma asserção as também não valida dados; use um validador em runtime.':
    'Interfaces are erased at compile time. An as assertion does not validate data either; use a runtime validator.',

  // Code challenges: concepts, hints, titles and prompts
  'Condições e repetição': 'Conditions and repetition',
  'Condições e ações': 'Conditions and actions',
  'Programação e ações': 'Programming and actions',
  'Use if e else com um sensor do mundo para decidir quando agir e quando seguir o caminho.':
    'Use if and else with a world sensor to decide when to act and when to keep going.',
  'Cada comando de movimento avança uma casa. Visite cada objeto e execute a ação indicada.':
    'Each movement command moves one tile. Visit each object and perform the indicated action.',
  'Clareira dos cristais': 'Crystal clearing',
  'Colete os três cristais da clareira. Ande uma casa e colete em cada uma delas.':
    'Collect the three crystals in the clearing. Move one tile and collect on each of them.',
  'Jardim sedento': 'Thirsty garden',
  'Regue as três flores do jardim. Visite cada flor e use o comando de regar.':
    'Water the three flowers in the garden. Visit each flower and use the water command.',
  'Luzes do caminho': 'Path lights',
  'Acenda as duas lanternas para iluminar a trilha. A segunda está depois de uma casa vazia.':
    'Light the two lanterns to illuminate the trail. The second one is after an empty tile.',
  'Ponte de mecanismos': 'Mechanism bridge',
  'Ative as duas alavancas da ponte, uma em cada extremidade. Você começa no meio.':
    'Activate the bridge’s two levers, one at each end. You start in the middle.',
  'Rochas na passagem': 'Rocks in the passage',
  'Quebre as três rochas que precisam ser removidas da passagem.':
    'Break the three rocks that need to be cleared from the passage.',
  'Baús da trilha': 'Trail chests',
  'Abra os dois baús escondidos ao longo do caminho.': 'Open the two chests hidden along the path.',
  'Sementes da horta': 'Garden seeds',
  'Plante uma semente em cada um dos três canteiros, deixando a casa vazia para trás.':
    'Plant a seed in each of the three beds, leaving the empty tile behind.',
  'Resgate dos bichinhos': 'Critter rescue',
  'Cure os dois bichinhos feridos. Um está à esquerda e outro à direita de onde você começa.':
    'Heal the two injured critters. One is to the left and the other to the right of where you start.',
  'Oficina na estrada': 'Roadside workshop',
  'Conserte as três máquinas que estão espalhadas pela estrada.':
    'Fix the three machines scattered along the road.',
  'Voo livre': 'Free flight',
  'Liberte os pássaros das duas gaiolas. A primeira fica à sua esquerda.':
    'Free the birds from the two cages. The first one is to your left.',
  'Colheita no pomar': 'Orchard harvest',
  'Colete os frutos maduros; passe pelas casas vazias sem tentar coletar nelas.':
    'Collect the ripe fruit; pass the empty tiles without trying to collect there.',
  'Estufa de mudas': 'Seedling greenhouse',
  'Plante nos dois canteiros e regue as duas mudas nas casas marcadas.':
    'Plant in the two beds and water the two seedlings on the marked tiles.',
  'Ruínas antigas': 'Ancient ruins',
  'Quebre as rochas e ative o altar no fim da passagem.':
    'Break the rocks and activate the altar at the end of the passage.',
  'Acampamento seguro': 'Safe camp',
  'Acenda as lanternas e abra o baú de suprimentos.':
    'Light the lanterns and open the supply chest.',
  'Biblioteca esquecida': 'Forgotten library',
  'Abra os baús de livros e conserte a máquina entre eles.':
    'Open the book chests and fix the machine between them.',
  'Bosque dos guardiões': 'Guardians’ grove',
  'Cure o bichinho e liberte os pássaros presos nas gaiolas.':
    'Heal the critter and free the birds trapped in the cages.',
  'Mina de cristais': 'Crystal mine',
  'Quebre as rochas e colete os cristais encontrados pelo caminho.':
    'Break the rocks and collect the crystals found along the way.',
  'Santuário das luzes': 'Sanctuary of lights',
  'Acenda as lanternas nas duas pontas e ative o altar. Você começa no centro.':
    'Light the lanterns at both ends and activate the altar. You start in the center.',
  'Viveiro da floresta': 'Forest nursery',
  'Regue as flores e cure o bichinho que está entre elas.':
    'Water the flowers and heal the critter between them.',
  'Expedição de resgate': 'Rescue expedition',
  'Conserte a máquina, abra o baú e liberte o pássaro antes de encerrar a expedição.':
    'Fix the machine, open the chest and free the bird before ending the expedition.',
  'Trilha de volta': 'Trail back',
  'Você começou no fim da trilha. Volte para coletar os três cristais.':
    'You started at the end of the trail. Go back to collect the three crystals.',
  Observatório: 'Observatory',
  'Conserte o mecanismo, ative o altar e acenda a lanterna do observatório.':
    'Fix the mechanism, activate the altar and light the observatory lantern.',
};

/** Comments inside starter code that should read in English. */
const STARTER_COMMENTS_EN: Array<[string, string]> = [
  ['Adapte as ações para concluir o caminho.', 'Adapt the actions to finish the path.'],
  ['Continue a sequência de ações', 'Continue the sequence of actions'],
  ['Colete o cristal aqui', 'Collect the crystal here'],
];

const SERVER_PATTERNS: Array<[RegExp, (m: RegExpMatchArray) => string]> = [
  [
    /^Use if\/else com um sensor e (for|for, while ou loop|for ou while)\. O mesmo laço deve executar ações em pelo menos duas iterações\.$/,
    (m) =>
      `Use if/else with a sensor and ${m[1].replace(' ou ', ' or ')}. The same loop must run actions in at least two iterations.`,
  ],
];

const translateBase = createMundinhoTranslator({ ...MUNDINHO_EN, ...QUESTIONS_EN });

function translateServerString(value: string): string {
  for (const [pattern, build] of SERVER_PATTERNS) {
    const match = value.match(pattern);
    if (match) return build(match);
  }
  const translated = translateBase(value);
  if (translated !== value) return translated;
  // Starter code: only swap the comment text, never the code itself.
  let code = value;
  for (const [pt, en] of STARTER_COMMENTS_EN) code = code.split(pt).join(en);
  return code;
}

// `tiles` labels double as sprite keys on the client, which localizes them for display.
const SKIP_KEYS = new Set([
  'id',
  'username',
  'hostName',
  'avatar',
  'roomId',
  'code',
  'output',
  'language',
  'tiles',
]);

/** Deep-translates every known pt-BR string in a Mundinho API payload. */
export function localizeMundinhoPayload<T>(payload: T): T {
  const walk = (value: unknown, key?: string): unknown => {
    if (key && SKIP_KEYS.has(key) && typeof value !== 'object') return value;
    if (key === 'tiles') return value;
    if (typeof value === 'string') return translateServerString(value);
    if (Array.isArray(value)) return value.map((item) => walk(item, key));
    if (value && typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value as Record<string, unknown>).map(([k, v]) => [
          k,
          // `code` holds the challenge object; walk into it but keep raw strings untouched.
          k === 'code' && v && typeof v === 'object' ? walk(v) : walk(v, k),
        ])
      );
    }
    return value;
  };
  return walk(payload) as T;
}

/** Translates the message of an error thrown by the Mundinho services, keeping its type. */
export function translateMundinhoError(error: unknown) {
  if (error instanceof Error && typeof error.message === 'string') {
    const translated = translateServerString(error.message);
    if (translated !== error.message) error.message = translated;
  }
  return error;
}

export function wantsEnglish(request: Request) {
  return request.headers.get(MUNDINHO_LANGUAGE_HEADER) === 'en';
}

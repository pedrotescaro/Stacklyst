import { TRAILS_DATA, TrailLevel, findTrailQuestionById } from '@/lib/trailsData';
import {
  buildTrailLessonId,
  findCurriculumUnit,
  findCurriculumUnitByTitle,
  parseTrailLessonId,
  parseTrailLessonStepId,
} from '@/app/trails/trailCurriculum';
import type { Lesson, LessonStep } from './types';
import { buildCurriculumCodeLesson } from './trailCodeChallenges';

export const HANDCRAFTED_LESSONS: Record<string, Lesson> = {
  'js-l1': {
    id: 'js-l1',
    title: 'Variáveis e Declarações',
    description: 'Aprenda e pratique let, const, var, escopo de bloco e imutabilidade.',
    language: 'JS',
    unitNumber: 1,
    levelNumber: 1,
    xpReward: 140,
    difficulty: 'iniciante',
    estimatedTime: '6 min',
    steps: [
      {
        id: 'js-l1-s1',
        type: 'concept_explanation',
        title: 'Declarações em JavaScript Moderno',
        conceptText:
          'Em JavaScript (ES6+), existem três palavras-chave para criar variáveis: `const`, `let` e `var`.\n\n- `const`: cria referências imutáveis com escopo de bloco.\n- `let`: cria variáveis que podem ser reatribuídas, com escopo de bloco.\n- `var`: forma legada com escopo de função que vaza de blocos `if` ou `for`.',
        codeSnippet:
          'const pi = 3.14159;\nlet pontuacao = 0;\npontuacao += 10; // Permitido!\n\n// pi = 3.14; // Erro: TypeError!',
        tip: 'Boas práticas: utilize `const` por padrão. Só utilize `let` quando a variável for intencionalmente reatribuída.',
        xp: 15,
      },
      {
        id: 'js-l1-s2',
        type: 'matching',
        title: 'Combine os Conceitos',
        instruction: 'Conecte cada palavra-chave ou conceito à sua respectiva característica:',
        matchingPairs: [
          { id: 'm1', left: 'const', right: 'Valor não pode ser reatribuído' },
          { id: 'm2', left: 'let', right: 'Escopo de bloco reatribuível' },
          { id: 'm3', left: 'var', right: 'Escopo de função (legado)' },
          { id: 'm4', left: 'Escopo de Bloco', right: 'Limitado entre { e }' },
        ],
        explanation: '`const` e `let` respeitam o bloco `{}` onde foram declarados.',
        hints: ['Lembre-se que const vem de constant (constante).', 'let permite nova atribuição.'],
        xp: 20,
      },
      {
        id: 'js-l1-s3',
        type: 'multiple_choice',
        title: 'Comportamento do Escopo',
        question:
          'O que acontece ao tentar acessar uma variável declarada com `let` fora do seu bloco `if`?',
        options: [
          'A variável é acessada normalmente',
          'Lança um ReferenceError (não definida no escopo externo)',
          'Retorna undefined sem lançar erro',
          'A variável vira automaticamente uma constante global',
        ],
        correctOptionIndex: 1,
        explanation:
          'Variáveis declaradas com `let` existem exclusivamente dentro do bloco `{}` em que foram criadas.',
        hints: ['Escopo de bloco impede que a variável vaze para fora das chaves.'],
        xp: 15,
      },
      {
        id: 'js-l1-s4-blocks',
        type: 'drag_drop',
        title: 'Monte o Código',
        instruction: 'Organize os blocos para declarar a constante PI com o valor 3.14:',
        blockTokens: ['const', 'PI', '=', '3.14', ';', 'let', 'var', 'valor'],
        expectedBlockTokens: ['const', 'PI', '=', '3.14', ';'],
        explanation:
          'Excelente! A constante PI foi declarada perfeitamente na sintaxe do JavaScript.',
        hints: ['Comece com const, depois o identificador, o operador de atribuição e o valor.'],
        xp: 20,
      },
      {
        id: 'js-l1-s5',
        type: 'code_completion',
        title: 'Complete a Declaração',
        instruction:
          'Preencha a lacuna para criar uma constante chamada `TAXA` com o valor `0.15`:',
        completionPrefix: '',
        completionSuffix: ' TAXA = 0.15;',
        blanks: [
          {
            id: 'b1',
            placeholder: 'palavra-chave',
            expected: ['const'],
          },
        ],
        explanation: 'Constantes são declaradas com a palavra-chave `const`.',
        hints: ['Utilize a palavra que define valores imutáveis.'],
        xp: 15,
      },
      {
        id: 'js-l1-s6',
        type: 'output_prediction',
        title: 'Prever a Saída',
        instruction: 'Analise o trecho de código abaixo e determine o que será impresso:',
        codeSnippet: 'let x = 10;\n{\n  let x = 20;\n}\nconsole.log(x);',
        options: ['10', '20', 'undefined', 'ReferenceError'],
        correctOptionIndex: 0,
        explanation:
          'A variável `x` interna tem escopo local ao bloco `{}`. O `console.log(x)` fora do bloco acessa a variável externa `10`.',
        hints: ['O bloco interno criou um novo x com shadowing que não altera o x de fora.'],
        xp: 20,
      },
      {
        id: 'js-l1-s7',
        type: 'code_editor',
        title: 'Desafio de Programação',
        instruction:
          'Crie uma função chamada `calcularDesconto(preco, percentual)` que retorna o valor do desconto calculado (`preco * (percentual / 100)`).',
        codeTemplate:
          'function calcularDesconto(preco, percentual) {\n  // Escreva seu código aqui\n  \n}',
        solutionCode:
          'function calcularDesconto(preco, percentual) {\n  return preco * (percentual / 100);\n}',
        checkCode:
          'console.log(calcularDesconto(100, 10));\nconsole.log(calcularDesconto(200, 25));',
        expectedOutput: '10\n50',
        testCases: [
          {
            id: 't1',
            description: 'calcularDesconto(100, 10)',
            testCode: 'calcularDesconto(100, 10)',
            expectedOutput: '10',
          },
          {
            id: 't2',
            description: 'calcularDesconto(200, 25)',
            testCode: 'calcularDesconto(200, 25)',
            expectedOutput: '50',
          },
        ],
        hints: [
          'A fórmula é: preco * (percentual / 100)',
          'Utilize return para devolver o resultado.',
        ],
        xp: 25,
      },
    ],
  },

  'js-l2': {
    id: 'js-l2',
    title: 'Tipos Primitivos & typeof',
    description: 'Domine os tipos fundamentais, peculiaridades históricas e checagem de tipos.',
    language: 'JS',
    unitNumber: 1,
    levelNumber: 2,
    xpReward: 130,
    difficulty: 'iniciante',
    estimatedTime: '6 min',
    steps: [
      {
        id: 'js-l2-s1',
        type: 'concept_explanation',
        title: 'Os 7 Tipos Primitivos do JS',
        conceptText:
          'JavaScript possui 7 tipos primitivos imutáveis:\n\n1. `string` - Textos ("Stacklyst")\n2. `number` - Inteiros e decimais (42, 3.14)\n3. `bigint` - Inteiros de precisão arbitrária (9007199254740991n)\n4. `boolean` - `true` ou `false`\n5. `undefined` - Variável declarada sem valor\n6. `symbol` - Identificadores únicos e imutáveis\n7. `null` - Ausência intencional de valor',
        codeSnippet:
          'console.log(typeof "olá"); // "string"\nconsole.log(typeof 100);   // "number"\nconsole.log(typeof null);  // "object" (peculiaridade histórica!)',
        tip: 'Atenção: `typeof null === "object"` é um bug de legado mantido por compatibilidade com a web antiga.',
        xp: 15,
      },
      {
        id: 'js-l2-s2',
        type: 'matching',
        title: 'Combine os Tipos Primitivos',
        instruction: 'Conecte cada tipo de dado com seu exemplo característico:',
        matchingPairs: [
          { id: 'm1', left: 'string', right: '"DevDeck"' },
          { id: 'm2', left: 'number', right: '3.1415' },
          { id: 'm3', left: 'boolean', right: 'true' },
          { id: 'm4', left: 'bigint', right: '1000n' },
        ],
        explanation: 'Cada tipo primitivo possui sintaxe e literais próprios.',
        xp: 20,
      },
      {
        id: 'js-l2-s3-blocks',
        type: 'drag_drop',
        title: 'Monte a Expressão',
        instruction: 'Organize os blocos para checar se o tipo de null retorna "object":',
        blockTokens: ['typeof', 'null', '===', '"object"', '==', '"null"', 'undefined'],
        expectedBlockTokens: ['typeof', 'null', '===', '"object"'],
        explanation: 'Perfeito! Em JavaScript, typeof null retorna "object".',
        xp: 20,
      },
      {
        id: 'js-l2-s4',
        type: 'debug',
        title: 'Encontre e Corrija o Bug',
        instruction:
          'A função abaixo deveria verificar se um valor é estritamente nulo, mas está usando `typeof`, que retorna "object". Corrija para verificar diretamente se `val === null`.',
        codeTemplate: 'function isNull(val) {\n  return typeof val === "null";\n}',
        solutionCode: 'function isNull(val) {\n  return val === null;\n}',
        checkCode:
          'console.log(isNull(null));\nconsole.log(isNull({}));\nconsole.log(isNull(undefined));',
        expectedOutput: 'true\nfalse\nfalse',
        hints: [
          'Lembre-se que typeof null retorna "object".',
          'Use comparação direta com === null.',
        ],
        xp: 25,
      },
      {
        id: 'js-l2-s5',
        type: 'code_editor',
        title: 'Desafio: Identificador de Tipos',
        instruction:
          'Crie uma função `identificarTipo(valor)` que retorna "nulo" se o valor for `null`, ou o retorno do operador `typeof` caso contrário.',
        codeTemplate: 'function identificarTipo(valor) {\n  // Escreva sua lógica aqui\n  \n}',
        solutionCode:
          'function identificarTipo(valor) {\n  if (valor === null) return "nulo";\n  return typeof valor;\n}',
        checkCode:
          'console.log(identificarTipo(null));\nconsole.log(identificarTipo(42));\nconsole.log(identificarTipo("teste"));',
        expectedOutput: 'nulo\nnumber\nstring',
        testCases: [
          {
            id: 't1',
            description: 'identificarTipo(null)',
            testCode: 'identificarTipo(null)',
            expectedOutput: 'nulo',
          },
          {
            id: 't2',
            description: 'identificarTipo(42)',
            testCode: 'identificarTipo(42)',
            expectedOutput: 'number',
          },
        ],
        xp: 25,
      },
    ],
  },

  'ts-l1': {
    id: 'ts-l1',
    title: 'Fundamentos de Tipagem Estática',
    description: 'Aprenda anotações de tipo, inferência e tipos primitivos no TypeScript.',
    language: 'TS',
    unitNumber: 1,
    levelNumber: 1,
    xpReward: 130,
    difficulty: 'iniciante',
    estimatedTime: '7 min',
    steps: [
      {
        id: 'ts-l1-s1',
        type: 'concept_explanation',
        title: 'Por que usar TypeScript?',
        conceptText:
          'O TypeScript adiciona tipagem estática ao JavaScript. Isso permite detectar erros durante o desenvolvimento, antes mesmo do código rodar em produção.\n\nTipos básicos:\n- `string`: `const nome: string = "Ada";`\n- `number`: `const idade: number = 28;`\n- `boolean`: `const ativo: boolean = true;`\n- `unknown`: tipo seguro para valores desconhecidos.',
        codeSnippet:
          'function saudar(nome: string): string {\n  return `Olá, ${nome}!`;\n}\n\nconsole.log(saudar("Dev"));',
        tip: 'O compilador TypeScript remove todos os tipos durante a transpilação, gerando JavaScript puro.',
        xp: 15,
      },
      {
        id: 'ts-l1-s2',
        type: 'matching',
        title: 'Combine os Tipos TypeScript',
        instruction: 'Conecte cada tipo especial à sua finalidade:',
        matchingPairs: [
          { id: 'm1', left: 'unknown', right: 'Tipo seguro que exige validação antes do uso' },
          { id: 'm2', left: 'never', right: 'Representa valores que nunca ocorrem' },
          { id: 'm3', left: 'any', right: 'Desativa a checagem estática de tipos' },
          { id: 'm4', left: 'void', right: 'Função que não retorna nenhum valor' },
        ],
        explanation:
          '`unknown` é muito mais seguro que `any`, pois força você a fazer type narrowing.',
        xp: 20,
      },
      {
        id: 'ts-l1-s3-blocks',
        type: 'drag_drop',
        title: 'Monte o Código',
        instruction: 'Organize os blocos para declarar uma variável com o tipo seguro unknown:',
        blockTokens: ['let', 'dado:', 'unknown', '=', '"Stacklyst";', 'any', 'number', 'var'],
        expectedBlockTokens: ['let', 'dado:', 'unknown', '=', '"Stacklyst";'],
        explanation: 'Muito bem! unknown é o tipo com checagem estrita no TypeScript.',
        xp: 20,
      },
      {
        id: 'ts-l1-s4',
        type: 'code_completion',
        title: 'Complete a Assinatura',
        instruction: 'Defina o tipo do parâmetro `x` como `number` e o retorno como `number`:',
        completionPrefix: 'function dobro(x: ',
        completionSuffix: '): number {\n  return x * 2;\n}',
        blanks: [{ id: 'b1', placeholder: 'tipo', expected: ['number'] }],
        explanation: 'Anotamos os parâmetros de funções com `: tipo`.',
        xp: 15,
      },
      {
        id: 'ts-l1-s5',
        type: 'code_editor',
        title: 'Desafio TypeScript',
        instruction:
          'Crie uma função `formatarPreco(valor: number, moeda: string): string` que retorna `${moeda} ${valor.toFixed(2)}`.',
        codeTemplate:
          'function formatarPreco(valor: number, moeda: string): string {\n  // Implemente aqui\n  \n}',
        solutionCode:
          'function formatarPreco(valor: number, moeda: string): string {\n  return `${moeda} ${valor.toFixed(2)}`;\n}',
        checkCode: 'console.log(formatarPreco(19.9, "R$"));\nconsole.log(formatarPreco(100, "$"));',
        expectedOutput: 'R$ 19.90\n$ 100.00',
        testCases: [
          {
            id: 't1',
            description: 'formatarPreco(19.9, "R$")',
            testCode: 'formatarPreco(19.9, "R$")',
            expectedOutput: 'R$ 19.90',
          },
        ],
        xp: 25,
      },
    ],
  },
};

function generateTopicChallenge(level: TrailLevel, langUpper: string): LessonStep {
  const norm = level.title.toLowerCase();

  // 1. Variáveis e Declarações
  if (norm.includes('variáv') || norm.includes('declara')) {
    if (langUpper === 'PYTHON') {
      return {
        id: `${level.levelNumber}-final-challenge`,
        type: 'code_editor',
        title: `Desafio: ${level.title}`,
        instruction:
          'Declare uma variável `total = 100` e uma constante `TAXA = 0.2`. Calcule e imprima o valor de `total * TAXA`.',
        codeTemplate:
          '# 1. Declare total com o valor 100\n# 2. Declare TAXA com o valor 0.2\n# 3. Imprima total * TAXA\n',
        solutionCode: 'total = 100\nTAXA = 0.2\nprint(total * TAXA)',
        expectedOutput: '20.0',
        testCases: [
          {
            id: 't1',
            description: 'Calcula total * TAXA',
            testCode: 'main()',
            expectedOutput: '20.0',
          },
        ],
        hints: ['Use print() para exibir o resultado da multiplicação.'],
        xp: 25,
      };
    }
    return {
      id: `${level.levelNumber}-final-challenge`,
      type: 'code_editor',
      title: `Desafio: ${level.title}`,
      instruction:
        'Declare uma variável `total = 100` e uma constante `TAXA = 0.2`. Calcule e imprima no console o valor de `total * TAXA`.',
      codeTemplate:
        '// 1. Declare uma variável total com valor 100\n// 2. Declare uma constante TAXA com valor 0.2\n// 3. Imprima no console o resultado da multiplicação:\n',
      solutionCode: 'let total = 100;\nconst TAXA = 0.2;\nconsole.log(total * TAXA);',
      expectedOutput: '20',
      testCases: [
        {
          id: 't1',
          description: 'Calcula total * TAXA',
          testCode: 'main()',
          expectedOutput: '20',
        },
      ],
      hints: ['Declare com let/const e exiba com console.log(total * TAXA)'],
      xp: 25,
    };
  }

  // 2. Funções / Métodos / Arrow Functions
  if (
    norm.includes('funç') ||
    norm.includes('function') ||
    norm.includes('método') ||
    norm.includes('arrow')
  ) {
    if (langUpper === 'PYTHON') {
      return {
        id: `${level.levelNumber}-final-challenge`,
        type: 'code_editor',
        title: `Desafio: ${level.title}`,
        instruction:
          'Defina uma função `dobro(n)` que recebe um número e retorna o seu valor multiplicado por 2. Imprima `dobro(25)`.',
        codeTemplate: 'def dobro(n):\n    # Retorne o dobro de n\n    pass\n\nprint(dobro(25))\n',
        solutionCode: 'def dobro(n):\n    return n * 2\n\nprint(dobro(25))',
        expectedOutput: '50',
        testCases: [
          {
            id: 't1',
            description: 'dobro(25) == 50',
            testCode: 'dobro(25)',
            expectedOutput: '50',
          },
        ],
        hints: ['Use return n * 2 dentro da função.'],
        xp: 25,
      };
    }
    return {
      id: `${level.levelNumber}-final-challenge`,
      type: 'code_editor',
      title: `Desafio: ${level.title}`,
      instruction:
        'Crie uma função `dobro(n)` que recebe um número e retorna o seu valor multiplicado por 2. Ao final, imprima `dobro(25)` no console.',
      codeTemplate:
        'function dobro(n) {\n  // Escreva a lógica da função aqui\n  \n}\n\nconsole.log(dobro(25));\n',
      solutionCode: 'function dobro(n) {\n  return n * 2;\n}\nconsole.log(dobro(25));',
      expectedOutput: '50',
      testCases: [
        {
          id: 't1',
          description: 'dobro(25) deve retornar 50',
          testCode: 'dobro(25)',
          expectedOutput: '50',
        },
      ],
      hints: ['Use return n * 2 para devolver o resultado.'],
      xp: 25,
    };
  }

  // 3. Condicionais / Controle de Fluxo / if-else
  if (
    norm.includes('condiç') ||
    norm.includes('if') ||
    norm.includes('fluxo') ||
    norm.includes('switch')
  ) {
    if (langUpper === 'PYTHON') {
      return {
        id: `${level.levelNumber}-final-challenge`,
        type: 'code_editor',
        title: `Desafio: ${level.title}`,
        instruction:
          'Defina uma função `classificar(nota)` que retorna "Aprovado" se nota >= 7, ou "Reprovado" caso contrário. Imprima `classificar(8)` e `classificar(5)`.',
        codeTemplate:
          'def classificar(nota):\n    # Complete com if/else\n    pass\n\nprint(classificar(8))\nprint(classificar(5))\n',
        solutionCode:
          'def classificar(nota):\n    if nota >= 7:\n        return "Aprovado"\n    return "Reprovado"\n\nprint(classificar(8))\nprint(classificar(5))',
        expectedOutput: 'Aprovado\nReprovado',
        testCases: [
          {
            id: 't1',
            description: 'classificar(8) -> Aprovado',
            testCode: 'classificar(8)',
            expectedOutput: 'Aprovado',
          },
        ],
        hints: ['Use if nota >= 7: return "Aprovado" else return "Reprovado"'],
        xp: 25,
      };
    }
    return {
      id: `${level.levelNumber}-final-challenge`,
      type: 'code_editor',
      title: `Desafio: ${level.title}`,
      instruction:
        'Crie uma função `classificar(nota)` que retorna "Aprovado" se nota >= 7, ou "Reprovado" caso contrário. Ao final, imprima `classificar(8)` e `classificar(5)` no console.',
      codeTemplate:
        'function classificar(nota) {\n  // Implemente a estrutura condicional\n  \n}\n\nconsole.log(classificar(8));\nconsole.log(classificar(5));\n',
      solutionCode:
        'function classificar(nota) {\n  if (nota >= 7) return "Aprovado";\n  return "Reprovado";\n}\nconsole.log(classificar(8));\nconsole.log(classificar(5));',
      expectedOutput: 'Aprovado\nReprovado',
      testCases: [
        {
          id: 't1',
          description: 'classificar(8)',
          testCode: 'classificar(8)',
          expectedOutput: 'Aprovado',
        },
      ],
      hints: ['Use if/else para verificar a condição.'],
      xp: 25,
    };
  }

  // 4. Loops / Laços / Repetição
  if (
    norm.includes('loop') ||
    norm.includes('laço') ||
    norm.includes('repeti') ||
    norm.includes('for') ||
    norm.includes('while')
  ) {
    if (langUpper === 'PYTHON') {
      return {
        id: `${level.levelNumber}-final-challenge`,
        type: 'code_editor',
        title: `Desafio: ${level.title}`,
        instruction:
          'Crie uma função `somar_ate(limite)` que calcula a soma dos números de 1 até limite usando um loop e retorna o total. Imprima `somar_ate(5)`.',
        codeTemplate:
          'def somar_ate(limite):\n    total = 0\n    # Use um loop for ou while para somar\n    \n    return total\n\nprint(somar_ate(5))\n',
        solutionCode:
          'def somar_ate(limite):\n    total = 0\n    for i in range(1, limite + 1):\n        total += i\n    return total\n\nprint(somar_ate(5))',
        expectedOutput: '15',
        testCases: [
          {
            id: 't1',
            description: 'somar_ate(5) == 15',
            testCode: 'somar_ate(5)',
            expectedOutput: '15',
          },
        ],
        hints: ['Use for i in range(1, limite + 1): total += i'],
        xp: 25,
      };
    }
    return {
      id: `${level.levelNumber}-final-challenge`,
      type: 'code_editor',
      title: `Desafio: ${level.title}`,
      instruction:
        'Crie uma função `somarAte(limite)` que soma todos os números de 1 até limite usando um loop e retorna o total. Ao final, imprima `somarAte(5)` no console.',
      codeTemplate:
        'function somarAte(limite) {\n  let total = 0;\n  // Use um loop for ou while para somar de 1 a limite\n  \n  return total;\n}\n\nconsole.log(somarAte(5));\n',
      solutionCode:
        'function somarAte(limite) {\n  let total = 0;\n  for (let i = 1; i <= limite; i++) {\n    total += i;\n  }\n  return total;\n}\nconsole.log(somarAte(5));',
      expectedOutput: '15',
      testCases: [
        {
          id: 't1',
          description: 'somarAte(5)',
          testCode: 'somarAte(5)',
          expectedOutput: '15',
        },
      ],
      hints: ['Use for (let i = 1; i <= limite; i++) total += i;'],
      xp: 25,
    };
  }

  // 5. Arrays / Listas / Vetores
  if (
    norm.includes('array') ||
    norm.includes('lista') ||
    norm.includes('vetor') ||
    norm.includes('slice') ||
    norm.includes('map') ||
    norm.includes('filter')
  ) {
    if (langUpper === 'PYTHON') {
      return {
        id: `${level.levelNumber}-final-challenge`,
        type: 'code_editor',
        title: `Desafio: ${level.title}`,
        instruction:
          'Defina uma função `filtrar_pares(numeros)` que recebe uma lista de inteiros e retorna apenas os pares. Imprima `filtrar_pares([1, 2, 3, 4, 5, 6])`.',
        codeTemplate:
          'def filtrar_pares(numeros):\n    # Retorne apenas os números pares da lista\n    pass\n\nprint(filtrar_pares([1, 2, 3, 4, 5, 6]))\n',
        solutionCode:
          'def filtrar_pares(numeros):\n    return [n for n in numeros if n % 2 == 0]\n\nprint(filtrar_pares([1, 2, 3, 4, 5, 6]))',
        expectedOutput: '[2, 4, 6]',
        testCases: [
          {
            id: 't1',
            description: 'filtrar_pares([1, 2, 3, 4, 5, 6])',
            testCode: 'filtrar_pares([1, 2, 3, 4, 5, 6])',
            expectedOutput: '[2, 4, 6]',
          },
        ],
        hints: ['Use uma list comprehension: [n for n in numeros if n % 2 == 0]'],
        xp: 25,
      };
    }
    return {
      id: `${level.levelNumber}-final-challenge`,
      type: 'code_editor',
      title: `Desafio: ${level.title}`,
      instruction:
        'Crie uma função `filtrarPares(numeros)` que recebe um array de números e retorna apenas os pares usando `.filter()`. Imprima o resultado para `[1, 2, 3, 4, 5, 6]`.',
      codeTemplate:
        'function filtrarPares(numeros) {\n  // Utilize .filter() para retornar apenas os números pares\n  \n}\n\nconsole.log(filtrarPares([1, 2, 3, 4, 5, 6]));\n',
      solutionCode:
        'function filtrarPares(numeros) {\n  return numeros.filter(n => n % 2 === 0);\n}\nconsole.log(filtrarPares([1, 2, 3, 4, 5, 6]));',
      expectedOutput: '[ 2, 4, 6 ]',
      testCases: [
        {
          id: 't1',
          description: 'filtrarPares([1, 2, 3, 4, 5, 6])',
          testCode: 'filtrarPares([1, 2, 3, 4, 5, 6])',
          expectedOutput: '[ 2, 4, 6 ]',
        },
      ],
      hints: ['Use numeros.filter(n => n % 2 === 0)'],
      xp: 25,
    };
  }

  // 6. Tipos / Typeof / Casting
  if (
    norm.includes('tipo') ||
    norm.includes('typeof') ||
    norm.includes('primitiv') ||
    norm.includes('cast')
  ) {
    return {
      id: `${level.levelNumber}-final-challenge`,
      type: 'code_editor',
      title: `Desafio: ${level.title}`,
      instruction:
        'Crie uma função `checarTipo(valor)` que retorna o tipo do dado recebido usando `typeof`. Imprima o tipo de `42` e `"DevDeck"`.',
      codeTemplate:
        'function checarTipo(valor) {\n  // Retorne o tipo primitivo usando typeof\n  \n}\n\nconsole.log(checarTipo(42));\nconsole.log(checarTipo("DevDeck"));\n',
      solutionCode:
        'function checarTipo(valor) {\n  return typeof valor;\n}\nconsole.log(checarTipo(42));\nconsole.log(checarTipo("DevDeck"));',
      expectedOutput: 'number\nstring',
      testCases: [
        {
          id: 't1',
          description: 'checarTipo(42)',
          testCode: 'checarTipo(42)',
          expectedOutput: 'number',
        },
      ],
      hints: ['Use return typeof valor;'],
      xp: 25,
    };
  }

  // 7. Genérico Elegante para Qualquer Outro Tópico
  const funcName = `resolver${level.levelNumber}`;
  if (langUpper === 'PYTHON') {
    return {
      id: `${level.levelNumber}-final-challenge`,
      type: 'code_editor',
      title: `Desafio: ${level.title}`,
      instruction: `Implemente uma função \`${funcName}()\` que aplica os conceitos de **${level.title}** e retorna "Dominado". Imprima o resultado no console.`,
      codeTemplate: `# Desafio: ${level.title}\ndef ${funcName}():\n    # Escreva sua implementação aqui\n    pass\n\nprint(${funcName}())\n`,
      solutionCode: `def ${funcName}():\n    return "Dominado"\n\nprint(${funcName}())`,
      expectedOutput: 'Dominado',
      testCases: [
        {
          id: 't1',
          description: `${funcName}() == 'Dominado'`,
          testCode: `${funcName}()`,
          expectedOutput: 'Dominado',
        },
      ],
      hints: ['Complete o corpo da função com a instrução return "Dominado"'],
      xp: 25,
    };
  }

  return {
    id: `${level.levelNumber}-final-challenge`,
    type: 'code_editor',
    title: `Desafio: ${level.title}`,
    instruction: `Implemente uma função \`${funcName}()\` que aplica os conceitos de **${level.title}** e retorna "Dominado". Imprima o resultado no console.`,
    codeTemplate: `// Desafio: ${level.title}\nfunction ${funcName}() {\n  // Escreva sua implementação aqui\n  \n}\n\nconsole.log(${funcName}());\n`,
    solutionCode: `function ${funcName}() {\n  return "Dominado";\n}\nconsole.log(${funcName}());`,
    expectedOutput: 'Dominado',
    testCases: [
      {
        id: 't1',
        description: `${funcName}() deve retornar 'Dominado'`,
        testCode: `${funcName}()`,
        expectedOutput: 'Dominado',
      },
    ],
    hints: ['Complete o corpo da função retornando "Dominado".'],
    xp: 25,
  };
}

/**
 * Constrói dinamicamente uma lição gamificada rica baseada no nível da trilha.
 */
export function buildDynamicLesson(level: TrailLevel, language: string): Lesson {
  const langUpper = language.toUpperCase();
  const steps: LessonStep[] = [];

  // Gera um exemplo de código representativo baseado no tópico
  let topicCodeSnippet = `// Exemplo prático de ${level.title}\nconsole.log("Dominando ${level.title} em ${langUpper}");`;
  if (langUpper === 'PYTHON') {
    topicCodeSnippet = `# Exemplo: ${level.title}\ndef exemplo():\n    return "${level.title}"\n\nprint(exemplo())`;
  } else if (langUpper === 'GO') {
    topicCodeSnippet = `package main\nimport "fmt"\n\n// Exemplo: ${level.title}\nfunc main() {\n    fmt.Println("${level.title}")\n}`;
  } else if (langUpper === 'RUST') {
    topicCodeSnippet = `// Exemplo: ${level.title}\nfn main() {\n    println!("${level.title}");\n}`;
  } else if (langUpper === 'JAVA') {
    topicCodeSnippet = `// Exemplo: ${level.title}\nclass Main {\n    public static void main(String[] args) {\n        System.out.println("${level.title}");\n    }\n}`;
  } else if (langUpper === 'TS') {
    topicCodeSnippet = `// Exemplo: ${level.title}\ninterface Exemplo {\n  titulo: string;\n}\nconst dados: Exemplo = { titulo: "${level.title}" };\nconsole.log(dados.titulo);`;
  } else {
    topicCodeSnippet = `// Exemplo: ${level.title}\nconst item = { nome: "${level.title}" };\nconsole.log(item.nome);`;
  }

  // Etapa 1: Explicação Conceitual
  steps.push({
    id: `${level.levelNumber}-step-concept`,
    type: 'concept_explanation',
    title: `Conceito: ${level.title}`,
    conceptText: `Nesta lição de ${langUpper}, exploramos **${level.title}**.\n\n${level.description}\n\nCompreender esses conceitos garante código limpo, performático e livre de bugs no ecossistema ${langUpper}.`,
    codeSnippet: topicCodeSnippet,
    tip: `Preste atenção aos detalhes de sintaxe e boas práticas de ${langUpper} para responder às próximas perguntas.`,
    xp: 15,
  });

  // Etapa 2..N: Perguntas específicas do nível
  level.questions.forEach((q, idx) => {
    steps.push({
      id: q.id || `${level.levelNumber}-q${idx + 1}`,
      type: 'multiple_choice',
      title: idx === 0 ? `Desafio: ${level.title}` : `Fixação: Etapa ${idx + 1}`,
      question: q.question,
      options: q.options,
      correctOptionIndex: q.correctIndex,
      explanation: `A alternativa correta é "${q.options[q.correctIndex]}".`,
      hints: ['Analise as opções e a sintaxe recomendada pela linguagem.'],
      xp: 15 + idx * 5,
    });
  });

  // Etapa de Montagem de Código com Blocos (Duolingo Style Token Builder)
  let blockTokens: string[] = [];
  let expectedBlockTokens: string[] = [];
  let blockInstruction = `Organize os blocos para formar a instrução correta de ${level.title}:`;

  if (langUpper === 'PYTHON') {
    blockTokens = ['def', 'processar(x):', 'return', 'x * 2', 'function', 'const', 'val'];
    expectedBlockTokens = ['def', 'processar(x):', 'return', 'x * 2'];
    blockInstruction = `Organize os blocos para definir a função em Python (${level.title}):`;
  } else if (langUpper === 'GO') {
    blockTokens = ['func', 'executar(n int)', 'int', '{', 'return n * 2', '}', 'def', 'const'];
    expectedBlockTokens = ['func', 'executar(n int)', 'int', '{', 'return n * 2', '}'];
    blockInstruction = `Organize os blocos para declarar a função em Go (${level.title}):`;
  } else if (langUpper === 'RUST') {
    blockTokens = ['fn', 'executar(n: i32)', '->', 'i32', '{', 'n * 2', '}', 'def', 'var'];
    expectedBlockTokens = ['fn', 'executar(n: i32)', '->', 'i32', '{', 'n * 2', '}'];
    blockInstruction = `Organize os blocos para montar a função em Rust (${level.title}):`;
  } else if (langUpper === 'JAVA') {
    blockTokens = ['int', 'resultado', '=', 'calcular(10)', ';', 'var', 'const', 'def'];
    expectedBlockTokens = ['int', 'resultado', '=', 'calcular(10)', ';'];
    blockInstruction = `Organize os blocos para declarar a variável em Java (${level.title}):`;
  } else if (langUpper === 'TS') {
    blockTokens = ['const', 'total: number', '=', '100', ';', 'let', 'var', 'def'];
    expectedBlockTokens = ['const', 'total: number', '=', '100', ';'];
    blockInstruction = `Organize os blocos tipados em TypeScript (${level.title}):`;
  } else {
    blockTokens = ['const', 'resultado', '=', 'calcular(10)', ';', 'let', 'var', 'def'];
    expectedBlockTokens = ['const', 'resultado', '=', 'calcular(10)', ';'];
    blockInstruction = `Organize os blocos de código em JavaScript (${level.title}):`;
  }

  steps.push({
    id: `${level.levelNumber}-block-builder`,
    type: 'drag_drop',
    title: 'Monte o Código',
    instruction: blockInstruction,
    blockTokens,
    expectedBlockTokens,
    explanation: 'Excelente! Você organizou os blocos de código com a sintaxe correta.',
    xp: 20,
  });

  // Desafio final de código interativo e pedagógico da lição (sem resposta pré-preenchida)
  steps.push(generateTopicChallenge(level, langUpper));

  return {
    id: `${language.toLowerCase()}-l${level.levelNumber}`,
    title: level.title,
    description: level.description,
    language: langUpper,
    unitNumber: level.unitNumber,
    levelNumber: level.levelNumber,
    xpReward: steps.reduce((sum, s) => sum + s.xp, 0),
    difficulty:
      level.levelNumber > 10 ? 'avancado' : level.levelNumber > 5 ? 'intermediario' : 'iniciante',
    estimatedTime: `${Math.max(4, steps.length * 1.5)} min`,
    steps,
  };
}

function generateCurriculumChallenge(
  lessonId: string,
  pathSlug: string,
  sectionNumber: number,
  unitNumber: number,
  unit: { title: string; description: string },
  section: { title: string },
  langUpper: string
): LessonStep {
  const common = {
    id: `${lessonId}-s5`,
    type: 'code_editor' as const,
    title: `Desafio Prático: ${unit.title}`,
    xp: 25,
  };

  if (!['JS', 'TS'].includes(langUpper)) {
    const expectedOutput = `Dominado: ${unit.title}`;
    const languageTemplates: Record<string, { template: string; solution: string }> = {
      PYTHON: {
        template: `def resolver():\n    # Retorne o resultado de ${unit.title}\n    pass\n\nprint(resolver())\n`,
        solution: `def resolver():\n    return "${expectedOutput}"\n\nprint(resolver())`,
      },
      GO: {
        template: `package main\nimport "fmt"\n\nfunc resolver() string {\n  // Retorne o resultado de ${unit.title}\n  return ""\n}\n\nfunc main() { fmt.Println(resolver()) }`,
        solution: `package main\nimport "fmt"\n\nfunc resolver() string { return "${expectedOutput}" }\nfunc main() { fmt.Println(resolver()) }`,
      },
      RUST: {
        template: `fn resolver() -> &'static str {\n    // Retorne o resultado de ${unit.title}\n    ""\n}\n\nfn main() { println!("{}", resolver()); }`,
        solution: `fn resolver() -> &'static str { "${expectedOutput}" }\nfn main() { println!("{}", resolver()); }`,
      },
      JAVA: {
        template: `class Main {\n  static String resolver() {\n    // Retorne o resultado de ${unit.title}\n    return "";\n  }\n  public static void main(String[] args) { System.out.println(resolver()); }\n}`,
        solution: `class Main {\n  static String resolver() { return "${expectedOutput}"; }\n  public static void main(String[] args) { System.out.println(resolver()); }\n}`,
      },
    };
    const template = languageTemplates[langUpper] ?? languageTemplates.PYTHON;
    return {
      ...common,
      instruction: `Implemente \`resolver\` para concluir ${unit.title}, da seção ${section.title}.`,
      codeTemplate: template.template,
      solutionCode: template.solution,
      expectedOutput,
      hints: [`A saída deve ser exatamente "${expectedOutput}".`],
    };
  }

  if (pathSlug === 'frontend-react') {
    const includeSection = unitNumber % 2 === 0;
    const expectedOutput = includeSection ? `${unit.title} | ${section.title}` : unit.title;
    const items = `[{ label: "${unit.title}", visivel: true }, { label: "${section.title}", visivel: ${includeSection} }]`;
    return {
      ...common,
      instruction: `Implemente \`listarVisiveis\` para renderizar somente os itens visíveis do cenário "${unit.title}".`,
      codeTemplate: `function listarVisiveis(itens) {\n  // Filtre os itens visíveis e una os rótulos com " | "\n  \n}\n\nconsole.log(listarVisiveis(${items}));\n`,
      solutionCode: `function listarVisiveis(itens) {\n  return itens.filter((item) => item.visivel).map((item) => item.label).join(" | ");\n}\nconsole.log(listarVisiveis(${items}));`,
      expectedOutput,
      hints: ['Combine filter, map e join sem alterar a coleção original.'],
    };
  }

  if (pathSlug === 'javascript-systems') {
    const values = [unit.title, ` ${unit.title.toUpperCase()} `, section.title];
    const expectedOutput = [...new Set(values.map((value) => value.trim().toLowerCase()))]
      .sort()
      .join('|');
    return {
      ...common,
      instruction: `Implemente \`normalizarEventos\` para limpar, deduplicar e ordenar as entradas de "${unit.title}".`,
      codeTemplate: `function normalizarEventos(eventos) {\n  // Normalize, remova duplicatas e ordene\n  \n}\n\nconsole.log(normalizarEventos(${JSON.stringify(values)}));\n`,
      solutionCode: `function normalizarEventos(eventos) {\n  return [...new Set(eventos.map((evento) => evento.trim().toLowerCase()))].sort().join("|");\n}\nconsole.log(normalizarEventos(${JSON.stringify(values)}));`,
      expectedOutput,
      hints: ['Use trim, toLowerCase, Set e sort nesta ordem.'],
    };
  }

  if (pathSlug === 'algorithms') {
    const seed = sectionNumber * 10 + unitNumber;
    const values = [seed, seed + 3, seed - 2, seed + 5];
    const variants = [
      {
        instruction: 'retornar a soma de todos os valores',
        expression: 'valores.reduce((total, valor) => total + valor, 0)',
        expected: String(values.reduce((total, value) => total + value, 0)),
      },
      {
        instruction: 'retornar a diferença entre o maior e o menor valor',
        expression: 'Math.max(...valores) - Math.min(...valores)',
        expected: String(Math.max(...values) - Math.min(...values)),
      },
      {
        instruction: 'contar quantos valores são pares',
        expression: 'valores.filter((valor) => valor % 2 === 0).length',
        expected: String(values.filter((value) => value % 2 === 0).length),
      },
      {
        instruction: 'ordenar os valores em ordem crescente e uni-los com vírgula',
        expression: '[...valores].sort((a, b) => a - b).join(",")',
        expected: [...values].sort((a, b) => a - b).join(','),
      },
    ];
    const variant = variants[unitNumber - 1]!;
    return {
      ...common,
      instruction: `Em "${unit.title}", implemente \`resolver\` para ${variant.instruction}.`,
      codeTemplate: `function resolver(valores) {\n  // Resolva sem alterar o array recebido\n  \n}\n\nconsole.log(resolver(${JSON.stringify(values)}));\n`,
      solutionCode: `function resolver(valores) {\n  return ${variant.expression};\n}\nconsole.log(resolver(${JSON.stringify(values)}));`,
      expectedOutput: variant.expected,
      hints: [`O conjunto desta atividade possui ${values.length} valores.`],
    };
  }

  const status = 200 + unitNumber;
  const expectedOutput = `${status}:${unit.title}`;
  return {
    ...common,
    instruction: `Implemente \`resumirResposta\` para validar e resumir a resposta HTTP de "${unit.title}".`,
    codeTemplate: `function resumirResposta(resposta) {\n  // Aceite apenas status entre 200 e 299\n  \n}\n\nconsole.log(resumirResposta({ status: ${status}, recurso: "${unit.title}" }));\n`,
    solutionCode: `function resumirResposta(resposta) {\n  if (resposta.status < 200 || resposta.status >= 300) return "erro";\n  return \`${'${resposta.status}:${resposta.recurso}'}\`;\n}\nconsole.log(resumirResposta({ status: ${status}, recurso: "${unit.title}" }));`,
    expectedOutput,
    hints: ['Valide primeiro a faixa 2xx e só depois monte o resumo.'],
  };
}

export function buildCurriculumLesson(
  language: string,
  pathSlug: string,
  sectionNumber: number,
  unitNumber: number,
  unit: { title: string; description: string; kind: string },
  section: { title: string; goal: string },
  curriculum: { title: string }
): Lesson {
  const langUpper = language.toUpperCase();
  const lessonId = buildTrailLessonId(language, pathSlug, sectionNumber, unitNumber);
  const steps: LessonStep[] = [];

  // Gera um snippet inteligente baseado no tópico da unidade
  let snippet = `// ${unit.title} (${curriculum.title})\nconsole.log("Aplicando ${unit.title} em ${section.title}");`;
  const normTitle = unit.title.toLowerCase();
  const lessonSeed = sectionNumber * 10 + unitNumber;
  const activityKey = `etapa${sectionNumber}${unitNumber}`;
  const routePrinciples: Record<string, string> = {
    'frontend-react': 'Manter fluxo de dados explícito, acessibilidade e renderização previsível',
    'javascript-systems': 'Preservar contratos, controlar efeitos e tornar falhas observáveis',
    algorithms: 'Definir invariantes, analisar complexidade e cobrir casos-limite',
    'backend-data': 'Validar fronteiras, preservar consistência e responder com contratos claros',
  };
  const correctPrinciple = `${routePrinciples[pathSlug] ?? routePrinciples['javascript-systems']} em ${unit.title}`;
  const predictionOutput = `${activityKey}:${lessonSeed}`;
  const blockProfiles: Record<string, { tokens: string[]; expected: string[] }> = {
    'frontend-react': {
      tokens: ['const', activityKey, '=', '()', '=>', `"${unit.title}"`, ';', 'var', 'def'],
      expected: ['const', activityKey, '=', '()', '=>', `"${unit.title}"`, ';'],
    },
    'javascript-systems': {
      tokens: [
        'const',
        activityKey,
        '=',
        'Object.freeze',
        '({',
        'ready:',
        'true',
        '})',
        ';',
        'var',
      ],
      expected: ['const', activityKey, '=', 'Object.freeze', '({', 'ready:', 'true', '})', ';'],
    },
    algorithms: {
      tokens: [
        'const',
        activityKey,
        '=',
        `[${sectionNumber},`,
        `${unitNumber}]`,
        '.reduce',
        '((a,b)=>a+b)',
        ';',
        'sort',
      ],
      expected: [
        'const',
        activityKey,
        '=',
        `[${sectionNumber},`,
        `${unitNumber}]`,
        '.reduce',
        '((a,b)=>a+b)',
        ';',
      ],
    },
    'backend-data': {
      tokens: ['const', activityKey, '=', '{', 'status:', `${200 + unitNumber}`, '}', ';', 'fetch'],
      expected: ['const', activityKey, '=', '{', 'status:', `${200 + unitNumber}`, '}', ';'],
    },
  };
  const blockProfile = blockProfiles[pathSlug] ?? blockProfiles['javascript-systems'];

  if (
    normTitle.includes('component') ||
    normTitle.includes('prop') ||
    normTitle.includes('react') ||
    normTitle.includes('interface')
  ) {
    snippet = `// Exemplo: ${unit.title}\nfunction Item({ nome, ativo }: { nome: string; ativo: boolean }) {\n  return (\n    <div className={ativo ? "item-ativo" : "item"}>\n      <span>{nome}</span>\n    </div>\n  );\n}`;
  } else if (
    normTitle.includes('lista') ||
    normTitle.includes('array') ||
    normTitle.includes('chave') ||
    normTitle.includes('coleç')
  ) {
    snippet = `// Exemplo: ${unit.title}\nconst itens = [{ id: "a1", valor: 10 }, { id: "a2", valor: 20 }];\nconst total = itens.reduce((soma, item) => soma + item.valor, 0);\nconsole.log("Total:", total);`;
  } else if (
    normTitle.includes('estado') ||
    normTitle.includes('hook') ||
    normTitle.includes('effect')
  ) {
    snippet = `// Exemplo: ${unit.title}\nconst [contador, setContador] = useState(0);\nconst incrementar = () => setContador(c => c + 1);`;
  } else if (
    normTitle.includes('busca') ||
    normTitle.includes('binár') ||
    normTitle.includes('ordena')
  ) {
    snippet = `// Exemplo: ${unit.title}\nfunction buscaBinaria(arr, alvo) {\n  let inicio = 0, fim = arr.length - 1;\n  while (inicio <= fim) {\n    const meio = Math.floor((inicio + fim) / 2);\n    if (arr[meio] === alvo) return meio;\n    if (arr[meio] < alvo) inicio = meio + 1;\n    else fim = meio - 1;\n  }\n  return -1;\n}`;
  } else if (
    normTitle.includes('http') ||
    normTitle.includes('rota') ||
    normTitle.includes('api') ||
    normTitle.includes('serviço')
  ) {
    snippet = `// Exemplo: ${unit.title}\nexport async function GET(request: Request) {\n  return Response.json({ status: "ok", topico: "${unit.title}" });\n}`;
  } else if (
    normTitle.includes('banco') ||
    normTitle.includes('sql') ||
    normTitle.includes('postgres') ||
    normTitle.includes('transa')
  ) {
    snippet = `// Exemplo: ${unit.title}\nconst resultado = await prisma.user.findMany({\n  where: { status: "ACTIVE" },\n  orderBy: { created_at: "desc" },\n});`;
  }

  // 1. Explicação Conceitual
  steps.push({
    id: `${lessonId}-s1`,
    type: 'concept_explanation',
    title: unit.title,
    conceptText: `${unit.title} · ${section.title}\n\nNo contexto de **${curriculum.title}**, ${unit.description}\n\n- **Objetivo da Seção**: ${section.goal}.\n- **Foco Técnico**: Criar código modular, testável e de alta qualidade seguindo os padrões da indústria.`,
    codeSnippet: snippet,
    tip: `Boas práticas em ${unit.title}: defina contratos estritos e mantenha funções puras ou efeitos bem delimitados para garantir alta previsibilidade.`,
    xp: 20,
  });

  // 2. Fixação por Múltipla Escolha
  steps.push({
    id: `${lessonId}-s2`,
    type: 'multiple_choice',
    title: `Fixação: ${unit.title}`,
    question: `Qual decisão técnica atende melhor ao objetivo de "${unit.title}" na seção ${section.title}?`,
    options: [
      correctPrinciple,
      `Ocultar os casos-limite de ${unit.title} e depender apenas do caminho feliz`,
      `Misturar ${unit.title} com responsabilidades externas sem um contrato verificável`,
      `Otimizar ${unit.title} antes de medir comportamento, custo ou falhas`,
    ],
    correctOptionIndex: 0,
    explanation: `Correto: ${correctPrinciple}.`,
    hints: [`Relacione a resposta ao objetivo da seção: ${section.goal}.`],
    xp: 20,
  });

  // 3. Previsão de Saída / Lacunas
  steps.push({
    id: `${lessonId}-s3`,
    type: 'output_prediction',
    title: 'Prever a Saída',
    instruction: `Analise o identificador e a pontuação gerados para "${unit.title}":`,
    codeSnippet: `const ${activityKey} = { topico: "${unit.title}", pontos: ${lessonSeed} };\nconsole.log(${activityKey}.topico ? "${predictionOutput}" : "pendente");`,
    options: [predictionOutput, `${activityKey}:${lessonSeed + 1}`, 'pendente', 'TypeError'],
    correctOptionIndex: 0,
    explanation: `O tópico está preenchido, então a saída é ${predictionOutput}.`,
    xp: 20,
  });

  // 4. Montagem com Blocos (Duolingo Style Token Builder)
  steps.push({
    id: `${lessonId}-s4`,
    type: 'drag_drop',
    title: 'Monte o Código',
    instruction: `Organize os blocos para representar ${unit.title} no rumo ${curriculum.title}:`,
    blockTokens: blockProfile.tokens,
    expectedBlockTokens: blockProfile.expected,
    explanation: `Ótimo trabalho! A sintaxe para "${unit.title}" foi estruturada corretamente.`,
    xp: 20,
  });

  // 5. Desafio de Código Interativo
  steps.push(
    generateCurriculumChallenge(
      lessonId,
      pathSlug,
      sectionNumber,
      unitNumber,
      unit,
      section,
      langUpper
    )
  );

  return {
    id: lessonId,
    title: unit.title,
    description: unit.description,
    language: langUpper,
    unitNumber: sectionNumber,
    levelNumber: (sectionNumber - 1) * 4 + unitNumber,
    xpReward: steps.reduce((sum, s) => sum + s.xp, 0),
    difficulty: sectionNumber > 6 ? 'avancado' : sectionNumber > 3 ? 'intermediario' : 'iniciante',
    estimatedTime: '5 min',
    steps,
  };
}

export function findCurriculumLessonStepById(stepId: string) {
  const parsed = parseTrailLessonStepId(stepId);
  if (!parsed) return null;

  const curriculumData = findCurriculumUnit(
    parsed.pathSlug,
    parsed.sectionNumber,
    parsed.unitNumber
  );
  if (!curriculumData) return null;

  const language = parsed.language === 'PY' ? 'PYTHON' : parsed.language;
  const lesson =
    parsed.kind === 'code'
      ? buildCurriculumCodeLesson(
          language,
          parsed.pathSlug,
          parsed.sectionNumber,
          parsed.unitNumber,
          parsed.challengeSlot,
          curriculumData.unit,
          curriculumData.section,
          curriculumData.curriculum
        )
      : buildCurriculumLesson(
          language,
          parsed.pathSlug,
          parsed.sectionNumber,
          parsed.unitNumber,
          curriculumData.unit,
          curriculumData.section,
          curriculumData.curriculum
        );
  const step = lesson.steps.find((candidate) => candidate.id === stepId);
  return step ? { lesson, step } : null;
}

/**
 * Busca uma lição pelo ID (ex: "js-l1", "ts-l2", "js-frontend-react-s1-u1")
 */
export function getLessonById(lessonId: string): Lesson | null {
  const normId = lessonId.toLowerCase().trim();
  if (HANDCRAFTED_LESSONS[normId]) {
    return HANDCRAFTED_LESSONS[normId];
  }

  // 1. Tenta extrair lição de trilha/currículo e desafios de código exclusivos.
  const parsedLesson = parseTrailLessonId(normId);
  if (parsedLesson) {
    let langKey = parsedLesson.language;
    if (langKey === 'PY') langKey = 'PYTHON';
    const pathSlug = parsedLesson.pathSlug;
    const sectionNum = parsedLesson.sectionNumber;
    const unitNum = parsedLesson.unitNumber;

    const curriculumData = findCurriculumUnit(pathSlug, sectionNum, unitNum);
    if (curriculumData) {
      if (parsedLesson.kind === 'code') {
        return buildCurriculumCodeLesson(
          langKey,
          pathSlug,
          sectionNum,
          unitNum,
          parsedLesson.challengeSlot,
          curriculumData.unit,
          curriculumData.section,
          curriculumData.curriculum
        );
      }
      return buildCurriculumLesson(
        langKey,
        pathSlug,
        sectionNum,
        unitNum,
        curriculumData.unit,
        curriculumData.section,
        curriculumData.curriculum
      );
    }
  }

  // 2. Tenta extrair language e levelNumber do ID (ex: "js-l1" -> lang: "JS", level: 1)
  const match = /^([a-zA-Z]+)-l(\d+)$/i.exec(normId);
  if (match) {
    let langKey = match[1].toUpperCase();
    if (langKey === 'PY') langKey = 'PYTHON';
    const levelNum = parseInt(match[2], 10);

    const trailLevels = TRAILS_DATA[langKey];
    if (trailLevels) {
      const level = trailLevels.find((l) => l.levelNumber === levelNum);
      if (level) {
        return buildDynamicLesson(level, langKey);
      }
    }
  }

  // 3. Tenta checar se é um question ID legado (ex: "js-l1-q1")
  const questionContext = findTrailQuestionById(lessonId);
  if (questionContext) {
    return buildDynamicLesson(questionContext.level, questionContext.language);
  }

  // 4. Tenta encontrar por busca de currículo por título
  const foundCurriculumByTitle = findCurriculumUnitByTitle(lessonId);
  if (foundCurriculumByTitle) {
    return buildCurriculumLesson(
      'JS',
      foundCurriculumByTitle.pathSlug,
      foundCurriculumByTitle.sectionNumber,
      foundCurriculumByTitle.unitNumber,
      foundCurriculumByTitle.unit,
      foundCurriculumByTitle.section,
      foundCurriculumByTitle.curriculum
    );
  }

  // 5. Tenta encontrar o nível correspondente pelo slug/nome do exercício ou tópico em TRAILS_DATA
  const normalizedSearch = lessonId
    .toLowerCase()
    .replace(/[-_]/g, ' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  for (const [lang, levels] of Object.entries(TRAILS_DATA)) {
    const found = levels.find((l) => {
      const normTitle = l.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      return (
        normTitle.includes(normalizedSearch) ||
        normalizedSearch.includes(normTitle) ||
        lessonId.toLowerCase().includes(`l${l.levelNumber}`)
      );
    });
    if (found) {
      return buildDynamicLesson(found, lang);
    }
  }

  // 6. Fallback por prefixo de linguagem (ex: "js-...", "ts-...", "python-...")
  for (const lang of ['JS', 'TS', 'PYTHON', 'RUST', 'GO', 'JAVA']) {
    if (
      lessonId.toUpperCase().startsWith(lang) ||
      lessonId.toLowerCase().startsWith(lang.toLowerCase())
    ) {
      const trail = TRAILS_DATA[lang];
      if (trail && trail.length > 0) {
        return buildDynamicLesson(trail[0], lang);
      }
    }
  }

  // 7. Fallback geral: nível 1 da trilha JS
  if (TRAILS_DATA.JS?.[0]) {
    return buildDynamicLesson(TRAILS_DATA.JS[0], 'JS');
  }

  return null;
}

// Server-only answer bank. Never import this module into a client component or mobile bundle.
import type { BattleLanguage, PublicQuestion } from './types';
type Question = PublicQuestion & { language: BattleLanguage; answer: number; explanation: string };
type Row = [string, string, string[], number, string];
const rows: Record<BattleLanguage, Row[]> = {
  PYTHON: [
    [
      'Condicionais',
      'Qual é o resultado de: "par" if 7 % 2 == 0 else "ímpar"?',
      ['par', 'ímpar', 'True', '0'],
      1,
      '7 % 2 é 1. A condição é falsa e a expressão escolhe o valor depois de else.',
    ],
    [
      'Listas',
      'valores = [4, 8, 12]\nQual é valores[-1]?',
      ['4', '8', '12', 'Erro'],
      2,
      'Índices negativos contam a partir do final; -1 acessa o último elemento.',
    ],
    [
      'Repetição',
      'Qual é sum(range(1, 4))?',
      ['10', '6', '4', '3'],
      1,
      'range(1, 4) produz 1, 2 e 3. O limite final é exclusivo.',
    ],
    [
      'Funções',
      'def dobro(x):\n    return x * 2\nQual é dobro(3) + 1?',
      ['7', '8', '6', '4'],
      0,
      'A chamada retorna 6; depois a expressão soma 1.',
    ],
    [
      'Referências',
      'a = [1]\nb = a\nb.append(2)\nQual é a?',
      ['[1]', '[2]', '[1, 2]', 'None'],
      2,
      'a e b apontam para a mesma lista mutável. append modifica essa lista.',
    ],
    [
      'Argumentos',
      'Por que evitar def f(itens=[]): itens.append(1)?',
      [
        'Listas são imutáveis',
        'O padrão é criado uma vez e compartilhado entre chamadas',
        'append retorna uma lista nova',
        'Python proíbe listas como argumento',
      ],
      1,
      'Argumentos padrão são avaliados na definição. Use None e crie uma nova lista dentro da função.',
    ],
  ],
  HTML: [
    [
      'Semântica',
      'Qual elemento representa a navegação principal?',
      ['<nav>', '<span>', '<b>', '<br>'],
      0,
      'nav identifica uma seção de links de navegação para navegadores e tecnologias assistivas.',
    ],
    [
      'Formulários',
      'Como associar um label ao input com id="email"?',
      [
        '<label name="email">',
        '<label for="email">',
        '<label src="email">',
        '<label href="email">',
      ],
      1,
      'O atributo for referencia o id do controle e dá a ele um nome acessível.',
    ],
    [
      'Imagens',
      'Qual alt usar em uma imagem puramente decorativa?',
      ['alt="imagem"', 'Omitir alt sempre', 'alt=""', 'alt="decorativa"'],
      2,
      'alt vazio permite que leitores de tela ignorem a imagem decorativa.',
    ],
    [
      'Botões',
      'Qual type evita que um botão dentro de form envie o formulário?',
      ['type="button"', 'type="submit"', 'type="reset"', 'type="none"'],
      0,
      'button não executa a ação padrão de submit. reset limparia os campos.',
    ],
    [
      'Acessibilidade',
      'Para um botão apenas com ícone, qual opção fornece um nome acessível?',
      ['title vazio', 'aria-label="Fechar"', 'role="icon"', 'tabindex="-1"'],
      1,
      'aria-label dá um nome ao controle. O botão nativo já fornece semântica e teclado.',
    ],
    [
      'Validação',
      'Por que required no HTML não substitui validação no servidor?',
      [
        'required só funciona com CSS',
        'HTML não aceita formulários',
        'O cliente pode ser contornado e enviar requisições diretamente',
        'O navegador sempre remove required',
      ],
      2,
      'A validação do navegador melhora a experiência, mas toda entrada precisa ser validada no servidor.',
    ],
  ],
  CSS: [
    [
      'Seletores',
      'Qual seletor seleciona elementos com class="ativo"?',
      ['#ativo', '.ativo', 'ativo()', '@ativo'],
      1,
      'O ponto indica classe. # seleciona id.',
    ],
    [
      'Box model',
      'Com box-sizing: border-box, width inclui o quê?',
      ['Só conteúdo', 'Conteúdo e margem', 'Conteúdo, padding e borda', 'Margem e borda apenas'],
      2,
      'border-box inclui padding e borda na largura especificada, mas não a margem.',
    ],
    [
      'Flexbox',
      'Em flex-direction: row, qual propriedade distribui itens no eixo horizontal?',
      ['align-items', 'justify-content', 'font-align', 'vertical-align'],
      1,
      'justify-content atua no eixo principal; com row, esse eixo é horizontal.',
    ],
    [
      'Grid',
      'O que grid-template-columns: repeat(3, 1fr) cria?',
      ['Três colunas de frações iguais', 'Três linhas fixas', 'Uma coluna de 3px', 'Três margens'],
      0,
      'repeat repete a definição; 1fr distribui o espaço disponível em três frações.',
    ],
    [
      'Responsividade',
      'Qual regra se aplica em viewports de até 600px?',
      ['@media (min-width: 600px)', '@media (max-width: 600px)', '@screen 600', '@viewport small'],
      1,
      'max-width estabelece um limite superior inclusivo para a largura do viewport.',
    ],
    [
      'Especificidade',
      'Sem !important ou camadas, qual seletor vence sobre .card para o mesmo elemento?',
      ['div', '*', '#principal', ':where(.card)'],
      2,
      'Um seletor de id tem especificidade maior que um seletor de classe. :where tem especificidade zero.',
    ],
  ],
  JS: [
    [
      'Variáveis',
      'Qual declaração permite reatribuir uma variável com escopo de bloco?',
      ['let', 'const', 'static', 'def'],
      0,
      'let permite reatribuição e respeita o escopo de bloco. const impede reatribuir a referência.',
    ],
    [
      'Arrays',
      'Qual é [2, 4, 6].map(n => n / 2)?',
      ['[2, 4, 6]', '[1, 2, 3]', '6', '[0, 2, 4]'],
      1,
      'map cria um novo array com o resultado da função para cada elemento.',
    ],
    [
      'Igualdade',
      'Qual é o resultado de 0 === false?',
      ['true', 'false', '0', 'Erro'],
      1,
      'A igualdade estrita não converte tipos: número e booleano são diferentes.',
    ],
    [
      'Objetos',
      'const a = { n: 1 };\nconst b = a;\nb.n = 2;\nQual é a.n?',
      ['1', '2', 'undefined', 'Erro'],
      1,
      'Ambas as variáveis referenciam o mesmo objeto. const impede reatribuir a variável, não mutar propriedades.',
    ],
    [
      'Promises',
      'O que uma função async sempre retorna?',
      ['Um número', 'Uma Promise', 'Uma string', 'Uma callback'],
      1,
      'Mesmo ao retornar um valor simples, uma função async o encapsula em uma Promise.',
    ],
    [
      'Event loop',
      'console.log(1);\nPromise.resolve().then(() => console.log(2));\nconsole.log(3);\nQual é a ordem?',
      ['1, 2, 3', '2, 1, 3', '1, 3, 2', '3, 2, 1'],
      2,
      'O código síncrono termina primeiro. A callback da Promise executa depois, como microtarefa.',
    ],
  ],
  TS: [
    [
      'Tipos',
      'Qual anotação representa uma lista de números?',
      ['number[]', 'number{}', 'list(number)', 'Array<string>'],
      0,
      'number[] e Array<number> representam arrays cujos elementos são números.',
    ],
    [
      'Union types',
      'Qual tipo aceita uma string OU um número?',
      ['string & number', 'string | number', 'string + number', 'string / number'],
      1,
      'O operador | forma uma união: o valor pode pertencer a qualquer um dos tipos.',
    ],
    [
      'Interfaces',
      'Em interface User { name?: string }, o que ? significa?',
      ['name é privado', 'name é obrigatório', 'name é opcional', 'name aceita somente null'],
      2,
      'A propriedade pode estar ausente. Ao lê-la, trate a possibilidade de undefined.',
    ],
    [
      'Narrowing',
      'Como restringir x: string | number para string?',
      [
        'if (x as string)',
        'if (typeof x === "string")',
        'if (x == String)',
        'if (type x = string)',
      ],
      1,
      'typeof é um type guard; dentro desse bloco o compilador conhece x como string.',
    ],
    [
      'Genéricos',
      'Qual função preserva o tipo recebido no retorno?',
      [
        'function id(x: any): any',
        'function id<T>(x: T): T',
        'function id(x: unknown): string',
        'function id(x: object): object',
      ],
      1,
      'O parâmetro genérico T conecta o tipo da entrada ao tipo de saída, sem perder informação.',
    ],
    [
      'Runtime',
      'Uma interface TypeScript valida automaticamente JSON recebido da rede?',
      ['Sim, sempre', 'Só em produção', 'Não; é necessário validar em runtime', 'Sim, com as User'],
      2,
      'Interfaces são apagadas na compilação. Uma asserção as também não valida dados; use um validador em runtime.',
    ],
  ],
};
export const QUESTIONS: Question[] = Object.entries(rows).flatMap(([language, entries]) =>
  entries.map(([concept, prompt, options, answer, explanation], i) => ({
    id: `${language}-${i}`,
    language: language as BattleLanguage,
    concept,
    prompt,
    options,
    answer,
    explanation,
    difficulty: i < 2 ? 'Fácil' : i < 4 ? 'Intermediário' : 'Avançado',
  }))
);
export function publicQuestion(q: Question): PublicQuestion {
  return {
    id: q.id,
    concept: q.concept,
    prompt: q.prompt,
    options: q.options,
    difficulty: q.difficulty,
  };
}

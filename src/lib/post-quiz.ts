import 'server-only';

export type QuizSourcePost = {
  id: string;
  title: string;
  body: string;
  language: string | null;
  created_at: Date;
};

type PostQuiz = {
  post_id: string;
  question: string;
  options: string[];
  correct_index: number;
};

type ReviewedQuestion = {
  id: string;
  language?: string;
  context?: RegExp;
  evidence: readonly RegExp[];
  question: string;
  options: readonly string[];
  correct_index: number;
};

// Answer keys are reviewed content, never assertions extracted from a user's post.
// Matching recognizes an explained topic; it does not certify the post's accuracy.
const REVIEWED_QUESTIONS: readonly ReviewedQuestion[] = [
  {
    id: 'js-typeof-null',
    language: 'JS',
    context: /\b(?:javascript|js)\b/,
    evidence: [
      /(?:\btypeof\b.{0,100}\bnull\b|\bnull\b.{0,100}\btypeof\b)/,
      /\bobject\b/,
      /\b(?:retorn\w*|returns?|result\w*|produz\w*|produces?)\b/,
    ],
    question: 'Em JavaScript, qual string é retornada pela expressão typeof null?',
    options: ['null', 'undefined', 'object', 'string'],
    correct_index: 2,
  },
  {
    id: 'js-const-binding',
    language: 'JS',
    context: /\b(?:javascript|js|typescript|ts)\b/,
    evidence: [
      /\bconst\b/,
      /\b(?:reatribu\w*|reassign\w*)\b/,
      /\b(?:nao|impede|cannot|prevents?)\b/,
    ],
    question: 'Qual é o efeito de declarar uma variável com const em JavaScript?',
    options: [
      'Torna qualquer objeto referenciado completamente imutável.',
      'Impede reatribuir a variável, mas não impede alterar um objeto referenciado.',
      'Permite reatribuição apenas dentro de funções.',
      'Transforma o valor automaticamente em uma string.',
    ],
    correct_index: 1,
  },
  {
    id: 'ts-generic-constraint',
    language: 'TS',
    context: /\b(?:typescript|ts)\b/,
    evidence: [
      /\b(?:generic\w*|generico\w*)\b/,
      /\bextends\b/,
      /\b(?:restring\w*|restri\w*|limit\w*|constraint\w*|constrain\w*)\b/,
    ],
    question:
      'Qual palavra-chave define uma restrição em um parâmetro de tipo genérico no TypeScript?',
    options: ['implements', 'extends', 'typeof', 'declare'],
    correct_index: 1,
  },
  {
    id: 'python-list-comprehension',
    language: 'PYTHON',
    context: /\bpython\b/,
    evidence: [
      /\b(?:list comprehensions?|compreens\w* (?:de )?listas?)\b/,
      /\b(?:cri\w*|constru\w*|ger\w*|creat\w*|build\w*|transform\w*)\b/,
    ],
    question: 'Qual expressão usa list comprehension para dobrar os números de values em Python?',
    options: [
      'values.map(n => n * 2)',
      '[n * 2 for n in values]',
      '{n * 2 from values}',
      'values.each(n * 2)',
    ],
    correct_index: 1,
  },
  {
    id: 'java-string-builder',
    language: 'JAVA',
    context: /\bjava\b/,
    evidence: [
      /\bstringbuilder\b/,
      /\b(?:mutav\w*|mutable|concat\w*|append|modific\w*|alter\w*)\b/,
    ],
    question: 'Qual classe representa uma sequência mutável de caracteres em Java?',
    options: ['String', 'Integer', 'StringBuilder', 'Character'],
    correct_index: 2,
  },
  {
    id: 'rust-ownership',
    language: 'RUST',
    context: /\brust\b/,
    evidence: [
      /\b(?:ownership|posse|propriedade)\b/,
      /\b(?:memoria|memory|emprest\w*|borrow\w*)\b/,
      /\b(?:compila\w*|compile\w*|gerenc\w*|garant\w*|manage\w*|check\w*)\b/,
    ],
    question:
      'Qual mecanismo do Rust gerencia os valores com regras verificadas durante a compilação?',
    options: [
      'Ownership (posse)',
      'Coletor de lixo obrigatório',
      'Chamadas obrigatórias a free()',
      'Herança de classes',
    ],
    correct_index: 0,
  },
  {
    id: 'go-goroutine',
    language: 'GO',
    context: /\b(?:go|golang)\b/,
    evidence: [
      /\bgoroutines?\b/,
      /\b(?:concorr\w*|concurr\w*)\b/,
      /\b(?:execut\w*|inici\w*|roda\w*|launch\w*|start\w*|agend\w*|schedul\w*)\b/,
    ],
    question: 'Qual palavra-chave inicia a execução de uma função em uma nova goroutine em Go?',
    options: ['async', 'thread', 'go', 'await'],
    correct_index: 2,
  },
  {
    id: 'kotlin-safe-call',
    language: 'KOTLIN',
    context: /\bkotlin\b/,
    evidence: [
      /(?:\?\.|\bsafe calls?\b|\bchamad\w* segur\w*\b)/,
      /\b(?:null|nul[oa]\w*)\b/,
      /\b(?:evit\w*|acess\w*|retorn\w*|returns?|permite|allows?)\b/,
    ],
    question:
      'Qual operador do Kotlin permite acessar um membro somente quando a referência não é null?',
    options: ['!!', '?:', '?.', '::'],
    correct_index: 2,
  },
  {
    id: 'swift-let',
    language: 'SWIFT',
    context: /\bswift\b/,
    evidence: [/\blet\b/, /\b(?:constant\w*|imutav\w*|immutable|reatribu\w*|reassign\w*)\b/],
    question: 'Qual palavra-chave declara uma constante em Swift?',
    options: ['var', 'let', 'const', 'val'],
    correct_index: 1,
  },
  {
    id: 'cpp-delete',
    language: 'CPP',
    context: /(?:\bc\+\+|\bcpp\b)/,
    evidence: [
      /\bnew\b/,
      /\bdelete\b/,
      /\b(?:memoria|memory)\b/,
      /\b(?:liber\w*|desaloc\w*|free\w*|dealloc\w*)\b/,
    ],
    question: 'Em C++, qual operador libera um único objeto alocado com new (sem colchetes)?',
    options: ['free', 'delete[]', 'delete', 'remove'],
    correct_index: 2,
  },
  {
    id: 'sql-is-null',
    context: /\b(?:sql|postgres\w*|mysql|sqlite)\b/,
    evidence: [/\bis null\b/, /\b(?:verific\w*|test\w*|filtr\w*|select\w*|encontr\w*)\b/],
    question: 'Em SQL, qual condição seleciona linhas em que a coluna email possui valor nulo?',
    options: ["email = 'null'", 'email = NULL', 'email IS NULL', 'email == undefined'],
    correct_index: 2,
  },
  {
    id: 'sql-index',
    context:
      /\b(?:sql|postgres\w*|mysql|sqlite|banco\w* (?:de dados )?relaciona\w*|relational database\w*)\b/,
    evidence: [
      /\b(?:indice\w*|index\w*)\b/,
      /\b(?:consult\w*|query|queries)\b/,
      /\b(?:aceler\w*|otimiz\w*|speed\w*|faster|improv\w*)\b/,
    ],
    question: 'Qual é um propósito comum de um índice em uma tabela de banco de dados relacional?',
    options: [
      'Criptografar automaticamente todas as colunas.',
      'Acelerar a localização de dados em consultas.',
      'Substituir todas as chaves estrangeiras.',
      'Eliminar o custo das operações de escrita.',
    ],
    correct_index: 1,
  },
  {
    id: 'git-clone',
    evidence: [
      /\bgit clone\b/,
      /\brepositor\w*\b/,
      /\b(?:copi\w*|clon\w*|copy|copies|download\w*|cri\w*|creat\w*)\b/,
    ],
    question: 'Qual comando do Git cria uma cópia local de um repositório existente?',
    options: ['git clone', 'git add', 'git status', 'git init'],
    correct_index: 0,
  },
  {
    id: 'git-staging',
    evidence: [
      /\bgit add\b/,
      /\b(?:staging|index|indice|area de preparacao)\b/,
      /\b(?:prepar\w*|adicion\w*|inclu\w*|stage\w*|select\w*)\b/,
    ],
    question: 'O que o comando git add faz com as alterações selecionadas?',
    options: [
      'Publica as alterações no servidor remoto.',
      'Cria um commit automaticamente.',
      'Prepara as alterações no staging para o próximo commit.',
      'Apaga o histórico do repositório.',
    ],
    correct_index: 2,
  },
  {
    id: 'http-post',
    context: /\b(?:http|https|api|requisic\w*|requests?)\b/,
    evidence: [/\bpost\b/, /\b(?:recurso\w*|resources?)\b/, /\b(?:cri\w*|creat\w*)\b/],
    question:
      'Qual método HTTP costuma ser usado para enviar dados para criar um novo recurso em uma API?',
    options: ['GET', 'POST', 'HEAD', 'OPTIONS'],
    correct_index: 1,
  },
  {
    id: 'http-not-found',
    context: /\b(?:http|https|api|requisic\w*|requests?)\b/,
    evidence: [/\b404\b/, /\b(?:nao (?:foi |foram |e |esta )?encontrad\w*|not found)\b/],
    question: 'O que o código de status HTTP 404 normalmente indica?',
    options: [
      'Requisição concluída com sucesso.',
      'Redirecionamento permanente.',
      'Recurso solicitado não encontrado.',
      'Autenticação concluída.',
    ],
    correct_index: 2,
  },
  {
    id: 'stack-lifo',
    evidence: [
      /\b(?:pilha\w*|stacks?)\b/,
      /\b(?:lifo|ultimo a entrar|last in first out)\b/,
      /\b(?:sai\w*|retir\w*|remov\w*|out|follows?|segue|funciona|opera)\b/,
    ],
    question: 'Em uma pilha que segue LIFO, qual elemento é removido primeiro?',
    options: [
      'O elemento mais antigo.',
      'O elemento inserido mais recentemente.',
      'O elemento com menor valor.',
      'Um elemento aleatório.',
    ],
    correct_index: 1,
  },
  {
    id: 'queue-fifo',
    evidence: [
      /\b(?:fila\w*|queues?)\b/,
      /\b(?:fifo|primeiro a entrar|first in first out)\b/,
      /\b(?:sai\w*|retir\w*|remov\w*|out|follows?|segue|funciona|opera)\b/,
    ],
    question: 'Em uma fila que segue FIFO, qual elemento é removido primeiro?',
    options: [
      'O elemento inserido mais recentemente.',
      'O elemento com maior valor.',
      'O elemento inserido há mais tempo.',
      'Um elemento aleatório.',
    ],
    correct_index: 2,
  },
];

const HTML_ENTITIES: Readonly<Record<string, string>> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  aacute: 'á',
  eacute: 'é',
  iacute: 'í',
  oacute: 'ó',
  uacute: 'ú',
  atilde: 'ã',
  otilde: 'õ',
  acirc: 'â',
  ecirc: 'ê',
  ocirc: 'ô',
  ccedil: 'ç',
};

function explanatoryText(body: string): string {
  return body
    .slice(0, 5000)
    .replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (_, entity: string) => {
      if (!entity.startsWith('#')) return HTML_ENTITIES[entity.toLowerCase()] ?? ' ';
      const hexadecimal = entity[1]?.toLowerCase() === 'x';
      const codePoint = Number.parseInt(entity.slice(hexadecimal ? 2 : 1), hexadecimal ? 16 : 10);
      return codePoint > 0 && codePoint <= 0x10ffff ? String.fromCodePoint(codePoint) : ' ';
    })
    .replace(/<!--[\s\S]*?(?:-->|$)/g, ' ')
    .replace(/<(script|style|pre|template)\b[^>]*>[\s\S]*?(?:<\/\1\s*>|$)/gi, ' ')
    .replace(/<a\b[^>]*>[\s\S]*?(?:<\/a\s*>|$)/gi, ' ')
    .replace(/```[\s\S]*?(?:```|$)|~~~[\s\S]*?(?:~~~|$)/g, ' ')
    .replace(/!?\[[^\]]*\]\([^)]*\)|!?\[[^\]]*\]\[[^\]]*\]/g, ' ')
    .replace(/^\s*\[[^\]]+\]:.*$/gm, ' ')
    .replace(/<https?:\/\/[^>]*>|https?:\/\/[^\s<>]+/gi, ' ')
    .replace(/<\/?(?:p|div|li|br|h[1-6])\b[^>]*>/gi, '\n')
    .replace(/<[^>]*>/g, ' ')
    .replace(/^(?: {4}|\t|\s*>|\s*\/\/|\s*\/\*|\s*\*\/).*$/gm, ' ')
    .replace(
      /^\s*(?:(?:const|let|var)\s+[\w$]+\s*[:=]|(?:def|class|function|fn|func)\s+\w+\s*[({<:]|(?:import|from|package)\s+[\w'{*]|return\s+|(?:console|System\.out)\.|(?:print|printf|println)\s*\().*$/gm,
      ' '
    )
    .replace(/(?:^|\s)[#@][\p{L}\p{N}_-]+/gu, ' ')
    .replace(/[`*_~]/g, '')
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase();
}

function wordCount(text: string): number {
  return text.match(/\p{L}[\p{L}\p{N}_-]*/gu)?.length ?? 0;
}

const PROMOTIONAL_TEXT =
  /\b(?:compre|comprem|comprar|inscrev\w*|matricul\w*|desconto\w*|promocao|patrocinad\w*|buy|enroll\w*|subscribe|sponsored|discount\w*|meu curso|minha aula|my course|link na bio|link in bio)\b/;

function stableRank(value: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash = Math.imul(hash ^ value.charCodeAt(index), 0x01000193);
  }
  return hash >>> 0;
}

/** Selects a reviewed question about an explained topic, with no random fallback. */
export function selectPostQuiz(
  posts: readonly QuizSourcePost[],
  scheduledFor: Date
): PostQuiz | null {
  if (!Number.isFinite(scheduledFor.getTime())) return null;
  const day = scheduledFor.toISOString().slice(0, 10);
  let selected: { postId: string; question: ReviewedQuestion; rank: number; key: string } | null =
    null;

  for (const post of posts) {
    const text = explanatoryText(post.body);
    if (text.trim().length < 100 || wordCount(text) < 18) continue;
    const passages = text
      .split(/(?<=[.!?])(?<!\?\.)\s+|\n+/)
      .filter(
        (passage) =>
          passage.trim().length >= 70 &&
          wordCount(passage) >= 12 &&
          !passage.trim().endsWith('?') &&
          !PROMOTIONAL_TEXT.test(passage)
      );

    for (const question of REVIEWED_QUESTIONS) {
      const matches = passages.some((passage) => {
        const hasContext =
          !question.context ||
          question.context.test(passage) ||
          (question.language !== undefined && post.language === question.language);
        return hasContext && question.evidence.every((pattern) => pattern.test(passage));
      });
      if (!matches) continue;

      const key = `${post.id}:${question.id}`;
      const rank = stableRank(`${day}:${key}`);
      if (!selected || rank < selected.rank || (rank === selected.rank && key < selected.key)) {
        selected = { postId: post.id, question, rank, key };
      }
    }
  }

  return selected
    ? {
        post_id: selected.postId,
        question: selected.question.question,
        options: [...selected.question.options],
        correct_index: selected.question.correct_index,
      }
    : null;
}

import { describe, expect, it } from 'vitest';
import { selectPostQuiz, type QuizSourcePost } from '../post-quiz';

const day = new Date('2026-10-16T00:00:00.000Z');

function post(body: string, overrides: Partial<QuizSourcePost> = {}): QuizSourcePost {
  return {
    id: 'post-1',
    title: 'Uma publicação da comunidade',
    body,
    language: null,
    created_at: new Date('2026-10-15T12:00:00.000Z'),
    ...overrides,
  };
}

const technicalPosts = [
  [
    'JavaScript typeof',
    'Em JavaScript, a expressão `typeof null` retorna a string `object` por uma particularidade histórica da linguagem, então essa comparação não identifica sozinha todos os valores nulos.',
    'qual string',
    'object',
  ],
  [
    'JavaScript const',
    'Em JavaScript, declarar uma variável com `const` impede reatribuir a referência, mas as propriedades de um objeto armazenado nela ainda podem ser alteradas durante a execução.',
    'efeito de declarar',
    'Impede reatribuir a variável, mas não impede alterar um objeto referenciado.',
  ],
  [
    'TypeScript',
    'No TypeScript, a palavra `extends` permite restringir um parâmetro genérico para que ele aceite somente tipos que cumpram a estrutura exigida pela função, mantendo a checagem estática.',
    'restrição',
    'extends',
  ],
  [
    'Python',
    'Em Python, uma list comprehension permite criar uma lista transformando os elementos de outra coleção, com uma expressão que reúne o cálculo e a iteração de maneira concisa e legível.',
    'list comprehension',
    '[n * 2 for n in values]',
  ],
  [
    'Java',
    'Em Java, a classe StringBuilder representa uma sequência mutável de caracteres e permite concatenar partes de um texto por meio de append, evitando criar uma nova String em cada etapa.',
    'sequência mutável',
    'StringBuilder',
  ],
  [
    'Rust',
    'Em Rust, ownership e borrowing permitem gerenciar a memória com regras verificadas durante a compilação, restringindo o uso das referências para que elas respeitem a duração dos valores.',
    'mecanismo do Rust',
    'Ownership (posse)',
  ],
  [
    'Go',
    'Em Go, as goroutines executam funções de forma concorrente e são iniciadas com a palavra go, enquanto o runtime agenda essas tarefas sem exigir uma thread dedicada para cada função.',
    'goroutine',
    'go',
  ],
  [
    'Kotlin',
    'Em Kotlin, o operador de chamada segura `?.` permite acessar uma propriedade quando a referência não é null e retorna null quando a referência é nula, evitando esse acesso inválido.',
    'operador do Kotlin',
    '?.',
  ],
  [
    'Swift',
    'Em Swift, a palavra let declara uma constante cujo valor não pode ser reatribuído depois da inicialização, deixando explícita a intenção de manter essa associação estável ao longo do código.',
    'constante em Swift',
    'let',
  ],
  [
    'C++',
    'Em C++, o operador delete libera a memória de um único objeto alocado com new, e a variante delete com colchetes deve acompanhar uma alocação de array para usar a forma correspondente.',
    'único objeto',
    'delete',
  ],
  [
    'SQL null',
    'Em SQL, a condição IS NULL permite verificar se uma coluna contém um valor nulo e filtrar essas linhas, porque a comparação com igualdade não trata NULL como um valor comum.',
    'valor nulo',
    'email IS NULL',
  ],
  [
    'SQL index',
    'No PostgreSQL, um índice pode acelerar a localização de registros em consultas que filtram uma coluna, embora o banco também precise manter essa estrutura durante alterações nos dados.',
    'propósito comum',
    'Acelerar a localização de dados em consultas.',
  ],
  [
    'Git clone',
    'O comando git clone cria uma cópia local de um repositório existente, trazendo seu histórico de commits e configurando normalmente a origem remota para permitir novas sincronizações.',
    'cópia local',
    'git clone',
  ],
  [
    'Git staging',
    'O comando git add adiciona as alterações selecionadas ao staging, preparando o conteúdo que fará parte do próximo commit sem publicar automaticamente essas mudanças em um servidor remoto.',
    'git add',
    'Prepara as alterações no staging para o próximo commit.',
  ],
  [
    'HTTP POST',
    'Em uma API HTTP, o método POST costuma enviar os dados necessários para criar um novo recurso no servidor, enquanto a resposta informa o resultado do processamento dessa requisição.',
    'método HTTP',
    'POST',
  ],
  [
    'HTTP 404',
    'Em HTTP, o status 404 informa que o recurso solicitado não foi encontrado no servidor, permitindo que o cliente apresente uma mensagem adequada quando aquele endereço não está disponível.',
    'status HTTP 404',
    'Recurso solicitado não encontrado.',
  ],
  [
    'Stack',
    'Uma pilha segue o modelo LIFO, no qual o último elemento a entrar é o primeiro a sair, uma organização usada para controlar chamadas de funções e operações que precisam ser desfeitas.',
    'pilha que segue LIFO',
    'O elemento inserido mais recentemente.',
  ],
  [
    'Queue',
    'Uma fila segue o modelo FIFO, no qual o primeiro elemento a entrar é o primeiro a sair, preservando a ordem de chegada durante o processamento sequencial de solicitações pendentes.',
    'fila que segue FIFO',
    'O elemento inserido há mais tempo.',
  ],
] as const;

describe('selectPostQuiz', () => {
  it.each(technicalPosts)(
    'matches reviewed %s content from explanatory prose',
    (_topic, body, question, answer) => {
      const quiz = selectPostQuiz([post(body)], day);

      expect(quiz).toMatchObject({
        post_id: 'post-1',
        question: expect.stringContaining(question),
      });
      expect(quiz?.options[quiz.correct_index]).toBe(answer);
      expect(quiz?.options).toHaveLength(4);
    }
  );

  it('recognizes an explanation written in English', () => {
    const body =
      'In TypeScript, the extends keyword constrains a generic parameter so that callers can only supply types satisfying the required structure, preserving static checks throughout the function body.';
    const quiz = selectPostQuiz([post(body)], day);

    expect(quiz?.question).toContain('TypeScript');
    expect(quiz?.options[quiz.correct_index]).toBe('extends');
  });

  it('recognizes a typeof null explanation with words between the operator and its operand', () => {
    const body =
      'No JavaScript, o operador typeof retorna a string object quando recebe null por causa de um comportamento histórico da linguagem. Para identificar valores nulos com segurança, use a comparação estrita antes de acessar propriedades de um objeto.';
    const quiz = selectPostQuiz([post(body)], day);

    expect(quiz?.question).toContain('typeof null');
    expect(quiz?.options[quiz.correct_index]).toBe('object');
  });

  it('uses language metadata only to disambiguate an explained concept', () => {
    const body =
      'A declaração `const` impede reatribuir a variável depois da inicialização, mas um objeto referenciado ainda permite modificar suas propriedades, pois a restrição se aplica à associação e não ao conteúdo.';
    expect(selectPostQuiz([post(body, { language: 'JS' })], day)?.question).toContain('JavaScript');
    expect(selectPostQuiz([post(body)], day)).toBeNull();
  });

  it('recognizes Markdown formatting and HTML text without using attributes as evidence', () => {
    const markdown = `## Explicação técnica\n\n${technicalPosts[2][1].replace('TypeScript', '**TypeScript**')}\n\n[Documentação](https://example.com/docs)`;
    const html =
      '<p>Em <strong>JavaScript</strong>, declarar uma variável com <code>const</code> impede reatribuir a referência, mas isso n&atilde;o torna um objeto referenciado imutável, pois as propriedades continuam permitindo alterações.</p>';

    expect(selectPostQuiz([post(markdown)], day)?.question).toContain('TypeScript');
    expect(selectPostQuiz([post(html)], day)?.question).toContain('const');
  });

  it.each([
    ['a short technical fragment', 'JavaScript typeof null retorna object.'],
    [
      'links only',
      'https://example.com/javascript/typeof-null-returns-object\nhttps://example.com/typescript/generic-extends-constraint',
    ],
    ['a technical link label', `[${technicalPosts[0][1]}](https://example.com)`],
    ['an HTML link label', `<a href="https://example.com">${technicalPosts[0][1]}</a>`],
    [
      'hashtags only',
      '#JavaScript #typeof #null #object #TypeScript #extends #generics '.repeat(5),
    ],
    [
      'fenced code',
      `\`\`\`javascript\n// ${technicalPosts[0][1]}\nconsole.log(typeof null);\n\`\`\``,
    ],
    [
      'tilde fenced code',
      `~~~javascript\n// ${technicalPosts[0][1]}\nconsole.log(typeof null);\n~~~`,
    ],
    ['an unclosed code fence', `\`\`\`javascript\n// ${technicalPosts[0][1]}`],
    ['HTML code', `<pre><code>${technicalPosts[0][1]}</code></pre>`],
    ['indented code', `    // ${technicalPosts[0][1]}\n    console.log(typeof null);`],
    ['an unformatted code string', `const explanation = "${technicalPosts[0][1]}";`],
    [
      'long generic prose',
      'Hoje gostaria de compartilhar um momento muito especial com toda a comunidade, pois estamos felizes com as novas oportunidades de conhecer pessoas e aprender coisas interessantes em nossos encontros semanais.',
    ],
    [
      'a nontechnical post with a language name',
      'JavaScript é o nome que escolhi para meu cachorro e nossa rotina envolve passeios pela vizinhança, brincadeiras no parque e momentos de descanso durante os finais de semana com toda a família.',
    ],
    [
      'a promotional sentence',
      'Compre meu curso de JavaScript para descobrir por que typeof null retorna object e conhecer todos os detalhes desse comportamento histórico, com um desconto exclusivo para quem se inscrever hoje.',
    ],
    [
      'an unanswered technical question',
      'Em TypeScript, como posso usar a palavra extends para restringir um parâmetro genérico e quais tipos são aceitos quando a função exige uma propriedade específica na estrutura recebida?',
    ],
    [
      'a mismatched concept',
      'Em JavaScript, a palavra const permite declarar valores no código, enquanto null e object aparecem nesta frase apenas como termos de uma lista de assuntos que ainda pretendo estudar futuramente.',
    ],
    [
      'evidence hidden in HTML attributes',
      `<div data-topic="${technicalPosts[0][1]}">Hoje estamos felizes com as oportunidades de conhecer pessoas e conversar sobre as experiências de nossa comunidade durante encontros realizados ao longo da semana.</div>`,
    ],
    ['evidence inside a script', `<script>${technicalPosts[0][1]}</script>`],
  ])('does not select a quiz for %s', (_description, body) => {
    expect(
      selectPostQuiz(
        [post(body, { title: 'JavaScript typeof null retorna object', language: 'JS' })],
        day
      )
    ).toBeNull();
  });

  it('does not combine distant keywords into evidence of an explained concept', () => {
    const body =
      'JavaScript é uma linguagem que estou conhecendo durante meus estudos recentes com alguns colegas da comunidade. A palavra typeof apareceu na apresentação de hoje sem nenhum exemplo de uso prático. Os termos null e object também foram mencionados na lista de assuntos para o próximo encontro, que retorna somente na semana seguinte.';
    expect(selectPostQuiz([post(body, { language: 'JS' })], day)).toBeNull();
  });

  it('does not use text beyond the maximum post length', () => {
    const body = `${'Conteúdo genérico para conversar com a comunidade. '.repeat(120)}\n${technicalPosts[0][1]}`;
    expect(selectPostQuiz([post(body)], day)).toBeNull();
  });

  it('selects deterministically for the UTC day regardless of input order', () => {
    const posts = technicalPosts.map((item, index) => post(item[1], { id: `post-${index}` }));
    const selected = selectPostQuiz(posts, day);

    expect(selected).not.toBeNull();
    expect(selectPostQuiz([...posts].reverse(), new Date('2026-10-16T23:59:59.999Z'))).toEqual(
      selected
    );
    expect(selectPostQuiz(posts, day)).toEqual(selected);
    const selections = new Set(
      Array.from(
        { length: 14 },
        (_, index) => selectPostQuiz(posts, new Date(Date.UTC(2026, 9, 16 + index)))?.post_id
      )
    );
    expect(selections.size).toBeGreaterThan(1);
  });

  it('does not let unrelated posts affect selection', () => {
    const eligible = post(technicalPosts[2][1], { id: 'eligible' });
    const irrelevant = post(
      'Hoje foi um dia muito bom para encontrar amigos, conversar sobre nossos planos e organizar atividades que acontecerão no próximo final de semana com as pessoas da comunidade.',
      { id: 'irrelevant' }
    );
    expect(selectPostQuiz([eligible, irrelevant], day)).toEqual(selectPostQuiz([eligible], day));
  });

  it('returns independent copies without exposing the catalog', () => {
    const source = post(technicalPosts[0][1]);
    const first = selectPostQuiz([source], day)!;
    first.options[first.correct_index] = 'modified';
    const second = selectPostQuiz([source], day)!;

    expect(second.options[second.correct_index]).toBe('object');
    expect(Object.keys(second).sort()).toEqual(['correct_index', 'options', 'post_id', 'question']);
  });

  it('returns no quiz when there are no candidates or the scheduled date is invalid', () => {
    expect(selectPostQuiz([], day)).toBeNull();
    expect(selectPostQuiz([post(technicalPosts[0][1])], new Date('invalid'))).toBeNull();
  });
});

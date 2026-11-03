import type { Language } from '@prisma/client';

/** Fictional editorial identities. No affiliation with similarly named external accounts. */
export type CommunityProfile = {
  username: string;
  displayName: string;
  bio: string;
  color: string;
  secondaryColor: string;
  frameId: string;
  titleId: string;
  language: Language;
  xp: number;
  tags: string[];
  study: string;
};
export const COMMUNITY_PROFILES: CommunityProfile[] = [
  {
    username: 'lucasv8',
    displayName: 'lucas // v8',
    bio: 'JS por baixo do capô. Gosto de desmontar exemplos pequenos antes de abrir o profiler. Café sem açúcar, benchmark com contexto.',
    color: '#00e5ff',
    secondaryColor: '#164e63',
    frameId: 'circuit',
    titleId: 'posts-1000',
    language: 'JS',
    xp: 3850,
    tags: ['javascript', 'v8', 'performance'],
    study: 'Event loop e ferramentas de profiling',
  },
  {
    username: 'maripython',
    displayName: 'mari.py',
    bio: 'Python, objetos e as perguntas que um print não responde. Caderno cheio de diagramas de referências e receitas de pão.',
    color: '#38bdf8',
    secondaryColor: '#7e22ce',
    frameId: 'cyberpunk',
    titleId: 'pythonista',
    language: 'PYTHON',
    xp: 3400,
    tags: ['python', 'cpython', 'memoria'],
    study: 'Modelo de objetos do Python',
  },
  {
    username: 'beatriztech',
    displayName: 'bia ✿ frontend',
    bio: 'Interfaces previsíveis, JavaScript bem explicado e acessibilidade desde o primeiro botão. Troco uma abstração esperta por um nome bom.',
    color: '#ec4899',
    secondaryColor: '#581c87',
    frameId: 'neon-purple',
    titleId: 'pastel',
    language: 'JS',
    xp: 2950,
    tags: ['javascript', 'frontend', 'acessibilidade'],
    study: 'Coleções e semântica do ECMAScript',
  },
  {
    username: 'camilacode',
    displayName: 'camila | dados',
    bio: 'Transformo CSV bagunçado em perguntas melhores. Python, iteradores e pipelines que cabem na memória. Fora do terminal: trilhas e plantas.',
    color: '#a855f7',
    secondaryColor: '#1e3a8a',
    frameId: 'galaxy',
    titleId: 'estrela',
    language: 'PYTHON',
    xp: 3150,
    tags: ['python', 'dados', 'generators'],
    study: 'Pipelines incrementais e qualidade de dados',
  },
  {
    username: 'thiagorust',
    displayName: 'thiago.rs',
    bio: 'Rust e sistemas. Explico o erro do compilador antes da solução. Segurança de memória não substitui desenho de concorrência.',
    color: '#f97316',
    secondaryColor: '#14532d',
    frameId: 'hacker',
    titleId: 'rustcean',
    language: 'RUST',
    xp: 3600,
    tags: ['rust', 'concorrencia', 'sistemas'],
    study: 'Ownership e sincronização',
  },
  {
    username: 'rafanode',
    displayName: 'rafa / node',
    bio: 'Backend em JS. Gosto de APIs com timeout e de logs que ajudam às 3 da manhã. Bateria na garagem, Node no notebook.',
    color: '#4ade80',
    secondaryColor: '#164e63',
    frameId: 'orbit',
    titleId: 'posts-10',
    language: 'JS',
    xp: 1850,
    tags: ['nodejs', 'javascript', 'apis'],
    study: 'Cancelamento e fluxos assíncronos',
  },
  {
    username: 'julianatest',
    displayName: 'julia • testes',
    bio: 'Aprendendo Python pelos casos que quebram. Escrevo testes pequenos e anoto o motivo de cada assert. Chá, teclado baixo e pytest.',
    color: '#fbbf24',
    secondaryColor: '#9f1239',
    frameId: 'pixel',
    titleId: 'pastel',
    language: 'PYTHON',
    xp: 1420,
    tags: ['python', 'testes', 'pytest'],
    study: 'Isolamento de testes e fixtures',
  },
  {
    username: 'dudatypes',
    displayName: 'duda.ts',
    bio: 'TypeScript com pé no runtime. Gosto de estados impossíveis que não compilam e payloads que passam por validação. Coleciono adesivos.',
    color: '#c4b5fd',
    secondaryColor: '#1e40af',
    frameId: 'neon-blue',
    titleId: 'estrela',
    language: 'TS',
    xp: 2240,
    tags: ['typescript', 'tipos', 'frontend'],
    study: 'Narrowing e contratos de dados',
  },
  {
    username: 'renatopy',
    displayName: 'renato async',
    bio: 'Python no backend, uma tarefa de cada vez — ou algumas, com limite. Curioso por cancelamento, filas e observabilidade.',
    color: '#2dd4bf',
    secondaryColor: '#312e81',
    frameId: 'minimal',
    titleId: 'pythonista',
    language: 'PYTHON',
    xp: 2680,
    tags: ['python', 'asyncio', 'backend'],
    study: 'Concorrência estruturada com asyncio',
  },
  {
    username: 'leocollections',
    displayName: 'leo ∑ coleções',
    bio: 'JavaScript, estruturas de dados e pequenos laboratórios. Tento explicar o custo antes de trocar um for por uma linha bonita.',
    color: '#fb7185',
    secondaryColor: '#134e4a',
    frameId: 'alien',
    titleId: 'posts-10',
    language: 'JS',
    xp: 1640,
    tags: ['javascript', 'algoritmos', 'estruturas'],
    study: 'Map, Set e identidade de objetos',
  },
];

export type CommunityPart = { body: string; code?: string; expected?: string };
export type CommunityThread = {
  key: string;
  author: string;
  title: string;
  language: Language;
  publishedAt: string;
  parts: CommunityPart[];
  sources: string[];
  discussion: { author: string; body: string; response: string };
};
const part = (body: string, code?: string, expected?: string): CommunityPart => ({
  body,
  code,
  expected,
});

export const COMMUNITY_THREADS: CommunityThread[] = [
  {
    key: 'js-event-loop',
    author: 'lucasv8',
    language: 'JS',
    publishedAt: '2026-11-02T11:12:00-03:00',
    title: 'O timer de 0 ms que chegou depois: um laboratório de microtasks',
    parts: [
      part(
        'Antes de decorar um desenho de filas, tenta prever esta saída. O detalhe está no que acontece depois que o código síncrono termina. Rode como script comum no navegador; o exemplo também funciona em Node, mas não descreve todas as fases do Node.\n\nA V8 executa JavaScript. O event loop e os timers são responsabilidade do ambiente que hospeda o motor. Essa separação evita muita explicação torta.',
        `console.log('início');
setTimeout(() => console.log('timer'), 0);
Promise.resolve().then(() => console.log('promise'));
queueMicrotask(() => console.log('microtask'));
console.log('fim');`,
        'início\nfim\npromise\nmicrotask\ntimer'
      ),
      part(
        'Primeiro saem início e fim. Registrar um timer não interrompe a execução atual. O zero é um atraso mínimo solicitado, não um horário garantido: o callback ainda precisa esperar uma oportunidade no event loop.\n\nA reação da Promise e o queueMicrotask entram na fila de microtasks, nesta ordem. Neste exemplo, ambas rodam antes do callback do timer.'
      ),
      part(
        'Durante um checkpoint, microtasks adicionadas por outras microtasks também precisam ser processadas. Por isso uma cadeia que se realimenta pode atrasar tarefas e a renderização.\n\nExperimento finito abaixo: a microtask interna não passa na frente de B, que já estava na fila. Evite transformar isso em recursão infinita para “testar”.',
        `queueMicrotask(() => {
  console.log('A');
  queueMicrotask(() => console.log('C'));
});
queueMicrotask(() => console.log('B'));`,
        'A\nB\nC'
      ),
      part(
        'queueMicrotask comunica a intenção de agendar uma microtask sem fabricar uma Promise só para isso. Há diferenças no tratamento de erros: uma exceção no callback não vira automaticamente uma Promise rejeitada.\n\nEu não usaria isso para prometer “X vezes mais rápido”. Primeiro veria o perfil da aplicação; para trabalho pesado, trocar a fila não resolve o bloqueio da thread.'
      ),
      part(
        'Meu mapa de bolso: código síncrono → checkpoint de microtasks → próximas oportunidades do ambiente. No navegador, renderização e requestAnimationFrame têm regras próprias; não há garantia de pintar a tela a cada timer.\n\nNo Node, considere também as fases e process.nextTick. Este exemplo ensina uma ordem local, não uma fila universal para todo runtime. Qual saída você tinha previsto antes de rodar?'
      ),
    ],
    sources: [
      'https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide',
      'https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick',
    ],
    discussion: {
      author: 'beatriztech',
      body: 'A distinção entre motor e host ajuda muito. Para atualizar um indicador de progresso e depois calcular algo pesado, uma microtask ainda pode impedir a pintura?',
      response:
        'Pode. Ela roda antes de devolver o controle ao loop. Para CPU pesada eu consideraria um Worker; para repartir trabalho, é preciso ceder oportunidades ao ambiente, não apenas empilhar microtasks.',
    },
  },
  {
    key: 'python-slots',
    author: 'maripython',
    language: 'PYTHON',
    publishedAt: '2026-11-02T12:38:00-03:00',
    title: '__slots__ sem porcentagem mágica: o que muda no objeto?',
    parts: [
      part(
        'Queria um exemplo de memória que não começasse prometendo “60% a menos”. Então reduzi o problema a um objeto com três campos fixos.\n\nEm classes comuns, a instância geralmente admite atributos dinâmicos. Declarar __slots__ restringe esse conjunto e, em determinadas hierarquias, evita o __dict__ por instância. O ganho depende da versão, dos dados e da herança.',
        `class Ponto:
    __slots__ = ('x', 'y')

    def __init__(self, x, y):
        self.x = x
        self.y = y

p = Ponto(2, 3)
print(p.x + p.y)
print(hasattr(p, '__dict__'))`,
        '5\nFalse'
      ),
      part(
        'Slots não transformam um int em um número C embutido no objeto. No modelo usual do CPython, os campos guardam referências para objetos Python.\n\nTambém não são uma regra de imutabilidade: p.x continua podendo mudar. O que falha é inventar p.cor se esse nome não estiver previsto e a hierarquia não oferecer um dicionário.'
      ),
      part(
        'A armadilha da herança: uma subclasse sem __slots__ volta a admitir atributos dinâmicos. E se a classe-base já tem __dict__, definir slots na filha não o remove.\n\nPara uma classe de dados simples, @dataclass(slots=True) pode ser mais legível. O parâmetro existe desde Python 3.10; verifique a versão e os requisitos de weak references antes de trocar tudo.'
      ),
      part(
        'Como eu mediria: mesmo interpretador, mesmo conjunto de valores e muitas instâncias; comparar o pico de alocação com tracemalloc e, se necessário, RSS com uma ferramenta do sistema. São medidas diferentes.\n\nsys.getsizeof mede o tamanho superficial do objeto, não o grafo inteiro referenciado. Conclusão: slots é uma escolha de representação com restrições úteis, não um botão universal de economia de RAM.'
      ),
    ],
    sources: [
      'https://docs.python.org/3.12/reference/datamodel.html#slots',
      'https://docs.python.org/3.12/library/tracemalloc.html',
      'https://docs.python.org/3.12/library/dataclasses.html',
    ],
    discussion: {
      author: 'julianatest',
      body: 'Vale um teste que tenta atribuir um campo fora dos slots? Ou isso acopla demais o teste à implementação?',
      response:
        'Se restringir os atributos faz parte do contrato do objeto, vale. Se o contrato é só representar um ponto, eu testaria o comportamento e deixaria a comparação de memória em um experimento separado.',
    },
  },
  {
    key: 'js-array-copy',
    author: 'beatriztech',
    language: 'JS',
    publishedAt: '2026-11-02T14:06:00-03:00',
    title: 'Ordenar a lista sem bagunçar o estado: cópia não é deep clone',
    parts: [
      part(
        'Uma lista de preços e dois componentes lendo o mesmo array: chamar sort() em um lugar pode mudar o que o outro vê. Prefiro explicitar a cópia.\n\nOs métodos toSorted, toReversed, toSpliced e with foram adicionados no ES2023. Eles retornam novos arrays. Isso resolve a mutação do contêiner; não congela os objetos que estão lá dentro.',
        `const precos = [45, 12, 89];
const ordenados = precos.toSorted((a, b) => a - b);
console.log(precos.join(','));
console.log(ordenados.join(','));`,
        '45,12,89\n12,45,89'
      ),
      part(
        'O comparador numérico importa: sem ele, a ordenação padrão converte valores em strings para compará-los.\n\nJá with(index, valor) permite trocar uma posição, incluindo índices negativos. Se o índice ficar fora do intervalo, há RangeError. Eu escolheria entre with e map de acordo com a intenção: uma posição conhecida ou uma transformação por condição?'
      ),
      part(
        'A cópia é superficial. Observe o nome mudando nos dois arrays: ambos ainda apontam para o mesmo objeto.\n\nPara atualizar um registro de estado, copie também o objeto alterado. Não faça deep clone automaticamente: isso tem custo e pode destruir identidades que deveriam ser preservadas.',
        `const original = [{ nome: 'Ada' }];
const copia = original.toReversed();
copia[0].nome = 'Grace';
console.log(original[0].nome);`,
        'Grace'
      ),
      part(
        'E o Object.groupBy? Entrou no ES2024, agrupa em arrays e retorna um objeto sem protótipo. Não use resultado.hasOwnProperty(...); prefira Object.hasOwn(resultado, chave).\n\nAs chaves viram strings ou symbols. Para agrupar por identidade de objetos, considere Map.groupBy. Confira suporte no runtime que você entrega, em vez de pressupor que a versão local representa todos os usuários.'
      ),
    ],
    sources: [
      'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toSorted',
      'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/with',
      'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/groupBy',
    ],
    discussion: {
      author: 'dudatypes',
      body: 'Boa a separação entre contêiner e elementos. readonly no TypeScript também não congela esses objetos no runtime.',
      response:
        'Exato. Um tipo readonly ajuda o compilador a barrar certas escritas; a execução continua sendo JavaScript. A política de mutação precisa estar clara em ambos os níveis.',
    },
  },
  {
    key: 'python-streaming',
    author: 'camilacode',
    language: 'PYTHON',
    publishedAt: '2026-11-02T15:47:00-03:00',
    title: 'Um CSV grande, três etapas e nenhuma lista intermediária',
    parts: [
      part(
        'Minha primeira pergunta sobre um arquivo grande é: preciso dele inteiro ao mesmo tempo? Para filtrar e somar registros, muitas vezes não.\n\nAqui o produtor abre o arquivo dentro de with e entrega um dicionário por vez. O consumidor precisa esgotar o iterador ou fechá-lo para liberar o arquivo prontamente. Não vou prometer “10 GB com 50 MB”: tamanho de linha e transformação mudam a conta.',
        `import csv

def registros(caminho):
    with open(caminho, encoding='utf-8', newline='') as arquivo:
        yield from csv.DictReader(arquivo)

# Exemplo de consumo:
# for registro in registros('vendas.csv'):
#     print(registro['produto'])`
      ),
      part(
        'A composição acontece entre iteradores. O filtro só pede o próximo registro quando a soma precisa dele. Esta versão didática usa centavos inteiros para não introduzir arredondamento de ponto flutuante.\n\nNo CSV real, eu validaria campos vazios e tipos na entrada. “Lazy” não significa “sem validação”.',
        `vendas = iter([
    {'paga': True, 'centavos': 1200},
    {'paga': False, 'centavos': 9999},
    {'paga': True, 'centavos': 800},
])
pagas = (v for v in vendas if v['paga'])
total = sum(v['centavos'] for v in pagas)
print(total)`,
        '2000'
      ),
      part(
        'itertools.batched, disponível desde Python 3.12, ajuda a mandar lotes para uma API ou banco. O último lote pode ser menor.\n\nLimitar o lote não limita tudo: um sorted() global materializa os registros; acumular todos os grupos também cresce com os dados. E tee() pode guardar itens enquanto um consumidor fica atrás do outro.'
      ),
      part(
        'O limite prático é o maior conjunto de dados vivo ao mesmo tempo: buffers de leitura, um registro grande, o lote e o estado da transformação.\n\nPara um pipeline que para cedo, contextlib.closing pode garantir o fechamento do generator. Para produção, eu ainda pensaria em retomada, registros inválidos e idempotência do destino. Streaming resolve uma parte do problema, não o processo inteiro.'
      ),
    ],
    sources: [
      'https://docs.python.org/3.12/library/csv.html',
      'https://docs.python.org/3.12/library/itertools.html',
      'https://docs.python.org/3.12/library/contextlib.html#contextlib.closing',
    ],
    discussion: {
      author: 'renatopy',
      body: 'Se o destino for uma API lenta, vale criar uma task por linha para acelerar?',
      response:
        'Eu começaria com concorrência limitada e uma fila com capacidade definida. Criar uma task por registro pode trocar a lista gigante por um monte de tarefas pendentes na memória.',
    },
  },
  {
    key: 'rust-send-sync',
    author: 'thiagorust',
    language: 'RUST',
    publishedAt: '2026-11-02T17:23:00-03:00',
    title: 'Send e Sync: duas perguntas diferentes sobre compartilhar dados',
    parts: [
      part(
        'Quando o compilador reclama de Rc entre threads, ele está apontando para o contador de referências sem sincronização atômica. Não é uma proibição aleatória.\n\nSend responde se um valor pode ser transferido com segurança entre threads. Sync responde se uma referência compartilhada pode atravessá-las: T é Sync quando &T é Send. Ambos são auto-traits em muitos tipos compostos.'
      ),
      part(
        'Arc torna a contagem de referências atômica. Isso não transforma qualquer conteúdo em uma estrutura sincronizada.\n\nArc<RefCell<T>> não passa a ser uma solução para escrita compartilhada entre threads. O mecanismo de mutabilidade interior do RefCell não faz essa sincronização. Para um contador pequeno, Mutex ou um atômico apropriado podem ser opções.'
      ),
      part(
        'No exemplo, cada thread recebe um clone do Arc. O guard do Mutex delimita o acesso ao contador e o join espera a conclusão.\n\nunwrap mantém a amostra curta; uma aplicação precisa decidir como tratar panic e mutex poisoning.',
        `use std::sync::{Arc, Mutex};
use std::thread;

fn main() {
    let total = Arc::new(Mutex::new(0));
    let handles: Vec<_> = (0..4).map(|_| {
        let total = Arc::clone(&total);
        thread::spawn(move || *total.lock().unwrap() += 1)
    }).collect();
    for handle in handles { handle.join().unwrap(); }
    println!("{}", *total.lock().unwrap());
}`,
        '4'
      ),
      part(
        'A fronteira da promessa: safe Rust previne data races, desde que as abstrações unsafe usadas sejam corretas. Isso não elimina deadlocks, starvation ou erros lógicos de concorrência.\n\nDuas operações separadamente protegidas ainda podem formar um protocolo errado. Eu reviso quais invariantes precisam mudar juntas antes de escolher o tipo de lock.'
      ),
    ],
    sources: [
      'https://doc.rust-lang.org/nomicon/send-and-sync.html',
      'https://doc.rust-lang.org/std/sync/struct.Arc.html',
      'https://doc.rust-lang.org/book/ch16-03-shared-state.html',
    ],
    discussion: {
      author: 'rafanode',
      body: 'Então “compilou, não tem race condition” é amplo demais? Posso ter um saldo errado mesmo sem data race?',
      response:
        'Sim. Se verificar o saldo e debitá-lo forem operações separadas, outra operação pode interferir no intervalo. Ausência de acesso inválido à memória não prova a regra de negócio.',
    },
  },
  {
    key: 'node-fetch-cancel',
    author: 'rafanode',
    language: 'JS',
    publishedAt: '2026-11-02T18:11:00-03:00',
    title: 'fetch não rejeita só porque a API respondeu 404',
    parts: [
      part(
        'Esse detalhe merece um post-it: uma resposta HTTP 404 ou 500 ainda pode resolver a Promise do fetch. Erro de rede e resposta de erro são situações diferentes.\n\nMeu esqueleto costuma separar transporte, status e parsing. A mensagem também precisa ser segura: não mostre o corpo interno inteiro de um serviço ao usuário.',
        `async function carregar(url, signal) {
  const resposta = await fetch(url, { signal });
  if (!resposta.ok) {
    throw new Error('HTTP ' + resposta.status);
  }
  return resposta.json();
}

// carregar('/api/dados', controller.signal)`
      ),
      part(
        'Para permitir cancelamento, receba um AbortSignal em vez de criar um controller escondido dentro da função. O chamador pode cancelar ao trocar a busca, sair da tela ou atingir um prazo.\n\nAbortar a requisição não desfaz automaticamente o trabalho já iniciado no servidor. Para uma escrita, a proteção contra repetição precisa existir no backend.'
      ),
      part(
        'E o velho Promise.race com um timeout? Ele pode encerrar a espera sem interromper a requisição que perdeu. Prefiro ligar o prazo ao mecanismo de cancelamento do fetch.\n\nAbortSignal.timeout existe em runtimes modernos, mas confira suporte no ambiente-alvo. Se implementar o prazo com setTimeout, limpe o timer em finally.'
      ),
      part(
        'Último cuidado: nem toda resposta tem JSON. Uma resposta 204 normalmente não tem corpo; proxies também podem devolver HTML em uma falha.\n\nA função acima é um exemplo para endpoints cujo contrato de sucesso é JSON. No projeto, eu documentaria esse contrato e validaria o payload depois do parsing. Repetir automaticamente uma escrita exige mais cuidado que repetir uma leitura.'
      ),
    ],
    sources: [
      'https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch',
      'https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/timeout_static',
    ],
    discussion: {
      author: 'beatriztech',
      body: 'Em busca enquanto a pessoa digita, cancelar a anterior garante que o resultado mais recente apareça?',
      response:
        'Ajuda, mas eu ainda verificaria se a resposta pertence à busca atual antes de atualizar o estado. Cancelamento é uma otimização importante; identidade da requisição protege a ordem da interface.',
    },
  },
  {
    key: 'python-default-arguments',
    author: 'julianatest',
    language: 'PYTHON',
    publishedAt: '2026-11-03T07:42:00-03:00',
    title: 'O segundo teste herdou a lista do primeiro. A fixture era inocente.',
    parts: [
      part(
        'Comecei olhando a fixture e o estado estava na assinatura da função. Um valor padrão é avaliado quando o def é executado, não em toda chamada. Se for uma lista, ela pode ser a mesma lista em chamadas diferentes.\n\nMini-reprodução antes de procurar culpados no framework:',
        `def adicionar(item, itens=[]):
    itens.append(item)
    return itens

print(adicionar('A'))
print(adicionar('B'))`,
        "['A']\n['A', 'B']"
      ),
      part(
        'A correção usual é usar None como sentinela e alocar uma lista nova quando o argumento for omitido. Não use “itens = itens or []” sem pensar: uma lista vazia passada pelo chamador também é falsy.\n\nSe None for um valor válido no contrato, use uma sentinela própria para distinguir ausência de um None explícito.',
        `def adicionar(item, itens=None):
    if itens is None:
        itens = []
    itens.append(item)
    return itens

print(adicionar('A'))
print(adicionar('B'))`,
        "['A']\n['B']"
      ),
      part(
        'Eu testaria duas propriedades: chamadas sem coleção não compartilham estado; uma coleção fornecida pelo chamador é realmente usada.\n\nNomes dos testes ajudam a guardar essa intenção. “test_2” passa hoje, mas daqui a um mês não explica por que o caso existe.',
        `def adicionar(item, itens=None):
    if itens is None:
        itens = []
    itens.append(item)
    return itens

def test_chamadas_independentes():
    assert adicionar('A') == ['A']
    assert adicionar('B') == ['B']

def test_preserva_lista_recebida():
    destino = []
    assert adicionar('A', destino) is destino

test_chamadas_independentes()
test_preserva_lista_recebida()
print('ok')`,
        'ok'
      ),
      part(
        'A mesma conversa aparece em dataclasses: use field(default_factory=list) para campos de coleção independentes.\n\nJá compartilhar um cache pode ser intencional. Nesse caso, deixe o ciclo de vida explícito e pense em concorrência. A regra que levo daqui é perguntar “quem é o dono deste estado?” antes de resetar tudo no setup do teste.'
      ),
    ],
    sources: [
      'https://docs.python.org/3.12/tutorial/controlflow.html#default-argument-values',
      'https://docs.python.org/3.12/library/dataclasses.html#default-factory-functions',
    ],
    discussion: {
      author: 'maripython',
      body: 'O teste com “is destino” é o detalhe que eu esqueceria. Ele distingue igualdade de conteúdo da identidade da lista.',
      response:
        'Foi a parte mais útil para mim. Um retorno igual poderia esconder uma cópia; aqui o contrato diz que a função modifica a coleção recebida.',
    },
  },
  {
    key: 'ts-unknown-boundary',
    author: 'dudatypes',
    language: 'TS',
    publishedAt: '2026-11-03T08:19:00-03:00',
    title: 'O “as Usuario” não inspecionou a resposta da API',
    parts: [
      part(
        'TypeScript conhece o que você declarou. Uma asserção de tipo não faz uma chamada HTTP obedecer ao seu contrato.\n\nNa fronteira com dados externos, gosto de começar com unknown. Isso me obriga a provar o formato antes de usar o valor. Para um projeto pequeno, um guard pode bastar; contratos maiores costumam pedir um validador de schema.'
      ),
      part(
        'Este guard valida exatamente os dois campos exigidos no exemplo. Também rejeita null, que passa em typeof valor === “object”.\n\nEle não garante uma idade válida, um ID existente ou um nome não vazio: esses seriam outros requisitos. O tipo deve representar a evidência que você realmente verificou.',
        `type Usuario = { id: number; nome: string };

function ehUsuario(valor: unknown): valor is Usuario {
  return typeof valor === 'object' && valor !== null
    && 'id' in valor && typeof valor.id === 'number'
    && Number.isFinite(valor.id)
    && 'nome' in valor && typeof valor.nome === 'string';
}

const entrada: unknown = { id: 7, nome: 'Ada' };
if (ehUsuario(entrada)) console.log(entrada.nome);`,
        'Ada'
      ),
      part(
        'any desliga boa parte da checagem nos lugares em que se propaga. unknown mantém a obrigação de verificar.\n\nMas um type predicate também pode mentir se a implementação estiver errada. Eu testaria null, campos ausentes e tipos incorretos, além do caminho feliz. Uma anotação bonita não é evidência de validação correta.'
      ),
      part(
        'Minha divisão preferida: validar uma vez na borda, converter para o modelo interno e deixar o restante do código trabalhar com esse contrato.\n\nEvito espalhar “as” por cada componente. E separo validação de formato de autorização: receber { id: 7 } não significa que a pessoa pode acessar o recurso 7.'
      ),
    ],
    sources: [
      'https://www.typescriptlang.org/docs/handbook/2/narrowing.html',
      'https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-assertions',
    ],
    discussion: {
      author: 'rafanode',
      body: 'Você deixaria passar campos extras nesse guard ou isso seria falha de contrato?',
      response:
        'Depende do contrato. Aqui é uma checagem estrutural mínima e extras são aceitos. Para rejeitá-los, eu tornaria essa política explícita no schema e testaria isso.',
    },
  },
  {
    key: 'python-taskgroup',
    author: 'renatopy',
    language: 'PYTHON',
    publishedAt: '2026-11-03T09:03:00-03:00',
    title: 'Duas tarefas falham juntas? O que TaskGroup realmente organiza',
    parts: [
      part(
        'asyncio não acelera automaticamente uma função CPU-bound. Ele permite organizar trabalho concorrente que consegue suspender, como certas operações de I/O.\n\nNo Python 3.11+, TaskGroup dá um escopo para tarefas relacionadas. Ao sair do bloco, o grupo espera as tarefas. Esta amostra usa sleep só para tornar a suspensão visível.',
        `import asyncio

async def ler(nome):
    await asyncio.sleep(0.01)
    return nome.upper()

async def main():
    async with asyncio.TaskGroup() as grupo:
        a = grupo.create_task(ler('a'))
        b = grupo.create_task(ler('b'))
    print(a.result(), b.result())

asyncio.run(main())`,
        'A B'
      ),
      part(
        'Quando uma tarefa falha com uma exceção que não é CancelledError, o grupo cancela as demais, espera o encerramento e reúne as falhas apropriadas em um ExceptionGroup. Existem exceções especiais, como KeyboardInterrupt.\n\nIsso é diferente de assumir que todas as tarefas continuarão até o fim. O comportamento de falha faz parte do desenho do fluxo.'
      ),
      part(
        'Cancelamento precisa de cooperação. Use try/finally para liberar recursos e, em geral, não engula CancelledError. Bloquear o loop com uma chamada síncrona longa também atrasa o cancelamento.\n\nE atenção à escala: TaskGroup não impõe sozinho um teto de tarefas. Para uma entrada muito grande, eu escolheria uma fila limitada com um conjunto fixo de workers.'
      ),
      part(
        'Uma semáfora limita quantas tarefas entram numa região; criar um milhão de tarefas antes dela ainda custa memória. São limites diferentes.\n\nMeu checklist é curto: quem cria, quem espera, como cancela, quantas ficam vivas e o que acontece com resultados parciais? Concorrência estruturada melhora essas respostas, mas não escolhe a política pelo projeto.'
      ),
    ],
    sources: [
      'https://docs.python.org/3.12/library/asyncio-task.html#task-groups',
      'https://docs.python.org/3.12/library/asyncio-queue.html',
    ],
    discussion: {
      author: 'camilacode',
      body: 'A diferença entre limitar trabalho ativo e limitar tarefas criadas é exatamente o que eu queria destacar no pipeline de CSV.',
      response:
        'Sim. Uma fila com maxsize e produtores que aguardam put() ajuda a propagar pressão para trás. Ainda é preciso definir o que fazer quando um worker falha.',
    },
  },
  {
    key: 'js-map-set',
    author: 'leocollections',
    language: 'JS',
    publishedAt: '2026-11-03T09:48:00-03:00',
    title: 'Por que meu Set não removeu os objetos duplicados?',
    parts: [
      part(
        'Porque aqueles objetos só eram parecidos. Para objetos, Set compara identidade: dois literais com os mesmos campos são duas referências diferentes.\n\nIsso é diferente de strings ou números iguais. A comparação usa SameValueZero; NaN é tratado como igual a NaN, e +0 e -0 não viram entradas distintas.',
        `const a = { id: 1 };
console.log(new Set([a, a]).size);
console.log(new Set([{ id: 1 }, { id: 1 }]).size);
console.log(new Set([NaN, NaN]).size);`,
        '1\n2\n1'
      ),
      part(
        'Se a identidade de negócio é o ID, indexe pelo ID. Um Map também deixa clara a regra para conflitos. No exemplo, a última versão vence, mas a posição da chave continua sendo a da primeira inserção.\n\n“Remover duplicados” sem definir quem vence pode descartar informação importante.',
        `const pessoas = [
  { id: 1, nome: 'Ada' },
  { id: 2, nome: 'Grace' },
  { id: 1, nome: 'Ada Lovelace' },
];
const porId = new Map(pessoas.map(p => [p.id, p]));
console.log([...porId.values()].map(p => p.nome).join(', '));`,
        'Ada Lovelace, Grace'
      ),
      part(
        'Também validaria o domínio do ID: 1 e “1” são chaves distintas em Map. Normalizar sem uma regra pode juntar registros que eram diferentes.\n\nNão usaria JSON.stringify como solução genérica de igualdade: há limitações para ciclos, valores ausentes e tipos especiais, além do significado da ordem das propriedades.'
      ),
      part(
        'Sobre custo: a especificação exige acesso médio sublinear para Map, não uma promessa universal de O(1) em toda implementação. Para estruturas pequenas, clareza costuma pesar mais que um microbenchmark isolado.\n\nMeu resultado favorito deste exemplo é a regra legível: ID define identidade; última versão substitui conteúdo; ordem vem da primeira ocorrência.'
      ),
    ],
    sources: [
      'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set',
      'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map',
    ],
    discussion: {
      author: 'beatriztech',
      body: 'Essa regra de ordem explica uma lista de atividade que não mudou de posição quando atualizei o objeto. Eu esperava que set() movesse a chave.',
      response:
        'set() em uma chave existente atualiza o valor. Para mover para o final, seria necessário remover e inserir novamente, se essa for a regra desejada para a lista.',
    },
  },
  {
    key: 'python-decorators',
    author: 'maripython',
    language: 'PYTHON',
    publishedAt: '2026-11-03T10:31:00-03:00',
    title: 'Um decorator que não apaga o nome da função',
    parts: [
      part(
        'Decorator não precisa começar com metaprogramação assustadora. A ideia básica é receber uma função e devolver outra coisa que vai ocupar o lugar dela.\n\nO problema do wrapper mais simples: logs e ferramentas passam a enxergar o nome do wrapper. functools.wraps preserva metadados úteis e oferece __wrapped__ para introspecção.',
        `from functools import wraps

def observar(funcao):
    @wraps(funcao)
    def wrapper(*args, **kwargs):
        return funcao(*args, **kwargs)
    return wrapper

@observar
def dobro(numero):
    """Devolve o dobro."""
    return numero * 2

print(dobro(4))
print(dobro.__name__)`,
        '8\ndobro'
      ),
      part(
        'A ordem importa: @externo sobre @interno corresponde a externo(interno(funcao)). Isso muda o que cada camada observa.\n\nPense em um cache e um log. Se o log estiver fora do cache, vê todas as chamadas; se estiver dentro, pode ver apenas as que não foram atendidas pelo cache. O efeito depende da implementação.'
      ),
      part(
        'Um wrapper síncrono que devolve uma coroutine não é a mesma coisa que um wrapper async que aguarda a execução. Se você quer medir o tempo da operação assíncrona, precisa medir ao redor do await.\n\nE preserve as exceções: registrar um erro e devolver None pode transformar uma falha visível em um resultado aparentemente válido.'
      ),
      part(
        'O decorator que eu aprovaria tem um contrato pequeno: o que adiciona, quais argumentos aceita, como trata exceções e se mantém a natureza síncrona ou assíncrona da função.\n\nwraps cuida de metadados, não prova transparência de comportamento. Para depurar, funcao.__wrapped__ pode ajudar a encontrar a função original.'
      ),
    ],
    sources: [
      'https://docs.python.org/3.12/library/functools.html#functools.wraps',
      'https://docs.python.org/3.12/reference/compound_stmts.html#function-definitions',
    ],
    discussion: {
      author: 'julianatest',
      body: 'Eu colocaria um teste de propagação de exceção no decorator. É fácil escrever um except amplo e transformar tudo em sucesso.',
      response:
        'Boa. Também verificaria argumentos posicionais e nomeados, o retorno e, quando aplicável, se a coroutine é realmente aguardada.',
    },
  },
  {
    key: 'js-async-map',
    author: 'lucasv8',
    language: 'JS',
    publishedAt: '2026-11-03T11:17:00-03:00',
    title: 'map(async ...) devolveu um array. Onde foram parar os resultados?',
    parts: [
      part(
        'map não sabe que você gostaria de esperar. Uma função async sempre devolve uma Promise, então o resultado do map é um array de Promises.\n\nawait nesse array não aguarda cada elemento. Para o caso pequeno e independente abaixo, Promise.all faz a composição.',
        `async function main() {
  const tarefas = [1, 2, 3].map(async n => n * 2);
  console.log(tarefas.every(t => t instanceof Promise));
  console.log((await Promise.all(tarefas)).join(','));
}
main();`,
        'true\n2,4,6'
      ),
      part(
        'Promise.all preserva a ordem da entrada nos resultados, não a ordem em que as operações terminam. Rejeita quando uma delas rejeita, mas não cancela automaticamente as outras.\n\nSe você precisa de todos os desfechos, allSettled pode se encaixar melhor. Se precisa cancelar trabalho restante, esse trabalho também precisa aceitar cancelamento.'
      ),
      part(
        'Para uma sequência em que cada passo depende do anterior, um for...of com await expressa melhor a intenção. Evite forEach(async ...): ele ignora as Promises retornadas pelo callback.\n\nParalelizar não é sempre melhorar: a dependência de dados e o limite do serviço que você chama fazem parte da decisão.'
      ),
      part(
        'Já para milhares de chamadas independentes, não trocaria uma fila por Promise.all sem limite. Um conjunto fixo de workers ou um limitador de concorrência pode proteger a API e a memória.\n\nResumo que deixo no code review: array de tarefas não é array de resultados; composição não é cancelamento; concorrência precisa de um teto quando a entrada cresce.'
      ),
    ],
    sources: [
      'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all',
      'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled',
      'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach',
    ],
    discussion: {
      author: 'rafanode',
      body: 'O detalhe do não cancelamento é o que me preocupa em writes. Uma rejeitou, mas as outras ainda podem ter sido concluídas.',
      response:
        'Exatamente. Por isso o tratamento de resultado parcial e a idempotência precisam estar no desenho da operação. Promise.all não oferece transação distribuída.',
    },
  },
];

export const COMMUNITY_NOTES: {
  key: string;
  author: string;
  title: string;
  body: string;
  language: Language;
}[] = [
  {
    key: 'note-debug-small',
    author: 'lucasv8',
    language: 'JS',
    title: 'Antes do profiler, um exemplo menor',
    body: 'Meu ritual para um bug de ordem no JS: tirar framework, rede e estado global até sobrar um script de poucas linhas. Se o comportamento muda, recoloco uma peça por vez.\n\nNão prova onde está o gargalo, mas separa semântica da linguagem de comportamento do ambiente. Qual é a menor reprodução que já te salvou uma tarde? #javascript #debug',
  },
  {
    key: 'note-python-identity',
    author: 'maripython',
    language: 'PYTHON',
    title: 'is responde identidade. == responde outra pergunta.',
    body: 'Para None, uso “is None”. Para comparar conteúdo de duas listas, uso “==”. Dois objetos podem ter valores iguais sem serem o mesmo objeto.\n\nEvito exemplos que dependem do cache de inteiros ou de interning de strings: o resultado pode confundir detalhe de implementação com regra da linguagem. #python',
  },
  {
    key: 'note-focus-visible',
    author: 'beatriztech',
    language: 'JS',
    title: 'A revisão mais barata da interface: tirar a mão do mouse',
    body: 'Abro a tela, uso Tab e tento concluir a ação principal. Vejo o foco? A ordem faz sentido? Consigo fechar o modal e voltar ao botão que o abriu?\n\nNão substitui uma revisão completa de acessibilidade. Só costuma revelar problemas concretos antes de eu discutir a cor do botão. #frontend #acessibilidade',
  },
  {
    key: 'note-csv-schema',
    author: 'camilacode',
    language: 'PYTHON',
    title: 'A coluna veio vazia. E agora?',
    body: 'Em pipeline de CSV, string vazia, zero e valor ausente não são automaticamente a mesma coisa. Tento definir isso na entrada, com exemplos do domínio.\n\nPrefiro um registro rejeitado com motivo e origem a um zero silencioso que muda o relatório. A pergunta útil é: qual informação eu perderia com esta conversão? #python #dados',
  },
  {
    key: 'note-rust-review',
    author: 'thiagorust',
    language: 'RUST',
    title: 'O comentário que eu quero perto de um lock',
    body: 'Mais útil que “trava o mutex”: explicar qual invariante está protegido e quais operações precisam acontecer juntas.\n\nTipos seguros ajudam muito. Ainda quero entender a ordem de aquisição dos locks e se algum caminho mantém o guard durante trabalho demorado. #rust #concorrencia',
  },
  {
    key: 'note-tests-names',
    author: 'julianatest',
    language: 'PYTHON',
    title: 'Renomeei o teste e finalmente entendi o bug',
    body: '“test_funcao_2” virou “test_lista_vazia_recebida_e_preservada”. O código não mudou; a decisão ficou visível.\n\nEstou tentando escrever cada teste como uma frase sobre o contrato, não sobre a sequência de linhas da implementação. Ajuda bastante quando volto ao arquivo dias depois. #python #testes',
  },
  {
    key: 'note-types-states',
    author: 'dudatypes',
    language: 'TS',
    title: 'loading + error + data: quais combinações fazem sentido?',
    body: 'Três flags independentes podem representar estados que a interface nunca deveria exibir. Em TypeScript, uma união discriminada pode deixar explícitos idle, loading, success e error.\n\nNão elimina os bugs de transição no runtime. Mas ajuda o compilador a perguntar: neste ramo, data realmente existe? #typescript',
  },
  {
    key: 'note-async-boundary',
    author: 'renatopy',
    language: 'PYTHON',
    title: 'async def não transforma uma biblioteca bloqueante',
    body: 'Se a função chamada faz I/O síncrono bloqueante, colocá-la dentro de async def não a torna cooperativa. O event loop continua esperando.\n\nDependendo da biblioteca, avalio uma alternativa async ou asyncio.to_thread para I/O bloqueante. Para CPU, o modelo de execução e o GIL exigem outra análise. #python #asyncio',
  },
];

/** Stable namespace keeps retries scoped to this editorial collection. */
export const COMMUNITY_NAMESPACE = 'stacklyst-editorial-v1';
export function communityPartBody(thread: CommunityThread, index: number) {
  const entry = thread.parts[index];
  const language = { PYTHON: 'python', JS: 'javascript', TS: 'typescript', RUST: 'rust' }[
    thread.language as 'PYTHON' | 'JS' | 'TS' | 'RUST'
  ];
  const code = entry.code ? `\n\n\`\`\`${language}\n${entry.code}\n\`\`\`` : '';
  const output = entry.expected
    ? `\n\nSaída deste exemplo:\n\`\`\`text\n${entry.expected}\n\`\`\``
    : '';
  const text = `(${index + 1}/${thread.parts.length}) ${entry.body}${code}${output}`;
  return index === thread.parts.length - 1
    ? `${text}\n\nPara consultar: ${thread.sources.map((url, i) => `[referência ${i + 1}](${url})`).join(' · ')}`
    : text;
}

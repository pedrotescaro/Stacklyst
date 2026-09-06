import { defineLesson, type LearningCourse, type LearningLesson } from './catalog-types';

interface Challenge {
  slug: string;
  title: string;
  unit: string;
  explanation: string;
  example: string;
  signature: string;
  task: string;
  solution: string;
  cases: { input: unknown[]; expected: unknown; hidden?: boolean; invocation?: string }[];
  project?: boolean;
}
const c = (input: unknown[], expected: unknown, hidden = false) => ({ input, expected, hidden });
const ALGORITHMS: Challenge[] = [
  {
    slug: 'linear-search',
    title: 'Busca linear e casos ausentes',
    unit: 'Percorrer e comparar',
    explanation:
      'Uma busca linear visita cada posição até encontrar o alvo. Retorne o índice, começando em zero. Se terminar sem encontrar, use -1. O pior caso visita n posições: custo O(n). Não confunda o valor encontrado com sua posição.',
    example: '// Procurar 8 em [5, 8, 3] retorna 1.\n// Procurar 9 na mesma lista retorna -1.',
    signature: 'localizar(valores, alvo)',
    task: 'Implemente localizar: devolva o primeiro índice do alvo ou -1. Não altere a lista.',
    solution:
      'function localizar(valores,alvo) { for(let i=0;i<valores.length;i++) if(valores[i]===alvo) return i; return -1; }',
    cases: [
      c([[5, 8, 3], 8], 1),
      c([[5, 8, 3], 9], -1),
      c([[], 1], -1, true),
      c([[2, 2, 2], 2], 0, true),
    ],
  },
  {
    slug: 'frequency',
    title: 'Contagem por chave',
    unit: 'Percorrer e comparar',
    explanation:
      'Uma tabela associa cada chave à quantidade encontrada. Ao ler um valor, incremente sua chave ou comece em 1. Map armazena chaves sem herdar nomes como constructor. Retorne pares ordenados para tornar o resultado determinístico.',
    example: 'const contagem = new Map();\ncontagem.set("azul", (contagem.get("azul") ?? 0) + 1);',
    signature: 'frequencias(palavras)',
    task: 'Conte cada palavra e retorne pares [palavra, quantidade] em ordem alfabética.',
    solution:
      'function frequencias(palavras) { const m=new Map(); for(const p of palavras) m.set(p,(m.get(p)??0)+1); return [...m].sort(([a],[b])=>a<b?-1:a>b?1:0); }',
    cases: [
      c(
        [['b', 'a', 'b']],
        [
          ['a', 1],
          ['b', 2],
        ]
      ),
      c([[]], []),
      c(
        [['constructor', 'a', 'constructor']],
        [
          ['a', 1],
          ['constructor', 2],
        ],
        true
      ),
    ],
  },
  {
    slug: 'stack',
    title: 'Pilha e parênteses balanceados',
    unit: 'Estruturas e invariantes',
    explanation:
      'Uma pilha remove primeiro o último item inserido. Para parênteses, basta guardar quantos foram abertos: nunca pode ficar negativo e deve terminar em zero. Caracteres que não são parênteses não mudam o saldo.',
    example:
      '// "(a(b))" abre duas vezes e fecha duas vezes.\n// ")(" termina com saldo zero, mas fecha antes de abrir: inválido.',
    signature: 'balanceado(texto)',
    task: 'Retorne true quando todos os parênteses estiverem corretamente balanceados.',
    solution:
      'function balanceado(texto) { let saldo=0; for(const ch of texto) { if(ch==="(") saldo++; if(ch===")") saldo--; if(saldo<0) return false; } return saldo===0; }',
    cases: [c(['(a(b))'], true), c([')('], false), c([''], true, true), c(['(()'], false, true)],
  },
  {
    slug: 'binary-search',
    title: 'Busca binária',
    unit: 'Estruturas e invariantes',
    explanation:
      'Em uma lista ordenada, compare o alvo ao meio e descarte a metade impossível. Mantenha início e fim inclusivos; atualize com meio + 1 ou meio - 1 para garantir avanço. Cada rodada reduz o espaço pela metade: O(log n).',
    example:
      '// Em [2,4,6,8,10], procurar 8 começa em 6.\n// Como 8 > 6, a próxima busca só considera [8,10].',
    signature: 'buscaBinaria(valores, alvo)',
    task: 'Em uma lista crescente sem repetição, retorne o índice do alvo ou -1.',
    solution:
      'function buscaBinaria(a,alvo) { let lo=0,hi=a.length-1; while(lo<=hi) { const m=Math.floor((lo+hi)/2); if(a[m]===alvo) return m; if(a[m]<alvo) lo=m+1; else hi=m-1; } return -1; }',
    cases: [
      c([[2, 4, 6, 8, 10], 8], 3),
      c([[2, 4, 6], 5], -1),
      c([[], 3], -1, true),
      c([[7], 7], 0, true),
    ],
  },
  {
    slug: 'intervals',
    title: 'Projeto: agenda sem sobreposição',
    unit: 'Planejar soluções',
    explanation:
      'Ordene intervalos pelo início. Compare o próximo início com o fim do último intervalo acumulado: se encostam ou se sobrepõem, una os intervalos. Copie os dados antes de ordenar para preservar a entrada. Esse projeto combina ordenação, registros e uma condição de união.',
    example: '// [1,3] e [3,5] formam [1,5].\n// [1,2] e [4,5] permanecem separados.',
    signature: 'unirIntervalos(intervalos)',
    task: 'Una intervalos fechados que se tocam ou se sobrepõem. Retorne intervalos ordenados. A entrada pode estar desordenada.',
    solution:
      'function unirIntervalos(intervalos) { const out=[]; for(const [inicio,fim] of intervalos.map(x=>[...x]).sort((a,b)=>a[0]-b[0])) { const last=out[out.length-1]; if(last && inicio<=last[1]) last[1]=Math.max(last[1],fim); else out.push([inicio,fim]); } return out; }',
    cases: [
      c(
        [
          [
            [4, 5],
            [1, 3],
            [3, 6],
          ],
        ],
        [[1, 6]]
      ),
      c(
        [
          [
            [1, 2],
            [4, 5],
          ],
        ],
        [
          [1, 2],
          [4, 5],
        ]
      ),
      c([[]], [], true),
      c(
        [
          [
            [1, 9],
            [2, 3],
          ],
        ],
        [[1, 9]],
        true
      ),
    ],
    project: true,
  },
  {
    slug: 'recursion',
    title: 'Recursão e caso-base',
    unit: 'Planejar soluções',
    explanation:
      'Uma função recursiva chama a si mesma com um problema menor. O caso-base interrompe a recursão. Para somar uma árvore de valores, some o valor do nó e os resultados dos filhos. Uma árvore vazia tem soma zero.',
    example: '// soma(nó) = nó.valor + soma(filho1) + soma(filho2)...\n// soma(null) = 0',
    signature: 'somarArvore(no)',
    task: 'Some os valores de uma árvore {valor, filhos: []}. Aceite null como árvore vazia.',
    solution:
      'function somarArvore(no) { if(no===null) return 0; return no.valor+no.filhos.reduce((s,f)=>s+somarArvore(f),0); }',
    cases: [
      c([{ valor: 2, filhos: [{ valor: 3, filhos: [] }] }], 5),
      c([null], 0),
      c([{ valor: -2, filhos: [{ valor: 4, filhos: [{ valor: 1, filhos: [] }] }] }], 3, true),
    ],
  },
  {
    slug: 'dynamic-programming',
    title: 'Reutilizar subproblemas',
    unit: 'Otimização e dependências',
    explanation:
      'Na programação dinâmica, guarde soluções menores para não recalculá-las. Para subir n degraus de 1 ou 2 em 2, a última ação veio de n-1 ou n-2. Assim, formas(n) = formas(n-1) + formas(n-2), com uma forma de subir zero degraus: não dar passos.',
    example: '// formas(0)=1; formas(1)=1; formas(2)=2; formas(3)=3.',
    signature: 'formas(n)',
    task: 'Conte as formas de subir n degraus usando passos de 1 ou 2. n é inteiro entre 0 e 40.',
    solution:
      'function formas(n) { let a=1,b=1; for(let i=2;i<=n;i++) { const t=a+b; a=b; b=t; } return n===0?1:b; }',
    cases: [c([3], 3), c([0], 1), c([10], 89, true), c([40], 165580141, true)],
  },
  {
    slug: 'dependencies',
    title: 'Projeto: ordenar tarefas dependentes',
    unit: 'Otimização e dependências',
    explanation:
      'Um grafo dirigido representa dependências. Uma tarefa pode iniciar quando todas as dependências já saíram. Repita: encontre tarefas prontas, escolha a menor alfabeticamente e remova-a. Se restarem tarefas mas nenhuma estiver pronta, existe ciclo ou dependência ausente.',
    example: '// build depende de test; test depende de lint.\n// Ordem válida: lint, test, build.',
    signature: 'ordenarTarefas(tarefas)',
    task: 'Receba {id, dependeDe: string[]}[] e retorne os IDs na ordem de execução, desempate alfabético. Retorne null para ciclo ou referência ausente.',
    solution:
      'function ordenarTarefas(tarefas) { const pend=new Map(tarefas.map(t=>[t.id,t.dependeDe])); const out=[]; while(pend.size) { const ready=[...pend].filter(([,deps])=>deps.every(d=>out.includes(d))).map(([id])=>id).sort(); if(!ready.length) return null; out.push(ready[0]); pend.delete(ready[0]); } return out; }',
    cases: [
      c(
        [
          [
            { id: 'build', dependeDe: ['test'] },
            { id: 'test', dependeDe: [] },
          ],
        ],
        ['test', 'build']
      ),
      c(
        [
          [
            { id: 'a', dependeDe: ['b'] },
            { id: 'b', dependeDe: ['a'] },
          ],
        ],
        null
      ),
      c([[]], [], true),
      c(
        [
          [
            { id: 'b', dependeDe: [] },
            { id: 'a', dependeDe: [] },
          ],
        ],
        ['a', 'b'],
        true
      ),
    ],
    project: true,
  },
];
const SYSTEMS: Challenge[] = [
  {
    slug: 'contracts',
    title: 'Validar entradas sem coerção',
    unit: 'Contratos e estado',
    explanation:
      'Na fronteira de uma função, valide tipo e faixa antes de calcular. Number.isFinite rejeita NaN e infinidades sem converter texto para número. Retornar null sinaliza uma entrada inválida neste contrato.',
    example: 'Number.isFinite(4); // true\nNumber.isFinite("4"); // false',
    signature: 'media(a, b)',
    task: 'Retorne a média de dois números finitos. Para qualquer entrada inválida, retorne null.',
    solution:
      'function media(a,b) { return typeof a==="number" && typeof b==="number" && Number.isFinite(a) && Number.isFinite(b) ? (a+b)/2 : null; }',
    cases: [c([2, 6], 4), c(['2', 6], null), c([null, 4], null, true), c([-4, 2], -1, true)],
  },
  {
    slug: 'closures',
    title: 'Closures e estado privado',
    unit: 'Contratos e estado',
    explanation:
      'Uma função mantém acesso às variáveis do escopo em que foi criada. Uma fábrica pode criar contadores independentes. Esse estado permanece entre chamadas sem depender de uma variável global.',
    example:
      'function criar() { let n=0; return () => ++n; }\nconst proximo=criar(); // cada chamada avança seu próprio n',
    signature: 'sequencia(inicio, quantidade)',
    task: 'Use uma função interna para gerar quantidade números consecutivos a partir de inicio. Retorne a lista; quantidade zero produz [].',
    solution:
      'function sequencia(inicio,quantidade) { let atual=inicio; const proximo=()=>atual++; return Array.from({length:quantidade},proximo); }',
    cases: [c([4, 3], [4, 5, 6]), c([8, 0], []), c([-2, 4], [-2, -1, 0, 1], true)],
  },
  {
    slug: 'immutable-update',
    title: 'Atualização sem mutação',
    unit: 'Coleções e fronteiras',
    explanation:
      'Quando várias partes usam a mesma coleção, alterar a entrada pode produzir efeitos inesperados. map cria um novo array; espalhar um objeto cria uma cópia rasa. Modifique apenas o registro com o ID solicitado.',
    example: 'const novo = itens.map(item => item.id === alvo ? {...item, ativo:true} : item);',
    signature: 'ativar(itens, id)',
    task: 'Retorne uma coleção com ativo=true apenas no item de ID correspondente. Preserve os outros campos e não altere a entrada.',
    solution: 'function ativar(itens,id) { return itens.map(x=>x.id===id?{...x,ativo:true}:x); }',
    cases: [
      c(
        [
          [
            { id: 'a', ativo: false },
            { id: 'b', ativo: false },
          ],
          'b',
        ],
        [
          { id: 'a', ativo: false },
          { id: 'b', ativo: true },
        ]
      ),
      c([[], 'x'], []),
      {
        input: [],
        expected: true,
        hidden: true,
        invocation:
          '(()=>{ const a=[{id:"x",ativo:false}]; const before=JSON.stringify(a); ativar(a,"x"); return JSON.stringify(a)===before; })()',
      },
    ],
  },
  {
    slug: 'batch',
    title: 'Dividir trabalho em lotes',
    unit: 'Coleções e fronteiras',
    explanation:
      'Lotes limitam quanto trabalho é enviado de uma vez. slice copia um intervalo sem modificar a lista. Avance o índice pelo tamanho do lote; o último pode ser menor. Um tamanho inválido precisa ser tratado antes do laço.',
    example: '[1,2,3,4,5].slice(0,2); // [1,2]',
    signature: 'lotes(itens, tamanho)',
    task: 'Divida itens em lotes. Se tamanho não for inteiro positivo, retorne [].',
    solution:
      'function lotes(itens,tamanho) { if(!Number.isInteger(tamanho)||tamanho<=0) return []; const out=[]; for(let i=0;i<itens.length;i+=tamanho) out.push(itens.slice(i,i+tamanho)); return out; }',
    cases: [
      c([[1, 2, 3, 4, 5], 2], [[1, 2], [3, 4], [5]]),
      c([[1], 0], []),
      c([[], 3], [], true),
      c([[1, 2], 1.5], [], true),
    ],
  },
  {
    slug: 'promises',
    title: 'Promises e ordem dos resultados',
    unit: 'Assincronismo e falhas',
    explanation:
      'Uma Promise representa um resultado futuro. await espera a resolução dentro de uma função async. Promise.all inicia operações e mantém a ordem das entradas nos resultados, mesmo quando concluem em ordem diferente. Aqui uma função assíncrona de transformação já é fornecida no teste.',
    example: 'const resultados = await Promise.all(valores.map(async valor => valor * 2));',
    signature: 'transformar(valores, operacao)',
    task: 'Aplique a função assíncrona operacao a cada valor e retorne uma Promise com os resultados na ordem original.',
    solution:
      'async function transformar(valores,operacao) { return Promise.all(valores.map(operacao)); }',
    cases: [
      { input: [], expected: [4, 2], invocation: 'transformar([2,1], async n=>n*2)' },
      { input: [], expected: [], invocation: 'transformar([], async n=>n)' },
      {
        input: [],
        expected: [3, 6, 9],
        hidden: true,
        invocation: 'transformar([1,2,3], async n=>n*3)',
      },
    ],
  },
  {
    slug: 'retry',
    title: 'Retentativas com limite',
    unit: 'Assincronismo e falhas',
    explanation:
      'Uma operação pode falhar temporariamente. try/catch permite tentar de novo, mas um limite evita repetição infinita. O argumento tentativas inclui a primeira execução. Em serviços reais, retente apenas operações idempotentes e adicione espera; este exercício testa o controle das tentativas.',
    example: 'try { return await operacao(); } catch (erro) { /* decidir se ainda pode tentar */ }',
    signature: 'tentar(operacao, tentativas)',
    task: 'Execute operacao até obter sucesso ou esgotar tentativas. Retorne o resultado do sucesso; ao esgotar, retorne null. Zero tentativas não executa a operação.',
    solution:
      'async function tentar(operacao,tentativas) { for(let i=0;i<tentativas;i++) { try { return await operacao(); } catch {} } return null; }',
    cases: [
      { input: [], expected: 7, invocation: 'tentar(async()=>7,1)' },
      {
        input: [],
        expected: 9,
        invocation:
          '(()=>{let n=0;return tentar(async()=>{if(++n<3)throw Error();return 9;},3)})()',
      },
      {
        input: [],
        expected: null,
        hidden: true,
        invocation: 'tentar(async()=>{throw Error();},2)',
      },
      { input: [], expected: null, hidden: true, invocation: 'tentar(async()=>7,0)' },
    ],
  },
  {
    slug: 'idempotency',
    title: 'Revisão aplicada: efeitos únicos',
    unit: 'Projeto de processamento',
    explanation:
      'Revisite Map para um objetivo novo: processar cada identificador uma única vez. Em uma entrada repetida, mantenha o primeiro resultado aceito. Essa regra modela um registro de idempotência; em produção, a unicidade deve ser garantida por transação no banco.',
    example:
      '// Pedidos repetidos: [{id:"a",valor:2},{id:"a",valor:9}]\n// O primeiro efeito vale 2, não 11.',
    signature: 'totalUnico(eventos)',
    task: 'Some o valor do primeiro evento de cada id, ignorando as repetições posteriores.',
    solution:
      'function totalUnico(eventos) { const seen=new Set(); let total=0; for(const e of eventos) { if(!seen.has(e.id)) { seen.add(e.id); total+=e.valor; } } return total; }',
    cases: [
      c(
        [
          [
            { id: 'a', valor: 2 },
            { id: 'a', valor: 9 },
            { id: 'b', valor: 3 },
          ],
        ],
        5
      ),
      c([[]], 0),
      c(
        [
          [
            { id: 'x', valor: 0 },
            { id: 'x', valor: 10 },
          ],
        ],
        0,
        true
      ),
    ],
  },
  {
    slug: 'pipeline',
    title: 'Projeto: importador com relatório',
    unit: 'Projeto de processamento',
    explanation:
      'Um pipeline separa validação, identificação de duplicatas e agregação. Conte registros inválidos antes de registrar um ID como processado. Retorne um relatório que permita auditar quantos itens foram aceitos, rejeitados ou repetidos.',
    example: '// inválido -> rejeitados; ID válido já visto -> duplicados; novo válido -> aceitos.',
    signature: 'importar(registros)',
    task: 'Cada registro precisa ter id string não vazia e valor numérico finito >=0. Retorne {aceitos, rejeitados, duplicados, total}. Some somente o primeiro registro válido de cada ID.',
    solution:
      'function importar(registros) { const seen=new Set(); const r={aceitos:0,rejeitados:0,duplicados:0,total:0}; for(const x of registros) { if(!x || typeof x.id!=="string" || !x.id.trim() || typeof x.valor!=="number" || !Number.isFinite(x.valor) || x.valor<0) {r.rejeitados++;continue;} if(seen.has(x.id)){r.duplicados++;continue;} seen.add(x.id);r.aceitos++;r.total+=x.valor; } return r; }',
    cases: [
      c(
        [
          [
            { id: 'a', valor: 4 },
            { id: 'a', valor: 8 },
            { id: 'b', valor: -1 },
          ],
        ],
        { aceitos: 1, rejeitados: 1, duplicados: 1, total: 4 }
      ),
      c([[]], { aceitos: 0, rejeitados: 0, duplicados: 0, total: 0 }),
      c(
        [[null, { id: 'a', valor: -1 }, { id: 'a', valor: 2 }]],
        { aceitos: 1, rejeitados: 2, duplicados: 0, total: 2 },
        true
      ),
    ],
    project: true,
  },
];
const BACKEND: Challenge[] = [
  {
    slug: 'http-contract',
    title: 'Respostas HTTP com contrato',
    unit: 'Fronteiras HTTP',
    explanation:
      'Uma resposta HTTP combina status e corpo. 200 indica sucesso, 404 indica recurso ausente. Primeiro separe a busca do mapeamento para resposta. O teste usa objetos de resposta para verificar essa decisão sem exigir um servidor em execução.',
    example:
      '// Usuário encontrado -> {status:200, body:{id:"a",nome:"Ana"}}\n// Ausente -> {status:404, body:{erro:"não encontrado"}}',
    signature: 'responder(usuario)',
    task: 'Mapeie usuario para {status:200,body:usuario}; se for null, retorne {status:404,body:{erro:"não encontrado"}}.',
    solution:
      'function responder(usuario){return usuario===null?{status:404,body:{erro:"não encontrado"}}:{status:200,body:usuario};}',
    cases: [
      c([{ id: 'a', nome: 'Ana' }], { status: 200, body: { id: 'a', nome: 'Ana' } }),
      c([null], { status: 404, body: { erro: 'não encontrado' } }),
      c([{ id: 'b' }], { status: 200, body: { id: 'b' } }, true),
    ],
  },
  {
    slug: 'validation',
    title: 'Validar antes de persistir',
    unit: 'Fronteiras HTTP',
    explanation:
      'Dados de entrada não são confiáveis. Valide existência, tipo, faixa e formato antes de usar. Um ID de registro não substitui um campo obrigatório. Este contrato retorna erros por campo para o cliente corrigir a entrada.',
    example:
      '// {nome:"", idade:17} -> ["nome", "idade"]\n// A ordem dos erros faz parte do contrato.',
    signature: 'validarCadastro(dados)',
    task: 'Retorne nomes dos campos inválidos na ordem nome, idade. Nome deve ser string não vazia após trim; idade precisa ser inteiro >=18.',
    solution:
      'function validarCadastro(dados){const erros=[];if(!dados||typeof dados.nome!=="string"||!dados.nome.trim())erros.push("nome");if(!dados||!Number.isInteger(dados.idade)||dados.idade<18)erros.push("idade");return erros;}',
    cases: [
      c([{ nome: 'Ana', idade: 18 }], []),
      c([{ nome: ' ', idade: 17 }], ['nome', 'idade']),
      c([null], ['nome', 'idade'], true),
      c([{ nome: 'A', idade: '20' }], ['idade'], true),
    ],
  },
  {
    slug: 'authorization',
    title: 'Autorização por recurso',
    unit: 'Identidade e consultas',
    explanation:
      'Autenticar identifica quem chamou; autorizar verifica se essa pessoa pode agir sobre o recurso. Compare o ID do proprietário ao ID autenticado. A função recebe contexto já autenticado: nunca aceite papel de administrador vindo de um campo editável pelo cliente.',
    example: '// user.id === recurso.ownerId permite ler o próprio recurso.',
    signature: 'podeEditar(usuario, recurso)',
    task: 'Permita editar quando ambos existirem e o usuário for proprietário ou tiver papel admin. IDs precisam estar presentes.',
    solution:
      'function podeEditar(usuario,recurso){return Boolean(usuario&&recurso&&usuario.id&&recurso.ownerId&&(usuario.id===recurso.ownerId||usuario.papel==="admin"));}',
    cases: [
      c([{ id: 'a', papel: 'user' }, { ownerId: 'a' }], true),
      c([{ id: 'b', papel: 'user' }, { ownerId: 'a' }], false),
      c([null, { ownerId: 'a' }], false, true),
      c([{ id: 'b', papel: 'admin' }, { ownerId: 'a' }], true, true),
    ],
  },
  {
    slug: 'pagination',
    title: 'Paginação determinística',
    unit: 'Identidade e consultas',
    explanation:
      'Uma página usa tamanho e deslocamento. Ordene antes de paginar, incluindo um desempate estável, para evitar que registros mudem de posição entre chamadas. Este exercício implementa o contrato em memória; em SQL, use ORDER BY antes de LIMIT/OFFSET e parâmetros para valores.',
    example: '// Página 2, tamanho 3 -> índices 3, 4, 5.\n// OFFSET = (pagina - 1) * tamanho.',
    signature: 'paginar(itens, pagina, tamanho)',
    task: 'Ordene itens por id crescente e retorne a página pedida (começando em 1). Página/tamanho inválidos retornam []. Não altere a entrada.',
    solution:
      'function paginar(itens,pagina,tamanho){if(!Number.isInteger(pagina)||!Number.isInteger(tamanho)||pagina<1||tamanho<1)return [];return [...itens].sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0).slice((pagina-1)*tamanho,pagina*tamanho);}',
    cases: [
      c([[{ id: 'c' }, { id: 'a' }, { id: 'b' }], 2, 2], [{ id: 'c' }]),
      c([[], 1, 10], []),
      c([[{ id: 'a' }], 0, 1], [], true),
    ],
  },
  {
    slug: 'aggregate',
    title: 'Relacionar pedidos e clientes',
    unit: 'Dados e consistência',
    explanation:
      'Uma relação conecta registros por chave. Um pedido usa clienteId para apontar ao cliente. Agrupe totais por cliente e preserve clientes sem pedidos com total zero: é o comportamento de uma junção externa seguida de agregação.',
    example:
      '// clientes [{id:"a"},{id:"b"}], pedidos [{clienteId:"a",total:5}]\n// resultado [{id:"a",total:5},{id:"b",total:0}]',
    signature: 'totais(clientes, pedidos)',
    task: 'Retorne {id,total} para cada cliente, na ordem dos clientes, somando seus pedidos. Ignore pedidos de clientes ausentes.',
    solution:
      'function totais(clientes,pedidos){const m=new Map();for(const p of pedidos)m.set(p.clienteId,(m.get(p.clienteId)??0)+p.total);return clientes.map(c=>({id:c.id,total:m.get(c.id)??0}));}',
    cases: [
      c(
        [
          [{ id: 'a' }, { id: 'b' }],
          [
            { clienteId: 'a', total: 5 },
            { clienteId: 'a', total: 2 },
          ],
        ],
        [
          { id: 'a', total: 7 },
          { id: 'b', total: 0 },
        ]
      ),
      c([[], [{ clienteId: 'x', total: 5 }]], []),
      c([[{ id: 'x' }], []], [{ id: 'x', total: 0 }], true),
    ],
  },
  {
    slug: 'optimistic-lock',
    title: 'Concorrência e versão esperada',
    unit: 'Dados e consistência',
    explanation:
      'Uma atualização otimista inclui a versão que o cliente leu. Se outra gravação já mudou a versão, rejeite a atualização. No banco, a comparação e a gravação devem acontecer em uma única operação condicional, não em dois passos separados.',
    example:
      '// UPDATE itens SET valor=$1, versao=versao+1\n// WHERE id=$2 AND versao=$3; zero linhas = conflito.',
    signature: 'atualizar(atual, versaoEsperada, valor)',
    task: 'Se atual.versao divergir da esperada, retorne {ok:false}. Senão, retorne {ok:true,registro:{...atual,valor,versao:atual.versao+1}} sem mutar atual.',
    solution:
      'function atualizar(atual,versaoEsperada,valor){return atual.versao!==versaoEsperada?{ok:false}:{ok:true,registro:{...atual,valor,versao:atual.versao+1}};}',
    cases: [
      c([{ id: 'a', versao: 2, valor: 5 }, 2, 9], {
        ok: true,
        registro: { id: 'a', versao: 3, valor: 9 },
      }),
      c([{ id: 'a', versao: 3, valor: 5 }, 2, 9], { ok: false }),
      c([{ versao: 0, valor: 0 }, 0, 1], { ok: true, registro: { versao: 1, valor: 1 } }, true),
    ],
  },
  {
    slug: 'reservation',
    title: 'Projeto: reserva de estoque',
    unit: 'Projeto de serviço',
    explanation:
      'Uma reserva exige quantidade positiva e estoque suficiente. Valide todos os itens antes de alterar qualquer saldo: isso modela o comportamento tudo-ou-nada de uma transação. Em um serviço real, use transação e bloqueios/atualizações condicionais no banco.',
    example:
      '// Se um item faltar, nenhum saldo deve mudar.\n// Duas linhas do mesmo produto somam suas quantidades.',
    signature: 'reservar(estoque, itens)',
    task: 'Receba estoque {id:quantidade} e itens {id,quantidade}[]. Retorne novo estoque ou null se faltar produto, quantidade não for inteiro positivo ou saldo insuficiente. Não altere estoque.',
    solution:
      'function reservar(estoque,itens){const novo={...estoque};for(const i of itens){if(!Object.hasOwn(novo,i.id)||!Number.isInteger(i.quantidade)||i.quantidade<=0||novo[i.id]<i.quantidade)return null;novo[i.id]-=i.quantidade;}return novo;}',
    cases: [
      c([{ a: 5 }, [{ id: 'a', quantidade: 2 }]], { a: 3 }),
      c([{ a: 1 }, [{ id: 'a', quantidade: 2 }]], null),
      c(
        [
          { a: 3 },
          [
            { id: 'a', quantidade: 2 },
            { id: 'a', quantidade: 2 },
          ],
        ],
        null,
        true
      ),
      c([{ a: 3 }, []], { a: 3 }, true),
    ],
    project: true,
  },
  {
    slug: 'safe-logs',
    title: 'Observabilidade sem expor segredos',
    unit: 'Projeto de serviço',
    explanation:
      'Logs ajudam a explicar falhas, mas podem vazar dados. Prefira uma lista explícita de campos seguros a copiar tudo e tentar remover segredos depois. O relatório deve manter apenas requestId, status e durationMs.',
    example: '// senha, token e email não pertencem ao evento técnico público.',
    signature: 'eventoSeguro(evento)',
    task: 'Retorne somente requestId, status e durationMs quando existirem como propriedades próprias. Não acrescente campos ausentes.',
    solution:
      'function eventoSeguro(evento){const out={};for(const k of ["requestId","status","durationMs"])if(Object.hasOwn(evento,k))out[k]=evento[k];return out;}',
    cases: [
      c([{ requestId: 'r', status: 200, token: 'secret' }], { requestId: 'r', status: 200 }),
      c([{}], {}),
      c([{ durationMs: 0, senha: 'x', email: 'a' }], { durationMs: 0 }, true),
    ],
  },
];
const FRONTEND: Challenge[] = [
  {
    slug: 'html',
    title: 'HTML semântico e texto seguro',
    unit: 'Fundamentos da interface',
    explanation:
      'HTML descreve a estrutura da página. Um botão é uma ação; um título organiza conteúdo. Texto dinâmico precisa ser escapado antes de entrar em HTML: &, < e > têm significado especial. React faz esse escape ao renderizar texto em JSX; aqui você aprenderá a razão.',
    example:
      '// Texto <script> deve aparecer como &lt;script&gt; em uma string HTML.\n// Substitua & primeiro, para não escapar novamente as entidades criadas.',
    signature: 'escapar(texto)',
    task: 'Retorne texto com & convertido em &amp;, < em &lt; e > em &gt;, em todas as ocorrências.',
    solution:
      'function escapar(texto){return texto.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");}',
    cases: [
      c(['<b>A & B</b>'], '&lt;b&gt;A &amp; B&lt;/b&gt;'),
      c(['Olá'], 'Olá'),
      c(['&&<>'], '&amp;&amp;&lt;&gt;', true),
    ],
  },
  {
    slug: 'events',
    title: 'Eventos e transições de estado',
    unit: 'Fundamentos da interface',
    explanation:
      'O DOM representa os elementos da página. Um evento como click informa uma ação; seu handler transforma o estado. Separe essa transformação em uma função para testá-la sem navegador. A interface pode chamar setContador(c => proximoContador(c, "incrementar")) no clique.',
    example:
      '// document.querySelector("button").addEventListener("click", handler);\n// Em React: <button onClick={handler}>Adicionar</button>',
    signature: 'proximoContador(atual, acao)',
    task: 'incrementar soma 1; diminuir subtrai 1 sem ficar abaixo de zero; zerar retorna 0; ação desconhecida mantém atual.',
    solution:
      'function proximoContador(atual,acao){if(acao==="incrementar")return atual+1;if(acao==="diminuir")return Math.max(0,atual-1);if(acao==="zerar")return 0;return atual;}',
    cases: [
      c([2, 'incrementar'], 3),
      c([0, 'diminuir'], 0),
      c([9, 'zerar'], 0, true),
      c([3, 'outra'], 3, true),
    ],
  },
  {
    slug: 'props',
    title: 'Props e valores derivados',
    unit: 'Composição e coleções',
    explanation:
      'Um componente React recebe props: dados passados por quem o usa. Dados derivados são calculados a partir dessas props, sem criar estado duplicado. Em um carrinho, o subtotal é preco * quantidade. A função abaixo prepara os dados que o componente exibirá.',
    example: '// function Item({preco, quantidade}) { return <p>{preco * quantidade}</p>; }',
    signature: 'resumoItem(item)',
    task: 'Retorne {nome, subtotal, esgotado}; subtotal é preco*quantidade e esgotado é true quando estoque é zero.',
    solution:
      'function resumoItem(item){return {nome:item.nome,subtotal:item.preco*item.quantidade,esgotado:item.estoque===0};}',
    cases: [
      c([{ nome: 'Livro', preco: 8, quantidade: 2, estoque: 3 }], {
        nome: 'Livro',
        subtotal: 16,
        esgotado: false,
      }),
      c([{ nome: 'Caneta', preco: 2, quantidade: 0, estoque: 0 }], {
        nome: 'Caneta',
        subtotal: 0,
        esgotado: true,
      }),
      c(
        [{ nome: 'A', preco: 0, quantidade: 3, estoque: 1 }],
        { nome: 'A', subtotal: 0, esgotado: false },
        true
      ),
    ],
  },
  {
    slug: 'filter',
    title: 'Listas, chaves e busca',
    unit: 'Composição e coleções',
    explanation:
      'Ao renderizar uma lista em React, uma key estável preserva a identidade do item. Use o ID do dado, não o índice da lista filtrada. A busca pode produzir uma coleção derivada: normalize o termo, filtre e preserve a ordem original.',
    example:
      '// filtrados.map(item => <li key={item.id}>{item.nome}</li>)\n// includes procura uma parte do texto; toLowerCase ignora maiúsculas.',
    signature: 'buscarItens(itens, termo)',
    task: 'Retorne os IDs dos itens cujo nome contém termo, ignorando maiúsculas e espaços nas pontas do termo. Preserve a ordem.',
    solution:
      'function buscarItens(itens,termo){const t=termo.trim().toLowerCase();return itens.filter(i=>i.nome.toLowerCase().includes(t)).map(i=>i.id);}',
    cases: [
      c(
        [
          [
            { id: 'a', nome: 'Livro' },
            { id: 'b', nome: 'Caneta' },
          ],
          ' LIV ',
        ],
        ['a']
      ),
      c([[{ id: 'a', nome: 'A' }], ''], ['a']),
      c([[], 'x'], [], true),
    ],
  },
  {
    slug: 'forms',
    title: 'Formulário e mensagens de erro',
    unit: 'Estado e requisições',
    explanation:
      'Um input controlado lê value do estado e atualiza esse estado em onChange. Antes do envio, valide o formulário e associe mensagens aos campos. Não use apenas cor para indicar erro; o texto precisa explicar como corrigir.',
    example:
      '// <input value={nome} onChange={e => setNome(e.target.value)} aria-describedby="erro-nome" />',
    signature: 'errosFormulario(nome, mensagem)',
    task: 'Retorne um objeto de erros: nome precisa ter ao menos 2 caracteres após trim; mensagem precisa ter ao menos 10. Mensagens: "Informe seu nome" e "Escreva ao menos 10 caracteres".',
    solution:
      'function errosFormulario(nome,mensagem){const e={};if(nome.trim().length<2)e.nome="Informe seu nome";if(mensagem.trim().length<10)e.mensagem="Escreva ao menos 10 caracteres";return e;}',
    cases: [
      c(['Ana', 'Olá, tudo bem?'], {}),
      c(['A', 'curto'], { nome: 'Informe seu nome', mensagem: 'Escreva ao menos 10 caracteres' }),
      c(['  ', '1234567890'], { nome: 'Informe seu nome' }, true),
    ],
  },
  {
    slug: 'async-state',
    title: 'Carregamento, sucesso e falha',
    unit: 'Estado e requisições',
    explanation:
      'Uma API responde depois do início da ação. Modele estados idle, loading, success e error para não exibir dados antigos como novos. Um reducer recebe estado e evento e devolve o próximo estado. Efeitos fazem a requisição; o reducer permanece puro.',
    example:
      '// dispatch({tipo:"iniciar"});\n// fetch(url).then(...).catch(...);\n// dispatch({tipo:"sucesso",dados});',
    signature: 'reduzirBusca(estado, evento)',
    task: 'iniciar -> {status:"loading",dados:null,erro:null}; sucesso usa evento.dados; falha usa evento.erro; desconhecido devolve estado.',
    solution:
      'function reduzirBusca(estado,evento){if(evento.tipo==="iniciar")return {status:"loading",dados:null,erro:null};if(evento.tipo==="sucesso")return {status:"success",dados:evento.dados,erro:null};if(evento.tipo==="falha")return {status:"error",dados:null,erro:evento.erro};return estado;}',
    cases: [
      c([{ status: 'idle' }, { tipo: 'iniciar' }], { status: 'loading', dados: null, erro: null }),
      c([{}, { tipo: 'sucesso', dados: [1] }], { status: 'success', dados: [1], erro: null }),
      c(
        [{}, { tipo: 'falha', erro: 'offline' }],
        { status: 'error', dados: null, erro: 'offline' },
        true
      ),
    ],
  },
  {
    slug: 'stale-response',
    title: 'Respostas fora de ordem',
    unit: 'Projeto de interface',
    explanation:
      'Duas buscas podem terminar fora de ordem. Identifique a requisição atual e aceite apenas a resposta com o mesmo ID. No componente, um cleanup pode cancelar o fetch com AbortController; a comparação de IDs protege também fontes que não aceitam cancelamento.',
    example:
      '// Busca 1 começa; busca 2 começa; resposta 2 chega; resposta 1 chega atrasada.\n// A tela deve continuar mostrando a resposta 2.',
    signature: 'receberResposta(estado, resposta)',
    task: 'Estado contém requestId e dados. Atualize dados apenas se resposta.requestId for igual ao atual. Não altere outros campos.',
    solution:
      'function receberResposta(estado,resposta){return estado.requestId===resposta.requestId?{...estado,dados:resposta.dados}:estado;}',
    cases: [
      c(
        [
          { requestId: 2, dados: [] },
          { requestId: 1, dados: ['antigo'] },
        ],
        { requestId: 2, dados: [] }
      ),
      c(
        [
          { requestId: 2, dados: [] },
          { requestId: 2, dados: ['novo'] },
        ],
        { requestId: 2, dados: ['novo'] }
      ),
      c(
        [
          { requestId: 0, dados: null },
          { requestId: 0, dados: [] },
        ],
        { requestId: 0, dados: [] },
        true
      ),
    ],
  },
  {
    slug: 'task-project',
    title: 'Projeto: lógica de um painel de tarefas',
    unit: 'Projeto de interface',
    explanation:
      'Integre IDs estáveis, atualização imutável e eventos em um reducer. O componente usa useReducer para enviar ações; o reducer mantém a regra de negócio testável. Adicionar, alternar conclusão e remover são comportamentos diferentes que precisam de testes próprios.',
    example:
      '// const [tarefas, dispatch] = useReducer(reduzirTarefas, []);\n// dispatch({tipo:"adicionar", id:"a", titulo:"Estudar"});',
    signature: 'reduzirTarefas(tarefas, acao)',
    task: 'adicionar cria {id,titulo,concluida:false} se ID novo e título não vazio (trim); alternar inverte concluida; remover exclui por ID; desconhecida mantém a lista. Não mute a entrada.',
    solution:
      'function reduzirTarefas(tarefas,acao){if(acao.tipo==="adicionar" && typeof acao.titulo==="string" && acao.titulo.trim() && !tarefas.some(t=>t.id===acao.id))return [...tarefas,{id:acao.id,titulo:acao.titulo.trim(),concluida:false}];if(acao.tipo==="alternar")return tarefas.map(t=>t.id===acao.id?{...t,concluida:!t.concluida}:t);if(acao.tipo==="remover")return tarefas.filter(t=>t.id!==acao.id);return tarefas;}',
    cases: [
      c(
        [[], { tipo: 'adicionar', id: 'a', titulo: ' Estudar ' }],
        [{ id: 'a', titulo: 'Estudar', concluida: false }]
      ),
      c(
        [[{ id: 'a', titulo: 'A', concluida: false }], { tipo: 'alternar', id: 'a' }],
        [{ id: 'a', titulo: 'A', concluida: true }]
      ),
      c([[{ id: 'a', titulo: 'A', concluida: false }], { tipo: 'remover', id: 'a' }], [], true),
      c([[], { tipo: 'adicionar', id: 'a', titulo: ' ' }], [], true),
    ],
    project: true,
  },
];
const TRACKS = [
  {
    id: 'frontend-react',
    title: 'Frontend React',
    description: 'Fundamentos web e lógica testável de interfaces React.',
    items: FRONTEND,
  },
  {
    id: 'javascript-systems',
    title: 'JavaScript para sistemas',
    description: 'Contratos, assincronismo e processamento confiável.',
    items: SYSTEMS,
  },
  {
    id: 'algorithms',
    title: 'Algoritmos aplicados',
    description: 'Da busca linear a dependências e programação dinâmica.',
    items: ALGORITHMS,
  },
  {
    id: 'backend-data',
    title: 'Backend e dados',
    description: 'Contratos de serviços, dados e consistência.',
    items: BACKEND,
  },
];
export const SPECIALIZATION_COURSES: LearningCourse[] = TRACKS.map((track) => {
  const units = [...new Set(track.items.map((item) => item.unit))];
  const lessons: LearningLesson[] = track.items.map((item, index) => {
    const id = `learn-js-${track.id}-${item.slug}`;
    const name = item.signature.split('(')[0];
    return defineLesson({
      id,
      title: item.title,
      description: item.task,
      language: 'JS',
      unitNumber: units.indexOf(item.unit) + 5,
      unitTitle: item.unit,
      levelNumber: index + 14,
      difficulty: index > 5 ? 'avancado' : 'intermediario',
      kind: item.project ? 'project' : item.title.startsWith('Revisão') ? 'review' : 'lesson',
      skills: [item.slug],
      prerequisites: [
        index ? `learn-js-${track.id}-${track.items[index - 1].slug}` : 'learn-js-receipt-project',
      ],
      ...(item.project
        ? {
            project: {
              objective: item.title,
              requirements: [item.task],
              stages: [
                'Defina o contrato e os casos-limite.',
                'Implemente os comportamentos separadamente.',
                'Integre e execute os testes públicos antes de submeter.',
              ],
              completion: [
                'Passar nos testes públicos e ocultos.',
                'Preservar os dados de entrada quando exigido.',
              ],
            },
          }
        : {}),
      steps: [
        {
          type: 'concept_explanation',
          title: item.title,
          conceptText: item.explanation,
          codeSnippet: item.example,
        },
        {
          type: item.project ? 'boss_challenge' : 'code_editor',
          title: item.project ? item.title : 'Aplicação independente',
          instruction: item.task,
          codeTemplate: `${item.solution.startsWith('async ') ? 'async ' : ''}function ${item.signature} {\n  // Implemente o contrato descrito acima.\n}\n`,
          solutionCode: item.solution,
          hints: [item.explanation],
          evaluation: { functionName: name, cases: item.cases },
          testCases: item.cases
            .filter((x) => !x.hidden)
            .map((x, i) => ({
              id: `case-${i}`,
              description:
                x.invocation ?? `${name}(${x.input.map((v) => JSON.stringify(v)).join(', ')})`,
              testCode: x.invocation ?? name,
              expectedOutput: JSON.stringify(x.expected),
            })),
        },
      ],
    });
  });
  return {
    id: track.id,
    title: track.title,
    description: track.description,
    language: 'JS',
    lessons,
  };
});

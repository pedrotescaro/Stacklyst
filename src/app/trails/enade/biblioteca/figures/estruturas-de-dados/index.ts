import type { FigureRegistry, FigureSource } from '../types';
import BinarySearchIntervals, * as search from './BinarySearchIntervals';
import BinarySearchTreeOrder, * as tree from './BinarySearchTreeOrder';
import FibonacciCallTree, * as fibonacci from './FibonacciCallTree';
import HashTableChaining, * as hash from './HashTableChaining';
import LinkedListVariants, * as list from './LinkedListVariants';
import MatrixRowTraversal, * as matrix from './MatrixRowTraversal';
import PreconditionLoop, * as loop from './PreconditionLoop';
import StackAndQueueOperations, * as stack from './StackAndQueueOperations';
import WeightedGraph, * as graph from './WeightedGraph';

const introductionToAlgorithms = {
  author: 'CORMEN et al.',
  year: 2009,
  reference:
    'CORMEN, Thomas H. et al. Introduction to algorithms. 3. ed. Cambridge, MA: MIT Press, 2009.',
  href: 'https://mitpress.ublish.com/book/introduction-algorithms',
} satisfies FigureSource;

export const figures = {
  'laco-com-teste-inicial': {
    component: PreconditionLoop,
    title: loop.title,
    alt: loop.alt,
    source: {
      author: 'FORBELLONE; EBERSPÄCHER',
      year: 2005,
      reference:
        'FORBELLONE, André Luiz Villar; EBERSPÄCHER, Henri Frederico. Lógica de programação: a construção de algoritmos e estruturas de dados. 3. ed. São Paulo: Pearson Prentice Hall, 2005.',
      href: 'https://bibliotecas.ifb.edu.br/acervo/detalhe/1277',
    },
    model: 'Repetição com pré-teste e decisão interna',
    elements:
      'Início, inicialização, guarda do laço, alternativas, incremento, retorno à guarda, saída e fim.',
  },
  'ordem-de-chaves-na-abb': {
    component: BinarySearchTreeOrder,
    title: tree.title,
    alt: tree.alt,
    source: { ...introductionToAlgorithms, chapter: 'seção 12.1' },
    model: 'Ordenação em árvore binária de busca',
    elements:
      'Raiz, subárvores esquerda e direita, chaves de exemplo e relação de ordem em cada ramificação.',
  },
  'busca-binaria-intervalos': {
    component: BinarySearchIntervals,
    title: search.title,
    alt: search.alt,
    source: {
      author: 'SEDGEWICK; WAYNE',
      year: 2011,
      chapter: 'seção 1.1',
      reference:
        'SEDGEWICK, Robert; WAYNE, Kevin. Algorithms. 4. ed. Upper Saddle River: Addison-Wesley, 2011.',
      href: 'https://algs4.cs.princeton.edu/code/javadoc/edu/princeton/cs/algs4/BinarySearch.html',
    },
    model: 'Busca binária iterativa com limites inclusivos',
    elements:
      'Índices 0 a 9, chave 37, pivôs 4, 7 e 5, limites atualizados e resultado no índice 5.',
  },
  'grafo-nao-dirigido-ponderado': {
    component: WeightedGraph,
    title: graph.title,
    alt: graph.alt,
    source: { ...introductionToAlgorithms, chapter: 'cap. 24' },
    model: 'Grafo ponderado e custo de um caminho',
    elements:
      'Quatro vértices, cinco arestas não dirigidas com pesos e soma dos pesos do caminho A–C–B–D.',
  },
  'variantes-de-lista-encadeada': {
    component: LinkedListVariants,
    title: list.title,
    alt: list.alt,
    source: { ...introductionToAlgorithms, chapter: 'seção 10.2' },
    model: 'Listas simples, duplas e circulares',
    elements:
      'Dados 12, 7 e 30, ligações de sucessor e predecessor, fim nulo e ligação circular de volta à cabeça.',
  },
  'insercao-retirada-lifo-fifo': {
    component: StackAndQueueOperations,
    title: stack.title,
    alt: stack.alt,
    source: { ...introductionToAlgorithms, chapter: 'seção 10.1' },
    model: 'Operações fundamentais de pilha e fila',
    elements:
      'Três itens de exemplo, topo e base da pilha, frente e fim da fila, entrada e saída de cada estrutura.',
  },
  'chamadas-recursivas-fibonacci': {
    component: FibonacciCallTree,
    title: fibonacci.title,
    alt: fibonacci.alt,
    source: {
      author: 'DASGUPTA; PAPADIMITRIOU; VAZIRANI',
      year: 2008,
      chapter: 'seção 0.2',
      reference:
        'DASGUPTA, Sanjoy; PAPADIMITRIOU, Christos H.; VAZIRANI, Umesh V. Algorithms. Boston: McGraw-Hill Higher Education, 2008.',
      href: 'https://cseweb.ucsd.edu/~dasgupta/book/',
    },
    model: 'Árvore de chamadas da recorrência de Fibonacci',
    elements: 'F(4) desce até os casos base F(0) e F(1), com duas avaliações de F(2) realçadas.',
  },
  'encadeamento-em-tabela-hash': {
    component: HashTableChaining,
    title: hash.title,
    alt: hash.alt,
    source: { ...introductionToAlgorithms, chapter: 'seção 11.2' },
    model: 'Resolução de colisões por encadeamento separado',
    elements:
      'Função de dispersão, sete posições, exemplos de colisão em duas listas e finais nulos.',
  },
  'percurso-matriz-por-linhas': {
    component: MatrixRowTraversal,
    title: matrix.title,
    alt: matrix.alt,
    source: {
      author: 'CELES; CERQUEIRA; RANGEL',
      year: 2004,
      reference:
        'CELES, Waldemar; CERQUEIRA, Renato; RANGEL, José Lucas. Introdução a estruturas de dados: com técnicas de programação em C. Rio de Janeiro: Elsevier, 2004.',
    },
    model: 'Percurso de matriz com laços aninhados',
    elements:
      'Inicialização de i e j, limites de linhas e colunas, leitura da posição e os dois retornos.',
  },
} satisfies FigureRegistry;

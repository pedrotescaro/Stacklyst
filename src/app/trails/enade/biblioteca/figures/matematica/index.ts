import { CentralTendencyShapes, centralTendencyShapes } from './CentralTendencyShapes';
import { ChartReading, chartReading } from './ChartReading';
import { CoinTossTree, coinTossTree } from './CoinTossTree';
import { DirectInverseVariation, directInverseVariation } from './DirectInverseVariation';
import type { FigureRegistry, FigureSource } from '../types';

const statistics = {
  author: 'ILLOWSKY; DEAN',
  year: 2023,
  reference:
    'ILLOWSKY, Barbara; DEAN, Susan. *Introductory statistics*. 2. ed. Houston: OpenStax, 2023.',
} satisfies FigureSource;

export const figures = {
  'medidas-centrais-e-assimetria': {
    component: CentralTendencyShapes,
    ...centralTendencyShapes,
    source: {
      ...statistics,
      chapter: 'seção 2.6',
      href: 'https://openstax.org/books/introductory-statistics-2e/pages/2-6-skewness-and-the-mean-median-and-mode',
    },
    model: 'Relação entre assimetria e medidas de centro',
    elements:
      'Curvas unimodais ilustrativas com caudas à esquerda, simétrica e à direita; posição relativa de média, mediana e moda.',
  },
  'leitura-de-grafico-de-dados': {
    component: ChartReading,
    ...chartReading,
    source: {
      author: 'WAINER',
      year: 1984,
      reference:
        'WAINER, Howard. How to display data badly. *The American Statistician*, [s. l.], v. 38, n. 2, p. 137–147, maio 1984.',
      href: 'https://doi.org/10.1080/00031305.1984.10483186',
    },
    model: 'Leitura comparativa de barras com escala comum',
    elements:
      'Rótulos, origem em zero, unidade e escala constantes, dados fictícios e diferença de 15 participantes.',
  },
  'variacoes-direta-e-inversa': {
    component: DirectInverseVariation,
    ...directInverseVariation,
    source: {
      author: 'ABRAMSON',
      year: 2021,
      chapter: 'seção 5.8',
      reference: 'ABRAMSON, Jay. *College algebra*. 2. ed. Houston: OpenStax, 2021.',
      href: 'https://openstax.org/books/college-algebra-2e/pages/5-8-modeling-using-variation',
    },
    model: 'Modelos de variação direta e inversa',
    elements:
      'Eixos, reta pela origem, curva inversa, razão e produto constantes, efeito de duplicar x para x, y e k positivos.',
  },
  'arvore-de-dois-lancamentos': {
    component: CoinTossTree,
    ...coinTossTree,
    source: {
      ...statistics,
      chapter: 'seção 3.5',
      href: 'https://openstax.org/books/introductory-statistics-2e/pages/3-5-tree-and-venn-diagrams',
    },
    model: 'Árvore de probabilidade com ensaios independentes',
    elements:
      'Cara e coroa em cada lançamento, ramos com ½, quatro pares ordenados e produto de probabilidades ao longo de cada caminho.',
  },
} satisfies FigureRegistry;

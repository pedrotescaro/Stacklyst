import type { FigureRegistry, FigureSource } from '../types';
import BinaryToHexConversion, * as baseConversion from './BinaryToHexConversion';
import ConditionalEquivalences, * as equivalences from './ConditionalEquivalences';
import ConnectiveTruthConditions, * as connectives from './ConnectiveTruthConditions';
import ModusPonensContrast, * as inference from './ModusPonensContrast';
import SequenceGrowthRules, * as sequence from './SequenceGrowthRules';

const discreteMath = {
  author: 'ROSEN',
  year: 2019,
  reference:
    'ROSEN, Kenneth H. Discrete mathematics and its applications. 8. ed. New York: McGraw-Hill Education, 2019.',
  href: 'https://www.mheducation.com.au/ebook-discrete-mathematics-and-its-applications-8e-9781307441918-aus',
} satisfies FigureSource;

export const figures = {
  'modus-ponens-e-falacia': {
    component: ModusPonensContrast,
    title: inference.title,
    alt: inference.alt,
    source: { ...discreteMath, chapter: 'seção 1.6' },
    model: 'Modus ponens e afirmação do consequente',
    elements:
      'Duas sequências de premissas e conclusões, validade da primeira e contravaloração da segunda.',
  },
  'condicoes-de-verdade': {
    component: ConnectiveTruthConditions,
    title: connectives.title,
    alt: connectives.alt,
    source: { ...discreteMath, chapter: 'seção 1.1' },
    model: 'Semântica dos conectivos proposicionais',
    elements: 'As quatro valorações de p e q, seis conectivos e a condição de verdade de cada um.',
  },
  'regras-de-sequencias': {
    component: SequenceGrowthRules,
    title: sequence.title,
    alt: sequence.alt,
    source: { ...discreteMath, chapter: 'seção 2.4' },
    model: 'Progressões aritmética e geométrica e recorrência de Fibonacci',
    elements:
      'Diferença constante, razão constante, exemplos, dois casos iniciais de Fibonacci e recorrência.',
  },
  'conversao-binario-hexadecimal': {
    component: BinaryToHexConversion,
    title: baseConversion.title,
    alt: baseConversion.alt,
    source: { ...discreteMath, chapter: 'seção 4.2' },
    model: 'Representação posicional e conversão de base',
    elements:
      'Separação em dois grupos de quatro bits, pesos das posições, somas, dígitos B e 6 e resultado B6.',
  },
  'equivalencias-da-condicional': {
    component: ConditionalEquivalences,
    title: equivalences.title,
    alt: equivalences.alt,
    source: { ...discreteMath, chapter: 'cap. 1' },
    model: 'Equivalências e negação de uma condicional',
    elements:
      'Condicional, forma disjuntiva, contrapositiva, recíproca, inversa e condição que refuta a original.',
  },
} satisfies FigureRegistry;

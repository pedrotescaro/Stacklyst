import type { FigureRegistry, FigureSource } from '../types';
import {
  FunctionalDependencyNormalization,
  description as functionalDependencyNormalizationDescription,
} from './FunctionalDependencyNormalization';
import {
  LibraryCardinalities,
  description as libraryCardinalitiesDescription,
} from './LibraryCardinalities';
import { SqlJoinResults, description as sqlJoinResultsDescription } from './SqlJoinResults';
import {
  TransactionLifecycle,
  description as transactionLifecycleDescription,
} from './TransactionLifecycle';

const databaseSystems: FigureSource = {
  author: 'Elmasri e Navathe',
  year: 2018,
  reference:
    'ELMASRI, R.; NAVATHE, S. B. Sistemas de banco de dados. 7. ed. São Paulo: Pearson Education do Brasil, 2018.',
  href: 'https://loja.grupoa.com.br/sistemas-de-banco-de-dados-7ed9788543025001-p1005542',
};

export const figures = {
  'cardinalidades-biblioteca': {
    component: LibraryCardinalities,
    title: 'Cardinalidades do cadastro da biblioteca',
    alt: libraryCardinalitiesDescription,
    source: { ...databaseSystems, chapter: 'caps. 3 e 9, apêndice A' },
    model: 'Mapeamento ER-relacional e cardinalidades em pé de galinha',
    elements:
      'Cinco relações, cardinalidade mínima e máxima, relacionamentos identificadores e não identificadores, chaves primárias e estrangeiras.',
  },
  'normalizacao-dependencias-funcionais': {
    component: FunctionalDependencyNormalization,
    title: 'Normalização por dependências funcionais',
    alt: functionalDependencyNormalizationDescription,
    source: { ...databaseSystems, chapter: 'caps. 14 e 15' },
    model: 'Decomposição de relações por dependências funcionais',
    elements:
      'Grupo repetido, 1FN, chave composta, dependências parciais, 2FN, dependência transitiva, 3FN e verificação da BCNF.',
  },
  'juncao-relacoes-sql': {
    component: SqlJoinResults,
    title: 'Junções sobre duas relações',
    alt: sqlJoinResultsDescription,
    source: { ...databaseSystems, chapter: 'caps. 7 e 8' },
    model: 'Junção interna e junções externas em SQL e álgebra relacional',
    elements:
      'Relações de entrada, condição de igualdade, único par correspondente, preenchimento com NULL e quatro tabelas de resultados.',
  },
  'ciclo-transacao-sgbd': {
    component: TransactionLifecycle,
    title: 'Ciclo de uma transação no SGBD',
    alt: transactionLifecycleDescription,
    source: { ...databaseSystems, chapter: 'cap. 20' },
    model: 'Estados do processamento de transações',
    elements:
      'Início, ativa, parcialmente confirmada, confirmada, falha, desfazer, liberar recursos e terminada.',
  },
} satisfies FigureRegistry;

import type { FigureRegistry, FigureSource } from '../types';
import { BankAccountClass, description as bankAccountClassDescription } from './BankAccountClass';
import {
  DependencyInversion,
  description as dependencyInversionDescription,
} from './DependencyInversion';
import { FlightStrategy, description as flightStrategyDescription } from './FlightStrategy';
import {
  PrinterGeneralization,
  description as printerGeneralizationDescription,
} from './PrinterGeneralization';
import { StockObserver, description as stockObserverDescription } from './StockObserver';
import {
  StructuralRelationships,
  description as structuralRelationshipsDescription,
} from './StructuralRelationships';

const uml: FigureSource = {
  author: 'OMG',
  year: 2017,
  reference:
    'OBJECT MANAGEMENT GROUP. Unified Modeling Language (UML). Versão 2.5.1. [S. l.]: OMG, 2017.',
  href: 'https://www.omg.org/spec/UML/2.5.1',
};

const patterns: FigureSource = {
  author: 'Gamma et al.',
  year: 2000,
  chapter: 'cap. 5',
  reference:
    'GAMMA, E.; HELM, R.; JOHNSON, R.; VLISSIDES, J. Padrões de projeto: soluções reutilizáveis de software orientado a objetos. Porto Alegre: Bookman, 2000.',
};

export const figures = {
  'classe-conta-bancaria': {
    component: BankAccountClass,
    title: 'Interface de uma conta bancária',
    alt: bankAccountClassDescription,
    source: { ...uml, chapter: 'seções 7, 9 e 11' },
    model: 'Encapsulamento e compartimentos de classe UML',
    elements: 'Nome, atributos privados, operações públicas, parâmetros, tipos e valor de retorno.',
  },
  'generalizacao-impressora': {
    component: PrinterGeneralization,
    title: 'Contrato e especialização de impressão',
    alt: printerGeneralizationDescription,
    source: { ...uml, chapter: 'seções 9 e 10' },
    model: 'Generalização de classe e realização de interface',
    elements:
      'Interface, classe abstrata, operações, classe concreta, generalizações com triângulo vazio contínuas e realização tracejada.',
  },
  'inversao-dependencia-pedidos': {
    component: DependencyInversion,
    title: 'Dependências de um serviço de pedidos',
    alt: dependencyInversionDescription,
    source: {
      author: 'Martin',
      year: 2019,
      reference:
        'MARTIN, R. C. Arquitetura limpa: o guia do artesão para estrutura e design de software. Rio de Janeiro: Alta Books, 2019.',
      href: 'https://altabooks.com.br/produto/arquitetura-limpa/',
    },
    model: 'Princípio da inversão de dependência (DIP)',
    elements:
      'Cliente de alto nível, abstração de repositório, dependência e duas realizações concretas substituíveis.',
  },
  'relacoes-estruturais-uml': {
    component: StructuralRelationships,
    title: 'Três relações estruturais UML',
    alt: structuralRelationshipsDescription,
    source: { ...uml, chapter: 'seção 11' },
    model: 'Associação, agregação compartilhada e composição UML',
    elements:
      'Linha simples, losango vazio, losango cheio, identificação do todo e multiplicidades nas extremidades.',
  },
  'strategy-modos-voo': {
    component: FlightStrategy,
    title: 'Strategy para modos de voo',
    alt: flightStrategyDescription,
    source: patterns,
    model: 'Padrão comportamental Strategy',
    elements:
      'Contexto, referência à estratégia, delegação, interface Strategy e duas realizações.',
  },
  'observer-estoque': {
    component: StockObserver,
    title: 'Observer para mudanças de estoque',
    alt: stockObserverDescription,
    source: patterns,
    model: 'Padrão comportamental Observer, variante pull',
    elements:
      'Sujeito, inscrição, remoção, notificação, observador, atualização e consulta de estado pelo observador concreto.',
  },
} satisfies FigureRegistry;

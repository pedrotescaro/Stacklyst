import type { FigureRegistry, FigureSource } from '../types';
import { LoginSequence, description as loginSequenceDescription } from './LoginSequence';
import {
  OrderStateMachine,
  description as orderStateMachineDescription,
} from './OrderStateMachine';
import { SalesClassModel, description as salesClassModelDescription } from './SalesClassModel';
import { ShippingActivity, description as shippingActivityDescription } from './ShippingActivity';
import {
  UmlDiagramFamilies,
  description as umlDiagramFamiliesDescription,
} from './UmlDiagramFamilies';
import { UseCaseNotation, description as useCaseNotationDescription } from './UseCaseNotation';

const uml: FigureSource = {
  author: 'OMG',
  year: 2017,
  reference:
    'OBJECT MANAGEMENT GROUP. Unified Modeling Language (UML). Versão 2.5.1. [S. l.]: OMG, 2017.',
  href: 'https://www.omg.org/spec/UML/2.5.1',
};

export const figures = {
  'familias-uml': {
    component: UmlDiagramFamilies,
    title: 'Famílias de diagramas UML',
    alt: umlDiagramFamiliesDescription,
    source: { ...uml, chapter: 'anexo A' },
    model: 'Taxonomia dos diagramas UML 2.5.1',
    elements:
      'Sete diagramas estruturais, três comportamentais gerais e quatro diagramas de interação.',
  },
  'atividade-expedicao': {
    component: ShippingActivity,
    title: 'Atividade UML de expedição',
    alt: shippingActivityDescription,
    source: { ...uml, chapter: 'seções 15 e 16' },
    model: 'Diagrama de atividades UML',
    elements: 'Nó inicial, ações, decisão com guardas, fork, join, merge e nó final de atividade.',
  },
  'estados-pedido': {
    component: OrderStateMachine,
    title: 'Estados do pagamento à entrega',
    alt: orderStateMachineDescription,
    source: { ...uml, chapter: 'seção 14' },
    model: 'Máquina de estados UML',
    elements: 'Pseudoinicial, estados arredondados, eventos, guarda, efeitos e estados finais.',
  },
  'classes-vendas-pagamentos': {
    component: SalesClassModel,
    title: 'Estrutura de vendas e pagamentos',
    alt: salesClassModelDescription,
    source: { ...uml, chapter: 'seções 7 e 9–11' },
    model: 'Diagrama de classes UML',
    elements:
      'Classes, atributos, operações, visibilidade, multiplicidades, associação, composição, generalização, dependência e realização.',
  },
  'sequencia-tentativas-acesso': {
    component: LoginSequence,
    title: 'Sequência de tentativas de acesso',
    alt: loginSequenceDescription,
    source: { ...uml, chapter: 'seção 17' },
    model: 'Diagrama de sequência UML',
    elements:
      'Ator, linhas de vida, execuções, chamadas síncronas, respostas e fragmentos loop e alt.',
  },
  'casos-de-uso-biblioteca': {
    component: UseCaseNotation,
    title: 'Inclusão e extensão em casos de uso',
    alt: useCaseNotationDescription,
    source: { ...uml, chapter: 'seção 18' },
    model: 'Diagrama de casos de uso UML',
    elements:
      'Ator externo, fronteira do sistema, casos elípticos, associações, include, extend, condição e ponto de extensão.',
  },
} satisfies FigureRegistry;

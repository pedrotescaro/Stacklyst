import type { FigureRegistry } from '../types';
import { McCabeFlowGraph, details as mcCabeFlowGraphDetails } from './McCabeFlowGraph';
import {
  SoftwareTestingStrategy,
  details as softwareTestingStrategyDetails,
} from './SoftwareTestingStrategy';
import { TestingStages, details as testingStagesDetails } from './TestingStages';

export const figures = {
  'grafo-fluxo-mccabe': {
    component: McCabeFlowGraph,
    ...mcCabeFlowGraphDetails,
    source: {
      author: 'McCabe',
      year: 1976,
      reference:
        'MCCABE, Thomas J. A complexity measure. IEEE Transactions on Software Engineering, New York, v. SE-2, n. 4, p. 308–320, 1976. DOI: 10.1109/TSE.1976.233837.',
      href: 'https://doi.org/10.1109/TSE.1976.233837',
    },
    relatedSources: [
      {
        author: 'Pressman e Maxim',
        year: 2016,
        reference:
          'PRESSMAN, Roger S.; MAXIM, Bruce R. Engenharia de software: uma abordagem profissional. 8. ed. Porto Alegre: AMGH, 2016.',
        href: 'https://glencoe.mheducation.com/sites/0078022126/information_center_view0/table_of_contents.html',
        chapter: 'cap. 23',
      },
    ],
    model: 'Grafo de fluxo de controle e complexidade ciclomática',
    elements:
      'Seis nós numerados, sete arestas, duas decisões, três regiões numeradas e V(G) = 7 − 6 + 2 = 3',
  },
  'estrategia-testes-software': {
    component: SoftwareTestingStrategy,
    ...softwareTestingStrategyDetails,
    source: {
      author: 'Pressman e Maxim',
      year: 2016,
      reference:
        'PRESSMAN, Roger S.; MAXIM, Bruce R. Engenharia de software: uma abordagem profissional. 8. ed. Porto Alegre: AMGH, 2016.',
      href: 'https://glencoe.mheducation.com/sites/0078022126/information_center_view0/table_of_contents.html',
      chapter: 'cap. 22',
    },
    model: 'Estratégia de testes incrementando o escopo',
    elements: 'Unidade, integração, validação e sistema',
  },
  'etapas-testes-software': {
    component: TestingStages,
    ...testingStagesDetails,
    source: {
      author: 'Sommerville',
      year: 2018,
      reference: 'SOMMERVILLE, Ian. Engenharia de software. 10. ed. São Paulo: Pearson, 2018.',
      href: 'https://loja.grupoa.com.br/novo/engenharia-de-software-10ed-9788543024974-p1005544',
      chapter: 'cap. 8',
    },
    model: 'Etapas de teste no ciclo de desenvolvimento',
    elements: 'Desenvolvimento, release independente e usuário (alfa, beta e aceitação)',
  },
} satisfies FigureRegistry;

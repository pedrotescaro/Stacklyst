import type { FigureRegistry } from '../types';
import { RupUseCaseArtifacts, details as rupUseCaseArtifactsDetails } from './RupUseCaseArtifacts';
import {
  RupMilestoneTimeline,
  details as rupMilestoneTimelineDetails,
} from './RupMilestoneTimeline';
import { RupIteration, details as rupIterationDetails } from './RupIteration';
import { RupHumpChart, details as rupHumpChartDetails } from './RupHumpChart';

export const figures = {
  'artefatos-caso-uso-rup': {
    component: RupUseCaseArtifacts,
    ...rupUseCaseArtifactsDetails,
    source: {
      author: 'Kruchten',
      year: 2004,
      reference:
        'KRUCHTEN, Philippe. The Rational Unified Process: an introduction. 3. ed. Boston: Addison-Wesley, 2004.',
      href: 'https://www.informit.com/store/rational-unified-process-an-introduction-9780321197702',
      chapter: 'cap. 6',
    },
    model: 'Processo orientado a casos de uso no RUP',
    elements:
      'Modelo de negócio, caso de uso, modelo de projeto, componentes/build, testes e pacote de implantação',
  },
  'linha-tempo-marcos-rup': {
    component: RupMilestoneTimeline,
    ...rupMilestoneTimelineDetails,
    source: {
      author: 'Kruchten',
      year: 2004,
      reference:
        'KRUCHTEN, Philippe. The Rational Unified Process: an introduction. 3. ed. Boston: Addison-Wesley, 2004.',
      href: 'https://www.informit.com/store/rational-unified-process-an-introduction-9780321197702',
      chapter: 'cap. 4',
    },
    model: 'Fases e marcos do ciclo de vida do RUP',
    elements:
      'Concepção, elaboração, construção e transição; iterações ilustrativas; LCO, LCA, IOC e PR',
  },
  'ciclo-iteracao-rup': {
    component: RupIteration,
    ...rupIterationDetails,
    source: {
      author: 'Kruchten',
      year: 2004,
      reference:
        'KRUCHTEN, Philippe. The Rational Unified Process: an introduction. 3. ed. Boston: Addison-Wesley, 2004.',
      href: 'https://www.informit.com/store/rational-unified-process-an-introduction-9780321197702',
      chapter: 'cap. 7',
    },
    model: 'Ciclo de trabalho de uma iteração do RUP',
    elements:
      'Plano, riscos e casos de uso, escopo, projeto/implementação, integração, testes, avaliação e incremento',
  },
  'fases-disciplinas-marcos-rup': {
    component: RupHumpChart,
    ...rupHumpChartDetails,
    source: {
      author: 'Kruchten',
      year: 2004,
      reference:
        'KRUCHTEN, Philippe. The Rational Unified Process: an introduction. 3. ed. Boston: Addison-Wesley, 2004.',
      href: 'https://www.informit.com/store/rational-unified-process-an-introduction-9780321197702',
      chapter: 'cap. 4',
    },
    model: 'Gráfico qualitativo de fases por disciplinas no RUP',
    elements: 'Quatro fases, nove disciplinas, ênfases variáveis, marcos LCO/LCA/IOC/PR',
  },
} satisfies FigureRegistry;

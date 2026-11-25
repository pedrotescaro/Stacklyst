import type { FigureRegistry } from '../types';
import {
  SoftwareProcessActivities,
  details as softwareProcessActivitiesDetails,
} from './SoftwareProcessActivities';
import { BaselineChange, details as baselineChangeDetails } from './BaselineChange';
import { CriticalPathNetwork, details as criticalPathNetworkDetails } from './CriticalPathNetwork';
import { StoreNavigationMap, details as storeNavigationMapDetails } from './StoreNavigationMap';
import {
  LegacySystemDecisions,
  details as legacySystemDecisionsDetails,
} from './LegacySystemDecisions';
import { ScrumCycle, details as scrumCycleDetails } from './ScrumCycle';
import { TddLoop, details as tddLoopDetails } from './TddLoop';
import { WaterfallModel, details as waterfallModelDetails } from './WaterfallModel';
import { VModel, details as vModelDetails } from './VModel';
import { BoehmSpiral, details as boehmSpiralDetails } from './BoehmSpiral';
import {
  ProcessMaturityScales,
  details as processMaturityScalesDetails,
} from './ProcessMaturityScales';

export const figures = {
  'atividades-processo-software': {
    component: SoftwareProcessActivities,
    ...softwareProcessActivitiesDetails,
    source: {
      author: 'Sommerville',
      year: 2018,
      reference: 'SOMMERVILLE, Ian. Engenharia de software. 10. ed. São Paulo: Pearson, 2018.',
      href: 'https://loja.grupoa.com.br/novo/engenharia-de-software-10ed-9788543024974-p1005544',
      chapter: 'cap. 2',
    },
    model: 'Atividades fundamentais do processo de software',
    elements: 'Especificação, desenvolvimento, validação e evolução',
  },
  'mudanca-baseline': {
    component: BaselineChange,
    ...baselineChangeDetails,
    source: {
      author: 'Pressman e Maxim',
      year: 2016,
      reference:
        'PRESSMAN, Roger S.; MAXIM, Bruce R. Engenharia de software: uma abordagem profissional. 8. ed. Porto Alegre: AMGH, 2016.',
      href: 'https://glencoe.mheducation.com/sites/0078022126/information_center_view0/table_of_contents.html',
      chapter: 'cap. 29',
    },
    model: 'Controle de mudanças de software',
    elements:
      'Solicitação, análise, decisão do comitê, ordem, implementação, revisão, auditoria, registro de situação e nova linha de base',
  },
  'rede-caminho-critico': {
    component: CriticalPathNetwork,
    ...criticalPathNetworkDetails,
    source: {
      author: 'Project Management Institute',
      year: 2017,
      chapter: 'seção 6.5.2.2',
      reference:
        'PROJECT MANAGEMENT INSTITUTE. A guide to the project management body of knowledge (PMBOK guide). 6. ed. Newtown Square: Project Management Institute, 2017.',
      href: 'https://www.pmi.org/-/media/pmi/documents/public/pdf/pmbok-standards/errata-sheet-qas-6th.pdf',
    },
    model: 'Método do caminho crítico em rede de precedências',
    elements: 'T1, T2, T3, T4, T5, T6 e T7 com durações; dependências; caminho crítico de 20 dias',
  },
  'navegacao-loja': {
    component: StoreNavigationMap,
    ...storeNavigationMapDetails,
    source: {
      author: 'Pressman e Maxim',
      year: 2016,
      reference:
        'PRESSMAN, Roger S.; MAXIM, Bruce R. Engenharia de software: uma abordagem profissional. 8. ed. Porto Alegre: AMGH, 2016.',
      href: 'https://glencoe.mheducation.com/sites/0078022126/information_center_view0/table_of_contents.html',
      chapter: 'cap. 17',
    },
    model: 'Mapa de navegação de uma interface (exemplo de loja)',
    elements:
      'Busca e categorias convergem em produto; carrinho; revisão; confirmação; retornos de compra e edição',
  },
  'matriz-sistemas-legados': {
    component: LegacySystemDecisions,
    ...legacySystemDecisionsDetails,
    source: {
      author: 'Sommerville',
      year: 2018,
      reference: 'SOMMERVILLE, Ian. Engenharia de software. 10. ed. São Paulo: Pearson, 2018.',
      href: 'https://loja.grupoa.com.br/novo/engenharia-de-software-10ed-9788543024974-p1005544',
      chapter: 'cap. 9',
    },
    model: 'Matriz de avaliação de legados por qualidade e valor',
    elements:
      'Valor de negócio e qualidade técnica; retirada, reengenharia ou substituição, manutenção condicionada e evolução',
  },
  'eventos-artefatos-scrum': {
    component: ScrumCycle,
    ...scrumCycleDetails,
    source: {
      author: 'Schwaber e Sutherland',
      year: 2020,
      chapter: 'seções Eventos do Scrum e Artefatos do Scrum',
      reference:
        'SCHWABER, Ken; SUTHERLAND, Jeff. O guia do Scrum: o guia definitivo para o Scrum. [S. l.]: Scrum Guides, 2020.',
      href: 'https://scrumguides.org/scrum-guide.html',
    },
    model: 'Eventos, artefatos e compromissos do Scrum 2020',
    elements:
      'Sprint, planejamento, Daily Scrum, revisão, retrospectiva; Product Backlog/Meta do Produto, Sprint Backlog/Meta da Sprint e Incremento/Definição de Pronto; entrega possível antes da revisão',
  },
  'ciclo-tdd': {
    component: TddLoop,
    ...tddLoopDetails,
    source: {
      author: 'Beck',
      year: 2003,
      reference: 'BECK, Kent. Test-driven development: by example. Boston: Addison-Wesley, 2003.',
      href: 'https://www.informit.com/store/test-driven-development-by-example-9780321146533',
    },
    model: 'Desenvolvimento guiado por testes (TDD)',
    elements: 'Teste falhando, teste passando com mudança mínima, refatoração e reinício',
  },
  'modelo-cascata': {
    component: WaterfallModel,
    ...waterfallModelDetails,
    source: {
      author: 'Sommerville',
      year: 2018,
      reference: 'SOMMERVILLE, Ian. Engenharia de software. 10. ed. São Paulo: Pearson, 2018.',
      href: 'https://loja.grupoa.com.br/novo/engenharia-de-software-10ed-9788543024974-p1005544',
      chapter: 'cap. 2',
    },
    model: 'Modelo cascata na versão de Sommerville',
    elements:
      'Requisitos, projeto, implementação e teste unitário, integração e teste de sistema, operação e manutenção; retorno de revisão',
  },
  'modelo-v': {
    component: VModel,
    ...vModelDetails,
    source: {
      author: 'Pressman e Maxim',
      year: 2016,
      reference:
        'PRESSMAN, Roger S.; MAXIM, Bruce R. Engenharia de software: uma abordagem profissional. 8. ed. Porto Alegre: AMGH, 2016.',
      href: 'https://glencoe.mheducation.com/sites/0078022126/information_center_view0/table_of_contents.html',
      chapter: 'cap. 4',
    },
    model: 'Modelo V na versão de Pressman e Maxim',
    elements:
      'Requisitos/aceitação, arquitetura/sistema, componentes/integração, código/unidade e executável',
  },
  'espiral-boehm': {
    component: BoehmSpiral,
    ...boehmSpiralDetails,
    source: {
      author: 'Boehm',
      year: 1988,
      reference:
        'BOEHM, Barry W. A spiral model of software development and enhancement. Computer, New York, v. 21, n. 5, p. 61–72, 1988. DOI: 10.1109/2.59.',
      href: 'https://doi.org/10.1109/2.59',
    },
    model: 'Modelo espiral de desenvolvimento de Boehm',
    elements:
      'Objetivos, alternativas e restrições; análise e redução de risco em cada volta; desenvolvimento e verificação; plano, revisão e compromisso; custo acumulado',
  },
  'escalas-maturidade-processos': {
    component: ProcessMaturityScales,
    ...processMaturityScalesDetails,
    source: {
      author: 'CMMI Product Team',
      year: 2010,
      reference:
        'CMMI PRODUCT TEAM. CMMI for development, version 1.3: improving processes for developing better products and services. Pittsburgh: Software Engineering Institute, Carnegie Mellon University, 2010. (CMU/SEI-2010-TR-033).',
      href: 'https://insights.sei.cmu.edu/documents/853/2010_005_001_15287.pdf',
      chapter: 'cap. 3',
    },
    relatedSources: [
      {
        author: 'Softex',
        year: 2021,
        reference: 'SOFTEX. Guia geral MPS de software: 2021. Brasília, DF: Softex, 2021.',
        href: 'https://softex.br/download/guia-geral-de-software-2021/',
      },
    ],
    model: 'Níveis de maturidade CMMI-DEV 1.3 e MR-MPS-SW 2021',
    elements:
      'Cinco níveis CMMI de 1 a 5 e sete níveis MPS de G a A apresentados como escalas independentes',
  },
} satisfies FigureRegistry;

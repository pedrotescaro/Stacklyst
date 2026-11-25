import { BuildMeasureLearn, buildMeasureLearn } from './BuildMeasureLearn';
import { BusinessPlanDimensions, businessPlanDimensions } from './BusinessPlanDimensions';
import { EnterpriseInformationFlow, enterpriseInformationFlow } from './EnterpriseInformationFlow';
import { ProjectCashFlow, projectCashFlow } from './ProjectCashFlow';
import type { FigureRegistry } from '../types';

export const figures = {
  'ciclo-construir-medir-aprender': {
    component: BuildMeasureLearn,
    ...buildMeasureLearn,
    source: {
      author: 'RIES',
      year: 2011,
      chapter: 'parte 2, caps. 5–8',
      reference:
        'RIES, Eric. *The lean startup: how today’s entrepreneurs use continuous innovation to create radically successful businesses*. New York: Crown Business, 2011.',
      href: 'https://theleanstartup.com/principles',
    },
    model: 'Ciclo de feedback da startup enxuta',
    elements:
      'Hipótese, construir/MVP, medir/dados, aprender, pivotar ou perseverar e retorno para próximo teste.',
  },
  'dimensoes-do-plano-de-negocios': {
    component: BusinessPlanDimensions,
    ...businessPlanDimensions,
    source: {
      author: 'SAHLMAN',
      year: 1997,
      reference:
        'SAHLMAN, William A. How to write a great business plan. *Harvard Business Review*, Boston, v. 75, n. 4, p. 98–108, jul./ago. 1997.',
      href: 'https://hbr.org/1997/07/how-to-write-a-great-business-plan',
    },
    model: 'Quatro fatores da avaliação de um empreendimento',
    elements:
      'Pessoas, oportunidade, contexto, riscos e retornos, conectados ao plano de negócios.',
  },
  'operacao-empresarial-e-analise': {
    component: EnterpriseInformationFlow,
    ...enterpriseInformationFlow,
    source: {
      author: 'LAUDON; LAUDON',
      year: 2022,
      chapter: 'caps. 6 e 9',
      reference:
        'LAUDON, Kenneth C.; LAUDON, Jane P. *Management information systems: managing the digital firm*. 17. ed. global. Harlow: Pearson Education, 2022.',
      href: 'https://www.pearson.com/en-gb/subject-catalog/p/management-information-systems-managing-the-digital-firm-global-edition/P200000004708',
    },
    model: 'Integração de aplicações empresariais e inteligência de negócios',
    elements:
      'Exemplo de CRM e SCM ligados ao ERP; base transacional, preparação ETL, data warehouse e relatórios.',
  },
  'fluxo-de-caixa-do-projeto': {
    component: ProjectCashFlow,
    ...projectCashFlow,
    source: {
      author: 'DAHLQUIST; KNIGHT',
      year: 2022,
      chapter: 'seção 16.2',
      reference:
        'DAHLQUIST, Julie; KNIGHT, Rainford. *Principles of finance*. Houston: OpenStax, 2022.',
      href: 'https://openstax.org/books/principles-finance/pages/16-2-net-present-value-npv-method',
    },
    model: 'Linha do tempo de fluxos de caixa de um investimento',
    elements:
      'Anos 0 a 3, eixo temporal, investimento inicial negativo de R$ 100 mil e três entradas nominais de R$ 45 mil.',
  },
} satisfies FigureRegistry;

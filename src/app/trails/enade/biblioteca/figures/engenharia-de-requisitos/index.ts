import type { FigureRegistry } from '../types';
import {
  RequirementTestTraceability,
  details as requirementTestTraceabilityDetails,
} from './RequirementTestTraceability';
import { CreditApprovalEpc, details as creditApprovalEpcDetails } from './CreditApprovalEpc';
import { BpmLifecycle, details as bpmLifecycleDetails } from './BpmLifecycle';
import { RequirementKinds, details as requirementKindsDetails } from './RequirementKinds';
import {
  RequirementsElicitation,
  details as requirementsElicitationDetails,
} from './RequirementsElicitation';
import { RequirementsSpiral, details as requirementsSpiralDetails } from './RequirementsSpiral';

export const figures = {
  'rastreabilidade-requisito-teste': {
    component: RequirementTestTraceability,
    ...requirementTestTraceabilityDetails,
    source: {
      author: 'Wiegers e Beatty',
      year: 2013,
      reference:
        'WIEGERS, Karl; BEATTY, Joy. Software requirements. 3. ed. Redmond: Microsoft Press, 2013.',
      href: 'https://www.microsoftpressstore.com/store/software-requirements-9780735679627',
      chapter: 'cap. 29',
    },
    model: 'Rastreabilidade de requisitos para verificação',
    elements:
      'Necessidade, história, critérios de aceitação e testes; caso de uso, fluxos e casos de teste',
  },
  'epc-concessao-credito': {
    component: CreditApprovalEpc,
    ...creditApprovalEpcDetails,
    source: {
      author: 'Scheer',
      year: 2000,
      reference:
        'SCHEER, August-Wilhelm. ARIS: business process modeling. 3. ed. Berlin: Springer, 2000. DOI: 10.1007/978-3-642-57108-4.',
      href: 'https://doi.org/10.1007/978-3-642-57108-4',
    },
    model: 'Cadeia de processos orientada a eventos (EPC)',
    elements:
      'Eventos hexagonais, funções arredondadas, conector XOR após decisão e término em eventos distintos',
  },
  'ciclo-gestao-processos': {
    component: BpmLifecycle,
    ...bpmLifecycleDetails,
    source: {
      author: 'Dumas et al.',
      year: 2018,
      reference:
        'DUMAS, Marlon; LA ROSA, Marcello; MENDLING, Jan; REIJERS, Hajo A. Fundamentals of business process management. 2. ed. Berlin: Springer, 2018. DOI: 10.1007/978-3-662-56509-4.',
      href: 'https://doi.org/10.1007/978-3-662-56509-4',
      chapter: 'cap. 1',
    },
    model: 'Ciclo de BPM',
    elements:
      'Identificação, descoberta, análise, redesenho, implantação, monitoramento e retorno de resultados',
  },
  'tipos-requisitos-sistema': {
    component: RequirementKinds,
    ...requirementKindsDetails,
    source: {
      author: 'Sommerville',
      year: 2018,
      reference: 'SOMMERVILLE, Ian. Engenharia de software. 10. ed. São Paulo: Pearson, 2018.',
      href: 'https://loja.grupoa.com.br/novo/engenharia-de-software-10ed-9788543024974-p1005544',
      chapter: 'cap. 4',
    },
    model: 'Classificação de requisitos de software',
    elements:
      'Funcionais e não funcionais; produto, organização e requisitos externos; influência das regras do domínio',
  },
  'descoberta-analise-requisitos': {
    component: RequirementsElicitation,
    ...requirementsElicitationDetails,
    source: {
      author: 'Sommerville',
      year: 2018,
      reference: 'SOMMERVILLE, Ian. Engenharia de software. 10. ed. São Paulo: Pearson, 2018.',
      href: 'https://loja.grupoa.com.br/novo/engenharia-de-software-10ed-9788543024974-p1005544',
      chapter: 'cap. 4',
    },
    model: 'Elicitação e análise iterativas',
    elements:
      'Entrevista, observação, documentos; descoberta, organização, negociação, especificação e realimentação',
  },
  'espiral-requisitos': {
    component: RequirementsSpiral,
    ...requirementsSpiralDetails,
    source: {
      author: 'Sommerville',
      year: 2018,
      reference: 'SOMMERVILLE, Ian. Engenharia de software. 10. ed. São Paulo: Pearson, 2018.',
      href: 'https://loja.grupoa.com.br/novo/engenharia-de-software-10ed-9788543024974-p1005544',
      chapter: 'cap. 4, seção 4.2',
    },
    model: 'Espiral da engenharia de requisitos',
    elements:
      'Estudo de viabilidade quando necessário, elicitação e análise, especificação, validação, voltas em número variável e documento de requisitos',
  },
} satisfies FigureRegistry;

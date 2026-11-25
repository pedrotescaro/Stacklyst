import type { FigureRegistry, FigureSource } from '../types';
import { DeploymentUnits, description as deploymentUnitsDescription } from './DeploymentUnits';
import { HexagonalPorts, description as hexagonalPortsDescription } from './HexagonalPorts';
import {
  LayeredRequestSequence,
  description as layeredRequestSequenceDescription,
} from './LayeredRequestSequence';
import { MvcNotifications, description as mvcNotificationsDescription } from './MvcNotifications';
import {
  PassiveViewBinding,
  description as passiveViewBindingDescription,
} from './PassiveViewBinding';
import { PhysicalTiers, description as physicalTiersDescription } from './PhysicalTiers';

const fowlerGui: FigureSource = {
  author: 'Fowler',
  year: 2006,
  reference: 'FOWLER, M. GUI architectures. [S. l.], 2006.',
  href: 'https://martinfowler.com/eaaDev/uiArchs.html',
};

const fowlerEaa: FigureSource = {
  author: 'Fowler',
  year: 2002,
  reference:
    'FOWLER, M. Patterns of enterprise application architecture. Boston: Addison-Wesley, 2002.',
  href: 'https://martinfowler.com/books/eaa.html',
};

export const figures = {
  'implantacao-monolito-microsservicos': {
    component: DeploymentUnits,
    title: 'Unidades de implantação',
    alt: deploymentUnitsDescription,
    source: {
      author: 'Newman',
      year: 2022,
      chapter: 'cap. 1',
      reference:
        'NEWMAN, S. Criando microsserviços: projetando sistemas com componentes menores e mais especializados. 2. ed. São Paulo: Novatec, 2022.',
      href: 'https://www.novatec.com.br/livros/criando-microsservicos-2ed',
    },
    model: 'Implantação monolítica e implantação independente de microsserviços',
    elements:
      'Uma unidade compartilhada, dois serviços independentes, dados sob responsabilidade de cada serviço e API.',
  },
  'portas-e-adaptadores': {
    component: HexagonalPorts,
    title: 'Portas e adaptadores',
    alt: hexagonalPortsDescription,
    source: {
      author: 'Cockburn',
      year: 2005,
      reference:
        'COCKBURN, A. Hexagonal architecture. [S. l.]: Humans and Technology, 2005. HaT Technical Report 2005.02.',
      href: 'https://alistair.cockburn.us/hexagonal-architecture',
    },
    model: 'Arquitetura hexagonal (Ports and Adapters)',
    elements:
      'Núcleo, fronteira, porta de entrada, porta de saída, adaptadores que acionam e adaptadores acionados.',
  },
  'mvc-notificacao-modelo': {
    component: MvcNotifications,
    title: 'MVC com notificação do modelo',
    alt: mvcNotificationsDescription,
    source: fowlerGui,
    model: 'Model–View–Controller clássico com observação do modelo',
    elements:
      'Pessoa usuária, controlador, visão, modelo, alteração de estado, notificação e leitura do modelo.',
  },
  'mvp-mvvm-vinculacao': {
    component: PassiveViewBinding,
    title: 'Visão passiva e vinculação de dados',
    alt: passiveViewBindingDescription,
    source: fowlerGui,
    model: 'Passive View (MVP) e Presentation Model (MVVM)',
    elements:
      'Duas tríades, eventos, atualização explícita, comandos, vinculação de dados e interação com o modelo.',
  },
  'duas-tres-camadas-fisicas': {
    component: PhysicalTiers,
    title: 'Duas e três camadas físicas',
    alt: physicalTiersDescription,
    source: { ...fowlerEaa, chapter: 'cap. 7' },
    model: 'Distribuição física em duas e três camadas',
    elements:
      'Cliente, apresentação, regras de negócio, servidor de aplicação, servidor de dados e persistência.',
  },
  'requisicao-camadas': {
    component: LayeredRequestSequence,
    title: 'Requisição através das camadas',
    alt: layeredRequestSequenceDescription,
    source: { ...fowlerEaa, chapter: 'cap. 1' },
    model: 'Camadas lógicas de apresentação, aplicação e dados, em sequência UML',
    elements:
      'Três linhas de vida, envio, autoinvocação de validação, gravação, confirmação e retorno.',
  },
} satisfies FigureRegistry;

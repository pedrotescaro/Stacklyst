import { AssertionReasonMatrix, assertionReasonMatrix } from './AssertionReasonMatrix';
import { BrazilPoliticalTimeline, brazilPoliticalTimeline } from './BrazilPoliticalTimeline';
import { ComicsReadingLayers, comicsReadingLayers } from './ComicsReadingLayers';
import { DigitalAccessStages, digitalAccessStages } from './DigitalAccessStages';
import { PolicyCycle, policyCycle } from './PolicyCycle';
import { ReadingInference, readingInference } from './ReadingInference';
import {
  SocialInterventionElements,
  socialInterventionElements,
} from './SocialInterventionElements';
import { SustainabilityDimensions, sustainabilityDimensions } from './SustainabilityDimensions';
import type { FigureRegistry } from '../types';

export const figures = {
  'etapas-do-acesso-digital': {
    component: DigitalAccessStages,
    ...digitalAccessStages,
    source: {
      author: 'VAN DIJK',
      year: 2005,
      chapter: 'caps. 2–6',
      reference:
        'VAN DIJK, Jan A. G. M. *The deepening divide: inequality in the information society*. Thousand Oaks: SAGE, 2005.',
      href: 'https://us2.sagepub.com/en-us/nam/book/deepening-divide',
    },
    model: 'Modelo de acesso sucessivo à tecnologia digital',
    elements:
      'Motivação, acesso material, habilidades e uso; influência de recursos e condições sociais.',
  },
  'julgamento-de-assercao-e-razao': {
    component: AssertionReasonMatrix,
    ...assertionReasonMatrix,
    source: {
      author: 'INEP',
      year: 2014,
      chapter: 'questão 13',
      reference:
        'INSTITUTO NACIONAL DE ESTUDOS E PESQUISAS EDUCACIONAIS ANÍSIO TEIXEIRA. *Enade 2014: tecnologia em análise e desenvolvimento de sistemas*. Brasília, DF: Inep, 2014.',
      href: 'https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enade/provas-e-gabaritos',
    },
    model: 'Análise de asserção e razão em item de prova',
    elements:
      'Julgamento separado das duas afirmações, quatro pares de verdade e exame do nexo quando ambas são verdadeiras.',
  },
  'elementos-da-intervencao-social': {
    component: SocialInterventionElements,
    ...socialInterventionElements,
    source: {
      author: 'INEP',
      year: 2025,
      reference:
        'INSTITUTO NACIONAL DE ESTUDOS E PESQUISAS EDUCACIONAIS ANÍSIO TEIXEIRA. *A redação do Enem 2025: cartilha do participante*. Brasília, DF: Inep, 2025.',
      href: 'https://www.gov.br/inep/pt-br/centrais-de-conteudo/acervo-linha-editorial/publicacoes-institucionais/avaliacoes-e-exames-da-educacao-basica/redacao-do-enem-2025-cartilha-do-a-participante/',
    },
    model: 'Composição da proposta de intervenção da cartilha do Inep',
    elements:
      'Problema a enfrentar, ação, agente, meio, efeito, detalhamento e respeito integral aos direitos humanos.',
  },
  'marcos-da-historia-politica-brasileira': {
    component: BrazilPoliticalTimeline,
    ...brazilPoliticalTimeline,
    source: {
      author: 'FAUSTO',
      year: 2024,
      reference: 'FAUSTO, Boris. *História do Brasil*. 14. ed. São Paulo: Edusp, 2024.',
      href: 'https://www.edusp.com.br/livros/historia-do-brasil/',
    },
    model: 'Cronologia de marcos político-institucionais',
    elements:
      'Colonização, Independência, Abolição, República, Era Vargas, golpe de 1964 e Constituição de 1988. Linha esquemática sem escala.',
  },
  'pistas-e-inferencias-na-leitura': {
    component: ReadingInference,
    ...readingInference,
    source: {
      author: 'KOCH; ELIAS',
      year: 2006,
      reference:
        'KOCH, Ingedore Villaça; ELIAS, Vanda Maria. *Ler e compreender: os sentidos do texto*. São Paulo: Contexto, 2006.',
      href: 'https://www.editoracontexto.com.br/ler-e-compreender-os-sentidos-do-texto/p',
    },
    model: 'Leitura como construção interativa de sentidos',
    elements:
      'Pistas textuais, situação, conhecimento de mundo, inferência e revisão quando falta apoio no texto.',
  },
  'leitura-de-quadrinhos-e-charges': {
    component: ComicsReadingLayers,
    ...comicsReadingLayers,
    source: {
      author: 'RAMOS',
      year: 2009,
      reference: 'RAMOS, Paulo. *A leitura dos quadrinhos*. São Paulo: Contexto, 2009.',
      href: 'https://www.bvirtual.com.br/NossoAcervo/Publicacao/leitura-dos-quadrinhos-1107',
    },
    model: 'Integração de elementos verbais e visuais nos quadrinhos',
    elements:
      'Balões, gestos e enquadramento, sucessão de quadros, combinação palavra–imagem e interpretação orientada pelo contexto.',
  },
  'ciclo-de-politica-publica': {
    component: PolicyCycle,
    ...policyCycle,
    source: {
      author: 'SECCHI',
      year: 2013,
      chapter: 'cap. 3',
      reference:
        'SECCHI, Leonardo. *Políticas públicas: conceitos, esquemas de análise, casos práticos*. 2. ed. São Paulo: Cengage Learning, 2013.',
      href: 'https://embed-rech-01.dialog.cm/cengagebrasil/docs/9788522113538',
    },
    model: 'Ciclo analítico de políticas públicas',
    elements:
      'Problema, agenda, alternativas, decisão, implementação, avaliação, extinção e possibilidade de reformulação.',
  },
  'dimensoes-da-sustentabilidade': {
    component: SustainabilityDimensions,
    ...sustainabilityDimensions,
    source: {
      author: 'ELKINGTON',
      year: 1997,
      reference:
        'ELKINGTON, John. *Cannibals with forks: the triple bottom line of 21st century business*. Oxford: Capstone, 1997.',
      href: 'https://books.google.com/books/about/Cannibals_with_Forks.html?id=QLg9PgAACAAJ',
    },
    model: 'Triple bottom line',
    elements:
      'Desempenho ambiental, social e econômico, considerados em conjunto na avaliação da sustentabilidade.',
  },
} satisfies FigureRegistry;

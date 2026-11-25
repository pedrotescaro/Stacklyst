import type { FigureRegistry, FigureSource } from '../types';
import CloudResponsibilityMatrix, * as cloud from './CloudResponsibilityMatrix';
import DigitalSignatureFlow, * as signature from './DigitalSignatureFlow';
import DnsRecursiveLookup, * as dns from './DnsRecursiveLookup';
import OsiTcpIpStack, * as osi from './OsiTcpIpStack';
import ProcessStateDiagram, * as process from './ProcessStateDiagram';
import VirtualAddressTranslation, * as address from './VirtualAddressTranslation';
import VirtualMachinesAndContainers, * as virtualization from './VirtualMachinesAndContainers';

const modernOperatingSystems = {
  author: 'TANENBAUM; BOS',
  year: 2016,
  reference:
    'TANENBAUM, Andrew S.; BOS, Herbert. Sistemas operacionais modernos. 4. ed. São Paulo: Pearson Education do Brasil, 2016.',
  href: 'https://www.informit.com/store/modern-operating-systems-9780133591620',
} satisfies FigureSource;

export const figures = {
  'responsabilidade-na-nuvem': {
    component: CloudResponsibilityMatrix,
    title: cloud.title,
    alt: cloud.alt,
    source: {
      author: 'MELL; GRANCE',
      year: 2011,
      reference:
        'MELL, Peter; GRANCE, Timothy. The NIST definition of cloud computing. Gaithersburg: National Institute of Standards and Technology, 2011. NIST SP 800-145.',
      href: 'https://csrc.nist.gov/pubs/sp/800/145/final',
    },
    model: 'Modelos de serviço da computação em nuvem',
    elements:
      'IaaS, PaaS e SaaS, com as responsabilidades de cliente e provedor em três linhas comparáveis.',
  },
  'hipervisor-e-conteineres': {
    component: VirtualMachinesAndContainers,
    title: virtualization.title,
    alt: virtualization.alt,
    source: {
      author: 'TANENBAUM; BOS',
      year: 2023,
      chapter: 'cap. 7',
      reference:
        'TANENBAUM, Andrew S.; BOS, Herbert. Modern operating systems. 5. ed. Hoboken: Pearson, 2023.',
      href: 'https://www.pearson.com/en-us/pearsonplus/p/9780137618880.html',
    },
    relatedSources: [
      {
        author: 'IRWIN',
        year: 2026,
        reference: 'IRWIN, Michael. What is a container? [S. l.]: Docker, 2026.',
        href: 'https://docs.docker.com/learn/content/what-is-a-container/',
      },
    ],
    model: 'Virtualização tipo 1 e isolamento em contêineres',
    elements:
      'Máquinas virtuais, sistemas convidados independentes, hipervisor sobre hardware, dois contêineres, runtime e kernel do hospedeiro.',
  },
  'traducao-de-endereco-virtual': {
    component: VirtualAddressTranslation,
    title: address.title,
    alt: address.alt,
    source: { ...modernOperatingSystems, chapter: 'cap. 3' },
    model: 'Paginação com TLB e tratamento de falta de página',
    elements:
      'Página e deslocamento, acerto ou falha na TLB, tabela de páginas, atualização, falta, retorno e endereço físico.',
  },
  'consulta-dns-recursiva': {
    component: DnsRecursiveLookup,
    title: dns.title,
    alt: dns.alt,
    source: {
      author: 'KUROSE; ROSS',
      year: 2021,
      chapter: 'seção 2.4',
      reference:
        'KUROSE, James F.; ROSS, Keith W. Computer networking: a top-down approach. 8. ed. Hoboken: Pearson, 2021.',
      href: 'https://www.pearson.com/en-us/subject-catalog/p/computer-networking/P200000003334/9780136681557',
    },
    model: 'Resolução DNS recursiva e consultas iterativas',
    elements:
      'Pedido ao resolvedor, cache, raiz, servidor de domínio de topo, autoritativo, referências, registro, TTL e resposta.',
  },
  'camadas-osi-tcp-ip': {
    component: OsiTcpIpStack,
    title: osi.title,
    alt: osi.alt,
    source: {
      author: 'TANENBAUM; WETHERALL',
      year: 2011,
      chapter: 'cap. 1',
      reference:
        'TANENBAUM, Andrew S.; WETHERALL, David J. Redes de computadores. 5. ed. São Paulo: Pearson Prentice Hall, 2011.',
      href: 'https://www.informit.com/store/computer-networks-9780132126953',
    },
    model: 'Comparação funcional dos modelos OSI e TCP/IP',
    elements:
      'Sete camadas OSI, quatro camadas TCP/IP e correspondências aproximadas entre as responsabilidades.',
  },
  'assinatura-digital-validacao': {
    component: DigitalSignatureFlow,
    title: signature.title,
    alt: signature.alt,
    source: {
      author: 'NIST',
      year: 2023,
      chapter: 'seção 3',
      reference:
        'NATIONAL INSTITUTE OF STANDARDS AND TECHNOLOGY. Digital signature standard (DSS). Gaithersburg: NIST, 2023. FIPS 186-5.',
      href: 'https://csrc.nist.gov/pubs/fips/186-5/final',
    },
    model: 'Geração e verificação de assinatura digital',
    elements:
      'Mensagem, chave privada, assinatura, transmissão, chave pública validada, verificação e dois resultados.',
  },
  'estados-do-processo': {
    component: ProcessStateDiagram,
    title: process.title,
    alt: process.alt,
    source: { ...modernOperatingSystems, chapter: 'seção 2.1.5' },
    model: 'Modelo de três estados de processo',
    elements:
      'Pronto, em execução, bloqueado e transições por despacho, preempção, espera e retorno de entrada ou saída.',
  },
} satisfies FigureRegistry;

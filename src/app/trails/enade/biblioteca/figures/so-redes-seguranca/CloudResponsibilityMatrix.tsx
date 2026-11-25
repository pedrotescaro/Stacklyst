import { Diagram, Text } from '../primitives';

export const title = 'Responsabilidades por modelo de nuvem';
export const alt =
  'No IaaS, o cliente controla o sistema operacional, o armazenamento alocado e as aplicações, com possível controle limitado de rede. No PaaS, controla as aplicações implantadas e algumas configurações de ambiente. No SaaS, usa a aplicação do provedor e ajusta apenas configurações permitidas. A infraestrutura permanece sob controle do provedor nos três modelos.';

const models = [
  {
    name: 'IaaS',
    customer: ['Aplicações, SO e', 'armazenamento alocado', 'Rede com controle limitado'],
    provider: ['Servidores, rede e', 'infraestrutura física'],
  },
  {
    name: 'PaaS',
    customer: ['Aplicações implantadas', 'e ajustes do ambiente'],
    provider: ['Plataforma, SO e', 'infraestrutura'],
  },
  {
    name: 'SaaS',
    customer: ['Configurações', 'permitidas'],
    provider: ['Aplicação, plataforma', 'e infraestrutura'],
  },
];

export default function CloudResponsibilityMatrix() {
  return (
    <Diagram title={title} desc={alt} height={322}>
      <rect
        x={12}
        y={47}
        width={456}
        height={258}
        rx={10}
        fill="var(--enade-softer)"
        stroke="var(--enade-line)"
        strokeWidth={1.5}
      />
      <path
        d="M92 47V305M290 47V305M12 133H468M12 219H468"
        stroke="var(--enade-line)"
        strokeWidth={1.5}
      />
      <circle cx={109} cy={26} r={4} fill="var(--color-dd-accent)" />
      <Text x={122} y={26} align="start" weight={600}>
        Cliente controla
      </Text>
      <Text x={310} y={26} align="start" weight={600}>
        Provedor gerencia
      </Text>
      {models.map(({ name, customer, provider }, i) => (
        <g key={name} transform={`translate(0 ${i * 86})`}>
          <Text x={52} y={90} size={17} weight={600}>
            {name}
          </Text>
          {customer.map((line, j) => (
            <Text key={line} x={108} y={71 + j * 21} align="start" muted={j > 0}>
              {line}
            </Text>
          ))}
          {provider.map((line, j) => (
            <Text key={line} x={307} y={80 + j * 21} align="start">
              {line}
            </Text>
          ))}
        </g>
      ))}
    </Diagram>
  );
}

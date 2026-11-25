import { Diagram, Node, Text, Arrow } from '../primitives';

export const title = 'Camadas OSI e TCP/IP';
export const alt =
  'Correspondência aproximada. As camadas OSI aplicação, apresentação e sessão se agrupam em aplicação da pilha TCP/IP. Transporte corresponde a transporte, rede a internet, e enlace e física a acesso à rede. O OSI é um modelo de referência e a pilha TCP/IP representa os protocolos da Internet.';

const osi = ['Aplicação', 'Apresentação', 'Sessão', 'Transporte', 'Rede', 'Enlace', 'Física'];
const tcpIp = [
  { name: 'Aplicação', y: 49, h: 134 },
  { name: 'Transporte', y: 193, h: 38 },
  { name: 'Internet', y: 241, h: 38 },
  { name: 'Acesso à rede', y: 289, h: 86 },
];

export default function OsiTcpIpStack() {
  return (
    <Diagram title={title} desc={alt} height={420}>
      <Text x={101} y={24} size={16} weight={600}>
        Referência OSI
      </Text>
      <Text x={370} y={24} size={16} weight={600}>
        Pilha TCP/IP
      </Text>
      {osi.map((label, index) => (
        <Node
          key={label}
          x={16}
          y={49 + index * 48}
          w={170}
          h={38}
          label={`${7 - index} · ${label}`}
        />
      ))}
      <path
        d="M186 68H225V164H186M186 116H225M186 308H225V356H186"
        fill="none"
        stroke="var(--color-dd-muted)"
        strokeWidth={1.5}
      />
      <Arrow x1={225} y1={116} x2={284} y2={116} />
      <Arrow x1={186} y1={212} x2={284} y2={212} />
      <Arrow x1={186} y1={260} x2={284} y2={260} />
      <Arrow x1={225} y1={332} x2={284} y2={332} />
      {tcpIp.map(({ name, y, h }) => (
        <Node key={name} x={284} y={y} w={172} h={h} label={name} tone="accent" />
      ))}
      <Text x={240} y={401} muted>
        As setas agrupam camadas por funções aproximadas.
      </Text>
    </Diagram>
  );
}

import { Arrow, Diagram, Node, Text } from '../primitives';

export const title = 'Consulta recursiva com passos iterativos';
export const alt =
  'O cliente pede uma resposta final ao resolvedor local. Se ela estiver em cache, o resolvedor responde diretamente. Fora do cache, o resolvedor consulta a raiz, recebe a indicação do servidor .br, consulta .br, recebe a indicação do servidor autoritativo, consulta esse servidor e obtém o registro. Por fim, armazena a resposta no cache pelo TTL e a envia ao cliente.';

const exchanges = [
  { y: 153, x: 278, query: 'Consultar raiz', reply: 'Referência a .br' },
  { y: 242, x: 358, query: 'Consultar .br', reply: 'Referência ao domínio' },
  { y: 331, x: 434, query: 'Consultar autoritativo', reply: 'Registro solicitado' },
];

export default function DnsRecursiveLookup() {
  return (
    <Diagram title={title} desc={alt} height={492}>
      <path
        d="M45 51V473M155 51V473M278 51V209M358 51V298M434 51V387"
        fill="none"
        stroke="var(--color-dd-muted)"
        strokeWidth={1.5}
        strokeDasharray="3 5"
        opacity={0.6}
      />
      <Node x={9} y={14} w={72} h={37} label="Cliente" />
      <Node x={98} y={14} w={114} h={37} label="Resolvedor" tone="accent" />
      <Node x={246} y={14} w={64} h={37} label="Raiz" />
      <Node x={330} y={14} w={56} h={37} label=".br" />
      <Node x={393} y={14} w={82} h={37} label="Autoritativo" />
      <Arrow x1={45} y1={96} x2={155} y2={96} />
      <Text x={100} y={79} size={13}>
        Pedido recursivo
      </Text>
      <Arrow x1={155} y1={116} x2={227} y2={116} tone="neutral" />
      <Node
        x={227}
        y={96}
        w={242}
        h={40}
        label={['Com resposta em cache', 'retorna diretamente']}
      />
      {exchanges.map(({ y, x, query, reply }) => (
        <g key={query}>
          <Text x={164} y={y} align="start">
            {query}
          </Text>
          <Arrow x1={155} y1={y + 15} x2={x} y2={y + 15} />
          <Text x={164} y={y + 41} align="start" muted>
            {reply}
          </Text>
          <Arrow x1={x} y1={y + 56} x2={155} y2={y + 56} dashed tone="neutral" />
        </g>
      ))}
      <Node x={101} y={405} w={108} h={31} label="Cache + TTL" />
      <Arrow x1={155} y1={466} x2={45} y2={466} />
      <Text x={100} y={450} size={13}>
        Resposta final
      </Text>
    </Diagram>
  );
}

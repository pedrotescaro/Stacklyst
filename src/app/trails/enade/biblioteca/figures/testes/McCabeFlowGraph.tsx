import { Arrow, Diagram, Node, Text } from '../primitives';

export const details = {
  title: 'Grafo de fluxo e complexidade ciclomática',
  alt: 'O nó 1 inicia e segue ao 2. Se i é menor que n, 2 segue a 3, senão termina em 6. Se calc de i é menor ou igual a n, 3 segue a 4, senão segue a 5. Tanto 4 como 5 retornam a 2. Os dois ciclos encerram regiões R1 e R2 e o exterior é R3. Sete arestas menos seis nós mais dois resultam em complexidade ciclomática três.',
};

const vertices = [
  { id: 1, x: 220, y: 34 },
  { id: 2, x: 220, y: 104 },
  { id: 3, x: 220, y: 194 },
  { id: 4, x: 111, y: 303 },
  { id: 5, x: 329, y: 303 },
  { id: 6, x: 416, y: 104 },
];

export function McCabeFlowGraph() {
  return (
    <Diagram title={details.title} desc={details.alt} height={452}>
      <path d="M220 104 V194 L111 303 H60 V113Z" fill="var(--enade-soft)" />
      <path d="M220 104 V194 L329 303 H380 V121 H226Z" fill="var(--enade-softer)" />
      <Arrow x1={220} y1={52} x2={220} y2={86} />
      <Arrow x1={220} y1={122} x2={220} y2={176} />
      <Arrow x1={238} y1={104} x2={398} y2={104} />
      <Arrow x1={208} y1={207} x2={123} y2={290} />
      <Arrow x1={232} y1={207} x2={317} y2={290} />
      <Arrow d="M93 303 H60 V113 H204" tone="neutral" />
      <Arrow d="M347 303 H380 V121 H226" tone="neutral" />
      {vertices.map(({ id, x, y }) => (
        <g key={id}>
          <circle cx={x} cy={y} r={18} fill="var(--enade-softer)" stroke="var(--color-dd-accent)" />
          <Text x={x} y={y} weight={600}>
            {id}
          </Text>
        </g>
      ))}
      <Text x={231} y={149} align="start" muted>
        Sim
      </Text>
      <Text x={321} y={89} muted>
        Não
      </Text>
      <Text x={169} y={260} align="start" muted>
        Sim
      </Text>
      <Text x={266} y={260} align="end" muted>
        Não
      </Text>
      <Text x={112} y={195} weight={600}>
        R1
      </Text>
      <Text x={327} y={195} weight={600}>
        R2
      </Text>
      <Text x={416} y={52} weight={600}>
        R3 · exterior
      </Text>
      <Text x={40} y={353} align="start" muted>
        2: i &lt; n
      </Text>
      <Text x={160} y={353} align="start" muted>
        3: calc(i) ≤ n
      </Text>
      <Node
        x={77}
        y={380}
        w={326}
        h={57}
        label="V(G) = 7 − 6 + 2 = 3"
        sub="7 arestas · 6 nós · 3 regiões"
        tone="accent"
      />
    </Diagram>
  );
}

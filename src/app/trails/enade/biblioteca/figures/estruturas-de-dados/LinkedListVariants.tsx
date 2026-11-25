import { Arrow, Diagram, Node, Text } from '../primitives';

export const title = 'Ponteiros em três listas';
export const alt =
  'Três listas guardam 12, 7 e 30 na mesma ordem. A simples tem ponteiros próximo e termina em nulo. A dupla tem ligações próximo e anterior, com nulos nos extremos. Na circular simples, o próximo de 30 aponta para 12, fechando a cadeia.';

const labels = ['12', '7', '30'];
const positions = [96, 206, 316];

export default function LinkedListVariants() {
  return (
    <Diagram title={title} desc={alt} height={353}>
      <path d="M17 103H463M17 222H463" stroke="var(--enade-line)" strokeWidth={1.5} />
      <Text x={17} y={20} align="start" weight={600}>
        Simples · próximo
      </Text>
      <Text x={17} y={124} align="start" weight={600}>
        Dupla · próximo e anterior
      </Text>
      <Text x={17} y={243} align="start" weight={600}>
        Circular · a cauda volta à cabeça
      </Text>
      {[42, 149, 267].map((y) =>
        labels.map((label, i) => (
          <Node
            key={`${y}-${label}`}
            x={positions[i]}
            y={y}
            w={54}
            h={43}
            label={label}
            tone={i === 0 ? 'accent' : 'neutral'}
          />
        ))
      )}
      {[63, 162, 288].map((y) => (
        <g key={y}>
          <Arrow x1={150} y1={y} x2={206} y2={y} />
          <Arrow x1={260} y1={y} x2={316} y2={y} />
        </g>
      ))}
      <Arrow x1={206} y1={179} x2={150} y2={179} tone="neutral" />
      <Arrow x1={316} y1={179} x2={260} y2={179} tone="neutral" />
      <Arrow x1={96} y1={179} x2={56} y2={179} tone="neutral" />
      <Arrow x1={370} y1={162} x2={414} y2={162} />
      <Arrow x1={370} y1={63} x2={414} y2={63} />
      <Text x={423} y={63} align="start" muted>
        Nulo
      </Text>
      <Text x={46} y={179} align="end" muted>
        Nulo
      </Text>
      <Text x={423} y={162} align="start" muted>
        Nulo
      </Text>
      <Arrow d="M370 288H396V334H123V310" />
    </Diagram>
  );
}

import { Arrow, Diagram, Text } from '../primitives';
import { Vertex } from './dataPrimitives';

export const title = 'Ordem das chaves na ABB';
export const alt =
  'A raiz 50 separa as chaves menores 30, 20 e 40, à esquerda, das maiores 70, 60 e 80, à direita. Cada subárvore respeita a regra local: 20 é menor e 40 é maior que 30. Da mesma forma, 60 é menor e 80 é maior que 70.';

const vertices = [
  [240, 41, '50'],
  [119, 125, '30'],
  [361, 125, '70'],
  [63, 213, '20'],
  [175, 213, '40'],
  [305, 213, '60'],
  [417, 213, '80'],
] as const;
const links = [
  'M224 53L136 113',
  'M256 53L344 113',
  'M108 141L74 196',
  'M130 141L164 196',
  'M350 141L316 196',
  'M372 141L406 196',
];

export default function BinarySearchTreeOrder() {
  return (
    <Diagram title={title} desc={alt} height={280}>
      <rect
        x={16}
        y={96}
        width={205}
        height={157}
        rx={10}
        fill="var(--enade-softer)"
        stroke="var(--enade-line)"
        strokeWidth={1.5}
      />
      <rect
        x={259}
        y={96}
        width={205}
        height={157}
        rx={10}
        fill="var(--enade-softer)"
        stroke="var(--enade-line)"
        strokeWidth={1.5}
      />
      {links.map((d) => (
        <Arrow key={d} d={d} kind="none" tone="neutral" />
      ))}
      {vertices.map(([x, y, label]) => (
        <Vertex key={label} x={x} y={y} label={label} accent={label === '50'} />
      ))}
      <Text x={119} y={72} muted>
        Chaves menores
      </Text>
      <Text x={361} y={72} muted>
        Chaves maiores
      </Text>
      <Text x={119} y={267} muted>
        Esquerda da raiz
      </Text>
      <Text x={361} y={267} muted>
        Direita da raiz
      </Text>
    </Diagram>
  );
}

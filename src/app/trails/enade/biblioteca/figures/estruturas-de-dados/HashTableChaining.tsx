import { Arrow, Diagram, Node, Text } from '../primitives';

export const title = 'Tabela hash com listas por índice';
export const alt =
  'Com h de k igual a k módulo 7, os índices 1, 3 e 4 apontam às listas 22 e 15, 10 e 31, e 4, respectivamente. Cada lista termina em nulo e os outros índices já apontam diretamente para nulo.';

const buckets: number[][] = [[], [22, 15], [], [10, 31], [4], [], []];

export default function HashTableChaining() {
  return (
    <Diagram title={title} desc={alt} height={373}>
      <Text x={18} y={22} align="start" weight={600}>
        h(k) = k mod 7
      </Text>
      <Text x={26} y={55} align="start" muted>
        Índice
      </Text>
      <Text x={122} y={55} align="start" muted>
        Valores encadeados
      </Text>
      <rect
        x={18}
        y={72}
        width={68}
        height={280}
        rx={10}
        fill="var(--enade-softer)"
        stroke="var(--enade-line)"
        strokeWidth={1.5}
      />
      {buckets.map((values, bucket) => {
        const y = 92 + bucket * 40;
        return (
          <g key={bucket}>
            {bucket > 0 && (
              <line
                x1={18}
                y1={y - 20}
                x2={86}
                y2={y - 20}
                stroke="var(--enade-line)"
                strokeWidth={1.5}
              />
            )}
            <Text x={52} y={y} weight={600}>
              {bucket}
            </Text>
            {values.map((key, i) => (
              <g key={key}>
                <Arrow
                  x1={i === 0 ? 86 : 120 + (i - 1) * 104 + 67}
                  y1={y}
                  x2={120 + i * 104}
                  y2={y}
                />
                <Node x={120 + i * 104} y={y - 15} w={67} h={30} label={String(key)} />
              </g>
            ))}
            <Arrow
              x1={values.length ? 83 + values.length * 104 : 86}
              y1={y}
              x2={120 + values.length * 104}
              y2={y}
              tone="neutral"
            />
            <Text x={130 + values.length * 104} y={y} align="start" muted>
              Nulo
            </Text>
          </g>
        );
      })}
    </Diagram>
  );
}

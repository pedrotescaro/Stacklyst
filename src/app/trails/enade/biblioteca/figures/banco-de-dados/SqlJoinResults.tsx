import { Diagram, Phase, Text } from '../primitives';

const results = [
  { name: 'INNER JOIN', x: 13, y: 151, rows: [['2', '2']] },
  {
    name: 'LEFT JOIN',
    x: 247,
    y: 151,
    rows: [
      ['1', 'NULL'],
      ['2', '2'],
    ],
  },
  {
    name: 'RIGHT JOIN',
    x: 13,
    y: 303,
    rows: [
      ['2', '2'],
      ['NULL', '3'],
    ],
  },
  {
    name: 'FULL JOIN',
    x: 247,
    y: 303,
    rows: [
      ['1', 'NULL'],
      ['2', '2'],
      ['NULL', '3'],
    ],
  },
];

export const description =
  'A contém chaves 1 e 2, B contém 2 e 3, e a condição é A.id igual a B.id. INNER traz (2, 2). LEFT preserva (1, NULL) além da correspondência. RIGHT preserva (NULL, 3). FULL preserva as duas linhas sem par, preenchendo a outra coluna com NULL.';

export function SqlJoinResults() {
  return (
    <Diagram title="Junções sobre duas relações" desc={description} height={468}>
      <Phase x={13} y={12} w={220} h={55} label="A.id" sub="1 · 2" />
      <Phase x={247} y={12} w={220} h={55} label="B.id" sub="2 · 3" />
      <path d="M123 67 V86 H357 V67" fill="none" stroke="var(--enade-line)" />
      <Text x={240} y={109} weight={600}>
        Condição de junção: A.id = B.id
      </Text>
      <path d="M13 130 H467 M240 146 V447" stroke="var(--enade-line)" />
      {results.map(({ name, x, y, rows }) => (
        <g key={name}>
          <Text x={x + 10} y={y + 12} align="start" weight={600}>
            {name}
          </Text>
          <rect
            x={x}
            y={y + 30}
            width={220}
            height={25 + rows.length * 26}
            rx={8}
            fill="var(--enade-softer)"
            stroke="var(--enade-line)"
          />
          <path
            d={`M${x} ${y + 55}h220 M${x + 110} ${y + 30}v${25 + rows.length * 26}`}
            stroke="var(--enade-line)"
          />
          <Text x={x + 55} y={y + 42} size={13} weight={600}>
            A.id
          </Text>
          <Text x={x + 165} y={y + 42} size={13} weight={600}>
            B.id
          </Text>
          {rows.map(([left, right], index) => (
            <g key={`${left}-${right}`}>
              {index > 0 && (
                <path d={`M${x} ${y + 55 + index * 26}h220`} stroke="var(--enade-line)" />
              )}
              <Text x={x + 55} y={y + 68 + index * 26} size={13} muted={left === 'NULL'}>
                {left}
              </Text>
              <Text x={x + 165} y={y + 68 + index * 26} size={13} muted={right === 'NULL'}>
                {right}
              </Text>
            </g>
          ))}
        </g>
      ))}
    </Diagram>
  );
}

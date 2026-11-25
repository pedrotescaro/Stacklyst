import { Arrow, Diagram, Text } from '../primitives';

export const title = 'Fórmulas para reconhecer sequências';
export const alt =
  'Uma progressão aritmética soma sempre a mesma diferença d, por exemplo 2, 5 e 8 com d igual a 3. Uma geométrica multiplica sempre pela mesma razão q, como 3, 6 e 12 com q igual a 2. Fibonacci parte de 0 e 1 e cada termo seguinte soma os dois anteriores.';

const progressions = [
  {
    y: 18,
    name: 'Progressão aritmética',
    formula: 'aₙ₊₁ − aₙ = d',
    values: ['2', '5', '8'],
    step: '+3',
  },
  {
    y: 115,
    name: 'Progressão geométrica',
    formula: 'aₙ₊₁ = q · aₙ',
    values: ['3', '6', '12'],
    step: '×2',
  },
];

export default function SequenceGrowthRules() {
  return (
    <Diagram title={title} desc={alt} height={337}>
      <path d="M16 107H464M16 204H464" stroke="var(--enade-line)" strokeWidth={1.5} />
      {progressions.map(({ y, name, formula, values, step }) => (
        <g key={name}>
          <Text x={16} y={y} size={16} align="start" weight={600}>
            {name}
          </Text>
          <Text x={464} y={y} size={16} align="end">
            {formula}
          </Text>
          {values.map((value, i) => (
            <Text key={value} x={68 + i * 172} y={y + 60} size={17} weight={600}>
              {value}
            </Text>
          ))}
          {[94, 266].map((x) => (
            <g key={x}>
              <Text x={x + 59} y={y + 41} muted>
                {step}
              </Text>
              <Arrow x1={x} y1={y + 60} x2={x + 119} y2={y + 60} />
            </g>
          ))}
        </g>
      ))}
      <Text x={16} y={222} size={16} align="start" weight={600}>
        Fibonacci
      </Text>
      <Text x={464} y={222} size={16} align="end">
        Fₙ₊₂ = Fₙ₊₁ + Fₙ
      </Text>
      <Text x={16} y={252} align="start" muted>
        F₀ = 0, F₁ = 1
      </Text>
      <Arrow d="M68 292V266H240V283" kind="none" tone="neutral" />
      <Arrow d="M154 292V266H240V283" />
      <Arrow d="M154 306V322H326V311" kind="none" tone="neutral" />
      <Arrow d="M240 306V322H326V311" />
      {['0', '1', '1', '2', '3'].map((value, i) => (
        <Text key={i} x={68 + i * 86} y={300} size={17} weight={600}>
          {value}
        </Text>
      ))}
    </Diagram>
  );
}

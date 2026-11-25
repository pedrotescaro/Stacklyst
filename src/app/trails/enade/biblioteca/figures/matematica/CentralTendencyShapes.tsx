import { Arrow, Diagram, Text } from '../primitives';

export const centralTendencyShapes = {
  title: 'Média, mediana e moda em três perfis de distribuição',
  alt: 'Três perfis unimodais idealizados. Com cauda à esquerda, média, mediana e moda aparecem nessa ordem da esquerda para a direita. Na distribuição simétrica os três centros coincidem. Com cauda à direita, a ordem se inverte.',
};

const profiles = [
  {
    label: 'Cauda à esquerda',
    curve: 'M30 79C122 79 201 78 257 45C316 10 365 23 396 79',
    points: [205, 253, 315],
    measures: ['Média', 'Mediana', 'Moda'],
  },
  {
    label: 'Simétrica',
    curve: 'M30 79C133 79 182 75 211 37C225 17 255 17 269 37C298 75 347 79 450 79',
    points: [240],
    measures: ['Média = mediana = moda'],
  },
  {
    label: 'Cauda à direita',
    curve: 'M84 79C115 23 164 10 223 45C279 78 358 79 450 79',
    points: [165, 227, 275],
    measures: ['Moda', 'Mediana', 'Média'],
  },
];

export function CentralTendencyShapes() {
  return (
    <Diagram title={centralTendencyShapes.title} desc={centralTendencyShapes.alt} height={401}>
      {profiles.map(({ label, curve, points, measures }, index) => (
        <g key={label} transform={`translate(0 ${17 + index * 122})`}>
          <Text x={24} y={12} align="start" weight={600}>
            {label}
          </Text>
          <path d={curve} fill="none" stroke="var(--color-dd-accent)" />
          <Arrow x1={24} y1={80} x2={456} y2={80} tone="neutral" />
          {points.map((x, i) => (
            <g key={x}>
              <path d={`M${x} 75v10`} stroke="var(--color-dd-text)" />
              <Text x={x} y={98} size={13}>
                {measures[i]}
              </Text>
            </g>
          ))}
        </g>
      ))}
      <Text x={24} y={388} align="start" muted size={13}>
        Curvas esquemáticas. A ordem pode variar em dados reais.
      </Text>
    </Diagram>
  );
}

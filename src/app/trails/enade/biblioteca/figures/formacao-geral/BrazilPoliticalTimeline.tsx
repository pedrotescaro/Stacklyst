import { Arrow, Diagram, Text } from '../primitives';

export const brazilPoliticalTimeline = {
  title: 'Marcos selecionados da história política brasileira',
  alt: 'Da colonização no século XVI, a linha do tempo passa pela Independência em 1822, a abolição legal em 1888 e a República em 1889. Seguem o início da Era Vargas em 1930, o golpe militar em 1964 e a Constituição de 1988. Os intervalos são esquemáticos.',
};

const milestones = [
  ['Século XVI', 'Colonização portuguesa'],
  ['1822', 'Independência política'],
  ['1888', 'Abolição legal da escravidão'],
  ['1889', 'Proclamação da República'],
  ['1930', 'Início da Era Vargas'],
  ['1964', 'Golpe e início da ditadura militar'],
  ['1988', 'Promulgação da Constituição'],
];

export function BrazilPoliticalTimeline() {
  return (
    <Diagram title={brazilPoliticalTimeline.title} desc={brazilPoliticalTimeline.alt} height={404}>
      <Arrow x1={127} y1={28} x2={127} y2={372} />
      {milestones.map(([date, label], index) => {
        const y = 40 + index * 51;
        return (
          <g key={date}>
            <circle
              cx={127}
              cy={y}
              r={5}
              fill="var(--enade-softer)"
              stroke="var(--color-dd-accent)"
            />
            <Text x={106} y={y} align="end" weight={600}>
              {date}
            </Text>
            <Text x={151} y={y} align="start">
              {label}
            </Text>
          </g>
        );
      })}
      <Text x={151} y={381} align="start" size={13} muted>
        Intervalos esquemáticos, sem escala
      </Text>
    </Diagram>
  );
}

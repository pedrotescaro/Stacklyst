import { Arrow, Diagram, Text } from '../primitives';

export const details = {
  title: 'Níveis de maturidade do CMMI-DEV e do MR-MPS-SW',
  alt: 'Escalas independentes em ordem crescente. No CMMI-DEV, 1 Inicial, 2 Gerenciado, 3 Definido, 4 Gerenciado quantitativamente e 5 Em otimização. No MR-MPS-SW, G Parcialmente gerenciado, F Gerenciado, E Parcialmente definido, D Largamente definido, C Definido, B Gerenciado quantitativamente e A Em otimização.',
};

const cmmi = ['Inicial', 'Gerenciado', 'Definido', 'Gerenciado quantitativamente', 'Em otimização'];
const mps = [
  'Parcialmente gerenciado',
  'Gerenciado',
  'Parcialmente definido',
  'Largamente definido',
  'Definido',
  'Gerenciado quantitativamente',
  'Em otimização',
];

export function ProcessMaturityScales() {
  return (
    <Diagram title={details.title} desc={details.alt} height={557}>
      <Text x={24} y={23} align="start" weight={600}>
        CMMI-DEV v1.3
      </Text>
      <Text x={456} y={23} align="end" muted>
        1 a 5
      </Text>
      <Arrow d="M39 43 V215" tone="neutral" />
      {cmmi.map((label, index) => {
        const y = 56 + index * 35;
        return (
          <g key={label}>
            <circle
              cx={39}
              cy={y}
              r={12}
              fill="var(--enade-softer)"
              stroke="var(--color-dd-accent)"
            />
            <Text x={39} y={y} size={13} weight={600}>
              {index + 1}
            </Text>
            <Text x={65} y={y} align="start">
              {label}
            </Text>
          </g>
        );
      })}
      <path d="M24 233 H456" fill="none" stroke="var(--enade-line)" />
      <Text x={24} y={262} align="start" weight={600}>
        MR-MPS-SW
      </Text>
      <Text x={456} y={262} align="end" muted>
        G a A
      </Text>
      <Arrow d="M39 284 V527" tone="neutral" />
      {mps.map((label, index) => {
        const y = 298 + index * 35;
        return (
          <g key={label}>
            <circle
              cx={39}
              cy={y}
              r={12}
              fill="var(--enade-softer)"
              stroke="var(--color-dd-accent)"
            />
            <Text x={39} y={y} size={13} weight={600}>
              {'GFEDCBA'[index]}
            </Text>
            <Text x={65} y={y} align="start">
              {label}
            </Text>
          </g>
        );
      })}
      <Text x={456} y={546} align="end" muted>
        Escalas independentes
      </Text>
    </Diagram>
  );
}

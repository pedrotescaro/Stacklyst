import { Arrow, Diagram, Node, Text } from '../primitives';

export const policyCycle = {
  title: 'Sete fases de uma política pública',
  alt: 'A sequência analítica começa com a identificação do problema, seguida por formação da agenda, formulação de alternativas, decisão, implementação, avaliação e eventual extinção. A avaliação também pode orientar a revisão das alternativas.',
};

const phases = [
  'Identificação do problema',
  'Formação da agenda',
  'Formulação de alternativas',
  'Tomada de decisão',
  'Implementação',
  'Avaliação',
  'Extinção',
];

export function PolicyCycle() {
  return (
    <Diagram title={policyCycle.title} desc={policyCycle.alt} height={448}>
      {phases.map((label, index) => {
        const y = 18 + index * 57;
        return (
          <g key={label}>
            {index > 0 && <Arrow x1={174} x2={174} y1={y - 15} y2={y} />}
            <Text x={37} y={y + 21} size={13} muted>
              {index + 1}
            </Text>
            <Node
              x={56}
              y={y}
              w={236}
              h={42}
              label={label}
              tone={index === 5 ? 'accent' : 'neutral'}
            />
          </g>
        );
      })}
      <Arrow d="M292 324H440V153H292" tone="neutral" dashed />
      <Text x={365} y={239} size={13} muted>
        Reformular
      </Text>
      <Text x={23} y={429} align="start" size={13} muted>
        Na prática, as fases podem se sobrepor.
      </Text>
    </Diagram>
  );
}

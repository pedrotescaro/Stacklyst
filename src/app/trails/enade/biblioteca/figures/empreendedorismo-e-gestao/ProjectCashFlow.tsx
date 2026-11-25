import { Arrow, Diagram, Text } from '../primitives';

export const projectCashFlow = {
  title: 'Fluxo de caixa por ano do projeto',
  alt: 'Linha do tempo em milhares de reais. No ano zero há uma saída inicial de 100 mil reais. Nos anos um, dois e três, há entradas de 45 mil reais por ano. As entradas estão acima do eixo e o investimento está abaixo.',
};

export function ProjectCashFlow() {
  return (
    <Diagram title={projectCashFlow.title} desc={projectCashFlow.alt} height={242}>
      <Text x={22} y={23} align="start" weight={600}>
        Fluxo em milhares de reais
      </Text>
      <Arrow x1={22} y1={115} x2={454} y2={115} tone="neutral" />
      <Arrow x1={70} y1={118} x2={70} y2={201} tone="danger" />
      <Text x={79} y={140} align="start" size={13}>
        Ano 0
      </Text>
      <Text x={70} y={221} weight={600}>
        −100
      </Text>
      {[177, 284, 391].map((x, index) => (
        <g key={x}>
          <Arrow x1={x} y1={112} x2={x} y2={74} />
          <Text x={x} y={58} weight={600}>
            +45
          </Text>
          <Text x={x} y={140} size={13}>
            Ano {index + 1}
          </Text>
        </g>
      ))}
      <Text x={241} y={221} align="start" muted size={13}>
        Valores nominais do exemplo
      </Text>
    </Diagram>
  );
}

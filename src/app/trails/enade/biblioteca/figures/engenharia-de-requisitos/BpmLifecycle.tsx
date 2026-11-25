import { Arrow, Diagram, Node, Text } from '../primitives';

export const details = {
  title: 'Ciclo de gestão de processos de negócio',
  alt: 'Identificação seleciona os processos de interesse. Descoberta modela o processo atual, análise diagnostica problemas, redesenho propõe o processo futuro e implantação põe as mudanças em operação. Dados do monitoramento realimentam a descoberta e a análise.',
};

const stages = [
  ['Identificação', 'Selecionar processos'],
  ['Descoberta', 'Descrever o processo atual'],
  ['Análise', 'Investigar problemas'],
  ['Redesenho', 'Definir o processo desejado'],
  ['Implantação', 'Introduzir as mudanças'],
  ['Monitoramento', 'Acompanhar resultados e desvios'],
];

export function BpmLifecycle() {
  return (
    <Diagram title={details.title} desc={details.alt} height={480}>
      {stages.map(([label, sub], index) => {
        const y = 12 + index * 76;
        return (
          <g key={label}>
            {index > 0 && <Arrow x1={176} y1={y - 22} x2={176} y2={y} />}
            <Node
              x={30}
              y={y}
              w={292}
              h={54}
              label={label}
              sub={sub}
              tone={index === 1 || index === 5 ? 'accent' : 'neutral'}
            />
          </g>
        );
      })}
      <Arrow d="M322 419 H433 V115 H322" dashed tone="neutral" />
      <Text x={419} y={178} align="end" muted>
        Reavaliar
      </Text>
      <Text x={419} y={196} align="end" muted>
        o processo
      </Text>
      <Text x={176} y={466} muted>
        O desempenho observado orienta novos ciclos.
      </Text>
    </Diagram>
  );
}

import { Arrow, Diagram, Phase, Text } from '../primitives';

export const details = {
  title: 'Iterações e marcos ao longo do tempo no RUP',
  alt: 'Exemplo com uma iteração na Concepção, duas na Elaboração, três na Construção e duas na Transição. Ao final das respectivas fases, os marcos LCO, LCA, IOC e PR verificam objetivos, arquitetura, capacidade operacional inicial e liberação do produto. A quantidade de iterações é ilustrativa.',
};

const timeline = [
  { phase: 'Concepção', milestone: 'LCO', end: 152, iterations: ['I1'] },
  { phase: 'Elaboração', milestone: 'LCA', end: 250, iterations: ['E1', 'E2'] },
  { phase: 'Construção', milestone: 'IOC', end: 377, iterations: ['C1', 'C2', 'C3'] },
  { phase: 'Transição', milestone: 'PR', end: 467, iterations: ['T1', 'T2'] },
];

export function RupMilestoneTimeline() {
  return (
    <Diagram title={details.title} desc={details.alt} height={230}>
      <Text x={27} y={21} align="start" weight={600}>
        Tempo
      </Text>
      <Arrow x1={84} y1={21} x2={466} y2={21} />
      {timeline.map(({ phase, milestone, end, iterations }, index) => {
        const start = timeline[index - 1]?.end ?? 27;
        const phaseWidth = end - start;
        return (
          <g key={phase}>
            <Phase x={start + 3} y={46} w={phaseWidth - 6} h={43} label={phase} />
            <path d={`M${end} 91 V152`} stroke="var(--enade-line)" strokeDasharray="4 4" />
            {iterations.map((label, i) => {
              const x = start + ((i + 0.5) * phaseWidth) / iterations.length;
              return (
                <g key={label}>
                  <circle
                    cx={x}
                    cy={121}
                    r={16}
                    fill="var(--enade-soft)"
                    stroke="var(--enade-line)"
                  />
                  <Text x={x} y={121} size={13}>
                    {label}
                  </Text>
                </g>
              );
            })}
            <path d={`M${end - 7} 153l5 5-5 5-5-5Z`} fill="var(--color-dd-accent)" />
            <Text x={end - 7} y={177} align="end" size={13} weight={600}>
              {milestone}
            </Text>
          </g>
        );
      })}
      <path d="M27 158 H467" stroke="var(--enade-line)" />
      <Text x={240} y={211} muted>
        As fases podem ter números diferentes de iterações.
      </Text>
    </Diagram>
  );
}

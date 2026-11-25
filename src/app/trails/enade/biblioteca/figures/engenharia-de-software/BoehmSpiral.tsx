import { Arrow, Diagram, Node, Text } from '../primitives';

export const details = {
  title: 'Espiral de desenvolvimento orientado a risco',
  alt: 'Três voltas crescentes ligam quatro quadrantes, começando pela definição de objetivos, alternativas e restrições. Cada volta passa pela avaliação e redução de riscos, desenvolvimento e verificação do próximo resultado, e planejamento com revisão e compromisso. O raio representa custo acumulado.',
};

const stepsPerTurn = 48;
const turns = 3;
const spiral = Array.from({ length: stepsPerTurn * turns + 1 }, (_, step) => {
  const angle = (step * Math.PI * 2) / stepsPerTurn - (3 * Math.PI) / 4;
  const radius = 6 + (step * 150) / (stepsPerTurn * turns);
  return {
    x: 240 + radius * Math.cos(angle),
    y: 245 + radius * Math.sin(angle),
  };
});
const path = spiral
  .map(({ x, y }, step) => `${step ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`)
  .join(' ');
const riskReviews = [12, 60, 108].map((step) => spiral[step]);

export function BoehmSpiral() {
  return (
    <Diagram title={details.title} desc={details.alt} height={520}>
      <Node x={7} y={12} w={205} h={62} label="Definir objetivos" sub="Alternativas e restrições" />
      <Node
        x={268}
        y={12}
        w={205}
        h={70}
        label="Analisar riscos"
        sub={['Avaliar alternativas', 'Reduzir riscos (ex.: protótipo)']}
        tone="warning"
      />
      <Node
        x={7}
        y={418}
        w={205}
        h={63}
        label="Planejar próxima volta"
        sub="Revisar e firmar compromisso"
      />
      <Node
        x={268}
        y={418}
        w={205}
        h={63}
        label="Desenvolver e verificar"
        sub="Entregar o próximo resultado"
      />
      <path
        d="M240 92 V401 M62 245 H420"
        fill="none"
        stroke="var(--enade-line)"
        strokeWidth={1.5}
      />
      <Arrow d={path} />
      <circle cx={spiral[0].x} cy={spiral[0].y} r={3.8} fill="var(--color-dd-accent)" />
      {riskReviews.map(({ x, y }) => (
        <circle
          key={x}
          cx={x}
          cy={y}
          r={5}
          fill="var(--enade-warning)"
          stroke="var(--color-dd-text)"
        />
      ))}
      <Text x={407} y={120} size={13} muted>
        Risco em cada volta
      </Text>
      <Arrow d="M407 130 V151 H344 L330 160" tone="neutral" kind="open" />
      <Text x={240} y={505} muted>
        Raio maior: mais custo acumulado
      </Text>
    </Diagram>
  );
}

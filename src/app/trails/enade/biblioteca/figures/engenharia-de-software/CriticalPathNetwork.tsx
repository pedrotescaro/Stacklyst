import { Arrow, Diagram, Node, Text } from '../primitives';

export const details = {
  title: 'Rede de precedências e caminho crítico',
  alt: 'O caminho crítico de 20 dias passa por T1, T2, T3, T5 e T7, com durações de 5, 8, 2, 2 e 3 dias. T4 também precede T5 e T6 segue diretamente ao fim. T5 espera por T3 e T4.',
};

const critical = [
  ['T1', '5 dias'],
  ['T2', '8 dias'],
  ['T3', '2 dias'],
  ['T5', '2 dias'],
  ['T7', '3 dias'],
];

export function CriticalPathNetwork() {
  return (
    <Diagram title={details.title} desc={details.alt} height={491}>
      <Text x={212} y={18} weight={600}>
        Caminho crítico
      </Text>
      <Node x={152} y={36} w={120} h={36} label="Início" />
      <Arrow x1={212} y1={72} x2={212} y2={92} />
      {critical.map(([label, sub], index) => {
        const y = 92 + index * 66;
        return (
          <g key={label}>
            {index > 0 && <Arrow x1={212} y1={y - 22} x2={212} y2={y} />}
            <Node x={152} y={y} w={120} h={44} label={label} sub={sub} tone="accent" />
          </g>
        );
      })}
      <Arrow d="M152 54 H81 V224" tone="neutral" />
      <Node x={26} y={224} w={110} h={44} label="T4" sub="4 dias" />
      <Arrow d="M81 268 V312 H152" tone="neutral" />
      <Arrow d="M272 54 H396 V224" tone="neutral" />
      <Node x={341} y={224} w={110} h={44} label="T6" sub="4 dias" />
      <Arrow d="M396 268 V448 H284" tone="neutral" />
      <Arrow x1={212} y1={400} x2={212} y2={422} />
      <Node x={140} y={422} w={144} h={50} label="Fim" sub="20 dias" tone="accent" />
    </Diagram>
  );
}

import { Arrow, Diagram, Node, Phase, Text } from '../primitives';

export const digitalAccessStages = {
  title: 'Quatro etapas do acesso digital',
  alt: 'O acesso digital passa pela motivação, pelo acesso material a equipamento e conexão, pelas habilidades e pelo uso efetivo. Recursos e posição social influenciam as oportunidades de avançar entre essas etapas.',
};

const stages = [
  ['Motivação', 'Perceber por que vale a pena usar'],
  ['Acesso material', 'Ter equipamento e conexão'],
  ['Habilidades', 'Saber operar e buscar informação'],
  ['Uso efetivo', 'Aplicar o acesso às próprias necessidades'],
];

export function DigitalAccessStages() {
  return (
    <Diagram title={digitalAccessStages.title} desc={digitalAccessStages.alt} height={345}>
      {stages.map(([label, sub], index) => {
        const y = 18 + index * 84;
        return (
          <g key={label}>
            {index > 0 && <Arrow x1={165} y1={y - 24} x2={165} y2={y} />}
            <Text x={38} y={y + 30} size={13} muted>
              {index + 1}
            </Text>
            <Phase x={56} y={y} w={269} h={60} label={label} sub={sub} />
          </g>
        );
      })}
      <Node
        x={345}
        y={18}
        w={117}
        h={91}
        label={['Condições', 'sociais']}
        sub={['Recursos e', 'oportunidades']}
      />
      <Arrow
        d="M403 109V326 M403 132H325 M403 216H325 M403 300H325"
        kind="none"
        tone="neutral"
        dashed
      />
    </Diagram>
  );
}

import { Arrow, Diagram, Node, Text } from '../primitives';

export const sustainabilityDimensions = {
  title: 'Dimensões ambiental, social e econômica da sustentabilidade',
  alt: 'O triple bottom line propõe considerar conjuntamente proteção ambiental, equidade social e viabilidade econômica. A figura relaciona cada dimensão à avaliação do desempenho sustentável.',
};

const dimensions = [
  ['Ambiental', ['Recursos, emissão', 'e impactos']],
  ['Social', ['Pessoas, direitos', 'e equidade']],
  ['Econômica', ['Viabilidade e', 'criação de valor']],
] as const;

export function SustainabilityDimensions() {
  return (
    <Diagram
      title={sustainabilityDimensions.title}
      desc={sustainabilityDimensions.alt}
      height={220}
    >
      <Text x={240} y={22} size={13} muted>
        Triple bottom line
      </Text>
      {dimensions.map(([label, description], index) => (
        <Node
          key={label}
          x={18 + index * 150}
          y={44}
          w={144}
          h={83}
          label={label}
          sub={[...description]}
        />
      ))}
      <Arrow d="M90 127V146H390V127 M240 127V146" kind="none" />
      <Arrow x1={240} y1={146} x2={240} y2={163} />
      <Node x={117} y={163} w={246} h={40} label="Avaliação da sustentabilidade" tone="accent" />
    </Diagram>
  );
}

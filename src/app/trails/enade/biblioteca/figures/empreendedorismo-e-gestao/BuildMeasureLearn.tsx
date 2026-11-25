import { Arrow, Diagram, Node, Phase, Text } from '../primitives';

export const buildMeasureLearn = {
  title: 'Ciclo construir, medir e aprender',
  alt: 'A hipótese orienta a construção de um produto mínimo viável. O uso do produto é medido para produzir dados. O aprendizado validado orienta a decisão entre ajustar a hipótese ou perseverar, dando início a outro ciclo.',
};

export function BuildMeasureLearn() {
  return (
    <Diagram title={buildMeasureLearn.title} desc={buildMeasureLearn.alt} height={394}>
      <Node x={24} y={20} w={278} h={42} label="Hipótese a testar" />
      <Arrow x1={163} y1={62} x2={163} y2={86} />
      <Phase x={24} y={86} w={278} h={64} label="Construir" sub="Criar o produto mínimo viável" />
      <Arrow x1={163} y1={150} x2={163} y2={174} />
      <Phase x={24} y={174} w={278} h={64} label="Medir" sub="Coletar dados de uso" />
      <Arrow x1={163} y1={238} x2={163} y2={262} />
      <Phase
        x={24}
        y={262}
        w={278}
        h={64}
        label="Aprender"
        sub="Confrontar os dados com a hipótese"
      />
      <Arrow x1={163} y1={326} x2={163} y2={350} />
      <Node x={24} y={350} w={278} h={30} label="Pivotar ou perseverar" />
      <Arrow d="M302 365H447V41H302" />
      <Text x={375} y={191} size={13} muted>
        Próximo teste
      </Text>
    </Diagram>
  );
}

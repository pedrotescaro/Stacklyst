import { Arrow, Diagram, Node, Text } from '../primitives';

export const details = {
  title: 'Modelo V e as correspondências dos testes',
  alt: 'A definição desce de requisitos para arquitetura, componentes e código até formar o executável. Do lado dos testes, as verificações sobem de unidade para integração, sistema e aceitação. As ligações tracejadas unem unidade a código, integração a componentes, sistema a arquitetura e aceitação a requisitos.',
};

const pairs = [
  { left: ['Modelar', 'requisitos'], right: ['Teste de', 'aceitação'], x: 10, y: 40 },
  { left: ['Projetar a', 'arquitetura'], right: ['Teste de', 'sistema'], x: 28, y: 112 },
  { left: ['Projetar os', 'componentes'], right: ['Teste de', 'integração'], x: 46, y: 184 },
  { left: ['Implementar', 'o código'], right: ['Teste de', 'unidade'], x: 64, y: 256 },
];

export function VModel() {
  return (
    <Diagram title={details.title} desc={details.alt} height={420}>
      <Text x={79} y={21} weight={600}>
        Definir e projetar
      </Text>
      <Text x={394} y={21} weight={600}>
        Integrar e testar
      </Text>
      {pairs.map(({ left, right, x, y }, index) => (
        <g key={y}>
          {index < pairs.length - 1 && (
            <>
              <Arrow x1={x + 72} y1={y + 54} x2={x + 88} y2={y + 72} />
              <Arrow x1={390 - x} y1={y + 72} x2={406 - x} y2={y + 54} />
            </>
          )}
          <Arrow
            x1={343 - x}
            y1={y + 27}
            x2={x + 137}
            y2={y + 27}
            dashed
            kind="open"
            tone="neutral"
          />
          <Node x={x} y={y} w={137} h={54} label={left} />
          <Node x={343 - x} y={y} w={137} h={54} label={right} tone="accent" />
        </g>
      ))}
      <Arrow x1={133} y1={310} x2={174} y2={349} />
      <Arrow x1={306} y1={349} x2={347} y2={310} />
      <Node x={168} y={346} w={144} h={42} label="Executável" tone="accent" />
      <Text x={240} y={410} muted>
        Tracejado: ligação entre especificação e teste
      </Text>
    </Diagram>
  );
}

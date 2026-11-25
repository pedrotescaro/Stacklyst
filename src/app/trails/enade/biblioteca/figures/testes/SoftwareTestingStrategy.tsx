import { Arrow, Diagram, Node, Text } from '../primitives';

export const details = {
  title: 'Estratégia de testes do componente ao sistema',
  alt: 'Na estratégia de Pressman e Maxim, teste unitário examina componentes isolados. Integração examina interfaces. Validação verifica requisitos do software. O teste de sistema examina o conjunto integrado no ambiente com os demais subsistemas.',
};

const scopes = [
  { label: 'Unidade', sub: 'Componente isolado', x: 102, w: 276 },
  { label: 'Integração', sub: 'Interfaces entre componentes', x: 77, w: 326 },
  { label: 'Validação', sub: 'Requisitos do software', x: 52, w: 376 },
  { label: 'Sistema', sub: 'Software e subsistemas no ambiente', x: 27, w: 426 },
];

export function SoftwareTestingStrategy() {
  return (
    <Diagram title={details.title} desc={details.alt} height={388}>
      <Text x={240} y={24} muted>
        Escopo crescente
      </Text>
      {scopes.map(({ label, sub, x, w }, index) => {
        const y = 48 + index * 82;
        return (
          <g key={label}>
            {index > 0 && <Arrow x1={240} y1={y - 29} x2={240} y2={y} />}
            <Node
              x={x}
              y={y}
              w={w}
              h={53}
              label={label}
              sub={sub}
              tone={index === 3 ? 'accent' : 'neutral'}
            />
          </g>
        );
      })}
      <Text x={240} y={367} muted>
        O foco muda à medida que as partes se integram.
      </Text>
    </Diagram>
  );
}

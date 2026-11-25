import { Arrow, Diagram, Node, Text } from '../primitives';

export const details = {
  title: 'Modelo cascata com revisões',
  alt: 'Cinco etapas em sequência. Definição de requisitos, projeto do sistema e do software, implementação e teste unitário, integração e teste de sistema, operação e manutenção. Retornos tracejados ligam etapas sucessivas.',
};

const stages = [
  ['Definição de requisitos', 'Serviços e restrições'],
  ['Projeto do sistema e do software', 'Arquitetura e componentes'],
  ['Implementação e teste unitário', 'Código e verificação de unidades'],
  ['Integração e teste de sistema', 'Validação do conjunto'],
  ['Operação e manutenção', 'Uso, correções e evolução'],
] as const;

export function WaterfallModel() {
  return (
    <Diagram {...diagramLabels} height={440}>
      <Text x={30} y={22} align="start" weight={600}>
        Sequência planejada
      </Text>
      <Arrow x1={316} y1={17} x2={353} y2={17} dashed tone="neutral" />
      <Text x={367} y={22} align="start" muted>
        Revisão
      </Text>
      {stages.map(([label, sub], index) => {
        const x = 26 + index * 19;
        const y = 38 + index * 79;
        return (
          <g key={label}>
            {index > 0 && <Arrow d={`M${x - 19} ${y - 51} H${x - 29} V${y + 27} H${x}`} />}
            {index > 0 && (
              <Arrow
                d={`M${x + 294} ${y + 16} H${x + 312} V${y - 54} H${x + 275}`}
                dashed
                tone="neutral"
              />
            )}
            <Node x={x} y={y} w={294} h={56} label={label} sub={sub} tone="accent" />
          </g>
        );
      })}
    </Diagram>
  );
}

const diagramLabels = { title: details.title, desc: details.alt };

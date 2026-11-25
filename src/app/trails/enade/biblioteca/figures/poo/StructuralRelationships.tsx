import { Arrow, Diagram, Text, UmlClass } from '../primitives';

const relationships = [
  {
    label: 'Associação',
    from: 'Cliente',
    to: 'Pedido',
    sourceCount: '1',
    targetCount: '0..*',
    start: 'none',
    verb: 'realiza',
  },
  {
    label: 'Agregação compartilhada',
    from: 'Time',
    to: 'Jogador',
    sourceCount: '0..*',
    targetCount: '0..*',
    start: 'diamond',
    verb: 'reúne',
  },
  {
    label: 'Composição',
    from: 'Fatura',
    to: 'ItemFatura',
    sourceCount: '1',
    targetCount: '1..*',
    start: 'diamond-filled',
    verb: 'contém',
  },
] as const;

export const description =
  'Cliente se associa a zero ou muitos pedidos por linha simples. Time reúne jogadores com agregação compartilhada, representada por losango vazio no lado Time. Fatura contém um ou mais itens com composição, representada por losango cheio no lado Fatura. Cada linha marca as duas multiplicidades junto às extremidades.';

export function StructuralRelationships() {
  return (
    <Diagram title="Três relações estruturais UML" desc={description} height={327}>
      {relationships.map(({ label, from, to, sourceCount, targetCount, start, verb }, index) => {
        const y = index * 108;
        return (
          <g key={label}>
            <Text x={14} y={y + 18} align="start" weight={600}>
              {label}
            </Text>
            <UmlClass x={14} y={y + 48} w={118} name={from} />
            <UmlClass x={348} y={y + 48} w={118} name={to} />
            <Arrow x1={132} y1={y + 64} x2={348} y2={y + 64} start={start} kind="none" />
            <Text x={156} y={y + 49} align="start" size={13}>
              {sourceCount}
            </Text>
            <Text x={330} y={y + 49} align="end" size={13}>
              {targetCount}
            </Text>
            <Text x={240} y={y + 82} size={13} muted>
              {verb}
            </Text>
            {index < 2 && <path d={`M14 ${y + 105} H466`} stroke="var(--enade-line)" />}
          </g>
        );
      })}
    </Diagram>
  );
}

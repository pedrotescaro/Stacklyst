import { Arrow, Diagram, Text } from '../primitives';

export const title = 'Equivalências e negação da condicional';
export const alt =
  'A condicional p implica q equivale à disjunção não p ou q e à contrapositiva não q implica não p. A recíproca q implica p equivale à inversa não p implica não q. A negação da condicional original é p e não q.';

export default function ConditionalEquivalences() {
  return (
    <Diagram title={title} desc={alt} height={297}>
      <Text x={18} y={21} align="start" weight={600} size={16}>
        Condicional e equivalentes
      </Text>
      <rect
        x={18}
        y={45}
        width={444}
        height={77}
        rx={10}
        fill="var(--enade-softer)"
        stroke="var(--enade-line)"
        strokeWidth={1.5}
      />
      <Text x={89} y={71} size={19} weight={600}>
        p → q
      </Text>
      <Text x={163} y={71} size={19}>
        ≡
      </Text>
      <Text x={238} y={71} size={19}>
        ¬p ∨ q
      </Text>
      <Text x={315} y={71} size={19}>
        ≡
      </Text>
      <Text x={389} y={71} size={19}>
        ¬q → ¬p
      </Text>
      <Text x={89} y={102} muted>
        Original
      </Text>
      <Text x={238} y={102} muted>
        Disjunção
      </Text>
      <Text x={389} y={102} muted>
        Contrapositiva
      </Text>
      <Text x={18} y={153} align="start" weight={600}>
        Recíproca e inversa
      </Text>
      <Text x={257} y={159} size={17}>
        q → p
      </Text>
      <Text x={326} y={159} size={17}>
        ≡
      </Text>
      <Text x={401} y={159} size={17}>
        ¬p → ¬q
      </Text>
      <Text x={257} y={185} muted>
        Recíproca
      </Text>
      <Text x={401} y={185} muted>
        Inversa
      </Text>
      <line x1={18} y1={208} x2={462} y2={208} stroke="var(--enade-line)" strokeWidth={1.5} />
      <Text x={18} y={237} align="start" weight={600}>
        Negar a original
      </Text>
      <Text x={264} y={243} size={17}>
        ¬(p → q)
      </Text>
      <Arrow x1={314} y1={243} x2={351} y2={243} />
      <Text x={408} y={243} size={17} weight={600}>
        p ∧ ¬q
      </Text>
      <Text x={408} y={269} muted>
        p é V e q é F
      </Text>
    </Diagram>
  );
}

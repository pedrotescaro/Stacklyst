import { Diagram, Text } from '../primitives';

export const title = 'Modus ponens e afirmação do consequente';
export const alt =
  'No modus ponens, das premissas p implica q e p segue q. A afirmação do consequente toma p implica q e q como premissas e tenta concluir p. Se p for falso e q verdadeiro, as duas premissas são verdadeiras e a conclusão é falsa, portanto a inferência é inválida.';

export default function ModusPonensContrast() {
  return (
    <Diagram title={title} desc={alt} height={277}>
      <rect
        x={16}
        y={18}
        width={448}
        height={107}
        rx={10}
        fill="var(--enade-softer)"
        stroke="var(--enade-line)"
        strokeWidth={1.5}
      />
      <rect
        x={16}
        y={142}
        width={448}
        height={117}
        rx={10}
        fill="var(--enade-softer)"
        stroke="var(--enade-line)"
        strokeWidth={1.5}
      />
      <Text x={33} y={43} align="start" weight={600} size={16}>
        Modus ponens
      </Text>
      <Text x={33} y={67} align="start" muted>
        Inferência válida
      </Text>
      <Text x={355} y={49} size={17}>
        p → q, p
      </Text>
      <line x1={300} y1={71} x2={411} y2={71} stroke="var(--enade-success)" strokeWidth={1.5} />
      <Text x={355} y={95} weight={600} size={17}>
        q
      </Text>
      <Text x={33} y={166} align="start" weight={600} size={16}>
        Afirmação do consequente
      </Text>
      <Text x={33} y={190} align="start" muted>
        Inferência inválida
      </Text>
      <Text x={355} y={172} size={17}>
        p → q, q
      </Text>
      <line
        x1={300}
        y1={194}
        x2={411}
        y2={194}
        stroke="var(--enade-danger)"
        strokeWidth={1.5}
        strokeDasharray="5 4"
      />
      <Text x={355} y={218} weight={600} size={17}>
        p
      </Text>
      <Text x={33} y={231} align="start" weight={600}>
        Contraexemplo
      </Text>
      <Text x={33} y={249} align="start" muted>
        Com p = F e q = V, a conclusão é F.
      </Text>
    </Diagram>
  );
}

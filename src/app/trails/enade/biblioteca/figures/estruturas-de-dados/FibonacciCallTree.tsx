import { Arrow, Diagram, Node, Text } from '../primitives';

export const title = 'Chamadas repetidas de Fibonacci';
export const alt =
  'A chamada F de 4 gera F de 3 e F de 2. F de 3 também chama F de 2, além do caso base F de 1. Cada chamada F de 2 calcula F de 1 igual a 1 e F de 0 igual a 0. O destaque marca as duas avaliações independentes de F de 2.';

export default function FibonacciCallTree() {
  return (
    <Diagram title={title} desc={alt} height={342}>
      <Text x={18} y={21} align="start" weight={600}>
        Chamadas
      </Text>
      <Text x={412} y={21} muted>
        Casos base
      </Text>
      <path d="M361 37V305" fill="none" stroke="var(--enade-line)" strokeWidth={1.5} />
      <Arrow d="M81 167H102V89H125" />
      <Arrow d="M81 167H102V257H212" />
      <Arrow d="M189 89H212" />
      <Arrow d="M189 89H201V178H366" />
      <Arrow d="M292 89H326V58H366" />
      <Arrow d="M292 89H326V120H366" />
      <Arrow d="M292 257H326V231H366" />
      <Arrow d="M292 257H326V293H366" />
      <Node x={17} y={149} w={64} h={36} label="F(4)" />
      <Node x={125} y={71} w={64} h={36} label="F(3)" />
      <Node x={212} y={71} w={80} h={36} label="F(2)" tone="accent" />
      <Node x={212} y={239} w={80} h={36} label="F(2)" tone="accent" />
      {[
        [58, 'F(1) = 1'],
        [120, 'F(0) = 0'],
        [178, 'F(1) = 1'],
        [231, 'F(1) = 1'],
        [293, 'F(0) = 0'],
      ].map(([y, label]) => (
        <Node key={y} x={366} y={Number(y) - 16} w={96} h={32} label={String(label)} />
      ))}
      <Text x={18} y={322} align="start" muted>
        F(2) é recalculado em dois ramos.
      </Text>
    </Diagram>
  );
}

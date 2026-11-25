import { Arrow, Diagram, Node, Text } from '../primitives';

export const title = 'Estados de execução de um processo';
export const alt =
  'Pronto e em execução se alternam por despacho e preempção. Um processo em execução passa a bloqueado ao esperar por entrada ou saída. Quando a operação termina, volta a pronto e pode ser despachado novamente.';

export default function ProcessStateDiagram() {
  return (
    <Diagram title={title} desc={alt} height={252}>
      <Arrow x1={138} y1={66} x2={342} y2={66} />
      <Arrow x1={342} y1={96} x2={138} y2={96} tone="neutral" />
      <Arrow d="M402 113V193Q402 207 388 207H301" />
      <Arrow d="M179 207H92Q78 207 78 193V113" />
      <Text x={240} y={54} muted>
        Despacho
      </Text>
      <Text x={240} y={119} muted>
        Preempção
      </Text>
      <Text x={385} y={151} align="end" muted>
        Espera por E/S
      </Text>
      <Text x={95} y={151} align="start" muted>
        E/S concluída
      </Text>
      <Node x={18} y={49} w={120} h={64} label="Pronto" />
      <Node x={342} y={49} w={120} h={64} label="Em execução" tone="accent" />
      <Node x={179} y={176} w={122} h={62} label="Bloqueado" />
    </Diagram>
  );
}

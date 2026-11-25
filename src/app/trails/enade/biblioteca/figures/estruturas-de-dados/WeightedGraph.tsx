import { Diagram, Text } from '../primitives';
import { Vertex } from './dataPrimitives';

export const title = 'Vértices e arestas com pesos';
export const alt =
  'Grafo não dirigido de quatro vértices. A–B tem peso 4, A–C peso 2, C–B peso 1, A–D peso 7 e B–D peso 2. O percurso A–C–B–D soma 5, abaixo do custo 7 da ligação direta A–D.';

export default function WeightedGraph() {
  return (
    <Diagram title={title} desc={alt} height={291}>
      <path
        d="M60 160L219 47 M60 160Q236 269 421 160"
        fill="none"
        stroke="var(--color-dd-muted)"
        strokeWidth={1.5}
      />
      <path
        d="M60 160L205 122L219 47L421 160"
        fill="none"
        stroke="var(--color-dd-accent)"
        strokeWidth={1.5}
      />
      <Vertex x={60} y={160} label="A" />
      <Vertex x={219} y={47} label="B" />
      <Vertex x={205} y={122} label="C" accent />
      <Vertex x={421} y={160} label="D" />
      <Text x={126} y={98}>
        4
      </Text>
      <Text x={120} y={157}>
        2
      </Text>
      <Text x={233} y={86}>
        1
      </Text>
      <Text x={327} y={95}>
        2
      </Text>
      <Text x={240} y={230}>
        7
      </Text>
      <Text x={240} y={270} weight={600}>
        A – C – B – D tem custo 2 + 1 + 2 = 5
      </Text>
    </Diagram>
  );
}

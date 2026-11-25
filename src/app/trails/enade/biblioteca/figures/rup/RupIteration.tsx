import { Arrow, Diagram, Node, Note, Swimlane, Text } from '../primitives';

export const details = {
  title: 'Trabalho e avaliação em uma iteração do RUP',
  alt: 'Planejar a iteração a partir dos riscos e dos casos de uso. Refinar escopo, projetar e implementar, integrar e testar. Ajustes voltam do teste ao desenvolvimento. A avaliação produz evidência para planejar o próximo ciclo e verifica o incremento executável.',
};

export function RupIteration() {
  return (
    <Diagram title={details.title} desc={details.alt} height={480}>
      <Node
        x={76}
        y={12}
        w={285}
        h={57}
        label="Planejar a iteração"
        sub="Riscos e casos de uso do ciclo"
        tone="accent"
      />
      <Swimlane x={41} y={99} w={357} h={226} label="Execução da iteração">
        <Arrow x1={219} y1={69} x2={219} y2={145} />
        <Node x={76} y={145} w={285} h={40} label="Refinar o escopo" />
        <Arrow x1={219} y1={185} x2={219} y2={205} />
        <Node x={76} y={205} w={285} h={40} label="Projetar e implementar" />
        <Arrow x1={219} y1={245} x2={219} y2={265} />
        <Node x={76} y={265} w={285} h={40} label="Integrar e testar" />
        <Arrow d="M76 285 H55 V225 H76" dashed tone="neutral" />
      </Swimlane>
      <Arrow x1={219} y1={305} x2={219} y2={350} />
      <Node x={76} y={350} w={285} h={42} label="Avaliar a iteração" tone="accent" />
      <Arrow x1={219} y1={392} x2={219} y2={422} />
      <Note x={76} y={422} w={285} h={45} label="Incremento executável" />
      <Arrow d="M361 371 H452 V40 H361" dashed tone="neutral" />
      <Text x={448} y={344} align="end" muted>
        Lições e
      </Text>
      <Text x={448} y={361} align="end" muted>
        riscos
      </Text>
    </Diagram>
  );
}

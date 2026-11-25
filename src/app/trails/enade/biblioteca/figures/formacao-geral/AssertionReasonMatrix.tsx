import { Diagram, Node, Text } from '../primitives';

export const assertionReasonMatrix = {
  title: 'Julgamento de uma asserção e sua razão',
  alt: 'Julgue a asserção I e a razão II separadamente. As duas podem ser falsas, só I pode ser verdadeira, só II pode ser verdadeira ou ambas podem ser verdadeiras. Apenas com ambas verdadeiras é necessário decidir se II justifica I.',
};

export function AssertionReasonMatrix() {
  return (
    <Diagram title={assertionReasonMatrix.title} desc={assertionReasonMatrix.alt} height={307}>
      <Text x={24} y={23} align="start" weight={600}>
        Julgue I e II separadamente
      </Text>
      <Text x={197} y={67} weight={600}>
        II verdadeira
      </Text>
      <Text x={367} y={67} weight={600}>
        II falsa
      </Text>
      <Text x={20} y={141} align="start" weight={600}>
        I verdadeira
      </Text>
      <Text x={20} y={235} align="start" weight={600}>
        I falsa
      </Text>
      <Node
        x={116}
        y={90}
        w={162}
        h={102}
        label="Ambas verdadeiras"
        sub={['II justifica I?', 'Sim: há nexo', 'Não: sem nexo']}
        tone="accent"
      />
      <Node x={286} y={90} w={162} h={102} label="Só I é verdadeira" />
      <Node x={116} y={201} w={162} h={69} label="Só II é verdadeira" />
      <Node x={286} y={201} w={162} h={69} label="Ambas falsas" />
      <Text x={24} y={290} align="start" size={13} muted>
        O nexo só é julgado quando as duas são verdadeiras.
      </Text>
    </Diagram>
  );
}

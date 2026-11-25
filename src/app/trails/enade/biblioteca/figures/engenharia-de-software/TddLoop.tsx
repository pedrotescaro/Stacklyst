import { Arrow, Diagram, Node, Text } from '../primitives';

export const details = {
  title: 'Ciclo do desenvolvimento guiado por testes',
  alt: 'Escrever um teste que falha é a etapa vermelha. Fazer o teste passar com a menor mudança é a etapa verde. Refatorar preserva o comportamento e mantém a suíte passando. Outro comportamento reinicia o ciclo.',
};

export function TddLoop() {
  return (
    <Diagram title={details.title} desc={details.alt} height={302}>
      <Node
        x={45}
        y={20}
        w={310}
        h={62}
        label="Vermelho"
        sub="Escrever um teste e observar a falha"
        tone="danger"
      />
      <Arrow x1={200} y1={82} x2={200} y2={112} />
      <Node
        x={45}
        y={112}
        w={310}
        h={62}
        label="Verde"
        sub="Fazer o teste passar com a menor mudança"
        tone="success"
      />
      <Arrow x1={200} y1={174} x2={200} y2={204} />
      <Node
        x={45}
        y={204}
        w={310}
        h={62}
        label="Refatorar"
        sub="Melhorar o desenho com os testes passando"
      />
      <Arrow d="M355 235 H435 V51 H355" tone="neutral" dashed />
      <Text x={426} y={143} align="end" muted>
        Repetir
      </Text>
      <Text x={200} y={286} muted>
        Um comportamento por vez
      </Text>
    </Diagram>
  );
}

import { Arrow, Diagram, Node, Swimlane, Text } from '../primitives';

export const details = {
  title: 'Testes de desenvolvimento, release e usuário',
  alt: 'A equipe de desenvolvimento testa unidades, componentes e o sistema como parte do trabalho. Uma equipe independente verifica a release. Usuários ou clientes avaliam o sistema por meio de testes alfa, beta ou de aceitação.',
};

export function TestingStages() {
  return (
    <Diagram title={details.title} desc={details.alt} height={360}>
      <Swimlane x={15} y={12} w={450} h={126} label="Testes de desenvolvimento">
        <Node x={31} y={58} w={126} h={45} label="Unidade" />
        <Node x={177} y={58} w={126} h={45} label="Componente" />
        <Node x={323} y={58} w={126} h={45} label="Sistema" />
        <Arrow x1={157} y1={80} x2={177} y2={80} />
        <Arrow x1={303} y1={80} x2={323} y2={80} />
        <Text x={240} y={122} muted>
          Equipe de desenvolvimento
        </Text>
      </Swimlane>
      <Arrow x1={240} y1={138} x2={240} y2={171} />
      <Node
        x={48}
        y={171}
        w={384}
        h={62}
        label="Testes de release"
        sub="Equipe independente avalia a versão"
        tone="accent"
      />
      <Arrow x1={240} y1={233} x2={240} y2={266} />
      <Node
        x={48}
        y={266}
        w={384}
        h={73}
        label="Testes de usuário"
        sub={['Alfa, beta ou aceitação', 'Usuários e clientes avaliam o sistema']}
      />
    </Diagram>
  );
}

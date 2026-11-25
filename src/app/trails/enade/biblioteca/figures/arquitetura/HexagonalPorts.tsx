import { Arrow, Diagram, Node, Text } from '../primitives';

export const description =
  'HTTP e teste automatizado acionam o núcleo pela mesma porta de entrada de pedidos. O núcleo aciona a porta de persistência, implementada por um adaptador SQL ou em memória. As portas são contratos na fronteira e cada adaptador traduz para uma tecnologia específica.';

export function HexagonalPorts() {
  return (
    <Diagram title="Portas e adaptadores" desc={description} height={371}>
      <Text x={240} y={15} weight={600}>
        Adaptadores que acionam a aplicação
      </Text>
      <Node x={13} y={38} w={207} h={42} label="Interface HTTP" />
      <Node x={260} y={38} w={207} h={42} label="Teste automatizado" />
      <path
        d="M112 108 H368 L432 190 L368 272 H112 L48 190 Z"
        fill="var(--enade-softer)"
        stroke="var(--color-dd-muted)"
      />
      <Arrow d="M116.5 80 V97 H181 V120" />
      <Arrow d="M363.5 80 V97 H299 V120" />
      <Node x={132} y={120} w={216} h={36} label="Porta de pedidos" tone="accent" />
      <Arrow x1={240} y1={156} x2={240} y2={176} />
      <Text x={240} y={190} weight={600}>
        Núcleo da aplicação
      </Text>
      <Text x={240} y={209} muted size={13}>
        Regras e casos de uso
      </Text>
      <Arrow x1={240} y1={220} x2={240} y2={230} />
      <Node x={132} y={230} w={216} h={36} label="Porta de persistência" tone="accent" />
      <Arrow d="M181 266 V294 H116.5 V316" />
      <Arrow d="M299 266 V294 H363.5 V316" />
      <Node x={13} y={316} w={207} h={42} label="Adaptador SQL" />
      <Node x={260} y={316} w={207} h={42} label="Adaptador em memória" />
    </Diagram>
  );
}

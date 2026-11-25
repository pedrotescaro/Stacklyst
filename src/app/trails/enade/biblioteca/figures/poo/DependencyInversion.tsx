import { Arrow, Diagram, Text, UmlClass } from '../primitives';

export const description =
  'ServicoPedidos depende de RepositorioPedidos, interface que declara salvar. As implementações Postgres e Memoria realizam essa interface. Assim a regra de pedidos conhece o contrato e cada implementação concreta depende da mesma abstração.';

export function DependencyInversion() {
  return (
    <Diagram title="Dependências de um serviço de pedidos" desc={description} height={342}>
      <Arrow d="M240 76 V126" kind="open" dashed />
      <Text x={252} y={102} align="start" muted size={13}>
        usa contrato
      </Text>
      <Arrow d="M121 277 V244 H206 V204" kind="triangle" dashed />
      <Arrow d="M359 277 V244 H274 V204" kind="triangle" dashed />
      <UmlClass x={118} y={14} w={244} name="ServicoPedidos" operations={['+registrar(pedido)']} />
      <UmlClass
        x={118}
        y={126}
        w={244}
        name="RepositorioPedidos"
        stereotype="interface"
        operations={['+salvar(pedido)']}
      />
      <UmlClass x={10} y={277} w={222} name="RepositorioPostgres" />
      <UmlClass x={248} y={277} w={222} name="RepositorioMemoria" />
      <Text x={240} y={329} muted size={13}>
        Implementações substituíveis sob o mesmo contrato
      </Text>
    </Diagram>
  );
}

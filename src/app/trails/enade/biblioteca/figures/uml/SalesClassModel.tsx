import { Arrow, Diagram, Text, UmlClass } from '../primitives';

export const description =
  'Cliente especializa Pessoa e pode fazer zero ou muitos pedidos. Cada pedido tem um ou mais itens por composição, e cada item referencia um produto. Pedido depende da interface Pagável, realizada por PagamentoPix. Os compartimentos exemplificam atributos, operações e visibilidade.';

export function SalesClassModel() {
  return (
    <Diagram title="Estrutura de vendas e pagamentos" desc={description} height={519}>
      <Arrow d="M113 116 V74" kind="triangle" />
      <Arrow d="M113 178 V222" kind="none" />
      <Text x={126} y={194} align="start" size={13}>
        1
      </Text>
      <Text x={126} y={215} align="start" size={13}>
        0..*
      </Text>
      <Arrow d="M113 364 V314" kind="diamond-filled" />
      <Text x={126} y={330} align="start" size={13}>
        1
      </Text>
      <Text x={126} y={353} align="start" size={13}>
        1..*
      </Text>
      <Arrow d="M113 444 V470" kind="open" />
      <Text x={126} y={458} align="start" size={13}>
        0..*
      </Text>
      <Text x={105} y={465} align="end" size={13}>
        1
      </Text>
      <Arrow d="M218 256 H262" kind="open" dashed />
      <Arrow d="M365 375 V294" kind="triangle" dashed />
      <UmlClass x={8} y={12} w={210} name="Pessoa" abstract attributes={['#nome : String']} />
      <UmlClass x={8} y={116} w={210} name="Cliente" attributes={['−cpf : String']} />
      <UmlClass
        x={8}
        y={222}
        w={210}
        name="Pedido"
        attributes={['−numero : Integer']}
        operations={['+calcularTotal() : Decimal']}
      />
      <UmlClass
        x={8}
        y={364}
        w={210}
        name="ItemPedido"
        attributes={['−quantidade : Integer', '−precoUnitario : Decimal']}
      />
      <UmlClass x={8} y={470} w={210} name="Produto" />
      <UmlClass
        x={262}
        y={216}
        w={210}
        name="Pagável"
        stereotype="interface"
        operations={['+pagar(valor : Decimal)']}
      />
      <UmlClass x={262} y={375} w={210} name="PagamentoPix" />
      <Text x={377} y={325} align="start" size={13} muted>
        realização
      </Text>
      <Text x={240} y={238} size={13} muted>
        usa
      </Text>
    </Diagram>
  );
}

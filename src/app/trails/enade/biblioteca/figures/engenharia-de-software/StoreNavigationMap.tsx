import { Arrow, Diagram, Node, Text } from '../primitives';

export const details = {
  title: 'Mapa de navegação de uma loja',
  alt: 'Da página inicial, o usuário pode explorar categorias ou pesquisar. Ambos os caminhos chegam ao produto. Adicionar abre o carrinho, que permite voltar à loja ou seguir à revisão. A revisão permite voltar ao carrinho para editar ou confirmar o pedido.',
};

export function StoreNavigationMap() {
  return (
    <Diagram title={details.title} desc={details.alt} height={517}>
      <Node x={157} y={10} w={166} h={44} label="Página inicial" tone="accent" />
      <Arrow d="M240 54 V74 H124 V103" />
      <Arrow d="M240 74 H355 V103" />
      <Text x={93} y={84} muted>
        Explorar
      </Text>
      <Text x={393} y={84} muted>
        Pesquisar
      </Text>
      <Node x={40} y={103} w={168} h={48} label="Categorias" />
      <Node x={267} y={103} w={176} h={48} label="Resultados da busca" />
      <Arrow d="M124 151 V170 H240 V191" />
      <Arrow d="M355 151 V170 H240" kind="none" />
      <Node x={157} y={191} w={166} h={43} label="Detalhe do produto" />
      <Arrow x1={240} y1={234} x2={240} y2={278} />
      <Text x={252} y={254} align="start" muted>
        Adicionar
      </Text>
      <Node x={157} y={278} w={166} h={43} label="Carrinho" />
      <Arrow d="M157 299 H16 V32 H157" dashed tone="neutral" />
      <Text x={28} y={280} align="start" muted>
        Voltar à loja
      </Text>
      <Arrow x1={240} y1={321} x2={240} y2={365} />
      <Text x={252} y={342} align="start" muted>
        Finalizar
      </Text>
      <Node x={157} y={365} w={166} h={43} label="Revisão do pedido" />
      <Arrow d="M323 386 H458 V299 H323" dashed tone="neutral" />
      <Text x={450} y={347} align="end" muted>
        Editar itens
      </Text>
      <Arrow x1={240} y1={408} x2={240} y2={452} />
      <Text x={252} y={431} align="start" muted>
        Confirmar
      </Text>
      <Node x={157} y={452} w={166} h={43} label="Pedido confirmado" tone="success" />
    </Diagram>
  );
}

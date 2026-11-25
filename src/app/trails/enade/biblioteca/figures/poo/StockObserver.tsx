import { Arrow, Diagram, Text, UmlClass } from '../primitives';

export const description =
  'Sujeito mantém e notifica observadores pela operação atualizar. Estoque especializa Sujeito e muda a quantidade. PainelEstoque realiza Observador e pode consultar o novo estado do Estoque após a notificação.';

export function StockObserver() {
  return (
    <Diagram title="Observer para mudanças de estoque" desc={description} height={300}>
      <UmlClass
        x={12}
        y={24}
        w={175}
        name="Sujeito"
        abstract
        operations={['+inscrever(o)', '+remover(o)', '+notificar()']}
      />
      <UmlClass
        x={292}
        y={24}
        w={175}
        name="Observador"
        stereotype="interface"
        operations={['+atualizar()']}
      />
      <Arrow d="M187 71 H292" kind="open" />
      <Text x={239} y={56} size={13}>
        notifica
      </Text>
      <Text x={206} y={86} size={13} muted>
        0..*
      </Text>
      <Text x={272} y={86} size={13} muted>
        0..*
      </Text>
      <UmlClass
        x={12}
        y={184}
        w={175}
        name="Estoque"
        attributes={['−quantidade : Integer']}
        operations={['+alterarQuantidade()']}
      />
      <UmlClass x={292} y={184} w={175} name="PainelEstoque" operations={['+atualizar()']} />
      <Arrow d="M99 184 V122" kind="triangle" />
      <Arrow d="M379 184 V102" kind="triangle" dashed />
      <Arrow d="M292 220 H187" kind="open" />
      <Text x={239} y={202} size={13} muted>
        consulta
      </Text>
      <Text x={239} y={239} size={13} muted>
        quantidade
      </Text>
    </Diagram>
  );
}

import { Arrow, Diagram, Node, Text } from '../primitives';

export const description =
  'Uma transição inicial cria um pedido aberto. Fechar com itens leva à espera de pagamento. Confirmar pagamento emite nota e leva ao estado pago. O pedido pago pode ser despachado, entregue e finalizado, ou cancelado com estorno. Vencer o prazo de pagamento também cancela o pedido. Cada percurso termina em um estado final.';

export function OrderStateMachine() {
  return (
    <Diagram title="Estados do pagamento à entrega" desc={description} height={459}>
      <circle cx={125} cy={15} r={7} fill="var(--color-dd-text)" />
      <Arrow x1={125} y1={22} x2={125} y2={42} kind="open" />
      <Node x={32} y={42} w={186} h={39} label="Aberto" />
      <Arrow x1={125} y1={81} x2={125} y2={121} kind="open" />
      <Text x={136} y={106} align="start" size={13}>
        fechar [há itens]
      </Text>
      <Node x={32} y={121} w={186} h={48} label={['Aguardando', 'pagamento']} />
      <Arrow x1={125} y1={169} x2={125} y2={221} kind="open" />
      <Text x={136} y={190} align="start" size={13}>
        confirmar pagamento
      </Text>
      <Text x={136} y={207} align="start" size={13}>
        / emitir nota
      </Text>
      <Node x={32} y={221} w={186} h={39} label="Pago" />
      <Arrow x1={125} y1={260} x2={125} y2={301} kind="open" />
      <Text x={136} y={285} align="start" size={13}>
        despachar
      </Text>
      <Node x={32} y={301} w={186} h={39} label="Enviado" />
      <Arrow x1={125} y1={340} x2={125} y2={377} kind="open" />
      <Text x={136} y={364} align="start" size={13}>
        confirmar entrega
      </Text>
      <Node x={32} y={377} w={186} h={39} label="Entregue" tone="success" />
      <Arrow d="M218 146 H379 V285" kind="open" />
      <Text x={299} y={135} size={13}>
        vencer prazo
      </Text>
      <Arrow d="M218 243 H348 V285" kind="open" />
      <Text x={282} y={232} size={13}>
        cancelar / estornar
      </Text>
      <Node x={296} y={285} w={128} h={48} label="Cancelado" tone="danger" />
      <Arrow x1={360} y1={333} x2={360} y2={369} kind="open" />
      <Arrow x1={125} y1={416} x2={125} y2={429} kind="open" />
      {[
        [360, 379],
        [125, 439],
      ].map(([x, y]) => (
        <g key={x}>
          <circle
            cx={x}
            cy={y}
            r={10}
            fill="none"
            stroke="var(--color-dd-text)"
            strokeWidth={1.5}
          />
          <circle cx={x} cy={y} r={6} fill="var(--color-dd-text)" />
        </g>
      ))}
    </Diagram>
  );
}

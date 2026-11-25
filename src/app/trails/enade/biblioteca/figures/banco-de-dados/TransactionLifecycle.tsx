import { Arrow, Diagram, Node, Text } from '../primitives';

export const description =
  'Uma transação inicia ativa e fica parcialmente confirmada quando conclui suas operações. O commit bem-sucedido a confirma. Um erro interrompe a transação ativa ou parcialmente confirmada e leva à falha. Depois de desfazer na falha ou liberar recursos na confirmação, a transação fica terminada.';

export function TransactionLifecycle() {
  return (
    <Diagram title="Ciclo de uma transação no SGBD" desc={description} height={435}>
      <circle cx={112} cy={16} r={7} fill="var(--color-dd-text)" />
      <Arrow x1={112} y1={23} x2={112} y2={47} kind="open" />
      <Text x={124} y={34} align="start" size={13}>
        início
      </Text>
      <Node x={15} y={47} w={194} h={43} label="Ativa" />
      <Arrow x1={112} y1={90} x2={112} y2={145} kind="open" />
      <Text x={123} y={115} align="start" size={13}>
        fim das operações
      </Text>
      <Node x={15} y={145} w={194} h={61} label={['Parcialmente', 'confirmada']} />
      <Arrow x1={112} y1={206} x2={112} y2={265} kind="open" />
      <Text x={123} y={235} align="start" size={13}>
        commit
      </Text>
      <Node x={15} y={265} w={194} h={43} label="Confirmada" tone="success" />
      <Arrow d="M209 69 H397 V170" kind="open" tone="danger" />
      <Text x={319} y={56} size={13}>
        erro ou abortar
      </Text>
      <Arrow x1={209} y1={175} x2={329} y2={175} kind="open" tone="danger" />
      <Text x={268} y={152} size={13}>
        erro antes
      </Text>
      <Text x={268} y={166} size={13}>
        do commit
      </Text>
      <Node x={329} y={170} w={136} h={45} label="Falha" tone="danger" />
      <Arrow d="M397 215 V360 H321" kind="open" tone="danger" />
      <Text x={385} y={279} align="end" size={13}>
        desfazer
      </Text>
      <Arrow d="M112 308 V360 H159" kind="open" />
      <Text x={102} y={332} align="end" size={13}>
        liberar recursos
      </Text>
      <Node x={159} y={339} w={162} h={42} label="Terminada" />
      <Arrow x1={240} y1={381} x2={240} y2={401} kind="open" />
      <circle cx={240} cy={411} r={10} fill="none" stroke="var(--color-dd-text)" />
      <circle cx={240} cy={411} r={6} fill="var(--color-dd-text)" />
    </Diagram>
  );
}

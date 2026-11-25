import { Arrow, Diagram, Node, Text } from '../primitives';

export const details = {
  title: 'Cadeia de processos orientada a eventos',
  alt: 'No EPC de concessão de crédito, pedido recebido inicia análise do cadastro. Cadastro analisado inicia decisão de crédito. O operador XOR permite um único resultado. Crédito aprovado inicia liberação do valor e crédito recusado inicia a comunicação da recusa. Cada ramo termina com um evento.',
};

function Event({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <g>
      <path
        d={`M${x + 15} ${y}h150l15 21-15 21h-150l-15-21Z`}
        fill="var(--enade-soft)"
        stroke="var(--color-dd-muted)"
      />
      <Text x={x + 90} y={y + 21} weight={600} size={13}>
        {label}
      </Text>
    </g>
  );
}

export function CreditApprovalEpc() {
  return (
    <Diagram title={details.title} desc={details.alt} height={581}>
      <Event x={150} y={10} label="Pedido recebido" />
      <Arrow x1={240} y1={52} x2={240} y2={74} />
      <Node x={150} y={74} w={180} h={42} label="Analisar cadastro" tone="accent" />
      <Arrow x1={240} y1={116} x2={240} y2={138} />
      <Event x={150} y={138} label="Cadastro analisado" />
      <Arrow x1={240} y1={180} x2={240} y2={202} />
      <Node x={150} y={202} w={180} h={42} label="Decidir concessão" tone="accent" />
      <Arrow x1={240} y1={244} x2={240} y2={266} />
      <circle cx={240} cy={285} r={19} fill="var(--enade-softer)" stroke="var(--color-dd-muted)" />
      <Text x={240} y={285} size={13} weight={600}>
        XOR
      </Text>
      <Arrow d="M240 304 V322 H123 V346" />
      <Arrow d="M240 322 H357 V346" />
      <Event x={33} y={346} label="Crédito aprovado" />
      <Event x={267} y={346} label="Crédito recusado" />
      <Arrow x1={123} y1={388} x2={123} y2={411} />
      <Arrow x1={357} y1={388} x2={357} y2={411} />
      <Node x={33} y={411} w={180} h={42} label="Liberar valor" tone="accent" />
      <Node x={267} y={411} w={180} h={42} label="Notificar solicitante" tone="accent" />
      <Arrow x1={123} y1={453} x2={123} y2={477} />
      <Arrow x1={357} y1={453} x2={357} y2={477} />
      <Event x={33} y={477} label="Valor liberado" />
      <Event x={267} y={477} label="Recusa comunicada" />
      <Text x={240} y={548} muted>
        Hexágono: evento · retângulo arredondado: função
      </Text>
      <Text x={240} y={568} muted>
        XOR: exatamente um caminho
      </Text>
    </Diagram>
  );
}

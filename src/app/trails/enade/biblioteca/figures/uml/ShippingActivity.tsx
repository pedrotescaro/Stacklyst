import { Arrow, Diagram, Diamond, Node, Text } from '../primitives';

export const description =
  'Do nó inicial, o fluxo confere o estoque. Se não há estoque, avisa o cliente. Se há estoque, o fork abre emissão de nota e separação de itens em paralelo. O join aguarda ambas antes do envio. A mesclagem das alternativas leva ao nó final de atividade.';

export function ShippingActivity() {
  return (
    <Diagram title="Atividade UML de expedição" desc={description} height={465}>
      <circle cx={240} cy={19} r={7} fill="var(--color-dd-text)" />
      <Arrow x1={240} y1={26} x2={240} y2={49} kind="open" />
      <Node x={149} y={49} w={182} h={44} label="Conferir estoque" />
      <Arrow x1={240} y1={93} x2={240} y2={117} kind="open" />
      <Diamond x={220} y={117} w={40} h={40} />
      <Arrow d="M220 137 H73 V193" kind="open" />
      <Text x={146} y={127} size={13}>
        [sem estoque]
      </Text>
      <Node x={9} y={193} w={128} h={43} label="Avisar cliente" />
      <Arrow d="M260 137 H320 V188" kind="open" />
      <Text x={336} y={127} size={13}>
        [com estoque]
      </Text>
      <rect x={176} y={188} width={288} height={6} fill="var(--color-dd-text)" />
      <Arrow x1={239} y1={194} x2={239} y2={234} kind="open" />
      <Arrow x1={401} y1={194} x2={401} y2={234} kind="open" />
      <Node x={174} y={234} w={130} h={44} label="Emitir nota" />
      <Node x={336} y={234} w={130} h={44} label="Separar itens" />
      <Arrow x1={239} y1={278} x2={239} y2={305} kind="open" />
      <Arrow x1={401} y1={278} x2={401} y2={305} kind="open" />
      <rect x={176} y={305} width={288} height={6} fill="var(--color-dd-text)" />
      <Arrow x1={320} y1={311} x2={320} y2={333} kind="open" />
      <Node x={246} y={333} w={148} h={42} label="Enviar pedido" />
      <Arrow d="M73 236 V404 H221" kind="open" />
      <Arrow d="M320 375 V404 H259" kind="open" />
      <Diamond x={221} y={387} w={38} h={34} />
      <Arrow x1={240} y1={421} x2={240} y2={438} kind="open" />
      <circle
        cx={240}
        cy={448}
        r={10}
        fill="none"
        stroke="var(--color-dd-text)"
        strokeWidth={1.5}
      />
      <circle cx={240} cy={448} r={6} fill="var(--color-dd-text)" />
    </Diagram>
  );
}

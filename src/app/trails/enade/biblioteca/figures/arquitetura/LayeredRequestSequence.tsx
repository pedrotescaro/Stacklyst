import { Activation, Arrow, Diagram, Lifeline, Text } from '../primitives';

export const description =
  'Na sequência vertical, Apresentação chama Aplicação para enviar um pedido. Aplicação valida o pedido, chama Dados para gravar a transação e recebe a confirmação. Aplicação então retorna à Apresentação o número do pedido, sem acesso direto da interface aos dados.';

export function LayeredRequestSequence() {
  return (
    <Diagram title="Requisição através das camadas" desc={description} height={315}>
      <Lifeline x={10} y={15} w={132} h={283} label=":Apresentação" />
      <Lifeline x={174} y={15} w={132} h={283} label=":Aplicação" />
      <Lifeline x={338} y={15} w={132} h={283} label=":Dados" />
      <Activation x={240} y={90} h={182} />
      <Activation x={404} y={187} h={43} />
      <Arrow x1={76} y1={90} x2={235} y2={90} />
      <Text x={156} y={76} size={13}>
        enviar pedido
      </Text>
      <Arrow d="M245 125 H299 V153 H245" />
      <Text x={308} y={137} align="start" size={13}>
        validar pedido
      </Text>
      <Arrow x1={245} y1={187} x2={399} y2={187} />
      <Text x={322} y={174} size={13}>
        gravar transação
      </Text>
      <Arrow x1={399} y1={230} x2={245} y2={230} kind="open" dashed />
      <Text x={322} y={216} size={13}>
        pedido confirmado
      </Text>
      <Arrow x1={235} y1={272} x2={76} y2={272} kind="open" dashed />
      <Text x={155} y={258} size={13}>
        retornar número
      </Text>
    </Diagram>
  );
}

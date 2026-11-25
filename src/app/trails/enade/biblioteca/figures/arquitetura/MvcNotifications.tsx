import { Arrow, Diagram, Node, Text } from '../primitives';

export const description =
  'A pessoa interage com o controlador, que trata a entrada e altera o estado no modelo. O modelo notifica a visão ao mudar. A visão consulta o estado e apresenta a informação sincronizada à pessoa.';

export function MvcNotifications() {
  return (
    <Diagram title="MVC com notificação do modelo" desc={description} height={326}>
      <Node x={155} y={12} w={170} h={44} label="Pessoa usuária" tone="accent" />
      <Node x={12} y={116} w={170} h={52} label="Controlador" />
      <Node x={298} y={116} w={170} h={52} label="Visão" />
      <Node x={151} y={257} w={178} h={52} label="Modelo" />
      <Arrow d="M175 56 V77 H97 V116" />
      <Text x={138} y={67} size={13}>
        interage
      </Text>
      <Arrow d="M383 116 V77 H309 V56" />
      <Text x={370} y={66} size={13}>
        apresenta dados
      </Text>
      <Arrow x1={182} y1={142} x2={298} y2={142} />
      <Text x={240} y={128} size={13}>
        trata entrada
      </Text>
      <Arrow d="M97 168 V283 H151" />
      <Text x={87} y={226} align="end" size={13}>
        altera
      </Text>
      <Text x={87} y={243} align="end" size={13}>
        estado
      </Text>
      <Arrow d="M268 257 V190 H345 V168" dashed />
      <Text x={260} y={213} align="end" size={13}>
        notifica mudança
      </Text>
      <Arrow d="M408 168 V283 H329" />
      <Text x={419} y={224} align="start" size={13}>
        lê
      </Text>
      <Text x={419} y={241} align="start" size={13}>
        estado
      </Text>
    </Diagram>
  );
}

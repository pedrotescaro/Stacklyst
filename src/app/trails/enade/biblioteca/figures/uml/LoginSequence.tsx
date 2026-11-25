import { Activation, Actor, Arrow, Diagram, Lifeline, Text } from '../primitives';

export const description =
  'A pessoa envia credenciais à interface de login, que chama o acesso, que consulta o cadastro. As barras de execução mostram o trabalho aninhado. Até três tentativas enquanto pendente, a alternativa com senha válida cria a sessão e abre o painel. Senha inválida recusa o acesso e informa a falha.';

export function LoginSequence() {
  return (
    <Diagram title="Sequência de tentativas de acesso" desc={description} height={465}>
      <Actor x={59} y={9} label="Pessoa" />
      <path d="M59 86 V449" stroke="var(--color-dd-muted)" strokeDasharray="5 4" />
      <Lifeline x={139} y={37} w={90} h={412} label=":Login" />
      <Lifeline x={264} y={37} w={90} h={412} label=":Acesso" />
      <Lifeline x={386} y={37} w={90} h={412} label=":Cadastro" />
      <rect
        x={14}
        y={90}
        width={452}
        height={348}
        fill="none"
        stroke="var(--color-dd-text)"
        strokeWidth={1.5}
      />
      <path
        d="M14 90 H108 V103 L97 114 H14 Z"
        fill="var(--enade-soft)"
        stroke="var(--color-dd-text)"
        strokeWidth={1.5}
      />
      <Text x={25} y={106} align="start" weight={600}>
        loop (0, 3)
      </Text>
      <Text x={120} y={106} align="start" size={13}>
        [acesso pendente]
      </Text>
      <Activation x={184} y={144} h={275} w={8} />
      <Activation x={309} y={175} h={235} w={8} />
      <Activation x={431} y={207} h={29} w={8} />
      <Arrow x1={59} y1={144} x2={180} y2={144} tone="accent" />
      <Text x={120} y={134} size={13}>
        enviar credenciais
      </Text>
      <Arrow x1={188} y1={175} x2={305} y2={175} />
      <Text x={247} y={165} size={13}>
        autenticar
      </Text>
      <Arrow x1={313} y1={207} x2={427} y2={207} />
      <Text x={371} y={197} size={13}>
        consultar cadastro
      </Text>
      <Arrow x1={427} y1={236} x2={313} y2={236} kind="open" dashed />
      <Text x={371} y={226} size={13}>
        dados de acesso
      </Text>
      <rect
        x={31}
        y={257}
        width={357}
        height={168}
        fill="none"
        stroke="var(--color-dd-text)"
        strokeWidth={1.5}
      />
      <path
        d="M31 257 H79 V268 L68 279 H31 Z"
        fill="var(--enade-soft)"
        stroke="var(--color-dd-text)"
        strokeWidth={1.5}
      />
      <Text x={42} y={274} align="start" weight={600}>
        alt
      </Text>
      <Text x={88} y={274} align="start" size={13}>
        [senha válida]
      </Text>
      <Arrow x1={305} y1={306} x2={188} y2={306} kind="open" dashed />
      <Text x={245} y={296} size={13}>
        sessão criada
      </Text>
      <Arrow x1={180} y1={330} x2={59} y2={330} kind="open" dashed />
      <Text x={120} y={320} size={13}>
        abrir painel
      </Text>
      <path
        d="M31 341 H388"
        stroke="var(--color-dd-text)"
        strokeWidth={1.5}
        strokeDasharray="6 4"
      />
      <Text x={72} y={359} align="start" size={13}>
        [senha inválida]
      </Text>
      <Arrow x1={305} y1={382} x2={188} y2={382} kind="open" dashed />
      <Text x={246} y={372} size={13}>
        acesso recusado
      </Text>
      <Arrow x1={180} y1={410} x2={59} y2={410} kind="open" dashed />
      <Text x={120} y={400} size={13}>
        informar falha
      </Text>
    </Diagram>
  );
}

import { Arrow, Diagram, Node, Text } from '../primitives';

export const description =
  'No MVP de visão passiva, a visão envia eventos ao apresentador, que modifica o modelo e atualiza explicitamente a visão. No MVVM, a visão vincula dados e invoca comandos do ViewModel. O ViewModel lê ou modifica o modelo, sem conhecer a visão.';

export function PassiveViewBinding() {
  return (
    <Diagram title="Visão passiva e vinculação de dados" desc={description} height={402}>
      <Text x={119} y={20} weight={600}>
        MVP com visão passiva
      </Text>
      <Text x={361} y={20} weight={600}>
        MVVM
      </Text>
      <path d="M240 11 V384" stroke="var(--enade-line)" />
      <Node x={12} y={48} w={214} h={42} label="Visão passiva" />
      <Node x={254} y={48} w={214} h={42} label="Visão" />
      <Node x={12} y={168} w={214} h={50} label="Apresentador" tone="accent" />
      <Node x={254} y={168} w={214} h={50} label="ViewModel" tone="accent" />
      <Node x={12} y={301} w={214} h={48} label="Modelo" />
      <Node x={254} y={301} w={214} h={48} label="Modelo" />
      <Arrow d="M45 90 V168" />
      <Arrow d="M194 168 V90" />
      <Text x={57} y={119} align="start" size={13}>
        eventos
      </Text>
      <Text x={184} y={136} align="end" size={13}>
        atualiza
      </Text>
      <Text x={184} y={153} align="end" size={13}>
        explicitamente
      </Text>
      <Arrow d="M287 90 V168" />
      <Arrow d="M432 90 V168" start="open" kind="open" />
      <Text x={297} y={119} align="start" size={13}>
        comandos
      </Text>
      <Text x={421} y={137} align="end" size={13}>
        vinculação
      </Text>
      <Text x={421} y={153} align="end" size={13}>
        de dados
      </Text>
      <Arrow d="M119 218 V301" start="open" kind="open" />
      <Arrow d="M361 218 V301" start="open" kind="open" />
      <Text x={130} y={250} align="start" size={13}>
        consulta
      </Text>
      <Text x={130} y={269} align="start" size={13}>
        e alteração
      </Text>
      <Text x={372} y={250} align="start" size={13}>
        consulta
      </Text>
      <Text x={372} y={269} align="start" size={13}>
        e alteração
      </Text>
      <Text x={119} y={376} size={13} muted>
        Sincronização pelo apresentador
      </Text>
      <Text x={361} y={376} size={13} muted>
        Sincronização pelo binding
      </Text>
    </Diagram>
  );
}

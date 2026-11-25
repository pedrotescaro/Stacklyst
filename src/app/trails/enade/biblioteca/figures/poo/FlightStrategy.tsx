import { Arrow, Diagram, Text, UmlClass } from '../primitives';

export const description =
  'Avião é o contexto, guarda uma estratégia de voo e delega voar a ela. VooDiurno e VooNoturno realizam a mesma interface. O contexto pode receber qualquer estratégia concreta sem depender de sua implementação.';

export function FlightStrategy() {
  return (
    <Diagram title="Strategy para modos de voo" desc={description} height={315}>
      <UmlClass
        x={12}
        y={20}
        w={210}
        name="Avião"
        operations={['+configurarVoo(estratégia)', '+decolar()']}
      />
      <UmlClass
        x={255}
        y={148}
        w={213}
        name="EstratégiaVoo"
        stereotype="interface"
        operations={['+voar()']}
      />
      <UmlClass x={12} y={245} w={210} name="VooDiurno" operations={['+voar()']} />
      <UmlClass x={255} y={245} w={213} name="VooNoturno" operations={['+voar()']} />
      <Arrow d="M222 58 H361 V148" kind="open" />
      <Text x={270} y={44} align="start" size={13} muted>
        delega voo
      </Text>
      <Text x={235} y={75} align="start" size={13}>
        0..*
      </Text>
      <Text x={372} y={134} align="start" size={13}>
        1
      </Text>
      <Arrow d="M117 245 V186 H255" kind="triangle" dashed />
      <Arrow d="M361 245 V226" kind="triangle" dashed />
      <Text x={404} y={104} size={13} muted>
        contrato
      </Text>
    </Diagram>
  );
}

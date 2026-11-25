import { Arrow, Diagram, Text, UmlClass } from '../primitives';

export const description =
  'A interface Imprimível declara imprimir. Impressora é uma classe abstrata que realiza a interface por linha tracejada e triângulo vazio. Laser e JatoDeTinta especializam Impressora por linhas contínuas e triângulos vazios; cada uma oferece a operação imprimir.';

export function PrinterGeneralization() {
  return (
    <Diagram title="Contrato e especialização de impressão" desc={description} height={348}>
      <Arrow d="M240 127 V90" kind="triangle" dashed />
      <Arrow d="M117 262 V226 H215 V189" kind="triangle" />
      <Arrow d="M363 262 V226 H265 V189" kind="triangle" />
      <UmlClass
        x={135}
        y={12}
        w={210}
        name="Imprimível"
        stereotype="interface"
        operations={['+imprimir()']}
      />
      <UmlClass
        x={135}
        y={127}
        w={210}
        name="Impressora"
        abstract
        operations={['+imprimir() {abstract}']}
      />
      <UmlClass x={12} y={262} w={210} name="Laser" operations={['+imprimir()']} />
      <UmlClass x={258} y={262} w={210} name="JatoDeTinta" operations={['+imprimir()']} />
      <Text x={255} y={107} align="start" size={13} muted>
        realização do contrato
      </Text>
      <Text x={118} y={214} size={13} muted>
        generalização
      </Text>
      <Text x={362} y={214} size={13} muted>
        generalização
      </Text>
    </Diagram>
  );
}

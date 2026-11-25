import { Diagram, Text, UmlClass } from '../primitives';

export const description =
  'A classe ContaBancaria é mostrada em três compartimentos. O nome identifica o tipo. Número e saldo são atributos privados. Depositar, sacar e consultarSaldo são operações públicas; sacar retorna Boolean e consultarSaldo retorna Decimal.';

export function BankAccountClass() {
  return (
    <Diagram title="Interface de uma conta bancária" desc={description} height={232}>
      <UmlClass
        x={10}
        y={15}
        w={268}
        name="ContaBancaria"
        attributes={['−numero : String', '−saldo : Decimal']}
        operations={[
          '+depositar(valor : Decimal)',
          '+sacar(valor : Decimal) : Boolean',
          '+consultarSaldo() : Decimal',
        ]}
      />
      <path d="M278 31 H302 M278 70 H302 M278 114 H302" stroke="var(--enade-line)" />
      <Text x={314} y={31} align="start" weight={600}>
        Nome da classe
      </Text>
      <Text x={314} y={70} align="start" weight={600}>
        Atributos privados
      </Text>
      <Text x={314} y={114} align="start" weight={600}>
        Operações públicas
      </Text>
      <Text x={314} y={136} align="start" size={13} muted>
        Parâmetros e retorno
      </Text>
      <path d="M10 191 H470" stroke="var(--enade-line)" />
      <Text x={10} y={212} align="start" muted size={13}>
        − visibilidade privada
      </Text>
      <Text x={470} y={212} align="end" muted size={13}>
        + visibilidade pública
      </Text>
    </Diagram>
  );
}

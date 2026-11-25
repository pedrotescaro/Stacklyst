import { Actor, Arrow, Diagram, Note, Text, UseCase } from '../primitives';

export const description =
  'O Leitor está fora da fronteira do sistema e se associa a Realizar empréstimo e Devolver livro. Uma dependência tracejada de Realizar empréstimo para Autenticar usuário indica inclusão. Uma dependência tracejada de Pagar multa para Devolver livro indica extensão sob a condição de atraso, no ponto Verificar atraso.';

export function UseCaseNotation() {
  return (
    <Diagram title="Inclusão e extensão em casos de uso" desc={description} height={443}>
      <rect
        x={110}
        y={14}
        width={358}
        height={414}
        fill="var(--enade-softer)"
        stroke="var(--color-dd-text)"
        strokeWidth={1.5}
      />
      <Text x={128} y={38} align="start" weight={600}>
        Sistema da biblioteca
      </Text>
      <Actor x={49} y={153} label="Leitor" />
      <path
        d="M62 176 L128 83 M62 176 L128 250"
        fill="none"
        stroke="var(--color-dd-text)"
        strokeWidth={1.5}
      />
      <UseCase x={128} y={55} w={204} h={56} label="Realizar empréstimo" />
      <UseCase x={128} y={142} w={204} h={56} label="Autenticar usuário" />
      <UseCase x={128} y={222} w={204} h={56} label="Devolver livro" />
      <UseCase x={128} y={359} w={204} h={52} label="Pagar multa" />
      <Arrow x1={230} y1={111} x2={230} y2={142} kind="open" dashed />
      <Text x={243} y={130} align="start" size={13}>
        «include»
      </Text>
      <Arrow x1={230} y1={359} x2={230} y2={278} kind="open" dashed />
      <Text x={218} y={299} align="end" size={13}>
        «extend»
      </Text>
      <path d="M230 326 H265" stroke="var(--color-dd-muted)" strokeDasharray="5 4" />
      <Note x={265} y={296} w={186} h={60} label="Condição: atraso" sub="Ponto: verificar atraso" />
    </Diagram>
  );
}

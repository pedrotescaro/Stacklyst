import { Arrow, Diagram, Note, Text } from '../primitives';

export const details = {
  title: 'Vínculos entre caso de uso e artefatos do RUP',
  alt: 'O modelo de negócio informa o caso de uso do sistema. O caso de uso é realizado no projeto e dá origem a casos de teste. O projeto orienta componentes e build, que os testes exercitam. O pacote de implantação reúne componentes e se beneficia da evidência produzida nos testes.',
};

export function RupUseCaseArtifacts() {
  return (
    <Diagram title={details.title} desc={details.alt} height={442}>
      <Note x={109} y={12} w={246} h={43} label="Modelo de negócio" />
      <Arrow x1={232} y1={55} x2={232} y2={87} />
      <Note x={109} y={87} w={246} h={43} label="Caso de uso do sistema" />
      <Arrow d="M232 130 V151 H126 V188" />
      <Arrow d="M232 151 H352 V188" />
      <Text x={132} y={171} align="start" muted>
        Realizado em
      </Text>
      <Text x={346} y={171} align="end" muted>
        Origina
      </Text>
      <Note x={14} y={188} w={224} h={50} label="Modelo de projeto" />
      <Note x={264} y={188} w={179} h={50} label="Casos de teste" />
      <Arrow x1={126} y1={238} x2={126} y2={277} />
      <Text x={145} y={257} align="start" muted>
        Orienta
      </Text>
      <Note x={14} y={277} w={224} h={50} label="Componentes e build" />
      <Arrow d="M322 238 V302 H238" tone="neutral" dashed />
      <Text x={329} y={276} align="start" muted>
        Exercitam
      </Text>
      <Arrow d="M126 327 V352 H232 V375" />
      <Arrow d="M410 238 V399 H355" dashed tone="neutral" />
      <Text x={399} y={345} align="end" muted>
        Evidência
      </Text>
      <Note x={109} y={375} w={246} h={49} label="Pacote de implantação" />
    </Diagram>
  );
}

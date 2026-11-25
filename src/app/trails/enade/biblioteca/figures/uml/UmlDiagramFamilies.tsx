import { Arrow, Diagram, Node, Text } from '../primitives';

export const description =
  'Quatorze diagramas UML em duas famílias. A estrutural reúne classes, objetos, componentes, estrutura composta, implantação, pacotes e perfis. A comportamental reúne casos de uso, atividades, máquinas de estados e quatro diagramas de interação: sequência, comunicação, tempo e visão geral de interação.';

export function UmlDiagramFamilies() {
  return (
    <Diagram title="Famílias de diagramas UML" desc={description} height={362}>
      <Node x={132} y={10} w={216} h={42} label="Diagramas UML 2.5.1" tone="accent" />
      <Arrow d="M240 52 V70 H119 V88" />
      <Arrow d="M240 52 V70 H361 V88" />
      <Node x={14} y={88} w={210} h={46} label="Estruturais" />
      <Node x={256} y={88} w={210} h={46} label="Comportamentais" />
      <path d="M119 134 V151 M361 134 V151" stroke="var(--color-dd-text)" strokeWidth={1.5} />
      <rect
        x={14}
        y={151}
        width={210}
        height={189}
        rx={9}
        fill="var(--enade-softer)"
        stroke="var(--enade-line)"
      />
      <rect
        x={256}
        y={151}
        width={210}
        height={189}
        rx={9}
        fill="var(--enade-softer)"
        stroke="var(--enade-line)"
      />
      {[
        'Classes',
        'Objetos',
        'Componentes',
        'Estrutura composta',
        'Implantação',
        'Pacotes',
        'Perfis',
      ].map((name, index) => (
        <Text key={name} x={32} y={175 + index * 23} align="start">
          {name}
        </Text>
      ))}
      {['Casos de uso', 'Atividades', 'Máquinas de estados'].map((name, index) => (
        <Text key={name} x={273} y={175 + index * 23} align="start">
          {name}
        </Text>
      ))}
      <path d="M273 236 H449" stroke="var(--enade-line)" strokeWidth={1.5} />
      <Text x={273} y={258} align="start" weight={600}>
        Interação
      </Text>
      <Text x={273} y={281} align="start">
        Sequência · Comunicação
      </Text>
      <Text x={273} y={305} align="start">
        Tempo · Visão geral
      </Text>
      <Text x={273} y={325} align="start" muted size={13}>
        de interação
      </Text>
    </Diagram>
  );
}

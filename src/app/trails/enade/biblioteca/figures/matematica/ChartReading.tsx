import { Arrow, Diagram, Node, Text } from '../primitives';

export const chartReading = {
  title: 'Como comparar valores de um gráfico',
  alt: 'Exemplo fictício de barras com eixo começando em zero e mesma unidade nas turmas A e B. A turma A tem 20 e a B tem 35 participantes. A leitura verifica fonte, eixo e comparabilidade antes de concluir uma diferença de 15 participantes.',
};

export function ChartReading() {
  return (
    <Diagram title={chartReading.title} desc={chartReading.alt} height={360}>
      <Text x={24} y={22} align="start" weight={600}>
        Participantes por turma
      </Text>
      {[0, 10, 20, 30, 40].map((tick) => (
        <g key={tick}>
          <path d={`M55 ${178 - tick * 3}H450`} stroke="var(--enade-line)" />
          <Text x={43} y={178 - tick * 3} align="end" size={13} muted>
            {tick}
          </Text>
        </g>
      ))}
      <path d="M55 50V178H450" fill="none" stroke="var(--color-dd-muted)" />
      <rect x={128} y={118} width={85} height={60} rx={3} fill="var(--color-dd-accent)" />
      <rect x={294} y={73} width={85} height={105} rx={3} fill="var(--color-dd-accent)" />
      <Text x={170} y={107} weight={600}>
        20
      </Text>
      <Text x={336} y={62} weight={600}>
        35
      </Text>
      <Text x={170} y={193}>
        Turma A
      </Text>
      <Text x={336} y={193}>
        Turma B
      </Text>
      <Text x={55} y={216} align="start" size={13} muted>
        Dados fictícios para exercício de leitura
      </Text>
      <Node x={24} y={238} w={432} h={46} label="Confira a fonte, a escala e a unidade" />
      <Arrow x1={240} y1={284} x2={240} y2={298} />
      <Node
        x={24}
        y={298}
        w={432}
        h={48}
        label="Mesma unidade e referência: B tem 15 a mais"
        tone="accent"
      />
    </Diagram>
  );
}

import { Arrow, Diagram, Node, Text } from '../primitives';

export const details = {
  title: 'Avaliação de um sistema legado',
  alt: 'A matriz contrapõe valor de negócio e qualidade técnica do sistema. Baixo valor e baixa qualidade favorecem retirada. Alto valor e baixa qualidade favorecem reengenharia ou substituição. Com alta qualidade, baixo valor pode justificar manutenção condicionada, enquanto alto valor indica continuar a manutenção normal.',
};

export function LegacySystemDecisions() {
  return (
    <Diagram title={details.title} desc={details.alt} height={324}>
      <Text x={34} y={22} align="start" weight={600}>
        Valor para o negócio
      </Text>
      <Text x={72} y={101} align="end" muted>
        Alto
      </Text>
      <Text x={72} y={206} align="end" muted>
        Baixo
      </Text>
      <Arrow x1={82} y1={256} x2={82} y2={46} />
      <Arrow x1={82} y1={256} x2={457} y2={256} />
      <Node x={98} y={57} w={166} h={83} label={['Reengenharia', 'ou substituição']} />
      <Node
        x={279}
        y={57}
        w={166}
        h={83}
        label={['Manter', 'em operação']}
        sub="Manutenção normal"
        tone="accent"
      />
      <Node x={98} y={155} w={166} h={83} label="Descontinuar" />
      <Node x={279} y={155} w={166} h={83} label={['Manter sob', 'condição']} />
      <Text x={180} y={278} muted>
        Baixa
      </Text>
      <Text x={363} y={278} muted>
        Alta
      </Text>
      <Text x={272} y={307} weight={600}>
        Qualidade técnica
      </Text>
    </Diagram>
  );
}

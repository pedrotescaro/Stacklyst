import { Arrow, Diagram, Node, Text } from '../primitives';

export const coinTossTree = {
  title: 'Árvore de probabilidades para duas jogadas',
  alt: 'Dois lançamentos independentes de uma moeda equilibrada. Cada lançamento tem probabilidade de um meio para cara e um meio para coroa. Os quatro pares ordenados têm probabilidade de um quarto: cara e cara, cara e coroa, coroa e cara e coroa e coroa.',
};

export function CoinTossTree() {
  return (
    <Diagram title={coinTossTree.title} desc={coinTossTree.alt} height={280}>
      <Node x={142} y={19} w={196} h={42} label="Moeda equilibrada" tone="accent" />
      <Arrow d="M225 61 116 111" />
      <Arrow d="M255 61 364 111" />
      <Text x={152} y={82} size={13}>
        ½
      </Text>
      <Text x={328} y={82} size={13}>
        ½
      </Text>
      <Node x={66} y={111} w={100} h={42} label="Cara" />
      <Node x={314} y={111} w={100} h={42} label="Coroa" />
      {[0, 1, 2, 3].map((index) => {
        const x = 12 + index * 116;
        const parent = index < 2 ? 116 : 364;
        const result = ['Cara · cara', 'Cara · coroa', 'Coroa · cara', 'Coroa · coroa'][index];
        return (
          <g key={result}>
            <Arrow d={`M${parent} 153 ${x + 54} 203`} />
            <Text x={(parent + x + 54) / 2 + (index % 2 ? 12 : -12)} y={174} size={13}>
              ½
            </Text>
            <Node x={x} y={203} w={108} h={58} label={result} sub="½ × ½ = ¼" />
          </g>
        );
      })}
    </Diagram>
  );
}

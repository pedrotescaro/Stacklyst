import { Diagram, Text } from '../primitives';

export const title = 'Condições de verdade dos conectivos';
export const alt =
  'Tabela das quatro combinações de p e q. Negação é verdadeira se p for falso, conjunção se ambos forem verdadeiros, disjunção inclusiva se ao menos um for verdadeiro, ou exclusivo se somente um for verdadeiro, implicação salvo quando p é verdadeiro e q falso, e bicondicional se os valores forem iguais.';

const headings = ['p', 'q', '¬p', 'p ∧ q', 'p ∨ q', 'p ⊕ q', 'p → q', 'p ↔ q'];
const positions = [38, 82, 132, 187, 242, 297, 352, 417];
const valuations = [
  [true, true],
  [true, false],
  [false, true],
  [false, false],
] as const;
const conditions = [
  ['¬p', 'p é falso.'],
  ['p ∧ q', 'Ambas são verdadeiras.'],
  ['p ∨ q', 'Ao menos uma é verdadeira.'],
  ['p ⊕ q', 'Só uma é verdadeira.'],
  ['p → q', 'p é falso ou q é verdadeiro.'],
  ['p ↔ q', 'p e q têm valores iguais.'],
];

export default function ConnectiveTruthConditions() {
  return (
    <Diagram title={title} desc={alt} height={377}>
      <rect
        x={16}
        y={14}
        width={448}
        height={192}
        rx={10}
        fill="var(--enade-softer)"
        stroke="var(--enade-line)"
        strokeWidth={1.5}
      />
      <path
        d="M108 14V206M16 54H464M16 92H464M16 130H464M16 168H464"
        stroke="var(--enade-line)"
        strokeWidth={1.5}
      />
      {headings.map((label, i) => (
        <Text key={label} x={positions[i]} y={33} weight={600} size={15}>
          {label}
        </Text>
      ))}
      {valuations.map(([p, q], i) =>
        [p, q, !p, p && q, p || q, p !== q, !p || q, p === q].map((isTrue, j) => (
          <Text
            key={`${i}-${j}`}
            x={positions[j]}
            y={73 + i * 38}
            weight={isTrue && j > 1 ? 600 : 400}
            muted={j > 1 && !isTrue}
          >
            {isTrue ? 'V' : 'F'}
          </Text>
        ))
      )}
      <Text x={17} y={232} align="start" weight={600}>
        Quando cada expressão é verdadeira
      </Text>
      {conditions.map(([symbol, rule], i) => (
        <g key={symbol}>
          <Text x={17} y={256 + i * 20} align="start" weight={600}>
            {symbol}
          </Text>
          <Text x={87} y={256 + i * 20} align="start" muted>
            {rule}
          </Text>
        </g>
      ))}
    </Diagram>
  );
}

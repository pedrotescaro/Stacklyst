import { Arrow, Diagram, Text } from '../primitives';

export const title = 'Conversão binário–hexadecimal';
export const alt =
  'Separa-se 1011 0110 em dois grupos de quatro bits, da direita para a esquerda. No grupo alto, 1011 vale 8 + 2 + 1, ou B em hexadecimal. No baixo, 0110 vale 4 + 2, ou 6. Preservando a ordem, obtém-se B6 na base 16.';

const nibbles = [
  { x: 24, name: 'Grupo alto', bits: ['1', '0', '1', '1'], value: '8 + 2 + 1 = 11', hex: 'B' },
  { x: 282, name: 'Grupo baixo', bits: ['0', '1', '1', '0'], value: '4 + 2 = 6', hex: '6' },
];

export default function BinaryToHexConversion() {
  return (
    <Diagram title={title} desc={alt} height={302}>
      <Text x={240} y={21} weight={600}>
        1011 0110₂
      </Text>
      <Text x={240} y={45} muted>
        Quatro bits por dígito hexadecimal
      </Text>
      {nibbles.map(({ x, name, bits, value, hex }) => (
        <g key={name}>
          <Text x={x} y={86} align="start" size={15} weight={600}>
            {name}
          </Text>
          <rect
            x={x}
            y={104}
            width={176}
            height={45}
            rx={8}
            fill="var(--enade-softer)"
            stroke="var(--enade-line)"
            strokeWidth={1.5}
          />
          {bits.map((bit, i) => (
            <g key={i}>
              {i > 0 && (
                <line
                  x1={x + i * 44}
                  y1={104}
                  x2={x + i * 44}
                  y2={149}
                  stroke="var(--enade-line)"
                  strokeWidth={1.5}
                />
              )}
              <Text x={x + 22 + i * 44} y={126} weight={600} size={17}>
                {bit}
              </Text>
              <Text x={x + 22 + i * 44} y={163} muted>
                {2 ** (3 - i)}
              </Text>
            </g>
          ))}
          <Text x={x + 88} y={189} muted>
            {value}
          </Text>
          <Arrow x1={x + 88} y1={204} x2={x + 88} y2={217} />
          <Text x={x + 88} y={234} size={22} weight={600}>
            {hex}
          </Text>
        </g>
      ))}
      <Arrow d="M130 235H198V269H211" kind="none" />
      <Arrow d="M354 235H282V269H269" kind="none" />
      <Text x={240} y={269} size={20} weight={600}>
        B6₁₆
      </Text>
    </Diagram>
  );
}

import { Arrow, Diagram, Text } from '../primitives';

export const title = 'Busca binária com limites inclusivos';
export const alt =
  'Em um vetor ordenado, a busca por 37 começa entre 0 e 9. O meio 4 contém 29, então resta o intervalo 5 a 9. O meio 7 contém 50, então resta 5 a 6. O meio 5 contém 37 e encerra a busca com índice 5.';

const passes = [
  { start: 0, end: 9, pivot: 4, value: 29, label: '37 > 29 · descarta 0 a 4' },
  { start: 5, end: 9, pivot: 7, value: 50, label: '37 < 50 · descarta 7 a 9' },
  { start: 5, end: 6, pivot: 5, value: 37, label: '37 = 37 · retorna 5' },
];

export default function BinarySearchIntervals() {
  return (
    <Diagram title={title} desc={alt} height={338}>
      <Text x={18} y={18} align="start" weight={600}>
        Chave procurada · 37
      </Text>
      <Text x={18} y={58} align="start" muted>
        Índice
      </Text>
      {Array.from({ length: 10 }, (_, index) => (
        <Text key={index} x={126 + index * 34} y={58} muted>
          {index}
        </Text>
      ))}
      {passes.map(({ start, end, pivot, value, label }, row) => {
        const y = 75 + row * 83;
        return (
          <g key={pivot}>
            <Text x={18} y={y + 16} align="start" weight={600}>
              {start} a {end}
            </Text>
            <rect
              x={109}
              y={y}
              width={340}
              height={32}
              rx={8}
              fill="var(--enade-softer)"
              stroke="var(--enade-line)"
              strokeWidth={1.5}
            />
            <rect
              x={109 + start * 34}
              y={y}
              width={(end - start + 1) * 34}
              height={32}
              rx={8}
              fill="var(--enade-soft)"
            />
            <rect
              x={110 + pivot * 34}
              y={y + 1}
              width={32}
              height={30}
              rx={8}
              fill="var(--enade-softer)"
              stroke="var(--color-dd-accent)"
              strokeWidth={1.5}
            />
            <Text x={126 + pivot * 34} y={y + 16} weight={600}>
              {value}
            </Text>
            <Text x={109} y={y + 51} align="start" muted={row !== 2} weight={row === 2 ? 600 : 400}>
              {label}
            </Text>
            {row < 2 && <Arrow x1={434} y1={y + 39} x2={434} y2={y + 74} tone="neutral" />}
          </g>
        );
      })}
    </Diagram>
  );
}

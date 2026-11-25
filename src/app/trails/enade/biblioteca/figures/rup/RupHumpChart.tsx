import { Arrow, Diagram, Text } from '../primitives';

export const details = {
  title: 'Fases, disciplinas e marcos do RUP',
  alt: 'Quatro fases vão da Concepção à Elaboração, Construção e Transição, com marcos LCO, LCA, IOC e PR, respectivamente. Nove disciplinas atravessam as fases. Modelagem de negócio e requisitos têm ênfase inicial. Análise e projeto ganham peso na Elaboração. Implementação e teste concentram-se na Construção. Implantação ganha peso na Transição. Configuração e mudanças, gestão do projeto e ambiente apoiam o processo inteiro. As curvas indicam ênfase qualitativa.',
};

const phases = [
  { label: 'Concepção', deadline: 'LCO', end: 211 },
  { label: 'Elaboração', deadline: 'LCA', end: 295 },
  { label: 'Construção', deadline: 'IOC', end: 388 },
  { label: 'Transição', deadline: 'PR', end: 474 },
];

const tracks = [
  {
    label: ['Modelagem de', 'negócio'],
    curve: 'C156 0 159 -29 187 -29 S221 -11 250 -9 S300 -7 474 -3',
  },
  {
    label: ['Requisitos'],
    curve: 'C171 0 172 -19 202 -25 S245 -27 268 -19 S303 -7 338 -7 S412 -6 474 -3',
  },
  {
    label: ['Análise e projeto'],
    curve: 'C181 -2 203 -4 223 -19 S262 -30 282 -24 S322 -13 350 -12 S425 -6 474 -3',
  },
  {
    label: ['Implementação'],
    curve: 'C178 -1 215 -4 250 -9 S309 -31 352 -27 S407 -15 430 -12 S457 -9 474 -8',
  },
  {
    label: ['Teste'],
    curve: 'C176 0 219 -4 250 -8 S302 -18 335 -23 S388 -21 413 -19 S453 -12 474 -7',
  },
  {
    label: ['Implantação'],
    curve: 'C181 0 222 -3 262 -3 S341 -4 373 -8 S421 -28 447 -28 S468 -18 474 -13',
  },
  {
    label: ['Configuração', 'e mudanças'],
    curve: 'C171 -1 190 -6 218 -7 S273 -9 303 -11 S344 -18 377 -17 S451 -14 474 -12',
  },
  {
    label: ['Gestão do projeto'],
    curve:
      'C158 -2 159 -13 185 -13 S228 -10 247 -10 S292 -14 328 -14 S374 -12 401 -13 S446 -11 474 -10',
  },
  {
    label: ['Ambiente'],
    curve: 'C167 -2 177 -21 198 -18 S236 -10 263 -9 S300 -6 348 -6 S429 -6 474 -4',
  },
];

export function RupHumpChart() {
  return (
    <Diagram title={details.title} desc={details.alt} height={617}>
      <Text x={12} y={28} align="start" weight={600}>
        Disciplinas
      </Text>
      {phases.map(({ label, end, deadline }, index) => {
        const start = phases[index - 1]?.end ?? 132;
        return (
          <g key={label}>
            <rect
              x={start}
              y={9}
              width={end - start}
              height={486}
              fill={index % 2 ? 'var(--enade-softer)' : 'var(--enade-soft)'}
            />
            <Text x={(start + end) / 2} y={28} size={13} weight={600}>
              {label}
            </Text>
            <path d={`M${end} 9 V495`} stroke="var(--enade-line)" strokeDasharray="4 4" />
            <path d={`M${end - 4} 495 l4 4 -4 4 -4 -4Z`} fill="var(--color-dd-accent)" />
            <Text x={end - 7} y={516} align="end" size={13} weight={600}>
              {deadline}
            </Text>
          </g>
        );
      })}
      {tracks.map(({ label, curve }, index) => {
        const y = 76 + index * 47 + (index >= 6 ? 25 : 0);
        return (
          <g key={label[0]}>
            <g transform={`translate(0 ${y})`}>
              <path d="M132 0 H474" stroke="var(--enade-line)" />
              <path
                d={`M132 0 ${curve} L474 0 Z`}
                fill="var(--color-dd-accent)"
                fillOpacity={0.16}
              />
              <path d={`M132 0 ${curve}`} fill="none" stroke="var(--color-dd-accent)" />
            </g>
            {label.map((line, lineIndex) => (
              <Text
                key={line}
                x={12}
                y={y - 13 + lineIndex * 15 - (label.length - 1) * 7}
                size={13}
                align="start"
              >
                {line}
              </Text>
            ))}
          </g>
        );
      })}
      <Text x={12} y={345} size={13} weight={600} align="start">
        Disciplinas de apoio
      </Text>
      <Arrow x1={132} y1={499} x2={474} y2={499} kind="none" tone="neutral" />
      <Text x={12} y={516} align="start" muted>
        Marcos
      </Text>
      <Text x={12} y={550} align="start" size={13} muted>
        LCO: objetivos do ciclo de vida
      </Text>
      <Text x={252} y={550} align="start" size={13} muted>
        LCA: arquitetura do ciclo de vida
      </Text>
      <Text x={12} y={572} align="start" size={13} muted>
        IOC: capacidade operacional inicial
      </Text>
      <Text x={252} y={572} align="start" size={13} muted>
        PR: liberação do produto
      </Text>
      <Text x={240} y={602} size={13} muted>
        A altura das curvas indica ênfase qualitativa do trabalho.
      </Text>
    </Diagram>
  );
}

'use client';
import { useState, type KeyboardEvent } from 'react';
import styles from './widgets.module.css';

const ITERATIONS = ['I1', 'E1', 'E2', 'C1', 'C2', 'C3', 'T1', 'T2'];
const PHASES = [
  {
    name: 'Concepção',
    span: [0, 1],
    milestone: 'LCO — Objetivos do Ciclo de Vida',
    goal: 'Entender o problema e decidir se vale a pena fazer o projeto: escopo, visão, casos de uso principais, riscos críticos, estimativa inicial de custo e prazo.',
  },
  {
    name: 'Elaboração',
    span: [1, 3],
    milestone: 'LCA — Arquitetura do Ciclo de Vida',
    goal: 'Estabilizar a arquitetura com um protótipo executável, detalhar a maior parte dos requisitos (≈80% dos casos de uso) e eliminar os maiores riscos técnicos.',
  },
  {
    name: 'Construção',
    span: [3, 6],
    milestone: 'IOC — Capacidade Operacional Inicial',
    goal: 'Construir o produto em iterações incrementais, integrar e testar continuamente até ter uma versão beta utilizável pelos usuários.',
  },
  {
    name: 'Transição',
    span: [6, 8],
    milestone: 'PR — Liberação do Produto',
    goal: 'Entregar o software ao usuário: testes beta, correções, treinamento, migração de dados, implantação em produção e aceite.',
  },
];

// Relative effort per iteration (0–1), after the "hump chart" published by Kruchten
// for the RUP. Illustrative proportions, not measured values.
const DISCIPLINES = [
  {
    name: 'Modelagem de negócios',
    kind: 'Engenharia',
    curve: [0.9, 0.7, 0.4, 0.15, 0.1, 0.05, 0.05, 0.05],
    about:
      'Entender a organização onde o sistema vai funcionar: processos, regras, problemas e oportunidades.',
    when: 'Forte na Concepção e no início da Elaboração; quase some depois.',
  },
  {
    name: 'Requisitos',
    kind: 'Engenharia',
    curve: [0.6, 1, 0.8, 0.35, 0.2, 0.1, 0.1, 0.05],
    about:
      'Elicitar, organizar e documentar o que o sistema deve fazer (casos de uso) e suas restrições.',
    when: 'Pico na Elaboração. A maior parte da análise de requisitos acontece ali, não só na Concepção — pegadinha clássica (Enade 2008).',
  },
  {
    name: 'Análise e design',
    kind: 'Engenharia',
    curve: [0.2, 0.7, 1, 0.6, 0.35, 0.2, 0.1, 0.05],
    about: 'Transformar requisitos em um projeto: arquitetura, classes, componentes e interfaces.',
    when: 'Pico no fim da Elaboração (a arquitetura é a meta da fase) e continua na Construção.',
  },
  {
    name: 'Implementação',
    kind: 'Engenharia',
    curve: [0.05, 0.3, 0.5, 1, 1, 0.85, 0.4, 0.2],
    about: 'Codificar componentes, fazer testes de unidade e integrar o código.',
    when: 'Domina a Construção, mas já existe na Elaboração (protótipo arquitetural executável).',
  },
  {
    name: 'Teste',
    kind: 'Engenharia',
    curve: [0.1, 0.3, 0.45, 0.7, 0.8, 0.9, 0.6, 0.3],
    about: 'Verificar a integração, a qualidade e se os requisitos foram atendidos.',
    when: 'Presente em todas as fases e crescente ao longo da Construção.',
  },
  {
    name: 'Implantação',
    kind: 'Engenharia',
    curve: [0, 0, 0.05, 0.1, 0.2, 0.4, 1, 0.8],
    about: 'Empacotar, distribuir, instalar, treinar usuários e dar suporte à entrada em produção.',
    when: 'Pico na Transição; começa a ser planejada no fim da Construção.',
  },
  {
    name: 'Gerência de configuração e mudança',
    kind: 'Suporte',
    curve: [0.15, 0.25, 0.3, 0.45, 0.55, 0.6, 0.55, 0.4],
    about: 'Controlar versões, baselines e solicitações de mudança dos artefatos.',
    when: 'Contínua; cresce à medida que há mais artefatos e versões (Construção/Transição).',
  },
  {
    name: 'Gerência de projeto',
    kind: 'Suporte',
    curve: [0.6, 0.5, 0.5, 0.45, 0.45, 0.45, 0.5, 0.55],
    about: 'Planejar fases e iterações, gerenciar riscos, monitorar progresso e custos.',
    when: 'Presente do início ao fim, com picos no planejamento inicial e no encerramento.',
  },
  {
    name: 'Ambiente',
    kind: 'Suporte',
    curve: [0.7, 0.6, 0.35, 0.25, 0.2, 0.2, 0.2, 0.15],
    about: 'Preparar processo, ferramentas e padrões que a equipe vai usar.',
    when: 'Forte no começo (montar o ambiente) e baixa, mas contínua, depois.',
  },
];

const W = 760;
const LABEL = 196;
const ROW = 34;
const TOP = 44;
const colW = (W - LABEL) / ITERATIONS.length;

function activateWithKeyboard(event: KeyboardEvent, activate: () => void) {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  event.preventDefault();
  activate();
}

function hump(curve: number[], row: number) {
  const mid = TOP + row * ROW + ROW / 2;
  const points: [number, number][] = [
    [LABEL, 0],
    ...curve.map((v, i): [number, number] => [
      LABEL + colW * i + colW / 2,
      Math.max(0.6, v * (ROW / 2 - 2)),
    ]),
    [W, 0],
  ];
  const segment = (from: [number, number], to: [number, number], sign: number) => {
    const cx = (from[0] + to[0]) / 2;
    return `C${cx},${mid - sign * from[1]} ${cx},${mid - sign * to[1]} ${to[0]},${mid - sign * to[1]}`;
  };
  const top = points.slice(1).map((point, i) => segment(points[i], point, 1));
  const reversed = [...points].reverse();
  const bottom = reversed.slice(1).map((point, i) => segment(reversed[i], point, -1));
  return `M${LABEL},${mid} ${top.join(' ')} ${bottom.join(' ')} Z`;
}

export function RupWhale({ props }: { props: Record<string, string> }) {
  void props;
  const [discipline, setDiscipline] = useState<number | null>(1);
  const [phase, setPhase] = useState<number | null>(null);
  const height = TOP + DISCIPLINES.length * ROW + 10;
  const selected = discipline !== null ? DISCIPLINES[discipline] : null;
  const selectedPhase = phase !== null ? PHASES[phase] : null;
  return (
    <div>
      <div className={styles.title}>
        <strong>Gráfico de baleias do RUP</strong>
        <span>Selecione uma disciplina ou fase</span>
      </div>
      <div className={styles.scroll}>
        <svg
          viewBox={`0 0 ${W} ${height}`}
          className={styles.svg}
          style={{ minWidth: 620 }}
          role="group"
          aria-label="Intensidade de cada disciplina do RUP ao longo das fases e iterações"
        >
          {PHASES.map((p, i) => {
            const x = LABEL + p.span[0] * colW;
            const width = (p.span[1] - p.span[0]) * colW;
            return (
              <g key={p.name}>
                <rect
                  x={x}
                  y={0}
                  width={width}
                  height={height}
                  fill={
                    phase === i
                      ? 'color-mix(in srgb, var(--color-dd-accent) 8%, transparent)'
                      : 'transparent'
                  }
                  stroke="var(--enade-line)"
                />
                <text
                  x={x + width / 2}
                  y={16}
                  textAnchor="middle"
                  className={styles.graphControl}
                  style={{ fontWeight: 650, cursor: 'pointer' }}
                  tabIndex={0}
                  role="button"
                  aria-pressed={phase === i}
                  onClick={() => setPhase(phase === i ? null : i)}
                  onKeyDown={(e) => activateWithKeyboard(e, () => setPhase(phase === i ? null : i))}
                >
                  {p.name}
                </text>
              </g>
            );
          })}
          {ITERATIONS.map((it, i) => (
            <text
              key={it}
              x={LABEL + colW * i + colW / 2}
              y={34}
              textAnchor="middle"
              className={styles.muted}
              style={{ fontSize: 10.5 }}
            >
              {it}
            </text>
          ))}
          {DISCIPLINES.map((d, row) => {
            const active = discipline === row;
            return (
              <g
                key={d.name}
                tabIndex={0}
                role="button"
                aria-pressed={active}
                aria-label={`${d.name}: ${d.when}`}
                className={styles.graphControl}
                onClick={() => setDiscipline(active ? null : row)}
                onKeyDown={(e) => activateWithKeyboard(e, () => setDiscipline(active ? null : row))}
              >
                <rect x={0} y={TOP + row * ROW} width={W} height={ROW} fill="transparent" />
                <line
                  x1={0}
                  x2={W}
                  y1={TOP + (row + 1) * ROW}
                  y2={TOP + (row + 1) * ROW}
                  stroke="var(--enade-line)"
                />
                <text
                  x={4}
                  y={TOP + row * ROW + ROW / 2 + 4}
                  style={{ fontWeight: active ? 650 : 400, fontSize: 11.5 }}
                >
                  {d.name}
                </text>
                <path
                  d={hump(d.curve, row)}
                  fill="var(--color-dd-accent)"
                  opacity={discipline === null || active ? 0.85 : 0.28}
                />
              </g>
            );
          })}
          <text x={4} y={TOP - 4} className={styles.muted} style={{ fontSize: 10.5 }}>
            Disciplinas
          </text>
        </svg>
      </div>
      <div className={styles.grid2} style={{ marginTop: 12 }} aria-live="polite">
        {selected ? (
          <div className={styles.detail}>
            <h4>
              {selected.name}{' '}
              <span className={styles.hint}>· disciplina de {selected.kind.toLowerCase()}</span>
            </h4>
            <p>{selected.about}</p>
            <p style={{ marginTop: 6 }}>
              <strong>Quando é mais intensa:</strong> {selected.when}
            </p>
          </div>
        ) : (
          <p className={styles.hint}>
            Selecione uma disciplina para ver o que ela faz e quando pesa mais.
          </p>
        )}
        {selectedPhase ? (
          <div className={styles.detail}>
            <h4>
              {selectedPhase.name}{' '}
              <span className={styles.hint}>· marco {selectedPhase.milestone}</span>
            </h4>
            <p>{selectedPhase.goal}</p>
            <ul>
              {DISCIPLINES.map((d) => ({
                d,
                peak: Math.max(...d.curve.slice(selectedPhase.span[0], selectedPhase.span[1])),
              }))
                .sort((a, b) => b.peak - a.peak)
                .slice(0, 3)
                .map(({ d }) => (
                  <li key={d.name}>{d.name}</li>
                ))}
            </ul>
          </div>
        ) : (
          <p className={styles.hint}>
            Selecione uma fase (no topo) para ver o objetivo, o marco e as disciplinas com mais
            esforço. Repare: todas as disciplinas aparecem em todas as fases, com intensidades
            diferentes.
          </p>
        )}
      </div>
      <p className={styles.hint} style={{ marginTop: 8 }}>
        Representação didática das proporções do gráfico de Kruchten; a forma real varia de projeto
        para projeto.
      </p>
    </div>
  );
}

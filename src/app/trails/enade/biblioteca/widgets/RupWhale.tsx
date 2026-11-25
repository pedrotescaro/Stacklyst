'use client';
import { useId, useState } from 'react';
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
    goal: 'Validar uma arquitetura executável, detalhar os requisitos relevantes e enfrentar os riscos que podem inviabilizar a construção.',
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
    when: 'Começa na Concepção e ganha peso na Elaboração. No ENADE, essa distribuição ajuda a identificar onde os requisitos são detalhados.',
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

const W = 540;
const LABEL = 144;
const ROW = 34;
const TOP = 48;
const colW = (W - LABEL) / ITERATIONS.length;

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

export function RupWhale() {
  const description = useId();
  const [discipline, setDiscipline] = useState('1');
  const [phase, setPhase] = useState('');
  const height = TOP + DISCIPLINES.length * ROW + 10;
  const selected = discipline === '' ? null : DISCIPLINES[Number(discipline)];
  const selectedPhase = phase === '' ? null : PHASES[Number(phase)];
  return (
    <div>
      <div className={styles.title}>
        <strong>Gráfico de baleias do RUP</strong>
      </div>
      <div
        className={styles.modelScroll}
        tabIndex={0}
        role="region"
        aria-label="Gráfico rolável do RUP"
      >
        <svg
          viewBox={`0 0 ${W} ${height}`}
          className={`${styles.svg} ${styles.whale}`}
          role="img"
          aria-label="Intensidade de cada disciplina do RUP ao longo das fases e iterações"
          aria-describedby={description}
        >
          <desc id={description}>
            As colunas avançam de Concepção a Elaboração, Construção e Transição. Cada linha mostra
            uma das nove disciplinas. A espessura indica intensidade de trabalho ilustrativa.
            Modelagem de negócios e ambiente aparecem mais cedo. Requisitos e análise ganham peso na
            Elaboração. Implementação e teste sobressaem na Construção e implantação na Transição.
            Configuração e mudanças e gerência de projeto atravessam as fases.
          </desc>
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
                    selectedPhase === p
                      ? 'color-mix(in srgb, var(--color-dd-accent) 8%, transparent)'
                      : 'transparent'
                  }
                  stroke="var(--enade-line)"
                />
                <text
                  x={x + width / 2}
                  y={16}
                  textAnchor="middle"
                  textLength={i === 0 ? 42 : undefined}
                  lengthAdjust={i === 0 ? 'spacingAndGlyphs' : undefined}
                  style={{ fontWeight: 650 }}
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
            const active = selected === d;
            const label =
              d.name === 'Gerência de configuração e mudança'
                ? ['Configuração', 'e mudanças']
                : [d.name];
            return (
              <g key={d.name}>
                <line
                  x1={0}
                  x2={W}
                  y1={TOP + (row + 1) * ROW}
                  y2={TOP + (row + 1) * ROW}
                  stroke="var(--enade-line)"
                />
                <text
                  x={4}
                  y={TOP + row * ROW + (label.length === 1 ? 21 : 14)}
                  style={{ fontWeight: active ? 650 : 400, fontSize: 11.5 }}
                >
                  {label.map((line, i) => (
                    <tspan key={line} x={4} dy={i ? 13 : 0}>
                      {line}
                    </tspan>
                  ))}
                </text>
                <path
                  d={hump(d.curve, row)}
                  fill="var(--color-dd-accent)"
                  opacity={!selected || active ? 0.9 : 0.45}
                />
              </g>
            );
          })}
          <text x={4} y={TOP - 4} className={styles.muted} style={{ fontSize: 10.5 }}>
            Disciplinas
          </text>
        </svg>
      </div>
      <div className={styles.modelControls}>
        <label>
          Fase
          <select
            className={styles.input}
            value={phase}
            onChange={(event) => setPhase(event.target.value)}
          >
            <option value="">Todas as fases</option>
            {PHASES.map((p, i) => (
              <option key={p.name} value={i}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Disciplina
          <select
            className={styles.input}
            value={discipline}
            onChange={(event) => setDiscipline(event.target.value)}
          >
            <option value="">Todas as disciplinas</option>
            {DISCIPLINES.map((d, i) => (
              <option key={d.name} value={i}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className={styles.grid2} aria-live="polite">
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
            Selecione uma fase para ver seu objetivo, seu marco e as disciplinas de maior esforço no
            cenário ilustrado.
          </p>
        )}
      </div>
      <p className={styles.hint} style={{ marginTop: 8 }}>
        As espessuras ilustram uma distribuição possível de esforço. Cada projeto adapta as
        iterações e a intensidade das disciplinas.
      </p>
    </div>
  );
}

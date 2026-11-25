import { useId } from 'react';
import styles from './widgets.module.css';

const LEVELS = [
  { x: 14, y: 35, definition: ['Modelar', 'requisitos'], test: ['Teste de', 'aceitação'] },
  { x: 42, y: 93, definition: ['Projetar', 'arquitetura'], test: ['Teste de', 'sistema'] },
  { x: 70, y: 151, definition: ['Projetar', 'componentes'], test: ['Teste de', 'integração'] },
  { x: 98, y: 209, definition: ['Gerar', 'código'], test: ['Teste de', 'unidade'] },
];

const BLOCK_WIDTH = 116;
const BLOCK_HEIGHT = 40;
const WIDTH = 480;
const SEQUENCE = [
  'M72 75L100 92',
  'M100 133L128 150',
  'M128 191L156 208',
  'M156 249L211 274',
  'M269 275L324 250',
  'M324 209L352 192',
  'M352 151L380 134',
  'M380 93L408 76',
];

export function VModel() {
  const description = useId();
  const sequenceArrow = `${description}-sequence`;
  const verificationArrow = `${description}-verification`;

  return (
    <svg
      className={styles.modelSvg}
      viewBox="0 0 480 326"
      role="img"
      aria-label="Modelo V de desenvolvimento e testes"
      aria-describedby={description}
    >
      <desc id={description}>
        A sequência desce da modelagem de requisitos pelo projeto de arquitetura e de componentes
        até a geração de código. A partir do executável, sobe pelos testes de unidade, integração,
        sistema e aceitação. As setas tracejadas ligam os testes aos trabalhos que verificam:
        unidade ao código, integração ao projeto de componentes, sistema à arquitetura e aceitação
        aos requisitos.
      </desc>
      <defs>
        <marker
          id={sequenceArrow}
          viewBox="0 0 7 7"
          markerWidth="10"
          markerHeight="10"
          markerUnits="userSpaceOnUse"
          refX="6"
          refY="3.5"
          orient="auto"
        >
          <path d="M0 0L7 3.5L0 7Z" className={styles.modelPoint} />
        </marker>
        <marker
          id={verificationArrow}
          viewBox="0 0 7 7"
          markerWidth="7"
          markerHeight="7"
          refX="6"
          refY="3.5"
          orient="auto"
        >
          <path d="M0 0L7 3.5L0 7Z" />
        </marker>
      </defs>

      <g className={styles.modelHeading}>
        <text x="14" y="19">
          Definição e projeto
        </text>
        <text x="466" y="19" textAnchor="end">
          Verificação e validação
        </text>
      </g>

      <g className={styles.modelCurve} markerEnd={`url(#${sequenceArrow})`}>
        {SEQUENCE.map((line) => (
          <path key={line} d={line} />
        ))}
      </g>
      <g
        className={styles.modelAxis}
        strokeDasharray="4 4"
        markerEnd={`url(#${verificationArrow})`}
      >
        {LEVELS.map(({ x, y }) => (
          <path key={x} d={`M${WIDTH - x - BLOCK_WIDTH} ${y + 20}H${x + BLOCK_WIDTH + 1}`} />
        ))}
      </g>

      {LEVELS.map(({ x, y, definition, test }) => (
        <g key={x}>
          <rect
            x={x}
            y={y}
            width={BLOCK_WIDTH}
            height={BLOCK_HEIGHT}
            rx="5"
            className={styles.modelArtifact}
          />
          <rect
            x={WIDTH - x - BLOCK_WIDTH}
            y={y}
            width={BLOCK_WIDTH}
            height={BLOCK_HEIGHT}
            rx="5"
            className={styles.modelArtifact}
          />
          <g textAnchor="middle" className={styles.modelNote}>
            <text x={x + BLOCK_WIDTH / 2} y={y + 16}>
              {definition[0]}
              <tspan x={x + BLOCK_WIDTH / 2} dy="17">
                {definition[1]}
              </tspan>
            </text>
            <text x={WIDTH - x - BLOCK_WIDTH / 2} y={y + 16}>
              {test[0]}
              <tspan x={WIDTH - x - BLOCK_WIDTH / 2} dy="17">
                {test[1]}
              </tspan>
            </text>
          </g>
        </g>
      ))}
      <rect x="154" y="275" width="172" height="37" rx="5" className={styles.modelArtifact} />
      <text x="240" y="298" textAnchor="middle" className={styles.modelHeading}>
        Software executável
      </text>
    </svg>
  );
}

const ACTIVITIES = [
  ['Comunicar', 'e planejar'],
  ['Modelar'],
  ['Construir', 'e testar'],
  ['Entregar'],
];

const INCREMENTS = ['Núcleo', 'Versão 2', 'Versão 3'];

export function IncrementalTimeline() {
  const description = useId();

  return (
    <svg
      className={styles.modelSvg}
      viewBox="0 0 480 241"
      role="img"
      aria-label="Incrementos escalonados ao longo do projeto"
      aria-describedby={description}
    >
      <desc id={description}>
        Três faixas têm a mesma escala de tempo. Cada incremento comunica e planeja, modela,
        constrói e testa, e entrega uma versão utilizável. As duas faixas seguintes começam antes da
        entrega da anterior. A primeira versão contém o núcleo, e as seguintes o ampliam.
      </desc>

      {INCREMENTS.map((release, index) => {
        const x = 34 + index * 42;
        const y = 14 + index * 57;

        return (
          <g key={release}>
            <text x={x - 10} y={y + 27} textAnchor="end" className={styles.modelHeading}>
              I{index + 1}
            </text>
            <path d={`M${x} ${y + 22}h343`} className={styles.modelAxis} />
            {ACTIVITIES.map(([first, second], stage) => {
              const start = x + stage * 88;
              const center = start + 40;

              return (
                <g key={first}>
                  {stage > 0 && (
                    <path d={`M${start - 5} ${y + 19}l4 3-4 3`} className={styles.modelAxis} />
                  )}
                  <rect
                    x={start}
                    y={y}
                    width="80"
                    height="44"
                    rx="5"
                    className={styles.modelArtifact}
                  />
                  <text
                    x={center}
                    y={y + (second || stage === 3 ? 17 : 27)}
                    className={styles.modelNote}
                    textAnchor="middle"
                  >
                    {first}
                    <tspan x={center} dy="17">
                      {stage === 3 ? release : second}
                    </tspan>
                  </text>
                </g>
              );
            })}
            <path d={`M${x + 344} ${y + 44}V203`} className={styles.modelGuide} />
            <circle cx={x + 344} cy="203" r="4" className={styles.modelPoint} />
          </g>
        );
      })}

      <path d="M14 203H474 m-7-4 7 4-7 4" className={styles.modelAxis} />
      <text x="244" y="226" textAnchor="middle" className={styles.modelHeading}>
        Tempo do projeto
      </text>
    </svg>
  );
}

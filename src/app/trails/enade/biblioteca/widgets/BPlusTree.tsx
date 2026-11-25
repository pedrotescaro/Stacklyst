import { useId } from 'react';
import styles from './widgets.module.css';

const leaves = [
  { left: 14, keys: [10, 20], range: 'k ≤ 20' },
  { left: 160, keys: [30, 40], range: '20 < k ≤ 40' },
  { left: 306, keys: [50, 60], range: 'k > 40' },
];

export function BPlusTree() {
  const description = useId();

  return (
    <svg
      className={styles.modelSvg}
      viewBox="0 0 420 187"
      role="img"
      aria-label="Árvore B+ e varredura das folhas"
      aria-describedby={description}
    >
      <desc id={description}>
        A raiz contém os separadores 20 e 40. As setas sólidas descem para três folhas no mesmo
        nível. A primeira guarda as chaves 10 e 20, a segunda, 30 e 40, e a terceira, 50 e 60. As
        setas tracejadas ligam cada folha à seguinte para percorrer o intervalo em ordem.
      </desc>
      <text x="210" y="18" textAnchor="middle" className={styles.modelNote}>
        Separadores
      </text>
      <rect x="149" y="30" width="122" height="38" rx="5" className={styles.modelArtifact} />
      <path d="M210 30v38" className={styles.modelAxis} />
      <text x="180" y="54" textAnchor="middle" className={styles.modelHeading}>
        20
      </text>
      <text x="240" y="54" textAnchor="middle" className={styles.modelHeading}>
        40
      </text>
      <path
        d="M161 70 64 111m4-9-4 9 10 1 M210 70v41m-5-6 5 6 5-6 M259 70l97 41m-10 1 10-1-4-9"
        className={styles.modelCurve}
      />
      <path d="M117 136h39 M263 136h39" className={styles.modelComparison} />
      <path d="m150 131 6 5-6 5 m146-10 6 5-6 5" className={styles.modelAxis} />
      {leaves.map(({ left, keys, range }) => (
        <g key={range} textAnchor="middle">
          <rect x={left} y="117" width="100" height="38" rx="5" className={styles.modelArtifact} />
          <path d={`M${left + 50} 117v38`} className={styles.modelAxis} />
          {keys.map((key, index) => (
            <text key={key} x={left + 25 + 50 * index} y="141" className={styles.modelHeading}>
              {key}
            </text>
          ))}
          <text x={left + 50} y="176" className={styles.modelNote}>
            {range}
          </text>
        </g>
      ))}
    </svg>
  );
}

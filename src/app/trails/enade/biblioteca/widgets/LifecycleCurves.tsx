import { useId } from 'react';
import styles from './widgets.module.css';

export function ChangeCostCurve() {
  const description = useId();

  return (
    <svg
      className={styles.modelSvg}
      viewBox="0 0 460 295"
      role="img"
      aria-label="Custo relativo de corrigir um erro ao longo do projeto"
      aria-describedby={description}
    >
      <desc id={description}>
        O eixo horizontal vai de requisitos a operação. O eixo vertical representa o custo relativo
        da correção em escala logarítmica. As duas linhas ilustram custos crescentes, com tendência
        mais acentuada nos projetos maiores e mais suave nos menores.
      </desc>
      <text x="24" y="22" className={styles.modelHeading}>
        Custo relativo da correção
      </text>
      <text x="24" y="42" className={styles.modelNote}>
        Escala logarítmica
      </text>
      <path className={styles.modelAxis} d="M24 58V204H435 m-415-140 4-6 4 6 m401 136 6 4-6 4" />
      <path className={styles.modelGuide} d="M24 87H435 M24 126H435 M24 165H435" />
      <path className={styles.modelCurve} d="M67 188 C156 169 223 144 280 113 S366 66 408 55" />
      <path
        className={styles.modelComparison}
        d="M67 177 C155 173 238 160 306 146 S373 131 408 125"
      />
      <text x="405" y="48" textAnchor="end" className={styles.modelHeading}>
        Projetos maiores
      </text>
      <text x="405" y="169" textAnchor="end" className={styles.modelHeading}>
        Projetos menores
      </text>
      <path className={styles.modelAxis} d="M61 204v5 m69-5v5 m69-5v5 m69-5v5 m69-5v5 m69-5v5" />
      <g textAnchor="middle" className={styles.modelNote}>
        <text x="61" y="228">
          Requisitos
        </text>
        <text x="130" y="228">
          Projeto
        </text>
        <text x="199" y="228">
          Código
        </text>
        <text x="268" y="228">
          Testes
        </text>
        <text x="337" y="228">
          Aceite
        </text>
        <text x="406" y="228">
          Operação
        </text>
      </g>
      <text x="230" y="262" textAnchor="middle" className={styles.modelHeading}>
        Etapa em que o erro foi corrigido
      </text>
      <text x="230" y="283" textAnchor="middle" className={styles.modelNote}>
        Tendências qualitativas
      </text>
    </svg>
  );
}

export function BathtubCurve() {
  const description = useId();

  return (
    <svg
      className={styles.modelSvg}
      viewBox="0 0 460 256"
      role="img"
      aria-label="Curva da banheira de falhas de hardware"
      aria-describedby={description}
    >
      <desc id={description}>
        A taxa de falhas cai no período inicial, permanece aproximadamente constante durante a vida
        útil e sobe com o desgaste físico dos componentes. O eixo horizontal indica o tempo.
      </desc>
      <text x="24" y="24" className={styles.modelHeading}>
        Taxa de falhas
      </text>
      <path className={styles.modelAxis} d="M24 43V181H435 m-415-132 4-6 4 6 m401 128 6 4-6 4" />
      <path className={styles.modelGuide} d="M153 44V181 M310 44V181" />
      <path
        className={styles.modelCurve}
        d="M38 59 C53 116 91 151 153 153 C207 155 259 153 310 153 C364 153 394 114 420 54"
      />
      <g textAnchor="middle" className={styles.modelHeading}>
        <text x="87" y="207">
          Falhas iniciais
        </text>
        <text x="230" y="207">
          Vida útil
        </text>
        <text x="377" y="207">
          Desgaste
        </text>
        <text x="230" y="239">
          Tempo em operação
        </text>
      </g>
    </svg>
  );
}

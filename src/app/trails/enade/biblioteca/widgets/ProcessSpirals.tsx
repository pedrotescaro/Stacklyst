import { useId } from 'react';
import styles from './widgets.module.css';

export function BoehmSpiral() {
  const description = useId();

  return (
    <svg
      className={styles.modelSvg}
      viewBox="0 0 460 352"
      role="img"
      aria-label="Espiral de desenvolvimento de Boehm"
      aria-describedby={description}
    >
      <desc id={description}>
        Cada volta avança em sentido horário por quatro quadrantes. Primeiro se definem objetivos,
        alternativas e restrições. Em seguida se avaliam alternativas e riscos e se desenvolve e
        verifica a próxima versão. A volta termina com o planejamento, a revisão e o compromisso
        para continuar. A distância ao centro representa o custo acumulado.
      </desc>
      <path className={styles.modelGuide} d="M22 176H438 M230 63V288" />
      <path className={styles.modelAxis} d="m226 69 4-6 4 6" />
      <text x="230" y="57" textAnchor="middle" className={styles.modelNote}>
        Custo acumulado
      </text>
      <g className={styles.modelHeading}>
        <text x="18" y="20">
          <tspan x="18">1. Definir objetivos,</tspan>
          <tspan x="18" dy="18">
            alternativas e restrições
          </tspan>
        </text>
        <text x="442" y="20" textAnchor="end">
          <tspan x="442">2. Avaliar alternativas</tspan>
          <tspan x="442" dy="18">
            e reduzir riscos
          </tspan>
        </text>
        <text x="442" y="319" textAnchor="end">
          <tspan x="442">3. Desenvolver e</tspan>
          <tspan x="442" dy="18">
            verificar a versão
          </tspan>
        </text>
        <text x="18" y="319">
          <tspan x="18">4. Planejar a</tspan>
          <tspan x="18" dy="18">
            próxima volta
          </tspan>
        </text>
      </g>
      <path
        className={styles.modelCurve}
        d="M222 176 C222 162 237 155 247 166 C264 185 239 209 219 202
           C183 191 188 145 219 132 C255 116 298 145 298 180
           C298 227 249 254 206 240 C142 219 139 150 174 110
           C216 63 292 70 331 111 C376 157 362 226 313 258
           C253 297 175 281 136 230 C122 212 115 192 114 176"
      />
      <path className={styles.modelCurve} d="m256 120 7 7-10 2 m89 104-10 5 3-11" />
      <circle cx="222" cy="176" r="3.5" className={styles.modelPoint} />
      <circle cx="114" cy="176" r="5" className={styles.modelPoint} />
      <text x="14" y="154" className={styles.modelNote}>
        Revisão e
        <tspan x="14" dy="15">
          compromisso
        </tspan>
      </text>
      <text x="230" y="305" textAnchor="middle" className={styles.modelNote}>
        Avanço em sentido horário
      </text>
    </svg>
  );
}

export function RequirementsSpiral() {
  const description = useId();

  return (
    <svg
      className={styles.modelSvg}
      viewBox="0 0 460 366"
      role="img"
      aria-label="Espiral da engenharia de requisitos de Sommerville"
      aria-describedby={description}
    >
      <desc id={description}>
        A espiral parte do centro e repete elicitação, especificação e validação. As voltas da
        viabilidade e dos requisitos de negócio, dos requisitos de usuário e dos requisitos de
        sistema podem incluir protótipos e revisões. A seta de saída leva ao documento de
        requisitos.
      </desc>
      <path className={styles.modelGuide} d="M230 169 104 73 M230 169 356 73 M230 169V272" />
      <text x="230" y="25" textAnchor="middle" className={styles.modelHeading}>
        Especificação
      </text>
      <text x="15" y="151" className={styles.modelHeading}>
        Elicitação
      </text>
      <text x="15" y="171" className={styles.modelNote}>
        Usuário e sistema
      </text>
      <text x="445" y="151" textAnchor="end" className={styles.modelHeading}>
        Validação
      </text>
      <text x="445" y="171" textAnchor="end" className={styles.modelNote}>
        <tspan x="445">Viabilidade</tspan>
        <tspan x="445" dy="18">
          Protótipos
        </tspan>
        <tspan x="445" dy="18">
          Revisões
        </tspan>
      </text>
      <path
        className={styles.modelCurve}
        d="M225 169 C225 153 246 149 256 164 C267 181 249 201 226 198
           C196 195 181 165 195 140 C214 106 262 111 287 139
           C316 173 290 218 251 230 C205 243 161 219 147 181
           C121 110 185 56 252 65 C314 72 351 122 345 177
           C339 223 311 256 293 298"
      />
      <path
        className={styles.modelCurve}
        d="m278 128 9 11-12-4 m49 105-8 9 2-12 m-14 57-11 4-1-11"
      />
      <circle cx="225" cy="169" r="3.5" className={styles.modelPoint} />
      <text x="18" y="257" className={styles.modelNote}>
        <tspan x="18" className={styles.modelHeading}>
          Do centro para fora
        </tspan>
        <tspan x="18" dy="21">
          1. Negócio e viabilidade
        </tspan>
        <tspan x="18" dy="19">
          2. Requisitos de usuário
        </tspan>
        <tspan x="18" dy="19">
          3. Requisitos de sistema
        </tspan>
      </text>
      <rect x="218" y="300" width="224" height="45" rx="7" className={styles.modelArtifact} />
      <text x="330" y="328" textAnchor="middle" className={styles.modelHeading}>
        Documento de requisitos
      </text>
    </svg>
  );
}

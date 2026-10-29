import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import styles from './JourneyOverview.module.css';

export function JourneyOverview({
  title,
  description,
  completedLessons,
  totalLessons,
  completedExercises,
  totalExercises,
  units,
  pathId,
  action,
}: {
  title: string;
  description: string;
  completedLessons: number;
  totalLessons: number;
  completedExercises: number;
  totalExercises: number;
  units: string[];
  pathId: string;
  action: ReactNode;
}) {
  const completed = Math.max(0, Math.min(totalExercises, completedExercises));
  const percentage = totalExercises > 0 ? Math.round((completed / totalExercises) * 100) : 0;
  return (
    <div className={styles.overview}>
      <h1 id="journey-title" className={styles.title}>
        {title}
      </h1>
      <p className={styles.description}>{description}</p>
      <div className={styles.progressSummary}>
        <span>
          {completedLessons}/{totalLessons} lições <span aria-hidden="true">·</span> {completed}/
          {totalExercises} exercícios
        </span>
        <span className={styles.percentage}>{percentage}%</span>
      </div>
      <div
        role="progressbar"
        aria-label="Exercícios concluídos"
        aria-valuemin={0}
        aria-valuemax={Math.max(1, totalExercises)}
        aria-valuenow={completed}
        aria-valuetext={`${completed} de ${totalExercises} exercícios · ${percentage}%`}
        className={styles.progress}
      >
        <span style={{ width: `${percentage}%` }} />
      </div>
      <div className={styles.action}>{action}</div>
      <nav aria-label="Unidades da trilha" className={styles.units}>
        <div className={styles.unitsHeading}>
          <span>Explorar unidades</span>
          <span>{units.length} unidades</span>
        </div>
        <div className={styles.unitLinks}>
          {units.map((unit, index) => (
            <a key={unit} href={`#unit-${pathId}-${index}`} className={styles.unitLink}>
              <span className={styles.unitNumber}>{index + 1}</span>
              <span className={styles.unitName}>{unit}</span>
              <ChevronRight size={15} aria-hidden="true" />
            </a>
          ))}
        </div>
      </nav>
    </div>
  );
}

import styles from './LearningJourney.module.css';
import { JOURNEY_CONNECTOR_BEND } from './trailMascotRoute';

const BEND = Math.round(JOURNEY_CONNECTOR_BEND * 100);

export type JourneySide = 'left' | 'right';

/**
 * Map-mode stops alternate left and right of the column, so every node has an
 * open side for its label. The unit boss continues the same alternation.
 */
export function journeySide(index: number): JourneySide {
  return index % 2 === 0 ? 'left' : 'right';
}

/** Dotted curve from the stop at `index` to the next one, drawn between rows. */
export function JourneyConnector({ index }: { index: number }) {
  const fromLeft = journeySide(index) === 'left';
  return (
    <svg
      aria-hidden="true"
      className={styles.connector}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <path
        // Steep control points keep the curve vertical while it passes the
        // labels and turn it only in the open space between rows. The mascot
        // walks this same curve (see `buildMascotRoute`).
        d={
          fromLeft
            ? `M 0 0 C 0 ${BEND} 100 ${100 - BEND} 100 100`
            : `M 100 0 C 100 ${BEND} 0 ${100 - BEND} 0 100`
        }
        stroke="currentColor"
        strokeWidth="3"
        vectorEffect="non-scaling-stroke"
        strokeDasharray="3 9"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

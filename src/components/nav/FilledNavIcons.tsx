import { useId, type ReactNode } from 'react';

/**
 * Active-state navigation icons. Filling a Lucide outline paints every part of
 * it, so details like the house door or the compass needle disappear. These keep
 * Lucide's geometry, fill the main shape, and cut the detail out with a mask so it
 * stays transparent on any background (including hover states).
 */
interface FilledIconProps {
  className?: string;
}

function FilledIcon({
  className,
  shape,
  cutout,
}: FilledIconProps & { shape: (mask: string) => ReactNode; cutout: ReactNode }) {
  const maskId = `nav-icon-cutout-${useId().replace(/:/g, '')}`;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
          <rect width="24" height="24" fill="white" stroke="none" />
          <g fill="black" stroke="black">
            {cutout}
          </g>
        </mask>
      </defs>
      <g fill="currentColor">{shape(`url(#${maskId})`)}</g>
    </svg>
  );
}

export function HouseFilledIcon({ className }: FilledIconProps) {
  return (
    <FilledIcon
      className={className}
      shape={(mask) => (
        <path
          mask={mask}
          d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
        />
      )}
      cutout={<path strokeWidth={1.5} d="M14.5 22v-8.5a1 1 0 0 0-1-1h-3a1 1 0 0 0-1 1V22z" />}
    />
  );
}

export function CompassFilledIcon({ className }: FilledIconProps) {
  return (
    <FilledIcon
      className={className}
      shape={(mask) => <circle mask={mask} cx="12" cy="12" r="10" />}
      cutout={
        <path
          strokeWidth={1}
          d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z"
        />
      }
    />
  );
}

export function BookOpenFilledIcon({ className }: FilledIconProps) {
  return (
    <FilledIcon
      className={className}
      shape={(mask) => (
        <path
          mask={mask}
          d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"
        />
      )}
      cutout={<path fill="none" strokeWidth={1.75} d="M12 7.5v12.5" />}
    />
  );
}

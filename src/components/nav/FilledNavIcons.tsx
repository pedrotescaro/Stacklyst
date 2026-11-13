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

export function GamepadFilledIcon({ className }: FilledIconProps) {
  return (
    <FilledIcon
      className={className}
      shape={(mask) => (
        <path
          mask={mask}
          d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"
        />
      )}
      cutout={
        <>
          <path fill="none" strokeWidth={1.75} d="M6 11h4M8 9v4" />
          <circle cx="15" cy="12" r="1.1" stroke="none" />
          <circle cx="18" cy="10" r="1.1" stroke="none" />
        </>
      }
    />
  );
}

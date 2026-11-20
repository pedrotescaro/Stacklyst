import type { SVGProps } from 'react';

/** "GIF" lettering inside a rounded box, drawn with the same stroke as Lucide icons. */
export function GifIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className ? `lucide ${className}` : 'lucide'}
      {...props}
    >
      <rect x="2" y="4" width="20" height="16" rx="3" />
      <path
        d="M10 9.5H8a1.5 1.5 0 0 0-1.5 1.5v2A1.5 1.5 0 0 0 8 14.5h2V12H8.75"
        strokeWidth="1.75"
      />
      <path d="M13 9.5v5" strokeWidth="1.75" />
      <path d="M16 14.5v-5h2.75M16 12h2.25" strokeWidth="1.75" />
    </svg>
  );
}

/**
 * A court jester's hat: red and blue horns that rise and then flop down beside
 * the head, a yellow band resting on the avatar and a bell on each tip. Drawn
 * in a 140x100 box whose avatar circle starts at y=43, so the band sits on the head.
 */
export const JESTER_FRAME_ART = {
  color: '#ef4444',
  red: '#ef4444',
  blue: '#4c5fd7',
  yellow: '#facc15',
  outline: '#1e1b4b',
  panels: {
    leftOuter: 'M70 20C52 12 30 14 18 30 10 42 7 62 8 80c12-34 32-54 62-60Z',
    leftInner: 'M70 20C40 26 20 46 8 80c6-14 16-24 28-24 4-14 16-28 34-36Z',
    centerLeft: 'M70 20C52 28 40 42 36 56q17-7 34-8Z',
    centerRight: 'M70 20c18 8 30 22 34 36q-17-7-34-8Z',
    rightOuter: 'M70 20c18-8 40-6 52 10 8 12 11 32 10 50-12-34-32-54-62-60Z',
    rightInner: 'M70 20c30 6 50 26 62 60-6-14-16-24-28-24-4-14-16-28-34-36Z',
  },
  band: 'M35 57q35-16 70 0l1 7q-36-16-72 0Z',
  shine: 'M64 26c-12 6-20 15-25 26M28 20c-7 5-12 13-15 24',
  bellY: 85,
} as const;

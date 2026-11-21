/**
 * The full Stacklyst logo: the S monogram plus the name drawn in the matching
 * StackLyst Logo typeface (`src/app/fonts/StackLyst-Logo.ttf`).
 *
 * `public/brand/stacklyst-logo.webp` is the supplied artwork trimmed to its ink
 * and flattened to the brand blue, so only its alpha channel carries the shape.
 * Measurements below come from the 1949 x 373 trimmed original.
 */
export const brandWordmark = {
  src: '/brand/stacklyst-logo.webp',
  /** Path on disk, for server-side use (PDF certificates). */
  file: 'public/brand/stacklyst-logo.webp',
  width: 1949,
  height: 373,
  /** Height of the S; sizes elsewhere are given as the S height. */
  markHeight: 317,
  /**
   * Where the S ends and the name starts. The S reaches x = 330 and the "t"
   * starts at 327, so clipping here shows the S without a sliver of the "t".
   */
  markWidth: 329,
  /**
   * Text drawn with the logo typeface when the artwork cannot load. The font
   * only has the glyphs of "StackLyst" (no lowercase "l"), so a new name needs
   * the matching letters added to the font first.
   */
  text: 'StackLyst',
  /** S height / font-size for the logo typeface (S glyph spans 688 of 1000 units). */
  textMarkRatio: 0.688,
} as const;

/** Wordmark height and width relative to the S height. */
export const WORDMARK_HEIGHT_RATIO = brandWordmark.height / brandWordmark.markHeight;
export const WORDMARK_WIDTH_RATIO = brandWordmark.width / brandWordmark.markHeight;
/** Fraction of the wordmark width taken by the S. */
export const WORDMARK_MARK_FRACTION = brandWordmark.markWidth / brandWordmark.width;

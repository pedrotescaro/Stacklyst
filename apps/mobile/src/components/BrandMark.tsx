import Svg, { G, Path } from 'react-native-svg';
import { brandGeometry as g } from './brand-geometry';
/** Supplied S; wordmark uses the same Sora SemiBold 600 outlines as the website. */
export function BrandMark({
  width = 72,
  wordmark = false,
}: {
  width?: number;
  wordmark?: boolean;
}) {
  const height = (width * g.height) / g.width;
  return (
    <Svg
      width={wordmark ? (height * g.wordmarkWidth) / g.wordmarkHeight : width}
      height={height}
      viewBox={wordmark ? `0 0 ${g.wordmarkWidth} ${g.wordmarkHeight}` : g.viewBox}
      accessible
      accessibilityRole="image"
      accessibilityLabel="Stacklyst"
    >
      <Path d={g.path} fill="#0083fe" />
      {wordmark && (
        <G transform={`translate(${g.width + 36} 0)`}>
          <Path d={g.suffixPath} fill="#0083fe" />
        </G>
      )}
    </Svg>
  );
}

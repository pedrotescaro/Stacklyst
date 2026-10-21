import { SvgXml } from 'react-native-svg';
import logos from '../../assets/languages/logos.json';
import { IconCode } from './icons';
import { useTheme } from '../theme';

/** The same Devicon SVG artwork used by the website's TrailLanguageLogo. */
export function LanguageLogo({ language, size = 28 }: { language: string; size?: number }) {
  const { colors } = useTheme();
  const xml = logos[language.toUpperCase() as keyof typeof logos];
  if (!xml) return <IconCode size={size} color={colors.primary} />;
  return (
    <SvgXml
      xml={xml}
      width={size}
      height={size}
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no"
    />
  );
}

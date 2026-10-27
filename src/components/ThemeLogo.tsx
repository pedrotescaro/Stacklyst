import Image, { type ImageProps } from 'next/image';
type ThemeLogoProps = Omit<ImageProps, 'src'>;
export function ThemeLogo({ alt, className = '', ...props }: ThemeLogoProps) {
  return <Image {...props} src="/logo.svg" alt={alt} className={className} />;
}

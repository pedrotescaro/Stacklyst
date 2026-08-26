import Image, { type StaticImageData } from 'next/image';
import javascriptLogo from 'devicon/icons/javascript/javascript-original.svg';
import typescriptLogo from 'devicon/icons/typescript/typescript-original.svg';
import pythonLogo from 'devicon/icons/python/python-original.svg';
import rustLogo from 'devicon/icons/rust/rust-original.svg';
import goLogo from 'devicon/icons/go/go-original.svg';
import javaLogo from 'devicon/icons/java/java-original.svg';

export const TRAIL_LANGUAGE_CODES = ['JS', 'TS', 'PYTHON', 'RUST', 'GO', 'JAVA'] as const;

export type TrailLanguageCode = (typeof TRAIL_LANGUAGE_CODES)[number];

interface TrailLanguageMetadata {
  color: string;
  label: string;
  logo: StaticImageData | string;
  logoClassName?: string;
}

export const TRAIL_LANGUAGE_METADATA: Record<TrailLanguageCode, TrailLanguageMetadata> = {
  JS: {
    color: '#f0db4f',
    label: 'JavaScript',
    logo: javascriptLogo,
  },
  TS: {
    color: '#007acc',
    label: 'TypeScript',
    logo: typescriptLogo,
  },
  PYTHON: {
    color: '#5a9fd4',
    label: 'Python',
    logo: pythonLogo,
  },
  RUST: {
    color: '#dea584',
    label: 'Rust',
    logo: rustLogo,
    logoClassName: 'rounded-full bg-[#dea584] p-1',
  },
  GO: {
    color: '#6ad7e5',
    label: 'Go',
    logo: goLogo,
  },
  JAVA: {
    color: '#ea2d2e',
    label: 'Java',
    logo: javaLogo,
  },
};

export function isTrailLanguage(language: string): language is TrailLanguageCode {
  return TRAIL_LANGUAGE_CODES.includes(language as TrailLanguageCode);
}

export function getTrailLanguageMetadata(language: string) {
  const normalizedLanguage = language.toUpperCase();
  if (!isTrailLanguage(normalizedLanguage)) return TRAIL_LANGUAGE_METADATA.JS;
  return TRAIL_LANGUAGE_METADATA[normalizedLanguage];
}

interface TrailLanguageLogoProps {
  language: string;
  className?: string;
}

export function TrailLanguageLogo({ language, className }: TrailLanguageLogoProps) {
  const metadata = getTrailLanguageMetadata(language);

  return (
    <Image
      src={metadata.logo}
      alt=""
      aria-hidden="true"
      width={128}
      height={128}
      unoptimized
      draggable={false}
      className={`${className ?? ''} object-contain ${metadata.logoClassName ?? ''}`}
    />
  );
}

'use client';
import type { HTMLAttributes } from 'react';
import { BrandReveal } from './BrandReveal';
import { useLocalizedText } from '@/i18n/useLocalizedText';
interface LoaderProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg';
}
export default function Loader({
  title,
  subtitle,
  size = 'md',
  className = '',
  ...props
}: LoaderProps) {
  const { text } = useLocalizedText();
  return (
    <div className={`flex w-full items-center justify-center p-6 ${className}`} {...props}>
      <BrandReveal
        size={size === 'sm' ? 32 : size === 'lg' ? 88 : 64}
        title={title ?? text('Preparando sua experiência...', 'Preparing your experience...')}
        subtitle={subtitle}
      />
    </div>
  );
}

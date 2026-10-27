import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { LanguageToggle } from '../LanguageToggle';
import { LanguageProvider } from '@/contexts/LanguageContext';
import React from 'react';

describe('LanguageToggle', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.lang = 'pt-BR';
    document.documentElement.removeAttribute('data-language');
    vi.restoreAllMocks();
  });

  it('renders Portuguese state with BR badge and English tooltip', () => {
    render(
      <LanguageProvider>
        <LanguageToggle />
      </LanguageProvider>
    );

    const button = screen.getByRole('button', { name: /switch to english/i });
    expect(button).toBeInTheDocument();
    expect(screen.getByText('BR')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
  });

  it('toggles to English on click with EN badge and Portuguese tooltip', () => {
    render(
      <LanguageProvider>
        <LanguageToggle />
      </LanguageProvider>
    );

    const button = screen.getByRole('button', { name: /switch to english/i });
    fireEvent.click(button);

    expect(screen.getByText('EN')).toBeInTheDocument();
    expect(screen.getByText('Português')).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'EN: Mudar para português');
  });
});

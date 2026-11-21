import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { brandGeometry } from '@/lib/brand-geometry';

class FailingImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  set src(_value: string) {
    queueMicrotask(() => this.onerror?.());
  }
}

class LoadingImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  set src(_value: string) {
    queueMicrotask(() => this.onload?.());
  }
}

/** The load check is shared per page, so each test gets a fresh module. */
async function loadBrandLogo() {
  vi.resetModules();
  return (await import('../BrandLogo')).BrandLogo;
}

describe('BrandLogo', () => {
  beforeEach(() => vi.stubGlobal('Image', LoadingImage));
  afterEach(() => vi.unstubAllGlobals());

  it('shows the full logo artwork, labelled with the product name', async () => {
    const BrandLogo = await loadBrandLogo();
    render(<BrandLogo size={27} />);
    await act(async () => {});
    expect(screen.getByRole('img', { name: 'Stacklyst' })).toBeInTheDocument();
    const artwork = screen.getByTestId('brand-wordmark');
    expect(artwork.parentElement?.getAttribute('style')).toContain('/brand/stacklyst-logo.webp');
    expect(screen.queryByTestId('brand-wordmark-text')).toBeNull();
  });

  it('shows only the S when the wordmark is off, like a collapsed sidebar', async () => {
    const BrandLogo = await loadBrandLogo();
    const { container } = render(<BrandLogo size={27} wordmark={false} />);
    expect(container.querySelector('svg path')?.getAttribute('d')).toBe(brandGeometry.path);
    expect(screen.queryByTestId('brand-wordmark')).toBeNull();
  });

  it('typesets the name in the logo font when the artwork cannot load', async () => {
    vi.stubGlobal('Image', FailingImage);
    const BrandLogo = await loadBrandLogo();
    render(<BrandLogo size={27} />);
    await act(async () => {});
    expect(screen.getByTestId('brand-wordmark-text')).toHaveTextContent('StackLyst');
    expect(screen.queryByTestId('brand-wordmark')).toBeNull();
    expect(screen.getByRole('img', { name: 'Stacklyst' })).toBeInTheDocument();
  });
});

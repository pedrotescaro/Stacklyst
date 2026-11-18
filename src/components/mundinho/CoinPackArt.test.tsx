import { render } from '@testing-library/react';
import { expect, it } from 'vitest';
import { CoinPackArt, type CoinPackId } from './CoinPackArt';

const PACKS: CoinPackId[] = ['punhado', 'bolsa', 'bau', 'cofre', 'tesouro', 'montanha'];

it('draws a different illustration for each coin pack, with branded coins', () => {
  const drawings = PACKS.map((pack) => {
    const { container } = render(<CoinPackArt pack={pack} />);
    const svg = container.querySelector('svg')!;
    expect(svg).toHaveAttribute('data-pack', pack);
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    return svg.innerHTML;
  });
  expect(new Set(drawings).size).toBe(PACKS.length);
  // Bigger packs hold more coins than the handful.
  const coins = (html: string) => (html.match(/<circle/g) ?? []).length;
  expect(coins(drawings[5])).toBeGreaterThan(coins(drawings[0]));
});

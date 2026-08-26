import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TrailLanguageLogo } from '../TrailLanguageLogo';

describe('TrailLanguageLogo', () => {
  it.each([
    ['JS', 'javascript-original', 'f0db4f'],
    ['TS', 'typescript-original', '007acc'],
    ['PYTHON', 'python-original', '5a9fd4'],
    ['RUST', 'rust-original', ''],
    ['GO', 'go-original', ''],
    ['JAVA', 'java-original', 'ea2d2e'],
  ])('usa o SVG original do Devicon para %s', (language, filename, brandColor) => {
    const { container } = render(<TrailLanguageLogo language={language} />);
    const source = container.querySelector('img')?.getAttribute('src')?.toLowerCase() ?? '';

    expect(source).toMatch(new RegExp(brandColor ? `${filename}|${brandColor}` : filename, 'i'));
  });
});

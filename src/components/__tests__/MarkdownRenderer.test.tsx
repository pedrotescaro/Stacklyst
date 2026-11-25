import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MarkdownRenderer } from '../MarkdownRenderer';

function mockRenderedLines(getRows: (fragment: string) => number[]) {
  const createRange = document.createRange.bind(document);
  vi.spyOn(document, 'createRange').mockImplementation(() => {
    const range = createRange();
    range.getClientRects = () => {
      const rects = getRows(range.toString()).map((row) => new DOMRect(0, row, 80, 16));
      return Object.assign(rects, { item: (index: number) => rects[index] ?? null });
    };
    return range;
  });
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('compact Markdown previews', () => {
  it('keeps five spaced paragraphs visible, counting inline formatting as part of its row', () => {
    mockRenderedLines((fragment) => {
      const number = Number(fragment.match(/\d+/)?.[0] ?? 0);
      return [number * 60];
    });
    const content = Array.from({ length: 5 }, (_, i) => `Linha ${i} com **negrito ${i}**.`).join(
      '\n\n'
    );
    render(<MarkdownRenderer content={content} compact />);

    expect(screen.queryByRole('button', { name: 'Ver mais' })).not.toBeInTheDocument();
    expect(screen.getByText('negrito 4')).toBeVisible();
  });

  it('only offers expansion when resizing wraps the content into more than ten lines', () => {
    let rows = 10;
    let resize = () => {};
    mockRenderedLines(() => Array.from({ length: rows }, (_, index) => index * 24));
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: () => void) {
          resize = callback;
        }
        observe() {}
        disconnect() {}
      }
    );
    const parentClick = vi.fn();
    render(
      <div onClick={parentClick}>
        <MarkdownRenderer content="Uma publicação que quebra em várias linhas." compact />
      </div>
    );
    expect(screen.queryByRole('button', { name: 'Ver mais' })).not.toBeInTheDocument();

    act(() => {
      rows = 11;
      resize();
    });
    const disclosure = screen.getByRole('button', { name: 'Ver mais' });
    const panel = document.getElementById(disclosure.getAttribute('aria-controls')!);
    expect(panel).toHaveStyle({ maxHeight: '234px' });
    fireEvent.click(disclosure);

    expect(panel?.style.maxHeight).toBe('');
    expect(disclosure).not.toBeInTheDocument();
    expect(parentClick).not.toHaveBeenCalled();
  });

  it('uses a separate disclosure for code and does not crop the prose based on code height', () => {
    mockRenderedLines(() => Array.from({ length: 11 }, (_, index) => index * 24));
    render(
      <MarkdownRenderer
        content={['```js', 'let number = 1;', 'number++;', 'number++;', 'number++;', '```'].join(
          '\n'
        )}
        compact
      />
    );
    expect(screen.queryByRole('button', { name: 'Ver mais' })).not.toBeInTheDocument();

    const disclosure = screen.getByRole('button', { name: 'Ver código completo' });
    const code = document.getElementById(disclosure.getAttribute('aria-controls')!);
    expect(code).toHaveClass('overflow-y-hidden');
    fireEvent.click(disclosure);
    expect(code).not.toHaveClass('overflow-y-hidden');
  });

  it('keeps short three-line posts visible without showing Ver mais', () => {
    mockRenderedLines((fragment) => {
      const match = fragment.match(/\d+/);
      return [Number(match?.[0] ?? 0) * 28];
    });
    const content = ['Linha 1', 'Linha 2', 'Linha 3'].join('\n\n');
    render(<MarkdownRenderer content={content} compact />);

    expect(screen.queryByRole('button', { name: 'Ver mais' })).not.toBeInTheDocument();
    expect(screen.getByText('Linha 3')).toBeVisible();
  });
});

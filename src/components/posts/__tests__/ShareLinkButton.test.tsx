import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ShareLinkButton } from '../ShareLinkButton';

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('ShareLinkButton', () => {
  it('copies the link, shows "Link copiado!" above the check, then resets', async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    render(<ShareLinkButton path="/post/p#answer-a" label="Compartilhar resposta" />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Compartilhar resposta' }));
    });

    expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/post/p#answer-a`);
    expect(screen.getByRole('status')).toHaveTextContent('Link copiado!');
    expect(document.querySelector('.lucide-check')).not.toBeNull();

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(document.querySelector('.lucide-share2, .lucide-share-2')).not.toBeNull();
  });
});

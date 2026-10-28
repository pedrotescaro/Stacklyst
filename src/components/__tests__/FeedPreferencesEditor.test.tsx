import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { it, expect, vi } from 'vitest';
import { FeedPreferencesEditor } from '../FeedPreferencesEditor';
vi.mock('@/hooks/useReducedMotion', () => ({ useReducedMotion: () => true }));
it('loads and persists the selected feed languages and notifies the live feed', async () => {
  const prefs = { feed: 'for-you', languages: ['JS'] };
  const fetchMock = vi.fn(async () => ({ ok: true, json: async () => prefs }));
  vi.stubGlobal('fetch', fetchMock);
  const changed = vi.fn();
  window.addEventListener('stacklyst:feed-preferences', changed);
  render(<FeedPreferencesEditor />);
  fireEvent.click(screen.getByRole('button', { name: 'Personalizar feed' }));
  fireEvent.click(await screen.findByRole('checkbox', { name: 'PYTHON' }));
  fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
  await waitFor(() =>
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/onboarding',
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ feed: 'for-you', languages: ['JS', 'PYTHON'] }),
      })
    )
  );
  await waitFor(() => expect(changed).toHaveBeenCalledOnce());
  window.removeEventListener('stacklyst:feed-preferences', changed);
});

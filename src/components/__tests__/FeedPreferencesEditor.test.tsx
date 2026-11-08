import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { FeedPreferencesEditor } from '../FeedPreferencesEditor';
import { getFeedSettings } from '@/lib/feed-preferences';

const original = { feed: 'for-you' as const, languages: ['JS' as const] };
let fetchMock: ReturnType<typeof vi.fn>;
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open');
  };
  fetchMock = vi.fn(async (_url, init) => ({
    ok: true,
    json: async () => (init?.body ? JSON.parse(init.body) : original),
  }));
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => vi.unstubAllGlobals());
async function open() {
  render(<FeedPreferencesEditor />);
  fireEvent.click(screen.getByRole('button', { name: 'Personalizar feed' }));
  await screen.findByRole('button', { name: 'Editar Para você' });
}

it('persists languages, content switches and blocked terms and notifies the live feed', async () => {
  const changed = vi.fn();
  window.addEventListener('stacklyst:feed-preferences', changed);
  await open();
  fireEvent.click(screen.getByRole('button', { name: 'Editar Para você' }));
  fireEvent.click(screen.getByRole('checkbox', { name: 'Python' }));
  fireEvent.click(screen.getByRole('switch', { name: 'Enquetes' }));
  fireEvent.change(screen.getByLabelText('Palavra para bloquear'), {
    target: { value: 'futebol' },
  });
  fireEvent.keyDown(screen.getByLabelText('Palavra para bloquear'), { key: 'Enter' });
  fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));
  await waitFor(() => expect(changed).toHaveBeenCalledOnce());
  const payload = JSON.parse(
    fetchMock.mock.calls.find(([, init]) => init?.method === 'PUT')![1].body
  );
  expect(payload.languages).toEqual(['JS', 'PYTHON']);
  expect(payload.feedSettings.feeds[1]).toMatchObject({
    showPolls: false,
    blockedTerms: ['futebol'],
  });
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  window.removeEventListener('stacklyst:feed-preferences', changed);
});

it('creates, reorders and hides feeds while keeping the initial feed visible', async () => {
  await open();
  fireEvent.click(screen.getByRole('button', { name: 'Ocultar Seguindo' }));
  fireEvent.click(screen.getByRole('button', { name: 'Ocultar Para você' }));
  expect(screen.getByRole('alert')).toHaveTextContent('pelo menos um feed visível');
  fireEvent.click(screen.getByRole('button', { name: 'Criar feed' }));
  fireEvent.change(screen.getByLabelText('Nome do feed'), { target: { value: 'Python diário' } });
  fireEvent.click(screen.getByRole('checkbox', { name: 'Python' }));
  fireEvent.click(screen.getByRole('button', { name: 'Voltar para gerenciar feeds' }));
  const list = screen.getByRole('list');
  fireEvent.keyDown(screen.getByRole('button', { name: 'Reordenar Python diário' }), {
    key: 'ArrowUp',
  });
  expect(within(list).getAllByRole('listitem')[1]).toHaveTextContent('Python diário');
  fireEvent.change(screen.getByLabelText('Feed inicial'), {
    target: {
      value: within(list).getAllByRole('listitem')[1].querySelector('button[aria-label^="Editar"]')
        ? screen.getByRole('option', { name: 'Python diário' }).getAttribute('value')
        : '',
    },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  const payload = JSON.parse(
    fetchMock.mock.calls.find(([, init]) => init?.method === 'PUT')![1].body
  );
  expect(payload.feedSettings.feeds).toHaveLength(3);
  expect(payload.feedSettings.feeds[0].visible).toBe(false);
  expect(payload.feedSettings.defaultFeedId).toBe(payload.feedSettings.feeds[1].id);
});

it('retains edits on a failed save and allows retry', async () => {
  await open();
  fireEvent.click(screen.getByRole('button', { name: 'Editar Para você' }));
  fireEvent.click(screen.getByRole('checkbox', { name: 'Python' }));
  fetchMock.mockResolvedValueOnce({ ok: false });
  fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Suas alterações continuam aqui');
  expect(screen.getByRole('checkbox', { name: 'Python' })).toBeChecked();
  fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
});

it('loads saved hidden feeds and ordering', async () => {
  const settings = getFeedSettings(original);
  settings.feeds.reverse();
  settings.feeds[1].visible = false;
  fetchMock.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ ...original, feedSettings: settings }),
  });
  await open();
  expect(screen.getAllByRole('listitem')[0]).toHaveTextContent('Para você');
  expect(screen.getByRole('button', { name: 'Mostrar Seguindo' })).toBeInTheDocument();
});

import { useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import { MentionTextarea } from '../MentionTextarea';
vi.mock('@/i18n/useLocalizedText', () => ({
  useLocalizedText: () => ({ text: (pt: string) => pt }),
}));
function Bio() {
  const [value, setValue] = useState('Olá! ');
  return <MentionTextarea aria-label="Biografia" value={value} onValueChange={setValue} />;
}
afterEach(() => vi.unstubAllGlobals());
it('shows matching profiles and inserts the keyboard selection without submitting the form', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        { id: '1', username: 'ana', avatar_config: { displayName: 'Ana Maria' } },
        { id: '2', username: 'ana-dev', avatar_config: { displayName: 'Ana Dev' } },
      ],
    })
  );
  const user = userEvent.setup();
  render(<Bio />);
  const field = screen.getByRole('textbox');
  await user.type(field, '@an');
  expect(await screen.findByRole('option', { name: /Ana Maria/ })).toBeVisible();
  await user.keyboard('{ArrowDown}{Enter}');
  await waitFor(() => expect(field).toHaveValue('Olá! @ana-dev '));
  expect(screen.queryByRole('listbox')).toBeNull();
  expect(field).toHaveFocus();
});

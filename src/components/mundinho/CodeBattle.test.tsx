import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { CodeBattle } from './CodeBattle';
import { codeChallenge } from '../../lib/mundinho/codeChallenges';
import { DEFAULT_AVATAR } from '../../lib/mundinho/types';

it('lets the player edit, test without attacking, and explicitly confirm the code', async () => {
  window.matchMedia = vi.fn().mockReturnValue({ matches: true });
  const onExecute = vi.fn().mockResolvedValue({
    codeRun: {
      passed: true,
      trace: ['andar', 'coletar', 'andar', 'coletar', 'andar', 'coletar'],
    },
  });
  render(
    <CodeBattle
      question={codeChallenge('PYTHON')!}
      avatar={DEFAULT_AVATAR}
      busy={false}
      onExecute={onExecute}
    />
  );
  const source = 'for passo in range(3):\n    mundo.andar_direita()\n    mundo.coletar()';
  fireEvent.change(screen.getByRole('textbox', { name: 'Código da batalha' }), {
    target: { value: source },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Executar' }));
  await waitFor(() => expect(screen.getByText(/Três cristais coletados/)).toBeInTheDocument());
  expect(onExecute).toHaveBeenCalledWith(source, false);
  expect(await screen.findByLabelText('3 de 3 cristais coletados')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Confirmar ataque' }));
  expect(onExecute).toHaveBeenLastCalledWith(source, true);
});

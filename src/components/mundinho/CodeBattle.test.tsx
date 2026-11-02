import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { CodeBattle } from './CodeBattle';
import { codeChallenge, codeChallenges } from '../../lib/mundinho/codeChallenges';
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
  await waitFor(() => expect(screen.getByText(/Objetivo concluído/)).toBeInTheDocument());
  expect(onExecute).toHaveBeenCalledWith(source, false);
  expect(await screen.findByLabelText(/3 de 3 objetivos concluídos/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Confirmar ataque' }));
  expect(onExecute).toHaveBeenLastCalledWith(source, true);
});

it('renders a different scenario, replays movement in both directions and announces progress', async () => {
  window.matchMedia = vi.fn().mockReturnValue({ matches: true });
  const onExecute = vi.fn().mockResolvedValue({
    codeRun: {
      passed: true,
      trace: ['voltar', 'voltar', 'ativar', 'andar', 'andar', 'andar', 'andar', 'ativar'],
    },
  });
  render(
    <CodeBattle
      question={codeChallenges('JS')[3]}
      avatar={DEFAULT_AVATAR}
      busy={false}
      onExecute={onExecute}
    />
  );
  expect(screen.getByRole('heading', { name: 'Ponte de mecanismos' })).toBeInTheDocument();
  expect(screen.getByLabelText(/Personagem na casa 3 de 5/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Executar' }));
  expect(
    await screen.findByLabelText(/Personagem na casa 5 de 5\. 2 de 2 objetivos concluídos/)
  ).toBeInTheDocument();
  expect(screen.getByLabelText(/Casa 1: Alavanca \(concluído\)/)).toBeInTheDocument();
  expect(onExecute).toHaveBeenCalledWith(expect.any(String), false);
});

it('explains the execution language when the selected course is HTML or CSS', () => {
  window.matchMedia = vi.fn().mockReturnValue({ matches: true });
  render(
    <CodeBattle
      question={codeChallenges('HTML')[1]}
      avatar={DEFAULT_AVATAR}
      busy={false}
      battleLanguage="HTML"
      onExecute={vi.fn()}
    />
  );
  expect(screen.getByRole('heading', { name: 'Jardim sedento' })).toBeInTheDocument();
  expect(screen.getByText(/usa JavaScript para controlar o mundo/)).toBeInTheDocument();
  expect(screen.getByText('mundo.regar()')).toBeInTheDocument();
});

it('shows different sprites for short and long segments and explains the actual step count', () => {
  window.matchMedia = vi.fn().mockReturnValue({ matches: true });
  const { container } = render(
    <CodeBattle
      question={codeChallenges('TS').find((entry) => entry.id.includes('viveiro'))!}
      avatar={DEFAULT_AVATAR}
      busy={false}
      onExecute={vi.fn()}
    />
  );
  expect(screen.getByLabelText(/Casa 1: Caminho curto, trecho de 1 passo/)).toBeInTheDocument();
  expect(screen.getByLabelText(/Casa 4: Caminho longo, trecho de 2 passos/)).toBeInTheDocument();
  const short = container.querySelector<HTMLElement>('[data-path="short"] .ad-code-object')!;
  const long = container.querySelector<HTMLElement>('[data-path="long"] .ad-code-object')!;
  expect(short.style.backgroundPositionX).not.toBe(long.style.backgroundPositionX);
  expect(short.style.backgroundSize).toBe('1700% 100%');
  expect(screen.getByText(/Cada comando de andar avança uma casa/)).toBeInTheDocument();
  expect(screen.getByText('2 passos')).toBeInTheDocument();
});

it.each([2, 3])('shows the required learning structures for level %s', (level) => {
  window.matchMedia = vi.fn().mockReturnValue({ matches: true });
  const question = codeChallenges('PYTHON', level)[0];
  render(
    <CodeBattle question={question} avatar={DEFAULT_AVATAR} busy={false} onExecute={vi.fn()} />
  );
  expect(screen.getByText(new RegExp(`Nível ${level}:`))).toBeInTheDocument();
  expect(screen.getByText(question.code!.hint!, { exact: false })).toBeInTheDocument();
  expect(screen.getByRole('textbox', { name: 'Código da batalha' })).toHaveValue(
    question.code!.starter
  );
  expect(question.code!.starter).toContain('if mundo.precisa_coletar():');
  expect(question.code!.starter).toContain('else:');
  if (level === 3) expect(question.code!.starter).toContain('while mundo.pode_andar_direita():');
});

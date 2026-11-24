import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { EnadePageViewer } from './EnadePageViewer';

describe('Enade page image viewer', () => {
  it('opens the page in a dialog, zooms, fits and restores focus when closed', async () => {
    const user = userEvent.setup();
    render(<EnadePageViewer src="/enade/2021/page-5.webp" page={5} year={2021} />);
    const trigger = screen.getByRole('button', {
      name: 'Abrir e ampliar página 5 da prova Enade ADS 2021',
    });
    await user.click(trigger);
    expect(screen.getByRole('dialog', { name: 'Página 5 · Enade ADS 2021' })).toBeInTheDocument();
    fireEvent.load(screen.getByRole('img', { name: 'Página 5 · Enade ADS 2021' }));
    const level = screen.getByLabelText('Nível de zoom');
    expect(level).toHaveTextContent('100%');
    expect(screen.getByRole('button', { name: 'Diminuir zoom' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Aumentar zoom' }));
    expect(Number(level.textContent!.replace('%', ''))).toBeGreaterThan(100);
    await user.click(screen.getByRole('button', { name: 'Ajustar página à tela' }));
    expect(level).toHaveTextContent('100%');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
    await user.click(trigger);
    expect(screen.getByLabelText('Nível de zoom')).toHaveTextContent('100%');
  });

  it('loads detail only after opening and falls back to the preview if needed', async () => {
    const user = userEvent.setup();
    const src = '/enade/2014/questions/2014-objective-29-A.webp';
    const detailSrc = '/enade/2014/questions/2014-objective-29-A-detail.webp';
    render(<EnadePageViewer src={src} detailSrc={detailSrc} page={23} year={2014} />);
    expect(screen.getByRole('img')).toHaveAttribute('src', src);
    await user.click(screen.getByRole('button', { name: /Abrir e ampliar/ }));
    const enlarged = screen.getByRole('img', { name: 'Página 23 · Enade ADS 2014' });
    expect(enlarged).toHaveAttribute('src', detailSrc);
    expect(
      screen.getByRole('link', { name: 'Abrir esta página no caderno original (nova aba)' })
    ).toHaveAttribute('href', '/enade/2014/prova.pdf#page=23');

    fireEvent.error(enlarged);
    expect(enlarged).toHaveAttribute('src', src);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('supports keyboard zoom and allows closing after an image error', async () => {
    const user = userEvent.setup();
    render(<EnadePageViewer src="/enade/2021/page-5.webp" page={5} year={2021} />);
    await user.click(screen.getByRole('button', { name: /Abrir e ampliar/ }));
    const dialog = screen.getByRole('dialog');
    fireEvent.load(screen.getByRole('img', { name: 'Página 5 · Enade ADS 2021' }));
    fireEvent.keyDown(dialog, { key: '+' });
    expect(
      Number(screen.getByLabelText('Nível de zoom').textContent!.replace('%', ''))
    ).toBeGreaterThan(100);
    fireEvent.keyDown(dialog, { key: '0' });
    expect(screen.getByLabelText('Nível de zoom')).toHaveTextContent('100%');
    fireEvent.error(screen.getByRole('img', { name: 'Página 5 · Enade ADS 2021' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível carregar');
    expect(screen.getByRole('button', { name: 'Aumentar zoom' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Fechar visualizador' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});

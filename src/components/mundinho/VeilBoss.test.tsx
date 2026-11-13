import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as mechanics from '../../lib/mundinho/veil-boss';
import { VeilBoss } from './VeilBoss';
vi.mock('../../i18n/useLocalizedText', () => ({
  useLocalizedText: () => ({ text: (pt: string) => pt }),
}));
const button = (name: string | RegExp) => screen.getByRole('button', { name });
const click = (name: string | RegExp) => fireEvent.click(button(name));
const tick = (ms: number) => act(() => vi.advanceTimersByTime(ms));
describe('VeilBoss command flow', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });
  it('navigates the four commands and rejects healing at full HP or premature mercy', () => {
    const leave = vi.fn();
    render(<VeilBoss assetBase="/assets/mundinho" onLeave={leave} username="Pedro" level={6} />);
    expect(button('FIGHT')).toHaveFocus();
    fireEvent.keyDown(button('FIGHT'), { key: 'ArrowRight' });
    expect(button('ACT')).toHaveFocus();
    click('ITEM');
    expect(button(/Fruta/)).toBeDisabled();
    click('Voltar');
    click('MERCY');
    expect(button('Poupar')).toBeDisabled();
    click('Fugir');
    expect(leave).toHaveBeenCalledOnce();
  });
  it('keeps the heart visible, moves it with the keyboard and freezes damage and movement on pause', () => {
    const { container } = render(<VeilBoss assetBase="/assets/mundinho" onLeave={() => {}} />);
    click('FIGHT');
    tick(600);
    click('Golpear');
    const field = screen.getByLabelText(/Área de batalha/);
    expect(field).toHaveFocus();
    expect(container.querySelector('.veil-heart svg')).toBeInTheDocument();
    fireEvent.keyDown(field, { key: 'ArrowRight' });
    tick(300);
    fireEvent.keyUp(field, { key: 'ArrowRight' });
    const heart = container.querySelector<HTMLElement>('.veil-heart')!;
    expect(parseFloat(heart.style.left)).toBeGreaterThan(50);
    click('Pausar');
    const x = heart.style.left;
    const hp = screen.getByRole('meter', { name: 'Sua vida' }).getAttribute('aria-valuenow');
    tick(6000);
    expect(heart.style.left).toBe(x);
    expect(screen.getByRole('meter', { name: 'Sua vida' })).toHaveAttribute('aria-valuenow', hp);
    fireEvent.click(screen.getAllByRole('button', { name: 'Continuar' })[0]);
    tick(6500);
    expect(button('FIGHT')).toBeEnabled();
  });
  it('requires three conversations to unlock mercy and consumes healing items', () => {
    render(<VeilBoss assetBase="/assets/mundinho" onLeave={() => {}} />);
    click('ACT');
    click(/Conversar/);
    expect(screen.getByText(/Confiança: 1\/3/)).toBeInTheDocument();
    click('Continuar');
    const field = screen.getByLabelText(/Área de batalha/);
    fireEvent.keyDown(field, { key: 'ArrowLeft' });
    tick(1000);
    fireEvent.keyUp(field, { key: 'ArrowLeft' });
    tick(5500);
    const hp = Number(
      screen.getByRole('meter', { name: 'Sua vida' }).getAttribute('aria-valuenow')
    );
    expect(hp).toBeLessThan(20);
    // Menu progression is independent of how the player dodges later patterns.
    vi.spyOn(mechanics, 'advanceShots').mockImplementation(() => ({ shots: [], hit: false }));
    click('ITEM');
    click(/Fruta/);
    expect(screen.getByRole('meter', { name: 'Sua vida' })).toHaveAttribute(
      'aria-valuenow',
      String(Math.min(20, hp + 10))
    );
    click('Continuar');
    tick(6500);
    for (let i = 0; i < 2; i++) {
      click('ACT');
      click(/Conversar/);
      click('Continuar');
      tick(6500);
    }
    click('MERCY');
    expect(button('Poupar')).toBeEnabled();
    click('Poupar');
    expect(screen.getByText(/Você poupou/)).toBeInTheDocument();
  });
  it('ends the fight on zero boss HP and allows retry after the player is defeated', () => {
    const shots = vi
      .spyOn(mechanics, 'advanceShots')
      .mockImplementation((next) => ({ shots: next, hit: false }));
    const view = render(<VeilBoss assetBase="/assets/mundinho" onLeave={() => {}} />);
    for (let i = 0; i < 6; i++) {
      click('FIGHT');
      expect(screen.getByRole('meter', { name: 'Vida do guardião' })).toHaveAttribute(
        'aria-valuemax',
        '144'
      );
      for (let ms = 0; ms < 400; ms++) {
        const marker = view.container.querySelector<HTMLElement>('.veil-meter i')!;
        if (Math.abs(parseFloat(marker.style.left) - 50) < 1) break;
        tick(1);
      }
      click('Golpear');
      if (i < 5) tick(6500);
    }
    expect(screen.getByText(/O guardião se curva/)).toBeInTheDocument();
    expect(button('FIGHT')).toBeDisabled();
    view.unmount();
    shots.mockImplementation(() => ({ shots: [], hit: true }));
    render(<VeilBoss assetBase="/assets/mundinho" onLeave={() => {}} />);
    click('FIGHT');
    click('Golpear');
    tick(6500);
    expect(screen.getByRole('meter', { name: 'Sua vida' })).toHaveAttribute('aria-valuenow', '0');
    click('Tentar de novo');
    expect(screen.getByRole('meter', { name: 'Sua vida' })).toHaveAttribute('aria-valuenow', '20');
    click('ITEM');
    expect(button(/Fruta ×3/)).toBeInTheDocument();
  });
});

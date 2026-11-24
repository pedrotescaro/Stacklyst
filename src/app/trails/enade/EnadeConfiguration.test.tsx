import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EnadeConfiguration } from './EnadeConfiguration';
import { DEFAULT_CONFIG } from '@/lib/enade/simulator';
const push = vi.hoisted(() => vi.fn());
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
beforeEach(() => {
  push.mockClear();
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => Response.json({ attempt: { id: 'custom-attempt' } }))
  );
});
afterEach(() => vi.unstubAllGlobals());
describe('Enade configuration', () => {
  it('validates counts, arbitrary minutes, selected years and no time limit', async () => {
    render(<EnadeConfiguration />);
    fireEvent.click(screen.getByRole('button', { name: 'Mais opções' }));
    expect(screen.getByLabelText('Incluir discursivas para autoavaliação')).not.toBeChecked();
    fireEvent.change(screen.getByRole('combobox', { name: 'Ano inicial' }), {
      target: { value: '2021' },
    });
    expect(screen.getByLabelText('2021')).toBeChecked();
    expect(screen.getByLabelText('2017')).not.toBeChecked();
    fireEvent.change(screen.getByLabelText('Quantidade'), { target: { value: '36' } });
    expect(screen.getByRole('button', { name: 'Iniciar simulado' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: '35' }));
    fireEvent.change(screen.getByLabelText('Minutos · de 1 a 300'), { target: { value: '17' } });
    expect(screen.getByRole('button', { name: 'Iniciar simulado' })).toBeEnabled();
    fireEvent.change(screen.getByLabelText('Minutos · de 1 a 300'), { target: { value: '301' } });
    expect(screen.getByRole('button', { name: 'Iniciar simulado' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Sem tempo' }));
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar simulado' }));
    await waitFor(() =>
      expect(push).toHaveBeenCalledWith('/trails/enade/simulados/custom-attempt')
    );
    const [url, options] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe('/api/enade/attempts');
    expect(options?.method).toBe('POST');
    expect(JSON.parse(String(options?.body))).toMatchObject({
      kind: 'CUSTOM',
      config: { years: [2021], questionCount: 35, durationMinutes: null },
    });
  });
  it('creates a specific session and limits the general count to the available pool', async () => {
    const { unmount } = render(<EnadeConfiguration />);
    expect(screen.getByRole('radio', { name: /Prova completa/ })).toBeChecked();
    fireEvent.click(screen.getByRole('radio', { name: /Só específicas/ }));
    expect(
      screen.getByText(/20 questões · componente específico · todas as edições/)
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar simulado' }));
    await waitFor(() => expect(push).toHaveBeenCalled());
    const options = vi.mocked(fetch).mock.calls[0][1];
    expect(JSON.parse(String(options?.body))).toMatchObject({
      kind: 'CUSTOM',
      config: { section: 'specific', questionCount: 20 },
    });

    unmount();
    render(<EnadeConfiguration />);
    fireEvent.click(screen.getByRole('radio', { name: /Só formação geral/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Mais opções' }));
    fireEvent.change(screen.getByRole('combobox', { name: 'Ano inicial' }), {
      target: { value: '2021' },
    });
    // One edition has 8 valid general objectives: the count follows the smaller pool.
    expect(screen.getByLabelText('Quantidade')).toHaveValue(8);
    expect(screen.getByRole('radio', { name: /Só formação geral.*8 questões/ })).toBeChecked();
  });
  it('reapplies the latest valid account configuration', () => {
    const config = {
      ...DEFAULT_CONFIG,
      years: [2014, 2017],
      questionCount: 12,
      durationMinutes: 47,
      mode: 'training' as const,
    };
    render(<EnadeConfiguration initialConfig={config} />);
    fireEvent.click(screen.getByRole('button', { name: 'Mais opções' }));
    expect(screen.getByLabelText('Quantidade')).toHaveValue(12);
    expect(screen.getByLabelText('Minutos · de 1 a 300')).toHaveValue(47);
    expect(screen.getByRole('radio', { name: /Treino/ })).toBeChecked();
    expect(screen.getByLabelText('2014')).toBeChecked();
    expect(screen.getByLabelText('2021')).not.toBeChecked();
  });
});

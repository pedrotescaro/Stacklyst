import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EnadeConfiguration } from './EnadeConfiguration';
import { DEFAULT_CONFIG } from '@/lib/enade/simulator';
const push = vi.hoisted(() => vi.fn());
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
beforeEach(() => {
  localStorage.clear();
  push.mockClear();
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response('{}', { status: 200 }))
  );
});
afterEach(() => vi.unstubAllGlobals());
describe('Enade configuration', () => {
  it('validates counts, arbitrary minutes, selected years and no time limit', () => {
    render(<EnadeConfiguration userId="config-student" />);
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
    expect(push).toHaveBeenCalledWith('/trails/enade/personalizado');
    const saved = JSON.parse(localStorage.getItem('stacklyst:enade:workspace:v1:config-student')!);
    expect(saved.config).toMatchObject({ years: [2021], questionCount: 35, durationMinutes: null });
    expect(saved.session.seed).toBeTypeOf('number');
  });
  it('starts a session with only general or only specific questions in two clicks', () => {
    render(<EnadeConfiguration userId="config-student" />);
    expect(screen.getByRole('radio', { name: /Prova completa/ })).toBeChecked();
    fireEvent.click(screen.getByRole('radio', { name: /Só específicas/ }));
    expect(
      screen.getByText(/20 questões · componente específico · todas as edições/)
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar simulado' }));
    const saved = JSON.parse(localStorage.getItem('stacklyst:enade:workspace:v1:config-student')!);
    expect(saved.config.section).toBe('specific');
    expect(saved.session.questionIds).toHaveLength(20);

    localStorage.clear();
    fireEvent.click(screen.getByRole('radio', { name: /Só formação geral/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Mais opções' }));
    fireEvent.change(screen.getByRole('combobox', { name: 'Ano inicial' }), {
      target: { value: '2021' },
    });
    // One edition has 8 valid general objectives: the count follows the smaller pool.
    expect(screen.getByLabelText('Quantidade')).toHaveValue(8);
    expect(screen.getByRole('radio', { name: /Só formação geral.*8 questões/ })).toBeChecked();
  });
  it('reapplies the latest valid saved configuration scoped to the student', () => {
    const config = {
      ...DEFAULT_CONFIG,
      years: [2014, 2017],
      questionCount: 12,
      durationMinutes: 47,
      mode: 'training',
    };
    localStorage.setItem(
      'stacklyst:enade:workspace:v1:config-student',
      JSON.stringify({ version: 1, config, session: null, updatedAt: Date.now() })
    );
    render(<EnadeConfiguration userId="config-student" />);
    fireEvent.click(screen.getByRole('button', { name: 'Mais opções' }));
    expect(screen.getByLabelText('Quantidade')).toHaveValue(12);
    expect(screen.getByLabelText('Minutos · de 1 a 300')).toHaveValue(47);
    expect(screen.getByRole('radio', { name: /Treino/ })).toBeChecked();
    expect(screen.getByLabelText('2014')).toBeChecked();
    expect(screen.getByLabelText('2021')).not.toBeChecked();
  });
});

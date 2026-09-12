import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EvaluatorGuide } from '../EvaluatorGuide';

describe('EvaluatorGuide Component', () => {
  it('defaults to collapsed in evaluation context', () => {
    render(<EvaluatorGuide context="evaluation" />);

    expect(screen.getByText('Guia do Avaliador')).toBeInTheDocument();
    expect(screen.getByText('Ver Guia')).toBeInTheDocument();
    expect(screen.queryByText('Seu papel e suas responsabilidades')).not.toBeInTheDocument();
  });

  it('defaults to expanded in application context', () => {
    render(<EvaluatorGuide context="application" />);

    expect(screen.getByText('Guia do Avaliador')).toBeInTheDocument();
    expect(screen.getByText('Ocultar Guia')).toBeInTheDocument();
    expect(screen.getByText('Seu papel e suas responsabilidades')).toBeInTheDocument();
  });

  it('toggles expansion when clicking header or button', () => {
    render(<EvaluatorGuide context="evaluation" />);

    // Initially collapsed
    expect(screen.queryByText('Checklist antes de homologar')).not.toBeInTheDocument();

    // Click to expand
    fireEvent.click(screen.getByText('Ver Guia'));
    expect(screen.getByText('Checklist antes de homologar')).toBeInTheDocument();
    expect(screen.getByText('Ocultar Guia')).toBeInTheDocument();

    // Click header area to collapse
    const headerToggle = screen.getByRole('button', { name: /guia do avaliador/i });
    fireEvent.click(headerToggle);
    expect(screen.queryByText('Checklist antes de homologar')).not.toBeInTheDocument();
  });

  it('supports keyboard enter/space to toggle', () => {
    render(<EvaluatorGuide context="evaluation" />);

    const headerToggle = screen.getByRole('button', { name: /guia do avaliador/i });
    fireEvent.keyDown(headerToggle, { key: 'Enter' });
    expect(screen.getByText('Checklist antes de homologar')).toBeInTheDocument();

    fireEvent.keyDown(headerToggle, { key: ' ' });
    expect(screen.queryByText('Checklist antes de homologar')).not.toBeInTheDocument();
  });
});

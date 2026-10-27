import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { JobDetailContent } from './JobDetailContent';

vi.mock('@/components/Sidebar', () => ({ Sidebar: () => <aside /> }));

describe('candidate feedback', () => {
  it('shows the current stage and persisted feedback at the notification anchor', () => {
    render(
      <JobDetailContent
        user={{ id: 'candidate' }}
        job={{
          id: 'job',
          title: 'Frontend React',
          level: 'JUNIOR',
          modality: 'REMOTE',
          company: { name: 'Acme' },
          technologies: [],
          stages: [],
          userApplication: {
            status: 'INTERVIEW',
            stage: { title: 'Conversa técnica' },
            feedback: 'Seu teste passou. Vamos conversar.',
          },
        }}
      />
    );
    expect(screen.getByText('Conversa técnica')).toBeInTheDocument();
    expect(screen.getByText('Seu teste passou. Vamos conversar.')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Sua candidatura' })).toHaveAttribute(
      'id',
      'application'
    );
    expect(screen.queryByText('INTERVIEW')).not.toBeInTheDocument();
  });
});

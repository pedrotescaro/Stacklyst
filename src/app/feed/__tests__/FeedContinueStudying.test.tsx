import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FeedContinueStudying } from '@/app/feed/FeedContinueStudying';

describe('FeedContinueStudying', () => {
  it('links straight into the learner’s main course and hides where the rail exists', () => {
    render(
      <FeedContinueStudying
        trails={[
          { language: 'JS', xp: 120 },
          { language: 'PYTHON', xp: 900 },
        ]}
      />
    );
    const link = screen.getByTestId('feed-continue-studying');
    expect(link).toHaveAttribute('href', '/trails?resume=1&language=PYTHON');
    expect(link.className).toContain('xl:hidden');
    expect(link).toHaveTextContent('Continuar estudando');
    expect(link).toHaveTextContent('Python · Nível 3');
  });

  it('invites a first lesson when no trail is started', () => {
    render(<FeedContinueStudying trails={[]} />);
    const link = screen.getByTestId('feed-continue-studying');
    expect(link).toHaveAttribute('href', '/trails');
    expect(link).toHaveTextContent('Comece sua primeira lição');
  });
});

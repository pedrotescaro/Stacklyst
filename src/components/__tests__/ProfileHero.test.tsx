import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { ProfileHero } from '../ProfileHero';

const profile = {
  id: 'profile-1',
  username: 'pedrotescaro',
  avatar_url: 'https://lh3.googleusercontent.com/a/profile-photo',
  created_at: '2026-06-01T12:00:00.000Z',
  total_xp: 415,
  streak_days: 7,
};

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

describe('ProfileHero', () => {
  it('mostra logos apenas das trilhas que o perfil iniciou', async () => {
    const user = userEvent.setup();
    render(
      <ProfileHero
        currentUserId="profile-1"
        profile={profile}
        trails={[
          { language: 'JS', xp: 380, level: 1 },
          { language: 'PYTHON', xp: 35, level: 1 },
          { language: 'RUST', xp: 0, level: 1 },
        ]}
        following={false}
        followers={0}
        followingCount={3}
        onEdit={vi.fn()}
        onFollowToggle={vi.fn()}
        onShowFollowers={vi.fn()}
        onShowFollowing={vi.fn()}
      />
    );

    expect(screen.getByLabelText('Linguagens das trilhas iniciadas')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'JavaScript, nível 1' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Python, nível 1' })).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: 'Rust, nível 1' })).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Foto de pedrotescaro' })).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: /personagem/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /pixel art/i })).not.toBeInTheDocument();
    expect(screen.queryByText('{}')).not.toBeInTheDocument();
    expect(screen.queryByText('</>')).not.toBeInTheDocument();
    expect(screen.queryByText('();')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Abrir detalhes da ofensiva: 7 dias' }));
    expect(screen.getByRole('heading', { name: '7 dias de ofensiva' })).toBeInTheDocument();
  });

  it('permite desafiar outro perfil', async () => {
    const user = userEvent.setup();
    const onChallenge = vi.fn();
    render(
      <ProfileHero
        currentUserId="viewer-1"
        profile={profile}
        trails={[]}
        following={false}
        followers={0}
        followingCount={0}
        onEdit={vi.fn()}
        onFollowToggle={vi.fn()}
        onChallenge={onChallenge}
        onShowFollowers={vi.fn()}
        onShowFollowing={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Desafiar' }));
    expect(onChallenge).toHaveBeenCalledOnce();
  });
});

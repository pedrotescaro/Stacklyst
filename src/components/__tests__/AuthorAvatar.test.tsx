import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AuthorAvatar } from '../AuthorAvatar';

describe('AuthorAvatar', () => {
  it('prioriza a foto da conta em vez do personagem customizado', () => {
    render(
      <AuthorAvatar
        username="pedrotescaro"
        avatar_url="https://cdn.discordapp.com/avatars/user/photo.png"
        avatar_config={{ hair: 4 }}
      />
    );

    expect(screen.getByRole('img', { name: 'Foto de pedrotescaro' })).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: /personagem/i })).not.toBeInTheDocument();
  });

  it('usa iniciais quando a conta nao fornece uma foto', () => {
    render(<AuthorAvatar username="Pedro Tescaro" avatar_url={null} />);

    expect(screen.getByLabelText('Iniciais de Pedro Tescaro')).toHaveTextContent('PE');
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('mantem animacao sem proxy quando a foto do perfil e um GIF do KLIPY', () => {
    render(
      <AuthorAvatar
        username="pedrotescaro"
        avatar_url="https://static.klipy.com/ii/abc/14/af/avatar.webp"
      />
    );

    const img = screen.getByRole('img', { name: 'Foto de pedrotescaro' });
    expect(img).toHaveAttribute('src', 'https://static.klipy.com/ii/abc/14/af/avatar.webp');
  });
});

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_CHAT_PREFERENCES,
  DEFAULT_PROFILE_CATALOG,
  DEFAULT_PROFILE_PREFERENCES,
  type ProfileCustomizationState,
} from '@/lib/profile-customization';
import { SocialProfileOverview, type SocialProfile } from './SocialProfileOverview';

vi.mock('@/lib/client/current-user', () => ({ invalidateCurrentUser: vi.fn() }));
vi.mock('@/components/profile-customization/AvatarPhotoEditor', () => ({
  AvatarPhotoEditor: ({
    onPhotoSelected,
    onRemove,
  }: {
    onPhotoSelected: (file: File, url: string) => void;
    onRemove: () => void;
  }) => (
    <div>
      <button
        type="button"
        onClick={() =>
          onPhotoSelected(
            new File(['photo'], 'photo.jpg', { type: 'image/jpeg' }),
            'blob:profile-preview'
          )
        }
      >
        Preparar foto de teste
      </button>
      <button type="button" onClick={onRemove}>
        Remover foto de teste
      </button>
    </div>
  ),
}));
const profile: SocialProfile = {
  id: 'owner',
  username: 'developer',
  name: 'Nome anterior',
  avatar_url: null,
  bio: 'Bio anterior',
  created_at: '2026-01-01T12:00:00Z',
  total_xp: 10,
  avatar_config: { name: 'Nome anterior' },
  customization: {
    preferences: {
      ...structuredClone(DEFAULT_PROFILE_PREFERENCES),
      tags: ['python'],
      studies: ['Redes'],
    },
    achievements: [],
  },
};
let state: ProfileCustomizationState;
let writes: any[];
let uploads: number;
let failSave: boolean;
beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
  writes = [];
  uploads = 0;
  failSave = false;
  state = {
    version: 3,
    avatarUrl: null,
    preferences: structuredClone(profile.customization!.preferences),
    chat: structuredClone(DEFAULT_CHAT_PREFERENCES),
    catalog: structuredClone(DEFAULT_PROFILE_CATALOG),
    achievements: DEFAULT_PROFILE_CATALOG.achievements.map((item, index) => ({
      ...item,
      unlocked: index === 0,
      unlockedAt: index === 0 ? '2026-10-27T12:00:00Z' : null,
      progress: index === 0 ? 1 : 0,
    })),
    newUnlocks: [],
    profile: {
      displayName: 'Nome anterior',
      bio: 'Bio anterior',
      institution: null,
      pronouns: null,
      github_username: null,
      discord_username: null,
      birthday: null,
    },
  };
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      if (url.startsWith('/api/profile/tags')) return Response.json({ tags: ['python', 'react'] });
      if (url === '/api/upload') {
        uploads++;
        return Response.json({
          url: 'https://project.supabase.co/storage/v1/object/public/uploads/owner/01234567-89ab-cdef-0123-456789abcdef.jpg',
        });
      }
      if (init?.method === 'PUT') {
        const body = JSON.parse(init.body as string);
        writes.push(body);
        if (failSave) return Response.json({ message: 'Sem conexão temporária' }, { status: 503 });
        state = {
          ...state,
          version: state.version + 1,
          profile: { ...state.profile!, ...body.profile },
          preferences: body.preferences,
          avatarUrl: body.avatarUrl,
        };
      }
      return Response.json(state);
    })
  );
  vi.stubGlobal(
    'confirm',
    vi.fn(() => false)
  );
  Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() });
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
const mount = (owner = 'owner', selectedProfile = profile) => {
  const saved = vi.fn();
  const view = render(
    <SocialProfileOverview
      profile={selectedProfile}
      currentUserId={owner}
      following={false}
      followers={42}
      followingCount={10}
      onFollowToggle={vi.fn()}
      onShowFollowers={vi.fn()}
      onShowFollowing={vi.fn()}
      onSaved={saved}
    />
  );
  return { ...view, saved };
};
async function edit() {
  fireEvent.click(screen.getByRole('button', { name: 'Editar perfil' }));
  await screen.findByRole('textbox', { name: 'Nome de exibição' });
}
describe('Inline social profile editing', () => {
  it('offers a separate frame picker and persists a pride frame without changing the photo', async () => {
    mount();
    await edit();
    fireEvent.click(screen.getByRole('button', { name: 'Editar foto' }));
    expect(screen.queryByRole('heading', { name: 'Molduras' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Escolher moldura' }));
    expect(screen.getByRole('heading', { name: 'Molduras' })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Mostrar molduras'), { target: { value: 'pride' } });
    expect(screen.queryByRole('button', { name: 'Brasil' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Trans' }));
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));
    await waitFor(() => expect(writes).toHaveLength(1));
    await screen.findByRole('button', { name: 'Editar perfil' });
    expect(writes[0].preferences.frameId).toBe('pride-trans');
    expect(writes[0].avatarUrl).toBeNull();
  });
  it('keeps visitor controls read-only with social sections before content, without statistics or pencil controls', () => {
    mount('visitor');
    expect(screen.getByRole('heading', { name: 'Nome anterior' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Editar perfil' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Editar estudos' })).not.toBeInTheDocument();
    expect(screen.queryByText('Estatísticas')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'python' }).getAttribute('href')).toBe(
      '/explore?q=python'
    );
    expect(
      screen
        .getByLabelText('Tags e hobbies')
        .compareDocumentPosition(screen.getByLabelText('Estudando atualmente')) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });
  it('edits in place and saves basic data and preferences atomically without navigating or opening a modal', async () => {
    const { saved } = mount();
    await edit();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole('textbox', { name: 'Nome de exibição' }), {
      target: { value: 'Novo nome' },
    });
    fireEvent.change(screen.getByLabelText('Biografia'), { target: { value: 'Nova biografia' } });
    expect(writes).toHaveLength(0);
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));
    await screen.findByText('Perfil atualizado.');
    expect(writes).toHaveLength(1);
    expect(writes[0]).toMatchObject({
      version: 3,
      profile: { displayName: 'Novo nome', bio: 'Nova biografia' },
      preferences: { tags: ['python'] },
    });
    expect(writes[0]).not.toHaveProperty('userId');
    expect(saved).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Novo nome', bio: 'Nova biografia' })
    );
  });
  it('discards the local draft and restores the saved profile when canceling', async () => {
    mount();
    await edit();
    fireEvent.change(screen.getByRole('textbox', { name: 'Nome de exibição' }), {
      target: { value: 'Rascunho' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.getByRole('heading', { name: 'Nome anterior' })).toBeInTheDocument();
    expect(writes).toHaveLength(0);
    expect(screen.queryByRole('textbox', { name: 'Nome de exibição' })).not.toBeInTheDocument();
  });
  it('preserves fields after a failed save, supports retry and confirms leaving a dirty draft', async () => {
    const { container } = mount();
    await edit();
    failSave = true;
    fireEvent.change(screen.getByRole('textbox', { name: 'Nome de exibição' }), {
      target: { value: 'Rascunho preservado' },
    });
    const anchor = document.createElement('a');
    anchor.href = '/feed';
    container.append(anchor);
    const navigation = new MouseEvent('click', { bubbles: true, cancelable: true });
    anchor.dispatchEvent(navigation);
    expect(navigation.defaultPrevented).toBe(true);
    expect(window.confirm).toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));
    await screen.findByRole('alert');
    expect(screen.getByRole('textbox', { name: 'Nome de exibição' })).toHaveValue(
      'Rascunho preservado'
    );
    failSave = false;
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));
    await screen.findByText('Perfil atualizado.');
    expect(writes).toHaveLength(2);
  });
  it('keeps a photo in the local preview and reuses its upload after a failed atomic save', async () => {
    mount();
    await edit();
    fireEvent.click(screen.getByRole('button', { name: 'Editar foto' }));
    fireEvent.click(screen.getByRole('button', { name: 'Preparar foto de teste' }));
    expect(uploads).toBe(0);
    failSave = true;
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));
    await screen.findByRole('alert');
    expect(uploads).toBe(1);
    failSave = false;
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));
    await screen.findByText('Perfil atualizado.');
    expect(uploads).toBe(1);
    expect(writes[1].avatarUrl).toContain('/uploads/owner/');
  });
  it('adds a colored tag and structured study progress in contextual editors before save', async () => {
    mount();
    await edit();
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar ou editar tags' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Pesquisar ou criar tag' }), {
      target: { value: 'react' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cor da tag react: #ec4899' }));
    fireEvent.click(screen.getByRole('button', { name: 'Fechar adicionar ou editar tags' }));
    fireEvent.click(screen.getByRole('button', { name: 'Editar estudos' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Descrição curta' }), {
      target: { value: 'Protocolos e roteamento' },
    });
    fireEvent.change(screen.getByLabelText('Progresso (%)'), { target: { value: '65' } });
    expect(screen.getByRole('progressbar', { name: 'Progresso em Redes' })).toHaveAttribute(
      'aria-valuenow',
      '65'
    );
    expect(writes).toHaveLength(0);
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));
    await screen.findByText('Perfil atualizado.');
    expect(writes[0].preferences).toMatchObject({
      tags: ['python', 'react'],
      tagColors: { react: '#ec4899' },
      studyDetails: [
        {
          subject: 'Redes',
          description: 'Protocolos e roteamento',
          progress: 65,
          status: 'studying',
        },
      ],
    });
  });

  it('sends explicit banner reset while keeping unrelated legacy banner edits non-destructive', async () => {
    const bannerProfile = {
      ...profile,
      banner_url: 'https://project.supabase.co/legacy-cover.jpg',
    };
    state.bannerUrl = bannerProfile.banner_url;
    const saved = vi.fn();
    render(
      <SocialProfileOverview
        profile={bannerProfile}
        currentUserId="owner"
        following={false}
        followers={42}
        followingCount={10}
        onFollowToggle={vi.fn()}
        onShowFollowers={vi.fn()}
        onShowFollowing={vi.fn()}
        onSaved={saved}
      />
    );
    await edit();
    fireEvent.click(screen.getByRole('button', { name: 'Editar capa' }));
    fireEvent.change(screen.getByLabelText('Tipo de capa'), { target: { value: 'default' } });
    expect(screen.queryByRole('img', { name: 'Capa do perfil' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Fechar editar capa' }));
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));
    await screen.findByText('Perfil atualizado.');
    expect(writes[0]).toMatchObject({
      clearBanner: true,
      preferences: { banner: { mode: 'default' } },
    });
  });

  it('previews a solid banner and restores the saved color when the profile is reopened', async () => {
    const { saved, unmount } = mount();
    await edit();
    fireEvent.click(screen.getByRole('button', { name: 'Editar capa' }));
    fireEvent.change(screen.getByLabelText('Tipo de capa'), { target: { value: 'color' } });
    fireEvent.click(screen.getByRole('button', { name: 'Cor do banner: #ec4899' }));
    expect(writes).toHaveLength(0);
    fireEvent.click(screen.getByRole('button', { name: 'Fechar editar capa' }));
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));
    await screen.findByText('Perfil atualizado.');
    expect(writes[0].preferences.banner).toMatchObject({ mode: 'color', color: '#ec4899' });
    const savedProfile = saved.mock.calls[0][0];
    unmount();
    mount('owner', savedProfile);
    expect(
      (screen.getByLabelText('Perfil social').firstElementChild as HTMLElement).style.background
    ).toBe('rgb(236, 72, 153)');
    expect(screen.queryByRole('img', { name: 'Capa do perfil' })).not.toBeInTheDocument();
  });

  it('selects each gradient stop independently and saves both colors', async () => {
    const { saved, unmount } = mount();
    await edit();
    fireEvent.click(screen.getByRole('button', { name: 'Editar capa' }));
    fireEvent.change(screen.getByLabelText('Tipo de capa'), { target: { value: 'gradient' } });
    fireEvent.click(screen.getByRole('button', { name: 'Cor do banner: #22c55e' }));
    fireEvent.click(screen.getByRole('button', { name: 'Escolher segunda cor do degradê' }));
    fireEvent.click(screen.getByRole('button', { name: 'Segunda cor do banner: #8e63ce' }));
    fireEvent.click(screen.getByRole('button', { name: 'Escolher primeira cor do degradê' }));
    expect(screen.getByRole('button', { name: 'Cor do banner: #22c55e' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    fireEvent.click(screen.getByRole('button', { name: 'Fechar editar capa' }));
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));
    await screen.findByText('Perfil atualizado.');
    expect(writes[0].preferences.banner).toMatchObject({
      mode: 'gradient',
      color: '#22c55e',
      secondaryColor: '#8e63ce',
    });
    const savedProfile = saved.mock.calls[0][0];
    unmount();
    mount('owner', savedProfile);
    expect(
      (screen.getByLabelText('Perfil social').firstElementChild as HTMLElement).style.background
    ).toContain('linear-gradient(120deg');
  });

  it('discards banner colors on cancel without publishing the draft', async () => {
    mount();
    await edit();
    fireEvent.click(screen.getByRole('button', { name: 'Editar capa' }));
    fireEvent.change(screen.getByLabelText('Tipo de capa'), { target: { value: 'gradient' } });
    fireEvent.click(screen.getByRole('button', { name: 'Cor do banner: #ec4899' }));
    fireEvent.click(screen.getByRole('button', { name: 'Fechar editar capa' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(writes).toHaveLength(0);
    expect(
      (screen.getByLabelText('Perfil social').firstElementChild as HTMLElement).style.background
    ).toBe('');
  });

  it('blocks duplicate save requests while the first request is pending', async () => {
    mount();
    await edit();
    fireEvent.change(screen.getByRole('textbox', { name: 'Nome de exibição' }), {
      target: { value: 'Novo nome' },
    });
    const original = global.fetch;
    let release: () => void = () => {};
    const pending = new Promise<void>((resolve) => {
      release = resolve;
    });
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init?: RequestInit) => {
        if (init?.method === 'PUT') await pending;
        return original(url, init);
      })
    );
    const button = screen.getByRole('button', { name: 'Salvar alterações' });
    fireEvent.click(button);
    fireEvent.click(button);
    expect(screen.getByRole('button', { name: 'Salvando…' })).toBeDisabled();
    release();
    await screen.findByText('Perfil atualizado.');
    expect(writes).toHaveLength(1);
  });
});

'use client';
import { ColorPalette } from '@/components/ColorPalette';

import { useEffect, useId, useMemo, useRef, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Check,
  Eye,
  Flag,
  Frame,
  GraduationCap,
  Image as ImageIcon,
  Lock,
  MessageCircle,
  Music2,
  Palette,
  Plus,
  RotateCcw,
  Search,
  Tags,
  Trophy,
  Type,
  Upload,
  X,
} from 'lucide-react';
import {
  getProfileFlags,
  DEFAULT_CHAT_PREFERENCES,
  DEFAULT_PROFILE_PREFERENCES,
  profilePreferencesSchema,
  privateChatSchema,
  type ProfileCustomizationState,
  type ProfilePreferences,
  type PrivateChatPreferences,
} from '@/lib/profile-customization';
import { invalidateCurrentUser } from '@/lib/client/current-user';
import { AvatarFrame, ProfileName, ProfileTitle } from '@/components/profile/ProfileIdentity';
import { AchievementsPanel } from './AchievementsPanel';
import { AvatarPhotoEditor } from './AvatarPhotoEditor';
import { foregroundOn, profileAppearanceStyle, readableColor } from '@/lib/profile-style';
import styles from './Personalization.module.css';

export interface PersonalizationUser {
  id: string;
  username: string;
  avatar_url?: string | null;
  avatar_config?: unknown;
  banner_url?: string | null;
  role?: string;
}

const sections = [
  { id: 'appearance', label: 'Aparência', icon: Palette },
  { id: 'name', label: 'Nome e cores', icon: Type },
  { id: 'identity', label: 'Bandeira e título', icon: Flag },
  { id: 'achievements', label: 'Conquistas', icon: Trophy },
  { id: 'frames', label: 'Avatar e molduras', icon: Frame },
  { id: 'banner', label: 'Banner', icon: ImageIcon },
  { id: 'tags', label: 'Tags e interesses', icon: Tags },
  { id: 'music', label: 'Música do perfil', icon: Music2 },
  { id: 'studies', label: 'Estudando atualmente', icon: GraduationCap },
  { id: 'chat', label: 'Cores do chat', icon: MessageCircle },
] as const;
type SectionId = (typeof sections)[number]['id'];
const palette = [
  '#0083fe',
  '#b34feb',
  '#df2879',
  '#cf3d3d',
  '#e08915',
  '#389043',
  '#008a83',
  '#334cbd',
  '#ffffff',
  '#16181d',
];
const suggestions = [
  'python',
  'javascript',
  'typescript',
  'react',
  'linux',
  'design',
  'games',
  'java',
  'rust',
  'go',
  'anime',
  'ui-ux',
  'ciberseguranca',
];
const studySuggestions = [
  'Python',
  'Engenharia de Software',
  'React',
  'Inteligência Artificial',
  'Redes de Computadores',
  'Banco de Dados',
  'UI/UX Design',
  'Cibersegurança',
];
const presets = [
  { id: 'default', name: 'Padrão Stacklyst', colors: [null, null, null, null, null, null] },
  {
    id: 'midnight',
    name: 'Meia-noite',
    colors: ['#080b12', '#111824', '#293548', '#73b4ff', '#c4a0ff', '#1b62b3'],
  },
  {
    id: 'ocean',
    name: 'Azul claro',
    colors: ['#eaf4ff', '#ffffff', '#a4bfdc', '#075bbd', '#6135b4', '#075bbd'],
  },
  {
    id: 'violet',
    name: 'Roxo',
    colors: ['#1d142b', '#2a2039', '#554367', '#c4a6ff', '#ffb3dc', '#7442b5'],
  },
  {
    id: 'forest',
    name: 'Verde',
    colors: ['#10241d', '#19332a', '#3b6151', '#8de4b0', '#90cee0', '#217346'],
  },
  {
    id: 'rose',
    name: 'Rosa',
    colors: ['#fff0f5', '#ffffff', '#e5b3c7', '#a81859', '#67308c', '#a81859'],
  },
] as const;

function contrast(first: string, second: string) {
  const light = (hex: string) => {
    if (!/^#[\da-f]{6}$/i.test(hex)) return 0;
    const rgb = [1, 3, 5]
      .map((index) => parseInt(hex.slice(index, index + 2), 16) / 255)
      .map((value) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4));
    return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
  };
  const a = light(first),
    b = light(second);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

function ColorField({
  label,
  value,
  onChange,
  fallback = '#0083fe',
}: {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
  fallback?: string;
}) {
  const id = useId();
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <div className={styles.colorRow}>
        <ColorPalette
          id={id}
          value={/^#[\da-f]{6}$/i.test(value || '') ? value! : fallback}
          aria-label={label}
          onChange={(event) => onChange(event.target.value)}
        />

        <button
          type="button"
          className={styles.quietButton}
          onClick={() => onChange(null)}
          aria-label={`Restaurar ${label.toLowerCase()}`}
        >
          <RotateCcw size={15} />
        </button>
      </div>
    </div>
  );
}

function Preview({
  user,
  preferences,
  state,
}: {
  user: PersonalizationUser;
  preferences: ProfilePreferences;
  state: ProfileCustomizationState;
}) {
  const config = user.avatar_config as { name?: string; displayName?: string } | undefined;
  const name = config?.name || config?.displayName || user.username;
  const background = preferences.appearance.backgroundColor;
  const foreground =
    background && contrast(background, '#ffffff') > contrast(background, '#16181d')
      ? '#ffffff'
      : background
        ? '#16181d'
        : undefined;
  const flag = getProfileFlags().find((item) => item.id === preferences.flag);
  const title = state.achievements.find(
    (item) => item.id === preferences.equippedTitleId && item.unlocked
  );
  const frame = state.catalog.frames.find((item) => item.id === preferences.frameId);
  const banner = preferences.banner;
  const imageUrl =
    banner.mode === 'image'
      ? banner.imageUrl || user.banner_url
      : banner.mode === 'default'
        ? user.banner_url
        : null;
  const bannerStyle: CSSProperties = {
    background:
      banner.mode === 'gradient'
        ? `linear-gradient(120deg, ${banner.color}, ${banner.secondaryColor})`
        : banner.mode === 'default'
          ? '#0083fe'
          : banner.color,
  };
  return (
    <aside className={styles.previewColumn} aria-label="Pré-visualização do perfil">
      <p className={styles.previewHeading}>
        <Eye size={15} />
        Pré-visualização ao vivo
      </p>
      <div
        className={styles.preview}
        data-testid="profile-live-preview"
        style={
          {
            ...profileAppearanceStyle(preferences),
            '--preview-profile-background': background || 'var(--color-dd-bg)',
            backgroundColor: background || undefined,
            color: foreground,
            borderColor: preferences.appearance.borderColor || undefined,
          } as CSSProperties
        }
      >
        <div className={styles.previewBanner} style={bannerStyle}>
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Prévia do banner"
              style={{ objectPosition: `${banner.positionX}% ${banner.positionY}%` }}
            />
          )}
        </div>
        <div className={styles.previewBody}>
          <AvatarFrame
            frame={frame && frame.id !== 'none' ? frame : undefined}
            className={styles.previewAvatar}
          >
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={`Foto de ${user.username}`} />
            ) : (
              user.username.slice(0, 2).toUpperCase()
            )}
          </AvatarFrame>
          <p
            className={styles.previewName}
            style={{
              fontWeight: 600,
            }}
          >
            <ProfileName
              config={{ profileStyle: { nameStyle: preferences.nameStyle } }}
              background={background}
            >
              {name}
            </ProfileName>
          </p>
          <div className={styles.previewMeta}>
            {flag && <img src={flag.imageUrl} alt={flag.label} />}
            {title && <ProfileTitle title={title} />}
          </div>
          <p className={styles.previewMuted}>@{user.username}</p>
          <div
            className={styles.previewColorSample}
            style={{
              backgroundColor: preferences.appearance.cardColor || undefined,
              color: preferences.appearance.cardColor
                ? foregroundOn(preferences.appearance.cardColor)
                : undefined,
              borderColor: preferences.appearance.borderColor || undefined,
            }}
          >
            <p
              style={{
                color: preferences.appearance.secondaryColor
                  ? readableColor(
                      preferences.appearance.secondaryColor,
                      preferences.appearance.cardColor || background || '#ffffff'
                    )
                  : undefined,
              }}
            >
              Prévia das cores do perfil
            </p>
            <span
              className={styles.previewAccent}
              style={{
                color: preferences.appearance.accentColor
                  ? readableColor(
                      preferences.appearance.accentColor,
                      preferences.appearance.cardColor || background || '#ffffff'
                    )
                  : undefined,
              }}
            >
              Comunidade Stacklyst
            </span>
            <span
              className={styles.previewAction}
              style={{
                backgroundColor: preferences.appearance.buttonColor || 'var(--color-dd-accent)',
                color: foregroundOn(preferences.appearance.buttonColor || '#0083fe'),
              }}
            >
              Seguir
            </span>
          </div>
          {preferences.tags.length > 0 && (
            <div
              className={styles.previewSection}
              style={{ borderColor: preferences.appearance.borderColor || undefined }}
            >
              <h4>Interesses</h4>
              <div className={styles.previewTags}>
                {preferences.tags.map((tag) => (
                  <span key={tag}>#{tag}</span>
                ))}
              </div>
            </div>
          )}
          {preferences.studies.length > 0 && (
            <div
              className={styles.previewSection}
              style={{ borderColor: preferences.appearance.borderColor || undefined }}
            >
              <h4>Estudando atualmente</h4>
              <p className={styles.previewMuted}>{preferences.studies.join(' · ')}</p>
            </div>
          )}
          {preferences.music && (
            <div
              className={styles.previewSection}
              style={{ borderColor: preferences.appearance.borderColor || undefined }}
            >
              <h4>Música do perfil</h4>
              <p className={styles.previewMuted}>
                {preferences.music.title || 'Faixa do Spotify'}
                {preferences.music.artist ? ` · ${preferences.music.artist}` : ''}
              </p>
            </div>
          )}
          {preferences.featuredAchievementIds.length > 0 && (
            <div
              className={styles.previewSection}
              style={{ borderColor: preferences.appearance.borderColor || undefined }}
            >
              <h4>Conquistas em destaque</h4>
              <div className={styles.previewTags}>
                {preferences.featuredAchievementIds
                  .map((id) => state.achievements.find((item) => item.id === id && item.unlocked))
                  .filter(Boolean)
                  .map((item) => (
                    <span key={item!.id}>{item!.name}</span>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <p className={styles.help} style={{ marginTop: 12 }}>
        As mudanças ficam públicas depois de salvar. As cores do chat são visíveis somente para
        você.
      </p>
    </aside>
  );
}

export function ProfilePersonalizationEditor({
  user,
  initialSection = 'appearance',
}: {
  user: PersonalizationUser;
  initialSection?: SectionId;
}) {
  const [state, setState] = useState<ProfileCustomizationState | null>(null);
  const [preferences, setPreferences] = useState<ProfilePreferences>(DEFAULT_PROFILE_PREFERENCES);
  const [chat, setChat] = useState<PrivateChatPreferences>(DEFAULT_CHAT_PREFERENCES);
  const [section, setSection] = useState<SectionId>(initialSection);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [flagQuery, setFlagQuery] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [existingTags, setExistingTags] = useState<string[]>([]);
  const [studyInput, setStudyInput] = useState('');
  const [musicUrl, setMusicUrl] = useState('');
  const [musicQuery, setMusicQuery] = useState('');
  const [musicResults, setMusicResults] = useState<NonNullable<ProfilePreferences['music']>[]>([]);
  const [musicBusy, setMusicBusy] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user.avatar_url || null);
  const [savedAvatarUrl, setSavedAvatarUrl] = useState<string | null>(user.avatar_url || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [defaultBackground, setDefaultBackground] = useState('#ffffff');
  const uploadRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLElement>(null);
  const savedJson = state
    ? JSON.stringify({ preferences: state.preferences, chat: state.chat })
    : '';
  const photoDirty = Boolean(avatarFile || avatarUrl !== savedAvatarUrl);
  const dirty = Boolean(
    state && (JSON.stringify({ preferences, chat }) !== savedJson || photoDirty)
  );
  const flags = useMemo(
    () =>
      getProfileFlags().filter((item) =>
        `${item.label} ${item.id}`
          .toLocaleLowerCase('pt-BR')
          .includes(flagQuery.toLocaleLowerCase('pt-BR'))
      ),
    [flagQuery]
  );
  const unlocked = state?.achievements.filter((item) => item.unlocked) || [];
  const profileBackground = preferences.appearance.backgroundColor || defaultBackground;
  const nameContrast = preferences.nameStyle.color
    ? contrast(preferences.nameStyle.color, profileBackground)
    : null;

  useEffect(
    () => () => {
      if (avatarUrl?.startsWith('blob:')) URL.revokeObjectURL(avatarUrl);
    },
    [avatarUrl]
  );

  useEffect(() => {
    setDefaultBackground(
      document.documentElement.classList.contains('dark') ? '#08090b' : '#ffffff'
    );
    const controller = new AbortController();
    void fetch('/api/profile/customization', { cache: 'no-store', signal: controller.signal })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok)
          throw new Error(
            result.message || result.error || 'Não foi possível carregar sua personalização.'
          );
        setState(result);
        setPreferences(result.preferences);
        setChat(result.chat);
        setAvatarUrl(result.avatarUrl ?? null);
        setSavedAvatarUrl(result.avatarUrl ?? null);
        if (result.preferences.music)
          setMusicUrl(`https://open.spotify.com/track/${result.preferences.music.trackId}`);
        if (result.newUnlocks?.length)
          setNotice(
            `Novas conquistas: ${result.achievements
              .filter((item: { id: string }) => result.newUnlocks.includes(item.id))
              .map((item: { name: string }) => item.name)
              .join(', ')}.`
          );
      })
      .catch((failure) => {
        if (!controller.signal.aborted)
          setError(failure.message || 'Não foi possível carregar o perfil.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  useEffect(() => {
    if (section !== 'tags' || tagInput.trim().length < 2) {
      setExistingTags([]);
      return;
    }
    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      void fetch(`/api/profile/tags?q=${encodeURIComponent(tagInput.trim())}`, {
        signal: controller.signal,
      })
        .then(async (response) => {
          if (!response.ok) return;
          const result = await response.json();
          if (!controller.signal.aborted && Array.isArray(result.tags))
            setExistingTags(result.tags);
        })
        .catch(() => undefined);
    }, 220);
    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [tagInput, section]);

  const updateAppearance = (key: keyof ProfilePreferences['appearance'], value: string | null) =>
    setPreferences((current) => ({
      ...current,
      appearance: { ...current.appearance, [key]: value },
    }));
  const updateBanner = (values: Partial<ProfilePreferences['banner']>) =>
    setPreferences((current) => ({ ...current, banner: { ...current.banner, ...values } }));
  const changeSection = (next: SectionId) => {
    setSection(next);
    setError('');
    editorRef.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
  };

  async function save() {
    if (!state) return;
    setError('');
    setNotice('');
    const parsed = profilePreferencesSchema.safeParse(preferences);
    const parsedChat = privateChatSchema.safeParse(chat);
    if (!parsed.success || !parsedChat.success) {
      const issue = !parsed.success
        ? parsed.error.issues[0]
        : !parsedChat.success
          ? parsedChat.error.issues[0]
          : null;
      setError(issue?.message || 'Revise os campos antes de salvar.');
      return;
    }
    if (nameContrast !== null && nameContrast < 4.5) {
      setSection('name');
      setError('A cor do nome precisa ter contraste de pelo menos 4,5:1 com o fundo do perfil.');
      return;
    }
    setSaving(true);
    try {
      let photoToSave = avatarUrl;
      if (avatarFile) {
        const form = new FormData();
        form.append('file', avatarFile);
        const uploadResponse = await fetch('/api/upload', { method: 'POST', body: form });
        const uploadResult = await uploadResponse.json();
        if (!uploadResponse.ok || typeof uploadResult.url !== 'string')
          throw new Error(
            uploadResult.message ||
              uploadResult.error ||
              'Não foi possível enviar a foto. Tente salvar novamente.'
          );
        photoToSave = uploadResult.url;
        setAvatarUrl(photoToSave);
        setAvatarFile(null);
      }
      const response = await fetch('/api/profile/customization', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferences: parsed.data,
          chat: parsedChat.data,
          version: state.version,
          ...(photoDirty ? { avatarUrl: photoToSave } : {}),
        }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          response.status === 409
            ? 'Seu perfil foi alterado em outra aba. Recarregue a página antes de salvar para preservar as duas versões.'
            : result.message || result.error || 'Não foi possível salvar.'
        );
      setState(result);
      setPreferences(result.preferences);
      setChat(result.chat);
      setAvatarUrl(result.avatarUrl ?? null);
      setSavedAvatarUrl(result.avatarUrl ?? null);
      invalidateCurrentUser();
      window.dispatchEvent(new Event('stacklyst:profile-customization'));
      setNotice('Personalização salva. Seu perfil já está atualizado.');
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : 'Não foi possível salvar. Suas escolhas continuam aqui.'
      );
    } finally {
      setSaving(false);
    }
  }

  function addItem(kind: 'tags' | 'studies', value: string) {
    const clean =
      kind === 'tags'
        ? value.trim().replace(/^#+/, '').toLocaleLowerCase('pt-BR').replace(/\s+/g, '-')
        : value.trim();
    const max = kind === 'tags' ? 10 : 3;
    const limit = kind === 'tags' ? 24 : 60;
    if (!clean) return;
    if (preferences[kind].length >= max) {
      setError(
        `Você pode adicionar até ${max} ${kind === 'tags' ? 'tags' : 'assuntos de estudo'}.`
      );
      return;
    }
    if (
      clean.length < 2 ||
      clean.length > limit ||
      (kind === 'tags' && !/^[\p{L}\p{N}_+-]+$/u.test(clean))
    ) {
      setError(
        kind === 'tags'
          ? 'Use de 2 a 24 letras, números, +, hífen ou sublinhado na tag.'
          : 'O assunto deve ter entre 2 e 60 caracteres.'
      );
      return;
    }
    if (
      preferences[kind].some(
        (item) => item.toLocaleLowerCase('pt-BR') === clean.toLocaleLowerCase('pt-BR')
      )
    ) {
      setError('Esse item já está na sua lista.');
      return;
    }
    setPreferences({ ...preferences, [kind]: [...preferences[kind], clean] });
    setError('');
    if (kind === 'tags') setTagInput('');
    else setStudyInput('');
  }

  function moveTag(index: number, direction: number) {
    const tags = [...preferences.tags];
    const target = index + direction;
    if (target < 0 || target >= tags.length) return;
    [tags[index], tags[target]] = [tags[target], tags[index]];
    setPreferences({ ...preferences, tags });
  }

  async function uploadBanner(file?: File) {
    if (!file) return;
    if (
      !['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type) ||
      file.size > 5 * 1024 * 1024
    ) {
      setError('Envie uma imagem JPEG, PNG, WebP ou GIF de até 5 MB.');
      return;
    }
    setUploadBusy(true);
    setError('');
    try {
      const form = new FormData();
      form.append('file', file);
      const response = await fetch('/api/upload', { method: 'POST', body: form });
      const result = await response.json();
      if (!response.ok || typeof result.url !== 'string')
        throw new Error(result.message || result.error || 'Não foi possível enviar o banner.');
      updateBanner({ imageUrl: result.url, mode: 'image', positionX: 50, positionY: 50 });
      setNotice('Imagem enviada. Ajuste o enquadramento e salve a personalização.');
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Não foi possível enviar a imagem.');
    } finally {
      setUploadBusy(false);
      if (uploadRef.current) uploadRef.current.value = '';
    }
  }

  async function resolveMusic() {
    if (!musicUrl.trim()) {
      setError('Cole o link de uma faixa do Spotify.');
      return;
    }
    setMusicBusy(true);
    setError('');
    try {
      const response = await fetch('/api/profile/music/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: musicUrl.trim() }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || result.error || 'Não foi possível consultar essa faixa.');
      setPreferences((current) => ({ ...current, music: result }));
      setNotice('Faixa selecionada. Salve para exibi-la no perfil.');
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : 'Não foi possível consultar o Spotify.'
      );
    } finally {
      setMusicBusy(false);
    }
  }

  async function searchMusic() {
    if (musicQuery.trim().length < 2) return;
    setMusicBusy(true);
    setError('');
    try {
      const response = await fetch(
        `/api/profile/music/search?q=${encodeURIComponent(musicQuery.trim())}`,
        { cache: 'no-store' }
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || 'A pesquisa está indisponível. Use um link da faixa.');
      setMusicResults(result.tracks || []);
      if (result.configured === false)
        setNotice(
          'A pesquisa do Spotify ainda não está configurada. Você pode selecionar a música pelo link da faixa.'
        );
      else if (!result.tracks?.length)
        setNotice('Nenhuma faixa encontrada. Tente outro termo ou cole um link.');
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : 'Não foi possível pesquisar. Use o link da faixa.'
      );
    } finally {
      setMusicBusy(false);
    }
  }

  const heading = sections.find((item) => item.id === section)!;
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.back} href={`/profile/${encodeURIComponent(user.username)}`}>
          <ArrowLeft size={17} />
          Voltar ao meu perfil
        </Link>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>
            {initialSection === 'achievements' ? 'Minhas Conquistas' : 'Personalizar perfil'}
          </h1>
          <Link className={styles.quietButton} href="/achievements">
            <Trophy size={16} />
            Minhas Conquistas
          </Link>
          {user.role === 'ADMIN' && (
            <Link className={styles.quietButton} href="/admin/profile-catalog">
              Administrar catálogo
            </Link>
          )}
        </div>
        <p className={styles.subtitle}>
          Escolha como você aparece na comunidade. A prévia acompanha suas mudanças; o perfil só
          muda quando você salva.
        </p>
      </header>
      {loading ? (
        <main className={styles.achievementPage} aria-busy="true">
          <p className={styles.help}>Carregando sua personalização…</p>
          <div className={styles.skeleton} />
          <div className={styles.skeleton} />
          <div className={styles.skeleton} />
        </main>
      ) : !state ? (
        <main className={styles.achievementPage}>
          <p role="alert" className={styles.error}>
            {error}
          </p>
          <button className={styles.button} type="button" onClick={() => window.location.reload()}>
            Tentar novamente
          </button>
        </main>
      ) : (
        <div className={styles.layout}>
          <nav className={styles.navigation} aria-label="Categorias de personalização">
            {sections.map(({ id, label, icon: Icon }) => (
              <button
                type="button"
                className={styles.navButton}
                key={id}
                aria-current={section === id ? 'page' : undefined}
                onClick={() => changeSection(id)}
              >
                <Icon size={17} aria-hidden="true" />
                {label}
              </button>
            ))}
          </nav>
          <main ref={editorRef} className={styles.editor}>
            <h2 className={styles.sectionTitle}>{heading.label}</h2>
            <p className={styles.sectionDescription}>
              {
                {
                  appearance:
                    'Seu espaço, com as cores que combinam com você. O tema fica restrito ao seu perfil e será visto por quem visitar sua página.',
                  name: 'Dê destaque ao seu nome sem perder a legibilidade. Sua identificação e o @ de usuário continuam preservados.',
                  identity:
                    'Escolha uma bandeira e um título que você já conquistou. Eles aparecem próximos ao seu nome.',
                  achievements:
                    'Acompanhe metas reais, equipe seu título e selecione os destaques públicos do perfil.',
                  frames:
                    'Troque sua foto, ajuste o recorte e escolha uma moldura. Algumas opções são liberadas por conquistas e eventos.',
                  banner:
                    'Use uma imagem, cor ou gradiente. Ajuste o enquadramento para preservar o que importa em qualquer tela.',
                  tags: 'Adicione até dez interesses. Use as setas para escolher a ordem em que aparecem no perfil.',
                  music:
                    'Mostre sua faixa favorita com o Spotify. A reprodução usa o player oficial e nunca começa automaticamente.',
                  studies:
                    'Conte à comunidade o que está aprendendo agora. Você pode mostrar até três assuntos ou deixar a seção oculta.',
                  chat: 'Essas preferências são privadas. Elas mudam a sua visualização das conversas, sem alterar o tema das outras pessoas.',
                }[section]
              }
            </p>
            {error && (
              <p role="alert" className={styles.error}>
                {error}
              </p>
            )}
            {notice && (
              <p role="status" className={styles.notice}>
                {notice}
              </p>
            )}
            <fieldset
              disabled={saving || uploadBusy || musicBusy}
              style={{ minWidth: 0, border: 0, padding: 0 }}
            >
              {section === 'appearance' && (
                <>
                  <div className={styles.choices} aria-label="Temas prontos">
                    {presets.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        className={styles.choice}
                        aria-pressed={preferences.appearance.backgroundColor === preset.colors[0]}
                        onClick={() =>
                          setPreferences({
                            ...preferences,
                            appearance: {
                              backgroundColor: preset.colors[0],
                              cardColor: preset.colors[1],
                              borderColor: preset.colors[2],
                              accentColor: preset.colors[3],
                              secondaryColor: preset.colors[4],
                              buttonColor: preset.colors[5],
                            },
                          })
                        }
                      >
                        <span className={styles.choiceSwatch}>
                          {preset.colors.slice(0, 3).map((color, index) => (
                            <i
                              key={index}
                              style={{
                                backgroundColor: color || ['#08090b', '#181b20', '#0083fe'][index],
                              }}
                            />
                          ))}
                        </span>
                        <span>{preset.name}</span>
                      </button>
                    ))}
                  </div>
                  <div className={styles.split}>
                    {(
                      [
                        ['backgroundColor', 'Fundo do perfil'],
                        ['cardColor', 'Fundo dos cartões'],
                        ['borderColor', 'Cor das bordas'],
                        ['accentColor', 'Cor de destaque'],
                        ['secondaryColor', 'Destaque secundário'],
                        ['buttonColor', 'Cor dos botões'],
                      ] as const
                    ).map(([key, label]) => (
                      <ColorField
                        key={key}
                        label={label}
                        value={preferences.appearance[key]}
                        onChange={(value) => updateAppearance(key, value)}
                      />
                    ))}
                  </div>
                  <p className={styles.help}>
                    Deixe o código vazio para herdar a aparência padrão. O servidor valida as cores
                    e o contraste antes de salvar.
                  </p>
                </>
              )}
              {section === 'name' && (
                <>
                  <ColorField
                    label="Cor do nome"
                    value={preferences.nameStyle.color}
                    onChange={(color) =>
                      setPreferences({
                        ...preferences,
                        nameStyle: { ...preferences.nameStyle, color },
                      })
                    }
                  />
                  <div className={styles.swatches} aria-label="Cores sugeridas para o nome">
                    {palette.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={styles.swatch}
                        style={{ backgroundColor: color }}
                        aria-label={`Nome ${color}`}
                        aria-pressed={preferences.nameStyle.color === color}
                        onClick={() =>
                          setPreferences({
                            ...preferences,
                            nameStyle: { ...preferences.nameStyle, color },
                          })
                        }
                      />
                    ))}
                  </div>
                  <div className={styles.row} style={{ marginBottom: 20 }}>
                    {(
                      [
                        ['bold', 'Negrito', <strong key="b">B</strong>],
                        ['italic', 'Itálico', <em key="i">I</em>],
                        ['underline', 'Sublinhado', <u key="u">U</u>],
                      ] as const
                    ).map(([key, label, mark]) => (
                      <button
                        key={key}
                        type="button"
                        className={styles.styleToggle}
                        aria-label={label}
                        aria-pressed={preferences.nameStyle[key]}
                        onClick={() =>
                          setPreferences({
                            ...preferences,
                            nameStyle: {
                              ...preferences.nameStyle,
                              [key]: !preferences.nameStyle[key],
                            },
                          })
                        }
                      >
                        {mark}
                      </button>
                    ))}
                  </div>
                  {nameContrast !== null && (
                    <p className={nameContrast < 4.5 ? styles.error : styles.help}>
                      Contraste com o fundo: {nameContrast.toFixed(2)}:1. Mínimo para salvar: 4,5:1.
                    </p>
                  )}
                  <button
                    type="button"
                    className={styles.quietButton}
                    onClick={() =>
                      setPreferences({
                        ...preferences,
                        nameStyle: DEFAULT_PROFILE_PREFERENCES.nameStyle,
                      })
                    }
                  >
                    <RotateCcw size={15} />
                    Restaurar estilo do nome
                  </button>
                  <p className={styles.help} style={{ marginTop: 18 }}>
                    Para alterar o texto do nome, sua foto ou biografia, use “Editar perfil” na sua
                    página.
                  </p>
                </>
              )}
              {section === 'identity' && (
                <>
                  <label className={styles.field}>
                    <span className={styles.label}>Pesquisar bandeira</span>
                    <input
                      className={styles.input}
                      value={flagQuery}
                      onChange={(event) => setFlagQuery(event.target.value)}
                      placeholder="País ou código, como Brasil ou BR"
                    />
                  </label>
                  <div className={styles.flags}>
                    <button
                      type="button"
                      className={styles.flag}
                      aria-pressed={!preferences.flag}
                      onClick={() => setPreferences({ ...preferences, flag: null })}
                    >
                      <X size={18} />
                      <span>Sem bandeira</span>
                    </button>
                    {flags.map((flag) => (
                      <button
                        key={flag.id}
                        type="button"
                        className={styles.flag}
                        aria-pressed={preferences.flag === flag.id}
                        onClick={() => setPreferences({ ...preferences, flag: flag.id })}
                      >
                        <img src={flag.imageUrl} alt="" />
                        <span>{flag.label}</span>
                        {preferences.flag === flag.id && <Check size={14} />}
                      </button>
                    ))}
                  </div>
                  <label className={styles.field}>
                    <span className={styles.label}>Título principal</span>
                    <select
                      className={styles.select}
                      value={preferences.equippedTitleId || ''}
                      onChange={(event) =>
                        setPreferences({
                          ...preferences,
                          equippedTitleId: event.target.value || null,
                        })
                      }
                    >
                      <option value="">Sem título</option>
                      {unlocked.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  {unlocked.length === 0 && (
                    <p className={styles.notice}>
                      Seus títulos aparecerão aqui conforme você conquistar metas. Consulte a seção
                      Conquistas para acompanhar o progresso.
                    </p>
                  )}
                </>
              )}
              {section === 'achievements' && (
                <AchievementsPanel
                  achievements={state.achievements}
                  events={state.catalog.events}
                  preferences={preferences}
                  onChange={setPreferences}
                />
              )}
              {section === 'frames' && (
                <>
                  <AvatarPhotoEditor
                    avatarUrl={avatarUrl}
                    username={user.username}
                    disabled={saving || uploadBusy}
                    onPhotoSelected={(file, previewUrl) => {
                      setAvatarFile(file);
                      setAvatarUrl(previewUrl);
                      setError('');
                      setNotice(
                        'Foto preparada. Salve a personalização para atualizar seu perfil.'
                      );
                    }}
                    onRemove={() => {
                      setAvatarFile(null);
                      setAvatarUrl(null);
                      setNotice('Foto removida da prévia. Salve para confirmar.');
                    }}
                    onError={setError}
                  />
                  <h3 className={styles.label} style={{ marginBottom: 16 }}>
                    Moldura do avatar
                  </h3>
                  <div className={styles.choices} aria-label="Molduras de avatar">
                    {state.catalog.frames.map((frame) => {
                      const available =
                        !frame.achievementId ||
                        unlocked.some((achievement) => achievement.id === frame.achievementId);
                      return (
                        <button
                          type="button"
                          className={styles.choice}
                          key={frame.id}
                          disabled={!available}
                          aria-label={frame.name}
                          aria-pressed={preferences.frameId === frame.id}
                          onClick={() => setPreferences({ ...preferences, frameId: frame.id })}
                        >
                          <AvatarFrame
                            frame={frame.id === 'none' ? null : frame}
                            className={styles.frameSample}
                          >
                            {avatarUrl ? (
                              <img src={avatarUrl} alt="" />
                            ) : (
                              user.username.slice(0, 2).toUpperCase()
                            )}
                          </AvatarFrame>
                          <span>{frame.name}</span>
                          {!available && (
                            <span className={styles.help}>
                              <Lock size={12} style={{ display: 'inline', marginRight: 4 }} />
                              {state.achievements.find((item) => item.id === frame.achievementId)
                                ?.name || 'Conquista necessária'}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <Link href="/avatar" className={styles.quietButton}>
                    Personalizar avatar ilustrado
                  </Link>
                </>
              )}
              {section === 'banner' && (
                <>
                  <label className={styles.field}>
                    <span className={styles.label}>Tipo de banner</span>
                    <select
                      className={styles.select}
                      value={preferences.banner.mode}
                      onChange={(event) =>
                        updateBanner({
                          mode: event.target.value as ProfilePreferences['banner']['mode'],
                        })
                      }
                    >
                      <option value="default">Banner padrão / imagem existente</option>
                      <option value="color">Cor sólida</option>
                      <option value="gradient">Gradiente</option>
                      <option value="image">Imagem personalizada</option>
                    </select>
                  </label>
                  {(preferences.banner.mode === 'color' ||
                    preferences.banner.mode === 'gradient') && (
                    <ColorField
                      label="Cor do banner"
                      value={preferences.banner.color}
                      onChange={(color) => updateBanner({ color: color || '#0083fe' })}
                    />
                  )}
                  {preferences.banner.mode === 'gradient' && (
                    <ColorField
                      label="Segunda cor do banner"
                      value={preferences.banner.secondaryColor}
                      onChange={(secondaryColor) =>
                        updateBanner({ secondaryColor: secondaryColor || '#7c3aed' })
                      }
                    />
                  )}
                  {preferences.banner.mode === 'image' && (
                    <>
                      <input
                        ref={uploadRef}
                        type="file"
                        className={styles.hiddenInput}
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        aria-label="Imagem do banner"
                        onChange={(event) => void uploadBanner(event.target.files?.[0])}
                      />
                      <button
                        type="button"
                        className={styles.button}
                        disabled={uploadBusy}
                        onClick={() => uploadRef.current?.click()}
                      >
                        <Upload size={16} />
                        {uploadBusy ? 'Enviando imagem…' : 'Enviar imagem do banner'}
                      </button>
                      <p className={styles.help} style={{ margin: '9px 0 22px' }}>
                        JPEG, PNG, WebP ou GIF, até 5 MB. A prévia mostra o corte responsivo.
                      </p>
                      <label className={styles.field}>
                        <span className={styles.label}>
                          Posição horizontal: {preferences.banner.positionX}%
                        </span>
                        <input
                          type="range"
                          className={styles.range}
                          min={0}
                          max={100}
                          value={preferences.banner.positionX}
                          onChange={(event) =>
                            updateBanner({ positionX: Number(event.target.value) })
                          }
                        />
                      </label>
                      <label className={styles.field}>
                        <span className={styles.label}>
                          Posição vertical: {preferences.banner.positionY}%
                        </span>
                        <input
                          type="range"
                          className={styles.range}
                          min={0}
                          max={100}
                          value={preferences.banner.positionY}
                          onChange={(event) =>
                            updateBanner({ positionY: Number(event.target.value) })
                          }
                        />
                      </label>
                    </>
                  )}
                  <button
                    type="button"
                    className={styles.quietButton}
                    onClick={() =>
                      setPreferences({ ...preferences, banner: DEFAULT_PROFILE_PREFERENCES.banner })
                    }
                  >
                    <RotateCcw size={15} />
                    Restaurar banner padrão
                  </button>
                </>
              )}
              {section === 'tags' && (
                <>
                  <div className={styles.chipList}>
                    {preferences.tags.map((tag, index) => (
                      <span className={styles.chip} key={tag}>
                        #{tag}
                        <button
                          type="button"
                          aria-label={`Mover ${tag} para antes`}
                          disabled={index === 0}
                          onClick={() => moveTag(index, -1)}
                        >
                          <ArrowUp size={12} />
                        </button>
                        <button
                          type="button"
                          aria-label={`Mover ${tag} para depois`}
                          disabled={index === preferences.tags.length - 1}
                          onClick={() => moveTag(index, 1)}
                        >
                          <ArrowDown size={12} />
                        </button>
                        <button
                          type="button"
                          aria-label={`Remover tag ${tag}`}
                          onClick={() =>
                            setPreferences({
                              ...preferences,
                              tags: preferences.tags.filter((value) => value !== tag),
                            })
                          }
                        >
                          <X size={13} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <label className={styles.label} htmlFor="profile-tag">
                    Adicionar interesse ({preferences.tags.length}/10)
                  </label>
                  <div className={styles.addRow}>
                    <input
                      id="profile-tag"
                      className={styles.input}
                      value={tagInput}
                      maxLength={24}
                      list="profile-tag-suggestions"
                      placeholder="Ex.: python"
                      onChange={(event) => setTagInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          addItem('tags', tagInput);
                        }
                      }}
                    />
                    <button
                      type="button"
                      className={styles.button}
                      onClick={() => addItem('tags', tagInput)}
                    >
                      <Plus size={15} />
                      Adicionar
                    </button>
                  </div>
                  <datalist id="profile-tag-suggestions">
                    {[...new Set([...existingTags, ...suggestions])].map((value) => (
                      <option key={value} value={value} />
                    ))}
                  </datalist>
                  <p className={styles.help}>
                    Letras, números, hífen ou sublinhado. Tags repetidas não são adicionadas.
                  </p>
                </>
              )}
              {section === 'studies' && (
                <>
                  <div className={styles.chipList}>
                    {preferences.studies.map((subject) => (
                      <span className={styles.chip} key={subject}>
                        {subject}
                        <button
                          type="button"
                          aria-label={`Remover estudo ${subject}`}
                          onClick={() =>
                            setPreferences({
                              ...preferences,
                              studies: preferences.studies.filter((value) => value !== subject),
                            })
                          }
                        >
                          <X size={13} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <label className={styles.label} htmlFor="profile-study">
                    Adicionar assunto ({preferences.studies.length}/3)
                  </label>
                  <div className={styles.addRow}>
                    <input
                      id="profile-study"
                      className={styles.input}
                      value={studyInput}
                      maxLength={60}
                      list="profile-study-suggestions"
                      placeholder="Ex.: Engenharia de Software"
                      onChange={(event) => setStudyInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          addItem('studies', studyInput);
                        }
                      }}
                    />
                    <button
                      type="button"
                      className={styles.button}
                      onClick={() => addItem('studies', studyInput)}
                    >
                      <Plus size={15} />
                      Adicionar
                    </button>
                  </div>
                  <datalist id="profile-study-suggestions">
                    {studySuggestions.map((value) => (
                      <option key={value} value={value} />
                    ))}
                  </datalist>
                  <p className={styles.help}>
                    Deixe a lista vazia para ocultar esta seção do perfil.
                  </p>
                </>
              )}
              {section === 'music' && (
                <>
                  <label className={styles.field}>
                    <span className={styles.label}>Link da faixa no Spotify</span>
                    <input
                      className={styles.input}
                      type="url"
                      value={musicUrl}
                      onChange={(event) => setMusicUrl(event.target.value)}
                      placeholder="https://open.spotify.com/track/..."
                    />
                  </label>
                  <div className={styles.row}>
                    <button
                      type="button"
                      className={styles.button}
                      disabled={musicBusy}
                      onClick={() => void resolveMusic()}
                    >
                      <Music2 size={16} />
                      {musicBusy ? 'Consultando Spotify…' : 'Selecionar faixa pelo link'}
                    </button>
                    {preferences.music && (
                      <button
                        type="button"
                        className={styles.quietButton}
                        onClick={() => {
                          setPreferences({ ...preferences, music: null });
                          setMusicUrl('');
                        }}
                      >
                        Remover música
                      </button>
                    )}
                  </div>
                  {preferences.music && (
                    <div className={styles.music}>
                      {preferences.music.artworkUrl && (
                        <img src={preferences.music.artworkUrl} alt="Capa da faixa selecionada" />
                      )}
                      <div className={styles.musicText}>
                        <strong>{preferences.music.title || 'Faixa do Spotify'}</strong>
                        <p>{preferences.music.artist || 'Metadados indisponíveis no momento'}</p>
                        <a
                          href={`https://open.spotify.com/track/${preferences.music.trackId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.help}
                        >
                          Ouvir no Spotify
                        </a>
                      </div>
                    </div>
                  )}
                  <div className={styles.field} style={{ marginTop: 26 }}>
                    <label className={styles.label} htmlFor="profile-music-search">
                      Pesquisar música
                    </label>
                    <div className={styles.addRow}>
                      <input
                        id="profile-music-search"
                        className={styles.input}
                        value={musicQuery}
                        onChange={(event) => setMusicQuery(event.target.value)}
                        placeholder="Nome da faixa ou artista"
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault();
                            void searchMusic();
                          }
                        }}
                      />
                      <button
                        type="button"
                        className={styles.button}
                        disabled={musicBusy}
                        onClick={() => void searchMusic()}
                        aria-label="Pesquisar música"
                      >
                        <Search size={17} />
                      </button>
                    </div>
                  </div>
                  {musicResults.map((track) => (
                    <div key={track.trackId} className={styles.music}>
                      {track.artworkUrl && <img src={track.artworkUrl} alt="" />}
                      <div className={styles.musicText}>
                        <strong>{track.title}</strong>
                        <p>{track.artist}</p>
                      </div>
                      <button
                        type="button"
                        className={styles.button}
                        onClick={() => {
                          setPreferences({ ...preferences, music: track });
                          setMusicUrl(`https://open.spotify.com/track/${track.trackId}`);
                          setMusicResults([]);
                        }}
                      >
                        Selecionar
                      </button>
                    </div>
                  ))}
                  <p className={styles.help}>
                    A pesquisa depende da configuração da API. A seleção por link continua
                    disponível sem conectar uma conta Spotify. Nenhum áudio é baixado e não há
                    autoplay.
                  </p>
                </>
              )}
              {section === 'chat' && (
                <>
                  <label className={styles.field}>
                    <span className={styles.label}>Tema das suas conversas</span>
                    <select
                      className={styles.select}
                      value={chat.mode}
                      onChange={(event) =>
                        setChat({
                          ...chat,
                          mode: event.target.value as PrivateChatPreferences['mode'],
                        })
                      }
                    >
                      <option value="default">Padrão do aplicativo</option>
                      <option value="dark">Escuro</option>
                      <option value="custom">Personalizado</option>
                    </select>
                  </label>
                  {chat.mode === 'custom' && (
                    <>
                      <ColorField
                        label="Cor das suas mensagens"
                        value={chat.bubbleColor}
                        onChange={(bubbleColor) => setChat({ ...chat, bubbleColor })}
                      />
                      <ColorField
                        label="Destaque das conversas"
                        value={chat.accentColor}
                        onChange={(accentColor) => setChat({ ...chat, accentColor })}
                      />
                      <ColorField
                        label="Fundo das conversas"
                        value={chat.backgroundColor}
                        onChange={(backgroundColor) => setChat({ ...chat, backgroundColor })}
                      />
                    </>
                  )}
                  <div
                    className={styles.preview}
                    style={{
                      padding: 18,
                      backgroundColor:
                        chat.mode === 'dark' ? '#08090b' : chat.backgroundColor || undefined,
                    }}
                  >
                    <p
                      style={{
                        backgroundColor: chat.bubbleColor || '#0076e5',
                        color:
                          chat.bubbleColor && contrast(chat.bubbleColor, '#fff') < 4.5
                            ? '#111827'
                            : '#fff',
                        padding: '10px 13px',
                        borderRadius: '12px 12px 3px 12px',
                        marginLeft: 18,
                        fontSize: 13,
                      }}
                    >
                      Suas mensagens aparecem assim.
                    </p>
                    <p
                      className={styles.help}
                      style={{ marginTop: 12, color: chat.mode === 'dark' ? '#b5bdca' : undefined }}
                    >
                      Prévia privada · não muda as cores de outra pessoa
                    </p>
                  </div>
                </>
              )}
            </fieldset>
          </main>
          <Preview
            user={{ ...user, avatar_url: avatarUrl }}
            preferences={preferences}
            state={state}
          />
        </div>
      )}
      {state && (
        <footer className={styles.footer}>
          <div className={styles.footerInner}>
            <p className={styles.saveState}>
              {saving
                ? 'Salvando personalização…'
                : dirty
                  ? 'Você tem alterações não salvas.'
                  : 'Suas escolhas estão salvas.'}
            </p>
            <div className={styles.row}>
              <button
                type="button"
                className={styles.button}
                disabled={saving || !dirty}
                onClick={() => {
                  setPreferences(state.preferences);
                  setChat(state.chat);
                  setAvatarFile(null);
                  setAvatarUrl(savedAvatarUrl);
                  setError('');
                  setNotice('Alterações descartadas.');
                }}
              >
                Descartar
              </button>
              <button
                type="button"
                className={styles.primary}
                disabled={saving || uploadBusy || musicBusy || !dirty}
                onClick={() => void save()}
              >
                <Check size={16} />
                {saving ? 'Salvando…' : 'Salvar'}
              </button>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

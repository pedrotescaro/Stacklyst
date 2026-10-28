'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
} from 'react';
import {
  ArrowDown,
  ArrowUp,
  Award,
  Camera,
  Check,
  GraduationCap,
  Link2,
  Lock,
  MapPin,
  Music2,
  Palette,
  Pencil,
  Plus,
  Tags,
  Trash2,
  Type,
  X,
} from 'lucide-react';
import { FollowButton } from '@/components/motion/FollowButton';
import {
  AvatarFrame,
  ProfileFlag,
  ProfileName,
  ProfileTitle,
} from '@/components/profile/ProfileIdentity';
import { AvatarPhotoEditor } from '@/components/profile-customization/AvatarPhotoEditor';
import { invalidateCurrentUser } from '@/lib/client/current-user';
import {
  parseProfilePreferences,
  profilePreferencesSchema,
  type ProfileCustomizationState,
  type ProfilePreferences,
} from '@/lib/profile-customization';
import { readProfileIdentity, readableColor } from '@/lib/profile-style';
import type { PublicProfileCustomization } from '@/components/profile/ProfilePublic';
import { ContextPopover } from './ContextPopover';
import { FlagSelector } from './FlagSelector';
import { MusicSelector } from './MusicSelector';
import styles from './InlineProfile.module.css';

export interface SocialProfile {
  id: string;
  username: string;
  name?: string | null;
  bio?: string | null;
  institution?: string | null;
  pronouns?: string | null;
  birthday?: string | null;
  github_username?: string | null;
  discord_username?: string | null;
  banner_url?: string | null;
  avatar_url?: string | null;
  avatar_config?: unknown;
  created_at: string;
  total_xp: number;
  customization?: PublicProfileCustomization | null;
}
type Basics = {
  displayName: string;
  bio: string | null;
  institution: string | null;
  pronouns: string | null;
  github_username: string | null;
  discord_username: string | null;
  birthday: string | null;
};
type Study = {
  subject: string;
  description: string | null;
  progress: number | null;
  status: 'studying' | 'paused' | 'completed';
};

function initialBasics(profile: SocialProfile): Basics {
  const config = profile.avatar_config as { name?: string; displayName?: string } | undefined;
  return {
    displayName: profile.name || config?.name || config?.displayName || profile.username,
    bio: profile.bio || null,
    institution: profile.institution || null,
    pronouns: profile.pronouns || null,
    github_username: profile.github_username || null,
    discord_username: profile.discord_username || null,
    birthday: profile.birthday?.slice(0, 10) || null,
  };
}
function studiesOf(preferences: ProfilePreferences): Study[] {
  return preferences.studyDetails?.length
    ? preferences.studyDetails
    : preferences.studies.map((subject) => ({
        subject,
        description: null,
        progress: null,
        status: 'studying',
      }));
}
function flagsOf(preferences: ProfilePreferences) {
  return preferences.flags?.length ? preferences.flags : preferences.flag ? [preferences.flag] : [];
}

function useUnsavedProfile(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const warning = 'Você tem alterações não salvas. Sair e descartar essas alterações?';
    const before = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    const click = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest('a[href]') : null;
      if (
        !(target instanceof HTMLAnchorElement) ||
        target.target === '_blank' ||
        target.href === location.href ||
        (target.hash && new URL(target.href).pathname === location.pathname)
      )
        return;
      if (!window.confirm(warning)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };
    let restoring = false;
    const back = () => {
      if (restoring) {
        restoring = false;
        return;
      }
      if (!window.confirm(warning)) {
        restoring = true;
        history.forward();
      }
    };
    window.addEventListener('beforeunload', before);
    document.addEventListener('click', click, true);
    window.addEventListener('popstate', back);
    return () => {
      window.removeEventListener('beforeunload', before);
      document.removeEventListener('click', click, true);
      window.removeEventListener('popstate', back);
    };
  }, [dirty]);
}

async function uploadImage(file: File) {
  const form = new FormData();
  form.append('file', file);
  const response = await fetch('/api/upload', { method: 'POST', body: form });
  const result = await response.json();
  if (!response.ok || typeof result.url !== 'string')
    throw new Error(result.message || result.error || 'Não foi possível enviar a imagem.');
  return result.url as string;
}

export function SocialProfileOverview({
  profile,
  currentUserId,
  following,
  onFollowToggle,
  onChallenge,
  onSaved,
  onPreview,
}: {
  profile: SocialProfile;
  currentUserId: string;
  following: boolean;
  onFollowToggle: () => Promise<void>;
  onChallenge?: () => void;
  onSaved: (profile: SocialProfile) => void;
  onPreview?: (preferences: ProfilePreferences | null) => void;
}) {
  const isOwner = profile.id === currentUserId;
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [state, setState] = useState<ProfileCustomizationState | null>(null);
  const [preferences, setPreferences] = useState(() =>
    parseProfilePreferences(profile.customization?.preferences)
  );
  const [basics, setBasics] = useState(() => initialBasics(profile));
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.avatar_url || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [clearBanner, setClearBanner] = useState(false);
  const [baseline, setBaseline] = useState('');
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const [frameFilter, setFrameFilter] = useState('all');
  const savePending = useRef(false);
  const readRequest = useRef<AbortController | null>(null);
  const urls = useRef<Set<string>>(new Set());
  const localDraft = JSON.stringify({ preferences, basics, avatarUrl });
  const dirty =
    editing && (Boolean(avatarFile || bannerFile || clearBanner) || localDraft !== baseline);
  useUnsavedProfile(dirty);

  useEffect(() => {
    if (editing) return;
    setPreferences(parseProfilePreferences(profile.customization?.preferences));
    setBasics(initialBasics(profile));
    setAvatarUrl(profile.avatar_url || null);
  }, [profile, editing]);
  useEffect(() => {
    onPreview?.(editing ? preferences : null);
  }, [editing, preferences, onPreview]);
  useEffect(
    () => () => {
      readRequest.current?.abort();
      urls.current.forEach((url) => URL.revokeObjectURL(url));
    },
    []
  );
  useEffect(() => {
    if (!editing || tagInput.trim().length < 2) {
      setTagSuggestions([]);
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void fetch(`/api/profile/tags?q=${encodeURIComponent(tagInput.trim())}`, {
        signal: controller.signal,
      })
        .then((r) => (r.ok ? r.json() : { tags: [] }))
        .then((data) => setTagSuggestions(Array.isArray(data.tags) ? data.tags.slice(0, 6) : []))
        .catch(() => undefined);
    }, 300);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [editing, tagInput]);

  const loadState = useCallback(async () => {
    readRequest.current?.abort();
    const controller = new AbortController();
    readRequest.current = controller;
    const response = await fetch('/api/profile/customization', {
      cache: 'no-store',
      signal: controller.signal,
    });
    const result = await response.json();
    if (!response.ok)
      throw new Error(result.message || result.error || 'Não foi possível carregar o editor.');
    return result as ProfileCustomizationState;
  }, []);
  const startEditing = async () => {
    if (!isOwner || loading || editing) return;
    setLoading(true);
    setError('');
    setFeedback('');
    try {
      const loaded = await loadState();
      const nextBasics = { ...initialBasics(profile), ...loaded.profile };
      const nextPreferences = parseProfilePreferences(loaded.preferences);
      setState(loaded);
      setPreferences(nextPreferences);
      setBasics(nextBasics);
      setAvatarUrl(loaded.avatarUrl);
      setAvatarFile(null);
      setBannerFile(null);
      setBannerPreview(null);
      setClearBanner(false);
      setBaseline(
        JSON.stringify({
          preferences: nextPreferences,
          basics: nextBasics,
          avatarUrl: loaded.avatarUrl,
        })
      );
      setEditing(true);
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : 'Não foi possível abrir a edição. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };
  const cancel = () => {
    if (saving) return;
    setEditing(false);
    setAvatarFile(null);
    setBannerFile(null);
    setBannerPreview(null);
    setClearBanner(false);
    setError('');
    setFeedback('Alterações descartadas.');
  };
  const save = async () => {
    if (!isOwner || !state || savePending.current) return;
    setError('');
    setFeedback('');
    const parsed = profilePreferencesSchema.safeParse(preferences);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || 'Confira as opções de personalização.');
      return;
    }
    if (!basics.displayName.trim()) {
      setError('Informe um nome de exibição.');
      return;
    }
    savePending.current = true;
    setSaving(true);
    try {
      let nextAvatar = avatarUrl;
      let nextPreferences = parsed.data;
      if (avatarFile) {
        nextAvatar = await uploadImage(avatarFile);
        setAvatarUrl(nextAvatar);
        setAvatarFile(null);
      }
      if (bannerFile) {
        const imageUrl = await uploadImage(bannerFile);
        nextPreferences = {
          ...nextPreferences,
          banner: { ...nextPreferences.banner, mode: 'image', imageUrl },
        };
        setPreferences(nextPreferences);
        setBannerFile(null);
        setBannerPreview(null);
      }
      const response = await fetch('/api/profile/customization', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          version: state.version,
          preferences: nextPreferences,
          profile: basics,
          avatarUrl: nextAvatar,
          ...(clearBanner && nextPreferences.banner.mode === 'default'
            ? { clearBanner: true }
            : {}),
        }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          response.status === 409
            ? 'Seu perfil foi alterado em outra sessão. Suas escolhas continuam aqui. Recarregue a página para comparar antes de salvar.'
            : result.message || result.error || 'Não foi possível salvar as alterações.'
        );
      const saved = result as ProfileCustomizationState;
      setState(saved);
      const savedBasics = { ...basics, ...saved.profile };
      const title = saved.achievements.find(
        (item) => item.id === saved.preferences.equippedTitleId && item.unlocked
      );
      const frame = saved.catalog.frames.find(
        (item) => item.id === saved.preferences.frameId && item.id !== 'none'
      );
      const currentConfig =
        profile.avatar_config && typeof profile.avatar_config === 'object'
          ? (profile.avatar_config as Record<string, unknown>)
          : {};
      const updated: SocialProfile = {
        ...profile,
        ...savedBasics,
        name: savedBasics.displayName,
        avatar_url: saved.avatarUrl,
        banner_url:
          saved.bannerUrl !== undefined
            ? saved.bannerUrl
            : saved.preferences.banner.mode === 'image'
              ? saved.preferences.banner.imageUrl
              : clearBanner
                ? null
                : profile.banner_url,
        avatar_config: {
          ...currentConfig,
          name: savedBasics.displayName,
          displayName: savedBasics.displayName,
          profileStyle: {
            nameStyle: saved.preferences.nameStyle,
            flag: saved.preferences.flag,
            flags: saved.preferences.flags,
            frame: frame || null,
            title: title || null,
          },
        },
        customization: {
          preferences: saved.preferences,
          achievements: saved.achievements.filter(
            (item) => saved.preferences.featuredAchievementIds.includes(item.id) && item.unlocked
          ),
        },
      };
      setPreferences(saved.preferences);
      setBasics(savedBasics);
      setAvatarUrl(saved.avatarUrl);
      setAvatarFile(null);
      setBannerFile(null);
      setClearBanner(false);
      setEditing(false);
      onSaved(updated);
      invalidateCurrentUser();
      window.dispatchEvent(new Event('stacklyst:profile-customization'));
      setFeedback('Perfil atualizado.');
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : 'Sem conexão. Suas alterações continuam aqui; tente salvar novamente.'
      );
    } finally {
      savePending.current = false;
      setSaving(false);
    }
  };
  const updatePreference = <K extends keyof ProfilePreferences>(
    key: K,
    value: ProfilePreferences[K]
  ) => setPreferences((current) => ({ ...current, [key]: value }));
  const updateStudy = (index: number, change: Partial<Study>) => {
    const details = studiesOf(preferences).map((item, i) =>
      i === index ? { ...item, ...change } : item
    );
    setPreferences((current) => ({
      ...current,
      studyDetails: details,
      studies: details.map((item) => item.subject),
    }));
  };
  const updateTags = (tags: string[], colors = preferences.tagColors || {}) =>
    setPreferences((current) => ({
      ...current,
      tags,
      tagColors: Object.fromEntries(Object.entries(colors).filter(([key]) => tags.includes(key))),
    }));
  const addTag = (input = tagInput) => {
    const tag = input.trim().replace(/^#/, '').toLowerCase();
    if (!/^[\p{L}\p{N}_+-]{2,24}$/u.test(tag)) {
      setError('Use de 2 a 24 letras, números, +, - ou _ na tag.');
      return;
    }
    if (preferences.tags.length >= 10) {
      setError('Você pode escolher até dez tags.');
      return;
    }
    if (!preferences.tags.includes(tag)) updateTags([...preferences.tags, tag]);
    setTagInput('');
    setError('');
  };
  const chooseBanner = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (
      !['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type) ||
      file.size > 5 * 1024 * 1024
    ) {
      setError('Escolha uma imagem JPEG, PNG, WebP ou GIF de até 5 MB.');
      return;
    }
    const url = URL.createObjectURL(file);
    urls.current.add(url);
    try {
      const image = new Image();
      image.src = url;
      await image.decode();
      if (
        image.naturalWidth < 32 ||
        image.naturalHeight < 32 ||
        image.naturalWidth * image.naturalHeight > 40_000_000
      )
        throw new Error('Use uma imagem de pelo menos 32 × 32 pixels e até 40 megapixels.');
      setBannerFile(file);
      setBannerPreview(url);
      setClearBanner(false);
      setPreferences((current) => ({
        ...current,
        banner: { ...current.banner, mode: 'image', positionX: 50, positionY: 50 },
      }));
      setError('');
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Não foi possível abrir a imagem.');
    }
  };

  const activePreferences = editing
    ? preferences
    : parseProfilePreferences(profile.customization?.preferences);
  const activeBasics = editing ? basics : initialBasics(profile);
  const activeAvatar = editing ? avatarUrl : profile.avatar_url;
  const background = activePreferences.appearance.backgroundColor;
  const identity = readProfileIdentity(profile.avatar_config);
  const frame = editing
    ? state?.catalog.frames.find(
        (item) => item.id === activePreferences.frameId && item.id !== 'none'
      )
    : identity.frame;
  const title = editing
    ? state?.achievements.find(
        (item) => item.id === activePreferences.equippedTitleId && item.unlocked
      )
    : identity.title;
  const banner = activePreferences.banner;
  const bannerImage =
    editing && bannerPreview
      ? bannerPreview
      : banner.mode === 'image'
        ? banner.imageUrl
        : banner.mode === 'default'
          ? editing && clearBanner
            ? null
            : editing && state?.bannerUrl !== undefined
              ? state.bannerUrl
              : profile.banner_url
          : null;
  const coverStyle: CSSProperties = {
    background:
      banner.mode === 'color'
        ? banner.color
        : banner.mode === 'gradient'
          ? `linear-gradient(120deg,${banner.color},${banner.secondaryColor})`
          : undefined,
  };
  const selectedFlags = flagsOf(activePreferences);
  const activeStudies = studiesOf(activePreferences);
  const busy = saving || loading;
  const collections = state?.achievements || [];
  const ownedIds = new Set(collections.filter((item) => item.unlocked).map((item) => item.id));

  return (
    <section className={styles.overview} aria-label="Perfil social" data-editing={editing}>
      <div className={styles.cover} style={coverStyle}>
        {bannerImage && (
          <img
            src={bannerImage}
            alt="Capa do perfil"
            style={{ objectPosition: `${banner.positionX}% ${banner.positionY}%` }}
          />
        )}
        {editing && (
          <div className={styles.coverEdit}>
            <ContextPopover
              label="Editar capa"
              triggerIcon={<Camera size={15} />}
              className={styles.photoEditButton}
              disabled={busy}
            >
              <div className={styles.popoverBody}>
                <h3 className={styles.popoverHeading}>Capa do perfil</h3>
                <label className={styles.field}>
                  Imagem da capa
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={chooseBanner}
                    disabled={busy}
                  />
                </label>
                <label className={styles.field}>
                  Tipo de capa
                  <select
                    className={styles.select}
                    value={banner.mode}
                    onChange={(event) => {
                      setClearBanner(event.target.value === 'default');
                      if (event.target.value !== 'image') {
                        setBannerFile(null);
                        setBannerPreview(null);
                      }
                      updatePreference('banner', {
                        ...banner,
                        mode: event.target.value as typeof banner.mode,
                      });
                    }}
                    disabled={busy}
                  >
                    <option value="default">Padrão</option>
                    <option value="image">Imagem</option>
                    <option value="color">Cor</option>
                    <option value="gradient">Gradiente</option>
                  </select>
                </label>
                {(banner.mode === 'color' || banner.mode === 'gradient') && (
                  <div className={styles.rowWrap}>
                    <label className={styles.field}>
                      Cor
                      <input
                        type="color"
                        value={banner.color}
                        onChange={(event) =>
                          updatePreference('banner', { ...banner, color: event.target.value })
                        }
                      />
                    </label>
                    {banner.mode === 'gradient' && (
                      <label className={styles.field}>
                        Segunda cor
                        <input
                          type="color"
                          value={banner.secondaryColor}
                          onChange={(event) =>
                            updatePreference('banner', {
                              ...banner,
                              secondaryColor: event.target.value,
                            })
                          }
                        />
                      </label>
                    )}
                  </div>
                )}
                {banner.mode === 'image' && (
                  <>
                    <label className={styles.field}>
                      Posição horizontal
                      <input
                        className={styles.range}
                        type="range"
                        min="0"
                        max="100"
                        value={banner.positionX}
                        onChange={(event) =>
                          updatePreference('banner', {
                            ...banner,
                            positionX: Number(event.target.value),
                          })
                        }
                      />
                    </label>
                    <label className={styles.field}>
                      Posição vertical
                      <input
                        className={styles.range}
                        type="range"
                        min="0"
                        max="100"
                        value={banner.positionY}
                        onChange={(event) =>
                          updatePreference('banner', {
                            ...banner,
                            positionY: Number(event.target.value),
                          })
                        }
                      />
                    </label>
                    <button
                      className={styles.button}
                      type="button"
                      onClick={() => {
                        setBannerFile(null);
                        setBannerPreview(null);
                        setClearBanner(true);
                        updatePreference('banner', { ...banner, mode: 'default', imageUrl: null });
                      }}
                    >
                      Remover imagem
                    </button>
                  </>
                )}
                <p className={styles.help}>
                  Até 5 MB. A capa só será publicada ao salvar as alterações.
                </p>
              </div>
            </ContextPopover>
          </div>
        )}
      </div>
      <div className={styles.body}>
        <div className={styles.avatarRow}>
          <AvatarFrame frame={frame} className={styles.avatar}>
            {activeAvatar ? (
              <img src={activeAvatar} alt={`Foto de ${profile.username}`} />
            ) : (
              <span>{activeBasics.displayName.slice(0, 2).toUpperCase()}</span>
            )}
          </AvatarFrame>
          {editing && (
            <div className={styles.avatarAction}>
              <ContextPopover
                label="Editar foto e moldura"
                triggerIcon={<Camera size={15} />}
                className={styles.photoEditButton}
                disabled={busy}
              >
                <div className={styles.popoverBody}>
                  <AvatarPhotoEditor
                    avatarUrl={avatarUrl}
                    username={profile.username}
                    disabled={busy}
                    onPhotoSelected={(file, url) => {
                      urls.current.add(url);
                      setAvatarFile(file);
                      setAvatarUrl(url);
                    }}
                    onRemove={() => {
                      setAvatarFile(null);
                      setAvatarUrl(null);
                    }}
                    onError={setError}
                  />
                  <h3 className={styles.popoverHeading}>Molduras</h3>
                  <label className={styles.field}>
                    Mostrar molduras
                    <select
                      className={styles.select}
                      value={frameFilter}
                      onChange={(event) => setFrameFilter(event.target.value)}
                    >
                      <option value="all">Todas</option>
                      <option value="free">Gratuitas</option>
                      <option value="earned">Desbloqueadas</option>
                      <option value="locked">Indisponíveis</option>
                      <option value="seasonal">Sazonais</option>
                    </select>
                  </label>
                  <div className={styles.frameGrid}>
                    {state?.catalog.frames
                      .filter(
                        (item) =>
                          frameFilter === 'all' ||
                          (frameFilter === 'free' && !item.achievementId) ||
                          (frameFilter === 'earned' &&
                            Boolean(item.achievementId && ownedIds.has(item.achievementId))) ||
                          (frameFilter === 'locked' &&
                            Boolean(item.achievementId && !ownedIds.has(item.achievementId))) ||
                          (frameFilter === 'seasonal' &&
                            ['halloween', 'christmas', 'hat'].includes(item.decoration))
                      )
                      .map((item) => {
                        const locked = Boolean(
                          item.achievementId && !ownedIds.has(item.achievementId)
                        );
                        return (
                          <button
                            type="button"
                            key={item.id}
                            className={styles.frameChoice}
                            aria-label={item.name}
                            aria-pressed={preferences.frameId === item.id}
                            disabled={locked || busy}
                            onClick={() => updatePreference('frameId', item.id)}
                          >
                            <AvatarFrame
                              className={styles.frameAvatar}
                              frame={item.id === 'none' ? null : item}
                            >
                              {avatarUrl && <img src={avatarUrl} alt="" />}
                            </AvatarFrame>
                            <span>
                              {locked && <Lock size={10} aria-hidden="true" />} {item.name}
                            </span>
                          </button>
                        );
                      })}
                  </div>
                </div>
              </ContextPopover>
            </div>
          )}
          <div className={styles.actions}>
            {isOwner ? (
              editing ? (
                <>
                  <button
                    type="button"
                    className={styles.button}
                    onClick={cancel}
                    disabled={saving}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className={styles.primary}
                    onClick={() => void save()}
                    disabled={busy || !dirty}
                  >
                    <Check size={14} aria-hidden="true" />
                    {saving ? 'Salvando…' : 'Salvar alterações'}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className={styles.button}
                  onClick={() => void startEditing()}
                  disabled={loading}
                >
                  {loading ? 'Abrindo edição…' : 'Editar perfil'}
                </button>
              )
            ) : (
              <>
                <FollowButton isFollowing={following} onToggle={onFollowToggle} />
                {onChallenge && (
                  <button type="button" className={styles.button} onClick={onChallenge}>
                    Desafiar
                  </button>
                )}
              </>
            )}
          </div>
        </div>
        {error && (
          <p className={styles.message} role="alert">
            {error}
          </p>
        )}
        {feedback && (
          <p className={styles.message} role="status">
            {feedback}
          </p>
        )}
        <div className={styles.identity}>
          <h1 className={styles.name}>
            {editing ? (
              <input
                className={styles.nameInput}
                aria-label="Nome de exibição"
                value={basics.displayName}
                maxLength={50}
                onChange={(event) =>
                  setBasics((current) => ({ ...current, displayName: event.target.value }))
                }
                disabled={saving}
              />
            ) : (
              <ProfileName config={profile.avatar_config} background={background}>
                {activeBasics.displayName}
              </ProfileName>
            )}
          </h1>
          {editing && (
            <ContextPopover label="Estilo do nome" triggerIcon={<Type size={14} />} disabled={busy}>
              <div className={styles.popoverBody}>
                <h3 className={styles.popoverHeading}>Estilo do nome</h3>
                <label className={styles.field}>
                  Cor do nome
                  <input
                    type="color"
                    value={preferences.nameStyle.color || '#0083fe'}
                    onChange={(event) =>
                      updatePreference('nameStyle', {
                        ...preferences.nameStyle,
                        color: event.target.value,
                      })
                    }
                  />
                </label>
                <div className={styles.rowWrap}>
                  {(
                    [
                      ['bold', 'Negrito'],
                      ['italic', 'Itálico'],
                      ['underline', 'Sublinhado'],
                    ] as const
                  ).map(([key, label]) => (
                    <label className={styles.row} key={key}>
                      <input
                        type="checkbox"
                        checked={preferences.nameStyle[key]}
                        onChange={(event) =>
                          updatePreference('nameStyle', {
                            ...preferences.nameStyle,
                            [key]: event.target.checked,
                          })
                        }
                      />
                      {label}
                    </label>
                  ))}
                </div>
                <button
                  className={styles.button}
                  type="button"
                  onClick={() =>
                    updatePreference('nameStyle', {
                      color: null,
                      bold: false,
                      italic: false,
                      underline: false,
                    })
                  }
                >
                  Restaurar padrão
                </button>
              </div>
            </ContextPopover>
          )}
          <span className={styles.flags}>
            {selectedFlags.map((flag) => (
              <ProfileFlag key={flag} code={flag} />
            ))}
          </span>
          {title && <ProfileTitle title={title} background={background} />}
          {editing && (
            <ContextPopover
              label="Escolher bandeiras"
              triggerIcon={<Plus size={14} />}
              disabled={busy}
            >
              <FlagSelector
                value={flagsOf(preferences)}
                onChange={(flags) =>
                  setPreferences((current) => ({ ...current, flags, flag: flags[0] || null }))
                }
              />
            </ContextPopover>
          )}
          {editing && (
            <ContextPopover
              label="Escolher título"
              triggerIcon={<Award size={14} />}
              disabled={busy}
            >
              <div className={styles.popoverBody}>
                <h3 className={styles.popoverHeading}>Seus títulos</h3>
                <p className={styles.help}>
                  Equipe um título conquistado. Os demais mostram a condição de desbloqueio.
                </p>
                <button
                  type="button"
                  className={styles.button}
                  onClick={() => updatePreference('equippedTitleId', null)}
                >
                  Sem título
                </button>
                <div className={styles.collection}>
                  {collections.map((item) => (
                    <div className={styles.titleRow} key={item.id}>
                      <Award size={18} style={{ color: item.color }} aria-hidden="true" />
                      <div>
                        <strong>{item.name}</strong>
                        <small>{item.description}</small>
                        {!item.unlocked && (
                          <small>
                            {item.progress} / {item.requirement.target}
                          </small>
                        )}
                      </div>
                      <button
                        type="button"
                        className={styles.button}
                        disabled={!item.unlocked || busy}
                        aria-pressed={preferences.equippedTitleId === item.id}
                        onClick={() => updatePreference('equippedTitleId', item.id)}
                      >
                        {item.unlocked ? (
                          preferences.equippedTitleId === item.id ? (
                            'Equipado'
                          ) : (
                            'Usar'
                          )
                        ) : (
                          <>
                            <Lock size={12} />
                            Bloqueado
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </ContextPopover>
          )}
        </div>
        <p className={styles.username}>@{profile.username}</p>
        {editing ? (
          <label className={styles.field}>
            <span className={styles.editAnchor}>
              Biografia <Pencil size={12} aria-hidden="true" />
            </span>
            <textarea
              className={styles.textarea}
              rows={2}
              maxLength={500}
              value={basics.bio || ''}
              onChange={(event) =>
                setBasics((current) => ({ ...current, bio: event.target.value || null }))
              }
              disabled={saving}
            />
          </label>
        ) : (
          activeBasics.bio && <p className={styles.bio}>{activeBasics.bio}</p>
        )}
        <div className={styles.meta}>
          {activeBasics.institution && (
            <span>
              <MapPin size={13} aria-hidden="true" />
              {activeBasics.institution}
            </span>
          )}
          {activeBasics.pronouns && <span>{activeBasics.pronouns}</span>}
          {activeBasics.github_username && (
            <a
              href={`https://github.com/${encodeURIComponent(activeBasics.github_username)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub: @{activeBasics.github_username}
            </a>
          )}
          {activeBasics.discord_username && <span>Discord: {activeBasics.discord_username}</span>}
          {activePreferences.socialLinks?.map((link, index) => (
            <a
              key={`${link.url}-${index}`}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Link2 size={12} aria-hidden="true" />
              {link.label}
            </a>
          ))}
          {editing && (
            <ContextPopover
              label="Editar informações e links"
              triggerIcon={<Pencil size={13} />}
              disabled={busy}
            >
              <div className={styles.popoverBody}>
                <h3 className={styles.popoverHeading}>Informações e links</h3>
                {(
                  [
                    ['institution', 'Instituição ou localização', 100],
                    ['pronouns', 'Pronomes', 40],
                    ['github_username', 'Usuário do GitHub', 100],
                    ['discord_username', 'Usuário do Discord', 100],
                  ] as const
                ).map(([key, label, max]) => (
                  <label className={styles.field} key={key}>
                    {label}
                    <input
                      className={styles.input}
                      value={basics[key] || ''}
                      maxLength={max}
                      onChange={(event) =>
                        setBasics((current) => ({ ...current, [key]: event.target.value || null }))
                      }
                    />
                  </label>
                ))}
                <label className={styles.field}>
                  Data de nascimento
                  <input
                    className={styles.input}
                    type="date"
                    value={basics.birthday || ''}
                    onChange={(event) =>
                      setBasics((current) => ({ ...current, birthday: event.target.value || null }))
                    }
                  />
                  <small>A data continua privada, de acordo com as permissões do perfil.</small>
                </label>
                {(preferences.socialLinks || []).map((link, index) => (
                  <div className={styles.studyEdit} key={index}>
                    <label className={styles.field}>
                      Nome do link {index + 1}
                      <input
                        className={styles.input}
                        value={link.label}
                        maxLength={30}
                        onChange={(event) =>
                          updatePreference(
                            'socialLinks',
                            (preferences.socialLinks || []).map((item, i) =>
                              i === index ? { ...item, label: event.target.value } : item
                            )
                          )
                        }
                      />
                    </label>
                    <label className={styles.field}>
                      Endereço HTTPS
                      <input
                        className={styles.input}
                        type="url"
                        value={link.url}
                        onChange={(event) =>
                          updatePreference(
                            'socialLinks',
                            (preferences.socialLinks || []).map((item, i) =>
                              i === index ? { ...item, url: event.target.value } : item
                            )
                          )
                        }
                      />
                    </label>
                    <button
                      type="button"
                      className={styles.subtleButton}
                      onClick={() =>
                        updatePreference(
                          'socialLinks',
                          (preferences.socialLinks || []).filter((_, i) => i !== index)
                        )
                      }
                    >
                      <Trash2 size={13} />
                      Remover link
                    </button>
                  </div>
                ))}
                {(preferences.socialLinks?.length || 0) < 5 && (
                  <button
                    className={styles.button}
                    type="button"
                    onClick={() =>
                      updatePreference('socialLinks', [
                        ...(preferences.socialLinks || []),
                        { label: '', url: '' },
                      ])
                    }
                  >
                    <Plus size={13} />
                    Adicionar link
                  </button>
                )}
              </div>
            </ContextPopover>
          )}
          {editing && (
            <ContextPopover
              label="Cores do perfil"
              triggerIcon={<Palette size={13} />}
              disabled={busy}
            >
              <div className={styles.popoverBody}>
                <h3 className={styles.popoverHeading}>Cores do perfil</h3>
                <p className={styles.help}>A aparência é aplicada somente ao seu perfil.</p>
                {(
                  [
                    ['backgroundColor', 'Fundo'],
                    ['cardColor', 'Cartões'],
                    ['borderColor', 'Bordas'],
                    ['accentColor', 'Destaque'],
                    ['secondaryColor', 'Texto secundário'],
                    ['buttonColor', 'Botões'],
                  ] as const
                ).map(([key, label]) => (
                  <div className={styles.row} key={key}>
                    <label className={styles.field} style={{ flex: 1 }}>
                      {label}
                      <input
                        className={styles.input}
                        value={preferences.appearance[key] || ''}
                        placeholder="Padrão"
                        maxLength={7}
                        onChange={(event) =>
                          updatePreference('appearance', {
                            ...preferences.appearance,
                            [key]: event.target.value || null,
                          })
                        }
                      />
                    </label>
                    <input
                      type="color"
                      aria-label={`Selecionar cor: ${label}`}
                      className={styles.colorInput}
                      value={
                        /^#[\da-f]{6}$/i.test(preferences.appearance[key] || '')
                          ? preferences.appearance[key]!
                          : '#0083fe'
                      }
                      onChange={(event) =>
                        updatePreference('appearance', {
                          ...preferences.appearance,
                          [key]: event.target.value,
                        })
                      }
                    />
                  </div>
                ))}
                <button
                  className={styles.button}
                  type="button"
                  onClick={() =>
                    updatePreference('appearance', {
                      backgroundColor: null,
                      cardColor: null,
                      borderColor: null,
                      accentColor: null,
                      secondaryColor: null,
                      buttonColor: null,
                    })
                  }
                >
                  Restaurar aparência padrão
                </button>
              </div>
            </ContextPopover>
          )}
        </div>

        {(activePreferences.tags.length > 0 || editing) && (
          <section className={styles.section} aria-label="Tags e hobbies">
            <div className={styles.sectionHeader}>
              <Tags size={14} aria-hidden="true" />
              <h2>Tags e hobbies</h2>
              {editing && (
                <ContextPopover
                  label="Adicionar ou editar tags"
                  triggerText="+ Adicionar tag"
                  disabled={busy}
                >
                  <div className={styles.popoverBody}>
                    <h3 className={styles.popoverHeading}>Tags e hobbies</h3>
                    <div className={styles.row}>
                      <input
                        className={styles.input}
                        aria-label="Pesquisar ou criar tag"
                        placeholder="Pesquisar ou criar tag"
                        value={tagInput}
                        maxLength={24}
                        onChange={(event) => setTagInput(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault();
                            addTag();
                          }
                        }}
                      />
                      <button
                        className={styles.button}
                        type="button"
                        onClick={() => addTag()}
                        disabled={preferences.tags.length >= 10}
                      >
                        Adicionar
                      </button>
                    </div>
                    {tagSuggestions
                      .filter((tag) => !preferences.tags.includes(tag))
                      .map((tag) => (
                        <button
                          type="button"
                          className={styles.subtleButton}
                          key={tag}
                          onClick={() => addTag(tag)}
                        >
                          #{tag}
                        </button>
                      ))}
                    <p className={styles.help}>
                      Até dez tags, com 2 a 24 caracteres. Arrume a ordem com as setas.
                    </p>
                    {preferences.tags.map((tag, index) => (
                      <TagEditor
                        key={`${index}`}
                        value={tag}
                        color={preferences.tagColors?.[tag] || '#0083fe'}
                        index={index}
                        count={preferences.tags.length}
                        onRename={(value) => {
                          const normalized = value.trim().replace(/^#/, '').toLowerCase();
                          if (
                            !/^[\p{L}\p{N}_+-]{2,24}$/u.test(normalized) ||
                            preferences.tags.some((item, i) => i !== index && item === normalized)
                          ) {
                            setError('A tag deve ser única e ter de 2 a 24 caracteres válidos.');
                            return;
                          }
                          const tags = preferences.tags.map((item, i) =>
                            i === index ? normalized : item
                          );
                          updateTags(tags, {
                            ...preferences.tagColors,
                            [normalized]: preferences.tagColors?.[tag] || '#0083fe',
                          });
                          setError('');
                        }}
                        onColor={(color) =>
                          updatePreference('tagColors', { ...preferences.tagColors, [tag]: color })
                        }
                        onMove={(direction) => {
                          const tags = [...preferences.tags];
                          [tags[index], tags[index + direction]] = [
                            tags[index + direction],
                            tags[index],
                          ];
                          updateTags(tags);
                        }}
                        onRemove={() => updateTags(preferences.tags.filter((_, i) => i !== index))}
                      />
                    ))}
                  </div>
                </ContextPopover>
              )}
            </div>
            <div className={styles.chips}>
              {activePreferences.tags.map((tag) => {
                const color = activePreferences.tagColors?.[tag];
                return (
                  <a
                    className={styles.chip}
                    href={`/explore?q=${encodeURIComponent(tag)}`}
                    key={tag}
                    style={
                      color
                        ? {
                            backgroundColor: `${color}1a`,
                            borderColor: `${color}55`,
                            color: readableColor(color, background || '#08090b'),
                          }
                        : undefined
                    }
                  >
                    {tag}
                  </a>
                );
              })}
            </div>
            {editing && activePreferences.tags.length === 0 && (
              <p className={styles.help}>Mostre seus interesses com uma tag.</p>
            )}
          </section>
        )}

        {(activeStudies.length > 0 || editing) && (
          <section className={styles.section} aria-label="Estudando atualmente">
            <div className={styles.sectionHeader}>
              <GraduationCap size={14} aria-hidden="true" />
              <h2>Estudando atualmente</h2>
              {editing && (
                <ContextPopover
                  label="Editar estudos"
                  triggerIcon={<Pencil size={13} />}
                  disabled={busy}
                >
                  <div className={styles.popoverBody}>
                    <h3 className={styles.popoverHeading}>Estudando atualmente</h3>
                    {studiesOf(preferences).map((study, index) => (
                      <div className={styles.studyEdit} key={index}>
                        <label className={styles.field}>
                          Assunto {index + 1}
                          <input
                            className={styles.input}
                            value={study.subject}
                            maxLength={60}
                            onChange={(event) =>
                              updateStudy(index, { subject: event.target.value })
                            }
                          />
                        </label>
                        <label className={styles.field}>
                          Descrição curta
                          <input
                            className={styles.input}
                            value={study.description || ''}
                            maxLength={120}
                            onChange={(event) =>
                              updateStudy(index, { description: event.target.value || null })
                            }
                          />
                        </label>
                        <div className={styles.row}>
                          <label className={styles.field} style={{ flex: 1 }}>
                            Status
                            <select
                              className={styles.select}
                              value={study.status}
                              onChange={(event) =>
                                updateStudy(index, {
                                  status: event.target.value as Study['status'],
                                })
                              }
                            >
                              <option value="studying">Estudando</option>
                              <option value="paused">Pausado</option>
                              <option value="completed">Concluído</option>
                            </select>
                          </label>
                          <label className={styles.field} style={{ width: 100 }}>
                            Progresso (%)
                            <input
                              className={styles.input}
                              type="number"
                              min="0"
                              max="100"
                              value={study.progress ?? ''}
                              placeholder="Opcional"
                              onChange={(event) =>
                                updateStudy(index, {
                                  progress:
                                    event.target.value === '' ? null : Number(event.target.value),
                                })
                              }
                            />
                          </label>
                        </div>
                        <button
                          className={styles.subtleButton}
                          type="button"
                          onClick={() => {
                            const details = studiesOf(preferences).filter((_, i) => i !== index);
                            setPreferences((current) => ({
                              ...current,
                              studyDetails: details,
                              studies: details.map((item) => item.subject),
                            }));
                          }}
                        >
                          <Trash2 size={13} />
                          Remover estudo
                        </button>
                      </div>
                    ))}
                    {studiesOf(preferences).length < 3 && (
                      <button
                        className={styles.button}
                        type="button"
                        onClick={() => {
                          const details = [
                            ...studiesOf(preferences),
                            {
                              subject: '',
                              description: null,
                              progress: null,
                              status: 'studying' as const,
                            },
                          ];
                          setPreferences((current) => ({
                            ...current,
                            studyDetails: details,
                            studies: details.map((item) => item.subject),
                          }));
                        }}
                      >
                        <Plus size={13} />
                        Adicionar assunto
                      </button>
                    )}
                    <p className={styles.help}>
                      O progresso é opcional e informado por você; não concede XP.
                    </p>
                  </div>
                </ContextPopover>
              )}
            </div>
            {activeStudies.map((study, index) => (
              <div className={styles.study} key={index}>
                <div className={styles.studyContent}>
                  <strong>{study.subject || 'Novo assunto'}</strong>
                  {study.description && <p>{study.description}</p>}
                  {study.progress !== null && (
                    <div
                      className={styles.progress}
                      role="progressbar"
                      aria-label={`Progresso em ${study.subject}`}
                      aria-valuenow={study.progress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <span style={{ width: `${Math.min(100, Math.max(0, study.progress))}%` }} />
                    </div>
                  )}
                </div>
                <span className={styles.studyStatus}>
                  {study.status === 'paused'
                    ? 'Pausado'
                    : study.status === 'completed'
                      ? 'Concluído'
                      : 'Estudando'}
                  {study.progress !== null ? ` · ${study.progress}%` : ''}
                </span>
              </div>
            ))}
            {editing && activeStudies.length === 0 && (
              <p className={styles.help}>Conte o que está aprendendo.</p>
            )}
          </section>
        )}

        {(activePreferences.music || editing) && (
          <section className={styles.section} aria-label="Música do perfil">
            <div className={styles.sectionHeader}>
              <Music2 size={14} aria-hidden="true" />
              <h2>Música do perfil</h2>
              {activePreferences.music && (
                <a
                  className={styles.musicExternal}
                  href={`https://open.spotify.com/track/${activePreferences.music.trackId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ouvir no Spotify
                </a>
              )}
              {editing && (
                <ContextPopover
                  label="Editar música do perfil"
                  triggerIcon={<Pencil size={13} />}
                  disabled={busy}
                >
                  <MusicSelector
                    value={preferences.music}
                    onChange={(music) => updatePreference('music', music)}
                  />
                </ContextPopover>
              )}
            </div>
            {activePreferences.music ? (
              <div className={styles.music}>
                <iframe
                  src={`https://open.spotify.com/embed/track/${activePreferences.music.trackId}?utm_source=stacklyst&theme=0`}
                  title={`Player Spotify: ${activePreferences.music.title || 'música do perfil'}`}
                  allow="encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>
            ) : (
              <p className={styles.help}>Escolha uma música ou artista no Spotify.</p>
            )}
          </section>
        )}
        {editing && (
          <p className={styles.help} style={{ marginTop: 14 }}>
            Suas alterações ficam apenas na prévia até você salvar.
          </p>
        )}
      </div>
    </section>
  );
}

function TagEditor({
  value,
  color,
  index,
  count,
  onRename,
  onColor,
  onMove,
  onRemove,
}: {
  value: string;
  color: string;
  index: number;
  count: number;
  onRename: (value: string) => void;
  onColor: (color: string) => void;
  onMove: (direction: number) => void;
  onRemove: () => void;
}) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  return (
    <div className={styles.tagRow}>
      <input
        className={styles.input}
        aria-label={`Editar tag ${value}`}
        value={draft}
        maxLength={24}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => {
          if (draft !== value) onRename(draft);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            onRename(draft);
          }
        }}
      />
      <input
        className={styles.colorInput}
        type="color"
        aria-label={`Cor da tag ${value}`}
        value={color}
        onChange={(event) => onColor(event.target.value)}
      />
      <span className={styles.tagControls}>
        <button
          type="button"
          className={styles.iconButton}
          aria-label={`Mover ${value} para cima`}
          disabled={index === 0}
          onClick={() => onMove(-1)}
        >
          <ArrowUp size={12} />
        </button>
        <button
          type="button"
          className={styles.iconButton}
          aria-label={`Mover ${value} para baixo`}
          disabled={index === count - 1}
          onClick={() => onMove(1)}
        >
          <ArrowDown size={12} />
        </button>
        <button
          type="button"
          className={styles.iconButton}
          aria-label={`Remover tag ${value}`}
          onClick={onRemove}
        >
          <X size={12} />
        </button>
      </span>
    </div>
  );
}

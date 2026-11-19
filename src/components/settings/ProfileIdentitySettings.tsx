'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, Award, Check, Lock } from 'lucide-react';
import {
  AvatarFrame,
  ProfileFlag,
  ProfileName,
  ProfileTitle,
} from '@/components/profile/ProfileIdentity';
import { FlagSelector } from '@/components/profile-inline/FlagSelector';
import { NameColorPicker } from '@/components/profile-inline/NameColorPicker';
import { invalidateCurrentUser } from '@/lib/client/current-user';
import {
  getSelectedProfileFlags,
  parseProfilePreferences,
  profilePreferencesSchema,
  type ProfileCustomizationState,
  type ProfilePreferences,
} from '@/lib/profile-customization';

const FRAME_FILTERS = [
  ['all', 'Todas'],
  ['free', 'Gratuitas'],
  ['earned', 'Desbloqueadas'],
  ['pride', 'LGBTQIA+'],
  ['country', 'Países'],
  ['decorative', 'Decorativas'],
] as const;
type FrameFilter = (typeof FRAME_FILTERS)[number][0];

const sectionTitle = 'text-xs font-bold text-dd-muted uppercase tracking-wider mb-1';
const card = 'bg-dd-surface border border-dd-border rounded-xl p-4 space-y-3';
const chip =
  'rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50';

/**
 * Settings → Perfil: the identity bits shown next to a user's name everywhere
 * (display name and its style, title, avatar frame and flags). Saves through
 * the same validated endpoint as the inline profile editor.
 */
export function ProfileIdentitySettings() {
  const [state, setState] = useState<ProfileCustomizationState | null>(null);
  const [preferences, setPreferences] = useState<ProfilePreferences | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [baseline, setBaseline] = useState('');
  const [frameFilter, setFrameFilter] = useState<FrameFilter>('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const savePending = useRef(false);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/profile/customization', { cache: 'no-store', signal });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Não foi possível carregar seu perfil.');
      const loaded = result as ProfileCustomizationState;
      const nextPreferences = parseProfilePreferences(loaded.preferences);
      const nextName = loaded.profile?.displayName || '';
      setState(loaded);
      setPreferences(nextPreferences);
      setDisplayName(nextName);
      setBaseline(JSON.stringify({ preferences: nextPreferences, displayName: nextName }));
    } catch (failure) {
      if ((failure as Error)?.name === 'AbortError') return;
      setError(
        failure instanceof Error ? failure.message : 'Não foi possível carregar seu perfil.'
      );
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const dirty = Boolean(preferences) && JSON.stringify({ preferences, displayName }) !== baseline;
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const owned = useMemo(
    () => new Set(state?.achievements.filter((item) => item.unlocked).map((item) => item.id)),
    [state]
  );
  const titles = useMemo(
    () =>
      [...(state?.achievements || [])].sort(
        (a, b) => Number(b.unlocked) - Number(a.unlocked) || a.name.localeCompare(b.name)
      ),
    [state]
  );
  const frames = useMemo(
    () =>
      (state?.catalog.frames || []).filter((item) => {
        if (frameFilter === 'all') return true;
        if (frameFilter === 'free') return !item.achievementId;
        if (frameFilter === 'earned')
          return Boolean(item.achievementId && owned.has(item.achievementId));
        if (frameFilter === 'decorative')
          return !['pride', 'country', 'none'].includes(item.decoration);
        return item.decoration === frameFilter;
      }),
    [state, frameFilter, owned]
  );

  if (loading && !state) {
    return <p className="text-xs text-dd-muted">Carregando seu perfil…</p>;
  }
  if (!state || !preferences) {
    return (
      <div className="space-y-3">
        <p role="alert" className="text-xs text-red-400">
          {error || 'Não foi possível carregar seu perfil.'}
        </p>
        <button
          type="button"
          className={`${chip} border-dd-border text-dd-text`}
          onClick={() => void load()}
        >
          Tentar de novo
        </button>
      </div>
    );
  }

  const update = <K extends keyof ProfilePreferences>(key: K, value: ProfilePreferences[K]) => {
    setFeedback('');
    setPreferences((current) => (current ? { ...current, [key]: value } : current));
  };
  const selectedFlags = getSelectedProfileFlags(preferences);
  const frame = state.catalog.frames.find(
    (item) => item.id === preferences.frameId && item.id !== 'none'
  );
  const title = state.achievements.find(
    (item) => item.id === preferences.equippedTitleId && item.unlocked
  );

  const save = async () => {
    if (savePending.current) return;
    setError('');
    setFeedback('');
    const name = displayName.trim();
    if (!name) {
      setError('Informe um nome de exibição.');
      return;
    }
    const parsed = profilePreferencesSchema.safeParse(preferences);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || 'Confira as opções escolhidas.');
      return;
    }
    savePending.current = true;
    setSaving(true);
    try {
      const response = await fetch('/api/profile/customization', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          version: state.version,
          preferences: parsed.data,
          profile: { displayName: name },
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(
          response.status === 409
            ? 'Seu perfil mudou em outra aba. Recarregue esta seção antes de salvar.'
            : result.message || 'Não foi possível salvar.'
        );
      }
      const saved = result as ProfileCustomizationState;
      const savedPreferences = parseProfilePreferences(saved.preferences);
      const savedName = saved.profile?.displayName || name;
      setState(saved);
      setPreferences(savedPreferences);
      setDisplayName(savedName);
      setBaseline(JSON.stringify({ preferences: savedPreferences, displayName: savedName }));
      invalidateCurrentUser();
      window.dispatchEvent(new Event('stacklyst:profile-customization'));
      setFeedback('Perfil atualizado.');
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Não foi possível salvar.');
    } finally {
      savePending.current = false;
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className={sectionTitle}>Como você aparece</h3>
        <p className="text-xs text-dd-muted leading-relaxed">
          Moldura, nome, título e bandeiras aparecem no seu perfil, nos posts e no ranking.
        </p>
      </div>

      <div className={`${card} flex items-center gap-4`} aria-label="Prévia do perfil">
        <AvatarFrame frame={frame} className="relative h-16 w-16 shrink-0 rounded-full">
          {state.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- user avatars come from several allowed hosts
            <img src={state.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center rounded-full bg-dd-bg text-sm font-bold text-dd-text">
              {(displayName || '?').slice(0, 2).toUpperCase()}
            </span>
          )}
        </AvatarFrame>
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <strong className="truncate text-base text-dd-text">
              <ProfileName config={{ profileStyle: { nameStyle: preferences.nameStyle } }}>
                {displayName || 'Seu nome'}
              </ProfileName>
            </strong>
            {selectedFlags.map((flag) => (
              <ProfileFlag key={flag} code={flag} />
            ))}
          </div>
          {title && <ProfileTitle title={title} />}
        </div>
      </div>

      <section className="space-y-2">
        <h3 className={sectionTitle}>Nome</h3>
        <div className={card}>
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-dd-text">Nome de exibição</span>
            <input
              value={displayName}
              maxLength={50}
              disabled={saving}
              onChange={(event) => {
                setFeedback('');
                setDisplayName(event.target.value);
              }}
              className="w-full rounded-lg border border-dd-border bg-dd-bg px-3 py-2 text-sm text-dd-text outline-none focus:border-blue-500"
            />
          </label>
          <NameColorPicker
            value={preferences.nameStyle.color || '#0083fe'}
            disabled={saving}
            onChange={(color) => update('nameStyle', { ...preferences.nameStyle, color })}
          />
          <div className="flex flex-wrap gap-3">
            {(
              [
                ['bold', 'Negrito'],
                ['italic', 'Itálico'],
                ['underline', 'Sublinhado'],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-xs text-dd-text">
                <input
                  type="checkbox"
                  checked={preferences.nameStyle[key]}
                  disabled={saving}
                  onChange={(event) =>
                    update('nameStyle', { ...preferences.nameStyle, [key]: event.target.checked })
                  }
                />
                {label}
              </label>
            ))}
            <button
              type="button"
              className="text-xs font-semibold text-dd-muted underline cursor-pointer"
              disabled={saving}
              onClick={() =>
                update('nameStyle', { color: null, bold: false, italic: false, underline: false })
              }
            >
              Restaurar padrão
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <h3 className={sectionTitle}>Título</h3>
        <div className={`${card} max-h-80 overflow-y-auto`}>
          <button
            type="button"
            aria-pressed={!preferences.equippedTitleId}
            disabled={saving}
            onClick={() => update('equippedTitleId', null)}
            className={`${chip} ${!preferences.equippedTitleId ? 'border-blue-500 text-blue-500' : 'border-dd-border text-dd-text'}`}
          >
            Sem título
          </button>
          {titles.length === 0 && (
            <p className="text-xs text-dd-muted">
              Conquiste algo na plataforma para ganhar títulos.
            </p>
          )}
          {titles.map((item) => {
            const equipped = preferences.equippedTitleId === item.id;
            return (
              <div key={item.id} className="flex items-center gap-3">
                <Award size={18} style={{ color: item.color }} aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-dd-text">{item.name}</p>
                  <p className="text-[11px] text-dd-muted">
                    {item.unlocked
                      ? item.description
                      : `${item.description} · ${item.progress} / ${item.requirement.target}`}
                  </p>
                </div>
                <button
                  type="button"
                  aria-pressed={equipped}
                  aria-label={`${equipped ? 'Equipado' : 'Usar'}: ${item.name}`}
                  disabled={!item.unlocked || saving}
                  onClick={() => update('equippedTitleId', item.id)}
                  className={`${chip} ${equipped ? 'border-blue-500 text-blue-500' : 'border-dd-border text-dd-text'}`}
                >
                  {!item.unlocked ? (
                    <span className="flex items-center gap-1">
                      <Lock size={11} aria-hidden="true" /> Bloqueado
                    </span>
                  ) : equipped ? (
                    'Equipado'
                  ) : (
                    'Usar'
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-2">
        <h3 className={sectionTitle}>Moldura</h3>
        <div className={card}>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar molduras">
            {FRAME_FILTERS.map(([id, label]) => (
              <button
                key={id}
                type="button"
                aria-pressed={frameFilter === id}
                onClick={() => setFrameFilter(id)}
                className={`${chip} ${frameFilter === id ? 'border-blue-500 text-blue-500' : 'border-dd-border text-dd-muted'}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {frames.map((item) => {
              const locked = Boolean(item.achievementId && !owned.has(item.achievementId));
              const selected = preferences.frameId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-label={item.name}
                  aria-pressed={selected}
                  disabled={locked || saving}
                  onClick={() => update('frameId', item.id)}
                  className={`flex flex-col items-center gap-2 rounded-xl border p-2 text-[11px] text-dd-text transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${selected ? 'border-blue-500 bg-blue-500/10' : 'border-dd-border hover:bg-dd-bg'}`}
                >
                  <AvatarFrame
                    frame={item.id === 'none' ? null : item}
                    className="relative h-12 w-12 rounded-full"
                  >
                    {state.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element -- preview of the user's own avatar
                      <img
                        src={state.avatarUrl}
                        alt=""
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="block h-full w-full rounded-full bg-dd-bg" />
                    )}
                  </AvatarFrame>
                  <span className="flex items-center gap-1 text-center leading-tight">
                    {locked && <Lock size={10} aria-hidden="true" />}
                    {item.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <h3 className={sectionTitle}>Bandeiras</h3>
        <div className={card}>
          <FlagSelector
            value={selectedFlags}
            disabled={saving}
            onChange={(flags) => {
              setFeedback('');
              setPreferences((current) =>
                current ? { ...current, flags, flag: flags[0] || null } : current
              );
            }}
          />
        </div>
      </section>

      {error && (
        <div
          role="alert"
          className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400 flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}
      {feedback && (
        <div
          role="status"
          className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-400 flex items-center gap-2"
        >
          <Check className="w-4 h-4 shrink-0" /> {feedback}
        </div>
      )}

      <div className="flex justify-end gap-2">
        {dirty && (
          <button
            type="button"
            disabled={saving}
            onClick={() => void load()}
            className="rounded-lg border border-dd-border px-4 py-2 text-xs font-bold text-dd-text cursor-pointer"
          >
            Descartar
          </button>
        )}
        <button
          type="button"
          disabled={!dirty || saving}
          onClick={() => void save()}
          className="rounded-lg bg-blue-500 hover:bg-blue-600 px-5 py-2 text-xs font-bold text-white transition-opacity cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'Salvando…' : 'Salvar perfil'}
        </button>
      </div>
    </div>
  );
}

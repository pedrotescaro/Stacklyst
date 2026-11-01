'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Glasses, Palette, ScanFace, Shirt, Smile, Sparkles } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { CharacterAvatar } from '@/components/CharacterAvatar';
import {
  AVATAR_BACKGROUNDS,
  HAIR_COLORS,
  normalizeAvatarConfig,
  OUTFIT_COLORS,
  SKIN_TONES,
  type AvatarConfig,
} from '@/lib/avatar';
import { invalidateCurrentUser } from '@/lib/client/current-user';

type Category = 'skin' | 'hair' | 'eyes' | 'glasses' | 'mouth' | 'outfit' | 'background';

const categories = [
  { id: 'skin', label: 'Pele', icon: ScanFace },
  { id: 'hair', label: 'Cabelo', icon: Sparkles },
  { id: 'eyes', label: 'Olhos', icon: ScanFace },
  { id: 'glasses', label: 'Óculos', icon: Glasses },
  { id: 'mouth', label: 'Expressão', icon: Smile },
  { id: 'outfit', label: 'Roupa', icon: Shirt },
  { id: 'background', label: 'Fundo', icon: Palette },
] as const;

export function AvatarCustomizer({
  user,
}: {
  user: {
    id: string;
    username: string;
    avatar_url?: string | null;
    avatar_config?: unknown;
    streak_days?: number;
    total_xp?: number;
  };
}) {
  const router = useRouter();
  const initialConfig = useMemo(
    () => normalizeAvatarConfig(user.avatar_config, user.username),
    [user.avatar_config, user.username]
  );
  const [config, setConfig] = useState<AvatarConfig>(initialConfig);
  const [category, setCategory] = useState<Category>('skin');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const changed = JSON.stringify(config) !== JSON.stringify(initialConfig);

  const setOption = <K extends keyof AvatarConfig>(key: K, value: AvatarConfig[K]) => {
    setConfig((current) => ({ ...current, [key]: value }));
  };

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      const response = await fetch('/api/avatar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!response.ok) throw new Error('Não foi possível salvar o personagem.');
      sessionStorage.removeItem('stacklyst_user');
      invalidateCurrentUser();
      router.push(`/profile/${user.username}`);
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Erro ao salvar o personagem.');
      setSaving(false);
    }
  };

  const numberedOptions = (
    key: 'hair' | 'eyes' | 'glasses' | 'mouth' | 'outfit',
    count: number
  ) => (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
      {Array.from({ length: count }, (_, index) => (
        <button
          key={index}
          type="button"
          aria-pressed={config[key] === index}
          onClick={() => setOption(key, index)}
          className={`relative aspect-square overflow-hidden rounded-2xl border-2 border-b-4 transition-all hover:-translate-y-0.5 ${
            config[key] === index
              ? 'border-sky-400 bg-sky-400/15'
              : 'border-dd-border bg-dd-surface hover:border-dd-muted'
          }`}
        >
          <CharacterAvatar
            username={user.username}
            config={{ ...config, [key]: index }}
            className="h-full w-full scale-[1.45]"
            decorative
          />
          {config[key] === index && (
            <span className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-sky-400 text-slate-950">
              <Check className="h-4 w-4" strokeWidth={4} />
            </span>
          )}
        </button>
      ))}
    </div>
  );

  const swatches = (
    key: 'skin' | 'hairColor' | 'outfitColor' | 'background',
    colors: readonly string[]
  ) => (
    <div className="grid grid-cols-5 gap-3 sm:grid-cols-6">
      {colors.map((color, index) => (
        <button
          key={color}
          type="button"
          aria-label={`Cor ${index + 1}`}
          aria-pressed={config[key] === index}
          onClick={() => setOption(key, index)}
          className={`relative aspect-square rounded-2xl border-[3px] border-b-[5px] transition-transform hover:-translate-y-0.5 ${
            config[key] === index ? 'border-sky-400' : 'border-dd-border'
          }`}
          style={{ backgroundColor: color }}
        >
          {config[key] === index && (
            <Check
              className="absolute inset-0 m-auto h-6 w-6 text-white drop-shadow"
              strokeWidth={4}
            />
          )}
        </button>
      ))}
    </div>
  );

  return (
    <div className="dd-platform-shell dd-platform-shell--fullscreen dd-platform-shell--workspace">
      <Sidebar user={{ ...user, avatar_config: config }} />
      <main className="dd-platform-body dd-platform-main min-h-screen min-w-0 flex-1 bg-dd-bg px-4 pb-28 pt-6 sm:px-8 md:pb-10 lg:px-12">
        <div className="mx-auto w-full max-w-[1120px]">
          <button
            type="button"
            onClick={() => router.back()}
            className="dd-focus-ring mb-7 inline-flex min-h-11 items-center gap-3 rounded-xl px-2 text-xl font-black text-dd-muted transition-colors hover:text-dd-text"
          >
            <ArrowLeft className="h-7 w-7" />
            Crie seu avatar em pixel art
          </button>

          <p className="-mt-4 mb-6 max-w-2xl text-sm font-semibold leading-6 text-dd-muted">
            Este personagem 2D é um item visual do Stacklyst. Sua foto do Google, Discord ou outro
            provedor continua sendo a imagem principal do perfil.
          </p>

          <section className="grid overflow-hidden rounded-[26px] border-2 border-b-4 border-dd-border bg-dd-sidebar-bg lg:grid-cols-[1fr_1.25fr]">
            <div className="relative flex min-h-[360px] items-end justify-center overflow-hidden border-b-2 border-dd-border bg-dd-surface lg:min-h-[520px] lg:border-b-0 lg:border-r-2">
              <CharacterAvatar
                username={user.username}
                config={config}
                className="h-full min-h-[360px] w-full object-cover"
              />
            </div>

            <div className="min-w-0">
              <div className="flex overflow-x-auto border-b-2 border-dd-border px-3 pt-3">
                {categories.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    aria-label={label}
                    aria-pressed={category === id}
                    onClick={() => setCategory(id)}
                    className={`dd-focus-ring relative flex min-h-16 min-w-16 flex-1 items-center justify-center rounded-t-xl px-3 transition-colors ${
                      category === id
                        ? 'bg-sky-400/10 text-sky-400'
                        : 'text-dd-muted hover:text-dd-text'
                    }`}
                  >
                    <Icon className="h-7 w-7" strokeWidth={2.5} />
                    {category === id && (
                      <span className="absolute inset-x-2 bottom-0 h-1 rounded-full bg-sky-400" />
                    )}
                  </button>
                ))}
              </div>

              <div className="p-6 sm:p-8">
                <h2 className="mb-5 text-xl font-black text-dd-text">
                  {categories.find((item) => item.id === category)?.label}
                </h2>
                {category === 'skin' && swatches('skin', SKIN_TONES)}
                {category === 'hair' && (
                  <div className="space-y-7">
                    {numberedOptions('hair', 6)}
                    <div>
                      <h3 className="mb-3 text-sm font-black text-dd-muted">Cor do cabelo</h3>
                      {swatches('hairColor', HAIR_COLORS)}
                    </div>
                  </div>
                )}
                {category === 'eyes' && numberedOptions('eyes', 4)}
                {category === 'glasses' && numberedOptions('glasses', 4)}
                {category === 'mouth' && numberedOptions('mouth', 4)}
                {category === 'outfit' && (
                  <div className="space-y-7">
                    {numberedOptions('outfit', 5)}
                    <div>
                      <h3 className="mb-3 text-sm font-black text-dd-muted">Cor da roupa</h3>
                      {swatches('outfitColor', OUTFIT_COLORS)}
                    </div>
                  </div>
                )}
                {category === 'background' && swatches('background', AVATAR_BACKGROUNDS)}
              </div>
            </div>
          </section>

          <div className="mt-8 flex flex-col items-end gap-3">
            {error && (
              <p role="alert" className="text-sm font-bold text-red-400">
                {error}
              </p>
            )}
            <button
              type="button"
              onClick={save}
              disabled={saving || !changed}
              className="dd-focus-ring min-h-14 min-w-44 rounded-2xl border-b-4 border-sky-700 bg-sky-400 px-8 text-sm font-black uppercase tracking-wide text-slate-950 transition-all hover:-translate-y-0.5 disabled:translate-y-0 disabled:border-dd-border disabled:bg-dd-surface disabled:text-dd-muted"
            >
              {saving ? 'Salvando...' : changed ? 'Pronto' : 'Salvo'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

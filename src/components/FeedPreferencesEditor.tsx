'use client';
import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { ComposeModal } from '@/components/motion/ComposeModal';
import { type OnboardingPreferences } from '@/lib/onboarding';
export function FeedPreferencesEditor() {
  const [open, setOpen] = useState(false),
    [prefs, setPrefs] = useState<OnboardingPreferences | null>(null),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  async function show() {
    setOpen(true);
    setError('');
    setPrefs(null);
    try {
      const r = await fetch('/api/onboarding');
      if (!r.ok) throw Error('Não foi possível carregar o feed.');
      setPrefs(await r.json());
    } catch (e) {
      setError(String(e));
    }
  }
  async function save() {
    if (!prefs) return;
    setBusy(true);
    setError('');
    try {
      const r = await fetch('/api/onboarding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefs),
      });
      if (!r.ok) throw Error('Escolha ao menos uma linguagem e tente novamente.');
      window.dispatchEvent(
        new CustomEvent('stacklyst:feed-preferences', { detail: await r.json() })
      );
      setOpen(false);
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <button
        type="button"
        onClick={show}
        aria-label="Personalizar feed"
        className="dd-focus-ring flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-dd-border text-dd-text hover:bg-dd-surface"
      >
        <Pencil size={16} />
      </button>
      <ComposeModal
        open={open}
        onClose={() => setOpen(false)}
        hasDraft={false}
        mobileTitle="Personalizar feed"
      >
        <h2 className="hidden md:block font-bold">Personalizar feed</h2>
        {prefs ? (
          <div className="space-y-4">
            <label className="block">
              Feed inicial
              <select
                className="block w-full bg-dd-bg border border-dd-border rounded-lg p-3"
                value={prefs.feed}
                onChange={(e) =>
                  setPrefs({ ...prefs, feed: e.target.value as OnboardingPreferences['feed'] })
                }
              >
                <option value="for-you">Para você</option>
                <option value="following">Seguindo</option>
              </select>
            </label>
            <fieldset>
              <legend className="mb-2">Linguagens</legend>
              <div className="flex flex-wrap gap-2">
                {(['JS', 'TS', 'PYTHON', 'RUST', 'GO', 'JAVA'] as const).map((code) => (
                  <label
                    key={code}
                    className="flex items-center gap-2 rounded-xl border border-dd-border px-3 py-2"
                  >
                    <input
                      type="checkbox"
                      checked={prefs.languages.includes(code)}
                      onChange={(e) =>
                        setPrefs({
                          ...prefs,
                          languages: e.target.checked
                            ? [...prefs.languages, code]
                            : prefs.languages.filter((c) => c !== code),
                        })
                      }
                    />
                    {code}
                  </label>
                ))}
              </div>
            </fieldset>
            <button
              type="button"
              disabled={busy || !prefs.languages.length}
              onClick={save}
              className="rounded-full bg-dd-accent text-white font-bold px-5 py-3 disabled:opacity-50"
            >
              {busy ? 'Salvando…' : 'Salvar'}
            </button>
          </div>
        ) : (
          <p>Carregando preferências…</p>
        )}
        {error && (
          <p role="alert" className="text-red-500">
            {error}
          </p>
        )}
      </ComposeModal>
    </>
  );
}

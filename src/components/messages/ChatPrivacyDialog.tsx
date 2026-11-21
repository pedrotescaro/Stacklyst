'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Check, ChevronRight, X } from 'lucide-react';
import { useLocalizedText } from '@/i18n/useLocalizedText';
import { chatAudience, type ChatPrivacy, type ChatPrivacyChange } from '@/lib/chat-privacy';

type AudienceSetting = 'messages' | 'groups';

export function ChatPrivacyDialog({ onClose }: { onClose: () => void }) {
  const { text } = useLocalizedText();
  const dialog = useRef<HTMLDialogElement>(null);
  const selectedOption = useRef<HTMLButtonElement>(null);
  const audienceButtons = useRef<Partial<Record<AudienceSetting, HTMLButtonElement | null>>>({});
  const [settings, setSettings] = useState<ChatPrivacy | null>(null);
  const [editing, setEditing] = useState<AudienceSetting | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const titles = {
    messages: text('Quem pode me enviar mensagens', 'Who can message me'),
    groups: text('Quem pode me adicionar em grupos', 'Who can add me to groups'),
  };
  const labels = {
    everyone: text('Todo mundo', 'Everyone'),
    following: text('Apenas quem eu sigo', 'Only people I follow'),
    mutual: text('Seguidores mútuos', 'Mutual followers'),
    nobody: text('Ninguém', 'Nobody'),
  };
  useEffect(() => {
    const panel = dialog.current!;
    panel.showModal();
    return () => panel.close();
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    setError('');
    void fetch('/api/messages/settings', { cache: 'no-store', signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error();
        const data = await response.json();
        if (!controller.signal.aborted) setSettings(data);
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setError(text('Não foi possível carregar as opções.', 'Could not load settings.'));
      });
    return () => controller.abort();
  }, [retry, text]);
  useEffect(() => {
    if (editing) selectedOption.current?.focus();
  }, [editing]);

  function back() {
    if (saving) return;
    if (!editing) return onClose();
    setEditing(null);
    setError('');
    requestAnimationFrame(() => audienceButtons.current[editing]?.focus());
  }
  async function save(change: ChatPrivacyChange) {
    if (saving || !settings) return;
    setSaving(true);
    setError('');
    try {
      const response = await fetch('/api/messages/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(change),
      });
      if (!response.ok) throw new Error();
      setSettings({ ...settings, [change.setting]: change.value });
      if (editing) back();
    } catch {
      setError(text('Não foi possível salvar. Tente novamente.', 'Could not save. Try again.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <dialog
      ref={dialog}
      aria-labelledby="chat-privacy-title"
      onCancel={(event) => {
        event.preventDefault();
        back();
      }}
      onClick={(event) => {
        if (event.target === dialog.current && !saving) onClose();
      }}
      className={`fixed inset-x-0 bottom-0 m-0 w-full max-w-none overflow-y-auto border-dd-border p-0 text-dd-text backdrop:bg-black/65 sm:inset-0 sm:m-auto sm:h-fit sm:max-h-[90dvh] sm:max-w-md sm:rounded-2xl sm:border sm:bg-dd-surface ${editing ? 'top-auto max-h-[90dvh] rounded-t-2xl border bg-dd-surface' : 'top-0 h-dvh max-h-none bg-dd-bg'}`}
    >
      <div className="p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-5">
        <header className="mb-4 flex items-center gap-2">
          {editing && (
            <button
              type="button"
              onClick={back}
              disabled={saving}
              aria-label={text('Voltar', 'Back')}
              className="rounded-full p-2 hover:bg-dd-bg"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <h2 id="chat-privacy-title" className="flex-1 text-lg font-bold">
            {editing ? titles[editing] : text('Conversas', 'Conversations')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label={text('Fechar', 'Close')}
            className="rounded-full p-2 text-dd-muted hover:bg-dd-bg"
          >
            <X size={18} />
          </button>
        </header>
        {settings &&
          (editing ? (
            <div
              role="group"
              aria-labelledby="chat-privacy-title"
              className="divide-y divide-dd-border"
            >
              {chatAudience.options.map((value) => {
                const selected = settings[editing] === value;
                return (
                  <button
                    key={value}
                    type="button"
                    ref={selected ? selectedOption : undefined}
                    aria-pressed={selected}
                    disabled={saving}
                    onClick={() => (selected ? back() : void save({ setting: editing, value }))}
                    className="flex min-h-14 w-full items-center justify-between gap-3 rounded-md px-3 text-left text-sm font-semibold hover:bg-dd-bg"
                  >
                    {labels[value]}
                    {selected && <Check size={20} className="text-dd-accent" />}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              <button
                type="button"
                role="switch"
                aria-checked={settings.showOnline}
                aria-labelledby="chat-online-title"
                aria-describedby="chat-online-description"
                disabled={saving}
                onClick={() => void save({ setting: 'showOnline', value: !settings.showOnline })}
                className="flex w-full items-center justify-between gap-4 rounded-xl border border-dd-border bg-dd-bg p-4 text-left"
              >
                <span>
                  <strong id="chat-online-title" className="block text-sm">
                    {text('Exibir quando estou online', 'Show when I’m online')}
                  </strong>
                  <span
                    id="chat-online-description"
                    className="mt-1 block text-xs leading-relaxed text-dd-muted"
                  >
                    {text(
                      'Mostre seu status de conexão nas conversas privadas.',
                      'Show your online status in private conversations.'
                    )}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className={`flex h-6 w-11 shrink-0 items-center rounded-full px-0.5 ${settings.showOnline ? 'justify-end bg-blue-500' : 'justify-start bg-dd-muted'}`}
                >
                  <span className="size-5 rounded-full bg-white" />
                </span>
              </button>
              {(['messages', 'groups'] as const).map((setting) => (
                <button
                  type="button"
                  key={setting}
                  ref={(el) => {
                    audienceButtons.current[setting] = el;
                  }}
                  disabled={saving}
                  onClick={() => {
                    setError('');
                    setEditing(setting);
                  }}
                  className="flex w-full items-center justify-between gap-3 rounded-xl border border-dd-border bg-dd-bg p-4 text-left hover:border-dd-muted"
                >
                  <span>
                    <strong className="block text-sm">{titles[setting]}</strong>
                    {setting === 'messages' && (
                      <span className="mt-1 block text-xs leading-relaxed text-dd-muted">
                        {text(
                          'Controle quem pode iniciar uma conversa com você.',
                          'Choose who can start a conversation with you.'
                        )}
                      </span>
                    )}
                    <span className="mt-1 block text-xs text-dd-muted">
                      {labels[settings[setting]]}
                    </span>
                  </span>
                  <ChevronRight size={18} className="shrink-0 text-dd-muted" />
                </button>
              ))}
            </div>
          ))}
        {!settings && !error && (
          <p role="status" className="text-sm text-dd-muted">
            {text('Carregando opções…', 'Loading settings…')}
          </p>
        )}
        {error && (
          <p role="alert" className="mt-3 text-sm text-dd-text">
            {error}{' '}
            {!settings && (
              <button type="button" onClick={() => setRetry((n) => n + 1)} className="underline">
                {text('Tentar novamente', 'Try again')}
              </button>
            )}
          </p>
        )}
      </div>
    </dialog>
  );
}

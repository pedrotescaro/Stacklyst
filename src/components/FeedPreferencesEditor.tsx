'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowLeft,
  ArrowDown,
  ArrowUp,
  Code2,
  Eye,
  EyeOff,
  GripVertical,
  Image,
  MessageSquare,
  Pencil,
  Plus,
  Trash2,
  Vote,
  X,
} from 'lucide-react';
import { parseOnboarding, type OnboardingPreferences } from '@/lib/onboarding';
import {
  createFeed,
  FEED_LANGUAGES,
  getFeedSettings,
  type FeedDefinition,
  type FeedSettings,
} from '@/lib/feed-preferences';
import { useLocalizedText } from '@/i18n/useLocalizedText';
import styles from './FeedPreferencesEditor.module.css';

const getFeedOptions = (text: (pt: string, en: string) => string) => [
  {
    key: 'showCode' as const,
    name: text('Publicações com código', 'Posts with code'),
    description: text(
      'Trechos de código, soluções e exemplos compartilhados pela comunidade.',
      'Code snippets, solutions, and examples shared by the community.'
    ),
    icon: Code2,
  },
  {
    key: 'showMedia' as const,
    name: text('Imagens e outros anexos', 'Images & attachments'),
    description: text(
      'Publicações com imagens, GIFs, áudio ou música.',
      'Posts with images, GIFs, audio, or music.'
    ),
    icon: Image,
  },
  {
    key: 'showPolls' as const,
    name: text('Enquetes', 'Polls'),
    description: text(
      'Perguntas com opções de voto para participar das conversas.',
      'Questions with voting options to join discussions.'
    ),
    icon: Vote,
  },
  {
    key: 'showGeneral' as const,
    name: text('Publicações gerais', 'General discussions'),
    description: text(
      'Conversas e textos sem código, anexos ou enquete.',
      'Conversations and text posts without code, media, or polls.'
    ),
    icon: MessageSquare,
  },
];

export function FeedPreferencesEditor() {
  const { text } = useLocalizedText();
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<OnboardingPreferences | null>(null);
  const [settings, setSettings] = useState<FeedSettings | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [term, setTerm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [reordering, setReordering] = useState<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const request = useRef<AbortController | null>(null);
  const dragged = useRef<string | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const editing = settings?.feeds.find((feed) => feed.id === editingId);
  const options = getFeedOptions(text);

  useEffect(() => {
    if (!open) return;
    dialog.current?.showModal();
    const triggerButton = trigger.current;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      request.current?.abort();
      document.body.style.overflow = overflow;
      triggerButton?.focus();
    };
  }, [open]);

  function close() {
    if (busy) return;
    dialog.current?.close();
    setOpen(false);
  }

  async function show() {
    setOpen(true);
    setError('');
    setPrefs(null);
    setSettings(null);
    setEditingId(null);
    setReordering(null);
    const controller = new AbortController();
    request.current = controller;
    try {
      const response = await fetch('/api/onboarding', {
        cache: 'no-store',
        signal: controller.signal,
      });
      if (!response.ok)
        throw new Error(
          text(
            'Não foi possível carregar seus feeds. Tente novamente.',
            'Could not load your feeds. Please try again.'
          )
        );
      const loaded = parseOnboarding(await response.json()) ?? {
        feed: 'for-you',
        languages: ['JS'],
      };
      if (controller.signal.aborted) return;
      setPrefs(loaded);
      setSettings(getFeedSettings(loaded));
    } catch (cause) {
      if (!controller.signal.aborted)
        setError(cause instanceof Error ? cause.message : 'Não foi possível carregar seus feeds.');
    }
  }

  function edit(id: string | null) {
    setEditingId(id);
    setTerm('');
    setError('');
    setReordering(null);
    requestAnimationFrame(() => heading.current?.focus());
  }

  function updateFeed(patch: Partial<FeedDefinition>) {
    if (!settings || !editing) return;
    setSettings({
      ...settings,
      feeds: settings.feeds.map((feed) => (feed.id === editing.id ? { ...feed, ...patch } : feed)),
    });
  }

  function toggleVisibility(feed: FeedDefinition) {
    if (!settings) return;
    if (feed.visible && settings.feeds.filter((item) => item.visible).length === 1) {
      setError(text('Mantenha pelo menos um feed visível.', 'Keep at least one feed visible.'));
      return;
    }
    const feeds = settings.feeds.map((item) =>
      item.id === feed.id ? { ...item, visible: !item.visible } : item
    );
    setSettings({
      feeds,
      defaultFeedId:
        feeds.find((item) => item.id === settings.defaultFeedId && item.visible)?.id ??
        feeds.find((item) => item.visible)!.id,
    });
    setError('');
  }

  function move(id: string, to: number) {
    if (!settings || to < 0 || to >= settings.feeds.length) return;
    const feeds = [...settings.feeds];
    const from = feeds.findIndex((feed) => feed.id === id);
    feeds.splice(to, 0, feeds.splice(from, 1)[0]);
    setSettings({ ...settings, feeds });
  }

  function addTerm() {
    const value = term.trim();
    if (!value || !editing) return;
    if (value.length > 60 || editing.blockedTerms.length >= 50) {
      setError(
        text(
          'Use até 50 termos, com no máximo 60 caracteres cada.',
          'Use up to 50 terms, with a maximum of 60 characters each.'
        )
      );
      return;
    }
    if (
      !editing.blockedTerms.some((item) => item.toLocaleLowerCase() === value.toLocaleLowerCase())
    )
      updateFeed({ blockedTerms: [...editing.blockedTerms, value] });
    setTerm('');
    setError('');
  }

  async function save() {
    if (!prefs || !settings) return;
    if (term.trim()) {
      setError(
        text(
          'Adicione o termo bloqueado ou limpe o campo antes de salvar.',
          'Add the blocked term or clear the field before saving.'
        )
      );
      return;
    }
    if (settings.feeds.some((feed) => !feed.name.trim())) {
      setError(
        text('Dê um nome a todos os feeds antes de salvar.', 'Name all feeds before saving.')
      );
      return;
    }
    const defaultFeed = settings.feeds.find((feed) => feed.id === settings.defaultFeedId)!;
    const forYou = settings.feeds.find((feed) => feed.id === 'for-you')!;
    if (!forYou.languages.length) {
      setError(
        text(
          'Escolha pelo menos uma linguagem em Para você.',
          'Choose at least one language for For You.'
        )
      );
      return;
    }
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/onboarding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...prefs,
          feed: defaultFeed.source,
          languages: forYou.languages,
          feedSettings: settings,
        }),
      });
      if (!response.ok)
        throw new Error(
          text(
            'Não foi possível salvar seus feeds. Suas alterações continuam aqui para tentar novamente.',
            'Could not save your feeds. Your changes were preserved to try again.'
          )
        );
      const saved = await response.json();
      window.dispatchEvent(new CustomEvent('stacklyst:feed-preferences', { detail: saved }));
      dialog.current?.close();
      setOpen(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível salvar seus feeds.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        ref={trigger}
        type="button"
        onClick={show}
        aria-label={text('Personalizar feed', 'Customize feed')}
        title={text('Gerenciar feeds', 'Manage feeds')}
        className="dd-focus-ring flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-dd-border text-dd-text hover:bg-dd-surface"
      >
        <Pencil size={16} />
      </button>
      {open &&
        createPortal(
          <dialog
            ref={dialog}
            aria-labelledby="feed-settings-title"
            className={styles.dialog}
            onCancel={(event) => {
              event.preventDefault();
              close();
            }}
          >
            <header className={styles.header}>
              <button
                type="button"
                className={styles.iconButton}
                disabled={busy}
                aria-label={
                  editing
                    ? text('Voltar para gerenciar feeds', 'Back to manage feeds')
                    : text('Fechar gerenciamento de feeds', 'Close feed management')
                }
                onClick={() => (editing ? edit(null) : close())}
              >
                <ArrowLeft size={23} />
              </button>
              <h2 ref={heading} tabIndex={-1} id="feed-settings-title">
                {editing
                  ? `${text('Editar', 'Edit')} ${editing.name || text('feed', 'feed')}`
                  : text('Gerenciar feeds', 'Manage feeds')}
              </h2>
              <button
                type="button"
                className={`${styles.iconButton} ${styles.desktopClose}`}
                disabled={busy}
                aria-label={text('Fechar gerenciamento de feeds', 'Close feed management')}
                onClick={close}
              >
                <X size={21} />
              </button>
            </header>
            <div className={`${styles.body} ${editing ? styles.isEditing : ''}`}>
              {settings && prefs ? (
                <>
                  <section className={styles.manager} aria-label={text('Seus feeds', 'Your feeds')}>
                    <p className={styles.intro}>
                      {text(
                        'Crie, ordene e edite seus feeds da página inicial.',
                        'Create, reorder, and edit your home page feeds.'
                      )}
                    </p>
                    <div className={styles.toolbar}>
                      <span
                        className={styles.counter}
                        aria-label={`${settings.feeds.length} ${text('de 12 feeds', 'of 12 feeds')}`}
                      >
                        {settings.feeds.length}/12
                      </span>
                      <button
                        type="button"
                        className={styles.primary}
                        disabled={settings.feeds.length >= 12 || busy}
                        onClick={() => {
                          const feed = createFeed(crypto.randomUUID(), 'Novo feed', []);
                          setSettings({ ...settings, feeds: [...settings.feeds, feed] });
                          edit(feed.id);
                        }}
                      >
                        {text('Criar feed', 'New feed')}
                      </button>
                    </div>
                    <ol className={styles.feedList}>
                      {settings.feeds.map((feed, index) => (
                        <li
                          key={feed.id}
                          className={`${styles.feedRow} ${editingId === feed.id ? styles.selectedRow : ''}`}
                          onDragOver={(event) => event.preventDefault()}
                          onDrop={(event) => {
                            event.preventDefault();
                            if (dragged.current) move(dragged.current, index);
                            dragged.current = null;
                          }}
                        >
                          <span className={styles.feedName}>
                            {feed.name || text('Novo feed', 'New feed')}
                          </span>
                          <div className={styles.rowActions}>
                            <button
                              type="button"
                              className={styles.iconButton}
                              aria-label={`${text('Editar', 'Edit')} ${feed.name}`}
                              onClick={() => edit(feed.id)}
                              disabled={busy}
                            >
                              <Pencil size={20} />
                            </button>
                            <button
                              type="button"
                              className={styles.iconButton}
                              aria-label={`${feed.visible ? text('Ocultar', 'Hide') : text('Mostrar', 'Show')} ${feed.name}`}
                              aria-pressed={feed.visible}
                              onClick={() => toggleVisibility(feed)}
                              disabled={busy}
                            >
                              {feed.visible ? <Eye size={22} /> : <EyeOff size={22} />}
                            </button>
                            <button
                              type="button"
                              className={styles.iconButton}
                              aria-label={`${text('Reordenar', 'Reorder')} ${feed.name}`}
                              aria-expanded={reordering === feed.id}
                              draggable={!busy}
                              onDragStart={() => {
                                dragged.current = feed.id;
                              }}
                              onDragEnd={() => {
                                dragged.current = null;
                              }}
                              onKeyDown={(event) => {
                                if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
                                  event.preventDefault();
                                  move(feed.id, index + (event.key === 'ArrowUp' ? -1 : 1));
                                }
                              }}
                              onClick={() => setReordering(reordering === feed.id ? null : feed.id)}
                              disabled={busy}
                            >
                              <GripVertical size={22} />
                            </button>
                          </div>
                          {reordering === feed.id && (
                            <div className={styles.reorderActions}>
                              <button
                                type="button"
                                disabled={index === 0}
                                onClick={() => move(feed.id, index - 1)}
                              >
                                <ArrowUp size={16} /> {text('Mover acima', 'Move up')}
                              </button>
                              <button
                                type="button"
                                disabled={index === settings.feeds.length - 1}
                                onClick={() => move(feed.id, index + 1)}
                              >
                                <ArrowDown size={16} /> {text('Mover abaixo', 'Move down')}
                              </button>
                            </div>
                          )}
                        </li>
                      ))}
                    </ol>
                    <label className={styles.defaultFeed}>
                      {text('Feed inicial', 'Default feed')}
                      <select
                        value={settings.defaultFeedId}
                        onChange={(event) =>
                          setSettings({ ...settings, defaultFeedId: event.target.value })
                        }
                        disabled={busy}
                      >
                        {settings.feeds
                          .filter((feed) => feed.visible)
                          .map((feed) => (
                            <option key={feed.id} value={feed.id}>
                              {feed.name}
                            </option>
                          ))}
                      </select>
                    </label>
                  </section>
                  {editing && (
                    <section
                      key={editing.id}
                      className={styles.editor}
                      aria-label={`${text('Preferências de', 'Preferences for')} ${editing.name}`}
                    >
                      <fieldset disabled={busy} className={styles.fields}>
                        {!['for-you', 'following'].includes(editing.id) && (
                          <div className={styles.customFields}>
                            <label>
                              {text('Nome do feed', 'Feed name')}
                              <input
                                autoComplete="off"
                                maxLength={32}
                                value={editing.name}
                                onChange={(event) => updateFeed({ name: event.target.value })}
                              />
                            </label>
                            <label>
                              {text('Publicações de', 'Posts from')}
                              <select
                                value={editing.source}
                                onChange={(event) =>
                                  updateFeed({
                                    source: event.target.value as FeedDefinition['source'],
                                  })
                                }
                              >
                                <option value="for-you">
                                  {text('Toda a comunidade', 'Entire community')}
                                </option>
                                <option value="following">
                                  {text('Pessoas que sigo', 'People I follow')}
                                </option>
                              </select>
                            </label>
                          </div>
                        )}
                        <div className={styles.sectionHeading}>
                          <h3>{text('Exibição de publicações', 'Post display')}</h3>
                          <p>
                            {text(
                              'Selecione os tipos de publicação que você quer ver neste feed. As opções desmarcadas não serão exibidas.',
                              'Select the types of posts you want to see in this feed. Unchecked types will be hidden.'
                            )}
                          </p>
                        </div>
                        <div className={styles.options}>
                          {options.map(({ key, name, description, icon: Icon }) => (
                            <label key={key} className={styles.option}>
                              <Icon size={23} className={styles.optionIcon} aria-hidden="true" />
                              <span>
                                <span className={styles.optionTitle}>{name}</span>
                                <span className={styles.optionDescription}>{description}</span>
                              </span>
                              <input
                                type="checkbox"
                                role="switch"
                                aria-label={name}
                                checked={editing[key]}
                                onChange={(event) => updateFeed({ [key]: event.target.checked })}
                                className={styles.switch}
                              />
                            </label>
                          ))}
                        </div>
                        <section
                          className={styles.section}
                          aria-labelledby="feed-languages-heading"
                        >
                          <div className={styles.sectionHeading}>
                            <h3 id="feed-languages-heading">
                              {text('Linguagens de programação', 'Programming languages')}
                            </h3>
                            <p>
                              {editing.id === 'for-you'
                                ? text(
                                    'Escolha pelo menos uma. Elas têm prioridade; outras descobertas da comunidade também aparecem.',
                                    'Choose at least one. These take priority; other community discoveries will also appear.'
                                  )
                                : text(
                                    'Selecione as linguagens deste feed. Sem seleção, publicações de todas as linguagens aparecem.',
                                    'Select languages for this feed. When none are selected, all languages will appear.'
                                  )}
                            </p>
                          </div>
                          <div className={styles.languages}>
                            {FEED_LANGUAGES.map(({ code, label }) => (
                              <label key={code} className={styles.language}>
                                <input
                                  type="checkbox"
                                  checked={editing.languages.includes(code)}
                                  onChange={(event) =>
                                    updateFeed({
                                      languages: event.target.checked
                                        ? [...editing.languages, code]
                                        : editing.languages.filter((value) => value !== code),
                                    })
                                  }
                                />
                                {label}
                              </label>
                            ))}
                          </div>
                        </section>
                        <section className={styles.section} aria-labelledby="blocked-terms-heading">
                          <div className={styles.sectionHeading}>
                            <h3 id="blocked-terms-heading">
                              {text('Termos bloqueados', 'Blocked terms')}
                            </h3>
                            <p>
                              {text(
                                'Adicione um termo por vez para ocultar publicações que o contenham no título, texto, código ou pergunta da enquete.',
                                'Add one term at a time to hide posts containing it in the title, text, code, or poll question.'
                              )}
                            </p>
                          </div>
                          <label className={styles.termLabel} htmlFor="feed-blocked-term">
                            {text('Palavra para bloquear', 'Word to block')}
                          </label>
                          <div className={styles.termInput}>
                            <input
                              id="feed-blocked-term"
                              value={term}
                              maxLength={60}
                              placeholder={text('Ex.: futebol', 'e.g. crypto')}
                              onChange={(event) => setTerm(event.target.value)}
                              onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                  event.preventDefault();
                                  addTerm();
                                }
                              }}
                            />
                            <button
                              type="button"
                              className={styles.iconButton}
                              disabled={!term.trim() || editing.blockedTerms.length >= 50}
                              aria-label={text('Adicionar termo bloqueado', 'Add blocked term')}
                              onClick={addTerm}
                            >
                              <Plus size={22} />
                            </button>
                          </div>
                          <div className={styles.terms}>
                            {editing.blockedTerms.map((value) => (
                              <span key={value}>
                                {value}
                                <button
                                  type="button"
                                  aria-label={`${text('Desbloquear', 'Unblock')} ${value}`}
                                  onClick={() =>
                                    updateFeed({
                                      blockedTerms: editing.blockedTerms.filter(
                                        (item) => item !== value
                                      ),
                                    })
                                  }
                                >
                                  <X size={16} />
                                </button>
                              </span>
                            ))}
                          </div>
                        </section>
                        {!['for-you', 'following'].includes(editing.id) && (
                          <button
                            type="button"
                            className={styles.delete}
                            onClick={() => {
                              const feeds = settings.feeds.filter((feed) => feed.id !== editing.id);
                              if (!feeds.some((feed) => feed.visible))
                                feeds[0] = { ...feeds[0], visible: true };
                              setSettings({
                                feeds,
                                defaultFeedId:
                                  settings.defaultFeedId === editing.id
                                    ? feeds.find((feed) => feed.visible)!.id
                                    : settings.defaultFeedId,
                              });
                              edit(null);
                            }}
                          >
                            <Trash2 size={18} /> {text('Excluir feed', 'Delete feed')}
                          </button>
                        )}
                      </fieldset>
                    </section>
                  )}
                </>
              ) : (
                !error && (
                  <p className={styles.loading} role="status">
                    {text('Carregando seus feeds…', 'Loading your feeds…')}
                  </p>
                )
              )}
            </div>
            <footer className={styles.footer}>
              {error && (
                <p role="alert" className={styles.error}>
                  {error}
                </p>
              )}
              {!settings && error ? (
                <button type="button" className={styles.primary} onClick={show}>
                  {text('Tentar novamente', 'Try again')}
                </button>
              ) : (
                <div className={styles.footerActions}>
                  <button
                    type="button"
                    className={styles.secondary}
                    onClick={close}
                    disabled={busy}
                  >
                    {text('Cancelar', 'Cancel')}
                  </button>
                  <button
                    type="button"
                    className={styles.primary}
                    onClick={save}
                    disabled={busy || !settings}
                  >
                    {busy
                      ? text('Salvando…', 'Saving…')
                      : text('Salvar alterações', 'Save changes')}
                  </button>
                </div>
              )}
            </footer>
          </dialog>,
          document.body
        )}
    </>
  );
}

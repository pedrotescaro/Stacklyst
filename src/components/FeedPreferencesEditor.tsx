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
import styles from './FeedPreferencesEditor.module.css';

const options = [
  {
    key: 'showCode',
    name: 'Publicações com código',
    description: 'Trechos de código, soluções e exemplos compartilhados pela comunidade.',
    icon: Code2,
  },
  {
    key: 'showMedia',
    name: 'Imagens e outros anexos',
    description: 'Publicações com imagens, GIFs, áudio ou música.',
    icon: Image,
  },
  {
    key: 'showPolls',
    name: 'Enquetes',
    description: 'Perguntas com opções de voto para participar das conversas.',
    icon: Vote,
  },
  {
    key: 'showGeneral',
    name: 'Publicações gerais',
    description: 'Conversas e textos sem código, anexos ou enquete.',
    icon: MessageSquare,
  },
] as const;

export function FeedPreferencesEditor() {
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
      if (!response.ok) throw new Error('Não foi possível carregar seus feeds. Tente novamente.');
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
      setError('Mantenha pelo menos um feed visível.');
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
      setError('Use até 50 termos, com no máximo 60 caracteres cada.');
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
      setError('Adicione o termo bloqueado ou limpe o campo antes de salvar.');
      return;
    }
    if (settings.feeds.some((feed) => !feed.name.trim())) {
      setError('Dê um nome a todos os feeds antes de salvar.');
      return;
    }
    const defaultFeed = settings.feeds.find((feed) => feed.id === settings.defaultFeedId)!;
    const forYou = settings.feeds.find((feed) => feed.id === 'for-you')!;
    if (!forYou.languages.length) {
      setError('Escolha pelo menos uma linguagem em Para você.');
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
          'Não foi possível salvar seus feeds. Suas alterações continuam aqui para tentar novamente.'
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
        aria-label="Personalizar feed"
        title="Gerenciar feeds"
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
                  editing ? 'Voltar para gerenciar feeds' : 'Fechar gerenciamento de feeds'
                }
                onClick={() => (editing ? edit(null) : close())}
              >
                <ArrowLeft size={23} />
              </button>
              <h2 ref={heading} tabIndex={-1} id="feed-settings-title">
                {editing ? `Editar ${editing.name || 'feed'}` : 'Gerenciar feeds'}
              </h2>
              <button
                type="button"
                className={`${styles.iconButton} ${styles.desktopClose}`}
                disabled={busy}
                aria-label="Fechar gerenciamento de feeds"
                onClick={close}
              >
                <X size={21} />
              </button>
            </header>
            <div className={`${styles.body} ${editing ? styles.isEditing : ''}`}>
              {settings && prefs ? (
                <>
                  <section className={styles.manager} aria-label="Seus feeds">
                    <p className={styles.intro}>
                      Crie, ordene e edite seus feeds da página inicial.
                    </p>
                    <div className={styles.toolbar}>
                      <span
                        className={styles.counter}
                        aria-label={`${settings.feeds.length} de 12 feeds`}
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
                        Criar feed
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
                          <span className={styles.feedName}>{feed.name || 'Novo feed'}</span>
                          <div className={styles.rowActions}>
                            <button
                              type="button"
                              className={styles.iconButton}
                              aria-label={`Editar ${feed.name}`}
                              onClick={() => edit(feed.id)}
                              disabled={busy}
                            >
                              <Pencil size={20} />
                            </button>
                            <button
                              type="button"
                              className={styles.iconButton}
                              aria-label={`${feed.visible ? 'Ocultar' : 'Mostrar'} ${feed.name}`}
                              aria-pressed={feed.visible}
                              onClick={() => toggleVisibility(feed)}
                              disabled={busy}
                            >
                              {feed.visible ? <Eye size={22} /> : <EyeOff size={22} />}
                            </button>
                            <button
                              type="button"
                              className={styles.iconButton}
                              aria-label={`Reordenar ${feed.name}`}
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
                                <ArrowUp size={16} /> Mover acima
                              </button>
                              <button
                                type="button"
                                disabled={index === settings.feeds.length - 1}
                                onClick={() => move(feed.id, index + 1)}
                              >
                                <ArrowDown size={16} /> Mover abaixo
                              </button>
                            </div>
                          )}
                        </li>
                      ))}
                    </ol>
                    <label className={styles.defaultFeed}>
                      Feed inicial
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
                      aria-label={`Preferências de ${editing.name}`}
                    >
                      <fieldset disabled={busy} className={styles.fields}>
                        {!['for-you', 'following'].includes(editing.id) && (
                          <div className={styles.customFields}>
                            <label>
                              Nome do feed
                              <input
                                autoComplete="off"
                                maxLength={32}
                                value={editing.name}
                                onChange={(event) => updateFeed({ name: event.target.value })}
                              />
                            </label>
                            <label>
                              Publicações de
                              <select
                                value={editing.source}
                                onChange={(event) =>
                                  updateFeed({
                                    source: event.target.value as FeedDefinition['source'],
                                  })
                                }
                              >
                                <option value="for-you">Toda a comunidade</option>
                                <option value="following">Pessoas que sigo</option>
                              </select>
                            </label>
                          </div>
                        )}
                        <div className={styles.sectionHeading}>
                          <h3>Exibição de publicações</h3>
                          <p>
                            Selecione os tipos de publicação que você quer ver neste feed. As opções
                            desmarcadas não serão exibidas.
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
                            <h3 id="feed-languages-heading">Linguagens de programação</h3>
                            <p>
                              {editing.id === 'for-you'
                                ? 'Escolha pelo menos uma. Elas têm prioridade; outras descobertas da comunidade também aparecem.'
                                : 'Selecione as linguagens deste feed. Sem seleção, publicações de todas as linguagens aparecem.'}
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
                            <h3 id="blocked-terms-heading">Termos bloqueados</h3>
                            <p>
                              Adicione um termo por vez para ocultar publicações que o contenham no
                              título, texto, código ou pergunta da enquete.
                            </p>
                          </div>
                          <label className={styles.termLabel} htmlFor="feed-blocked-term">
                            Palavra para bloquear
                          </label>
                          <div className={styles.termInput}>
                            <input
                              id="feed-blocked-term"
                              value={term}
                              maxLength={60}
                              placeholder="Ex.: futebol"
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
                              aria-label="Adicionar termo bloqueado"
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
                                  aria-label={`Desbloquear ${value}`}
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
                            <Trash2 size={18} /> Excluir feed
                          </button>
                        )}
                      </fieldset>
                    </section>
                  )}
                </>
              ) : (
                !error && (
                  <p className={styles.loading} role="status">
                    Carregando seus feeds…
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
                  Tentar novamente
                </button>
              ) : (
                <div className={styles.footerActions}>
                  <button
                    type="button"
                    className={styles.secondary}
                    onClick={close}
                    disabled={busy}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className={styles.primary}
                    onClick={save}
                    disabled={busy || !settings}
                  >
                    {busy ? 'Salvando…' : 'Salvar alterações'}
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

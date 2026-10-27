'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, Plus, RotateCcw, Save } from 'lucide-react';
import {
  PROFILE_METRICS,
  PROFILE_RARITIES,
  profileCatalogSchema,
  type ProfileCatalog,
} from '@/lib/profile-customization';
import styles from './Personalization.module.css';

type CatalogResponse = { catalog: ProfileCatalog; version: number };
type CatalogTab = 'events' | 'achievements' | 'frames' | 'advanced';
const metricNames: Record<string, string> = {
  posts: 'Publicações válidas',
  comments: 'Comentários válidos',
  peopleHelped: 'Pessoas respondidas',
  likes: 'Curtidas recebidas',
  followers: 'Seguidores',
  learningActivities: 'Atividades concluídas',
  eventPosts: 'Publicações com hashtag do evento',
  eventComments: 'Publicações diferentes do evento comentadas',
  eventComplete: 'Desafios do evento concluídos',
};
const rarityNames: Record<string, string> = {
  common: 'Comum',
  uncommon: 'Incomum',
  rare: 'Raro',
  epic: 'Épico',
  legendary: 'Lendário',
  special: 'Especial',
};
const icons = [
  'award',
  'message',
  'users',
  'heart',
  'code',
  'sparkles',
  'ghost',
  'gift',
  'cake',
] as const;
const decorations = [
  'none',
  'minimal',
  'neon',
  'cyberpunk',
  'circuit',
  'pixel',
  'galaxy',
  'hacker',
  'halloween',
  'christmas',
  'legendary',
] as const;

export function ProfileCatalogEditor() {
  const [saved, setSaved] = useState<CatalogResponse | null>(null);
  const [catalog, setCatalog] = useState<ProfileCatalog | null>(null);
  const [tab, setTab] = useState<CatalogTab>('events');
  const [advanced, setAdvanced] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const dirty = Boolean(
    catalog && saved && JSON.stringify(catalog) !== JSON.stringify(saved.catalog)
  );

  useEffect(() => {
    const controller = new AbortController();
    void fetch('/api/admin/profile-catalog', { cache: 'no-store', signal: controller.signal })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok)
          throw new Error(
            result.message || result.error || 'Não foi possível carregar o catálogo.'
          );
        setSaved(result);
        setCatalog(result.catalog);
        setAdvanced(JSON.stringify(result.catalog, null, 2));
      })
      .catch((failure) => {
        if (!controller.signal.aborted)
          setError(failure.message || 'Não foi possível carregar o catálogo.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  function switchTab(next: CatalogTab) {
    if (next === 'advanced' && catalog) setAdvanced(JSON.stringify(catalog, null, 2));
    setTab(next);
    setError('');
  }
  function applyJson() {
    try {
      const parsed = profileCatalogSchema.safeParse(JSON.parse(advanced));
      if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || 'Revise o catálogo.');
      setCatalog(parsed.data);
      setError('');
      setNotice('JSON validado na prévia. Salve o catálogo para publicar.');
    } catch (failure) {
      setError(
        failure instanceof SyntaxError
          ? 'O JSON está incompleto ou inválido.'
          : failure instanceof Error
            ? failure.message
            : 'Catálogo inválido.'
      );
    }
  }
  async function save() {
    if (!catalog || !saved) return;
    const parsed = profileCatalogSchema.safeParse(catalog);
    if (!parsed.success) {
      setError(
        parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join(' ')
      );
      return;
    }
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const response = await fetch('/api/admin/profile-catalog', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ catalog: parsed.data, version: saved.version }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          response.status === 409
            ? 'Outro administrador atualizou o catálogo. Recarregue a página antes de publicar.'
            : result.message || result.error || 'Não foi possível salvar.'
        );
      setCatalog(result.catalog);
      setSaved(result);
      setAdvanced(JSON.stringify(result.catalog, null, 2));
      setNotice('Catálogo publicado. As regras já estão disponíveis no servidor.');
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : 'Não foi possível salvar. Suas mudanças continuam na tela.'
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.back} href="/personalize">
          <ArrowLeft size={17} />
          Voltar à personalização
        </Link>
        <h1 className={styles.title}>Catálogo de personalização</h1>
        <p className={styles.subtitle}>
          Administre eventos, metas, títulos e molduras. As conquistas são concedidas pelo servidor
          conforme a atividade real, dentro dos períodos configurados.
        </p>
      </header>
      <main className={styles.achievementPage}>
        {loading ? (
          <div aria-busy="true">
            <p className={styles.help}>Carregando catálogo…</p>
            <div className={styles.skeleton} />
          </div>
        ) : (
          <>
            {error && (
              <p className={styles.error} role="alert">
                {error}
              </p>
            )}
            {notice && (
              <p className={styles.notice} role="status">
                {notice}
              </p>
            )}
            {catalog && (
              <>
                <nav
                  className={styles.row}
                  aria-label="Seções do catálogo"
                  style={{ marginBottom: 28 }}
                >
                  {(
                    [
                      ['events', 'Eventos'],
                      ['achievements', 'Conquistas'],
                      ['frames', 'Molduras'],
                      ['advanced', 'JSON avançado'],
                    ] as const
                  ).map(([key, label]) => (
                    <button
                      className={styles.navButton}
                      type="button"
                      key={key}
                      aria-current={tab === key ? 'page' : undefined}
                      onClick={() => switchTab(key)}
                    >
                      {label}
                    </button>
                  ))}
                </nav>
                <fieldset disabled={saving} style={{ border: 0, padding: 0, minWidth: 0 }}>
                  {tab === 'events' && (
                    <>
                      <p className={styles.notice}>
                        Datas em UTC. O início é inclusivo e o término é exclusivo. Desative um
                        evento para interromper novas concessões, preservando os títulos que já
                        foram conquistados.
                      </p>
                      {catalog.events.map((event, index) => (
                        <section
                          key={index}
                          style={{
                            paddingBottom: 22,
                            marginBottom: 26,
                            borderBottom: '1px solid var(--color-dd-border)',
                          }}
                        >
                          <h2 className={styles.sectionTitle}>{event.name || 'Evento'}</h2>
                          <p className={styles.help} style={{ margin: '8px 0 20px' }}>
                            ID estável: {event.id}
                          </p>
                          <label className={styles.field}>
                            <span className={styles.label}>Nome do evento</span>
                            <input
                              className={styles.input}
                              value={event.name}
                              maxLength={80}
                              onChange={(e) =>
                                setCatalog({
                                  ...catalog,
                                  events: catalog.events.map((row, i) =>
                                    i === index ? { ...row, name: e.target.value } : row
                                  ),
                                })
                              }
                            />
                          </label>
                          <label className={styles.field}>
                            <span className={styles.label}>Hashtag, sem #</span>
                            <input
                              className={styles.input}
                              value={event.hashtag}
                              maxLength={40}
                              onChange={(e) =>
                                setCatalog({
                                  ...catalog,
                                  events: catalog.events.map((row, i) =>
                                    i === index
                                      ? { ...row, hashtag: e.target.value.replace(/^#/, '') }
                                      : row
                                  ),
                                })
                              }
                            />
                          </label>
                          <div className={styles.split}>
                            {(
                              [
                                ['startsAt', 'Início (UTC)'],
                                ['endsAt', 'Término (UTC)'],
                              ] as const
                            ).map(([key, label]) => (
                              <label key={key} className={styles.field}>
                                <span className={styles.label}>{label}</span>
                                <input
                                  className={styles.input}
                                  type="datetime-local"
                                  value={event[key].slice(0, 16)}
                                  onChange={(e) =>
                                    setCatalog({
                                      ...catalog,
                                      events: catalog.events.map((row, i) =>
                                        i === index
                                          ? {
                                              ...row,
                                              [key]: e.target.value
                                                ? `${e.target.value}:00.000Z`
                                                : '',
                                            }
                                          : row
                                      ),
                                    })
                                  }
                                />
                              </label>
                            ))}
                          </div>
                          <label className={styles.checkbox}>
                            <input
                              type="checkbox"
                              checked={event.enabled}
                              onChange={(e) =>
                                setCatalog({
                                  ...catalog,
                                  events: catalog.events.map((row, i) =>
                                    i === index ? { ...row, enabled: e.target.checked } : row
                                  ),
                                })
                              }
                            />
                            Evento habilitado no período informado
                          </label>
                        </section>
                      ))}
                      <button
                        className={styles.button}
                        type="button"
                        onClick={() => {
                          const startsAt = new Date().toISOString();
                          setCatalog({
                            ...catalog,
                            events: [
                              ...catalog.events,
                              {
                                id: `event-${Date.now().toString(36)}`,
                                name: 'Novo evento',
                                hashtag: 'Stacklyst',
                                startsAt,
                                endsAt: new Date(Date.now() + 7 * 86400000).toISOString(),
                                enabled: false,
                              },
                            ],
                          });
                        }}
                      >
                        <Plus size={16} />
                        Adicionar evento
                      </button>
                    </>
                  )}
                  {tab === 'achievements' && (
                    <>
                      <p className={styles.notice}>
                        Mantenha os IDs de conquistas já publicadas: eles vinculam títulos e
                        histórico de desbloqueio. Edite requisitos para futuras verificações;
                        conquistas adquiridas não são concedidas novamente.
                      </p>
                      {catalog.achievements.map((achievement, index) => (
                        <section
                          key={index}
                          style={{
                            paddingBottom: 24,
                            marginBottom: 26,
                            borderBottom: '1px solid var(--color-dd-border)',
                          }}
                        >
                          <h2 className={styles.achievementTitle}>{achievement.name}</h2>
                          <p className={styles.help} style={{ margin: '6px 0 18px' }}>
                            ID estável: {achievement.id}
                          </p>
                          <div className={styles.split}>
                            <label className={styles.field}>
                              <span className={styles.label}>Nome do título</span>
                              <input
                                className={styles.input}
                                value={achievement.name}
                                maxLength={60}
                                onChange={(e) =>
                                  setCatalog({
                                    ...catalog,
                                    achievements: catalog.achievements.map((row, i) =>
                                      i === index ? { ...row, name: e.target.value } : row
                                    ),
                                  })
                                }
                              />
                            </label>
                            <label className={styles.field}>
                              <span className={styles.label}>Cor</span>
                              <input
                                className={styles.colorPicker}
                                type="color"
                                value={achievement.color}
                                onChange={(e) =>
                                  setCatalog({
                                    ...catalog,
                                    achievements: catalog.achievements.map((row, i) =>
                                      i === index ? { ...row, color: e.target.value } : row
                                    ),
                                  })
                                }
                              />
                            </label>
                          </div>
                          <label className={styles.field}>
                            <span className={styles.label}>Descrição</span>
                            <input
                              className={styles.input}
                              value={achievement.description}
                              maxLength={200}
                              onChange={(e) =>
                                setCatalog({
                                  ...catalog,
                                  achievements: catalog.achievements.map((row, i) =>
                                    i === index ? { ...row, description: e.target.value } : row
                                  ),
                                })
                              }
                            />
                          </label>
                          <div className={styles.split}>
                            <label className={styles.field}>
                              <span className={styles.label}>Métrica verificada</span>
                              <select
                                className={styles.select}
                                value={achievement.requirement.metric}
                                onChange={(e) =>
                                  setCatalog({
                                    ...catalog,
                                    achievements: catalog.achievements.map((row, i) =>
                                      i === index
                                        ? {
                                            ...row,
                                            requirement: {
                                              ...row.requirement,
                                              metric: e.target
                                                .value as typeof row.requirement.metric,
                                            },
                                          }
                                        : row
                                    ),
                                  })
                                }
                              >
                                {PROFILE_METRICS.map((metric) => (
                                  <option key={metric} value={metric}>
                                    {metricNames[metric]}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <label className={styles.field}>
                              <span className={styles.label}>Meta</span>
                              <input
                                className={styles.input}
                                type="number"
                                min={1}
                                max={1000000}
                                value={achievement.requirement.target}
                                onChange={(e) =>
                                  setCatalog({
                                    ...catalog,
                                    achievements: catalog.achievements.map((row, i) =>
                                      i === index
                                        ? {
                                            ...row,
                                            requirement: {
                                              ...row.requirement,
                                              target: Math.max(1, Number(e.target.value) || 1),
                                            },
                                          }
                                        : row
                                    ),
                                  })
                                }
                              />
                            </label>
                          </div>
                          {achievement.requirement.metric.startsWith('event') && (
                            <label className={styles.field}>
                              <span className={styles.label}>Evento associado</span>
                              <select
                                className={styles.select}
                                value={achievement.requirement.eventId || ''}
                                onChange={(e) =>
                                  setCatalog({
                                    ...catalog,
                                    achievements: catalog.achievements.map((row, i) =>
                                      i === index
                                        ? {
                                            ...row,
                                            requirement: {
                                              ...row.requirement,
                                              eventId: e.target.value || undefined,
                                            },
                                          }
                                        : row
                                    ),
                                  })
                                }
                              >
                                <option value="">Selecione um evento</option>
                                {catalog.events.map((event) => (
                                  <option key={event.id} value={event.id}>
                                    {event.name}
                                  </option>
                                ))}
                              </select>
                            </label>
                          )}
                          <div className={styles.split}>
                            <label className={styles.field}>
                              <span className={styles.label}>Raridade</span>
                              <select
                                className={styles.select}
                                value={achievement.rarity}
                                onChange={(e) =>
                                  setCatalog({
                                    ...catalog,
                                    achievements: catalog.achievements.map((row, i) =>
                                      i === index
                                        ? { ...row, rarity: e.target.value as typeof row.rarity }
                                        : row
                                    ),
                                  })
                                }
                              >
                                {PROFILE_RARITIES.map((rarity) => (
                                  <option key={rarity} value={rarity}>
                                    {rarityNames[rarity]}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <label className={styles.field}>
                              <span className={styles.label}>Ícone</span>
                              <select
                                className={styles.select}
                                value={achievement.icon}
                                onChange={(e) =>
                                  setCatalog({
                                    ...catalog,
                                    achievements: catalog.achievements.map((row, i) =>
                                      i === index
                                        ? { ...row, icon: e.target.value as typeof row.icon }
                                        : row
                                    ),
                                  })
                                }
                              >
                                {icons.map((icon) => (
                                  <option key={icon} value={icon}>
                                    {icon}
                                  </option>
                                ))}
                              </select>
                            </label>
                          </div>
                        </section>
                      ))}
                      <button
                        className={styles.button}
                        type="button"
                        onClick={() =>
                          setCatalog({
                            ...catalog,
                            achievements: [
                              ...catalog.achievements,
                              {
                                id: `achievement-${Date.now().toString(36)}`,
                                name: 'Nova conquista',
                                description: 'Publique uma publicação válida.',
                                icon: 'award',
                                category: 'posts',
                                rarity: 'common',
                                color: '#64748b',
                                requirement: { metric: 'posts', target: 1 },
                              },
                            ],
                          })
                        }
                      >
                        <Plus size={16} />
                        Adicionar conquista
                      </button>
                    </>
                  )}
                  {tab === 'frames' && (
                    <>
                      {catalog.frames.map((frame, index) => (
                        <section
                          key={index}
                          style={{
                            paddingBottom: 20,
                            marginBottom: 24,
                            borderBottom: '1px solid var(--color-dd-border)',
                          }}
                        >
                          <h2 className={styles.achievementTitle}>{frame.name}</h2>
                          <p className={styles.help} style={{ margin: '6px 0 18px' }}>
                            ID estável: {frame.id}
                          </p>
                          <label className={styles.field}>
                            <span className={styles.label}>Nome da moldura</span>
                            <input
                              className={styles.input}
                              value={frame.name}
                              maxLength={50}
                              onChange={(e) =>
                                setCatalog({
                                  ...catalog,
                                  frames: catalog.frames.map((row, i) =>
                                    i === index ? { ...row, name: e.target.value } : row
                                  ),
                                })
                              }
                            />
                          </label>
                          <div className={styles.split}>
                            <label className={styles.field}>
                              <span className={styles.label}>Cor</span>
                              <input
                                className={styles.colorPicker}
                                type="color"
                                value={frame.color}
                                onChange={(e) =>
                                  setCatalog({
                                    ...catalog,
                                    frames: catalog.frames.map((row, i) =>
                                      i === index ? { ...row, color: e.target.value } : row
                                    ),
                                  })
                                }
                              />
                            </label>
                            <label className={styles.field}>
                              <span className={styles.label}>Decoração</span>
                              <select
                                className={styles.select}
                                disabled={frame.id === 'none'}
                                value={frame.decoration}
                                onChange={(e) =>
                                  setCatalog({
                                    ...catalog,
                                    frames: catalog.frames.map((row, i) =>
                                      i === index
                                        ? {
                                            ...row,
                                            decoration: e.target.value as typeof row.decoration,
                                          }
                                        : row
                                    ),
                                  })
                                }
                              >
                                {decorations.map((decoration) => (
                                  <option key={decoration} value={decoration}>
                                    {decoration}
                                  </option>
                                ))}
                              </select>
                            </label>
                          </div>
                          <label className={styles.field}>
                            <span className={styles.label}>Conquista para desbloquear</span>
                            <select
                              className={styles.select}
                              disabled={frame.id === 'none'}
                              value={frame.achievementId || ''}
                              onChange={(e) =>
                                setCatalog({
                                  ...catalog,
                                  frames: catalog.frames.map((row, i) =>
                                    i === index
                                      ? { ...row, achievementId: e.target.value || undefined }
                                      : row
                                  ),
                                })
                              }
                            >
                              <option value="">Disponível para todas as pessoas</option>
                              {catalog.achievements.map((achievement) => (
                                <option key={achievement.id} value={achievement.id}>
                                  {achievement.name}
                                </option>
                              ))}
                            </select>
                          </label>
                        </section>
                      ))}
                      <button
                        className={styles.button}
                        type="button"
                        onClick={() =>
                          setCatalog({
                            ...catalog,
                            frames: [
                              ...catalog.frames,
                              {
                                id: `frame-${Date.now().toString(36)}`,
                                name: 'Nova moldura',
                                color: '#0083fe',
                                decoration: 'minimal',
                              },
                            ],
                          })
                        }
                      >
                        <Plus size={16} />
                        Adicionar moldura
                      </button>
                    </>
                  )}
                  {tab === 'advanced' && (
                    <>
                      <p className={styles.notice}>
                        Use esta área para importar ou revisar a configuração completa. Preserve IDs
                        já publicados. A validação verifica referências, datas, catálogo sem moldura
                        e requisitos antes de aplicar.
                      </p>
                      <label className={styles.field}>
                        <span className={styles.label}>JSON do catálogo</span>
                        <textarea
                          className={styles.textarea}
                          spellCheck={false}
                          rows={22}
                          value={advanced}
                          onChange={(e) => setAdvanced(e.target.value)}
                          style={{
                            minHeight: 380,
                            fontFamily: 'var(--font-jetbrains-mono), monospace',
                            fontSize: 12,
                          }}
                        />
                      </label>
                      <button type="button" className={styles.button} onClick={applyJson}>
                        <Check size={16} />
                        Validar e aplicar na prévia
                      </button>
                    </>
                  )}
                </fieldset>
              </>
            )}
          </>
        )}
      </main>
      {saved && catalog && (
        <footer className={styles.footer}>
          <div className={styles.footerInner}>
            <p className={styles.saveState}>
              {saving
                ? 'Publicando regras…'
                : dirty
                  ? 'Mudanças ainda não publicadas.'
                  : `Versão ${saved.version} publicada.`}
            </p>
            <div className={styles.row}>
              <button
                className={styles.button}
                type="button"
                disabled={saving || !dirty}
                onClick={() => {
                  setCatalog(saved.catalog);
                  setAdvanced(JSON.stringify(saved.catalog, null, 2));
                  setError('');
                }}
              >
                <RotateCcw size={15} />
                Descartar
              </button>
              <button
                className={styles.primary}
                type="button"
                disabled={saving || !dirty}
                onClick={() => void save()}
              >
                <Save size={16} />
                {saving ? 'Publicando…' : 'Publicar'}
              </button>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

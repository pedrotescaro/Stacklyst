'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Settings2 } from 'lucide-react';
import {
  availableQuestions,
  configErrors,
  createSession,
  DEFAULT_CONFIG,
  ENADE_YEARS,
  type EnadeConfig,
  type EnadeWorkspace,
} from '@/lib/enade/simulator';
import { newEnadeSeed } from './useEnadeSession';
import { useEnadeWorkspace } from './useEnadeWorkspace';
import styles from './EnadeCourse.module.css';

export function EnadeConfiguration({
  userId,
  initialWorkspace,
}: {
  userId: string;
  initialWorkspace?: EnadeWorkspace;
}) {
  const router = useRouter();
  const { workspace, ready, save, saveStatus } = useEnadeWorkspace(userId, initialWorkspace);
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<EnadeConfig>(initialWorkspace?.config || DEFAULT_CONFIG);
  const [confirmReplace, setConfirmReplace] = useState(false);
  const initialized = useRef(false);
  useEffect(() => {
    if (ready && !initialized.current) {
      initialized.current = true;
      if (workspace.config) setConfig(workspace.config);
    }
  }, [ready, workspace.config]);
  const total = availableQuestions(config).length;
  const errors = configErrors(config);
  function update(next: EnadeConfig) {
    setConfig(next);
    setConfirmReplace(false);
  }
  function filter(next: EnadeConfig) {
    const count = availableQuestions(next).length;
    update({ ...next, questionCount: Math.min(next.questionCount || 1, count) });
  }
  function start() {
    if (!ready || errors.length) return;
    const stamp = Date.now();
    const next = createSession(config, newEnadeSeed(), stamp);
    void save({ version: 1, config, session: next, updatedAt: stamp }, true);
    router.push('/trails/enade/personalizado');
  }
  return (
    <section className={styles.configuration} aria-labelledby="custom-title">
      <div className={styles.configurationHeading}>
        <div>
          <h2 id="custom-title">Simulado personalizado</h2>
          <p className={styles.muted}>Combine edições e escolha como quer praticar.</p>
        </div>
        <button
          className={styles.secondaryButton}
          aria-expanded={open}
          aria-controls="enade-configuration"
          onClick={() => setOpen(!open)}
        >
          <Settings2 size={17} />
          {open ? 'Fechar configuração' : 'Personalizar'}
        </button>
      </div>
      {ready && workspace.session && (
        <p className={styles.resumeCustom}>
          <Link href="/trails/enade/personalizado">
            {workspace.session.finishedAt
              ? 'Revisar último personalizado'
              : 'Continuar simulado em andamento'}{' '}
            <ArrowRight size={15} />
          </Link>
        </p>
      )}
      {open && (
        <form
          id="enade-configuration"
          className={styles.configForm}
          onSubmit={(event) => {
            event.preventDefault();
            if (workspace.session && !workspace.session.finishedAt) setConfirmReplace(true);
            else start();
          }}
        >
          <fieldset>
            <legend>Provas de ADS</legend>
            <div className={styles.yearChoices}>
              <label>
                <input
                  type="checkbox"
                  checked={config.years.length === ENADE_YEARS.length}
                  onChange={(event) =>
                    filter({ ...config, years: event.target.checked ? [...ENADE_YEARS] : [] })
                  }
                />{' '}
                Todas
              </label>
              {ENADE_YEARS.map((year) => (
                <label key={year}>
                  <input
                    type="checkbox"
                    checked={config.years.includes(year)}
                    onChange={(event) =>
                      filter({
                        ...config,
                        years: event.target.checked
                          ? [...config.years, year].sort()
                          : config.years.filter((y) => y !== year),
                      })
                    }
                  />{' '}
                  {year}
                </label>
              ))}
            </div>
            <div className={styles.yearRange}>
              <label>
                De
                <select
                  aria-label="Ano inicial"
                  value={config.years.length ? Math.min(...config.years) : ''}
                  onChange={(e) => {
                    const from = Number(e.target.value);
                    const to = Math.max(from, ...config.years);
                    filter({ ...config, years: ENADE_YEARS.filter((y) => y >= from && y <= to) });
                  }}
                >
                  <option value="" disabled>
                    Selecione
                  </option>
                  {ENADE_YEARS.map((y) => (
                    <option key={y}>{y}</option>
                  ))}
                </select>
              </label>
              <label>
                Até
                <select
                  aria-label="Ano final"
                  value={config.years.length ? Math.max(...config.years) : ''}
                  onChange={(e) => {
                    const to = Number(e.target.value);
                    const from = Math.min(to, ...(config.years.length ? config.years : [to]));
                    filter({ ...config, years: ENADE_YEARS.filter((y) => y >= from && y <= to) });
                  }}
                >
                  <option value="" disabled>
                    Selecione
                  </option>
                  {ENADE_YEARS.map((y) => (
                    <option key={y}>{y}</option>
                  ))}
                </select>
              </label>
            </div>
            <label className={styles.checkLine}>
              <input
                type="checkbox"
                checked={config.includeDiscursive}
                onChange={(event) => filter({ ...config, includeDiscursive: event.target.checked })}
              />{' '}
              Incluir discursivas para autoavaliação
            </label>
            <p className={styles.muted}>
              {total} questões disponíveis. Questões anuladas ficam fora da seleção.
            </p>
          </fieldset>
          <div className={styles.configColumns}>
            <fieldset>
              <legend>Quantidade de questões</legend>
              <label className={styles.fieldLabel} htmlFor="enade-count">
                Quantidade
              </label>
              <input
                id="enade-count"
                className={styles.numberInput}
                type="number"
                min={1}
                max={total}
                step={1}
                value={config.questionCount || ''}
                onChange={(e) => update({ ...config, questionCount: Number(e.target.value) })}
              />
              <div className={styles.presets}>
                {[10, 20, 35].map((n) => (
                  <button
                    type="button"
                    key={n}
                    disabled={n > total}
                    aria-pressed={config.questionCount === n}
                    onClick={() => update({ ...config, questionCount: n })}
                  >
                    {n}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={!total}
                  aria-pressed={config.questionCount === total}
                  onClick={() => update({ ...config, questionCount: total })}
                >
                  Todas ({total})
                </button>
              </div>
            </fieldset>
            <fieldset>
              <legend>Tempo de prova</legend>
              <label className={styles.fieldLabel} htmlFor="enade-duration">
                Minutos · de 1 a 300
              </label>
              <input
                id="enade-duration"
                className={styles.numberInput}
                type="number"
                min={1}
                max={300}
                step="any"
                disabled={config.durationMinutes === null}
                value={config.durationMinutes ?? ''}
                onChange={(e) => update({ ...config, durationMinutes: Number(e.target.value) })}
              />
              <div className={styles.presets}>
                {[15, 30, 60, 90].map((n) => (
                  <button
                    type="button"
                    key={n}
                    aria-pressed={config.durationMinutes === n}
                    onClick={() => update({ ...config, durationMinutes: n })}
                  >
                    {n} min
                  </button>
                ))}
                <button
                  type="button"
                  aria-pressed={config.durationMinutes === null}
                  onClick={() => update({ ...config, durationMinutes: null })}
                >
                  Sem tempo
                </button>
              </div>
            </fieldset>
          </div>
          <div className={styles.configColumns}>
            <fieldset>
              <legend>Ordem</legend>
              <div className={styles.modeChoices}>
                <label>
                  <input
                    type="radio"
                    name="enade-order"
                    checked={config.order === 'sequential'}
                    onChange={() => update({ ...config, order: 'sequential' })}
                  />
                  <span>
                    Sequencial<small>Segue a ordem das edições e das questões.</small>
                  </span>
                </label>
                <label>
                  <input
                    type="radio"
                    name="enade-order"
                    checked={config.order === 'random'}
                    onChange={() => update({ ...config, order: 'random' })}
                  />
                  <span>
                    Aleatória<small>Embaralha questões e alternativas.</small>
                  </span>
                </label>
              </div>
            </fieldset>
            <fieldset>
              <legend>Modo</legend>
              <div className={styles.modeChoices}>
                <label>
                  <input
                    type="radio"
                    name="enade-mode"
                    checked={config.mode === 'exam'}
                    onChange={() => update({ ...config, mode: 'exam' })}
                  />
                  <span>
                    Prova<small>Correção e explicações somente no final.</small>
                  </span>
                </label>
                <label>
                  <input
                    type="radio"
                    name="enade-mode"
                    checked={config.mode === 'training'}
                    onChange={() => update({ ...config, mode: 'training' })}
                  />
                  <span>
                    Treino<small>Correção comentada após cada resposta.</small>
                  </span>
                </label>
              </div>
            </fieldset>
          </div>
          {errors.length > 0 && (
            <p className={styles.formError} role="status">
              {errors.join(' ')}
            </p>
          )}
          {config.includeDiscursive && (
            <p className={styles.muted}>
              Discursivas usam o padrão oficial para autoavaliação e não entram na nota automática.
            </p>
          )}
          {confirmReplace ? (
            <div className={styles.confirm}>
              <p>
                Há um simulado personalizado em andamento. Iniciar outro substitui esse rascunho.
              </p>
              <button
                type="button"
                className={styles.primary}
                disabled={!!errors.length}
                onClick={start}
              >
                Substituir e iniciar
              </button>
              <button type="button" onClick={() => setConfirmReplace(false)}>
                Continuar configurando
              </button>
            </div>
          ) : (
            <button
              className={styles.startButton}
              type="submit"
              disabled={!ready || !!errors.length}
            >
              Iniciar simulado <ArrowRight size={17} />
            </button>
          )}
          {saveStatus && (
            <p role="status" className={styles.saveStatus}>
              {saveStatus}
            </p>
          )}
        </form>
      )}
    </section>
  );
}

'use client';
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Clock3,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { TrailCourseSelector, type TrailCourseOption } from '../TrailCourseSelector';
import type { TrailCourseCode } from '../TrailLanguageLogo';
import catalog from '@/lib/enade/exams.json';
import { gradeEnade, type EnadeAttempt, type EnadeExam } from '@/lib/enade/types';
import { useEnadeProgress } from './useEnadeProgress';
import styles from './EnadeCourse.module.css';
const exams = [...catalog].reverse() as EnadeExam[];
type Props = {
  user: { id: string; username: string; avatar_url: string | null; total_xp: number };
  courses: TrailCourseOption[];
  initialAttempts: Record<string, EnadeAttempt>;
};
export function EnadeCourse({ user, courses, initialAttempts }: Props) {
  const router = useRouter();
  const { attempts, saveStatus, save } = useEnadeProgress(user.id, initialAttempts);
  const [confirmRestart, setConfirmRestart] = useState<number | null>(null);
  const [restarting, setRestarting] = useState(false);
  const [preferenceError, setPreferenceError] = useState('');
  useEffect(() => {
    void fetch('/api/trails/course-preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        activeLanguage: 'ENADE',
        startedLanguages: [
          ...new Set(
            courses
              .filter((c) => c.started)
              .map((c) => c.language)
              .concat('ENADE')
          ),
        ],
      }),
    }).catch(() => {});
  }, [courses]);
  async function restartExam(year: number) {
    setRestarting(true);
    const stamp = Date.now();
    const ok = await save(
      year,
      { answers: {}, marked: [], startedAt: stamp, updatedAt: stamp, finishedAt: null },
      true
    );
    setRestarting(false);
    if (ok) router.push(`/trails/enade/${year}`);
  }
  async function selectCourse(language: TrailCourseCode) {
    if (language === 'ENADE') {
      return;
    }
    try {
      const response = await fetch('/api/trails/course-preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activeLanguage: language,
          startedLanguages: [
            ...new Set(
              courses
                .filter((c) => c.started)
                .map((c) => c.language)
                .concat(language, 'ENADE')
            ),
          ],
        }),
      });
      if (!response.ok) throw new Error('preferences');
      router.push(`/trails?view=map&language=${language}`);
    } catch {
      setPreferenceError('Não foi possível trocar de curso. Tente novamente.');
    }
  }

  return (
    <div className="dd-platform-shell">
      <Sidebar user={user} />
      <div className="dd-platform-body">
        <main className={`dd-platform-main ${styles.main} ${styles.courseMain}`}>
          <header className={styles.header}>
            <Link href="/trails?view=map&language=JS" className={styles.back}>
              <ArrowLeft size={16} /> Trilhas
            </Link>
            <TrailCourseSelector
              activeLanguage="ENADE"
              courses={courses}
              onSelectCourse={selectCourse}
            />
          </header>
          <div className={styles.overview}>
            <img src="/enade/logo.png" alt="Enade" className={styles.logo} />
            <h1>Curso Enade · ADS</h1>
            <p className={styles.intro}>
              Prepare-se para o Enade de Análise e Desenvolvimento de Sistemas com as provas que já
              foram aplicadas.
            </p>
            <div className={styles.facts}>
              <span>
                <BookOpen size={16} /> 5 edições · 200 questões
              </span>
              <span>
                <Clock3 size={16} /> 4 horas por simulado
              </span>
            </div>
            <h2>Seu caminho de preparação</h2>
            <p className={styles.muted}>
              Escolha uma edição. Você pode começar por qualquer uma e retomar de onde parou.
            </p>
            <ol className={styles.path}>
              {exams.map((edition) => {
                const saved = attempts[edition.year];
                const summary = saved?.finishedAt ? gradeEnade(edition, saved.answers) : null;
                return (
                  <li key={edition.year}>
                    <span className={`${styles.pathDot} ${summary ? styles.done : ''}`}>
                      {summary ? <Check size={20} /> : <BookOpen size={19} />}
                    </span>
                    <div className={styles.edition}>
                      <h3>Enade {edition.year}</h3>
                      <p>40 questões · Formação geral e componente específico</p>
                      {summary ? (
                        <p>
                          {summary.correct}/{summary.total} objetivas válidas · {summary.percent}%
                          de acerto
                        </p>
                      ) : saved ? (
                        <p>
                          {Object.values(saved.answers).filter(Boolean).length}/40 respondidas · Em
                          andamento
                        </p>
                      ) : null}
                    </div>
                    <Link className={styles.primary} href={`/trails/enade/${edition.year}`}>
                      {summary ? 'Revisar' : saved ? 'Continuar' : 'Iniciar'}
                      <ArrowRight size={16} />
                    </Link>
                    {saved && (
                      <button
                        className={styles.iconButton}
                        aria-label={`Reiniciar simulado ${edition.year}`}
                        onClick={() => setConfirmRestart(edition.year)}
                      >
                        <RotateCcw size={16} />
                      </button>
                    )}
                    {confirmRestart === edition.year && (
                      <div className={styles.confirm}>
                        <p>Reiniciar substitui as respostas salvas desta edição.</p>
                        <button
                          className={styles.primary}
                          disabled={restarting}
                          onClick={() => void restartExam(edition.year)}
                        >
                          Reiniciar
                        </button>
                        <button onClick={() => setConfirmRestart(null)}>Cancelar</button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
            <p className={styles.source}>
              Cadernos, gabaritos definitivos e padrões de resposta do{' '}
              <a
                href="https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enade/provas-e-gabaritos"
                target="_blank"
                rel="noreferrer"
              >
                Inep <ExternalLink size={12} />
              </a>
              . Preparação independente, sem vínculo com o Inep. As discursivas são revisadas pelo
              padrão oficial; a porcentagem de acertos não é a nota oficial do Enade.
            </p>
          </div>
          <p className={styles.saveStatus} role="status">
            {preferenceError || saveStatus}
          </p>
        </main>
      </div>
    </div>
  );
}

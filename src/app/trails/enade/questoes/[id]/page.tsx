import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireEnadeUserId } from '@/lib/enade/hub.server';
import { QUESTION_BY_ID } from '@/lib/enade/simulator';
import { questionLabel } from '@/lib/enade/topics';
import { studyAids } from '@/lib/enade/aids.server';
import { dateTime } from '@/lib/enade/format';
import { discursiveSummary } from '@/lib/enade/discursive';
import { EnadeShell } from '../../_components/EnadeShell';
import { StartAttemptButton } from '../../_components/StartAttemptButton';
import { FavoriteButton } from '../../_components/FavoriteButton';
import { QuestionDetail } from '../../_components/QuestionDetail';
import ui from '../../_components/ui.module.css';

export default async function QuestionPage({ params }: { params: Promise<{ id: string }> }) {
  const userId = await requireEnadeUserId();
  const { id } = await params;
  const question = QUESTION_BY_ID.get(id);
  if (!question) notFound();
  const [answers, favorite] = await Promise.all([
    prisma.enadeAnswer.findMany({
      where: { user_id: userId, question_id: id },
      orderBy: { answered_at: 'desc' },
      select: { id: true, selected: true, correct: true, answered_at: true, attempt_id: true },
    }),
    prisma.enadeFavorite.findUnique({
      where: { user_id_kind_ref: { user_id: userId, kind: 'QUESTION', ref: id } },
    }),
  ]);
  const aids = studyAids([id])[id];
  return (
    <EnadeShell
      title={questionLabel(question)}
      description={
        <>
          Questão oficial do Inep ·{' '}
          {question.section === 'general' ? 'Formação geral' : 'Componente específico'}
          {aids.topics.length ? ` · ${aids.topics.map((t) => t.title).join(', ')}` : ''}
        </>
      }
      actions={
        <>
          <FavoriteButton
            kind="QUESTION"
            refId={id}
            initial={!!favorite}
            label={questionLabel(question)}
          />
          {!question.annulled && (
            <StartAttemptButton payload={{ kind: 'PRACTICE', questionId: id, mode: 'training' }}>
              Resolver agora
            </StartAttemptButton>
          )}
        </>
      }
    >
      <p className={ui.muted} style={{ marginBottom: 16 }}>
        <Link className={ui.link} href="/trails/enade/questoes">
          ← Banco de questões
        </Link>
      </p>
      <QuestionDetail questionId={id} aids={aids} />
      {answers.length > 0 && (
        <section className={ui.section} aria-labelledby="my-answers">
          <div className={ui.sectionHead}>
            <h2 id="my-answers">Suas respostas a esta questão</h2>
            <p>Letras do caderno oficial.</p>
          </div>
          <ul className={ui.rows}>
            {answers.map((a) => (
              <li key={a.id} className={`${ui.row} ${ui.rowCompact}`}>
                <div className={ui.rowMain}>
                  <p className={ui.rowMeta} style={{ marginTop: 0 }}>
                    <span>{dateTime(a.answered_at)}</span>
                    <span>
                      Resposta:{' '}
                      {a.selected
                        ? question.kind === 'discursive'
                          ? discursiveSummary(a.selected)
                          : a.selected
                        : question.kind === 'discursive'
                          ? 'discursiva'
                          : 'em branco'}
                    </span>
                  </p>
                </div>
                {a.correct !== null && (
                  <span className={ui.badge} data-tone={a.correct ? 'success' : 'danger'}>
                    {a.correct ? 'Correta' : 'Incorreta'}
                  </span>
                )}
                <Link className={ui.ghost} href={`/trails/enade/simulados/${a.attempt_id}`}>
                  Abrir tentativa
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </EnadeShell>
  );
}

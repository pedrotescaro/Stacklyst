import Link from 'next/link';
import type { Recommendation } from '@/lib/enade/recommendations';
import { percent } from '@/lib/enade/format';
import { StartAttemptButton } from './StartAttemptButton';
import ui from './ui.module.css';

const LABEL: Record<Recommendation['kind'], { text: string; tone: string }> = {
  struggling: { text: 'Dificuldade', tone: 'danger' },
  notebook: { text: 'Caderno de erros', tone: 'warning' },
  frequent: { text: 'Muito cobrado', tone: 'accent' },
};

export function Recommendations({ items }: { items: Recommendation[] }) {
  if (!items.length)
    return (
      <div className={ui.empty}>
        <h3>Tudo em dia</h3>
        <p>Continue praticando para que as recomendações acompanhem seu desempenho.</p>
      </div>
    );
  return (
    <ul className={ui.rows}>
      {items.map((item) => (
        <li key={item.topic} className={ui.row}>
          <div className={ui.rowMain}>
            <p className={ui.rowTitle}>
              <Link href={`/trails/enade/biblioteca/${item.topic}`}>{item.title}</Link>{' '}
              <span className={ui.badge} data-tone={LABEL[item.kind].tone}>
                {LABEL[item.kind].text}
              </span>
            </p>
            <p className={ui.rowMeta}>
              <span>{item.reason}</span>
              {item.accuracy !== null && <span>Aproveitamento {percent(item.accuracy)}</span>}
              {item.studied && <span>Conteúdo já estudado</span>}
            </p>
          </div>
          <div className={ui.rowAside}>
            <Link className={ui.secondary} href={`/trails/enade/biblioteca/${item.topic}`}>
              {item.studied ? 'Revisar teoria' : 'Estudar'}
            </Link>
            {item.dueErrors > 0 ? (
              <StartAttemptButton payload={{ kind: 'REVIEW', topic: item.topic, scope: 'due' }}>
                Revisar erros
              </StartAttemptButton>
            ) : item.officialQuestions > 0 ? (
              <StartAttemptButton payload={{ kind: 'TOPIC', topic: item.topic, limit: 10 }}>
                Praticar
              </StartAttemptButton>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}

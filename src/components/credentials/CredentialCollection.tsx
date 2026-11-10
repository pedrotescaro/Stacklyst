'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, BadgeCheck, Check, Download, LockKeyhole, Search } from 'lucide-react';
import { BadgeArt } from './BadgeArt';
import type { CredentialCollection as Collection, CredentialRecord } from '@/lib/credentials/types';
import { useLocalizedText } from '@/i18n/useLocalizedText';
import styles from './Credentials.module.css';

export function CredentialCollection({
  collection,
  isOwner = true,
}: {
  collection: Collection;
  isOwner?: boolean;
}) {
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(24);
  const { text } = useLocalizedText();
  const items = collection.items
    .filter(
      (item) =>
        (filter === 'all' ||
          (filter === 'earned'
            ? item.credential?.status === 'valid'
            : item.definition.language === filter)) &&
        `${item.definition.title} ${item.definition.description}`
          .toLocaleLowerCase()
          .includes(query.toLocaleLowerCase())
    )
    .sort(
      (left, right) =>
        Number(right.credential?.status === 'valid') -
          Number(left.credential?.status === 'valid') ||
        ['first_lesson', 'course', 'section', 'path', 'practice'].indexOf(left.definition.kind) -
          ['first_lesson', 'course', 'section', 'path', 'practice'].indexOf(right.definition.kind)
    );
  return (
    <div className={styles.collection}>
      <div className={styles.introduction}>
        <p>
          {isOwner
            ? text(
                'Cada badge conta uma conquista sua. Conclua as atividades indicadas para receber uma credencial com certificado e verificação pública.',
                'Each badge tells one of your achievements. Complete the listed activities to receive a credential with a certificate and public verification.'
              )
            : text(
                'Certificados conquistados por este perfil, com atividades concluídas e verificação pública.',
                'Certificates earned by this profile, with completed activities and public verification.'
              )}
        </p>
        <span>
          <BadgeCheck size={19} aria-hidden="true" /> {collection.earnedCount}{' '}
          {collection.earnedCount === 1
            ? text('certificado conquistado', 'certificate earned')
            : text('certificados conquistados', 'certificates earned')}
        </span>
      </div>
      <div className={styles.tools}>
        <label className={styles.search}>
          <Search size={18} aria-hidden="true" />
          <input
            aria-label={text('Buscar certificados', 'Search certificates')}
            placeholder={text('Buscar curso ou conquista', 'Search course or achievement')}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setLimit(24);
            }}
          />
        </label>
        <label className={styles.select}>
          {text('Exibir', 'Show')}
          <select
            aria-label={text('Filtrar certificados', 'Filter certificates')}
            value={filter}
            onChange={(event) => {
              setFilter(event.target.value);
              setLimit(24);
            }}
          >
            <option value="all">{text('Todas as conquistas', 'All achievements')}</option>
            <option value="earned">{text('Conquistadas', 'Earned')}</option>
            {['JS', 'TS', 'PYTHON', 'RUST', 'GO', 'JAVA'].map((language) => (
              <option key={language} value={language}>
                {
                  {
                    JS: 'JavaScript',
                    TS: 'TypeScript',
                    PYTHON: 'Python',
                    RUST: 'Rust',
                    GO: 'Go',
                    JAVA: 'Java',
                  }[language as 'JS']
                }
              </option>
            ))}
          </select>
        </label>
      </div>
      {items.length === 0 ? (
        <div className={styles.empty}>
          {isOwner || collection.items.length ? (
            <>
              <Search size={30} aria-hidden="true" />
              <h2>{text('Nenhum certificado encontrado', 'No certificate found')}</h2>
              <p>
                {text(
                  'Tente outro nome ou exiba todas as conquistas.',
                  'Try another name or show all achievements.'
                )}
              </p>
              <button
                onClick={() => {
                  setQuery('');
                  setFilter('all');
                }}
              >
                {text('Ver todas', 'Show all')}
              </button>
            </>
          ) : (
            <>
              <BadgeCheck size={30} aria-hidden="true" />
              <h2>
                {text(
                  'Este perfil ainda não possui certificados',
                  'This profile has no certificates yet'
                )}
              </h2>
              <p>
                {text(
                  'As conquistas verificadas aparecerão aqui.',
                  'Verified achievements will appear here.'
                )}
              </p>
            </>
          )}
        </div>
      ) : (
        <div className={styles.list}>
          {items.slice(0, limit).map(({ definition, completed, total, credential }) => (
            <section
              key={`${definition.id}:${definition.version}`}
              className={styles.item}
              data-earned={credential?.status === 'valid'}
            >
              <BadgeArt
                language={definition.language}
                kind={definition.kind}
                title={definition.title}
                size={144}
                locked={credential?.status !== 'valid'}
              />
              <div className={styles.itemBody}>
                <div className={styles.status}>
                  {credential?.status === 'valid' ? (
                    <>
                      <Check size={15} /> {text('Conquistada', 'Earned')}
                    </>
                  ) : (
                    <>
                      <LockKeyhole size={14} />{' '}
                      {credential?.status === 'revoked'
                        ? text('Credencial revogada', 'Credential revoked')
                        : text('Em conquista', 'In progress')}
                    </>
                  )}
                </div>
                <h2>{definition.title}</h2>
                <p>{definition.description}</p>
                <details className={styles.criteria}>
                  <summary>
                    {isOwner
                      ? text('Como conquistar', 'How to earn')
                      : text('Atividades concluídas', 'Completed activities')}{' '}
                    · {completed} {text('de', 'of')} {total}{' '}
                    {total === 1 ? text('atividade', 'activity') : text('atividades', 'activities')}
                  </summary>
                  {definition.requirements.length ? (
                    <ul>
                      {definition.requirements.map((requirement) => (
                        <li key={`${requirement.source}:${requirement.id}`}>{requirement.title}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>
                      {text(
                        'Conclua todas as atividades avaliadas de uma lição para conquistar seu primeiro certificado.',
                        'Complete every assessed activity of a lesson to earn your first certificate.'
                      )}
                    </p>
                  )}
                </details>
                <div className={styles.itemActions}>
                  {credential?.status === 'valid' ? (
                    <>
                      <Link href={`/certificates/${credential.id}`}>
                        {text('Ver certificado', 'View certificate')} <ArrowUpRight size={16} />
                      </Link>
                      <a href={`/api/certificates/${credential.id}/pdf`} download>
                        <Download size={16} /> {text('Baixar PDF', 'Download PDF')}
                      </a>
                    </>
                  ) : credential?.status === 'revoked' ? (
                    <Link href={`/certificates/${credential.id}`}>
                      {text('Consultar registro', 'Check record')} <ArrowUpRight size={16} />
                    </Link>
                  ) : (
                    <Link href="/trails">
                      {text('Continuar aprendendo', 'Continue learning')} <ArrowUpRight size={16} />
                    </Link>
                  )}
                </div>
              </div>
            </section>
          ))}
        </div>
      )}
      {items.length > limit && (
        <div className={styles.more}>
          <button onClick={() => setLimit((value) => value + 24)}>
            {text('Mostrar mais conquistas', 'Show more achievements')} ({items.length - limit})
          </button>
        </div>
      )}
    </div>
  );
}

export function CredentialShowcase({ credentials }: { credentials: CredentialRecord[] }) {
  const { text } = useLocalizedText();
  if (!credentials.length)
    return (
      <div className={styles.emptyProfile}>
        <BadgeCheck size={28} aria-hidden="true" />
        <p>
          {text(
            'As badges aparecem aqui após uma conclusão verificada.',
            'Badges appear here after a verified completion.'
          )}
        </p>
        <Link href="/certificates">
          {text('Conhecer as conquistas', 'Explore the achievements')} <ArrowUpRight size={15} />
        </Link>
      </div>
    );
  return (
    <div className={styles.showcase}>
      {credentials.map((record) => (
        <Link
          key={record.id}
          href={`/certificates/${record.id}`}
          title={text(`Verificar ${record.definition.title}`, `Verify ${record.definition.title}`)}
        >
          <BadgeArt
            language={record.definition.language}
            kind={record.definition.kind}
            title={record.definition.title}
            size={140}
          />
          <span>{record.definition.title}</span>
          <small>
            <BadgeCheck size={13} /> {text('Verificada', 'Verified')}
          </small>
        </Link>
      ))}
    </div>
  );
}

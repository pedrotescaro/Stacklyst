'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, BadgeCheck, Check, Download, LockKeyhole, Search } from 'lucide-react';
import { BadgeArt } from './BadgeArt';
import type { CredentialCollection as Collection, CredentialRecord } from '@/lib/credentials/types';
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
            ? 'Cada badge conta uma conquista sua. Conclua as atividades indicadas para receber uma credencial com certificado e verificação pública.'
            : 'Certificados conquistados por este perfil, com atividades concluídas e verificação pública.'}
        </p>
        <span>
          <BadgeCheck size={19} aria-hidden="true" /> {collection.earnedCount}{' '}
          {collection.earnedCount === 1 ? 'certificado conquistado' : 'certificados conquistados'}
        </span>
      </div>
      <div className={styles.tools}>
        <label className={styles.search}>
          <Search size={18} aria-hidden="true" />
          <input
            aria-label="Buscar certificados"
            placeholder="Buscar curso ou conquista"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setLimit(24);
            }}
          />
        </label>
        <label className={styles.select}>
          Exibir
          <select
            aria-label="Filtrar certificados"
            value={filter}
            onChange={(event) => {
              setFilter(event.target.value);
              setLimit(24);
            }}
          >
            <option value="all">Todas as conquistas</option>
            <option value="earned">Conquistadas</option>
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
              <h2>Nenhum certificado encontrado</h2>
              <p>Tente outro nome ou exiba todas as conquistas.</p>
              <button
                onClick={() => {
                  setQuery('');
                  setFilter('all');
                }}
              >
                Ver todas
              </button>
            </>
          ) : (
            <>
              <BadgeCheck size={30} aria-hidden="true" />
              <h2>Este perfil ainda não possui certificados</h2>
              <p>As conquistas verificadas aparecerão aqui.</p>
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
                      <Check size={15} /> Conquistada
                    </>
                  ) : (
                    <>
                      <LockKeyhole size={14} />{' '}
                      {credential?.status === 'revoked' ? 'Credencial revogada' : 'Em conquista'}
                    </>
                  )}
                </div>
                <h2>{definition.title}</h2>
                <p>{definition.description}</p>
                <details className={styles.criteria}>
                  <summary>
                    {isOwner ? 'Como conquistar' : 'Atividades concluídas'} · {completed} de {total}{' '}
                    {total === 1 ? 'atividade' : 'atividades'}
                  </summary>
                  {definition.requirements.length ? (
                    <ul>
                      {definition.requirements.map((requirement) => (
                        <li key={`${requirement.source}:${requirement.id}`}>{requirement.title}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>
                      Conclua todas as atividades avaliadas de uma lição para conquistar seu
                      primeiro certificado.
                    </p>
                  )}
                </details>
                <div className={styles.itemActions}>
                  {credential?.status === 'valid' ? (
                    <>
                      <Link href={`/certificates/${credential.id}`}>
                        Ver certificado <ArrowUpRight size={16} />
                      </Link>
                      <a href={`/api/certificates/${credential.id}/pdf`} download>
                        <Download size={16} /> Baixar PDF
                      </a>
                    </>
                  ) : credential?.status === 'revoked' ? (
                    <Link href={`/certificates/${credential.id}`}>
                      Consultar registro <ArrowUpRight size={16} />
                    </Link>
                  ) : (
                    <Link href="/trails">
                      Continuar aprendendo <ArrowUpRight size={16} />
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
            Mostrar mais conquistas ({items.length - limit})
          </button>
        </div>
      )}
    </div>
  );
}

export function CredentialShowcase({ credentials }: { credentials: CredentialRecord[] }) {
  if (!credentials.length)
    return (
      <div className={styles.emptyProfile}>
        <BadgeCheck size={28} aria-hidden="true" />
        <p>As badges aparecem aqui após uma conclusão verificada.</p>
        <Link href="/certificates">
          Conhecer as conquistas <ArrowUpRight size={15} />
        </Link>
      </div>
    );
  return (
    <div className={styles.showcase}>
      {credentials.map((record) => (
        <Link
          key={record.id}
          href={`/certificates/${record.id}`}
          title={`Verificar ${record.definition.title}`}
        >
          <BadgeArt
            language={record.definition.language}
            kind={record.definition.kind}
            title={record.definition.title}
            size={140}
          />
          <span>{record.definition.title}</span>
          <small>
            <BadgeCheck size={13} /> Verificada
          </small>
        </Link>
      ))}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { BadgeCheck } from 'lucide-react';
import type { CredentialCollection as Collection, CredentialRecord } from '@/lib/credentials/types';
import { CredentialCollection } from './CredentialCollection';
import styles from './Credentials.module.css';

type CollectionState =
  | { status: 'loading' }
  | { status: 'ready'; collection: Collection }
  | { status: 'error'; message: string };

function OwnCertificates() {
  const [state, setState] = useState<CollectionState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      try {
        const response = await fetch('/api/certificates', {
          signal: controller.signal,
          cache: 'no-store',
        });
        const result = await response.json();
        if (!response.ok)
          throw new Error(
            result.message || result.error || 'Não foi possível carregar os certificados.'
          );
        if (!controller.signal.aborted) setState({ status: 'ready', collection: result });
      } catch (error) {
        if (!controller.signal.aborted)
          setState({
            status: 'error',
            message: error instanceof Error ? error.message : 'Sem conexão. Tente novamente.',
          });
      }
    })();
    return () => controller.abort();
  }, [attempt]);

  if (state.status === 'ready') return <CredentialCollection collection={state.collection} />;
  if (state.status === 'error')
    return (
      <div className={`${styles.collection} ${styles.empty}`}>
        <BadgeCheck size={30} aria-hidden="true" />
        <h2>Não foi possível carregar os certificados</h2>
        <p role="alert">{state.message}</p>
        <button
          type="button"
          onClick={() => {
            setState({ status: 'loading' });
            setAttempt((value) => value + 1);
          }}
        >
          Tentar novamente
        </button>
      </div>
    );
  return (
    <div className={styles.empty} role="status">
      <BadgeCheck size={30} aria-hidden="true" />
      <p>Carregando certificados…</p>
    </div>
  );
}

export function ProfileCertificates({
  isOwner,
  credentials,
}: {
  isOwner: boolean;
  credentials: CredentialRecord[];
}) {
  if (isOwner) return <OwnCertificates />;
  const earned = credentials.filter((credential) => credential.status === 'valid');
  return (
    <CredentialCollection
      isOwner={false}
      collection={{
        earnedCount: earned.length,
        items: earned.map((credential) => ({
          definition: credential.definition,
          completed: credential.definition.requirements.length,
          total: credential.definition.requirements.length,
          credential,
        })),
      }}
    />
  );
}

import Link from 'next/link';
import type { CredentialRecord } from '@/lib/credentials/types';
import { BadgeCheck, Download, ExternalLink, ShieldAlert } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { BadgeArt } from '@/components/credentials/BadgeArt';

import { verifyCredentialIntegrity } from '@/lib/credentials/integrity';
import { credentialVerificationUrl } from '@/lib/credentials/urls';
import styles from '@/app/certificates/[id]/certificate.module.css';

export function CertificateView({ record }: { record: CredentialRecord }) {
  const valid = record.status === 'valid' && verifyCredentialIntegrity(record);
  const definition = record.definition;
  const date = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'long',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date(record.verifiedAt));
  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <Link href="/feed" aria-label="Stacklyst, página inicial">
          <BrandLogo size={26} />
        </Link>
        <Link href="/certificates">Meus certificados</Link>
      </nav>
      <main className={styles.main}>
        <div className={styles.verification} data-valid={valid}>
          {valid ? <BadgeCheck size={23} /> : <ShieldAlert size={23} />}
          <div>
            <strong>
              {valid ? 'Certificado verificado' : 'Certificado indisponível para validação'}
            </strong>
            <p>
              {valid
                ? 'Emitido pela Stacklyst após a verificação das atividades exigidas.'
                : 'Este registro foi revogado ou sua integridade não pôde ser confirmada.'}
            </p>
          </div>
        </div>
        <article className={styles.certificate}>
          <div className={styles.art}>
            <BadgeArt
              language={definition.language}
              kind={definition.kind}
              title={definition.title}
              size={210}
              locked={!valid}
            />
          </div>
          <div className={styles.body}>
            <h1>{definition.title}</h1>
            <p className={styles.recipient}>
              Conquistado por <strong>{record.recipientName}</strong>
            </p>
            <p>{definition.description}</p>
            <dl>
              <div>
                <dt>Conclusão verificada</dt>
                <dd>{date}</dd>
              </div>
              <div>
                <dt>Atividades exigidas</dt>
                <dd>{definition.requirements.length} concluídas</dd>
              </div>
              {definition.estimatedMinutes > 0 && (
                <div>
                  <dt>Carga estimada do conteúdo</dt>
                  <dd>{definition.estimatedMinutes} minutos</dd>
                </div>
              )}
              <div>
                <dt>Emissor</dt>
                <dd>Stacklyst</dd>
              </div>
            </dl>
          </div>
        </article>
        {valid && (
          <div className={styles.actions}>
            <a href={`/api/certificates/${record.id}/pdf`} download>
              <Download size={19} /> Baixar certificado em PDF
            </a>
            <Link href={`/profile/${encodeURIComponent(record.recipientUsername)}?tab=badges`}>
              Ver perfil <ExternalLink size={16} />
            </Link>
          </div>
        )}
        <section className={styles.details}>
          <h2>O que esta conquista comprova</h2>
          <p>Conclusão das atividades abaixo, com avaliação registrada na plataforma.</p>
          <ul>
            {definition.requirements.map((requirement) => (
              <li key={`${requirement.source}:${requirement.id}`}>{requirement.title}</li>
            ))}
          </ul>
          {definition.skills.length > 0 && (
            <>
              <h2>Competências abordadas</h2>
              <p>{definition.skills.join(' · ')}</p>
            </>
          )}
        </section>
        <section className={styles.details}>
          <h2>Registro de autenticidade</h2>
          <dl>
            <div>
              <dt>ID da credencial</dt>
              <dd>
                <code>{record.id}</code>
              </dd>
            </div>
            <div>
              <dt>Hash SHA-256 do registro</dt>
              <dd>
                <code>{record.integrityHash}</code>
              </dd>
            </div>
            <div>
              <dt>Endereço de verificação</dt>
              <dd>
                <a href={credentialVerificationUrl(record.id)}>
                  {credentialVerificationUrl(record.id)}
                </a>
              </dd>
            </div>
          </dl>
          <p>
            O QR code do PDF abre este registro. O hash permite conferir a integridade dos dados; a
            assinatura visual identifica a emissão pela plataforma.
          </p>
        </section>
      </main>
      <footer className={styles.footer}>
        <BrandLogo size={20} />
        <span>Aprendizado que você pode comprovar.</span>
      </footer>
    </div>
  );
}

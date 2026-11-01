import { notFound } from 'next/navigation';
import { CertificateView } from '@/components/credentials/CertificateView';
import { getPublicCredential } from '@/lib/credentials/repository';

export const dynamic = 'force-dynamic';

export default async function CertificatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const record = await getPublicCredential(id);
  if (!record) notFound();
  return <CertificateView record={record} />;
}

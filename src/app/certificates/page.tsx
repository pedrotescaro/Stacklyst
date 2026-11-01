import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import { getCredentialCollection } from '@/lib/credentials/repository';
import { PlatformPageShell, PlatformPageHeader } from '@/components/PlatformPageShell';
import { CredentialCollection } from '@/components/credentials/CredentialCollection';

export const dynamic = 'force-dynamic';

export default async function CertificatesPage() {
  const user = await getAuthUser();
  if (!user) redirect('/login');
  const collection = await getCredentialCollection(user.id);
  return (
    <PlatformPageShell user={user}>
      <PlatformPageHeader title="Badges e certificados" />
      <CredentialCollection collection={collection} />
    </PlatformPageShell>
  );
}

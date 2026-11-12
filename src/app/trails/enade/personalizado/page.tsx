import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { EMPTY_WORKSPACE, WORKSPACE_KEY } from '@/lib/enade/simulator';
import { enadeWorkspaceSchema } from '@/lib/enade/simulator-schema';
import { EnadeSimulation } from '../EnadeSimulation';

export default async function PersonalizedEnadePage() {
  const user = await getAuthUser();
  if (!user) redirect('/login');
  const row = await prisma.mobileState.findUnique({
    where: { user_id_key: { user_id: user.id, key: WORKSPACE_KEY } },
    select: { value: true },
  });
  const parsed = enadeWorkspaceSchema.safeParse(row?.value);
  return (
    <EnadeSimulation
      key={`${user.id}:personalizado`}
      userId={user.id}
      initialWorkspace={parsed.success ? parsed.data : EMPTY_WORKSPACE}
    />
  );
}

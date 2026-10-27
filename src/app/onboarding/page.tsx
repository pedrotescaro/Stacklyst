import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ONBOARDING_STATE_KEY, parseOnboarding } from '@/lib/onboarding';
import { OnboardingForm } from './OnboardingForm';

export default async function OnboardingPage() {
  const user = await getAuthUser();
  if (!user) redirect('/login');
  const state = await prisma.mobileState.findUnique({
    where: { user_id_key: { user_id: user.id, key: ONBOARDING_STATE_KEY } },
  });
  return <OnboardingForm initialPreferences={parseOnboarding(state?.value)} />;
}

import type { ReactNode } from 'react';
import { requireEnadeUser, shellUser } from '@/lib/enade/hub.server';
import { EnadeFrame } from './_components/EnadeFrame';
import { EnadeRail } from './_components/EnadeRail';

/**
 * The hub frame (sidebar, section tabs and right rail) lives here so it stays mounted
 * while moving between sections: only the page below swaps, and loading states render inside it.
 */
export default async function EnadeLayout({ children }: { children: ReactNode }) {
  const user = await requireEnadeUser();
  return (
    <EnadeFrame user={shellUser(user)} rail={<EnadeRail />}>
      {children}
    </EnadeFrame>
  );
}

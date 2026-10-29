'use client';
import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { AdventureHub } from '@/components/mundinho/AdventureHub';
import type { AdventureTransport, Course } from '@/lib/mundinho/types';

export function AdventureEntry({
  user,
  courses,
}: {
  user: { id: string; username: string; avatar_url: string | null; total_xp: number };
  courses: Course[];
}) {
  const router = useRouter();
  const transport: AdventureTransport = useCallback(async (action) => {
    const response = await fetch('/api/mundinho', {
      method: action ? 'POST' : 'GET',
      headers: action ? { 'Content-Type': 'application/json' } : undefined,
      body: action ? JSON.stringify(action) : undefined,
      cache: 'no-store',
    });
    const body = await response.json();
    if (!response.ok)
      throw new Error(body.message ?? 'Não foi possível carregar o Mundinho. Tente novamente.');
    return body;
  }, []);
  return (
    <div className="dd-platform-shell min-h-screen bg-[#070a0e]">
      <Sidebar user={user} />
      <main className="min-w-0 flex-1 pb-20">
        <AdventureHub
          transport={transport}
          courses={courses}
          onCourse={(language) =>
            router.push(
              `/trails?view=map${language ? `&language=${encodeURIComponent(language)}` : ''}`
            )
          }
        />
      </main>
    </div>
  );
}

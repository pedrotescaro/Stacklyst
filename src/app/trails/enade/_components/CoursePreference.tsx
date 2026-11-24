'use client';
import { useEffect } from 'react';

/** Marks ENADE as the active course so /trails opens here next time. */
export function CoursePreference({ startedLanguages }: { startedLanguages: string[] }) {
  const languages = [...new Set([...startedLanguages, 'ENADE'])].join(',');
  useEffect(() => {
    void fetch('/api/trails/course-preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activeLanguage: 'ENADE', startedLanguages: languages.split(',') }),
    }).catch(() => {});
  }, [languages]);
  return null;
}

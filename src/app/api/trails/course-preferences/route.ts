import { NextResponse } from 'next/server';
import { z } from 'zod';
import { apiHandler } from '@/lib/api-handler';
import { UnauthorizedError } from '@/lib/errors';
import {
  serializeTrailCoursePreferences,
  TRAIL_COURSE_PREFERENCES_COOKIE,
} from '@/app/trails/trailCoursePreferences';

const languageSchema = z.enum(['JS', 'TS', 'PYTHON', 'RUST', 'GO', 'JAVA', 'ENADE']);
const coursePreferencesSchema = z.object({
  activeLanguage: languageSchema,
  startedLanguages: z.array(languageSchema).max(7),
});

export const PUT = apiHandler(async (request, { session }) => {
  if (!session) throw new UnauthorizedError();

  const preferences = coursePreferencesSchema.parse(await request.json());
  const response = NextResponse.json({ ok: true });

  response.cookies.set({
    name: TRAIL_COURSE_PREFERENCES_COOKIE,
    value: serializeTrailCoursePreferences(
      session.id,
      preferences.startedLanguages,
      preferences.activeLanguage
    ),
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  return response;
});

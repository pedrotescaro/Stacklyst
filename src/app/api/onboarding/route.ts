import { NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ONBOARDING_STATE_KEY, onboardingSchema, parseOnboarding } from '@/lib/onboarding';
import {
  serializeTrailCoursePreferences,
  TRAIL_COURSE_PREFERENCES_COOKIE,
} from '@/app/trails/trailCoursePreferences';

export const GET = apiHandler(async () => {
  const user = await requireAuth();
  const state = await prisma.mobileState.findUnique({
    where: { user_id_key: { user_id: user.id, key: ONBOARDING_STATE_KEY } },
  });
  return NextResponse.json(parseOnboarding(state?.value), {
    headers: { 'Cache-Control': 'private, no-store' },
  });
});

export const PUT = apiHandler(async (request) => {
  const user = await requireAuth();
  const parsed = onboardingSchema.parse(await request.json());
  const preferences = { ...parsed, languages: [...new Set(parsed.languages)] };
  await prisma.mobileState.upsert({
    where: { user_id_key: { user_id: user.id, key: ONBOARDING_STATE_KEY } },
    create: { user_id: user.id, key: ONBOARDING_STATE_KEY, value: preferences },
    update: { value: preferences, version: { increment: 1 } },
  });
  const response = NextResponse.json(preferences, {
    headers: { 'Cache-Control': 'private, no-store' },
  });
  response.cookies.set({
    name: TRAIL_COURSE_PREFERENCES_COOKIE,
    value: serializeTrailCoursePreferences(
      user.id,
      preferences.languages,
      preferences.languages[0]
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
});

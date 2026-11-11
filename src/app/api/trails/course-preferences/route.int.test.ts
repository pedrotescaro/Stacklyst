import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getAuthUser } from '@/lib/auth';
import {
  parseTrailCoursePreferences,
  TRAIL_COURSE_PREFERENCES_COOKIE,
} from '@/app/trails/trailCoursePreferences';
import { PUT } from './route';

vi.mock('@/lib/auth', () => ({
  getAuthUser: vi.fn(),
}));

describe('PUT /api/trails/course-preferences', () => {
  beforeEach(() => vi.clearAllMocks());

  it('stores the selected and started courses in an HTTP-only cookie', async () => {
    vi.mocked(getAuthUser).mockResolvedValue({ id: 'user-123' } as never);

    const response = await PUT(
      new Request('http://localhost:3000/api/trails/course-preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activeLanguage: 'TS',
          startedLanguages: ['JS', 'TS'],
        }),
      }),
      { params: Promise.resolve({}) }
    );

    expect(response.status).toBe(200);
    const setCookie = response.headers.get('set-cookie') ?? '';
    expect(setCookie).toContain(`${TRAIL_COURSE_PREFERENCES_COOKIE}=`);
    expect(setCookie).toContain('HttpOnly');
    expect(setCookie.toLowerCase()).toContain('samesite=lax');

    const encodedValue = setCookie.match(
      new RegExp(`${TRAIL_COURSE_PREFERENCES_COOKIE}=([^;]+)`)
    )?.[1];
    expect(parseTrailCoursePreferences(decodeURIComponent(encodedValue ?? ''), 'user-123')).toEqual(
      {
        activeLanguage: 'TS',
        startedLanguages: ['JS', 'TS'],
      }
    );
  });

  it('rejects unauthenticated requests without setting a cookie', async () => {
    vi.mocked(getAuthUser).mockResolvedValue(null);

    const response = await PUT(
      new Request('http://localhost:3000/api/trails/course-preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activeLanguage: 'JS', startedLanguages: ['JS'] }),
      }),
      { params: Promise.resolve({}) }
    );

    expect(response.status).toBe(401);
    expect(response.headers.get('set-cookie')).toBeNull();
  });

  it('accepts Enade as a course without treating it as a programming language', async () => {
    vi.mocked(getAuthUser).mockResolvedValue({ id: 'user-123' } as never);
    const response = await PUT(
      new Request('http://localhost/api/trails/course-preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activeLanguage: 'ENADE', startedLanguages: ['JS', 'ENADE'] }),
      }),
      { params: Promise.resolve({}) }
    );
    expect(response.status).toBe(200);
    expect(decodeURIComponent(response.headers.get('set-cookie') || '')).toContain(
      'JS.ENADE:ENADE'
    );
  });
});

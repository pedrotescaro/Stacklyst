// @vitest-environment node
import { beforeEach, expect, it, vi } from 'vitest';
import { UnauthorizedError } from '@/lib/errors';
const mocks = vi.hoisted(() => ({ auth: vi.fn(), activity: vi.fn(), assign: vi.fn() }));
vi.mock('@/lib/auth', () => ({
  getAuthUser: mocks.auth,
  requireAuth: mocks.auth,
  requireRole: mocks.auth,
}));
vi.mock('@/services/job-activity.service', () => ({
  recruitmentActivity: mocks.activity,
  assignRecruitmentActivity: mocks.assign,
}));
import { POST, GET } from '../[id]/activity/route';
import { PATCH } from '../[id]/stages/[stageId]/route';
const context = { params: Promise.resolve({ id: 'job', stageId: 'stage' }) };
beforeEach(() => {
  vi.clearAllMocks();
  mocks.auth.mockResolvedValue({ id: 'viewer', role: 'USER' });
  mocks.activity.mockResolvedValue({ configured: true, score: null });
});
it('uses the authenticated candidate identity rather than a client supplied identity', async () => {
  const response = await POST(
    new Request('https://stacklyst.test', {
      method: 'POST',
      body: JSON.stringify({ action: 'start' }),
    }),
    context
  );
  expect(response.status).toBe(200);
  expect(mocks.activity).toHaveBeenCalledWith('viewer', 'job', 'start');
});
it.each([
  { action: 'refresh', score: 100 },
  { action: 'start', user_id: 'other' },
  { action: 'start', exerciseId: 'arbitrary' },
  { action: 'unknown' },
])('rejects forged activity input %j before any mutation', async (body) => {
  const response = await POST(
    new Request('https://stacklyst.test', { method: 'POST', body: JSON.stringify(body) }),
    context
  );
  expect(response.status).toBe(400);
  expect(mocks.activity).not.toHaveBeenCalled();
});
it('rejects unauthenticated activity reads and assignments', async () => {
  mocks.auth.mockRejectedValue(new UnauthorizedError());
  expect((await GET(new Request('https://stacklyst.test'), context)).status).toBe(401);
  expect(
    (await PATCH(new Request('https://stacklyst.test', { method: 'PATCH', body: '{}' }), context))
      .status
  ).toBe(401);
  expect(mocks.assign).not.toHaveBeenCalled();
  expect(mocks.activity).not.toHaveBeenCalled();
});

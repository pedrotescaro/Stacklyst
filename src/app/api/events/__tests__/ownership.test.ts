import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from '../route';
import { prisma } from '@/lib/prisma';
import { EventService } from '@/services/event.service';
import { requireAuth } from '@/lib/auth';

vi.mock('@/lib/auth', () => ({ getAuthUser: vi.fn(), requireAuth: vi.fn() }));
vi.mock('@/lib/prisma', () => ({ prisma: { company: { findUnique: vi.fn() } } }));
vi.mock('@/services/event.service', () => ({ EventService: { createEvent: vi.fn() } }));

describe('event company attribution', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.company.findUnique).mockResolvedValue({ owner_id: 'owner' } as never);
    vi.mocked(EventService.createEvent).mockResolvedValue({ id: 'event' } as never);
  });
  const send = (company_id?: string) =>
    POST(
      new Request('https://stacklyst.test/api/events', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Event',
          description: 'Community event',
          company_id,
          start_date: '2026-10-01',
          end_date: '2026-10-02',
        }),
      }),
      { params: Promise.resolve({}) }
    );
  it.each(['USER', 'RECRUITER'])(
    'rejects an unrelated %s before creating an event',
    async (role) => {
      vi.mocked(requireAuth).mockResolvedValue({ id: 'attacker', role } as never);
      expect((await send('company')).status).toBe(403);
      expect(EventService.createEvent).not.toHaveBeenCalled();
    }
  );
  it.each([
    { id: 'owner', role: 'RECRUITER' },
    { id: 'admin', role: 'ADMIN' },
  ])('allows %j', async (user) => {
    vi.mocked(requireAuth).mockResolvedValue(user as never);
    expect((await send('company')).status).toBe(200);
    expect(EventService.createEvent).toHaveBeenCalled();
  });
  it('preserves community events for ordinary users', async () => {
    vi.mocked(requireAuth).mockResolvedValue({ id: 'user', role: 'USER' } as never);
    expect((await send()).status).toBe(200);
    expect(prisma.company.findUnique).not.toHaveBeenCalled();
  });
});

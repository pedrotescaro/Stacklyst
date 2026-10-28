import { it, expect, vi } from 'vitest';
const read = vi.hoisted(() => vi.fn(async () => []));
vi.mock('@/lib/learning/period-leaderboard', () => ({ getPeriodLeaderboard: read }));
import { GET } from './route';
it('passes validated period and language to the net XP ranking', async () => {
  const r = await GET(
    new Request('https://example.test/api/leaderboard?period=weekly&language=PYTHON')
  );
  expect(r.status).toBe(200);
  expect(read).toHaveBeenCalledWith('weekly', 'PYTHON');
  expect(
    (await GET(new Request('https://example.test/api/leaderboard?period=invalid'))).status
  ).toBe(400);
});

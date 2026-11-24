import { render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LegacyDraftRecovery } from './LegacyDraftRecovery';

const router = vi.hoisted(() => ({ refresh: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => router }));

beforeEach(() => {
  localStorage.clear();
  router.refresh.mockClear();
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => Response.json({ imported: true }))
  );
});
afterEach(() => vi.unstubAllGlobals());

describe('Legacy draft recovery', () => {
  it('imports only the current student’s drafts once and keeps the originals', async () => {
    const key = 'enade-ads:student:2021';
    const value = { updatedAt: 100 };
    localStorage.setItem(key, JSON.stringify(value));
    localStorage.setItem('enade-ads:someone-else:2021', JSON.stringify({ updatedAt: 200 }));
    const { unmount } = render(<LegacyDraftRecovery userId="student" />);
    await waitFor(() => expect(router.refresh).toHaveBeenCalled());
    expect(fetch).toHaveBeenCalledExactlyOnceWith(
      '/api/enade/attempts/import',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ userId: 'student', key: 'enade-ads-2021', value }),
      })
    );
    expect(localStorage.getItem(key)).toBe(JSON.stringify(value));
    unmount();
    render(<LegacyDraftRecovery userId="student" />);
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
  });
});

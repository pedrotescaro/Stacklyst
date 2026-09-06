// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
vi.mock('../auth', () => ({ getAuthUser: vi.fn().mockResolvedValue(null) }));
vi.mock('../logger', () => ({ logger: { warn: vi.fn(), error: vi.fn() } }));
import { apiHandler } from '../api-handler';
import { AppError } from '../errors';

describe('API error contract', () => {
  const request = new Request('http://localhost/api/test');
  const context = { params: Promise.resolve({}) };
  it('classifies invalid Zod input as 400, not INTERNAL_ERROR', async () => {
    const response = await apiHandler(async () => {
      z.object({ code: z.string() }).parse({ code: 42 });
      return new Response();
    })(request, context);
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: 'VALIDATION_ERROR' });
    expect(response.headers.get('X-Request-Id')).toBeTruthy();
  });
  it('preserves the controlled save failure and readable feedback', async () => {
    const response = await apiHandler(async () => {
      throw new AppError('PROGRESS_SAVE_UNAVAILABLE', 'Tente novamente.', 503);
    })(request, context);
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ message: 'Tente novamente.' });
  });
  it('does not expose unexpected error details', async () => {
    const response = await apiHandler(async () => {
      throw new Error('private detail');
    })(request, context);
    expect(response.status).toBe(500);
    expect(await response.text()).not.toContain('private detail');
  });
});

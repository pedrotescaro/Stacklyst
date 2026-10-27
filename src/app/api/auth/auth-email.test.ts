import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  signUp: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  resend: vi.fn(),
  verifyOtp: vi.fn(),
  adminCreate: vi.fn(),
  findUnique: vi.fn(),
  userCreate: vi.fn(),
  createMany: vi.fn(),
  signJwt: vi.fn(),
  setJwtCookie: vi.fn(),
  rateLimit: vi.fn(),
  transaction: vi.fn(),
}));
vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn(async () => ({ auth: mocks })) }));
vi.mock('@/lib/supabase/admin', () => ({
  getSupabaseAdminClient: () => ({
    auth: { admin: { createUser: mocks.adminCreate, deleteUser: vi.fn() } },
  }),
}));
vi.mock('@/lib/prisma', () => ({
  hasDatabaseConnection: () => true,
  prisma: { user: { findUnique: mocks.findUnique }, $transaction: mocks.transaction },
}));
vi.mock('@/lib/ratelimit', () => ({ rateLimit: mocks.rateLimit }));
vi.mock('@/lib/auth', () => ({ getAuthUser: vi.fn(async () => null) }));
vi.mock('@/lib/jwt', () => ({ signJwt: mocks.signJwt, setJwtCookie: mocks.setJwtCookie }));

import { POST as register } from './register/route';
import { POST as confirm } from './confirm-email/route';
import { POST as recover } from './forgot-password/route';

const context = { params: Promise.resolve({}) };
function request(path: string, body: unknown) {
  return new Request(`https://stacklyst.test/api/auth/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}
beforeEach(() => {
  vi.clearAllMocks();
  mocks.findUnique.mockResolvedValue(null);
  mocks.signUp.mockResolvedValue({
    data: { user: { id: 'new-user', identities: [{ id: 'identity' }] }, session: null },
    error: null,
  });
  mocks.userCreate.mockResolvedValue({
    id: 'new-user',
    username: 'developer',
    email: 'private@example.com',
    role: 'USER',
  });
  mocks.createMany.mockResolvedValue({ count: 9 });
  mocks.transaction.mockImplementation((callback) =>
    callback({
      user: { create: mocks.userCreate },
      languageTrail: { createMany: mocks.createMany },
    })
  );
  mocks.resend.mockResolvedValue({ error: null });
  mocks.verifyOtp.mockResolvedValue({ data: { user: { id: 'new-user' } }, error: null });
  mocks.resetPasswordForEmail.mockResolvedValue({ error: null });
});

describe('Email ownership and recovery', () => {
  it('registers through public signup, asks for confirmation, and never issues a JWT or pre-confirms email', async () => {
    const response = await register(
      request('register', {
        username: 'developer',
        email: 'private@example.com',
        password: 'strong-password',
      }),
      context
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      success: true,
      requiresEmailConfirmation: true,
      user: { id: 'new-user', username: 'developer' },
    });
    expect(mocks.signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        options: {
          data: { username: 'developer' },
          emailRedirectTo: 'https://stacklyst.test/api/auth/callback?next=/onboarding',
        },
      })
    );
    expect(mocks.adminCreate).not.toHaveBeenCalled();
    expect(mocks.signJwt).not.toHaveBeenCalled();
    expect(mocks.setJwtCookie).not.toHaveBeenCalled();
  });
  it('cannot confirm an address using only its email', async () => {
    const response = await confirm(
      request('confirm-email', { email: 'private@example.com' }),
      context
    );
    expect(response.status).toBe(400);
    expect(mocks.verifyOtp).not.toHaveBeenCalled();
    expect(mocks.adminCreate).not.toHaveBeenCalled();
  });
  it('does not create another application profile when signup identifies an existing Auth account', async () => {
    mocks.signUp.mockResolvedValueOnce({
      data: { user: { id: 'existing-user', identities: [] }, session: null },
      error: null,
    });
    const response = await register(
      request('register', {
        username: 'developer',
        email: 'private@example.com',
        password: 'strong-password',
      }),
      context
    );
    expect(response.status).toBe(409);
    expect(mocks.transaction).not.toHaveBeenCalled();
    expect(mocks.setJwtCookie).not.toHaveBeenCalled();
  });
  it('handles simultaneous registration conflicts without deleting the successful Auth identity or issuing JWTs', async () => {
    mocks.transaction
      .mockResolvedValueOnce({ id: 'new-user', username: 'developer' })
      .mockRejectedValueOnce({ code: 'P2002' });
    const responses = await Promise.all(
      [1, 2].map(() =>
        register(
          request('register', {
            username: 'developer',
            email: 'private@example.com',
            password: 'strong-password',
          }),
          context
        )
      )
    );
    expect(responses.map((response) => response.status).sort()).toEqual([200, 409]);
    expect(mocks.adminCreate).not.toHaveBeenCalled();
    expect(mocks.signJwt).not.toHaveBeenCalled();
    expect(mocks.setJwtCookie).not.toHaveBeenCalled();
  });
  it('resends a signup email without attempting OTP verification or marking it confirmed', async () => {
    const response = await confirm(
      request('confirm-email', { email: 'private@example.com', action: 'resend' }),
      context
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true, confirmed: false });
    expect(mocks.resend).toHaveBeenCalledWith({
      type: 'signup',
      email: 'private@example.com',
      options: { emailRedirectTo: 'https://stacklyst.test/api/auth/callback?next=/onboarding' },
    });
    expect(mocks.verifyOtp).not.toHaveBeenCalled();
  });
  it('requires a valid OTP or token hash to confirm the address', async () => {
    mocks.verifyOtp.mockResolvedValueOnce({ data: {}, error: { message: 'expired' } });
    const invalid = await confirm(
      request('confirm-email', { email: 'private@example.com', token: '123456' }),
      context
    );
    expect(invalid.status).toBe(400);
    const valid = await confirm(
      request('confirm-email', { email: 'private@example.com', token_hash: 'valid-hash' }),
      context
    );
    expect(valid.status).toBe(200);
    expect(mocks.verifyOtp).toHaveBeenLastCalledWith({ token_hash: 'valid-hash', type: 'email' });
  });
  it('sends recovery through Supabase to the local password-reset callback with rate limiting', async () => {
    const response = await recover(
      request('forgot-password', { email: ' Person@Example.com ' }),
      context
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });
    expect(mocks.resetPasswordForEmail).toHaveBeenCalledWith('person@example.com', {
      redirectTo: 'https://stacklyst.test/api/auth/callback?next=/reset-password',
    });
    expect(mocks.rateLimit).toHaveBeenCalled();
    expect(mocks.findUnique).not.toHaveBeenCalled();
  });
  it('rejects invalid recovery input and does not claim success if sending fails', async () => {
    const invalid = await recover(request('forgot-password', { email: 'not-an-email' }), context);
    expect(invalid.status).toBe(400);
    expect(mocks.resetPasswordForEmail).not.toHaveBeenCalled();
    mocks.resetPasswordForEmail.mockResolvedValueOnce({
      error: { code: 'unexpected_failure', status: 500 },
    });
    const failed = await recover(
      request('forgot-password', { email: 'person@example.com' }),
      context
    );
    expect(failed.status).toBe(503);
  });
});

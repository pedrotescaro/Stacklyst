import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as registerHandler } from '@/app/api/auth/register/route';
import { POST as confirmEmailHandler } from '@/app/api/auth/confirm-email/route';
import { GET as getQuizHandler } from '@/app/api/quiz/[id]/route';
import { GET as getDailyQuizHandler } from '@/app/api/quiz/daily/route';
import { POST as uploadHandler } from '@/app/api/upload/route';
import { createPostSchema } from '@/lib/validators';
import { verifyJwt } from '@/lib/jwt';
import * as prismaModule from '@/lib/prisma';
import { prisma } from '@/lib/prisma';
import * as adminModule from '@/lib/supabase/admin';
import * as serverSupabaseModule from '@/lib/supabase/server';
import * as authSessionModule from '@/lib/auth-session';
import * as authModule from '@/lib/auth';

describe('Security and Platform Logic Hardening', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('P0: Orphan Account Takeover Prevention in Register', () => {
    it('rejects registration when email already exists without resetting password', async () => {
      vi.spyOn(prismaModule, 'hasDatabaseConnection').mockReturnValue(true);
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      const mockUpdateUserById = vi.fn();
      vi.spyOn(adminModule, 'getSupabaseAdminClient').mockReturnValue({
        auth: {
          admin: {
            createUser: vi.fn().mockResolvedValue({
              data: { user: null },
              error: { message: 'A user with this email has already been registered' },
            }),
            updateUserById: mockUpdateUserById,
            listUsers: vi.fn(),
          },
        },
      } as any);

      const request = new Request('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'existing@example.com',
          password: 'newPassword123!',
          username: 'attacker',
        }),
      });

      const response = await registerHandler(request, { params: Promise.resolve({}) });
      expect(response.status).toBe(409);
      const json = await response.json();
      expect(json.error).toContain('Endereço de e-mail já está em uso.');
      expect(mockUpdateUserById).not.toHaveBeenCalled();
    });
  });

  describe('P1: Email Confirmation Proof of Identity', () => {
    it('rejects email confirmation when no token or token_hash is supplied', async () => {
      const request = new Request('http://localhost:3000/api/auth/confirm-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'user@example.com',
        }),
      });

      const response = await confirmEmailHandler(request, { params: Promise.resolve({}) });
      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toContain('Token ou código de confirmação é obrigatório');
    });

    it('successfully verifies OTP when valid token is supplied', async () => {
      vi.spyOn(serverSupabaseModule, 'createClient').mockResolvedValue({
        auth: {
          verifyOtp: vi.fn().mockResolvedValue({
            data: { user: { id: 'u-1', email: 'user@example.com' } },
            error: null,
          }),
        },
      } as any);

      const request = new Request('http://localhost:3000/api/auth/confirm-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'user@example.com',
          token: '123456',
        }),
      });

      const response = await confirmEmailHandler(request, { params: Promise.resolve({}) });
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.confirmed).toBe(true);
    });
  });

  describe('P1: SSRF Prevention in Image Validation', () => {
    const originalEnv = process.env.NODE_ENV;

    it('rejects internal IP addresses and loopback in production', async () => {
      (process.env as Record<string, string | undefined>).NODE_ENV = 'production';
      try {
        const testIps = [
          'https://127.0.0.1/pic.jpg',
          'https://10.0.0.1/pic.jpg',
          'https://192.168.1.1/pic.jpg',
          'https://172.20.0.1/pic.jpg',
          'https://169.254.169.254/pic.jpg',
          'https://localhost/pic.jpg',
        ];

        for (const url of testIps) {
          await expect(
            createPostSchema.parseAsync({
              body: 'Valid post content here with mentions',
              image_url: url,
            })
          ).rejects.toThrow();
        }
      } finally {
        (process.env as Record<string, string | undefined>).NODE_ENV = originalEnv;
      }
    });

    it('rejects URLs containing embedded credentials', async () => {
      await expect(
        createPostSchema.parseAsync({
          body: 'Valid post content here with mentions',
          image_url: 'https://user:password@example.com/pic.jpg',
        })
      ).rejects.toThrow();
    });

    it('accepts safe relative upload paths and public HTTPS domains', async () => {
      const parsedRelative = await createPostSchema.parseAsync({
        body: 'Valid post content here with mentions',
        image_url: '/uploads/my-photo.jpg',
      });
      expect(parsedRelative.image_url).toBe('/uploads/my-photo.jpg');

      const parsedHttps = await createPostSchema.parseAsync({
        body: 'Valid post content here with mentions',
        image_url: 'https://images.unsplash.com/photo-123.jpg',
      });
      expect(parsedHttps.image_url).toBe('https://images.unsplash.com/photo-123.jpg');
    });

    it('validates trim before min length on post body', async () => {
      await expect(
        createPostSchema.parseAsync({
          body: '          ', // 10 spaces
        })
      ).rejects.toThrow('O conteúdo deve ter pelo menos 10 caracteres');
    });
  });

  describe('P1: Quiz Information Disclosure Prevention', () => {
    it('hides correct_index when user has not attempted the quiz', async () => {
      vi.spyOn(authSessionModule, 'getAuthUserId').mockResolvedValue('user-viewer');
      vi.spyOn(prisma.quiz, 'findFirst').mockResolvedValue({
        id: 'quiz-1',
        post_id: 'post-1',
        question: 'What is 2+2?',
        options: ['3', '4', '5'],
        correct_index: 1,
        is_daily: false,
        scheduled_for: null,
        created_at: new Date(),
        attempts: [],
      } as any);

      const request = new Request('http://localhost:3000/api/quiz/post-1');
      const response = await getQuizHandler(request, { params: Promise.resolve({ id: 'post-1' }) });
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.correct_index).toBeUndefined();
      expect(json.question).toBe('What is 2+2?');
      expect(json.attempts).toEqual([]);
    });

    it('reveals correct_index after the user has submitted an attempt', async () => {
      vi.spyOn(authSessionModule, 'getAuthUserId').mockResolvedValue('user-viewer');
      vi.spyOn(prisma.quiz, 'findFirst').mockResolvedValue({
        id: 'quiz-1',
        post_id: 'post-1',
        question: 'What is 2+2?',
        options: ['3', '4', '5'],
        correct_index: 1,
        is_daily: false,
        scheduled_for: null,
        created_at: new Date(),
        attempts: [{ user_id: 'user-viewer', selected_index: 1, is_correct: true }],
      } as any);

      const request = new Request('http://localhost:3000/api/quiz/post-1');
      const response = await getQuizHandler(request, { params: Promise.resolve({ id: 'post-1' }) });
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.correct_index).toBe(1);
      expect(json.attempts).toHaveLength(1);
    });

    it('hides correct_index for daily quiz when user has not attempted it', async () => {
      vi.spyOn(authModule, 'requireAuth').mockResolvedValue({ id: 'user-daily-1' } as any);
      vi.spyOn(prisma.quiz, 'findUnique').mockResolvedValue({
        id: 'quiz-daily-1',
        post_id: null,
        question: 'What is TypeScript?',
        options: ['Language', 'Coffee', 'Car'],
        correct_index: 0,
        is_daily: true,
        scheduled_for: new Date(),
        created_at: new Date(),
      } as any);
      vi.spyOn(prisma.quizAttempt, 'findUnique').mockResolvedValue(null);

      const request = new Request('http://localhost:3000/api/quiz/daily');
      const response = await getDailyQuizHandler(request, { params: Promise.resolve({}) });
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.quiz).toBeDefined();
      expect(json.quiz.correct_index).toBeUndefined();
      expect(json.attempt).toBeNull();
    });
  });

  describe('P2: Image Upload Safety', () => {
    it('rejects SVG uploads to prevent stored XSS', async () => {
      vi.spyOn(authModule, 'getAuthUser').mockResolvedValue({ id: 'user-1' } as any);

      const mockFile = {
        name: 'xss.svg',
        type: 'image/svg+xml',
        size: 35,
        arrayBuffer: async () => Buffer.from('<svg><script>alert(1)</script></svg>'),
      };
      const request = {
        formData: async () => ({
          get: (key: string) => (key === 'file' ? mockFile : null),
        }),
      } as unknown as Request;

      const response = await uploadHandler(request);
      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toContain('Tipo de arquivo não suportado');
    });

    it('rejects spoofed MIME type when magic bytes do not match', async () => {
      vi.spyOn(authModule, 'getAuthUser').mockResolvedValue({ id: 'user-1' } as any);

      // Fake PNG that contains text
      const mockFile = {
        name: 'fake.png',
        type: 'image/png',
        size: 21,
        arrayBuffer: async () => Buffer.from('this is not a png file'),
      };
      const request = {
        formData: async () => ({
          get: (key: string) => (key === 'file' ? mockFile : null),
        }),
      } as unknown as Request;

      const response = await uploadHandler(request);
      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toContain('Arquivo corrompido ou formato de imagem inválido');
    });

    it('accepts valid PNG image with matching magic bytes', async () => {
      vi.spyOn(authModule, 'getAuthUser').mockResolvedValue({ id: 'user-1' } as any);
      vi.spyOn(serverSupabaseModule, 'createClient').mockResolvedValue({
        storage: {
          from: vi.fn().mockReturnValue({
            upload: vi.fn().mockResolvedValue({ error: null }),
            getPublicUrl: vi
              .fn()
              .mockReturnValue({ data: { publicUrl: 'https://storage/uploads/user-1/file.png' } }),
          }),
        },
      } as any);

      // PNG magic bytes: 0x89, 0x50, 0x4e, 0x47
      const validPngBytes = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
      const mockFile = {
        name: 'test.png',
        type: 'image/png',
        size: validPngBytes.length,
        arrayBuffer: async () => validPngBytes,
      };
      const request = {
        formData: async () => ({
          get: (key: string) => (key === 'file' ? mockFile : null),
        }),
      } as unknown as Request;

      const response = await uploadHandler(request);
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.url).toBe('https://storage/uploads/user-1/file.png');
    });
  });

  describe('P1: JWT Secret Hardening', () => {
    const originalEnv = process.env.NODE_ENV;

    it('refuses token verification in production when using dev secret', async () => {
      (process.env as Record<string, string | undefined>).NODE_ENV = 'production';
      try {
        const result = await verifyJwt('any-token');
        expect(result).toBeNull();
      } finally {
        (process.env as Record<string, string | undefined>).NODE_ENV = originalEnv;
      }
    });
  });
});

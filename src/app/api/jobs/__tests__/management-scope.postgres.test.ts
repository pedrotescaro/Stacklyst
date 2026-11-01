// @vitest-environment node
import { randomUUID } from 'node:crypto';
import { afterAll, describe, expect, it, vi } from 'vitest';
import type { PrismaClient } from '@prisma/client';
const context = vi.hoisted(() => ({
  db: null as any,
  user: null as null | { id: string; role: string },
}));
vi.mock('@/lib/prisma', () => ({
  prisma: new Proxy({}, { get: (_target, key) => context.db?.[key] }),
}));
vi.mock('@/lib/auth', () => ({
  getAuthUser: () => context.user,
  requireAuth: () => context.user,
  requireRole: () => context.user,
}));
vi.mock('@/lib/mobile/push', () => ({ sendMobilePush: vi.fn() }));
import { GET as companies } from '../../companies/route';
import { GET as jobs } from '../route';
let client: PrismaClient | undefined;
afterAll(async () => {
  await client?.$disconnect();
});

describe.skipIf(process.env.STACKLYST_RECRUITMENT_POSTGRES !== '1')(
  'Managed recruitment listings on PostgreSQL with unconditional rollback',
  () => {
    it('excludes another recruiter’s companies and jobs even when their company id is requested', async () => {
      const dotenv = await import('dotenv');
      dotenv.config({ path: '.env.local', quiet: true });
      const connectionString =
        process.env.STACKLYST_TEST_DATABASE_URL ||
        process.env.DATABASE_URL ||
        process.env.DIRECT_URL;
      if (!connectionString)
        throw new Error('Configure PostgreSQL for rollback-only recruitment checks.');
      const { PrismaClient } = await import('@prisma/client');
      const { PrismaPg } = await import('@prisma/adapter-pg');
      client = new PrismaClient({
        adapter: new PrismaPg({
          connectionString,
          max: 1,
          connectionTimeoutMillis: 10000,
          ssl: { rejectUnauthorized: false },
        }),
      });
      const ownerIds = [randomUUID(), randomUUID()];
      const companyIds = [randomUUID(), randomUUID()];
      const jobIds = [randomUUID(), randomUUID()];
      const rollback = new Error('ROLLBACK_RECRUITMENT_SCOPE_FIXTURES');
      await expect(
        client.$transaction(
          async (tx) => {
            context.db = tx;
            context.user = { id: ownerIds[0], role: 'RECRUITER' };
            await tx.user.createMany({
              data: ownerIds.map((id) => ({
                id,
                username: `recruit-scope-${id}`,
                email: `recruit-scope-${id}@example.invalid`,
                role: 'RECRUITER',
              })),
            });
            await tx.company.createMany({
              data: companyIds.map((id, index) => ({
                id,
                owner_id: ownerIds[index],
                name: `Synthetic company ${index}`,
                slug: `recruit-scope-${id}`,
              })),
            });
            await tx.job.createMany({
              data: jobIds.map((id, index) => ({
                id,
                company_id: companyIds[index],
                title: `Synthetic job ${index}`,
                description: 'Rollback-only recruitment fixture.',
                technologies: ['TypeScript'],
                requirements: [],
                benefits: [],
              })),
            });
            const apiContext = { params: Promise.resolve({}) };
            const companyResponse = await companies(
              new Request('https://stacklyst.test/api/companies?mine=true'),
              apiContext
            );
            expect(companyResponse.status).toBe(200);
            expect(
              (await companyResponse.json()).map((company: { id: string }) => company.id)
            ).toEqual([companyIds[0]]);
            const jobResponse = await jobs(
              new Request('https://stacklyst.test/api/jobs?mine=true&status=ALL'),
              apiContext
            );
            expect(jobResponse.status).toBe(200);
            expect((await jobResponse.json()).map((job: { id: string }) => job.id)).toEqual([
              jobIds[0],
            ]);
            const forgedResponse = await jobs(
              new Request(
                `https://stacklyst.test/api/jobs?mine=true&company_id=${companyIds[1]}&status=ALL`
              ),
              apiContext
            );
            expect(await forgedResponse.json()).toEqual([]);
            throw rollback;
          },
          { timeout: 25000 }
        )
      ).rejects.toBe(rollback);
      context.db = null;
      context.user = null;
      expect(await client.user.count({ where: { id: { in: ownerIds } } })).toBe(0);
      expect(await client.company.count({ where: { id: { in: companyIds } } })).toBe(0);
      expect(await client.job.count({ where: { id: { in: jobIds } } })).toBe(0);
    }, 40000);
  }
);

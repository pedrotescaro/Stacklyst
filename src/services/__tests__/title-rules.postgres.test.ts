// @vitest-environment node
import { randomUUID } from 'node:crypto';
import { afterAll, describe, expect, it, vi } from 'vitest';
import { prisma } from '@/lib/prisma';
import { profileActivityMetrics, hashtagPostMetrics } from '../profile-customization.service';

vi.mock('@/lib/prisma', async () => {
  if (process.env.STACKLYST_TITLE_RULES_POSTGRES !== '1') return { prisma: null };
  const dotenv = await import('dotenv');
  dotenv.config({ path: '.env.local', quiet: true });
  const connectionString =
    process.env.STACKLYST_TEST_DATABASE_URL || process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!connectionString)
    throw new Error('Configure a PostgreSQL connection for the rollback-only title checks.');
  const { PrismaClient } = await import('@prisma/client');
  const { PrismaPg } = await import('@prisma/adapter-pg');
  return {
    prisma: new PrismaClient({
      adapter: new PrismaPg({ connectionString, max: 2, connectionTimeoutMillis: 10000 }),
    }),
  };
});

afterAll(async () => {
  if (prisma) await prisma.$disconnect();
});

describe.skipIf(process.env.STACKLYST_TITLE_RULES_POSTGRES !== '1')(
  'title rules on real PostgreSQL with unconditional rollback',
  () => {
    it('uses the original comment date in Brasília, exact hashtags and persistent server quality rules', async () => {
      const owner = randomUUID(),
        other = randomUUID();
      const rollback = new Error('ROLLBACK_TITLE_RULE_FIXTURES');
      await expect(
        prisma.$transaction(
          async (tx) => {
            await tx.user.createMany({
              data: [owner, other].map((id) => ({
                id,
                username: `title-qa-${id}`,
                email: `title-qa-${id}@example.invalid`,
              })),
            });
            const foreign = await tx.post.create({
              data: {
                author_id: other,
                title: 'Another member discussion',
                body: 'A sufficiently detailed discussion authored by another community member.',
              },
            });
            const own = await tx.post.create({
              data: {
                author_id: owner,
                title: 'Original own publication',
                body: 'A sufficiently detailed original publication on the first day.',
                created_at: new Date('2026-11-01T03:00:00.000Z'),
              },
            });
            const original = 'Um comentário original no começo exato do mês.';
            const comments = [
              ['2026-11-01T02:59:59.999Z', 'Ainda é o último dia do mês em Brasília.'],
              ['2026-11-01T03:00:00.000Z', original],
              ['2026-11-02T02:59:59.999Z', 'Ainda é o primeiro dia do mês em Brasília.'],
              ['2026-11-02T03:00:00.000Z', 'Agora já é o segundo dia do mês em Brasília.'],
              ['2025-01-01T03:00:00.000Z', 'Um comentário histórico do primeiro dia de outro ano.'],
              ['2026-11-01T04:00:00.000Z', original.toUpperCase().replaceAll(' ', '  ')],
              ['2026-11-01T05:00:00.000Z', 'curto'],
            ];
            await tx.answer.createMany({
              data: comments.map(([date, body]) => ({
                author_id: owner,
                post_id: foreign.id,
                body,
                created_at: new Date(date),
              })),
            });
            await tx.answer.create({
              data: {
                author_id: owner,
                post_id: own.id,
                body: 'Uma resposta a mim mesmo não deve contar para o título.',
                created_at: new Date('2026-11-01T03:30:00.000Z'),
              },
            });
            const parent = await tx.answer.create({
              data: {
                author_id: other,
                post_id: own.id,
                body: 'Uma contribuição de outro membro na minha postagem.',
              },
            });
            await tx.answer.create({
              data: {
                author_id: owner,
                post_id: own.id,
                parent_id: parent.id,
                body: 'Uma resposta original ao outro membro no primeiro dia.',
                created_at: new Date('2026-11-01T03:40:00.000Z'),
              },
            });
            const posts = [
              {
                title: 'Publicação de estrela',
                body: 'Uma publicação original com detalhes suficientes sobre a comunidade. #Estrela',
              },
              {
                title: 'Hashtag apenas parecida',
                body: 'Uma publicação original com detalhes suficientes e uma hashtag diferente. #estrelaExtra',
              },
              {
                title: 'Pausa para o pastel',
                body: 'Uma publicação original com detalhes suficientes para compartilhar a pausa. #pastel',
              },
              {
                title: 'PAUSA PARA O PASTEL',
                body: 'UMA  PUBLICAÇÃO ORIGINAL COM DETALHES SUFICIENTES PARA COMPARTILHAR A PAUSA. #PASTEL',
              },
              { title: 'Curta', body: 'Pouco texto #pastel' },
            ];
            await tx.post.createMany({
              data: posts.map((item) => ({
                ...item,
                author_id: owner,
                created_at: new Date('2026-11-01T12:00:00.000Z'),
              })),
            });
            const metrics = await profileActivityMetrics(tx, owner);
            expect(metrics.firstDayComments).toBe(4);
            expect(metrics.comments).toBe(6);
            expect(metrics.peopleHelped).toBe(1);
            const tags = await hashtagPostMetrics(tx, owner, ['estrela', 'pastel']);
            expect(tags.get('estrela')).toBe(1);
            expect(tags.get('pastel')).toBe(1);
            throw rollback;
          },
          { timeout: 20000 }
        )
      ).rejects.toBe(rollback);
      expect(await prisma.user.count({ where: { id: { in: [owner, other] } } })).toBe(0);
    });
  }
);

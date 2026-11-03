import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url:
      process.env.DIRECT_URL ||
      process.env.DATABASE_URL ||
      'postgresql://placeholder:placeholder@localhost:5432/placeholder',
  },
  migrations: {
    seed: 'npx ts-node --project prisma/tsconfig.seed.json -r tsconfig-paths/register prisma/seed.ts',
  },
});

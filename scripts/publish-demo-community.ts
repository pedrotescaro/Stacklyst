import dotenv from 'dotenv';
import { randomBytes } from 'node:crypto';
import { createClient, type User } from '@supabase/supabase-js';
import assets from '../prisma/demo-profile-assets.json';
import { COMMUNITY_PROFILES } from '../prisma/demo-community/content';
import { planCommunity, publishCommunity } from '../prisma/demo-community/publish';

dotenv.config({ path: '.env.local', quiet: true });

async function main() {
  const { prisma } = await import('../src/lib/prisma');
  try {
    const plan = await planCommunity(prisma);
    const { users, ...counts } = plan;
    console.log(
      JSON.stringify(
        { mode: process.argv.includes('--apply') ? 'apply' : 'preview', ...counts },
        null,
        2
      )
    );
    if (!process.argv.includes('--apply')) return;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('Supabase admin credentials are required for provisioning.');
    const admin = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const userIds = Object.fromEntries(users.map((u) => [u.username, u.id]));
    const authUsers: User[] = [];
    if (plan.newProfiles) {
      for (let page = 1; ; page++) {
        const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 100 });
        if (error) throw error;
        authUsers.push(...data.users);
        if (data.users.length < 100) break;
      }
    }
    for (const profile of COMMUNITY_PROFILES) {
      if (userIds[profile.username]) continue;
      const asset = (assets as Record<string, { emails: string[] }>)[profile.username];
      const existing = authUsers.find((u) => u.email && asset.emails.includes(u.email));
      if (existing) {
        if (existing.user_metadata?.username !== profile.username)
          throw new Error(`Auth account is not owned by this demo: ${profile.username}`);
        userIds[profile.username] = existing.id;
        continue;
      }
      const { data, error } = await admin.auth.admin.createUser({
        email: asset.emails.at(-1)!,
        // Distinct, unshared credentials. This script never sends invitations or email.
        password: randomBytes(36).toString('base64url'),
        email_confirm: true,
        user_metadata: { username: profile.username, displayName: profile.displayName },
        app_metadata: { editorial_demo: true },
      });
      if (error || !data.user)
        throw new Error(
          `Could not provision ${profile.username}: ${error?.message ?? 'missing identity'}`
        );
      userIds[profile.username] = data.user.id;
    }
    const result = await publishCommunity(
      prisma,
      userIds,
      COMMUNITY_PROFILES.filter((p) => !users.some((u) => u.username === p.username)).map(
        (p) => p.username
      )
    );
    const verification = await planCommunity(prisma);
    if (verification.newProfiles || verification.existingManagedPosts !== result.posts)
      throw new Error('Post-publication verification did not match the collection.');
    console.log(JSON.stringify({ published: result, verified: true }));
  } finally {
    await prisma.$disconnect();
  }
}
main().catch((error: Error) => {
  console.error(error.message);
  process.exitCode = 1;
});

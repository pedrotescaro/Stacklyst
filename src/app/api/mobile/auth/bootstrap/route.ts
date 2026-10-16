import { NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { UnauthorizedError } from '@/lib/errors';
import { bootstrapMobileUser } from '@/lib/mobile/auth-bootstrap';
import { verifyBearerUser } from '@/lib/supabase/bearer';

/** Complete the application profile after a native Supabase sign-in, without web cookies. */
export const POST = apiHandler(
  async (request) => {
    const authorization = request.headers.get('authorization');
    if (!authorization) throw new UnauthorizedError();
    const authUser = await verifyBearerUser(authorization);
    const result = await bootstrapMobileUser(authUser);
    return NextResponse.json(
      { success: true, ...result },
      { status: result.created ? 201 : 200, headers: { 'Cache-Control': 'no-store' } }
    );
  },
  { resolveSession: false }
);

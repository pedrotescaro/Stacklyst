import { NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { requireAuth } from '@/lib/auth';
import { FollowService } from '@/services/follow.service';

export const POST = apiHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { id: targetUserId } = await params;

  const result = await FollowService.toggleFollow(user.id, targetUserId);

  return NextResponse.json(result);
});

// Recommendations express the desired relationship, rather than toggling stale state.
export const PUT = apiHandler(async (_req, { params }) => {
  const user = await requireAuth();
  const { id: targetUserId } = await params;
  return NextResponse.json(await FollowService.toggleFollow(user.id, targetUserId, true));
});

import { NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { requireAuth } from '@/lib/auth';
import { NotificationService } from '@/services/notification.service';

export const GET = apiHandler(async (req) => {
  const user = await requireAuth();

  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get('cursor') || undefined;
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const useCursor = searchParams.get('useCursor') === 'true' || !!cursor;

  const result = await NotificationService.getUserNotifications(user.id, cursor, limit, useCursor);

  // Return pagination shape or plain array depending on query string
  if (useCursor) {
    return NextResponse.json(result);
  } else {
    return NextResponse.json(result.items);
  }
});

export const POST = apiHandler(async (_req) => {
  const user = await requireAuth();

  await NotificationService.markAllAsRead(user.id);

  return NextResponse.json({ success: true });
});

export const DELETE = apiHandler(async () => {
  const user = await requireAuth();
  const { count } = await NotificationService.deleteAll(user.id);
  return NextResponse.json({ success: true, count });
});

import { NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { requireAuth } from '@/lib/auth';
import { NotificationService } from '@/services/notification.service';

export const DELETE = apiHandler(async (_request, { params }) => {
  const user = await requireAuth();
  const { id } = await params;
  // An absent or foreign notification is an idempotent no-op.
  const { count } = await NotificationService.deleteNotification(user.id, id);
  return NextResponse.json({ success: true, count });
});

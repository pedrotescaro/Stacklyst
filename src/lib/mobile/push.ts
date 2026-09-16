import { prisma } from '@/lib/prisma';

/** Called only for persisted activity; notification contents stay private on lock screens. */
export async function sendMobilePush(userId: string, notificationId: string) {
  if (process.env.MOBILE_PUSH_ENABLED !== 'true') return;
  const devices = await prisma.mobileDevice.findMany({
    where: { user_id: userId, enabled: true },
    take: 100,
  });
  if (!devices.length) return;
  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    signal: AbortSignal.timeout(8000),
    headers: {
      'Content-Type': 'application/json',
      ...(process.env.EXPO_ACCESS_TOKEN
        ? { Authorization: `Bearer ${process.env.EXPO_ACCESS_TOKEN}` }
        : {}),
    },
    body: JSON.stringify(
      devices.map((d) => ({
        to: d.token,
        title: 'Stacklyst',
        body: 'Você tem uma nova atividade.',
        data: { url: '/notifications', notificationId },
        sound: 'default',
      }))
    ),
  });
  if (!response.ok) throw new Error('Push service unavailable');
  const result = (await response.json()) as {
    data?: { status: string; details?: { error?: string } }[];
  };
  const invalid = devices.filter(
    (_, index) => result.data?.[index]?.details?.error === 'DeviceNotRegistered'
  );
  if (invalid.length)
    await prisma.mobileDevice.deleteMany({ where: { token: { in: invalid.map((d) => d.token) } } });
}

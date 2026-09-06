import { apiHandler } from '@/lib/api-handler';
import { requireAuth } from '@/lib/auth';
import { AppError } from '@/lib/errors';

export const POST = apiHandler(async () => {
  await requireAuth();
  // Synthetic chests projected real nodes onto 32 fabricated milestones.
  // Retire new claims without deleting or recalculating historical receipts.
  throw new AppError(
    'LEGACY_REWARD_RETIRED',
    'Os baús antigos foram substituídos por recompensas nas atividades. Seu XP já conquistado foi preservado.',
    410
  );
});

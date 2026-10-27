import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    maxWorkers: 4,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'json-summary', 'html'],
      reportOnFailure: true,
      include: [
        'src/lib/security-audit.ts',
        'src/lib/onboarding.ts',
        'src/lib/supabase/password-recovery.ts',
        'src/lib/event-status.ts',
        'src/lib/duels/{judge,resolution-policy,resolution}.ts',
        'src/lib/code-execution/server.ts',
        'src/lib/learning/assessment.ts',
        'src/lib/exercises/{evaluator,repository}.ts',
        'src/services/{admin,job,event,notification}.service.ts',
        'src/app/api/auth/{register,confirm-email,forgot-password,reset-password,callback}/route.ts',
        'src/app/api/{onboarding,messages}/route.ts',
        'src/app/api/messages/chats/route.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'server-only': path.resolve(__dirname, './src/test/server-only.ts'),
    },
  },
});

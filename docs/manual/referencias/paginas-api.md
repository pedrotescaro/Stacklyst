# Código: paginas-api

[Índice](README.md) · [Manual](../README.md)

## src/app/about/page.tsx

Fonte: [src/app/about/page.tsx](../../../src/app/about/page.tsx)

Entrada de página do App Router; carrega ou compõe a experiência desta rota.

Símbolos localizados: `AboutPage`, `metadata`.

Dependências locais declaradas: `@/components/community/CommunityPage`.

Integrações/imports externos: `next`.

Testes associados pelo nome: [src/app/certificates/page.test.tsx](../../../src/app/certificates/page.test.tsx), [src/app/feed/page.test.tsx](../../../src/app/feed/page.test.tsx), [src/app/notifications/page.test.tsx](../../../src/app/notifications/page.test.tsx), [src/app/post/[id]/page.test.tsx](../../../src/app/post/[id]/page.test.tsx), [src/app/settings/page.test.tsx](../../../src/app/settings/page.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/app/achievements/page.tsx

Fonte: [src/app/achievements/page.tsx](../../../src/app/achievements/page.tsx)

Entrada de página do App Router; carrega ou compõe a experiência desta rota.

Símbolos localizados: `AchievementsPage`, `dynamic`.

Dependências locais declaradas: `@/lib/auth`, `@/services/profile-customization.service`, `@/components/titles/TitlesShowcaseView`, `@/components/Sidebar`, `@/components/FeedRightSidebar`.

Integrações/imports externos: `next/navigation`.

Testes associados pelo nome: [src/app/certificates/page.test.tsx](../../../src/app/certificates/page.test.tsx), [src/app/feed/page.test.tsx](../../../src/app/feed/page.test.tsx), [src/app/notifications/page.test.tsx](../../../src/app/notifications/page.test.tsx), [src/app/post/[id]/page.test.tsx](../../../src/app/post/[id]/page.test.tsx), [src/app/settings/page.test.tsx](../../../src/app/settings/page.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/app/admin/AdminContent.tsx

Fonte: [src/app/admin/AdminContent.tsx](../../../src/app/admin/AdminContent.tsx)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `AdminContent`, `loadDashboard`, `loadUsers`, `selectTab`, `handleTabKey`, `performAction`, `reviewApplication`, `moderateEvaluator`, `searchUsers`.

Dependências locais declaradas: `@/components/PlatformPageShell`, `./admin.module.css`.

Integrações/imports externos: `react`, `next/link`, `lucide-react`.

Testes associados pelo nome: [src/app/admin/AdminContent.test.tsx](../../../src/app/admin/AdminContent.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/app/admin/admin.module.css

Fonte: [src/app/admin/admin.module.css](../../../src/app/admin/admin.module.css)

Regras de apresentação, estados visuais e adaptação responsiva; não é autoridade de dados.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

## src/app/admin/page.tsx

Fonte: [src/app/admin/page.tsx](../../../src/app/admin/page.tsx)

Entrada de página do App Router; carrega ou compõe a experiência desta rota.

Símbolos localizados: `AdminPage`, `metadata`.

Dependências locais declaradas: `@/lib/auth`, `./AdminContent`.

Integrações/imports externos: `next/navigation`.

Testes associados pelo nome: [src/app/certificates/page.test.tsx](../../../src/app/certificates/page.test.tsx), [src/app/feed/page.test.tsx](../../../src/app/feed/page.test.tsx), [src/app/notifications/page.test.tsx](../../../src/app/notifications/page.test.tsx), [src/app/post/[id]/page.test.tsx](../../../src/app/post/[id]/page.test.tsx), [src/app/settings/page.test.tsx](../../../src/app/settings/page.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/app/admin/profile-catalog/page.tsx

Fonte: [src/app/admin/profile-catalog/page.tsx](../../../src/app/admin/profile-catalog/page.tsx)

Entrada de página do App Router; carrega ou compõe a experiência desta rota.

Símbolos localizados: `ProfileCatalogPage`, `dynamic`.

Dependências locais declaradas: `@/lib/auth`, `@/components/profile-customization/ProfileCatalogEditor`.

Integrações/imports externos: `next/navigation`.

Testes associados pelo nome: [src/app/certificates/page.test.tsx](../../../src/app/certificates/page.test.tsx), [src/app/feed/page.test.tsx](../../../src/app/feed/page.test.tsx), [src/app/notifications/page.test.tsx](../../../src/app/notifications/page.test.tsx), [src/app/post/[id]/page.test.tsx](../../../src/app/post/[id]/page.test.tsx), [src/app/settings/page.test.tsx](../../../src/app/settings/page.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/app/api/admin/duels/maintain/route.ts

Fonte: [src/app/api/admin/duels/maintain/route.ts](../../../src/app/api/admin/duels/maintain/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `GET`, `dynamic`.

Dependências locais declaradas: `@/lib/duels/lifecycle`, `@/services/evaluator.service`.

Integrações/imports externos: `next/server`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/admin/evaluators/route.ts

Fonte: [src/app/api/admin/evaluators/route.ts](../../../src/app/api/admin/evaluators/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `GET`, `POST`, `PATCH`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/auth`, `@/services/evaluator.service`.

Integrações/imports externos: `next/server`, `zod`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/admin/metrics/route.ts

Fonte: [src/app/api/admin/metrics/route.ts](../../../src/app/api/admin/metrics/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `GET`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/auth`, `@/services/admin.service`.

Integrações/imports externos: `next/server`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/admin/profile-catalog/route.ts

Fonte: [src/app/api/admin/profile-catalog/route.ts](../../../src/app/api/admin/profile-catalog/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `GET`, `PUT`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/auth`, `@/lib/prisma`, `@/services/profile-customization.service`.

Integrações/imports externos: `zod`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/admin/quiz/generate-daily/route.ts

Fonte: [src/app/api/admin/quiz/generate-daily/route.ts](../../../src/app/api/admin/quiz/generate-daily/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `POST`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/errors`, `@/services/quiz.service`.

Integrações/imports externos: `next/server`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/admin/reports/route.ts

Fonte: [src/app/api/admin/reports/route.ts](../../../src/app/api/admin/reports/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `GET`, `DELETE`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/auth`, `@/services/admin.service`.

Integrações/imports externos: `next/server`, `zod`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/admin/users/route.ts

Fonte: [src/app/api/admin/users/route.ts](../../../src/app/api/admin/users/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `GET`, `PATCH`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/auth`, `@/services/admin.service`.

Integrações/imports externos: `next/server`, `zod`, `@prisma/client`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/answers/[id]/accept/route.ts

Fonte: [src/app/api/answers/[id]/accept/route.ts](../../../src/app/api/answers/[id]/accept/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `POST`.

Dependências locais declaradas: `@/lib/prisma`, `@/services/block.service`, `@/lib/errors`, `@/lib/auth`, `@/lib/xp`, `@/lib/learning/transaction`.

Integrações/imports externos: `next/server`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/answers/[id]/vote/route.ts

Fonte: [src/app/api/answers/[id]/vote/route.ts](../../../src/app/api/answers/[id]/vote/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `POST`.

Dependências locais declaradas: `@/lib/prisma`, `@/services/block.service`, `@/lib/errors`, `@/lib/auth`, `@/services/profile-customization.service`, `@/services/post-access.service`.

Integrações/imports externos: `next/server`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/auth/accounts/route.ts

Fonte: [src/app/api/auth/accounts/route.ts](../../../src/app/api/auth/accounts/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `sameOrigin`, `json`, `currentAccount`, `GET`, `POST`, `DELETE`, `dynamic`.

Dependências locais declaradas: `@/lib/supabase/server`, `@/lib/supabase/env`, `@/lib/jwt`, `@/lib/supabase/account-vault`.

Integrações/imports externos: `next/headers`, `next/server`, `@supabase/supabase-js`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/auth/callback/route.ts

Fonte: [src/app/api/auth/callback/route.ts](../../../src/app/api/auth/callback/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `mobileCallback`, `authRedirect`, `GET`.

Dependências locais declaradas: `@/lib/prisma`, `@/lib/supabase/server`, `@/lib/config`, `@/lib/jwt`, `@/lib/logger`, `@/lib/supabase/oauth`, `@/lib/supabase/password-recovery`.

Integrações/imports externos: `next/server`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/auth/confirm-email/route.ts

Fonte: [src/app/api/auth/confirm-email/route.ts](../../../src/app/api/auth/confirm-email/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `POST`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/supabase/server`, `@/lib/logger`, `@/lib/ratelimit`.

Integrações/imports externos: `next/server`, `zod`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/auth/forgot-password/route.ts

Fonte: [src/app/api/auth/forgot-password/route.ts](../../../src/app/api/auth/forgot-password/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `POST`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/ratelimit`, `@/lib/supabase/server`, `@/lib/logger`.

Integrações/imports externos: `next/server`, `zod`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/auth/logout/route.ts

Fonte: [src/app/api/auth/logout/route.ts](../../../src/app/api/auth/logout/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `POST`.

Dependências locais declaradas: `@/lib/supabase/server`, `@/lib/jwt`, `@/lib/supabase/account-vault`.

Integrações/imports externos: `next/server`, `next/headers`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/auth/register/route.ts

Fonte: [src/app/api/auth/register/route.ts](../../../src/app/api/auth/register/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `POST`.

Dependências locais declaradas: `@/lib/prisma`, `@/lib/supabase/server`, `@/lib/validators`, `@/lib/ratelimit`, `@/lib/api-handler`, `@/lib/config`, `@/lib/logger`.

Integrações/imports externos: `next/server`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/auth/reset-password/route.ts

Fonte: [src/app/api/auth/reset-password/route.ts](../../../src/app/api/auth/reset-password/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `recoverySession`, `GET`, `POST`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/supabase/server`, `@/lib/supabase/password-recovery`, `@/lib/errors`, `@/lib/ratelimit`.

Integrações/imports externos: `next/headers`, `next/server`, `zod`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/avatar/route.ts

Fonte: [src/app/api/avatar/route.ts](../../../src/app/api/avatar/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `PUT`.

Dependências locais declaradas: `@/lib/auth`, `@/lib/avatar`, `@/lib/prisma`, `@/lib/profile-version`.

Integrações/imports externos: `next/server`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/certificates/[id]/pdf/route.ts

Fonte: [src/app/api/certificates/[id]/pdf/route.ts](../../../src/app/api/certificates/[id]/pdf/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `GET`, `runtime`, `dynamic`.

Dependências locais declaradas: `@/lib/credentials/repository`, `@/lib/credentials/integrity`, `@/lib/credentials/pdf`, `@/lib/credentials/urls`.

Integrações/imports externos: `next/server`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/certificates/[id]/route.ts

Fonte: [src/app/api/certificates/[id]/route.ts](../../../src/app/api/certificates/[id]/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `GET`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/errors`, `@/lib/credentials/repository`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/certificates/route.ts

Fonte: [src/app/api/certificates/route.ts](../../../src/app/api/certificates/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `GET`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/auth`, `@/lib/credentials/repository`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/companies/route.ts

Fonte: [src/app/api/companies/route.ts](../../../src/app/api/companies/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `GET`, `POST`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/auth`, `@/services/job.service`, `@/lib/prisma`.

Integrações/imports externos: `next/server`, `zod`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/cron/security-audit/route.ts

Fonte: [src/app/api/cron/security-audit/route.ts](../../../src/app/api/cron/security-audit/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `runtime`, `POST`.

Dependências locais declaradas: `@/lib/security-audit`, `@/lib/api-handler`.

Integrações/imports externos: `node:crypto`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/duels/[id]/route.ts

Fonte: [src/app/api/duels/[id]/route.ts](../../../src/app/api/duels/[id]/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `GET`, `PATCH`, `DELETE`.

Dependências locais declaradas: `@/lib/auth`, `@/lib/prisma`, `@/lib/duels/resolution`, `@/lib/duels/constants`, `@/lib/duels/participation-policy`.

Integrações/imports externos: `next/server`, `zod`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/duels/[id]/run/route.ts

Fonte: [src/app/api/duels/[id]/run/route.ts](../../../src/app/api/duels/[id]/run/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `POST`.

Dependências locais declaradas: `@/lib/auth`, `@/lib/config`, `@/lib/prisma`, `@/lib/duels/judge`, `@/lib/duels/problems`, `@/lib/ratelimit`, `@/lib/duels/resolution`.

Integrações/imports externos: `next/server`, `zod`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/duels/[id]/solution/route.ts

Fonte: [src/app/api/duels/[id]/solution/route.ts](../../../src/app/api/duels/[id]/solution/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `POST`.

Dependências locais declaradas: `@/lib/prisma`, `@/lib/auth`, `@/lib/config`, `@/lib/ratelimit`, `@/lib/duels/judge`, `@/lib/duels/resolution`, `@/lib/duels/problems`.

Integrações/imports externos: `next/server`, `@prisma/client`, `zod`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/duels/[id]/vote/route.ts

Fonte: [src/app/api/duels/[id]/vote/route.ts](../../../src/app/api/duels/[id]/vote/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `POST`.

Dependências locais declaradas: `@/lib/prisma`, `@/lib/auth`, `@/lib/validators`.

Integrações/imports externos: `next/server`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/duels/generate/route.ts

Fonte: [src/app/api/duels/generate/route.ts](../../../src/app/api/duels/generate/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `POST`.

Dependências locais declaradas: `@/lib/auth`, `@/lib/logger`, `@/lib/duel-problems`, `@/lib/duel-challenge-generator`.

Integrações/imports externos: `next/server`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/duels/pending-requests/route.ts

Fonte: [src/app/api/duels/pending-requests/route.ts](../../../src/app/api/duels/pending-requests/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `GET`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/auth`, `@/lib/prisma`, `@/lib/duels/invitations`.

Integrações/imports externos: `next/server`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/duels/request/route.ts

Fonte: [src/app/api/duels/request/route.ts](../../../src/app/api/duels/request/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `POST`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/auth`, `@/services/duel.service`.

Integrações/imports externos: `next/server`, `zod`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/duels/respond/route.ts

Fonte: [src/app/api/duels/respond/route.ts](../../../src/app/api/duels/respond/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `POST`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/auth`, `@/services/duel.service`.

Integrações/imports externos: `next/server`, `zod`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/duels/route.ts

Fonte: [src/app/api/duels/route.ts](../../../src/app/api/duels/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `GET`, `POST`, `matchOrCreateDuel`, `claimPendingDuel`.

Dependências locais declaradas: `@/lib/prisma`, `@/lib/auth`, `@/lib/validators`, `@/lib/duel-problems`, `@/lib/duels/constants`, `@/lib/duels/listing`, `@/lib/duels/judge`, `@/lib/duels/problems`, `@/lib/duels/participation-policy`.

Integrações/imports externos: `next/server`, `zod`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/evaluations/route.ts

Fonte: [src/app/api/evaluations/route.ts](../../../src/app/api/evaluations/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `GET`, `POST`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/auth`, `@/services/evaluator.service`, `@/lib/prisma`, `@/lib/evaluators/policy`, `@/lib/errors`, `@/lib/duels/resolution`.

Integrações/imports externos: `next/server`, `zod`, `@prisma/client`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/evaluators/apply/route.ts

Fonte: [src/app/api/evaluators/apply/route.ts](../../../src/app/api/evaluators/apply/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `POST`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/auth`, `@/services/evaluator.service`, `@/lib/evaluators/policy`.

Integrações/imports externos: `next/server`, `zod`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/evaluators/eligibility/route.ts

Fonte: [src/app/api/evaluators/eligibility/route.ts](../../../src/app/api/evaluators/eligibility/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `GET`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/auth`, `@/services/evaluator.service`.

Integrações/imports externos: `next/server`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/events/[id]/challenges/route.ts

Fonte: [src/app/api/events/[id]/challenges/route.ts](../../../src/app/api/events/[id]/challenges/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `GET`, `PUT`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/auth`, `@/lib/event-challenges`, `@/services/event-challenge.service`.

Integrações/imports externos: `next/server`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/events/[id]/participate/route.ts

Fonte: [src/app/api/events/[id]/participate/route.ts](../../../src/app/api/events/[id]/participate/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `POST`, `DELETE`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/auth`, `@/services/event.service`.

Integrações/imports externos: `next/server`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/events/[id]/route.ts

Fonte: [src/app/api/events/[id]/route.ts](../../../src/app/api/events/[id]/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `GET`, `DELETE`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/auth`, `@/services/event.service`.

Integrações/imports externos: `next/server`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/events/route.ts

Fonte: [src/app/api/events/route.ts](../../../src/app/api/events/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `GET`, `POST`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/auth`, `@/services/event.service`, `@/lib/mobile/company-access`.

Integrações/imports externos: `next/server`, `zod`, `@prisma/client`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/exercises/[exerciseId]/events/route.ts

Fonte: [src/app/api/exercises/[exerciseId]/events/route.ts](../../../src/app/api/exercises/[exerciseId]/events/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `POST`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/errors`, `@/lib/exercises/repository`.

Integrações/imports externos: `next/server`, `zod`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/exercises/[exerciseId]/run/route.ts

Fonte: [src/app/api/exercises/[exerciseId]/run/route.ts](../../../src/app/api/exercises/[exerciseId]/run/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `POST`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/config`, `@/lib/errors`, `@/lib/exercises/evaluator`, `@/lib/exercises/repository`, `@/lib/ratelimit`.

Integrações/imports externos: `next/server`, `zod`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/exercises/[exerciseId]/submit/route.ts

Fonte: [src/app/api/exercises/[exerciseId]/submit/route.ts](../../../src/app/api/exercises/[exerciseId]/submit/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `POST`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/config`, `@/lib/errors`, `@/lib/exercises/evaluator`, `@/lib/exercises/repository`, `@/lib/ratelimit`, `@/services/profile-customization.service`.

Integrações/imports externos: `next/server`, `zod`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/guilds/[id]/members/route.ts

Fonte: [src/app/api/guilds/[id]/members/route.ts](../../../src/app/api/guilds/[id]/members/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `POST`, `DELETE`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/auth`, `@/lib/prisma`, `@/lib/errors`.

Integrações/imports externos: `next/server`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/guilds/[id]/route.ts

Fonte: [src/app/api/guilds/[id]/route.ts](../../../src/app/api/guilds/[id]/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `GET`, `PATCH`, `DELETE`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/auth`, `@/lib/prisma`, `@/lib/errors`.

Integrações/imports externos: `next/server`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/guilds/by-slug/[slug]/route.ts

Fonte: [src/app/api/guilds/by-slug/[slug]/route.ts](../../../src/app/api/guilds/by-slug/[slug]/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `GET`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/auth`, `@/lib/prisma`, `@/lib/errors`.

Integrações/imports externos: `next/server`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/guilds/route.ts

Fonte: [src/app/api/guilds/route.ts](../../../src/app/api/guilds/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `GET`, `POST`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/auth`, `@/lib/prisma`, `@/lib/errors`.

Integrações/imports externos: `next/server`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/health/route.ts

Fonte: [src/app/api/health/route.ts](../../../src/app/api/health/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `GET`, `HEAD`.

Integrações/imports externos: `next/server`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/jobs/[id]/applications/route.ts

Fonte: [src/app/api/jobs/[id]/applications/route.ts](../../../src/app/api/jobs/[id]/applications/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `GET`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/auth`, `@/services/job.service`.

Integrações/imports externos: `next/server`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/jobs/[id]/apply/route.ts

Fonte: [src/app/api/jobs/[id]/apply/route.ts](../../../src/app/api/jobs/[id]/apply/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `POST`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/auth`, `@/services/job.service`.

Integrações/imports externos: `next/server`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/jobs/[id]/route.ts

Fonte: [src/app/api/jobs/[id]/route.ts](../../../src/app/api/jobs/[id]/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `GET`, `PATCH`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/auth`, `@/services/job.service`, `@/lib/prisma`, `@/lib/mobile/company-access`.

Integrações/imports externos: `next/server`, `zod`, `@prisma/client`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/jobs/route.ts

Fonte: [src/app/api/jobs/route.ts](../../../src/app/api/jobs/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `GET`, `POST`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/auth`, `@/services/job.service`, `@/lib/mobile/company-access`.

Integrações/imports externos: `next/server`, `zod`, `@prisma/client`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/leaderboard/route.ts

Fonte: [src/app/api/leaderboard/route.ts](../../../src/app/api/leaderboard/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `GET`.

Dependências locais declaradas: `@/lib/learning/period-leaderboard`, `@/lib/learning/rewards`, `@/lib/learning/leaderboard`, `@/lib/learning/language-xp`, `@/lib/streak`, `@/lib/leaderboard-identity`.

Integrações/imports externos: `next/server`, `@prisma/client`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/lessons/[lessonId]/attempt/route.ts

Fonte: [src/app/api/lessons/[lessonId]/attempt/route.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `POST`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/errors`, `@/lib/ratelimit`, `@/lib/lessons/registry`, `@/lib/learning/assessment`, `@/lib/learning/lesson-progress`, `@/services/profile-customization.service`.

Integrações/imports externos: `next/server`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/messages/[id]/react/route.ts

Fonte: [src/app/api/messages/[id]/react/route.ts](../../../src/app/api/messages/[id]/react/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `ensureMessageReactionTable`, `POST`.

Dependências locais declaradas: `@/lib/prisma`, `@/services/block.service`, `@/lib/api-handler`, `@/lib/auth`.

Integrações/imports externos: `next/server`, `crypto`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/messages/[id]/route.ts

Fonte: [src/app/api/messages/[id]/route.ts](../../../src/app/api/messages/[id]/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `PATCH`, `DELETE`.

Dependências locais declaradas: `@/lib/prisma`, `@/services/block.service`, `@/lib/errors`, `@/lib/auth`.

Integrações/imports externos: `next/server`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/messages/chats/route.ts

Fonte: [src/app/api/messages/chats/route.ts](../../../src/app/api/messages/chats/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `GET`.

Dependências locais declaradas: `@/lib/prisma`, `@/services/block.service`, `@/lib/auth`, `@/lib/connection-errors`.

Integrações/imports externos: `next/server`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/messages/route.ts

Fonte: [src/app/api/messages/route.ts](../../../src/app/api/messages/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `ensureMessageReactionTable`, `POST`, `GET`.

Dependências locais declaradas: `@/lib/prisma`, `@/services/block.service`, `@/lib/api-handler`, `@/lib/auth`, `@/services/notification.service`, `@/lib/ratelimit`, `@/lib/pagination`.

Integrações/imports externos: `next/server`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/mobile/applications/route.ts

Fonte: [src/app/api/mobile/applications/route.ts](../../../src/app/api/mobile/applications/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `GET`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/auth`, `@/lib/prisma`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/mobile/auth/bootstrap/route.ts

Fonte: [src/app/api/mobile/auth/bootstrap/route.ts](../../../src/app/api/mobile/auth/bootstrap/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `POST`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/errors`, `@/lib/mobile/auth-bootstrap`, `@/lib/supabase/bearer`.

Integrações/imports externos: `next/server`.

Comentários de contrato presentes na fonte:

> Complete the application profile after a native Supabase sign-in, without web cookies.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/mobile/bookmarks/route.ts

Fonte: [src/app/api/mobile/bookmarks/route.ts](../../../src/app/api/mobile/bookmarks/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `GET`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/auth`, `@/lib/prisma`, `@/services/post-access.service`, `@/lib/post-poll`, `@/lib/pagination`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/mobile/companies/[id]/route.ts

Fonte: [src/app/api/mobile/companies/[id]/route.ts](../../../src/app/api/mobile/companies/[id]/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `PATCH`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/auth`, `@/lib/mobile/company-access`, `@/lib/prisma`.

Integrações/imports externos: `zod`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/mobile/devices/route.ts

Fonte: [src/app/api/mobile/devices/route.ts](../../../src/app/api/mobile/devices/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `PUT`, `DELETE`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/auth`, `@/lib/prisma`.

Integrações/imports externos: `zod`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/mobile/exercises/[id]/route.ts

Fonte: [src/app/api/mobile/exercises/[id]/route.ts](../../../src/app/api/mobile/exercises/[id]/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `GET`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/auth`, `@/lib/exercises/repository`, `@/lib/errors`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/mobile/jobs/[id]/route.ts

Fonte: [src/app/api/mobile/jobs/[id]/route.ts](../../../src/app/api/mobile/jobs/[id]/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `PATCH`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/auth`, `@/lib/mobile/company-access`, `@/lib/prisma`.

Integrações/imports externos: `zod`, `@prisma/client`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/mobile/learning/route.ts

Fonte: [src/app/api/mobile/learning/route.ts](../../../src/app/api/mobile/learning/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `GET`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/auth`, `@/lib/prisma`, `@/lib/learning/repository`, `@/lib/learning/catalog`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/mobile/lessons/[id]/route.ts

Fonte: [src/app/api/mobile/lessons/[id]/route.ts](../../../src/app/api/mobile/lessons/[id]/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `GET`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/auth`, `@/lib/learning/catalog`, `@/lib/mobile/lesson`, `@/lib/learning/lesson-progress`, `@/lib/prisma`, `@/lib/errors`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/mobile/messages/route.ts

Fonte: [src/app/api/mobile/messages/route.ts](../../../src/app/api/mobile/messages/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `POST`, `GET`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/auth`, `@/lib/prisma`, `@/services/block.service`, `@/lib/errors`, `@/lib/ratelimit`, `@/services/notification.service`, `@/lib/pagination`.

Integrações/imports externos: `zod`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/mobile/state/[key]/route.ts

Fonte: [src/app/api/mobile/state/[key]/route.ts](../../../src/app/api/mobile/state/[key]/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `GET`, `PUT`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/auth`, `@/lib/prisma`, `@/lib/errors`.

Integrações/imports externos: `zod`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/mundinho/route.ts

Fonte: [src/app/api/mundinho/route.ts](../../../src/app/api/mundinho/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `maxDuration`, `GET`, `POST`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/errors`, `@/lib/mundinho/repository`, `@/lib/mundinho/arena`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/notifications/[id]/route.ts

Fonte: [src/app/api/notifications/[id]/route.ts](../../../src/app/api/notifications/[id]/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `DELETE`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/auth`, `@/services/notification.service`.

Integrações/imports externos: `next/server`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/notifications/route.ts

Fonte: [src/app/api/notifications/route.ts](../../../src/app/api/notifications/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `GET`, `POST`, `DELETE`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/auth`, `@/services/notification.service`.

Integrações/imports externos: `next/server`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/notifications/unread-count/handler.ts

Fonte: [src/app/api/notifications/unread-count/handler.ts](../../../src/app/api/notifications/unread-count/handler.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `handleUnreadCountRequest`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/connection-errors`, `@/lib/logger`, `@/services/notification.service`.

Integrações/imports externos: `next/server`.

Testes associados pelo nome: [src/app/api/notifications/unread-count/**tests**/handler.test.ts](../../../src/app/api/notifications/unread-count/__tests__/handler.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/notifications/unread-count/route.ts

Fonte: [src/app/api/notifications/unread-count/route.ts](../../../src/app/api/notifications/unread-count/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `GET`.

Dependências locais declaradas: `@/lib/api-handler`, `./handler`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/onboarding/route.ts

Fonte: [src/app/api/onboarding/route.ts](../../../src/app/api/onboarding/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `GET`, `PUT`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/auth`, `@/lib/prisma`, `@/lib/onboarding`, `@/app/trails/trailCoursePreferences`.

Integrações/imports externos: `next/server`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/posts/[id]/answer/route.ts

Fonte: [src/app/api/posts/[id]/answer/route.ts](../../../src/app/api/posts/[id]/answer/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `POST`.

Dependências locais declaradas: `@/lib/prisma`, `@/services/block.service`, `@/lib/api-handler`, `@/lib/auth`, `@/lib/validators`, `@/services/xp.service`, `@/services/notification.service`, `@/lib/errors`, `@/services/profile-customization.service`, `@/services/post-access.service`.

Integrações/imports externos: `next/server`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/posts/[id]/bookmark/route.ts

Fonte: [src/app/api/posts/[id]/bookmark/route.ts](../../../src/app/api/posts/[id]/bookmark/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `GET`, `POST`.

Dependências locais declaradas: `@/lib/prisma`, `@/services/block.service`, `@/lib/api-handler`, `@/lib/auth`, `@/services/post-access.service`.

Integrações/imports externos: `next/server`, `zod`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/posts/[id]/poll/route.ts

Fonte: [src/app/api/posts/[id]/poll/route.ts](../../../src/app/api/posts/[id]/poll/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `POST`.

Dependências locais declaradas: `@/lib/prisma`, `@/lib/api-handler`, `@/lib/auth`, `@/services/post-access.service`, `@/lib/post-poll`, `@/lib/errors`.

Integrações/imports externos: `next/server`, `zod`, `@prisma/client`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/posts/[id]/react/route.ts

Fonte: [src/app/api/posts/[id]/react/route.ts](../../../src/app/api/posts/[id]/react/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `POST`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/auth`, `@/services/reaction.service`.

Integrações/imports externos: `next/server`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/posts/[id]/report/route.ts

Fonte: [src/app/api/posts/[id]/report/route.ts](../../../src/app/api/posts/[id]/report/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `POST`.

Dependências locais declaradas: `@/lib/prisma`, `@/lib/auth`, `@/services/post-access.service`.

Integrações/imports externos: `next/server`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/posts/[id]/route.ts

Fonte: [src/app/api/posts/[id]/route.ts](../../../src/app/api/posts/[id]/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `GET`, `PATCH`, `DELETE`.

Dependências locais declaradas: `@/lib/prisma`, `@/services/block.service`, `@/lib/auth`, `@/lib/editor/extract-metadata`, `@/lib/quiz-public`, `@/lib/answer-threads`, `@/services/post-access.service`, `@/lib/post-poll`.

Integrações/imports externos: `next/server`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/posts/[id]/vote/route.ts

Fonte: [src/app/api/posts/[id]/vote/route.ts](../../../src/app/api/posts/[id]/vote/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `POST`.

Dependências locais declaradas: `@/lib/prisma`, `@/services/block.service`, `@/lib/api-handler`, `@/lib/auth`, `@/services/notification.service`, `@/lib/errors`, `@/services/profile-customization.service`, `@/services/post-access.service`.

Integrações/imports externos: `next/server`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/posts/media/[id]/route.ts

Fonte: [src/app/api/posts/media/[id]/route.ts](../../../src/app/api/posts/media/[id]/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `GET`, `runtime`.

Dependências locais declaradas: `@/lib/auth`, `@/lib/prisma`, `@/lib/supabase/admin`, `@/services/post-access.service`.

Integrações/imports externos: `next/server`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/posts/media/route.ts

Fonte: [src/app/api/posts/media/route.ts](../../../src/app/api/posts/media/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `runtime`, `POST`.

Dependências locais declaradas: `@/lib/auth`, `@/lib/api-handler`, `@/lib/ratelimit`, `@/lib/supabase/admin`, `@/lib/prisma`, `@/lib/errors`.

Integrações/imports externos: `next/server`, `sharp`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/posts/route.ts

Fonte: [src/app/api/posts/route.ts](../../../src/app/api/posts/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `GET`, `POST`.

Dependências locais declaradas: `@/lib/api-handler`, `@/services/post.service`, `@/lib/validators`, `@/lib/ratelimit`, `@/lib/auth`, `@/lib/onboarding`.

Integrações/imports externos: `next/server`, `zod`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/presence/route.ts

Fonte: [src/app/api/presence/route.ts](../../../src/app/api/presence/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `dynamic`, `GET`, `POST`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/auth-session`, `@/lib/errors`, `@/lib/platform-presence`, `@/lib/ratelimit`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/profile/[username]/activity/route.ts

Fonte: [src/app/api/profile/[username]/activity/route.ts](../../../src/app/api/profile/[username]/activity/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `GET`.

Dependências locais declaradas: `@/lib/api-handler`, `@/services/profile-activity.service`.

Integrações/imports externos: `zod`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/profile/[username]/media/route.ts

Fonte: [src/app/api/profile/[username]/media/route.ts](../../../src/app/api/profile/[username]/media/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `GET`.

Dependências locais declaradas: `@/lib/prisma`, `@/services/block.service`, `@/lib/api-handler`, `@/lib/errors`, `@/services/post-access.service`.

Integrações/imports externos: `zod`, `@prisma/client`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/profile/[username]/replies/route.ts

Fonte: [src/app/api/profile/[username]/replies/route.ts](../../../src/app/api/profile/[username]/replies/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `GET`.

Dependências locais declaradas: `@/lib/prisma`, `@/services/block.service`, `@/lib/api-handler`, `@/services/post-access.service`, `@/lib/post-poll`.

Integrações/imports externos: `next/server`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/profile/[username]/route.ts

Fonte: [src/app/api/profile/[username]/route.ts](../../../src/app/api/profile/[username]/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `GET`.

Dependências locais declaradas: `@/lib/prisma`, `@/services/block.service`, `@/services/profile-activity.service`, `@/lib/auth-session`, `@/lib/learning/language-xp`, `@/lib/streak`, `@/services/profile-customization.service`, `@/services/post-access.service`, `@/lib/post-poll`.

Integrações/imports externos: `next/server`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/profile/achievements/route.ts

Fonte: [src/app/api/profile/achievements/route.ts](../../../src/app/api/profile/achievements/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `GET`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/auth`, `@/services/profile-customization.service`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/profile/customization/route.ts

Fonte: [src/app/api/profile/customization/route.ts](../../../src/app/api/profile/customization/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `GET`, `PUT`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/auth`, `@/lib/ratelimit`, `@/services/profile-customization.service`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/profile/music/resolve/route.ts

Fonte: [src/app/api/profile/music/resolve/route.ts](../../../src/app/api/profile/music/resolve/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `POST`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/auth`, `@/lib/ratelimit`, `@/lib/profile-music`.

Integrações/imports externos: `zod`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/profile/music/search/route.ts

Fonte: [src/app/api/profile/music/search/route.ts](../../../src/app/api/profile/music/search/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `GET`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/auth`, `@/lib/ratelimit`, `@/lib/profile-music`.

Integrações/imports externos: `zod`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/profile/tags/route.ts

Fonte: [src/app/api/profile/tags/route.ts](../../../src/app/api/profile/tags/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `GET`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/prisma`.

Integrações/imports externos: `zod`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/profile/update/route.ts

Fonte: [src/app/api/profile/update/route.ts](../../../src/app/api/profile/update/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `POST`.

Dependências locais declaradas: `@/lib/prisma`, `@/lib/auth`, `@/lib/profile-upload`, `@/lib/profile-version`.

Integrações/imports externos: `next/server`, `@prisma/client`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/quiz/[id]/attempt/route.ts

Fonte: [src/app/api/quiz/[id]/attempt/route.ts](../../../src/app/api/quiz/[id]/attempt/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `POST`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/auth`, `@/lib/validators`, `@/services/quiz.service`, `@/lib/prisma`, `@/services/profile-customization.service`.

Integrações/imports externos: `next/server`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/quiz/[id]/route.ts

Fonte: [src/app/api/quiz/[id]/route.ts](../../../src/app/api/quiz/[id]/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `GET`.

Dependências locais declaradas: `@/lib/prisma`, `@/services/post-access.service`, `@/lib/auth-session`.

Integrações/imports externos: `next/server`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/quiz/daily/route.ts

Fonte: [src/app/api/quiz/daily/route.ts](../../../src/app/api/quiz/daily/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `GET`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/auth`, `@/lib/prisma`, `@/services/block.service`, `@/lib/cache`, `@/lib/config`, `@/services/daily-quiz.service`, `@/services/post-access.service`.

Integrações/imports externos: `next/server`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/quiz/reset-level/route.ts

Fonte: [src/app/api/quiz/reset-level/route.ts](../../../src/app/api/quiz/reset-level/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `POST`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/auth`.

Integrações/imports externos: `next/server`, `zod`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/quiz/weekly-activity/route.ts

Fonte: [src/app/api/quiz/weekly-activity/route.ts](../../../src/app/api/quiz/weekly-activity/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `GET`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/auth`, `@/lib/prisma`.

Integrações/imports externos: `next/server`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/run/route.ts

Fonte: [src/app/api/run/route.ts](../../../src/app/api/run/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `POST`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/code-execution/server`, `@/lib/config`, `@/lib/ratelimit`, `@/lib/auth`.

Integrações/imports externos: `next/server`, `zod`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/search/route.ts

Fonte: [src/app/api/search/route.ts](../../../src/app/api/search/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `GET`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/auth`, `@/services/search.service`.

Integrações/imports externos: `next/server`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/trails/checkpoint/route.ts

Fonte: [src/app/api/trails/checkpoint/route.ts](../../../src/app/api/trails/checkpoint/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `POST`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/auth`, `@/lib/prisma`, `@/lib/errors`, `@/lib/trailsData`, `@/lib/learning/lesson-progress`, `@/lib/lessons/types`.

Integrações/imports externos: `@prisma/client`, `next/server`, `zod`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/trails/chest/route.ts

Fonte: [src/app/api/trails/chest/route.ts](../../../src/app/api/trails/chest/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `POST`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/auth`, `@/lib/errors`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/trails/course-preferences/route.ts

Fonte: [src/app/api/trails/course-preferences/route.ts](../../../src/app/api/trails/course-preferences/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `PUT`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/errors`, `@/app/trails/trailCoursePreferences`.

Integrações/imports externos: `next/server`, `zod`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/trails/jump/route.ts

Fonte: [src/app/api/trails/jump/route.ts](../../../src/app/api/trails/jump/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `POST`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/auth`, `@/lib/errors`, `@/lib/prisma`, `@/lib/trails/jump`.

Integrações/imports externos: `next/server`, `zod`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/upload/route.ts

Fonte: [src/app/api/upload/route.ts](../../../src/app/api/upload/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `POST`.

Dependências locais declaradas: `@/lib/auth`, `@/lib/supabase/server`.

Integrações/imports externos: `next/server`, `sharp`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/users/[id]/block/route.ts

Fonte: [src/app/api/users/[id]/block/route.ts](../../../src/app/api/users/[id]/block/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `POST`, `DELETE`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/auth`, `@/lib/ratelimit`, `@/services/block.service`.

Integrações/imports externos: `zod`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/users/[id]/follow/route.ts

Fonte: [src/app/api/users/[id]/follow/route.ts](../../../src/app/api/users/[id]/follow/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `POST`, `PUT`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/auth`, `@/services/follow.service`.

Integrações/imports externos: `next/server`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/users/[id]/followers/route.ts

Fonte: [src/app/api/users/[id]/followers/route.ts](../../../src/app/api/users/[id]/followers/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `GET`.

Dependências locais declaradas: `@/lib/prisma`, `@/services/block.service`, `@/lib/api-handler`.

Integrações/imports externos: `next/server`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/users/[id]/following/route.ts

Fonte: [src/app/api/users/[id]/following/route.ts](../../../src/app/api/users/[id]/following/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `GET`.

Dependências locais declaradas: `@/lib/prisma`, `@/services/block.service`, `@/lib/api-handler`.

Integrações/imports externos: `next/server`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/users/blocked/route.ts

Fonte: [src/app/api/users/blocked/route.ts](../../../src/app/api/users/blocked/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `GET`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/auth`, `@/services/block.service`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/users/me/route.ts

Fonte: [src/app/api/users/me/route.ts](../../../src/app/api/users/me/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `GET`.

Dependências locais declaradas: `@/lib/api-handler`, `@/lib/errors`.

Integrações/imports externos: `next/server`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/users/search/route.ts

Fonte: [src/app/api/users/search/route.ts](../../../src/app/api/users/search/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `GET`.

Dependências locais declaradas: `@/lib/prisma`, `@/services/block.service`, `@/lib/auth`.

Integrações/imports externos: `next/server`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/api/users/suggestions/route.ts

Fonte: [src/app/api/users/suggestions/route.ts](../../../src/app/api/users/suggestions/route.ts)

Adaptador HTTP: métodos, validação e chamada ao domínio; conferir autorização no corpo.

Símbolos localizados: `dynamic`, `GET`.

Dependências locais declaradas: `@/lib/api-handler`, `@/services/follow-recommendation.service`, `@/lib/follow-recommendations`, `@/lib/errors`.

Integrações/imports externos: `next/server`.

Testes associados pelo nome: [src/app/api/answers/[id]/accept/route.test.ts](../../../src/app/api/answers/[id]/accept/route.test.ts), [src/app/api/auth/accounts/route.test.ts](../../../src/app/api/auth/accounts/route.test.ts), [src/app/api/auth/callback/route.test.ts](../../../src/app/api/auth/callback/route.test.ts), [src/app/api/auth/reset-password/route.test.ts](../../../src/app/api/auth/reset-password/route.test.ts), [src/app/api/avatar/route.test.ts](../../../src/app/api/avatar/route.test.ts), [src/app/api/certificates/[id]/pdf/route.test.ts](../../../src/app/api/certificates/[id]/pdf/route.test.ts), [src/app/api/certificates/route.test.ts](../../../src/app/api/certificates/route.test.ts), [src/app/api/cron/security-audit/route.test.ts](../../../src/app/api/cron/security-audit/route.test.ts), [src/app/api/evaluations/route.test.ts](../../../src/app/api/evaluations/route.test.ts), [src/app/api/jobs/[id]/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/__tests__/route.test.ts), [src/app/api/jobs/[id]/applications/**tests**/route.test.ts](../../../src/app/api/jobs/[id]/applications/__tests__/route.test.ts), [src/app/api/leaderboard/route.test.ts](../../../src/app/api/leaderboard/route.test.ts), [src/app/api/lessons/[lessonId]/attempt/route.test.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.test.ts), [src/app/api/messages/chats/**tests**/route.test.ts](../../../src/app/api/messages/chats/__tests__/route.test.ts), [src/app/api/mobile/auth/bootstrap/route.test.ts](../../../src/app/api/mobile/auth/bootstrap/route.test.ts), [src/app/api/mobile/messages/**tests**/route.test.ts](../../../src/app/api/mobile/messages/__tests__/route.test.ts), [src/app/api/mobile/state/[key]/**tests**/route.test.ts](../../../src/app/api/mobile/state/[key]/__tests__/route.test.ts), [src/app/api/mundinho/route.test.ts](../../../src/app/api/mundinho/route.test.ts), [src/app/api/notifications/route.test.ts](../../../src/app/api/notifications/route.test.ts), [src/app/api/onboarding/route.test.ts](../../../src/app/api/onboarding/route.test.ts), [src/app/api/posts/[id]/bookmark/route.test.ts](../../../src/app/api/posts/[id]/bookmark/route.test.ts), [src/app/api/posts/[id]/poll/route.test.ts](../../../src/app/api/posts/[id]/poll/route.test.ts), [src/app/api/posts/media/[id]/route.test.ts](../../../src/app/api/posts/media/[id]/route.test.ts), [src/app/api/presence/route.test.ts](../../../src/app/api/presence/route.test.ts), [src/app/api/profile/[username]/media/route.test.ts](../../../src/app/api/profile/[username]/media/route.test.ts), [src/app/api/profile/[username]/replies/route.test.ts](../../../src/app/api/profile/[username]/replies/route.test.ts), [src/app/api/profile/customization/route.test.ts](../../../src/app/api/profile/customization/route.test.ts), [src/app/api/profile/music/search/route.test.ts](../../../src/app/api/profile/music/search/route.test.ts), [src/app/api/profile/update/route.test.ts](../../../src/app/api/profile/update/route.test.ts), [src/app/api/quiz/daily/route.test.ts](../../../src/app/api/quiz/daily/route.test.ts), [src/app/api/run/**tests**/route.test.ts](../../../src/app/api/run/__tests__/route.test.ts), [src/app/api/users/suggestions/route.test.ts](../../../src/app/api/users/suggestions/route.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/avatar/AvatarCustomizer.tsx

Fonte: [src/app/avatar/AvatarCustomizer.tsx](../../../src/app/avatar/AvatarCustomizer.tsx)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `AvatarCustomizer`.

Dependências locais declaradas: `@/components/Sidebar`, `@/components/CharacterAvatar`, `@/lib/avatar`, `@/lib/client/current-user`.

Integrações/imports externos: `react`, `next/navigation`, `lucide-react`.

## src/app/avatar/page.tsx

Fonte: [src/app/avatar/page.tsx](../../../src/app/avatar/page.tsx)

Entrada de página do App Router; carrega ou compõe a experiência desta rota.

Símbolos localizados: `AvatarPage`, `revalidate`.

Dependências locais declaradas: `@/lib/auth`.

Integrações/imports externos: `next/navigation`.

Testes associados pelo nome: [src/app/certificates/page.test.tsx](../../../src/app/certificates/page.test.tsx), [src/app/feed/page.test.tsx](../../../src/app/feed/page.test.tsx), [src/app/notifications/page.test.tsx](../../../src/app/notifications/page.test.tsx), [src/app/post/[id]/page.test.tsx](../../../src/app/post/[id]/page.test.tsx), [src/app/settings/page.test.tsx](../../../src/app/settings/page.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/app/bookmarks/BookmarksContent.module.css

Fonte: [src/app/bookmarks/BookmarksContent.module.css](../../../src/app/bookmarks/BookmarksContent.module.css)

Regras de apresentação, estados visuais e adaptação responsiva; não é autoridade de dados.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

## src/app/bookmarks/BookmarksContent.tsx

Fonte: [src/app/bookmarks/BookmarksContent.tsx](../../../src/app/bookmarks/BookmarksContent.tsx)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `hasCode`, `hasMedia`, `BookmarksContent`.

Dependências locais declaradas: `@/components/PlatformPageShell`, `@/components/PostCard`, `@/hooks/useReducedMotion`, `@/i18n/useLocalizedText`, `./BookmarksContent.module.css`.

Integrações/imports externos: `react`, `next/link`, `next/navigation`, `framer-motion`, `lucide-react`.

Testes associados pelo nome: [src/app/bookmarks/BookmarksContent.test.tsx](../../../src/app/bookmarks/BookmarksContent.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/app/bookmarks/page.tsx

Fonte: [src/app/bookmarks/page.tsx](../../../src/app/bookmarks/page.tsx)

Entrada de página do App Router; carrega ou compõe a experiência desta rota.

Símbolos localizados: `BookmarksPage`, `revalidate`.

Dependências locais declaradas: `@/lib/prisma`, `@/services/post-access.service`, `@/lib/post-poll`, `@/lib/auth`, `./BookmarksContent`, `@/lib/quiz-public`, `@/lib/post-content`, `@/lib/profile-music`.

Integrações/imports externos: `next/navigation`.

Testes associados pelo nome: [src/app/certificates/page.test.tsx](../../../src/app/certificates/page.test.tsx), [src/app/feed/page.test.tsx](../../../src/app/feed/page.test.tsx), [src/app/notifications/page.test.tsx](../../../src/app/notifications/page.test.tsx), [src/app/post/[id]/page.test.tsx](../../../src/app/post/[id]/page.test.tsx), [src/app/settings/page.test.tsx](../../../src/app/settings/page.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/app/certificates/[id]/certificate.module.css

Fonte: [src/app/certificates/[id]/certificate.module.css](../../../src/app/certificates/[id]/certificate.module.css)

Regras de apresentação, estados visuais e adaptação responsiva; não é autoridade de dados.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

## src/app/certificates/[id]/page.tsx

Fonte: [src/app/certificates/[id]/page.tsx](../../../src/app/certificates/[id]/page.tsx)

Entrada de página do App Router; carrega ou compõe a experiência desta rota.

Símbolos localizados: `CertificatePage`, `dynamic`.

Dependências locais declaradas: `@/components/credentials/CertificateView`, `@/lib/credentials/repository`.

Integrações/imports externos: `next/navigation`.

Testes associados pelo nome: [src/app/certificates/page.test.tsx](../../../src/app/certificates/page.test.tsx), [src/app/feed/page.test.tsx](../../../src/app/feed/page.test.tsx), [src/app/notifications/page.test.tsx](../../../src/app/notifications/page.test.tsx), [src/app/post/[id]/page.test.tsx](../../../src/app/post/[id]/page.test.tsx), [src/app/settings/page.test.tsx](../../../src/app/settings/page.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/app/certificates/error.tsx

Fonte: [src/app/certificates/error.tsx](../../../src/app/certificates/error.tsx)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `CertificatesError`.

Integrações/imports externos: `next/link`.

## src/app/certificates/loading.tsx

Fonte: [src/app/certificates/loading.tsx](../../../src/app/certificates/loading.tsx)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `CertificatesLoading`.

## src/app/certificates/page.tsx

Fonte: [src/app/certificates/page.tsx](../../../src/app/certificates/page.tsx)

Entrada de página do App Router; carrega ou compõe a experiência desta rota.

Símbolos localizados: `CertificatesPage`, `dynamic`.

Dependências locais declaradas: `@/lib/auth`.

Integrações/imports externos: `next/navigation`.

Testes associados pelo nome: [src/app/certificates/page.test.tsx](../../../src/app/certificates/page.test.tsx), [src/app/feed/page.test.tsx](../../../src/app/feed/page.test.tsx), [src/app/notifications/page.test.tsx](../../../src/app/notifications/page.test.tsx), [src/app/post/[id]/page.test.tsx](../../../src/app/post/[id]/page.test.tsx), [src/app/settings/page.test.tsx](../../../src/app/settings/page.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/app/check-email/page.tsx

Fonte: [src/app/check-email/page.tsx](../../../src/app/check-email/page.tsx)

Entrada de página do App Router; carrega ou compõe a experiência desta rota.

Símbolos localizados: `CheckEmailPage`.

Dependências locais declaradas: `@/components/auth/AuthEmailFlow`.

Testes associados pelo nome: [src/app/certificates/page.test.tsx](../../../src/app/certificates/page.test.tsx), [src/app/feed/page.test.tsx](../../../src/app/feed/page.test.tsx), [src/app/notifications/page.test.tsx](../../../src/app/notifications/page.test.tsx), [src/app/post/[id]/page.test.tsx](../../../src/app/post/[id]/page.test.tsx), [src/app/settings/page.test.tsx](../../../src/app/settings/page.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/app/duels/DuelsContent.module.css

Fonte: [src/app/duels/DuelsContent.module.css](../../../src/app/duels/DuelsContent.module.css)

Regras de apresentação, estados visuais e adaptação responsiva; não é autoridade de dados.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

## src/app/duels/DuelsContent.tsx

Fonte: [src/app/duels/DuelsContent.tsx](../../../src/app/duels/DuelsContent.tsx)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `formatInvitationTime`, `DuelsContent`.

Dependências locais declaradas: `@/components/Sidebar`, `@/components/LanguageTag`, `@/components/AuthorAvatar`, `@/lib/cn`, `@/lib/duel-problems`, `@/lib/duels/listing`, `./DuelsContent.module.css`, `@/i18n/useLocalizedText`.

Integrações/imports externos: `react`, `next/navigation`, `@prisma/client`, `lucide-react`, `next/link`, `next/image`.

Testes associados pelo nome: [src/app/duels/DuelsContent.test.tsx](../../../src/app/duels/DuelsContent.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/app/duels/[id]/DuelDetailContent.module.css

Fonte: [src/app/duels/[id]/DuelDetailContent.module.css](../../../src/app/duels/[id]/DuelDetailContent.module.css)

Regras de apresentação, estados visuais e adaptação responsiva; não é autoridade de dados.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

## src/app/duels/[id]/DuelDetailContent.tsx

Fonte: [src/app/duels/[id]/DuelDetailContent.tsx](../../../src/app/duels/[id]/DuelDetailContent.tsx)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `secondsUntil`, `formatTime`, `statusTone`, `DuelDetailContent`, `Metric`, `EmptyResult`.

Dependências locais declaradas: `@/components/Sidebar`, `@/components/CodeEditor`, `@/lib/cn`, `@/lib/duel-problems`, `@/lib/duels/constants`, `@/components/duels/DuelJudgingRules`, `@/lib/duels/result-presentation`, `./DuelDetailContent.module.css`.

Integrações/imports externos: `next/link`, `react`, `next/navigation`, `lucide-react`.

Testes associados pelo nome: [src/app/duels/[id]/DuelDetailContent.test.tsx](../../../src/app/duels/[id]/DuelDetailContent.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/app/duels/[id]/page.tsx

Fonte: [src/app/duels/[id]/page.tsx](../../../src/app/duels/[id]/page.tsx)

Entrada de página do App Router; carrega ou compõe a experiência desta rota.

Símbolos localizados: `DuelDetailPage`, `revalidate`.

Dependências locais declaradas: `@/lib/auth`, `@/lib/prisma`, `@/lib/duels/resolution`, `./DuelDetailContent`.

Integrações/imports externos: `next/navigation`.

Testes associados pelo nome: [src/app/certificates/page.test.tsx](../../../src/app/certificates/page.test.tsx), [src/app/feed/page.test.tsx](../../../src/app/feed/page.test.tsx), [src/app/notifications/page.test.tsx](../../../src/app/notifications/page.test.tsx), [src/app/post/[id]/page.test.tsx](../../../src/app/post/[id]/page.test.tsx), [src/app/settings/page.test.tsx](../../../src/app/settings/page.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/app/duels/page.tsx

Fonte: [src/app/duels/page.tsx](../../../src/app/duels/page.tsx)

Entrada de página do App Router; carrega ou compõe a experiência desta rota.

Símbolos localizados: `DuelsPage`, `revalidate`.

Dependências locais declaradas: `@/lib/prisma`, `@/lib/auth`, `./DuelsContent`, `@/lib/duels/lifecycle`, `@/lib/duels/listing`.

Integrações/imports externos: `next/navigation`.

Testes associados pelo nome: [src/app/certificates/page.test.tsx](../../../src/app/certificates/page.test.tsx), [src/app/feed/page.test.tsx](../../../src/app/feed/page.test.tsx), [src/app/notifications/page.test.tsx](../../../src/app/notifications/page.test.tsx), [src/app/post/[id]/page.test.tsx](../../../src/app/post/[id]/page.test.tsx), [src/app/settings/page.test.tsx](../../../src/app/settings/page.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/app/error.tsx

Fonte: [src/app/error.tsx](../../../src/app/error.tsx)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `isConnectionError`, `isSessionError`, `Error`.

Integrações/imports externos: `react`, `next/link`.

## src/app/evaluations/EvaluationsContent.tsx

Fonte: [src/app/evaluations/EvaluationsContent.tsx](../../../src/app/evaluations/EvaluationsContent.tsx)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `EvaluationsContent`.

Dependências locais declaradas: `@/components/PlatformPageShell`, `@/components/evaluators/EvaluatorGuide`, `@/components/evaluators/EvaluatorPages.module.css`, `@/lib/duel-problems`, `@/lib/evaluators/policy`.

Integrações/imports externos: `react`, `next/link`, `lucide-react`.

Testes associados pelo nome: [src/app/evaluations/**tests**/EvaluationsContent.test.tsx](../../../src/app/evaluations/__tests__/EvaluationsContent.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/app/evaluations/page.tsx

Fonte: [src/app/evaluations/page.tsx](../../../src/app/evaluations/page.tsx)

Entrada de página do App Router; carrega ou compõe a experiência desta rota.

Símbolos localizados: `EvaluationsPage`, `metadata`.

Dependências locais declaradas: `@/lib/auth`, `./EvaluationsContent`.

Integrações/imports externos: `next/navigation`.

Testes associados pelo nome: [src/app/certificates/page.test.tsx](../../../src/app/certificates/page.test.tsx), [src/app/feed/page.test.tsx](../../../src/app/feed/page.test.tsx), [src/app/notifications/page.test.tsx](../../../src/app/notifications/page.test.tsx), [src/app/post/[id]/page.test.tsx](../../../src/app/post/[id]/page.test.tsx), [src/app/settings/page.test.tsx](../../../src/app/settings/page.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/app/evaluators/apply/EvaluatorApplyContent.tsx

Fonte: [src/app/evaluators/apply/EvaluatorApplyContent.tsx](../../../src/app/evaluators/apply/EvaluatorApplyContent.tsx)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `EvaluatorApplyContent`, `loadEligibility`, `handleApply`.

Dependências locais declaradas: `@/components/PlatformPageShell`, `@/components/evaluators/EvaluatorGuide`, `@/lib/evaluators/policy`, `@/components/evaluators/EvaluatorPages.module.css`.

Integrações/imports externos: `react`, `next/link`, `lucide-react`.

Testes associados pelo nome: [src/app/evaluators/apply/EvaluatorApplyContent.test.tsx](../../../src/app/evaluators/apply/EvaluatorApplyContent.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/app/evaluators/apply/page.tsx

Fonte: [src/app/evaluators/apply/page.tsx](../../../src/app/evaluators/apply/page.tsx)

Entrada de página do App Router; carrega ou compõe a experiência desta rota.

Símbolos localizados: `EvaluatorApplyPage`, `metadata`.

Dependências locais declaradas: `@/lib/auth`, `./EvaluatorApplyContent`.

Integrações/imports externos: `next/navigation`.

Testes associados pelo nome: [src/app/certificates/page.test.tsx](../../../src/app/certificates/page.test.tsx), [src/app/feed/page.test.tsx](../../../src/app/feed/page.test.tsx), [src/app/notifications/page.test.tsx](../../../src/app/notifications/page.test.tsx), [src/app/post/[id]/page.test.tsx](../../../src/app/post/[id]/page.test.tsx), [src/app/settings/page.test.tsx](../../../src/app/settings/page.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/app/events/EventsContent.tsx

Fonte: [src/app/events/EventsContent.tsx](../../../src/app/events/EventsContent.tsx)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `getEventTypeLabel`, `filterEvents`, `EventFiltersPanel`, `EventsContent`, `loadEvents`, `EventType`, `EventItem`, `EventFilters`.

Dependências locais declaradas: `@/components/PlatformPageShell`, `./events.module.css`, `@/lib/event-display`, `@/i18n/useLocalizedText`, `@/components/events/CreateEventModal`, `@/components/events/EventDetailsModal`.

Integrações/imports externos: `react`, `next/image`, `next/link`, `lucide-react`.

Testes associados pelo nome: [src/app/events/EventsContent.test.tsx](../../../src/app/events/EventsContent.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/app/events/events.module.css

Fonte: [src/app/events/events.module.css](../../../src/app/events/events.module.css)

Regras de apresentação, estados visuais e adaptação responsiva; não é autoridade de dados.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

## src/app/events/page.tsx

Fonte: [src/app/events/page.tsx](../../../src/app/events/page.tsx)

Entrada de página do App Router; carrega ou compõe a experiência desta rota.

Símbolos localizados: `EventsPage`, `metadata`.

Dependências locais declaradas: `@/lib/auth`, `./EventsContent`.

Integrações/imports externos: `next/navigation`.

Testes associados pelo nome: [src/app/certificates/page.test.tsx](../../../src/app/certificates/page.test.tsx), [src/app/feed/page.test.tsx](../../../src/app/feed/page.test.tsx), [src/app/notifications/page.test.tsx](../../../src/app/notifications/page.test.tsx), [src/app/post/[id]/page.test.tsx](../../../src/app/post/[id]/page.test.tsx), [src/app/settings/page.test.tsx](../../../src/app/settings/page.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/app/explore/page.tsx

Fonte: [src/app/explore/page.tsx](../../../src/app/explore/page.tsx)

Entrada de página do App Router; carrega ou compõe a experiência desta rota.

Símbolos localizados: `ExplorePage`.

Dependências locais declaradas: `@/components/Sidebar`, `@/components/PostCard`, `@/components/motion/FollowButton`, `@/components/WhoToFollow`, `@/components/motion/EmptyState`, `@/components/LevelBadge`, `@/lib/client/current-user`.

Integrações/imports externos: `react`, `next/navigation`, `next/link`, `next/image`, `framer-motion`, `lucide-react`.

Testes associados pelo nome: [src/app/certificates/page.test.tsx](../../../src/app/certificates/page.test.tsx), [src/app/feed/page.test.tsx](../../../src/app/feed/page.test.tsx), [src/app/notifications/page.test.tsx](../../../src/app/notifications/page.test.tsx), [src/app/post/[id]/page.test.tsx](../../../src/app/post/[id]/page.test.tsx), [src/app/settings/page.test.tsx](../../../src/app/settings/page.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/app/feed/FeedContent.tsx

Fonte: [src/app/feed/FeedContent.tsx](../../../src/app/feed/FeedContent.tsx)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `getLevelFromXp`, `hasStartedTrail`, `isAbortedRequest`, `fetchWithSingleRetry`, `highlightMatches`, `RailSectionHeading`, `getInitialCursor`, `FeedContent`.

Dependências locais declaradas: `@/components/Sidebar`, `@/components/PostCard`, `@/components/LanguageTag`, `@/components/Footer`, `@/components/AchievementShowcase`, `@/components/AuthorAvatar`, `@/components/MarkdownRenderer`, `@/components/motion/PostSkeleton`, `@/components/motion/NewPostsPill`, `@/components/motion/XPProgressBar`, `@/app/feed/FeedEngagementCard`, `@/app/feed/FeedControls`, `@/components/MobilePullToRefresh`, `@/components/FeedRankingSwitcher`, `@/components/motion/EmptyState`, `@/components/motion/LevelUpOverlay`, `@/components/FeedRightSidebar`, `@/lib/motion`, `@/components/composer/PostComposerDialog`, `@/lib/cn`, `@/lib/client/current-user`, `@/hooks/useInfiniteScroll`, `@/hooks/useSearchWithDebounce`, `@/hooks/useSoundEffects`, `@/i18n/useLocalizedText`, `@/lib/onboarding`.

Integrações/imports externos: `react`, `next/link`, `next/image`, `next/dynamic`, `next/navigation`, `framer-motion`, `@prisma/client`, `lucide-react`.

## src/app/feed/FeedControls.tsx

Fonte: [src/app/feed/FeedControls.tsx](../../../src/app/feed/FeedControls.tsx)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `FeedControls`.

Dependências locais declaradas: `@/components/FeedPreferencesEditor`, `@/components/FeedRankingSwitcher`, `@/lib/cn`, `@/i18n/useLocalizedText`.

Integrações/imports externos: `react`, `lucide-react`.

Testes associados pelo nome: [src/app/feed/**tests**/FeedControls.test.tsx](../../../src/app/feed/__tests__/FeedControls.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/app/feed/FeedEngagementCard.tsx

Fonte: [src/app/feed/FeedEngagementCard.tsx](../../../src/app/feed/FeedEngagementCard.tsx)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `FeedEngagementCard`.

Dependências locais declaradas: `@/lib/streak`.

Integrações/imports externos: `lucide-react`.

Testes associados pelo nome: [src/app/feed/**tests**/FeedEngagementCard.test.tsx](../../../src/app/feed/__tests__/FeedEngagementCard.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/app/feed/page.tsx

Fonte: [src/app/feed/page.tsx](../../../src/app/feed/page.tsx)

Entrada de página do App Router; carrega ou compõe a experiência desta rota.

Símbolos localizados: `FeedPage`, `revalidate`.

Dependências locais declaradas: `@/lib/auth`, `@/lib/prisma`, `@/services/post.service`, `./FeedContent`, `@/lib/onboarding`.

Integrações/imports externos: `next/navigation`.

Testes associados pelo nome: [src/app/certificates/page.test.tsx](../../../src/app/certificates/page.test.tsx), [src/app/feed/page.test.tsx](../../../src/app/feed/page.test.tsx), [src/app/notifications/page.test.tsx](../../../src/app/notifications/page.test.tsx), [src/app/post/[id]/page.test.tsx](../../../src/app/post/[id]/page.test.tsx), [src/app/settings/page.test.tsx](../../../src/app/settings/page.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/app/forgot-password/page.tsx

Fonte: [src/app/forgot-password/page.tsx](../../../src/app/forgot-password/page.tsx)

Entrada de página do App Router; carrega ou compõe a experiência desta rota.

Símbolos localizados: `ForgotPasswordPage`.

Dependências locais declaradas: `@/components/auth/AuthEmailFlow`.

Testes associados pelo nome: [src/app/certificates/page.test.tsx](../../../src/app/certificates/page.test.tsx), [src/app/feed/page.test.tsx](../../../src/app/feed/page.test.tsx), [src/app/notifications/page.test.tsx](../../../src/app/notifications/page.test.tsx), [src/app/post/[id]/page.test.tsx](../../../src/app/post/[id]/page.test.tsx), [src/app/settings/page.test.tsx](../../../src/app/settings/page.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/app/globals.css

Fonte: [src/app/globals.css](../../../src/app/globals.css)

Regras de apresentação, estados visuais e adaptação responsiva; não é autoridade de dados.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

Integrações/imports externos: `tailwindcss`, `tw-animate-css`, `shadcn/tailwind.css`.

## src/app/guidelines/page.tsx

Fonte: [src/app/guidelines/page.tsx](../../../src/app/guidelines/page.tsx)

Entrada de página do App Router; carrega ou compõe a experiência desta rota.

Símbolos localizados: `GuidelinesPage`, `metadata`.

Dependências locais declaradas: `@/components/community/CommunityPage`.

Integrações/imports externos: `next`.

Testes associados pelo nome: [src/app/certificates/page.test.tsx](../../../src/app/certificates/page.test.tsx), [src/app/feed/page.test.tsx](../../../src/app/feed/page.test.tsx), [src/app/notifications/page.test.tsx](../../../src/app/notifications/page.test.tsx), [src/app/post/[id]/page.test.tsx](../../../src/app/post/[id]/page.test.tsx), [src/app/settings/page.test.tsx](../../../src/app/settings/page.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/app/guilds/GuildsClient.tsx

Fonte: [src/app/guilds/GuildsClient.tsx](../../../src/app/guilds/GuildsClient.tsx)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `getCommunityTheme`, `CommunityLogo`, `CommunityCard`, `CommunityGridSkeleton`, `GuildsClient`.

Dependências locais declaradas: `@/components/Sidebar`, `@/components/LanguageTag`, `@/components/AuthorAvatar`, `@/lib/cn`, `@/lib/client/current-user`.

Integrações/imports externos: `react`, `next/link`, `next/navigation`, `@prisma/client`, `lucide-react`.

## src/app/guilds/[slug]/page.tsx

Fonte: [src/app/guilds/[slug]/page.tsx](../../../src/app/guilds/[slug]/page.tsx)

Entrada de página do App Router; carrega ou compõe a experiência desta rota.

Símbolos localizados: `CommunityDetailSkeleton`, `GuildDetailPage`.

Dependências locais declaradas: `@/components/Sidebar`, `@/components/LanguageTag`, `@/components/AuthorAvatar`, `@/lib/cn`, `@/lib/client/current-user`.

Integrações/imports externos: `react`, `next/navigation`, `next/link`, `@prisma/client`, `lucide-react`.

Testes associados pelo nome: [src/app/certificates/page.test.tsx](../../../src/app/certificates/page.test.tsx), [src/app/feed/page.test.tsx](../../../src/app/feed/page.test.tsx), [src/app/notifications/page.test.tsx](../../../src/app/notifications/page.test.tsx), [src/app/post/[id]/page.test.tsx](../../../src/app/post/[id]/page.test.tsx), [src/app/settings/page.test.tsx](../../../src/app/settings/page.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/app/guilds/page.tsx

Fonte: [src/app/guilds/page.tsx](../../../src/app/guilds/page.tsx)

Entrada de página do App Router; carrega ou compõe a experiência desta rota.

Símbolos localizados: `GuildsPage`, `dynamic`.

Dependências locais declaradas: `./GuildsClient`.

Testes associados pelo nome: [src/app/certificates/page.test.tsx](../../../src/app/certificates/page.test.tsx), [src/app/feed/page.test.tsx](../../../src/app/feed/page.test.tsx), [src/app/notifications/page.test.tsx](../../../src/app/notifications/page.test.tsx), [src/app/post/[id]/page.test.tsx](../../../src/app/post/[id]/page.test.tsx), [src/app/settings/page.test.tsx](../../../src/app/settings/page.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/app/jobs/JobsContent.tsx

Fonte: [src/app/jobs/JobsContent.tsx](../../../src/app/jobs/JobsContent.tsx)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `normalizeSearchValue`, `filterJobs`, `getFilterCount`, `formatJobAge`, `formatSalary`, `getCompanyInitials`, `getOptionLabel`, `FilterTextField`, `CheckboxGroup`, `JobCard`, `LoadingJobs`, `JobsContent`, `loadJobs`, `JobLevel`, `JobModality`, `JobContract`, `JobItem`, `JobFilters`.

Dependências locais declaradas: `@/components/PlatformPageShell`, `@/i18n/useLocalizedText`, `./jobs.module.css`.

Integrações/imports externos: `react`, `next/link`, `lucide-react`.

Testes associados pelo nome: [src/app/jobs/JobsContent.test.tsx](../../../src/app/jobs/JobsContent.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/app/jobs/[id]/JobDetailContent.tsx

Fonte: [src/app/jobs/[id]/JobDetailContent.tsx](../../../src/app/jobs/[id]/JobDetailContent.tsx)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `salaryLabel`, `JobDetailContent`.

Dependências locais declaradas: `@/components/PlatformPageShell`, `../jobs.module.css`.

Integrações/imports externos: `react`, `next/link`, `lucide-react`.

Testes associados pelo nome: [src/app/jobs/[id]/JobDetailContent.test.tsx](../../../src/app/jobs/[id]/JobDetailContent.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/app/jobs/[id]/page.tsx

Fonte: [src/app/jobs/[id]/page.tsx](../../../src/app/jobs/[id]/page.tsx)

Entrada de página do App Router; carrega ou compõe a experiência desta rota.

Símbolos localizados: `JobDetailPage`.

Dependências locais declaradas: `@/lib/auth`, `@/services/job.service`, `./JobDetailContent`.

Integrações/imports externos: `next/navigation`.

Testes associados pelo nome: [src/app/certificates/page.test.tsx](../../../src/app/certificates/page.test.tsx), [src/app/feed/page.test.tsx](../../../src/app/feed/page.test.tsx), [src/app/notifications/page.test.tsx](../../../src/app/notifications/page.test.tsx), [src/app/post/[id]/page.test.tsx](../../../src/app/post/[id]/page.test.tsx), [src/app/settings/page.test.tsx](../../../src/app/settings/page.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/app/jobs/jobs.module.css

Fonte: [src/app/jobs/jobs.module.css](../../../src/app/jobs/jobs.module.css)

Regras de apresentação, estados visuais e adaptação responsiva; não é autoridade de dados.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

## src/app/jobs/page.tsx

Fonte: [src/app/jobs/page.tsx](../../../src/app/jobs/page.tsx)

Entrada de página do App Router; carrega ou compõe a experiência desta rota.

Símbolos localizados: `JobsPage`, `metadata`.

Dependências locais declaradas: `@/lib/auth`, `./JobsContent`.

Integrações/imports externos: `next/navigation`.

Testes associados pelo nome: [src/app/certificates/page.test.tsx](../../../src/app/certificates/page.test.tsx), [src/app/feed/page.test.tsx](../../../src/app/feed/page.test.tsx), [src/app/notifications/page.test.tsx](../../../src/app/notifications/page.test.tsx), [src/app/post/[id]/page.test.tsx](../../../src/app/post/[id]/page.test.tsx), [src/app/settings/page.test.tsx](../../../src/app/settings/page.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/app/knowledge/page.tsx

Fonte: [src/app/knowledge/page.tsx](../../../src/app/knowledge/page.tsx)

Entrada de página do App Router; carrega ou compõe a experiência desta rota.

Símbolos localizados: `KnowledgePage`.

Integrações/imports externos: `next/navigation`.

Testes associados pelo nome: [src/app/certificates/page.test.tsx](../../../src/app/certificates/page.test.tsx), [src/app/feed/page.test.tsx](../../../src/app/feed/page.test.tsx), [src/app/notifications/page.test.tsx](../../../src/app/notifications/page.test.tsx), [src/app/post/[id]/page.test.tsx](../../../src/app/post/[id]/page.test.tsx), [src/app/settings/page.test.tsx](../../../src/app/settings/page.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/app/landing.css

Fonte: [src/app/landing.css](../../../src/app/landing.css)

Regras de apresentação, estados visuais e adaptação responsiva; não é autoridade de dados.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

## src/app/layout.tsx

Fonte: [src/app/layout.tsx](../../../src/app/layout.tsx)

Estrutura compartilhada e composição das páginas descendentes.

Símbolos localizados: `RootLayout`, `metadata`.

Dependências locais declaradas: `./globals.css`, `./landing.css`, `@/components/ConnectionBanner`, `@/components/PlatformPresence`, `@/components/profile/AchievementNotifications`, `@/contexts/LanguageContext`, `@/components/ThemeSync`, `@/lib/theme`.

Integrações/imports externos: `next`, `next/font/google`, `next/script`.

## src/app/leaderboard/LeaderboardClient.tsx

Fonte: [src/app/leaderboard/LeaderboardClient.tsx](../../../src/app/leaderboard/LeaderboardClient.tsx)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `LeaderboardClient`, `LeaderboardRow`.

Dependências locais declaradas: `@/app/trails/TrailLanguageLogo`, `@/app/trails/TrailCourseSelector`, `@/components/FeedRightSidebar`, `@/components/Sidebar`, `./MobileRankingBoard`.

Testes associados pelo nome: [src/app/leaderboard/LeaderboardClient.test.tsx](../../../src/app/leaderboard/LeaderboardClient.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/app/leaderboard/MobileRankingBoard.module.css

Fonte: [src/app/leaderboard/MobileRankingBoard.module.css](../../../src/app/leaderboard/MobileRankingBoard.module.css)

Regras de apresentação, estados visuais e adaptação responsiva; não é autoridade de dados.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

## src/app/leaderboard/MobileRankingBoard.tsx

Fonte: [src/app/leaderboard/MobileRankingBoard.tsx](../../../src/app/leaderboard/MobileRankingBoard.tsx)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `MobileRankingBoard`, `load`, `changeScope`, `player`.

Dependências locais declaradas: `@/components/AuthorAvatar`, `@/components/FeedRankingSwitcher`, `@/components/profile/ProfileIdentity`, `@/lib/profile-style`, `@/i18n/useLocalizedText`, `@/app/trails/TrailLanguageLogo`, `./LeaderboardClient`, `./MobileRankingBoard.module.css`.

Integrações/imports externos: `react`, `next/link`, `lucide-react`.

Testes associados pelo nome: [src/app/leaderboard/MobileRankingBoard.test.tsx](../../../src/app/leaderboard/MobileRankingBoard.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/app/leaderboard/page.tsx

Fonte: [src/app/leaderboard/page.tsx](../../../src/app/leaderboard/page.tsx)

Entrada de página do App Router; carrega ou compõe a experiência desta rota.

Símbolos localizados: `LeaderboardPage`.

Integrações/imports externos: `next/navigation`.

Testes associados pelo nome: [src/app/certificates/page.test.tsx](../../../src/app/certificates/page.test.tsx), [src/app/feed/page.test.tsx](../../../src/app/feed/page.test.tsx), [src/app/notifications/page.test.tsx](../../../src/app/notifications/page.test.tsx), [src/app/post/[id]/page.test.tsx](../../../src/app/post/[id]/page.test.tsx), [src/app/settings/page.test.tsx](../../../src/app/settings/page.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/app/lesson/[lessonId]/ExerciseWorkspace.module.css

Fonte: [src/app/lesson/[lessonId]/ExerciseWorkspace.module.css](../../../src/app/lesson/[lessonId]/ExerciseWorkspace.module.css)

Regras de apresentação, estados visuais e adaptação responsiva; não é autoridade de dados.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

## src/app/lesson/[lessonId]/ExerciseWorkspace.tsx

Fonte: [src/app/lesson/[lessonId]/ExerciseWorkspace.tsx](../../../src/app/lesson/[lessonId]/ExerciseWorkspace.tsx)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `displayValue`, `TestResultRow`, `ExerciseWorkspace`.

Dependências locais declaradas: `@/components/lesson/AssistanceControls`, `@/components/CodeEditor`, `@/lib/cn`, `@/lib/exercises/types`, `./ExerciseWorkspace.module.css`.

Integrações/imports externos: `next/link`, `react`, `lucide-react`.

Testes associados pelo nome: [src/app/lesson/[lessonId]/**tests**/ExerciseWorkspace.test.tsx](../../../src/app/lesson/[lessonId]/__tests__/ExerciseWorkspace.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/app/lesson/[lessonId]/LessonClient.module.css

Fonte: [src/app/lesson/[lessonId]/LessonClient.module.css](../../../src/app/lesson/[lessonId]/LessonClient.module.css)

Regras de apresentação, estados visuais e adaptação responsiva; não é autoridade de dados.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

## src/app/lesson/[lessonId]/LessonClient.tsx

Fonte: [src/app/lesson/[lessonId]/LessonClient.tsx](../../../src/app/lesson/[lessonId]/LessonClient.tsx)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `LessonClient`, `sendAnswer`.

Dependências locais declaradas: `@/hooks/useSoundEffects`, `@/lib/lessons/types`, `@/components/lesson/LessonFooter`, `@/components/lesson/LessonSummary`, `@/components/lesson/ExitConfirmModal`, `@/components/lesson/renderers/ConceptStep`, `@/components/lesson/renderers/MultipleChoiceStep`, `@/components/lesson/renderers/MatchingPairsStep`, `@/components/lesson/renderers/OrderingStep`, `@/components/lesson/renderers/CodeCompletionStep`, `@/components/lesson/renderers/CodeEditorStep`, `@/components/lesson/renderers/DebugStep`, `@/components/lesson/renderers/OutputPredictionStep`, `@/components/lesson/renderers/TerminalStep`, `@/components/lesson/renderers/CodeBlockBuilderStep`, `@/app/trails/trailMascotProgress`, `./LessonClient.module.css`.

Integrações/imports externos: `react`, `next/navigation`, `lucide-react`.

Testes associados pelo nome: [src/app/lesson/[lessonId]/**tests**/LessonClient.test.tsx](../../../src/app/lesson/[lessonId]/__tests__/LessonClient.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/app/lesson/[lessonId]/page.tsx

Fonte: [src/app/lesson/[lessonId]/page.tsx](../../../src/app/lesson/[lessonId]/page.tsx)

Entrada de página do App Router; carrega ou compõe a experiência desta rota.

Símbolos localizados: `firstSearchValue`, `getSafeTrailReturnHref`, `LessonPage`.

Dependências locais declaradas: `@/lib/auth`, `@/lib/exercises/repository`, `@/lib/lessons/registry`, `./ExerciseWorkspace`, `./LessonClient`, `@/lib/learning/assessment`, `@/lib/learning/lesson-progress`, `@/lib/errors`.

Integrações/imports externos: `next/navigation`, `next/link`.

Testes associados pelo nome: [src/app/certificates/page.test.tsx](../../../src/app/certificates/page.test.tsx), [src/app/feed/page.test.tsx](../../../src/app/feed/page.test.tsx), [src/app/notifications/page.test.tsx](../../../src/app/notifications/page.test.tsx), [src/app/post/[id]/page.test.tsx](../../../src/app/post/[id]/page.test.tsx), [src/app/settings/page.test.tsx](../../../src/app/settings/page.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/app/login/login.module.css

Fonte: [src/app/login/login.module.css](../../../src/app/login/login.module.css)

Regras de apresentação, estados visuais e adaptação responsiva; não é autoridade de dados.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

## src/app/login/page.tsx

Fonte: [src/app/login/page.tsx](../../../src/app/login/page.tsx)

Entrada de página do App Router; carrega ou compõe a experiência desta rota.

Símbolos localizados: `LoginPage`.

Dependências locais declaradas: `@/components/BrandLogo`, `@/lib/supabase/client`, `@/lib/supabase/env`, `@/lib/supabase/oauth`, `@/components/auth/AuthHero`, `@/components/auth/OAuthProviderIcons`, `@/components/LanguageToggle`, `@/contexts/LanguageContext`, `./login.module.css`.

Integrações/imports externos: `react`, `next/link`, `next/navigation`, `lucide-react`.

Testes associados pelo nome: [src/app/certificates/page.test.tsx](../../../src/app/certificates/page.test.tsx), [src/app/feed/page.test.tsx](../../../src/app/feed/page.test.tsx), [src/app/notifications/page.test.tsx](../../../src/app/notifications/page.test.tsx), [src/app/post/[id]/page.test.tsx](../../../src/app/post/[id]/page.test.tsx), [src/app/settings/page.test.tsx](../../../src/app/settings/page.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/app/messages/page.tsx

Fonte: [src/app/messages/page.tsx](../../../src/app/messages/page.tsx)

Entrada de página do App Router; carrega ou compõe a experiência desta rota.

Símbolos localizados: `useClickOutside`, `MessagesPage`, `MessagesContent`, `loadOlderMessages`, `MessageReactionItem`.

Dependências locais declaradas: `@/hooks/usePrivateChat`, `@/lib/profile-style`, `@/lib/chat-conversations`, `@/lib/supabase/client`, `@/lib/post-composer`, `@/components/Sidebar`, `@/components/motion/EmptyState`, `@/components/motion/TypingIndicator`, `@/lib/cn`, `@/hooks/useSoundEffects`, `@/lib/client/current-user`, `@/i18n/useLocalizedText`.

Integrações/imports externos: `react`, `next/navigation`, `next/image`, `framer-motion`, `@supabase/supabase-js`, `lucide-react`.

Testes associados pelo nome: [src/app/certificates/page.test.tsx](../../../src/app/certificates/page.test.tsx), [src/app/feed/page.test.tsx](../../../src/app/feed/page.test.tsx), [src/app/notifications/page.test.tsx](../../../src/app/notifications/page.test.tsx), [src/app/post/[id]/page.test.tsx](../../../src/app/post/[id]/page.test.tsx), [src/app/settings/page.test.tsx](../../../src/app/settings/page.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/app/not-found.tsx

Fonte: [src/app/not-found.tsx](../../../src/app/not-found.tsx)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `NotFound`.

Integrações/imports externos: `next/link`.

## src/app/notifications/notifications.module.css

Fonte: [src/app/notifications/notifications.module.css](../../../src/app/notifications/notifications.module.css)

Regras de apresentação, estados visuais e adaptação responsiva; não é autoridade de dados.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

## src/app/notifications/page.tsx

Fonte: [src/app/notifications/page.tsx](../../../src/app/notifications/page.tsx)

Entrada de página do App Router; carrega ou compõe a experiência desta rota.

Símbolos localizados: `NotificationsPage`, `fetchPageData`, `deleteNotifications`, `formatTimeAgo`, `actorAction`, `notificationCopy`.

Dependências locais declaradas: `@/components/Sidebar`, `@/components/AuthorAvatar`, `@/components/profile/ProfileIdentity`, `@/components/FeedRightSidebar`, `@/components/motion/PostSkeleton`, `@/lib/client/current-user`, `@/lib/profile-style`, `@/i18n/useLocalizedText`, `./notifications.module.css`.

Integrações/imports externos: `react`, `next/navigation`, `next/link`, `@base-ui/react/dialog`, `lucide-react`.

Testes associados pelo nome: [src/app/certificates/page.test.tsx](../../../src/app/certificates/page.test.tsx), [src/app/feed/page.test.tsx](../../../src/app/feed/page.test.tsx), [src/app/notifications/page.test.tsx](../../../src/app/notifications/page.test.tsx), [src/app/post/[id]/page.test.tsx](../../../src/app/post/[id]/page.test.tsx), [src/app/settings/page.test.tsx](../../../src/app/settings/page.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/app/onboarding/OnboardingForm.tsx

Fonte: [src/app/onboarding/OnboardingForm.tsx](../../../src/app/onboarding/OnboardingForm.tsx)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `OnboardingForm`, `submit`.

Dependências locais declaradas: `@/components/BrandLogo`, `@/components/landing/SiteEntryLoader`, `@/app/trails/TrailLanguageLogo`, `@/contexts/LanguageContext`, `@/lib/onboarding`.

Integrações/imports externos: `react`, `next/navigation`, `lucide-react`.

## src/app/onboarding/page.tsx

Fonte: [src/app/onboarding/page.tsx](../../../src/app/onboarding/page.tsx)

Entrada de página do App Router; carrega ou compõe a experiência desta rota.

Símbolos localizados: `OnboardingPage`.

Dependências locais declaradas: `@/lib/auth`, `@/lib/prisma`, `@/lib/onboarding`, `./OnboardingForm`.

Integrações/imports externos: `next/navigation`.

Testes associados pelo nome: [src/app/certificates/page.test.tsx](../../../src/app/certificates/page.test.tsx), [src/app/feed/page.test.tsx](../../../src/app/feed/page.test.tsx), [src/app/notifications/page.test.tsx](../../../src/app/notifications/page.test.tsx), [src/app/post/[id]/page.test.tsx](../../../src/app/post/[id]/page.test.tsx), [src/app/settings/page.test.tsx](../../../src/app/settings/page.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/app/page.tsx

Fonte: [src/app/page.tsx](../../../src/app/page.tsx)

Entrada de página do App Router; carrega ou compõe a experiência desta rota.

Símbolos localizados: `Home`, `dynamic`.

Dependências locais declaradas: `@/lib/auth-session`, `@/components/HomeClient`.

Testes associados pelo nome: [src/app/certificates/page.test.tsx](../../../src/app/certificates/page.test.tsx), [src/app/feed/page.test.tsx](../../../src/app/feed/page.test.tsx), [src/app/notifications/page.test.tsx](../../../src/app/notifications/page.test.tsx), [src/app/post/[id]/page.test.tsx](../../../src/app/post/[id]/page.test.tsx), [src/app/settings/page.test.tsx](../../../src/app/settings/page.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/app/personalize/page.tsx

Fonte: [src/app/personalize/page.tsx](../../../src/app/personalize/page.tsx)

Entrada de página do App Router; carrega ou compõe a experiência desta rota.

Símbolos localizados: `PersonalizePage`, `dynamic`.

Dependências locais declaradas: `@/lib/auth`, `@/components/profile-customization/ProfilePersonalizationEditor`.

Integrações/imports externos: `next/navigation`.

Testes associados pelo nome: [src/app/certificates/page.test.tsx](../../../src/app/certificates/page.test.tsx), [src/app/feed/page.test.tsx](../../../src/app/feed/page.test.tsx), [src/app/notifications/page.test.tsx](../../../src/app/notifications/page.test.tsx), [src/app/post/[id]/page.test.tsx](../../../src/app/post/[id]/page.test.tsx), [src/app/settings/page.test.tsx](../../../src/app/settings/page.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/app/post/[id]/PostDetailContent.tsx

Fonte: [src/app/post/[id]/PostDetailContent.tsx](../../../src/app/post/[id]/PostDetailContent.tsx)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `insertReplyIntoTree`, `containsId`, `PostDetailContent`.

Dependências locais declaradas: `@/components/Sidebar`, `@/components/FeedRightSidebar`, `@/components/AchievementShowcase`, `@/components/LevelBadge`, `@/components/profile/ProfileIdentity`, `@/lib/profile-style`, `@/components/QuizWidget`, `@/components/AnswerThread`, `@/components/answer-types`, `@/components/MarkdownEditor`, `@/hooks/useSoundEffects`, `@/components/PostActionsBar`, `@/components/motion/RepostMenu`, `@/components/motion/BookmarkButton`, `@/components/motion/LikeButton`, `@/components/PostComposerExtras`, `@/components/MarkdownRenderer`, `@/components/posts/PostAttachments`, `@/components/AuthorAvatar`, `@/components/PostPresentation`, `@/lib/post-composer`, `@/lib/motion`, `@/lib/cn`, `@/lib/client/post-bookmarks`.

Integrações/imports externos: `react`, `next/link`, `next/image`, `next/navigation`, `lucide-react`.

Comentários de contrato presentes na fonte:

> Recursively inserts a new reply into the answer tree under the answer whose
> id matches `parentId`. Returns a new tree (does not mutate the input).
> If the parent cannot be found (e.g. its level wasn't fetched from the server
> because it was beyond the include depth), the reply is appended to the
> nearest ancestor that was found, so it still surfaces in the UI.

> Returns true if the given id exists anywhere in the answer subtree.

## src/app/post/[id]/page.tsx

Fonte: [src/app/post/[id]/page.tsx](../../../src/app/post/[id]/page.tsx)

Entrada de página do App Router; carrega ou compõe a experiência desta rota.

Símbolos localizados: `PostDetailPage`, `revalidate`.

Dependências locais declaradas: `@/lib/prisma`, `@/services/block.service`, `@/lib/quiz-public`, `@/lib/auth`, `./PostDetailContent`, `@/services/post-access.service`, `@/lib/post-poll`.

Integrações/imports externos: `next/navigation`.

Testes associados pelo nome: [src/app/certificates/page.test.tsx](../../../src/app/certificates/page.test.tsx), [src/app/feed/page.test.tsx](../../../src/app/feed/page.test.tsx), [src/app/notifications/page.test.tsx](../../../src/app/notifications/page.test.tsx), [src/app/post/[id]/page.test.tsx](../../../src/app/post/[id]/page.test.tsx), [src/app/settings/page.test.tsx](../../../src/app/settings/page.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/app/privacy/page.tsx

Fonte: [src/app/privacy/page.tsx](../../../src/app/privacy/page.tsx)

Entrada de página do App Router; carrega ou compõe a experiência desta rota.

Símbolos localizados: `PrivacyPage`.

Dependências locais declaradas: `@/components/legal/LegalPage`.

Testes associados pelo nome: [src/app/certificates/page.test.tsx](../../../src/app/certificates/page.test.tsx), [src/app/feed/page.test.tsx](../../../src/app/feed/page.test.tsx), [src/app/notifications/page.test.tsx](../../../src/app/notifications/page.test.tsx), [src/app/post/[id]/page.test.tsx](../../../src/app/post/[id]/page.test.tsx), [src/app/settings/page.test.tsx](../../../src/app/settings/page.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/app/profile/[username]/ProfileContent.tsx

Fonte: [src/app/profile/[username]/ProfileContent.tsx](../../../src/app/profile/[username]/ProfileContent.tsx)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `ProfileContent`, `Metric`.

Dependências locais declaradas: `@/components/Sidebar`, `@/components/profile/ProfileRightRail`, `@/components/PostCard`, `@/components/ProfileReplyThread`, `@/components/motion/FollowersModal`, `@/components/credentials/ProfileCertificates`, `@/lib/credentials/types`, `@/components/LanguageTrailBar`, `@/lib/learning/rewards`, `@/components/profile-inline/SocialProfileOverview`, `@/app/trails/TrailsProgressSidebar`, `@/lib/profile-customization`, `@/lib/profile-style`, `@/i18n/useLocalizedText`, `@/components/profile/ProfilePublic.module.css`, `@/components/profile-inline/InlineProfile.module.css`, `./ProfileHeader.module.css`.

Integrações/imports externos: `react`, `next/link`, `next/navigation`, `lucide-react`.

Testes associados pelo nome: [src/app/profile/[username]/ProfileContent.test.tsx](../../../src/app/profile/[username]/ProfileContent.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/app/profile/[username]/ProfileHeader.module.css

Fonte: [src/app/profile/[username]/ProfileHeader.module.css](../../../src/app/profile/[username]/ProfileHeader.module.css)

Regras de apresentação, estados visuais e adaptação responsiva; não é autoridade de dados.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

## src/app/profile/[username]/page.tsx

Fonte: [src/app/profile/[username]/page.tsx](../../../src/app/profile/[username]/page.tsx)

Entrada de página do App Router; carrega ou compõe a experiência desta rota.

Símbolos localizados: `ProfilePage`, `revalidate`.

Dependências locais declaradas: `@/lib/prisma`, `@/lib/learning/language-xp`, `@/lib/streak`, `@/lib/auth`, `./ProfileContent`, `@/services/profile-activity.service`, `@/services/block.service`, `@/components/profile/BlockedProfile`, `@/services/profile-customization.service`, `@/lib/credentials/repository`.

Integrações/imports externos: `next/navigation`.

Testes associados pelo nome: [src/app/certificates/page.test.tsx](../../../src/app/certificates/page.test.tsx), [src/app/feed/page.test.tsx](../../../src/app/feed/page.test.tsx), [src/app/notifications/page.test.tsx](../../../src/app/notifications/page.test.tsx), [src/app/post/[id]/page.test.tsx](../../../src/app/post/[id]/page.test.tsx), [src/app/settings/page.test.tsx](../../../src/app/settings/page.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/app/ranking/page.tsx

Fonte: [src/app/ranking/page.tsx](../../../src/app/ranking/page.tsx)

Entrada de página do App Router; carrega ou compõe a experiência desta rota.

Símbolos localizados: `RankedPage`, `revalidate`, `metadata`.

Dependências locais declaradas: `@/lib/prisma`, `@/lib/auth`, `@/app/leaderboard/LeaderboardClient`, `@/lib/learning/rewards`, `@/lib/streak`, `@/lib/learning/language-xp`, `@/app/trails/TrailLanguageLogo`, `@/app/trails/TrailCourseSelector`, `@/lib/leaderboard-identity`, `@/lib/learning/leaderboard`.

Integrações/imports externos: `next`, `next/navigation`, `@prisma/client`.

Testes associados pelo nome: [src/app/certificates/page.test.tsx](../../../src/app/certificates/page.test.tsx), [src/app/feed/page.test.tsx](../../../src/app/feed/page.test.tsx), [src/app/notifications/page.test.tsx](../../../src/app/notifications/page.test.tsx), [src/app/post/[id]/page.test.tsx](../../../src/app/post/[id]/page.test.tsx), [src/app/settings/page.test.tsx](../../../src/app/settings/page.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/app/recruiter/RecruiterContent.tsx

Fonte: [src/app/recruiter/RecruiterContent.tsx](../../../src/app/recruiter/RecruiterContent.tsx)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `RecruiterContent`.

Dependências locais declaradas: `@/components/PlatformPageShell`, `@/components/AuthorAvatar`, `./recruiter.module.css`.

Integrações/imports externos: `react`, `next/link`, `lucide-react`.

Testes associados pelo nome: [src/app/recruiter/**tests**/RecruiterContent.test.tsx](../../../src/app/recruiter/__tests__/RecruiterContent.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/app/recruiter/page.tsx

Fonte: [src/app/recruiter/page.tsx](../../../src/app/recruiter/page.tsx)

Entrada de página do App Router; carrega ou compõe a experiência desta rota.

Símbolos localizados: `RecruiterPage`, `metadata`.

Dependências locais declaradas: `@/lib/auth`, `./RecruiterContent`.

Integrações/imports externos: `next/navigation`.

Testes associados pelo nome: [src/app/certificates/page.test.tsx](../../../src/app/certificates/page.test.tsx), [src/app/feed/page.test.tsx](../../../src/app/feed/page.test.tsx), [src/app/notifications/page.test.tsx](../../../src/app/notifications/page.test.tsx), [src/app/post/[id]/page.test.tsx](../../../src/app/post/[id]/page.test.tsx), [src/app/settings/page.test.tsx](../../../src/app/settings/page.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/app/recruiter/recruiter.module.css

Fonte: [src/app/recruiter/recruiter.module.css](../../../src/app/recruiter/recruiter.module.css)

Regras de apresentação, estados visuais e adaptação responsiva; não é autoridade de dados.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

## src/app/register/page.tsx

Fonte: [src/app/register/page.tsx](../../../src/app/register/page.tsx)

Entrada de página do App Router; carrega ou compõe a experiência desta rota.

Símbolos localizados: `RegisterPage`.

Dependências locais declaradas: `@/components/BrandLogo`, `@/lib/supabase/client`, `@/lib/supabase/env`, `@/lib/supabase/oauth`, `@/components/auth/AuthHero`, `@/components/auth/OAuthProviderIcons`, `@/components/BrandReveal`, `@/components/landing/SiteEntryLoader`, `@/components/LanguageToggle`, `@/contexts/LanguageContext`, `../login/login.module.css`.

Integrações/imports externos: `react`, `next/link`, `next/navigation`, `lucide-react`.

Testes associados pelo nome: [src/app/certificates/page.test.tsx](../../../src/app/certificates/page.test.tsx), [src/app/feed/page.test.tsx](../../../src/app/feed/page.test.tsx), [src/app/notifications/page.test.tsx](../../../src/app/notifications/page.test.tsx), [src/app/post/[id]/page.test.tsx](../../../src/app/post/[id]/page.test.tsx), [src/app/settings/page.test.tsx](../../../src/app/settings/page.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/app/reset-password/page.tsx

Fonte: [src/app/reset-password/page.tsx](../../../src/app/reset-password/page.tsx)

Entrada de página do App Router; carrega ou compõe a experiência desta rota.

Símbolos localizados: `ResetPasswordPage`.

Dependências locais declaradas: `@/components/auth/AuthEmailFlow`.

Testes associados pelo nome: [src/app/certificates/page.test.tsx](../../../src/app/certificates/page.test.tsx), [src/app/feed/page.test.tsx](../../../src/app/feed/page.test.tsx), [src/app/notifications/page.test.tsx](../../../src/app/notifications/page.test.tsx), [src/app/post/[id]/page.test.tsx](../../../src/app/post/[id]/page.test.tsx), [src/app/settings/page.test.tsx](../../../src/app/settings/page.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/app/settings/page.tsx

Fonte: [src/app/settings/page.tsx](../../../src/app/settings/page.tsx)

Entrada de página do App Router; carrega ou compõe a experiência desta rota.

Símbolos localizados: `SettingsPage`.

Dependências locais declaradas: `@/lib/theme`, `@/components/Sidebar`, `@/components/BlockedUsersSettings`, `@/lib/client/current-user`, `@/contexts/LanguageContext`, `@/lib/avatar`, `@/hooks/useSoundEffects`.

Integrações/imports externos: `react`, `next/navigation`, `next/image`, `lucide-react`.

Testes associados pelo nome: [src/app/certificates/page.test.tsx](../../../src/app/certificates/page.test.tsx), [src/app/feed/page.test.tsx](../../../src/app/feed/page.test.tsx), [src/app/notifications/page.test.tsx](../../../src/app/notifications/page.test.tsx), [src/app/post/[id]/page.test.tsx](../../../src/app/post/[id]/page.test.tsx), [src/app/settings/page.test.tsx](../../../src/app/settings/page.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/app/terms/page.tsx

Fonte: [src/app/terms/page.tsx](../../../src/app/terms/page.tsx)

Entrada de página do App Router; carrega ou compõe a experiência desta rota.

Símbolos localizados: `TermsPage`.

Dependências locais declaradas: `@/components/legal/LegalPage`.

Testes associados pelo nome: [src/app/certificates/page.test.tsx](../../../src/app/certificates/page.test.tsx), [src/app/feed/page.test.tsx](../../../src/app/feed/page.test.tsx), [src/app/notifications/page.test.tsx](../../../src/app/notifications/page.test.tsx), [src/app/post/[id]/page.test.tsx](../../../src/app/post/[id]/page.test.tsx), [src/app/settings/page.test.tsx](../../../src/app/settings/page.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/app/trails/AdventureEntry.tsx

Fonte: [src/app/trails/AdventureEntry.tsx](../../../src/app/trails/AdventureEntry.tsx)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `AdventureEntry`.

Dependências locais declaradas: `@/components/Sidebar`, `@/components/mundinho/AdventureHub`, `./TrailsProgressSidebar`, `@/lib/mundinho/types`, `./TrailCourseSelector`, `./TrailLanguageLogo`.

Integrações/imports externos: `react`, `next/navigation`.

## src/app/trails/JourneyOverview.module.css

Fonte: [src/app/trails/JourneyOverview.module.css](../../../src/app/trails/JourneyOverview.module.css)

Regras de apresentação, estados visuais e adaptação responsiva; não é autoridade de dados.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

## src/app/trails/JourneyOverview.tsx

Fonte: [src/app/trails/JourneyOverview.tsx](../../../src/app/trails/JourneyOverview.tsx)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `JourneyOverview`.

Dependências locais declaradas: `./JourneyOverview.module.css`.

Integrações/imports externos: `react`, `lucide-react`.

Testes associados pelo nome: [src/app/trails/**tests**/JourneyOverview.test.tsx](../../../src/app/trails/__tests__/JourneyOverview.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/app/trails/LearningJourney.module.css

Fonte: [src/app/trails/LearningJourney.module.css](../../../src/app/trails/LearningJourney.module.css)

Regras de apresentação, estados visuais e adaptação responsiva; não é autoridade de dados.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

## src/app/trails/LearningJourney.tsx

Fonte: [src/app/trails/LearningJourney.tsx](../../../src/app/trails/LearningJourney.tsx)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `getJourneyItems`, `nodeHref`, `LearningJourney`.

Dependências locais declaradas: `@/lib/learning/types`, `@/lib/learning/progress`, `./TrailMascot`, `./LearningJourney.module.css`, `./JourneyOverview`.

Integrações/imports externos: `next/link`, `react`, `lucide-react`.

## src/app/trails/TrailCourseSelector.tsx

Fonte: [src/app/trails/TrailCourseSelector.tsx](../../../src/app/trails/TrailCourseSelector.tsx)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `formatXp`, `CourseRow`, `TrailCourseSelector`, `TrailCourseOption`.

Dependências locais declaradas: `@/app/trails/TrailLanguageLogo`, `@/i18n/useLocalizedText`.

Integrações/imports externos: `react`, `@base-ui/react/menu`, `lucide-react`.

Testes associados pelo nome: [src/app/trails/**tests**/TrailCourseSelector.test.tsx](../../../src/app/trails/__tests__/TrailCourseSelector.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/app/trails/TrailLanguageLogo.tsx

Fonte: [src/app/trails/TrailLanguageLogo.tsx](../../../src/app/trails/TrailLanguageLogo.tsx)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `isTrailLanguage`, `getTrailLanguageMetadata`, `TrailLanguageLogo`, `TRAIL_LANGUAGE_CODES`, `TrailLanguageCode`, `TRAIL_LANGUAGE_METADATA`.

Integrações/imports externos: `next/image`, `devicon/icons/javascript/javascript-original.svg`, `devicon/icons/typescript/typescript-original.svg`, `devicon/icons/python/python-original.svg`, `devicon/icons/rust/rust-original.svg`, `devicon/icons/go/go-original.svg`, `devicon/icons/java/java-original.svg`.

Testes associados pelo nome: [src/app/trails/**tests**/TrailLanguageLogo.test.tsx](../../../src/app/trails/__tests__/TrailLanguageLogo.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/app/trails/TrailMap.tsx

Fonte: [src/app/trails/TrailMap.tsx](../../../src/app/trails/TrailMap.tsx)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `getSectorAngle`, `buildVisualSectors`, `sectorPoint`, `sectorLabelPoint`, `sectorRadiusEnd`, `buildRowCapacities`, `getRowPlacement`, `buildPlacedNodes`, `buildSectorConnections`, `GamifiedSkillNode`, `MobilePath`, `TrailMapCameraController`, `TrailMapControls`, `TrailMap`, `Point`, `PlacedNode`.

Dependências locais declaradas: `@/app/trails/TrailMapLessonPopover`, `@/lib/cn`, `@/app/trails/trailSectorVisuals`, `@/lib/learning/types`.

Integrações/imports externos: `react`, `next/image`, `lucide-react`, `react-zoom-pan-pinch`.

Testes associados pelo nome: [src/app/trails/**tests**/TrailMap.test.tsx](../../../src/app/trails/__tests__/TrailMap.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/app/trails/TrailMapLessonPopover.tsx

Fonte: [src/app/trails/TrailMapLessonPopover.tsx](../../../src/app/trails/TrailMapLessonPopover.tsx)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `TrailMapLessonPopover`, `TrailMapLessonPopoverProps`.

Dependências locais declaradas: `@/app/trails/TrailMap`, `@/lib/cn`.

Integrações/imports externos: `react`, `next/navigation`, `lucide-react`.

## src/app/trails/TrailMascot.tsx

Fonte: [src/app/trails/TrailMascot.tsx](../../../src/app/trails/TrailMascot.tsx)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `TrailMascot`.

Dependências locais declaradas: `./mascotSprites`, `./useTrailMascot`.

Integrações/imports externos: `react`.

## src/app/trails/TrailPathView.tsx

Fonte: [src/app/trails/TrailPathView.tsx](../../../src/app/trails/TrailPathView.tsx)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `hexToHsl`, `chestTintFilter`, `LessonStars`, `TrailActivityPopup`, `TrailJumpPopup`, `isCompleted`, `isAccessible`, `buildRouteMilestones`, `buildCodingMilestone`, `buildRouteSections`, `TrailPathView`.

Dependências locais declaradas: `@/lib/trailsData`, `@/lib/learning/types`, `@/lib/trails/jump`, `@/i18n/useLocalizedText`, `./trailCurriculum`, `./trailTheme`, `./TrailMascot`, `./trailMascotProgress`, `./TrailSectionNavigation`.

Integrações/imports externos: `react`, `next/image`, `next/navigation`, `lucide-react`.

Comentários de contrato presentes na fonte:

> Topo do primeiro nó de nível de cada unidade (abaixo da linha divisória).

> Espaçamento vertical entre os nós de nível.

> Distância entre cada atividade visual dentro de uma unidade.

> Distância do último nível até o checkpoint.

> Altura do botão do checkpoint.

> Respiro abaixo do checkpoint até a próxima unidade.

Testes associados pelo nome: [src/app/trails/**tests**/TrailPathView.test.tsx](../../../src/app/trails/__tests__/TrailPathView.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/app/trails/TrailResourceBar.tsx

Fonte: [src/app/trails/TrailResourceBar.tsx](../../../src/app/trails/TrailResourceBar.tsx)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `formatMetric`, `TrailResourceBar`.

Dependências locais declaradas: `@/components/mundinho/PixelArt`, `@/app/trails/TrailCourseSelector`, `@/app/trails/TrailLanguageLogo`, `@/components/StreakPopover`.

Integrações/imports externos: `next/image`.

Testes associados pelo nome: [src/app/trails/**tests**/TrailResourceBar.test.tsx](../../../src/app/trails/__tests__/TrailResourceBar.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/app/trails/TrailResources.module.css

Fonte: [src/app/trails/TrailResources.module.css](../../../src/app/trails/TrailResources.module.css)

Regras de apresentação, estados visuais e adaptação responsiva; não é autoridade de dados.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

## src/app/trails/TrailSectionNavigation.tsx

Fonte: [src/app/trails/TrailSectionNavigation.tsx](../../../src/app/trails/TrailSectionNavigation.tsx)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `getUnitNumberInSection`, `getLevelsForSection`, `buildTrailSections`, `TrailSectionNavigation`, `TrailSectionView`.

Dependências locais declaradas: `@/lib/trailsData`, `./trailTheme`, `@/i18n/useLocalizedText`.

Integrações/imports externos: `lucide-react`.

Testes associados pelo nome: [src/app/trails/**tests**/TrailSectionNavigation.test.tsx](../../../src/app/trails/__tests__/TrailSectionNavigation.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/app/trails/TrailViewSwitcher.module.css

Fonte: [src/app/trails/TrailViewSwitcher.module.css](../../../src/app/trails/TrailViewSwitcher.module.css)

Regras de apresentação, estados visuais e adaptação responsiva; não é autoridade de dados.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

## src/app/trails/TrailViewSwitcher.tsx

Fonte: [src/app/trails/TrailViewSwitcher.tsx](../../../src/app/trails/TrailViewSwitcher.tsx)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `TrailViewSwitcher`.

Dependências locais declaradas: `./TrailViewSwitcher.module.css`.

Integrações/imports externos: `lucide-react`.

Testes associados pelo nome: [src/app/trails/**tests**/TrailViewSwitcher.test.tsx](../../../src/app/trails/__tests__/TrailViewSwitcher.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/app/trails/TrailsContent.tsx

Fonte: [src/app/trails/TrailsContent.tsx](../../../src/app/trails/TrailsContent.tsx)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `TrailsContent`, `changeMode`, `selectCourse`.

Dependências locais declaradas: `./TrailViewSwitcher`, `@/components/Sidebar`, `./TrailResourceBar`, `./TrailsProgressSidebar`, `./TrailCourseSelector`, `./TrailLanguageLogo`, `./trailCourseKnowledge`, `@/lib/learning/types`, `./LearningJourney`, `@/components/ui/select`.

Integrações/imports externos: `react`, `next/navigation`, `next/link`, `lucide-react`.

## src/app/trails/TrailsProgressSidebar.tsx

Fonte: [src/app/trails/TrailsProgressSidebar.tsx](../../../src/app/trails/TrailsProgressSidebar.tsx)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `formatMetric`, `clampProgress`, `MissionProgress`, `TrailsProgressSidebar`, `TrailDailyProgress`.

Dependências locais declaradas: `@/components/mundinho/PixelArt`, `@/app/trails/TrailCourseSelector`, `@/app/trails/TrailLanguageLogo`, `@/components/StreakPopover`, `@/i18n/useLocalizedText`, `./TrailResources.module.css`.

Integrações/imports externos: `next/image`, `next/link`, `react`, `lucide-react`.

Testes associados pelo nome: [src/app/trails/**tests**/TrailsProgressSidebar.test.tsx](../../../src/app/trails/__tests__/TrailsProgressSidebar.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/app/trails/mascotSprites.ts

Fonte: [src/app/trails/mascotSprites.ts](../../../src/app/trails/mascotSprites.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `preloadMascotSprites`, `MascotDirection`, `MASCOT_SPRITE_FRAMES`, `MASCOT_IDLE_FRAMES`, `ALL_MASCOT_SPRITES`.

Comentários de contrato presentes na fonte:

> The idle set is intentionally separate from the walking set. Walking keeps
> the compact three/four-frame sprite animation, while a settled mascot uses
> the supplied directional idle poses and never reuses a walk frame.

## src/app/trails/page.tsx

Fonte: [src/app/trails/page.tsx](../../../src/app/trails/page.tsx)

Entrada de página do App Router; carrega ou compõe a experiência desta rota.

Símbolos localizados: `firstSearchValue`, `TrailsPage`, `revalidate`.

Dependências locais declaradas: `@/app/trails/TrailLanguageLogo`, `@/app/trails/trailCoursePreferences`, `@/app/trails/trailCurriculum`, `@/app/trails/trailDailyProgress`, `@/lib/auth`, `@/lib/gamification/gems`, `@/lib/learning/repository`, `@/lib/prisma`, `@/app/trails/TrailsContent`, `@/lib/learning/catalog`, `@/lib/learning/rewards`, `./AdventureEntry`.

Integrações/imports externos: `next/navigation`, `next/headers`.

Testes associados pelo nome: [src/app/certificates/page.test.tsx](../../../src/app/certificates/page.test.tsx), [src/app/feed/page.test.tsx](../../../src/app/feed/page.test.tsx), [src/app/notifications/page.test.tsx](../../../src/app/notifications/page.test.tsx), [src/app/post/[id]/page.test.tsx](../../../src/app/post/[id]/page.test.tsx), [src/app/settings/page.test.tsx](../../../src/app/settings/page.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/app/trails/trailCourseKnowledge.ts

Fonte: [src/app/trails/trailCourseKnowledge.ts](../../../src/app/trails/trailCourseKnowledge.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `getCourseKnowledgeNodes`, `getCourseLearningPaths`.

Dependências locais declaradas: `@/app/trails/TrailLanguageLogo`, `@/lib/learning/types`.

Testes associados pelo nome: [src/app/trails/**tests**/trailCourseKnowledge.test.ts](../../../src/app/trails/__tests__/trailCourseKnowledge.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/trails/trailCoursePreferences.ts

Fonte: [src/app/trails/trailCoursePreferences.ts](../../../src/app/trails/trailCoursePreferences.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `parseTrailCoursePreferences`, `serializeTrailCoursePreferences`, `TRAIL_COURSE_PREFERENCES_COOKIE`, `TrailCoursePreferences`.

Dependências locais declaradas: `@/app/trails/TrailLanguageLogo`.

Testes associados pelo nome: [src/app/trails/**tests**/trailCoursePreferences.test.ts](../../../src/app/trails/__tests__/trailCoursePreferences.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/trails/trailCurriculum.ts

Fonte: [src/app/trails/trailCurriculum.ts](../../../src/app/trails/trailCurriculum.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `sentenceCase`, `sentenceSubject`, `describeUnit`, `defineCurriculum`, `buildTrailLessonId`, `buildTrailCodeLessonId`, `parseTrailLessonId`, `parseTrailLessonStepId`, `getCompletedTrailLessonIds`, `inferCurriculum`, `getTrailCurriculum`, `findCurriculumUnit`, `findCurriculumUnitByTitle`, `TrailActivityKind`, `TrailCurriculumUnit`, `TrailCurriculumSection`, `TrailCurriculum`, `CURRICULUM_BY_SLUG`, `TRAIL_CURRICULUM_STEPS_PER_LESSON`, `TRAIL_CODE_CHALLENGE_STEPS_PER_LESSON`.

Dependências locais declaradas: `@/lib/learning/types`.

Testes associados pelo nome: [src/app/trails/**tests**/trailCurriculum.test.ts](../../../src/app/trails/__tests__/trailCurriculum.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/trails/trailDailyProgress.ts

Fonte: [src/app/trails/trailDailyProgress.ts](../../../src/app/trails/trailDailyProgress.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `calculateTrailDailyProgress`.

Dependências locais declaradas: `@/app/trails/trailCurriculum`.

Testes associados pelo nome: [src/app/trails/**tests**/trailDailyProgress.test.ts](../../../src/app/trails/__tests__/trailDailyProgress.test.ts). Outros testes de integração podem cobrir este módulo.

## src/app/trails/trailMascotProgress.ts

Fonte: [src/app/trails/trailMascotProgress.ts](../../../src/app/trails/trailMascotProgress.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `getTrailMascotProgressKey`, `rememberTrailMascotDeparture`, `rememberTrailMascotReturn`, `readPendingTrailMascotMovement`, `clearPendingTrailMascotMovement`, `PendingMascotMovement`.

## src/app/trails/trailPath.ts

Fonte: [src/app/trails/trailPath.ts](../../../src/app/trails/trailPath.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `distanceBetween`, `catmullRomPoint`, `sampleSmoothPoints`, `createSmoothTrailPath`, `TrailPoint`, `SmoothTrailPath`, `getPointAtLength`.

## src/app/trails/trailSectorVisuals.ts

Fonte: [src/app/trails/trailSectorVisuals.ts](../../../src/app/trails/trailSectorVisuals.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `getTrailSectorAccent`, `getTrailSectorRegionLabel`.

## src/app/trails/trailTheme.ts

Fonte: [src/app/trails/trailTheme.ts](../../../src/app/trails/trailTheme.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `getSectionTheme`, `TrailSectionTheme`, `SECTION_THEMES`.

## src/app/trails/useResponsiveTrailViewMode.ts

Fonte: [src/app/trails/useResponsiveTrailViewMode.ts](../../../src/app/trails/useResponsiveTrailViewMode.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `resolveTrailViewMode`, `useResponsiveTrailViewMode`, `TrailViewMode`, `MOBILE_TRAIL_ONLY_QUERY`.

Integrações/imports externos: `react`.

## src/app/trails/useTrailMascot.ts

Fonte: [src/app/trails/useTrailMascot.ts](../../../src/app/trails/useTrailMascot.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `centerInContainer`, `readTrailLayout`, `resolveCurrentNodeKey`, `createMovementLeg`, `applyPosition`, `setSprite`, `setIdleSprite`, `isHorizontal`, `resolveMascotMovementRange`, `chooseMascotDirection`, `findScrollableAncestor`, `followMascotWithCamera`, `playArrivalEffect`, `useTrailMascot`.

Dependências locais declaradas: `./mascotSprites`, `./trailMascotProgress`, `./trailPath`.

Integrações/imports externos: `react`.

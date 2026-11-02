# Código: estado-infra

[Índice](README.md) · [Manual](../README.md)

## src/contexts/LanguageContext.tsx

Fonte: [src/contexts/LanguageContext.tsx](../../../src/contexts/LanguageContext.tsx)

Contexto/provedor de estado compartilhado entre componentes.

Símbolos localizados: `getInitialLanguage`, `LanguageProvider`, `useLanguage`.

Dependências locais declaradas: `@/i18n/translations`.

Integrações/imports externos: `react`.

Testes associados pelo nome: [src/contexts/**tests**/LanguageContext.test.tsx](../../../src/contexts/__tests__/LanguageContext.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/hooks/use-auto-resize-textarea.ts

Fonte: [src/hooks/use-auto-resize-textarea.ts](../../../src/hooks/use-auto-resize-textarea.ts)

Hook para reutilizar estado, efeitos ou integração de interface.

Símbolos localizados: `useAutoResizeTextarea`.

Integrações/imports externos: `react`.

Comentários de contrato presentes na fonte:

> Keeps a textarea's height in sync with its content, growing up to `maxHeight`.
> Based on the KokonutUI AI Input pattern (`useAutoResizeTextarea`).

## src/hooks/useCharCounter.ts

Fonte: [src/hooks/useCharCounter.ts](../../../src/hooks/useCharCounter.ts)

Hook para reutilizar estado, efeitos ou integração de interface.

Símbolos localizados: `useCharCounter`.

Integrações/imports externos: `react`.

## src/hooks/useComposeExpansion.ts

Fonte: [src/hooks/useComposeExpansion.ts](../../../src/hooks/useComposeExpansion.ts)

Hook para reutilizar estado, efeitos ou integração de interface.

Símbolos localizados: `useComposeExpansion`.

Integrações/imports externos: `react`.

## src/hooks/useDuelRealtime.ts

Fonte: [src/hooks/useDuelRealtime.ts](../../../src/hooks/useDuelRealtime.ts)

Hook para reutilizar estado, efeitos ou integração de interface.

Símbolos localizados: `useDuelRealtime`, `DuelPlayerPresence`, `OpponentLiveState`.

Dependências locais declaradas: `@/lib/supabase/client`.

Integrações/imports externos: `react`.

## src/hooks/useHydrationSafeRelativeTime.ts

Fonte: [src/hooks/useHydrationSafeRelativeTime.ts](../../../src/hooks/useHydrationSafeRelativeTime.ts)

Hook para reutilizar estado, efeitos ou integração de interface.

Símbolos localizados: `useHydrationSafeRelativeTime`.

Dependências locais declaradas: `@/lib/date`.

Integrações/imports externos: `react`.

## src/hooks/useInfiniteScroll.ts

Fonte: [src/hooks/useInfiniteScroll.ts](../../../src/hooks/useInfiniteScroll.ts)

Hook para reutilizar estado, efeitos ou integração de interface.

Símbolos localizados: `useInfiniteScroll`.

Integrações/imports externos: `react`.

## src/hooks/useLevelUp.ts

Fonte: [src/hooks/useLevelUp.ts](../../../src/hooks/useLevelUp.ts)

Hook para reutilizar estado, efeitos ou integração de interface.

Símbolos localizados: `useLevelUp`.

Dependências locais declaradas: `./useReducedMotion`.

Integrações/imports externos: `react`.

## src/hooks/useLongPress.ts

Fonte: [src/hooks/useLongPress.ts](../../../src/hooks/useLongPress.ts)

Hook para reutilizar estado, efeitos ou integração de interface.

Símbolos localizados: `useLongPress`.

Integrações/imports externos: `react`.

## src/hooks/useOptimisticPost.ts

Fonte: [src/hooks/useOptimisticPost.ts](../../../src/hooks/useOptimisticPost.ts)

Hook para reutilizar estado, efeitos ou integração de interface.

Símbolos localizados: `useOptimisticPost`.

Integrações/imports externos: `react`.

## src/hooks/usePlatformPresence.ts

Fonte: [src/hooks/usePlatformPresence.ts](../../../src/hooks/usePlatformPresence.ts)

Hook para reutilizar estado, efeitos ou integração de interface.

Símbolos localizados: `usePlatformPresence`.

Dependências locais declaradas: `@/lib/platform-presence`.

Integrações/imports externos: `react`.

## src/hooks/usePostTypeToggle.ts

Fonte: [src/hooks/usePostTypeToggle.ts](../../../src/hooks/usePostTypeToggle.ts)

Hook para reutilizar estado, efeitos ou integração de interface.

Símbolos localizados: `usePostTypeToggle`.

Integrações/imports externos: `react`.

## src/hooks/usePrivateChat.ts

Fonte: [src/hooks/usePrivateChat.ts](../../../src/hooks/usePrivateChat.ts)

Hook para reutilizar estado, efeitos ou integração de interface.

Símbolos localizados: `usePrivateChat`.

Dependências locais declaradas: `@/lib/profile-customization`.

Integrações/imports externos: `react`.

## src/hooks/useReactionBurst.ts

Fonte: [src/hooks/useReactionBurst.ts](../../../src/hooks/useReactionBurst.ts)

Hook para reutilizar estado, efeitos ou integração de interface.

Símbolos localizados: `useReactionBurst`.

Dependências locais declaradas: `./useReducedMotion`.

Integrações/imports externos: `react`.

## src/hooks/useReducedMotion.ts

Fonte: [src/hooks/useReducedMotion.ts](../../../src/hooks/useReducedMotion.ts)

Hook para reutilizar estado, efeitos ou integração de interface.

Símbolos localizados: `useReducedMotion`.

Integrações/imports externos: `react`.

## src/hooks/useSearchWithDebounce.ts

Fonte: [src/hooks/useSearchWithDebounce.ts](../../../src/hooks/useSearchWithDebounce.ts)

Hook para reutilizar estado, efeitos ou integração de interface.

Símbolos localizados: `useSearchWithDebounce`.

Integrações/imports externos: `react`.

## src/hooks/useSoundEffects.ts

Fonte: [src/hooks/useSoundEffects.ts](../../../src/hooks/useSoundEffects.ts)

Hook para reutilizar estado, efeitos ou integração de interface.

Símbolos localizados: `getAudioContext`, `preloadAndDecode`, `playInstantBuffer`, `playInstantCorrectChime`, `playInstantIncorrectBuzz`, `getPreloadedAudio`, `playSoundPreview`, `useSoundEffects`, `SoundType`.

Integrações/imports externos: `react`.

Comentários de contrato presentes na fonte:

> Plays a short, explicit confirmation sound regardless of the saved sound
> preference. Settings uses this from the same click that changes the setting,
> so people can hear what enabling or disabling platform effects means.

## src/hooks/useTextToSpeech.ts

Fonte: [src/hooks/useTextToSpeech.ts](../../../src/hooks/useTextToSpeech.ts)

Hook para reutilizar estado, efeitos ou integração de interface.

Símbolos localizados: `useTextToSpeech`.

Integrações/imports externos: `react`.

## src/hooks/useXPFloat.ts

Fonte: [src/hooks/useXPFloat.ts](../../../src/hooks/useXPFloat.ts)

Hook para reutilizar estado, efeitos ou integração de interface.

Símbolos localizados: `useXPFloat`.

Dependências locais declaradas: `./useReducedMotion`.

Integrações/imports externos: `react`.

## src/i18n/translations.ts

Fonte: [src/i18n/translations.ts](../../../src/i18n/translations.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `Language`, `Translations`, `translations`.

## src/i18n/useLocalizedText.ts

Fonte: [src/i18n/useLocalizedText.ts](../../../src/i18n/useLocalizedText.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `useLocalizedText`.

Dependências locais declaradas: `@/contexts/LanguageContext`.

Integrações/imports externos: `react`.

## src/proxy.ts

Fonte: [src/proxy.ts](../../../src/proxy.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `proxy`, `config`.

Dependências locais declaradas: `@/lib/supabase/middleware`, `@/lib/supabase/bearer`, `@/lib/errors`.

Integrações/imports externos: `next/server`.

## src/services/admin.service.ts

Fonte: [src/services/admin.service.ts](../../../src/services/admin.service.ts)

Caso de uso do domínio, integrando regras, persistência e efeitos associados.

Símbolos localizados: `getDashboardMetrics`, `listUsers`, `updateUserRole`, `listReports`, `deleteReportedPost`, `AdminService`.

Dependências locais declaradas: `@/lib/prisma`, `@/lib/logger`, `@/lib/errors`, `@/lib/security-audit`, `@/lib/event-status`.

Integrações/imports externos: `@prisma/client`.

Comentários de contrato presentes na fonte:

> Get general platform executive metrics for the admin dashboard.

> List users with pagination, search, and role filtering.

> Update a user's role (USER, EVALUATOR, ADMIN, RECRUITER).

> List reports for content moderation.

> Delete reported post and resolve report.

## src/services/block.service.ts

Fonte: [src/services/block.service.ts](../../../src/services/block.service.ts)

Caso de uso do domínio, integrando regras, persistência e efeitos associados.

Símbolos localizados: `hasBlock`, `assertCanInteract`, `block`, `unblock`, `list`, `visibleUserWhere`, `BlockService`.

Dependências locais declaradas: `@/lib/prisma`, `@/lib/errors`.

Integrações/imports externos: `@prisma/client`.

Comentários de contrato presentes na fonte:

> Compose inside AND so username, search and following filters stay intact.

Testes associados pelo nome: [src/services/**tests**/block.service.test.ts](../../../src/services/__tests__/block.service.test.ts). Outros testes de integração podem cobrir este módulo.

## src/services/daily-quiz.service.ts

Fonte: [src/services/daily-quiz.service.ts](../../../src/services/daily-quiz.service.ts)

Caso de uso do domínio, integrando regras, persistência e efeitos associados.

Símbolos localizados: `generateDailyQuiz`.

Dependências locais declaradas: `@/lib/prisma`, `@/lib/logger`, `@/lib/errors`, `@/lib/post-quiz`.

Integrações/imports externos: `server-only`.

Comentários de contrato presentes na fonte:

> Publish at most one reviewed, post-related question per UTC day, without AI.

## src/services/duel.service.ts

Fonte: [src/services/duel.service.ts](../../../src/services/duel.service.ts)

Caso de uso do domínio, integrando regras, persistência e efeitos associados.

Símbolos localizados: `findMatchmakingOpponent`, `createDuelRequest`, `respondDuelRequest`, `getUserRankTier`, `DuelService`.

Dependências locais declaradas: `@/lib/prisma`, `./block.service`, `@/lib/logger`, `@/lib/duel-problems`, `./notification.service`, `@/lib/learning/rewards`, `@/lib/duels/problems`, `@/lib/duels/constants`, `@/lib/duels/invitations`, `@/lib/duels/participation-policy`, `@/lib/errors`.

Integrações/imports externos: `@prisma/client`.

Comentários de contrato presentes na fonte:

> Find compatible opponent for matchmaking with progressive tier expansion.

> Create a 72-hour direct duel request to a specific player.

> Respond to a duel request (ACCEPT or REJECT).

## src/services/evaluator.service.ts

Fonte: [src/services/evaluator.service.ts](../../../src/services/evaluator.service.ts)

Caso de uso do domínio, integrando regras, persistência e efeitos associados.

Símbolos localizados: `checkEligibility`, `applyForEvaluator`, `listApplications`, `reviewApplication`, `moderateEvaluator`, `submitDuelEvaluation`, `recoverPendingNotifications`, `EvaluatorService`.

Dependências locais declaradas: `@/lib/prisma`, `@/lib/logger`, `@/lib/trailsData`, `@/lib/learning/catalog`, `@/lib/xp`, `@/lib/evaluators/policy`, `@/lib/errors`, `@/lib/security-audit`, `@/lib/evaluators/notifications`.

Comentários de contrato presentes na fonte:

> Check if a user meets the minimum requirements to become an evaluator.
> Requirement: User must have completed at least 1 full trail (all levels and unit checkpoints) OR has >= 1000 total XP.

> Submit an application to become a code evaluator.

> List all pending evaluator applications for admin review.

> Admin approve or reject an evaluator application.

> Submit a code evaluation for a duel solution.

> Repair earlier undelivered pending work. Deterministic notification IDs make retries safe.

## src/services/event-challenge.service.ts

Fonte: [src/services/event-challenge.service.ts](../../../src/services/event-challenge.service.ts)

Caso de uso do domínio, integrando regras, persistência e efeitos associados.

Símbolos localizados: `list`, `replaceSet`, `findEvent`, `EventChallengeService`.

Dependências locais declaradas: `@/lib/prisma`, `@/lib/errors`, `@/lib/event-challenges`, `@/lib/logger`, `@/lib/event-status`.

Testes associados pelo nome: [src/services/**tests**/event-challenge.service.test.ts](../../../src/services/__tests__/event-challenge.service.test.ts). Outros testes de integração podem cobrir este módulo.

## src/services/event.service.ts

Fonte: [src/services/event.service.ts](../../../src/services/event.service.ts)

Caso de uso do domínio, integrando regras, persistência e efeitos associados.

Símbolos localizados: `listEvents`, `getEventById`, `getEventBySlug`, `createEvent`, `participate`, `cancelParticipation`, `deleteEvent`, `EventService`.

Dependências locais declaradas: `@/lib/prisma`, `@/lib/logger`, `@/lib/learning/rewards`, `@/lib/errors`, `@/lib/event-status`.

Integrações/imports externos: `@prisma/client`.

Comentários de contrato presentes na fonte:

> List all platform events with filtering and user participation status.

> Get single event by ID with participants leaderboard.

> Get single event by slug with participants leaderboard.

> Create an official event (requires ADMIN or RECRUITER role or community organizer).

> Join an event as a participant.

> Cancel participation in an event.

> Delete an event by creator or admin.

## src/services/follow-recommendation.service.ts

Fonte: [src/services/follow-recommendation.service.ts](../../../src/services/follow-recommendation.service.ts)

Caso de uso do domínio, integrando regras, persistência e efeitos associados.

Símbolos localizados: `getFollowRecommendations`.

Dependências locais declaradas: `@/lib/prisma`, `@/lib/profile-style`, `@/lib/follow-recommendations`, `./block.service`, `./post-access.service`.

Integrações/imports externos: `@prisma/client`.

## src/services/follow.service.ts

Fonte: [src/services/follow.service.ts](../../../src/services/follow.service.ts)

Caso de uso do domínio, integrando regras, persistência e efeitos associados.

Símbolos localizados: `toggleFollow`, `FollowService`.

Dependências locais declaradas: `@/lib/prisma`, `./block.service`, `@/lib/errors`, `@/lib/logger`, `./profile-customization.service`.

## src/services/index.ts

Fonte: [src/services/index.ts](../../../src/services/index.ts)

Caso de uso do domínio, integrando regras, persistência e efeitos associados.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

Dependências locais declaradas: `./xp.service`, `./notification.service`, `./post.service`, `./quiz.service`, `./reaction.service`, `./search.service`, `./follow.service`.

## src/services/job.service.ts

Fonte: [src/services/job.service.ts](../../../src/services/job.service.ts)

Caso de uso do domínio, integrando regras, persistência e efeitos associados.

Símbolos localizados: `listJobs`, `getJobApplications`, `getJobById`, `createJob`, `applyForJob`, `updateApplicationStage`, `createCompany`, `JobService`.

Dependências locais declaradas: `@/lib/prisma`, `@/lib/mobile/company-access`, `@/lib/logger`, `./notification.service`, `@/lib/security-audit`.

Integrações/imports externos: `@prisma/client`.

Comentários de contrato presentes na fonte:

> List jobs with rich filters (technology, level, modality, contract).

> Get all applications for a specific job with applicant user and stage info.
> Only accessible by Recruiter or Admin.

> Get job by ID with all details and recruitment stages.

> Create a new Job opportunity with customizable recruitment stages.

> Apply for a job and link developer's platform technical profile.

> Advance or update candidate application status in recruitment pipeline.

> Create or register a company profile.

Testes associados pelo nome: [src/services/**tests**/job.service.test.ts](../../../src/services/__tests__/job.service.test.ts). Outros testes de integração podem cobrir este módulo.

## src/services/notification.service.ts

Fonte: [src/services/notification.service.ts](../../../src/services/notification.service.ts)

Caso de uso do domínio, integrando regras, persistência e efeitos associados.

Símbolos localizados: `create`, `getUserNotifications`, `markAllAsRead`, `deleteNotification`, `deleteAll`, `getUnreadCount`, `resolveLinkedPostId`, `resolveProfileUsername`, `mapApiType`, `getNotificationTitle`, `getNotificationContent`, `getNotificationLink`, `CreateNotificationInput`, `NotificationService`.

Dependências locais declaradas: `@/lib/prisma`, `./block.service`, `@/lib/mobile/push`, `@/lib/pagination`, `./post-access.service`, `@/lib/profile-customization`, `@/lib/evaluators/notifications`.

Integrações/imports externos: `@prisma/client`.

## src/services/post-access.service.ts

Fonte: [src/services/post-access.service.ts](../../../src/services/post-access.service.ts)

Caso de uso do domínio, integrando regras, persistência e efeitos associados.

Símbolos localizados: `visiblePostWhere`, `assertPostAccess`, `assertPostAudience`.

Dependências locais declaradas: `@/services/block.service`, `@/lib/prisma`, `@/lib/errors`.

Integrações/imports externos: `@prisma/client`.

Comentários de contrato presentes na fonte:

> Apply in SQL before selecting post content, including nested replies and media.

## src/services/post.service.ts

Fonte: [src/services/post.service.ts](../../../src/services/post.service.ts)

Caso de uso do domínio, integrando regras, persistência e efeitos associados.

Símbolos localizados: `create`, `getFeed`, `countNewer`, `PostService`.

Dependências locais declaradas: `@/lib/prisma`, `@/services/block.service`, `@/lib/validators`, `@/lib/pagination`, `./xp.service`, `./notification.service`, `@/lib/logger`, `@/lib/quiz-public`, `./profile-customization.service`, `./post-access.service`, `@/lib/post-poll`, `@/lib/errors`, `@/lib/feed-ranking`.

Integrações/imports externos: `@prisma/client`.

## src/services/profile-activity.service.ts

Fonte: [src/services/profile-activity.service.ts](../../../src/services/profile-activity.service.ts)

Caso de uso do domínio, integrando regras, persistência e efeitos associados.

Símbolos localizados: `visibleProfileReplyWhere`, `activityCursorWhere`, `getProfilePublicationCounts`, `getProfileActivity`.

Dependências locais declaradas: `@/lib/prisma`, `@/lib/errors`, `@/lib/pagination`, `@/lib/quiz-public`, `./block.service`, `./post-access.service`, `@/lib/post-poll`.

Integrações/imports externos: `@prisma/client`.

Comentários de contrato presentes na fonte:

> One ordering across both tables, including rows created at the same instant.

## src/services/profile-customization.service.ts

Fonte: [src/services/profile-customization.service.ts](../../../src/services/profile-customization.service.ts)

Caso de uso do domínio, integrando regras, persistência e efeitos associados.

Símbolos localizados: `editableProfile`, `getProfileCatalog`, `saveProfileCatalog`, `profileActivityMetrics`, `hashtagPostMetrics`, `eventIsActive`, `eventHashtagPattern`, `eventMetrics`, `unlockedDefinitions`, `reconcileInTransaction`, `reconcileProfileAchievements`, `syncProfileAchievementsSafely`, `getProfileCustomization`, `getPublicProfileCustomization`, `saveProfileCustomization`, `findProfileCustomizationByUsername`, `saveProfileCustomizationSchema`.

Dependências locais declaradas: `@/lib/profile-frames`, `@/lib/prisma`, `@/lib/errors`, `@/lib/logger`, `@/lib/profile-customization`, `@/lib/profile-music`, `@/lib/profile-upload`, `@/lib/learning/catalog`.

Integrações/imports externos: `@prisma/client`, `zod`.

Comentários de contrato presentes na fonte:

> Server-only counters. Deleted activities disappear from progress; existing awards remain earned.

> One bounded query for all evergreen hashtag goals, using the normal post quality rules.

## src/services/quiz.service.ts

Fonte: [src/services/quiz.service.ts](../../../src/services/quiz.service.ts)

Caso de uso do domínio, integrando regras, persistência e efeitos associados.

Símbolos localizados: `validateQuizAnswer`, `QuizService`.

Dependências locais declaradas: `@/lib/prisma`, `./block.service`, `@/lib/learning/lesson-progress`, `@/lib/learning/catalog`, `@/lib/errors`, `@/lib/lessons/types`, `@/lib/trailsData`, `@/lib/config`, `@/lib/lessons/registry`, `./daily-quiz.service`, `./post-access.service`.

Testes associados pelo nome: [src/services/**tests**/quiz.service.test.ts](../../../src/services/__tests__/quiz.service.test.ts). Outros testes de integração podem cobrir este módulo.

## src/services/reaction.service.ts

Fonte: [src/services/reaction.service.ts](../../../src/services/reaction.service.ts)

Caso de uso do domínio, integrando regras, persistência e efeitos associados.

Símbolos localizados: `toggleReaction`, `ReactionService`.

Dependências locais declaradas: `@/lib/learning/xp-periods`, `@/lib/prisma`, `./block.service`, `@/lib/errors`, `@/lib/xp`, `@/lib/learning/rewards`, `@/lib/logger`, `./post-access.service`.

## src/services/search.service.ts

Fonte: [src/services/search.service.ts](../../../src/services/search.service.ts)

Caso de uso do domínio, integrando regras, persistência e efeitos associados.

Símbolos localizados: `searchPosts`, `searchUsers`, `SearchService`.

Dependências locais declaradas: `@/lib/prisma`, `./block.service`, `@/lib/errors`, `@/lib/logger`.

## src/services/xp.service.ts

Fonte: [src/services/xp.service.ts](../../../src/services/xp.service.ts)

Caso de uso do domínio, integrando regras, persistência e efeitos associados.

Símbolos localizados: `awardXP`, `awardXPInTransaction`, `XpService`.

Dependências locais declaradas: `@/lib/prisma`, `@/lib/xp`, `@/lib/learning/rewards`, `./notification.service`, `@/lib/logger`.

Integrações/imports externos: `@prisma/client`.

## src/test/server-only.ts

Fonte: [src/test/server-only.ts](../../../src/test/server-only.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

## src/test/setup.ts

Fonte: [src/test/setup.ts](../../../src/test/setup.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `observe`, `unobserve`, `disconnect`.

Integrações/imports externos: `@testing-library/jest-dom`, `vitest`.

## src/types/api.ts

Fonte: [src/types/api.ts](../../../src/types/api.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `CreatePostRequest`, `AuthorResponse`, `PostResponse`, `PaginatedResponse`, `SearchResultResponse`, `XPResult`, `NotificationResponse`.

Integrações/imports externos: `@prisma/client`.

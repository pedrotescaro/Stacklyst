# Páginas e contratos HTTP

Métodos extraídos das declarações exportadas, sem inventar contrato de resposta. Abra a rota para campos, códigos HTTP e permissões. Ter um middleware não elimina validações do recurso.

| Caminho                            | Métodos            | Arquivo                                                                                                           | Schemas referenciados              |
| ---------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| /api/admin/duels/maintain          | GET                | [src/app/api/admin/duels/maintain/route.ts](../../../src/app/api/admin/duels/maintain/route.ts)                   |                                    |
| /api/admin/evaluators              | GET, POST, PATCH   | [src/app/api/admin/evaluators/route.ts](../../../src/app/api/admin/evaluators/route.ts)                           | reviewSchema, moderationSchema     |
| /api/admin/metrics                 | GET                | [src/app/api/admin/metrics/route.ts](../../../src/app/api/admin/metrics/route.ts)                                 |                                    |
| /api/admin/profile-catalog         | GET, PUT           | [src/app/api/admin/profile-catalog/route.ts](../../../src/app/api/admin/profile-catalog/route.ts)                 |                                    |
| /api/admin/quiz/generate-daily     | POST               | [src/app/api/admin/quiz/generate-daily/route.ts](../../../src/app/api/admin/quiz/generate-daily/route.ts)         |                                    |
| /api/admin/reports                 | GET, DELETE        | [src/app/api/admin/reports/route.ts](../../../src/app/api/admin/reports/route.ts)                                 | deleteReportSchema                 |
| /api/admin/users                   | GET, PATCH         | [src/app/api/admin/users/route.ts](../../../src/app/api/admin/users/route.ts)                                     | updateUserRoleSchema               |
| /api/answers/[id]/accept           | POST               | [src/app/api/answers/[id]/accept/route.ts](../../../src/app/api/answers/[id]/accept/route.ts)                     |                                    |
| /api/answers/[id]/vote             | POST               | [src/app/api/answers/[id]/vote/route.ts](../../../src/app/api/answers/[id]/vote/route.ts)                         |                                    |
| /api/auth/accounts                 | GET, POST, DELETE  | [src/app/api/auth/accounts/route.ts](../../../src/app/api/auth/accounts/route.ts)                                 |                                    |
| /api/auth/callback                 | GET                | [src/app/api/auth/callback/route.ts](../../../src/app/api/auth/callback/route.ts)                                 |                                    |
| /api/auth/confirm-email            | POST               | [src/app/api/auth/confirm-email/route.ts](../../../src/app/api/auth/confirm-email/route.ts)                       | confirmEmailSchema                 |
| /api/auth/forgot-password          | POST               | [src/app/api/auth/forgot-password/route.ts](../../../src/app/api/auth/forgot-password/route.ts)                   | schema                             |
| /api/auth/logout                   | POST               | [src/app/api/auth/logout/route.ts](../../../src/app/api/auth/logout/route.ts)                                     |                                    |
| /api/auth/register                 | POST               | [src/app/api/auth/register/route.ts](../../../src/app/api/auth/register/route.ts)                                 | registerSchema                     |
| /api/auth/reset-password           | GET, POST          | [src/app/api/auth/reset-password/route.ts](../../../src/app/api/auth/reset-password/route.ts)                     |                                    |
| /api/avatar                        | PUT                | [src/app/api/avatar/route.ts](../../../src/app/api/avatar/route.ts)                                               | avatarConfigSchema                 |
| /api/certificates/[id]/pdf         | GET                | [src/app/api/certificates/[id]/pdf/route.ts](../../../src/app/api/certificates/[id]/pdf/route.ts)                 |                                    |
| /api/certificates/[id]             | GET                | [src/app/api/certificates/[id]/route.ts](../../../src/app/api/certificates/[id]/route.ts)                         |                                    |
| /api/certificates                  | GET                | [src/app/api/certificates/route.ts](../../../src/app/api/certificates/route.ts)                                   |                                    |
| /api/companies                     | GET, POST          | [src/app/api/companies/route.ts](../../../src/app/api/companies/route.ts)                                         | createCompanySchema                |
| /api/cron/security-audit           | POST               | [src/app/api/cron/security-audit/route.ts](../../../src/app/api/cron/security-audit/route.ts)                     |                                    |
| /api/duels/[id]                    | GET, PATCH, DELETE | [src/app/api/duels/[id]/route.ts](../../../src/app/api/duels/[id]/route.ts)                                       | actionSchema                       |
| /api/duels/[id]/run                | POST               | [src/app/api/duels/[id]/run/route.ts](../../../src/app/api/duels/[id]/run/route.ts)                               | runSchema                          |
| /api/duels/[id]/solution           | POST               | [src/app/api/duels/[id]/solution/route.ts](../../../src/app/api/duels/[id]/solution/route.ts)                     | submissionSchema                   |
| /api/duels/[id]/vote               | POST               | [src/app/api/duels/[id]/vote/route.ts](../../../src/app/api/duels/[id]/vote/route.ts)                             | duelVoteSchema                     |
| /api/duels/generate                | POST               | [src/app/api/duels/generate/route.ts](../../../src/app/api/duels/generate/route.ts)                               |                                    |
| /api/duels/pending-requests        | GET                | [src/app/api/duels/pending-requests/route.ts](../../../src/app/api/duels/pending-requests/route.ts)               |                                    |
| /api/duels/request                 | POST               | [src/app/api/duels/request/route.ts](../../../src/app/api/duels/request/route.ts)                                 | requestSchema                      |
| /api/duels/respond                 | POST               | [src/app/api/duels/respond/route.ts](../../../src/app/api/duels/respond/route.ts)                                 | respondSchema                      |
| /api/duels                         | GET, POST          | [src/app/api/duels/route.ts](../../../src/app/api/duels/route.ts)                                                 | quickMatchSchema, createDuelSchema |
| /api/evaluations                   | GET, POST          | [src/app/api/evaluations/route.ts](../../../src/app/api/evaluations/route.ts)                                     | evaluationSchema                   |
| /api/evaluators/apply              | POST               | [src/app/api/evaluators/apply/route.ts](../../../src/app/api/evaluators/apply/route.ts)                           | applySchema                        |
| /api/evaluators/eligibility        | GET                | [src/app/api/evaluators/eligibility/route.ts](../../../src/app/api/evaluators/eligibility/route.ts)               |                                    |
| /api/events/[id]/challenges        | GET, PUT           | [src/app/api/events/[id]/challenges/route.ts](../../../src/app/api/events/[id]/challenges/route.ts)               | eventChallengeSetSchema            |
| /api/events/[id]/participate       | POST, DELETE       | [src/app/api/events/[id]/participate/route.ts](../../../src/app/api/events/[id]/participate/route.ts)             |                                    |
| /api/events/[id]                   | GET, DELETE        | [src/app/api/events/[id]/route.ts](../../../src/app/api/events/[id]/route.ts)                                     |                                    |
| /api/events                        | GET, POST          | [src/app/api/events/route.ts](../../../src/app/api/events/route.ts)                                               | createEventSchema                  |
| /api/exercises/[exerciseId]/events | POST               | [src/app/api/exercises/[exerciseId]/events/route.ts](../../../src/app/api/exercises/[exerciseId]/events/route.ts) | eventSchema                        |
| /api/exercises/[exerciseId]/run    | POST               | [src/app/api/exercises/[exerciseId]/run/route.ts](../../../src/app/api/exercises/[exerciseId]/run/route.ts)       | attemptSchema                      |
| /api/exercises/[exerciseId]/submit | POST               | [src/app/api/exercises/[exerciseId]/submit/route.ts](../../../src/app/api/exercises/[exerciseId]/submit/route.ts) | submissionSchema                   |
| /api/health                        | GET, HEAD          | [src/app/api/health/route.ts](../../../src/app/api/health/route.ts)                                               |                                    |
| /api/jobs/[id]/applications        | GET                | [src/app/api/jobs/[id]/applications/route.ts](../../../src/app/api/jobs/[id]/applications/route.ts)               |                                    |
| /api/jobs/[id]/apply               | POST               | [src/app/api/jobs/[id]/apply/route.ts](../../../src/app/api/jobs/[id]/apply/route.ts)                             |                                    |
| /api/jobs/[id]                     | GET, PATCH         | [src/app/api/jobs/[id]/route.ts](../../../src/app/api/jobs/[id]/route.ts)                                         | updateStageSchema                  |
| /api/jobs                          | GET, POST          | [src/app/api/jobs/route.ts](../../../src/app/api/jobs/route.ts)                                                   | createJobSchema                    |
| /api/leaderboard                   | GET                | [src/app/api/leaderboard/route.ts](../../../src/app/api/leaderboard/route.ts)                                     |                                    |
| /api/lessons/[lessonId]/attempt    | POST               | [src/app/api/lessons/[lessonId]/attempt/route.ts](../../../src/app/api/lessons/[lessonId]/attempt/route.ts)       | lessonAnswerSchema                 |
| /api/messages/[id]/react           | POST               | [src/app/api/messages/[id]/react/route.ts](../../../src/app/api/messages/[id]/react/route.ts)                     |                                    |
| /api/messages/[id]                 | PATCH, DELETE      | [src/app/api/messages/[id]/route.ts](../../../src/app/api/messages/[id]/route.ts)                                 |                                    |
| /api/messages/chats                | GET                | [src/app/api/messages/chats/route.ts](../../../src/app/api/messages/chats/route.ts)                               |                                    |
| /api/messages                      | POST, GET          | [src/app/api/messages/route.ts](../../../src/app/api/messages/route.ts)                                           |                                    |
| /api/mobile/applications           | GET                | [src/app/api/mobile/applications/route.ts](../../../src/app/api/mobile/applications/route.ts)                     |                                    |
| /api/mobile/auth/bootstrap         | POST               | [src/app/api/mobile/auth/bootstrap/route.ts](../../../src/app/api/mobile/auth/bootstrap/route.ts)                 |                                    |
| /api/mobile/bookmarks              | GET                | [src/app/api/mobile/bookmarks/route.ts](../../../src/app/api/mobile/bookmarks/route.ts)                           |                                    |
| /api/mobile/companies/[id]         | PATCH              | [src/app/api/mobile/companies/[id]/route.ts](../../../src/app/api/mobile/companies/[id]/route.ts)                 | schema                             |
| /api/mobile/devices                | PUT, DELETE        | [src/app/api/mobile/devices/route.ts](../../../src/app/api/mobile/devices/route.ts)                               | schema                             |
| /api/mobile/exercises/[id]         | GET                | [src/app/api/mobile/exercises/[id]/route.ts](../../../src/app/api/mobile/exercises/[id]/route.ts)                 |                                    |
| /api/mobile/jobs/[id]              | PATCH              | [src/app/api/mobile/jobs/[id]/route.ts](../../../src/app/api/mobile/jobs/[id]/route.ts)                           | schema                             |
| /api/mobile/learning               | GET                | [src/app/api/mobile/learning/route.ts](../../../src/app/api/mobile/learning/route.ts)                             |                                    |
| /api/mobile/lessons/[id]           | GET                | [src/app/api/mobile/lessons/[id]/route.ts](../../../src/app/api/mobile/lessons/[id]/route.ts)                     |                                    |
| /api/mobile/messages               | POST, GET          | [src/app/api/mobile/messages/route.ts](../../../src/app/api/mobile/messages/route.ts)                             |                                    |
| /api/mobile/state/[key]            | GET, PUT           | [src/app/api/mobile/state/[key]/route.ts](../../../src/app/api/mobile/state/[key]/route.ts)                       | keySchema, bodySchema              |
| /api/mundinho                      | GET, POST          | [src/app/api/mundinho/route.ts](../../../src/app/api/mundinho/route.ts)                                           | arenaActionSchema, actionSchema    |
| /api/notifications/[id]            | DELETE             | [src/app/api/notifications/[id]/route.ts](../../../src/app/api/notifications/[id]/route.ts)                       |                                    |
| /api/notifications                 | GET, POST, DELETE  | [src/app/api/notifications/route.ts](../../../src/app/api/notifications/route.ts)                                 |                                    |
| /api/notifications/unread-count    | GET                | [src/app/api/notifications/unread-count/route.ts](../../../src/app/api/notifications/unread-count/route.ts)       |                                    |
| /api/onboarding                    | GET, PUT           | [src/app/api/onboarding/route.ts](../../../src/app/api/onboarding/route.ts)                                       | onboardingSchema                   |
| /api/posts/[id]/answer             | POST               | [src/app/api/posts/[id]/answer/route.ts](../../../src/app/api/posts/[id]/answer/route.ts)                         | createAnswerSchema                 |
| /api/posts/[id]/bookmark           | GET, POST          | [src/app/api/posts/[id]/bookmark/route.ts](../../../src/app/api/posts/[id]/bookmark/route.ts)                     | bookmarkSchema                     |
| /api/posts/[id]/poll               | POST               | [src/app/api/posts/[id]/poll/route.ts](../../../src/app/api/posts/[id]/poll/route.ts)                             |                                    |
| /api/posts/[id]/react              | POST               | [src/app/api/posts/[id]/react/route.ts](../../../src/app/api/posts/[id]/react/route.ts)                           |                                    |
| /api/posts/[id]/report             | POST               | [src/app/api/posts/[id]/report/route.ts](../../../src/app/api/posts/[id]/report/route.ts)                         |                                    |
| /api/posts/[id]                    | GET, PATCH, DELETE | [src/app/api/posts/[id]/route.ts](../../../src/app/api/posts/[id]/route.ts)                                       |                                    |
| /api/posts/[id]/vote               | POST               | [src/app/api/posts/[id]/vote/route.ts](../../../src/app/api/posts/[id]/vote/route.ts)                             |                                    |
| /api/posts/media/[id]              | GET                | [src/app/api/posts/media/[id]/route.ts](../../../src/app/api/posts/media/[id]/route.ts)                           |                                    |
| /api/posts/media                   | POST               | [src/app/api/posts/media/route.ts](../../../src/app/api/posts/media/route.ts)                                     |                                    |
| /api/posts                         | GET, POST          | [src/app/api/posts/route.ts](../../../src/app/api/posts/route.ts)                                                 | createPostSchema                   |
| /api/presence                      | GET, POST          | [src/app/api/presence/route.ts](../../../src/app/api/presence/route.ts)                                           |                                    |
| /api/profile/[username]/activity   | GET                | [src/app/api/profile/[username]/activity/route.ts](../../../src/app/api/profile/[username]/activity/route.ts)     |                                    |
| /api/profile/[username]/media      | GET                | [src/app/api/profile/[username]/media/route.ts](../../../src/app/api/profile/[username]/media/route.ts)           |                                    |
| /api/profile/[username]/replies    | GET                | [src/app/api/profile/[username]/replies/route.ts](../../../src/app/api/profile/[username]/replies/route.ts)       |                                    |
| /api/profile/[username]            | GET                | [src/app/api/profile/[username]/route.ts](../../../src/app/api/profile/[username]/route.ts)                       |                                    |
| /api/profile/achievements          | GET                | [src/app/api/profile/achievements/route.ts](../../../src/app/api/profile/achievements/route.ts)                   |                                    |
| /api/profile/customization         | GET, PUT           | [src/app/api/profile/customization/route.ts](../../../src/app/api/profile/customization/route.ts)                 |                                    |
| /api/profile/music/resolve         | POST               | [src/app/api/profile/music/resolve/route.ts](../../../src/app/api/profile/music/resolve/route.ts)                 |                                    |
| /api/profile/music/search          | GET                | [src/app/api/profile/music/search/route.ts](../../../src/app/api/profile/music/search/route.ts)                   |                                    |
| /api/profile/tags                  | GET                | [src/app/api/profile/tags/route.ts](../../../src/app/api/profile/tags/route.ts)                                   |                                    |
| /api/profile/update                | POST               | [src/app/api/profile/update/route.ts](../../../src/app/api/profile/update/route.ts)                               |                                    |
| /api/quiz/[id]/attempt             | POST               | [src/app/api/quiz/[id]/attempt/route.ts](../../../src/app/api/quiz/[id]/attempt/route.ts)                         | quizAttemptSchema                  |
| /api/quiz/[id]                     | GET                | [src/app/api/quiz/[id]/route.ts](../../../src/app/api/quiz/[id]/route.ts)                                         |                                    |
| /api/quiz/daily                    | GET                | [src/app/api/quiz/daily/route.ts](../../../src/app/api/quiz/daily/route.ts)                                       |                                    |
| /api/quiz/reset-level              | POST               | [src/app/api/quiz/reset-level/route.ts](../../../src/app/api/quiz/reset-level/route.ts)                           | resetLevelSchema                   |
| /api/quiz/weekly-activity          | GET                | [src/app/api/quiz/weekly-activity/route.ts](../../../src/app/api/quiz/weekly-activity/route.ts)                   |                                    |
| /api/run                           | POST               | [src/app/api/run/route.ts](../../../src/app/api/run/route.ts)                                                     | runSchema                          |
| /api/search                        | GET                | [src/app/api/search/route.ts](../../../src/app/api/search/route.ts)                                               |                                    |
| /api/trails/checkpoint             | POST               | [src/app/api/trails/checkpoint/route.ts](../../../src/app/api/trails/checkpoint/route.ts)                         | schema                             |
| /api/trails/chest                  | POST               | [src/app/api/trails/chest/route.ts](../../../src/app/api/trails/chest/route.ts)                                   |                                    |
| /api/trails/course-preferences     | PUT                | [src/app/api/trails/course-preferences/route.ts](../../../src/app/api/trails/course-preferences/route.ts)         | coursePreferencesSchema            |
| /api/trails/jump                   | POST               | [src/app/api/trails/jump/route.ts](../../../src/app/api/trails/jump/route.ts)                                     | jumpSchema                         |
| /api/upload                        | POST               | [src/app/api/upload/route.ts](../../../src/app/api/upload/route.ts)                                               |                                    |
| /api/users/[id]/block              | POST, DELETE       | [src/app/api/users/[id]/block/route.ts](../../../src/app/api/users/[id]/block/route.ts)                           |                                    |
| /api/users/[id]/follow             | POST, PUT          | [src/app/api/users/[id]/follow/route.ts](../../../src/app/api/users/[id]/follow/route.ts)                         |                                    |
| /api/users/[id]/followers          | GET                | [src/app/api/users/[id]/followers/route.ts](../../../src/app/api/users/[id]/followers/route.ts)                   |                                    |
| /api/users/[id]/following          | GET                | [src/app/api/users/[id]/following/route.ts](../../../src/app/api/users/[id]/following/route.ts)                   |                                    |
| /api/users/blocked                 | GET                | [src/app/api/users/blocked/route.ts](../../../src/app/api/users/blocked/route.ts)                                 |                                    |
| /api/users/me                      | GET                | [src/app/api/users/me/route.ts](../../../src/app/api/users/me/route.ts)                                           |                                    |
| /api/users/search                  | GET                | [src/app/api/users/search/route.ts](../../../src/app/api/users/search/route.ts)                                   |                                    |
| /api/users/suggestions             | GET                | [src/app/api/users/suggestions/route.ts](../../../src/app/api/users/suggestions/route.ts)                         |                                    |

## Páginas

| Rota de arquivo        | Fonte                                                                                     |
| ---------------------- | ----------------------------------------------------------------------------------------- |
| /about                 | [src/app/about/page.tsx](../../../src/app/about/page.tsx)                                 |
| /achievements          | [src/app/achievements/page.tsx](../../../src/app/achievements/page.tsx)                   |
| /admin                 | [src/app/admin/page.tsx](../../../src/app/admin/page.tsx)                                 |
| /admin/profile-catalog | [src/app/admin/profile-catalog/page.tsx](../../../src/app/admin/profile-catalog/page.tsx) |
| /avatar                | [src/app/avatar/page.tsx](../../../src/app/avatar/page.tsx)                               |
| /bookmarks             | [src/app/bookmarks/page.tsx](../../../src/app/bookmarks/page.tsx)                         |
| /certificates/[id]     | [src/app/certificates/[id]/page.tsx](../../../src/app/certificates/[id]/page.tsx)         |
| /certificates          | [src/app/certificates/page.tsx](../../../src/app/certificates/page.tsx)                   |
| /check-email           | [src/app/check-email/page.tsx](../../../src/app/check-email/page.tsx)                     |
| /duels/[id]            | [src/app/duels/[id]/page.tsx](../../../src/app/duels/[id]/page.tsx)                       |
| /duels                 | [src/app/duels/page.tsx](../../../src/app/duels/page.tsx)                                 |
| /evaluations           | [src/app/evaluations/page.tsx](../../../src/app/evaluations/page.tsx)                     |
| /evaluators/apply      | [src/app/evaluators/apply/page.tsx](../../../src/app/evaluators/apply/page.tsx)           |
| /events                | [src/app/events/page.tsx](../../../src/app/events/page.tsx)                               |
| /explore               | [src/app/explore/page.tsx](../../../src/app/explore/page.tsx)                             |
| /feed                  | [src/app/feed/page.tsx](../../../src/app/feed/page.tsx)                                   |
| /forgot-password       | [src/app/forgot-password/page.tsx](../../../src/app/forgot-password/page.tsx)             |
| /guidelines            | [src/app/guidelines/page.tsx](../../../src/app/guidelines/page.tsx)                       |
| /jobs/[id]             | [src/app/jobs/[id]/page.tsx](../../../src/app/jobs/[id]/page.tsx)                         |
| /jobs                  | [src/app/jobs/page.tsx](../../../src/app/jobs/page.tsx)                                   |
| /knowledge             | [src/app/knowledge/page.tsx](../../../src/app/knowledge/page.tsx)                         |
| /leaderboard           | [src/app/leaderboard/page.tsx](../../../src/app/leaderboard/page.tsx)                     |
| /lesson/[lessonId]     | [src/app/lesson/[lessonId]/page.tsx](../../../src/app/lesson/[lessonId]/page.tsx)         |
| /login                 | [src/app/login/page.tsx](../../../src/app/login/page.tsx)                                 |
| /messages              | [src/app/messages/page.tsx](../../../src/app/messages/page.tsx)                           |
| /notifications         | [src/app/notifications/page.tsx](../../../src/app/notifications/page.tsx)                 |
| /onboarding            | [src/app/onboarding/page.tsx](../../../src/app/onboarding/page.tsx)                       |
| /                      | [src/app/page.tsx](../../../src/app/page.tsx)                                             |
| /personalize           | [src/app/personalize/page.tsx](../../../src/app/personalize/page.tsx)                     |
| /post/[id]             | [src/app/post/[id]/page.tsx](../../../src/app/post/[id]/page.tsx)                         |
| /privacy               | [src/app/privacy/page.tsx](../../../src/app/privacy/page.tsx)                             |
| /profile/[username]    | [src/app/profile/[username]/page.tsx](../../../src/app/profile/[username]/page.tsx)       |
| /ranking               | [src/app/ranking/page.tsx](../../../src/app/ranking/page.tsx)                             |
| /recruiter             | [src/app/recruiter/page.tsx](../../../src/app/recruiter/page.tsx)                         |
| /register              | [src/app/register/page.tsx](../../../src/app/register/page.tsx)                           |
| /reset-password        | [src/app/reset-password/page.tsx](../../../src/app/reset-password/page.tsx)               |
| /settings              | [src/app/settings/page.tsx](../../../src/app/settings/page.tsx)                           |
| /terms                 | [src/app/terms/page.tsx](../../../src/app/terms/page.tsx)                                 |
| /trails                | [src/app/trails/page.tsx](../../../src/app/trails/page.tsx)                               |

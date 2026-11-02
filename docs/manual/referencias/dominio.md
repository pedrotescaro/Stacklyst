# Código: dominio

[Índice](README.md) · [Manual](../README.md)

## src/lib/answer-threads.ts

Fonte: [src/lib/answer-threads.ts](../../../src/lib/answer-threads.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `buildAnswerThreads`, `AnswerThread`.

Comentários de contrato presentes na fonte:

> Assemble every reply while leaving visual indentation to the client.

Testes associados pelo nome: [src/lib/**tests**/answer-threads.test.ts](../../../src/lib/__tests__/answer-threads.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/api-handler.ts

Fonte: [src/lib/api-handler.ts](../../../src/lib/api-handler.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `apiHandler`, `RateLimitStore`, `rateLimitStorage`, `ApiContext`.

Dependências locais declaradas: `./errors`, `./logger`, `./auth`.

Integrações/imports externos: `next/server`, `node:async_hooks`, `zod`.

Testes associados pelo nome: [src/lib/**tests**/api-handler.test.ts](../../../src/lib/__tests__/api-handler.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/auth-session.ts

Fonte: [src/lib/auth-session.ts](../../../src/lib/auth-session.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `getAuthUserId`, `getAuthIdentity`.

Dependências locais declaradas: `@/lib/supabase/bearer`, `@/lib/supabase/server`, `@/lib/errors`, `@/lib/jwt`, `@/lib/logger`, `@/lib/connection-errors`, `@/lib/supabase/auth-errors`, `@/lib/supabase/env`.

Integrações/imports externos: `react`, `next/headers`.

Comentários de contrato presentes na fonte:

> Resolve a verified Supabase user ID without loading application data.

> The public landing page only needs to know whether a session exists. Auth or
> database outages must not make the marketing page unavailable.

Testes associados pelo nome: [src/lib/**tests**/auth-session.test.ts](../../../src/lib/__tests__/auth-session.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/auth.ts

Fonte: [src/lib/auth.ts](../../../src/lib/auth.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `fetchUserViaPrisma`, `fetchUserViaRest`, `findUserWithFallback`, `syncUserStreaks`, `requireAuth`, `requireOwnership`, `requireRole`, `requireAdmin`, `requireEvaluator`, `requireRecruiter`, `getAuthUser`.

Dependências locais declaradas: `@/lib/auth-session`, `@/lib/prisma`, `@/lib/supabase/admin`, `@/lib/errors`, `@/lib/logger`, `@/lib/connection-errors`, `@/lib/streak`.

Integrações/imports externos: `react`.

Comentários de contrato presentes na fonte:

> Fetch a user through the direct PostgreSQL connection.

> Fetch a user through the Supabase Data API on port 443. This is the fallback
> for networks that temporarily cannot reach the PostgreSQL pooler.

> Try PostgreSQL first and fail over to HTTPS only for transient errors.

> Resolve the authenticated application user.

Supabase verified claims remain authoritative and keep refresh-token rotation
working. The secondary JWT is accepted only for a temporary Auth/network
failure, never for an invalid, missing, expired or revoked session.

> Keep aggregate streak fields synchronized without blocking the request.

## src/lib/avatar.ts

Fonte: [src/lib/avatar.ts](../../../src/lib/avatar.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `hashUsername`, `getDefaultAvatarConfig`, `normalizeAvatarConfig`, `SKIN_TONES`, `HAIR_COLORS`, `OUTFIT_COLORS`, `AVATAR_BACKGROUNDS`, `avatarConfigSchema`, `AvatarConfig`.

Integrações/imports externos: `zod`.

Testes associados pelo nome: [src/lib/**tests**/avatar.test.ts](../../../src/lib/__tests__/avatar.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/brand-geometry.ts

Fonte: [src/lib/brand-geometry.ts](../../../src/lib/brand-geometry.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `brandGeometry`.

## src/lib/cache.ts

Fonte: [src/lib/cache.ts](../../../src/lib/cache.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `cacheGet`, `cacheSet`, `cacheDelete`, `cacheDeleteByPrefix`, `with`, `withCache`.

Comentários de contrato presentes na fonte:

> Lightweight in-memory cache with TTL support.

Used for hot paths like daily quiz, leaderboard, and user profiles.
Falls back gracefully when Redis is not configured.

For production with high traffic, swap the Map for Upstash Redis GET/SET
with TTL — the interface stays the same.

> Get a cached value by key. Returns null if expired or missing.

> Set a cached value with a TTL in seconds.

> Invalidate a specific cache key.

> Invalidate all keys matching a prefix.
> Useful for "invalidate all user profile caches" patterns.

> Wrap an async function with caching.
> If the key has a valid cache hit, returns cached value.
> Otherwise calls the function, caches the result, and returns it.

Testes associados pelo nome: [src/lib/**tests**/cache.test.ts](../../../src/lib/__tests__/cache.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/chat-conversations.ts

Fonte: [src/lib/chat-conversations.ts](../../../src/lib/chat-conversations.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `createConversation`, `resolveProfileConversation`, `ChatItem`.

Comentários de contrato presentes na fonte:

> Resolve profile links without sending a message or creating a server record.

Testes associados pelo nome: [src/lib/**tests**/chat-conversations.test.ts](../../../src/lib/__tests__/chat-conversations.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/checkpointData.ts

Fonte: [src/lib/checkpointData.ts](../../../src/lib/checkpointData.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `filtrarMaiores`, `somarDobroPares`, `criarContador`, `contarFrequencia`, `parseJSONSeguro`, `identidade`, `ehNumero`, `obterPropriedade`, `formatarResposta`, `primeiroItem`, `CheckpointChallenge`, `CheckpointData`, `CHECKPOINTS_DATA`, `constructor`, `depositar`, `sacar`, `add`, `runAll`, `on`, `emit`.

Integrações/imports externos: `errors`.

## src/lib/client/current-user.ts

Fonte: [src/lib/client/current-user.ts](../../../src/lib/client/current-user.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `wait`, `reportConnectionState`, `browserSessionIsValid`, `requestCurrentUser`, `getCurrentUser`, `invalidateCurrentUser`.

Dependências locais declaradas: `@/lib/supabase/client`.

Testes associados pelo nome: [src/lib/client/**tests**/current-user.test.ts](../../../src/lib/client/__tests__/current-user.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/client/post-bookmarks.ts

Fonte: [src/lib/client/post-bookmarks.ts](../../../src/lib/client/post-bookmarks.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `readPostBookmark`, `writePostBookmark`, `POST_BOOKMARK_CHANGED`, `PostBookmarkChange`.

## src/lib/cn.ts

Fonte: [src/lib/cn.ts](../../../src/lib/cn.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `cn`.

## src/lib/code-execution/javascript-sandbox.ts

Fonte: [src/lib/code-execution/javascript-sandbox.ts](../../../src/lib/code-execution/javascript-sandbox.ts)

Módulo restrito ao servidor; regras ou infraestrutura não devem entrar no bundle do navegador.

Símbolos localizados: `getQuickJsModule`, `formatOutputValue`, `appendOutput`, `exposeOutputApi`, `exposeTimerApi`, `executionError`, `disposeSafely`, `runJavaScriptInSandbox`.

Dependências locais declaradas: `@/lib/code-execution/server`, `@/lib/logger`.

Integrações/imports externos: `server-only`, `@jitl/quickjs-singlefile-browser-release-sync`, `quickjs-emscripten-core`.

Testes associados pelo nome: [src/lib/code-execution/javascript-sandbox.test.ts](../../../src/lib/code-execution/javascript-sandbox.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/code-execution/server.ts

Fonte: [src/lib/code-execution/server.ts](../../../src/lib/code-execution/server.ts)

Módulo restrito ao servidor; regras ou infraestrutura não devem entrar no bundle do navegador.

Símbolos localizados: `cleanJvmWarnings`, `indent`, `prepareCode`, `runOnJudge0`, `runOnWandbox`, `executeCode`, `ServerExecutionResult`.

Dependências locais declaradas: `@/lib/config`, `@/lib/code-execution/javascript-sandbox`.

Integrações/imports externos: `server-only`, `typescript`, `fmt`.

Testes associados pelo nome: [src/lib/code-execution/server.test.ts](../../../src/lib/code-execution/server.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/code-runner.ts

Fonte: [src/lib/code-runner.ts](../../../src/lib/code-runner.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `runCodeInSandbox`, `CodeRunResult`.

Testes associados pelo nome: [src/lib/**tests**/code-runner.test.ts](../../../src/lib/__tests__/code-runner.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/config.ts

Fonte: [src/lib/config.ts](../../../src/lib/config.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `resolveJwtSecret`, `jwtExpirationToSeconds`, `AVATAR_API_URL`, `WANDBOX_API_URL`, `GITHUB_API_URL`, `XP_LEVEL_THRESHOLDS`, `XP_LEVEL_6_BASE`, `XP_LEVEL_6_INCREMENT`, `XP_LEVEL_INCREMENT_GROWTH`, `XP_QUIZ_CORRECT`, `XP_POST_QUESTION`, `XP_POST_ANSWER`, `XP_PER_LEVEL_DISPLAY`, `BADGE_STREAK_7_DAYS`, `BADGE_STREAK_30_DAYS`, `BADGE_ACCEPTED_ANSWERS`, `BADGE_QUIZ_MASTER_CORRECT`, `DEFAULT_LANGUAGE_TRAILS`, `WandboxLanguageConfig`, `WANDBOX_LANGUAGES`, `JUDGE0_API_URL`, `JUDGE0_LANGUAGES`, `WANDBOX_RUN_TIMEOUT_MS`, `RATE_LIMIT_REGISTER`, `RATE_LIMIT_CODE_RUN`, `RATE_LIMIT_POST_CREATE`, `RATE_LIMIT_AI_CHAT`, `RATE_LIMIT_AI_REPOSITORY`, `RATE_LIMIT_AI_GLOBAL`, `RATE_LIMIT_AI_REPOSITORY_GLOBAL`, `AI_CHAT_HISTORY_MESSAGES`, `AI_CHAT_MESSAGE_CHARACTERS`, `POST_CHAR_LIMIT`, `VIEW_COUNT_ABBREVIATION_THRESHOLD`, `CACHE_TTL_DAILY_QUIZ`, `CACHE_TTL_LEADERBOARD`, `CACHE_TTL_USER_PROFILE`, `FALLBACK_QUIZZES`, `HERO_CODE_IMAGES`, `HERO_AVATAR_IMAGES`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `JWT_COOKIE_NAME`, `JWT_COOKIE_OPTIONS`.

Comentários de contrato presentes na fonte:

> Centralized configuration for Stacklyst.

All magic numbers, thresholds, URLs, and constants that were previously
hardcoded are extracted here. Values can be overridden via environment
variables when needed, with sensible defaults for development.

> Increment per level beyond level 5. Starts at 600 and grows by 100 each level.

> XP amount for a correct quiz answer.

> XP amount for posting a question.

> XP amount for posting an answer.

> XP per level bracket used in UI for "Lvl X" display.

> Maximum conversation context forwarded to an AI provider per request.

> Character limit for post content.

> View count threshold for abbreviated display (e.g., "1 mil").

> Resolve the JWT secret key.

- In production, MUST be set via JWT_SECRET env var (use `openssl rand -hex 32` to generate).
- In development, falls back to a deterministic dev-only key.

⚠️ Never run in production without setting this env var.

> JWT token expiration time. Default: 7 days.

> JWT cookie name used for the secondary auth token.

> Cookie configuration for the JWT token.

## src/lib/connection-errors.ts

Fonte: [src/lib/connection-errors.ts](../../../src/lib/connection-errors.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `isTransientConnectionError`, `getErrorSummary`.

Comentários de contrato presentes na fonte:

> Identifies infrastructure failures that may succeed on a retry or fallback.
> Authentication/validation errors intentionally do not match this helper.

Testes associados pelo nome: [src/lib/**tests**/connection-errors.test.ts](../../../src/lib/__tests__/connection-errors.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/copy.ts

Fonte: [src/lib/copy.ts](../../../src/lib/copy.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `COPY`.

## src/lib/credentials/badge-art.ts

Fonte: [src/lib/credentials/badge-art.ts](../../../src/lib/credentials/badge-art.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `credentialBadgePalette`, `credentialBadgeRibbon`, `credentialBadgeIdPrefix`, `escapeXml`, `credentialBadgeTitle`, `renderCredentialBadgeContents`, `renderCredentialBadgeSvg`, `credentialBadgePaths`, `credentialLaurelLeaves`, `CredentialBadgeSvgOptions`.

Dependências locais declaradas: `./language-logos`.

Comentários de contrato presentes na fonte:

> Shared vector paths for the credential badge and the printed certificate seal.

> Supply a distinct prefix when multiple SVG badges share a document.

> Only local, reviewed vector data enters this markup; all caller text is escaped separately.

> Pure standalone badge renderer shared by the browser and offline certificate/PDF output.

Testes associados pelo nome: [src/lib/credentials/**tests**/badge-art.test.ts](../../../src/lib/credentials/__tests__/badge-art.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/credentials/catalog.ts

Fonte: [src/lib/credentials/catalog.ts](../../../src/lib/credentials/catalog.ts)

Contratos, validação ou catálogo do domínio; distinguir tipos estáticos de validação runtime.

Símbolos localizados: `lessonCheck`, `minutes`, `goal`, `buildCredentialCatalog`, `credentialGoalProgress`, `firstLessonGoal`, `CREDENTIAL_VERSION`, `CredentialCheck`, `CredentialGoal`, `CredentialExercise`, `CredentialPath`, `credentialLanguage`.

Dependências locais declaradas: `@/lib/learning/catalog`, `@/lib/lessons/registry`, `@/lib/lessons/types`, `@/app/trails/trailCurriculum`, `./types`.

Integrações/imports externos: `server-only`.

Comentários de contrato presentes na fonte:

> Every source is an exact catalog lookup. UI title inference and fallback paths never grant awards.

Testes associados pelo nome: [src/lib/credentials/**tests**/catalog.test.ts](../../../src/lib/credentials/__tests__/catalog.test.ts), [src/lib/learning/**tests**/catalog.test.ts](../../../src/lib/learning/__tests__/catalog.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/credentials/integrity.ts

Fonte: [src/lib/credentials/integrity.ts](../../../src/lib/credentials/integrity.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `canonicalCredentialJson`, `createCredentialHash`, `verifyCredentialIntegrity`.

Dependências locais declaradas: `./types`.

Integrações/imports externos: `node:crypto`.

Comentários de contrato presentes na fonte:

> Stable object-key ordering; arrays retain their authored requirement order.

Testes associados pelo nome: [src/lib/credentials/**tests**/integrity.test.ts](../../../src/lib/credentials/__tests__/integrity.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/credentials/language-logos.ts

Fonte: [src/lib/credentials/language-logos.ts](../../../src/lib/credentials/language-logos.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `credentialLanguageLogo`, `credentialLanguageLogos`, `credentialFallbackLogo`.

Comentários de contrato presentes na fonte:

> Trusted inline geometry copied from the installed Devicon 2.17.0 SVG assets.
> Devicon: Copyright (c) 2015 konpa, MIT. Full notice: public/languages/LICENSE-devicon.
> The Stacklyst fallback is the product's existing public/brand/monogram.svg.
> Keep paths and original colors intact. IDs are namespaced when rendering each badge.

## src/lib/credentials/pdf.ts

Fonte: [src/lib/credentials/pdf.ts](../../../src/lib/credentials/pdf.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `color`, `loadAssets`, `cleanText`, `wrapText`, `fittedText`, `centerText`, `loadBadge`, `drawBadge`, `dateLabel`, `estimatedWorkload`, `renderCredentialPdf`.

Dependências locais declaradas: `@/lib/brand-geometry`, `@/lib/credentials/types`, `@/lib/credentials/badge-art`.

Integrações/imports externos: `node:fs/promises`, `node:path`, `pdf-lib`, `@pdf-lib/fontkit`, `qrcode`, `sharp`.

Comentários de contrato presentes na fonte:

> A visual issuer signature accompanies an independently verifiable credential record.

Testes associados pelo nome: [src/lib/credentials/pdf.test.ts](../../../src/lib/credentials/pdf.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/credentials/repository.ts

Fonte: [src/lib/credentials/repository.ts](../../../src/lib/credentials/repository.ts)

Consultas e persistência do domínio; conferir transações e controle de acesso.

Símbolos localizados: `publicRecord`, `reconcileCredentialsInTransaction`, `reconcileCredentials`, `getEarnedCredentials`, `getPublicCredential`, `getCredentialCollection`.

Dependências locais declaradas: `@/lib/prisma`, `@/lib/errors`, `@/lib/learning/transaction`, `./catalog`, `./types`, `./integrity`.

Integrações/imports externos: `server-only`, `node:crypto`, `@prisma/client`.

Comentários de contrato presentes na fonte:

> The caller holds learning:<userId>'s transaction lock when granting credentials.

> Public profile reads never grant certificates or modify progress.

Testes associados pelo nome: [src/lib/credentials/**tests**/repository.test.ts](../../../src/lib/credentials/__tests__/repository.test.ts), [src/lib/mundinho/**tests**/repository.test.ts](../../../src/lib/mundinho/__tests__/repository.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/credentials/types.ts

Fonte: [src/lib/credentials/types.ts](../../../src/lib/credentials/types.ts)

Contratos, validação ou catálogo do domínio; distinguir tipos estáticos de validação runtime.

Símbolos localizados: `CREDENTIAL_LANGUAGES`, `CredentialLanguage`, `CREDENTIAL_KINDS`, `CredentialKind`, `credentialRequirementSchema`, `credentialDefinitionSchema`, `CredentialRequirement`, `CredentialDefinition`, `credentialSnapshotSchema`, `CredentialSnapshot`, `CredentialRecord`, `CredentialCollection`.

Integrações/imports externos: `zod`.

## src/lib/credentials/urls.ts

Fonte: [src/lib/credentials/urls.ts](../../../src/lib/credentials/urls.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `credentialVerificationUrl`.

Comentários de contrato presentes na fonte:

> Use a trusted configured origin; certificate links must not trust a request Host header.

## src/lib/date.ts

Fonte: [src/lib/date.ts](../../../src/lib/date.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `toDate`, `formatAbsoluteDate`, `formatRelativeTime`, `DateInput`.

Testes associados pelo nome: [src/lib/**tests**/date.test.ts](../../../src/lib/__tests__/date.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/duel-challenge-generator.ts

Fonte: [src/lib/duel-challenge-generator.ts](../../../src/lib/duel-challenge-generator.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `isAnagram`, `factorial`, `sumDigits`, `findMax`, `isPrime`, `isValidParentheses`, `maxSubArray`, `binarySearch`, `compressString`, `mergeIntervals`, `lengthOfLongestSubstring`, `generateProceduralDuelProblem`, `ChallengeTemplate`, `CHALLENGE_LIBRARY`.

Dependências locais declaradas: `./duel-problems`, `./duel-extra-challenges`.

Comentários de contrato presentes na fonte:

> Procedural challenge generator when no external AI provider is configured
> or when the AI provider times out/fails.

Testes associados pelo nome: [src/lib/duel-challenge-generator.test.ts](../../../src/lib/duel-challenge-generator.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/duel-extra-challenges.ts

Fonte: [src/lib/duel-extra-challenges.ts](../../../src/lib/duel-extra-challenges.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `template`, `EXTRA_DUEL_CHALLENGES`.

Dependências locais declaradas: `./duel-challenge-generator`.

## src/lib/duel-problems.ts

Fonte: [src/lib/duel-problems.ts](../../../src/lib/duel-problems.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `reverseString`, `twoSum`, `isPalindrome`, `fizzBuzz`, `countVowels`, `getDuelProblemById`, `getRandomDuelProblem`, `buildTestHarness`, `scope`, `parseProblemFromJson`, `DuelTestCase`, `DuelProblem`, `DUEL_PROBLEMS`, `DuelHarnessMarkers`.

Comentários de contrato presentes na fonte:

> Try to parse a `problem_body` string as a serialised DuelProblem.
> Returns `null` when the string is not valid JSON or doesn't match the shape.

Testes associados pelo nome: [src/lib/**tests**/duel-problems.test.ts](../../../src/lib/__tests__/duel-problems.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/duels/complexity.ts

Fonte: [src/lib/duels/complexity.ts](../../../src/lib/duels/complexity.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `complexityRank`, `estimateCodeComplexity`, `text`, `walk`, `scoreComplexity`, `ComplexityClass`, `ComplexityEstimate`.

Dependências locais declaradas: `./source-analysis`.

Integrações/imports externos: `@prisma/client`, `@lezer/common`.

Comentários de contrato presentes na fonte:

> Structural upper-bound heuristic, never a formal Big-O proof. Parse real syntax
> (including unbraced loops, comprehensions and strings containing comment signs).
> Opaque calls/recursion stay low confidence and cannot decide a duel by Big-O.

> Legacy diagnostic field; no longer added to correctness or used as match score.

Testes associados pelo nome: [src/lib/duels/**tests**/complexity.test.ts](../../../src/lib/duels/__tests__/complexity.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/duels/constants.ts

Fonte: [src/lib/duels/constants.ts](../../../src/lib/duels/constants.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `DUEL_TIME_LIMIT_SECONDS`, `DUEL_REQUEST_TIMEOUT_SECONDS`, `PUBLIC_DUEL_MATCH_WINDOW_SECONDS`, `MAX_CONSECUTIVE_DUEL_ABANDONS`, `DUEL_ABANDON_COOLDOWN_HOURS`, `PENDING_DUEL_POLL_INTERVAL_MS`, `ACTIVE_DUEL_POLL_INTERVAL_MS`.

## src/lib/duels/function-name.ts

Fonte: [src/lib/duels/function-name.ts](../../../src/lib/duels/function-name.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `toPythonFunctionName`, `escapeRegExp`, `findContestantFunctionName`, `adaptTestsToContestantFunction`, `DuelJudgeLanguage`.

Dependências locais declaradas: `@/lib/duel-problems`.

Integrações/imports externos: `typescript`.

Testes associados pelo nome: [src/lib/duels/**tests**/function-name.test.ts](../../../src/lib/duels/__tests__/function-name.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/duels/invitations.ts

Fonte: [src/lib/duels/invitations.ts](../../../src/lib/duels/invitations.ts)

Módulo restrito ao servidor; regras ou infraestrutura não devem entrar no bundle do navegador.

Símbolos localizados: `expireDuelInvitations`, `ExpiredInvitationResult`.

Dependências locais declaradas: `@/lib/prisma`, `@/lib/duel-problems`, `@/lib/duels/problems`, `@/lib/duels/constants`.

Integrações/imports externos: `server-only`.

## src/lib/duels/judge.ts

Fonte: [src/lib/duels/judge.ts](../../../src/lib/duels/judge.ts)

Módulo restrito ao servidor; regras ou infraestrutura não devem entrar no bundle do navegador.

Símbolos localizados: `test`, `isSupportedDuelLanguage`, `executionLanguage`, `executableContestantCode`, `parseResults`, `failureStatus`, `judgeDuelCode`, `judgeDuelSubmission`, `unavailableResult`, `SUPPORTED_DUEL_LANGUAGES`, `PublicDuelTestResult`, `JudgedSubmission`.

Dependências locais declaradas: `@/lib/code-execution/server`, `@/lib/duel-problems`, `@/lib/duels/complexity`, `@/lib/duels/function-name`, `@/lib/duels/problems`.

Integrações/imports externos: `server-only`, `node:crypto`, `@prisma/client`, `typescript`.

Testes associados pelo nome: [src/lib/duels/**tests**/judge.test.ts](../../../src/lib/duels/__tests__/judge.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/duels/lifecycle.ts

Fonte: [src/lib/duels/lifecycle.ts](../../../src/lib/duels/lifecycle.ts)

Módulo restrito ao servidor; regras ou infraestrutura não devem entrar no bundle do navegador.

Símbolos localizados: `runDuelMaintenance`, `DuelMaintenanceResult`.

Dependências locais declaradas: `@/lib/prisma`, `@/lib/duels/resolution`, `@/lib/duels/constants`, `@/lib/duels/invitations`.

Integrações/imports externos: `server-only`.

## src/lib/duels/listing.ts

Fonte: [src/lib/duels/listing.ts](../../../src/lib/duels/listing.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `getDuelListingWhere`, `isDuelVisibleInListing`, `getDuelListingExpiryAt`, `RECENTLY_FINISHED_DUEL_WINDOW_MS`, `OPEN_DUEL_STATUSES`.

Integrações/imports externos: `@prisma/client`.

Testes associados pelo nome: [src/lib/duels/**tests**/listing.test.ts](../../../src/lib/duels/__tests__/listing.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/duels/participation-policy.ts

Fonte: [src/lib/duels/participation-policy.ts](../../../src/lib/duels/participation-policy.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `getAbandonmentUpdate`, `getDuelCooldownMessage`.

Dependências locais declaradas: `@/lib/duels/constants`.

## src/lib/duels/problems.ts

Fonte: [src/lib/duels/problems.ts](../../../src/lib/duels/problems.ts)

Módulo restrito ao servidor; regras ou infraestrutura não devem entrar no bundle do navegador.

Símbolos localizados: `getTrustedDuelProblem`, `findTrustedDuelProblemByTitle`, `serializePublicDuelProblem`, `getTrustedDuelProblemIds`.

Dependências locais declaradas: `@/lib/duel-challenge-generator`, `@/lib/duel-problems`.

Integrações/imports externos: `server-only`.

## src/lib/duels/resolution-policy.ts

Fonte: [src/lib/duels/resolution-policy.ts](../../../src/lib/duels/resolution-policy.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `metrics`, `valid`, `correctness`, `compareEfficiency`, `chooseBestDuelSubmission`, `decideDuelResolution`, `DUEL_POLICY_VERSION`, `ComparableSubmission`, `DuelResolutionDecision`.

Dependências locais declaradas: `./complexity`, `./source-analysis`.

Integrações/imports externos: `@prisma/client`.

Testes associados pelo nome: [src/lib/duels/**tests**/resolution-policy.test.ts](../../../src/lib/duels/__tests__/resolution-policy.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/duels/resolution.ts

Fonte: [src/lib/duels/resolution.ts](../../../src/lib/duels/resolution.ts)

Módulo restrito ao servidor; regras ou infraestrutura não devem entrar no bundle do navegador.

Símbolos localizados: `resolveDuelIfReady`, `resolveDuelAtDeadline`, `reconcileDuelReview`, `persistResolution`, `awardDuelWinnerXP`.

Dependências locais declaradas: `@/lib/prisma`, `@/lib/xp`, `@/lib/duels/resolution-policy`, `@/lib/duels/participation-policy`, `@/lib/evaluators/notifications`.

Integrações/imports externos: `server-only`, `@prisma/client`.

Comentários de contrato presentes na fonte:

> Adopt the current policy for legacy pending ties only. Human decisions and
> already closed results remain immutable. The status/reason CAS below permits
> retries across workers without duplicate XP or requests.

## src/lib/duels/result-presentation.ts

Fonte: [src/lib/duels/result-presentation.ts](../../../src/lib/duels/result-presentation.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `duelResultExplanation`.

Comentários de contrato presentes na fonte:

> Public explanation only: no opponent source or hidden test inputs.

## src/lib/duels/source-analysis.ts

Fonte: [src/lib/duels/source-analysis.ts](../../../src/lib/duels/source-analysis.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `duelSourceTree`, `analyzeDuelSource`, `visit`.

Integrações/imports externos: `@codemirror/lang-javascript`, `@codemirror/lang-python`, `@lezer/common`.

Comentários de contrato presentes na fonte:

> Exact syntax comparison, not plagiarism detection. Preserve literals, names and
> Python block structure; discard comments, whitespace and optional semicolons.

## src/lib/editor/extract-metadata.ts

Fonte: [src/lib/editor/extract-metadata.ts](../../../src/lib/editor/extract-metadata.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `extractPostMetadata`, `PostContentMetadata`.

Dependências locais declaradas: `@/lib/editor/languages`.

Integrações/imports externos: `@prisma/client`.

Testes associados pelo nome: [src/lib/**tests**/extract-metadata.test.ts](../../../src/lib/__tests__/extract-metadata.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/editor/languages.ts

Fonte: [src/lib/editor/languages.ts](../../../src/lib/editor/languages.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `editorLanguageToPrisma`, `prismaLanguageToEditor`, `isRunnableLanguage`, `codemirrorLanguageId`, `CodeLanguageOption`, `CODE_LANGUAGES`.

Integrações/imports externos: `@prisma/client`.

## src/lib/editor/markdown.ts

Fonte: [src/lib/editor/markdown.ts](../../../src/lib/editor/markdown.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `serializeInline`, `serializeBlock`, `docToMarkdown`, `parseInline`, `parseBlock`, `markdownToDoc`.

Dependências locais declaradas: `./text-colors`, `./safe-inline`.

Integrações/imports externos: `@tiptap/core`, `mdast`, `unified`, `remark-parse`, `remark-stringify`, `remark-gfm`.

Testes associados pelo nome: [src/lib/editor/**tests**/markdown.test.ts](../../../src/lib/editor/__tests__/markdown.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/editor/safe-inline.ts

Fonte: [src/lib/editor/safe-inline.ts](../../../src/lib/editor/safe-inline.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `openingTag`, `transformPostFormatting`, `remarkPostFormatting`, `RichMarkdownNode`.

Dependências locais declaradas: `./text-colors`.

Comentários de contrato presentes na fonte:

> Recognize only our exact inline tags. Arbitrary HTML remains disabled.

## src/lib/editor/text-colors.ts

Fonte: [src/lib/editor/text-colors.ts](../../../src/lib/editor/text-colors.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `isPostTextColor`, `POST_TEXT_COLORS`, `PostTextColor`.

Comentários de contrato presentes na fonte:

> Semantic tokens keep saved posts readable in both application themes.

## src/lib/errors.ts

Fonte: [src/lib/errors.ts](../../../src/lib/errors.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `AppError`, `NotFoundError`, `ForbiddenError`, `RateLimitError`, `ValidationError`, `UnauthorizedError`, `ConnectionError`, `SessionExpiredError`, `constructor`.

## src/lib/evaluators/notifications.ts

Fonte: [src/lib/evaluators/notifications.ts](../../../src/lib/evaluators/notifications.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `pushEvaluatorNotifications`, `findDuelReviewers`, `notifyEvaluatorApplication`, `notifyDuelReviewers`, `getEvaluatorNotificationPresentation`, `EvaluatorPushTarget`, `EVALUATOR_APPLICATION_RESOURCE`, `DUEL_REVIEW_RESOURCE`.

Dependências locais declaradas: `./policy`, `@/lib/mobile/push`.

Integrações/imports externos: `@prisma/client`.

Comentários de contrato presentes na fonte:

> Persist first, then call outside the transaction. Provider failure never loses inbox activity.

> Resource types keep governance notices distinct from ordinary duel invitations.

Testes associados pelo nome: [src/lib/evaluators/**tests**/notifications.test.ts](../../../src/lib/evaluators/__tests__/notifications.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/evaluators/policy.ts

Fonte: [src/lib/evaluators/policy.ts](../../../src/lib/evaluators/policy.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `normalizedTechs`, `hasReviewableTechnology`, `evaluatorCanReviewLanguage`, `getReviewableLanguages`, `getEvaluatorStanding`, `getEvaluatorLevel`, `getApplicationRubric`, `EVALUATOR_MIN_XP`, `EVALUATOR_MIN_MOTIVATION_LENGTH`, `EVALUATOR_REVIEW_XP_REWARD`, `EVALUATOR_ACTIVE_REPUTATION`, `EVALUATOR_SUSPENSION_REPUTATION`.

Integrações/imports externos: `@prisma/client`.

Testes associados pelo nome: [src/lib/evaluators/**tests**/policy.test.ts](../../../src/lib/evaluators/__tests__/policy.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/event-challenges.ts

Fonte: [src/lib/event-challenges.ts](../../../src/lib/event-challenges.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `MIN_EVENT_CHALLENGES`, `MAX_EVENT_CHALLENGES`, `MAX_EVENT_CHALLENGE_EXAMPLES`, `eventChallengeExampleSchema`, `eventChallengeSchema`, `eventChallengeSetSchema`, `EventChallengeInput`, `EventChallengeExample`.

Integrações/imports externos: `@prisma/client`, `zod`.

Testes associados pelo nome: [src/lib/**tests**/event-challenges.test.ts](../../../src/lib/__tests__/event-challenges.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/event-display.ts

Fonte: [src/lib/event-display.ts](../../../src/lib/event-display.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `formatEventDate`, `formatEventDuration`.

## src/lib/event-status.ts

Fonte: [src/lib/event-status.ts](../../../src/lib/event-status.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `effectiveEventStatus`, `eventStatusWhere`.

Integrações/imports externos: `@prisma/client`.

Testes associados pelo nome: [src/lib/**tests**/event-status.test.ts](../../../src/lib/__tests__/event-status.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/exercises/evaluator.ts

Fonte: [src/lib/exercises/evaluator.ts](../../../src/lib/exercises/evaluator.ts)

Módulo restrito ao servidor; regras ou infraestrutura não devem entrar no bundle do navegador.

Símbolos localizados: `buildInvocation`, `buildExerciseHarness`, `parseHarnessOutput`, `stripHarnessOutput`, `evaluateExerciseCode`, `EvaluatorTestCase`, `ExerciseTestResult`, `ExerciseEvaluation`.

Dependências locais declaradas: `@/lib/code-execution/server`.

Integrações/imports externos: `server-only`, `node:crypto`.

Testes associados pelo nome: [src/lib/exercises/**tests**/evaluator.test.ts](../../../src/lib/exercises/__tests__/evaluator.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/exercises/progression.ts

Fonte: [src/lib/exercises/progression.ts](../../../src/lib/exercises/progression.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `calculateExerciseXp`, `calculateNodeMastery`, `deriveCompletedNodeStatus`.

Integrações/imports externos: `@prisma/client`.

Testes associados pelo nome: [src/lib/exercises/**tests**/progression.test.ts](../../../src/lib/exercises/__tests__/progression.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/exercises/repository.ts

Fonte: [src/lib/exercises/repository.ts](../../../src/lib/exercises/repository.ts)

Consultas e persistência do domínio; conferir transações e controle de acesso.

Símbolos localizados: `requireExerciseAccess`, `getExerciseForEvaluation`, `getExerciseWorkspaceForUser`, `recordExerciseRun`, `getExerciseRunCount`, `getSubmissionStatus`, `requireValidEvaluation`, `recordExerciseSubmission`, `recordAssistanceEvent`.

Dependências locais declaradas: `@/lib/learning/xp-periods`, `@/lib/prisma`, `@/lib/exercises/evaluator`, `@/lib/exercises/progression`, `@/lib/gamification/gems`, `@/lib/exercises/types`, `@/lib/learning/types`, `@/lib/errors`, `@/lib/learning/transaction`, `@/lib/credentials/repository`.

Integrações/imports externos: `server-only`, `@prisma/client`.

Testes associados pelo nome: [src/lib/credentials/**tests**/repository.test.ts](../../../src/lib/credentials/__tests__/repository.test.ts), [src/lib/mundinho/**tests**/repository.test.ts](../../../src/lib/mundinho/__tests__/repository.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/exercises/types.ts

Fonte: [src/lib/exercises/types.ts](../../../src/lib/exercises/types.ts)

Contratos, validação ou catálogo do domínio; distinguir tipos estáticos de validação runtime.

Símbolos localizados: `AssistanceMode`, `ExerciseWorkspaceData`, `ExerciseApiTestResult`.

Dependências locais declaradas: `@/lib/learning/types`.

## src/lib/feed-ranking.ts

Fonte: [src/lib/feed-ranking.ts](../../../src/lib/feed-ranking.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `rankRecentFeedPage`, `encodePopularFeedCursor`, `buildPopularFeedCursorWhere`.

Dependências locais declaradas: `./pagination`, `./errors`.

Comentários de contrato presentes na fonte:

> Rank an already paginated chronological block. No candidate is discarded, so
> the chronological cursor keeps every visible post reachable exactly once.

> Popular is an explicit following-feed choice, with the complete order in its cursor.

Testes associados pelo nome: [src/lib/**tests**/feed-ranking.test.ts](../../../src/lib/__tests__/feed-ranking.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/follow-recommendations.ts

Fonte: [src/lib/follow-recommendations.ts](../../../src/lib/follow-recommendations.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `normalizeFollowRecommendationExclusions`, `parseFollowRecommendationQuery`, `getFollowProfileIdentity`, `scoreFollowCandidate`, `FOLLOW_RECOMMENDATION_MAX_EXCLUDE`, `FOLLOW_RECOMMENDATION_ID_MAX_LENGTH`, `FollowProfileIdentity`, `FollowRecommendation`, `RecommendationCandidate`.

Dependências locais declaradas: `@/lib/profile-style`.

Integrações/imports externos: `@prisma/client`, `zod`.

Comentários de contrato presentes na fonte:

> UUIDs and existing text IDs are accepted without looking up or echoing them.

> Only the public decorations needed by a suggestion, never the full avatar config.

> Signals are capped so a large account cannot overwhelm personal relevance.

Testes associados pelo nome: [src/lib/**tests**/follow-recommendations.test.ts](../../../src/lib/__tests__/follow-recommendations.test.ts), [src/services/**tests**/follow-recommendations.test.ts](../../../src/services/__tests__/follow-recommendations.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/gamification/gems.ts

Fonte: [src/lib/gamification/gems.ts](../../../src/lib/gamification/gems.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `calculateGemBalance`, `calculateGemReward`, `GEMS_PER_EXERCISE_COMPLETION`.

Testes associados pelo nome: [src/lib/gamification/**tests**/gems.test.ts](../../../src/lib/gamification/__tests__/gems.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/index.ts

Fonte: [src/lib/index.ts](../../../src/lib/index.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

Dependências locais declaradas: `./errors`, `./logger`, `./pagination`, `./api-handler`, `./auth`, `./validators`, `./ratelimit`, `./prisma`.

## src/lib/jwt.ts

Fonte: [src/lib/jwt.ts](../../../src/lib/jwt.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `signJwt`, `verifyJwt`, `setJwtCookie`, `removeJwtCookie`, `getJwtFromCookie`, `getJwtUser`, `getEncodedJwtSecret`, `normalizeJwtPayload`, `JwtPayload`.

Dependências locais declaradas: `@/lib/config`, `@/lib/logger`.

Integrações/imports externos: `jose`, `next/headers`.

Comentários de contrato presentes na fonte:

> JWT utility module for Stacklyst.

Provides token signing, verification, and cookie management.
This serves as a secondary authentication layer on top of Supabase Auth.

Flow:

1. User authenticates via Supabase (OAuth or email/password)
2. After successful auth, we sign a JWT with user data
3. JWT is stored as an httpOnly cookie
4. On each request, we verify the JWT as a secondary check
5. If JWT is invalid/expired, we fall back to Supabase session verification

> Sign a new JWT token for the given user.

> Verify and decode a JWT token.
> Returns the decoded payload if valid, null otherwise.

> Set the JWT token as an httpOnly cookie.
> Call this after successful authentication.

> Remove the JWT cookie (used during logout).

> Get the JWT token from the cookie.
> Returns null if not found.

> Extract and verify JWT from cookies.
> Returns the decoded payload if valid, null otherwise.

Testes associados pelo nome: [src/lib/**tests**/jwt.test.ts](../../../src/lib/__tests__/jwt.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/leaderboard-identity.ts

Fonte: [src/lib/leaderboard-identity.ts](../../../src/lib/leaderboard-identity.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `getLeaderboardAvatarConfig`.

Dependências locais declaradas: `@/lib/profile-style`.

Comentários de contrato presentes na fonte:

> Expose only the fields used to render a public identity in the leaderboard.

## src/lib/learning/assessment.ts

Fonte: [src/lib/learning/assessment.ts](../../../src/lib/learning/assessment.ts)

Módulo restrito ao servidor; regras ou infraestrutura não devem entrar no bundle do navegador.

Símbolos localizados: `assessLessonStep`, `publicLesson`, `lessonAnswerSchema`, `LessonAnswer`.

Dependências locais declaradas: `@/lib/code-execution/server`, `@/lib/exercises/evaluator`, `@/lib/lessons/types`.

Integrações/imports externos: `server-only`, `zod`.

## src/lib/learning/catalog-types.ts

Fonte: [src/lib/learning/catalog-types.ts](../../../src/lib/learning/catalog-types.ts)

Contratos, validação ou catálogo do domínio; distinguir tipos estáticos de validação runtime.

Símbolos localizados: `defineLesson`, `LearningLesson`, `LearningCourse`, `StepDraft`.

Dependências locais declaradas: `@/lib/lessons/types`, `./rewards`.

## src/lib/learning/catalog.ts

Fonte: [src/lib/learning/catalog.ts](../../../src/lib/learning/catalog.ts)

Contratos, validação ou catálogo do domínio; distinguir tipos estáticos de validação runtime.

Símbolos localizados: `getLearningLesson`, `isLessonComplete`, `buildLearningMap`, `mergeLearningMaps`, `LEARNING_COURSES`, `LEARNING_LESSONS`.

Dependências locais declaradas: `@/lib/trailsData`, `./foundations`, `./specializations`, `./catalog-types`, `./types`, `./progress`.

Testes associados pelo nome: [src/lib/credentials/**tests**/catalog.test.ts](../../../src/lib/credentials/__tests__/catalog.test.ts), [src/lib/learning/**tests**/catalog.test.ts](../../../src/lib/learning/__tests__/catalog.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/learning/foundations.ts

Fonte: [src/lib/learning/foundations.ts](../../../src/lib/learning/foundations.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `wrapProgram`, `dobro`, `total`, `fullProgram`, `buildFoundations`, `FOUNDATION_COURSES`.

Dependências locais declaradas: `./catalog-types`.

Integrações/imports externos: `fmt`.

## src/lib/learning/language-xp.ts

Fonte: [src/lib/learning/language-xp.ts](../../../src/lib/learning/language-xp.ts)

Módulo restrito ao servidor; regras ou infraestrutura não devem entrar no bundle do navegador.

Símbolos localizados: `getUserLanguageXp`, `getLanguageLeaderboard`.

Dependências locais declaradas: `@/lib/prisma`, `./rewards`.

Integrações/imports externos: `server-only`, `@prisma/client`.

## src/lib/learning/leaderboard.ts

Fonte: [src/lib/learning/leaderboard.ts](../../../src/lib/learning/leaderboard.ts)

Módulo restrito ao servidor; regras ou infraestrutura não devem entrar no bundle do navegador.

Símbolos localizados: `getGlobalLeaderboard`.

Dependências locais declaradas: `@/lib/prisma`, `@/lib/leaderboard-identity`, `@/lib/streak`, `@/lib/learning/rewards`.

Integrações/imports externos: `server-only`.

## src/lib/learning/lesson-progress.ts

Fonte: [src/lib/learning/lesson-progress.ts](../../../src/lib/learning/lesson-progress.ts)

Módulo restrito ao servidor; regras ou infraestrutura não devem entrar no bundle do navegador.

Símbolos localizados: `getLessonProgress`, `requireLessonAccess`, `saveLessonAssessment`.

Dependências locais declaradas: `@/lib/prisma`, `@/lib/errors`, `@/lib/xp`, `./catalog`, `@/lib/lessons/types`, `./transaction`, `@/lib/credentials/repository`.

Integrações/imports externos: `server-only`, `@prisma/client`.

## src/lib/learning/period-leaderboard.ts

Fonte: [src/lib/learning/period-leaderboard.ts](../../../src/lib/learning/period-leaderboard.ts)

Módulo restrito ao servidor; regras ou infraestrutura não devem entrar no bundle do navegador.

Símbolos localizados: `getPeriodLeaderboard`.

Dependências locais declaradas: `./rewards`, `@/lib/prisma`, `./xp-periods`, `@/lib/leaderboard-identity`.

Integrações/imports externos: `server-only`, `@prisma/client`.

## src/lib/learning/progress.ts

Fonte: [src/lib/learning/progress.ts](../../../src/lib/learning/progress.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `isKnowledgeCompleted`, `deriveKnowledgeStatus`, `calculatePathProgress`.

Dependências locais declaradas: `@/lib/learning/types`.

Testes associados pelo nome: [src/lib/learning/**tests**/progress.test.ts](../../../src/lib/learning/__tests__/progress.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/learning/repository.ts

Fonte: [src/lib/learning/repository.ts](../../../src/lib/learning/repository.ts)

Consultas e persistência do domínio; conferir transações e controle de acesso.

Símbolos localizados: `getKnowledgeMapForUser`.

Dependências locais declaradas: `@/lib/prisma`, `@/lib/learning/progress`, `@/lib/learning/types`.

Integrações/imports externos: `server-only`.

Testes associados pelo nome: [src/lib/credentials/**tests**/repository.test.ts](../../../src/lib/credentials/__tests__/repository.test.ts), [src/lib/mundinho/**tests**/repository.test.ts](../../../src/lib/mundinho/__tests__/repository.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/learning/rewards.ts

Fonte: [src/lib/learning/rewards.ts](../../../src/lib/learning/rewards.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `getXpBand`, `calculateLevel`, `usersAheadWhere`, `LEARNING_XP`, `XP_BANDS`, `XP_RANK_ORDER`.

## src/lib/learning/specializations.ts

Fonte: [src/lib/learning/specializations.ts](../../../src/lib/learning/specializations.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `localizar`, `frequencias`, `balanceado`, `buscaBinaria`, `unirIntervalos`, `somarArvore`, `formas`, `ordenarTarefas`, `media`, `criar`, `sequencia`, `ativar`, `lotes`, `transformar`, `tentar`, `totalUnico`, `importar`, `responder`, `validarCadastro`, `podeEditar`, `paginar`, `totais`, `atualizar`, `reservar`, `eventoSeguro`, `escapar`, `proximoContador`, `Item`, `resumoItem`, `buscarItens`, `errosFormulario`, `reduzirBusca`, `receberResposta`, `reduzirTarefas`, `SPECIALIZATION_COURSES`.

Dependências locais declaradas: `./catalog-types`.

## src/lib/learning/transaction.ts

Fonte: [src/lib/learning/transaction.ts](../../../src/lib/learning/transaction.ts)

Módulo restrito ao servidor; regras ou infraestrutura não devem entrar no bundle do navegador.

Símbolos localizados: `learningTransaction`, `LEARNING_TRANSACTION_OPTIONS`.

Dependências locais declaradas: `@/lib/prisma`, `@/lib/errors`, `@/lib/logger`.

Integrações/imports externos: `server-only`, `@prisma/client`.

Testes associados pelo nome: [src/lib/learning/**tests**/transaction.test.ts](../../../src/lib/learning/__tests__/transaction.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/learning/types.ts

Fonte: [src/lib/learning/types.ts](../../../src/lib/learning/types.ts)

Contratos, validação ou catálogo do domínio; distinguir tipos estáticos de validação runtime.

Símbolos localizados: `KnowledgeNodeType`, `KnowledgeRelation`, `KnowledgeProgressStatus`, `KnowledgeExerciseSummary`, `KnowledgePrerequisite`, `KnowledgeMapNode`, `KnowledgeMapEdge`, `LearningPathSummary`, `KnowledgeMapData`.

## src/lib/learning/xp-periods.ts

Fonte: [src/lib/learning/xp-periods.ts](../../../src/lib/learning/xp-periods.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `periodStart`, `recordPeriodXp`, `RankingPeriod`.

Integrações/imports externos: `@prisma/client`.

Testes associados pelo nome: [src/lib/learning/**tests**/xp-periods.test.ts](../../../src/lib/learning/__tests__/xp-periods.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/lessons/evaluators.ts

Fonte: [src/lib/lessons/evaluators.ts](../../../src/lib/lessons/evaluators.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `evaluateMultipleChoice`, `evaluateCodeCompletion`, `evaluateOrdering`, `evaluateMatching`, `evaluateTerminal`, `evaluateCodeEditor`, `evaluateBlockBuilder`, `EvaluationOutcome`.

Dependências locais declaradas: `@/lib/code-runner`, `./types`.

Testes associados pelo nome: [src/lib/lessons/**tests**/evaluators.test.ts](../../../src/lib/lessons/__tests__/evaluators.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/lessons/registry.ts

Fonte: [src/lib/lessons/registry.ts](../../../src/lib/lessons/registry.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `calcularDesconto`, `isNull`, `identificarTipo`, `saudar`, `dobro`, `formatarPreco`, `generateTopicChallenge`, `classificar`, `somarAte`, `filtrarPares`, `checarTipo`, `buildDynamicLesson`, `generateCurriculumChallenge`, `listarVisiveis`, `normalizarEventos`, `resolver`, `resumirResposta`, `buildCurriculumLesson`, `Item`, `buscaBinaria`, `GET`, `findCurriculumLessonStepById`, `getLessonById`, `HANDCRAFTED_LESSONS`.

Dependências locais declaradas: `@/lib/trailsData`, `@/app/trails/trailCurriculum`, `./types`, `./trailCodeChallenges`, `@/lib/learning/catalog`.

Integrações/imports externos: `fmt`.

Comentários de contrato presentes na fonte:

> Constrói dinamicamente uma lição gamificada rica baseada no nível da trilha.

> Busca uma lição pelo ID (ex: "js-l1", "ts-l2", "js-frontend-react-s1-u1")

## src/lib/lessons/trailCodeChallenges.ts

Fonte: [src/lib/lessons/trailCodeChallenges.ts](../../../src/lib/lessons/trailCodeChallenges.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `buildJavascriptCheck`, `createJavascriptProfile`, `buildJavascriptProfile`, `selecionarComponentes`, `resumirEventos`, `normalizarFila`, `compactarLogs`, `encontrarDoisIndices`, `maiorJanelaUnica`, `resumirRespostas`, `encontrarIdsDuplicados`, `buildLanguageFallbackProfile`, `buildCurriculumCodeLesson`.

Dependências locais declaradas: `@/app/trails/trailCurriculum`, `./types`.

Integrações/imports externos: `fmt`.

## src/lib/lessons/types.ts

Fonte: [src/lib/lessons/types.ts](../../../src/lib/lessons/types.ts)

Contratos, validação ou catálogo do domínio; distinguir tipos estáticos de validação runtime.

Símbolos localizados: `ExerciseType`, `MatchingPair`, `OrderItem`, `BlankSlot`, `TestCase`, `LessonStep`, `Lesson`, `LessonSessionState`.

## src/lib/logger.ts

Fonte: [src/lib/logger.ts](../../../src/lib/logger.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `LogMeta`, `logger`, `info`, `warn`, `error`, `debug`.

## src/lib/mentions.tsx

Fonte: [src/lib/mentions.tsx](../../../src/lib/mentions.tsx)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `parseMentions`.

Integrações/imports externos: `next/link`, `react`.

Testes associados pelo nome: [src/lib/**tests**/mentions.test.tsx](../../../src/lib/__tests__/mentions.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/lib/microcopy.ts

Fonte: [src/lib/microcopy.ts](../../../src/lib/microcopy.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `MICROCOPY`.

## src/lib/mobile/auth-bootstrap.ts

Fonte: [src/lib/mobile/auth-bootstrap.ts](../../../src/lib/mobile/auth-bootstrap.ts)

Módulo restrito ao servidor; regras ou infraestrutura não devem entrar no bundle do navegador.

Símbolos localizados: `metadataText`, `initialUsername`, `usernameForAttempt`, `avatarUrl`, `errorCode`, `bootstrapMobileUser`, `syncApplicationProfile`.

Dependências locais declaradas: `@/lib/prisma`, `@/lib/config`, `@/lib/errors`, `@/lib/supabase/oauth`, `@/lib/connection-errors`.

Integrações/imports externos: `server-only`, `node:crypto`, `@supabase/supabase-js`.

Comentários de contrato presentes na fonte:

> Only call with the User returned by Supabase Auth's verified getUser(token).

Testes associados pelo nome: [src/lib/mobile/**tests**/auth-bootstrap.test.ts](../../../src/lib/mobile/__tests__/auth-bootstrap.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/mobile/company-access.ts

Fonte: [src/lib/mobile/company-access.ts](../../../src/lib/mobile/company-access.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `requireCompanyAccess`.

Dependências locais declaradas: `@/lib/prisma`, `@/lib/errors`.

Testes associados pelo nome: [src/lib/mobile/**tests**/company-access.test.ts](../../../src/lib/mobile/__tests__/company-access.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/mobile/lesson.ts

Fonte: [src/lib/mobile/lesson.ts](../../../src/lib/mobile/lesson.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `publicLesson`, `PublicLesson`.

Dependências locais declaradas: `@/lib/lessons/types`.

Comentários de contrato presentes na fonte:

> Allowlist, so future server-only answer keys cannot accidentally enter a bundle.

Testes associados pelo nome: [src/lib/mobile/**tests**/lesson.test.ts](../../../src/lib/mobile/__tests__/lesson.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/mobile/push.ts

Fonte: [src/lib/mobile/push.ts](../../../src/lib/mobile/push.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `sendMobilePush`.

Dependências locais declaradas: `@/lib/prisma`.

Comentários de contrato presentes na fonte:

> Called only for persisted activity; notification contents stay private on lock screens.

## src/lib/motion.ts

Fonte: [src/lib/motion.ts](../../../src/lib/motion.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `springSnappy`, `springBouncy`, `springGentle`, `springReaction`, `fadeVariants`, `modalContentVariants`, `staggerContainerVariants`, `staggerItemVariants`, `newPostsPillVariants`, `reactionPickerVariants`, `reactionItemVariants`, `bottomSheetVariants`, `optimisticPostVariants`, `levelUpOverlayVariants`, `levelUpBadgeVariants`, `crossfadeVariants`, `slideDownVariants`, `mentionDropdownVariants`, `popoverMenuVariants`, `dmMessageVariants`, `dmStaggerContainer`, `notifStaggerContainer`, `notifItemVariants`.

Dependências locais declaradas: `@/lib/config`.

Integrações/imports externos: `framer-motion`.

## src/lib/mundinho/arena-rules.ts

Fonte: [src/lib/mundinho/arena-rules.ts](../../../src/lib/mundinho/arena-rules.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `arenaCanWalk`, `arenaMove`, `validArenaPosition`, `arenaOpponent`, `advanceArenaTurn`, `arenaNeedsExercise`, `arenaAttackDamage`, `chooseArenaAttack`, `ARENA`, `ARENA_TURN_MS`, `ARENA_ONLINE_MS`, `ARENA_INVITE_MS`.

Dependências locais declaradas: `./arena-types`, `./equipment`, `./rules`.

Testes associados pelo nome: [src/lib/mundinho/**tests**/arena-rules.test.ts](../../../src/lib/mundinho/__tests__/arena-rules.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/mundinho/arena-types.ts

Fonte: [src/lib/mundinho/arena-types.ts](../../../src/lib/mundinho/arena-types.ts)

Contratos, validação ou catálogo do domínio; distinguir tipos estáticos de validação runtime.

Símbolos localizados: `ArenaSkill`, `ArenaPosition`, `ArenaMatch`, `ArenaPlayer`, `ArenaInvitation`, `ArenaState`, `ArenaAction`, `ArenaTransport`.

Dependências locais declaradas: `./types`, `./equipment`, `./rules`.

## src/lib/mundinho/arena.ts

Fonte: [src/lib/mundinho/arena.ts](../../../src/lib/mundinho/arena.ts)

Módulo restrito ao servidor; regras ou infraestrutura não devem entrar no bundle do navegador.

Símbolos localizados: `invalid`, `member`, `mutual`, `activeRoom`, `roomSnapshot`, `view`, `arena`, `arenaActionSchema`.

Dependências locais declaradas: `@/lib/prisma`, `@/lib/errors`, `@/lib/profile-style`, `@/lib/code-execution/server`, `@/lib/ratelimit`, `./types`, `./codeChallenges`, `./equipment`, `./codeChallengeStructures`, `./arena-rules`, `./arena-types`.

Integrações/imports externos: `server-only`, `node:crypto`, `@prisma/client`, `zod`.

## src/lib/mundinho/avatar-palettes.ts

Fonte: [src/lib/mundinho/avatar-palettes.ts](../../../src/lib/mundinho/avatar-palettes.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `SkinPalette`, `SKIN_PALETTES`, `SKIN`, `HAIR_SHADES`, `EYE_COLORS`, `OUTFIT_SPECS`, `OUTFIT`.

Comentários de contrato presentes na fonte:

> 9 Shaded Skin Palettes with 4-level shading ramps + blush,
> matching the user reference grid and original 32x32 spr_stacklyst001 chibi.

## src/lib/mundinho/battleAudio.ts

Fonte: [src/lib/mundinho/battleAudio.ts](../../../src/lib/mundinho/battleAudio.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `BattleCue`, `BattleAudio`, `unlock`, `setEnabled`, `setForeground`, `setBattle`, `setWorld`, `play`, `dispose`.

Comentários de contrato presentes na fonte:

> Offline chiptune channel. Context is unlocked inside a pointer/key gesture, before API awaits.

Testes associados pelo nome: [src/lib/mundinho/**tests**/battleAudio.test.ts](../../../src/lib/mundinho/__tests__/battleAudio.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/mundinho/code-paths.ts

Fonte: [src/lib/mundinho/code-paths.ts](../../../src/lib/mundinho/code-paths.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `codePathInfo`.

Dependências locais declaradas: `./types`.

Comentários de contrato presentes na fonte:

> A path label describes the whole segment between objectives, never a hidden tile cost.

Testes associados pelo nome: [src/lib/mundinho/**tests**/code-paths.test.ts](../../../src/lib/mundinho/__tests__/code-paths.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/mundinho/codeChallengeStructures.ts

Fonte: [src/lib/mundinho/codeChallengeStructures.ts](../../../src/lib/mundinho/codeChallengeStructures.ts)

Módulo restrito ao servidor; regras ou infraestrutura não devem entrar no bundle do navegador.

Símbolos localizados: `children`, `visit`, `callName`, `hasCall`, `hasFinalElse`, `instrumentLoopBody`, `parsedStructures`, `goTokens`, `goStructures`, `worldCall`, `bodyAt`, `finalElse`, `instrumentChallengeSource`.

Dependências locais declaradas: `./types`.

Integrações/imports externos: `server-only`, `@codemirror/lang-javascript`, `@codemirror/lang-python`, `@codemirror/lang-rust`, `@codemirror/lang-java`, `@lezer/common`.

Comentários de contrato presentes na fonte:

> Go's quoted strings, raw strings, runes and both comment forms are excluded before keyword analysis.

> Parse real control flow on the server; instrumentation is observed by the isolated runtime.

Testes associados pelo nome: [src/lib/mundinho/**tests**/codeChallengeStructures.test.ts](../../../src/lib/mundinho/__tests__/codeChallengeStructures.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/mundinho/codeChallenges.ts

Fonte: [src/lib/mundinho/codeChallenges.ts](../../../src/lib/mundinho/codeChallenges.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `challengeExecutionLanguage`, `starter`, `learningLevel`, `publicScenario`, `codeChallenges`, `codeChallenge`, `challengeProgram`, `replayTrace`, `evaluateTrace`.

Dependências locais declaradas: `./types`.

Integrações/imports externos: `fmt`.

Comentários de contrato presentes na fonte:

> New challenges are stable by id, so an active battle remains resumable.

> The original crystal id is retained for battles already in progress.

> User code only runs through the existing isolated execution service.

> Simulates only the trace; it is also shared by the animated board.

Testes associados pelo nome: [src/lib/mundinho/**tests**/codeChallenges.test.ts](../../../src/lib/mundinho/__tests__/codeChallenges.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/mundinho/equipment.ts

Fonte: [src/lib/mundinho/equipment.ts](../../../src/lib/mundinho/equipment.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `equipmentPrice`, `hasBugHunterTitle`, `equipmentStats`, `directAttack`, `equipmentDropPool`, `equipmentBonusLabel`, `EquipmentSlot`, `Equipment`, `EQUIPMENT`, `EQUIPMENT_SLOTS`, `BUG_HUNTER_TITLE_ID`, `CombatStats`.

Comentários de contrato presentes na fonte:

> Store prices are server-owned and shared with the client display.

> A forged equipped value never grants the title's ability.

> Only owned catalog items in their matching slot contribute; the client never supplies stats.

> Rarity weights are 6:3:1; tougher creatures add rare and epic items to the pool.

Testes associados pelo nome: [src/lib/mundinho/**tests**/equipment.test.ts](../../../src/lib/mundinho/__tests__/equipment.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/mundinho/hair-colors.ts

Fonte: [src/lib/mundinho/hair-colors.ts](../../../src/lib/mundinho/hair-colors.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `avatarHairColor`, `withAvatarHairColor`, `hairColorTransfer`, `LEGACY_HAIR_COLORS`, `LEGACY_HAIR_NAMES`, `NATURAL_HAIR_OPTIONS`.

Dependências locais declaradas: `./types`.

Comentários de contrato presentes na fonte:

> Persisted indices and sprite rows must stay stable for existing avatars.

> Transfer the existing silver pixels to a new base, preserving ink, shading and alpha.

Testes associados pelo nome: [src/lib/mundinho/**tests**/hair-colors.test.ts](../../../src/lib/mundinho/__tests__/hair-colors.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/mundinho/questions.ts

Fonte: [src/lib/mundinho/questions.ts](../../../src/lib/mundinho/questions.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `id`, `publicQuestion`, `QUESTIONS`.

Dependências locais declaradas: `./types`.

## src/lib/mundinho/repository.ts

Fonte: [src/lib/mundinho/repository.ts](../../../src/lib/mundinho/repository.ts)

Consultas e persistência do domínio; conferir transações e controle de acesso.

Símbolos localizados: `fail`, `encounterLevel`, `battleView`, `credit`, `resolveBattleAction`, `missions`, `adventure`, `actionSchema`.

Dependências locais declaradas: `@/lib/prisma`, `@/lib/errors`, `@/lib/learning/catalog`, `./types`, `./rules`, `./questions`, `./codeChallenges`, `@/lib/code-execution/server`, `./codeChallengeStructures`, `./avatar-palettes`, `./equipment`.

Integrações/imports externos: `node:crypto`, `@prisma/client`, `zod`.

Comentários de contrato presentes na fonte:

> All mutations for one player serialize on a database row, across servers/devices.

Testes associados pelo nome: [src/lib/credentials/**tests**/repository.test.ts](../../../src/lib/credentials/__tests__/repository.test.ts), [src/lib/mundinho/**tests**/repository.test.ts](../../../src/lib/mundinho/__tests__/repository.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/mundinho/rules.ts

Fonte: [src/lib/mundinho/rules.ts](../../../src/lib/mundinho/rules.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `canChallengeCreature`, `creatureStats`, `dayKey`, `checkinStatus`, `resolveTurn`, `SKILLS`.

Dependências locais declaradas: `./types`.

Testes associados pelo nome: [src/lib/mundinho/**tests**/rules.test.ts](../../../src/lib/mundinho/__tests__/rules.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/mundinho/types.ts

Fonte: [src/lib/mundinho/types.ts](../../../src/lib/mundinho/types.ts)

Contratos, validação ou catálogo do domínio; distinguir tipos estáticos de validação runtime.

Símbolos localizados: `levelProgress`, `LANGUAGES`, `BattleLanguage`, `LANGUAGE_NAMES`, `Avatar`, `DEFAULT_AVATAR`, `ADA_AVATAR`, `Item`, `ITEMS`, `CHECKIN_REWARDS`, `CREATURES`, `CodeAction`, `CodeTile`, `PublicQuestion`, `CodeRun`, `BattleView`, `Mission`, `AdventureState`, `Course`, `AdventureAction`, `AdventureTransport`.

Dependências locais declaradas: `../learning/rewards`, `./equipment`.

Comentários de contrato presentes na fonte:

> Ada has her own appearance, independent of the player's wardrobe.

## src/lib/mundinho/world.ts

Fonte: [src/lib/mundinho/world.ts](../../../src/lib/mundinho/world.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `movementDirection`, `canWalk`, `movePlayer`, `WORLD`, `COLLISIONS`, `SCENERY`, `worldDepth`, `WORLD_OBJECTS`.

Dependências locais declaradas: `./geometry.json`.

Testes associados pelo nome: [src/lib/mundinho/**tests**/world.test.ts](../../../src/lib/mundinho/__tests__/world.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/onboarding.ts

Fonte: [src/lib/onboarding.ts](../../../src/lib/onboarding.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `parseOnboarding`, `ONBOARDING_STATE_KEY`, `onboardingLanguageSchema`, `onboardingSchema`, `OnboardingPreferences`.

Integrações/imports externos: `zod`.

## src/lib/pagination.ts

Fonte: [src/lib/pagination.ts](../../../src/lib/pagination.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `encodeCursor`, `decodeCursor`, `buildCursorWhere`.

Dependências locais declaradas: `./errors`.

## src/lib/platform-presence.ts

Fonte: [src/lib/platform-presence.ts](../../../src/lib/platform-presence.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `recordPlatformPresence`, `getPlatformPresence`, `PRESENCE_WINDOW_SECONDS`, `PlatformPresenceSummary`.

Dependências locais declaradas: `@/lib/prisma`.

Comentários de contrato presentes na fonte:

> One row per verified account, shared by devices/tabs. Never touches learning activity.

> A single database snapshot; samples are public community photos, not invented online members.

## src/lib/post-composer.ts

Fonte: [src/lib/post-composer.ts](../../../src/lib/post-composer.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `insertAtCursor`, `insertAtEditor`, `appendPostExtras`, `parsePostExtras`, `resetPostComposerExtras`, `ReplyAudience`, `REPLY_AUDIENCE_OPTIONS`, `EMOJI_CATEGORIES`, `QUICK_LOCATIONS`, `ParsedPostExtras`.

Comentários de contrato presentes na fonte:

> Separates the legacy composer markers from the visible post copy.
> Posts already published keep working without a database migration.

Testes associados pelo nome: [src/lib/**tests**/post-composer.test.ts](../../../src/lib/__tests__/post-composer.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/post-content.ts

Fonte: [src/lib/post-content.ts](../../../src/lib/post-content.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `PostAttachment`, `PostPollDraft`, `PostPoll`, `PostAudience`.

Comentários de contrato presentes na fonte:

> Shared persisted composer data. Text remains backwards-compatible Markdown.

## src/lib/post-poll.ts

Fonte: [src/lib/post-poll.ts](../../../src/lib/post-poll.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `postPollInclude`, `publicPostPoll`.

Dependências locais declaradas: `@/lib/post-content`.

Integrações/imports externos: `@prisma/client`.

## src/lib/post-quiz.ts

Fonte: [src/lib/post-quiz.ts](../../../src/lib/post-quiz.ts)

Módulo restrito ao servidor; regras ou infraestrutura não devem entrar no bundle do navegador.

Símbolos localizados: `explanatoryText`, `wordCount`, `stableRank`, `selectPostQuiz`, `QuizSourcePost`.

Integrações/imports externos: `server-only`.

Comentários de contrato presentes na fonte:

> Selects a reviewed question about an explained topic, with no random fallback.

Testes associados pelo nome: [src/lib/**tests**/post-quiz.test.ts](../../../src/lib/__tests__/post-quiz.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/prisma.ts

Fonte: [src/lib/prisma.ts](../../../src/lib/prisma.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `getDatabaseConnectionString`, `hasDatabaseConnection`, `createMissingDatabaseError`, `readPositiveInteger`, `getDatabasePoolMax`, `prisma`.

Integrações/imports externos: `@prisma/client`, `@prisma/adapter-pg`, `pg`, `dns`.

Comentários de contrato presentes na fonte:

> Runtime traffic must use the pooled URL when one is available. DIRECT_URL is
> reserved for Prisma CLI workflows such as migrations and introspection.

## src/lib/profile-customization.ts

Fonte: [src/lib/profile-customization.ts](../../../src/lib/profile-customization.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `normalizeProfileTitleName`, `getAchievementInstructions`, `getProfileFlags`, `getSelectedProfileFlags`, `getProfileStudies`, `normalizeProfilePreferenceAliases`, `parseProfilePreferences`, `parsePrivateChat`, `colorContrast`, `PROFILE_RARITIES`, `PROFILE_METRICS`, `ProfileRarity`, `ProfileMetric`, `profileStudySchema`, `ProfileStudy`, `profileSocialLinkSchema`, `profileBasicsSchema`, `ProfileBasics`, `profilePreferencesSchema`, `privateChatSchema`, `ProfilePreferences`, `PrivateChatPreferences`, `DEFAULT_PROFILE_PREFERENCES`, `DEFAULT_CHAT_PREFERENCES`, `achievementDefinitionSchema`, `AchievementDefinition`, `avatarFrameSchema`, `AvatarFrameDefinition`, `profileEventSchema`, `profileCatalogSchema`, `ProfileCatalog`, `AchievementInstructionInfo`, `PROFILE_ACHIEVEMENT_TIME_ZONE`, `NEW_PROFILE_TITLE_IDS`, `DEFAULT_PROFILE_CATALOG`, `AchievementProgress`, `ProfileCustomizationState`.

Dependências locais declaradas: `@/lib/profile-frames`, `@/lib/profile-flags`.

Integrações/imports externos: `zod`.

Comentários de contrato presentes na fonte:

> Canonical persisted legacy banner, including removal after a reset.

> Private editable fields, returned only to the authenticated owner.

> Upgrade old JSON and old client payloads without resetting unrelated preferences.

Testes associados pelo nome: [src/lib/**tests**/profile-customization.test.ts](../../../src/lib/__tests__/profile-customization.test.ts), [src/services/**tests**/profile-customization.test.ts](../../../src/services/__tests__/profile-customization.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/profile-flags.ts

Fonte: [src/lib/profile-flags.ts](../../../src/lib/profile-flags.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `isProfileFlagId`, `getProfileFlagCatalog`, `ProfileFlagCategory`, `ProfileFlagDefinition`, `PROFILE_COUNTRY_CODES`, `PROFILE_BRAZIL_STATES`, `PROFILE_FLAG_IDS`, `getProfileFlags`.

Comentários de contrato presentes na fonte:

> Public, user-selected decoration catalog. A selection never infers an identity.

Testes associados pelo nome: [src/lib/**tests**/profile-flags.test.ts](../../../src/lib/__tests__/profile-flags.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/profile-frames.ts

Fonte: [src/lib/profile-frames.ts](../../../src/lib/profile-frames.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `getFrameRingBackground`, `EXTRA_PROFILE_FRAMES`.

Dependências locais declaradas: `@/lib/profile-customization`.

Comentários de contrato presentes na fonte:

> Curated colors only: no user CSS or remote assets enter the avatar ring.

## src/lib/profile-music.ts

Fonte: [src/lib/profile-music.ts](../../../src/lib/profile-music.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `normalizeSpotifyTrackId`, `safeArtwork`, `spotifySearchAvailability`, `spotifySearchConfigured`, `spotifyResponseError`, `spotifyToken`, `apiTrack`, `authorizedSpotifyRequest`, `resolveSpotifyTrack`, `searchSpotifyTrackPage`, `searchSpotifyTracks`, `SpotifyProfileTrack`, `SpotifySearchReason`, `SpotifyCatalogError`, `SpotifySearchPage`.

Dependências locais declaradas: `@/lib/errors`.

Comentários de contrato presentes na fonte:

> Backwards-compatible helper for callers that need only the first page.

Testes associados pelo nome: [src/lib/**tests**/profile-music.test.ts](../../../src/lib/__tests__/profile-music.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/profile-style.ts

Fonte: [src/lib/profile-style.ts](../../../src/lib/profile-style.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `contrastRatio`, `foregroundOn`, `readableColor`, `getAuthorDisplayName`, `readProfileIdentity`, `profileAppearanceStyle`, `privateChatStyle`, `ProfileIdentityStyle`.

Dependências locais declaradas: `@/lib/profile-customization`, `@/lib/profile-flags`.

Integrações/imports externos: `react`.

## src/lib/profile-upload.ts

Fonte: [src/lib/profile-upload.ts](../../../src/lib/profile-upload.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `isOwnedProfileUpload`.

Dependências locais declaradas: `@/lib/supabase/env`.

Comentários de contrato presentes na fonte:

> A profile image must come from this account's authenticated upload endpoint.

## src/lib/profile-version.ts

Fonte: [src/lib/profile-version.ts](../../../src/lib/profile-version.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `bumpProfileVersion`.

Integrações/imports externos: `@prisma/client`.

Comentários de contrato presentes na fonte:

> Called while the shared profile advisory lock is held by the writer.

## src/lib/quiz-public.ts

Fonte: [src/lib/quiz-public.ts](../../../src/lib/quiz-public.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `publicQuiz`.

Comentários de contrato presentes na fonte:

> Attempts must already be filtered to the current viewer by the database query.

Testes associados pelo nome: [src/lib/**tests**/quiz-public.test.ts](../../../src/lib/__tests__/quiz-public.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/ratelimit.ts

Fonte: [src/lib/ratelimit.ts](../../../src/lib/ratelimit.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `parseWindowToMs`, `localRateLimit`, `rateLimit`.

Dependências locais declaradas: `./errors`, `./logger`, `./api-handler`.

Integrações/imports externos: `@upstash/ratelimit`, `@upstash/redis`.

## src/lib/security-audit.ts

Fonte: [src/lib/security-audit.ts](../../../src/lib/security-audit.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `auditRetentionDays`, `recordSecurityAudit`, `purgeExpiredSecurityAudit`.

Dependências locais declaradas: `@/lib/prisma`.

Integrações/imports externos: `@prisma/client`.

Testes associados pelo nome: [src/lib/**tests**/security-audit.test.ts](../../../src/lib/__tests__/security-audit.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/streak.ts

Fonte: [src/lib/streak.ts](../../../src/lib/streak.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `utcDayTimestamp`, `getCalendarDayDifference`, `calculateNextStreak`, `getEffectiveStreak`, `getRecentStreakDayIndexes`.

Testes associados pelo nome: [src/lib/**tests**/streak.test.ts](../../../src/lib/__tests__/streak.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/supabase/account-vault.ts

Fonte: [src/lib/supabase/account-vault.ts](../../../src/lib/supabase/account-vault.ts)

Módulo restrito ao servidor; regras ou infraestrutura não devem entrar no bundle do navegador.

Símbolos localizados: `key`, `sealAccount`, `openAccount`, `ACCOUNT_COOKIE`, `ACCOUNT_COOKIE_OPTIONS`, `SavedAccount`.

Dependências locais declaradas: `@/lib/config`.

Integrações/imports externos: `server-only`, `node:crypto`.

Testes associados pelo nome: [src/lib/supabase/**tests**/account-vault.test.ts](../../../src/lib/supabase/__tests__/account-vault.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/supabase/admin.ts

Fonte: [src/lib/supabase/admin.ts](../../../src/lib/supabase/admin.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `isValidHttpUrl`, `getSupabaseAdminClient`.

Dependências locais declaradas: `@/lib/supabase/env`.

Integrações/imports externos: `@supabase/supabase-js`.

Comentários de contrato presentes na fonte:

> Supabase admin client (service role) for server-side operations.
> Uses HTTPS (port 443) — works even on networks that block PostgreSQL ports.

Testes associados pelo nome: [src/lib/supabase/**tests**/admin.test.ts](../../../src/lib/supabase/__tests__/admin.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/supabase/auth-errors.ts

Fonte: [src/lib/supabase/auth-errors.ts](../../../src/lib/supabase/auth-errors.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `isTemporaryAuthFailure`.

Dependências locais declaradas: `@/lib/connection-errors`.

Integrações/imports externos: `@supabase/supabase-js`.

Comentários de contrato presentes na fonte:

> Auth failures for which a short-lived, locally signed fallback is acceptable.
> Invalid, expired, missing or revoked sessions are deliberately excluded.

## src/lib/supabase/bearer.ts

Fonte: [src/lib/supabase/bearer.ts](../../../src/lib/supabase/bearer.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `verifyBearerUser`, `verifyBearerIdentity`.

Dependências locais declaradas: `./env`, `./auth-errors`, `@/lib/errors`.

Integrações/imports externos: `@supabase/supabase-js`.

Comentários de contrato presentes na fonte:

> Explicit authorization never falls back to the browser's cookies.

> Existing consumers only need the verified subject, never unverified JWT contents.

Testes associados pelo nome: [src/lib/supabase/**tests**/bearer.test.ts](../../../src/lib/supabase/__tests__/bearer.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/supabase/client.ts

Fonte: [src/lib/supabase/client.ts](../../../src/lib/supabase/client.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `createClient`.

Dependências locais declaradas: `@/lib/supabase/env`.

Integrações/imports externos: `@supabase/ssr`.

## src/lib/supabase/dev-ssl.ts

Fonte: [src/lib/supabase/dev-ssl.ts](../../../src/lib/supabase/dev-ssl.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

Integrações/imports externos: `dns`.

Comentários de contrato presentes na fonte:

> Em alguns ambientes Windows (antivírus, proxy corporativo), o Node.js
> não confia no certificado HTTPS do Supabase e o auth retorna "fetch failed".
> Ative com SUPABASE_SSL_INSECURE=true no .env.local apenas em desenvolvimento.

## src/lib/supabase/env.ts

Fonte: [src/lib/supabase/env.ts](../../../src/lib/supabase/env.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `readEnv`, `getSupabaseUrl`, `getSupabasePublishableKey`, `isSupabasePublicConfigured`, `getSupabasePublicConfig`.

Testes associados pelo nome: [src/lib/supabase/**tests**/env.test.ts](../../../src/lib/supabase/__tests__/env.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/supabase/middleware.ts

Fonte: [src/lib/supabase/middleware.ts](../../../src/lib/supabase/middleware.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `copySessionState`, `updateSession`.

Dependências locais declaradas: `./dev-ssl`, `@/lib/jwt`, `@/lib/config`, `@/lib/supabase/auth-errors`, `@/lib/connection-errors`, `@/lib/logger`, `@/lib/supabase/env`.

Integrações/imports externos: `@supabase/ssr`, `next/server`.

Testes associados pelo nome: [src/lib/supabase/**tests**/middleware.test.ts](../../../src/lib/supabase/__tests__/middleware.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/supabase/oauth.ts

Fonte: [src/lib/supabase/oauth.ts](../../../src/lib/supabase/oauth.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `getOAuthSignupBio`, `OAUTH_PROVIDER_LABELS`, `OAuthProvider`.

Testes associados pelo nome: [src/lib/supabase/**tests**/oauth.test.ts](../../../src/lib/supabase/__tests__/oauth.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/supabase/password-recovery.ts

Fonte: [src/lib/supabase/password-recovery.ts](../../../src/lib/supabase/password-recovery.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `signature`, `issueRecoveryProof`, `verifyRecoveryProof`, `RECOVERY_COOKIE`, `RECOVERY_COOKIE_OPTIONS`.

Dependências locais declaradas: `@/lib/config`.

Integrações/imports externos: `node:crypto`.

## src/lib/supabase/server.ts

Fonte: [src/lib/supabase/server.ts](../../../src/lib/supabase/server.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `createClient`.

Dependências locais declaradas: `./dev-ssl`, `@/lib/supabase/env`.

Integrações/imports externos: `@supabase/ssr`, `next/headers`.

Testes associados pelo nome: [src/lib/code-execution/server.test.ts](../../../src/lib/code-execution/server.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/theme.ts

Fonte: [src/lib/theme.ts](../../../src/lib/theme.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `syncTheme`, `saveTheme`, `themeBootstrap`.

Comentários de contrato presentes na fonte:

> Self-contained so the same resolver can run before hydration and on page restore.

## src/lib/trails/go.ts

Fonte: [src/lib/trails/go.ts](../../../src/lib/trails/go.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `dividir`, `GO_TRAIL`.

Dependências locais declaradas: `../trailsData`.

## src/lib/trails/java.ts

Fonte: [src/lib/trails/java.ts](../../../src/lib/trails/java.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `JAVA_TRAIL`.

Dependências locais declaradas: `../trailsData`.

## src/lib/trails/js.ts

Fonte: [src/lib/trails/js.ts](../../../src/lib/trails/js.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `soma`, `ValidacaoError`, `JS_TRAIL`.

Dependências locais declaradas: `../trailsData`.

## src/lib/trails/jump.ts

Fonte: [src/lib/trails/jump.ts](../../../src/lib/trails/jump.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `safeSegment`, `buildTrailJumpId`, `getHighestJumpedSection`, `TRAIL_SECTION_COUNT`.

Testes associados pelo nome: [src/lib/trails/**tests**/jump.test.ts](../../../src/lib/trails/__tests__/jump.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/trails/python.ts

Fonte: [src/lib/trails/python.ts](../../../src/lib/trails/python.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `PYTHON_TRAIL`.

Dependências locais declaradas: `../trailsData`.

## src/lib/trails/rust.ts

Fonte: [src/lib/trails/rust.ts](../../../src/lib/trails/rust.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `RUST_TRAIL`.

Dependências locais declaradas: `../trailsData`.

## src/lib/trails/ts.ts

Fonte: [src/lib/trails/ts.ts](../../../src/lib/trails/ts.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `primeiroElemento`, `mapear`, `isPeixe`, `buscar`, `assertExhaustive`, `TS_TRAIL`.

Dependências locais declaradas: `../trailsData`.

## src/lib/trailsData.ts

Fonte: [src/lib/trailsData.ts](../../../src/lib/trailsData.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `findTrailQuestionById`, `TrailQuestion`, `TrailLevel`, `TRAILS_DATA`.

Dependências locais declaradas: `./trails/js`, `./trails/ts`, `./trails/python`, `./trails/rust`, `./trails/go`, `./trails/java`.

## src/lib/utils.ts

Fonte: [src/lib/utils.ts](../../../src/lib/utils.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `cn`.

Integrações/imports externos: `clsx`, `tailwind-merge`.

## src/lib/validators.ts

Fonte: [src/lib/validators.ts](../../../src/lib/validators.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `isPrivateIpOrHost`, `deriveTitleFromBody`, `postMusicSchema`, `createPostSchema`, `CreatePostInput`, `createAnswerSchema`, `quizAttemptSchema`, `createDuelSchema`, `duelVoteSchema`, `registerSchema`, `loginSchema`.

Integrações/imports externos: `zod`, `@prisma/client`.

Testes associados pelo nome: [src/lib/**tests**/validators.test.ts](../../../src/lib/__tests__/validators.test.ts). Outros testes de integração podem cobrir este módulo.

## src/lib/xp.ts

Fonte: [src/lib/xp.ts](../../../src/lib/xp.ts)

Módulo de apoio: consulte seus símbolos, comentários e dependências para o papel exato no fluxo.

Símbolos localizados: `awardXP`, `awardXPInTransaction`, `checkBadgeEligibility`.

Dependências locais declaradas: `@/lib/learning/xp-periods`, `@/lib/streak`, `@/lib/learning/transaction`, `@/lib/learning/rewards`.

Integrações/imports externos: `@prisma/client`.

Testes associados pelo nome: [src/lib/**tests**/xp.test.ts](../../../src/lib/__tests__/xp.test.ts). Outros testes de integração podem cobrir este módulo.

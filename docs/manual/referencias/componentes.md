# Código: componentes

[Índice](README.md) · [Manual](../README.md)

## src/components/AchievementShowcase.tsx

Fonte: [src/components/AchievementShowcase.tsx](../../../src/components/AchievementShowcase.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `sortAchievements`, `AchievementCard`, `AchievementShowcase`, `AchievementBadge`.

Integrações/imports externos: `next/link`, `lucide-react`.

Testes associados pelo nome: [src/components/**tests**/AchievementShowcase.test.tsx](../../../src/components/__tests__/AchievementShowcase.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/components/AnswerCard.tsx

Fonte: [src/components/AnswerCard.tsx](../../../src/components/AnswerCard.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `AnswerCard`.

Dependências locais declaradas: `@/hooks/useHydrationSafeRelativeTime`, `@/components/PostActionsBar`, `@/components/motion/LikeButton`, `@/components/motion/BookmarkButton`, `@/components/motion/RepostMenu`, `@/components/MarkdownRenderer`, `@/components/MarkdownEditor`, `@/components/AuthorAvatar`, `@/components/profile/ProfileIdentity`, `@/components/LevelBadge`, `@/lib/profile-style`, `@/components/answer-types`, `@/lib/client/post-bookmarks`.

Integrações/imports externos: `react`, `next/link`, `next/image`, `lucide-react`.

Comentários de contrato presentes na fonte:

> Indentation depth: 0 = top-level reply to the post, 1 = reply to a top-level answer, etc.

## src/components/AnswerThread.tsx

Fonte: [src/components/AnswerThread.tsx](../../../src/components/AnswerThread.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `countAnswers`, `AnswerThread`.

Dependências locais declaradas: `@/components/AnswerCard`, `@/components/answer-types`.

Integrações/imports externos: `lucide-react`.

Comentários de contrato presentes na fonte:

> Called when any answer (top-level or nested) is created. Receives the parent answer id (null for top-level) and the new answer node.

> Recursively counts every answer in a tree (top-level + all nested replies).
> Used for the "Respostas (N)" header so the total reflects the whole thread.

## src/components/Aurora.tsx

Fonte: [src/components/Aurora.tsx](../../../src/components/Aurora.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `createColorStops`, `Aurora`.

Integrações/imports externos: `react`, `ogl`.

## src/components/AuthorAvatar.tsx

Fonte: [src/components/AuthorAvatar.tsx](../../../src/components/AuthorAvatar.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `AuthorAvatar`.

Dependências locais declaradas: `@/components/profile/ProfileIdentity`, `@/lib/profile-style`.

Integrações/imports externos: `next/image`.

Testes associados pelo nome: [src/components/**tests**/AuthorAvatar.test.tsx](../../../src/components/__tests__/AuthorAvatar.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/components/BadgeGrid.tsx

Fonte: [src/components/BadgeGrid.tsx](../../../src/components/BadgeGrid.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `BadgeEmblem`, `BadgeItem`, `BadgeGrid`, `badgeDesigns`.

Integrações/imports externos: `react`, `next/image`.

## src/components/BlockUserButton.tsx

Fonte: [src/components/BlockUserButton.tsx](../../../src/components/BlockUserButton.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `BlockUserButton`, `submit`.

Dependências locais declaradas: `@/i18n/useLocalizedText`.

Integrações/imports externos: `react`, `next/navigation`, `lucide-react`.

Testes associados pelo nome: [src/components/**tests**/BlockUserButton.test.tsx](../../../src/components/__tests__/BlockUserButton.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/components/BlockedUsersSettings.tsx

Fonte: [src/components/BlockedUsersSettings.tsx](../../../src/components/BlockedUsersSettings.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `BlockedUsersSettings`.

Dependências locais declaradas: `@/components/BlockUserButton`, `@/i18n/useLocalizedText`.

Integrações/imports externos: `react`.

## src/components/BraceLoader.tsx

Fonte: [src/components/BraceLoader.tsx](../../../src/components/BraceLoader.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

Integrações/imports externos: `react`.

Comentários de contrato presentes na fonte:

> Cor das chaves {}

> Cor de fundo do container

> Escala do loader

## src/components/BrandLogo.module.css

Fonte: [src/components/BrandLogo.module.css](../../../src/components/BrandLogo.module.css)

Regras de apresentação, estados visuais e adaptação responsiva; não é autoridade de dados.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

## src/components/BrandLogo.tsx

Fonte: [src/components/BrandLogo.tsx](../../../src/components/BrandLogo.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `BrandLogo`, `BrandLogoProps`.

Dependências locais declaradas: `@/lib/brand-geometry`, `./BrandLogo.module.css`.

Integrações/imports externos: `react`.

Comentários de contrato presentes na fonte:

> The supplied S replaces the first letter, with one accessible name.

## src/components/BrandReveal.module.css

Fonte: [src/components/BrandReveal.module.css](../../../src/components/BrandReveal.module.css)

Regras de apresentação, estados visuais e adaptação responsiva; não é autoridade de dados.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

## src/components/BrandReveal.tsx

Fonte: [src/components/BrandReveal.tsx](../../../src/components/BrandReveal.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `BrandReveal`.

Dependências locais declaradas: `./BrandLogo`, `./BrandReveal.module.css`.

## src/components/CharacterAvatar.tsx

Fonte: [src/components/CharacterAvatar.tsx](../../../src/components/CharacterAvatar.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `CharacterAvatar`.

Dependências locais declaradas: `@/lib/avatar`.

Comentários de contrato presentes na fonte:

> A code-native pixel sprite used only by the character customizer.
> The account identity remains the provider photo rendered by AuthorAvatar.

Testes associados pelo nome: [src/components/**tests**/CharacterAvatar.test.tsx](../../../src/components/__tests__/CharacterAvatar.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/components/CodeEditor.tsx

Fonte: [src/components/CodeEditor.tsx](../../../src/components/CodeEditor.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `CodeEditor`, `CodeEditorInner`, `loadExtensions`, `loadLanguageExtension`.

Integrações/imports externos: `react`, `next/dynamic`.

Comentários de contrato presentes na fonte:

> Inner component that handles dynamic language extension loading

## src/components/ColorPalette.module.css

Fonte: [src/components/ColorPalette.module.css](../../../src/components/ColorPalette.module.css)

Regras de apresentação, estados visuais e adaptação responsiva; não é autoridade de dados.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

## src/components/ColorPalette.tsx

Fonte: [src/components/ColorPalette.tsx](../../../src/components/ColorPalette.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `ColorPalette`, `PROFILE_COLORS`.

Dependências locais declaradas: `./ColorPalette.module.css`, `@/lib/profile-style`.

Comentários de contrato presentes na fonte:

> Fixed swatches. The change payload matches the value field used by form controls.

Testes associados pelo nome: [src/components/**tests**/ColorPalette.test.tsx](../../../src/components/__tests__/ColorPalette.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/components/ConnectionBanner.tsx

Fonte: [src/components/ConnectionBanner.tsx](../../../src/components/ConnectionBanner.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `ConnectionBanner`.

Integrações/imports externos: `react`, `lucide-react`.

## src/components/DuelCard.tsx

Fonte: [src/components/DuelCard.tsx](../../../src/components/DuelCard.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `DuelCard`.

Dependências locais declaradas: `./LanguageTag`.

## src/components/EditProfileModal.tsx

Fonte: [src/components/EditProfileModal.tsx](../../../src/components/EditProfileModal.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `EditProfileModal`.

Dependências locais declaradas: `@/lib/avatar`, `@/lib/cn`, `@/i18n/useLocalizedText`.

Integrações/imports externos: `react`, `framer-motion`, `next/image`, `next/link`, `lucide-react`.

## src/components/FeedPreferencesEditor.tsx

Fonte: [src/components/FeedPreferencesEditor.tsx](../../../src/components/FeedPreferencesEditor.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `FeedPreferencesEditor`, `show`, `save`.

Dependências locais declaradas: `@/components/motion/ComposeModal`, `@/lib/onboarding`.

Integrações/imports externos: `react`, `lucide-react`.

Testes associados pelo nome: [src/components/**tests**/FeedPreferencesEditor.test.tsx](../../../src/components/__tests__/FeedPreferencesEditor.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/components/FeedRankingSwitcher.module.css

Fonte: [src/components/FeedRankingSwitcher.module.css](../../../src/components/FeedRankingSwitcher.module.css)

Regras de apresentação, estados visuais e adaptação responsiva; não é autoridade de dados.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

## src/components/FeedRankingSwitcher.tsx

Fonte: [src/components/FeedRankingSwitcher.tsx](../../../src/components/FeedRankingSwitcher.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `FeedRankingSwitcher`, `feedRankingSurfaceClassName`.

Dependências locais declaradas: `@/i18n/useLocalizedText`, `./FeedRankingSwitcher.module.css`.

Integrações/imports externos: `next/link`, `lucide-react`.

Testes associados pelo nome: [src/components/**tests**/FeedRankingSwitcher.test.tsx](../../../src/components/__tests__/FeedRankingSwitcher.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/components/FeedRightSidebar.tsx

Fonte: [src/components/FeedRightSidebar.tsx](../../../src/components/FeedRightSidebar.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `hasStartedTrail`, `FeedRightSidebar`.

Dependências locais declaradas: `@/app/feed/FeedEngagementCard`, `@/components/WhoToFollow`, `@/components/LanguageTrailBar`, `@/lib/learning/rewards`, `@/lib/cn`, `@/i18n/useLocalizedText`, `./FeedStudies.module.css`.

Integrações/imports externos: `react`, `next/link`, `next/navigation`, `lucide-react`.

## src/components/FeedStudies.module.css

Fonte: [src/components/FeedStudies.module.css](../../../src/components/FeedStudies.module.css)

Regras de apresentação, estados visuais e adaptação responsiva; não é autoridade de dados.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

## src/components/Footer.tsx

Fonte: [src/components/Footer.tsx](../../../src/components/Footer.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `Footer`.

Dependências locais declaradas: `@/components/BrandLogo`, `@/i18n/useLocalizedText`.

Integrações/imports externos: `next/link`.

## src/components/HeaderRefreshLogo.module.css

Fonte: [src/components/HeaderRefreshLogo.module.css](../../../src/components/HeaderRefreshLogo.module.css)

Regras de apresentação, estados visuais e adaptação responsiva; não é autoridade de dados.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

## src/components/HeaderRefreshLogo.tsx

Fonte: [src/components/HeaderRefreshLogo.tsx](../../../src/components/HeaderRefreshLogo.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `HeaderRefreshLogo`.

Dependências locais declaradas: `@/lib/brand-geometry`, `./HeaderRefreshLogo.module.css`.

Integrações/imports externos: `react`.

## src/components/HeroMockup.tsx

Fonte: [src/components/HeroMockup.tsx](../../../src/components/HeroMockup.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `HeroMockup`.

Integrações/imports externos: `react`, `lucide-react`.

## src/components/HomeClient.tsx

Fonte: [src/components/HomeClient.tsx](../../../src/components/HomeClient.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `HomeClient`.

Dependências locais declaradas: `@/components/landing/LandingNav`, `@/components/landing/LandingHero`, `@/components/product-demo/ProductDemo`, `@/components/landing/LandingFooter`, `@/components/landing/SiteEntryLoader`.

Integrações/imports externos: `react`.

## src/components/LanguageTag.tsx

Fonte: [src/components/LanguageTag.tsx](../../../src/components/LanguageTag.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `getLanguageColor`, `getLanguageLabel`, `LanguageTag`.

Dependências locais declaradas: `@/lib/cn`.

## src/components/LanguageToggle.module.css

Fonte: [src/components/LanguageToggle.module.css](../../../src/components/LanguageToggle.module.css)

Regras de apresentação, estados visuais e adaptação responsiva; não é autoridade de dados.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

## src/components/LanguageToggle.tsx

Fonte: [src/components/LanguageToggle.tsx](../../../src/components/LanguageToggle.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `LanguageToggle`.

Dependências locais declaradas: `@/contexts/LanguageContext`, `./LanguageToggle.module.css`.

Integrações/imports externos: `react`, `next/image`, `lucide-react`.

Testes associados pelo nome: [src/components/**tests**/LanguageToggle.test.tsx](../../../src/components/__tests__/LanguageToggle.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/components/LanguageTrailBar.module.css

Fonte: [src/components/LanguageTrailBar.module.css](../../../src/components/LanguageTrailBar.module.css)

Regras de apresentação, estados visuais e adaptação responsiva; não é autoridade de dados.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

## src/components/LanguageTrailBar.tsx

Fonte: [src/components/LanguageTrailBar.tsx](../../../src/components/LanguageTrailBar.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `LanguageTrailBar`.

Dependências locais declaradas: `./LanguageTag`, `./LanguageTrailBar.module.css`.

## src/components/LeaderboardMedal.tsx

Fonte: [src/components/LeaderboardMedal.tsx](../../../src/components/LeaderboardMedal.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `LeaderboardMedal`.

Integrações/imports externos: `react`.

Testes associados pelo nome: [src/components/**tests**/LeaderboardMedal.test.tsx](../../../src/components/__tests__/LeaderboardMedal.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/components/LevelBadge.tsx

Fonte: [src/components/LevelBadge.tsx](../../../src/components/LevelBadge.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `getLevelFromTotalXp`, `LevelBadge`.

Dependências locais declaradas: `@/i18n/useLocalizedText`, `@/lib/cn`.

Testes associados pelo nome: [src/components/**tests**/LevelBadge.test.tsx](../../../src/components/__tests__/LevelBadge.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/components/Loader.tsx

Fonte: [src/components/Loader.tsx](../../../src/components/Loader.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `Loader`.

Dependências locais declaradas: `./BrandReveal`, `@/i18n/useLocalizedText`.

Integrações/imports externos: `react`.

## src/components/MarkdownEditor.tsx

Fonte: [src/components/MarkdownEditor.tsx](../../../src/components/MarkdownEditor.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

Dependências locais declaradas: `@/components/editor/NotionEditor`.

## src/components/MarkdownRenderer.css

Fonte: [src/components/MarkdownRenderer.css](../../../src/components/MarkdownRenderer.css)

Regras de apresentação, estados visuais e adaptação responsiva; não é autoridade de dados.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

## src/components/MarkdownRenderer.tsx

Fonte: [src/components/MarkdownRenderer.tsx](../../../src/components/MarkdownRenderer.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `splitMentions`, `transformMentions`, `remarkMentions`, `isSafeHref`, `isExternalHref`, `extractText`, `SafeLink`, `SafeImage`, `renderStaticCode`, `CodeBlock`, `MarkdownRenderer`.

Dependências locais declaradas: `./MarkdownRenderer.css`, `./editor/PostTextFormatting.css`, `@/lib/cn`, `@/lib/code-runner`, `@/lib/editor/languages`, `@/lib/editor/safe-inline`.

Integrações/imports externos: `react`, `next/image`, `next/link`, `react-markdown`, `rehype-highlight`, `remark-gfm`, `highlight.js/styles/github.css`, `highlight.js/styles/github-dark.css`, `lucide-react`.

## src/components/MarkdownToolbar.tsx

Fonte: [src/components/MarkdownToolbar.tsx](../../../src/components/MarkdownToolbar.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `MarkdownToolbar`, `MarkdownToolbarAction`.

Dependências locais declaradas: `@/lib/cn`.

Integrações/imports externos: `lucide-react`.

## src/components/MobileNavigationDrawer.tsx

Fonte: [src/components/MobileNavigationDrawer.tsx](../../../src/components/MobileNavigationDrawer.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `MobileNavigationDrawer`.

Dependências locais declaradas: `@/components/auth/AccountSwitcher`, `@/contexts/LanguageContext`.

Integrações/imports externos: `react`, `next/link`, `lucide-react`.

## src/components/MobilePullToRefresh.module.css

Fonte: [src/components/MobilePullToRefresh.module.css](../../../src/components/MobilePullToRefresh.module.css)

Regras de apresentação, estados visuais e adaptação responsiva; não é autoridade de dados.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

## src/components/MobilePullToRefresh.tsx

Fonte: [src/components/MobilePullToRefresh.tsx](../../../src/components/MobilePullToRefresh.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `MobilePullToRefresh`.

Dependências locais declaradas: `@/i18n/useLocalizedText`, `./MobilePullToRefresh.module.css`.

Integrações/imports externos: `react`.

Comentários de contrato presentes na fonte:

> A mobile-only pull gesture attached to the feed, without intercepting normal scrolls.

Testes associados pelo nome: [src/components/**tests**/MobilePullToRefresh.test.tsx](../../../src/components/__tests__/MobilePullToRefresh.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/components/MobileRefreshHeader.module.css

Fonte: [src/components/MobileRefreshHeader.module.css](../../../src/components/MobileRefreshHeader.module.css)

Regras de apresentação, estados visuais e adaptação responsiva; não é autoridade de dados.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

## src/components/MobileRefreshHeader.tsx

Fonte: [src/components/MobileRefreshHeader.tsx](../../../src/components/MobileRefreshHeader.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `MobileRefreshHeader`.

Dependências locais declaradas: `./MobileRefreshHeader.module.css`.

Integrações/imports externos: `react`.

## src/components/Navbar.tsx

Fonte: [src/components/Navbar.tsx](../../../src/components/Navbar.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `UserAvatar`, `Navbar`.

Dependências locais declaradas: `@/components/BrandLogo`, `./StreakBadge`, `./LanguageToggle`, `@/contexts/LanguageContext`.

Integrações/imports externos: `next/link`, `react`, `next/image`, `next/navigation`.

## src/components/Particles.css

Fonte: [src/components/Particles.css](../../../src/components/Particles.css)

Regras de apresentação, estados visuais e adaptação responsiva; não é autoridade de dados.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

## src/components/Particles.tsx

Fonte: [src/components/Particles.tsx](../../../src/components/Particles.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

Dependências locais declaradas: `./Particles.css`.

Integrações/imports externos: `react`, `ogl`.

## src/components/PlatformPageShell.module.css

Fonte: [src/components/PlatformPageShell.module.css](../../../src/components/PlatformPageShell.module.css)

Regras de apresentação, estados visuais e adaptação responsiva; não é autoridade de dados.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

## src/components/PlatformPageShell.tsx

Fonte: [src/components/PlatformPageShell.tsx](../../../src/components/PlatformPageShell.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `PlatformPageShell`, `PlatformPageHeader`.

Dependências locais declaradas: `@/components/Sidebar`, `@/components/FeedRightSidebar`, `@/lib/cn`, `./PlatformPageShell.module.css`.

Integrações/imports externos: `react`, `next/link`, `lucide-react`.

## src/components/PlatformPresence.tsx

Fonte: [src/components/PlatformPresence.tsx](../../../src/components/PlatformPresence.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `PlatformPresence`.

Dependências locais declaradas: `@/lib/supabase/client`, `@/lib/supabase/env`.

Integrações/imports externos: `react`.

Comentários de contrato presentes na fonte:

> Heartbeats only while an authenticated browser page is visible.

Testes associados pelo nome: [src/components/PlatformPresence.test.tsx](../../../src/components/PlatformPresence.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/components/PostActionsBar.module.css

Fonte: [src/components/PostActionsBar.module.css](../../../src/components/PostActionsBar.module.css)

Regras de apresentação, estados visuais e adaptação responsiva; não é autoridade de dados.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

## src/components/PostActionsBar.tsx

Fonte: [src/components/PostActionsBar.tsx](../../../src/components/PostActionsBar.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `PostActionsBar`, `InteractionCount`, `postActionClassName`.

Dependências locais declaradas: `@/lib/cn`, `@/contexts/LanguageContext`, `./PostActionsBar.module.css`.

Integrações/imports externos: `react`.

Comentários de contrato presentes na fonte:

> Direct children are evenly spaced action slots; fewer actions need no placeholders.

Testes associados pelo nome: [src/components/**tests**/PostActionsBar.test.tsx](../../../src/components/__tests__/PostActionsBar.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/components/PostCard.module.css

Fonte: [src/components/PostCard.module.css](../../../src/components/PostCard.module.css)

Regras de apresentação, estados visuais e adaptação responsiva; não é autoridade de dados.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

## src/components/PostCard.tsx

Fonte: [src/components/PostCard.tsx](../../../src/components/PostCard.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `createSnippetMarkdown`, `PostCard`.

Dependências locais declaradas: `./motion/LikeButton`, `./motion/BookmarkButton`, `./motion/RepostMenu`, `@/components/PostActionsBar`, `@/components/AuthorAvatar`, `@/components/profile/ProfileIdentity`, `@/components/LevelBadge`, `@/components/BlockUserButton`, `@/lib/profile-style`, `./MarkdownRenderer`, `./PostPresentation`, `@/lib/cn`, `@/hooks/useHydrationSafeRelativeTime`, `@/components/motion/ComposeModal`, `@/components/MarkdownEditor`, `@/components/motion/CharCounter`, `@/lib/motion`, `@/lib/post-composer`, `@/components/posts/PostAttachments`, `@/components/posts/PostActionDialog`, `@/lib/post-content`, `@/lib/profile-music`, `@/lib/client/post-bookmarks`, `@/lib/editor/languages`, `@/i18n/useLocalizedText`, `./PostCard.module.css`.

Integrações/imports externos: `react`, `next/link`, `next/image`, `next/navigation`, `lucide-react`.

Testes associados pelo nome: [src/components/**tests**/PostCard.test.tsx](../../../src/components/__tests__/PostCard.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/components/PostComposerExtras.tsx

Fonte: [src/components/PostComposerExtras.tsx](../../../src/components/PostComposerExtras.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `useClickOutside`, `PostComposerExtras`, `PostComposerExtrasState`.

Dependências locais declaradas: `@/lib/post-composer`, `@/components/editor/NotionEditor`.

Integrações/imports externos: `react`, `lucide-react`.

## src/components/PostPresentation.tsx

Fonte: [src/components/PostPresentation.tsx](../../../src/components/PostPresentation.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `SensitiveContentGate`, `PostLocation`.

Dependências locais declaradas: `@/lib/cn`.

Integrações/imports externos: `react`, `lucide-react`.

## src/components/ProfileHeader.tsx

Fonte: [src/components/ProfileHeader.tsx](../../../src/components/ProfileHeader.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `ProfileHeader`.

Dependências locais declaradas: `./LanguageTrailBar`, `./motion/FollowButton`, `./MarkdownRenderer`.

Integrações/imports externos: `next/image`, `lucide-react`.

## src/components/ProfileHero.tsx

Fonte: [src/components/ProfileHero.tsx](../../../src/components/ProfileHero.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `joinedLabel`, `ProfileHero`, `StatCard`.

Dependências locais declaradas: `@/components/motion/FollowButton`, `@/components/LevelBadge`, `@/app/trails/TrailLanguageLogo`, `@/lib/avatar`, `@/components/StreakPopover`, `@/i18n/useLocalizedText`, `@/components/profile/ProfileIdentity`, `@/lib/profile-style`, `@/components/profile/ProfilePublic`, `@/components/auth/OAuthProviderIcons`.

Integrações/imports externos: `next/image`, `next/link`, `lucide-react`.

Testes associados pelo nome: [src/components/**tests**/ProfileHero.test.tsx](../../../src/components/__tests__/ProfileHero.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/components/ProfileReplyThread.tsx

Fonte: [src/components/ProfileReplyThread.tsx](../../../src/components/ProfileReplyThread.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `ThreadIdentity`, `ThreadContext`, `ProfileReplyThread`, `toggleLike`, `share`.

Dependências locais declaradas: `@/components/AuthorAvatar`, `@/components/profile/ProfileIdentity`, `@/components/LevelBadge`, `@/lib/profile-style`, `@/components/MarkdownRenderer`, `@/hooks/useHydrationSafeRelativeTime`, `@/components/PostActionsBar`, `@/components/motion/LikeButton`, `@/i18n/useLocalizedText`.

Integrações/imports externos: `react`, `next/link`, `lucide-react`.

Testes associados pelo nome: [src/components/**tests**/ProfileReplyThread.test.tsx](../../../src/components/__tests__/ProfileReplyThread.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/components/QuizWidget.tsx

Fonte: [src/components/QuizWidget.tsx](../../../src/components/QuizWidget.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `QuizWidget`.

Dependências locais declaradas: `@/hooks/useSoundEffects`, `@/lib/cn`.

Integrações/imports externos: `react`, `lucide-react`.

Testes associados pelo nome: [src/components/**tests**/QuizWidget.test.tsx](../../../src/components/__tests__/QuizWidget.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/components/RippleDistortion.css

Fonte: [src/components/RippleDistortion.css](../../../src/components/RippleDistortion.css)

Regras de apresentação, estados visuais e adaptação responsiva; não é autoridade de dados.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

## src/components/RippleDistortion.tsx

Fonte: [src/components/RippleDistortion.tsx](../../../src/components/RippleDistortion.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `RippleDistortionProps`.

Dependências locais declaradas: `./RippleDistortion.css`.

Integrações/imports externos: `react`, `ogl`.

## src/components/RouteLoadingScreen.tsx

Fonte: [src/components/RouteLoadingScreen.tsx](../../../src/components/RouteLoadingScreen.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `RouteLoadingScreen`.

Dependências locais declaradas: `@/components/Loader`, `@/i18n/useLocalizedText`.

## src/components/ScreenshotCarousel.tsx

Fonte: [src/components/ScreenshotCarousel.tsx](../../../src/components/ScreenshotCarousel.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `ScreenshotCarousel`.

Integrações/imports externos: `react`, `lucide-react`, `framer-motion`.

## src/components/Sidebar.tsx

Fonte: [src/components/Sidebar.tsx](../../../src/components/Sidebar.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `Sidebar`.

Dependências locais declaradas: `@/components/HeaderRefreshLogo`, `@/components/MobileRefreshHeader`, `@/components/BrandLogo`, `@/components/MobileNavigationDrawer`, `@/components/profile/ProfileIdentity`, `@/components/motion/NotificationBellIcon`, `@/components/AuthorAvatar`, `@/lib/client/current-user`, `@/contexts/LanguageContext`, `@/components/composer/PostComposerDialog`.

Integrações/imports externos: `react`, `next/link`, `next/navigation`, `lucide-react`.

## src/components/StreakBadge.tsx

Fonte: [src/components/StreakBadge.tsx](../../../src/components/StreakBadge.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `StreakBadge`.

Dependências locais declaradas: `@/components/StreakPopover`.

Integrações/imports externos: `next/image`.

## src/components/StreakPopover.tsx

Fonte: [src/components/StreakPopover.tsx](../../../src/components/StreakPopover.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `safeDate`, `StreakPopover`.

Dependências locais declaradas: `@/lib/streak`, `@/i18n/useLocalizedText`.

Integrações/imports externos: `react`, `@base-ui/react/popover`, `lucide-react`.

Testes associados pelo nome: [src/components/**tests**/StreakPopover.test.tsx](../../../src/components/__tests__/StreakPopover.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/components/ThemeLogo.tsx

Fonte: [src/components/ThemeLogo.tsx](../../../src/components/ThemeLogo.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `ThemeLogo`.

Integrações/imports externos: `next/image`.

## src/components/ThemeSync.tsx

Fonte: [src/components/ThemeSync.tsx](../../../src/components/ThemeSync.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `ThemeSync`.

Dependências locais declaradas: `@/lib/theme`.

Integrações/imports externos: `react`.

Testes associados pelo nome: [src/components/**tests**/ThemeSync.test.tsx](../../../src/components/__tests__/ThemeSync.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/components/WhoToFollow.module.css

Fonte: [src/components/WhoToFollow.module.css](../../../src/components/WhoToFollow.module.css)

Regras de apresentação, estados visuais e adaptação responsiva; não é autoridade de dados.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

## src/components/WhoToFollow.tsx

Fonte: [src/components/WhoToFollow.tsx](../../../src/components/WhoToFollow.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `WhoToFollow`, `follow`, `reasonLabel`.

Dependências locais declaradas: `@/components/AuthorAvatar`, `@/components/profile/ProfileIdentity`, `@/i18n/useLocalizedText`, `@/lib/follow-recommendations`, `@/lib/cn`, `./WhoToFollow.module.css`.

Integrações/imports externos: `react`, `next/link`, `lucide-react`.

Testes associados pelo nome: [src/components/**tests**/WhoToFollow.test.tsx](../../../src/components/__tests__/WhoToFollow.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/components/XPToast.tsx

Fonte: [src/components/XPToast.tsx](../../../src/components/XPToast.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `XPToast`.

Dependências locais declaradas: `./LanguageTag`.

Integrações/imports externos: `react`.

## src/components/answer-types.ts

Fonte: [src/components/answer-types.ts](../../../src/components/answer-types.ts)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `AnswerAuthor`, `AnswerVote`, `AnswerNode`, `MAX_ANSWER_DEPTH`.

Comentários de contrato presentes na fonte:

> Shared types for the threaded answer/comment system.

An `AnswerNode` is an answer plus its nested replies. The tree is built
server-side via Prisma's nested `include` (up to a fixed depth that matches
the UI indent cap). Replies deeper than the fetched depth are rendered flat
with a "replying to @user" badge, mirroring Twitter/X threading.

> Maximum indentation depth before replies collapse into a flat "replying to" list.

## src/components/auth/AccountSwitcher.tsx

Fonte: [src/components/auth/AccountSwitcher.tsx](../../../src/components/auth/AccountSwitcher.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `AccountSwitcher`, `act`.

Dependências locais declaradas: `@/components/AuthorAvatar`, `@/lib/client/current-user`, `@/contexts/LanguageContext`.

Integrações/imports externos: `react`, `next/link`, `lucide-react`.

## src/components/auth/AuthEmailFlow.tsx

Fonte: [src/components/auth/AuthEmailFlow.tsx](../../../src/components/auth/AuthEmailFlow.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `AuthEmailFlow`, `submit`.

Dependências locais declaradas: `@/components/BrandLogo`, `@/lib/supabase/client`, `@/contexts/LanguageContext`.

Integrações/imports externos: `react`, `next/link`, `lucide-react`.

Testes associados pelo nome: [src/components/auth/AuthEmailFlow.test.tsx](../../../src/components/auth/AuthEmailFlow.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/components/auth/AuthHero.module.css

Fonte: [src/components/auth/AuthHero.module.css](../../../src/components/auth/AuthHero.module.css)

Regras de apresentação, estados visuais e adaptação responsiva; não é autoridade de dados.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

## src/components/auth/AuthHero.tsx

Fonte: [src/components/auth/AuthHero.tsx](../../../src/components/auth/AuthHero.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `AuthHero`.

Dependências locais declaradas: `@/components/BrandLogo`, `./AuthHero.module.css`, `@/contexts/LanguageContext`.

Integrações/imports externos: `react`, `next/dynamic`, `next/link`.

## src/components/auth/OAuthProviderIcons.tsx

Fonte: [src/components/auth/OAuthProviderIcons.tsx](../../../src/components/auth/OAuthProviderIcons.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `GoogleIcon`, `GitHubIcon`, `DiscordIcon`.

## src/components/community/CommunityPage.module.css

Fonte: [src/components/community/CommunityPage.module.css](../../../src/components/community/CommunityPage.module.css)

Regras de apresentação, estados visuais e adaptação responsiva; não é autoridade de dados.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

## src/components/community/CommunityPage.tsx

Fonte: [src/components/community/CommunityPage.tsx](../../../src/components/community/CommunityPage.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `CommunityPage`.

Dependências locais declaradas: `@/components/BrandLogo`, `@/components/LanguageToggle`, `@/contexts/LanguageContext`, `./CommunityPage.module.css`.

Integrações/imports externos: `next/link`, `lucide-react`.

## src/components/composer/ComposerAttachmentPicker.tsx

Fonte: [src/components/composer/ComposerAttachmentPicker.tsx](../../../src/components/composer/ComposerAttachmentPicker.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `uploadPostMedia`, `ComposerAttachmentPicker`, `AttachmentPanel`, `ComposerAttachmentPanel`.

Dependências locais declaradas: `@/lib/post-content`, `@/lib/profile-music`, `@/components/profile-inline/MusicSelector`, `./ComposerMedia.module.css`.

Integrações/imports externos: `react`, `lucide-react`.

## src/components/composer/ComposerAttachments.tsx

Fonte: [src/components/composer/ComposerAttachments.tsx](../../../src/components/composer/ComposerAttachments.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `ComposerAttachments`, `ComposerAttachmentsProps`.

Dependências locais declaradas: `@/lib/post-content`, `@/lib/profile-music`, `./ComposerMedia.module.css`.

Integrações/imports externos: `lucide-react`.

## src/components/composer/ComposerMedia.module.css

Fonte: [src/components/composer/ComposerMedia.module.css](../../../src/components/composer/ComposerMedia.module.css)

Regras de apresentação, estados visuais e adaptação responsiva; não é autoridade de dados.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

## src/components/composer/PostComposer.css

Fonte: [src/components/composer/PostComposer.css](../../../src/components/composer/PostComposer.css)

Regras de apresentação, estados visuais e adaptação responsiva; não é autoridade de dados.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

## src/components/composer/PostComposerDialog.tsx

Fonte: [src/components/composer/PostComposerDialog.tsx](../../../src/components/composer/PostComposerDialog.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `openPostComposer`, `Tool`, `PostComposerDialog`, `ComposerUser`, `ComposerQuote`.

Dependências locais declaradas: `@/components/motion/ComposeModal`, `@/components/motion/PublishButton`, `@/components/motion/MentionDropdown`, `@/components/AuthorAvatar`, `@/components/PostComposerExtras`, `./ComposerAttachments`, `./ComposerAttachmentPicker`, `@/components/editor/NotionEditor`, `@/lib/editor/text-colors`, `@/lib/post-composer`, `@/lib/post-content`, `@/lib/profile-music`, `@/lib/editor/extract-metadata`, `@/lib/motion`, `@/lib/cn`, `./PostComposer.css`.

Integrações/imports externos: `react`, `next/dynamic`, `lucide-react`.

## src/components/credentials/BadgeArt.tsx

Fonte: [src/components/credentials/BadgeArt.tsx](../../../src/components/credentials/BadgeArt.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `BadgeArt`, `BadgeArtProps`.

Dependências locais declaradas: `@/lib/credentials/badge-art`.

Integrações/imports externos: `react`.

Testes associados pelo nome: [src/components/credentials/BadgeArt.test.tsx](../../../src/components/credentials/BadgeArt.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/components/credentials/CertificateView.tsx

Fonte: [src/components/credentials/CertificateView.tsx](../../../src/components/credentials/CertificateView.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `CertificateView`.

Dependências locais declaradas: `@/lib/credentials/types`, `@/components/BrandLogo`, `@/components/credentials/BadgeArt`, `@/lib/credentials/integrity`, `@/lib/credentials/urls`, `@/app/certificates/[id]/certificate.module.css`.

Integrações/imports externos: `next/link`, `lucide-react`.

Testes associados pelo nome: [src/components/credentials/CertificateView.test.tsx](../../../src/components/credentials/CertificateView.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/components/credentials/CredentialCollection.tsx

Fonte: [src/components/credentials/CredentialCollection.tsx](../../../src/components/credentials/CredentialCollection.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `CredentialCollection`, `CredentialShowcase`.

Dependências locais declaradas: `./BadgeArt`, `@/lib/credentials/types`, `./Credentials.module.css`.

Integrações/imports externos: `react`, `next/link`, `lucide-react`.

Testes associados pelo nome: [src/components/credentials/CredentialCollection.test.tsx](../../../src/components/credentials/CredentialCollection.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/components/credentials/Credentials.module.css

Fonte: [src/components/credentials/Credentials.module.css](../../../src/components/credentials/Credentials.module.css)

Regras de apresentação, estados visuais e adaptação responsiva; não é autoridade de dados.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

## src/components/credentials/ProfileCertificates.tsx

Fonte: [src/components/credentials/ProfileCertificates.tsx](../../../src/components/credentials/ProfileCertificates.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `OwnCertificates`, `ProfileCertificates`.

Dependências locais declaradas: `@/lib/credentials/types`, `./CredentialCollection`, `./Credentials.module.css`.

Integrações/imports externos: `react`, `lucide-react`.

Testes associados pelo nome: [src/components/credentials/ProfileCertificates.test.tsx](../../../src/components/credentials/ProfileCertificates.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/components/duels/DuelBattleHeader.tsx

Fonte: [src/components/duels/DuelBattleHeader.tsx](../../../src/components/duels/DuelBattleHeader.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `DuelBattleHeader`.

Dependências locais declaradas: `@/components/AuthorAvatar`, `@/components/LanguageTag`, `@/lib/cn`.

Integrações/imports externos: `lucide-react`.

## src/components/duels/DuelJudgingRules.tsx

Fonte: [src/components/duels/DuelJudgingRules.tsx](../../../src/components/duels/DuelJudgingRules.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `DuelJudgingRules`.

## src/components/duels/DuelTestRunner.tsx

Fonte: [src/components/duels/DuelTestRunner.tsx](../../../src/components/duels/DuelTestRunner.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `DuelTestRunner`, `TestResultItem`.

Dependências locais declaradas: `@/lib/cn`, `@/lib/duel-problems`.

Integrações/imports externos: `lucide-react`.

## src/components/duels/DuelVictoryModal.tsx

Fonte: [src/components/duels/DuelVictoryModal.tsx](../../../src/components/duels/DuelVictoryModal.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `DuelVictoryModal`.

Integrações/imports externos: `react`, `framer-motion`, `lucide-react`, `next/link`.

## src/components/editor/ExecutableCodeBlockView.tsx

Fonte: [src/components/editor/ExecutableCodeBlockView.tsx](../../../src/components/editor/ExecutableCodeBlockView.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `ExecutableCodeBlockView`.

Dependências locais declaradas: `@/components/CodeEditor`, `@/lib/editor/languages`, `@/lib/code-runner`, `@/lib/cn`.

Integrações/imports externos: `@tiptap/react`, `react`, `lucide-react`.

## src/components/editor/NotionEditor.css

Fonte: [src/components/editor/NotionEditor.css](../../../src/components/editor/NotionEditor.css)

Regras de apresentação, estados visuais e adaptação responsiva; não é autoridade de dados.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

## src/components/editor/NotionEditor.tsx

Fonte: [src/components/editor/NotionEditor.tsx](../../../src/components/editor/NotionEditor.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `NotionEditor`, `NotionEditorRef`, `EditorFormattingState`.

Dependências locais declaradas: `@/components/editor/extensions/executable-code-block`, `@/components/editor/extensions/slash-command`, `@/components/editor/extensions/post-color`, `@/lib/editor/markdown`, `@/lib/editor/text-colors`, `@/lib/cn`, `./NotionEditor.css`, `./PostTextFormatting.css`.

Integrações/imports externos: `react`, `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-placeholder`, `@tiptap/react/menus`, `lucide-react`.

## src/components/editor/PostTextFormatting.css

Fonte: [src/components/editor/PostTextFormatting.css](../../../src/components/editor/PostTextFormatting.css)

Regras de apresentação, estados visuais e adaptação responsiva; não é autoridade de dados.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

## src/components/editor/SlashCommandList.tsx

Fonte: [src/components/editor/SlashCommandList.tsx](../../../src/components/editor/SlashCommandList.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `SlashCommandList`, `SlashCommandItem`, `slashCommandItems`.

Dependências locais declaradas: `@/lib/cn`.

Integrações/imports externos: `react`, `lucide-react`.

## src/components/editor/extensions/executable-code-block.ts

Fonte: [src/components/editor/extensions/executable-code-block.ts](../../../src/components/editor/extensions/executable-code-block.ts)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `ExecutableCodeBlock`, `addAttributes`, `addNodeView`.

Dependências locais declaradas: `@/components/editor/ExecutableCodeBlockView`.

Integrações/imports externos: `@tiptap/extension-code-block`, `@tiptap/react`.

## src/components/editor/extensions/post-color.ts

Fonte: [src/components/editor/extensions/post-color.ts](../../../src/components/editor/extensions/post-color.ts)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `PostColor`, `addAttributes`, `parseHTML`, `renderHTML`.

Dependências locais declaradas: `@/lib/editor/text-colors`.

Integrações/imports externos: `@tiptap/core`.

## src/components/editor/extensions/slash-command.ts

Fonte: [src/components/editor/extensions/slash-command.ts](../../../src/components/editor/extensions/slash-command.ts)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `buildItems`, `positionMenu`, `SlashCommand`, `addProseMirrorPlugins`.

Dependências locais declaradas: `@/components/editor/SlashCommandList`.

Integrações/imports externos: `@tiptap/core`, `@tiptap/react`, `@tiptap/suggestion`.

Testes associados pelo nome: [src/components/editor/extensions/**tests**/slash-command.test.ts](../../../src/components/editor/extensions/__tests__/slash-command.test.ts). Outros testes de integração podem cobrir este módulo.

## src/components/evaluators/EvaluatorGuide.tsx

Fonte: [src/components/evaluators/EvaluatorGuide.tsx](../../../src/components/evaluators/EvaluatorGuide.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `EvaluatorGuide`, `EvaluatorGuideProps`.

Dependências locais declaradas: `./EvaluatorPages.module.css`.

Integrações/imports externos: `react`, `lucide-react`.

Testes associados pelo nome: [src/components/evaluators/**tests**/EvaluatorGuide.test.tsx](../../../src/components/evaluators/__tests__/EvaluatorGuide.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/components/evaluators/EvaluatorPages.module.css

Fonte: [src/components/evaluators/EvaluatorPages.module.css](../../../src/components/evaluators/EvaluatorPages.module.css)

Regras de apresentação, estados visuais e adaptação responsiva; não é autoridade de dados.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

## src/components/events/CreateEventModal.tsx

Fonte: [src/components/events/CreateEventModal.tsx](../../../src/components/events/CreateEventModal.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `CreateEventModal`.

Dependências locais declaradas: `@/i18n/useLocalizedText`, `./useEventDialog`, `./event-dialog.module.css`, `@/app/events/EventsContent`.

Integrações/imports externos: `react`, `framer-motion`, `lucide-react`.

## src/components/events/EventChallengesSection.tsx

Fonte: [src/components/events/EventChallengesSection.tsx](../../../src/components/events/EventChallengesSection.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `emptyExample`, `emptyChallenge`, `toDraft`, `EventChallengesSection`.

Dependências locais declaradas: `@/components/LanguageTag`, `@/i18n/useLocalizedText`, `@/lib/event-challenges`.

Integrações/imports externos: `react`, `lucide-react`.

## src/components/events/EventDetailsModal.tsx

Fonte: [src/components/events/EventDetailsModal.tsx](../../../src/components/events/EventDetailsModal.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `EventDetailsModal`.

Dependências locais declaradas: `@/i18n/useLocalizedText`, `@/lib/event-display`, `./useEventDialog`, `./event-dialog.module.css`, `@/app/events/EventsContent`, `@/components/events/EventChallengesSection`.

Integrações/imports externos: `react`, `framer-motion`, `next/image`, `next/link`, `lucide-react`.

## src/components/events/event-dialog.module.css

Fonte: [src/components/events/event-dialog.module.css](../../../src/components/events/event-dialog.module.css)

Regras de apresentação, estados visuais e adaptação responsiva; não é autoridade de dados.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

## src/components/events/useEventDialog.ts

Fonte: [src/components/events/useEventDialog.ts](../../../src/components/events/useEventDialog.ts)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `useEventDialog`.

Integrações/imports externos: `react`.

Comentários de contrato presentes na fonte:

> Keep long event forms usable with a keyboard and restore the opening control.

## src/components/landing/FaultyTerminal.module.css

Fonte: [src/components/landing/FaultyTerminal.module.css](../../../src/components/landing/FaultyTerminal.module.css)

Regras de apresentação, estados visuais e adaptação responsiva; não é autoridade de dados.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

## src/components/landing/FaultyTerminal.tsx

Fonte: [src/components/landing/FaultyTerminal.tsx](../../../src/components/landing/FaultyTerminal.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `hexToRgb`, `FaultyTerminal`, `FaultyTerminalProps`.

Dependências locais declaradas: `./FaultyTerminal.module.css`.

Integrações/imports externos: `ogl`, `react`.

## src/components/landing/LandingCTA.tsx

Fonte: [src/components/landing/LandingCTA.tsx](../../../src/components/landing/LandingCTA.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `LandingCTA`.

Integrações/imports externos: `react`, `framer-motion`, `lucide-react`, `next/link`.

## src/components/landing/LandingDuels.tsx

Fonte: [src/components/landing/LandingDuels.tsx](../../../src/components/landing/LandingDuels.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `LandingDuels`.

Integrações/imports externos: `framer-motion`, `lucide-react`.

## src/components/landing/LandingFooter.tsx

Fonte: [src/components/landing/LandingFooter.tsx](../../../src/components/landing/LandingFooter.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `LandingFooter`.

Dependências locais declaradas: `@/components/BrandLogo`, `@/contexts/LanguageContext`.

Integrações/imports externos: `next/link`.

## src/components/landing/LandingGamification.tsx

Fonte: [src/components/landing/LandingGamification.tsx](../../../src/components/landing/LandingGamification.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `LandingGamification`.

Integrações/imports externos: `framer-motion`, `lucide-react`.

## src/components/landing/LandingHero.module.css

Fonte: [src/components/landing/LandingHero.module.css](../../../src/components/landing/LandingHero.module.css)

Regras de apresentação, estados visuais e adaptação responsiva; não é autoridade de dados.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

## src/components/landing/LandingHero.tsx

Fonte: [src/components/landing/LandingHero.tsx](../../../src/components/landing/LandingHero.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `LandingHero`.

Dependências locais declaradas: `@/components/RippleDistortion`, `@/components/smoothui/animated-avatar-group`, `@/hooks/usePlatformPresence`, `@/contexts/LanguageContext`, `./LandingHero.module.css`.

Integrações/imports externos: `framer-motion`, `next/link`.

## src/components/landing/LandingHowItWorks.tsx

Fonte: [src/components/landing/LandingHowItWorks.tsx](../../../src/components/landing/LandingHowItWorks.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `LandingHowItWorks`, `TrashIconAndOthers`.

Integrações/imports externos: `framer-motion`, `lucide-react`.

## src/components/landing/LandingMarquee.tsx

Fonte: [src/components/landing/LandingMarquee.tsx](../../../src/components/landing/LandingMarquee.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `MarqueeSet`, `LandingMarquee`.

## src/components/landing/LandingNav.module.css

Fonte: [src/components/landing/LandingNav.module.css](../../../src/components/landing/LandingNav.module.css)

Regras de apresentação, estados visuais e adaptação responsiva; não é autoridade de dados.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

## src/components/landing/LandingNav.tsx

Fonte: [src/components/landing/LandingNav.tsx](../../../src/components/landing/LandingNav.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `LandingNav`.

Dependências locais declaradas: `@/components/BrandLogo`, `@/contexts/LanguageContext`, `@/components/LanguageToggle`, `./LandingNav.module.css`.

Integrações/imports externos: `react`, `next/link`, `framer-motion`.

## src/components/landing/LandingPlatformPreview.tsx

Fonte: [src/components/landing/LandingPlatformPreview.tsx](../../../src/components/landing/LandingPlatformPreview.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `LandingPlatformPreview`.

Integrações/imports externos: `react`, `framer-motion`, `lucide-react`.

## src/components/landing/LandingProfiles.tsx

Fonte: [src/components/landing/LandingProfiles.tsx](../../../src/components/landing/LandingProfiles.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `LandingProfiles`.

Integrações/imports externos: `framer-motion`, `react`, `lucide-react`.

## src/components/landing/LandingShowcase.tsx

Fonte: [src/components/landing/LandingShowcase.tsx](../../../src/components/landing/LandingShowcase.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `SectionHeading`, `FlowPreview`, `QuizPreview`, `MetricsPreview`, `HistoryPreview`, `FeatureCard`, `PlatformMockup`, `TrailCard`, `MetricCard`, `twoSum`, `highlightDuelCodeLine`, `CodeEditorWindow`, `DuelArenaMockup`, `LandingShowcase`.

Dependências locais declaradas: `@/components/BrandLogo`, `@/components/Aurora`, `@/components/ui/bento-grid`, `@/components/ui/border-beam`, `@/components/ui/MagicBento`, `@/lib/utils`, `@/contexts/LanguageContext`, `@/components/motion/RepostMenu`, `@/components/LevelBadge`, `@/components/LanguageTag`.

Integrações/imports externos: `react`, `next/link`, `lucide-react`, `animejs`, `next/image`.

## src/components/landing/LandingStatsBand.tsx

Fonte: [src/components/landing/LandingStatsBand.tsx](../../../src/components/landing/LandingStatsBand.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `formatNumber`, `AnimatedNumber`, `tick`, `LandingStatsBand`.

Integrações/imports externos: `react`, `framer-motion`.

## src/components/landing/LandingTrails.tsx

Fonte: [src/components/landing/LandingTrails.tsx](../../../src/components/landing/LandingTrails.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `LandingTrails`.

Integrações/imports externos: `react`, `framer-motion`, `lucide-react`, `next/link`.

## src/components/landing/SiteEntryLoader.module.css

Fonte: [src/components/landing/SiteEntryLoader.module.css](../../../src/components/landing/SiteEntryLoader.module.css)

Regras de apresentação, estados visuais e adaptação responsiva; não é autoridade de dados.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

## src/components/landing/SiteEntryLoader.tsx

Fonte: [src/components/landing/SiteEntryLoader.tsx](../../../src/components/landing/SiteEntryLoader.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `SiteEntryLoader`.

Dependências locais declaradas: `@/components/BrandReveal`, `./SiteEntryLoader.module.css`.

Integrações/imports externos: `react`.

Testes associados pelo nome: [src/components/landing/SiteEntryLoader.test.tsx](../../../src/components/landing/SiteEntryLoader.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/components/legal/LegalPage.tsx

Fonte: [src/components/legal/LegalPage.tsx](../../../src/components/legal/LegalPage.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `LegalPage`.

Dependências locais declaradas: `@/components/BrandLogo`, `@/components/LanguageToggle`, `@/contexts/LanguageContext`.

Integrações/imports externos: `next/link`, `lucide-react`.

## src/components/lesson/AssistanceControls.module.css

Fonte: [src/components/lesson/AssistanceControls.module.css](../../../src/components/lesson/AssistanceControls.module.css)

Regras de apresentação, estados visuais e adaptação responsiva; não é autoridade de dados.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

## src/components/lesson/AssistanceControls.tsx

Fonte: [src/components/lesson/AssistanceControls.tsx](../../../src/components/lesson/AssistanceControls.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `AssistanceControls`.

Dependências locais declaradas: `@/lib/exercises/types`, `./AssistanceControls.module.css`.

Integrações/imports externos: `lucide-react`.

## src/components/lesson/DuolingoText.tsx

Fonte: [src/components/lesson/DuolingoText.tsx](../../../src/components/lesson/DuolingoText.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `renderLineTokens`, `DuolingoText`.

Integrações/imports externos: `react`.

## src/components/lesson/ExitConfirmModal.tsx

Fonte: [src/components/lesson/ExitConfirmModal.tsx](../../../src/components/lesson/ExitConfirmModal.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `ExitConfirmModal`.

Integrações/imports externos: `lucide-react`, `framer-motion`.

## src/components/lesson/LessonFooter.module.css

Fonte: [src/components/lesson/LessonFooter.module.css](../../../src/components/lesson/LessonFooter.module.css)

Regras de apresentação, estados visuais e adaptação responsiva; não é autoridade de dados.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

## src/components/lesson/LessonFooter.tsx

Fonte: [src/components/lesson/LessonFooter.tsx](../../../src/components/lesson/LessonFooter.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `LessonFooter`.

Dependências locais declaradas: `./LessonFooter.module.css`.

Integrações/imports externos: `lucide-react`.

## src/components/lesson/LessonHeader.tsx

Fonte: [src/components/lesson/LessonHeader.tsx](../../../src/components/lesson/LessonHeader.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `GameHeartIcon`, `LessonHeader`.

Integrações/imports externos: `lucide-react`, `framer-motion`.

## src/components/lesson/LessonSummary.module.css

Fonte: [src/components/lesson/LessonSummary.module.css](../../../src/components/lesson/LessonSummary.module.css)

Regras de apresentação, estados visuais e adaptação responsiva; não é autoridade de dados.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

## src/components/lesson/LessonSummary.tsx

Fonte: [src/components/lesson/LessonSummary.tsx](../../../src/components/lesson/LessonSummary.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `LessonSummary`.

Dependências locais declaradas: `@/lib/lessons/types`, `./LessonSummary.module.css`.

Integrações/imports externos: `next/image`, `next/link`, `lucide-react`.

## src/components/lesson/renderers/CodeBlockBuilderStep.tsx

Fonte: [src/components/lesson/renderers/CodeBlockBuilderStep.tsx](../../../src/components/lesson/renderers/CodeBlockBuilderStep.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `CodeBlockBuilderStep`.

Dependências locais declaradas: `@/lib/lessons/types`, `@/hooks/useTextToSpeech`, `../DuolingoText`.

Integrações/imports externos: `next/image`, `lucide-react`.

## src/components/lesson/renderers/CodeCompletionStep.tsx

Fonte: [src/components/lesson/renderers/CodeCompletionStep.tsx](../../../src/components/lesson/renderers/CodeCompletionStep.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `CodeCompletionStep`.

Dependências locais declaradas: `@/lib/lessons/types`.

Integrações/imports externos: `lucide-react`.

## src/components/lesson/renderers/CodeEditorStep.tsx

Fonte: [src/components/lesson/renderers/CodeEditorStep.tsx](../../../src/components/lesson/renderers/CodeEditorStep.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `CodeEditorStep`.

Dependências locais declaradas: `@/components/CodeEditor`, `@/lib/lessons/types`.

Integrações/imports externos: `lucide-react`.

Testes associados pelo nome: [src/components/lesson/renderers/**tests**/CodeEditorStep.test.tsx](../../../src/components/lesson/renderers/__tests__/CodeEditorStep.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/components/lesson/renderers/ConceptStep.tsx

Fonte: [src/components/lesson/renderers/ConceptStep.tsx](../../../src/components/lesson/renderers/ConceptStep.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `ConceptStep`.

Dependências locais declaradas: `@/lib/lessons/types`, `@/hooks/useTextToSpeech`, `../DuolingoText`.

Integrações/imports externos: `lucide-react`.

## src/components/lesson/renderers/DebugStep.tsx

Fonte: [src/components/lesson/renderers/DebugStep.tsx](../../../src/components/lesson/renderers/DebugStep.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `DebugStep`.

Dependências locais declaradas: `@/components/CodeEditor`, `@/lib/lessons/types`.

Integrações/imports externos: `lucide-react`.

## src/components/lesson/renderers/MatchingPairsStep.tsx

Fonte: [src/components/lesson/renderers/MatchingPairsStep.tsx](../../../src/components/lesson/renderers/MatchingPairsStep.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `MatchingPairsStep`.

Dependências locais declaradas: `@/lib/lessons/types`.

Integrações/imports externos: `react`, `lucide-react`.

## src/components/lesson/renderers/MultipleChoiceStep.tsx

Fonte: [src/components/lesson/renderers/MultipleChoiceStep.tsx](../../../src/components/lesson/renderers/MultipleChoiceStep.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `MultipleChoiceStep`.

Dependências locais declaradas: `@/lib/lessons/types`, `@/hooks/useTextToSpeech`, `../DuolingoText`.

Integrações/imports externos: `lucide-react`.

## src/components/lesson/renderers/OrderingStep.tsx

Fonte: [src/components/lesson/renderers/OrderingStep.tsx](../../../src/components/lesson/renderers/OrderingStep.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `OrderingStep`.

Dependências locais declaradas: `@/lib/lessons/types`.

Integrações/imports externos: `lucide-react`.

## src/components/lesson/renderers/OutputPredictionStep.tsx

Fonte: [src/components/lesson/renderers/OutputPredictionStep.tsx](../../../src/components/lesson/renderers/OutputPredictionStep.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `OutputPredictionStep`.

Dependências locais declaradas: `@/lib/lessons/types`, `@/hooks/useTextToSpeech`, `../DuolingoText`.

Integrações/imports externos: `lucide-react`.

## src/components/lesson/renderers/TerminalStep.tsx

Fonte: [src/components/lesson/renderers/TerminalStep.tsx](../../../src/components/lesson/renderers/TerminalStep.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `TerminalStep`.

Dependências locais declaradas: `@/lib/lessons/types`.

Integrações/imports externos: `lucide-react`.

## src/components/motion/AnimatedCounter.tsx

Fonte: [src/components/motion/AnimatedCounter.tsx](../../../src/components/motion/AnimatedCounter.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `AnimatedCounter`.

Dependências locais declaradas: `@/hooks/useReducedMotion`.

Integrações/imports externos: `react`, `framer-motion`.

## src/components/motion/BookmarkButton.tsx

Fonte: [src/components/motion/BookmarkButton.tsx](../../../src/components/motion/BookmarkButton.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `BookmarkButton`.

Dependências locais declaradas: `@/lib/cn`, `@/hooks/useReducedMotion`, `@/hooks/useSoundEffects`, `@/i18n/useLocalizedText`, `@/components/PostActionsBar`.

Integrações/imports externos: `react`, `framer-motion`, `lucide-react`.

## src/components/motion/CharCounter.tsx

Fonte: [src/components/motion/CharCounter.tsx](../../../src/components/motion/CharCounter.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `CharCounter`.

Dependências locais declaradas: `@/lib/cn`, `@/hooks/useCharCounter`.

## src/components/motion/CommunityCard.tsx

Fonte: [src/components/motion/CommunityCard.tsx](../../../src/components/motion/CommunityCard.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `CommunityCard`.

Dependências locais declaradas: `@/lib/cn`.

Integrações/imports externos: `framer-motion`.

## src/components/motion/ComposeModal.tsx

Fonte: [src/components/motion/ComposeModal.tsx](../../../src/components/motion/ComposeModal.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `ComposeModal`.

Dependências locais declaradas: `@/lib/motion`, `@/hooks/useReducedMotion`, `@/lib/cn`.

Integrações/imports externos: `react`, `framer-motion`, `lucide-react`, `react-dom`.

## src/components/motion/DMBadge.tsx

Fonte: [src/components/motion/DMBadge.tsx](../../../src/components/motion/DMBadge.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `DMBadge`.

Dependências locais declaradas: `@/lib/cn`, `@/hooks/useReducedMotion`.

Integrações/imports externos: `lucide-react`.

## src/components/motion/EmptyState.tsx

Fonte: [src/components/motion/EmptyState.tsx](../../../src/components/motion/EmptyState.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `EmptyState`.

Dependências locais declaradas: `@/lib/cn`, `@/i18n/useLocalizedText`.

Integrações/imports externos: `framer-motion`, `lucide-react`.

## src/components/motion/ExpandedReactions.tsx

Fonte: [src/components/motion/ExpandedReactions.tsx](../../../src/components/motion/ExpandedReactions.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `ExpandedReactionButton`.

Dependências locais declaradas: `@/lib/cn`, `@/hooks/useReducedMotion`, `@/hooks/useLongPress`, `@/lib/motion`.

Integrações/imports externos: `react`, `framer-motion`, `lucide-react`.

## src/components/motion/ExploreGrid.tsx

Fonte: [src/components/motion/ExploreGrid.tsx](../../../src/components/motion/ExploreGrid.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `ExploreGrid`.

Dependências locais declaradas: `@/lib/cn`, `@/hooks/useReducedMotion`.

Integrações/imports externos: `next/image`, `framer-motion`.

## src/components/motion/FollowButton.tsx

Fonte: [src/components/motion/FollowButton.tsx](../../../src/components/motion/FollowButton.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `FollowButton`.

Dependências locais declaradas: `@/lib/cn`, `@/hooks/useReducedMotion`, `@/i18n/useLocalizedText`.

Integrações/imports externos: `react`, `framer-motion`, `lucide-react`.

## src/components/motion/FollowersModal.tsx

Fonte: [src/components/motion/FollowersModal.tsx](../../../src/components/motion/FollowersModal.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `FollowersModal`.

Dependências locais declaradas: `@/lib/motion`, `@/hooks/useReducedMotion`, `./FollowButton`.

Integrações/imports externos: `react`, `framer-motion`, `next/image`, `lucide-react`, `next/link`.

## src/components/motion/LevelUpOverlay.tsx

Fonte: [src/components/motion/LevelUpOverlay.tsx](../../../src/components/motion/LevelUpOverlay.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `getTitleForLevel`, `LevelUpOverlay`.

Dependências locais declaradas: `@/lib/motion`, `@/hooks/useReducedMotion`.

Integrações/imports externos: `framer-motion`.

## src/components/motion/LikeButton.tsx

Fonte: [src/components/motion/LikeButton.tsx](../../../src/components/motion/LikeButton.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `LikeButton`.

Dependências locais declaradas: `@/lib/cn`, `./AnimatedCounter`, `@/hooks/useReducedMotion`, `@/hooks/useSoundEffects`, `@/components/PostActionsBar`, `@/contexts/LanguageContext`.

Integrações/imports externos: `react`, `framer-motion`, `lucide-react`.

## src/components/motion/MentionDropdown.tsx

Fonte: [src/components/motion/MentionDropdown.tsx](../../../src/components/motion/MentionDropdown.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `MentionDropdown`.

Dependências locais declaradas: `@/lib/motion`.

Integrações/imports externos: `react`, `next/image`, `framer-motion`.

## src/components/motion/NewPostsPill.tsx

Fonte: [src/components/motion/NewPostsPill.tsx](../../../src/components/motion/NewPostsPill.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `NewPostsPill`.

Dependências locais declaradas: `@/lib/motion`.

Integrações/imports externos: `framer-motion`, `lucide-react`.

## src/components/motion/NotificationBellIcon.tsx

Fonte: [src/components/motion/NotificationBellIcon.tsx](../../../src/components/motion/NotificationBellIcon.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `NotificationBellIcon`.

Dependências locais declaradas: `@/lib/cn`, `@/hooks/useReducedMotion`.

Integrações/imports externos: `framer-motion`, `lucide-react`.

## src/components/motion/PostSkeleton.tsx

Fonte: [src/components/motion/PostSkeleton.tsx](../../../src/components/motion/PostSkeleton.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `PostSkeleton`, `PostSkeletonList`.

Dependências locais declaradas: `@/lib/cn`, `@/i18n/useLocalizedText`.

## src/components/motion/PostTypePill.tsx

Fonte: [src/components/motion/PostTypePill.tsx](../../../src/components/motion/PostTypePill.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `PostTypePill`.

Dependências locais declaradas: `@/lib/cn`.

Integrações/imports externos: `framer-motion`.

## src/components/motion/PublishButton.tsx

Fonte: [src/components/motion/PublishButton.tsx](../../../src/components/motion/PublishButton.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `PublishButton`.

Dependências locais declaradas: `@/lib/cn`, `./XPFloatToast`, `@/hooks/useReducedMotion`.

Integrações/imports externos: `framer-motion`.

## src/components/motion/ReactionButton.tsx

Fonte: [src/components/motion/ReactionButton.tsx](../../../src/components/motion/ReactionButton.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `ReactionButton`.

Dependências locais declaradas: `@/lib/cn`, `./AnimatedCounter`, `@/hooks/useReducedMotion`.

Integrações/imports externos: `react`, `framer-motion`, `lucide-react`.

## src/components/motion/RepostMenu.tsx

Fonte: [src/components/motion/RepostMenu.tsx](../../../src/components/motion/RepostMenu.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `RetweetIcon`, `RepostMenu`.

Dependências locais declaradas: `@/lib/cn`, `@/lib/motion`, `@/components/PostActionsBar`, `@/contexts/LanguageContext`.

Integrações/imports externos: `react`, `framer-motion`, `lucide-react`.

## src/components/motion/TabSwitcher.tsx

Fonte: [src/components/motion/TabSwitcher.tsx](../../../src/components/motion/TabSwitcher.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `TabSwitcher`.

Dependências locais declaradas: `@/lib/cn`.

Integrações/imports externos: `react`, `framer-motion`.

## src/components/motion/TrendingTopics.tsx

Fonte: [src/components/motion/TrendingTopics.tsx](../../../src/components/motion/TrendingTopics.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `TrendingTopics`.

Dependências locais declaradas: `@/lib/cn`, `@/hooks/useReducedMotion`.

Integrações/imports externos: `framer-motion`.

## src/components/motion/TypingIndicator.tsx

Fonte: [src/components/motion/TypingIndicator.tsx](../../../src/components/motion/TypingIndicator.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `TypingIndicator`.

Integrações/imports externos: `framer-motion`.

## src/components/motion/XPFloatToast.tsx

Fonte: [src/components/motion/XPFloatToast.tsx](../../../src/components/motion/XPFloatToast.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `XPFloatToast`.

Dependências locais declaradas: `@/hooks/useReducedMotion`.

Integrações/imports externos: `framer-motion`.

## src/components/motion/XPProgressBar.tsx

Fonte: [src/components/motion/XPProgressBar.tsx](../../../src/components/motion/XPProgressBar.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `XPProgressBar`.

Dependências locais declaradas: `@/lib/cn`, `@/hooks/useReducedMotion`.

Integrações/imports externos: `react`, `framer-motion`.

## src/components/mundinho/AdventureHub.tsx

Fonte: [src/components/mundinho/AdventureHub.tsx](../../../src/components/mundinho/AdventureHub.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `formatTransactionDate`, `AdventureHub`.

Dependências locais declaradas: `../../lib/mundinho/types`, `../../lib/mundinho/rules`, `../../lib/mundinho/battleAudio`, `./CodeBattle`, `./BattleEffects`, `../ColorPalette`, `../../lib/mundinho/hair-colors`, `../../lib/mundinho/world`, `./PixelArt`, `./mundinho.css`, `./assets`, `./PixelMeter`, `./Portrait`, `../../lib/mundinho/equipment`, `./EquipmentInventory`, `./EquipmentStore`, `./EquipmentSprite`, `./MultiplayerArena`, `../../lib/mundinho/arena-types`.

Integrações/imports externos: `react`, `lucide-react`.

Testes associados pelo nome: [src/components/mundinho/AdventureHub.test.tsx](../../../src/components/mundinho/AdventureHub.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/components/mundinho/BattleEffects.tsx

Fonte: [src/components/mundinho/BattleEffects.tsx](../../../src/components/mundinho/BattleEffects.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `BattleEffects`, `CREATURE_ELEMENTS`.

Integrações/imports externos: `react`.

## src/components/mundinho/CodeBattle.tsx

Fonte: [src/components/mundinho/CodeBattle.tsx](../../../src/components/mundinho/CodeBattle.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `CodeBattle`.

Dependências locais declaradas: `./assets`, `../../lib/mundinho/types`, `../../lib/mundinho/codeChallenges`, `../../lib/mundinho/code-paths`, `../../lib/mundinho/challenge-sprites.json`, `./PixelArt`.

Integrações/imports externos: `react`, `lucide-react`.

Testes associados pelo nome: [src/components/mundinho/CodeBattle.test.tsx](../../../src/components/mundinho/CodeBattle.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/components/mundinho/EquipmentInventory.tsx

Fonte: [src/components/mundinho/EquipmentInventory.tsx](../../../src/components/mundinho/EquipmentInventory.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `EquipmentInventory`.

Dependências locais declaradas: `../../lib/mundinho/equipment`, `./EquipmentSprite`.

Testes associados pelo nome: [src/components/mundinho/EquipmentInventory.test.tsx](../../../src/components/mundinho/EquipmentInventory.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/components/mundinho/EquipmentSprite.tsx

Fonte: [src/components/mundinho/EquipmentSprite.tsx](../../../src/components/mundinho/EquipmentSprite.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `EquipmentSprite`.

Dependências locais declaradas: `../../lib/mundinho/equipment`, `../../lib/mundinho/equipment-sprites.json`, `./assets`.

## src/components/mundinho/EquipmentStore.tsx

Fonte: [src/components/mundinho/EquipmentStore.tsx](../../../src/components/mundinho/EquipmentStore.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `EquipmentStore`.

Dependências locais declaradas: `../../lib/mundinho/equipment`, `./EquipmentSprite`, `./PixelArt`.

Testes associados pelo nome: [src/components/mundinho/EquipmentStore.test.tsx](../../../src/components/mundinho/EquipmentStore.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/components/mundinho/MultiplayerArena.tsx

Fonte: [src/components/mundinho/MultiplayerArena.tsx](../../../src/components/mundinho/MultiplayerArena.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `MultiplayerArena`.

Dependências locais declaradas: `../../lib/mundinho/arena-types`, `../../lib/mundinho/types`, `../../lib/mundinho/arena-rules`, `../../lib/mundinho/rules`, `./World`, `./PixelArt`, `./PixelMeter`, `./CodeBattle`, `./assets`.

Integrações/imports externos: `react`, `lucide-react`.

Testes associados pelo nome: [src/components/mundinho/MultiplayerArena.test.tsx](../../../src/components/mundinho/MultiplayerArena.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/components/mundinho/PixelArt.tsx

Fonte: [src/components/mundinho/PixelArt.tsx](../../../src/components/mundinho/PixelArt.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `PixelAvatar`, `PixelCreature`, `Coin`, `HAIR`.

Dependências locais declaradas: `./assets`, `../../lib/brand-geometry`, `../../lib/mundinho/types`, `../../lib/mundinho/avatar-palettes`, `../../lib/mundinho/hair-colors`.

Integrações/imports externos: `react`.

## src/components/mundinho/PixelMeter.tsx

Fonte: [src/components/mundinho/PixelMeter.tsx](../../../src/components/mundinho/PixelMeter.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `PixelMeter`.

Comentários de contrato presentes na fonte:

> Pixel frame and stepped fill stay independent of the authoritative health value.

## src/components/mundinho/Portrait.tsx

Fonte: [src/components/mundinho/Portrait.tsx](../../../src/components/mundinho/Portrait.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `Portrait`.

Dependências locais declaradas: `../../lib/mundinho/types`, `../../lib/mundinho/hair-colors`, `./assets`, `../../lib/mundinho/avatar-palettes`.

Integrações/imports externos: `react`.

Comentários de contrato presentes na fonte:

> Independently drawn portrait layers; all indices share the avatar's saved wardrobe.

## src/components/mundinho/ScenerySprites.tsx

Fonte: [src/components/mundinho/ScenerySprites.tsx](../../../src/components/mundinho/ScenerySprites.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `WorldPropSprite`, `HabitatSprite`.

Dependências locais declaradas: `./assets`, `../../lib/mundinho/world`.

## src/components/mundinho/TouchStick.tsx

Fonte: [src/components/mundinho/TouchStick.tsx](../../../src/components/mundinho/TouchStick.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `TouchStick`.

Integrações/imports externos: `react`.

## src/components/mundinho/World.tsx

Fonte: [src/components/mundinho/World.tsx](../../../src/components/mundinho/World.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `World`.

Dependências locais declaradas: `../../lib/mundinho/types`, `../../lib/mundinho/world`, `./PixelArt`, `./ScenerySprites`, `./PixelMeter`, `./WorldDialogue`, `./assets`, `./TouchStick`, `../../lib/mundinho/rules`, `../../lib/mundinho/arena-rules`, `../../lib/mundinho/arena-types`.

Integrações/imports externos: `react`, `lucide-react`.

Testes associados pelo nome: [src/components/mundinho/World.test.tsx](../../../src/components/mundinho/World.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/components/mundinho/WorldDialogue.tsx

Fonte: [src/components/mundinho/WorldDialogue.tsx](../../../src/components/mundinho/WorldDialogue.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `WorldDialogue`.

Dependências locais declaradas: `../../lib/mundinho/types`, `./Portrait`.

Integrações/imports externos: `react`, `lucide-react`.

Testes associados pelo nome: [src/components/mundinho/WorldDialogue.test.tsx](../../../src/components/mundinho/WorldDialogue.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/components/mundinho/assets.ts

Fonte: [src/components/mundinho/assets.ts](../../../src/components/mundinho/assets.ts)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `adventureAsset`.

## src/components/mundinho/mundinho.css

Fonte: [src/components/mundinho/mundinho.css](../../../src/components/mundinho/mundinho.css)

Regras de apresentação, estados visuais e adaptação responsiva; não é autoridade de dados.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

## src/components/posts/PostActionDialog.tsx

Fonte: [src/components/posts/PostActionDialog.tsx](../../../src/components/posts/PostActionDialog.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `PostActionDialog`.

Integrações/imports externos: `react`, `react-dom`.

## src/components/posts/PostAttachments.module.css

Fonte: [src/components/posts/PostAttachments.module.css](../../../src/components/posts/PostAttachments.module.css)

Regras de apresentação, estados visuais e adaptação responsiva; não é autoridade de dados.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

## src/components/posts/PostAttachments.tsx

Fonte: [src/components/posts/PostAttachments.tsx](../../../src/components/posts/PostAttachments.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `PostAttachments`, `PostPollWidget`.

Dependências locais declaradas: `@/lib/post-content`, `@/lib/profile-music`, `./PostAttachments.module.css`.

Integrações/imports externos: `react`, `lucide-react`.

## src/components/product-demo/DemoCamera.tsx

Fonte: [src/components/product-demo/DemoCamera.tsx](../../../src/components/product-demo/DemoCamera.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `DemoCamera`.

Dependências locais declaradas: `./timeline`.

Integrações/imports externos: `framer-motion`, `react`.

## src/components/product-demo/DemoCursor.tsx

Fonte: [src/components/product-demo/DemoCursor.tsx](../../../src/components/product-demo/DemoCursor.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `DemoCursor`.

Dependências locais declaradas: `./timeline`.

Integrações/imports externos: `framer-motion`, `lucide-react`.

## src/components/product-demo/DemoRightRail.tsx

Fonte: [src/components/product-demo/DemoRightRail.tsx](../../../src/components/product-demo/DemoRightRail.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `DemoRightRail`.

Dependências locais declaradas: `@/app/feed/FeedEngagementCard`, `@/app/trails/TrailsProgressSidebar`, `@/components/AuthorAvatar`, `./demo-data`, `./timeline`.

Integrações/imports externos: `lucide-react`.

## src/components/product-demo/DemoViewport.tsx

Fonte: [src/components/product-demo/DemoViewport.tsx](../../../src/components/product-demo/DemoViewport.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `SceneLayer`, `DemoViewport`.

Dependências locais declaradas: `@/components/BrandLogo`, `@/components/AuthorAvatar`, `./DemoRightRail`, `./DemoCamera`, `./DemoCursor`, `./timeline`, `./scenes/FeedScene`, `./scenes/TrailsScene`, `./scenes/DuelsScene`, `./scenes/ProfileScene`, `./scenes/RankingScene`.

Integrações/imports externos: `framer-motion`, `lucide-react`, `react`.

## src/components/product-demo/ProductDemo.tsx

Fonte: [src/components/product-demo/ProductDemo.tsx](../../../src/components/product-demo/ProductDemo.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `ChapterProgress`, `ProductDemo`.

Dependências locais declaradas: `@/contexts/LanguageContext`, `./DemoViewport`, `./timeline`, `./product-demo.css`.

Integrações/imports externos: `react`, `framer-motion`, `lucide-react`.

Testes associados pelo nome: [src/components/product-demo/ProductDemo.test.tsx](../../../src/components/product-demo/ProductDemo.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/components/product-demo/demo-data.ts

Fonte: [src/components/product-demo/demo-data.ts](../../../src/components/product-demo/demo-data.ts)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `demoProfile`, `demoTrails`.

## src/components/product-demo/product-demo.css

Fonte: [src/components/product-demo/product-demo.css](../../../src/components/product-demo/product-demo.css)

Regras de apresentação, estados visuais e adaptação responsiva; não é autoridade de dados.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

## src/components/product-demo/scenes/DuelsScene.tsx

Fonte: [src/components/product-demo/scenes/DuelsScene.tsx](../../../src/components/product-demo/scenes/DuelsScene.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `DuelsScene`, `fizzBuzz`.

Dependências locais declaradas: `@/components/duels/DuelBattleHeader`, `@/components/LanguageTag`.

Integrações/imports externos: `lucide-react`.

## src/components/product-demo/scenes/FeedScene.tsx

Fonte: [src/components/product-demo/scenes/FeedScene.tsx](../../../src/components/product-demo/scenes/FeedScene.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `FeedScene`, `PostActions`.

Dependências locais declaradas: `@/components/AuthorAvatar`, `@/components/LevelBadge`, `@/components/LanguageTag`, `../timeline`.

Integrações/imports externos: `framer-motion`, `lucide-react`.

## src/components/product-demo/scenes/ProfileScene.tsx

Fonte: [src/components/product-demo/scenes/ProfileScene.tsx](../../../src/components/product-demo/scenes/ProfileScene.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `ProfileScene`.

Dependências locais declaradas: `@/components/ProfileHero`, `../demo-data`, `../timeline`.

Integrações/imports externos: `framer-motion`.

## src/components/product-demo/scenes/RankingScene.tsx

Fonte: [src/components/product-demo/scenes/RankingScene.tsx](../../../src/components/product-demo/scenes/RankingScene.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `formatXp`, `XpMilestoneStrip`, `RankingRow`, `RankingScene`.

Dependências locais declaradas: `@/components/LeaderboardMedal`, `@/components/AuthorAvatar`, `@/i18n/useLocalizedText`, `../timeline`.

Integrações/imports externos: `next/link`, `next/image`, `lucide-react`, `framer-motion`.

## src/components/product-demo/scenes/TrailsScene.tsx

Fonte: [src/components/product-demo/scenes/TrailsScene.tsx](../../../src/components/product-demo/scenes/TrailsScene.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `TrailsScene`.

Dependências locais declaradas: `@/app/trails/TrailLanguageLogo`, `@/app/trails/LearningJourney.module.css`, `../timeline`.

Integrações/imports externos: `framer-motion`, `lucide-react`.

## src/components/product-demo/timeline.ts

Fonte: [src/components/product-demo/timeline.ts](../../../src/components/product-demo/timeline.ts)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `chapterAt`, `smooth`, `scenePresence`, `cameraAt`, `DURATION`, `chapters`, `SceneId`.

## src/components/profile-customization/AchievementsPanel.tsx

Fonte: [src/components/profile-customization/AchievementsPanel.tsx](../../../src/components/profile-customization/AchievementsPanel.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `AchievementsPanel`.

Dependências locais declaradas: `@/lib/profile-customization`, `@/lib/profile-style`, `./Personalization.module.css`.

Integrações/imports externos: `react`, `lucide-react`.

## src/components/profile-customization/AvatarPhotoEditor.tsx

Fonte: [src/components/profile-customization/AvatarPhotoEditor.tsx](../../../src/components/profile-customization/AvatarPhotoEditor.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `AvatarPhotoEditor`, `choose`, `applyCrop`.

Dependências locais declaradas: `./avatar-photo`, `./Personalization.module.css`.

Integrações/imports externos: `react`, `lucide-react`.

## src/components/profile-customization/Personalization.module.css

Fonte: [src/components/profile-customization/Personalization.module.css](../../../src/components/profile-customization/Personalization.module.css)

Regras de apresentação, estados visuais e adaptação responsiva; não é autoridade de dados.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

## src/components/profile-customization/ProfileCatalogEditor.tsx

Fonte: [src/components/profile-customization/ProfileCatalogEditor.tsx](../../../src/components/profile-customization/ProfileCatalogEditor.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `ProfileCatalogEditor`, `switchTab`, `applyJson`, `save`.

Dependências locais declaradas: `@/components/ColorPalette`, `@/lib/profile-customization`, `./Personalization.module.css`.

Integrações/imports externos: `react`, `next/link`, `lucide-react`.

Testes associados pelo nome: [src/components/profile-customization/ProfileCatalogEditor.test.tsx](../../../src/components/profile-customization/ProfileCatalogEditor.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/components/profile-customization/ProfilePersonalizationEditor.tsx

Fonte: [src/components/profile-customization/ProfilePersonalizationEditor.tsx](../../../src/components/profile-customization/ProfilePersonalizationEditor.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `contrast`, `ColorField`, `Preview`, `ProfilePersonalizationEditor`, `save`, `addItem`, `moveTag`, `uploadBanner`, `resolveMusic`, `searchMusic`, `PersonalizationUser`.

Dependências locais declaradas: `@/components/ColorPalette`, `@/lib/profile-customization`, `@/lib/client/current-user`, `@/components/profile/ProfileIdentity`, `./AchievementsPanel`, `./AvatarPhotoEditor`, `@/lib/profile-style`, `./Personalization.module.css`.

Integrações/imports externos: `react`, `next/link`, `lucide-react`.

Testes associados pelo nome: [src/components/profile-customization/ProfilePersonalizationEditor.test.tsx](../../../src/components/profile-customization/ProfilePersonalizationEditor.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/components/profile-customization/avatar-photo.ts

Fonte: [src/components/profile-customization/avatar-photo.ts](../../../src/components/profile-customization/avatar-photo.ts)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `avatarCropRect`, `cropAvatarPhoto`.

Testes associados pelo nome: [src/components/profile-customization/avatar-photo.test.ts](../../../src/components/profile-customization/avatar-photo.test.ts). Outros testes de integração podem cobrir este módulo.

## src/components/profile-inline/BannerColorPicker.tsx

Fonte: [src/components/profile-inline/BannerColorPicker.tsx](../../../src/components/profile-inline/BannerColorPicker.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `BannerColorPicker`.

Dependências locais declaradas: `@/components/ColorPalette`, `@/lib/profile-customization`, `./InlineProfile.module.css`.

Integrações/imports externos: `react`.

## src/components/profile-inline/ContextPopover.tsx

Fonte: [src/components/profile-inline/ContextPopover.tsx](../../../src/components/profile-inline/ContextPopover.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `ContextPopover`.

Dependências locais declaradas: `./ContextSelectors.module.css`.

Integrações/imports externos: `react`, `react-dom`, `lucide-react`.

## src/components/profile-inline/ContextSelectors.module.css

Fonte: [src/components/profile-inline/ContextSelectors.module.css](../../../src/components/profile-inline/ContextSelectors.module.css)

Regras de apresentação, estados visuais e adaptação responsiva; não é autoridade de dados.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

## src/components/profile-inline/FlagSelector.tsx

Fonte: [src/components/profile-inline/FlagSelector.tsx](../../../src/components/profile-inline/FlagSelector.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `FlagSelector`.

Dependências locais declaradas: `@/lib/profile-flags`, `./ContextSelectors.module.css`.

Integrações/imports externos: `react`, `next/image`, `lucide-react`.

## src/components/profile-inline/InlineProfile.module.css

Fonte: [src/components/profile-inline/InlineProfile.module.css](../../../src/components/profile-inline/InlineProfile.module.css)

Regras de apresentação, estados visuais e adaptação responsiva; não é autoridade de dados.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

## src/components/profile-inline/MusicSelector.tsx

Fonte: [src/components/profile-inline/MusicSelector.tsx](../../../src/components/profile-inline/MusicSelector.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `MusicSelector`.

Dependências locais declaradas: `@/lib/profile-customization`, `./ContextSelectors.module.css`.

Integrações/imports externos: `react`, `lucide-react`.

Testes associados pelo nome: [src/components/profile-inline/MusicSelector.test.tsx](../../../src/components/profile-inline/MusicSelector.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/components/profile-inline/NameColorPicker.module.css

Fonte: [src/components/profile-inline/NameColorPicker.module.css](../../../src/components/profile-inline/NameColorPicker.module.css)

Regras de apresentação, estados visuais e adaptação responsiva; não é autoridade de dados.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

## src/components/profile-inline/NameColorPicker.tsx

Fonte: [src/components/profile-inline/NameColorPicker.tsx](../../../src/components/profile-inline/NameColorPicker.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `fromHex`, `toHex`, `NameColorPicker`.

Dependências locais declaradas: `./NameColorPicker.module.css`.

Integrações/imports externos: `react`.

## src/components/profile-inline/ProfileActions.module.css

Fonte: [src/components/profile-inline/ProfileActions.module.css](../../../src/components/profile-inline/ProfileActions.module.css)

Regras de apresentação, estados visuais e adaptação responsiva; não é autoridade de dados.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

## src/components/profile-inline/ProfileActions.tsx

Fonte: [src/components/profile-inline/ProfileActions.tsx](../../../src/components/profile-inline/ProfileActions.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `ProfileActions`.

Dependências locais declaradas: `@/components/BlockUserButton`, `@/components/motion/FollowButton`, `@/i18n/useLocalizedText`, `./ProfileActions.module.css`.

Integrações/imports externos: `react`, `next/link`, `@base-ui/react/menu`, `@base-ui/react/dialog`, `lucide-react`.

Testes associados pelo nome: [src/components/profile-inline/ProfileActions.test.tsx](../../../src/components/profile-inline/ProfileActions.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/components/profile-inline/SocialProfileOverview.tsx

Fonte: [src/components/profile-inline/SocialProfileOverview.tsx](../../../src/components/profile-inline/SocialProfileOverview.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `initialBasics`, `studiesOf`, `flagsOf`, `useUnsavedProfile`, `uploadImage`, `SocialProfileOverview`, `TagEditor`, `SocialProfile`, `FollowedByUser`.

Dependências locais declaradas: `@/components/ColorPalette`, `./ProfileActions`, `./BannerColorPicker`, `./NameColorPicker`, `@/components/profile/ProfileIdentity`, `@/components/profile-customization/AvatarPhotoEditor`, `@/lib/client/current-user`, `@/lib/profile-customization`, `@/lib/profile-style`, `@/components/profile/ProfilePublic`, `./ContextPopover`, `./FlagSelector`, `./MusicSelector`, `@/components/auth/OAuthProviderIcons`, `./InlineProfile.module.css`.

Integrações/imports externos: `next/link`, `react`, `lucide-react`.

Testes associados pelo nome: [src/components/profile-inline/SocialProfileOverview.test.tsx](../../../src/components/profile-inline/SocialProfileOverview.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/components/profile/AchievementNotifications.module.css

Fonte: [src/components/profile/AchievementNotifications.module.css](../../../src/components/profile/AchievementNotifications.module.css)

Regras de apresentação, estados visuais e adaptação responsiva; não é autoridade de dados.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

## src/components/profile/AchievementNotifications.tsx

Fonte: [src/components/profile/AchievementNotifications.tsx](../../../src/components/profile/AchievementNotifications.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `AchievementNotifications`.

Dependências locais declaradas: `@/lib/supabase/client`, `@/lib/supabase/env`, `./AchievementNotifications.module.css`.

Integrações/imports externos: `react`, `next/link`, `lucide-react`.

## src/components/profile/BlockedProfile.tsx

Fonte: [src/components/profile/BlockedProfile.tsx](../../../src/components/profile/BlockedProfile.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `BlockedProfile`.

Dependências locais declaradas: `@/components/BrandLogo`, `@/components/BlockUserButton`, `@/i18n/useLocalizedText`.

Integrações/imports externos: `next/link`, `lucide-react`.

## src/components/profile/FrameDetails.tsx

Fonte: [src/components/profile/FrameDetails.tsx](../../../src/components/profile/FrameDetails.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `FrameDetails`.

Comentários de contrato presentes na fonte:

> Small vector ornaments stay legible from comment avatars to full profiles.

## src/components/profile/ProfileIdentity.module.css

Fonte: [src/components/profile/ProfileIdentity.module.css](../../../src/components/profile/ProfileIdentity.module.css)

Regras de apresentação, estados visuais e adaptação responsiva; não é autoridade de dados.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

## src/components/profile/ProfileIdentity.tsx

Fonte: [src/components/profile/ProfileIdentity.tsx](../../../src/components/profile/ProfileIdentity.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `ProfileName`, `AvatarFrame`, `ProfileFlag`, `shouldShowTitleIcon`, `renderTitleIcon`, `ProfileTitle`.

Dependências locais declaradas: `./FrameDetails`, `@/lib/profile-frames`, `@/lib/profile-customization`, `@/lib/profile-style`, `./ProfileIdentity.module.css`.

Integrações/imports externos: `react`, `lucide-react`.

Testes associados pelo nome: [src/components/profile/ProfileIdentity.test.tsx](../../../src/components/profile/ProfileIdentity.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/components/profile/ProfilePublic.module.css

Fonte: [src/components/profile/ProfilePublic.module.css](../../../src/components/profile/ProfilePublic.module.css)

Regras de apresentação, estados visuais e adaptação responsiva; não é autoridade de dados.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

## src/components/profile/ProfilePublic.tsx

Fonte: [src/components/profile/ProfilePublic.tsx](../../../src/components/profile/ProfilePublic.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `ProfilePublic`, `PublicProfileCustomization`.

Dependências locais declaradas: `@/lib/profile-customization`, `./ProfilePublic.module.css`.

Integrações/imports externos: `next/link`, `lucide-react`.

## src/components/profile/ProfileRightRail.tsx

Fonte: [src/components/profile/ProfileRightRail.tsx](../../../src/components/profile/ProfileRightRail.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `ProfileRightRail`, `ProfileRailUser`.

Dependências locais declaradas: `@/components/FeedRightSidebar`, `@/components/AchievementShowcase`.

Comentários de contrato presentes na fonte:

> The same personal progress and community rail used on the feed.

Testes associados pelo nome: [src/components/profile/ProfileRightRail.test.tsx](../../../src/components/profile/ProfileRightRail.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/components/smoothui/animated-avatar-group/index.tsx

Fonte: [src/components/smoothui/animated-avatar-group/index.tsx](../../../src/components/smoothui/animated-avatar-group/index.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `AvatarData`, `AnimatedAvatarGroupProps`.

Dependências locais declaradas: `@/lib/utils`, `@/hooks/useReducedMotion`.

Integrações/imports externos: `motion/react`, `react`.

## src/components/titles/TitlesShowcaseView.module.css

Fonte: [src/components/titles/TitlesShowcaseView.module.css](../../../src/components/titles/TitlesShowcaseView.module.css)

Regras de apresentação, estados visuais e adaptação responsiva; não é autoridade de dados.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

## src/components/titles/TitlesShowcaseView.tsx

Fonte: [src/components/titles/TitlesShowcaseView.tsx](../../../src/components/titles/TitlesShowcaseView.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `TitlesShowcaseView`.

Dependências locais declaradas: `@/components/profile/ProfileIdentity`, `@/lib/client/current-user`, `@/lib/profile-customization`, `./TitlesShowcaseView.module.css`.

Integrações/imports externos: `react`, `next/link`, `next/navigation`, `lucide-react`.

Testes associados pelo nome: [src/components/titles/**tests**/TitlesShowcaseView.test.tsx](../../../src/components/titles/__tests__/TitlesShowcaseView.test.tsx). Outros testes de integração podem cobrir este módulo.

## src/components/ui/MagicBento.css

Fonte: [src/components/ui/MagicBento.css](../../../src/components/ui/MagicBento.css)

Regras de apresentação, estados visuais e adaptação responsiva; não é autoridade de dados.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

## src/components/ui/MagicBento.tsx

Fonte: [src/components/ui/MagicBento.tsx](../../../src/components/ui/MagicBento.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `BentoCardProps`, `BentoProps`, `ParticleCard`, `GlobalSpotlight`, `BentoCardGrid`, `useMobileDetection`.

Dependências locais declaradas: `./MagicBento.css`.

Integrações/imports externos: `react`, `gsap`.

## src/components/ui/bento-grid.tsx

Fonte: [src/components/ui/bento-grid.tsx](../../../src/components/ui/bento-grid.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: sem declaração nomeada reconhecida; ler a composição do arquivo.

Dependências locais declaradas: `@/lib/utils`, `@/components/ui/button`.

Integrações/imports externos: `react`, `@radix-ui/react-icons`.

## src/components/ui/border-beam.tsx

Fonte: [src/components/ui/border-beam.tsx](../../../src/components/ui/border-beam.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `BorderBeam`.

Dependências locais declaradas: `@/lib/utils`.

Integrações/imports externos: `motion/react`, `: colorFrom,
            `.

Comentários de contrato presentes na fonte:

> The size of the border beam.

> The duration of the border beam.

> The delay of the border beam.

> The color of the border beam from.

> The color of the border beam to.

> The motion transition of the border beam.

> The class name of the border beam.

> The style of the border beam.

> Whether to reverse the animation direction.

> The initial offset position (0-100).

> The border width of the beam.

## src/components/ui/button.tsx

Fonte: [src/components/ui/button.tsx](../../../src/components/ui/button.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `Button`.

Dependências locais declaradas: `@/lib/utils`.

Integrações/imports externos: `@base-ui/react/button`, `class-variance-authority`.

## src/components/ui/compare.tsx

Fonte: [src/components/ui/compare.tsx](../../../src/components/ui/compare.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `mouseEnterHandler`, `mouseLeaveHandler`, `Compare`.

Dependências locais declaradas: `@/components/ui/sparkles`, `@/lib/utils`.

Integrações/imports externos: `react`, `motion/react`, `@tabler/icons-react`.

## src/components/ui/select.tsx

Fonte: [src/components/ui/select.tsx](../../../src/components/ui/select.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `SelectGroup`, `SelectValue`, `SelectTrigger`, `SelectContent`, `SelectLabel`, `SelectItem`, `SelectSeparator`, `SelectScrollUpButton`, `SelectScrollDownButton`.

Dependências locais declaradas: `@/lib/utils`.

Integrações/imports externos: `react`, `@base-ui/react/select`, `lucide-react`.

## src/components/ui/sparkles.tsx

Fonte: [src/components/ui/sparkles.tsx](../../../src/components/ui/sparkles.tsx)

Componente de interface; símbolos e dependências abaixo mostram sua composição.

Símbolos localizados: `SparklesCore`.

Dependências locais declaradas: `@/lib/utils`.

Integrações/imports externos: `react`, `@tsparticles/react`, `@tsparticles/engine`, `@tsparticles/slim`, `motion/react`.

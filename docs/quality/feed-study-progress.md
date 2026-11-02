# Feed study progress

Updated 2026-11-01. The shared right rail presents **Meus estudos** with the current platform's single border, neutral background, compact typography and divided language rows. The old colored tiles, thick offset borders and independent progress bars were replaced by `LanguageTrailBar`, also used in profile statistics. The compact variant preserves the profile's bar and adapts its labels to the narrow rail. An empty state and a link to continue studying lead to `/trails`.

The rail and profile use `calculateLevel(xp).nextLevelXp` from the existing reward rules for the accumulated-XP target. Neither a linear `level * 500` nor `level * 1500` is used. This is XP progress toward the next level, not course completion. No persisted progress or rewards were changed.

Verification: 11 existing profile/right-rail/feed tests passed; affected-file ESLint had no errors. Real components were checked in Chromium at 1440/dark, 1280/light, 390/dark and 320/light, including the empty state. The widget had no horizontal overflow, page errors or axe violations. Bars retained usable width and showed the expected accumulated values (260/500, 10/500 and 950/1100). Screenshots and geometry are local artifacts in `.tmp/quality/feed-studies/`; the fixture was removed before the production build. This local fixture does not establish an authenticated production session.

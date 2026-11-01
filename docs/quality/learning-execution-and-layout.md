# Lessons, exercise execution and conversations

Validated on 2026-11-01.

## Changes

- QuickJS now drains Promise continuations and bounded timers before returning an execution result. The exercise harness awaits every test case, including synchronous student functions; previously it could finish without emitting its result marker.
- Timer callbacks, arguments and Promise results have explicit handle cleanup. Execution retains the existing 5-second deadline, 32 MiB memory, 512 KiB stack and 16,384-character output limits, with at most 1,024 pending timers. No host network or filesystem APIs are exposed.
- Conversation SQL reuses the computed partner alias in `DISTINCT ON` and `ORDER BY`. Repeating a parameterized CASE expression caused PostgreSQL error 42P10. Latest-message selection, blocking in both directions and the 100-conversation limit remain intact. Transient connection failures return a retryable 503.
- Lesson and exercise screens use platform theme tokens, centered frames, consistent headings, assistance tabs, editor actions and test feedback. Ten lesson step renderers support both themes. Empty execution failures show an explanation without a misleading 0/0 result.
- Duels uses the standard 720 px main column and 380 px right rail on desktop. Its mobile dimensions remain unchanged.

## Verification

- Full Vitest suite: 215 files / 1,272 tests passed; 13 files / 45 opt-in tests skipped.
- ESLint: no errors; existing repository warnings remain.
- Actual QuickJS execution: reference solutions from 62 authored JS/TS lesson steps pass both run and submit. Ten published exercise definitions have valid verdicts for starters and passing reference solutions (40 cases). Retry-After has a dedicated regression.
- Real provider smoke checks passed for JavaScript, TypeScript, Python, Go, Rust and Java. These are basic execution samples, not exhaustive catalog checks for every external language.
- PostgreSQL integration used read-only CTE fixtures and reproduced the parameterized-query defect, then verified latest messages, ordering and blocks. A separate read-only metadata audit confirmed all 10 currently published exercises have a function name, real starter newlines and two public plus two hidden tests; the newline correction migration is applied. No database mutation was needed.
- Local Chromium checks at 1920/dark, 1440/light, 390/dark and 320/light verified an execution error, a passing public run, a passing hidden submission, a lesson step and completion, concept content and Duels. All had no horizontal overflow or page errors; desktop Duels measured 720 + 380 px with no inter-column gap.
- Browser screenshots and geometry report are local artifacts under `.tmp/quality/learning-fixes/`. The temporary fixture used real components with mocked API responses and was removed before the production build. It does not establish authenticated production behavior or physical-device coverage.
- Production build includes a postbuild check that loads the actual compiled server modules and QuickJS dependencies. It checks JS/TS output, Promise/timer order, Retry-After public/hidden exercise results, lesson evaluation, Duels and hidden-result redaction without external requests.

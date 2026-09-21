# Stacklyst security and business-logic audit prompt

Act as a senior software security engineer reviewing Stacklyst (with a Y).

Start from the latest remote main in an isolated, clean checkout. Preserve existing user changes. Read AGENTS.md and the installed framework documentation before editing. Create a descriptive security or fix branch without `codex` anywhere in its name. Never implement directly on main.

Inventory the entire repository: web and mobile clients, API handlers, services, authentication and sessions, authorization, database schema and migrations, queries, uploads, external execution providers, configuration, dependencies, containers, CI and deployment. Trace security-sensitive operations through every entry point, including direct API calls and server-rendered client props. Use OWASP Top 10 and CWE references. Distinguish broad inventory and automated scanning from code paths reviewed in depth; do not imply exhaustive assurance.

Investigate injection, XSS, CSRF, SSRF, traversal, unsafe redirects, IDOR, privilege escalation, mass assignment, secret exposure, insecure sessions and cryptography, missing validation, resource exhaustion, insecure logging, dependency advisories and production debug paths. Inspect current and historical tracked files without printing secrets. Check live database permissions read-only when authorized access exists; do not infer exposure from migrations alone.

Analyze ownership, related-entity validation, replay, duplicate rewards, concurrency, state transitions, prerequisites, calculations, failures and rollback. Reproduce important findings with regression tests before treating them as confirmed. Identify the root cause, realistic impact, severity, smallest safe correction and regression risk. Avoid speculative changes and unrelated refactors.

Make one logically related fix per English Conventional Commit. Review each diff and run its relevant tests before committing. Use existing patterns and dependencies. Keep authorization and reward persistence authoritative on the server. Document anything that cannot be safely confirmed or corrected, including infrastructure-dependent risks and required operational action.

Run appropriate unit/integration tests, lint, type checks, production build and execution smoke tests, dependency audits and secret scans. Record actual outcomes and skipped or unavailable checks. Never claim a passing check that was not successfully executed.

Push the branch and create a PR to main with Summary, Issues Fixed (component, cause, risk, fix), Validation, Risk Assessment and Remaining Concerns. Review the entire PR diff and current CI results. Merge only after review and successful required checks, honoring repository review rules. Confirm the merge commit and branch ancestry in remote main before deleting the working branch remotely and locally. Preserve unrelated branches and dirty worktrees.

Report confirmed findings and severity, affected files, fixes, tests, commits, PR URL, merge status and branch deletion status. Do not claim that Stacklyst is completely secure.

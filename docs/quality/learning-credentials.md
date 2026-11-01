# Badges and verified learning credentials

Implemented and checked on 2026-11-01.

## Behavior

The certificate collection at `/certificates` lists real goals, required activities, completion counts and earned certificates. It covers JavaScript, TypeScript, Python, Rust, Go and Java through their authored courses. Goals include one first-lesson milestone, sections, full courses, assessed practices and supported complementary paths. Empty or inferred fallback curricula never grant credentials. The public profile shows earned, valid credentials instead of the old badge catalog. Profile titles remain a separate system.

Only server-recorded assessed completions count. A complete lesson requires every non-concept step; an exercise requires an approved submission with all current public and hidden cases passed and a nonzero test count. Merely opening a lesson, running code, receiving XP, or skipping a section does not issue a credential. Existing genuine completions are reconciled when the owner opens the collection. The date is labeled **conclusion verified**, because historical attempts do not establish the exact completion time.

Each credential has an immutable recipient/definition/requirements snapshot, a UUID and a canonical SHA-256 hash. Grants are unique per learner, definition and version. Revocation does not edit learning progress and cannot silently reissue the same version. Public lookup exposes only the certificate snapshot, without account IDs, email, submitted code or expected answers. The QR points to `/certificates/{id}`; the registry checks integrity and revocation before making the PDF available.

The PDF uses a white landscape A4 composition, vector Stacklyst identity and badge, embedded licensed Sora fonts, the owner-provided signature image, verified date, estimated content load, competencies, ID, record hash and a linked vector QR. The signature is visual; this is not an ICP-Brasil/PAdES certificate. Asset provenance is in `public/assets/credentials/README.md`.

## Data change

Migration `20261101193000_learning_credentials` creates the registry with uniqueness, immutable-snapshot/revocation triggers and RLS. Browser roles have no direct table access; public verification goes through an explicit server projection.

The applied migration removed the 13 known seeded badge definitions and their 15 placeholder grants. Counts of quiz attempts, submissions, total XP and profile titles were checked unchanged. No synthetic certificate or fixture user remained after the database tests. A previously pending event-challenges migration was left untouched; this task applied only its own reviewed SQL and recorded its exact Prisma checksum.

## Checks

- Bookmarks were fixed first in commit `283f7de`: a feed click previously made two toggles, undoing the save. Explicit desired state is now idempotent; answers and post details persist the same state. Tests use real FeedContent/PostCard and a PostgreSQL transaction with unconditional rollback, including fresh reads, retries, per-user isolation and removal.
- Credential unit/API checks cover incomplete and empty requirements, all six languages, duplicate reconciliation, snapshot integrity, revoked records, ownership/public projection and PDF access.
- Real PostgreSQL checks exercised migration safety, immutable snapshots, uniqueness, RLS and irreversible revocation. Real Prisma checks exercised lesson/exercise completion hooks, wrong/partial attempts, zero-test rejection, review without duplicate XP/grants, name snapshots and rollback cleanup.
- TypeScript and ESLint passed. The full suite initially passed 1,300 tests with two failures in an existing quiz transaction mock that lacked the new collaborator. That mock was updated without changing production logic; its focused rerun covers correct/retry/wrong/replay behavior.
- Compiled production-module smoke checks exercise the actual PDF renderer and assert deployment tracing includes all fonts and the signature. PDF checks verify a single landscape A4 page, embedded identity, Unicode text, URI links and revoked/invalid-target rejection. OpenCV decoded both sample QR codes to their exact verification URL. Samples under `.tmp/quality/certificates/` are synthetic and were never issued.
- Chromium against a local production build checked 1440/dark, 1280/light, 390/dark and 320/light. Filters, empty search, earned PDF links, public verification and revoked download suppression passed, with no page errors or horizontal overflow. Axe found no violations in the public main content. The static design detector returned no findings, and an independent visual review returned `ship` for the supplied desktop/mobile and PDF evidence.
- Browser fixtures used real components and controlled sidebar API responses, not an authenticated production session. The fixture route was removed before the final build. Physical-device behavior and external accreditation were not claimed.

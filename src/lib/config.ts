/**
 * Centralized configuration for Stacklyst.
 *
 * All magic numbers, thresholds, URLs, and constants that were previously
 * hardcoded are extracted here. Values can be overridden via environment
 * variables when needed, with sensible defaults for development.
 */

/* ── External Service URLs ────────────────────────────────────── */

export const AVATAR_API_URL =
  process.env.NEXT_PUBLIC_AVATAR_API_URL || 'https://api.dicebear.com/9.x/pixel-art/svg';

export const WANDBOX_API_URL =
  process.env.WANDBOX_API_URL || 'https://wandbox.org/api/compile.json';

export const GITHUB_API_URL = process.env.GITHUB_API_URL || 'https://api.github.com';

/* ── XP & Leveling ───────────────────────────────────────────── */

export const XP_LEVEL_THRESHOLDS = [
  { level: 1, minXp: 0, nextLevelXp: 500 },
  { level: 2, minXp: 500, nextLevelXp: 800 },
  { level: 3, minXp: 800, nextLevelXp: 1100 },
  { level: 4, minXp: 1100, nextLevelXp: 1500 },
  { level: 5, minXp: 1500, nextLevelXp: 2000 },
] as const;

/** Increment per level beyond level 5. Starts at 600 and grows by 100 each level. */
export const XP_LEVEL_6_BASE = 2000;
export const XP_LEVEL_6_INCREMENT = 600;
export const XP_LEVEL_INCREMENT_GROWTH = 100;

/** XP amount for a correct quiz answer. */
export const XP_QUIZ_CORRECT = 15;

/** XP amount for posting a question. */
export const XP_POST_QUESTION = 10;

/** XP amount for posting an answer. */
export const XP_POST_ANSWER = 10;

/* ── XP thresholds for level display (floor division base) ────── */
/** XP per level bracket used in UI for "Lvl X" display. */
export const XP_PER_LEVEL_DISPLAY = 1000;

/* ── Badge Thresholds ────────────────────────────────────────── */

export const BADGE_STREAK_7_DAYS = 7;
export const BADGE_STREAK_30_DAYS = 30;
export const BADGE_ACCEPTED_ANSWERS = 5;
export const BADGE_QUIZ_MASTER_CORRECT = 5;

/* ── Default Languages (for new user trails) ─────────────────── */

export const DEFAULT_LANGUAGE_TRAILS = [
  'TS',
  'JS',
  'PYTHON',
  'RUST',
  'GO',
  'CPP',
  'JAVA',
  'KOTLIN',
  'SWIFT',
] as const;

/* ── Wandbox & Judge0 Code Runner ───────────────────────────── */

export interface WandboxLanguageConfig {
  compiler: string;
}

export const WANDBOX_LANGUAGES: Record<string, WandboxLanguageConfig> = {
  javascript: { compiler: 'nodejs-20.17.0' },
  js: { compiler: 'nodejs-20.17.0' },
  typescript: { compiler: 'typescript-5.6.2' },
  ts: { compiler: 'typescript-5.6.2' },
  python: { compiler: 'cpython-3.12.7' },
  rust: { compiler: 'rust-1.82.0' },
  go: { compiler: 'go-1.23.2' },
  cpp: { compiler: 'gcc-13.2.0' },
  java: { compiler: 'openjdk-jdk-22+36' },
  kotlin: { compiler: 'openjdk-jdk-22+36' },
  swift: { compiler: 'swift-6.0.1' },
};

export const JUDGE0_API_URL =
  process.env.JUDGE0_API_URL || 'https://ce.judge0.com/submissions?base64_encoded=false&wait=true';

export const JUDGE0_LANGUAGES: Record<string, number> = {
  javascript: 102,
  js: 102,
  typescript: 101,
  ts: 101,
  python: 71,
  kotlin: 78,
  swift: 83,
  java: 62,
  rust: 73,
  go: 60,
  cpp: 54,
  c: 50,
  ruby: 72,
  csharp: 51,
  php: 68,
};

export const WANDBOX_RUN_TIMEOUT_MS = 10000;

/* ── Rate Limiting Defaults ──────────────────────────────────── */

export const RATE_LIMIT_REGISTER = { limit: 5, window: '1 h' as const };
export const RATE_LIMIT_CODE_RUN = { limit: 30, window: '1 m' as const };
export const RATE_LIMIT_POST_CREATE = { limit: 10, window: '1 h' as const };
export const RATE_LIMIT_AI_CHAT = { limit: 12, window: '1 h' as const };
export const RATE_LIMIT_AI_REPOSITORY = { limit: 3, window: '1 h' as const };
export const RATE_LIMIT_AI_GLOBAL = { limit: 200, window: '1 h' as const };
export const RATE_LIMIT_AI_REPOSITORY_GLOBAL = { limit: 30, window: '1 h' as const };

/** Maximum conversation context forwarded to an AI provider per request. */
export const AI_CHAT_HISTORY_MESSAGES = 8;
export const AI_CHAT_MESSAGE_CHARACTERS = 4_000;

/* ── UI / Display ────────────────────────────────────────────── */

/** Character limit for post content. */
export const POST_CHAR_LIMIT = 5000;

/** View count threshold for abbreviated display (e.g., "1 mil"). */
export const VIEW_COUNT_ABBREVIATION_THRESHOLD = 1000;

/* ── Cache TTL (seconds) ─────────────────────────────────────── */

export const CACHE_TTL_DAILY_QUIZ = 3600; // 1 hour
export const CACHE_TTL_LEADERBOARD = 300; // 5 minutes
export const CACHE_TTL_USER_PROFILE = 60; // 1 minute

/* ── Fallback Quizzes (per language) ─────────────────────────── */

export const FALLBACK_QUIZZES: Record<
  string,
  { question: string; options: string[]; correct_index: number }
> = {
  TS: {
    question:
      'Qual das opções abaixo é usada para definir uma constraint (restrição) em um generic no TypeScript?',
    options: [
      'T extends SomeType',
      'T implements SomeType',
      'T requires SomeType',
      'T interface SomeType',
    ],
    correct_index: 0,
  },
  JS: {
    question: "Qual o resultado de 'typeof null' no JavaScript?",
    options: ["'null'", "'undefined'", "'object'", "'string'"],
    correct_index: 2,
  },
  PYTHON: {
    question: 'Qual dessas opções é usada para criar uma lista de forma concisa em Python?',
    options: ['Map generator', 'List comprehension', 'List compiler', 'Lambda definition'],
    correct_index: 1,
  },
  JAVA: {
    question: 'Qual classe é utilizada para criar strings mutáveis em Java de forma eficiente?',
    options: ['String', 'StringBuffer', 'StringBuilder', 'StringWriter'],
    correct_index: 2,
  },
  RUST: {
    question:
      'Qual conceito do Rust garante a segurança de memória em tempo de compilação sem Garbage Collector?',
    options: [
      'Ownership & Borrowing',
      'Smart Pointers',
      'Automatic Reference Counting',
      'Manual Freeing',
    ],
    correct_index: 0,
  },
  GO: {
    question: 'Como declaramos concorrência em Go?',
    options: [
      'async/await',
      "Utilizando go-routines (palavra-chave 'go')",
      'Threads nativas',
      'Promessas',
    ],
    correct_index: 1,
  },
  KOTLIN: {
    question: 'Qual o operador usado em Kotlin para chamadas seguras (null safety)?',
    options: ['!!', '?.', '?:', '.*'],
    correct_index: 1,
  },
  SWIFT: {
    question: 'Qual palavra-chave é usada para definir propriedades constantes em Swift?',
    options: ['let', 'var', 'const', 'val'],
    correct_index: 0,
  },
  CPP: {
    question:
      "Qual destes operadores é usado para desalocar memória alocada dinamicamente via 'new' em C++?",
    options: ['free()', 'dispose', 'delete', 'remove'],
    correct_index: 2,
  },
};

/* ── Unsplash Hero Images ────────────────────────────────────── */

export const HERO_CODE_IMAGES = [
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1800&q=80',
  'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=1800&q=80',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1800&q=80',
  'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=1800&q=80',
  'https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&w=1800&q=80',
];

export const HERO_AVATAR_IMAGES = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&h=100&q=80',
];

/* ── JWT Configuration ───────────────────────────────────────── */

/**
 * Resolve the JWT secret key.
 * - In production, MUST be set via JWT_SECRET env var (use `openssl rand -hex 32` to generate).
 * - In development, falls back to a deterministic dev-only key.
 *
 * ⚠️  Never run in production without setting this env var.
 */
function resolveJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (secret) return secret;
  return 'stacklyst-dev-only-secret-do-not-use-in-production';
}

export const JWT_SECRET = resolveJwtSecret();

/** JWT token expiration time. Default: 7 days. */
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function jwtExpirationToSeconds(value: string): number {
  const match = /^(\d+)([smhd])$/.exec(value.trim().toLowerCase());
  if (!match) return 7 * 24 * 60 * 60;

  const amount = Number.parseInt(match[1], 10);
  const unitSeconds = { s: 1, m: 60, h: 60 * 60, d: 24 * 60 * 60 } as const;
  return amount * unitSeconds[match[2] as keyof typeof unitSeconds];
}

/** JWT cookie name used for the secondary auth token. */
export const JWT_COOKIE_NAME = 'stacklyst-jwt';

/** Cookie configuration for the JWT token. */
export const JWT_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: jwtExpirationToSeconds(JWT_EXPIRES_IN),
};

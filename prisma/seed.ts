import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { Language, DuelStatus, type User } from '@prisma/client';
import { prisma } from '../src/lib/prisma';
import { createClient } from '@supabase/supabase-js';
import demoAssets from './demo-profile-assets.json';
import { COMMUNITY_PROFILES } from './demo-community/content';
import { publishCommunity } from './demo-community/publish';
import { randomInt } from 'node:crypto';
import { FOUNDATION_COURSES } from '../src/lib/learning/foundations';
import {
  DEFAULT_PROFILE_CATALOG,
  DEFAULT_PROFILE_PREFERENCES,
  DEFAULT_CHAT_PREFERENCES,
} from '../src/lib/profile-customization';

async function main() {
  console.log('🌱 Seeding Stacklyst database...\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey =
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY in environment variables.'
    );
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  // ─── Clean DB ──────────────────────────────────────────────────────────
  console.log('🧹 Cleaning up database tables...');
  await prisma.userBadge.deleteMany({});
  await prisma.badge.deleteMany({});
  await prisma.duelVote.deleteMany({});
  await prisma.duelSolution.deleteMany({});
  await prisma.duel.deleteMany({});
  await prisma.quizAttempt.deleteMany({});
  await prisma.quiz.deleteMany({});
  await prisma.answer.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.languageTrail.deleteMany({});
  await prisma.user.deleteMany({});
  console.log('🧹 Cleanup complete.\n');

  // Learning credentials are granted only from verified completion evidence.

  // ─── Clean & Create Supabase Auth Users ──────────────────────────────────
  console.log('\n👤 Provisioning Supabase Auth users...');
  const {
    data: { users },
    error: listError,
  } = await supabaseAdmin.auth.admin.listUsers();
  if (listError) {
    throw new Error(`Error listing auth users: ${listError.message}`);
  }

  const seedEmails = [
    'pedro@stacklyst.dev',
    'ana@stacklyst.dev',
    'carlos@stacklyst.dev',
    'lucas@stacklyst.dev',
    'mariana@stacklyst.dev',
    'beatriz@stacklyst.dev',
    'camila@stacklyst.dev',
    'thiago@stacklyst.dev',
  ];
  seedEmails.push(
    ...COMMUNITY_PROFILES.map(
      (p) => (demoAssets as Record<string, { emails: string[] }>)[p.username].emails.at(-1)!
    )
  );
  for (const email of new Set(seedEmails)) {
    const existing = users.find((u) => u.email === email);
    if (existing) {
      console.log(`  🗑️ Deleting existing auth user for ${email} (${existing.id})`);
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(existing.id);
      if (deleteError) {
        console.warn(`  ⚠️ Failed to delete auth user ${email}: ${deleteError.message}`);
      }
    }
  }

  const seedPassword = process.env.SEED_DEFAULT_PASSWORD;
  if (!seedPassword) {
    throw new Error(
      '❌ SEED_DEFAULT_PASSWORD obrigatória. Defina no .env.local com no mínimo 12 caracteres.'
    );
  }
  if (seedPassword.length < 12) {
    throw new Error('❌ SEED_DEFAULT_PASSWORD deve ter pelo menos 12 caracteres para segurança.');
  }

  const usersToCreate = [
    {
      email: 'pedro@stacklyst.dev',
      username: 'pedrodev',
      password: seedPassword,
      bio: 'Fullstack dev apaixonado por TypeScript e sistemas distribuídos. Criador do Stacklyst.',
      institution: 'UFMG',
      total_xp: 4250,
      github_username: 'pedrodev',
      discord_username: 'pedro.ts',
    },
    {
      email: 'ana@stacklyst.dev',
      username: 'anak',
      password: seedPassword,
      bio: 'Pythonista e entusiasta de ML. Sempre buscando o próximo desafio.',
      institution: 'USP',
      total_xp: 3100,
      github_username: 'anak',
      discord_username: 'ana.py',
    },
    {
      email: 'carlos@stacklyst.dev',
      username: 'carlosm',
      password: seedPassword,
      bio: 'Rustacean 🦀 e competidor de maratona de programação.',
      institution: 'UNICAMP',
      total_xp: 2800,
      github_username: 'carlosm',
      discord_username: 'carlos.rs',
    },
    {
      email: 'lucas@stacklyst.dev',
      username: 'lucasv8',
      password: seedPassword,
      bio: 'Engenheiro de performance JavaScript & V8 internals. Compiladores, JIT e micro-otimizações.',
      institution: 'UNICAMP',
      total_xp: 3850,
      github_username: 'lucasv8',
      discord_username: 'lucas.v8',
    },
    {
      email: 'mariana@stacklyst.dev',
      username: 'maripython',
      password: seedPassword,
      bio: 'Python Core Enthusiast 🐍. Falando sobre GIL, CPython internals, metaclasses e estruturas de dados de alta performance.',
      institution: 'USP',
      total_xp: 3400,
      github_username: 'maripython',
      discord_username: 'mari_py',
    },
    {
      email: 'beatriz@stacklyst.dev',
      username: 'beatriztech',
      password: seedPassword,
      bio: 'Arquiteta Frontend & TypeScript. Explorando novas specs da ECMAScript, reatividade fina e design systems modernos ✨',
      institution: 'UFSC',
      total_xp: 2950,
      github_username: 'beatriztech',
      discord_username: 'bia.tech',
    },
    {
      email: 'camila@stacklyst.dev',
      username: 'camilacode',
      password: seedPassword,
      bio: 'Engenheira de dados & Pythonica. Apaixonada por streaming de pipelines, generators, itertools e big data com baixo consumo de RAM 📊',
      institution: 'UFRJ',
      total_xp: 3150,
      github_username: 'camilacode',
      discord_username: 'camila_code',
    },
    {
      email: 'thiago@stacklyst.dev',
      username: 'thiagorust',
      password: seedPassword,
      bio: 'Sistemas distribuídos e concorrência sem medo em Rust 🦀. Amante de atomics, zero-cost abstractions e Tokio.',
      institution: 'UFPE',
      total_xp: 3600,
      github_username: 'thiagorust',
      discord_username: 'thiago_rs',
    },
  ];

  for (const profile of COMMUNITY_PROFILES) {
    if (usersToCreate.some((u) => u.username === profile.username)) continue;
    const asset = (demoAssets as Record<string, { emails: string[] }>)[profile.username];
    usersToCreate.push({
      email: asset.emails.at(-1)!,
      username: profile.username,
      password: seedPassword,
      bio: profile.bio,
      institution: 'Estudos independentes',
      total_xp: profile.xp,
      github_username: '',
      discord_username: '',
    });
  }

  type SeedProfile = {
    flag: string;
    flags: string[];
    frame?: { id: string; color: string; decoration: string };
    nameStyle?: { color: string | null; bold: boolean; italic: boolean; underline: boolean };
    title: { id: string; name: string; color: string; rarity: string; icon?: string };
    tags?: string[];
    studies?: Array<{
      subject: string;
      description?: string | null;
      status: 'studying' | 'paused' | 'completed';
      progress: number;
    }>;
  };

  const seedProfiles: Record<string, SeedProfile> = {
    pedrodev: {
      flag: 'BR',
      flags: ['BR'],
      frame: { id: 'orbit', color: '#38bdf8', decoration: 'orbit' },
      nameStyle: { color: '#0083fe', bold: true, italic: false, underline: false },
      title: {
        id: 'posts-1000',
        name: 'Ícone do Stacklyst',
        color: '#eab308',
        rarity: 'legendary',
        icon: 'award',
      },
      tags: ['typescript', 'nextjs', 'postgres'],
    },
    anak: {
      flag: 'BR',
      flags: ['BR'],
      frame: { id: 'alien', color: '#72b981', decoration: 'alien' },
      nameStyle: { color: '#38bdf8', bold: true, italic: false, underline: false },
      title: {
        id: 'pythonista',
        name: 'Pythonista',
        color: '#38bdf8',
        rarity: 'rare',
        icon: 'code',
      },
      tags: ['python', 'machine-learning', 'fastapi'],
    },
    carlosm: {
      flag: 'BR',
      flags: ['BR'],
      frame: { id: 'neon-blue', color: '#0083fe', decoration: 'neon' },
      nameStyle: { color: '#f97316', bold: true, italic: false, underline: false },
      title: {
        id: 'rustcean',
        name: 'Rustcean',
        color: '#f97316',
        rarity: 'rare',
        icon: 'code',
      },
      tags: ['rust', 'competitive-programming', 'algorithms'],
    },
    lucasv8: {
      flag: 'BR',
      flags: ['BR'],
      frame: { id: 'circuit', color: '#06b6d4', decoration: 'circuit' },
      nameStyle: { color: '#00e5ff', bold: true, italic: false, underline: false },
      title: {
        id: 'posts-1000',
        name: 'Ícone do Stacklyst',
        color: '#eab308',
        rarity: 'legendary',
        icon: 'award',
      },
      tags: ['javascript', 'v8', 'nodejs', 'performance'],
      studies: [{ subject: 'V8 Engine & TurboFan Internals', status: 'studying', progress: 85 }],
    },
    maripython: {
      flag: 'BR',
      flags: ['BR'],
      frame: { id: 'cyberpunk', color: '#ec4899', decoration: 'cyberpunk' },
      nameStyle: { color: '#38bdf8', bold: true, italic: false, underline: false },
      title: {
        id: 'pythonista',
        name: 'Pythonista',
        color: '#38bdf8',
        rarity: 'rare',
        icon: 'code',
      },
      tags: ['python', 'cpython', 'backend'],
      studies: [{ subject: 'CPython Memory Allocator & GIL', status: 'studying', progress: 92 }],
    },
    beatriztech: {
      flag: 'BR',
      flags: ['BR'],
      frame: { id: 'neon-purple', color: '#a855f7', decoration: 'neon' },
      nameStyle: { color: '#ec4899', bold: true, italic: false, underline: false },
      title: {
        id: 'pastel',
        name: 'Pastel',
        color: '#f59e0b',
        rarity: 'uncommon',
        icon: 'cake',
      },
      tags: ['frontend', 'typescript', 'react', 'ecmascript'],
      studies: [{ subject: 'Modern ECMAScript Specs & TC39', status: 'studying', progress: 78 }],
    },
    camilacode: {
      flag: 'BR',
      flags: ['BR'],
      frame: { id: 'galaxy', color: '#8b5cf6', decoration: 'galaxy' },
      nameStyle: { color: '#a855f7', bold: true, italic: false, underline: false },
      title: {
        id: 'estrela',
        name: 'Estrela',
        color: '#f59e0b',
        rarity: 'rare',
        icon: 'star',
      },
      tags: ['python', 'bigdata', 'pipeline', 'generators'],
      studies: [
        {
          subject: 'Streaming Pipelines com Itertools & Generators',
          status: 'studying',
          progress: 95,
        },
      ],
    },
    thiagorust: {
      flag: 'BR',
      flags: ['BR'],
      frame: { id: 'hacker', color: '#22c55e', decoration: 'hacker' },
      nameStyle: { color: '#f97316', bold: true, italic: false, underline: false },
      title: {
        id: 'rustcean',
        name: 'Rustcean',
        color: '#f97316',
        rarity: 'rare',
        icon: 'code',
      },
      tags: ['rust', 'concurrency', 'systems', 'tokio'],
      studies: [
        { subject: 'Atomics & Lock-free Data Structures', status: 'studying', progress: 88 },
      ],
    },
  };

  const createdUsers: Record<string, User> = {};

  for (const u of usersToCreate) {
    const {
      data: { user },
      error: createError,
    } = await supabaseAdmin.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { username: u.username },
    });

    if (createError) {
      throw new Error(`Error creating auth user for ${u.email}: ${createError.message}`);
    }

    if (!user) {
      throw new Error(`Auth user creation returned null user for ${u.email}`);
    }

    // Insert user into public.User
    const profileData = seedProfiles[u.username];
    const userAvatar = (demoAssets as Record<string, { avatar_url: string }>)[u.username]
      ?.avatar_url;
    const dbUser = await prisma.user.create({
      data: {
        id: user.id,
        username: u.username,
        email: u.email,
        avatar_url: userAvatar,
        avatar_config: {
          profileStyle: {
            frame:
              profileData?.frame ??
              [
                { id: 'orbit', color: '#38bdf8', decoration: 'orbit' },
                { id: 'alien', color: '#72b981', decoration: 'alien' },
                { id: 'neon-blue', color: '#0083fe', decoration: 'neon' },
              ][randomInt(3)],
            ...(profileData
              ? {
                  flag: profileData.flag,
                  flags: profileData.flags,
                  title: profileData.title,
                  nameStyle: profileData.nameStyle,
                }
              : {}),
          },
        },
        bio: u.bio,
        institution: u.institution,
        total_xp: u.total_xp,
        github_username: u.github_username ?? null,
        discord_username: u.discord_username ?? null,
      },
    });

    createdUsers[u.username] = dbUser;
    console.log(`  ✅ Auth & DB User provisioned: ${u.username} (${dbUser.id})`);
  }

  const pedro = createdUsers.pedrodev;
  const ana = createdUsers.anak;
  const carlos = createdUsers.carlosm;

  console.log(`  ✅ Users: ${Object.keys(createdUsers).join(', ')}`);

  // ─── Language Trails ──────────────────────────────────────────────────
  const trailData = [
    {
      user_id: pedro.id,
      language: Language.TS,
      xp: 1800,
      level: 5,
      streak: 12,
      last_activity_at: new Date(),
    },
    {
      user_id: pedro.id,
      language: Language.JS,
      xp: 1200,
      level: 4,
      streak: 12,
      last_activity_at: new Date(),
    },
    {
      user_id: pedro.id,
      language: Language.PYTHON,
      xp: 600,
      level: 2,
      streak: 3,
      last_activity_at: new Date(),
    },
    {
      user_id: pedro.id,
      language: Language.RUST,
      xp: 350,
      level: 1,
      streak: 0,
      last_activity_at: new Date('2026-06-01'),
    },
    {
      user_id: ana.id,
      language: Language.PYTHON,
      xp: 2100,
      level: 6,
      streak: 21,
      last_activity_at: new Date(),
    },
    {
      user_id: ana.id,
      language: Language.TS,
      xp: 500,
      level: 2,
      streak: 5,
      last_activity_at: new Date(),
    },
    {
      user_id: ana.id,
      language: Language.GO,
      xp: 200,
      level: 1,
      streak: 0,
      last_activity_at: new Date('2026-05-20'),
    },
    {
      user_id: carlos.id,
      language: Language.RUST,
      xp: 1900,
      level: 5,
      streak: 15,
      last_activity_at: new Date(),
    },
    {
      user_id: carlos.id,
      language: Language.CPP,
      xp: 800,
      level: 3,
      streak: 8,
      last_activity_at: new Date(),
    },
    {
      user_id: carlos.id,
      language: Language.GO,
      xp: 400,
      level: 1,
      streak: 2,
      last_activity_at: new Date(),
    },
  ];

  for (const trail of trailData) {
    await prisma.languageTrail.upsert({
      where: {
        user_id_language: { user_id: trail.user_id, language: trail.language },
      },
      update: trail,
      create: trail,
    });
  }
  console.log(`  ✅ Language Trails: ${trailData.length} created`);

  // ─── Posts ────────────────────────────────────────────────────────────
  const post1 = await prisma.post.create({
    data: {
      author_id: pedro.id,
      title: 'Como tipar corretamente generics com constraints em TypeScript?',
      body: 'Estou tentando criar uma função genérica que aceite apenas objetos com uma propriedade `id`. Tentei usar `extends` mas o TypeScript reclama quando tento acessar outras propriedades. Qual a abordagem correta?',
      language: Language.TS,
      code_snippet: `function findById<T extends { id: string }>(items: T[], id: string): T | undefined {
  return items.find(item => item.id === id);
}

// Funciona, mas quero também garantir que T tenha 'name'
// Como faço constraints compostas?`,
      view_count: 42,
    },
  });

  await prisma.post.create({
    data: {
      author_id: ana.id,
      title: 'Melhor forma de lidar com async generators em Python 3.12?',
      body: 'Preciso processar um stream de dados grande vindo de uma API. Estou usando `async for` mas quero saber se há patterns melhores para backpressure e error handling.',
      language: Language.PYTHON,
      code_snippet: `async def fetch_stream(url: str):
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            async for chunk in response.content.iter_chunked(1024):
                yield process_chunk(chunk)

async def main():
    async for result in fetch_stream("https://api.example.com/data"):
        print(result)`,
      view_count: 38,
    },
  });

  const post3 = await prisma.post.create({
    data: {
      author_id: carlos.id,
      title: "Ownership e lifetimes em Rust: quando usar &'static?",
      body: "Tenho uma struct que precisa guardar uma referência string. Devo usar &'static str, String, ou Cow<str>? Quais os trade-offs de cada abordagem em termos de performance e ergonomia?",
      language: Language.RUST,
      code_snippet: `struct Config {
    name: String,        // owned - always allocated
    // vs
    // name: &'static str, // static ref - only literals
    // vs
    // name: Cow<'a, str>, // flexible but complex
}

impl Config {
    fn new(name: impl Into<String>) -> Self {
        Self { name: name.into() }
    }
}`,
      view_count: 55,
    },
  });

  await prisma.post.create({
    data: {
      author_id: pedro.id,
      title: 'Server Components vs Client Components no Next.js 16',
      body: "Estou confuso sobre quando usar 'use client' vs manter como Server Component. Alguém pode explicar as regras práticas para decidir? Especialmente com data fetching.",
      language: Language.TS,
      code_snippet: `// Server Component (padrão)
async function UserProfile({ userId }: { userId: string }) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return <div>{user?.username}</div>;
}

// Quando preciso de interatividade, uso 'use client'
// Mas e se preciso de dados E interatividade?`,
      view_count: 91,
    },
  });

  const post5 = await prisma.post.create({
    data: {
      author_id: ana.id,
      title: 'Goroutines vazando memória — como debugar?',
      body: 'Tenho um serviço Go que gradualmente consome mais memória. Suspeito de goroutine leaks. Quais ferramentas e técnicas vocês usam para identificar goroutines órfãs?',
      language: Language.GO,
      code_snippet: `func processRequests(ch <-chan Request) {
    for req := range ch {
        go func(r Request) {
            result, err := heavyComputation(r)
            if err != nil {
                log.Printf("error: %v", err)
                return // goroutine termina, mas será que sempre?
            }
            sendResponse(result)
        }(req)
    }
}`,
      view_count: 33,
    },
  });

  // ─── Answers ──────────────────────────────────────────────────────────
  await prisma.answer.create({
    data: {
      post_id: post1.id,
      author_id: ana.id,
      body: 'Você pode usar intersection types para compor constraints! Basta fazer `T extends { id: string } & { name: string }` ou criar uma interface separada.',
      code_snippet: `interface Identifiable { id: string; }
interface Nameable { name: string; }

function findByIdWithName<T extends Identifiable & Nameable>(
  items: T[], id: string
): T | undefined {
  const item = items.find(i => i.id === id);
  if (item) console.log(\`Found: \${item.name}\`);
  return item;
}`,
      is_accepted: true,
      upvotes: 7,
    },
  });

  await prisma.answer.create({
    data: {
      post_id: post1.id,
      author_id: carlos.id,
      body: 'Outra abordagem é usar `satisfies` junto com generics para ter type-narrowing mais preciso. O TS 5+ melhorou bastante isso.',
      upvotes: 3,
    },
  });

  await prisma.answer.create({
    data: {
      post_id: post3.id,
      author_id: pedro.id,
      body: "Na prática, use String quando o dado vem de input dinâmico (API, user input). Use &'static str apenas para constantes conhecidas em compile-time. Cow é ótimo para libs que querem aceitar ambos sem forçar alocação.",
      code_snippet: `use std::borrow::Cow;

struct Config<'a> {
    name: Cow<'a, str>,
}

// Aceita tanto &str quanto String:
let c1 = Config { name: Cow::Borrowed("literal") };
let c2 = Config { name: Cow::Owned(format!("dynamic_{}", 42)) };`,
      is_accepted: true,
      upvotes: 12,
    },
  });

  await prisma.answer.create({
    data: {
      post_id: post5.id,
      author_id: carlos.id,
      body: 'Use `runtime.NumGoroutine()` para monitorar o número de goroutines. Para profiling detalhado, `pprof` com goroutine profile é essencial. Também considere usar `errgroup` ou `semaphore` para limitar concorrência.',
      code_snippet: `import "runtime/pprof"

// Em um handler HTTP de debug:
func debugHandler(w http.ResponseWriter, r *http.Request) {
    profile := pprof.Lookup("goroutine")
    profile.WriteTo(w, 1)
}`,
      upvotes: 5,
    },
  });

  // ─── Quizzes ──────────────────────────────────────────────────────────
  const quiz1 = await prisma.quiz.create({
    data: {
      post_id: post1.id,
      question: 'Qual keyword do TypeScript permite restringir um tipo genérico?',
      options: ['implements', 'extends', 'satisfies', 'constrains'],
      correct_index: 1,
    },
  });

  const quiz2 = await prisma.quiz.create({
    data: {
      post_id: post3.id,
      question: 'Em Rust, qual tipo permite possuir OU emprestar uma string?',
      options: ['Box<str>', "&'static str", "Cow<'a, str>", 'Rc<str>'],
      correct_index: 2,
    },
  });

  console.log(`  ✅ Quizzes: 2 created`);

  // ─── Daily Quizzes ───────────────────────────────────────────────────
  await prisma.quiz.create({
    data: {
      post_id: null,
      question: "Qual a diferença básica entre '==' e '===' no JavaScript?",
      options: [
        "'==' compara tipo e valor, '===' apenas valor",
        "'==' compara apenas valor fazendo coerção de tipo, '===' compara tipo e valor sem coerção",
        'Ambos funcionam de forma idêntica em todos os tipos de dados',
        'Nenhuma das anteriores',
      ],
      correct_index: 1,
      is_daily: true,
    },
  });

  await prisma.quiz.create({
    data: {
      post_id: null,
      question: "Qual a função do operador 'yield' em Python?",
      options: [
        'Terminar a execução do script imediatamente',
        'Criar uma constante local dentro de um escopo',
        'Suspender temporariamente a execução da função e retornar um gerador',
        'Criar um decorator dinâmico',
      ],
      correct_index: 2,
      is_daily: true,
    },
  });

  await prisma.quiz.create({
    data: {
      post_id: null,
      question: 'O que faz o Garbage Collector no Java?',
      options: [
        'Otimiza a gravação de arquivos em disco de forma assíncrona',
        'Libera a memória heap ocupada por objetos que não possuem mais referências ativas',
        'Acelera as operações matemáticas em laços complexos',
        'Compila código Java diretamente para binário nativo',
      ],
      correct_index: 1,
      is_daily: true,
    },
  });

  await prisma.quiz.create({
    data: {
      post_id: null,
      question:
        "Como o Rust garante segurança contra 'data races' na concorrência em tempo de compilação?",
      options: [
        'Utilizando um Garbage Collector dinâmico de alta performance',
        'Por meio dos traits Send e Sync e verificação estática das regras de borrow checker',
        'Impedindo totalmente o uso de threads nativas do sistema operacional',
        'Com tratamento obrigatório de exceções em escopos concorrentes',
      ],
      correct_index: 1,
      is_daily: true,
    },
  });

  await prisma.quiz.create({
    data: {
      post_id: null,
      question: 'Qual a finalidade de um canal (channel) em Go?',
      options: [
        'Acessar conexões de banco de dados externas',
        'Transmitir pacotes HTTP brutos entre servidores',
        'Permitir a comunicação síncrona ou assíncrona e troca de dados segura entre goroutines',
        'Configurar variáveis de ambiente do sistema operacional',
      ],
      correct_index: 2,
      is_daily: true,
    },
  });

  console.log(`  ✅ Daily Quizzes: 5 created`);

  // ─── Quiz Attempts ────────────────────────────────────────────────────
  await prisma.quizAttempt.create({
    data: {
      user_id: ana.id,
      quiz_id: quiz1.id,
      selected_index: 1,
      is_correct: true,
      xp_earned: 25,
    },
  });

  await prisma.quizAttempt.create({
    data: {
      user_id: carlos.id,
      quiz_id: quiz2.id,
      selected_index: 2,
      is_correct: true,
      xp_earned: 25,
    },
  });

  console.log(`  ✅ Quiz Attempts: 2 created`);

  // ─── Trail Completion & Earned Titles ──────────────────────────────────
  const pythonCourse = FOUNDATION_COURSES.find((c) => c.id === 'foundations-python');
  if (pythonCourse) {
    const pythonSteps = pythonCourse.lessons.flatMap((lesson) =>
      lesson.steps.filter((step) => step.type !== 'concept_explanation')
    );
    for (const step of pythonSteps) {
      await prisma.quiz.upsert({
        where: { id: step.id },
        create: {
          id: step.id,
          question: step.title || step.id,
          options: ['Avaliado no servidor'],
          correct_index: 0,
          is_daily: false,
        },
        update: {},
      });
      await prisma.quizAttempt.upsert({
        where: { user_id_quiz_id: { user_id: ana.id, quiz_id: step.id } },
        create: {
          user_id: ana.id,
          quiz_id: step.id,
          selected_index: 0,
          is_correct: true,
          xp_earned: 10,
        },
        update: { is_correct: true },
      });
    }
  }

  const rustCourse = FOUNDATION_COURSES.find((c) => c.id === 'foundations-rust');
  if (rustCourse) {
    const rustSteps = rustCourse.lessons.flatMap((lesson) =>
      lesson.steps.filter((step) => step.type !== 'concept_explanation')
    );
    for (const step of rustSteps) {
      await prisma.quiz.upsert({
        where: { id: step.id },
        create: {
          id: step.id,
          question: step.title || step.id,
          options: ['Avaliado no servidor'],
          correct_index: 0,
          is_daily: false,
        },
        update: {},
      });
      await prisma.quizAttempt.upsert({
        where: { user_id_quiz_id: { user_id: carlos.id, quiz_id: step.id } },
        create: {
          user_id: carlos.id,
          quiz_id: step.id,
          selected_index: 0,
          is_correct: true,
          xp_earned: 10,
        },
        update: { is_correct: true },
      });
    }
  }

  for (const [uname, prof] of Object.entries(seedProfiles)) {
    const user = createdUsers[uname];
    if (!user || !prof.title?.id) continue;

    const achDef = DEFAULT_PROFILE_CATALOG.achievements.find((a) => a.id === prof.title.id);
    if (achDef) {
      await prisma.userProfileAchievement.upsert({
        where: { userId_achievementId: { userId: user.id, achievementId: prof.title.id } },
        create: {
          userId: user.id,
          achievementId: prof.title.id,
          definition: achDef,
          unlockedAt: new Date(),
        },
        update: { definition: achDef },
      });
    }

    const prefPayload = {
      ...DEFAULT_PROFILE_PREFERENCES,
      frameId: prof.frame?.id ?? 'none',
      equippedTitleId: prof.title.id,
      nameStyle: prof.nameStyle ?? DEFAULT_PROFILE_PREFERENCES.nameStyle,
      flag: prof.flag,
      flags: prof.flags,
      tags: prof.tags ?? [],
      studies: prof.studies?.map((study) => study.subject) ?? [],
      studyDetails: prof.studies ?? [],
    };

    await prisma.profileCustomization.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        preferences: prefPayload,
        chat: DEFAULT_CHAT_PREFERENCES,
      },
      update: {
        preferences: prefPayload,
      },
    });
  }

  console.log(
    `  ✅ Profile customizations and titles seeded for all ${Object.keys(seedProfiles).length} profiles`
  );

  // ─── Duels ────────────────────────────────────────────────────────────
  const duel1 = await prisma.duel.create({
    data: {
      challenger_id: pedro.id,
      opponent_id: carlos.id,
      problem_title: 'FizzBuzz Otimizado',
      problem_body:
        'Implemente FizzBuzz de 1 a 1000 da forma mais eficiente possível na linguagem escolhida. Pontos extras por evitar operações de módulo.',
      language: Language.TS,
      status: DuelStatus.ACTIVE,
    },
  });

  await prisma.duel.create({
    data: {
      challenger_id: ana.id,
      opponent_id: null,
      problem_title: 'Parser de expressões matemáticas',
      problem_body:
        "Crie um parser que avalie expressões como '2 + 3 * (4 - 1)' respeitando precedência de operadores. Sem usar eval().",
      language: Language.PYTHON,
      status: DuelStatus.PENDING,
    },
  });

  console.log(`  ✅ Duels: 2 created (1 ACTIVE, 1 PENDING)`);

  // ─── Duel Solutions ───────────────────────────────────────────────────
  await prisma.duelSolution.create({
    data: {
      duel_id: duel1.id,
      user_id: pedro.id,
      code: `function fizzBuzz(): string[] {
  const result: string[] = [];
  for (let i = 1; i <= 1000; i++) {
    const fizz = i % 3 === 0;
    const buzz = i % 5 === 0;
    result.push(fizz && buzz ? "FizzBuzz" : fizz ? "Fizz" : buzz ? "Buzz" : String(i));
  }
  return result;
}`,
      vote_count: 3,
    },
  });

  await prisma.duelSolution.create({
    data: {
      duel_id: duel1.id,
      user_id: carlos.id,
      code: `function fizzBuzz(): string[] {
  const result: string[] = new Array(1000);
  let fizz = 0, buzz = 0;
  for (let i = 1; i <= 1000; i++) {
    fizz++; buzz++;
    if (fizz === 3 && buzz === 5) { result[i-1] = "FizzBuzz"; fizz = 0; buzz = 0; }
    else if (fizz === 3) { result[i-1] = "Fizz"; fizz = 0; }
    else if (buzz === 5) { result[i-1] = "Buzz"; buzz = 0; }
    else { result[i-1] = String(i); }
  }
  return result;
}`,
      vote_count: 5,
    },
  });

  console.log(`  ✅ Duel Solutions: 2 created`);

  // ─── Quiz Library ──────────────────────────────────────────────────────
  const quizLibraryItems = [
    {
      question: 'Qual protocolo é a base da comunicação de dados na World Wide Web?',
      options: ['FTP', 'SMTP', 'HTTP', 'SSH'],
      correct_index: 2,
      tags: ['web', 'network'],
    },
    {
      question: 'O que significa a sigla SQL?',
      options: [
        'Structured Query Language',
        'Simple Queue List',
        'System Query Link',
        'Standard Query Line',
      ],
      correct_index: 0,
      tags: ['database', 'sql'],
    },
    {
      question: 'Qual linguagem é conhecida pelo mascote do caranguejo Ferris?',
      options: ['Go', 'Rust', 'Swift', 'C++'],
      correct_index: 1,
      tags: ['rust', 'languages'],
    },
    {
      question: 'No git, qual comando é usado para criar uma cópia de um repositório existente?',
      options: ['git copy', 'git fork', 'git clone', 'git replicate'],
      correct_index: 2,
      tags: ['git', 'version-control'],
    },
    {
      question: 'Qual estrutura de dados funciona no modelo LIFO (Last In, First Out)?',
      options: ['Fila (Queue)', 'Pilha (Stack)', 'Vetor (Array)', 'Lista Ligada (Linked List)'],
      correct_index: 1,
      tags: ['cs', 'data-structures'],
    },
    {
      question: "O que faz o comando 'docker build'?",
      options: [
        'Roda um container',
        'Cria uma imagem a partir de um Dockerfile',
        'Para um container em execução',
        'Lista os containers ativos',
      ],
      correct_index: 1,
      tags: ['docker', 'devops'],
    },
    {
      question: 'Qual dessas opções é um banco de dados NoSQL baseado em documentos?',
      options: ['PostgreSQL', 'MongoDB', 'MySQL', 'SQLite'],
      correct_index: 1,
      tags: ['database', 'nosql'],
    },
    {
      question:
        'Qual método HTTP é normalmente utilizado para enviar dados para criar um novo recurso no servidor?',
      options: ['GET', 'POST', 'PUT', 'DELETE'],
      correct_index: 1,
      tags: ['http', 'web'],
    },
    {
      question: 'O que o acrônimo API significa?',
      options: [
        'Application Programming Interface',
        'Advanced Program Integration',
        'Automated Protocol Interface',
        'Active Processing Index',
      ],
      correct_index: 0,
      tags: ['programming', 'architecture'],
    },
    {
      question: 'Qual porta padrão é usada para conexões HTTPS seguras?',
      options: ['80', '22', '443', '8080'],
      correct_index: 2,
      tags: ['security', 'network'],
    },
    {
      question: 'Qual tecnologia é usada para estilizar páginas HTML na web?',
      options: ['CSS', 'JavaScript', 'XML', 'PHP'],
      correct_index: 0,
      tags: ['frontend', 'css'],
    },
    {
      question:
        'No JavaScript, qual declaração cria uma variável de escopo de bloco que não pode ser reatribuída?',
      options: ['var', 'let', 'const', 'def'],
      correct_index: 2,
      tags: ['javascript', 'programming'],
    },
    {
      question: "O que significa 'CI' no contexto de desenvolvimento de software modernos (CI/CD)?",
      options: [
        'Continuous Integration',
        'Code Inspection',
        'Compile Instance',
        'Control Interface',
      ],
      correct_index: 0,
      tags: ['ci-cd', 'devops'],
    },
    {
      question:
        'Qual das alternativas abaixo é uma ferramenta utilizada para gerenciar pacotes no ecossistema Node.js?',
      options: ['pip', 'maven', 'npm', 'composer'],
      correct_index: 2,
      tags: ['nodejs', 'tools'],
    },
    {
      question:
        'Qual dos seguintes algoritmos de ordenação tem a melhor complexidade de tempo no pior caso?',
      options: ['Bubble Sort', 'Insertion Sort', 'Merge Sort', 'Selection Sort'],
      correct_index: 2,
      tags: ['algorithms', 'cs'],
    },
    {
      question: 'Qual empresa desenvolveu o framework React?',
      options: ['Google', 'Microsoft', 'Meta (Facebook)', 'Apple'],
      correct_index: 2,
      tags: ['frontend', 'react'],
    },
    {
      question:
        'Qual é o principal propósito de um índice (Index) em uma tabela de banco de dados relacional?',
      options: [
        'Garantir a segurança dos dados',
        'Acelerar a velocidade de consulta',
        'Compactar o armazenamento',
        'Permitir chaves estrangeiras',
      ],
      correct_index: 1,
      tags: ['database', 'sql'],
    },
    {
      question: "O que o termo 'Open Source' descreve na comunidade de tecnologia?",
      options: [
        'Software cujo código-fonte é público e pode ser modificado',
        'Sistemas operacionais gratuitos',
        'Código proprietário compartilhado internamente',
        'Projetos em nuvem sem servidores',
      ],
      correct_index: 0,
      tags: ['open-source', 'culture'],
    },
    {
      question:
        'Qual protocolo de rede é responsável por traduzir nomes de domínio legíveis (como stacklyst.dev) para IPs?',
      options: ['FTP', 'DNS', 'DHCP', 'SSH'],
      correct_index: 1,
      tags: ['network', 'dns'],
    },
    {
      question: 'Qual das opções abaixo descreve corretamente o padrão MVC?',
      options: [
        'Model-View-Controller',
        'Merge-Verify-Commit',
        'Main-Variable-Compiler',
        'Multiple-View-Column',
      ],
      correct_index: 0,
      tags: ['architecture', 'programming'],
    },
  ];

  console.log(`\n🌱 Seeding Quiz Library...`);
  for (const item of quizLibraryItems) {
    const existing = await prisma.quizLibrary.findFirst({
      where: { question: item.question },
    });
    if (!existing) {
      await prisma.quizLibrary.create({
        data: item,
      });
    }
  }
  console.log(`  ✅ Quiz Library: ${quizLibraryItems.length} items seeded`);

  await publishCommunity(
    prisma,
    Object.fromEntries(Object.entries(createdUsers).map(([name, user]) => [name, user.id])),
    COMMUNITY_PROFILES.map((profile) => profile.username)
  );

  console.log('\n🎉 Seed complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { Language, DuelStatus } from '@prisma/client';
import { prisma } from '../src/lib/prisma';
import { createClient } from '@supabase/supabase-js';
import demoAssets from './demo-profile-assets.json';
import { randomInt } from 'node:crypto';

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

  // ─── Badges ───────────────────────────────────────────────────────────
  const badgeData = [
    {
      slug: 'hello_world',
      label: 'Hello World!',
      description: 'Escreveu sua primeira linha de código no Stacklyst',
      icon: '👋',
      color: '#22d48a',
    },
    {
      slug: 'segfault_survivor',
      label: 'Sobrevivente do Segfault',
      description: 'Corrigiu um erro crítico de ponteiro em C/C++',
      icon: '☠️',
      color: '#de5722',
    },
    {
      slug: 'git_push_force',
      label: 'Git Push --force',
      description: 'Resolveu um conflito complexo de merge na força bruta',
      icon: '💪',
      color: '#de5722',
    },
    {
      slug: 'typescript_wizard',
      label: 'Mago do TypeScript',
      description: "Tipou um generic composto complexo sem usar 'any'",
      icon: '🧙‍♂️',
      color: '#5ba3f5',
    },
    {
      slug: 'rustacean_approved',
      label: 'Aprovado pelo Borrow Checker',
      description: 'Fez o compilador de Rust aceitar seu código de primeira',
      icon: '🦀',
      color: '#f57c22',
    },
    {
      slug: 'stack_overflow_ban',
      label: 'Banido do Stack Overflow',
      description: 'Fez uma pergunta avançada demais até para os moderadores',
      icon: '🚫',
      color: '#f05138',
    },
    {
      slug: 'speed_coder',
      label: 'Speed Coder',
      description: 'Venceu um duelo de código em menos de 2 minutos',
      icon: '⚡',
      color: '#f5a623',
    },
    {
      slug: 'debug_ninja',
      label: 'Debug Ninja',
      description: 'Passou 8 horas procurando um erro que era apenas um ponto e vírgula',
      icon: '🥷',
      color: '#888899',
    },
    {
      slug: 'coffee_overflow',
      label: 'Coffee Overflow',
      description: 'Escreveu código ou respondeu quizzes às 4h da manhã',
      icon: '☕',
      color: '#7c6ff7',
    },
    {
      slug: 'code_streak',
      label: '100-Day Code Streak',
      description: 'Manteve uma ofensiva de código ativa por 100 dias consecutivos',
      icon: '🔥',
      color: '#f5a623',
    },
    {
      slug: 'python_master',
      label: 'Python Master',
      description: 'Alcançou o nível 10 de proficiência na linguagem Python',
      icon: '🐍',
      color: '#5ba3f5',
    },
    {
      slug: 'rust_practitioner',
      label: 'Rust Practitioner',
      description:
        'Demonstrou excelente uso do compilador e de alocação de memória em Rust (Nível 5)',
      icon: '🦀',
      color: '#f77c22',
    },
    {
      slug: 'community_educator',
      label: 'Community Educator',
      description:
        'Escreveu respostas aceitas pela comunidade que ajudaram múltiplos desenvolvedores',
      icon: '📖',
      color: '#22d48a',
    },
  ];

  const badges: Record<string, { id: string }> = {};
  for (const badge of badgeData) {
    const created = await prisma.badge.upsert({
      where: { slug: badge.slug },
      update: badge,
      create: badge,
    });
    badges[badge.slug] = created;
    console.log(`  ✅ Badge: ${badge.label}`);
  }

  // ─── Clean & Create Supabase Auth Users ──────────────────────────────────
  console.log('\n👤 Provisioning Supabase Auth users...');
  const {
    data: { users },
    error: listError,
  } = await supabaseAdmin.auth.admin.listUsers();
  if (listError) {
    throw new Error(`Error listing auth users: ${listError.message}`);
  }

  const seedEmails = ['pedro@stacklyst.dev', 'ana@stacklyst.dev', 'carlos@stacklyst.dev'];
  for (const email of seedEmails) {
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
    },
    {
      email: 'ana@stacklyst.dev',
      username: 'anak',
      password: seedPassword,
      bio: 'Pythonista e entusiasta de ML. Sempre buscando o próximo desafio.',
      institution: 'USP',
      total_xp: 3100,
    },
    {
      email: 'carlos@stacklyst.dev',
      username: 'carlosm',
      password: seedPassword,
      bio: 'Rustacean 🦀 e competidor de maratona de programação.',
      institution: 'UNICAMP',
      total_xp: 2800,
    },
  ];

  const createdUsers: Record<string, any> = {};

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
    const dbUser = await prisma.user.create({
      data: {
        id: user.id,
        username: u.username,
        email: u.email,
        avatar_url: demoAssets[u.username as keyof typeof demoAssets].avatar_url,
        avatar_config: {
          profileStyle: {
            frame: [
              { id: 'orbit', color: '#38bdf8', decoration: 'orbit' },
              { id: 'alien', color: '#72b981', decoration: 'alien' },
              { id: 'neon-blue', color: '#0083fe', decoration: 'neon' },
            ][randomInt(3)],
          },
        },
        bio: u.bio,
        institution: u.institution,
        total_xp: u.total_xp,
      },
    });

    createdUsers[u.username] = dbUser;
    console.log(`  ✅ Auth & DB User provisioned: ${u.username} (${dbUser.id})`);
  }

  const pedro = createdUsers.pedrodev;
  const ana = createdUsers.anak;
  const carlos = createdUsers.carlosm;

  console.log(`  ✅ Users: pedrodev, anak, carlosm`);

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

  console.log(`  ✅ Posts: 5 created`);

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

  console.log(`  ✅ Answers: 4 created`);

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

  // ─── User Badges ──────────────────────────────────────────────────────
  const badgeAssignments = [
    { user_id: pedro.id, badge_id: badges.hello_world.id },
    { user_id: pedro.id, badge_id: badges.typescript_wizard.id },
    { user_id: pedro.id, badge_id: badges.git_push_force.id },
    { user_id: pedro.id, badge_id: badges.debug_ninja.id },
    { user_id: pedro.id, badge_id: badges.code_streak.id },
    { user_id: pedro.id, badge_id: badges.python_master.id },
    { user_id: ana.id, badge_id: badges.hello_world.id },
    { user_id: ana.id, badge_id: badges.coffee_overflow.id },
    { user_id: ana.id, badge_id: badges.stack_overflow_ban.id },
    { user_id: ana.id, badge_id: badges.community_educator.id },
    { user_id: carlos.id, badge_id: badges.hello_world.id },
    { user_id: carlos.id, badge_id: badges.rustacean_approved.id },
    { user_id: carlos.id, badge_id: badges.segfault_survivor.id },
    { user_id: carlos.id, badge_id: badges.speed_coder.id },
    { user_id: carlos.id, badge_id: badges.rust_practitioner.id },
  ];

  for (const assignment of badgeAssignments) {
    await prisma.userBadge.upsert({
      where: {
        user_id_badge_id: {
          user_id: assignment.user_id,
          badge_id: assignment.badge_id,
        },
      },
      update: {},
      create: assignment,
    });
  }

  console.log(`  ✅ User Badges: ${badgeAssignments.length} assigned`);

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

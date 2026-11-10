// Fictional identities and activity for the landing walkthrough. Nothing here
// belongs to a real account; names are deliberately synthetic.
import { LEARNING_XP } from '@/lib/learning/rewards';
import type { Avatar } from '@/lib/mundinho/types';
import type { CredentialCollection } from '@/lib/credentials/types';
import type { LeaderboardRow } from '@/app/leaderboard/LeaderboardClient';

export type Text = (portuguese: string, english: string) => string;

/** A frozen "today" keeps every date-derived render identical on server and client. */
export const DEMO_NOW = '2026-11-10T15:00:00.000Z';

export const DEMO_USER = {
  id: 'demo-stack-sam',
  username: 'stack_sam',
  name: 'Sam Stack',
  avatar_url: null as string | null,
  avatar_config: null as unknown,
  created_at: '2026-03-14T12:00:00.000Z',
  last_active_at: DEMO_NOW,
  streak: 5,
  /** XP before the lesson in the Trails scene. */
  total_xp: 1480,
  /** XP the lesson step awards (a recall step in the real curriculum). */
  lesson_xp: LEARNING_XP.recall,
} as const;

export const DEMO_PEOPLE = {
  bia: { id: 'demo-byte-bia', username: 'byte_bia', name: 'Bia Byte', total_xp: 2615 },
  leo: { id: 'demo-loop-leo', username: 'loop_leo', name: 'Leo Loop', total_xp: 1120 },
  nina: { id: 'demo-null-nina', username: 'null_nina', name: 'Nina Null', total_xp: 1495 },
  pat: { id: 'demo-pixel-pat', username: 'pixel_pat', name: 'Pat Pixel', total_xp: 2180 },
  kai: { id: 'demo-kernel-kai', username: 'kernel_kai', name: 'Kai Kernel', total_xp: 3240 },
} as const;

/** The avatar the fictional player starts the Mundinho scene with. */
export const DEMO_AVATAR: Avatar = {
  gender: 'masculine',
  skin: 2,
  eyes: 1,
  hair: 0,
  hairColor: 1,
  outfit: 0,
  accessory: 0,
};

export const DEMO_WEEKLY_ACTIVITY: ReadonlyMap<number, number> = new Map([
  [1, 2],
  [2, 1],
  [3, 3],
]);

export const DEMO_TRAILS = [{ id: 'demo-trail-js', language: 'JS', xp: 1480, level: 4 }];

export const DEMO_COURSES = [
  { language: 'JS', xp: 1480, started: true },
  { language: 'TS', xp: 0, started: false },
  { language: 'PYTHON', xp: 0, started: false },
  { language: 'RUST', xp: 0, started: false },
  { language: 'GO', xp: 0, started: false },
  { language: 'JAVA', xp: 0, started: false },
] as const;

export function demoRanking(userXp: number): LeaderboardRow[] {
  return [
    { rank: 1, username: DEMO_PEOPLE.kai.username, xp: DEMO_PEOPLE.kai.total_xp, level: 7 },
    { rank: 2, username: DEMO_PEOPLE.bia.username, xp: DEMO_PEOPLE.bia.total_xp, level: 6 },
    { rank: 3, username: DEMO_PEOPLE.pat.username, xp: DEMO_PEOPLE.pat.total_xp, level: 6 },
    { rank: 4, username: DEMO_PEOPLE.nina.username, xp: DEMO_PEOPLE.nina.total_xp, level: 4 },
    { rank: 5, username: DEMO_USER.username, xp: userXp, level: 4 },
    { rank: 6, username: DEMO_PEOPLE.leo.username, xp: DEMO_PEOPLE.leo.total_xp, level: 4 },
  ]
    .sort((a, b) => b.xp - a.xp)
    .map((row, index) => ({ ...row, rank: index + 1 }));
}

/** Every string shown by the walkthrough, resolved for the active language. */
export function demoCopy(text: Text) {
  const unitTitles = [
    text('Primeiros programas', 'First programs'),
    text('Decisões e repetições', 'Decisions and loops'),
    text('Código reutilizável', 'Reusable code'),
    text('Dados, testes e projeto', 'Data, tests and project'),
  ];
  return {
    user: {
      bio: text(
        'Aprendendo JavaScript no Stacklyst e compartilhando cada projeto.',
        'Learning JavaScript on Stacklyst and sharing every project.'
      ),
      institution: text('Instituto Fictício de Tecnologia', 'Fictional Institute of Technology'),
      tags: ['javascript', 'pixel-art'],
      studies: ['JavaScript'],
    },
    feed: {
      draft: text(
        'Terminei a unidade 1 de JavaScript hoje 🚀',
        'Finished JavaScript unit 1 today 🚀'
      ),
      snippetIntro: text(
        'Meu primeiro script em Python rodando direto no feed:',
        'My first Python script running right in the feed:'
      ),
      snippetCode: text(
        'nome = "Stacklyst"\nprint(f"Olá, {nome}!")',
        'name = "Stacklyst"\nprint(f"Hello, {name}!")'
      ),
      snippetOutput: text('Olá, Stacklyst!', 'Hello, Stacklyst!'),
      duelPost: text(
        'Alguém topa um duelo de TypeScript hoje à noite? ⚔️',
        'Anyone up for a TypeScript duel tonight? ⚔️'
      ),
      twoHoursAgo: text('Postado há 2 h', 'Posted 2h ago'),
      yesterday: text('Postado ontem', 'Posted yesterday'),
    },
    trails: {
      course: {
        title: text('JavaScript do zero', 'JavaScript from scratch'),
        description: text(
          'Da primeira instrução a um projeto com dados e testes.',
          'From the first instruction to a project with data and tests.'
        ),
        unitTitles,
        totalLessons: 13,
        totalExercises: 26,
      },
      // The first unit of the real foundations course, in curriculum order.
      lessons: [
        { id: 'learn-js-first-output', title: text('Seu primeiro programa', 'Your first program') },
        {
          id: 'learn-js-values',
          title: text('Textos, números e operações', 'Text, numbers and operations'),
        },
        {
          id: 'learn-js-variables',
          title: text('Guardar e atualizar valores', 'Store and update values'),
        },
      ],
      nextUnit: [
        {
          id: 'learn-js-booleans',
          title: text('Comparar antes de decidir', 'Compare before deciding'),
        },
        {
          id: 'learn-js-decisions',
          title: text('Escolher caminhos com if', 'Choose paths with if'),
        },
      ],
      lesson: {
        title: text('Guardar e atualizar valores', 'Store and update values'),
        language: 'JS',
        estimatedTime: '9 min',
        instruction: text(
          'Qual é a saída exata deste programa?',
          'What is the exact output of this program?'
        ),
        code: text(
          'let saldo = 7;\nsaldo = saldo + 3;\nconsole.log(saldo);',
          'let balance = 7;\nbalance = balance + 3;\nconsole.log(balance);'
        ),
        options: [
          '10',
          text('Nenhuma saída', 'No output'),
          text('Erro de sintaxe', 'Syntax error'),
          text('O texto do próprio código', 'The code text itself'),
        ],
        explanation: text('A execução produz:\n10', 'Running it prints:\n10'),
      },
    },
  };
}

export function demoCredentials(text: Text): CredentialCollection {
  const issuedAt = '2026-11-03T18:20:00.000Z';
  return {
    earnedCount: 1,
    items: [
      {
        definition: {
          id: 'js-first-lesson',
          version: 1,
          title: text('Primeira lição de JavaScript', 'First JavaScript lesson'),
          description: text(
            'Concluiu todas as atividades avaliadas da primeira lição do curso.',
            'Completed every assessed activity of the first lesson in the course.'
          ),
          language: 'JS',
          kind: 'first_lesson',
          estimatedMinutes: 9,
          skills: [text('execução', 'execution'), text('saída', 'output')],
          requirements: [
            {
              id: 'learn-js-first-output',
              source: 'lesson',
              title: text('Seu primeiro programa', 'Your first program'),
            },
          ],
        },
        completed: 1,
        total: 1,
        credential: {
          id: '7f1c4d2e-3b5a-4c6d-9e8f-0a1b2c3d4e5f',
          definition: {
            id: 'js-first-lesson',
            version: 1,
            title: text('Primeira lição de JavaScript', 'First JavaScript lesson'),
            description: text(
              'Concluiu todas as atividades avaliadas da primeira lição do curso.',
              'Completed every assessed activity of the first lesson in the course.'
            ),
            language: 'JS',
            kind: 'first_lesson',
            estimatedMinutes: 9,
            skills: [text('execução', 'execution'), text('saída', 'output')],
            requirements: [
              {
                id: 'learn-js-first-output',
                source: 'lesson',
                title: text('Seu primeiro programa', 'Your first program'),
              },
            ],
          },
          recipientName: DEMO_USER.name,
          recipientUsername: DEMO_USER.username,
          issuedAt,
          verifiedAt: issuedAt,
          integrityHash: 'demo',
          status: 'valid',
        },
      },
      {
        definition: {
          id: 'js-course',
          version: 1,
          title: text('JavaScript do zero', 'JavaScript from scratch'),
          description: text(
            'Conclua as 13 lições do curso de fundamentos.',
            'Complete all 13 lessons of the foundations course.'
          ),
          language: 'JS',
          kind: 'course',
          estimatedMinutes: 120,
          skills: ['JavaScript'],
          requirements: [],
        },
        completed: 3,
        total: 13,
        credential: null,
      },
      {
        definition: {
          id: 'python-first-lesson',
          version: 1,
          title: text('Primeira lição de Python', 'First Python lesson'),
          description: text(
            'Conclua todas as atividades avaliadas da primeira lição de Python.',
            'Complete every assessed activity of the first Python lesson.'
          ),
          language: 'PYTHON',
          kind: 'first_lesson',
          estimatedMinutes: 9,
          skills: ['Python'],
          requirements: [],
        },
        completed: 0,
        total: 1,
        credential: null,
      },
    ],
  };
}

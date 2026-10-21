import { useSyncExternalStore } from 'react';
import type { Answer, KnowledgeMapData, Message, Notification, Person, Post } from './types';

// Preview is an explicit, temporary UI mode. It never creates an auth session.
let enabled = false;
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const setEnabled = (next: boolean) => {
  enabled = next;
  listeners.forEach((listener) => listener());
};
export const enablePreview = () => setEnabled(true);
export const disablePreview = () => setEnabled(false);
export const isPreviewEnabled = () => enabled;
export const usePreview = () => useSyncExternalStore(subscribe, isPreviewEnabled, () => false);

export class PreviewError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'PreviewError';
  }
}

const reader: Person = {
  id: 'demo_reader',
  username: 'visitante',
  avatar_config: { displayName: 'Seu espaço para evoluir', background: 0 },
  bio: 'Demonstração do Stacklyst. Os exemplos são fictícios e nenhuma atividade é salva.',
  role: 'USER',
  total_xp: 680,
  streak_days: 3,
  created_at: '2026-09-04T12:00:00.000Z',
  institution: 'Comunidade Stacklyst',
  badges: [
    {
      slug: 'demo-first-steps',
      label: 'Primeiros passos',
      description: 'Conquista ilustrativa da demonstração.',
    },
  ],
};
const people: Person[] = [
  reader,
  {
    id: 'demo_ana',
    username: 'ana_dev',
    avatar_config: { displayName: 'Ana Costa' },
    bio: 'Frontend, acessibilidade e pequenos aprendizados todos os dias.',
    role: 'USER',
    total_xp: 430,
    created_at: '2026-09-08T12:00:00.000Z',
    pronouns: 'ela/dela',
  },
  {
    id: 'demo_caio',
    username: 'caio_codes',
    avatar_config: { displayName: 'Caio Lima' },
    bio: 'Aprendendo TypeScript e compartilhando o caminho.',
    role: 'USER',
    total_xp: 1240,
    streak_days: 4,
    created_at: '2026-09-01T12:00:00.000Z',
    institution: 'Comunidade Stacklyst',
  },
  {
    id: 'demo_luiza',
    username: 'luiza_py',
    avatar_config: { displayName: 'Luiza Rocha' },
    bio: 'Python, dados e código que outras pessoas consigam ler.',
    role: 'USER',
    total_xp: 960,
    created_at: '2026-09-12T12:00:00.000Z',
  },
];
const posts: Post[] = [
  {
    id: 'demo_typescript',
    author_id: people[2].id,
    author: people[2],
    title: 'TypeScript também ajuda a fazer boas perguntas',
    language: 'TS',
    body: 'Hoje troquei um boolean por uma união discriminada no estado de uma requisição. Agora o TypeScript me lembra de tratar carregamento, sucesso e erro antes de acessar os dados.\n\nQue detalhe de tipagem deixou seu código mais claro esta semana?',
    code_snippet:
      "type RequestState<T> =\n  | { status: 'loading' }\n  | { status: 'success'; data: T }\n  | { status: 'error'; message: string };",
    created_at: '2026-10-16T13:20:00.000Z',
    score: 18,
    _count: { answers: 1 },
    answers: [
      {
        id: 'demo_reply',
        author_id: people[1].id,
        author: people[1],
        is_accepted: false,
        created_at: '2026-10-16T13:30:00.000Z',
        upvotes: 4,
        body: 'Também gosto dessa abordagem em formulários: fica mais difícil mostrar sucesso e erro ao mesmo tempo.',
        replies: [
          {
            id: 'demo_reply_nested',
            parent_id: 'demo_reply',
            author_id: people[2].id,
            author: people[2],
            is_accepted: false,
            created_at: '2026-10-16T13:35:00.000Z',
            upvotes: 2,
            body: 'Exatamente! Assim cada estado tem seus próprios dados.\n\n```typescript\nif (state.status === "success") {\n  console.log(state.data);\n}\n```',
          },
        ],
      },
    ],
  },
  {
    id: 'demo_accessibility',
    author_id: people[1].id,
    author: people[1],
    title: 'Acessibilidade começa nos detalhes',
    language: 'JS',
    body: 'Um botão só com ícone precisa de um nome acessível. No React Native, accessibilityLabel descreve a ação, enquanto accessibilityRole informa o tipo do controle.\n\nTambém vale testar com fonte ampliada e garantir uma área de toque confortável. Pequenos ajustes fazem o app funcionar para mais pessoas.',
    created_at: '2026-10-16T12:10:00.000Z',
    score: 12,
    _count: { answers: 0 },
    answers: [],
  },
  {
    id: 'demo_python',
    author_id: people[3].id,
    author: people[3],
    title: 'Uma função pequena para agrupar dados',
    language: 'PYTHON',
    body: 'Exercício de hoje: contar quantas vezes cada linguagem aparece em uma lista. Comecei com um loop explícito e depois comparei com Counter.\n\nAntes de encurtar uma solução, tento explicar por que ela funciona. A legibilidade continua sendo parte do exercício.',
    code_snippet:
      "from collections import Counter\n\nlanguages = ['Python', 'JS', 'Python', 'TS']\ncounts = Counter(languages)\nprint(counts['Python'])  # 2",
    created_at: '2026-10-16T10:40:00.000Z',
    score: 9,
    _count: { answers: 0 },
    answers: [],
  },
  {
    id: 'demo_async',
    author_id: people[2].id,
    author: people[2],
    title: 'Carregamento também é parte da experiência',
    language: 'TS',
    body: 'Fiz um teste com a conexão lenta: um skeleton preservando o tamanho do conteúdo ajudou a evitar saltos na lista. Para falhas, um botão de tentar novamente manteve o contexto.\n\nVocês costumam testar seus projetos com a rede limitada?',
    created_at: '2026-10-15T20:15:00.000Z',
    score: 7,
    _count: { answers: 0 },
    answers: [],
  },
];
const notifications: Notification[] = [
  {
    id: 'demo_notification',
    title: 'Bem-vindo à demonstração',
    content:
      'Explore o feed, a busca e os perfis com exemplos locais. Entre na sua conta para participar.',
    link: '/post/demo_typescript',
    read: true,
    createdAt: '2026-10-16T13:30:00.000Z',
  },
];
const learning: KnowledgeMapData = {
  nodes: [],
  edges: [],
  paths: [],
  totals: { completedNodes: 0, masteredNodes: 0, totalNodes: 0, overallMastery: 0 },
};
const page = <T>(items: T[]) => ({ items, nextCursor: null });
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const follows = [
  [reader.id, people[1].id],
  [reader.id, people[2].id],
  [people[2].id, reader.id],
  [people[3].id, reader.id],
];
const replies = (answers: Answer[], post: Post): (Answer & { post: Post })[] =>
  answers.flatMap((answer) => [
    { ...answer, post: { ...post, answers: undefined } },
    ...replies(answer.replies ?? [], post),
  ]);
const allReplies = posts.flatMap((post) => replies(post.answers ?? [], post));

/** Only curated GET contracts exist here. Unsupported routes never fall through to the network. */
export async function previewRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  if ((init.method ?? 'GET').toUpperCase() !== 'GET')
    throw new PreviewError(
      403,
      'Esta demonstração é somente leitura. Entre na sua conta para participar.'
    );
  if (init.signal?.aborted) throw new Error('Carregamento cancelado.');
  const url = new URL(path, 'https://preview.stacklyst.invalid');
  const route = url.pathname;
  const cursor = url.searchParams.get('cursor');
  const result = (() => {
    if (route === '/api/users/me') return reader;
    if (route === '/api/posts') {
      if (url.searchParams.get('mode') === 'count') return { count: 0 };
      let result = posts;
      const language = url.searchParams.get('language');
      const search = url.searchParams.get('search')?.toLocaleLowerCase('pt-BR');
      const author = url.searchParams.get('author');
      const likedBy = url.searchParams.get('likedBy');
      if (author) result = result.filter((post) => post.author.username === author);
      if (likedBy)
        result = people.some((person) => person.username === likedBy) ? result.slice(0, 2) : [];
      if (language) result = result.filter((post) => post.language === language);
      if (search)
        result = result.filter((post) =>
          (post.body + post.title).toLocaleLowerCase('pt-BR').includes(search)
        );
      if (url.searchParams.get('filter') === 'following') result = [];
      return page(cursor ? [] : result);
    }
    if (route.startsWith('/api/posts/')) {
      const id = route.slice('/api/posts/'.length);
      const post = posts.find((post) => post.id === id);
      if (post) return post;
    }
    if (route.startsWith('/api/profile/')) {
      const [encodedUsername, section] = route.slice('/api/profile/'.length).split('/');
      const username = decodeURIComponent(encodedUsername);
      const user = people.find((person) => person.username === username);
      if (user) {
        const userReplies = allReplies.filter((answer) => answer.author_id === user.id);
        if (section === 'replies') return page(cursor ? [] : userReplies);
        return {
          user,
          posts: page(cursor ? [] : posts.filter((post) => post.author_id === user.id)),
          stats: {
            answers_count: userReplies.length,
            accepted_count: userReplies.filter((answer) => answer.is_accepted).length,
            accuracy: 0,
          },
          followers: follows.filter(([, following]) => following === user.id).length,
          following: follows.filter(([follower]) => follower === user.id).length,
          isFollowing: follows.some(
            ([follower, following]) => follower === reader.id && following === user.id
          ),
          trails: user.total_xp
            ? [
                {
                  language:
                    user.id === people[3].id ? 'PYTHON' : user.id === people[2].id ? 'TS' : 'JS',
                  xp: user.total_xp,
                  level: Math.floor(user.total_xp / 500) + 1,
                },
              ]
            : [],
        };
      }
    }
    const followList = route.match(/^\/api\/users\/([^/]+)\/(followers|following)$/);
    if (followList) {
      const userId = decodeURIComponent(followList[1]);
      return people
        .filter((person) =>
          follows.some(([follower, following]) =>
            followList[2] === 'followers'
              ? follower === person.id && following === userId
              : follower === userId && following === person.id
          )
        )
        .map((person) => ({
          ...person,
          isFollowing: follows.some(
            ([follower, following]) => follower === reader.id && following === person.id
          ),
        }));
    }
    if (route === '/api/search') {
      const search = (url.searchParams.get('q') ?? '').trim().toLocaleLowerCase('pt-BR');
      if (search.length < 2 || cursor) return page([]);
      return url.searchParams.get('type') === 'users'
        ? page(
            people.filter((person) =>
              (person.username + person.avatar_config?.displayName)
                .toLocaleLowerCase('pt-BR')
                .includes(search)
            )
          )
        : page(
            posts.filter((post) =>
              (post.body + post.title + post.language).toLocaleLowerCase('pt-BR').includes(search)
            )
          );
    }
    if (route === '/api/notifications/unread-count') return { count: 0 };
    if (route === '/api/notifications') return page(cursor ? [] : notifications);
    if (route === '/api/messages/chats')
      return [
        {
          partnerId: people[1].id,
          partner: people[1],
          lastMessage: 'Vou testar essa abordagem. Obrigado!',
        },
      ];
    if (route === '/api/mobile/messages')
      return page<Message>(
        cursor
          ? []
          : [
              {
                id: 'demo_message_4',
                sender_id: reader.id,
                receiver_id: people[1].id,
                content: 'Vou testar essa abordagem. Obrigado!',
                created_at: '2026-10-16T13:10:00.000Z',
              },
              {
                id: 'demo_message_3',
                sender_id: people[1].id,
                receiver_id: reader.id,
                content: 'Sim! E dá para compartilhar o código com a comunidade.',
                created_at: '2026-10-16T13:09:00.000Z',
              },
              {
                id: 'demo_message_2',
                sender_id: reader.id,
                receiver_id: people[1].id,
                content: 'Gostei da ideia de separar os estados da requisição.',
                created_at: '2026-10-16T12:12:00.000Z',
              },
              {
                id: 'demo_message',
                sender_id: people[1].id,
                receiver_id: reader.id,
                content:
                  'Esta é uma conversa fictícia. Enviar mensagens requer uma conta conectada.',
                created_at: '2026-10-16T12:10:00.000Z',
              },
            ]
      );
    if (route === '/api/mobile/learning') return learning;
    if (route.startsWith('/api/mobile/state/')) return null;
    if (route === '/api/mobile/bookmarks') return page([]);
    if (route === '/api/guilds') return { guilds: [], myGuilds: [] };
    if (
      [
        '/api/duels',
        '/api/duels/pending-requests',
        '/api/events',
        '/api/jobs',
        '/api/mobile/applications',
        '/api/leaderboard',
        '/api/evaluations',
        '/api/companies',
      ].includes(route)
    )
      return [];
    throw new PreviewError(
      404,
      'Este conteúdo não está incluído na demonstração. Conecte sua conta para acessá-lo.'
    );
  })();
  return clone(result) as T;
}

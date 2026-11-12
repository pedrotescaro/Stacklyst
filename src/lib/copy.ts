export const COPY = {
  // Empty States
  EMPTY_FEED: 'Nenhum post ainda. Seja o primeiro a quebrar o silêncio.',
  EMPTY_SEARCH: (term: string) =>
    `Nenhum resultado para '${term}'. Você pode ser o primeiro a falar sobre isso.`,
  EMPTY_DM: "Nenhuma mensagem ainda. Manda um 'Hello, World!'",
  EMPTY_NOTIFICATIONS: 'Tudo lido. Hora de fazer algo que valha uma notificação.',
  EMPTY_COMMUNITY: 'Nenhum post nesta comunidade ainda. Seja o pioneiro!',
  EMPTY_EXPLORE: 'Nenhum desenvolvedor encontrado. Tente ajustar os filtros.',

  // Error States
  ERROR_POST: 'Algo deu errado. Seu rascunho foi salvo automaticamente.',
  ERROR_FOLLOW: 'Não foi possível seguir. Tente novamente.',
  ERROR_BOOKMARK: 'Não foi possível salvar. Tente novamente.',
  ERROR_REPOST: 'Não foi possível repostar. Tente novamente.',
  ERROR_QUIZ: 'Não foi possível enviar sua resposta. Tente novamente.',
  ERROR_NETWORK: 'Erro de conexão. Verifique sua internet.',
  ERROR_GENERIC: 'Algo deu errado. Tente novamente.',

  // Success States
  SUCCESS_POST: 'Post publicado com sucesso!',
  SUCCESS_FOLLOW: 'Agora você está seguindo este usuário.',
  SUCCESS_BOOKMARK: 'Salvo nos seus bookmarks',
  SUCCESS_REPOST: 'Repostado com sucesso!',
  SUCCESS_QUIZ_CORRECT: 'Resposta correta! +XP ganho.',
  SUCCESS_QUIZ_WRONG: 'Resposta incorreta. A resposta correta foi revelada.',
  SUCCESS_JOIN_COMMUNITY: 'Você entrou na comunidade!',
  SUCCESS_LEAVE_COMMUNITY: 'Você saiu da comunidade.',

  // Special Events
  FIRST_POST: '+50 XP — Primeira postagem! Bem-vindo ao Stacklyst.',
  LEVEL_UP: (level: number, title: string) =>
    `Level ${level} desbloqueado! Você agora é um ${title}.`,
  MILESTONE_XP: (amount: number) => `Milestone alcançado! +${amount} XP.`,
  STREAK_DAY: (days: number) => `${days} dias seguidos! Continue assim!`,

  // Loading States
  LOADING_FEED: 'Carregando posts...',
  LOADING_SEARCH: 'Buscando...',
  LOADING_PROFILE: 'Carregando perfil...',
  LOADING_LEADERBOARD: 'Carregando classificação...',
  LOADING_COMMUNITY: 'Carregando comunidade...',

  // Confirmations
  CONFIRM_DISCARD_DRAFT: 'Descartar rascunho?',
  CONFIRM_UNFOLLOW: 'Deixar de seguir este usuário?',
  CONFIRM_DELETE_POST: 'Excluir este post?',
  CONFIRM_LEAVE_COMMUNITY: 'Sair desta comunidade?',

  // Hints
  HINT_MENTION: 'Digite @ para mencionar outros desenvolvedores.',
  HINT_CODE_BLOCK: 'Use ``` para adicionar blocos de código.',
  HINT_MARKDOWN: 'Markdown é suportado para formatação.',
  HINT_EMOJI: 'Use :emoji: para adicionar emojis.',
  HINT_EXPAND: 'Clique para expandir',

  // Accessibility
  ARIA_POST_BUTTON: 'Criar novo post',
  ARIA_LIKE_BUTTON: 'Curtir post',
  ARIA_BOOKMARK_BUTTON: 'Salvar post',
  ARIA_SHARE_BUTTON: 'Compartilhar post',
  ARIA_FOLLOW_BUTTON: (isFollowing: boolean) =>
    isFollowing ? 'Deixar de seguir' : 'Seguir usuário',
  ARIA_NOTIFICATION_BELL: 'Notificações',
  ARIA_SEARCH_INPUT: 'Buscar posts e usuários',
  ARIA_DM_BUTTON: 'Mensagens',
  ARIA_EXPLORE_BUTTON: 'Explorar',

  // Quiz Specific
  QUIZ_CORRECT: 'Correto! +10 XP',
  QUIZ_INCORRECT: 'Incorreto. A resposta certa era a opção',
  QUIZ_TIMEOUT: 'Tempo esgotado!',

  // Leaderboard
  LEADERBOARD_TOP_1: '👑 Mestre Dev',
  LEADERBOARD_TOP_2: '🥈 Vice-Líder',
  LEADERBOARD_TOP_3: '🥉 Bronze',
  LEADERBOARD_YOUR_RANK: 'Sua posição',

  // DM
  DM_TYPING: 'digitando...',
  DM_EMPTY: 'Nenhuma mensagem ainda. Inicie a conversa!',

  // Notifications
  NOTIFICATION_LIKE: 'curtiu seu post',
  NOTIFICATION_COMMENT: 'comentou no seu post',
  NOTIFICATION_MENTION: 'te mencionou',
  NOTIFICATION_FOLLOW: 'começou a seguir você',
  NOTIFICATION_XP: 'você ganhou XP',

  // Settings
  SETTINGS_THEME: 'Tema',
  SETTINGS_LANGUAGE: 'Idioma',
  SETTINGS_NOTIFICATIONS: 'Notificações',
  SETTINGS_PRIVACY: 'Privacidade',
  SETTINGS_ACCOUNT: 'Conta',
  SETTINGS_SOUND: 'Efeitos sonoros',

  // Sound Effects
  SOUND_ENABLED: 'Efeitos sonoros ativados',
  SOUND_DISABLED: 'Efeitos sonoros desativados',
} as const;

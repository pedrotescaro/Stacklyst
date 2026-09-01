export type Language = 'pt' | 'en';

export interface Translations {
  nav: {
    howItWorks: string;
    platform: string;
    tracks: string;
    duels: string;
    feed: string;
    ranking: string;
    login: string;
    signUp: string;
    goToFeed: string;
    myProfile: string;
    settings: string;
    signOut: string;
    menuToggle: string;
  };
  hero: {
    titleLine1: string;
    titleLine2: string;
    subtitle: string;
    activeMembers: string;
    membersInArena: string;
    letsGetStarted: string;
    createYourProfile: string;
    openYourFeed: string;
    viewRealPost: string;
  };
  showcase: {
    activity: {
      live: string;
      devs: string;
      postsToday: string;
      xpDistributed: string;
      activeDuels: string;
    };
    howItWorks: {
      eyebrow: string;
      titlePart1: string;
      titleProof: string;
      description: string;
      flowCard: {
        label: string;
        title: string;
        description: string;
        node1: string;
        node1Val: string;
        node2: string;
        node2Val: string;
        node3: string;
        node3Val: string;
      };
      quizCard: {
        label: string;
        title: string;
        description: string;
        sourceLabel: string;
        question: string;
        optionA: string;
        optionB: string;
        optionC: string;
      };
      communityCard: {
        label: string;
        title: string;
        description: string;
        contributions: string;
        accepted: string;
        badges: string;
        streak: string;
      };
      proofCard: {
        label: string;
        title: string;
        description: string;
        duelWon: string;
        trackCompleted: string;
        streak12: string;
        level19: string;
      };
    };
    platform: {
      eyebrow: string;
      titlePart1: string;
      titleOneFlow: string;
      description: string;
      mockup: {
        communityFeed: string;
        home: string;
        explore: string;
        notifications: string;
        learn: string;
        chat: string;
        bookmarks: string;
        profile: string;
        more: string;
        post: string;
        forYou: string;
        following: string;
        whatsHappening: string;
        anyoneCanReply: string;
        postedNow: string;
        posted2hAgo: string;
        posted8dAgo: string;
        architecture: string;
        post1Text: string;
        run: string;
        running: string;
        copy: string;
        copied: string;
        terminalOutput: string;
        learningQuiz: string;
        quizCompleted: string;
        hideResults: string;
        viewResults: string;
        quizSuccess: string;
        engagement: string;
        streakLabel: string;
        xpEarned: string;
        levelProgress: string;
        achievements: string;
        locked: string;
        myTracks: string;
        search: string;
        dayOfMastery: string;
      };
    };
    tracks: {
      eyebrow: string;
      titlePart1: string;
      titleSee: string;
      description: string;
      trackPrefix: string;
      modules: string;
      nextTopic: string;
      gamifyBadge: string;
      gamifyTitle: string;
      gamifyDesc: string;
      streakBadge: string;
      leagueBadge: string;
      achievementsBadge: string;
      dayStreakMetric: string;
      globalRankingMetric: string;
      achievementsMetric: string;
      totalXpMetric: string;
    };
    duels: {
      eyebrow: string;
      titlePart1: string;
      titleBetterCode: string;
      description: string;
      finalRound: string;
      challenge: string;
      challengeDesc: string;
      compareHover: string;
      testsPassed: string;
    };
    cta: {
      badge: string;
      titlePart1: string;
      titleShowIt: string;
      subtitle: string;
      goToFeed: string;
      createProfile: string;
      reviewHowItWorks: string;
    };
  };
  common: {
    switchToEnglish: string;
    switchToPortuguese: string;
    english: string;
    portuguese: string;
    loading: string;
    search: string;
  };
  footer: {
    tagline: string;
    rights: string;
    navigation: string;
    community: string;
    legal: string;
    privacy: string;
    terms: string;
  };
}

export const translations: Record<Language, Translations> = {
  pt: {
    nav: {
      howItWorks: 'Como funciona',
      platform: 'Plataforma',
      tracks: 'Trilhas',
      duels: 'Duelos',
      feed: 'Feed',
      ranking: 'Ranking',
      login: 'Entrar',
      signUp: 'Criar conta',
      goToFeed: 'Ir para o Feed',
      myProfile: 'Meu Perfil',
      settings: 'Configurações',
      signOut: 'Sair da Conta',
      menuToggle: 'Abrir menu',
    },
    hero: {
      titleLine1: 'Desbloqueie o melhor do Stacklyst.',
      titleLine2: 'Acesso à comunidade do futuro.',
      subtitle: 'Desenvolvedores criando experiências incríveis.',
      activeMembers: 'MEMBROS ATIVOS',
      membersInArena: '1.840+ desenvolvedores na arena',
      letsGetStarted: 'Começar agora',
      createYourProfile: 'Crie seu perfil',
      openYourFeed: 'Abra seu feed',
      viewRealPost: 'Ver um post real',
    },
    showcase: {
      activity: {
        live: 'AO VIVO',
        devs: '284 devs',
        postsToday: 'POSTS HOJE',
        xpDistributed: 'XP DISTRIBUÍDO',
        activeDuels: 'DUELOS ATIVOS',
      },
      howItWorks: {
        eyebrow: 'Como funciona',
        titlePart1: 'Toda ação se torna ',
        titleProof: 'prova.',
        description:
          'O Stacklyst transforma discussões técnicas em evidências verificáveis: você publica, comprova seu entendimento e evolui em público.',
        flowCard: {
          label: 'Fluxo completo',
          title: 'De um problema real ao XP verificado',
          description:
            'Publique um problema, colabore na discussão e pratique com o quiz diário curado.',
          node1: 'Post real',
          node1Val: 'React + cache',
          node2: 'Quiz diário',
          node2Val: '4 opções',
          node3: 'XP Verificado',
          node3Val: '+45 XP',
        },
        quizCard: {
          label: 'Quiz curado',
          title: 'Prática técnica diária',
          description: 'Questões revisadas testam fundamentos sem depender de geração por post.',
          sourceLabel: 'Da biblioteca',
          question: 'Qual estratégia evita uma nova requisição enquanto os dados forem válidos?',
          optionA: 'Cache TTL',
          optionB: 'Nova requisição',
          optionC: 'Remover memoização',
        },
        communityCard: {
          label: 'Comunidade',
          title: 'Feedback que constrói reputação',
          description: 'Respostas úteis ganham destaque e fortalecem seu histórico público.',
          contributions: 'Contribuições',
          accepted: 'Aceitas',
          badges: 'Emblemas',
          streak: 'Ofensiva',
        },
        proofCard: {
          label: 'Prova verificável',
          title: 'Deixe seu histórico falar primeiro',
          description: 'Trilhas, duelos e contribuições criam um panorama vivo do seu crescimento.',
          duelWon: 'Duelo vencido',
          trackCompleted: 'Trilha TypeScript 100%',
          streak12: '12 dias de ofensiva',
          level19: 'Nível 19',
        },
      },
      platform: {
        eyebrow: 'A plataforma',
        titlePart1: 'Tudo acontece em um ',
        titleOneFlow: 'único fluxo.',
        description:
          'Feed, trilhas, quizzes, duelos e perfil trabalham juntos para que cada ação fortaleça sua identidade técnica.',
        mockup: {
          communityFeed: 'Feed da comunidade',
          home: 'Início',
          explore: 'Explorar',
          notifications: 'Notificações',
          learn: 'Aprender com Stacklyst',
          chat: 'Chat',
          bookmarks: 'Salvos',
          profile: 'Perfil',
          more: 'Mais',
          post: 'Publicar',
          forYou: 'Para você',
          following: 'Seguindo',
          whatsHappening: 'O que está acontecendo?',
          anyoneCanReply: 'Qualquer um pode responder',
          postedNow: 'Postado agora',
          posted2hAgo: 'Postado há 2h',
          posted8dAgo: 'Postado há 8d',
          architecture: 'Arquitetura',
          post1Text:
            'Acabei de migrar nossas rotas críticas para renderização otimista com cache distribuído no Next.js. O tempo de resposta caiu de 380ms para 42ms em produção! 🚀',
          run: 'Executar',
          running: 'Executando...',
          copy: 'Copiar',
          copied: 'Copiado',
          terminalOutput: '// Saída do Terminal:',
          learningQuiz: 'Quiz de Aprendizado',
          quizCompleted: 'Você já concluiu este desafio!',
          hideResults: 'Ocultar Resultados',
          viewResults: 'Ver Resultados',
          quizSuccess: '✓ Desafio concluído! +45 XP adicionados ao seu perfil.',
          engagement: 'ENGAJAMENTO',
          streakLabel: '< 1 dia de ofensiva >',
          xpEarned: 'XP Ganho',
          levelProgress: 'PROGRESSO DO NÍVEL',
          achievements: 'CONQUISTAS',
          locked: 'Bloqueado',
          myTracks: 'MINHAS TRILHAS',
          search: 'Buscar',
          dayOfMastery: '1 dia de maestria',
        },
      },
      tracks: {
        eyebrow: 'Trilhas e progressão',
        titlePart1: 'Evolução que você pode ',
        titleSee: 'ver.',
        description:
          'Cada tecnologia tem seu próprio caminho, nível e evidências. Você sempre sabe onde está e o que dominar a seguir.',
        trackPrefix: 'Trilha',
        modules: 'módulos',
        nextTopic: 'Próximo: padrões avançados',
        gamifyBadge: 'Sistema de progressão',
        gamifyTitle: 'Consistência se torna uma vantagem competitiva.',
        gamifyDesc:
          'Ofensivas, conquistas e ligas recompensam a profundidade — não apenas o volume de atividade.',
        streakBadge: '12 dias de ofensiva',
        leagueBadge: 'Liga Diamante',
        achievementsBadge: '18 emblemas',
        dayStreakMetric: 'Dias de ofensiva',
        globalRankingMetric: 'Ranking global',
        achievementsMetric: 'Conquistas',
        totalXpMetric: 'XP Total',
      },
      duels: {
        eyebrow: 'Duelos de código',
        titlePart1: 'Pressão real. ',
        titleBetterCode: 'Código melhor.',
        description:
          'Participe de partidas rápidas contra desenvolvedores do seu nível e comprove suas decisões técnicas enquanto o cronômetro roda.',
        finalRound: 'Rodada final',
        challenge: 'Desafio',
        challengeDesc: 'Reduza a complexidade sem alterar a ordem de saída.',
        compareHover: 'COMPARAR PROBLEMA VS SOLUÇÃO (PASSE O MOUSE)',
        testsPassed: '14 testes passaram',
      },
      cta: {
        badge: 'Sua próxima linha gera XP',
        titlePart1: 'Pare de apenas dizer que sabe. ',
        titleShowIt: 'Mostre.',
        subtitle: 'Transforme experiência real em reputação técnica pública.',
        goToFeed: 'Ir para o Feed',
        createProfile: 'Criar meu perfil',
        reviewHowItWorks: 'Ver como funciona',
      },
    },
    common: {
      switchToEnglish: 'Switch to English',
      switchToPortuguese: 'Mudar para português',
      english: 'English',
      portuguese: 'Português',
      loading: 'Carregando...',
      search: 'Buscar...',
    },
    footer: {
      tagline: 'A arena social gamificada para programadores que constroem o futuro.',
      rights: '© 2026 Stacklyst. Todos os direitos reservados.',
      navigation: 'Navegação',
      community: 'Comunidade',
      legal: 'Legal',
      privacy: 'Privacidade',
      terms: 'Termos de Uso',
    },
  },
  en: {
    nav: {
      howItWorks: 'How it works',
      platform: 'Platform',
      tracks: 'Tracks',
      duels: 'Duels',
      feed: 'Feed',
      ranking: 'Ranking',
      login: 'Log in',
      signUp: 'Sign up',
      goToFeed: 'Go to Feed',
      myProfile: 'My Profile',
      settings: 'Settings',
      signOut: 'Sign Out',
      menuToggle: 'Toggle menu',
    },
    hero: {
      titleLine1: 'Unlock the best of Stacklyst.',
      titleLine2: 'Access to the future community.',
      subtitle: 'Developers creating amazing experiences.',
      activeMembers: 'ACTIVE MEMBERS',
      membersInArena: '1,840+ developers in the arena',
      letsGetStarted: "Let's Get Started",
      createYourProfile: 'Create Your Profile',
      openYourFeed: 'Open Your Feed',
      viewRealPost: 'View a real post',
    },
    showcase: {
      activity: {
        live: 'LIVE',
        devs: '284 devs',
        postsToday: 'POSTS TODAY',
        xpDistributed: 'XP DISTRIBUTED',
        activeDuels: 'ACTIVE DUELS',
      },
      howItWorks: {
        eyebrow: 'How it works',
        titlePart1: 'Every action becomes ',
        titleProof: 'proof.',
        description:
          'Stacklyst turns technical discussions into verifiable evidence: you publish, prove your understanding, and grow in public.',
        flowCard: {
          label: 'Complete flow',
          title: 'From a real problem to verified XP',
          description:
            'Publish a problem, collaborate in the discussion, and practice with the curated daily quiz.',
          node1: 'Real post',
          node1Val: 'React + cache',
          node2: 'Daily quiz',
          node2Val: '4 choices',
          node3: 'Verified XP',
          node3Val: '+45 XP',
        },
        quizCard: {
          label: 'Curated quiz',
          title: 'Daily technical practice',
          description: 'Reviewed questions test fundamentals without per-post generation.',
          sourceLabel: 'From the library',
          question: 'Which strategy avoids another request while the data is still valid?',
          optionA: 'TTL cache',
          optionB: 'New request',
          optionC: 'Remove memoization',
        },
        communityCard: {
          label: 'Community',
          title: 'Feedback that builds reputation',
          description: 'Helpful answers gain visibility and strengthen your public track record.',
          contributions: 'Contributions',
          accepted: 'Accepted',
          badges: 'Badges',
          streak: 'Streak',
        },
        proofCard: {
          label: 'Verifiable proof',
          title: 'Let your track record speak first',
          description: 'Tracks, duels, and contributions create a living picture of your growth.',
          duelWon: 'Duel won',
          trackCompleted: 'TypeScript track 100%',
          streak12: '12-day streak',
          level19: 'Level 19',
        },
      },
      platform: {
        eyebrow: 'The platform',
        titlePart1: 'Everything happens in ',
        titleOneFlow: 'one flow.',
        description:
          'Feed, tracks, quizzes, duels, and profile work together so every action strengthens your technical identity.',
        mockup: {
          communityFeed: 'Community feed',
          home: 'Home',
          explore: 'Explore',
          notifications: 'Notifications',
          learn: 'Learn with Stacklyst',
          chat: 'Chat',
          bookmarks: 'Bookmarks',
          profile: 'Profile',
          more: 'More',
          post: 'Post',
          forYou: 'For you',
          following: 'Following',
          whatsHappening: 'What’s happening?',
          anyoneCanReply: 'Anyone can reply',
          postedNow: 'Posted now',
          posted2hAgo: 'Posted 2h ago',
          posted8dAgo: 'Posted 8d ago',
          architecture: 'Architecture',
          post1Text:
            'I just finished migrating our critical routes to optimistic rendering with distributed caching in Next.js. Response time dropped from 380ms to 42ms in production! 🚀',
          run: 'Run',
          running: 'Running...',
          copy: 'Copy',
          copied: 'Copied',
          terminalOutput: '// Terminal Output:',
          learningQuiz: 'Learning Quiz',
          quizCompleted: 'You already completed this challenge!',
          hideResults: 'Hide Results',
          viewResults: 'View Results',
          quizSuccess: '✓ Challenge completed! +45 XP added to your profile.',
          engagement: 'ENGAGEMENT',
          streakLabel: '< 1 day streak >',
          xpEarned: 'XP Earned',
          levelProgress: 'LEVEL PROGRESS',
          achievements: 'ACHIEVEMENTS',
          locked: 'Locked',
          myTracks: 'MY TRACKS',
          search: 'Search',
          dayOfMastery: '1 day of mastery',
        },
      },
      tracks: {
        eyebrow: 'Tracks and progression',
        titlePart1: 'Growth you can ',
        titleSee: 'see.',
        description:
          'Each technology has its own path, level, and evidence. You always know where you are and what to master next.',
        trackPrefix: 'Track',
        modules: 'modules',
        nextTopic: 'Next: advanced patterns',
        gamifyBadge: 'Progression system',
        gamifyTitle: 'Consistency becomes a competitive edge.',
        gamifyDesc: 'Streaks, achievements, and leagues reward depth — not just activity volume.',
        streakBadge: '12-day streak',
        leagueBadge: 'Diamond league',
        achievementsBadge: '18 badges',
        dayStreakMetric: 'Day streak',
        globalRankingMetric: 'Global ranking',
        achievementsMetric: 'Achievements',
        totalXpMetric: 'Total XP',
      },
      duels: {
        eyebrow: 'Code duels',
        titlePart1: 'Real pressure. ',
        titleBetterCode: 'Better code.',
        description:
          'Jump into fast matches against developers at your level and prove your technical decisions while the clock is running.',
        finalRound: 'Final round',
        challenge: 'Challenge',
        challengeDesc: 'Reduce complexity without changing the output order.',
        compareHover: 'COMPARE PROBLEM VS SOLUTION (HOVER)',
        testsPassed: '14 tests passed',
      },
      cta: {
        badge: 'Your next line earns XP',
        titlePart1: 'Stop saying you can. ',
        titleShowIt: 'Show it.',
        subtitle: 'Turn real experience into public technical reputation.',
        goToFeed: 'Go to Feed',
        createProfile: 'Create my profile',
        reviewHowItWorks: 'Review how it works',
      },
    },
    common: {
      switchToEnglish: 'Switch to English',
      switchToPortuguese: 'Switch to Portuguese',
      english: 'English',
      portuguese: 'Portuguese',
      loading: 'Loading...',
      search: 'Search...',
    },
    footer: {
      tagline: 'The gamified social arena for developers building the future.',
      rights: '© 2026 Stacklyst. All rights reserved.',
      navigation: 'Navigation',
      community: 'Community',
      legal: 'Legal',
      privacy: 'Privacy',
      terms: 'Terms of Service',
    },
  },
};

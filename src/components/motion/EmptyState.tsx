'use client';

import { motion } from 'framer-motion';
import {
  BellOff,
  MessageSquare,
  Search,
  MessageCircle,
  Bookmark,
  FileText,
  Inbox,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { useLocalizedText } from '@/i18n/useLocalizedText';

type EmptyStateType =
  | 'feed'
  | 'search'
  | 'notifications'
  | 'dm'
  | 'bookmarks'
  | 'profile-posts'
  | 'generic';

interface EmptyStateProps {
  type: EmptyStateType;
  searchTerm?: string;
  className?: string;
}

const STATES: Record<
  EmptyStateType,
  { icon: LucideIcon; title: [string, string]; desc: [string, string] }
> = {
  feed: {
    icon: MessageSquare,
    title: ['Nenhum post ainda.', 'No posts yet.'],
    desc: ['Seja o primeiro a quebrar o silêncio.', 'Be the first to break the silence.'],
  },
  search: {
    icon: Search,
    title: ["Nenhum resultado para '{term}'.", "No results for '{term}'."],
    desc: [
      'Você pode ser o primeiro a falar sobre isso.',
      'You can be the first to talk about it.',
    ],
  },
  notifications: {
    icon: BellOff,
    title: ['Tudo lido.', 'All caught up.'],
    desc: [
      'Hora de fazer algo que valha uma notificação.',
      'Time to do something notification-worthy.',
    ],
  },
  dm: {
    icon: MessageCircle,
    title: ['Nenhuma mensagem ainda.', 'No messages yet.'],
    desc: ["Manda um 'Hello, World!'", "Send a 'Hello, World!'"],
  },
  bookmarks: {
    icon: Bookmark,
    title: ['Nenhum bookmark ainda.', 'No bookmarks yet.'],
    desc: [
      'Salve posts técnicos para revisitar sem perder o fio.',
      'Save technical posts to revisit them later.',
    ],
  },
  'profile-posts': {
    icon: FileText,
    title: ['Nenhuma postagem ainda.', 'No posts yet.'],
    desc: ['Quando postar algo, vai aparecer aqui.', 'Your posts will appear here.'],
  },
  generic: {
    icon: Inbox,
    title: ['Nada por aqui.', 'Nothing here yet.'],
    desc: ['Volte mais tarde.', 'Check back later.'],
  },
};

export function EmptyState({ type, searchTerm, className }: EmptyStateProps) {
  const { isEnglish } = useLocalizedText();
  const state = STATES[type] ?? STATES.generic;
  const Icon = state.icon;
  const languageIndex = isEnglish ? 1 : 0;
  const title = state.title[languageIndex].replace('{term}', searchTerm || '');
  const desc = state.desc[languageIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'flex flex-col items-center justify-center py-16 px-6 text-center space-y-3',
        className
      )}
    >
      <div className="w-12 h-12 rounded-2xl bg-dd-surface border border-dd-border flex items-center justify-center text-blue-400 shadow-sm">
        <Icon className="w-6 h-6 stroke-[1.8]" />
      </div>
      <p className="text-sm font-bold text-dd-text">{title}</p>
      <p className="text-xs text-dd-muted max-w-xs leading-relaxed">{desc}</p>
    </motion.div>
  );
}

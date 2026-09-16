export type { KnowledgeMapData, KnowledgeMapNode } from '../../../../src/lib/learning/types';
export type { ExerciseWorkspaceData } from '../../../../src/lib/exercises/types';
export type { PublicLesson } from '../../../../src/lib/mobile/lesson';
export interface Person {
  id: string;
  username: string;
  avatar_url?: string | null;
  avatar_config?: { name?: string; displayName?: string };
  total_xp?: number;
  role?: 'USER' | 'ADMIN' | 'RECRUITER' | 'EVALUATOR';
  streak_days?: number;
  bio?: string | null;
  github_username?: string;
  badges?: { label?: string; badge?: { label: string } }[];
}
export interface Post {
  id: string;
  author_id: string;
  author: Person;
  body: string;
  title: string;
  language?: string;
  code_snippet?: string;
  image_url?: string;
  created_at: string;
  score?: number;
  votes?: { value: number }[];
  bookmarks?: { id: string }[];
  _count?: { answers: number };
  answers?: Answer[];
}
export interface Answer {
  id: string;
  author_id: string;
  author: Person;
  body: string;
  is_accepted: boolean;
  replies?: Answer[];
}
export interface Page<T> {
  items: T[];
  nextCursor: string | null;
}
export interface Message {
  id: string;
  client_id?: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
}
export interface Duel {
  id: string;
  status: string;
  language: string;
  problem_title: string;
  problem_body: string;
  challenger_id: string;
  opponent_id: string | null;
  challenger?: Person;
  opponent?: Person;
  winner?: Person;
  started_at: string | null;
  time_limit_seconds: number;
  submissions?: { id: string; status: string; passed_tests: number; total_tests: number }[];
  evaluations?: { human_feedback?: string }[];
}
export interface Notification {
  id: string;
  title: string;
  content: string;
  link?: string;
  read: boolean;
  createdAt: string;
}
export interface Result {
  isCorrect?: boolean;
  passed?: boolean;
  message?: string;
  details?: string;
  error?: string;
  output?: string;
  consoleOutput?: string;
  xpEarned?: number;
  passedTests?: number;
  totalTests?: number;
  submission?: { status: string };
  tests?: { id: string; label: string; passed: boolean; hidden: boolean }[];
}

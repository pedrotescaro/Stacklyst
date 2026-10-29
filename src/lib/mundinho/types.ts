import { calculateLevel } from '../learning/rewards';
export const LANGUAGES = ['PYTHON', 'HTML', 'CSS', 'JS', 'TS'] as const;
export type BattleLanguage = (typeof LANGUAGES)[number];
export const LANGUAGE_NAMES: Record<string, string> = {
  PYTHON: 'Python',
  HTML: 'HTML',
  CSS: 'CSS',
  JS: 'JavaScript',
  TS: 'TypeScript',
  RUST: 'Rust',
  GO: 'Go',
  JAVA: 'Java',
};
export type Avatar = {
  skin: number;
  eyes: number;
  hair: number;
  hairColor: number;
  outfit: number;
  accessory: number;
};
export const DEFAULT_AVATAR: Avatar = {
  skin: 2,
  eyes: 0,
  hair: 0,
  hairColor: 0,
  outfit: 0,
  accessory: 0,
};
export type Item = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'outfit' | 'hair' | 'accessory' | 'frame' | 'title' | 'effect';
  value: number;
  rarity: string;
};
export const ITEMS: Item[] = [
  {
    id: 'red-jacket',
    name: 'Jaqueta da alvorada',
    description: 'Vermelho de quem começa uma aventura.',
    price: 200,
    category: 'outfit',
    value: 3,
    rarity: 'Raro',
  },
  {
    id: 'blue-hoodie',
    name: 'Moletom de nuvens',
    description: 'Conforto para explorar novas ideias.',
    price: 300,
    category: 'outfit',
    value: 4,
    rarity: 'Raro',
  },
  {
    id: 'tech-jacket',
    name: 'Jaqueta do compilador',
    description: 'Detalhes em verde de terminal.',
    price: 500,
    category: 'outfit',
    value: 5,
    rarity: 'Épico',
  },
  {
    id: 'gold-frame',
    name: 'Moldura dourada',
    description: 'Uma borda especial para seu aventureiro.',
    price: 250,
    category: 'frame',
    value: 1,
    rarity: 'Raro',
  },
  {
    id: 'explorer-hat',
    name: 'Chapéu de explorador',
    description: 'Para os caminhos menos óbvios.',
    price: 150,
    category: 'accessory',
    value: 3,
    rarity: 'Raro',
  },
  {
    id: 'aurora-hair',
    name: 'Cabelo aurora',
    description: 'Um corte cheio de personalidade.',
    price: 180,
    category: 'hair',
    value: 3,
    rarity: 'Raro',
  },
  {
    id: 'title-debugger',
    name: 'Caça-bugs',
    description: 'Um título para levar ao seu perfil de aventureiro.',
    price: 120,
    category: 'title',
    value: 1,
    rarity: 'Comum',
  },
  {
    id: 'fireflies',
    name: 'Vagalumes',
    description: 'Pequenas luzes acompanham seu avatar.',
    price: 220,
    category: 'effect',
    value: 1,
    rarity: 'Raro',
  },
];
export const CHECKIN_REWARDS = [10, 15, 20, 25, 30, 35, 40];
export const CREATURES = [
  { id: 'syntax-slime', name: 'Gosma de sintaxe', color: '#85cc4b', level: 1, x: 280, y: 200 },
  { id: 'blue-slime', name: 'Gota de lógica', color: '#53bce7', level: 2, x: 490, y: 350 },
  { id: 'ember', name: 'Faísca recursiva', color: '#f39a42', level: 3, x: 670, y: 260 },
  { id: 'byte-bug', name: 'Besouro de bits', color: '#b39be8', level: 2, x: 340, y: 360 },
  { id: 'forest', name: 'Broto booleano', color: '#4dbb8b', level: 1, x: 380, y: 200 },
  { id: 'null-ghost', name: 'Sombra do nulo', color: '#a7b6cc', level: 3, x: 490, y: 260 },
];
export type PublicQuestion = {
  id: string;
  concept: string;
  prompt: string;
  options: string[];
  difficulty: string;
};
export type BattleView = {
  id: string;
  language: BattleLanguage;
  creature: string;
  hp: number;
  enemyHp: number;
  turn: number;
  status: 'active' | 'won' | 'lost' | 'fled';
  question: PublicQuestion | null;
  feedback: string;
  correct?: boolean;
  reward: number;
  skill: string | null;
};
export type Mission = {
  id: string;
  name: string;
  progress: number;
  target: number;
  reward: number;
  claimed: boolean;
};
export type AdventureState = {
  username: string;
  coins: number;
  totalXp: number;
  avatar: Avatar;
  inventory: string[];
  equipped: Record<string, string>;
  checkin: { day: string; claimed: boolean; streak: number; cycle: number; reward: number };
  transactions: { id: string; label: string; amount: number; createdAt: string }[];
  missions: Mission[];
  battle: BattleView | null;
};
export type Course = { language: string; completed: number; total: number };
export type AdventureAction = { type: string; [key: string]: unknown };
export type AdventureTransport = (action?: AdventureAction) => Promise<AdventureState>;
export function levelProgress(xp: number) {
  const { level, prevLevelXp, nextLevelXp } = calculateLevel(xp);
  return { level, current: Math.max(0, xp - prevLevelXp), needed: nextLevelXp - prevLevelXp };
}

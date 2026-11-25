import {
  BookOpen,
  ClipboardList,
  History,
  LayoutDashboard,
  LineChart,
  ListChecks,
  NotebookPen,
  RotateCcw,
  Star,
  type LucideIcon,
} from 'lucide-react';

export type EnadeSection = {
  href: string;
  label: string;
  short?: string;
  icon: LucideIcon;
  exact?: boolean;
};

/** Day-to-day study: always visible as tabs. */
export const PRIMARY_SECTIONS: EnadeSection[] = [
  { href: '/trails/enade', label: 'Visão geral', icon: LayoutDashboard, exact: true },
  { href: '/trails/enade/biblioteca', label: 'Biblioteca', icon: BookOpen },
  { href: '/trails/enade/simulados', label: 'Simulados', icon: ClipboardList },
  {
    href: '/trails/enade/questoes',
    label: 'Banco de questões',
    short: 'Questões',
    icon: ListChecks,
  },
  {
    href: '/trails/enade/revisao',
    label: 'Revisão inteligente',
    short: 'Revisão',
    icon: RotateCcw,
  },
];

/** Personal follow-up, grouped under "Meu progresso" and repeated in the rail. */
export const PROGRESS_SECTIONS: EnadeSection[] = [
  { href: '/trails/enade/evolucao', label: 'Minha evolução', icon: LineChart },
  { href: '/trails/enade/historico', label: 'Meu histórico', icon: History },
  { href: '/trails/enade/erros', label: 'Caderno de erros', icon: NotebookPen },
  { href: '/trails/enade/favoritos', label: 'Favoritos', icon: Star },
];

export function isSectionActive(section: EnadeSection, pathname: string) {
  return section.exact
    ? pathname === section.href
    : pathname === section.href || pathname.startsWith(`${section.href}/`);
}

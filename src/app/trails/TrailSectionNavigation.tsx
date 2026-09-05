import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  FastForward,
  Lock,
  Route,
} from 'lucide-react';
import type { TrailLevel } from '@/lib/trailsData';
import { getSectionTheme } from './trailTheme';
import { useLocalizedText } from '@/i18n/useLocalizedText';

export interface TrailSectionView {
  number: number;
  name: string;
  title: string;
  description?: string;
  levels: TrailLevel[];
  completedUnits: number;
  completed: boolean;
  unlocked: boolean;
}

export function getUnitNumberInSection(level: TrailLevel, levels: TrailLevel[]) {
  const unitIndex = levels
    .filter((candidate) => candidate.unitNumber === level.unitNumber)
    .findIndex((candidate) => candidate.levelNumber === level.levelNumber);

  return Math.max(1, unitIndex + 1);
}

export function getLevelsForSection(levels: TrailLevel[], sectionNumber: number) {
  return levels.filter((level) => level.unitNumber === sectionNumber);
}

export function buildTrailSections(
  levels: TrailLevel[],
  attempts: Record<string, boolean>,
  language: string
): TrailSectionView[] {
  const grouped = new Map<number, TrailLevel[]>();

  levels.forEach((level) => {
    const sectionLevels = grouped.get(level.unitNumber) ?? [];
    sectionLevels.push(level);
    grouped.set(level.unitNumber, sectionLevels);
  });

  return Array.from(grouped.entries()).map(([number, sectionLevels], index) => {
    const completedUnits = sectionLevels.filter((level) =>
      level.questions.every((question) => attempts[question.id] === true)
    ).length;
    const checkpointId = `${language.toLowerCase()}-u${number}-checkpoint`;
    const previousSectionNumber = Array.from(grouped.keys())[index - 1];
    const previousCheckpointId = previousSectionNumber
      ? `${language.toLowerCase()}-u${previousSectionNumber}-checkpoint`
      : null;

    return {
      number,
      name: sectionLevels[0]?.sectionName ?? `Seção ${number}`,
      title: sectionLevels[0]?.unitTitle ?? `Seção ${number}`,
      levels: sectionLevels,
      completedUnits,
      completed: completedUnits === sectionLevels.length && attempts[checkpointId] === true,
      unlocked:
        index === 0 || (previousCheckpointId ? attempts[previousCheckpointId] === true : false),
    };
  });
}

interface TrailSectionNavigationProps {
  view: 'trail' | 'sections';
  sectionNumber: number;
  unitNumber: number;
  title: string;
  sections: TrailSectionView[];
  onOpenSections: () => void;
  onBack: () => void;
  onSelectSection: (sectionNumber: number) => void;
  onRequestJump?: (sectionNumber: number) => void;
  routes?: Array<{
    id: string;
    title: string;
    description: string;
    accentColor: string;
    completedUnits: number;
    totalUnits: number;
  }>;
  selectedRouteId?: string;
  onSelectRoute?: (routeId: string) => void;
}

export function TrailSectionNavigation({
  view,
  sectionNumber,
  unitNumber,
  title,
  sections,
  onOpenSections,
  onBack,
  onSelectSection,
  onRequestJump,
  routes = [],
  selectedRouteId,
  onSelectRoute,
}: TrailSectionNavigationProps) {
  const { text } = useLocalizedText();
  const theme = getSectionTheme(sectionNumber);

  if (view === 'sections') {
    return (
      <section aria-labelledby="trail-sections-title" className="mx-auto w-full max-w-2xl py-1">
        <button
          type="button"
          onClick={onBack}
          className="dd-focus-ring mb-5 flex cursor-pointer items-center gap-2 rounded-lg px-1 py-1 text-sm font-black text-dd-muted transition-colors hover:text-dd-text"
        >
          <ArrowLeft className="h-5 w-5" />
          {text('Voltar', 'Back')}
        </button>

        <div className="mb-5 border-b border-dd-border pb-5">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-blue-400">
            {text('Guia do curso', 'Course guide')}
          </p>
          <h1 id="trail-sections-title" className="mt-1 text-2xl font-black text-dd-text">
            {text('Seções e unidades', 'Sections and units')}
          </h1>
          <p className="mt-1 text-sm font-semibold text-dd-muted">
            {text(
              'Escolha um rumo e entre em uma seção para estudar ou revisar suas unidades.',
              'Choose a path and enter a section to study or review its units.'
            )}
          </p>
        </div>

        {routes.length > 0 && (
          <div className="mb-6">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-dd-muted">
                  {text('Rumo da trilha', 'Trail path')}
                </p>
                <h2 className="mt-1 text-base font-black text-dd-text">
                  {text('O que você quer estudar?', 'What do you want to study?')}
                </h2>
              </div>
              <Route className="h-5 w-5 text-blue-400" aria-hidden="true" />
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {routes.map((route) => {
                const selected = route.id === selectedRouteId;
                const progress =
                  route.totalUnits > 0
                    ? Math.round((route.completedUnits / route.totalUnits) * 100)
                    : 0;

                return (
                  <button
                    key={route.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => onSelectRoute?.(route.id)}
                    className={`dd-focus-ring rounded-2xl border p-4 text-left transition ${
                      selected
                        ? 'border-blue-500/70 bg-blue-500/10 shadow-sm'
                        : 'border-dd-border bg-dd-surface/45 hover:border-dd-muted/60 hover:bg-dd-surface'
                    }`}
                  >
                    <span className="flex items-start gap-3">
                      <span
                        aria-hidden="true"
                        className="mt-1 h-3 w-3 shrink-0 rounded-full"
                        style={{ backgroundColor: route.accentColor }}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-black text-dd-text">{route.title}</span>
                        <span className="mt-1 line-clamp-2 block text-[10px] font-semibold leading-relaxed text-dd-muted">
                          {route.description}
                        </span>
                        <span className="mt-3 flex items-center justify-between gap-3 text-[10px] font-black tabular-nums">
                          <span className={selected ? 'text-blue-400' : 'text-dd-muted'}>
                            {route.completedUnits}/{route.totalUnits}{' '}
                            {text('atividades', 'activities')}
                          </span>
                          <span style={{ color: route.accentColor }}>{progress}%</span>
                        </span>
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {sections.map((section) => {
            const isCurrent = section.number === sectionNumber;
            const actionLabel = section.completed
              ? text('Revisar', 'Review')
              : section.unlocked
                ? isCurrent
                  ? text('Continuar', 'Continue')
                  : text('Abrir', 'Open')
                : text('Pular para cá', 'Jump here');

            return (
              <article
                key={section.number}
                className={`relative overflow-hidden rounded-2xl border p-5 ${
                  isCurrent
                    ? 'border-blue-500/60 bg-blue-500/10'
                    : 'border-dd-border bg-dd-surface/45'
                }`}
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-20 [background:repeating-linear-gradient(135deg,transparent_0,transparent_74px,var(--color-dd-border)_74px,var(--color-dd-border)_142px)]"
                />
                <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.1em] text-blue-400">
                      {section.name} · {section.levels.length} unidades
                    </p>
                    <h2 className="mt-2 text-xl font-black text-dd-text">
                      {text('Seção', 'Section')} {section.number} · {section.title}
                    </h2>
                    {section.description && (
                      <p className="mt-1 max-w-xl text-xs font-semibold leading-relaxed text-dd-muted">
                        {section.description}
                      </p>
                    )}
                    <ol className="mt-4 grid gap-x-5 gap-y-2 sm:grid-cols-2">
                      {section.levels.map((level) => (
                        <li
                          key={level.levelNumber}
                          className="flex min-w-0 items-center gap-2 text-xs font-bold text-dd-text"
                        >
                          <BookOpen aria-hidden="true" className="h-4 w-4 shrink-0 text-blue-400" />
                          <span className="min-w-0 truncate">{level.title}</span>
                        </li>
                      ))}
                    </ol>
                    <div
                      className={`mt-3 flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wide ${
                        section.completed
                          ? 'text-lime-400'
                          : section.unlocked
                            ? 'text-blue-400'
                            : 'text-dd-muted'
                      }`}
                    >
                      {section.completed ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : section.unlocked ? (
                        <BookOpen className="h-4 w-4" />
                      ) : (
                        <Lock className="h-4 w-4" />
                      )}
                      {section.completed
                        ? text('Concluída', 'Completed')
                        : `${section.completedUnits} ${text('de', 'of')} ${section.levels.length} ${text('unidades', 'units')}`}
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={!section.unlocked && !onRequestJump}
                    onClick={() =>
                      section.unlocked
                        ? onSelectSection(section.number)
                        : onRequestJump?.(section.number)
                    }
                    className="dd-focus-ring flex w-full min-w-[128px] cursor-pointer items-center justify-center gap-1 rounded-xl border-2 border-dd-border bg-dd-bg/80 px-4 py-3 text-xs font-black uppercase tracking-wide text-blue-400 shadow-[0_4px_0_var(--color-dd-border)] transition-all enabled:hover:border-blue-500/60 enabled:hover:bg-blue-500/10 enabled:active:translate-y-1 enabled:active:shadow-none disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto"
                  >
                    {actionLabel}
                    {section.unlocked ? (
                      <ChevronRight className="h-4 w-4" />
                    ) : (
                      <FastForward className="h-4 w-4" fill="currentColor" strokeWidth={0} />
                    )}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="active-trail-unit-title"
      className={`relative overflow-hidden rounded-[22px] px-5 py-4 text-white shadow-md sm:px-6 transition-colors ${theme.headerClass}`}
    >
      <div className="relative flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.08em] text-white/90 sm:text-xs">
            {text('Seção', 'Section')} {sectionNumber}, {text('Unidade', 'Unit')} {unitNumber}
          </p>
          <h1
            id="active-trail-unit-title"
            className="mt-1 truncate text-lg font-black tracking-tight sm:text-xl text-white"
          >
            {title}
          </h1>
        </div>

        <button
          type="button"
          aria-label={text('Abrir seções e unidades', 'Open sections and units')}
          onClick={onOpenSections}
          className="dd-focus-ring flex shrink-0 cursor-pointer items-center gap-2 rounded-xl border-2 border-white/30 bg-black/15 px-4 py-2.5 text-xs font-black uppercase tracking-wide text-white shadow-[0_3px_0_rgba(0,0,0,0.2)] transition-all hover:bg-black/25 active:translate-y-[2px] active:shadow-none"
        >
          <BookOpen className="h-4 w-4" />
          <span className="hidden sm:inline">{text('Seções', 'Sections')}</span>
        </button>
      </div>
    </section>
  );
}

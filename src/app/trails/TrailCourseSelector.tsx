'use client';

import { useId, useMemo, useRef, useState } from 'react';
import { Menu } from '@base-ui/react/menu';
import { ArrowLeft, Check, Plus } from 'lucide-react';
import {
  getTrailLanguageMetadata,
  isTrailLanguage,
  TRAIL_LANGUAGE_CODES,
  TrailLanguageLogo,
} from '@/app/trails/TrailLanguageLogo';
import type { TrailLanguageCode } from '@/app/trails/TrailLanguageLogo';
import { useLocalizedText } from '@/i18n/useLocalizedText';

export interface TrailCourseOption {
  language: TrailLanguageCode;
  xp: number;
  started: boolean;
}

interface TrailCourseSelectorProps {
  activeLanguage: TrailLanguageCode;
  courses: TrailCourseOption[];
  onSelectCourse: (language: TrailLanguageCode) => void;
  variant?: 'rail' | 'compact';
  allowAddingCourses?: boolean;
}

function formatXp(value: number) {
  return Math.max(0, value).toLocaleString('pt-BR');
}

function CourseRow({ course, active = false }: { course: TrailCourseOption; active?: boolean }) {
  const metadata = getTrailLanguageMetadata(course.language);

  return (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center">
        <TrailLanguageLogo language={course.language} className="h-7 w-7" />
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={`block truncate text-sm font-black ${active ? 'text-blue-500 dark:text-blue-400' : 'text-dd-text'}`}
        >
          {metadata.label}
        </span>
        <span className="mt-0.5 block font-mono text-[9px] font-bold uppercase tracking-wide text-dd-muted">
          {formatXp(course.xp)} XP
        </span>
      </span>
    </div>
  );
}

export function TrailCourseSelector({
  activeLanguage,
  courses,
  onSelectCourse,
  variant = 'rail',
  allowAddingCourses = true,
}: TrailCourseSelectorProps) {
  const { text } = useLocalizedText();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<'courses' | 'add'>('courses');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const menuLabelId = useId();

  const handleMouseEnter = () => {
    if (process.env.NODE_ENV === 'test') return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    if (process.env.NODE_ENV === 'test') return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setOpen(false);
      setView('courses');
    }, 150);
  };

  const normalizedCourses = useMemo(
    () =>
      TRAIL_LANGUAGE_CODES.map(
        (language) =>
          courses.find((course) => course.language === language) ?? {
            language,
            xp: 0,
            started: false,
          }
      ),
    [courses]
  );

  const activeCourse =
    normalizedCourses.find((course) => course.language === activeLanguage) ?? normalizedCourses[0];
  const activeMetadata = getTrailLanguageMetadata(activeCourse.language);
  const startedCourses = normalizedCourses.filter(
    (course) => course.started || course.language === activeLanguage
  );
  const availableCourses = normalizedCourses.filter(
    (course) => !startedCourses.some((started) => started.language === course.language)
  );

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) setView('courses');
  };

  const handleCourseSelection = (language: string) => {
    if (!isTrailLanguage(language)) return;
    onSelectCourse(language);
    setOpen(false);
    setView('courses');
  };

  return (
    <div className="relative inline-block">
      <Menu.Root open={open} onOpenChange={handleOpenChange} modal={false}>
        <Menu.Trigger
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          aria-label={text(
            `Trocar curso. ${activeMetadata.label}, ${formatXp(activeCourse.xp)} XP`,
            `Switch course. ${activeMetadata.label}, ${formatXp(activeCourse.xp)} XP`
          )}
          data-testid={`course-selector-trigger-${variant}`}
          className={
            variant === 'rail'
              ? 'group flex min-w-0 items-center gap-1.5 rounded-xl p-1 text-blue-400 outline-none transition-colors hover:bg-blue-500/10 focus-visible:ring-2 focus-visible:ring-blue-500/70'
              : 'group flex h-9 shrink-0 items-center gap-1.5 rounded-xl px-1.5 text-blue-400 outline-none transition-colors hover:bg-white/[0.08] focus-visible:ring-2 focus-visible:ring-blue-500/70'
          }
        >
          <span
            data-testid={variant === 'rail' ? 'active-language-logo' : undefined}
            role="img"
            aria-label={`Logo de ${activeMetadata.label}`}
            className="flex h-7 w-7 shrink-0 items-center justify-center"
          >
            <TrailLanguageLogo language={activeCourse.language} className="h-7 w-7" />
          </span>
          <span className="truncate text-xs font-black text-dd-text">
            {formatXp(activeCourse.xp)}
          </span>
        </Menu.Trigger>

        <Menu.Portal>
          <Menu.Positioner
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            side="bottom"
            align="start"
            sideOffset={10}
            collisionPadding={12}
            className="z-[100] outline-none"
          >
            <Menu.Popup
              aria-labelledby={menuLabelId}
              className="w-[min(320px,calc(100vw-24px))] origin-[var(--transform-origin)] overflow-hidden rounded-[22px] border-2 border-dd-border bg-dd-sidebar-bg text-dd-text shadow-[0_26px_80px_-28px_rgba(0,0,0,0.95)] outline-none transition-[transform,opacity] duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0"
            >
              <div
                id={menuLabelId}
                className="border-b border-dd-border px-4 py-3 text-[10px] font-black uppercase tracking-[0.12em] text-dd-muted bg-dd-sidebar-bg"
              >
                {view === 'courses'
                  ? text('Meus cursos', 'My courses')
                  : text('Adicionar curso', 'Add course')}
              </div>

              {view === 'courses' ? (
                <>
                  <Menu.RadioGroup value={activeLanguage} onValueChange={handleCourseSelection}>
                    {startedCourses.map((course) => (
                      <Menu.RadioItem
                        key={course.language}
                        value={course.language}
                        closeOnClick
                        className="flex min-h-16 cursor-pointer items-center gap-3 border-b border-dd-border/70 px-4 py-2.5 outline-none transition-colors data-[checked]:bg-dd-surface data-[highlighted]:bg-dd-surface hover:bg-dd-surface"
                      >
                        <CourseRow course={course} active={course.language === activeLanguage} />
                        <Check
                          className={`h-4 w-4 shrink-0 text-blue-500 dark:text-blue-400 ${
                            course.language === activeLanguage ? 'opacity-100' : 'opacity-0'
                          }`}
                        />
                      </Menu.RadioItem>
                    ))}
                  </Menu.RadioGroup>

                  {allowAddingCourses && (
                    <Menu.Item
                      closeOnClick={false}
                      onClick={() => setView('add')}
                      className="flex min-h-14 cursor-pointer items-center gap-3 px-4 py-2.5 outline-none transition-colors data-[highlighted]:bg-dd-surface hover:bg-dd-surface"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-dd-border bg-dd-surface text-dd-muted">
                        <Plus className="h-5 w-5" />
                      </span>
                      <span className="text-sm font-black text-dd-text">
                        {text('Adicionar curso', 'Add course')}
                      </span>
                    </Menu.Item>
                  )}
                </>
              ) : (
                <>
                  <Menu.Item
                    closeOnClick={false}
                    onClick={() => setView('courses')}
                    className="flex min-h-12 cursor-pointer items-center gap-2 border-b border-dd-border/70 px-4 py-2 text-xs font-black text-blue-500 dark:text-blue-400 outline-none transition-colors data-[highlighted]:bg-dd-surface hover:bg-dd-surface"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    {text('Voltar para meus cursos', 'Back to my courses')}
                  </Menu.Item>

                  {availableCourses.length > 0 ? (
                    availableCourses.map((course) => (
                      <Menu.Item
                        key={course.language}
                        closeOnClick
                        onClick={() => handleCourseSelection(course.language)}
                        className="flex min-h-16 cursor-pointer items-center border-b border-dd-border/70 px-4 py-2.5 outline-none transition-colors last:border-b-0 data-[highlighted]:bg-dd-surface hover:bg-dd-surface"
                      >
                        <CourseRow course={course} />
                      </Menu.Item>
                    ))
                  ) : (
                    <p className="px-4 py-5 text-center text-xs font-semibold text-dd-muted">
                      {text(
                        'Todos os cursos disponíveis já foram iniciados.',
                        'All available courses have already been started.'
                      )}
                    </p>
                  )}
                </>
              )}
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
    </div>
  );
}

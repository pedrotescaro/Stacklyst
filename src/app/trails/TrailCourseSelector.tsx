'use client';

import { useId, useMemo, useState } from 'react';
import { Menu } from '@base-ui/react/menu';
import { ArrowLeft, Check, Plus } from 'lucide-react';
import {
  getTrailLanguageMetadata,
  isTrailCourse,
  TRAIL_COURSE_CODES,
  TrailLanguageLogo,
} from '@/app/trails/TrailLanguageLogo';
import type { TrailCourseCode } from '@/app/trails/TrailLanguageLogo';
import { useLocalizedText } from '@/i18n/useLocalizedText';
import styles from './TrailCourseSelector.module.css';

export interface TrailCourseOption {
  language: TrailCourseCode;
  xp: number;
  started: boolean;
}

interface TrailCourseSelectorProps {
  activeLanguage: TrailCourseCode;
  courses: TrailCourseOption[];
  onSelectCourse: (language: TrailCourseCode) => void;
  variant?: 'rail' | 'compact';
  allowAddingCourses?: boolean;
}

function formatXp(value: number) {
  return Math.max(0, value).toLocaleString('pt-BR');
}

function CourseRow({ course }: { course: TrailCourseOption }) {
  const metadata = getTrailLanguageMetadata(course.language);

  return (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <span className="flex h-9 w-12 shrink-0 items-center justify-center">
        <TrailLanguageLogo
          language={course.language}
          className={course.language === 'ENADE' ? 'h-7 w-12' : 'h-7 w-7'}
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-dd-text">{metadata.label}</span>
        <span className="mt-0.5 block text-xs font-normal tabular-nums text-dd-muted">
          {course.language === 'ENADE' ? 'Simulados de ADS' : `${formatXp(course.xp)} XP`}
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
  const menuLabelId = useId();

  const normalizedCourses = useMemo(
    () =>
      TRAIL_COURSE_CODES.map(
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
    if (!isTrailCourse(language)) return;
    onSelectCourse(language);
    setOpen(false);
    setView('courses');
  };

  return (
    <div className="relative inline-block">
      <Menu.Root open={open} onOpenChange={handleOpenChange} modal={false}>
        <Menu.Trigger
          openOnHover={false}
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
            aria-label={`${text('Logo de', 'Logo of')} ${activeMetadata.label}`}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-dd-border bg-dd-surface p-1"
          >
            <TrailLanguageLogo language={activeCourse.language} className="h-7 w-7 shrink-0" />
          </span>
          <span className="truncate text-xs font-black text-dd-text">
            {activeCourse.language === 'ENADE' ? 'Enade' : formatXp(activeCourse.xp)}
          </span>
        </Menu.Trigger>

        <Menu.Portal>
          <Menu.Positioner
            side="bottom"
            align="start"
            sideOffset={10}
            collisionPadding={12}
            collisionAvoidance={{ side: 'none', align: 'shift', fallbackAxisSide: 'none' }}
            className="z-[100] outline-none"
          >
            <Menu.Popup aria-labelledby={menuLabelId} className={styles.popup}>
              <div id={menuLabelId} className={styles.heading}>
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
                        className={styles.row}
                      >
                        <CourseRow course={course} />
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
                      className={`${styles.row} ${styles.add}`}
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg text-dd-muted">
                        <Plus className="h-5 w-5" />
                      </span>
                      <span className="text-sm font-medium text-dd-text">
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
                    className={`${styles.row} ${styles.back}`}
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
                        className={styles.row}
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

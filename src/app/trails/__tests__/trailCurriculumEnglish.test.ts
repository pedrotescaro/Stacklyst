import { describe, expect, it } from 'vitest';
import { CURRICULUM_BY_SLUG } from '@/app/trails/trailCurriculum';
import { localizeTrailCurriculum, TRAIL_CURRICULUM_EN } from '@/app/trails/trailCurriculumEnglish';
import { LEARNING_COURSES } from '@/lib/learning/catalog';
import { LEARNING_CATALOG_EN, translateCatalogText } from '@/lib/learning/catalogEnglish';

describe('lesson map English copy', () => {
  it('has an English version of every curriculum title, goal and unit', () => {
    const missing = Object.values(CURRICULUM_BY_SLUG).flatMap((curriculum) => [
      ...(TRAIL_CURRICULUM_EN[curriculum.title] ? [] : [curriculum.title]),
      ...curriculum.sections.flatMap((section) =>
        [section.title, section.goal, ...section.units.map((unit) => unit.title)].filter(
          (value) => !TRAIL_CURRICULUM_EN[value]
        )
      ),
    ]);
    expect(missing).toEqual([]);
  });

  it('keeps the pt-BR curriculum as the default and identity', () => {
    const curriculum = CURRICULUM_BY_SLUG['frontend-react'];
    expect(localizeTrailCurriculum(curriculum, 'pt')).toBe(curriculum);
    const english = localizeTrailCurriculum(curriculum, 'en');
    expect(english.sections[0].title).toBe('Interface foundations');
    expect(english.sections[0].units[0].description).toBe(
      'Understand JavaScript in the browser and the criteria needed to turn requirements into predictable behavior in the browser.'
    );
    expect(curriculum.sections[0].title).toBe('Base da interface');
  });

  it('translates every course, unit and lesson title shown on the map', () => {
    const missing = LEARNING_COURSES.flatMap((course) => [
      course.title,
      ...course.lessons.flatMap((lesson) => [lesson.title, lesson.unitTitle]),
    ]).filter((value) => translateCatalogText(value, 'en') === value);
    const allowed = new Set(
      Object.entries(LEARNING_CATALOG_EN).flatMap(([pt, en]) => (pt === en ? [pt] : []))
    );
    expect([...new Set(missing)].filter((value) => !allowed.has(value))).toEqual([]);
  });
});
